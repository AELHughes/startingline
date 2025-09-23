"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
        const messages = await (0, database_1.getUserMessages)(userId, limit);
        res.json({
            success: true,
            data: messages,
            message: 'Messages retrieved successfully'
        });
    }
    catch (error) {
        console.error('❌ Get messages error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve messages'
        });
    }
});
router.get('/unread-count', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.localUser.userId;
        const count = await (0, database_1.getUnreadMessageCount)(userId);
        res.json({
            success: true,
            data: { count },
            message: 'Unread count retrieved successfully'
        });
    }
    catch (error) {
        console.error('❌ Get unread message count error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve unread message count'
        });
    }
});
router.get('/:id/thread', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.localUser.userId;
        const thread = await (0, database_1.getMessageThread)(id, userId);
        if (thread.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Message thread not found'
            });
        }
        res.json({
            success: true,
            data: thread,
            message: 'Message thread retrieved successfully'
        });
    }
    catch (error) {
        console.error('❌ Get message thread error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve message thread'
        });
    }
});
router.get('/admin-id', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const { pool } = await Promise.resolve().then(() => __importStar(require('../lib/database')));
        const result = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name 
      FROM users u 
      INNER JOIN admin_users au ON u.email = au.email 
      WHERE au.is_active = true 
      LIMIT 1
    `);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No active admin found'
            });
        }
        res.json({
            success: true,
            data: result.rows[0],
            message: 'Admin user retrieved successfully'
        });
    }
    catch (error) {
        console.error('❌ Get admin user error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve admin user'
        });
    }
});
router.post('/', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const senderId = req.localUser.userId;
        const senderRole = req.localUser.role;
        const { recipientId, subject, body, eventId, parentMessageId } = req.body;
        if (!subject || !body) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: subject, body'
            });
        }
        let finalRecipientId = recipientId;
        if (senderRole === 'organiser' && !recipientId) {
            const { pool } = await Promise.resolve().then(() => __importStar(require('../lib/database')));
            const adminResult = await pool.query(`
        SELECT u.id 
        FROM users u 
        INNER JOIN admin_users au ON u.email = au.email 
        WHERE au.is_active = true 
        LIMIT 1
      `);
            if (adminResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'No active admin found to receive message'
                });
            }
            finalRecipientId = adminResult.rows[0].id;
        }
        else if (!recipientId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: recipientId'
            });
        }
        const message = await (0, database_1.createMessage)(eventId || null, senderId, finalRecipientId, subject, body, parentMessageId);
        const recipientResult = await database_1.pool.query('SELECT role FROM users WHERE id = $1', [finalRecipientId]);
        const recipientRole = recipientResult.rows[0]?.role || 'organiser';
        const messageLink = recipientRole === 'admin' ? '/admin/messages' : '/dashboard/messages';
        await (0, database_1.createNotification)(finalRecipientId, 'message', 'New Message', `You have received a new message: "${subject}"`, messageLink, { messageId: message.id });
        res.status(201).json({
            success: true,
            data: message,
            message: 'Message sent successfully'
        });
    }
    catch (error) {
        console.error('❌ Create message error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to send message'
        });
    }
});
router.put('/:id/read', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.localUser.userId;
        const message = await (0, database_1.markMessageAsRead)(id, userId);
        if (!message) {
            return res.status(404).json({
                success: false,
                error: 'Message not found or you are not the recipient'
            });
        }
        res.json({
            success: true,
            data: message,
            message: 'Message marked as read'
        });
    }
    catch (error) {
        console.error('❌ Mark message read error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to mark message as read'
        });
    }
});
exports.default = router;
//# sourceMappingURL=messages.js.map