const express = require('express')
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  addMaintenanceLog
} = require('../controllers/vehicleController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router.use(protect)

router
  .route('/')
  .get(getVehicles)
  .post(authorize('company_admin', 'manager'), createVehicle)

router
  .route('/:id')
  .get(getVehicle)
  .put(authorize('company_admin', 'manager'), updateVehicle)
  .delete(authorize('company_admin', 'manager'), deleteVehicle)

router
  .route('/:id/maintenance')
  .post(authorize('company_admin', 'manager'), addMaintenanceLog)

module.exports = router
