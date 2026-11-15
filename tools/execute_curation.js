const fs = require('fs');
const path = require('path');

const candidatesToRemove = [
  // 1. cloud-strife-chibi (3 renders)
  'public/assets/renders/cloud-strife-chibi/08-cloud-studio-pass-01',
  'public/assets/renders/cloud-strife-chibi/09-cloud-studio-pass-02',
  'public/assets/renders/cloud-strife-chibi/10-cloud-studio-pass-03',
  // 2. motorcycle-series (1 render)
  'public/assets/renders/motorcycle-series/02-kawasaki-zh2-front',
  // 3. cozy-gamer-bedroom (1 render)
  'public/assets/renders/cozy-gamer-bedroom/03-gamer-bedroom-wip-pass',
  // 4. pokemon-collection (3 renders)
  'public/assets/renders/pokemon-collection/05-meowstic-front-plush',
  'public/assets/renders/pokemon-collection/06-meowstic-three-quarter',
  'public/assets/renders/pokemon-collection/02-reshiram-textured-alternate',
  // 5. bathroom-island-diorama (1 render)
  'public/assets/renders/bathroom-island-diorama/02-skibidi-prop-render',
  // 6. toji-fushiguro (1 render)
  'public/assets/renders/toji-fushiguro/06-toji-chibi-edition',
  // 7. character-wich (2 renders)
  'public/assets/renders/character-wich/02-wich-three-quarter',
  'public/assets/renders/character-wich/03-wich-side-hair',
  // 8. character-mint (1 render)
  'public/assets/renders/character-mint/01-mint-chibi-hero',
  // 9. product-scifi-props (3 renders + 1 workflow)
  'public/assets/renders/product-scifi-props/06-dinosaur-fossil-skeleton',
  'public/assets/renders/product-scifi-props/07-great-white-shark-head',
  'public/assets/renders/product-scifi-props/11-orange-tabby-cat-bright',
  'public/assets/workflow/product-scifi-props/03-shark-head-wireframe',
  // 10. stylized-character-showcase (2 renders)
  'public/assets/renders/stylized-character-showcase/04-kaiwa-chibi-side',
  'public/assets/renders/stylized-character-showcase/13-lego-robin-front',
  // 11. stylized-game-islands (1 render)
  'public/assets/renders/stylized-game-islands/08-cube-pet-trio-sky',
  // 12. roblox-prop-pack (1 render)
  'public/assets/renders/roblox-prop-pack/08-gold-link-chain-necklace',
  // 13. street-commerce-buildings (1 render)
  'public/assets/renders/street-commerce-buildings/04-magma-vein-shop-kiosk'
];

console.log('=== Step 3.1: Moving Files to _removed/ ===');
let movedCount = 0;
let movedBytes = 0;

candidatesToRemove.forEach(base => {
  const dir = path.dirname(base);
  const name = path.basename(base);
  const thumbsDir = path.join(dir, 'thumbs');

  // Check main directory
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      if (file.startsWith(name)) {
        const srcPath = path.join(dir, file);
        const relPath = path.relative('.', srcPath);
        const destPath = path.join('_removed', relPath);
        const destDir = path.dirname(destPath);
        
        fs.mkdirSync(destDir, { recursive: true });
        const size = fs.statSync(srcPath).size;
        fs.renameSync(srcPath, destPath);
        movedCount++;
        movedBytes += size;
      }
    });
  }

  // Check thumbs directory
  if (fs.existsSync(thumbsDir)) {
    fs.readdirSync(thumbsDir).forEach(file => {
      if (file.startsWith(name)) {
        const srcPath = path.join(thumbsDir, file);
        const relPath = path.relative('.', srcPath);
        const destPath = path.join('_removed', relPath);
        const destDir = path.dirname(destPath);
        
        fs.mkdirSync(destDir, { recursive: true });
        const size = fs.statSync(srcPath).size;
        fs.renameSync(srcPath, destPath);
        movedCount++;
        movedBytes += size;
      }
    });
  }
});

console.log(`Moved ${movedCount} files to _removed/ (${(movedBytes / (1024 * 1024)).toFixed(2)} MB)`);

console.log('\n=== Step 3.2: Updating data/projects.js ===');
let dataCode = fs.readFileSync('data/projects.js', 'utf8').trim();
dataCode = dataCode.replace(/^window\.PORTFOLIO_DATA\s*=\s*/, '');
if (dataCode.endsWith(';')) dataCode = dataCode.slice(0, -1);
const data = JSON.parse(dataCode);

