"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../lib/supabase");
const router = express_1.default.Router();
router.get('/check-database', async (req, res) => {
    try {
        console.log('🔍 Debug: Checking database connection and data...');
        const { data: organiserProfiles, error: organiserError } = await supabase_1.supabaseAdmin
            .from('organiser_profiles')
            .select('id, user_profile_id, email, first_name, last_name')
            .limit(10);
        if (organiserError) {
            console.log('❌ Organiser profiles error:', organiserError);
        }
        const { data: users, error: usersError } = await supabase_1.supabaseAdmin
            .from('users')
            .select('id, auth_user_id, email, first_name, last_name, role')
            .limit(10);
        if (usersError) {
            console.log('❌ Users error:', usersError);
        }
        console.log('✅ Database check completed');
        res.json({
            success: true,
            organiserProfiles: organiserProfiles || [],
            users: users || []
        });
    }
    catch (error) {
        console.error('❌ Debug check-database error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/test-auth', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.json({
                success: false,
                message: 'No authorization header provided',
                help: 'Include "Authorization: Bearer <token>" header'
            });
        }
        const token = authHeader.replace('Bearer ', '');
        res.json({
            success: true,
            message: 'Auth header received',
            tokenLength: token.length,
            tokenPreview: token.substring(0, 50) + '...'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/test-event-data', async (req, res) => {
    try {
        const eventData = req.body;
        console.log('🔍 Received event data:', {
            name: eventData.name,
            category: eventData.category,
            hasDistances: !!eventData.distances,
            distancesCount: eventData.distances?.length || 0,
            hasMerchandise: !!eventData.merchandise,
            merchandiseCount: eventData.merchandise?.length || 0,
            status: eventData.status
        });
        res.json({
            success: true,
            message: 'Event data received and logged',
            summary: {
                name: eventData.name,
                category: eventData.category,
                distancesCount: eventData.distances?.length || 0,
                merchandiseCount: eventData.merchandise?.length || 0
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/events', async (req, res) => {
    try {
        console.log('🔍 Debug: Fetching all events...');
        const { data: events, error } = await supabase_1.supabaseAdmin
            .from('events')
            .select('id, name, slug, status, organiser_id, created_at')
            .order('created_at', { ascending: false })
            .limit(20);
        if (error) {
            console.log('❌ Events fetch error:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
        console.log(`✅ Found ${events?.length || 0} events`);
        res.json({
            success: true,
            count: events?.length || 0,
            events: events || []
        });
    }
    catch (error) {
        console.error('❌ Debug events error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        console.log('🔍 Debug: Looking up user by email:', email);
        const { data: user, error } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (error) {
            console.log('❌ User lookup error:', error);
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        console.log('✅ User found:', user.id);
        res.json({
            success: true,
            user: {
                id: user.id,
                auth_user_id: user.auth_user_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('❌ Debug user lookup error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/table-info/:tableName', async (req, res) => {
    try {
        const { tableName } = req.params;
        console.log('🔍 Debug: Getting table info for:', tableName);
        const { data: sample, error } = await supabase_1.supabaseAdmin
            .from(tableName)
            .select('*')
            .limit(1);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        res.json({
            success: true,
            tableName,
            sampleRecord: sample?.[0] || null,
            hasData: (sample?.length || 0) > 0
        });
    }
    catch (error) {
        console.error('❌ Debug table info error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=debug.js.map