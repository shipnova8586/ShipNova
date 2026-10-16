const express = require('express')
const { registerCompany, login, getMe, clerkSync, clerkRegisterCompany } = require('../controllers/authController')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.post('/register-company', registerCompany)
router.post('/login', login)
router.get('/me', protect, getMe)

// Clerk sync routes
router.post('/clerk-sync', clerkSync)
router.post('/clerk-register-company', clerkRegisterCompany)

module.exports = router
