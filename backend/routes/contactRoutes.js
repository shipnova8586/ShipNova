const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')

// POST /api/contact
// Route to handle quote requests and send them via email
router.post('/', async (req, res) => {
  try {
    const { fullName, companyName, emailAddress, phoneNumber, serviceType, origin, destination, deadline, additionalDetails } = req.body

    // Configure Nodemailer using existing credentials from .env
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    // The user requested to send all form submissions to this specific email
    const TARGET_EMAIL = 'shipnova8586@gmail.com'

    const mailOptions = {
      from: `ShipNova Website <${process.env.EMAIL_USER}>`,
      to: TARGET_EMAIL,
      replyTo: emailAddress,
      subject: `New Quote Request from ${fullName} (${companyName})`,
      attachments: [{
        filename: 'logo.png',
        path: 'D:/ShipNova/backend/logo.png',
        cid: 'shipnovalogo' // same cid value as in the html img src
      }],
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #e2e8f0; background-color: #0b0f19; max-width: 600px; border: 1px solid #1f2937; border-radius: 8px;">
          <div style="margin-bottom: 25px; text-align: center;">
            <img src="cid:shipnovalogo" alt="ShipNova" style="height: 55px; display: inline-block;" />
          </div>
          <h2 style="color: #ffffff; margin-top: 0; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">New Quote Request</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 15px;">
            <tr><td style="padding: 8px 15px 8px 0; border-bottom: 1px solid #1f2937; white-space: nowrap; width: 1%; color: #ffffff;"><strong>Name:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #1f2937;">${fullName}</td></tr>
            <tr><td style="padding: 8px 15px 8px 0; border-bottom: 1px solid #1f2937; white-space: nowrap; width: 1%; color: #ffffff;"><strong>Company:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #1f2937;">${companyName}</td></tr>
            <tr><td style="padding: 8px 15px 8px 0; border-bottom: 1px solid #1f2937; white-space: nowrap; width: 1%; color: #ffffff;"><strong>Email:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #1f2937;">${emailAddress}</td></tr>
            <tr><td style="padding: 8px 15px 8px 0; border-bottom: 1px solid #1f2937; white-space: nowrap; width: 1%; color: #ffffff;"><strong>Phone:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #1f2937;">${phoneNumber || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 15px 8px 0; border-bottom: 1px solid #1f2937; white-space: nowrap; width: 1%; color: #ffffff;"><strong>Service Type:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #1f2937;">${serviceType}</td></tr>
            <tr><td style="padding: 8px 15px 8px 0; border-bottom: 1px solid #1f2937; white-space: nowrap; width: 1%; color: #ffffff;"><strong>Origin:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #1f2937;">${origin}</td></tr>
            <tr><td style="padding: 8px 15px 8px 0; border-bottom: 1px solid #1f2937; white-space: nowrap; width: 1%; color: #ffffff;"><strong>Destination:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #1f2937;">${destination}</td></tr>
            <tr><td style="padding: 8px 15px 8px 0; border-bottom: 1px solid #1f2937; white-space: nowrap; width: 1%; color: #ffffff;"><strong>Deadline:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #1f2937;">${deadline}</td></tr>
          </table>
          
          <h3 style="color: #ffffff; margin-top: 30px;">Additional Details:</h3>
          <div style="background-color: #111827; padding: 15px; border-radius: 5px; white-space: pre-wrap; word-break: break-word; border: 1px solid #1f2937;">
            ${additionalDetails || 'None provided.'}
          </div>
        </div>
      `
    }

    // Auto-Responder Email for the Client
    const clientMailOptions = {
      from: `ShipNova <${process.env.EMAIL_USER}>`,
      to: emailAddress,
      subject: 'Quote Request Received - ShipNova',
      attachments: [{
        filename: 'logo.png',
        path: 'D:/ShipNova/backend/logo.png',
        cid: 'shipnovalogoclient'
      }],
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #e2e8f0; background-color: #0b0f19; max-width: 600px; border: 1px solid #1f2937; border-radius: 8px;">
          <div style="margin-bottom: 25px; text-align: center; background-color: #0b0f19; padding: 10px; border-radius: 5px;">
            <img src="cid:shipnovalogoclient" alt="ShipNova" style="height: 55px; display: inline-block;" />
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

    // Send both emails concurrently in the background without making the user wait
    Promise.all([
      transporter.sendMail(mailOptions),
      transporter.sendMail(clientMailOptions)
    ]).catch(error => {
      console.error('Background Email Send Error:', error)
    })

    // Respond immediately to the frontend to prevent any Axios timeouts
    res.status(200).json({ success: true, message: 'Your quote request has been sent successfully!' })
  } catch (error) {
    console.error('Request Error:', error)
    res.status(500).json({ success: false, message: 'Failed to process request. Please try again later.', error: error.message })
  }
})

module.exports = router
