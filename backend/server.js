const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const http = require('http')
const socketIo = require('socket.io')

// Load environment variables
dotenv.config()

// Connect to database
connectDB()

const app = express()
const server = http.createServer(app)

// Setup Socket.io
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
})

// Make io accessible to our router
app.set('io', io)

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`)

  // Client can join a room using their driver ID
  socket.on('joinDriverRoom', (driverId) => {
    socket.join(driverId)
    console.log(`Driver ${driverId} joined room`)
  })

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`)
  })
})

// Middleware
app.use(cors())
app.use(express.json())

// Basic Route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ShipNova SaaS API',
    status: 'Running'
  })
})

// Diagnostic Email Endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    const sendEmail = require('./utils/sendEmail')
    const to = req.query.to || 'shipnova8586@gmail.com'
    const result = await sendEmail({
      to,
      subject: 'ShipNova Test Diagnostics',
      type: 'ASSIGNED',
      shipment: {
        trackingNumber: 'SN-TEST-DIAG',
        status: 'Assigned',
        shipmentType: 'Express',
        weight: 15,
        customerId: { name: 'Test Diagnostic Customer', email: to }
      }
    })
    res.json({
      success: result,
      envUser: process.env.EMAIL_USER ? 'CONFIGURED' : 'USING_FALLBACK',
      message: result ? `Diagnostic email successfully sent to ${to}` : `Failed to send email to ${to}`
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, stack: err.stack })
  }
})

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/customers', require('./routes/customerRoutes'))
app.use('/api/drivers', require('./routes/driverRoutes'))
app.use('/api/vehicles', require('./routes/vehicleRoutes'))
app.use('/api/shipments', require('./routes/shipmentRoutes'))
app.use('/api/network', require('./routes/networkRoutes'))
app.use('/api/driver-auth', require('./routes/driverAuthRoutes')) // Added mobile auth routes
app.use('/api/dashboard', require('./routes/dashboardRoutes'))
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/contact', require('./routes/contactRoutes'))
app.use('/api/payments', require('./routes/paymentRoutes')) // Added Razorpay routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
})
