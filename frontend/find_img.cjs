const https = require('https');

https.get('https://shipnova.com/about', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // The HTML might be single line. Let's find "OUR STORY" or "Our Story"
    const index = data.toLowerCase().indexOf('our story');
    if (index === -1) {
      console.log('Text not found');
      return;
    }
    // Search for img tags in the surrounding 2000 characters
    const start = Math.max(0, index - 2000);
    const end = Math.min(data.length, index + 2000);
    const context = data.substring(start, end);
    const imgMatches = context.match(/src=["'](https:\/\/cdn\.prod\.website-files\.com[^"']+\.(jpg|jpeg|png|webp))["']/gi);
    console.log('Images near OUR STORY:');
    if (imgMatches) {
        imgMatches.forEach(m => console.log(m));
    }
  });
});
