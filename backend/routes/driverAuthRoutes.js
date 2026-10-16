const express = require('express')
const router = express.Router()
const { loginDriver, signupExternalCarrier, getMyTrips, updateTripStatus, getPublicLoads, placeBid, reportIssue, updateProfile, getProfile, updateMyStatus } = require('../controllers/driverAuthController')

router.post('/login', loginDriver)
router.post('/signup', signupExternalCarrier)
router.get('/my-trips', getMyTrips)
router.put('/trip-status/:id', updateTripStatus)
router.get('/public-loads', getPublicLoads)
router.post('/shipments/:id/bids', placeBid)
router.post('/shipments/:id/issue', reportIssue)
router.put('/profile', updateProfile)
router.get('/profile', getProfile)
router.put('/my-status', updateMyStatus)

module.exports = router
