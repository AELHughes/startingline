"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_local_1 = require("../middleware/auth-local");
const emailService_1 = require("../services/emailService");
const router = express_1.default.Router();
router.get('/email-settings', auth_local_1.authenticateToken, auth_local_1.requireAdmin, async (req, res) => {
    try {
        const config = emailService_1.emailService.getConfig();
        const safeConfig = {
            host: config.host,
            port: config.port,
            secure: config.secure,
            user: config.auth.user,
            from: config.from,
            replyTo: config.replyTo,
            hasPassword: !!config.auth.pass
        };
        res.json({
            success: true,
            data: safeConfig
        });
    }
    catch (error) {
        console.error('Get email settings error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get email settings'
        });
    }
});
router.put('/email-settings', auth_local_1.authenticateToken, auth_local_1.requireAdmin, async (req, res) => {
    try {
        const { host, port, secure, user, pass, from, replyTo } = req.body;
        if (!host || !port || !user || !from || !replyTo) {
            return res.status(400).json({
                success: false,
                error: 'Missing required email configuration fields'
            });
        }
        const newConfig = {
            host,
            port: parseInt(port),
            secure: Boolean(secure),
            auth: {
                user,
                pass: pass || emailService_1.emailService.getConfig().auth.pass
            },
            from,
            replyTo
        };
        emailService_1.emailService.updateConfig(newConfig);
        res.json({
            success: true,
            message: 'Email settings updated successfully'
        });
    }
    catch (error) {
        console.error('Update email settings error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update email settings'
        });
    }
});
router.post('/email-settings/test', auth_local_1.authenticateToken, auth_local_1.requireAdmin, async (req, res) => {
    try {
        const { testEmail } = req.body;
        if (!testEmail) {
            return res.status(400).json({
                success: false,
                error: 'Test email address is required'
            });
        }
        const success = await emailService_1.emailService.sendTestEmail(testEmail);
        if (success) {
            res.json({
                success: true,
                message: 'Test email sent successfully'
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Failed to send test email'
            });
        }
    }
    catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to send test email'
        });
    }
});
exports.default = router;
//# sourceMappingURL=email-settings.js.map