/**
 * STREET WALL — Performance-Engineered Motion, Spray-Can Cursor & ScrollFX
 * A. Single shared GSAP ticker + Lenis loop (autoRaf:false, lagSmoothing(0), syncTouch:false)
 * B. Zero-idle rAF architecture: sleeps completely when not scrolling/spraying/visible
 * C. Cached section geometry (zero mousemove layout reflow) + dirty-rect canvas clear + DPR cap
 * E. Adaptive quality engine (high -> medium -> low) based on hardware + sustained <45fps check
 * Debug HUD: ?debug=1 or press 'P' to inspect live telemetry
 */
(function () {
  'use strict';

  const reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const finePointer = !!(window.matchMedia && window.matchMedia('(pointer: fine)').matches);

  // -------------------------------------------------------------------------
  // ADAPTIVE QUALITY TIER (Group E)
  // -------------------------------------------------------------------------
  const QUALITY_ORDER = ['high', 'medium', 'low'];
  let qualityTier = 'high';
  let qualityLocked = false;
  const qualityListeners = new Set();

  function detectInitialQuality() {
    if (reducedMotion) return 'low';
    try {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn && (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g')) {
        return 'low';
      }
    } catch {}
    const cores = navigator.hardwareConcurrency || 8;
    const mem = navigator.deviceMemory || 8;
    if (cores <= 4 || mem <= 4) return 'medium';
    return 'high';
  }

  function applyQualityTier(nextTier, manualLock) {
    if (!QUALITY_ORDER.includes(nextTier)) return;
    qualityTier = nextTier;
    if (manualLock !== undefined) qualityLocked = !!manualLock;
    const body = document.body;
    if (body) {
      body.classList.remove('q-high', 'q-medium', 'q-low');
      body.classList.add('q-' + qualityTier);
    }
    qualityListeners.forEach((fn) => {
      try { fn(qualityTier); } catch {}
    });
  }

  function monitorBatteryOnce() {
    if (!navigator.getBattery || qualityLocked || qualityTier === 'low') return;
    try {
      navigator.getBattery().then((bat) => {
        if (!bat || qualityLocked) return;
        if (!bat.charging && bat.level < 0.2 && qualityTier === 'high') {
          applyQualityTier('medium');
        }
      }).catch(() => {});
    } catch {}
  }

  // Active-window FPS tracker (only measures during active rAF work; sleeps at idle)
  let lastActiveTs = 0;
  let activeWindowFrames = 0;
  let activeWindowMs = 0;
  let lastMeasuredFps = 60;
  let lastFrameMs = 16.7;
  let lowFpsStreak = 0;

  function recordActiveFrame(ts) {
    if (!lastActiveTs) {
      lastActiveTs = ts;
      return;
    }
    const dt = ts - lastActiveTs;
    // Deduplicate callbacks firing within the same vsync frame
    if (dt < 4) return;
    lastActiveTs = ts;
    // Ignore gaps > 120ms (loop was cleanly sleeping between user inputs)
    if (dt > 120) {
      activeWindowFrames = 0;
      activeWindowMs = 0;
      return;
    }
    lastFrameMs = dt;
    activeWindowFrames++;
    activeWindowMs += dt;

    if (activeWindowMs >= 1000) {
      const fps = Math.round((activeWindowFrames * 1000) / activeWindowMs);
      lastMeasuredFps = Math.min(240, Math.max(1, fps));
      activeWindowFrames = 0;
      activeWindowMs = 0;

      if (!qualityLocked && !document.hidden) {
        if (lastMeasuredFps < 45) {
          lowFpsStreak++;
          if (lowFpsStreak >= 2) {
            lowFpsStreak = 0;
            if (qualityTier === 'high') applyQualityTier('medium');
            else if (qualityTier === 'medium' && lastMeasuredFps < 34) applyQualityTier('low');
          }
        } else {
          lowFpsStreak = 0;
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // LOADER (< 1s first load, instant skip on repeat visits)
  // -------------------------------------------------------------------------
  function initLoader() {
    const loader = document.getElementById('streetLoader');
    const bar = document.getElementById('loaderBarFill');
    const pct = document.getElementById('loaderPct');
    if (!loader) return;

    const alreadyVisited = (() => {
      try { return sessionStorage.getItem('sw_visited') === '1'; } catch { return false; }
    })();

    if (alreadyVisited || reducedMotion) {
      loader.classList.add('is-done');
      return;
    }

    let progress = 22;
    const step = () => {
      progress = Math.min(100, progress + Math.floor(18 + Math.random() * 24));
      if (bar) bar.style.width = progress + '%';
      if (pct) pct.textContent = 'SPRAYING PIGMENTS... ' + progress + '%';
      if (progress >= 100) {
        try { sessionStorage.setItem('sw_visited', '1'); } catch {}
        setTimeout(() => loader.classList.add('is-done'), 120);
      } else {
        setTimeout(step, 85);
      }
    };
    setTimeout(step, 35);
    setTimeout(() => loader.classList.add('is-done'), 1000);
  }

  // -------------------------------------------------------------------------
  // CACHED SECTION PIGMENT LOOKUP (ZERO getBoundingClientRect ON MOUSEMOVE)
  // -------------------------------------------------------------------------
  const SECTION_COLORS = [
    { id: 'renders', color: '#FF1FA2' },
    { id: 'workflow', color: '#1FD0E8' },
    { id: 'motion', color: '#FF8A1F' },
    { id: 'projects', color: '#FF1FA2' },
    { id: 'about', color: '#1FD0E8' },
    { id: 'services', color: '#FF8A1F' },
    { id: 'contact', color: '#FFD21F' }
  ];
  let cachedSectionBands = [];

  function updateSectionBands() {
    const sy = window.scrollY || window.pageYOffset || 0;
    const bands = [];
    for (let i = 0; i < SECTION_COLORS.length; i++) {
      const item = SECTION_COLORS[i];
      const el = document.getElementById(item.id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.height > 0) {
        bands.push({ top: r.top + sy, bottom: r.bottom + sy, color: item.color });
      }
    }
    cachedSectionBands = bands;
  }

  function getSectionPigmentAtClientY(clientY) {
    const docY = (window.scrollY || window.pageYOffset || 0) + clientY;
    for (let i = 0; i < cachedSectionBands.length; i++) {
      const b = cachedSectionBands[i];
      if (docY >= b.top && docY <= b.bottom) return b.color;
    }
    return '#FF1FA2';
  }

  // -------------------------------------------------------------------------
  // SPRAY CURSOR CANVAS (Dirty-Rect Clear + DPR Cap + Auto-Stop When Empty)
  // -------------------------------------------------------------------------
  let cursorRafId = null;

  function initSprayCursor() {
    const canvas = document.getElementById('sprayCursorCanvas');
    if (!canvas || reducedMotion || !finePointer) {
      if (canvas) canvas.style.display = 'none';
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let dpr = 1;
    let W = window.innerWidth;
    let H = window.innerHeight;
    let particlesDisabled = qualityTier === 'low';
    const particles = [];
    let lastSpawn = 0;

    // Dirty bounding box in CSS pixels
    let hasPrevDirty = false;
    let prevMinX = 0;
    let prevMinY = 0;
    let prevMaxX = 0;
    let prevMaxY = 0;

    const resize = () => {
      const dprCap = qualityTier === 'high' ? 1.5 : 1.0;
      dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(W * dpr));
      canvas.height = Math.max(1, Math.floor(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      hasPrevDirty = false;
    };

    const stopCursorLoop = () => {
      if (cursorRafId) {
        cancelAnimationFrame(cursorRafId);
        cursorRafId = null;
      }
      if (hasPrevDirty) {
        const cx = Math.max(0, Math.floor(prevMinX));
        const cy = Math.max(0, Math.floor(prevMinY));
        const cw = Math.min(W, Math.ceil(prevMaxX)) - cx;
        const ch = Math.min(H, Math.ceil(prevMaxY)) - cy;
        if (cw > 0 && ch > 0) ctx.clearRect(cx, cy, cw, ch);
        hasPrevDirty = false;
      }
      particles.length = 0;
    };

    resize();
    if (particlesDisabled) canvas.style.display = 'none';

    qualityListeners.add((tier) => {
      particlesDisabled = tier === 'low' || reducedMotion;
      if (particlesDisabled) {
        stopCursorLoop();
        canvas.style.display = 'none';
      } else {
        canvas.style.display = '';
        resize();
      }
    });

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('touchstart', () => {
      particlesDisabled = true;
      stopCursorLoop();
      canvas.style.display = 'none';
    }, { once: true, passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopCursorLoop();
    });

    const tick = (ts) => {
      recordActiveFrame(ts);
      if (document.hidden || particlesDisabled) {
        stopCursorLoop();
        return;
      }

      if (hasPrevDirty) {
        const cx = Math.max(0, Math.floor(prevMinX));
        const cy = Math.max(0, Math.floor(prevMinY));
        const cw = Math.min(W, Math.ceil(prevMaxX)) - cx;
        const ch = Math.min(H, Math.ceil(prevMaxY)) - cy;
        if (cw > 0 && ch > 0) ctx.clearRect(cx, cy, cw, ch);
        hasPrevDirty = false;
      }

      let nMinX = Infinity;
      let nMinY = Infinity;
      let nMaxX = -Infinity;
      let nMaxY = -Infinity;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.isDrip) p.vy += 0.018;
        p.alpha -= p.decay;
        if (p.alpha <= 0.02) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        const pad = p.r + 2.5;
        if (p.x - pad < nMinX) nMinX = p.x - pad;
        if (p.y - pad < nMinY) nMinY = p.y - pad;
        if (p.x + pad > nMaxX) nMaxX = p.x + pad;
        if (p.y + pad > nMaxY) nMaxY = p.y + pad;
      }
      ctx.globalAlpha = 1;

      if (nMaxX > nMinX && nMaxY > nMinY) {
        hasPrevDirty = true;
        prevMinX = nMinX;
        prevMinY = nMinY;
        prevMaxX = nMaxX;
        prevMaxY = nMaxY;
      }

      if (particles.length > 0) {
        cursorRafId = requestAnimationFrame(tick);
      } else {
        cursorRafId = null;
      }
    };

    window.addEventListener('mousemove', (e) => {
      if (particlesDisabled || document.hidden) return;
      const now = performance.now();
      const throttleMs = qualityTier === 'high' ? 18 : 26;
      if (now - lastSpawn < throttleMs) return;
      lastSpawn = now;

      const color = getSectionPigmentAtClientY(e.clientY);
      const maxParticles = qualityTier === 'high' ? 85 : 40;
      const count = particles.length > maxParticles * 0.7 ? 2 : (qualityTier === 'high' ? 4 : 2);

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spread = Math.random() * 11;
        const isDrip = i === 0 && Math.random() > 0.72;
        particles.push({
          x: e.clientX + Math.cos(angle) * spread,
          y: e.clientY + Math.sin(angle) * spread,
          vx: (Math.random() - 0.5) * 0.4,
          vy: isDrip ? 0.35 + Math.random() * 0.5 : (Math.random() - 0.5) * 0.25,
          r: isDrip ? 1.8 + Math.random() * 1.6 : 0.9 + Math.random() * 1.8,
          alpha: isDrip ? 0.7 : 0.45,
          decay: isDrip ? 0.014 : 0.028,
          isDrip,
          color
        });
      }
      while (particles.length > maxParticles) particles.shift();
      if (!cursorRafId) cursorRafId = requestAnimationFrame(tick);
    }, { passive: true });
  }

  // -------------------------------------------------------------------------
  // SINGLE SHARED LOOP (GSAP TICKER + LENIS + BATCHED SCROLLTRIGGER)
  // -------------------------------------------------------------------------
  let lenisInstance = null;
  let revealObserver = null;
  let tickerActive = false;
  let idleTicks = 0;
  let fallbackRafId = null;
  let gsapScrollReady = false;
  let createdTriggers = [];
  let refreshTimer = null;

  function setupOfflineRevealObserver() {
    if (revealObserver) return;
    if ('IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver((entries) => {
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        }
      }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
      observeNew(document);
    } else {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-revealed'));
    }
  }

  function teardownOfflineObserver() {
    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }
  }

  function sleepScrollLoop() {
    if (!tickerActive) return;
    tickerActive = false;
    if (window.gsap && window.gsap.ticker) {
      window.gsap.ticker.remove(sharedLenisTick);
    }
    if (fallbackRafId) {
      cancelAnimationFrame(fallbackRafId);
      fallbackRafId = null;
    }
  }

  function sharedLenisTick(timeSec) {
    recordActiveFrame(performance.now());
    if (document.hidden || !lenisInstance) {
      sleepScrollLoop();
      return;
    }
    lenisInstance.raf(timeSec * 1000);
    const vel = Math.abs(lenisInstance.velocity || 0);
    if (lenisInstance.isScrolling || vel > 0.008) {
      idleTicks = 0;
    } else {
      idleTicks++;
      if (idleTicks >= 12) sleepScrollLoop();
    }
  }

  function wakeScrollLoop() {
    if (!lenisInstance || document.hidden || reducedMotion || qualityTier === 'low') return;
    idleTicks = 0;
    if (tickerActive) return;

    if (window.gsap && window.gsap.ticker) {
      const nowMs = window.gsap.ticker.time * 1000;
      if (typeof lenisInstance.time === 'number') {
        lenisInstance.time = Math.max(0, nowMs - 16.67);
      }
      tickerActive = true;
      window.gsap.ticker.add(sharedLenisTick);
    } else {
      tickerActive = true;
      const startTs = performance.now();
      if (typeof lenisInstance.time === 'number') {
        lenisInstance.time = Math.max(0, startTs - 16.67);
      }
      const fallbackTick = (ts) => {
        if (!tickerActive || document.hidden || !lenisInstance) {
          sleepScrollLoop();
          return;
        }
        recordActiveFrame(ts);
        lenisInstance.raf(ts);
        if (lenisInstance.isScrolling || Math.abs(lenisInstance.velocity || 0) > 0.008) {
          idleTicks = 0;
          fallbackRafId = requestAnimationFrame(fallbackTick);
        } else if (++idleTicks < 12) {
          fallbackRafId = requestAnimationFrame(fallbackTick);
        } else {
          tickerActive = false;
          fallbackRafId = null;
        }
      };
      fallbackRafId = requestAnimationFrame(fallbackTick);
    }
  }

  function buildBatchedScrollTriggers() {
    if (!window.gsap || !window.ScrollTrigger) return;
    const ST = window.ScrollTrigger;

    // Clean any old triggers before creating fresh batches
    if (createdTriggers.length) {
      createdTriggers.forEach((tr) => { try { tr.kill(); } catch {} });
      createdTriggers = [];
    }

    const revealTargets = document.querySelectorAll('.reveal:not(.is-revealed)');
    if (revealTargets.length) {
      const batchA = ST.batch(revealTargets, {
        once: true,
        start: 'top 92%',
        onEnter: (els) => els.forEach((el) => el.classList.add('is-revealed'))
      });
      if (Array.isArray(batchA)) createdTriggers.push(...batchA);
    }

    const wipeTargets = document.querySelectorAll('.band-wipe-bar:not([data-wiped])');
    if (wipeTargets.length && !reducedMotion && qualityTier !== 'low') {
      const batchB = ST.batch(wipeTargets, {
        once: true,
        start: 'top 94%',
        onEnter: (bars) => {
          bars.forEach((b) => { b.dataset.wiped = '1'; });
          window.gsap.fromTo(bars,
            { scaleX: 0.2, transformOrigin: 'left center' },
            { scaleX: 1, duration: 0.65, ease: 'power3.out', stagger: 0.05, clearProps: 'transform' }
          );
        }
      });
      if (Array.isArray(batchB)) createdTriggers.push(...batchB);
    }
  }

  function refreshScroll() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      updateSectionBands();
      if (lenisInstance && typeof lenisInstance.resize === 'function') {
        lenisInstance.resize();
      }
      if (gsapScrollReady && window.ScrollTrigger) {
        buildBatchedScrollTriggers();
        window.ScrollTrigger.refresh();
      }
    }, 80);
  }

  function cleanupScroll() {
    sleepScrollLoop();
    createdTriggers.forEach((tr) => { try { tr.kill(); } catch {} });
    createdTriggers = [];
    if (lenisInstance && typeof lenisInstance.destroy === 'function') {
      lenisInstance.destroy();
      lenisInstance = null;
    }
  }

  function initScrollAndReveals() {
    setupOfflineRevealObserver();
    updateSectionBands();

    let lastW = window.innerWidth;
    let resizeDeb = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeDeb);
      resizeDeb = setTimeout(() => {
        if (window.innerWidth !== lastW || cachedSectionBands.length === 0) {
          lastW = window.innerWidth;
          refreshScroll();
        } else {
          updateSectionBands();
        }
      }, 140);
    }, { passive: true });

    // Coalesced height observer (keeps Lenis limits accurate across wall & detail views)
    const shellEl = document.getElementById('mainContent') || document.getElementById('wallView');
    if (shellEl && 'ResizeObserver' in window) {
      let roTimer = null;
      const ro = new ResizeObserver(() => {
        clearTimeout(roTimer);
        roTimer = setTimeout(refreshScroll, 120);
      });
      ro.observe(shellEl);
    }

    const onWindowLoaded = () => {
      updateSectionBands();

      const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
      const hasLenis = typeof window.Lenis === 'function';

      if (hasGsap) {
        window.gsap.registerPlugin(window.ScrollTrigger);
        window.gsap.ticker.lagSmoothing(0);
        gsapScrollReady = true;
        teardownOfflineObserver();
        buildBatchedScrollTriggers();
      }

      if (hasLenis && !reducedMotion && qualityTier !== 'low') {
        lenisInstance = new window.Lenis({
          autoRaf: false,
          lerp: 0.11,
          smoothWheel: true,
          wheelMultiplier: 1.0,
          syncTouch: false,
          touchMultiplier: 1.0
        });
        lenisInstance.on('scroll', () => {
          wakeScrollLoop();
          if (gsapScrollReady && window.ScrollTrigger) {
            window.ScrollTrigger.update();
          }
        });
        window.addEventListener('wheel', wakeScrollLoop, { passive: true });
        window.addEventListener('scroll', wakeScrollLoop, { passive: true });
        window.addEventListener('keydown', (e) => {
          if (/^(Space|PageUp|PageDown|Home|End|ArrowUp|ArrowDown)$/.test(e.code)) wakeScrollLoop();
        }, { passive: true });
      }

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) sleepScrollLoop();
      });

      qualityListeners.add((tier) => {
        if (!lenisInstance) return;
        if (tier === 'low') {
          sleepScrollLoop();
          lenisInstance.stop();
        } else if (!reducedMotion) {
          lenisInstance.start();
        }
      });

      refreshScroll();
    };

    if (document.readyState === 'complete') {
      onWindowLoaded();
    } else {
      window.addEventListener('load', onWindowLoaded, { once: true });
    }
  }

  function observeNew(root) {
    if (!root) return;
    if (reducedMotion || qualityTier === 'low') {
      root.querySelectorAll('.reveal:not(.is-revealed)').forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    if (revealObserver) {
      root.querySelectorAll('.reveal:not(.is-revealed)').forEach((el) => revealObserver.observe(el));
    }
  }

  function scrollToTarget(target, immediate) {
    const imm = !!(immediate || reducedMotion || qualityTier === 'low');
    const isElementOrSelector = typeof target === 'string' || (target && typeof target === 'object' && target.nodeType === 1);
    if (lenisInstance && typeof lenisInstance.scrollTo === 'function' && qualityTier !== 'low' && !reducedMotion) {
      lenisInstance.resize();
      wakeScrollLoop();
      lenisInstance.scrollTo(target, {
        immediate: imm,
        offset: isElementOrSelector ? -64 : 0
      });
      return;
    }
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: imm ? 'auto' : 'smooth' });
    } else if (typeof target === 'string') {
      const el = document.querySelector(target);
      if (el) {
        const y = Math.max(0, el.getBoundingClientRect().top + (window.scrollY || 0) - 64);
        window.scrollTo({ top: y, behavior: imm ? 'auto' : 'smooth' });
      }
    } else if (target && typeof target.getBoundingClientRect === 'function') {
      const y = Math.max(0, target.getBoundingClientRect().top + (window.scrollY || 0) - 64);
      window.scrollTo({ top: y, behavior: imm ? 'auto' : 'smooth' });
    }
  }

  function pauseScroll() {
    if (lenisInstance) lenisInstance.stop();
    sleepScrollLoop();
  }

  function resumeScroll() {
    if (lenisInstance && !reducedMotion && qualityTier !== 'low') lenisInstance.start();
  }

  // -------------------------------------------------------------------------
  // HIDDEN LIVE PERFORMANCE DEBUG HUD (?debug=1 OR PRESS 'P')
  // -------------------------------------------------------------------------
  let hudEl = null;
  let hudInterval = null;
  let benchRafId = null;

  function renderDebugMetrics() {
    if (!hudEl) return;
    const isActive = tickerActive || !!cursorRafId || !!benchRafId;
    const activeLoops = (tickerActive ? 1 : 0) + (cursorRafId ? 1 : 0) + (benchRafId ? 1 : 0);
    const stCount = (window.ScrollTrigger && typeof window.ScrollTrigger.getAll === 'function')
      ? window.ScrollTrigger.getAll().length
      : 0;
    const playingVideos = Array.from(document.querySelectorAll('video')).filter((v) => !v.paused && !v.ended).length;
    const domNodes = document.getElementsByTagName('*').length;

    const badge = hudEl.querySelector('#hudStateBadge');
    if (badge) {
      badge.textContent = isActive ? `ACTIVE ${lastMeasuredFps} FPS` : 'IDLE (SLEEP)';
      badge.classList.toggle('is-sleep', !isActive);
    }
    const setV = (id, val) => { const n = hudEl.querySelector('#' + id); if (n) n.textContent = String(val); };
    setV('hudFpsVal', isActive ? `${lastMeasuredFps} fps (${lastFrameMs.toFixed(1)} ms)` : `SLEEP (last ${lastMeasuredFps} fps)`);
    setV('hudQualityVal', `${qualityTier.toUpperCase()}${qualityLocked ? ' [LOCK]' : ' [AUTO]'}`);
    setV('hudRafVal', activeLoops === 0 ? '0 (Idle Sleep)' : String(activeLoops));
    setV('hudStVal', `${stCount} triggers`);
    setV('hudVidVal', playingVideos);
    setV('hudWebglVal', '0 calls / 0 tris (2D Canvas)');
    setV('hudDomVal', `${domNodes} nodes`);
  }

  function runTwoSecondFpsProbe() {
    if (benchRafId) return;
    const btn = hudEl && hudEl.querySelector('#hudProbeBtn');
    if (btn) btn.textContent = 'SAMPLING...';
    const start = performance.now();
    const step = (ts) => {
      recordActiveFrame(ts);
      if (ts - start < 2000 && hudEl) {
        benchRafId = requestAnimationFrame(step);
      } else {
        benchRafId = null;
        if (btn) btn.textContent = 'TEST 2s FPS';
        renderDebugMetrics();
      }
    };
    benchRafId = requestAnimationFrame(step);
  }

  function toggleDebugHud(forceOpen) {
    if (forceOpen === false || (hudEl && forceOpen === undefined)) {
      clearInterval(hudInterval);
      hudInterval = null;
      if (benchRafId) {
        cancelAnimationFrame(benchRafId);
        benchRafId = null;
      }
      if (hudEl) {
        hudEl.remove();
        hudEl = null;
      }
      return;
    }
    if (hudEl) return;

    hudEl = document.createElement('aside');
    hudEl.id = 'perfHud';
    hudEl.className = 'perf-hud';
    hudEl.setAttribute('aria-label', 'Performance Debug HUD');
    hudEl.innerHTML = `
      <div class="perf-hud-head">
        <span class="perf-hud-title">STREET.FX // PERF HUD</span>
        <span id="hudStateBadge" class="perf-hud-badge is-sleep">IDLE</span>
      </div>
      <div class="perf-hud-grid">
        <span class="perf-hud-k">Frame Rate</span><span id="hudFpsVal" class="perf-hud-v">-</span>
        <span class="perf-hud-k">Quality Tier</span><span id="hudQualityVal" class="perf-hud-v">-</span>
        <span class="perf-hud-k">Active rAF Loops</span><span id="hudRafVal" class="perf-hud-v">-</span>
        <span class="perf-hud-k">ScrollTriggers</span><span id="hudStVal" class="perf-hud-v">-</span>
        <span class="perf-hud-k">Active &lt;video&gt;</span><span id="hudVidVal" class="perf-hud-v">-</span>
        <span class="perf-hud-k">WebGL Calls/Tris</span><span id="hudWebglVal" class="perf-hud-v">-</span>
        <span class="perf-hud-k">DOM Elements</span><span id="hudDomVal" class="perf-hud-v">-</span>
      </div>
      <div class="perf-hud-actions">
        <button id="hudCycleQBtn" type="button" class="perf-hud-btn">CYCLE TIER</button>
        <button id="hudProbeBtn" type="button" class="perf-hud-btn">TEST 2s FPS</button>
        <button id="hudCloseBtn" type="button" class="perf-hud-btn">HIDE [P]</button>
      </div>
    `;
    document.body.appendChild(hudEl);

    hudEl.querySelector('#hudCycleQBtn')?.addEventListener('click', () => {
      const idx = (QUALITY_ORDER.indexOf(qualityTier) + 1) % QUALITY_ORDER.length;
      applyQualityTier(QUALITY_ORDER[idx], true);
      refreshScroll();
      renderDebugMetrics();
    });
    hudEl.querySelector('#hudProbeBtn')?.addEventListener('click', runTwoSecondFpsProbe);
    hudEl.querySelector('#hudCloseBtn')?.addEventListener('click', () => toggleDebugHud(false));

    renderDebugMetrics();
    hudInterval = setInterval(renderDebugMetrics, 250);
  }

  function initDebugHotkey() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('debug') === '1') {
        if (document.body) toggleDebugHud(true);
        else document.addEventListener('DOMContentLoaded', () => toggleDebugHud(true), { once: true });
      }
    } catch {}

    window.addEventListener('keydown', (e) => {
      if (e.key !== 'p' && e.key !== 'P') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable)) return;
      toggleDebugHud();
    });
  }

  // -------------------------------------------------------------------------
  // BOOTSTRAP
  // -------------------------------------------------------------------------
  let didInit = false;
  function init() {
    if (didInit) return;
    didInit = true;
    applyQualityTier(detectInitialQuality(), false);
    monitorBatteryOnce();
    initLoader();
    initSprayCursor();
    initScrollAndReveals();
    initDebugHotkey();
  }

  window.STREET_FX = {
    init,
    observeNew,
    scrollTo: scrollToTarget,
    refreshScroll,
    cleanupScroll,
    pauseScroll,
    resumeScroll,
    getQuality: () => qualityTier,
    setQuality: (tier, lock) => { applyQualityTier(tier, lock); refreshScroll(); },
    toggleDebugHud
  };
})();
