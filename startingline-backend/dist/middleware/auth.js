"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOrganiserOrAdmin = exports.requireAdmin = exports.requireOrganiser = exports.requireRole = exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("../lib/supabase");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const { data: user, error } = await supabase_1.supabaseAdmin
            .from('users')
            .select('id, email, role, verification_status')
            .eq('id', decoded.userId)
            .single();
        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token - user not found'
            });
        }
        req.user = {
            userId: user.id,
            email: user.email,
            role: user.role
        };
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const { data: user, error } = await supabase_1.supabaseAdmin
            .from('users')
            .select('id, email, role, verification_status')
            .eq('id', decoded.userId)
            .single();
        if (!error && user) {
            req.user = {
                userId: user.id,
                email: user.email,
                role: user.role
            };
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions'
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireOrganiser = (0, exports.requireRole)('organiser');
exports.requireAdmin = (0, exports.requireRole)('admin');
exports.requireOrganiserOrAdmin = (0, exports.requireRole)(['organiser', 'admin']);
//# sourceMappingURL=auth.js.map