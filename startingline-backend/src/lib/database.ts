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
    const query = `
      SELECT id, email, password_hash, first_name, last_name, role, email_verified, last_login_at, created_at, updated_at,
             phone, company_name, company_address, vat_number, company_registration_number,
             company_phone, company_email, bank_name, account_holder_name, account_number,
             branch_code, account_type
      FROM users 
      WHERE email = $1
    `
    
    const result = await client.query(query, [email.toLowerCase().trim()])
    
    if (result.rows.length === 0) {
      throw new Error('Invalid email or password')
    }
    
    const user = result.rows[0]
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      throw new Error('Invalid email or password')
    }
    
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

// Export the pool for direct queries if needed
export { pool }
export default pool
