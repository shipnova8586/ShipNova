const mongoose = require('mongoose')

const ShipmentSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Shipment must belong to a company']
  },
  trackingNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Shipment must have a customer']
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  },
  senderName: {
    type: String,
    required: [true, 'Please add sender name']
  },
  receiverName: {
    type: String,
    required: [true, 'Please add receiver name']
  },
  pickupAddress: {
    type: String,
    required: [true, 'Please add pickup address']
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Please add delivery address']
  },
  weight: {
    type: Number,
    required: [true, 'Please add weight (in kg)']
  },
  shipmentType: {
    type: String,
    enum: ['Standard', 'Express', 'Overnight'],
    default: 'Standard'
  },
  status: {
    type: String,
    enum: [
      'Pending',
      'Assigned',
      'Picked Up',
      'In Transit',
      'Out For Delivery',
      'Delivered',
      'Cancelled'
    ],
    default: 'Pending'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  requiredVehicle: {
    type: String,
    enum: ['Any', 'Small Van', 'Heavy Truck', 'Flatbed', 'Refrigerated'],
    default: 'Any'
  },
  issueReported: {
    type: String,
    default: null
  },
  revenue: {
    type: Number,
    default: 0
  },
  carrierName: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Shipment', ShipmentSchema)
