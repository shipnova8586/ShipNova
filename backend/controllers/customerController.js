const Customer = require('../models/Customer')

// @desc    Get all customers for the company
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ companyId: req.tenantId })
    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving customers.',
      error: error.message
    })
  }
}

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, companyId: req.tenantId })

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found or unauthorized.'
      })
    }

    res.status(200).json({
      success: true,
      data: customer
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving customer.',
      error: error.message
    })
  }
}

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res) => {
  try {
    // Inject companyId from token middleware
    req.body.companyId = req.tenantId

    const email = req.body.email ? req.body.email.toLowerCase().trim() : ''
    const phone = req.body.phone ? req.body.phone.trim() : ''

    if (email || phone) {
      const orConditions = []
      if (email) orConditions.push({ email })
      if (phone) orConditions.push({ phone })

      const existingCustomer = await Customer.findOne({
        companyId: req.tenantId,
        $or: orConditions
      })

      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: `A customer with this ${existingCustomer.phone === phone ? 'phone number' : 'email address'} already exists.`
        })
      }
    }

    if (email) req.body.email = email
    if (phone) req.body.phone = phone

    const customer = await Customer.create(req.body)

    res.status(201).json({
      success: true,
      data: customer
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating customer.',
      error: error.message
    })
  }
}

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res) => {
  try {
    let customer = await Customer.findOne({ _id: req.params.id, companyId: req.tenantId })

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found or unauthorized.'
      })
    }

    const email = req.body.email ? req.body.email.toLowerCase().trim() : null
    const phone = req.body.phone ? req.body.phone.trim() : null

    if (email || phone) {
      const orConditions = []
      if (email) orConditions.push({ email })
      if (phone) orConditions.push({ phone })

      const duplicate = await Customer.findOne({
        companyId: req.tenantId,
        _id: { $ne: req.params.id },
        $or: orConditions
      })

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Another customer with this ${duplicate.phone === phone ? 'phone number' : 'email address'} already exists.`
        })
      }
    }

    if (email) req.body.email = email
    if (phone) req.body.phone = phone

    customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    res.status(200).json({
      success: true,
      data: customer
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating customer.',
      error: error.message
    })
  }
}

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, companyId: req.tenantId })

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found or unauthorized.'
      })
    }

    await Customer.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully.'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting customer.',
      error: error.message
    })
  }
}

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
}
