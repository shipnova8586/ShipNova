const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Shipment = require('./models/Shipment')
const Driver = require('./models/Driver')
const Vehicle = require('./models/Vehicle')

dotenv.config({ path: './.env' })

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB Connected...')

    // 1. Seed Shipments with Revenue and Carrier Data
    const shipments = await Shipment.find()
    const carriers = ['FedEx Freight', 'XPO Logistics', 'Swift Transportation', 'J.B. Hunt', 'Knight-Swift']

    let updatedShipments = 0
    for (const shipment of shipments) {
      if (!shipment.revenue || shipment.revenue === 0) {
        // Mock revenue based on weight + random factor
        const mockRevenue = Math.floor((shipment.weight * 2.5) + (Math.random() * 500) + 100)
        shipment.revenue = mockRevenue

        // Randomly assign a carrier to 60% of shipments to simulate network usage
        if (Math.random() > 0.4) {
          shipment.carrierName = carriers[Math.floor(Math.random() * carriers.length)]
        }

        await shipment.save()
        updatedShipments++
      }
    }
    console.log(`Updated ${updatedShipments} shipments with revenue & carrier data.`)

    // 2. Seed Drivers with Advanced Stats
    const drivers = await Driver.find()
    let updatedDrivers = 0
    const locations = ['New York, NY', 'Chicago, IL', 'Los Angeles, CA', 'Dallas, TX', 'Miami, FL']
    const statuses = ['Available', 'On Duty', 'Off Duty']

    for (const driver of drivers) {
      if (driver.rating === 5 || driver.location === 'HQ') { // If still default
        driver.rating = (Math.random() * (5.0 - 3.8) + 3.8).toFixed(1) // Random rating between 3.8 and 5.0
        driver.location = locations[Math.floor(Math.random() * locations.length)]
        driver.currentStatus = statuses[Math.floor(Math.random() * statuses.length)]
        await driver.save()
        updatedDrivers++
      }
    }
    console.log(`Updated ${updatedDrivers} drivers with advanced stats.`)

    // 3. Seed Vehicles with Mileage and Maintenance
    const vehicles = await Vehicle.find()
    let updatedVehicles = 0
    const vStatuses = ['Active', 'Active', 'Active', 'Maintenance', 'Out of Service']

    for (const vehicle of vehicles) {
      if (vehicle.mileage === 0) {
        vehicle.mileage = Math.floor(Math.random() * 150000) + 10000
        vehicle.status = vStatuses[Math.floor(Math.random() * vStatuses.length)]

        // Add random maintenance log
        if (Math.random() > 0.5) {
          vehicle.maintenanceLogs.push({
            date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
            description: 'Routine Oil Change & Brake Inspection',
            cost: Math.floor(Math.random() * 1500) + 200
          })
        }
        await vehicle.save()
        updatedVehicles++
      }
    }
    console.log(`Updated ${updatedVehicles} vehicles with maintenance & mileage data.`)

    console.log('Seeding Complete!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding data:', error)
    process.exit(1)
  }
}

seedData()
