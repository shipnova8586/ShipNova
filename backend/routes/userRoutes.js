const express = require('express')
const {
  getUsers,
  inviteUser,
  updateUserRole,
  deleteUser
} = require('../controllers/userController')

const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

// All routes are protected and restricted to company_admin
router.use(protect)
router.use(authorize('company_admin'))

router
  .route('/')
  .get(getUsers)

router
  .route('/invite')
  .post(inviteUser)

router
  .route('/:id')
  .put(updateUserRole)
  .delete(deleteUser)

module.exports = router
