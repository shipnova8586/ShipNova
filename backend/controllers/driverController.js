const Driver = require('../models/Driver')

// @desc    Get all drivers for the company
// @route   GET /api/drivers
// @access  Private
const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ companyId: req.tenantId })
    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving drivers.',
      error: error.message
    })
  }
}

// @desc    Get single driver
// @route   GET /api/drivers/:id
// @access  Private
const getDriver = async (req, res) => {
  try {
    const driver = await Driver.findOne({ _id: req.params.id, companyId: req.tenantId })

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found or unauthorized.'
      })
    }

    res.status(200).json({
      success: true,
      data: driver
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving driver.',
      error: error.message
    })
  }
}

// @desc    Create new driver
// @route   POST /api/drivers
// @access  Private
const createDriver = async (req, res) => {
  try {
    req.body.companyId = req.tenantId

    const phone = req.body.phone ? req.body.phone.trim() : ''
    const licenseNumber = req.body.licenseNumber ? req.body.licenseNumber.trim() : ''
    const username = req.body.username ? req.body.username.trim().toLowerCase() : ''

    if (username) {
      const existingUser = await Driver.findOne({ username })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: `Username "${username}" is already taken.`
        })
      }
    }

    if (phone || licenseNumber) {
      const orConditions = []
      if (phone) orConditions.push({ phone })
      if (licenseNumber) orConditions.push({ licenseNumber })

      const existingDriver = await Driver.findOne({
        companyId: req.tenantId,
        $or: orConditions
      })

      if (existingDriver) {
        return res.status(400).json({
          success: false,
          message: `A driver with this ${existingDriver.phone === phone ? 'phone number' : 'license number'} already exists in your fleet.`
        })
      }
    }

    const driver = await Driver.create(req.body)

    res.status(201).json({
      success: true,
      data: driver
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating driver.',
      error: error.message
    })
  }
}

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private
const updateDriver = async (req, res) => {
  try {
    let driver = await Driver.findOne({
      _id: req.params.id,
      $or: [{ companyId: req.tenantId }, { companyId: null }]
    })

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found or unauthorized.'
      })
    }

    if (!req.body.password || req.body.password.trim() === '') {
      delete req.body.password
    } else {
      const bcrypt = require('bcryptjs')
      const salt = await bcrypt.genSalt(10)
      req.body.password = await bcrypt.hash(req.body.password, salt)
    }

    driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    res.status(200).json({
      success: true,
      data: driver
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating driver.',
      error: error.message
    })
  }
}

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
// @access  Private
const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      _id: req.params.id,
      $or: [{ companyId: req.tenantId }, { companyId: null }]
    })

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found or unauthorized.'
      })
    }

    await Driver.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Driver deleted successfully.'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting driver.',
      error: error.message
    })
  }
}

// @desc    Verify external driver
// @route   PUT /api/drivers/:id/verify
// @access  Private
const verifyDriver = async (req, res) => {
  try {
    const driver = await Driver.findOne({ _id: req.params.id })

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found.'
      })
    }

    driver.isVerified = true
    await driver.save()

    res.status(200).json({
      success: true,
      message: 'Driver verified successfully.',
      data: driver
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error verifying driver.',
      error: error.message
    })
  }
}

module.exports = {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  verifyDriver
}
