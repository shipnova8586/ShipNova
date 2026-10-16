const PDFDocument = require('pdfkit')
const path = require('path')

const generateInvoice = (shipment) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const buffers = []

      // Collect data chunks
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers)
        resolve(pdfData)
      })

      // --- PDF CONTENT ---

      // --- PDF CONTENT ---

      // Register Custom Fonts
      const customFontPath = path.join(__dirname, '../public/Montserrat-Black.ttf')
      if (require('fs').existsSync(customFontPath)) {
        doc.registerFont('Montserrat-Black', customFontPath)
      }

      // Header Background (Floating Banner - Sharp)
      // Box goes from x=50, y=40, width=doc.page.width-100, height=80
      doc.rect(50, 40, doc.page.width - 100, 80).fill('#0b1120')

      // Left: Logo (padded inside the box)
      const logoPath = path.join(__dirname, '../public/logo.png')
      doc.image(logoPath, 75, 62, { height: 35 })

      // Right: Quotes with Icons
      const sparklesPath = path.join(__dirname, '../public/sparkles.png')
      const palmsPath = path.join(__dirname, '../public/palms.png')

      const quoteFont = require('fs').existsSync(customFontPath) ? 'Montserrat-Black' : 'Helvetica-Bold'
      doc.fontSize(8).font(quoteFont)

      const text1 = 'IYKYK: Trust The Process'
      const text2 = "Trust The God's Plan"

      const maxWidth = doc.widthOfString(text1)

      // Align block to the right inside the banner (25px padding from the right edge of the banner)
      const rightMargin = doc.page.width - 75

      const startX = rightMargin - maxWidth
      const iconX = startX - 16 // slightly reduced gap for smaller icons

      // Quote 1
      doc.image(sparklesPath, iconX, 67, { height: 10 })
      doc.fillColor('#ffffff')
      doc.text(text1, startX, 68, { lineBreak: false })

      // Quote 2
      doc.image(palmsPath, iconX, 84, { height: 10 })
      doc.fillColor('#06b6d4')
      doc.text(text2, startX, 85, { lineBreak: false })

      // Invoice Number
      const invoiceNum = 'INV-' + shipment.trackingNumber.slice(-6).toUpperCase()

      // TAX INVOICE Title
      doc.fillColor('#000000').fontSize(16).font('Helvetica-Bold')
      doc.text('TAX INVOICE', 0, 135, { align: 'center', width: doc.page.width })

      // Separator Line below Title
      doc.moveTo(50, 158).lineTo(doc.page.width - 50, 158).lineWidth(1).strokeColor('#e5e7eb').stroke()

      // Reset text and stroke color for body
      doc.fillColor('#000000').strokeColor('#000000').fontSize(9)

      // --- 3 Column Layout Below Header ---
      const startY = 175 // Shifted down a bit more for breathing room after the line
      const col1Width = 160
      const col3Width = 170
      const col3X = 390

      // Column 1: Supplier Details
      let y1 = startY
      doc.font('Helvetica-Bold').text('Supplier Name: ', 50, y1, { continued: true, width: col1Width }).font('Helvetica').text('ShipNova Logistics')
      y1 = doc.y + 2
      doc.font('Helvetica-Bold').text('Address: ', 50, y1, { continued: true, width: col1Width }).font('Helvetica').text('123 Logistics Way, New York, NY 10001')
      y1 = doc.y + 2
      doc.font('Helvetica-Bold').text('Phone No.: ', 50, y1, { continued: true, width: col1Width }).font('Helvetica').text('9173848586')
      y1 = doc.y + 2
      doc.font('Helvetica-Bold').text('Website: ', 50, y1, { continued: true, width: col1Width }).font('Helvetica').text('shipnova.vercel.app')
      y1 = doc.y + 2
      doc.font('Helvetica-Bold').text('Email: ', 50, y1, { continued: true, width: col1Width }).font('Helvetica').text('shipnova8586@gmail.com', { link: 'mailto:shipnova8586@gmail.com' })
      y1 = doc.y

      // Column 2: Invoice Details
      const col2LabelX = 220
      const col2ValueX = 285

      // Not using doc.y here to keep it aligned to startY
      doc.font('Helvetica-Bold').text('Invoice No.', col2LabelX, startY)
      doc.font('Helvetica').text(`: ${invoiceNum}`, col2ValueX, startY)

      doc.font('Helvetica-Bold').text('Invoice Date', col2LabelX, startY + 15)
      doc.font('Helvetica').text(`: ${new Date().toLocaleDateString()}`, col2ValueX, startY + 15)

      doc.font('Helvetica-Bold').text('Tracking No.', col2LabelX, startY + 30)
      doc.font('Helvetica').text(`: ${shipment.trackingNumber}`, col2ValueX, startY + 30)

      // Column 3: Customer Details
      const customerName = shipment.customerId ? shipment.customerId.name : 'Walk-in Client'
      const customerAddress = shipment.customerId && shipment.customerId.address ? shipment.customerId.address : 'N/A'
      const customerPhone = shipment.customerId && shipment.customerId.phone ? shipment.customerId.phone : 'N/A'
      const customerPincode = 'N/A' // We can extract from address later if needed

      let y3 = startY
      doc.font('Helvetica-Bold').text('Customer Name: ', col3X, y3, { continued: true, width: col3Width }).font('Helvetica').text(customerName)
      y3 = doc.y + 2
      doc.font('Helvetica-Bold').text('Billing/Shipping Address: ', col3X, y3, { continued: true, width: col3Width }).font('Helvetica').text(customerAddress)
      y3 = doc.y + 2
      doc.font('Helvetica-Bold').text('Customer Pincode: ', col3X, y3, { continued: true, width: col3Width }).font('Helvetica').text(customerPincode)
      y3 = doc.y + 2
      doc.font('Helvetica-Bold').text('Customer Phone No.: ', col3X, y3, { continued: true, width: col3Width }).font('Helvetica').text(customerPhone)
      y3 = doc.y

      // --- Modern Shipment Details Table ---
      const tableY = Math.max(y1, y3, 240) + 20

      // Draw Header Background (Soft Slate)
      doc.roundedRect(50, tableY, 512, 25, 4).fill('#f1f5f9')

      doc.fillColor('#334155').font('Helvetica-Bold').fontSize(10)
      doc.text('Description', 60, tableY + 8)
      doc.text('Weight', 350, tableY + 8)
      doc.text('Amount', 440, tableY + 8, { width: 112, align: 'right' })

      // Table Row
      const rowY = tableY + 35

      // Main Title (Bold)
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10)
      doc.text(`Logistics Service (${shipment.shipmentType})`, 60, rowY)

      // Subtitles (From/To in Gray)
      doc.fillColor('#64748b').font('Helvetica').fontSize(9)
      doc.text(`From: ${shipment.senderName} (${shipment.pickupAddress})`, 60, rowY + 14, { width: 270 })
      doc.text(`To: ${shipment.receiverName} (${shipment.deliveryAddress})`, 60, rowY + 26, { width: 270 })

      // Weight
      doc.fillColor('#334155').font('Helvetica').fontSize(10)
      doc.text(`${shipment.weight} kg`, 350, rowY)

      // Calculate Cost based on Service Type and Weight
      let ratePerKg = 10 // Standard Delivery
      if (shipment.shipmentType === 'Express') ratePerKg = 25
      else if (shipment.shipmentType === 'Overnight') ratePerKg = 50

      // Minimum charge is for 1 kg
      const billableWeight = Math.max(1, shipment.weight)
      const totalAmount = billableWeight * ratePerKg

      doc.text(`$${totalAmount.toFixed(2)}`, 440, rowY, { width: 112, align: 'right' })

      // Bottom Separator Line (Light Gray)
      const rowBottomY = Math.max(doc.y, rowY + 40) + 10
      doc.moveTo(50, rowBottomY).lineTo(562, rowBottomY).lineWidth(1).strokeColor('#e2e8f0').stroke()

      // --- Tax & Totals Section ---
      const totalsY = rowBottomY + 15
      const subTotal = totalAmount
      const cgst = subTotal * 0.09 // 9% CGST
      const sgst = subTotal * 0.09 // 9% SGST
      const grandTotal = subTotal + cgst + sgst

      doc.fillColor('#334155').font('Helvetica-Bold').fontSize(10)
      doc.text('Sub Total :', 340, totalsY, { width: 100, align: 'right' })
      doc.font('Helvetica').text(`$${subTotal.toFixed(2)}`, 450, totalsY, { width: 102, align: 'right' })

      doc.font('Helvetica-Bold').text('CGST :', 340, totalsY + 15, { width: 100, align: 'right' })
      doc.font('Helvetica').text(`$${cgst.toFixed(2)}`, 450, totalsY + 15, { width: 102, align: 'right' })

      doc.font('Helvetica-Bold').text('SGST :', 340, totalsY + 30, { width: 100, align: 'right' })
      doc.font('Helvetica').text(`$${sgst.toFixed(2)}`, 450, totalsY + 30, { width: 102, align: 'right' })

      // Highlight Box for Grand Total
      doc.roundedRect(330, totalsY + 45, 232, 25, 4).fill('#f8fafc')

      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12)
      doc.text('Grand Total :', 340, totalsY + 51, { width: 100, align: 'right' })

      // Cyan colored total amount
      doc.fillColor('#06b6d4').fontSize(14)
      doc.text(`$${grandTotal.toFixed(2)}`, 450, totalsY + 50, { width: 102, align: 'right' })

      // --- Terms & Conditions ---
      const termsY = totalsY + 85
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9)
      doc.text('Terms & Conditions:', 50, termsY)

      // Modern short accent underline
      const titleWidth = doc.widthOfString('Terms & Conditions:')
      doc.moveTo(50, termsY + 12).lineTo(50 + titleWidth, termsY + 12).lineWidth(1).strokeColor('#94a3b8').stroke()

      doc.font('Helvetica').fontSize(8).fillColor('#475569')
      const termsText =
        'a) Please retain this invoice for your records.\n' +
        'b) ShipNova Logistics is not liable for damages beyond the declared value.\n' +
        'c) All claims for loss or damage must be filed within 7 days of delivery.\n' +
        'd) For any queries, please reach out to us at shipnova8586@gmail.com'
      doc.text(termsText, 50, termsY + 18, { width: 350, lineGap: 2 })

      // --- Signatory ---
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000')
      doc.text('Invoicing Company', 400, termsY + 15, { width: 140, align: 'right' })
      doc.text('SHIPNOVA LOGISTICS', 400, termsY + 27, { width: 140, align: 'right' })
      doc.text('Authorized Signature', 400, termsY + 75, { width: 140, align: 'right' })

      // --- Footer Box ---
      const footerY = doc.page.height - 80

      // Computer generated message
      doc.font('Helvetica').fontSize(8).fillColor('#64748b')
      doc.text('This is a computer generated Invoice', 0, footerY - 15, { align: 'center', width: doc.page.width })

      // Bordered Box (Width = 512, centered roughly from x=50 to 562)
      doc.rect(50, footerY, 512, 30).lineWidth(1.5).strokeColor('#000000').stroke()
      // Center line divider
      doc.moveTo(doc.page.width / 2, footerY).lineTo(doc.page.width / 2, footerY + 30).lineWidth(1).stroke()

      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9)
      doc.text('Got questions?', 50, footerY + 10, { width: 256, align: 'center' })

      // Clickable Mailto Link with Underline (Black color as requested)
      doc.font('Helvetica').fillColor('#000000')
      doc.text('shipnova8586@gmail.com', doc.page.width / 2, footerY + 10, {
        width: 256,
        align: 'center',
        link: 'mailto:shipnova8586@gmail.com',
        underline: true
      })

      // Finalize PDF file
      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = generateInvoice
