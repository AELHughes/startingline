import { Pool, PoolClient } from 'pg'
import bcrypt from 'bcrypt'
import type { User, CreateUserData } from '../types'

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://startingline_app:startingline_local_password@localhost:5432/startingline_local',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

// Connection event handlers
pool.on('connect', () => {
  console.log('🔗 Connected to local PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err)
})

// ============================================
// USER OPERATIONS
// ============================================

export async function createUser(userData: CreateUserData): Promise<User> {
  const client = await pool.connect()
  
  try {
    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(userData.password, saltRounds)
    
    // Insert user
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, role, email_verified, created_at, updated_at
    `
    
    const values = [
      userData.email.toLowerCase().trim(),
      passwordHash,
      userData.first_name.trim(),
      userData.last_name.trim(),
      userData.role
    ]
    
    const result = await client.query(query, values)
    const user = result.rows[0]
    
    // If creating an admin, also add to admin_users table
    if (userData.role === 'admin') {
      await client.query(
        'INSERT INTO admin_users (email, is_active) VALUES ($1, TRUE)',
        [userData.email.toLowerCase().trim()]
      )
    }
    
    console.log(`✅ User created successfully: ${user.email} (${user.role})`)
    return user
    
  } catch (error: any) {
    console.error('❌ User creation failed:', error.message)
    
    if (error.code === '23505') { // Unique violation
      throw new Error('Email address is already registered')
    }
    
    throw new Error(`Failed to create user: ${error.message}`)
  } finally {
    client.release()
  }
}

export async function authenticateUser(email: string, password: string): Promise<User> {
  const client = await pool.connect()
  
  try {
    console.log('🔍 authenticateUser called with:', { email, passwordLength: password.length })
    
    const query = `
      SELECT id, email, password_hash, first_name, last_name, role, email_verified, last_login_at, created_at, updated_at,
             phone, company_name, company_address, vat_number, company_registration_number,
             company_phone, company_email, bank_name, account_holder_name, account_number,
             branch_code, account_type
      FROM users 
      WHERE email = $1
    `
    
    const normalizedEmail = email.toLowerCase().trim()
    console.log('🔍 Searching for email:', normalizedEmail)
    
    const result = await client.query(query, [normalizedEmail])
    console.log('🔍 Database query result:', { rowCount: result.rows.length })
    
    if (result.rows.length === 0) {
      console.log('❌ No user found with email:', normalizedEmail)
      throw new Error('Invalid email or password')
    }
    
    const user = result.rows[0]
    console.log('🔍 User found:', { id: user.id, email: user.email, role: user.role })
    console.log('🔍 Password hash exists:', !!user.password_hash)
    console.log('🔍 Password hash length:', user.password_hash ? user.password_hash.length : 'null')
    
    // Verify password
    console.log('🔍 About to compare password with hash')
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    console.log('🔍 Password comparison result:', isValidPassword)
    
    if (!isValidPassword) {
      console.log('❌ Password comparison failed')
      throw new Error('Invalid email or password')
    }
    
    console.log('🔍 Password is valid, updating last login')
    
    // Update last login
    await client.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    )
    
    // Remove password_hash from returned user object
    const { password_hash, ...userWithoutPassword } = user
    
    console.log(`✅ User authenticated: ${user.email} (${user.role})`)
    return userWithoutPassword
    
  } catch (error: any) {
    console.error('❌ Authentication failed:', error.message)
    throw error
  } finally {
    client.release()
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  const client = await pool.connect()
  
  try {
    const query = `
      SELECT id, email, first_name, last_name, role, email_verified, last_login_at, created_at, updated_at,
             phone, company_name, company_address, vat_number, company_registration_number,
             company_phone, company_email, bank_name, account_holder_name, account_number,
             branch_code, account_type
      FROM users 
      WHERE id = $1
    `
    
    const result = await client.query(query, [userId])
    
    if (result.rows.length === 0) {
      return null
    }
    
    return result.rows[0]
    
  } catch (error: any) {
    console.error('❌ Get user by ID failed:', error.message)
    throw new Error(`Failed to get user: ${error.message}`)
  } finally {
    client.release()
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const client = await pool.connect()
  
  try {
    const query = `
      SELECT id, email, first_name, last_name, role, email_verified, last_login_at, created_at, updated_at
      FROM users 
      WHERE email = $1
    `
    
    const result = await client.query(query, [email.toLowerCase().trim()])
    
    if (result.rows.length === 0) {
      return null
    }
    
    return result.rows[0]
    
  } catch (error: any) {
    console.error('❌ Get user by email failed:', error.message)
    throw new Error(`Failed to get user: ${error.message}`)
  } finally {
    client.release()
  }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User> {
  const client = await pool.connect()
  
  try {
    // Build dynamic update query
    const setClause = []
    const values = []
    let paramCounter = 1
    
    // Define all updateable fields
    const updateableFields = [
      'first_name', 'last_name', 'email', 'phone',
      'company_name', 'company_address', 'vat_number', 'company_registration_number',
      'company_phone', 'company_email', 'bank_name', 'account_holder_name',
      'account_number', 'branch_code', 'account_type', 'email_verified'
    ]
    
    for (const field of updateableFields) {
      const value = (updates as any)[field]
      if (value !== undefined) {
        setClause.push(`${field} = $${paramCounter}`)
        
        // Handle different field types
        if (field === 'email' && value) {
          values.push(value.toLowerCase().trim())
        } else if ((field === 'first_name' || field === 'last_name') && value) {
          values.push(value.trim())
        } else {
          values.push(value)
        }
        paramCounter++
      }
    }
    
    if (setClause.length === 0) {
      throw new Error('No valid fields to update')
    }
    
    // Add user ID as last parameter
    values.push(userId)
    
    const query = `
      UPDATE users 
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCounter}
      RETURNING id, email, first_name, last_name, role, email_verified, last_login_at, created_at, updated_at,
                phone, company_name, company_address, vat_number, company_registration_number,
                company_phone, company_email, bank_name, account_holder_name, account_number,
                branch_code, account_type
    `
    
    const result = await client.query(query, values)
    
    if (result.rows.length === 0) {
      throw new Error('User not found')
    }
    
    console.log(`✅ User updated: ${result.rows[0].email}`)
    return result.rows[0]
    
  } catch (error: any) {
    console.error('❌ User update failed:', error.message)
    throw new Error(`Failed to update user: ${error.message}`)
  } finally {
    client.release()
  }
}

export async function deleteUser(userId: string): Promise<void> {
  const client = await pool.connect()
  
  try {
    const result = await client.query('DELETE FROM users WHERE id = $1', [userId])
    
    if (result.rowCount === 0) {
      throw new Error('User not found')
    }
    
    console.log(`✅ User deleted: ${userId}`)
    
  } catch (error: any) {
    console.error('❌ User deletion failed:', error.message)
    throw new Error(`Failed to delete user: ${error.message}`)
  } finally {
    client.release()
  }
}

// ============================================
// ADMIN OPERATIONS
// ============================================

export async function isAdminUser(email: string): Promise<boolean> {
  const client = await pool.connect()
  
  try {
    const query = `
      SELECT is_active FROM admin_users 
      WHERE email = $1 AND is_active = TRUE
    `
    
    const result = await client.query(query, [email.toLowerCase().trim()])
    return result.rows.length > 0
    
  } catch (error: any) {
    console.error('❌ Admin check failed:', error.message)
    return false
  } finally {
    client.release()
  }
}

// ============================================
// PASSWORD MANAGEMENT
// ============================================

export async function updatePassword(userId: string, newPassword: string): Promise<void> {
  const client = await pool.connect()
  
  try {
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(newPassword, saltRounds)
    
    const result = await client.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId]
    )
    
    if (result.rowCount === 0) {
      throw new Error('User not found')
    }
    
    console.log(`✅ Password updated for user: ${userId}`)
    
  } catch (error: any) {
    console.error('❌ Password update failed:', error.message)
    throw new Error(`Failed to update password: ${error.message}`)
  } finally {
    client.release()
  }
}

export async function verifyPassword(userId: string, password: string): Promise<boolean> {
  const client = await pool.connect()
  
  try {
    const result = await client.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    )
    
    if (result.rows.length === 0) {
      return false
    }
    
    return await bcrypt.compare(password, result.rows[0].password_hash)
    
  } catch (error: any) {
    console.error('❌ Password verification failed:', error.message)
    return false
  } finally {
    client.release()
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    console.log('✅ Database connection test successful')
    return true
  } catch (error: any) {
    console.error('❌ Database connection test failed:', error.message)
    return false
  }
}

export async function getTableCounts(): Promise<Record<string, number>> {
  const client = await pool.connect()
  
  try {
    const tables = ['users', 'events', 'payments', 'tickets', 'admin_users']
    const counts: Record<string, number> = {}
    
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`)
      counts[table] = parseInt(result.rows[0].count)
    }
    
    return counts
    
  } catch (error: any) {
    console.error('❌ Get table counts failed:', error.message)
    throw error
  } finally {
    client.release()
  }
}

