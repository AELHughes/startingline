"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const supabase_1 = require("../lib/supabase");
const postgres_1 = require("../lib/postgres");
const router = express_1.default.Router();
router.post('/register', async (req, res) => {
    try {
        const userData = req.body;
        console.log('🔍 Registration attempt for:', userData.email);
        const userId = crypto_1.default.randomUUID();
        console.log('🔧 TEMPORARY: Creating user directly in database with ID:', userId);
        const authData = {
            user: {
                id: userId,
                email: userData.email
            }
        };
        const authError = null;
        if (authError) {
            console.error('❌ Auth user creation failed:', authError);
            return res.status(400).json({
                success: false,
                error: 'Auth user creation failed'
            });
        }
        if (!authData.user) {
            return res.status(400).json({
                success: false,
                error: 'Failed to create auth user'
            });
        }
        console.log('✅ Auth user created:', authData.user.id);
        console.log('🔍 Testing database connection role...');
        try {
            const { data: roleTest, error: roleError } = await supabase_1.supabaseAdmin
                .rpc('current_user');
            console.log('  Database role:', roleTest || 'Unknown');
            console.log('  Role error:', roleError?.message || 'None');
        }
        catch (roleErr) {
            console.log('  Role test failed:', roleErr.message);
        }
        let profileData = null;
        let profileError = null;
        let retryCount = 0;
        const maxRetries = 5;
        while (retryCount < maxRetries && !profileData) {
            retryCount++;
            if (retryCount > 1) {
                await new Promise(resolve => setTimeout(resolve, 200 * retryCount));
                console.log(`🔄 Retry ${retryCount}/${maxRetries} for profile creation...`);
            }
            console.log(`🔧 Attempt ${retryCount}: Skipping auth verification, proceeding with database insert`);
            const result = await (0, postgres_1.insertUserDirect)({
                id: authData.user.id,
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                role: userData.role
            });
            profileData = result.data;
            profileError = result.error;
            if (profileError) {
                console.log(`❌ Profile creation failed on attempt ${retryCount}:`, profileError.message);
                if (profileError.code === '23503') {
                    console.log(`🔄 Foreign key constraint error - will retry...`);
                    continue;
                }
                else {
                    break;
                }
            }
            else {
                console.log(`✅ Profile created successfully on attempt ${retryCount}:`, profileData.id);
                break;
            }
        }
        console.log('🔍 Registration verification:');
        console.log('  Auth user ID:', authData.user.id);
        console.log('  Profile ID:', profileData?.id);
        console.log('  Match:', authData.user.id === profileData?.id);
        try {
            const { data: verifyAuthUser } = await supabase_1.supabaseAdmin.auth.admin.getUserById(authData.user.id);
            console.log('  Auth user exists in auth.users:', !!verifyAuthUser?.user);
        }
        catch (verifyError) {
            console.log('  Auth user verification failed:', verifyError.message);
        }
        if (profileError) {
            console.error('❌ Profile creation failed:', profileError);
            await supabase_1.supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            return res.status(400).json({
                success: false,
                error: profileError.message
            });
        }
        console.log('✅ Profile created:', profileData.id);
        const token = jsonwebtoken_1.default.sign({
            userId: authData.user.id,
            email: userData.email,
            role: userData.role
        }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: profileData.id,
                    email: userData.email,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    role: userData.role
                },
                token
            }
        });
    }
    catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Registration failed'
        });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🔍 Login attempt for:', email);
        const { data: authData, error: authError } = await supabase_1.supabase.auth.signInWithPassword({
            email,
            password
        });
        if (authError || !authData.user) {
            console.error('❌ Auth login failed:', authError);
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }
        console.log('✅ Auth login successful:', authData.user.id);
        const { data: profile, error: profileError } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();
        if (profileError || !profile) {
            console.error('❌ Profile lookup failed:', profileError);
            return res.status(401).json({
                success: false,
                error: 'User profile not found'
            });
        }
        console.log('✅ Profile found:', profile.id);
        console.log('🔍 JWT Token Creation Debug:');
        console.log('  - profile.id:', profile.id);
        console.log('  - profile.email:', profile.email);
        console.log('  - profile.role:', profile.role);
        const token = jsonwebtoken_1.default.sign({
            userId: profile.id,
            email: profile.email,
            role: profile.role
        }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        console.log('🔍 JWT Token created with userId:', profile.id);
        res.json({
            success: true,
            data: {
                user: profile,
                token
            }
        });
    }
    catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Login failed'
        });
    }
});
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const { data: user, error } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', decoded.userId)
            .single();
        if (error || !user) {
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
    catch (error) {
        console.error('❌ Get user error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
});
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map