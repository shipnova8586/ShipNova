const fs = require('fs')
const svg = fs.readFileSync('../frontend/public/nav-brand.svg', 'utf8')
const match = svg.match(/data:image\/png;base64,([^"']+)/)
if (match) {
  if (!fs.existsSync('public')) fs.mkdirSync('public')
  fs.writeFileSync('public/logo.png', Buffer.from(match[1], 'base64'))
  console.log('Saved logo.png')
} else {
  console.log('No match')
}
