const https = require('https');
https.get('https://shipnova.com/contact', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const urls = data.match(/https:\/\/[^\s"'()]+/g);
    if(urls) {
      const imgs = urls.filter(u => u.match(/\.(jpg|jpeg|png|webp)/i) || u.includes('unsplash'));
      console.log([...new Set(imgs)].join('\n'));
    }
  });
});