let removedRenders = 0;
let removedWf = 0;

data.projects.forEach(p => {
  if (p.renders) {
    const origLen = p.renders.length;
    p.renders = p.renders.filter(r => {
      const match = candidatesToRemove.some(c => r.src.includes(path.basename(c)));
      if (match) removedRenders++;
      return !match;
    });
    // Re-index order
    p.renders.forEach((r, idx) => {
      r.order = idx + 1;
    });
  }

  if (p.workflow) {
    const origLen = p.workflow.length;
    p.workflow = p.workflow.filter(w => {
      const match = candidatesToRemove.some(c => w.src.includes(path.basename(c)));
      if (match) removedWf++;
      return !match;
    });
    // Re-index order
    p.workflow.forEach((w, idx) => {
      w.order = idx + 1;
    });
  }

  // If character-mint cover was 01, update to 02
  if (p.slug === 'character-mint' && p.cover && p.cover.src.includes('01-mint-chibi-hero')) {
    const r2 = p.renders.find(r => r.src.includes('02-mint-front-rigged'));
    if (r2) {
      p.cover = {
        src: r2.src,
        thumb: r2.thumb,
        lqip: r2.lqip,
        width: r2.width || 1920,
        height: r2.height || 1080,
        alt: `${p.title} — ${r2.label}`
      };
      console.log('Updated character-mint cover to 02-mint-front-rigged');
    }
  }
});

console.log(`Filtered out ${removedRenders} renders and ${removedWf} workflow items from data.`);
const totalRenders = data.projects.reduce((acc, p) => acc + (p.renders ? p.renders.length : 0), 0);
const totalWorkflow = data.projects.reduce((acc, p) => acc + (p.workflow ? p.workflow.length : 0), 0);
console.log(`New total renders: ${totalRenders}, total workflow: ${totalWorkflow}`);

if (data.report && data.report.counts) {
  data.report.counts.renders = totalRenders;
  data.report.counts.workflow = totalWorkflow;
}

const updatedDataJs = 'window.PORTFOLIO_DATA=' + JSON.stringify(data) + ';\n';
fs.writeFileSync('data/projects.js', updatedDataJs, 'utf8');
console.log('Saved updated data/projects.js');

