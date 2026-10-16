const mongoose = require('mongoose')

const BidSchema = new mongoose.Schema({
  shipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
    // Optional because mock bids won't have it
  },
  carrierName: {
    type: String,
    required: true
  },
  carrierRating: {
    type: Number,
    required: true
  },
  bidAmount: {
    type: Number,
    required: true
  },
  estimatedDelivery: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Bid', BidSchema)
