import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import path from 'path'

// Import routes
import authRoutes from './routes/auth-local' // Using local PostgreSQL auth
import eventsRoutes from './routes/events-local' // Using local PostgreSQL events
import storageRoutes from './routes/storage-local' // Using local file storage
import usersRoutes from './routes/users-local' // Using local PostgreSQL users
import ticketsRoutes from './routes/tickets-local' // Using local PostgreSQL tickets
import notificationsRoutes from './routes/notifications'
import messagesRoutes from './routes/messages'
import emailSettingsRoutes from './routes/email-settings'
// import usersRoutes from './routes/users'
import debugRoutes from './routes/debug'
// import ticketsRoutes from './routes/tickets'
import articlesRoutes from './routes/articles'
import participantRegistrationRoutes from './routes/participant-registration'
import userLicensesRoutes from './routes/user-licenses'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'

// Load environment variables
dotenv.config()

// Test database connection on startup
import { testConnection } from './lib/database'

const app = express()
const PORT = process.env.PORT || 5001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Serve static files (uploaded logos)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/storage', storageRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/tickets', ticketsRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/admin', emailSettingsRoutes)
// app.use('/api/users', usersRoutes)
app.use('/api/debug', debugRoutes)
// app.use('/api/tickets', ticketsRoutes)
app.use('/api/articles', articlesRoutes)
app.use('/api/participant-registration', participantRegistrationRoutes)
app.use('/api/user-licenses', userLicensesRoutes)

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Start server
app.listen(PORT, async () => {
  console.log(`
🚀 Starting Line API Server is running!
   
   Port: ${PORT}
   Environment: ${process.env.NODE_ENV || 'development'}
   Database: Local PostgreSQL
   
   📊 Health Check: http://localhost:${PORT}/health
   🔧 API Endpoints: http://localhost:${PORT}/api
   🔐 Auth: http://localhost:${PORT}/api/auth
   
   Ready to handle events! 🏁
  `)
  
  // Test database connection
  const dbConnected = await testConnection()
  if (dbConnected) {
    console.log('✅ Database connection verified')
  } else {
    console.log('❌ Database connection failed - check your PostgreSQL setup')
  }
})

export default app
