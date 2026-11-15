const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');
const { computeDHash, computeAHash, computePHash, computeVisualStats, hammingDistance } = require('./hash_utils');

const ROOT = path.resolve(__dirname, '..');

// 1. Load data/projects.js
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'data/projects.js'), 'utf8'), ctx);
const DATA = ctx.window.PORTFOLIO_DATA;

function getSha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

async function run() {
  console.log('Collecting all project images...');
  const items = [];
  const pathToItem = new Map();

  // Helper to add item
  function addItem(category, projectSlug, projectTitle, entry) {
    // entry has: id, src, label, width, height, ...
    const relSrc = entry.src.replace(/^\.\//, '');
    const fullPath = path.join(ROOT, relSrc);
    if (!fs.existsSync(fullPath)) {
      console.warn(`File not found: ${fullPath}`);
      return;
    }

    const item = {
      category, // 'render' | 'workflow' | 'beforeAfter_before' | 'beforeAfter_after'
      projectSlug,
      projectTitle,
      id: entry.id || path.basename(relSrc),
      label: entry.label || entry.title || '',
      labelTh: entry.labelTh || entry.titleTh || '',
      relSrc,
      fullPath,
      sizeBytes: fs.statSync(fullPath).size,
      widthDeclared: entry.width,
      heightDeclared: entry.height,
      extra: entry
    };
    items.push(item);
  }

  DATA.projects.forEach(p => {
    (p.renders || []).forEach(r => addItem('render', p.slug, p.title, r));
    (p.workflow || []).forEach(w => addItem('workflow', p.slug, p.title, w));
    (p.beforeAfter || []).forEach(ba => {
      addItem('beforeAfter_before', p.slug, p.title, {
        id: `${ba.id}-before`,
        src: ba.beforeSrc,
        label: `${ba.title} (${ba.beforeLabel})`,
        width: ba.width,
        height: ba.height
      });
      addItem('beforeAfter_after', p.slug, p.title, {
        id: `${ba.id}-after`,
        src: ba.afterSrc,
        label: `${ba.title} (${ba.afterLabel})`,
        width: ba.width,
        height: ba.height
      });
    });
  });

  console.log(`Found ${items.length} referenced items. Processing visual hashes and stats...`);

  // Cache stats by unique fullPath
  const pathStats = new Map();
  const uniquePaths = [...new Set(items.map(it => it.fullPath))];
  console.log(`Unique file paths referenced: ${uniquePaths.length}`);

  let doneCount = 0;
  for (const fp of uniquePaths) {
    try {
      const sha256 = getSha256(fp);
      const dHash = await computeDHash(fp);
      const aHash = await computeAHash(fp);
      const pHash = await computePHash(fp);
      const stats = await computeVisualStats(fp);
      pathStats.set(fp, {
        sha256,
        dHash,
        aHash,
        pHash,
        ...stats,
        sizeKB: Math.round((fs.statSync(fp).size / 1024) * 10) / 10
      });
    } catch (e) {
      console.error(`Error processing ${fp}:`, e);
      pathStats.set(fp, { error: e.message });
    }
    doneCount++;
    if (doneCount % 25 === 0 || doneCount === uniquePaths.length) {
      console.log(`Processed ${doneCount}/${uniquePaths.length}`);
    }
  }

  // Attach stats to items
  items.forEach(it => {
    const s = pathStats.get(it.fullPath) || {};
    Object.assign(it, s);
  });

  // Check all images on disk in public/assets/renders and public/assets/workflow
  function findFiles(dir, exts = ['.jpg', '.jpeg', '.png', '.gif']) {
    let res = [];
    if (!fs.existsSync(dir)) return res;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'thumbs') {
          res = res.concat(findFiles(p, exts));
        }
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (exts.includes(ext) && !/-400\.webp$/.test(entry.name)) {
          res.push(p);
        }
      }
    }
    return res;
  }

  const diskFiles = [
    ...findFiles(path.join(ROOT, 'public/assets/renders')),
    ...findFiles(path.join(ROOT, 'public/assets/workflow'))
  ];
  console.log(`Total full-size images on disk in renders/workflow: ${diskFiles.length}`);
  const unreferencedOnDisk = diskFiles.filter(df => !uniquePaths.includes(df));
  console.log(`Unreferenced full-size images on disk: ${unreferencedOnDisk.length}`);

  // 1. Exact SHA-256 Duplicates
  const shaMap = new Map();
  items.forEach(it => {
    if (!it.sha256) return;
    if (!shaMap.has(it.sha256)) shaMap.set(it.sha256, []);
    shaMap.get(it.sha256).push(it);
  });
  const exactDuplicates = [];
  shaMap.forEach((list, sha) => {
    if (list.length > 1) {
      exactDuplicates.push(list);
    }
  });

  // 2. Perceptual Duplicates (within same project & across projects)
  // We compare unique items (grouped by relSrc)
  const uniqueItemsMap = new Map();
  items.forEach(it => {
    if (!uniqueItemsMap.has(it.relSrc)) uniqueItemsMap.set(it.relSrc, it);
  });
  const uniqueItems = Array.from(uniqueItemsMap.values());

  const nearDuplicates = [];
  for (let i = 0; i < uniqueItems.length; i++) {
    for (let j = i + 1; j < uniqueItems.length; j++) {
      const itA = uniqueItems[i];
      const itB = uniqueItems[j];
      if (!itA.pHash || !itB.pHash) continue;
      if (itA.sha256 === itB.sha256) continue; // already exact dupe

      const pDist = hammingDistance(itA.pHash, itB.pHash);
      const dDist = hammingDistance(itA.dHash, itB.dHash);

      // Low distance threshold
      if (pDist <= 6 && dDist <= 8) {
        nearDuplicates.push({
          itemA: itA,
          itemB: itB,
          pDist,
          dDist,
          sameProject: itA.projectSlug === itB.projectSlug
        });
      }
    }
  }

  // 3. Low Resolution Flags (< 960 width or < 540 height, or < 0.6 Megapixels)
  const lowRes = uniqueItems.filter(it => {
    const w = it.width || 0;
    const h = it.height || 0;
    const mp = (w * h) / 1000000;
    return w < 960 || h < 540 || mp < 0.65;
  });

  // 4. Low Sharpness Flags (Laplacian variance < 60)
  const lowSharpness = uniqueItems.filter(it => {
    return it.sharpness !== undefined && it.sharpness < 50;
  });

  // 5. Extreme Brightness (too dark < 25, or too washed out > 220)
  const extremeBrightness = uniqueItems.filter(it => {
    return it.meanBrightness !== undefined && (it.meanBrightness < 25 || it.meanBrightness > 220);
  });

  // 6. Cross-Section duplicates: renders vs workflow
  const crossSectionOverlap = [];
  // For each project, check if any render has exact or near match in workflow
  DATA.projects.forEach(p => {
    const rItems = items.filter(it => it.projectSlug === p.slug && it.category === 'render');
    const wItems = items.filter(it => it.projectSlug === p.slug && it.category === 'workflow');
    rItems.forEach(r => {
      wItems.forEach(w => {
        if (r.relSrc === w.relSrc) {
          crossSectionOverlap.push({ type: 'identical_src', render: r, workflow: w, project: p.slug });
        } else if (r.pHash && w.pHash) {
          const dist = hammingDistance(r.pHash, w.pHash);
          if (dist <= 6) {
            crossSectionOverlap.push({ type: 'near_duplicate', dist, render: r, workflow: w, project: p.slug });
          }
        }
      });
    });
  });

  const output = {
    summary: {
      totalReferencedItems: items.length,
      uniqueItems: uniqueItems.length,
      exactDuplicateGroups: exactDuplicates.length,
      nearDuplicatePairs: nearDuplicates.length,
      lowResCount: lowRes.length,
      lowSharpnessCount: lowSharpness.length,
      extremeBrightnessCount: extremeBrightness.length,
      crossSectionOverlapCount: crossSectionOverlap.length,
      unreferencedOnDisk: unreferencedOnDisk.map(p => path.relative(ROOT, p))
    },
    exactDuplicates: exactDuplicates.map(grp => grp.map(it => ({
      category: it.category,
      project: it.projectSlug,
      relSrc: it.relSrc,
      label: it.label,
      width: it.width,
      height: it.height,
      sizeKB: it.sizeKB
    }))),
    nearDuplicates: nearDuplicates.map(nd => ({
      sameProject: nd.sameProject,
      projectA: nd.itemA.projectSlug,
      projectB: nd.itemB.projectSlug,
      relSrcA: nd.itemA.relSrc,
      relSrcB: nd.itemB.relSrc,
      labelA: nd.itemA.label,
      labelB: nd.itemB.label,
      pDist: nd.pDist,
      dDist: nd.dDist,
      dimA: `${nd.itemA.width}x${nd.itemA.height}`,
      dimB: `${nd.itemB.width}x${nd.itemB.height}`,
      sharpnessA: nd.itemA.sharpness,
      sharpnessB: nd.itemB.sharpness,
      sizeA: nd.itemA.sizeKB,
      sizeB: nd.itemB.sizeKB
    })),
    crossSectionOverlap: crossSectionOverlap.map(cs => ({
      project: cs.project,
      type: cs.type,
      dist: cs.dist,
      renderSrc: cs.render.relSrc,
      renderLabel: cs.render.label,
      workflowSrc: cs.workflow.relSrc,
      workflowLabel: cs.workflow.label
    })),
    lowRes: lowRes.map(it => ({
      category: it.category,
      project: it.projectSlug,
      relSrc: it.relSrc,
      label: it.label,
      width: it.width,
      height: it.height,
      mp: Math.round(((it.width * it.height) / 1000000) * 100) / 100,
      sizeKB: it.sizeKB
    })),
    lowSharpness: lowSharpness.map(it => ({
      category: it.category,
      project: it.projectSlug,
      relSrc: it.relSrc,
      label: it.label,
      sharpness: it.sharpness,
      width: it.width,
      height: it.height,
      sizeKB: it.sizeKB
    })),
    extremeBrightness: extremeBrightness.map(it => ({
      category: it.category,
      project: it.projectSlug,
      relSrc: it.relSrc,
      label: it.label,
      meanBrightness: it.meanBrightness,
      width: it.width,
      height: it.height,
      sizeKB: it.sizeKB
    })),
    allItems: items.map(it => ({
      category: it.category,
      project: it.projectSlug,
      relSrc: it.relSrc,
      label: it.label,
      width: it.width,
      height: it.height,
      sizeKB: it.sizeKB,
      sharpness: it.sharpness,
      meanBrightness: it.meanBrightness,
      pHash: it.pHash,
      dHash: it.dHash,
      sha256: it.sha256
    }))
  };

  const outPath = path.join(ROOT, 'tools/audit_results.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Saved audit results to ${outPath}`);
  console.log('Summary:', output.summary);
}

run().catch(console.error);

