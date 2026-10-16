const https = require('https')
const fs = require('fs')
const path = require('path')

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close(resolve)
      })
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err))
    })
  })
}

const run = async () => {
  try {
    if (!fs.existsSync('public')) fs.mkdirSync('public')
    // Sparkles
    await download('https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/2728.png', path.join(__dirname, 'public/sparkles.png'))
    console.log('Downloaded sparkles.png')
    // Palms up together
    await download('https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f932.png', path.join(__dirname, 'public/palms.png'))
    console.log('Downloaded palms.png')
  } catch (err) {
    console.error(err)
  }
}

run()