// Audit Trail Functions
export async function createAuditTrailEntry(
  eventId: string,
  actionType: string,
  performedBy: string,
  performedByRole: 'organiser' | 'admin',
  message?: string,
  metadata?: any
) {
  console.log('🔍 createAuditTrailEntry called with:')
  console.log('  - eventId:', eventId, '(type:', typeof eventId, ')')
  console.log('  - actionType:', actionType)
  console.log('  - performedBy:', performedBy, '(type:', typeof performedBy, ')')
  console.log('  - performedByRole:', performedByRole)
  console.log('  - message:', message)
  
  const query = `
    INSERT INTO event_audit_trail (event_id, action_type, performed_by, performed_by_role, message, metadata)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `
  const values = [eventId, actionType, performedBy, performedByRole, message, metadata ? JSON.stringify(metadata) : null]
  
  console.log('🔍 Executing query with values:', values)
  
  const result = await pool.query(query, values)
  console.log('✅ Audit trail entry created successfully:', result.rows[0])
  return result.rows[0]
}

export async function getEventAuditTrail(eventId: string) {
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
  `
  
  const result = await pool.query(query, [eventId])
  return result.rows
}

// Notification Functions
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string,
  metadata?: any
) {
  const query = `
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `
  const values = [userId, type, title, message, link, metadata ? JSON.stringify(metadata) : null]
  
  const result = await pool.query(query, values)
  return result.rows[0]
}

export async function getUserNotifications(userId: string, limit = 50) {
  const query = `
    SELECT * FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `
  
  const result = await pool.query(query, [userId, limit])
  return result.rows
}

export async function getUnreadNotificationCount(userId: string) {
  const query = `
    SELECT COUNT(*) as count FROM notifications
    WHERE user_id = $1 AND read_at IS NULL
  `
  
  const result = await pool.query(query, [userId])
  return parseInt(result.rows[0].count)
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  const query = `
    UPDATE notifications 
    SET read_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `
  
  const result = await pool.query(query, [notificationId, userId])
  return result.rows[0]
}

export async function markAllNotificationsAsRead(userId: string) {
  const query = `
    UPDATE notifications 
    SET read_at = CURRENT_TIMESTAMP
    WHERE user_id = $1 AND read_at IS NULL
    RETURNING *
  `
  
  const result = await pool.query(query, [userId])
  return result.rows
}

// Message Functions
export async function createMessage(
  eventId: string | null,
  senderId: string,
  recipientId: string,
  subject: string,
  body: string,
  parentMessageId?: string
) {
  const query = `
    INSERT INTO messages (event_id, sender_id, recipient_id, subject, body, parent_message_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `
  const values = [eventId, senderId, recipientId, subject, body, parentMessageId || null]
  
  const result = await pool.query(query, values)
  return result.rows[0]
}

export async function getUserMessages(userId: string, limit = 50) {
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
  `
  
  const result = await pool.query(query, [userId, limit])
  return result.rows
}

export async function getMessageThread(messageId: string, userId: string) {
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
  `
  
  const result = await pool.query(query, [messageId, userId])
  return result.rows
}

export async function markMessageAsRead(messageId: string, userId: string) {
  const query = `
    UPDATE messages 
    SET read_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND recipient_id = $2
    RETURNING *
  `
  
  const result = await pool.query(query, [messageId, userId])
  return result.rows[0]
}

export async function getUnreadMessageCount(userId: string) {
  const query = `
    SELECT COUNT(*) as count FROM messages
    WHERE recipient_id = $1 AND read_at IS NULL
  `
  
  const result = await pool.query(query, [userId])
  return parseInt(result.rows[0].count)
}

// Export the pool for direct queries if needed
export { pool }
export default pool
