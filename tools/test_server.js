const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join('.', urlPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200);
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('Not Found: ' + filePath);
  }
});

server.listen(3456, async () => {
  console.log('Test server started on port 3456');
  
  const testUrls = [
    'http://localhost:3456/index.html',
    'http://localhost:3456/data/projects.js',
    'http://localhost:3456/js/app.min.js',
    'http://localhost:3456/styles/streetwall.min.css',
    'http://localhost:3456/public/assets/renders/cloud-strife-chibi/11-cloud-studio-pass-04.jpg',
    'http://localhost:3456/public/assets/renders/character-mint/02-mint-front-rigged.jpg',
    'http://localhost:3456/public/assets/renders/motorcycle-series/01-kawasaki-zh2-painted.jpg'
  ];

  let passed = 0;
  for (const u of testUrls) {
    const res = await fetch(u);
    console.log(res.status === 200 ? '[200 OK]' : '[ERROR ' + res.status + ']', u);
    if (res.status === 200) passed++;
  }

  // Verify removed file returns 404
  const removedUrl = 'http://localhost:3456/public/assets/renders/cloud-strife-chibi/08-cloud-studio-pass-01.jpg';
  const resRemoved = await fetch(removedUrl);
  console.log(resRemoved.status === 404 ? '[PASS - CORRECTLY 404]' : '[FAIL]', removedUrl);

  server.close(() => {
    console.log(`Server test finished. Passed ${passed}/${testUrls.length}`);
    process.exit(0);
  });
});
