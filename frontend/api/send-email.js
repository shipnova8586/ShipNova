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
    const { to, subject, type, shipment, invoiceNum, pdfBase64 } = req.body;

    if (!to || !shipment) {
      return res.status(400).json({ success: false, message: 'Missing required fields (to, shipment)' });
    }

    const emailUser = process.env.EMAIL_USER || 'shipnova8586@gmail.com';
    const emailPass = process.env.EMAIL_PASS || 'oueofufhwggtpdvb';

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const trackingUrl = `https://shipnova-logistics.vercel.app/track?tracking=${shipment.trackingNumber}`;
    const customerName = shipment.customerId ? shipment.customerId.name : 'Valued Customer';
    const logoUrl = 'https://shipnova-logistics.vercel.app/logo.png';

    const htmlTemplate = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #f3f4f6;">
        
        <!-- Header with Logo -->
        <div style="background-color: #0b1120; padding: 25px 20px; text-align: center;">
          <img src="${logoUrl}" alt="ShipNova" width="236" height="48" style="height: 48px; width: 236px; max-width: 100%; object-fit: contain;" />
        </div>

        <!-- Body Content -->
        <div style="padding: 30px 20px;">
          <h2 style="color: #1f2937; font-size: 20px; margin-top: 0;">Hello ${customerName},</h2>
          
          ${type === 'ASSIGNED'
            ? `<p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Great news! Your shipment <strong>${shipment.trackingNumber}</strong> has been registered and a delivery courier has been assigned. We are now processing it for delivery.</p>`
            : `<p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Your shipment <strong>${shipment.trackingNumber}</strong> has been successfully delivered! Please find your invoice <strong>${invoiceNum || ('INV-' + shipment.trackingNumber.slice(-6).toUpperCase())}</strong> attached to this email.</p>`
          }

          <!-- Shipment Summary Box -->
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #111827; font-size: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Shipment Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Tracking Number:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${shipment.trackingNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Current Status:</td>
                <td style="padding: 8px 0; color: #10b981; font-size: 14px; font-weight: 600;">✅ ${shipment.status || type}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service Type:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${shipment.shipmentType || 'Standard'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Weight:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${shipment.weight || 1} kg</td>
              </tr>
            </table>
          </div>

          <!-- Call to Action Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${trackingUrl}" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
              Track Your Shipment
            </a>
          </div>

          <p style="color: #6b7280; font-size: 15px; line-height: 1.5; margin-bottom: 0;">Thank you for choosing ShipNova for your logistics needs!</p>
        </div>

        <!-- Professional Footer -->
        <div style="background-color: #1f2937; padding: 25px 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">Need help with your shipment? Contact our 24/7 support at <a href="mailto:shipnova8586@gmail.com" style="color: #818cf8; text-decoration: none;">shipnova8586@gmail.com</a></p>
          <div style="margin-top: 15px;">
            <span style="color: #9ca3af; font-size: 12px; margin: 0 10px;">Facebook</span>
            <span style="color: #9ca3af; font-size: 12px; margin: 0 10px;">Twitter</span>
            <span style="color: #9ca3af; font-size: 12px; margin: 0 10px;">Instagram</span>
          </div>
          <p style="font-size: 12px; color: #6b7280; margin: 20px 0 0 0;">&copy; ${new Date().getFullYear()} ShipNova. All rights reserved.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"ShipNova Billing" <${emailUser}>`,
      to,
      subject: subject || (type === 'ASSIGNED' ? 'Shipment Assigned - ShipNova' : 'Invoice from ShipNova'),
      html: htmlTemplate,
      attachments: []
    };

    if (type === 'DELIVERED' && pdfBase64) {
      mailOptions.attachments.push({
        filename: `${invoiceNum || 'invoice'}.pdf`,
        content: Buffer.from(pdfBase64, 'base64'),
        contentType: 'application/pdf'
      });
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Serverless Email sent:', info.messageId);

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Serverless send error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
