const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
const path = require('path')
dotenv.config()

async function testEmail () {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    const logoPath = path.join(__dirname, 'logo.png')

    const mailOptions = {
      from: `ShipNova Website <${process.env.EMAIL_USER}>`,
      to: 'shipnova8586@gmail.com',
      subject: 'Test Email',
      attachments: [{
        filename: 'logo.png',
        path: logoPath,
        cid: 'shipnovalogo'
      }],
      html: '<h1>Test Email</h1>'
    }

    console.log('Sending mail...')
    const info = await transporter.sendMail(mailOptions)
    console.log('Success:', info)
  } catch (err) {
    console.error('Error sending mail:', err)
  }
}

testEmail()
