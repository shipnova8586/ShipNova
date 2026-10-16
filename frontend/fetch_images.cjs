const https = require('https');

https.get('https://shipnova.com/about', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/https:\/\/cdn\.prod\.website-files\.com[^"'\s]+\.(jpg|jpeg|png|webp)/g);
    console.log(matches ? [...new Set(matches)].join('\n') : 'No images found');
  });
}).on('error', (e) => {
  console.error(e);
});
