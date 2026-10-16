const fs = require('fs')

const svgContent = fs.readFileSync('D:/ShipNova/frontend/public/nav-brand.svg', 'utf-8')
const match = svgContent.match(/xlink:href="data:image\/png;base64,([^"]+)"/)

if (match && match[1]) {
  const base64Data = match[1]
  fs.writeFileSync('D:/ShipNova/backend/logo.png', Buffer.from(base64Data, 'base64'))
  console.log('Successfully extracted logo.png')
} else {
  console.log('Could not find base64 PNG in SVG.')
}
