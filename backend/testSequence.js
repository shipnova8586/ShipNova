require('dotenv').config()
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

async function testEmailSequence () {
  try {
    const TARGET_EMAIL = 'shipnova8586@gmail.com'
    const clientEmail = 'clgggang1221@gmail.com'

    console.log('Sending first email...')
    const mailOptions = {
      from: `ShipNova Website <${process.env.EMAIL_USER}>`,
      to: TARGET_EMAIL,
      subject: 'Test - New Quote Request',
      attachments: [{
        filename: 'logo.png',
        path: 'D:/ShipNova/backend/logo.png',
        cid: 'shipnovalogo'
      }],
      html: '<h1>Admin Notification</h1>'
    }
    await transporter.sendMail(mailOptions)
    console.log('First email sent.')

    console.log('Sending second email...')
    const clientMailOptions = {
      from: `ShipNova <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: 'Test - Quote Request Received',
      attachments: [{
        filename: 'logo.png',
        path: 'D:/ShipNova/backend/logo.png',
        cid: 'shipnovalogo'
      }],
      html: '<h1>Client Auto-Responder</h1>'
    }
    await transporter.sendMail(clientMailOptions)
    console.log('Second email sent.')
  } catch (error) {
    console.error('Error sending email sequence:', error)
  }
}

testEmailSequence()
