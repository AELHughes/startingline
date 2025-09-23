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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_local_1 = require("../middleware/auth-local");
const database_1 = require("../lib/database");
const router = express_1.default.Router();
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
const registerLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        error: 'Too many registration attempts, please try again later.'
    }
});
function generateJWT(user) {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.email_verified
    };
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'fallback-secret-for-development', { expiresIn: '7d' });
}
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function validatePassword(password) {
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true };
}
function validateUserData(userData) {
    if (!userData.email || !validateEmail(userData.email)) {
        return { isValid: false, message: 'Valid email address is required' };
    }
    if (!userData.password) {
        return { isValid: false, message: 'Password is required' };
    }
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
        return passwordValidation;
    }
    if (!userData.first_name || userData.first_name.trim().length < 2) {
        return { isValid: false, message: 'First name must be at least 2 characters long' };
    }
    if (!userData.last_name || userData.last_name.trim().length < 2) {
        return { isValid: false, message: 'Last name must be at least 2 characters long' };
    }
    if (!userData.role || !['organiser', 'admin', 'participant'].includes(userData.role)) {
        return { isValid: false, message: 'Valid role is required (organiser, admin, or participant)' };
    }
    return { isValid: true };
}
router.post('/register', registerLimiter, async (req, res) => {
    try {
        const userData = req.body;
        console.log('🔍 Registration attempt for:', userData.email, '(Role:', userData.role, ')');
        const validation = validateUserData(userData);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: validation.message
            });
        }
        const existingUser = await (0, database_1.getUserByEmail)(userData.email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'An account with this email address already exists'
            });
        }
        if (userData.role === 'admin') {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    success: false,
                    error: 'Admin creation requires authentication'
                });
            }
            try {
                const token = authHeader.substring(7);
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-development');
                const currentUser = await (0, database_1.getUserById)(decoded.userId);
                if (!currentUser || currentUser.role !== 'admin') {
                    return res.status(403).json({
                        success: false,
                        error: 'Only existing admins can create new admin accounts'
                    });
                }
            }
            catch (error) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid authentication token'
                });
            }
        }
        const user = await (0, database_1.createUser)(userData);
        const token = generateJWT(user);
        console.log('✅ User registered successfully:', user.email, '(ID:', user.id, ')');
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role,
                    email_verified: user.email_verified,
                    created_at: user.created_at
                },
                token
            }
        });
    }
    catch (error) {
        console.error('❌ Registration error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Registration failed'
        });
    }
});
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🔍 Login attempt for:', email);
        console.log('🔍 Password length:', password ? password.length : 'undefined');
        console.log('🔍 Request body keys:', Object.keys(req.body));
        if (!email || !password) {
            console.log('❌ Missing email or password');
            console.log('🔍 Email provided:', !!email);
            console.log('🔍 Password provided:', !!password);
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }
        if (!validateEmail(email)) {
            console.log('❌ Invalid email format:', email);
            return res.status(400).json({
                success: false,
                error: 'Valid email address is required'
            });
        }
        console.log('🔍 About to call authenticateUser with:', { email, passwordLength: password.length });
        const user = await (0, database_1.authenticateUser)(email, password);
        console.log('🔍 authenticateUser returned:', user ? 'User found' : 'No user');
        console.log('🔍 User details:', user ? { id: user.id, email: user.email, role: user.role } : 'null');
        const token = generateJWT(user);
        console.log('🔍 JWT token generated, length:', token.length);
        console.log('✅ User logged in successfully:', user.email, '(Role:', user.role, ')');
        res.json({
            success: true,
            data: {
                user,
                token
            }
        });
    }
    catch (error) {
        console.error('❌ Login error:', error.message);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Full error object:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid email or password'
        });
    }
});
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No authentication token provided'
            });
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-development');
            const user = await (0, database_1.getUserById)(decoded.userId);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found'
                });
            }
            res.json({
                success: true,
                data: user
            });
        }
        catch (jwtError) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
    }
    catch (error) {
        console.error('❌ Get user error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to get user information'
        });
    }
});
router.put('/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No authentication token provided'
            });
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-development');
        const updates = req.body;
        const allowedUpdates = [
            'first_name', 'last_name', 'email', 'phone',
            'company_name', 'company_address', 'vat_number', 'company_registration_number',
            'company_phone', 'company_email', 'bank_name', 'account_holder_name',
            'account_number', 'branch_code', 'account_type'
        ];
        const filteredUpdates = {};
        for (const key of allowedUpdates) {
            if (updates[key] !== undefined) {
                filteredUpdates[key] = updates[key];
            }
        }
        if (Object.keys(filteredUpdates).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update'
            });
        }
        if (filteredUpdates.email && !validateEmail(filteredUpdates.email)) {
            return res.status(400).json({
                success: false,
                error: 'Valid email address is required'
            });
        }
        const updatedUser = await (0, database_1.updateUser)(decoded.userId, filteredUpdates);
        res.json({
            success: true,
            data: updatedUser,
            message: 'Profile updated successfully'
        });
    }
    catch (error) {
        console.error('❌ Update profile error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update profile'
        });
    }
});
router.post('/logout', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.localUser.userId;
        const token = req.headers.authorization?.replace('Bearer ', '');
        console.log(`🚪 User ${userId} logging out`);
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        console.error('❌ Logout error:', error.message);
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
});
router.get('/health', async (req, res) => {
    try {
        const { pool } = await Promise.resolve().then(() => __importStar(require('../lib/database')));
        const result = await pool.query('SELECT COUNT(*) FROM users');
        res.json({
            success: true,
            data: {
                status: 'healthy',
                database: 'connected',
                userCount: parseInt(result.rows[0].count),
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        res.status(503).json({
            success: false,
            error: 'Database connection failed'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth-local.js.map