"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../lib/supabase");
const router = express_1.default.Router();
router.put('/profile', async (req, res) => {
    try {
        const { first_name, last_name, phone } = req.body;
        const auth_user_id = req.headers['x-user-id'];
        if (!auth_user_id) {
            return res.status(401).json({
                error: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }
        if (!first_name || !last_name) {
            return res.status(400).json({
                error: 'First name and last name are required',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }
        const { data: updatedUser, error: updateError } = await supabase_1.supabaseAdmin
            .from('users')
            .update({
            first_name,
            last_name,
            verification_status: 'verified',
            updated_at: new Date().toISOString()
        })
            .eq('id', auth_user_id)
            .select()
            .single();
        if (updateError) {
            console.error('Failed to update user profile:', updateError);
            return res.status(500).json({ error: updateError.message });
        }
        const { error: authError } = await supabase_1.supabaseAdmin.auth.admin.updateUserById(auth_user_id, {
            user_metadata: {
                first_name,
                last_name,
                email_verified: true,
                role: updatedUser.role
            }
        });
        if (authError) {
            console.error('Failed to update auth metadata:', authError);
        }
        return res.json({
            success: true,
            user: updatedUser,
            message: 'Profile updated successfully'
        });
    }
    catch (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({
            error: 'Failed to update profile',
            details: error.message
        });
    }
});
router.get('/profile', async (req, res) => {
    try {
        const auth_user_id = req.headers['x-user-id'];
        if (!auth_user_id) {
            return res.status(401).json({
                error: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }
        const { data: user, error } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', auth_user_id)
            .single();
        if (error) {
            console.error('Failed to get user profile:', error);
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json({
            success: true,
            user
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({
            error: 'Failed to get profile',
            details: error.message
        });
    }
});
router.post('/verify-email', async (req, res) => {
    try {
        const { auth_user_id } = req.body;
        if (!auth_user_id) {
            return res.status(400).json({ error: 'auth_user_id is required' });
        }
        const { data: user, error: updateError } = await supabase_1.supabaseAdmin
            .from('users')
            .update({
            verification_status: 'verified',
            updated_at: new Date().toISOString()
        })
            .eq('id', auth_user_id)
            .select()
            .single();
        if (updateError) {
            console.error('Failed to verify user:', updateError);
            return res.status(500).json({ error: updateError.message });
        }
        const { error: authError } = await supabase_1.supabaseAdmin.auth.admin.updateUserById(auth_user_id, {
            email_confirm: true,
            user_metadata: {
                email_verified: true,
                role: user.role
            }
        });
        if (authError) {
            console.error('Failed to update auth user:', authError);
            return res.status(500).json({ error: String(authError) });
        }
        return res.json({
            success: true,
            user,
            message: 'Email verified successfully'
        });
    }
    catch (error) {
        console.error('Email verification error:', error);
        return res.status(500).json({
            error: 'Failed to verify email',
            details: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map