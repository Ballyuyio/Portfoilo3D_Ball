/**
 * STREET WALL — Main Application Controller
 * Renders 140 Beauty Renders, 19 Before/After Sliders, 54 Workflow Breakdowns,
 * 26 Separated H.264 Motion Clips, 30 Project Dossiers (#/work/[slug]),
 * EN/TH Bilingual Dictionary, Lightbox & Motion Theater Modals, and Validated Contact Form.
 */
(function () {
  'use strict';

  const DATA = window.PORTFOLIO_DATA;
  if (!DATA || !Array.isArray(DATA.projects)) {
    const mc = document.getElementById('mainContent');
    if (mc) {
      mc.innerHTML = '<div class="container" style="padding:80px 24px;color:#fff;"><h1>Data Error</h1><p>Missing ./data/projects.js. Run <code>node scripts/organize-assets.js</code>.</p></div>';
    }
    return;
  }

  // Hydrate deduplicated portfolio payload into full runtime feeds (supports file:/// cleanly)
  (function hydrateData() {
    const baMap = new Map();
    const clipMap = new Map();
    DATA.projects.forEach(p => {
      (p.renders || []).forEach(r => {
        if (!r.projectTitle) r.projectTitle = p.title;
        if (!r.projectTitleTh) r.projectTitleTh = p.titleTh;
        if (!r.category) r.category = p.category;
        if (!r.accent) r.accent = p.accent;
        if (!r.software) r.software = p.software;
      });
      (p.workflow || []).forEach(w => {
        if (!w.projectTitle) w.projectTitle = p.title;
        if (!w.projectTitleTh) w.projectTitleTh = p.titleTh;
        if (!w.accent) w.accent = p.accent;
        if (!w.software) w.software = p.software;
      });
      (p.beforeAfter || []).forEach(b => baMap.set(b.id, b));
      (p.animations || []).forEach(a => {
        if (!a.projectTitle) a.projectTitle = p.title;
        if (!a.projectTitleTh) a.projectTitleTh = p.titleTh;
        clipMap.set(a.id, a);
      });
      if (!p.cover) {
        p.cover = (p.renders && p.renders[0]) || (p.workflow && p.workflow[0]) || null;
      }
    });
    if (!Array.isArray(DATA.rendersFeed)) {
      DATA.rendersFeed = DATA.projects.flatMap(p => p.renders || []);
    }
    if (!Array.isArray(DATA.workflowFeed)) {
      DATA.workflowFeed = DATA.projects.flatMap(p => p.workflow || []);
    }
    if (!Array.isArray(DATA.beforeAfterPairs)) {
      const order = DATA.beforeAfterOrder || [];
      DATA.beforeAfterPairs = order.map(id => baMap.get(id)).filter(Boolean);
      if (!DATA.beforeAfterPairs.length) DATA.beforeAfterPairs = Array.from(baMap.values());
    }
    if (!Array.isArray(DATA.motionGroups) && Array.isArray(DATA.motionGroupDefs)) {
      DATA.motionGroups = DATA.motionGroupDefs.map(g => ({
        id: g.id,
        title: g.title,
        titleTh: g.titleTh,
        accent: g.accent,
        desc: g.desc,
        clips: (g.clipIds || []).map(id => clipMap.get(id)).filter(Boolean)
      }));
    }
  })();

  const PROJECT_MAP = new Map(DATA.projects.map(p => [p.slug, p]));

  // -------------------------------------------------------------------------
  // BILINGUAL DICTIONARY (EN / TH)
  // -------------------------------------------------------------------------
  const I18N = {
    en: {
      a11ySkip: 'Skip to wall content',
      navRenders: 'Renders',
      navWorkflow: 'Workflow',
      navMotion: 'Motion',
      navProjects: 'Archive',
      navAbout: 'About',
      navContact: 'Contact',
      ctaHire: 'HIRE / COMMISSION',
      heroAvail: 'OPEN FOR INTERNSHIP, STUDIO ROLES & COMMISSIONS',
      heroSchool: 'KMUTT SoA+D // GAME DEV',
      heroHeadline: 'PATANAWAN JARUNONGKRAN',
      heroRole: '3D Character, Prop & Game Environment Artist — Modeling, Retopology, PBR Lookdev, Maya Rigging & Real-Time Animation',
      heroBio: 'Media Technology (Game Development) undergraduate at King Mongkut\'s University of Technology Thonburi. Turning raw polygons and ZBrush sculpts into production-ready characters, vehicles, weapons, and game worlds with Autodesk Maya, Substance 3D Painter, and Unity.',
      heroBtnRenders: 'EXPLORE 140 RENDERS',
      heroBtnMotion: 'WATCH 26 MOTION CLIPS',
      statRenders: 'Final Beauty Renders',
      statSliders: 'Wire vs Beauty Sliders',
      statMotion: 'Playable Reels & Cycles',
      statProjects: 'Organized Projects',
      scrollHint: 'SCROLL DOWN TO SPRAY WALL',
      openDossier: 'OPEN DOSSIER',
      rendersTitle: 'FINAL BEAUTY WALL',
      rendersSub: 'High-resolution studio beauty shots, game characters, hard-surface vehicles, PBR combat weapons, and stylized islands pulled directly from clean lookdev passes. Click any frame for Lightbox inspection.',
      workflowTitle: 'TOPOLOGY, RIGGING & LOOKDEV',
      workflowSub: 'Combined production proof inside one unified pipeline section: drag the 19 camera-matched Before/After wireframe sliders or filter all 54 ordered Maya, ZBrush, Substance 3D, and Unity engine captures.',
      wfTabAll: 'ALL WORKFLOW (19 SLIDERS + 54 BREAKDOWNS)',
      wfTabSliders: 'BEFORE / AFTER SLIDERS (19)',
      wfTabPipe: 'ORDERED PIPELINE FEED (54)',
      motionTitle: 'REELS, CYCLES & TURNTABLES',
      motionSub: '26 H.264 native MP4 clips cleanly split into 5 subject groups. Posters stay static until clicked or activated, keeping GPU memory responsive.',
      projectsTitle: 'ALL 30 PROJECT FILES',
      projectsSub: 'Browse complete grouped dossiers combining beauty renders, matched wireframes, polycounts, and animation clips per project.',
      aboutTitle: 'BEHIND THE SPRAY CAN',
      portraitLabel: 'Artist Portrait Slot',
      aboutIdentityLine: 'Patanawan Jarunongkran (Ball Patanawan)',
      aboutHeading: 'Game-Ready 3D Modeler, Rigger & Animator — KMUTT SoA+D',
      aboutStory: 'Currently pursuing a B.Sc. in Media Technology (Game Development) at School of Architecture and Design, KMUTT (2024–Present). My workflow bridges high-poly sculpting, clean quad topology, PBR surface storytelling, and Maya AdvancedSkeleton / custom NURBS rigs ready for Unity and Roblox Studio production pipelines.',
      toolMaya: 'Sub-D Hard-Surface, Retopo, UV Layout, IK/FK Rigs & Arnold Lookdev',
      toolZbrush: 'Organic Anatomy, Stylized Creatures, Rocks & Chibi Silhouettes',
      toolSubstance: 'PBR Metals, Hand-Painted Graffiti Decals & Texture Sheets',
      toolEngines: 'Real-Time Prefab Assembly, Animator Controllers & Mobile Prototypes',
      tl1Title: 'B.Sc. Media Technology (Game Development) — SoA+D, KMUTT',
      tl1Desc: 'Game character pipelines, environment storytelling, shaders, rigging, and real-time Unity integration.',
      tl2Title: 'Year-3 Game Art Packs & Freelance 3D Assets',
      tl2Desc: 'Shipped Crystal Stone Golem, Hooded Hunter RPG pack, Furry Guardian mobile prototype, and stylized Roblox props. TODO: add studio / team names.',
      servicesTitle: 'SERVICES & WORK PROCESS',
      srv1Title: '3D Characters & Creatures',
      srv1Desc: 'Game-ready stylized, anime chibi, and monster characters with clean deformation loops and baked PBR textures.',
      srv2Title: 'Vehicles & Combat Weapons',
      srv2Desc: 'High-detail Sub-D motorcycles, sci-fi submarines, firearms, blades, and product visualization renders.',
      srv3Title: 'Maya Rigging & Game Cycles',
      srv3Desc: 'IK/FK AdvancedSkeleton or custom NURBS rigs plus export-ready Idle, Walk, Run, Attack, and Skill clips.',
      srv4Title: 'Dioramas & UGC Props',
      srv4Desc: 'Modular buildings, horror/interior rooms, floating game islands, and optimized Roblox / Unity prop kits.',
      pipe1: 'Brief & Poly Budget',
      pipe2: 'Blockout & Wireframe',
      pipe3: 'PBR Texturing & Rig',
      pipe4: 'Engine & Render Delivery',
      contactTitle: 'LET\'S BUILD SOMETHING 3D',
      contactSub: 'Available for game studio internships, junior 3D modeler/animator roles, and freelance commissions.',
      contactBadge: 'AVAILABLE NOW // BANGKOK & REMOTE',
      copyBtn: 'COPY',
      socialsNote: 'Social Channels',
      fName: 'Your Name *',
      fEmail: 'Email Address *',
      fType: 'Project Type',
      fBudget: 'Estimated Scope / Budget',
      fMessage: 'Project Brief *',
      fSubmit: 'SEND BRIEF VIA EMAIL',
      backTop: 'BACK TO TOP',
      searchPh: 'Search asset or project...',
      inspectSticker: 'INSPECT',
      dossierBtn: 'DOSSIER ->',
      playInline: 'PREVIEW CLIP',
      playTheater: 'THEATER',
      backToWall: '<- BACK TO STREET WALL'
    },
    th: {
      a11ySkip: 'ข้ามไปยังเนื้อหาหลัก',
      navRenders: 'ผลงานเรนเดอร์',
      navWorkflow: 'ขั้นตอนทำงาน',
      navMotion: 'แอนิเมชัน',
      navProjects: 'รวม 30 โปรเจกต์',
      navAbout: 'เกี่ยวกับฉัน',
      navContact: 'ติดต่อ',
      ctaHire: 'จ้างงาน / สมัครฝึกงาน',
      heroAvail: 'พร้อมรับงานฝึกงาน สตูดิโอ และฟรีแลนซ์ 3D',
      heroSchool: 'มจธ. KMUTT SoA+D // พัฒนาเกม',
      heroHeadline: 'ปฐณวรรณ จารุนงคราญ',
      heroRole: 'ศิลปินปั้นโมเดลตัวละคร พร็อพ และฉากเกม 3 มิติ — โครงสร้างตาข่าย PBR เท็กซ์เจอร์ ริกกิ้ง Maya และแอนิเมชันลงเอนจินจริง',
      heroBio: 'นักศึกษาสาขาเทคโนโลยีมีเดีย (เอกพัฒนาเกม) คณะสถาปัตยกรรมศาสตร์และการออกแบบ มจธ. เชี่ยวชาญการเปลี่ยนโมเดลปั้น ZBrush และ Maya ให้พร้อมใช้งานจริงในเกมทั้งริก คอนโทรล แอนิเมชัน และ PBR บน Unity / Roblox Studio',
      heroBtnRenders: 'ชมผลงานเรนเดอร์ (140)',
      heroBtnMotion: 'ดูแอนิเมชัน (26 คลิป)',
      statRenders: 'ภาพเรนเดอร์สมบูรณ์',
      statSliders: 'สไลเดอร์เทียบ Wireframe',
      statMotion: 'คลิปแอนิเมชัน & เกมเพลย์',
      statProjects: 'โปรเจกต์จัดหมวดแล้ว',
      scrollHint: 'เลื่อนลงเพื่อชมกำแพงผลงาน',
      openDossier: 'ดูรายละเอียดโปรเจกต์',
      rendersTitle: 'กำแพงผลงานเรนเดอร์สมบูรณ์',
      rendersSub: 'รวมภาพเรนเดอร์ไฟนอลความละเอียดสูง ทั้งตัวละครเกม ยานพาหนะ อาวุธยุทธวิธี และฉากไดโอรามา คลิกที่ภาพเพื่อขยายตรวจสอบใน Lightbox',
      workflowTitle: 'ขั้นตอนเบื้องหลัง ริกกิ้ง และ WIREFRAME',
      workflowSub: 'รวมหลักฐานการทำงานจริงไว้ในหมวดเดียว: เลื่อนชมสไลเดอร์เปรียบเทียบ Wireframe กับภาพจริง (19 คู่) และฟีดลำดับงานจาก Maya, ZBrush, Substance 3D Painter และ Unity (54 ภาพ)',
      wfTabAll: 'แสดงทั้งหมด (19 สไลเดอร์ + 54 ขั้นตอน)',
      wfTabSliders: 'สไลเดอร์ก่อน-หลัง (19)',
      wfTabPipe: 'ฟีดลำดับการทำงาน (54)',
      motionTitle: 'แอนิเมชัน เกมเพลย์ และ เทิร์นเทเบิล',
      motionSub: 'รวมคลิป MP4 (H.264) ทั้งหมด 26 คลิป แยกหมวดหมู่ตามโปรเจกต์อย่างชัดเจน โหลดเบาด้วยโปสเตอร์ก่อนกดเล่นจริง',
      projectsTitle: 'คลังโปรเจกต์ทั้งหมด 30 ชุด',
      projectsSub: 'คลิกเข้าดูแฟ้มผลงานรายโปรเจกต์เพื่อชมภาพเรนเดอร์ โครงสร้าง Wireframe ค่า Polycount และคลิปแอนิเมชันในหน้าเดียว',
      aboutTitle: 'ทำความรู้จักผู้สร้างสรรค์',
      portraitLabel: 'พื้นที่สำหรับภาพถ่ายศิลปิน',
      aboutIdentityLine: 'ปฐณวรรณ จารุนงคราญ (Ball Patanawan)',
      aboutHeading: '3D Game Modeler, Rigger & Animator — KMUTT SoA+D',
      aboutStory: 'กำลังศึกษาปริญญาตรี สาขาเทคโนโลยีมีเดีย (การพัฒนาเกม) มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (2567–ปัจจุบัน) มีทักษะครบตั้งแต่การปั้น Sculpt, Retopology ตาข่ายเกม, เพนต์ PBR ด้วย Substance 3D Painter ไปจนถึงการวางริก AdvancedSkeleton / NURBS และส่งเข้า Unity',
      toolMaya: 'ปั้นโมเดล Sub-D, Retopo, กาง UV, วางริก IK/FK และจัดแสง Arnold',
      toolZbrush: 'ปั้นสรีระ สัตว์ประหลาด โขดหิน และสัดส่วนคาแรกเตอร์สไตล์ต่างๆ',
      toolSubstance: 'เพนต์ผิวโลหะ ลายกราฟฟิตี้ และ Texture Sheets พร้อมใช้งานเกม',
      toolEngines: 'ประกอบฉาก ตั้งค่า Animator Controller และทดสอบต้นแบบเกมมือถือ',
      tl1Title: 'วท.บ. มีเดียเทคโนโลยี (การพัฒนาเกม) — มจธ. (KMUTT)',
      tl1Desc: 'ศึกษาครบวงจรทั้ง 3D Asset Pipeline, Shading, Rigging และระบบเกมบนเอนจินจริง',
      tl2Title: 'ผลงานแอสเซ็ตเกมชั้นปีที่ 3 และงานฟรีแลนซ์',
      tl2Desc: 'พัฒนาโมเดล Crystal Stone Golem, แพ็กเกม Hooded Hunter, ต้นแบบเกม Furry Guardian และไอเท็ม Roblox (TODO: เพิ่มชื่อทีม/สตูดิโอ)',
      servicesTitle: 'บริการและขั้นตอนการทำงาน',
      srv1Title: 'ตัวละครเกมและมอนสเตอร์ 3D',
      srv1Desc: 'ปั้นตัวละครสไตล์การ์ตูน อนิเมะ จิ๋ว และสิ่งมีชีวิต พร้อม Topology ที่ขยับข้อต่อได้สวยไม่บิดเบี้ยว',
      srv2Title: 'ยานพาหนะและอาวุธ PBR',
      srv2Desc: 'โมเดล Hard-Surface มอเตอร์ไซค์ เรือดำน้ำ อาวุธปืน มีด และภาพผลิตภัณฑ์สมจริง',
      srv3Title: 'ริกกิ้งและแอนิเมชันลงเกม',
      srv3Desc: 'วางริก AdvancedSkeleton หรือ NURBS พร้อมท่า Idle, Walk, Run, Attack ส่งออกเอนจินทันที',
      srv4Title: 'ฉากไดโอรามาและพร็อพ Roblox/Unity',
      srv4Desc: 'ออกแบบอาคาร ห้อง 3 มิติ เกาะลอยฟ้า และชุดพร็อพประหยัดโพลีกอน',
      pipe1: 'สรุปบรีฟและงบ Polycount',
      pipe2: 'ขึ้นโครง Blockout & Wireframe',
      pipe3: 'ลงสี PBR และวางริก',
      pipe4: 'เรนเดอร์และส่งมอบลงเอนจิน',
      contactTitle: 'ติดต่อร่วมงาน / สั่งทำโมเดล 3D',
      contactSub: 'เปิดรับโอกาสฝึกงานในสตูดิโอเกม ตำแหน่ง Junior 3D Artist / Animator และงานฟรีแลนซ์',
      contactBadge: 'พร้อมรับงานทันที // กรุงเทพฯ และ รีโมต',
      copyBtn: 'คัดลอก',
      socialsNote: 'ช่องทางโซเชียลมีเดีย',
      fName: 'ชื่อของคุณ / สตูดิโอ *',
      fEmail: 'อีเมลติดต่อกลับ *',
      fType: 'ประเภทงานที่สนใจ',
      fBudget: 'งบประมาณ / รูปแบบงาน',
      fMessage: 'รายละเอียดโปรเจกต์ / เดดไลน์ *',
      fSubmit: 'ส่งข้อความผ่านอีเมล',
      backTop: 'กลับขึ้นด้านบน',
      searchPh: 'ค้นหาชื่อโมเดลหรือโปรเจกต์...',
      inspectSticker: 'ขยายดู',
      dossierBtn: 'เปิดโปรเจกต์ ->',
      playInline: 'เล่นตัวอย่าง',
      playTheater: 'เต็มจอ',
      backToWall: '<- กลับหน้ากำแพงรวม'
    }
  };

  // -------------------------------------------------------------------------
  // RUNTIME STATE
  // -------------------------------------------------------------------------
  const state = {
    lang: (() => {
      try { return localStorage.getItem('sw_lang') === 'th' ? 'th' : 'en'; } catch { return 'en'; }
    })(),
    renderCat: 'all',
    renderSearch: '',
    renderLimit: 24,
    wfTab: 'all',
    wfStepFilter: 'all',
    baLimit: 6,
    wfLimit: 12,
    lightboxList: [],
    lightboxIdx: 0,
    activeInlineVideoCard: null,
    activeMotionClip: null,
    lastWallScrollY: 0
  };

  // -------------------------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------------------------
  function esc(val) {
    return String(val ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function t(key) {
    return (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;
  }

  function localizedText(enStr, thStr) {
    return state.lang === 'th' && thStr ? thStr : (enStr || '');
  }

  function formatDuration(sec) {
    const s = Math.round(Number(sec) || 0);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m > 0 ? `${m}m ${r}s` : `${(Number(sec) || 0).toFixed(1)}s`;
  }

  function categoryMatch(itemCat, filterCat) {
    if (filterCat === 'all') return true;
    if (filterCat === 'weapons-props') return itemCat === 'weapons' || itemCat === 'props';
    return itemCat === filterCat;
  }

  function toWebp(p) {
    return p ? String(p).replace(/\.(png|jpe?g|gif)$/i, '.webp') : '';
  }

  function to400Webp(p) {
    return p ? String(p).replace(/\.(png|jpe?g)$/i, '-400.webp') : '';
  }

  function renderThumbPicture(thumbPath, fallbackSrc, alt, width, height, sizes, loading, extraAttrs) {
    const tSrc = thumbPath || fallbackSrc || '';
    const w800 = toWebp(tSrc);
    const w400 = to400Webp(tSrc);
    const srcsetVal = (w400 && w400 !== tSrc && w800 && w800 !== tSrc)
      ? `${w400} 400w, ${w800} 800w`
      : (w800 && w800 !== tSrc ? `${w800} 800w` : '');
    const sourceTag = srcsetVal
      ? `<source type="image/webp" srcset="${esc(srcsetVal)}" sizes="${esc(sizes || '(max-width: 767px) 92vw, 410px')}" />`
      : '';
    const wAttr = width ? ` width="${esc(width)}"` : '';
    const hAttr = height ? ` height="${esc(height)}"` : '';
    const lAttr = loading ? ` loading="${esc(loading)}"` : '';
    const xAttr = extraAttrs ? ` ${extraAttrs}` : '';
    return `<picture>${sourceTag}<img src="${esc(tSrc)}" alt="${esc(alt || '')}"${wAttr}${hAttr}${lAttr} decoding="async"${xAttr} /></picture>`;
  }

  // -------------------------------------------------------------------------
  // HERO SHOWCASE CAROUSEL
  // -------------------------------------------------------------------------
  const HERO_FEATURED_SLUGS = [
    'graffiti-submarine',
    'stone-crystal-golem',
    'motorcycle-series',
    'hooded-hunter-game-pack'
  ];
  let heroFeaturedItems = [];
  let heroCurrentIdx = 0;

  function buildHeroShowcase() {
    heroFeaturedItems = HERO_FEATURED_SLUGS
      .map(slug => PROJECT_MAP.get(slug))
      .filter(Boolean)
      .map(p => ({
        project: p,
        cover: p.renders[0] || p.workflow[0] || p.cover
      }));

    const thumbsRow = document.getElementById('heroThumbsRow');
    if (!thumbsRow || !heroFeaturedItems.length) return;

    thumbsRow.innerHTML = heroFeaturedItems.map((item, idx) => `
      <button type="button" class="hero-thumb-btn ${idx === heroCurrentIdx ? 'is-active' : ''}" data-hero-idx="${idx}" aria-label="${esc(item.project.title)}">
        ${renderThumbPicture(item.cover.thumb || item.cover.src, item.cover.src, item.project.title, item.cover.width, item.cover.height, '(max-width: 389px) 44vw, 130px', 'eager')}
      </button>
    `).join('');

    thumbsRow.querySelectorAll('.hero-thumb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        heroCurrentIdx = Number(btn.dataset.heroIdx) || 0;
        updateHeroFrame();
      });
    });

    const stageWrap = document.getElementById('heroStageWrap');
    if (stageWrap && !stageWrap.dataset.wired) {
      stageWrap.dataset.wired = '1';
      stageWrap.addEventListener('click', () => {
        const current = heroFeaturedItems[heroCurrentIdx];
        if (!current) return;
        const gallery = current.project.renders.length ? current.project.renders : [current.cover];
        openLightbox(gallery.map(g => ({ ...g, project: current.project.slug, projectTitle: current.project.title, projectTitleTh: current.project.titleTh })), 0);
      });
    }

    updateHeroFrame();
  }

  function updateHeroFrame() {
    const item = heroFeaturedItems[heroCurrentIdx];
    if (!item) return;
    const img = document.getElementById('heroMainImg');
    const webpSource = document.getElementById('heroMainWebpSource');
    const titleEl = document.getElementById('heroFeaturedTitle');
    const metaEl = document.getElementById('heroFeaturedMeta');
    const linkEl = document.getElementById('heroDossierLink');

    if (webpSource) {
      const thumb400 = to400Webp(item.cover.thumb || '');
      const fullWebp = toWebp(item.cover.src);
      const w = Number(item.cover.width) || 1280;
      webpSource.srcset = thumb400
        ? `${thumb400} 400w, ${fullWebp} ${w}w`
        : `${fullWebp} ${w}w`;
    }
    if (img) {
      img.src = item.cover.src;
      img.alt = item.cover.alt || item.project.title;
      if (item.cover.width) img.width = item.cover.width;
      if (item.cover.height) img.height = item.cover.height;
      if (item.cover.lqip) img.style.backgroundImage = `url("${item.cover.lqip}")`;
    }
    if (titleEl) titleEl.textContent = localizedText(item.project.title, item.project.titleTh);
    if (metaEl) metaEl.textContent = `${item.project.software.slice(0, 2).join(' • ')} • ${item.project.polycount}`;
    if (linkEl) linkEl.href = `#/work/${item.project.slug}`;

    document.querySelectorAll('.hero-thumb-btn').forEach((b, idx) => {
      b.classList.toggle('is-active', idx === heroCurrentIdx);
    });
  }

  // -------------------------------------------------------------------------
  // SECTION 01: RENDERS WALL
  // -------------------------------------------------------------------------
  function renderFiltersBar() {
    const counts = {
      all: DATA.rendersFeed.length,
      characters: DATA.rendersFeed.filter(r => r.category === 'characters').length,
      hardsurface: DATA.rendersFeed.filter(r => r.category === 'hardsurface').length,
      'weapons-props': DATA.rendersFeed.filter(r => r.category === 'weapons' || r.category === 'props').length,
      environment: DATA.rendersFeed.filter(r => r.category === 'environment').length
    };

    const defs = [
      { id: 'all', en: `ALL (${counts.all})`, th: `ทั้งหมด (${counts.all})` },
      { id: 'characters', en: `CHARACTERS (${counts.characters})`, th: `ตัวละคร (${counts.characters})` },
      { id: 'hardsurface', en: `VEHICLES & HARD-SURFACE (${counts.hardsurface})`, th: `ยานพาหนะ & Hard-Surface (${counts.hardsurface})` },
      { id: 'weapons-props', en: `WEAPONS & PROPS (${counts['weapons-props']})`, th: `อาวุธ & พร็อพ (${counts['weapons-props']})` },
      { id: 'environment', en: `ENVIRONMENTS (${counts.environment})`, th: `ฉาก & สิ่งแวดล้อม (${counts.environment})` }
    ];

    const host = document.getElementById('renderFilters');
    if (!host) return;
    host.innerHTML = defs.map(d => `
      <button type="button" class="filter-btn ${state.renderCat === d.id ? 'is-active' : ''}" data-cat="${d.id}">
        ${esc(localizedText(d.en, d.th))}
      </button>
    `).join('');

    host.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.renderCat = btn.dataset.cat || 'all';
        state.renderLimit = 24;
        renderFiltersBar();
        renderBeautyWall();
      });
    });
  }

  function getFilteredRenders() {
    const q = state.renderSearch.trim().toLowerCase();
    return DATA.rendersFeed.filter(item => {
      if (!categoryMatch(item.category, state.renderCat)) return false;
      if (!q) return true;
      const hay = `${item.label} ${item.labelTh} ${item.projectTitle} ${item.projectTitleTh} ${item.originalFile} ${(item.software || []).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }

  function renderBeautyWall() {
    const grid = document.getElementById('rendersGrid');
    const moreWrap = document.getElementById('rendersLoadMoreWrap');
    if (!grid || !moreWrap) return;

    const list = getFilteredRenders();
    const visible = list.slice(0, state.renderLimit);

    if (!visible.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;padding:42px;text-align:center;background:var(--calm);border:2px dashed var(--pink);color:var(--ink-muted);">${esc(state.lang === 'th' ? 'ไม่พบผลงานที่ตรงกับคำค้นหา' : 'No matching renders found for this filter.')}</div>`;
      moreWrap.innerHTML = '';
      return;
    }

    const isDefaultUnfiltered = state.renderCat === 'all' && !state.renderSearch.trim();
    grid.innerHTML = visible.map((item, idx) => {
      const wideClass = isDefaultUnfiltered && (idx === 0 || idx === 1) ? 'is-wide' : '';
      const bgStyle = item.lqip ? `background-image:url('${esc(item.lqip)}');` : '';
      return `
        <article class="art-card ${wideClass} reveal is-revealed">
          <div class="art-thumb-wrap" data-lb-idx="${idx}" style="${bgStyle}" tabindex="0" role="button" aria-label="${esc(localizedText(item.label, item.labelTh))}">
            ${renderThumbPicture(item.thumb || item.src, item.src, item.alt || localizedText(item.label, item.labelTh), item.width, item.height, '(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 410px', 'lazy')}
            <span class="hover-sticker">${esc(t('inspectSticker'))}</span>
          </div>
          <div class="art-card-body">
            <div class="art-card-top">
              <a href="#/work/${esc(item.project)}" class="art-project-pill">${esc(localizedText(item.projectTitle, item.projectTitleTh))}</a>
              <span class="art-dim-badge">${esc(item.width)}&times;${esc(item.height)}</span>
            </div>
            <h3 class="art-title">${esc(localizedText(item.label, item.labelTh))}</h3>
          </div>
        </article>
      `;
    }).join('');

    grid.querySelectorAll('.art-thumb-wrap').forEach(el => {
      const openFn = () => openLightbox(list, Number(el.dataset.lbIdx) || 0);
      el.addEventListener('click', openFn);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openFn();
        }
      });
    });

    const remaining = list.length - visible.length;
    if (remaining > 0) {
      const nextStep = Math.min(24, remaining);
      moreWrap.innerHTML = `
        <button id="btnLoadMoreRenders" type="button" class="btn-load-more">
          ${esc(state.lang === 'th' ? `โหลดเพิ่มอีก ${nextStep} ภาพ (เหลือ ${remaining})` : `LOAD MORE +${nextStep} (${remaining} REMAINING)`)}
        </button>
        <button id="btnShowAllRenders" type="button" class="filter-btn">
          ${esc(state.lang === 'th' ? `แสดงทั้งหมด ${list.length} ภาพ` : `SHOW ALL ${list.length}`)}
        </button>
      `;
      document.getElementById('btnLoadMoreRenders')?.addEventListener('click', () => {
        state.renderLimit += 24;
        renderBeautyWall();
      });
      document.getElementById('btnShowAllRenders')?.addEventListener('click', () => {
        state.renderLimit = list.length;
        renderBeautyWall();
      });
    } else if (list.length > 24) {
      moreWrap.innerHTML = `<span class="art-dim-badge">${esc(state.lang === 'th' ? `แสดงครบทั้ง ${list.length} ภาพแล้ว` : `SHOWING ALL ${list.length} RENDERS`)}</span>`;
    } else {
      moreWrap.innerHTML = '';
    }

    if (window.STREET_FX) {
      window.STREET_FX.observeNew(grid);
      window.STREET_FX.refreshScroll();
    }
  }

  // -------------------------------------------------------------------------
  // SECTION 02: UNIFIED WORKFLOW (BEFORE/AFTER SLIDERS + ORDERED PIPELINE)
  // -------------------------------------------------------------------------
  function wireBeforeAfterSlider(sliderEl) {
    if (!sliderEl || sliderEl.dataset.baWired) return;
    sliderEl.dataset.baWired = '1';

    let pct = 50;
    const setPos = (nextPct) => {
      pct = Math.max(2, Math.min(98, nextPct));
      sliderEl.style.setProperty('--pos', pct + '%');
      sliderEl.setAttribute('aria-valuenow', String(Math.round(pct)));
    };
    setPos(50);

    let cachedRect = null;
    const calcFromClientX = (clientX) => {
      const rect = cachedRect || sliderEl.getBoundingClientRect();
      if (!rect.width) return 50;
      return ((clientX - rect.left) / rect.width) * 100;
    };

    let dragging = false;
    sliderEl.addEventListener('pointerdown', (e) => {
      dragging = true;
      cachedRect = sliderEl.getBoundingClientRect();
      sliderEl.setPointerCapture(e.pointerId);
      setPos(calcFromClientX(e.clientX));
    });
    sliderEl.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      setPos(calcFromClientX(e.clientX));
    });
    const endDrag = () => {
      dragging = false;
      cachedRect = null;
    };
    sliderEl.addEventListener('pointerup', endDrag);
    sliderEl.addEventListener('pointercancel', endDrag);

    sliderEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); setPos(pct - 5); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); setPos(pct + 5); }
    });
  }

  function renderBeforeAfterCardMarkup(pair) {
    const pObj = PROJECT_MAP.get(pair.project);
    const title = localizedText(pair.title, pair.titleTh);
    return `
      <article class="ba-card">
        <div class="ba-slider" role="slider" tabindex="0" aria-label="${esc(title)} comparison" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
          <div class="ba-layer-after">
            ${renderThumbPicture(pair.afterThumb || pair.afterSrc, pair.afterSrc, `${pair.title} ${pair.afterLabel}`, pair.width, pair.height, '(max-width: 767px) 90vw, 590px', 'lazy')}
          </div>
          <div class="ba-layer-before">
            ${renderThumbPicture(pair.beforeThumb || pair.beforeSrc, pair.beforeSrc, `${pair.title} ${pair.beforeLabel}`, pair.width, pair.height, '(max-width: 767px) 90vw, 590px', 'lazy')}
          </div>
          <span class="ba-tag ba-tag--before">${esc(pair.beforeLabel)}</span>
          <span class="ba-tag ba-tag--after">${esc(pair.afterLabel)}</span>
          <div class="ba-divider">
            <div class="ba-handle" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="15 18 9 12 15 6"/></svg>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" style="margin-left:-8px;"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>
        <div class="ba-foot">
          <h3>${esc(title)}</h3>
          <a class="ba-link" href="#/work/${esc(pair.project)}">${esc(pObj ? localizedText(pObj.polycount, pObj.polycount) : '')} &bull; ${esc(t('dossierBtn'))}</a>
        </div>
      </article>
    `;
  }

  function classifyWorkflowStepGroup(item) {
    const s = (item.stepLabel || '').toLowerCase();
    if (/wire|topo|hud|sub-d|retopo/.test(s)) return 'wireframe';
    if (/rig|unity|engine|pose|joint/.test(s)) return 'rigging';
    if (/clay|sculpt/.test(s)) return 'clay';
    return 'uv-ortho';
  }

  function renderUnifiedWorkflow() {
    const baHost = document.getElementById('beforeAfterGrid');
    const wfHost = document.getElementById('workflowFeedGrid');
    const stepBar = document.getElementById('workflowStepFilters');
    const slidersBlock = document.getElementById('workflowSlidersBlock');
    const pipeBlock = document.getElementById('workflowPipelineBlock');

    document.querySelectorAll('[data-wf-tab]').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.wfTab === state.wfTab);
    });
    if (slidersBlock) slidersBlock.style.display = state.wfTab === 'pipeline' ? 'none' : 'block';
    if (pipeBlock) pipeBlock.style.display = state.wfTab === 'sliders' ? 'none' : 'block';

    if (baHost) {
      const visibleBa = DATA.beforeAfterPairs.slice(0, state.baLimit);
      baHost.innerHTML = visibleBa.map(renderBeforeAfterCardMarkup).join('');
      baHost.querySelectorAll('.ba-slider').forEach(wireBeforeAfterSlider);

      const baMoreWrap = document.getElementById('baLoadMoreWrap');
      if (baMoreWrap) {
        const remBa = DATA.beforeAfterPairs.length - visibleBa.length;
        if (remBa > 0) {
          const nextBa = Math.min(6, remBa);
          baMoreWrap.innerHTML = `
            <button id="btnLoadMoreBa" type="button" class="btn-load-more">
              ${esc(state.lang === 'th' ? `โหลดสไลเดอร์เพิ่ม +${nextBa} (เหลือ ${remBa})` : `LOAD MORE +${nextBa} (${remBa} REMAINING)`)}
            </button>
            <button id="btnShowAllBa" type="button" class="filter-btn">
              ${esc(state.lang === 'th' ? `แสดงครบ ${DATA.beforeAfterPairs.length} คู่` : `SHOW ALL ${DATA.beforeAfterPairs.length}`)}
            </button>
          `;
          document.getElementById('btnLoadMoreBa')?.addEventListener('click', () => {
            state.baLimit += 6;
            renderUnifiedWorkflow();
          });
          document.getElementById('btnShowAllBa')?.addEventListener('click', () => {
            state.baLimit = DATA.beforeAfterPairs.length;
            renderUnifiedWorkflow();
          });
        } else if (DATA.beforeAfterPairs.length > 6) {
          baMoreWrap.innerHTML = `<span class="art-dim-badge">${esc(state.lang === 'th' ? `แสดงครบทั้ง ${DATA.beforeAfterPairs.length} คู่แล้ว` : `SHOWING ALL ${DATA.beforeAfterPairs.length} SLIDERS`)}</span>`;
        } else {
          baMoreWrap.innerHTML = '';
        }
      }
    }

    if (stepBar) {
      const counts = {
        all: DATA.workflowFeed.length,
        wireframe: DATA.workflowFeed.filter(w => classifyWorkflowStepGroup(w) === 'wireframe').length,
        rigging: DATA.workflowFeed.filter(w => classifyWorkflowStepGroup(w) === 'rigging').length,
        clay: DATA.workflowFeed.filter(w => classifyWorkflowStepGroup(w) === 'clay').length,
        'uv-ortho': DATA.workflowFeed.filter(w => classifyWorkflowStepGroup(w) === 'uv-ortho').length
      };
      const stepDefs = [
        { id: 'all', en: `ALL STEPS (${counts.all})`, th: `ทุกขั้นตอน (${counts.all})` },
        { id: 'wireframe', en: `WIREFRAME & TOPOLOGY (${counts.wireframe})`, th: `โครงสร้างตาข่าย (${counts.wireframe})` },
        { id: 'rigging', en: `RIGGING & UNITY (${counts.rigging})`, th: `ริกกิ้ง & Unity (${counts.rigging})` },
        { id: 'uv-ortho', en: `UV / SUBSTANCE / ORTHO (${counts['uv-ortho']})`, th: `UV / เท็กซ์เจอร์ / แปลน (${counts['uv-ortho']})` },
        { id: 'clay', en: `CLAY SCULPT (${counts.clay})`, th: `โมเดลดิน Clay (${counts.clay})` }
      ];
      stepBar.innerHTML = stepDefs.map(s => `
        <button type="button" class="filter-btn ${state.wfStepFilter === s.id ? 'is-active' : ''}" data-wf-step="${s.id}">
          ${esc(localizedText(s.en, s.th))}
        </button>
      `).join('');
      stepBar.querySelectorAll('[data-wf-step]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.wfStepFilter = btn.dataset.wfStep || 'all';
          state.wfLimit = 12;
          renderUnifiedWorkflow();
        });
      });
    }

    if (wfHost) {
      const wfMoreWrap = document.getElementById('workflowLoadMoreWrap');
      const filtered = DATA.workflowFeed.filter(w => state.wfStepFilter === 'all' || classifyWorkflowStepGroup(w) === state.wfStepFilter);
      const visibleWf = filtered.slice(0, state.wfLimit);
      wfHost.innerHTML = visibleWf.map((item, idx) => {
        const bgStyle = item.lqip ? `background-image:url('${esc(item.lqip)}');` : '';
        return `
          <article class="wf-card">
            <div class="wf-step-row">
              <span class="wf-step-pill">0${esc(item.step)} // ${esc(item.stepLabel)}</span>
              ${item.isGif ? '<span class="wf-gif-badge">ANIMATED GIF</span>' : `<span class="art-dim-badge">${esc(item.width)}&times;${esc(item.height)}</span>`}
            </div>
            <div class="art-thumb-wrap" data-wf-idx="${idx}" style="${bgStyle}" tabindex="0" role="button" aria-label="${esc(localizedText(item.label, item.labelTh))}">
              ${renderThumbPicture(item.thumb || item.src, item.src, item.alt || localizedText(item.label, item.labelTh), item.width, item.height, '(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 410px', 'lazy')}
              <span class="hover-sticker">${esc(t('inspectSticker'))}</span>
            </div>
            <div class="art-card-body">
              <a href="#/work/${esc(item.project)}" class="art-project-pill">${esc(localizedText(item.projectTitle, item.projectTitleTh))}</a>
              <h3 class="art-title">${esc(localizedText(item.label, item.labelTh))}</h3>
            </div>
          </article>
        `;
      }).join('');

      wfHost.querySelectorAll('.art-thumb-wrap').forEach(el => {
        const openFn = () => openLightbox(filtered, Number(el.dataset.wfIdx) || 0);
        el.addEventListener('click', openFn);
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFn();
          }
        });
      });

      if (wfMoreWrap) {
        const remaining = filtered.length - visibleWf.length;
        if (remaining > 0) {
          const nextStep = Math.min(12, remaining);
          wfMoreWrap.innerHTML = `
            <button id="btnLoadMoreWf" type="button" class="btn-load-more">
              ${esc(state.lang === 'th' ? `โหลดเพิ่มอีก ${nextStep} ขั้นตอน (เหลือ ${remaining})` : `LOAD MORE +${nextStep} (${remaining} REMAINING)`)}
            </button>
            <button id="btnShowAllWf" type="button" class="filter-btn">
              ${esc(state.lang === 'th' ? `แสดงทั้งหมด ${filtered.length}` : `SHOW ALL ${filtered.length}`)}
            </button>
          `;
          document.getElementById('btnLoadMoreWf')?.addEventListener('click', () => {
            state.wfLimit += 12;
            renderUnifiedWorkflow();
          });
          document.getElementById('btnShowAllWf')?.addEventListener('click', () => {
            state.wfLimit = filtered.length;
            renderUnifiedWorkflow();
          });
        } else if (filtered.length > 12) {
          wfMoreWrap.innerHTML = `<span class="art-dim-badge">${esc(state.lang === 'th' ? `แสดงครบทั้ง ${filtered.length} ขั้นตอนแล้ว` : `SHOWING ALL ${filtered.length} BREAKDOWNS`)}</span>`;
        } else {
          wfMoreWrap.innerHTML = '';
        }
      }
    }

    if (window.STREET_FX) window.STREET_FX.refreshScroll();
  }

  // -------------------------------------------------------------------------
  // SECTION 03: SEPARATED MOTION GROUPS (CONCURRENCY-CAPPED + OFFSCREEN AUTO-PAUSE)
  // -------------------------------------------------------------------------
  let motionVideoObserver = null;

  function ensureMotionVideoObserver() {
    if (motionVideoObserver || !('IntersectionObserver' in window)) return motionVideoObserver;
    motionVideoObserver = new IntersectionObserver((entries) => {
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (!entry.isIntersecting && state.activeInlineVideoCard === entry.target) {
          stopActiveInlineVideo();
        }
      }
    }, { threshold: 0.04 });
    return motionVideoObserver;
  }

  function stopActiveInlineVideo() {
    const prev = state.activeInlineVideoCard;
    if (motionVideoObserver) motionVideoObserver.disconnect();
    if (!prev) return;
    const vid = prev.querySelector('video');
    const posterPic = prev.querySelector('picture') || prev.querySelector('img[data-poster-img]');
    const playPill = prev.querySelector('.motion-play-pill');
    if (vid) {
      vid.pause();
      vid.removeAttribute('src');
      vid.load();
      vid.remove();
    }
    if (posterPic) posterPic.style.display = 'block';
    if (playPill) playPill.style.display = 'inline-flex';
    state.activeInlineVideoCard = null;
  }

  function renderMotionClipCardMarkup(clip, bandAccent) {
    const bgStyle = clip.posterLqip ? `background-image:url('${esc(clip.posterLqip)}');background-size:cover;` : '';
    return `
      <article class="motion-card" data-clip-id="${esc(clip.id)}">
        <div class="motion-stage" style="${bgStyle}">
          ${renderThumbPicture(clip.thumb || clip.poster, clip.poster, clip.alt, clip.width, clip.height, '(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 410px', 'lazy', 'data-poster-img')}
          <span class="motion-play-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            ${esc(t('playInline'))}
          </span>
          <span class="motion-dur-pill">${esc(formatDuration(clip.durationSec))} &bull; ${esc(clip.sizeMB)} MB</span>
        </div>
        <h3 class="motion-card-title">${esc(localizedText(clip.label, clip.labelTh))}</h3>
        <div class="motion-card-foot">
          <span>${esc(clip.width)}&times;${esc(clip.height)} H.264</span>
          <div style="display:flex;gap:8px;align-items:center;">
            <a class="art-project-pill" style="color:${esc(bandAccent)};font-size:0.68rem;" href="#/work/${esc(clip.project)}">${esc(localizedText(clip.projectTitle, clip.projectTitleTh))}</a>
            <button type="button" class="motion-open-btn" data-open-theater="${esc(clip.id)}">${esc(t('playTheater'))}</button>
          </div>
        </div>
      </article>
    `;
  }

  function wireMotionCardEvents(containerEl, clipsLookup) {
    containerEl.querySelectorAll('.motion-stage').forEach(stage => {
      stage.addEventListener('click', () => {
        const card = stage.closest('.motion-card');
        if (!card) return;
        const clip = clipsLookup.get(card.dataset.clipId);
        if (!clip) return;

        if (state.activeInlineVideoCard === stage) return;
        stopActiveInlineVideo();

        const posterPic = stage.querySelector('picture') || stage.querySelector('img[data-poster-img]');
        const playPill = stage.querySelector('.motion-play-pill');
        if (posterPic) posterPic.style.display = 'none';
        if (playPill) playPill.style.display = 'none';

        const video = document.createElement('video');
        video.src = clip.src;
        video.poster = toWebp(clip.poster);
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.controls = true;
        video.autoplay = true;
        stage.prepend(video);
        video.play().catch(() => {});
        state.activeInlineVideoCard = stage;
        const obs = ensureMotionVideoObserver();
        if (obs) obs.observe(stage);
      });
    });

    containerEl.querySelectorAll('[data-open-theater]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const clip = clipsLookup.get(btn.dataset.openTheater);
        if (clip) openMotionModal(clip);
      });
    });
  }

  function renderMotionSection() {
    const host = document.getElementById('motionGroupsContainer');
    if (!host) return;

    const clipsLookup = new Map();
    DATA.motionGroups.forEach(g => g.clips.forEach(c => clipsLookup.set(c.id, c)));

    host.innerHTML = DATA.motionGroups.map(group => `
      <div class="motion-band" style="--band-accent:${esc(group.accent)};">
        <div class="motion-band-head">
          <div>
            <h3 class="motion-band-title">${esc(localizedText(group.title, group.titleTh))}</h3>
            <p class="motion-band-desc">${esc(group.desc)}</p>
          </div>
          <span class="motion-band-count">${group.clips.length} CLIPS // H.264 MP4</span>
        </div>
        <div class="motion-clips-grid">
          ${group.clips.map(clip => renderMotionClipCardMarkup(clip, group.accent)).join('')}
        </div>
      </div>
    `).join('');

    wireMotionCardEvents(host, clipsLookup);
  }

  // -------------------------------------------------------------------------
  // SECTION 04: 30 PROJECT ARCHIVE
  // -------------------------------------------------------------------------
  function renderProjectsArchive() {
    const host = document.getElementById('projectsArchiveGrid');
    if (!host) return;

    host.innerHTML = DATA.projects.map(proj => {
      const cov = proj.cover || {};
      const rCount = proj.renders.length;
      const wCount = proj.workflow.length;
      const aCount = proj.animations.length;
      return `
        <a href="#/work/${esc(proj.slug)}" class="dossier-card" style="--card-accent:${esc(proj.accent || '#FF1FA2')};">
          <div class="dossier-cover">
            ${renderThumbPicture(cov.thumb || cov.src || '', cov.src || '', cov.alt || proj.title, cov.width || 800, cov.height || 450, '(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 310px', 'lazy')}
            <div class="dossier-counts">
              ${rCount ? `<span class="dossier-count-chip">${rCount} Renders</span>` : ''}
              ${wCount ? `<span class="dossier-count-chip">${wCount} Workflow</span>` : ''}
              ${aCount ? `<span class="dossier-count-chip">${aCount} Motion</span>` : ''}
            </div>
          </div>
          <div>
            <p class="dossier-role">${esc(localizedText(proj.role, proj.roleTh))} &bull; ${esc(proj.year)}</p>
            <h3 class="dossier-title">${esc(localizedText(proj.title, proj.titleTh))}</h3>
            <p class="dossier-desc">${esc(localizedText(proj.description, proj.descriptionTh))}</p>
          </div>
        </a>
      `;
    }).join('');
  }

  // -------------------------------------------------------------------------
  // DEDICATED PROJECT DETAIL ROUTER VIEW (#/work/[slug])
  // -------------------------------------------------------------------------
  function openProjectDetail(slug) {
    const projIdx = DATA.projects.findIndex(p => p.slug === slug);
    const proj = projIdx >= 0 ? DATA.projects[projIdx] : null;
    const wallView = document.getElementById('wallView');
    const detailView = document.getElementById('projectDetailView');
    const container = document.getElementById('projectDetailContainer');
    if (!proj || !wallView || !detailView || !container) {
      closeProjectDetail();
      return;
    }

    stopActiveInlineVideo();
    if (!wallView.classList.contains('is-hidden')) {
      state.lastWallScrollY = window.scrollY;
    }
    wallView.classList.add('is-hidden');
    detailView.classList.add('is-active');
    detailView.style.setProperty('--detail-accent', proj.accent || '#1FD0E8');

    const prevProj = DATA.projects[(projIdx - 1 + DATA.projects.length) % DATA.projects.length];
    const nextProj = DATA.projects[(projIdx + 1) % DATA.projects.length];
    const heroMedia = proj.renders[0] || proj.workflow[0] || proj.cover;

    const highlightTodo = (val) => {
      const s = esc(val);
      return /TODO:/i.test(val) ? `<span style="color:var(--yellow);">${s}</span>` : s;
    };

    const allClipsMap = new Map(proj.animations.map(a => [a.id, a]));

    container.innerHTML = `
      <div class="detail-topbar">
        <a href="#projects" class="detail-back-btn" id="detailBackBtn">${esc(t('backToWall'))}</a>
        <div class="detail-nav-pair">
          <a href="#/work/${esc(prevProj.slug)}" class="filter-btn">&larr; ${esc(localizedText(prevProj.title, prevProj.titleTh))}</a>
          <a href="#/work/${esc(nextProj.slug)}" class="filter-btn">${esc(localizedText(nextProj.title, nextProj.titleTh))} &rarr;</a>
        </div>
      </div>

      <div style="margin-bottom:24px;">
        <span class="stencil-kicker" style="background:${esc(proj.accent || '#FF1FA2')};color:${proj.accent === '#FF1FA2' ? '#fff' : '#0a0a0a'};">${esc(proj.category.toUpperCase())} // ${esc(proj.year)}</span>
        <h1 class="sec-title" style="text-shadow:4px 4px 0 ${esc(proj.accent || '#1FD0E8')};">${esc(localizedText(proj.title, proj.titleTh))}</h1>
      </div>

      <div class="detail-hero-grid">
        <div class="hero-poster-wrap" style="box-shadow:8px 8px 0 ${esc(proj.accent || '#FF1FA2')};">
          <div class="hero-stage" id="detailHeroImgWrap">
            ${heroMedia ? `<picture>
              <source type="image/webp" srcset="${esc(heroMedia.thumb ? `${to400Webp(heroMedia.thumb)} 400w, ${toWebp(heroMedia.src)} ${heroMedia.width || 1280}w` : `${toWebp(heroMedia.src)} ${heroMedia.width || 1280}w`)}" sizes="(max-width: 1023px) 92vw, 760px" />
              <img src="${esc(heroMedia.src)}" alt="${esc(heroMedia.alt || proj.title)}" width="${esc(heroMedia.width || 1280)}" height="${esc(heroMedia.height || 720)}" decoding="async" fetchpriority="high" />
            </picture>` : ''}
          </div>
          <p style="margin:14px 4px 4px;color:var(--ink-muted);line-height:1.7;">${highlightTodo(localizedText(proj.description, proj.descriptionTh))}</p>
        </div>

        <aside class="specs-card">
          <div class="channel-label" style="color:${esc(proj.accent || '#1FD0E8')};">TECHNICAL DOSSIER</div>
          <div class="specs-table">
            <div class="spec-row"><span>Role</span><strong>${esc(localizedText(proj.role, proj.roleTh))}</strong></div>
            <div class="spec-row"><span>Software Stack</span><strong>${esc(proj.software.join(' • '))}</strong></div>
            <div class="spec-row"><span>Polycount / Scene Spec</span><strong>${highlightTodo(proj.polycount)}</strong></div>
            <div class="spec-row"><span>Production Time</span><strong>${highlightTodo(proj.timeSpent)}</strong></div>
            <div class="spec-row"><span>Year</span><strong>${esc(proj.year)}</strong></div>
            <div class="spec-row" style="border:none;padding-bottom:0;"><span>Tags</span><strong>${esc(proj.tags.join(' / '))}</strong></div>
          </div>
        </aside>
      </div>

      ${proj.beforeAfter.length ? `
        <h2 class="detail-subhead">WIREFRAME VS BEAUTY COMPARISON (${proj.beforeAfter.length})</h2>
        <div class="ba-grid" id="detailBaGrid">${proj.beforeAfter.map(renderBeforeAfterCardMarkup).join('')}</div>
      ` : ''}

      ${proj.renders.length ? `
        <h2 class="detail-subhead">FINAL BEAUTY GALLERY (${proj.renders.length})</h2>
        <div class="renders-grid" id="detailRendersGrid">
          ${proj.renders.map((r, i) => `
            <article class="art-card">
              <div class="art-thumb-wrap" data-det-r="${i}" tabindex="0" role="button">
                ${renderThumbPicture(r.thumb || r.src, r.src, r.alt || localizedText(r.label, r.labelTh), r.width, r.height, '(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 410px', 'lazy')}
                <span class="hover-sticker">${esc(t('inspectSticker'))}</span>
              </div>
              <div class="art-card-body">
                <span class="art-dim-badge">${esc(r.width)}&times;${esc(r.height)}</span>
                <h3 class="art-title">${esc(localizedText(r.label, r.labelTh))}</h3>
              </div>
            </article>
          `).join('')}
        </div>
      ` : ''}

      ${proj.workflow.length ? `
        <h2 class="detail-subhead">ORDERED WORKFLOW BREAKDOWN (${proj.workflow.length})</h2>
        <div class="workflow-grid" id="detailWorkflowGrid">
          ${proj.workflow.map((w, i) => `
            <article class="wf-card">
              <div class="wf-step-row">
                <span class="wf-step-pill">0${esc(w.step)} // ${esc(w.stepLabel)}</span>
                ${w.isGif ? '<span class="wf-gif-badge">GIF</span>' : `<span class="art-dim-badge">${esc(w.width)}&times;${esc(w.height)}</span>`}
              </div>
              <div class="art-thumb-wrap" data-det-w="${i}" tabindex="0" role="button">
                ${renderThumbPicture(w.thumb || w.src, w.src, w.alt || localizedText(w.label, w.labelTh), w.width, w.height, '(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 410px', 'lazy')}
                <span class="hover-sticker">${esc(t('inspectSticker'))}</span>
              </div>
              <h3 class="art-title">${esc(localizedText(w.label, w.labelTh))}</h3>
            </article>
          `).join('')}
        </div>
      ` : ''}

      ${proj.animations.length ? `
        <h2 class="detail-subhead">PLAYABLE ANIMATIONS &amp; REELS (${proj.animations.length})</h2>
        <div class="motion-clips-grid" id="detailMotionGrid">
          ${proj.animations.map(a => renderMotionClipCardMarkup(a, proj.accent || '#FF8A1F')).join('')}
        </div>
      ` : ''}
    `;

    // Wire sliders, lightbox & videos in detail page
    container.querySelectorAll('.ba-slider').forEach(wireBeforeAfterSlider);
    const enrichedRenders = proj.renders.map(r => ({ ...r, project: proj.slug, projectTitle: proj.title, projectTitleTh: proj.titleTh }));
    const enrichedWf = proj.workflow.map(w => ({ ...w, project: proj.slug, projectTitle: proj.title, projectTitleTh: proj.titleTh }));

    document.getElementById('detailHeroImgWrap')?.addEventListener('click', () => {
      openLightbox(enrichedRenders.length ? enrichedRenders : enrichedWf, 0);
    });
    container.querySelectorAll('[data-det-r]').forEach(el => {
      el.addEventListener('click', () => openLightbox(enrichedRenders, Number(el.dataset.detR) || 0));
    });
    container.querySelectorAll('[data-det-w]').forEach(el => {
      el.addEventListener('click', () => openLightbox(enrichedWf, Number(el.dataset.detW) || 0));
    });
    wireMotionCardEvents(container, allClipsMap);

    if (window.STREET_FX) {
      window.STREET_FX.scrollTo(0, true);
      window.STREET_FX.refreshScroll();
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  function closeProjectDetail(hashTarget) {
    const wallView = document.getElementById('wallView');
    const detailView = document.getElementById('projectDetailView');
    if (!wallView || !detailView) return;
    stopActiveInlineVideo();
    detailView.classList.remove('is-active');
    wallView.classList.remove('is-hidden');
    if (window.STREET_FX) window.STREET_FX.refreshScroll();

    if (hashTarget && hashTarget.startsWith('#') && !hashTarget.startsWith('#/work/')) {
      const targetEl = document.querySelector(hashTarget);
      if (targetEl) {
        setTimeout(() => {
          if (window.STREET_FX) window.STREET_FX.scrollTo(targetEl);
          else targetEl.scrollIntoView({ behavior: 'smooth' });
        }, 40);
        return;
      }
    }
    if (state.lastWallScrollY > 0) {
      if (window.STREET_FX) window.STREET_FX.scrollTo(state.lastWallScrollY, true);
      else window.scrollTo({ top: state.lastWallScrollY, behavior: 'auto' });
    }
  }

  function handleRouteChange() {
    const h = window.location.hash || '';
    if (h.startsWith('#/work/')) {
      const slug = decodeURIComponent(h.slice(7)).replace(/\/+$/, '');
      if (PROJECT_MAP.has(slug)) {
        openProjectDetail(slug);
        return;
      }
    }
    closeProjectDetail(h);
  }

  // -------------------------------------------------------------------------
  // LIGHTBOX MODAL
  // -------------------------------------------------------------------------
  function openLightbox(items, idx) {
    if (!items || !items.length) return;
    state.lightboxList = items;
    state.lightboxIdx = Math.max(0, Math.min(items.length - 1, idx));
    const modal = document.getElementById('lightboxModal');
    if (modal) modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (window.STREET_FX) window.STREET_FX.pauseScroll();
    updateLightboxFrame();
  }

  function updateLightboxFrame() {
    const item = state.lightboxList[state.lightboxIdx];
    if (!item) return;
    const img = document.getElementById('lbImg');
    const title = document.getElementById('lbTitle');
    const left = document.getElementById('lbCaptionLeft');
    const right = document.getElementById('lbCaptionRight');
    const dosBtn = document.getElementById('lbDossierBtn');

    if (img) {
      img.classList.remove('is-zoomed');
      const preferred = toWebp(item.src);
      img.onerror = () => {
        img.onerror = null;
        if (item.src) img.src = item.src;
      };
      img.src = preferred || item.src;
      img.alt = item.alt || item.label || '';
    }
    if (title) title.textContent = localizedText(item.label, item.labelTh);
    if (left) left.textContent = `${state.lightboxIdx + 1} / ${state.lightboxList.length} — ${localizedText(item.projectTitle, item.projectTitleTh) || ''}`;
    if (right) right.textContent = `${item.width || '-'} x ${item.height || '-'} | src: ${item.originalFile || ''}`;
    if (dosBtn) {
      dosBtn.style.display = item.project ? 'inline-block' : 'none';
      dosBtn.onclick = () => {
        closeLightbox();
        window.location.hash = `#/work/${item.project}`;
      };
    }
  }

  function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (modal) modal.classList.remove('is-open');
    document.body.style.overflow = '';
    if (window.STREET_FX) window.STREET_FX.resumeScroll();
  }

  // -------------------------------------------------------------------------
  // MOTION THEATER MODAL
  // -------------------------------------------------------------------------
  const SPEEDS = [1.0, 1.5, 2.0, 0.5];
  let speedIdx = 0;

  function openMotionModal(clip) {
    stopActiveInlineVideo();
    state.activeMotionClip = clip;
    speedIdx = 0;
    const modal = document.getElementById('motionModal');
    const video = document.getElementById('mvVideo');
    const title = document.getElementById('mvTitle');
    const left = document.getElementById('mvMetaLeft');
    const right = document.getElementById('mvMetaRight');
    const dosBtn = document.getElementById('mvDossierBtn');
    const spBtn = document.getElementById('mvSpeedBtn');
    const lpBtn = document.getElementById('mvLoopBtn');

    if (title) title.textContent = localizedText(clip.label, clip.labelTh);
    if (left) left.textContent = `${localizedText(clip.projectTitle, clip.projectTitleTh)} • ${formatDuration(clip.durationSec)} • ${clip.sizeMB} MB`;
    if (right) right.textContent = `${clip.width} x ${clip.height} Native H.264 • src: ${clip.originalFile}`;
    if (spBtn) spBtn.textContent = 'SPEED: 1.0x';
    if (lpBtn) lpBtn.textContent = 'LOOP: ON';
    if (dosBtn) {
      dosBtn.onclick = () => {
        closeMotionModal();
        window.location.hash = `#/work/${clip.project}`;
      };
    }

    if (video) {
      video.poster = toWebp(clip.poster);
      video.src = clip.src;
      video.loop = true;
      video.playbackRate = 1.0;
      if (modal) modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      if (window.STREET_FX) window.STREET_FX.pauseScroll();
      video.play().catch(() => {});
    }
  }

  function closeMotionModal() {
    const modal = document.getElementById('motionModal');
    const video = document.getElementById('mvVideo');
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    if (modal) modal.classList.remove('is-open');
    document.body.style.overflow = '';
    if (window.STREET_FX) window.STREET_FX.resumeScroll();
    state.activeMotionClip = null;
  }

  // -------------------------------------------------------------------------
  // BILINGUAL APPLICATION & UI EVENTS
  // -------------------------------------------------------------------------
  function applyLanguage() {
    document.documentElement.lang = state.lang;
    const langBtnText = document.getElementById('langBadgeText');
    if (langBtnText) langBtnText.textContent = state.lang === 'th' ? 'TH -> EN' : 'EN -> TH';

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      if (k && I18N[state.lang][k]) {
        el.textContent = I18N[state.lang][k];
      }
    });

    const searchInput = document.getElementById('renderSearchInput');
    if (searchInput) searchInput.placeholder = t('searchPh');

    updateHeroFrame();
    renderFiltersBar();
    renderBeautyWall();
    renderUnifiedWorkflow();
    renderMotionSection();
    renderProjectsArchive();

    if (window.location.hash.startsWith('#/work/')) {
      handleRouteChange();
    }
  }

  function bindGlobalUi() {
    document.getElementById('langToggleBtn')?.addEventListener('click', () => {
      state.lang = state.lang === 'en' ? 'th' : 'en';
      try { localStorage.setItem('sw_lang', state.lang); } catch {}
      applyLanguage();
    });

    // Search Debounce
    let searchTimer = null;
    document.getElementById('renderSearchInput')?.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      const val = e.target.value || '';
      searchTimer = setTimeout(() => {
        state.renderSearch = val;
        state.renderLimit = 24;
        renderBeautyWall();
      }, 140);
    });

    // Workflow Sub-Tabs
    document.querySelectorAll('[data-wf-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.wfTab = btn.dataset.wfTab || 'all';
        renderUnifiedWorkflow();
      });
    });

    // Mobile Menu
    const mobBtn = document.getElementById('mobileMenuBtn');
    const mobDrawer = document.getElementById('mobileDrawer');
    mobBtn?.addEventListener('click', () => {
      const open = mobDrawer.classList.toggle('is-open');
      mobBtn.setAttribute('aria-expanded', String(open));
    });
    mobDrawer?.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobDrawer.classList.remove('is-open');
        mobBtn?.setAttribute('aria-expanded', 'false');
      });
    });

    // Back to Top
    document.getElementById('backToTopBtn')?.addEventListener('click', () => {
      if (window.STREET_FX) window.STREET_FX.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Smooth Lenis navigation for same-page section links
    document.addEventListener('click', (e) => {
      const a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.startsWith('#/work/')) return;
      if (window.location.hash.startsWith('#/work/')) return;
      const target = document.querySelector(href);
      if (!target || !window.STREET_FX) return;
      e.preventDefault();
      window.STREET_FX.scrollTo(target);
      try { history.replaceState(null, '', href); } catch {}
    });

    // Auto-pause active videos when tab becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) return;
      stopActiveInlineVideo();
      const mv = document.getElementById('mvVideo');
      if (mv && !mv.paused) mv.pause();
    });

    // Lightbox Buttons
    document.getElementById('lbCloseBtn')?.addEventListener('click', closeLightbox);
    document.getElementById('lbPrevBtn')?.addEventListener('click', () => {
      state.lightboxIdx = (state.lightboxIdx - 1 + state.lightboxList.length) % state.lightboxList.length;
      updateLightboxFrame();
    });
    document.getElementById('lbNextBtn')?.addEventListener('click', () => {
      state.lightboxIdx = (state.lightboxIdx + 1) % state.lightboxList.length;
      updateLightboxFrame();
    });
    document.getElementById('lbZoomBtn')?.addEventListener('click', () => {
      document.getElementById('lbImg')?.classList.toggle('is-zoomed');
    });
    document.getElementById('lightboxModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'lightboxModal' || e.target.id === 'lbStage') closeLightbox();
    });

    // Motion Modal Buttons
    document.getElementById('mvCloseBtn')?.addEventListener('click', closeMotionModal);
    document.getElementById('motionModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'motionModal') closeMotionModal();
    });
    document.getElementById('mvSpeedBtn')?.addEventListener('click', (e) => {
      speedIdx = (speedIdx + 1) % SPEEDS.length;
      const r = SPEEDS[speedIdx];
      const v = document.getElementById('mvVideo');
      if (v) v.playbackRate = r;
      e.currentTarget.textContent = `SPEED: ${r.toFixed(1)}x`;
    });
    document.getElementById('mvLoopBtn')?.addEventListener('click', (e) => {
      const v = document.getElementById('mvVideo');
      if (!v) return;
      v.loop = !v.loop;
      e.currentTarget.textContent = `LOOP: ${v.loop ? 'ON' : 'OFF'}`;
    });

    // Escape & Arrow Key Controls
    window.addEventListener('keydown', (e) => {
      const lbOpen = document.getElementById('lightboxModal')?.classList.contains('is-open');
      const mvOpen = document.getElementById('motionModal')?.classList.contains('is-open');
      if (e.key === 'Escape') {
        if (lbOpen) closeLightbox();
        if (mvOpen) closeMotionModal();
      } else if (lbOpen && e.key === 'ArrowLeft') {
        state.lightboxIdx = (state.lightboxIdx - 1 + state.lightboxList.length) % state.lightboxList.length;
        updateLightboxFrame();
      } else if (lbOpen && e.key === 'ArrowRight') {
        state.lightboxIdx = (state.lightboxIdx + 1) % state.lightboxList.length;
        updateLightboxFrame();
      }
    });

    // Copy Email
    document.getElementById('copyEmailBtn')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      try {
        await navigator.clipboard.writeText('Ballyuyio@gmail.com');
        btn.textContent = state.lang === 'th' ? 'คัดลอกแล้ว!' : 'COPIED!';
        setTimeout(() => { btn.textContent = t('copyBtn'); }, 1800);
      } catch {
        window.location.href = 'mailto:Ballyuyio@gmail.com';
      }
    });

    // Validated Contact Form -> Builds clean mailto brief
    const form = document.getElementById('contactForm');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cName').value.trim();
      const email = document.getElementById('cEmail').value.trim();
      const type = document.getElementById('cType').value;
      const budget = document.getElementById('cBudget').value;
      const msg = document.getElementById('cMessage').value.trim();

      const errName = document.getElementById('errName');
      const errEmail = document.getElementById('errEmail');
      const errMsg = document.getElementById('errMessage');
      const statusBox = document.getElementById('contactFormStatus');

      errName.textContent = '';
      errEmail.textContent = '';
      errMsg.textContent = '';
      let valid = true;

      if (name.length < 2) {
        errName.textContent = state.lang === 'th' ? 'กรุณาระบุชื่ออย่างน้อย 2 ตัวอักษร' : 'Please enter your name.';
        valid = false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errEmail.textContent = state.lang === 'th' ? 'กรุณากรอกอีเมลให้ถูกต้อง' : 'Please enter a valid email address.';
        valid = false;
      }
      if (msg.length < 10) {
        errMsg.textContent = state.lang === 'th' ? 'กรุณาระบุรายละเอียดอย่างน้อย 10 ตัวอักษร' : 'Please add brief project details (10+ characters).';
        valid = false;
      }
      if (!valid) return;

      const subject = encodeURIComponent(`[3D Portfolio Brief] ${type} — ${name}`);
      const body = encodeURIComponent(`From: ${name} (${email})\nProject Type: ${type}\nScope/Budget: ${budget}\n\nBrief:\n${msg}`);
      window.location.href = `mailto:Ballyuyio@gmail.com?subject=${subject}&body=${body}`;

      if (statusBox) {
        statusBox.classList.add('is-visible');
        statusBox.textContent = state.lang === 'th'
          ? 'เปิดแอปอีเมลพร้อมข้อความสรุปให้เรียบร้อยแล้ว หรือส่งตรงถึง Ballyuyio@gmail.com'
          : 'Mail draft ready for Ballyuyio@gmail.com. If your mail app did not open, copy the email directly.';
      }
    });

    window.addEventListener('hashchange', handleRouteChange);
  }

  // -------------------------------------------------------------------------
  // BOOTSTRAP
  // -------------------------------------------------------------------------
  function bootstrap() {
    if (window.STREET_FX) window.STREET_FX.init();
    buildHeroShowcase();
    bindGlobalUi();
    applyLanguage();

    // Update Hero dynamic stats directly from payload
    const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v); };
    setText('statRenders', DATA.rendersFeed.length);
    setText('statSliders', DATA.beforeAfterPairs.length);
    setText('statMotion', DATA.report.counts.animations);
    setText('statProjects', DATA.projects.length);

    handleRouteChange();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();

