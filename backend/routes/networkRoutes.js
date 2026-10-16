const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  getPublicShipments,
  togglePublicStatus,
  getShipmentBids,
  generateMockBids,
  acceptBid,
  getExternalCarriers
} = require('../controllers/networkController')

// All network routes require authentication
router.use(protect)

router.get('/load-board', getPublicShipments)
router.put('/shipments/:id/toggle-public', togglePublicStatus)
router.get('/shipments/:id/bids', getShipmentBids)
router.post('/shipments/:id/mock-bids', generateMockBids)
router.put('/bids/:id/accept', acceptBid)
router.get('/carriers', getExternalCarriers)

module.exports = router
