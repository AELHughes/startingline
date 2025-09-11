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
exports.requirePaymentOwnership = exports.requireTicketOwnership = exports.requireEventOwnership = exports.requireOwnership = exports.requireEmailVerified = exports.requireParticipant = exports.requireOrganiserOrAdmin = exports.requireAdmin = exports.requireOrganiser = exports.requireRole = exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../lib/database");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No authentication token provided'
            });
        }
        const token = authHeader.substring(7);
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-development');
        }
        catch (jwtError) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        const user = await (0, database_1.getUserById)(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }
        req.localUser = {
            userId: user.id,
            email: user.email,
            role: user.role,
            emailVerified: user.email_verified || false
        };
        console.log(`🔐 Authenticated user: ${user.email} (${user.role})`);
        next();
    }
    catch (error) {
        console.error('❌ Auth middleware error:', error.message);
        return res.status(401).json({
            success: false,
            error: 'Authentication failed'
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
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-development');
            const user = await (0, database_1.getUserById)(decoded.userId);
            if (user) {
                req.localUser = {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    emailVerified: user.email_verified || false
                };
                console.log(`🔐 Optional auth - user authenticated: ${user.email} (${user.role})`);
            }
        }
        catch (jwtError) {
            console.log('🔐 Optional auth - invalid token, continuing without auth');
        }
        next();
    }
    catch (error) {
        console.log('🔐 Optional auth - error occurred, continuing without auth:', error.message);
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.localUser) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (!allowedRoles.includes(req.localUser.role)) {
            console.log(`❌ Access denied: User ${req.localUser.email} (${req.localUser.role}) attempted to access ${allowedRoles.join('/')} endpoint`);
            return res.status(403).json({
                success: false,
                error: `Access denied. Required role: ${allowedRoles.join(' or ')}`
            });
        }
        console.log(`✅ Access granted: User ${req.localUser.email} (${req.localUser.role}) accessing ${allowedRoles.join('/')} endpoint`);
        next();
    };
};
exports.requireRole = requireRole;
exports.requireOrganiser = (0, exports.requireRole)('organiser');
exports.requireAdmin = (0, exports.requireRole)('admin');
exports.requireOrganiserOrAdmin = (0, exports.requireRole)(['organiser', 'admin']);
exports.requireParticipant = (0, exports.requireRole)('participant');
const requireEmailVerified = (req, res, next) => {
    if (!req.localUser) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    if (!req.localUser.emailVerified) {
        return res.status(403).json({
            success: false,
            error: 'Email verification required. Please verify your email address to continue.'
        });
    }
    next();
};
exports.requireEmailVerified = requireEmailVerified;
const requireOwnership = (resourceType) => {
    return async (req, res, next) => {
        if (!req.localUser) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        if (req.localUser.role === 'admin') {
            return next();
        }
        try {
            const resourceId = req.params.id;
            if (!resourceId) {
                return res.status(400).json({
                    success: false,
                    error: 'Resource ID required'
                });
            }
            const { pool } = await Promise.resolve().then(() => __importStar(require('../lib/database')));
            let query;
            let resourceOwnerField;
            switch (resourceType) {
                case 'event':
                    query = 'SELECT organiser_id FROM events WHERE id = $1';
                    resourceOwnerField = 'organiser_id';
                    break;
                case 'ticket':
                    query = 'SELECT participant_email FROM tickets WHERE id = $1';
                    resourceOwnerField = 'participant_email';
                    break;
                case 'payment':
                    query = 'SELECT primary_contact_email FROM payments WHERE id = $1';
                    resourceOwnerField = 'primary_contact_email';
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid resource type'
                    });
            }
            const result = await pool.query(query, [resourceId]);
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} not found`
                });
            }
            const resource = result.rows[0];
            let isOwner = false;
            if (resourceType === 'event') {
                isOwner = resource[resourceOwnerField] === req.localUser.userId;
            }
            else {
                isOwner = resource[resourceOwnerField] === req.localUser.email;
            }
            if (!isOwner) {
                return res.status(403).json({
                    success: false,
                    error: `Access denied. You don't own this ${resourceType}.`
                });
            }
            next();
        }
        catch (error) {
            console.error(`❌ Ownership check error for ${resourceType}:`, error.message);
            return res.status(500).json({
                success: false,
                error: 'Failed to verify resource ownership'
            });
        }
    };
};
exports.requireOwnership = requireOwnership;
exports.requireEventOwnership = (0, exports.requireOwnership)('event');
exports.requireTicketOwnership = (0, exports.requireOwnership)('ticket');
exports.requirePaymentOwnership = (0, exports.requireOwnership)('payment');
//# sourceMappingURL=auth-local.js.map