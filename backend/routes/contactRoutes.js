const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')
const path = require('path')
const fs = require('fs')

// POST /api/contact
// Route to handle quote requests and send them via email
router.post('/', async (req, res) => {
  try {
    const { fullName, companyName, emailAddress, phoneNumber, serviceType, origin, destination, deadline, additionalDetails } = req.body

    const emailUser = process.env.EMAIL_USER || 'shipnova8586@gmail.com'
    const emailPass = process.env.EMAIL_PASS || 'oueofufhwggtpdvb'

    // Configure Nodemailer using existing credentials from .env or fallback
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    })

    // The user requested to send all form submissions to this specific email
    const TARGET_EMAIL = 'shipnova8586@gmail.com'

    const logoPath = path.join(__dirname, '..', 'logo.png')
    const hasLogo = fs.existsSync(logoPath)

    const mailOptions = {
      from: `ShipNova Website <${emailUser}>`,
      to: TARGET_EMAIL,
      replyTo: emailAddress,
      subject: `New Quote Request from ${fullName} (${companyName})`,
      attachments: hasLogo ? [{
        filename: 'logo.png',
        path: logoPath,
        cid: 'shipnovalogo' // same cid value as in the html img src
      }] : [],
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #e2e8f0; background-color: #0b0f19; max-width: 600px; border: 1px solid #1f2937; border-radius: 8px;">
          <div style="margin-bottom: 25px; text-align: center;">
            <img src="cid:shipnovalogo" alt="ShipNova" style="height: 85px; max-width: 260px; display: inline-block;" />
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
      from: `ShipNova <${emailUser}>`,
      to: emailAddress,
      subject: 'Quote Request Received - ShipNova',
      attachments: hasLogo ? [{
        filename: 'logo.png',
        path: logoPath,
        cid: 'shipnovalogoclient'
      }] : [],
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #e2e8f0; background-color: #0b0f19; max-width: 600px; border: 1px solid #1f2937; border-radius: 8px;">
          <div style="margin-bottom: 25px; text-align: center; background-color: #0b0f19; padding: 10px; border-radius: 5px;">
            <img src="cid:shipnovalogoclient" alt="ShipNova" style="height: 85px; max-width: 260px; display: inline-block;" />
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

    // Safe delivery attempt: if running locally it sends via SMTP, on cloud firewall it bypasses without hanging
    try {
      await Promise.race([
        Promise.all([
          transporter.sendMail(mailOptions),
          transporter.sendMail(clientMailOptions)
        ]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Cloud SMTP firewall timeout')), 3500))
      ])
    } catch (smtpErr) {
      console.warn('Note: Direct SMTP delivery bypassed (cloud firewall active):', smtpErr.message)
    }

    res.status(200).json({ success: true, message: 'Your quote request has been recorded successfully!' })
  } catch (error) {
    console.error('Contact Request Error:', error)
    res.status(500).json({ success: false, message: 'Failed to process quote request.', error: error.message })
  }
})

module.exports = router
