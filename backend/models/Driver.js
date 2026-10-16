const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const DriverSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
    // Optional for external carriers
  },
  role: {
    type: String,
    enum: ['company_driver', 'external_carrier'],
    default: 'company_driver'
  },
  username: {
    type: String,
    unique: true,
    sparse: true // Allows null/undefined to not conflict on unique index
  },
  password: {
    type: String,
    select: false // Don't return password by default
  },
  name: {
    type: String,
    required: [true, 'Please add driver name'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please add phone number']
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please add license number']
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  currentStatus: {
    type: String,
    enum: ['Available', 'On Duty', 'Off Duty'],
    default: 'Available'
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 1,
    max: 5
  },
  location: {
    type: String,
    default: 'HQ'
  },
  kycDocumentUrl: {
    type: String
    // Optional, used for external carriers to upload ID/documents
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  vehicleType: {
    type: String,
    enum: ['Any', 'Small Van', 'Heavy Truck', 'Flatbed', 'Refrigerated'],
    default: 'Any'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Encrypt password using bcrypt
DriverSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Match user entered password to hashed password in database
DriverSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false
  return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('Driver', DriverSchema)
