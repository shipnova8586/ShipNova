const mongoose = require('mongoose');

const uri = "mongodb+srv://shipnova:ShipNova85917386@shipnova.aqs7vo7.mongodb.net/shipnova?retryWrites=true&w=majority&appName=ShipNova";

async function checkDriver() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB!");

    const db = mongoose.connection.db;
    
    // List collections to find the right one
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name).join(', '));
    
    // Check drivers or users collection
    let user = await db.collection('drivers').findOne({ username: 'driver1' });
    if (!user) {
        user = await db.collection('users').findOne({ username: 'driver1' });
    }
    if (!user) {
        user = await db.collection('drivers').findOne({ email: 'driver1' });
    }
    if (!user) {
         // Let's just search all collections just in case
         console.log("driver1 not found in obvious fields. Checking all documents in 'drivers'...");
         const allDrivers = await db.collection('drivers').find({}).toArray();
         allDrivers.forEach(d => console.log(d));
    } else {
        console.log("Found user:", user);
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkDriver();
