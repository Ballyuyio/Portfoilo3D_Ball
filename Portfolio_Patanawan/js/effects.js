/**
 * STREET WALL // CREATIVE FX & LIVING WALL ENGINE (Phase 2–4)
 * 1. Living 3D Wireframe + Drifting Stencil Wall Background (#wallBgCanvas) + Click Paint Splatter
 * 2. Optional Web Audio API Spray-Can SFX (OFF by default, 0 KB external audio)
 * 3. Custom Spray-Nozzle Cursor Reticle (Desktop fine-pointer only)
 * 4. Scroll Progress Spray Bar + Active Nav Scroll Spy
 * 5. Hero Stencil Text-Scramble + Stats Count-Up
 * 6. Magnetic Primary Buttons + Paint-Splatter Ripple
 * 7. 3D Perspective Card Tilt + Dynamic Glare (Desktop high-tier only)
 * 8. Lightbox Touch Swipe (Mobile/Tablet)
 * 9. Project Dossier Spray-Wipe Transition + Toast Notifications
 * 10. Easter Egg: Click BALL.3D logo 3x for Graffiti Spray Party!
 */
(function () {
  'use strict';

  const reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const finePointer = !!(window.matchMedia && window.matchMedia('(pointer: fine)').matches);
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  // -------------------------------------------------------------------------
  // 1. TOAST NOTIFICATION HELPER
  // -------------------------------------------------------------------------
  let toastTimer = null;
  function showToast(msg, durationMs) {
    const el = document.getElementById('swToast');
    if (!el || !msg) return;
    el.textContent = msg;
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove('is-show');
    }, durationMs || 2200);
  }

  // -------------------------------------------------------------------------
  // 2. OPTIONAL WEB AUDIO API SPRAY-CAN SOUND ENGINE (OFF BY DEFAULT)
  // -------------------------------------------------------------------------
  let soundEnabled = (() => {
    try { return localStorage.getItem('sw_sound') === '1'; } catch { return false; }
  })();
  let audioCtx = null;

  function ensureAudioCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  // สังเคราะห์เสียงสเปรย์พ่นสี / เสียงลูกแก้วเขย่ากระป๋องเบา ๆ (ไม่ใช้ไฟล์เสียงภายนอก)
  function playSfx(type) {
    if (!soundEnabled || reducedMotion) return;
    const ctx = ensureAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    try {
      if (type === 'spray' || type === 'wipe') {
        const dur = type === 'wipe' ? 0.22 : 0.12;
        const bufSize = Math.floor(ctx.sampleRate * dur);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.48));
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(type === 'wipe' ? 2400 : 3400, now);
        filter.Q.value = 1.4;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.075, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        src.start(now);
      } else {
        // เสียงคลิกเบา ๆ เหมือนหัวฉีด/สติ๊กเกอร์
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(190, now + 0.045);
        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.055);
      }
    } catch {}
  }

  function initSoundToggle() {
    const btn = document.getElementById('soundToggleBtn');
    const icon = document.getElementById('soundIconSvg');
    if (!btn) return;

    const syncUi = () => {
      btn.classList.toggle('is-on', soundEnabled);
      btn.setAttribute('aria-pressed', String(soundEnabled));
      btn.setAttribute('aria-label', soundEnabled ? 'Mute spray sound effects' : 'Enable spray sound effects');
      if (icon) {
        icon.innerHTML = soundEnabled
          ? '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>'
          : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
      }
    };

    syncUi();
    btn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      try { localStorage.setItem('sw_sound', soundEnabled ? '1' : '0'); } catch {}
      syncUi();
      if (soundEnabled) {
        playSfx('spray');
        const isTh = document.documentElement.lang === 'th';
        showToast(isTh ? 'เปิดเสียงเอฟเฟกต์สเปรย์แล้ว (SFX ON)' : 'SPRAY SFX ENABLED');
      } else {
        const isTh = document.documentElement.lang === 'th';
        showToast(isTh ? 'ปิดเสียงเอฟเฟกต์แล้ว (SFX OFF)' : 'SPRAY SFX MUTED');
      }
    });
  }

  // -------------------------------------------------------------------------
  // 3. LIVING 3D WIREFRAME + DRIFTING STENCIL BACKGROUND CANVAS + CLICK SPLATTER
  // -------------------------------------------------------------------------
  let spawnSplatterAt = () => {};

  function initLivingWallBg() {
    const canvas = document.getElementById('wallBgCanvas');
    if (!canvas || reducedMotion) {
      if (canvas) canvas.style.display = 'none';
      return;
    }
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let dpr = 1;
    let mouseX = W * 0.5;
    let mouseY = H * 0.5;
    let targetMX = mouseX;
    let targetMY = mouseY;
    let rafId = null;

    const STENCIL_WORDS = ['3D', 'PBR', 'MAYA', 'RIG', 'ZBRUSH', 'UV', 'UNITY', 'SUB-D', 'WIRE'];
    const PIGMENTS = ['#ff1fa2', '#1fd0e8', '#ff8a1f', '#ffd21f'];
    const spotlightEl = document.getElementById('wallSpotlight');
    let pointerActive = false;

    // โครงทรงเรขาคณิต 3D สำหรับหมุนเบา ๆ ในฉากหลัง (Cube & Octahedron)
    const CUBE_VERTS = [
      [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
      [-1,-1, 1],[1,-1, 1],[1,1, 1],[-1,1, 1]
    ];
    const CUBE_EDGES = [
      [0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],
      [0,4],[1,5],[2,6],[3,7]
    ];
    const OCTA_VERTS = [
      [0, 1.35, 0], [0, -1.35, 0],
      [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]
    ];
    const OCTA_EDGES = [
      [0,2],[0,3],[0,4],[0,5],
      [1,2],[1,3],[1,4],[1,5],
      [2,4],[4,3],[3,5],[5,2]
    ];

    let nodes = [];
    let tags = [];
    let shapes = [];
    let sparks = [];
    const splatters = [];

    function isLowQuality() {
      return document.body && document.body.classList.contains('q-low');
    }

    function seedScene() {
      const mobile = W < 768;
      const nodeCount = mobile ? 20 : 38;
      nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * (mobile ? 0.25 : 0.42),
          vy: (Math.random() - 0.5) * (mobile ? 0.25 : 0.42),
          r: 1.6 + Math.random() * 2.2,
          color: PIGMENTS[i % PIGMENTS.length],
          depth: 0.4 + Math.random() * 0.9
        });
      }

      const tagCount = mobile ? 5 : 9;
      tags = [];
      for (let i = 0; i < tagCount; i++) {
        tags.push({
          word: STENCIL_WORDS[i % STENCIL_WORDS.length],
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.18,
          vy: -0.09 - Math.random() * 0.16,
          size: mobile ? 14 + Math.random() * 10 : 18 + Math.random() * 16,
          rot: (Math.random() - 0.5) * 0.24,
          color: PIGMENTS[i % PIGMENTS.length]
        });
      }

      // ทรง Wireframe 3D หมุนลอยเบา ๆ (แสดงบน Desktop & Tablet)
      shapes = mobile ? [] : [
        { type: 'octa', x: W * 0.12, y: H * 0.24, size: 54, rx: 0.4, ry: 0.2, vrx: 0.0045, vry: 0.007, color: '#1fd0e8', depth: 1.1 },
        { type: 'cube', x: W * 0.88, y: H * 0.28, size: 46, rx: 0.8, ry: 0.6, vrx: 0.005, vry: -0.006, color: '#ff1fa2', depth: 0.9 },
        { type: 'octa', x: W * 0.82, y: H * 0.78, size: 42, rx: 0.2, ry: 1.1, vrx: -0.004, vry: 0.0065, color: '#ffd21f', depth: 0.85 }
      ];

      // ละอองไฟนีออนลอยขึ้นเบา ๆ
      const sparkCount = mobile ? 12 : 26;
      sparks = [];
      for (let i = 0; i < sparkCount; i++) {
        sparks.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vy: -0.25 - Math.random() * 0.55,
          vx: (Math.random() - 0.5) * 0.22,
          r: 1 + Math.random() * 2,
          phase: Math.random() * Math.PI * 2,
          color: PIGMENTS[i % PIGMENTS.length]
        });
      }
    }

    function drawWireframeShape(sh, px, py, isDay) {
      sh.rx += sh.vrx;
      sh.ry += sh.vry;
      const verts = sh.type === 'cube' ? CUBE_VERTS : OCTA_VERTS;
      const edges = sh.type === 'cube' ? CUBE_EDGES : OCTA_EDGES;
      const cosX = Math.cos(sh.rx), sinX = Math.sin(sh.rx);
      const cosY = Math.cos(sh.ry), sinY = Math.sin(sh.ry);

      const cx = sh.x + px * sh.depth;
      const cy = sh.y + py * sh.depth;

      const proj = verts.map(([x, y, z]) => {
        // Rotate Y then X
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        const scale = 3.2 / (3.2 - z2 * 0.45);
        return [cx + x1 * sh.size * scale, cy + y2 * sh.size * scale];
      });

      ctx.strokeStyle = sh.color;
      ctx.lineWidth = 1.25;
      ctx.globalAlpha = isDay ? 0.24 : 0.28;
      ctx.beginPath();
      for (let i = 0; i < edges.length; i++) {
        const [a, b] = edges[i];
        ctx.moveTo(proj[a][0], proj[a][1]);
        ctx.lineTo(proj[b][0], proj[b][1]);
      }
      ctx.stroke();

      // Vertex highlights
      ctx.fillStyle = sh.color;
      ctx.globalAlpha = isDay ? 0.45 : 0.55;
      for (let i = 0; i < proj.length; i++) {
        ctx.fillRect(proj[i][0] - 1.8, proj[i][1] - 1.8, 3.6, 3.6);
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(W * dpr));
      canvas.height = Math.max(1, Math.floor(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!nodes.length) seedScene();
    }

    spawnSplatterAt = function (cx, cy, customColor, burstCount) {
      if (isLowQuality() || reducedMotion) return;
      const color = customColor || PIGMENTS[Math.floor(Math.random() * PIGMENTS.length)];
      const count = burstCount || 18;
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 4.2;
        const isDrip = i < 4;
        splatters.push({
          x: cx + (Math.random() - 0.5) * 8,
          y: cy + (Math.random() - 0.5) * 8,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          r: isDrip ? 2.4 + Math.random() * 2.8 : 1.1 + Math.random() * 2.4,
          alpha: 0.78,
          decay: isDrip ? 0.008 : 0.016,
          isDrip,
          color
        });
      }
      while (splatters.length > 140) splatters.shift();
    };

    function drawFrame() {
      if (document.hidden || isLowQuality()) {
        rafId = null;
        return;
      }

      const isDay = document.documentElement.getAttribute('data-theme') === 'day';
      ctx.clearRect(0, 0, W, H);

      // Smooth mouse parallax + Interactive Neon Spotlight
      mouseX += (targetMX - mouseX) * 0.08;
      mouseY += (targetMY - mouseY) * 0.08;
      const px = ((mouseX / Math.max(1, W)) - 0.5) * 30;
      const py = ((mouseY / Math.max(1, H)) - 0.5) * 24;

      if (spotlightEl && pointerActive) {
        spotlightEl.style.transform = `translate3d(${mouseX.toFixed(1)}px, ${mouseY.toFixed(1)}px, 0)`;
      }

      // 0. Slowly rotating 3D Wireframe Polyhedra (Cube / Octahedron)
      for (let i = 0; i < shapes.length; i++) {
        drawWireframeShape(shapes[i], px, py, isDay);
      }

      // 0.5. Rising Neon Spark Embers
      const nowSec = performance.now() * 0.0025;
      for (let i = 0; i < sparks.length; i++) {
        const sk = sparks[i];
        sk.y += sk.vy;
        sk.x += sk.vx + Math.sin(nowSec + sk.phase) * 0.15;
        if (sk.y < -12) { sk.y = H + 12; sk.x = Math.random() * W; }
        const pulse = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(nowSec * 1.8 + sk.phase));
        ctx.globalAlpha = isDay ? pulse * 0.45 : pulse * 0.72;
        ctx.fillStyle = sk.color;
        ctx.beginPath();
        ctx.arc(sk.x, sk.y, sk.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 1. Floating Stencil Tags (3D artist software/terms drifting subtly)
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < tags.length; i++) {
        const tg = tags[i];
        tg.x += tg.vx;
        tg.y += tg.vy;
        if (tg.y < -40) { tg.y = H + 30; tg.x = Math.random() * W; }
        if (tg.x < -60) tg.x = W + 50;
        if (tg.x > W + 60) tg.x = -50;

        ctx.save();
        ctx.translate(tg.x - px * 0.55, tg.y - py * 0.55);
        ctx.rotate(tg.rot);
        ctx.font = `700 ${Math.round(tg.size)}px "JetBrains Mono", monospace`;
        ctx.globalAlpha = isDay ? 0.09 : 0.08;
        ctx.fillStyle = tg.color;
        ctx.fillText(tg.word, 0, 0);
        ctx.restore();
      }
      ctx.restore();

      // 2. 3D Wireframe Poly Constellation + Mouse-Reactive Maya Vertex Web
      const maxDist = W < 768 ? 120 : 165;
      const maxDistSq = maxDist * maxDist;
      const cursorRadius = 210;
      const cursorRadiusSq = cursorRadius * cursorRadius;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = W + 20;
        if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20;
        if (n.y > H + 20) n.y = -20;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const ax = a.x + px * a.depth;
        const ay = a.y + py * a.depth;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const bx = b.x + px * b.depth;
          const by = b.y + py * b.depth;
          const dx = ax - bx;
          const dy = ay - by;
          const dSq = dx * dx + dy * dy;
          if (dSq < maxDistSq) {
            const ratio = 1 - Math.sqrt(dSq) / maxDist;
            ctx.globalAlpha = ratio * (isDay ? 0.18 : 0.19);
            ctx.strokeStyle = a.color;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }

        // เชื่อมเส้นเลเซอร์นีออนไปยังเคอร์เซอร์เมาส์เมื่อเข้าใกล้จุด Vertex
        let nearBoost = 0;
        if (pointerActive && finePointer) {
          const cdx = ax - mouseX;
          const cdy = ay - mouseY;
          const cdSq = cdx * cdx + cdy * cdy;
          if (cdSq < cursorRadiusSq) {
            nearBoost = 1 - Math.sqrt(cdSq) / cursorRadius;
            ctx.globalAlpha = nearBoost * (isDay ? 0.35 : 0.48);
            ctx.strokeStyle = a.color;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
            ctx.lineWidth = 1;
          }
        }

        // Vertex dot + neon glow halo when near cursor
        const vr = a.r + nearBoost * 2.2;
        ctx.globalAlpha = Math.min(0.92, (isDay ? 0.36 : 0.38) + nearBoost * 0.55);
        ctx.fillStyle = a.color;
        ctx.fillRect(ax - vr, ay - vr, vr * 2, vr * 2);
      }

      // 3. Click/Easter-Egg Paint Splatters & Drips
      for (let i = splatters.length - 1; i >= 0; i--) {
        const sp = splatters[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.94;
        sp.vy = sp.isDrip ? sp.vy * 0.92 + 0.08 : sp.vy * 0.94;
        sp.alpha -= sp.decay;
        if (sp.alpha <= 0.02) {
          splatters.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = sp.alpha;
        ctx.fillStyle = sp.color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(drawFrame);
    }

    function startLoop() {
      if (!rafId && !document.hidden && !isLowQuality()) {
        rafId = requestAnimationFrame(drawFrame);
      }
    }

    resize();
    startLoop();

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        seedScene();
      }, 180);
    }, { passive: true });

    if (finePointer) {
      window.addEventListener('mousemove', (e) => {
        targetMX = e.clientX;
        targetMY = e.clientY;
        if (!pointerActive) {
          pointerActive = true;
          if (spotlightEl) spotlightEl.classList.add('is-active');
        }
      }, { passive: true });
      document.addEventListener('mouseleave', () => {
        pointerActive = false;
        if (spotlightEl) spotlightEl.classList.remove('is-active');
      }, { passive: true });
    }

    // คลิกบนพื้นผนังว่าง ๆ เพื่อพ่นละอองสเปรย์เบา ๆ
    document.addEventListener('click', (e) => {
      if (e.target && e.target.closest && e.target.closest('button, a, input, select, textarea, .ba-slider, .modal-backdrop')) {
        return;
      }
      spawnSplatterAt(e.clientX, e.clientY, null, 14);
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!document.hidden) {
        startLoop();
      }
    });
  }

  // -------------------------------------------------------------------------
  // 4. CUSTOM SPRAY-NOZZLE CURSOR RETICLE (Desktop Fine Pointer)
  // -------------------------------------------------------------------------
  function initCursorReticle() {
    const reticle = document.getElementById('sprayReticle');
    if (!reticle || reducedMotion || !finePointer || isTouch) {
      if (reticle) reticle.style.display = 'none';
      return;
    }

    let cx = -100;
    let cy = -100;
    let tx = -100;
    let ty = -100;
    let active = false;
    let reticleRaf = null;

    const tick = () => {
      if (!active || document.hidden) {
        reticleRaf = null;
        return;
      }
      cx += (tx - cx) * 0.24;
      cy += (ty - cy) * 0.24;
      reticle.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      if (Math.abs(tx - cx) > 0.2 || Math.abs(ty - cy) > 0.2) {
        reticleRaf = requestAnimationFrame(tick);
      } else {
        reticleRaf = null;
      }
    };

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!active) {
        cx = tx;
        cy = ty;
        active = true;
        reticle.classList.add('is-visible');
      }
      if (!reticleRaf) reticleRaf = requestAnimationFrame(tick);
    }, { passive: true });

    document.addEventListener('mouseover', (e) => {
      const t = e.target;
      if (!t || !t.closest) return;
      const isMedia = !!t.closest('.art-thumb-wrap, .hero-stage, .motion-stage, .dossier-cover, .ba-slider');
      const isInteractive = !isMedia && !!t.closest('a, button, input, select, textarea');
      reticle.classList.toggle('is-media', isMedia);
      reticle.classList.toggle('is-hover', isInteractive);
    }, { passive: true });

    window.addEventListener('mousedown', () => reticle.classList.add('is-down'), { passive: true });
    window.addEventListener('mouseup', () => reticle.classList.remove('is-down'), { passive: true });
    document.addEventListener('mouseleave', () => reticle.classList.remove('is-visible'), { passive: true });
    window.addEventListener('touchstart', () => {
      active = false;
      reticle.style.display = 'none';
    }, { once: true, passive: true });
  }

  // -------------------------------------------------------------------------
  // 5. SCROLL PROGRESS SPRAY BAR + ACTIVE NAV SCROLL SPY
  // -------------------------------------------------------------------------
  function initScrollProgressAndSpy() {
    const fill = document.getElementById('scrollProgressFill');
    const navLinks = Array.from(document.querySelectorAll('.site-nav .nav-link, #mobileDrawer .nav-link'));
    const sections = ['renders', 'workflow', 'motion', 'projects', 'about', 'contact']
      .map(id => document.getElementById(id))
      .filter(Boolean);

    let scheduled = false;

    function update() {
      scheduled = false;
      const sy = window.scrollY || window.pageYOffset || 0;
      const docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (fill) {
        const prog = Math.max(0, Math.min(1, sy / docH));
        fill.style.transform = `scaleX(${prog.toFixed(4)})`;
      }

      // Active Nav Scroll Spy
      let activeId = '';
      const probeY = sy + 140;
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        if (sec.offsetParent === null) continue;
        if (sec.offsetTop <= probeY) activeId = sec.id;
      }
      navLinks.forEach(a => {
        const href = a.getAttribute('href') || '';
        a.classList.toggle('is-active', activeId && href === '#' + activeId);
      });
    }

    const onScroll = () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  // -------------------------------------------------------------------------
  // 6. HERO STENCIL TEXT-SCRAMBLE + STATS COUNT-UP
  // -------------------------------------------------------------------------
  function runTextScramble(el) {
    if (!el || reducedMotion) return;
    const finalStr = (el.textContent || '').trim();
    if (!finalStr || el.dataset.scrambling === '1') return;
    el.dataset.scrambling = '1';

    const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/@%';
    let frame = 0;
    const totalFrames = 22;

    const step = () => {
      frame++;
      const revealCount = Math.floor((frame / totalFrames) * finalStr.length);
      let out = '';
      for (let i = 0; i < finalStr.length; i++) {
        const ch = finalStr[i];
        if (ch === ' ' || i < revealCount) {
          out += ch;
        } else {
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      el.textContent = out;
      if (frame < totalFrames) {
        requestAnimationFrame(step);
      } else {
        el.textContent = finalStr;
        el.dataset.scrambling = '0';
      }
    };
    requestAnimationFrame(step);
  }

  function initHeroTextAndCountUp() {
    const heroName = document.querySelector('.hero-name');
    if (heroName) {
      setTimeout(() => runTextScramble(heroName), 180);
    }

    // Stats count-up (runs once when metrics enter viewport)
    const metricsWrap = document.querySelector('.hero-metrics');
    if (!metricsWrap || reducedMotion) return;

    let didCount = false;
    const startCountUp = () => {
      if (didCount) return;
      didCount = true;
      const targets = metricsWrap.querySelectorAll('strong');
      targets.forEach((el) => {
        const endVal = parseInt(el.textContent, 10);
        if (!Number.isFinite(endVal) || endVal <= 0) return;
        const startTs = performance.now();
        const dur = 850;
        const tick = (now) => {
          const t = Math.min(1, (now - startTs) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = String(Math.max(1, Math.round(eased * endVal)));
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = String(endVal);
        };
        requestAnimationFrame(tick);
      });
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) {
          startCountUp();
          io.disconnect();
        }
      }, { threshold: 0.2 });
      io.observe(metricsWrap);
    } else {
      startCountUp();
    }
  }

  // -------------------------------------------------------------------------
  // 7. MAGNETIC PRIMARY BUTTONS + PAINT-SPLATTER RIPPLE + SFX
  // -------------------------------------------------------------------------
  function initButtonPhysics() {
    // Ripple + SFX on all Graffiti buttons
    document.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest
        ? e.target.closest('.btn-spray, .sticker-cta, .btn-load-more, .channel-btn, .filter-btn, .subtab-btn, .detail-back-btn, .back-top-btn, .motion-open-btn, .modal-btn')
        : null;
      if (!btn) return;

      const isPrimary = btn.classList.contains('btn-spray') || btn.classList.contains('sticker-cta');
      playSfx(isPrimary ? 'spray' : 'click');

      if (!reducedMotion) {
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 0.7;
        const rip = document.createElement('span');
        rip.className = 'sw-ripple';
        rip.style.width = size + 'px';
        rip.style.height = size + 'px';
        rip.style.left = (e.clientX - rect.left) + 'px';
        rip.style.top = (e.clientY - rect.top) + 'px';
        btn.appendChild(rip);
        setTimeout(() => rip.remove(), 560);
      }
    });

    // Subtle magnetic hover pull on Primary CTA buttons (Desktop fine-pointer)
    if (!finePointer || reducedMotion || isTouch) return;
    document.querySelectorAll('.btn-spray, .sticker-cta').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = ((e.clientX - r.left) / r.width - 0.5) * 7;
        const dy = ((e.clientY - r.top) / r.height - 0.5) * 6;
        btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${(dy - 2).toFixed(1)}px, 0)`;
      }, { passive: true });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      }, { passive: true });
    });
  }

  // -------------------------------------------------------------------------
  // 8. 3D PERSPECTIVE CARD TILT + SPECULAR GLARE (Desktop high-tier only)
  // -------------------------------------------------------------------------
  function initCardTilt() {
    if (!finePointer || reducedMotion || isTouch) return;

    let activeCard = null;
    document.addEventListener('mousemove', (e) => {
      if (document.body && !document.body.classList.contains('q-high')) return;
      const card = e.target && e.target.closest ? e.target.closest('.art-card, .dossier-card') : null;
      if (activeCard && activeCard !== card) {
        activeCard.style.transform = '';
        activeCard.classList.remove('is-tilting');
        activeCard = null;
      }
      if (!card) return;
      activeCard = card;

      // Ensure glare layer exists lazily
      let glare = card.querySelector('.card-glare');
      if (!glare) {
        glare = document.createElement('span');
        glare.className = 'card-glare';
        glare.setAttribute('aria-hidden', 'true');
        card.appendChild(glare);
      }

      const r = card.getBoundingClientRect();
      const xPct = (e.clientX - r.left) / Math.max(1, r.width);
      const yPct = (e.clientY - r.top) / Math.max(1, r.height);
      const rotY = (xPct - 0.5) * 8;
      const rotX = (0.5 - yPct) * 7;

      card.classList.add('is-tilting');
      card.style.setProperty('--gx', (xPct * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', (yPct * 100).toFixed(1) + '%');
      card.style.transform = `perspective(900px) translate3d(-2px, -4px, 0) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      if (activeCard) {
        activeCard.style.transform = '';
        activeCard.classList.remove('is-tilting');
        activeCard = null;
      }
    }, { passive: true });
  }

  // -------------------------------------------------------------------------
  // 9. LIGHTBOX TOUCH SWIPE (Mobile/Tablet Left/Right Navigation)
  // -------------------------------------------------------------------------
  function initLightboxSwipe() {
    const stage = document.getElementById('lbStage');
    if (!stage) return;
    let startX = 0;
    let startY = 0;
    stage.addEventListener('touchstart', (e) => {
      if (!e.touches || !e.touches.length) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (!e.changedTouches || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        const img = document.getElementById('lbImg');
        if (img && img.classList.contains('is-zoomed')) return;
        if (dx < 0) document.getElementById('lbNextBtn')?.click();
        else document.getElementById('lbPrevBtn')?.click();
      }
    }, { passive: true });
  }

  // -------------------------------------------------------------------------
  // 10. PROJECT DOSSIER SPRAY-WIPE TRANSITION
  // -------------------------------------------------------------------------
  function triggerPageWipe() {
    if (reducedMotion) return;
    const overlay = document.getElementById('pageWipeOverlay');
    if (!overlay) return;
    overlay.classList.remove('is-wiping');
    void overlay.offsetWidth; // trigger reflow cleanly once
    overlay.classList.add('is-wiping');
    playSfx('wipe');
    setTimeout(() => overlay.classList.remove('is-wiping'), 490);
  }

  // -------------------------------------------------------------------------
  // 11. EASTER EGG: CLICK BALL.3D LOGO 3x FOR GRAFFITI SPRAY BURST
  // -------------------------------------------------------------------------
  function triggerEasterEgg() {
    const colors = ['#ff1fa2', '#1fd0e8', '#ff8a1f', '#ffd21f'];
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const rx = window.innerWidth * (0.15 + Math.random() * 0.7);
        const ry = window.innerHeight * (0.15 + Math.random() * 0.65);
        spawnSplatterAt(rx, ry, colors[i % colors.length], 24);
      }, i * 70);
    }
    playSfx('wipe');
    const isTh = document.documentElement.lang === 'th';
    showToast(isTh ? 'พ่นสีกำแพงสำเร็จ! // TAGGED BY BALL.3D' : 'TAGGED BY BALL.3D // SPRAY MODE!', 2800);
  }

  function initLogoEasterEgg() {
    const brand = document.getElementById('brandHomeLink');
    if (!brand) return;
    let clicks = 0;
    let timer = null;
    brand.addEventListener('click', () => {
      clicks++;
      clearTimeout(timer);
      if (clicks >= 3) {
        clicks = 0;
        triggerEasterEgg();
      } else {
        timer = setTimeout(() => { clicks = 0; }, 1100);
      }
    });
  }

  // -------------------------------------------------------------------------
  // BOOTSTRAP
  // -------------------------------------------------------------------------
  function initAll() {
    initSoundToggle();
    initLivingWallBg();
    initCursorReticle();
    initScrollProgressAndSpy();
    initHeroTextAndCountUp();
    initButtonPhysics();
    initCardTilt();
    initLightboxSwipe();
    initLogoEasterEgg();
  }

  window.STREET_FX_PLUS = {
    showToast,
    triggerPageWipe,
    playSfx,
    triggerEasterEgg,
    runTextScramble
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();

