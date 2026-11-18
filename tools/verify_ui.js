const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const re = /(?:href|src)="\.\/([^"?#]+)/g;
let m;
const refs = [];
while ((m = re.exec(html)) !== null) refs.push(m[1]);
const missing = refs.filter(p => !fs.existsSync(p));
console.log('Checked local HTML refs:', refs.length, '| Missing:', missing.length);
if (missing.length) {
  console.error('MISSING:', missing);
  process.exit(1);
}
console.log('Refs:', refs);

