"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.createUser = createUser;
exports.authenticateUser = authenticateUser;
exports.getUserById = getUserById;
exports.getUserByEmail = getUserByEmail;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.isAdminUser = isAdminUser;
exports.updatePassword = updatePassword;
exports.verifyPassword = verifyPassword;
exports.testConnection = testConnection;
exports.getTableCounts = getTableCounts;
exports.createAuditTrailEntry = createAuditTrailEntry;
exports.getEventAuditTrail = getEventAuditTrail;
exports.createNotification = createNotification;
exports.getUserNotifications = getUserNotifications;
exports.getUnreadNotificationCount = getUnreadNotificationCount;
exports.markNotificationAsRead = markNotificationAsRead;
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
exports.createMessage = createMessage;
exports.getUserMessages = getUserMessages;
exports.getMessageThread = getMessageThread;
exports.markMessageAsRead = markMessageAsRead;
exports.getUnreadMessageCount = getUnreadMessageCount;
const pg_1 = require("pg");
const bcrypt_1 = __importDefault(require("bcrypt"));
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://startingline_app:startingline_local_password@localhost:5432/startingline_local',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});
exports.pool = pool;
pool.on('connect', () => {
    console.log('🔗 Connected to local PostgreSQL database');
});
pool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err);
});
async function createUser(userData) {
    const client = await pool.connect();
    try {
        const saltRounds = 12;
        const passwordHash = await bcrypt_1.default.hash(userData.password, saltRounds);
        const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, role, email_verified, created_at, updated_at
    `;
        const values = [
            userData.email.toLowerCase().trim(),
            passwordHash,
            userData.first_name.trim(),
            userData.last_name.trim(),
            userData.role
        ];
        const result = await client.query(query, values);
        const user = result.rows[0];
        if (userData.role === 'admin') {
            await client.query('INSERT INTO admin_users (email, is_active) VALUES ($1, TRUE)', [userData.email.toLowerCase().trim()]);
        }
        console.log(`✅ User created successfully: ${user.email} (${user.role})`);
        return user;
    }
    catch (error) {
        console.error('❌ User creation failed:', error.message);
        if (error.code === '23505') {
            throw new Error('Email address is already registered');
        }
        throw new Error(`Failed to create user: ${error.message}`);
    }
    finally {
        client.release();
    }
}
async function authenticateUser(email, password) {
    const client = await pool.connect();
    try {
        console.log('🔍 authenticateUser called with:', { email, passwordLength: password.length });
        const query = `
      SELECT id, email, password_hash, first_name, last_name, role, email_verified, last_login_at, created_at, updated_at,
             phone, company_name, company_address, vat_number, company_registration_number,
             company_phone, company_email, bank_name, account_holder_name, account_number,
             branch_code, account_type
      FROM users 
      WHERE email = $1
    `;
        const normalizedEmail = email.toLowerCase().trim();
        console.log('🔍 Searching for email:', normalizedEmail);
        const result = await client.query(query, [normalizedEmail]);
        console.log('🔍 Database query result:', { rowCount: result.rows.length });
        if (result.rows.length === 0) {
            console.log('❌ No user found with email:', normalizedEmail);
            throw new Error('Invalid email or password');
        }
        const user = result.rows[0];
        console.log('🔍 User found:', { id: user.id, email: user.email, role: user.role });
        console.log('🔍 Password hash exists:', !!user.password_hash);
        console.log('🔍 Password hash length:', user.password_hash ? user.password_hash.length : 'null');
        console.log('🔍 About to compare password with hash');
        const isValidPassword = await bcrypt_1.default.compare(password, user.password_hash);
        console.log('🔍 Password comparison result:', isValidPassword);
        if (!isValidPassword) {
            console.log('❌ Password comparison failed');
            throw new Error('Invalid email or password');
        }
        console.log('🔍 Password is valid, updating last login');
        await client.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
        const { password_hash, ...userWithoutPassword } = user;
        console.log(`✅ User authenticated: ${user.email} (${user.role})`);
        return userWithoutPassword;
    }
    catch (error) {
        console.error('❌ Authentication failed:', error.message);
        throw error;
    }
    finally {
        client.release();
    }
}
async function getUserById(userId) {
    const client = await pool.connect();
    try {
        const query = `
      SELECT id, email, first_name, last_name, role, email_verified, last_login_at, created_at, updated_at,
             phone, company_name, company_address, vat_number, company_registration_number,
             company_phone, company_email, bank_name, account_holder_name, account_number,
             branch_code, account_type
      FROM users 
      WHERE id = $1
    `;
        const result = await client.query(query, [userId]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }
    catch (error) {
        console.error('❌ Get user by ID failed:', error.message);
        throw new Error(`Failed to get user: ${error.message}`);
    }
    finally {
        client.release();
    }
}
async function getUserByEmail(email) {
    const client = await pool.connect();
    try {
        const query = `
      SELECT id, email, first_name, last_name, role, email_verified, last_login_at, created_at, updated_at
      FROM users 
      WHERE email = $1
    `;
        const result = await client.query(query, [email.toLowerCase().trim()]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }
    catch (error) {
        console.error('❌ Get user by email failed:', error.message);
        throw new Error(`Failed to get user: ${error.message}`);
    }
    finally {
        client.release();
    }
}
async function updateUser(userId, updates) {
    const client = await pool.connect();
    try {
        const setClause = [];
        const values = [];
        let paramCounter = 1;
        const updateableFields = [
            'first_name', 'last_name', 'email', 'phone',
            'company_name', 'company_address', 'vat_number', 'company_registration_number',
            'company_phone', 'company_email', 'bank_name', 'account_holder_name',
            'account_number', 'branch_code', 'account_type', 'email_verified'
        ];
        for (const field of updateableFields) {
            const value = updates[field];
            if (value !== undefined) {
                setClause.push(`${field} = $${paramCounter}`);
                if (field === 'email' && value) {
                    values.push(value.toLowerCase().trim());
                }
                else if ((field === 'first_name' || field === 'last_name') && value) {
                    values.push(value.trim());
                }
                else {
                    values.push(value);
                }
                paramCounter++;
            }
        }
        if (setClause.length === 0) {
            throw new Error('No valid fields to update');
        }
        values.push(userId);
        const query = `
      UPDATE users 
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCounter}
      RETURNING id, email, first_name, last_name, role, email_verified, last_login_at, created_at, updated_at,
                phone, company_name, company_address, vat_number, company_registration_number,
                company_phone, company_email, bank_name, account_holder_name, account_number,
                branch_code, account_type
    `;
        const result = await client.query(query, values);
        if (result.rows.length === 0) {
            throw new Error('User not found');
        }
        console.log(`✅ User updated: ${result.rows[0].email}`);
        return result.rows[0];
    }
    catch (error) {
        console.error('❌ User update failed:', error.message);
        throw new Error(`Failed to update user: ${error.message}`);
    }
    finally {
        client.release();
    }
}
async function deleteUser(userId) {
    const client = await pool.connect();
    try {
        const result = await client.query('DELETE FROM users WHERE id = $1', [userId]);
        if (result.rowCount === 0) {
            throw new Error('User not found');
        }
        console.log(`✅ User deleted: ${userId}`);
    }
    catch (error) {
        console.error('❌ User deletion failed:', error.message);
        throw new Error(`Failed to delete user: ${error.message}`);
    }
    finally {
        client.release();
    }
}
async function isAdminUser(email) {
    const client = await pool.connect();
    try {
        const query = `
      SELECT is_active FROM admin_users 
      WHERE email = $1 AND is_active = TRUE
    `;
        const result = await client.query(query, [email.toLowerCase().trim()]);
        return result.rows.length > 0;
    }
    catch (error) {
        console.error('❌ Admin check failed:', error.message);
        return false;
    }
    finally {
        client.release();
    }
}
async function updatePassword(userId, newPassword) {
    const client = await pool.connect();
    try {
        const saltRounds = 12;
        const passwordHash = await bcrypt_1.default.hash(newPassword, saltRounds);
        const result = await client.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, userId]);
        if (result.rowCount === 0) {
            throw new Error('User not found');
        }
        console.log(`✅ Password updated for user: ${userId}`);
    }
    catch (error) {
        console.error('❌ Password update failed:', error.message);
        throw new Error(`Failed to update password: ${error.message}`);
    }
    finally {
        client.release();
    }
}
async function verifyPassword(userId, password) {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return false;
        }
        return await bcrypt_1.default.compare(password, result.rows[0].password_hash);
    }
    catch (error) {
        console.error('❌ Password verification failed:', error.message);
        return false;
    }
    finally {
        client.release();
    }
}
async function testConnection() {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        console.log('✅ Database connection test successful');
        return true;
    }
    catch (error) {
        console.error('❌ Database connection test failed:', error.message);
        return false;
    }
}
async function getTableCounts() {
    const client = await pool.connect();
    try {
        const tables = ['users', 'events', 'payments', 'tickets', 'admin_users'];
        const counts = {};
        for (const table of tables) {
            const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
            counts[table] = parseInt(result.rows[0].count);
        }
        return counts;
    }
    catch (error) {
        console.error('❌ Get table counts failed:', error.message);
        throw error;
    }
    finally {
        client.release();
    }
}
async function createAuditTrailEntry(eventId, actionType, performedBy, performedByRole, message, metadata) {
    console.log('🔍 createAuditTrailEntry called with:');
    console.log('  - eventId:', eventId, '(type:', typeof eventId, ')');
    console.log('  - actionType:', actionType);
    console.log('  - performedBy:', performedBy, '(type:', typeof performedBy, ')');
    console.log('  - performedByRole:', performedByRole);
    console.log('  - message:', message);
    const query = `
    INSERT INTO event_audit_trail (event_id, action_type, performed_by, performed_by_role, message, metadata)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
    const values = [eventId, actionType, performedBy, performedByRole, message, metadata ? JSON.stringify(metadata) : null];
    console.log('🔍 Executing query with values:', values);
    const result = await pool.query(query, values);
    console.log('✅ Audit trail entry created successfully:', result.rows[0]);
    return result.rows[0];
}
async function getEventAuditTrail(eventId) {
    const query = `
    SELECT 
      eat.*,
      u.first_name,
      u.last_name,
      u.email
    FROM event_audit_trail eat
    JOIN users u ON eat.performed_by = u.id
    WHERE eat.event_id = $1
    ORDER BY eat.created_at ASC
  `;
    const result = await pool.query(query, [eventId]);
    return result.rows;
}
async function createNotification(userId, type, title, message, link, metadata) {
    const query = `
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
    const values = [userId, type, title, message, link, metadata ? JSON.stringify(metadata) : null];
    const result = await pool.query(query, values);
    return result.rows[0];
}
async function getUserNotifications(userId, limit = 50) {
    const query = `
    SELECT * FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
}
async function getUnreadNotificationCount(userId) {
    const query = `
    SELECT COUNT(*) as count FROM notifications
    WHERE user_id = $1 AND read_at IS NULL
  `;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
}
async function markNotificationAsRead(notificationId, userId) {
    const query = `
    UPDATE notifications 
    SET read_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;
    const result = await pool.query(query, [notificationId, userId]);
    return result.rows[0];
}
async function markAllNotificationsAsRead(userId) {
    const query = `
    UPDATE notifications 
    SET read_at = CURRENT_TIMESTAMP
    WHERE user_id = $1 AND read_at IS NULL
    RETURNING *
  `;
    const result = await pool.query(query, [userId]);
    return result.rows;
}
async function createMessage(eventId, senderId, recipientId, subject, body, parentMessageId) {
    const query = `
    INSERT INTO messages (event_id, sender_id, recipient_id, subject, body, parent_message_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
    const values = [eventId, senderId, recipientId, subject, body, parentMessageId || null];
    const result = await pool.query(query, values);
    return result.rows[0];
}
async function getUserMessages(userId, limit = 50) {
    const query = `
    SELECT 
      m.*,
      sender.first_name as sender_first_name,
      sender.last_name as sender_last_name,
      sender.email as sender_email,
      sender.role as sender_role,
      recipient.first_name as recipient_first_name,
      recipient.last_name as recipient_last_name,
      recipient.email as recipient_email,
      recipient.role as recipient_role,
      e.name as event_name
    FROM messages m
    JOIN users sender ON m.sender_id = sender.id
    JOIN users recipient ON m.recipient_id = recipient.id
    LEFT JOIN events e ON m.event_id = e.id
    WHERE m.sender_id = $1 OR m.recipient_id = $1
    ORDER BY m.created_at DESC
    LIMIT $2
  `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
}
async function getMessageThread(messageId, userId) {
    const query = `
    WITH RECURSIVE message_thread AS (
      -- Base case: get the root message or the specified message
      SELECT 
        m.*,
        sender.first_name as sender_first_name,
        sender.last_name as sender_last_name,
        sender.email as sender_email,
        sender.role as sender_role,
        recipient.first_name as recipient_first_name,
        recipient.last_name as recipient_last_name,
        recipient.email as recipient_email,
        recipient.role as recipient_role,
        e.name as event_name,
        0 as depth
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users recipient ON m.recipient_id = recipient.id
      LEFT JOIN events e ON m.event_id = e.id
      WHERE m.id = $1
        AND (m.sender_id = $2 OR m.recipient_id = $2)
      
      UNION ALL
      
      -- Recursive case: get all replies
      SELECT 
        m.*,
        sender.first_name as sender_first_name,
        sender.last_name as sender_last_name,
        sender.email as sender_email,
        sender.role as sender_role,
        recipient.first_name as recipient_first_name,
        recipient.last_name as recipient_last_name,
        recipient.email as recipient_email,
        recipient.role as recipient_role,
        e.name as event_name,
        mt.depth + 1
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users recipient ON m.recipient_id = recipient.id
      LEFT JOIN events e ON m.event_id = e.id
      JOIN message_thread mt ON m.parent_message_id = mt.id
      WHERE (m.sender_id = $2 OR m.recipient_id = $2)
    )
    SELECT * FROM message_thread
    ORDER BY created_at ASC
  `;
    const result = await pool.query(query, [messageId, userId]);
    return result.rows;
}
async function markMessageAsRead(messageId, userId) {
    const query = `
    UPDATE messages 
    SET read_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND recipient_id = $2
    RETURNING *
  `;
    const result = await pool.query(query, [messageId, userId]);
    return result.rows[0];
}
async function getUnreadMessageCount(userId) {
    const query = `
    SELECT COUNT(*) as count FROM messages
    WHERE recipient_id = $1 AND read_at IS NULL
  `;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
}
exports.default = pool;
//# sourceMappingURL=database.js.map