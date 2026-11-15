const fs = require('fs');
const summary = require('./project_items_summary.json');

summary.forEach(p => {
  console.log(`\n======================================================`);
  console.log(`PROJECT: [${p.slug}] ${p.title} (Renders: ${p.renders.length}, WF: ${p.workflow.length}, BA: ${p.baCount})`);
  console.log(`======================================================`);
  console.log('--- RENDERS ---');
  p.renders.forEach((r, idx) => {
    console.log(`  [R${idx+1}] ${r.src} | "${r.label}" | ${r.dim} | ${r.sizeKB}KB | sh:${r.sharpness} | br:${r.brightness}`);
  });
  if (p.workflow.length > 0) {
    console.log('--- WORKFLOW ---');
    p.workflow.forEach((w, idx) => {
      console.log(`  [W${idx+1}] ${w.src} | "${w.label}" | ${w.dim} | ${w.sizeKB}KB | sh:${w.sharpness} | br:${w.brightness}`);
    });
  }
});

