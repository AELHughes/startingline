"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../lib/database");
const auth_local_1 = require("../middleware/auth-local");
const router = express_1.default.Router();
router.get('/', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.localUser.userId;
        const limit = parseInt(req.query.limit) || 50;
        const notifications = await (0, database_1.getUserNotifications)(userId, limit);
        res.json({
            success: true,
            data: notifications,
            message: 'Notifications retrieved successfully'
        });
    }
    catch (error) {
        console.error('❌ Get notifications error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve notifications'
        });
    }
});
router.get('/unread-count', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.localUser.userId;
        const count = await (0, database_1.getUnreadNotificationCount)(userId);
        res.json({
            success: true,
            data: { count },
            message: 'Unread count retrieved successfully'
        });
    }
    catch (error) {
        console.error('❌ Get unread count error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve unread count'
        });
    }
});
router.put('/:id/read', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.localUser.userId;
        const notification = await (0, database_1.markNotificationAsRead)(id, userId);
        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }
        res.json({
            success: true,
            data: notification,
            message: 'Notification marked as read'
        });
    }
    catch (error) {
        console.error('❌ Mark notification read error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to mark notification as read'
        });
    }
});
router.put('/mark-all-read', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.localUser.userId;
        const notifications = await (0, database_1.markAllNotificationsAsRead)(userId);
        res.json({
            success: true,
            data: notifications,
            message: 'All notifications marked as read'
        });
    }
    catch (error) {
        console.error('❌ Mark all notifications read error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to mark all notifications as read'
        });
    }
});
router.post('/', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const userRole = req.localUser.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Only administrators can create notifications'
            });
        }
        const { userId, type, title, message, link, metadata } = req.body;
        if (!userId || !type || !title || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, type, title, message'
            });
        }
        const notification = await (0, database_1.createNotification)(userId, type, title, message, link, metadata);
        res.status(201).json({
            success: true,
            data: notification,
            message: 'Notification created successfully'
        });
    }
    catch (error) {
        console.error('❌ Create notification error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to create notification'
        });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map