const express = require('express')
const {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver
} = require('../controllers/driverController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router.use(protect)

router
  .route('/')
  .get(getDrivers)
  .post(authorize('company_admin', 'manager'), createDriver)

router
  .route('/:id')
  .get(getDriver)
  .put(authorize('company_admin', 'manager'), updateDriver)
  .delete(authorize('company_admin', 'manager'), deleteDriver)

const { verifyDriver } = require('../controllers/driverController')
router.put('/:id/verify', authorize('company_admin', 'manager'), verifyDriver)

module.exports = router
