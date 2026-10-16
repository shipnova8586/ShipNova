const mongoose = require('mongoose')

const CustomerSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Customer must belong to a company']
  },
  name: {
    type: String,
    required: [true, 'Please add customer name'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please add phone number']
  },
  email: {
    type: String,
    required: [true, 'Please add an email address'],
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address'
    ]
  },
  address: {
    type: String,
    required: [true, 'Please add address']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Customer', CustomerSchema)
