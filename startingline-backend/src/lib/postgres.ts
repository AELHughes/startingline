import { Pool } from 'pg'

// Create PostgreSQL connection pool using Supabase connection string
const connectionString = 'postgresql://postgres.kjeoqaoinkcrbukoqjfn:aU_9C7NPsZyDZYnVgWElDg_w6Prb4S2@aws-0-eu-west-1.pooler.supabase.com:6543/postgres'

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
})

// Test the connection
pool.on('connect', () => {
  console.log('🔗 Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err)
})

export { pool }

// Helper function to insert user directly into database
export async function insertUserDirect(userData: {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
}) {
  const client = await pool.connect()
  
  try {
    console.log('🔧 Inserting user directly with PostgreSQL client')
    
    const query = `
      INSERT INTO users (id, email, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role
      RETURNING *
    `
    
    const values = [
      userData.id,
      userData.email,
      userData.first_name,
      userData.last_name,
      userData.role
    ]
    
    const result = await client.query(query, values)
    console.log('✅ User inserted successfully via direct PostgreSQL')
    
    return { data: result.rows[0], error: null }
  } catch (error: any) {
    console.error('❌ Direct PostgreSQL insert failed:', error.message)
    return { data: null, error: error }
  } finally {
    client.release()
  }
}
