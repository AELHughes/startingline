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
        const query = `
      SELECT id, email, password_hash, first_name, last_name, role, email_verified, last_login_at, created_at, updated_at
      FROM users 
      WHERE email = $1
    `;
        const result = await client.query(query, [email.toLowerCase().trim()]);
        if (result.rows.length === 0) {
            throw new Error('Invalid email or password');
        }
        const user = result.rows[0];
        const isValidPassword = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }
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
      SELECT id, email, first_name, last_name, role, email_verified, last_login_at, created_at, updated_at
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
        if (updates.first_name) {
            setClause.push(`first_name = $${paramCounter}`);
            values.push(updates.first_name.trim());
            paramCounter++;
        }
        if (updates.last_name) {
            setClause.push(`last_name = $${paramCounter}`);
            values.push(updates.last_name.trim());
            paramCounter++;
        }
        if (updates.email) {
            setClause.push(`email = $${paramCounter}`);
            values.push(updates.email.toLowerCase().trim());
            paramCounter++;
        }
        if (updates.email_verified !== undefined) {
            setClause.push(`email_verified = $${paramCounter}`);
            values.push(updates.email_verified);
            paramCounter++;
        }
        if (setClause.length === 0) {
            throw new Error('No valid fields to update');
        }
        values.push(userId);
        const query = `
      UPDATE users 
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCounter}
      RETURNING id, email, first_name, last_name, role, email_verified, last_login_at, created_at, updated_at
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
exports.default = pool;
//# sourceMappingURL=database.js.map