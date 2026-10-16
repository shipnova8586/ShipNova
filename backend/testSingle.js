require('dotenv').config()
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

async function testSingleEmail () {
  try {
    const emailAddress = 'clgggang1221@gmail.com'
    const fullName = 'Test User'
    const destination = 'Dubai'

    const clientMailOptions = {
      from: `ShipNova <${process.env.EMAIL_USER}>`,
      to: emailAddress,
      subject: 'Quote Request Received - ShipNova',
      attachments: [{
        filename: 'logo.png',
        path: 'D:/ShipNova/backend/logo.png',
        cid: 'shipnovalogo'
      }],
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #e2e8f0; background-color: #0b0f19; max-width: 600px; border: 1px solid #1f2937; border-radius: 8px;">
          <div style="margin-bottom: 25px; text-align: center;">
            <img src="cid:shipnovalogo" alt="ShipNova" style="height: 55px; display: inline-block;" />
          </div>
          <h2 style="color: #ffffff; margin-top: 0; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">Request Received</h2>
          
          <p style="font-size: 16px; line-height: 1.5; color: #ffffff;">Dear ${fullName},</p>
          <p style="font-size: 16px; line-height: 1.5; color: #e2e8f0;">Greetings from ShipNova!</p>
          <p style="font-size: 16px; line-height: 1.5; color: #e2e8f0;">
            Thank you for reaching out to us. We have successfully received your quote request for shipping to <strong>${destination}</strong>. 
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #e2e8f0;">
            Our expert team is currently reviewing your details and will contact you shortly with the best possible rates and shipping solutions.
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #e2e8f0; margin-top: 30px;">
            Best Regards,<br/>
            <strong>The ShipNova Team</strong>
          </p>
        </div>
      `
    }

    console.log('Sending email...')
    const info = await transporter.sendMail(clientMailOptions)
    console.log('Email sent:', info.messageId)
    console.log('Accepted by:', info.accepted)
    console.log('Rejected by:', info.rejected)
  } catch (error) {
    console.error('Error:', error)
  }
}

testSingleEmail()
