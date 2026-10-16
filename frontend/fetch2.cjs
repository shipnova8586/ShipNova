const https = require('https');
https.get('https://shipnova.com/contact', res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const urls = data.match(/https:\/\/cdn\.prod\.website-files\.com[^\s"']+\.(?:jpg|jpeg|webp|png)/ig);
    if(urls) {
      console.log([...new Set(urls)].join('\n'));
    }
  });
});
