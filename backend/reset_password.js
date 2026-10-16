const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = "mongodb+srv://shipnova:ShipNova85917386@shipnova.aqs7vo7.mongodb.net/shipnova?retryWrites=true&w=majority&appName=ShipNova";

async function resetPassword() {
  try {
    await mongoose.connect(uri);
    
    const db = mongoose.connection.db;
    const newPassword = 'driver123';
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    
    await db.collection('drivers').updateOne({ username: 'driver1' }, { $set: { password: newHash } });
    console.log(`Password reset to: ${newPassword}`);
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

resetPassword();
