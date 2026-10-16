const bcrypt = require('bcryptjs');

const hash = '$2a$10$spw90rOhr72O4OtEcsFbc.WHb02FwX0EWgXkkfjKjYIgzsqKswavy';
const commonPasswords = [
    'driver1', 'driver123', 'password', '123456', '12345678', 'admin', 'admin123', 'driver'
];

async function checkPasswords() {
    let found = false;
    for (const p of commonPasswords) {
        if (await bcrypt.compare(p, hash)) {
            console.log(`Match found! Password is: ${p}`);
            found = true;
            break;
        }
    }
    if (!found) {
        console.log("Password not found in common list. Let's update it to 'driver123' so the user can login.");
    }
}
checkPasswords();
