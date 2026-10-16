require('dotenv').config()
const mongoose = require('mongoose')
const { createClerkClient } = require('@clerk/backend')
const User = require('./models/User')
const Company = require('./models/Company')

const wipeUsers = async () => {
  try {
    // 1. Clear MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    await User.deleteMany({})
    console.log('Cleared Users from MongoDB')

    await Company.deleteMany({})
    console.log('Cleared Companies from MongoDB')

    // 2. Clear Clerk
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

    const users = await clerk.users.getUserList()
    // Some versions return { data: [...] }
    const userArray = Array.isArray(users) ? users : users.data

    console.log(`Found ${userArray.length} users in Clerk. Deleting...`)

    for (const u of userArray) {
      await clerk.users.deleteUser(u.id)
      console.log(`Deleted Clerk user: ${u.emailAddresses?.[0]?.emailAddress || u.id}`)
    }

    console.log('All test users have been wiped successfully!')
    process.exit(0)
  } catch (err) {
    console.error('Error wiping users:', err)
    process.exit(1)
  }
}

wipeUsers()
