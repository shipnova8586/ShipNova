const Company = require('../models/Company')
const User = require('../models/User')

// @desc    Register a new Company and its Admin User
// @route   POST /api/auth/register-company
// @access  Public
const registerCompany = async (req, res) => {
  const { companyName, companyEmail, companyPhone, companyAddress, adminName, adminEmail, adminPassword } = req.body

  try {
    // Check if company email or admin email already exists
    const existingCompany = await Company.findOne({ email: companyEmail })
    if (existingCompany) {
      return res.status(400).json({ success: false, message: 'Company with this email already registered.' })
    }

    const existingUser = await User.findOne({ email: adminEmail })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' })
    }

    // Create Company
    const company = await Company.create({
      name: companyName,
      email: companyEmail,
      phone: companyPhone,
      address: companyAddress
    })

    // Create Admin User linked to this Company
    const user = await User.create({
      companyId: company._id,
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'company_admin'
    })

    // Generate JWT token
    const token = user.getSignedJwtToken()

    res.status(201).json({
      success: true,
      message: 'Company and Admin user registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message
    })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide an email and password.' })
  }

  try {
    // Check for user & explicitly select password
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' })
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' })
    }

    // Generate JWT token
    const token = user.getSignedJwtToken()

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: error.message
    })
  }
}

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('companyId', 'name email logo subscriptionPlan')
    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile info.',
      error: error.message
    })
  }
}

// @desc    Sync Clerk authenticated user with our MongoDB
// @route   POST /api/auth/clerk-sync
// @access  Public (Clerk handles auth on frontend)
const clerkSync = async (req, res) => {
  const { clerkUserId, email, name } = req.body

  if (!clerkUserId || !email) {
    return res.status(400).json({
      success: false,
      message: 'Clerk user ID and email are required.'
    })
  }

  try {
    // Try to find user by clerkId first, then by email
    let user = await User.findOne({ clerkId: clerkUserId }).populate('companyId', 'name email logo subscriptionPlan')

    if (!user) {
      // Try finding by email (user registered before Clerk was added)
      user = await User.findOne({ email: email.toLowerCase() }).populate('companyId', 'name email logo subscriptionPlan')

      if (user) {
        // Link their Clerk account to existing MongoDB user
        user.clerkId = clerkUserId
        await user.save()
      }
    }

    if (!user) {
      // Brand new user - needs to register their company
      return res.status(404).json({
        success: false,
        isNewUser: true,
        clerkUserId,
        email,
        name,
        message: 'No company account linked to this email. Please register your company.'
      })
    }

    // Generate our JWT token with companyId and role inside
    const token = user.getSignedJwtToken()

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during Clerk sync.',
      error: error.message
    })
  }
}

// @desc    Register company via Clerk (when Clerk user has no company yet)
// @route   POST /api/auth/clerk-register-company
// @access  Public
const clerkRegisterCompany = async (req, res) => {
  const {
    clerkUserId, companyName, companyEmail, companyPhone,
    companyAddress, adminName, adminEmail, subscriptionPlan
  } = req.body

  try {
    const existingCompany = await Company.findOne({ email: companyEmail })
    if (existingCompany) {
      return res.status(400).json({ success: false, message: 'Company with this email already registered.' })
    }

    const existingUser = await User.findOne({ email: adminEmail })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' })
    }

    // Create Company
    const company = await Company.create({
      name: companyName,
      email: companyEmail,
      phone: companyPhone,
      address: companyAddress,
      subscriptionPlan: subscriptionPlan || 'core'
    })

    // Create Admin User linked to Company & Clerk (no password needed - Clerk handles auth)
    const user = await User.create({
      companyId: company._id,
      clerkId: clerkUserId,
      name: adminName,
      email: adminEmail,
      password: Math.random().toString(36).slice(-12) + 'Aa1!', // Random strong password (not used)
      role: 'company_admin'
    })

    const token = user.getSignedJwtToken()

    res.status(201).json({
      success: true,
      message: 'Company registered and linked to Clerk account!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: company
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during company registration.',
      error: error.message
    })
  }
}

module.exports = {
  registerCompany,
  login,
  getMe,
  clerkSync,
  clerkRegisterCompany
}
