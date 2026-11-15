const fs = require('fs');
const summary = require('./project_items_summary.json');
const audit = require('./audit_results.json');

console.log('=== CANDIDATE INVESTIGATION ===\n');

summary.forEach(p => {
  const flags = [];

  // 1. Repetitive / Near Duplicates in Renders
  const renders = p.renders;
  for (let i = 0; i < renders.length; i++) {
    for (let j = i + 1; j < renders.length; j++) {
      const itA = audit.allItems.find(x => x.relSrc === renders[i].src.replace(/^\.\//, ''));
      const itB = audit.allItems.find(x => x.relSrc === renders[j].src.replace(/^\.\//, ''));
      if (itA && itB && itA.pHash && itB.pHash) {
        const { hammingDistance } = require('./hash_utils');
        const pDist = hammingDistance(itA.pHash, itB.pHash);
        const dDist = hammingDistance(itA.dHash, itB.dHash);
        if (pDist <= 6 && dDist <= 8) {
          flags.push({
            type: 'near_duplicate_renders',
            fileA: renders[i].src,
            labelA: renders[i].label,
            fileB: renders[j].src,
            labelB: renders[j].label,
            pDist, dDist,
            dimA: renders[i].dim,
            dimB: renders[j].dim,
            sharpA: renders[i].sharpness,
            sharpB: renders[j].sharpness
          });
        }
      }
    }
  }

  // 2. Extreme Darkness / Brightness
  renders.forEach(r => {
    if (r.brightness !== undefined && (r.brightness < 20 || r.brightness > 220)) {
      flags.push({
        type: 'extreme_brightness',
        file: r.src,
        label: r.label,
        brightness: r.brightness,
        dim: r.dim
      });
    }
  });

  // 3. Very Low Resolution (< 900x500 or small)
  renders.forEach(r => {
    const [w, h] = r.dim.split('x').map(Number);
    if (w < 850 || h < 500) {
      flags.push({
        type: 'low_resolution_render',
        file: r.src,
        label: r.label,
        dim: r.dim,
        sizeKB: r.sizeKB
      });
    }
  });

  // 4. Low Sharpness in Renders
  renders.forEach(r => {
    if (r.sharpness !== undefined && r.sharpness < 50) {
      flags.push({
        type: 'low_sharpness_render',
        file: r.src,
        label: r.label,
        sharpness: r.sharpness,
        dim: r.dim
      });
    }
  });

  // 5. Check labels or filenames with WIP/test/pass
  renders.forEach(r => {
    if (/wip|test|draft|pass|study/i.test(r.src) || /wip|test|draft/i.test(r.label)) {
      flags.push({
        type: 'wip_in_renders',
        file: r.src,
        label: r.label
      });
    }
  });

  if (flags.length > 0) {
    console.log(`--- [${p.slug}] ${p.title} (Total renders: ${renders.length}, wf: ${p.workflow.length}) ---`);
    flags.forEach(f => console.log('  ', f));
    console.log('');
  }
});

