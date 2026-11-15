const fs = require('fs');
const path = require('path');
const vm = require('vm');
const r = require('./audit_results.json');

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync('data/projects.js', 'utf8'), ctx);
const d = ctx.window.PORTFOLIO_DATA;

const out = [];

d.projects.forEach(p => {
  const pObj = {
    slug: p.slug,
    title: p.title,
    rendersCount: (p.renders || []).length,
    wfCount: (p.workflow || []).length,
    baCount: (p.beforeAfter || []).length,
    renders: [],
    workflow: []
  };

  (p.renders || []).forEach(x => {
    const item = r.allItems.find(it => it.relSrc === x.src.replace(/^\.\//, ''));
    pObj.renders.push({
      src: x.src,
      label: x.label,
      dim: `${item?.width}x${item?.height}`,
      sizeKB: item?.sizeKB,
      sharpness: item?.sharpness,
      brightness: item?.meanBrightness
    });
  });

  (p.workflow || []).forEach(x => {
    const item = r.allItems.find(it => it.relSrc === x.src.replace(/^\.\//, ''));
    pObj.workflow.push({
      src: x.src,
      label: x.label,
      dim: `${item?.width}x${item?.height}`,
      sizeKB: item?.sizeKB,
      sharpness: item?.sharpness,
      brightness: item?.meanBrightness
    });
  });

  out.push(pObj);
});

fs.writeFileSync('tools/project_items_summary.json', JSON.stringify(out, null, 2));
console.log('Written tools/project_items_summary.json with', out.length, 'projects');

