const User = require('../models/User')

// @desc    Get all users for the current company
// @route   GET /api/users
// @access  Private (company_admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ companyId: req.tenantId }).select('-password')
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error fetching team members',
      error: error.message
    })
  }
}

// @desc    Invite/Add a new team member
// @route   POST /api/users/invite
// @access  Private (company_admin)
const inviteUser = async (req, res) => {
  const { name, email, role } = req.body

  if (!name || !email || !role) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, and role.' })
  }

  try {
    // Check if user already exists across the entire platform
    const existingUser = await User.findOne({ email: email.toLowerCase() })

    if (existingUser) {
      if (existingUser.companyId.toString() === req.tenantId.toString()) {
        return res.status(400).json({ success: false, message: 'User is already in your team.' })
      }
      return res.status(400).json({ success: false, message: 'User is already registered with another company.' })
    }

    // Create user (No password needed yet, they will use SSO or we can generate a random one for DB constraint)
    const randomPassword = Math.random().toString(36).slice(-12) + 'Aa1!'

    const user = await User.create({
      companyId: req.tenantId,
      name,
      email: email.toLowerCase(),
      password: randomPassword, // Not used if Clerk is the auth provider
      role
    })

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'User invited successfully. They can now log in using this email.'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error inviting user',
      error: error.message
    })
  }
}

// @desc    Update a user's role
// @route   PUT /api/users/:id
// @access  Private (company_admin)
const updateUserRole = async (req, res) => {
  const { role } = req.body

  if (!role) {
    return res.status(400).json({ success: false, message: 'Please provide a role.' })
  }

  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    // Ensure the user belongs to this company
    if (user.companyId.toString() !== req.tenantId.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to edit this user.' })
    }

    // Prevent removing your own admin rights by accident
    if (req.user.id === user._id.toString() && role !== 'company_admin') {
      return res.status(400).json({ success: false, message: 'You cannot remove your own admin rights.' })
    }

    user.role = role
    await user.save()

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'User role updated successfully.'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error updating user role',
      error: error.message
    })
  }
}

// @desc    Remove a user from the company
// @route   DELETE /api/users/:id
// @access  Private (company_admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    if (user.companyId.toString() !== req.tenantId.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this user.' })
    }

    if (req.user.id === user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself.' })
    }

    await user.deleteOne()

    res.status(200).json({
      success: true,
      message: 'User removed from team.'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error deleting user',
      error: error.message
    })
  }
}

module.exports = {
  getUsers,
  inviteUser,
  updateUserRole,
  deleteUser
}
