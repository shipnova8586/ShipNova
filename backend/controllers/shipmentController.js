const Shipment = require('../models/Shipment')
const generateInvoice = require('../utils/generateInvoice')
const sendEmail = require('../utils/sendEmail')

// Generate unique tracking number: SN-YYYYMMDD-XXXX
const generateTrackingNumber = () => {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const randomStr = Math.floor(1000 + Math.random() * 9000) // 4 digit random number
  return `SN-${dateStr}-${randomStr}`
}

// Helper to calculate 20% commission for internal drivers
const calculateInternalDriverCommission = (weight, type) => {
  const actualWeight = Math.max(Number(weight) || 1, 1) // Minimum 1 kg
  let rate = 10 // Standard
  if (type === 'Express') rate = 25
  if (type === 'Overnight') rate = 50
  return actualWeight * rate * 0.20 // 20%
}

// @desc    Get all shipments for the company
// @route   GET /api/shipments
// @access  Private
const getShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find({ companyId: req.tenantId })
      .populate('customerId', 'name phone email')
      .populate('driverId', 'name phone')
      .populate('vehicleId', 'vehicleNumber type')

    res.status(200).json({
      success: true,
      count: shipments.length,
      data: shipments
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving shipments.',
      error: error.message
    })
  }
}

// @desc    Get single shipment
// @route   GET /api/shipments/:id
// @access  Private
const getShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ _id: req.params.id, companyId: req.tenantId })
      .populate('customerId', 'name phone email address')
      .populate('driverId', 'name phone licenseNumber')
      .populate('vehicleId', 'vehicleNumber type capacity')

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found or unauthorized.'
      })
    }

    res.status(200).json({
      success: true,
      data: shipment
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving shipment details.',
      error: error.message
    })
  }
}

// @desc    Create new shipment
// @route   POST /api/shipments
// @access  Private
const createShipment = async (req, res) => {
  try {
    req.body.companyId = req.tenantId
    req.body.trackingNumber = generateTrackingNumber()

    // Set initial status based on driver assignment
    if (req.body.driverId) {
      req.body.status = 'Assigned'
      // If it's an internal assignment (not public), calculate 20% commission
      if (!req.body.isPublic) {
        req.body.revenue = calculateInternalDriverCommission(req.body.weight, req.body.shipmentType)
      }
    } else {
      req.body.status = 'Pending'
    }

    const shipment = await Shipment.create(req.body)

    // If driver was assigned upon creation, send Assigned email
    if (shipment.status === 'Assigned') {
      Shipment.findById(shipment._id).populate('customerId').then(populatedShipment => {
        if (populatedShipment && populatedShipment.customerId && populatedShipment.customerId.email) {
          sendEmail({
            to: populatedShipment.customerId.email,
            subject: 'Shipment Assigned - ShipNova',
            type: 'ASSIGNED',
            shipment: populatedShipment
          }).catch(err => console.error('Failed to send Assigned email on create:', err))
        }
      }).catch(err => console.error('Failed to populate customer on create:', err))
    }

    res.status(201).json({
      success: true,
      data: shipment
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating shipment.',
      error: error.message
    })
  }
}

// @desc    Update shipment
// @route   PUT /api/shipments/:id
// @access  Private
const updateShipment = async (req, res) => {
  try {
    let shipment = await Shipment.findOne({ _id: req.params.id, companyId: req.tenantId }).populate('customerId')

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found or unauthorized.'
      })
    }

    const wasNotDelivered = shipment.status !== 'Delivered'
    const isNowDelivered = req.body.status === 'Delivered'
    const wasNotAssigned = shipment.status !== 'Assigned'
    const isNowAssigned = req.body.status === 'Assigned'

    // Auto-update status if driver is assigned for the first time and status was 'Pending'
    if (req.body.driverId && shipment.status === 'Pending') {
      req.body.status = 'Assigned'
    }

    // Calculate commission for internal driver if assigned
    if (req.body.driverId && req.body.isPublic === false) {
      const weight = req.body.weight || shipment.weight
      const type = req.body.shipmentType || shipment.shipmentType
      req.body.revenue = calculateInternalDriverCommission(weight, type)
    }

    shipment = await Shipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('customerId') // Re-populate for invoice

    // Trigger Assigned Email
    if (wasNotAssigned && (isNowAssigned || req.body.status === 'Assigned') && shipment.customerId && shipment.customerId.email) {
      sendEmail({
        to: shipment.customerId.email,
        subject: 'Shipment Assigned - ShipNova',
        type: 'ASSIGNED',
        shipment
      }).catch(err => console.error('Failed to send Assigned email:', err))
    }

    // Trigger Real-time WebSocket event to Driver
    if (shipment.driverId) {
      const io = req.app.get('io')
      if (io) {
        io.to(shipment.driverId.toString()).emit('tripAssigned', {
          shipmentId: shipment._id,
          trackingNumber: shipment.trackingNumber,
          message: `New trip assigned: ${shipment.trackingNumber}`
        })
      }
    }

    // Trigger Invoice Email if status just changed to Delivered
    if (wasNotDelivered && isNowDelivered && shipment.customerId && shipment.customerId.email) {
      // Async trigger, don't block the API response
      generateInvoice(shipment)
        .then(pdfBuffer => {
          const invoiceNum = 'INV-' + shipment.trackingNumber.slice(-6).toUpperCase()
          sendEmail({
            to: shipment.customerId.email,
            subject: `Invoice ${invoiceNum} from ShipNova`,
            type: 'DELIVERED',
            shipment,
            invoiceNum,
            pdfBuffer
          })
        })
        .catch(err => console.error('Failed to generate or send invoice:', err))
    }

    res.status(200).json({
      success: true,
      data: shipment
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating shipment.',
      error: error.message
    })
  }
}

// @desc    Delete shipment
// @route   DELETE /api/shipments/:id
// @access  Private
const deleteShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ _id: req.params.id, companyId: req.tenantId })

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found or unauthorized.'
      })
    }

    await Shipment.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Shipment deleted successfully.'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting shipment.',
      error: error.message
    })
  }
}

// @desc    Track shipment publicly by Tracking Number
// @route   GET /api/shipments/track/:trackingNumber
// @access  Public
const trackShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingNumber: req.params.trackingNumber })
      .select('-companyId') // Exclude internal IDs for public safety
      .populate({
        path: 'companyId',
        select: 'name email phone logo'
      })
      .populate('driverId', 'name phone')
      .populate('vehicleId', 'vehicleNumber type')

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'No shipment found with this tracking number.'
      })
    }

    res.status(200).json({
      success: true,
      data: shipment
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error tracking shipment.',
      error: error.message
    })
  }
}

// @desc    Download PDF invoice for a shipment
// @route   GET /api/shipments/:id/invoice
// @access  Private
const downloadInvoice = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ _id: req.params.id, companyId: req.tenantId }).populate('customerId')

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found or unauthorized.'
      })
    }

    if (shipment.status !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Invoice is only available for delivered shipments.'
      })
    }

    const pdfBuffer = await generateInvoice(shipment)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="INV-${shipment.trackingNumber.slice(-6).toUpperCase()}.pdf"`,
      'Content-Length': pdfBuffer.length
    })

    res.send(pdfBuffer)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error generating invoice.',
      error: error.message
    })
  }
}

module.exports = {
  getShipments,
  getShipment,
  createShipment,
  updateShipment,
  deleteShipment,
  trackShipment,
  downloadInvoice
}