// Also update data/projects.json if it exists
if (fs.existsSync('data/projects.json')) {
  fs.writeFileSync('data/projects.json', JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('Saved updated data/projects.json');
}

console.log('\n=== Step 3.3: Updating index.html ===');
let html = fs.readFileSync('index.html', 'utf8');

// Replace meta description
html = html.replace(
  'content="140+ Final Renders, 19 Wireframe vs Beauty Sliders, 54 Workflow Breakdowns, and 26 Gameplay &amp; Turntable Reels."',
  'content="119+ Final Renders, 19 Wireframe vs Beauty Sliders, 53 Workflow Breakdowns, and 26 Gameplay &amp; Turntable Reels."'
);

// Replace hero button text
html = html.replace(
  '<span data-i18n="heroBtnRenders">EXPLORE 140 RENDERS</span>',
  '<span data-i18n="heroBtnRenders">EXPLORE 119 RENDERS</span>'
);

// Replace stats bar
html = html.replace(
  '<strong id="statRenders">140</strong>',
  '<strong id="statRenders">119</strong>'
);

// Replace workflow description and tab buttons
html = html.replace(
  'wireframe sliders or filter all 54 ordered Maya, ZBrush, Substance 3D, and Unity engine captures.',
  'wireframe sliders or filter all 53 ordered Maya, ZBrush, Substance 3D, and Unity engine captures.'
);

html = html.replace(
  'SLIDERS + 54 BREAKDOWNS)</button>',
  'SLIDERS + 53 BREAKDOWNS)</button>'
);

html = html.replace(
  'ORDERED PIPELINE FEED (54)</button>',
  'ORDERED PIPELINE FEED (53)</button>'
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Saved updated index.html');

console.log('\n=== Step 3.4: Updating js/app.js & js/app.min.js ===');
let appJs = fs.readFileSync('js/app.js', 'utf8');

// Comment at top
appJs = appJs.replace(
  'Renders 140 Beauty Renders, 19 Before/After Sliders, 54 Workflow Breakdowns',
  'Renders 119 Beauty Renders, 19 Before/After Sliders, 53 Workflow Breakdowns'
);

// EN strings
appJs = appJs.replace("heroBtnRenders: 'EXPLORE 140 RENDERS',", "heroBtnRenders: 'EXPLORE 119 RENDERS',");
appJs = appJs.replace(
  "workflowSub: 'Combined production proof inside one unified pipeline section: drag the 19 camera-matched Before/After wireframe sliders or filter all 54 ordered Maya, ZBrush, Substance 3D, and Unity engine captures.',",
  "workflowSub: 'Combined production proof inside one unified pipeline section: drag the 19 camera-matched Before/After wireframe sliders or filter all 53 ordered Maya, ZBrush, Substance 3D, and Unity engine captures.',"
);
appJs = appJs.replace("wfTabAll: 'ALL WORKFLOW (19 SLIDERS + 54 BREAKDOWNS)',", "wfTabAll: 'ALL WORKFLOW (19 SLIDERS + 53 BREAKDOWNS)',");
appJs = appJs.replace("wfTabPipe: 'ORDERED PIPELINE FEED (54)',", "wfTabPipe: 'ORDERED PIPELINE FEED (53)',");

// TH strings
appJs = appJs.replace("heroBtnRenders: 'ชมผลงานเรนเดอร์ (140)',", "heroBtnRenders: 'ชมผลงานเรนเดอร์ (119)',");
appJs = appJs.replace(
  "workflowSub: 'รวมหลักฐานการทำงานจริงไว้ในหมวดเดียว: เลื่อนชมสไลเดอร์เปรียบเทียบ Wireframe กับภาพจริง (19 คู่) และฟีดลำดับงานจาก Maya, ZBrush, Substance 3D Painter และ Unity (54 ภาพ)',",
  "workflowSub: 'รวมหลักฐานการทำงานจริงไว้ในหมวดเดียว: เลื่อนชมสไลเดอร์เปรียบเทียบ Wireframe กับภาพจริง (19 คู่) และฟีดลำดับงานจาก Maya, ZBrush, Substance 3D Painter และ Unity (53 ภาพ)',"
);
appJs = appJs.replace("wfTabAll: 'แสดงทั้งหมด (19 สไลเดอร์ + 54 ขั้นตอน)',", "wfTabAll: 'แสดงทั้งหมด (19 สไลเดอร์ + 53 ขั้นตอน)',");
appJs = appJs.replace("wfTabPipe: 'ฟีดลำดับการทำงาน (54)',", "wfTabPipe: 'ฟีดลำดับการทำงาน (53)',");

fs.writeFileSync('js/app.js', appJs, 'utf8');
console.log('Saved updated js/app.js');

// Minified js/app.min.js
let appMinJs = fs.readFileSync('js/app.min.js', 'utf8');
appMinJs = appMinJs.replace('heroBtnRenders:"EXPLORE 140 RENDERS"', 'heroBtnRenders:"EXPLORE 119 RENDERS"');
appMinJs = appMinJs.replace('\\u0E23\\u0E4C (140)', '\\u0E23\\u0E4C (119)');
appMinJs = appMinJs.replace('or filter all 54 ordered Maya', 'or filter all 53 ordered Maya');
appMinJs = appMinJs.replace('wfTabAll:"ALL WORKFLOW (19 SLIDERS + 54 BREAKDOWNS)"', 'wfTabAll:"ALL WORKFLOW (19 SLIDERS + 53 BREAKDOWNS)"');
appMinJs = appMinJs.replace('wfTabPipe:"ORDERED PIPELINE FEED (54)"', 'wfTabPipe:"ORDERED PIPELINE FEED (53)"');
appMinJs = appMinJs.replace('Unity (54 \\u0E20\\u0E32\\u0E1E)', 'Unity (53 \\u0E20\\u0E32\\u0E1E)');
appMinJs = appMinJs.replace('+ 54 \\u0E02\\u0E31\\u0E49\\u0E19\\u0E15\\u0E2D\\u0E19', '+ 53 \\u0E02\\u0E31\\u0E49\\u0E19\\u0E15\\u0E2D\\u0E19');
appMinJs = appMinJs.replace('\\u0E17\\u0E33\\u0E07\\u0E32\\u0E19 (54)', '\\u0E17\\u0E33\\u0E07\\u0E32\\u0E19 (53)');

fs.writeFileSync('js/app.min.js', appMinJs, 'utf8');
console.log('Saved updated js/app.min.js');

