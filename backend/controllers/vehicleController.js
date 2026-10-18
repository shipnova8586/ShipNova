const Vehicle = require('../models/Vehicle')

// @desc    Get all vehicles for the company
// @route   GET /api/vehicles
// @access  Private
const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ companyId: req.tenantId }).populate('driverId', 'name phone licenseNumber status')
    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving vehicles.',
      error: error.message
    })
  }
}

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
const getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, companyId: req.tenantId }).populate('driverId', 'name phone licenseNumber status')

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found or unauthorized.'
      })
    }

    res.status(200).json({
      success: true,
      data: vehicle
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving vehicle.',
      error: error.message
    })
  }
}

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private
const createVehicle = async (req, res) => {
  try {
    req.body.companyId = req.tenantId

    const vehicleNumber = req.body.vehicleNumber ? req.body.vehicleNumber.trim().toUpperCase() : ''

    if (vehicleNumber) {
      const existingVehicle = await Vehicle.findOne({
        companyId: req.tenantId,
        vehicleNumber
      })

      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: `Vehicle with registration number "${vehicleNumber}" already exists in your fleet.`
        })
      }
      req.body.vehicleNumber = vehicleNumber
    }

    // Handle empty driverId
    if (req.body.driverId === '') {
      req.body.driverId = null
    }

    const vehicle = await Vehicle.create(req.body)

    res.status(201).json({
      success: true,
      data: vehicle
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating vehicle.',
      error: error.message
    })
  }
}

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = async (req, res) => {
  try {
    let vehicle = await Vehicle.findOne({ _id: req.params.id, companyId: req.tenantId })

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found or unauthorized.'
      })
    }

    // Handle empty driverId
    if (req.body.driverId === '') {
      req.body.driverId = null
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    res.status(200).json({
      success: true,
      data: vehicle
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating vehicle.',
      error: error.message
    })
  }
}

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, companyId: req.tenantId })

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found or unauthorized.'
      })
    }

    await Vehicle.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully.'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting vehicle.',
      error: error.message
    })
  }
}

// @desc    Add maintenance log
// @route   POST /api/vehicles/:id/maintenance
// @access  Private
const addMaintenanceLog = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, companyId: req.tenantId })

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found or unauthorized.'
      })
    }

    vehicle.maintenanceLogs.push(req.body)
    await vehicle.save()

    res.status(200).json({
      success: true,
      data: vehicle
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error adding maintenance log.',
      error: error.message
    })
  }
}

module.exports = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  addMaintenanceLog
}
