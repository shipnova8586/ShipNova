const express = require('express')
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

// Apply protect middleware to all routes
router.use(protect)

router
  .route('/')
  .get(getCustomers)
  .post(authorize('company_admin', 'manager'), createCustomer)

router
  .route('/:id')
  .get(getCustomer)
  .put(authorize('company_admin', 'manager'), updateCustomer)
  .delete(authorize('company_admin', 'manager'), deleteCustomer)

module.exports = router
