const https = require('https');
https.get('https://shipnova.com/contact', res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const urls = data.match(/url\(['"]?(https:\/\/[^'"]+)['"]?\)/g);
    if(urls) {
      console.log([...new Set(urls)].join('\n'));
    } else {
      // maybe look for standard src attributes
      const srcs = data.match(/src=["'](https:\/\/[^"']+)["']/g);
      if(srcs) console.log([...new Set(srcs)].join('\n'));
    }
  });
});
