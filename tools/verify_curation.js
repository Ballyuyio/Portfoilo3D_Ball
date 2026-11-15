const fs = require('fs');
const path = require('path');

console.log('=== VERIFICATION OF PORTFOLIO DATA INTEGRITY ===\n');

// 1. Parse data/projects.js
let code = fs.readFileSync('data/projects.js', 'utf8').trim().replace(/^window\.PORTFOLIO_DATA\s*=\s*/, '');
if (code.endsWith(';')) code = code.slice(0, -1);
const data = JSON.parse(code);

let totalProjects = data.projects.length;
let totalRenders = 0;
let totalWorkflow = 0;
let totalBA = 0;
let totalAnimations = 0;
let missingFiles = [];

data.projects.forEach(p => {
  // Check cover
  if (p.cover && p.cover.src) {
    const fPath = p.cover.src.replace(/^\.\//, '');
    if (!fs.existsSync(fPath)) {
      missingFiles.push(`Missing cover: [${p.slug}] ${p.cover.src}`);
    }
  }

  // Check renders
  (p.renders || []).forEach(r => {
    totalRenders++;
    const fPath = r.src.replace(/^\.\//, '');
    if (!fs.existsSync(fPath)) {
      missingFiles.push(`Missing render: [${p.slug}] ${r.src}`);
    }
    if (r.thumb) {
      const tPath = r.thumb.replace(/^\.\//, '');
      if (!fs.existsSync(tPath)) {
        missingFiles.push(`Missing render thumb: [${p.slug}] ${r.thumb}`);
      }
    }
  });

  // Check workflow
  (p.workflow || []).forEach(w => {
    totalWorkflow++;
    const fPath = w.src.replace(/^\.\//, '');
    if (!fs.existsSync(fPath)) {
      missingFiles.push(`Missing workflow: [${p.slug}] ${w.src}`);
    }
    if (w.thumb) {
      const tPath = w.thumb.replace(/^\.\//, '');
      if (!fs.existsSync(tPath)) {
        missingFiles.push(`Missing workflow thumb: [${p.slug}] ${w.thumb}`);
      }
    }
  });

  // Check beforeAfter
  (p.beforeAfter || []).forEach(ba => {
    totalBA++;
    const bPath = ba.beforeSrc.replace(/^\.\//, '');
    const aPath = ba.afterSrc.replace(/^\.\//, '');
    if (!fs.existsSync(bPath)) {
      missingFiles.push(`Missing BA before: [${p.slug}] ${ba.id} -> ${ba.beforeSrc}`);
    }
    if (!fs.existsSync(aPath)) {
      missingFiles.push(`Missing BA after: [${p.slug}] ${ba.id} -> ${ba.afterSrc}`);
    }
  });

  // Check animations
  (p.animations || []).forEach(a => {
    totalAnimations++;
    if (a.src) {
      const vPath = a.src.replace(/^\.\//, '');
      if (!fs.existsSync(vPath)) {
        missingFiles.push(`Missing video: [${p.slug}] ${a.src}`);
      }
    }
  });
});

console.log(`Projects: ${totalProjects}`);
console.log(`Renders: ${totalRenders}`);
console.log(`Workflow: ${totalWorkflow}`);
console.log(`Before/After Sliders: ${totalBA}`);
console.log(`Animations: ${totalAnimations}`);

if (missingFiles.length === 0) {
  console.log('\n[PASS] 0 missing files! All referenced assets exist on disk.');
} else {
  console.error(`\n[FAIL] Found ${missingFiles.length} missing files!`);
  missingFiles.slice(0, 10).forEach(m => console.error('  ', m));
}

// 2. Check public/assets directory stats
function getDirSize(dir) {
  let size = 0;
  let count = 0;
  if (!fs.existsSync(dir)) return { size: 0, count: 0 };
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      const sub = getDirSize(full);
      size += sub.size;
      count += sub.count;
    } else {
      size += stat.size;
      count++;
    }
  }
  return { size, count };
}

const currentAssets = getDirSize('public/assets');
const removedAssets = getDirSize('_removed');

console.log('\n=== DIRECTORY SIZE SUMMARY ===');
console.log(`public/assets: ${currentAssets.count} files, ${(currentAssets.size / (1024 * 1024)).toFixed(2)} MB`);
console.log(`_removed: ${removedAssets.count} files, ${(removedAssets.size / (1024 * 1024)).toFixed(2)} MB`);

// 3. Verify HTML and JS consistency
const html = fs.readFileSync('index.html', 'utf8');
const appJs = fs.readFileSync('js/app.js', 'utf8');
const appMinJs = fs.readFileSync('js/app.min.js', 'utf8');

console.log('\n=== STRING CONSISTENCY AUDIT ===');
console.log('HTML statRenders:', html.includes('<strong id="statRenders">119</strong>') ? 'OK (119)' : 'MISMATCH');
console.log('HTML heroBtnRenders:', html.includes('EXPLORE 119 RENDERS') ? 'OK' : 'MISMATCH');
console.log('HTML meta renders:', html.includes('119+ Final Renders') ? 'OK' : 'MISMATCH');
console.log('HTML meta workflow:', html.includes('53 Workflow Breakdowns') ? 'OK' : 'MISMATCH');
console.log('HTML workflow sub:', html.includes('53 ordered Maya') ? 'OK' : 'MISMATCH');
console.log('HTML workflow buttons:', html.includes('53 BREAKDOWNS') && /FEED\s*\(53\)/.test(html) ? 'OK' : 'MISMATCH');
console.log('app.js EN 119:', appJs.includes("heroBtnRenders: 'EXPLORE 119 RENDERS'") ? 'OK' : 'MISMATCH');
console.log('app.js TH 119:', appJs.includes("heroBtnRenders: 'ชมผลงานเรนเดอร์ (119)'") ? 'OK' : 'MISMATCH');
console.log('app.min.js EN 119:', appMinJs.includes('heroBtnRenders:"EXPLORE 119 RENDERS"') ? 'OK' : 'MISMATCH');
console.log('app.min.js TH 119:', appMinJs.includes('\\u0E23\\u0E4C (119)') ? 'OK' : 'MISMATCH');
