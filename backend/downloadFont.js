const https = require('https')
const fs = require('fs')
const path = require('path')

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, dest).then(resolve).catch(reject)
      }
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
    await download('https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-Black.ttf', path.join(__dirname, 'public/Montserrat-Black.ttf'))
    console.log('Downloaded Montserrat-Black.ttf')
  } catch (err) {
    console.error(err)
  }
}

run()
