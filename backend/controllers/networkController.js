const Shipment = require('../models/Shipment')
const Bid = require('../models/Bid')
const Driver = require('../models/Driver')

// @desc    Get all public shipments for the load board
// @route   GET /api/network/load-board
// @access  Private (Network Plan Only)
const getPublicShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find({ isPublic: true })
      .populate('companyId', 'name logo')
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, data: shipments })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

// @desc    Toggle shipment public status
// @route   PUT /api/network/shipments/:id/toggle-public
// @access  Private
const togglePublicStatus = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' })
    }

    // Ensure user owns this shipment
    if (shipment.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this shipment' })
    }

    shipment.isPublic = !shipment.isPublic
    await shipment.save()

    res.status(200).json({ success: true, data: shipment })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

// @desc    Get bids for a specific shipment
// @route   GET /api/network/shipments/:id/bids
// @access  Private
const getShipmentBids = async (req, res) => {
  try {
    const bids = await Bid.find({ shipmentId: req.params.id }).sort({ bidAmount: 1 })
    res.status(200).json({ success: true, data: bids })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

// @desc    Generate mock bids (for demonstration)
// @route   POST /api/network/shipments/:id/mock-bids
// @access  Private
const generateMockBids = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' })

    // Dummy carriers
    const mockCarriers = ['Swift Logistics', 'BlueDart Express', 'XPO Transport', 'Knight-Swift', 'FedEx Freight']

    // Generate 1-3 random bids
    const numBids = Math.floor(Math.random() * 3) + 1
    const basePrice = shipment.weight * 15 // Rough estimate base price

    const newBids = []
    for (let i = 0; i < numBids; i++) {
      const carrier = mockCarriers[Math.floor(Math.random() * mockCarriers.length)]
      const bidAmount = Math.floor(basePrice * (0.8 + Math.random() * 0.5)) // +/- 20%
      const rating = (3.5 + Math.random() * 1.5).toFixed(1)

      const bid = await Bid.create({
        shipmentId: shipment._id,
        carrierName: carrier,
        carrierRating: Number(rating),
        bidAmount,
        estimatedDelivery: `${Math.floor(Math.random() * 3) + 1} days`
      })
      newBids.push(bid)
    }

    res.status(201).json({ success: true, data: newBids, message: `${numBids} new bids generated!` })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

// @desc    Accept a bid
// @route   PUT /api/network/bids/:id/accept
// @access  Private
const acceptBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id)
    if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' })

    const shipment = await Shipment.findById(bid.shipmentId)

    // Mark bid as accepted, reject others
    await Bid.updateMany({ shipmentId: shipment._id }, { status: 'Rejected' })
    bid.status = 'Accepted'
    await bid.save()

    // Update shipment status
    shipment.status = 'Assigned'
    shipment.isPublic = false // Take it off the market
    shipment.carrierName = bid.carrierName
    shipment.revenue = bid.bidAmount
    if (bid.driverId) {
      shipment.driverId = bid.driverId
      // Auto-update external driver to On Duty
      await Driver.findByIdAndUpdate(bid.driverId, { currentStatus: 'On Duty' })
    }
    await shipment.save()

    // Emit real-time notification to the driver
    if (bid.driverId) {
      const io = req.app.get('io')
      if (io) {
        io.to(bid.driverId.toString()).emit('bidAccepted', {
          shipmentId: shipment._id,
          trackingNumber: shipment.trackingNumber,
          message: `Congratulations! You won the bid for ${shipment.trackingNumber}`
        })
      }
    }

    res.status(200).json({ success: true, message: `Bid from ${bid.carrierName} accepted!` })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

// @desc    Get all external carriers on the network
// @route   GET /api/network/carriers
// @access  Private (Admin/Manager)
const getExternalCarriers = async (req, res) => {
  try {
    const Driver = require('../models/Driver')
    const carriers = await Driver.find({ role: 'external_carrier' })
    res.status(200).json({ success: true, count: carriers.length, data: carriers })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

module.exports = {
  getPublicShipments,
  togglePublicStatus,
  getShipmentBids,
  generateMockBids,
  acceptBid,
  getExternalCarriers
}
