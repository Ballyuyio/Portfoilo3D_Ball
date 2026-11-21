const fs = require('fs');
const path = require('path');

console.log('=== SYNCING PORTFOLIO_PATANAWAN DIRECTORY ===');

// 1. Copy web code files
const filesToCopy = [
  'index.html',
  'data/projects.js',
  'data/projects.json',
  'js/app.js',
  'js/app.min.js',
  'js/streetfx.js',
  'js/streetfx.min.js',
  'js/effects.js',
  'js/effects.min.js',
  'styles/tokens.css',
  'styles/tokens.min.css',
  'styles/streetwall.css',
  'styles/streetwall.min.css',
  'styles/buttons.css',
  'styles/buttons.min.css',
  'server.js'
];

filesToCopy.forEach(f => {
  const src = f;
  const dest = path.join('Portfolio_Patanawan', f);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`Copied ${src} -> ${dest}`);
});

// 2. Move the 110 removed images in Portfolio_Patanawan/public/assets to Portfolio_Patanawan/_removed/
const candidatesToRemove = [
  'public/assets/renders/cloud-strife-chibi/08-cloud-studio-pass-01',
  'public/assets/renders/cloud-strife-chibi/09-cloud-studio-pass-02',
  'public/assets/renders/cloud-strife-chibi/10-cloud-studio-pass-03',
  'public/assets/renders/motorcycle-series/02-kawasaki-zh2-front',
  'public/assets/renders/cozy-gamer-bedroom/03-gamer-bedroom-wip-pass',
  'public/assets/renders/pokemon-collection/05-meowstic-front-plush',
  'public/assets/renders/pokemon-collection/06-meowstic-three-quarter',
  'public/assets/renders/pokemon-collection/02-reshiram-textured-alternate',
  'public/assets/renders/bathroom-island-diorama/02-skibidi-prop-render',
  'public/assets/renders/toji-fushiguro/06-toji-chibi-edition',
  'public/assets/renders/character-wich/02-wich-three-quarter',
  'public/assets/renders/character-wich/03-wich-side-hair',
  'public/assets/renders/character-mint/01-mint-chibi-hero',
  'public/assets/renders/product-scifi-props/06-dinosaur-fossil-skeleton',
  'public/assets/renders/product-scifi-props/07-great-white-shark-head',
  'public/assets/renders/product-scifi-props/11-orange-tabby-cat-bright',
  'public/assets/workflow/product-scifi-props/03-shark-head-wireframe',
  'public/assets/renders/stylized-character-showcase/04-kaiwa-chibi-side',
  'public/assets/renders/stylized-character-showcase/13-lego-robin-front',
  'public/assets/renders/stylized-game-islands/08-cube-pet-trio-sky',
  'public/assets/renders/roblox-prop-pack/08-gold-link-chain-necklace',
  'public/assets/renders/street-commerce-buildings/04-magma-vein-shop-kiosk'
];

let subMoved = 0;
candidatesToRemove.forEach(base => {
  const dir = path.join('Portfolio_Patanawan', path.dirname(base));
  const name = path.basename(base);
  const thumbsDir = path.join(dir, 'thumbs');

  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      if (file.startsWith(name)) {
        const srcPath = path.join(dir, file);
        const relPath = path.relative('Portfolio_Patanawan', srcPath);
        const destPath = path.join('Portfolio_Patanawan', '_removed', relPath);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.renameSync(srcPath, destPath);
        subMoved++;
      }
    });
  }

  if (fs.existsSync(thumbsDir)) {
    fs.readdirSync(thumbsDir).forEach(file => {
      if (file.startsWith(name)) {
        const srcPath = path.join(thumbsDir, file);
        const relPath = path.relative('Portfolio_Patanawan', srcPath);
        const destPath = path.join('Portfolio_Patanawan', '_removed', relPath);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.renameSync(srcPath, destPath);
        subMoved++;
      }
    });
  }
});

console.log(`Moved ${subMoved} files in Portfolio_Patanawan to Portfolio_Patanawan/_removed/`);
console.log('Sync complete!');

