const https = require('https');
https.get('https://shipnova.com/contact', res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const cssMatch = data.match(/href="([^"]+\.css)"/);
    if(cssMatch) {
      console.log('CSS URL:', cssMatch[1]);
      // fetch the css
      https.get(cssMatch[1], cssRes => {
        let cssData = '';
        cssRes.on('data', d => cssData += d);
        cssRes.on('end', () => {
          const imgs = cssData.match(/url\(['"]?(https:\/\/[^'"\)]+\.(?:jpg|jpeg|png|webp))['"]?\)/ig);
          if(imgs) console.log(imgs);
          const other = cssData.match(/url\(['"]?(https:\/\/[^'"\)]+)['"]?\)/ig);
          if (other) {
            console.log("All URLs:");
            console.log(other);
          }
        });
      });
    } else {
      console.log('no css');
    }
  });
});
