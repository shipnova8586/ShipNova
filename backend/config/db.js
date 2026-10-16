const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.warn(`MongoDB Atlas Connection failed (${error.message}). Trying local MongoDB...`)
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/shipnova')
      console.log(`Local MongoDB Connected: ${conn.connection.host}`)
    } catch (localErr) {
      console.error(`Local MongoDB Connection failed as well: ${localErr.message}`)
      console.log('Running backend without DB connection (mock mode)...')
    }
  }
}

module.exports = connectDB
