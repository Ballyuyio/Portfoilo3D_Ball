const fs = require('fs');
let code = fs.readFileSync('data/projects.js', 'utf8').trim();
code = code.replace(/^window\.PORTFOLIO_DATA\s*=\s*/, '');
if (code.endsWith(';')) code = code.slice(0, -1);
const data = JSON.parse(code);

const toRemoveFiles = [
  'public/assets/renders/cloud-strife-chibi/08-cloud-studio-pass-01.jpg',
  'public/assets/renders/cloud-strife-chibi/09-cloud-studio-pass-02.jpg',
  'public/assets/renders/cloud-strife-chibi/10-cloud-studio-pass-03.jpg',
  'public/assets/renders/motorcycle-series/02-kawasaki-zh2-front.jpg',
  'public/assets/renders/cozy-gamer-bedroom/03-gamer-bedroom-wip-pass.jpg',
  'public/assets/renders/pokemon-collection/05-meowstic-front-plush.jpg',
  'public/assets/renders/pokemon-collection/06-meowstic-three-quarter.jpg',
  'public/assets/renders/pokemon-collection/02-reshiram-textured-alternate.jpg',
  'public/assets/renders/bathroom-island-diorama/02-skibidi-prop-render.jpg',
  'public/assets/renders/toji-fushiguro/06-toji-chibi-edition.jpg',
  'public/assets/renders/character-wich/02-wich-three-quarter.jpg',
  'public/assets/renders/character-wich/03-wich-side-hair.jpg',
  'public/assets/renders/character-mint/01-mint-chibi-hero.jpg',
  'public/assets/renders/product-scifi-props/06-dinosaur-fossil-skeleton.jpg',
  'public/assets/renders/product-scifi-props/07-great-white-shark-head.jpg',
  'public/assets/renders/product-scifi-props/11-orange-tabby-cat-bright.jpg',
  'public/assets/renders/stylized-character-showcase/04-kaiwa-chibi-side.jpg',
  'public/assets/renders/stylized-character-showcase/13-lego-robin-front.jpg',
  'public/assets/renders/stylized-game-islands/08-cube-pet-trio-sky.png',
  'public/assets/renders/roblox-prop-pack/08-gold-link-chain-necklace.jpg',
  'public/assets/renders/street-commerce-buildings/04-magma-vein-shop-kiosk.jpg',
  'public/assets/workflow/product-scifi-props/03-shark-head-wireframe.png'
];

let matches = 0;
data.projects.forEach(p => {
  if (p.cover && toRemoveFiles.some(f => p.cover.src.includes(f.split('/').pop()))) {
    console.log('COVER MATCH:', p.slug, p.cover.src);
    matches++;
  }
  (p.beforeAfter || []).forEach(ba => {
    if (toRemoveFiles.some(f => ba.beforeSrc.includes(f.split('/').pop()) || ba.afterSrc.includes(f.split('/').pop()))) {
      console.log('BEFORE AFTER MATCH:', p.slug, ba.id);
      matches++;
    }
  });
});
console.log('Matches found:', matches);
