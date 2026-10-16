require('dotenv').config()
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

async function testEmail () {
  try {
    const info = await transporter.sendMail({
      from: `ShipNova <${process.env.EMAIL_USER}>`,
      to: 'clgggang1221@gmail.com', // Replace with the user's test email if needed
      subject: 'Quote Request Received - ShipNova',
      text: 'Test auto-responder email.'
    })
    console.log('Email sent successfully:', info.messageId)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

testEmail()
