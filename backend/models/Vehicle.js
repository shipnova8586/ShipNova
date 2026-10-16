const mongoose = require('mongoose')

const VehicleSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Vehicle must belong to a company']
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Please add vehicle number'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please add vehicle type'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Please add capacity (in kg/tons)']
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  status: {
    type: String,
    enum: ['Active', 'Maintenance', 'Out of Service'],
    default: 'Active'
  },
  mileage: {
    type: Number,
    default: 0
  },
  maintenanceLogs: [{
    date: { type: Date, default: Date.now },
    description: { type: String, required: true },
    cost: { type: Number, required: true }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Vehicle', VehicleSchema)
