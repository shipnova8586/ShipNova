const mongoose = require('mongoose')
const Company = require('./models/Company')
const User = require('./models/User')

mongoose.connect('mongodb://localhost:27017/shipnova').then(async () => {
  const companies = await Company.find({})
  console.log('Companies:', companies)

  const users = await User.find({}).populate('companyId')
  console.log('Users:', users.map(u => ({ email: u.email, role: u.role, companyPlan: u.companyId?.subscriptionPlan })))

  process.exit(0)
})
