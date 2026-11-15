const fs = require('fs');
const summary = require('./project_items_summary.json');
const audit = require('./audit_results.json');
const { hammingDistance } = require('./hash_utils');

const candidates = [];

summary.forEach(p => {
  const renders = p.renders;
  const wf = p.workflow;

  // 1. Extreme Darkness / Brightness
  renders.forEach((r, idx) => {
    if (r.brightness !== undefined && r.brightness < 20) {
      candidates.push({
        project: p.slug,
        projectTitle: p.title,
        file: r.src,
        label: r.label,
        category: 'render',
        dim: r.dim,
        sizeKB: r.sizeKB,
        brightness: r.brightness,
        sharpness: r.sharpness,
        reasonType: 'คุณภาพต่ำ (มืดเกินไป)',
        detail: `ภาพมืดมาก (Mean Brightness: ${r.brightness}/255) มองไม่เห็นรายละเอียดชัดเจน`
      });
    }
  });

  // 2. Low Resolution or High Compression (<80KB for full render or dim < 960x540)
  renders.forEach((r, idx) => {
    const [w, h] = r.dim.split('x').map(Number);
    if ((w <= 960 && h <= 540) || w < 750 || h < 500 || (r.sizeKB < 35 && w >= 960)) {
      candidates.push({
        project: p.slug,
        projectTitle: p.title,
        file: r.src,
        label: r.label,
        category: 'render',
        dim: r.dim,
        sizeKB: r.sizeKB,
        brightness: r.brightness,
        sharpness: r.sharpness,
        reasonType: 'คุณภาพต่ำ (ความละเอียดต่ำ/ไฟล์บีบอัดสูง)',
        detail: `ขนาดมิติเล็ก (${r.dim}) หรือขนาดไฟล์ต่ำผิดปกติ (${r.sizeKB} KB) เสี่ยงแตก/เบลอบนจอใหญ่`
      });
    }
  });

  // 3. WIP / Test in Renders
  renders.forEach((r, idx) => {
    if (/wip|test|pass|draft/i.test(r.src) || /wip|test|pass/i.test(r.label)) {
      candidates.push({
        project: p.slug,
        projectTitle: p.title,
        file: r.src,
        label: r.label,
        category: 'render',
        dim: r.dim,
        sizeKB: r.sizeKB,
        brightness: r.brightness,
        sharpness: r.sharpness,
        reasonType: 'คุณภาพต่ำ (WIP / ไม่ใช่ Final Beauty)',
        detail: `เป็นช็อตทดสอบแสง/WIP pass (${r.label}) ไม่ใช่งาน Final Beauty ที่สมบูรณ์`
      });
    }
  });

  // 4. Redundant Studio Passes or Near Duplicates in Renders
  for (let i = 0; i < renders.length; i++) {
    for (let j = i + 1; j < renders.length; j++) {
      const itA = audit.allItems.find(x => x.relSrc === renders[i].src.replace(/^\.\//, ''));
      const itB = audit.allItems.find(x => x.relSrc === renders[j].src.replace(/^\.\//, ''));
      if (itA && itB && itA.pHash && itB.pHash) {
        const pDist = hammingDistance(itA.pHash, itB.pHash);
        const dDist = hammingDistance(itA.dHash, itB.dHash);
        if (pDist <= 8 && dDist <= 8) {
          candidates.push({
            project: p.slug,
            projectTitle: p.title,
            file: renders[j].src,
            dupWith: renders[i].src,
            label: renders[j].label,
            labelDup: renders[i].label,
            category: 'render',
            dim: renders[j].dim,
            sizeKB: renders[j].sizeKB,
            brightness: renders[j].brightness,
            sharpness: renders[j].sharpness,
            pDist, dDist,
            reasonType: 'ซ้ำเชิงภาพ (Near-duplicate)',
            detail: `มุมกล้องและท่าทางซ้ำซ้อนกับ ${renders[i].src} (pDist: ${pDist}, dDist: ${dDist}) ต่างกันแค่จัดแสงเล็กน้อย`
          });
        }
      }
    }
  }

  // 5. Check Workflow items that are extreme darkness or low quality
  wf.forEach(w => {
    if (w.brightness !== undefined && w.brightness < 15) {
      candidates.push({
        project: p.slug,
        projectTitle: p.title,
        file: w.src,
        label: w.label,
        category: 'workflow',
        dim: w.dim,
        sizeKB: w.sizeKB,
        brightness: w.brightness,
        sharpness: w.sharpness,
        reasonType: 'คุณภาพต่ำ (มืดเกินไปใน Workflow)',
        detail: `ภาพขั้นตอนทำงานมืดมาก (Mean Brightness: ${w.brightness}/255)`
      });
    }
    const [width, height] = w.dim.split('x').map(Number);
    if (width < 750 || height < 500) {
      candidates.push({
        project: p.slug,
        projectTitle: p.title,
        file: w.src,
        label: w.label,
        category: 'workflow',
        dim: w.dim,
        sizeKB: w.sizeKB,
        brightness: w.brightness,
        sharpness: w.sharpness,
        reasonType: 'คุณภาพต่ำ (ความละเอียดต่ำใน Workflow)',
        detail: `ขนาดมิติเล็ก (${w.dim}) ต่ำกว่ามาตรฐาน`
      });
    }
  });
});

// Deduplicate candidates by file + reasonType
const uniqueCandidates = [];
const seen = new Set();
candidates.forEach(c => {
  const k = `${c.file}::${c.reasonType}`;
  if (!seen.has(k)) {
    seen.add(k);
    uniqueCandidates.push(c);
  }
});

fs.writeFileSync('tools/flagged_candidates.json', JSON.stringify(uniqueCandidates, null, 2));
console.log(`Identified ${uniqueCandidates.length} potential flags across projects.`);

