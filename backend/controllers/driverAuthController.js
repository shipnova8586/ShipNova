const Driver = require('../models/Driver')
const jwt = require('jsonwebtoken')

// Generate JWT for Driver
const generateDriverToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d'
  })
}

// @desc    Auth driver & get token (Login)
// @route   POST /api/driver-auth/login
// @access  Public
const loginDriver = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' })
    }

    const driver = await Driver.findOne({
      username: { $regex: new RegExp('^' + username + '$', 'i') }
    }).select('+password')

    if (!driver || !(await driver.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    res.status(200).json({
      success: true,
      token: generateDriverToken(driver._id, driver.role),
      data: {
        _id: driver._id,
        name: driver.name,
        username: driver.username,
        role: driver.role,
        companyId: driver.companyId,
        isVerified: driver.isVerified,
        kycDocumentUrl: driver.kycDocumentUrl
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// @desc    Register a new external carrier
// @route   POST /api/driver-auth/signup
// @access  Public
const signupExternalCarrier = async (req, res) => {
  try {
    const { name, phone, licenseNumber, username, password, kycDocumentUrl } = req.body

    if (!name || !phone || !licenseNumber || !username || !password || !kycDocumentUrl) {
      return res.status(400).json({ success: false, message: 'Please provide all fields including KYC Document' })
    }

    // Check if username exists
    const existingUser = await Driver.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username is already taken' })
    }

    // Create external carrier
    const driver = await Driver.create({
      name,
      phone,
      licenseNumber,
      username,
      password,
      kycDocumentUrl,
      role: 'external_carrier',
      companyId: null,
      isVerified: false
    })

    res.status(201).json({
      success: true,
      token: generateDriverToken(driver._id, driver.role),
      data: {
        _id: driver._id,
        name: driver.name,
        username: driver.username,
        role: driver.role,
        isVerified: driver.isVerified,
        kycDocumentUrl: driver.kycDocumentUrl
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

const Shipment = require('../models/Shipment')

// @desc    Get assigned trips for logged in driver
// @route   GET /api/driver-auth/my-trips
// @access  Private (Driver)
const getMyTrips = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ success: false, message: 'Not authorized' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')

    // Find shipments where driverId matches
    const trips = await Shipment.find({ driverId: decoded.id }).sort('-createdAt')

    res.status(200).json({ success: true, data: trips })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// @desc    Update trip status
// @route   PUT /api/driver-auth/trip-status/:id
// @access  Private (Driver)
const updateTripStatus = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ success: false, message: 'Not authorized' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')

    const { status } = req.body // e.g. "Picked Up", "In Transit", "Delivered"

    const shipment = await Shipment.findOneAndUpdate(
      { _id: req.params.id, driverId: decoded.id },
      { status },
      { new: true }
    )

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized' })
    }

    res.status(200).json({ success: true, data: shipment })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

const Bid = require('../models/Bid')

// @desc    Get public loads for external carriers
// @route   GET /api/driver-auth/public-loads
// @access  Private (Driver)
const getPublicLoads = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ success: false, message: 'Not authorized' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')

    const driver = await Driver.findById(decoded.id)
    const query = { isPublic: true }

    if (driver && driver.vehicleType && driver.vehicleType !== 'Any') {
      // Show loads that require 'Any' vehicle OR match the driver's specific vehicle
      query.requiredVehicle = { $in: ['Any', driver.vehicleType] }
    }

    // Fetch all public shipments
    const shipments = await Shipment.find(query)
      .populate('companyId', 'name logo')
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, data: shipments })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// @desc    Place a bid on a public load
// @route   POST /api/driver-auth/shipments/:id/bids
// @access  Private (Driver)
const placeBid = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ success: false, message: 'Not authorized' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')

    const driver = await Driver.findById(decoded.id)
    if (!driver || driver.role !== 'external_carrier') {
      return res.status(403).json({ success: false, message: 'Only external carriers can place bids' })
    }

    if (!driver.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your profile is pending KYC verification. Admin must verify your account before you can place bids.' 
      })
    }

    if (driver.currentStatus === 'Off Duty') {
      return res.status(400).json({ 
        success: false, 
        message: 'You are currently Off Duty. Please update your status to Available before placing bids.' 
      })
    }

    const { amount } = req.body

    const bid = await Bid.create({
      shipmentId: req.params.id,
      driverId: driver._id,
      carrierName: driver.name,
      carrierRating: driver.rating || 5.0,
      bidAmount: amount,
      estimatedDelivery: 'TBD'
    })

    res.status(201).json({ success: true, data: bid })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// @desc    Report an issue for a specific trip
// @route   POST /api/driver-auth/shipments/:id/issue
// @access  Private (Driver)
const reportIssue = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ success: false, message: 'Not authorized' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')

    const { issue } = req.body
    if (!issue) return res.status(400).json({ success: false, message: 'Please provide an issue description' })

    const shipment = await Shipment.findOneAndUpdate(
      { _id: req.params.id, driverId: decoded.id },
      { issueReported: issue },
      { new: true }
    )

    if (!shipment) return res.status(404).json({ success: false, message: 'Trip not found or not assigned to you' })

    res.status(200).json({ success: true, data: shipment })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// @desc    Update driver profile (e.g. vehicleType)
// @route   PUT /api/driver-auth/profile
// @access  Private (Driver)
const updateProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ success: false, message: 'Not authorized' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')

    const { vehicleType } = req.body

    const driver = await Driver.findByIdAndUpdate(
      decoded.id,
      { vehicleType },
      { new: true, runValidators: true }
    )

    res.status(200).json({ success: true, data: driver })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// @desc    Get driver profile
// @route   GET /api/driver-auth/profile
// @access  Private (Driver)
const getProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ success: false, message: 'Not authorized' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')

    const driver = await Driver.findById(decoded.id)
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' })

    res.status(200).json({ success: true, data: driver })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// @desc    Update live status
// @route   PUT /api/driver-auth/my-status
// @access  Private (Driver)
const updateMyStatus = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ success: false, message: 'Not authorized' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')

    const { currentStatus } = req.body // 'Available', 'On Duty', 'Off Duty'

    const driver = await Driver.findByIdAndUpdate(
      decoded.id,
      { currentStatus },
      { new: true }
    )

    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' })

    res.status(200).json({ success: true, data: driver })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

module.exports = {
  loginDriver,
  signupExternalCarrier,
  getMyTrips,
  updateTripStatus,
  getPublicLoads,
  placeBid,
  reportIssue,
  updateProfile,
  getProfile,
  updateMyStatus
}
