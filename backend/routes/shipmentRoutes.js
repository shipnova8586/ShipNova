const express = require('express')
const {
  getShipments,
  getShipment,
  createShipment,
  updateShipment,
  deleteShipment,
  trackShipment,
  downloadInvoice
} = require('../controllers/shipmentController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

// Public route for tracking shipment (No auth required)
router.get('/track/:trackingNumber', trackShipment)

// Private routes below (Require authentication)
router.use(protect)

router
  .route('/')
  .get(getShipments)
  .post(authorize('company_admin', 'manager'), createShipment)

router.get('/:id/invoice', downloadInvoice)

router
  .route('/:id')
  .get(getShipment)
  .put(authorize('company_admin', 'manager', 'driver'), updateShipment) // Drivers can update status
  .delete(authorize('company_admin', 'manager'), deleteShipment)

module.exports = router
