import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const {
      fullName,
      companyName,
      emailAddress,
      phoneNumber,
      serviceType,
      origin,
      destination,
      deadline,
      additionalDetails
    } = req.body;

    if (!fullName || !emailAddress) {
      return res.status(400).json({ success: false, message: 'Full name and email are required.' });
    }

    const emailUser = process.env.EMAIL_USER || 'shipnova8586@gmail.com';
    const emailPass = process.env.EMAIL_PASS || 'oueofufhwggtpdvb';
    const TARGET_EMAIL = 'shipnova8586@gmail.com';

    // Configure direct SSL SMTP transport (Port 465)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const logoUrl = 'https://shipnova-logistics.vercel.app/logo.png';

    // 1. Admin Email (Luxury Dark Theme with Logo)
    const mailOptions = {
      from: `"ShipNova Website" <${emailUser}>`,
      to: TARGET_EMAIL,
      replyTo: emailAddress,
      subject: `New Quote Request from ${fullName} (${companyName})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; color: #e2e8f0; background-color: #0b0f19; max-width: 620px; border: 1px solid #1f2937; border-radius: 12px; margin: 0 auto;">
          <div style="margin-bottom: 25px; text-align: center;">
            <img src="${logoUrl}" alt="ShipNova" style="height: 125px; max-width: 270px; width: auto; display: inline-block;" />
          </div>
          <h2 style="color: #ffffff; margin-top: 0; border-bottom: 2px solid #4f46e5; padding-bottom: 12px; font-size: 20px;">New Quote Request</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 15px;">
            <tr><td style="padding: 10px 15px 10px 0; border-bottom: 1px solid #1f2937; color: #ffffff; width: 140px;"><strong>Name:</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #1f2937; color: #ffffff;">${fullName}</td></tr>
            <tr><td style="padding: 10px 15px 10px 0; border-bottom: 1px solid #1f2937; color: #94a3b8;"><strong>Company:</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #1f2937; color: #ffffff;">${companyName}</td></tr>
            <tr><td style="padding: 10px 15px 10px 0; border-bottom: 1px solid #1f2937; color: #94a3b8;"><strong>Email:</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #1f2937; color: #38bdf8;"><a href="mailto:${emailAddress}" style="color: #38bdf8; text-decoration: none;">${emailAddress}</a></td></tr>
            <tr><td style="padding: 10px 15px 10px 0; border-bottom: 1px solid #1f2937; color: #94a3b8;"><strong>Phone:</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #1f2937; color: #ffffff;">${phoneNumber || 'N/A'}</td></tr>
            <tr><td style="padding: 10px 15px 10px 0; border-bottom: 1px solid #1f2937; color: #94a3b8;"><strong>Service Type:</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #1f2937; color: #ffffff;">${serviceType}</td></tr>
            <tr><td style="padding: 10px 15px 10px 0; border-bottom: 1px solid #1f2937; color: #94a3b8;"><strong>Origin:</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #1f2937; color: #ffffff;">${origin}</td></tr>
            <tr><td style="padding: 10px 15px 10px 0; border-bottom: 1px solid #1f2937; color: #94a3b8;"><strong>Destination:</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #1f2937; color: #ffffff;">${destination}</td></tr>
            <tr><td style="padding: 10px 15px 10px 0; border-bottom: 1px solid #1f2937; color: #94a3b8;"><strong>Deadline:</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #1f2937; color: #ffffff;">${deadline}</td></tr>
          </table>
          
          <h3 style="color: #ffffff; margin-top: 25px; font-size: 16px;">Additional Details:</h3>
          <div style="background-color: #111827; padding: 15px; border-radius: 8px; white-space: pre-wrap; word-break: break-word; border: 1px solid #1f2937; color: #e2e8f0; font-size: 14px;">
            ${additionalDetails || 'None provided.'}
          </div>
        </div>
      `
    };

    // 2. Client Auto-Responder Confirmation Receipt
    const clientMailOptions = {
      from: `"ShipNova Logistics" <${emailUser}>`,
      to: emailAddress,
      subject: 'Quote Request Received - ShipNova',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; color: #e2e8f0; background-color: #0b0f19; max-width: 620px; border: 1px solid #1f2937; border-radius: 12px; margin: 0 auto;">
          <div style="margin-bottom: 25px; text-align: center;">
            <img src="${logoUrl}" alt="ShipNova" style="height: 125px; max-width: 270px; width: auto; display: inline-block;" />
          </div>
          <h2 style="color: #ffffff; margin-top: 0; border-bottom: 2px solid #4f46e5; padding-bottom: 12px; font-size: 20px;">Request Received</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #ffffff;">Dear ${fullName},</p>
          <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">Greetings from ShipNova!</p>
          <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
            Thank you for reaching out to us. We have successfully received your quote request for freight shipping to <strong style="color: #ffffff;">${destination}</strong>. 
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
            Our expert logistics team is currently reviewing your shipment details and will contact you shortly with the best competitive rates and transit options.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #1f2937;">
            <p style="font-size: 15px; line-height: 1.5; color: #94a3b8; margin: 0;">
              Best Regards,<br/>
              <strong style="color: #ffffff;">The ShipNova Team</strong><br/>
              <span style="font-size: 13px; color: #64748b;">Next-Gen Logistics Operating System</span>
            </p>
          </div>
        </div>
      `
    };

    // Send both emails concurrently and await completion
    await Promise.all([
      transporter.sendMail(mailOptions),
      transporter.sendMail(clientMailOptions)
    ]);

    return res.status(200).json({
      success: true,
      message: 'Your quote request has been sent successfully! Our team will contact you shortly.'
    });
  } catch (error) {
    console.error('Serverless send error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send email.'
    });
  }
}
