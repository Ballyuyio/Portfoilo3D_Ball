# Audit & Optimization Log — STREET WALL 3D Portfolio

> บันทึกการตรวจสอบ (Step 1 Audit), แผนการปรับปรุง และประวัติการแก้ไขทั้งหมดสำหรับอ้างอิงในอนาคต (อ้างอิงร่วมกับ `README.md` และ `PROJECT_HANDOFF.md`)

---

## 1. Step 1 Audit Summary (ตรวจสอบเมื่อ 2026-11-13)

### A. โครงสร้างโปรเจกต์ปัจจุบัน
- Root (`E:/Portfoilo3D_Ball/`): เว็บไซต์ Static สำหรับ Deploy (`index.html`, `styles/streetwall.css`, `js/app.js`, `js/streetfx.js`, `data/projects.js`, `data/projects.json`, `public/`, `scripts/`, `README.md`, `PROJECT_HANDOFF.md`)
- Subfolder (`E:/Portfoilo3D_Ball/Portfolio_Patanawan/`): สำเนาซ้ำซ้อนของไฟล์เว็บไซต์ทั้งหมด + `WorkingModelmage/` (ต้นฉบับ READ-ONLY)

### B. สรุปปัญหา Mobile Display (360px / 390px / 768px / 1024px)
1. **Desktop-First CSS & ขาด Breakpoint สำหรับจอมือถือเล็ก (360px / 390px)**: มีแค่ `@media (max-width: 1080px)` และ `@media (max-width: 820px)`
2. **ความเสี่ยงล้นแนวนอน / ข้อความเบียด**:
   - `.hero-name` ใช้ `clamp(2.6rem, 6.4vw, 5.1rem)` -> บนจอ 360px คำว่า `JARUNONGKRAN` ที่ `41.6px` กว้างเกินกรอบ
   - `.header-inner` บน 360px มี `.brand-stencil` + `.brand-name` + `.lang-toggle` + `.mobile-menu-btn` เบียดกันแน่น
   - `.modal-topbar` (Lightbox / Motion Modal) และ `.detail-nav-pair` ไม่รองรับ `flex-wrap` เหมาะสมบน 360px ทำให้ปุ่มเบียด/ล้น
   - `.band-wipe-bar` (`inset: 10px -2%`) และ `.hero-poster-wrap` (`box-shadow: 10px 10px 0`) ชิดขอบจอมากบน 360px
3. **Tap Targets เล็กกว่า 44x44px**:
   - `.hero-thumb-btn` (4 คอลัมน์บน 360px สูง ~39px), `.filter-btn` (~32px), `.lang-toggle` (~32px), `.mobile-menu-btn` (39x39px), `.mobile-drawer .nav-link` (~36px), `.channel-btn` (~26px), `.social-pill` (~30px), `.motion-open-btn` (~24px), `.art-project-pill` (~16px), `.ba-handle` (38x38px), `.modal-arrow` (กว้าง 42px)
4. **ขนาดตัวอักษรต่ำกว่า 16px บนมือถือ**:
   - Body copy ย่อย, `.hero-bio` (`0.98rem`), `.dossier-desc` (`0.85rem`), `.service-card p` (`0.86rem`), และ `.form-field input/select/textarea` (`0.92rem` ทำให้ iOS Safari auto-zoom เมื่อโฟกัส)

### C. สรุปปัญหา Performance & Core Web Vitals
1. **Render-Blocking Scripts & Unminified Assets**:
   - `data/projects.js` ใหญ่ถึง **914.78 KB** และโหลดแบบ synchronous (ไม่มี `defer`) บล็อกการ parse HTML และยืดเวลา FCP/LCP (ข้อมูลซ้ำซ้อนระหว่าง `projects[]` กับ `rendersFeed`, `workflowFeed`, `beforeAfterPairs`, `motionGroups`)
   - `styles/streetwall.css` (**47.65 KB**), `js/streetfx.js` (**28.00 KB**), `js/app.js` (**66.16 KB**) ยังไม่ถูก minify และ JS โหลดแบบไม่มี `defer`
2. **Hero LCP & Blocker**:
   - `#streetLoader` ปิดทับทั้งหน้าจอสูงถึง 1,000ms ในครั้งแรก ทำให้ LCP ช้าลง ~1 วินาที
   - `#heroMainImg` ชี้ไปที่ไฟล์ PNG เต็ม `01-submarine-hero.png` (**658.75 KB**, ขนาดจริง `833x675`) แต่ใน HTML ระบุ `width="1280" height="720"` ผิดสัดส่วน และไม่มี `fetchpriority="high"`
3. **Google Fonts**: โหลดถึง 6 Font Families (`Bungee`, `JetBrains Mono`, `Noto Sans Thai`, `Permanent Marker`, `Rubik Spray Paint`, `Space Grotesk`)
4. **Initial DOM & Image Requests**:
   - โหลดการ์ดเริ่มต้นพร้อมกัน 108 รูป unique (`4.67 MB`): Hero (5), Renders (24), Before/After Sliders (19 คู่ = 38 รูป), Workflow (12 รวม GIF ขนาด `527 KB` และ `801 KB`), Motion Posters (26), Project Covers (30)
   - ยังไม่มี `.webp` / `.avif`, ไม่มี `srcset`/`sizes` สำหรับมือถือ, และ Detail Hero img (`app.js:838`) ขาด `width`/`height`
5. **Duplicate & Unreferenced Images**:
   - พบภาพไม่ถูกใช้งานในโค้ด (Unreferenced) **2 ไฟล์** (รวม `644.22 KB`): `01-nagi-wireframe-turntable-gif-poster.jpg` (319.38 KB) และ `02-kaiwa-wireframe-turntable-gif-poster.jpg` (324.84 KB)
   - พบโฟลเดอร์ `Portfolio_Patanawan/public/` เป็นสำเนาซ้ำซ้อนทั้งชุด (443 ภาพ / 66.40 MB + 26 วิดีโอ / 359.82 MB) บน Disk/Git (หมายเหตุ: `WorkingModelmage/` ยังคง READ-ONLY ห้ามแตะต้อง)

---

## 2. Complete Image Inventory (443 Images — 66.4 MB Total)

| # | Path | Size (KB) | Dimensions | Used In |
|---:|---|---:|---|---|
| 1 | `public/assets/animations/character-sculpt-rigging-studies/thumbs/bipedal-mannequin-walk-cycle-poster.jpg` | 40.92 | 1258x708 | project[character-sculpt-rigging-studies].animations.poster |
| 2 | `public/assets/animations/character-sculpt-rigging-studies/thumbs/bipedal-mannequin-walk-cycle-thumb.jpg` | 16.27 | 800x450 | project[character-sculpt-rigging-studies].animations.thumb |
| 3 | `public/assets/animations/chibi-crusader-knight/thumbs/crusader-orange-studio-final-poster.jpg` | 54.63 | 1280x720 | project[chibi-crusader-knight].animations.poster |
| 4 | `public/assets/animations/chibi-crusader-knight/thumbs/crusader-orange-studio-final-thumb.jpg` | 19.28 | 800x450 | project[chibi-crusader-knight].animations.thumb |
| 5 | `public/assets/animations/chibi-crusader-knight/thumbs/crusader-rig-and-flail-test-poster.jpg` | 72.83 | 1114x706 | project[chibi-crusader-knight].animations.poster |
| 6 | `public/assets/animations/chibi-crusader-knight/thumbs/crusader-rig-and-flail-test-thumb.jpg` | 30.16 | 800x507 | project[chibi-crusader-knight].animations.thumb |
| 7 | `public/assets/animations/cloud-strife-chibi/thumbs/cloud-arena-opener-poster.jpg` | 123.19 | 1280x720 | project[cloud-strife-chibi].animations.poster |
| 8 | `public/assets/animations/cloud-strife-chibi/thumbs/cloud-arena-opener-thumb.jpg` | 47.76 | 800x450 | project[cloud-strife-chibi].animations.thumb |
| 9 | `public/assets/animations/cloud-strife-chibi/thumbs/cloud-boss-arena-final-poster.jpg` | 124.66 | 1280x720 | project[cloud-strife-chibi].animations.poster |
| 10 | `public/assets/animations/cloud-strife-chibi/thumbs/cloud-boss-arena-final-thumb.jpg` | 46.13 | 800x450 | project[cloud-strife-chibi].animations.thumb |
| 11 | `public/assets/animations/cloud-strife-chibi/thumbs/cloud-closeup-sequence-poster.jpg` | 103.19 | 1280x720 | project[cloud-strife-chibi].animations.poster |
| 12 | `public/assets/animations/cloud-strife-chibi/thumbs/cloud-closeup-sequence-thumb.jpg` | 35.98 | 800x450 | project[cloud-strife-chibi].animations.thumb |
| 13 | `public/assets/animations/cloud-strife-chibi/thumbs/cloud-dash-slash-cut-poster.jpg` | 117.44 | 1280x720 | project[cloud-strife-chibi].animations.poster |
| 14 | `public/assets/animations/cloud-strife-chibi/thumbs/cloud-dash-slash-cut-thumb.jpg` | 45.55 | 800x450 | project[cloud-strife-chibi].animations.thumb |
| 15 | `public/assets/animations/furry-guardian/thumbs/furry-idle-poster.jpg` | 100.01 | 1280x719 | project[furry-guardian].animations.poster |
| 16 | `public/assets/animations/furry-guardian/thumbs/furry-idle-thumb.jpg` | 35.19 | 800x449 | project[furry-guardian].animations.thumb |
| 17 | `public/assets/animations/furry-guardian/thumbs/furry-mobile-gameplay-demo-poster.jpg` | 84.28 | 1048x478 | project[furry-guardian].animations.poster |
| 18 | `public/assets/animations/furry-guardian/thumbs/furry-mobile-gameplay-demo-thumb.jpg` | 42.29 | 800x365 | project[furry-guardian].animations.thumb |
| 19 | `public/assets/animations/furry-guardian/thumbs/furry-pounce-attack-poster.jpg` | 93.47 | 1280x719 | project[furry-guardian].animations.poster |
| 20 | `public/assets/animations/furry-guardian/thumbs/furry-pounce-attack-thumb.jpg` | 32.70 | 800x449 | project[furry-guardian].animations.thumb |
| 21 | `public/assets/animations/furry-guardian/thumbs/furry-walk-poster.jpg` | 96.92 | 1280x719 | project[furry-guardian].animations.poster |
| 22 | `public/assets/animations/furry-guardian/thumbs/furry-walk-thumb.jpg` | 34.47 | 800x449 | project[furry-guardian].animations.thumb |
| 23 | `public/assets/animations/graffiti-submarine/thumbs/submarine-beauty-turntable-poster.jpg` | 61.28 | 1280x720 | project[graffiti-submarine].animations.poster |
| 24 | `public/assets/animations/graffiti-submarine/thumbs/submarine-beauty-turntable-thumb.jpg` | 23.68 | 800x450 | project[graffiti-submarine].animations.thumb |
| 25 | `public/assets/animations/graffiti-submarine/thumbs/submarine-wireframe-wipe-poster.jpg` | 84.87 | 1280x720 | project[graffiti-submarine].animations.poster |
| 26 | `public/assets/animations/graffiti-submarine/thumbs/submarine-wireframe-wipe-thumb.jpg` | 29.08 | 800x450 | project[graffiti-submarine].animations.thumb |
| 27 | `public/assets/animations/hooded-hunter-game-pack/thumbs/hunter-battle-stance-block-poster.jpg` | 123.99 | 1280x670 | project[hooded-hunter-game-pack].animations.poster |
| 28 | `public/assets/animations/hooded-hunter-game-pack/thumbs/hunter-battle-stance-block-thumb.jpg` | 41.48 | 800x419 | project[hooded-hunter-game-pack].animations.thumb |
| 29 | `public/assets/animations/hooded-hunter-game-pack/thumbs/hunter-idle-poster.jpg` | 104.90 | 1280x599 | project[hooded-hunter-game-pack].animations.poster |
| 30 | `public/assets/animations/hooded-hunter-game-pack/thumbs/hunter-idle-thumb.jpg` | 35.54 | 800x374 | project[hooded-hunter-game-pack].animations.thumb |
| 31 | `public/assets/animations/hooded-hunter-game-pack/thumbs/hunter-jump-poster.jpg` | 79.48 | 1280x623 | project[hooded-hunter-game-pack].animations.poster |
| 32 | `public/assets/animations/hooded-hunter-game-pack/thumbs/hunter-jump-thumb.jpg` | 26.08 | 800x389 | project[hooded-hunter-game-pack].animations.thumb |
| 33 | `public/assets/animations/hooded-hunter-game-pack/thumbs/hunter-pose-to-idle-poster.jpg` | 111.95 | 1280x645 | project[hooded-hunter-game-pack].animations.poster |
| 34 | `public/assets/animations/hooded-hunter-game-pack/thumbs/hunter-pose-to-idle-thumb.jpg` | 36.15 | 800x403 | project[hooded-hunter-game-pack].animations.thumb |
| 35 | `public/assets/animations/hooded-hunter-game-pack/thumbs/hunter-run-poster.jpg` | 85.78 | 1280x538 | project[hooded-hunter-game-pack].animations.poster |
| 36 | `public/assets/animations/hooded-hunter-game-pack/thumbs/hunter-run-thumb.jpg` | 30.32 | 800x336 | project[hooded-hunter-game-pack].animations.thumb |
| 37 | `public/assets/animations/hooded-hunter-game-pack/thumbs/hunter-walk-poster.jpg` | 81.18 | 1280x645 | project[hooded-hunter-game-pack].animations.poster |
| 38 | `public/assets/animations/hooded-hunter-game-pack/thumbs/hunter-walk-thumb.jpg` | 30.23 | 800x403 | project[hooded-hunter-game-pack].animations.thumb |
| 39 | `public/assets/animations/sailboat-ocean-prototype/thumbs/sailboat-dusk-wave-test-poster.jpg` | 29.21 | 1280x532 | project[sailboat-ocean-prototype].animations.poster |
| 40 | `public/assets/animations/sailboat-ocean-prototype/thumbs/sailboat-dusk-wave-test-thumb.jpg` | 10.48 | 800x332 | project[sailboat-ocean-prototype].animations.thumb |
| 41 | `public/assets/animations/sailboat-ocean-prototype/thumbs/sailboat-ocean-navigation-reel-poster.jpg` | 62.34 | 1280x538 | project[sailboat-ocean-prototype].cover.src, project[sailboat-ocean-prototype].animations.poster |
| 42 | `public/assets/animations/sailboat-ocean-prototype/thumbs/sailboat-ocean-navigation-reel-thumb.jpg` | 20.76 | 800x336 | project[sailboat-ocean-prototype].cover.thumb, project[sailboat-ocean-prototype].animations.thumb |
| 43 | `public/assets/animations/stone-crystal-golem/thumbs/golem-crystal-skill-poster.jpg` | 81.29 | 1280x720 | project[stone-crystal-golem].animations.poster |
| 44 | `public/assets/animations/stone-crystal-golem/thumbs/golem-crystal-skill-thumb.jpg` | 27.59 | 800x450 | project[stone-crystal-golem].animations.thumb |
| 45 | `public/assets/animations/stone-crystal-golem/thumbs/golem-death-collapse-poster.jpg` | 28.19 | 1280x720 | project[stone-crystal-golem].animations.poster |
| 46 | `public/assets/animations/stone-crystal-golem/thumbs/golem-death-collapse-thumb.jpg` | 11.13 | 800x450 | project[stone-crystal-golem].animations.thumb |
| 47 | `public/assets/animations/stone-crystal-golem/thumbs/golem-guard-shield-poster.jpg` | 40.74 | 1280x720 | project[stone-crystal-golem].animations.poster |
| 48 | `public/assets/animations/stone-crystal-golem/thumbs/golem-guard-shield-thumb.jpg` | 14.36 | 800x450 | project[stone-crystal-golem].animations.thumb |
| 49 | `public/assets/animations/stone-crystal-golem/thumbs/golem-melee-attack-poster.jpg` | 51.12 | 1280x720 | project[stone-crystal-golem].animations.poster |
| 50 | `public/assets/animations/stone-crystal-golem/thumbs/golem-melee-attack-thumb.jpg` | 18.39 | 800x450 | project[stone-crystal-golem].animations.thumb |
| 51 | `public/assets/animations/stone-crystal-golem/thumbs/golem-walk-cycle-poster.jpg` | 58.69 | 1280x720 | project[stone-crystal-golem].animations.poster |
| 52 | `public/assets/animations/stone-crystal-golem/thumbs/golem-walk-cycle-thumb.jpg` | 20.50 | 800x450 | project[stone-crystal-golem].animations.thumb |
| 53 | `public/assets/renders/agent-jean/01-jean-action-aim.jpg` | 145.48 | 1920x1080 | project[agent-jean].cover.src, project[agent-jean].renders.src, rendersFeed |
| 54 | `public/assets/renders/agent-jean/02-jean-portrait-01.jpg` | 146.95 | 1920x1080 | project[agent-jean].renders.src, rendersFeed |
| 55 | `public/assets/renders/agent-jean/03-jean-portrait-02.jpg` | 218.82 | 1920x1080 | project[agent-jean].renders.src, rendersFeed |
| 56 | `public/assets/renders/agent-jean/04-jean-side-profile.jpg` | 221.98 | 1920x1080 | project[agent-jean].renders.src, rendersFeed |
| 57 | `public/assets/renders/agent-jean/05-jean-back-jacket.jpg` | 186.95 | 1920x1080 | project[agent-jean].renders.src, rendersFeed |
| 58 | `public/assets/renders/agent-jean/06-jean-low-angle.jpg` | 182.06 | 1920x1080 | project[agent-jean].renders.src, rendersFeed |
| 59 | `public/assets/renders/agent-jean/thumbs/01-jean-action-aim-thumb.jpg` | 17.24 | 800x450 | project[agent-jean].cover.thumb, project[agent-jean].renders.thumb, rendersFeed.thumb |
| 60 | `public/assets/renders/agent-jean/thumbs/02-jean-portrait-01-thumb.jpg` | 15.57 | 800x450 | project[agent-jean].renders.thumb, rendersFeed.thumb |
| 61 | `public/assets/renders/agent-jean/thumbs/03-jean-portrait-02-thumb.jpg` | 18.11 | 800x450 | project[agent-jean].renders.thumb, rendersFeed.thumb |
| 62 | `public/assets/renders/agent-jean/thumbs/04-jean-side-profile-thumb.jpg` | 18.45 | 800x450 | project[agent-jean].renders.thumb, rendersFeed.thumb |
| 63 | `public/assets/renders/agent-jean/thumbs/05-jean-back-jacket-thumb.jpg` | 17.07 | 800x450 | project[agent-jean].renders.thumb, rendersFeed.thumb |
| 64 | `public/assets/renders/agent-jean/thumbs/06-jean-low-angle-thumb.jpg` | 18.49 | 800x450 | project[agent-jean].renders.thumb, rendersFeed.thumb |
| 65 | `public/assets/renders/aircraft-cabin-seat/01-cabin-seat-hero.jpg` | 226.64 | 1920x1080 | project[aircraft-cabin-seat].cover.src, project[aircraft-cabin-seat].renders.src, project[aircraft-cabin-seat].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc |
| 66 | `public/assets/renders/aircraft-cabin-seat/02-cabin-seat-side-recline.jpg` | 382.99 | 1920x1080 | project[aircraft-cabin-seat].renders.src, rendersFeed |
| 67 | `public/assets/renders/aircraft-cabin-seat/03-cabin-seat-rear-tray.jpg` | 346.82 | 1920x1080 | project[aircraft-cabin-seat].renders.src, rendersFeed |
| 68 | `public/assets/renders/aircraft-cabin-seat/04-cabin-seat-leather-ver2.jpg` | 230.73 | 1920x1080 | project[aircraft-cabin-seat].renders.src, rendersFeed |
| 69 | `public/assets/renders/aircraft-cabin-seat/thumbs/01-cabin-seat-hero-thumb.jpg` | 18.89 | 800x450 | project[aircraft-cabin-seat].cover.thumb, project[aircraft-cabin-seat].renders.thumb, project[aircraft-cabin-seat].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 70 | `public/assets/renders/aircraft-cabin-seat/thumbs/02-cabin-seat-side-recline-thumb.jpg` | 34.74 | 800x450 | project[aircraft-cabin-seat].renders.thumb, rendersFeed.thumb |
| 71 | `public/assets/renders/aircraft-cabin-seat/thumbs/03-cabin-seat-rear-tray-thumb.jpg` | 30.91 | 800x450 | project[aircraft-cabin-seat].renders.thumb, rendersFeed.thumb |
| 72 | `public/assets/renders/aircraft-cabin-seat/thumbs/04-cabin-seat-leather-ver2-thumb.jpg` | 21.95 | 800x450 | project[aircraft-cabin-seat].renders.thumb, rendersFeed.thumb |
| 73 | `public/assets/renders/asian-heritage-architecture/01-chinese-pagoda-courtyard.jpg` | 569.35 | 2048x2048 | project[asian-heritage-architecture].cover.src, project[asian-heritage-architecture].renders.src, rendersFeed |
| 74 | `public/assets/renders/asian-heritage-architecture/thumbs/01-chinese-pagoda-courtyard-thumb.jpg` | 51.97 | 800x800 | project[asian-heritage-architecture].cover.thumb, project[asian-heritage-architecture].renders.thumb, rendersFeed.thumb |
| 75 | `public/assets/renders/bathroom-island-diorama/01-bathroom-island-diorama.jpg` | 193.73 | 1920x1080 | project[bathroom-island-diorama].cover.src, project[bathroom-island-diorama].renders.src, rendersFeed |
| 76 | `public/assets/renders/bathroom-island-diorama/02-skibidi-prop-render.jpg` | 73.69 | 960x540 | project[bathroom-island-diorama].renders.src, rendersFeed |
| 77 | `public/assets/renders/bathroom-island-diorama/03-wet-floor-caution-sign.png` | 241.37 | 737x824 | project[bathroom-island-diorama].renders.src, project[bathroom-island-diorama].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc |
| 78 | `public/assets/renders/bathroom-island-diorama/thumbs/01-bathroom-island-diorama-thumb.jpg` | 22.72 | 800x450 | project[bathroom-island-diorama].cover.thumb, project[bathroom-island-diorama].renders.thumb, rendersFeed.thumb |
| 79 | `public/assets/renders/bathroom-island-diorama/thumbs/02-skibidi-prop-render-thumb.jpg` | 23.44 | 800x450 | project[bathroom-island-diorama].renders.thumb, rendersFeed.thumb |
| 80 | `public/assets/renders/bathroom-island-diorama/thumbs/03-wet-floor-caution-sign-thumb.jpg` | 34.23 | 737x824 | project[bathroom-island-diorama].renders.thumb, project[bathroom-island-diorama].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 81 | `public/assets/renders/character-jin/01-jin-horror-portrait.jpg` | 52.86 | 960x540 | project[character-jin].cover.src, project[character-jin].renders.src, rendersFeed |
| 82 | `public/assets/renders/character-jin/02-jin-three-quarter.jpg` | 55.76 | 960x540 | project[character-jin].renders.src, rendersFeed |
| 83 | `public/assets/renders/character-jin/03-jin-back-hair-buns.jpg` | 104.50 | 1920x1080 | project[character-jin].renders.src, rendersFeed |
| 84 | `public/assets/renders/character-jin/thumbs/01-jin-horror-portrait-thumb.jpg` | 19.77 | 800x450 | project[character-jin].cover.thumb, project[character-jin].renders.thumb, rendersFeed.thumb |
| 85 | `public/assets/renders/character-jin/thumbs/02-jin-three-quarter-thumb.jpg` | 20.50 | 800x450 | project[character-jin].renders.thumb, rendersFeed.thumb |
| 86 | `public/assets/renders/character-jin/thumbs/03-jin-back-hair-buns-thumb.jpg` | 14.10 | 800x450 | project[character-jin].renders.thumb, rendersFeed.thumb |
| 87 | `public/assets/renders/character-mint/01-mint-chibi-hero.jpg` | 70.94 | 960x540 | project[character-mint].cover.src, project[character-mint].renders.src, rendersFeed |
| 88 | `public/assets/renders/character-mint/02-mint-front-rigged.jpg` | 240.48 | 1920x1080 | project[character-mint].renders.src, rendersFeed |
| 89 | `public/assets/renders/character-mint/03-mint-side-bow.jpg` | 168.58 | 1920x1080 | project[character-mint].renders.src, rendersFeed |
| 90 | `public/assets/renders/character-mint/04-mint-rear-kimono.jpg` | 151.71 | 1920x1080 | project[character-mint].renders.src, rendersFeed |
| 91 | `public/assets/renders/character-mint/05-mint-studio-alt.jpg` | 269.60 | 1920x1080 | project[character-mint].renders.src, rendersFeed |
| 92 | `public/assets/renders/character-mint/thumbs/01-mint-chibi-hero-thumb.jpg` | 23.15 | 800x450 | project[character-mint].cover.thumb, project[character-mint].renders.thumb, rendersFeed.thumb |
| 93 | `public/assets/renders/character-mint/thumbs/02-mint-front-rigged-thumb.jpg` | 25.64 | 800x450 | project[character-mint].renders.thumb, rendersFeed.thumb |
| 94 | `public/assets/renders/character-mint/thumbs/03-mint-side-bow-thumb.jpg` | 16.23 | 800x450 | project[character-mint].renders.thumb, rendersFeed.thumb |
| 95 | `public/assets/renders/character-mint/thumbs/04-mint-rear-kimono-thumb.jpg` | 16.99 | 800x450 | project[character-mint].renders.thumb, rendersFeed.thumb |
| 96 | `public/assets/renders/character-mint/thumbs/05-mint-studio-alt-thumb.jpg` | 22.36 | 800x450 | project[character-mint].renders.thumb, rendersFeed.thumb |
| 97 | `public/assets/renders/character-wich/01-wich-front-tpose.jpg` | 340.30 | 1920x1080 | project[character-wich].cover.src, project[character-wich].renders.src, rendersFeed |
| 98 | `public/assets/renders/character-wich/02-wich-three-quarter.jpg` | 276.95 | 1920x1080 | project[character-wich].renders.src, rendersFeed |
| 99 | `public/assets/renders/character-wich/03-wich-side-hair.jpg` | 302.31 | 1920x1080 | project[character-wich].renders.src, rendersFeed |
| 100 | `public/assets/renders/character-wich/04-wich-rear-skirt.jpg` | 324.99 | 1920x1080 | project[character-wich].renders.src, rendersFeed |
| 101 | `public/assets/renders/character-wich/thumbs/01-wich-front-tpose-thumb.jpg` | 32.27 | 800x450 | project[character-wich].cover.thumb, project[character-wich].renders.thumb, rendersFeed.thumb |
| 102 | `public/assets/renders/character-wich/thumbs/02-wich-three-quarter-thumb.jpg` | 23.25 | 800x450 | project[character-wich].renders.thumb, rendersFeed.thumb |
| 103 | `public/assets/renders/character-wich/thumbs/03-wich-side-hair-thumb.jpg` | 25.69 | 800x450 | project[character-wich].renders.thumb, rendersFeed.thumb |
| 104 | `public/assets/renders/character-wich/thumbs/04-wich-rear-skirt-thumb.jpg` | 28.40 | 800x450 | project[character-wich].renders.thumb, rendersFeed.thumb |
| 105 | `public/assets/renders/chibi-crusader-knight/01-crusader-knight-hero.png` | 571.05 | 802x715 | project[chibi-crusader-knight].cover.src, project[chibi-crusader-knight].renders.src, rendersFeed |
| 106 | `public/assets/renders/chibi-crusader-knight/02-spiked-flail-beauty.png` | 436.51 | 751x813 | project[chibi-crusader-knight].renders.src, project[chibi-crusader-knight].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc |
| 107 | `public/assets/renders/chibi-crusader-knight/thumbs/01-crusader-knight-hero-thumb.jpg` | 44.01 | 800x713 | project[chibi-crusader-knight].cover.thumb, project[chibi-crusader-knight].renders.thumb, rendersFeed.thumb |
| 108 | `public/assets/renders/chibi-crusader-knight/thumbs/02-spiked-flail-beauty-thumb.jpg` | 24.03 | 751x813 | project[chibi-crusader-knight].renders.thumb, project[chibi-crusader-knight].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 109 | `public/assets/renders/cloud-strife-chibi/01-cloud-hero-buster-sword.jpg` | 248.95 | 1920x1080 | project[cloud-strife-chibi].cover.src, project[cloud-strife-chibi].renders.src, rendersFeed |
| 110 | `public/assets/renders/cloud-strife-chibi/02-cloud-action-angle.jpg` | 926.89 | 1920x1080 | project[cloud-strife-chibi].renders.src, rendersFeed |
| 111 | `public/assets/renders/cloud-strife-chibi/03-cloud-portrait-light.jpg` | 1031.11 | 1920x1080 | project[cloud-strife-chibi].renders.src, rendersFeed |
| 112 | `public/assets/renders/cloud-strife-chibi/04-cloud-side-armor.jpg` | 998.32 | 1920x1080 | project[cloud-strife-chibi].renders.src, rendersFeed |
| 113 | `public/assets/renders/cloud-strife-chibi/05-cloud-back-view.jpg` | 966.92 | 1920x1080 | project[cloud-strife-chibi].renders.src, rendersFeed |
| 114 | `public/assets/renders/cloud-strife-chibi/06-cloud-rim-light-05.jpg` | 884.97 | 1920x1080 | project[cloud-strife-chibi].renders.src, rendersFeed |
| 115 | `public/assets/renders/cloud-strife-chibi/07-cloud-rim-light-06.jpg` | 859.39 | 1920x1080 | project[cloud-strife-chibi].renders.src, rendersFeed |
| 116 | `public/assets/renders/cloud-strife-chibi/08-cloud-studio-pass-01.jpg` | 467.10 | 1920x1080 | project[cloud-strife-chibi].renders.src, rendersFeed |
| 117 | `public/assets/renders/cloud-strife-chibi/09-cloud-studio-pass-02.jpg` | 933.79 | 1920x1080 | project[cloud-strife-chibi].renders.src, rendersFeed |
| 118 | `public/assets/renders/cloud-strife-chibi/10-cloud-studio-pass-03.jpg` | 949.17 | 1920x1080 | project[cloud-strife-chibi].renders.src, rendersFeed |
| 119 | `public/assets/renders/cloud-strife-chibi/11-cloud-studio-pass-04.jpg` | 958.01 | 1920x1080 | project[cloud-strife-chibi].renders.src, rendersFeed |
| 120 | `public/assets/renders/cloud-strife-chibi/thumbs/01-cloud-hero-buster-sword-thumb.jpg` | 30.29 | 800x450 | project[cloud-strife-chibi].cover.thumb, project[cloud-strife-chibi].renders.thumb, rendersFeed.thumb |
| 121 | `public/assets/renders/cloud-strife-chibi/thumbs/02-cloud-action-angle-thumb.jpg` | 84.42 | 800x450 | project[cloud-strife-chibi].renders.thumb, rendersFeed.thumb |
| 122 | `public/assets/renders/cloud-strife-chibi/thumbs/03-cloud-portrait-light-thumb.jpg` | 86.66 | 800x450 | project[cloud-strife-chibi].renders.thumb, rendersFeed.thumb |
| 123 | `public/assets/renders/cloud-strife-chibi/thumbs/04-cloud-side-armor-thumb.jpg` | 87.43 | 800x450 | project[cloud-strife-chibi].renders.thumb, rendersFeed.thumb |
| 124 | `public/assets/renders/cloud-strife-chibi/thumbs/05-cloud-back-view-thumb.jpg` | 82.16 | 800x450 | project[cloud-strife-chibi].renders.thumb, rendersFeed.thumb |
| 125 | `public/assets/renders/cloud-strife-chibi/thumbs/06-cloud-rim-light-05-thumb.jpg` | 74.14 | 800x450 | project[cloud-strife-chibi].renders.thumb, rendersFeed.thumb |
| 126 | `public/assets/renders/cloud-strife-chibi/thumbs/07-cloud-rim-light-06-thumb.jpg` | 76.91 | 800x450 | project[cloud-strife-chibi].renders.thumb, rendersFeed.thumb |
| 127 | `public/assets/renders/cloud-strife-chibi/thumbs/08-cloud-studio-pass-01-thumb.jpg` | 35.15 | 800x450 | project[cloud-strife-chibi].renders.thumb, rendersFeed.thumb |
| 128 | `public/assets/renders/cloud-strife-chibi/thumbs/09-cloud-studio-pass-02-thumb.jpg` | 81.38 | 800x450 | project[cloud-strife-chibi].renders.thumb, rendersFeed.thumb |
| 129 | `public/assets/renders/cloud-strife-chibi/thumbs/10-cloud-studio-pass-03-thumb.jpg` | 82.27 | 800x450 | project[cloud-strife-chibi].renders.thumb, rendersFeed.thumb |
| 130 | `public/assets/renders/cloud-strife-chibi/thumbs/11-cloud-studio-pass-04-thumb.jpg` | 83.25 | 800x450 | project[cloud-strife-chibi].renders.thumb, rendersFeed.thumb |
| 131 | `public/assets/renders/combat-weapons-arsenal/01-tactical-hatchet-side.jpg` | 251.05 | 1920x1080 | project[combat-weapons-arsenal].cover.src, project[combat-weapons-arsenal].renders.src, project[combat-weapons-arsenal].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc |
| 132 | `public/assets/renders/combat-weapons-arsenal/02-tactical-hatchet-iso.jpg` | 253.60 | 1920x1080 | project[combat-weapons-arsenal].renders.src, project[combat-weapons-arsenal].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc |
| 133 | `public/assets/renders/combat-weapons-arsenal/03-karambit-blade.png` | 90.26 | 904x776 | project[combat-weapons-arsenal].renders.src, project[combat-weapons-arsenal].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc |
| 134 | `public/assets/renders/combat-weapons-arsenal/04-silenced-tactical-pistol.png` | 309.31 | 1920x1080 | project[combat-weapons-arsenal].renders.src, rendersFeed |
| 135 | `public/assets/renders/combat-weapons-arsenal/05-flintlock-blunderbuss-left.jpg` | 292.47 | 1920x1080 | project[combat-weapons-arsenal].renders.src, project[combat-weapons-arsenal].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc |
| 136 | `public/assets/renders/combat-weapons-arsenal/06-flintlock-blunderbuss-right.jpg` | 285.41 | 1920x1080 | project[combat-weapons-arsenal].renders.src, rendersFeed |
| 137 | `public/assets/renders/combat-weapons-arsenal/07-crusader-kite-shield.png` | 510.00 | 858x716 | project[combat-weapons-arsenal].renders.src, project[combat-weapons-arsenal].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc |
| 138 | `public/assets/renders/combat-weapons-arsenal/08-scifi-lightsaber-hilt.jpg` | 79.10 | 1920x1080 | project[combat-weapons-arsenal].renders.src, rendersFeed |
| 139 | `public/assets/renders/combat-weapons-arsenal/09-chained-chaos-blade.jpg` | 98.27 | 1920x1080 | project[combat-weapons-arsenal].renders.src, rendersFeed |
| 140 | `public/assets/renders/combat-weapons-arsenal/10-jade-rune-sword.jpg` | 26.16 | 960x540 | project[combat-weapons-arsenal].renders.src, rendersFeed |
| 141 | `public/assets/renders/combat-weapons-arsenal/11-wrapped-rune-dagger.jpg` | 140.36 | 1920x1080 | project[combat-weapons-arsenal].renders.src, rendersFeed |
| 142 | `public/assets/renders/combat-weapons-arsenal/thumbs/01-tactical-hatchet-side-thumb.jpg` | 20.25 | 800x450 | project[combat-weapons-arsenal].cover.thumb, project[combat-weapons-arsenal].renders.thumb, project[combat-weapons-arsenal].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 143 | `public/assets/renders/combat-weapons-arsenal/thumbs/02-tactical-hatchet-iso-thumb.jpg` | 20.56 | 800x450 | project[combat-weapons-arsenal].renders.thumb, project[combat-weapons-arsenal].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 144 | `public/assets/renders/combat-weapons-arsenal/thumbs/03-karambit-blade-thumb.jpg` | 17.84 | 800x687 | project[combat-weapons-arsenal].renders.thumb, project[combat-weapons-arsenal].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 145 | `public/assets/renders/combat-weapons-arsenal/thumbs/04-silenced-tactical-pistol-thumb.jpg` | 16.14 | 800x450 | project[combat-weapons-arsenal].renders.thumb, rendersFeed.thumb |
| 146 | `public/assets/renders/combat-weapons-arsenal/thumbs/05-flintlock-blunderbuss-left-thumb.jpg` | 25.63 | 800x450 | project[combat-weapons-arsenal].renders.thumb, project[combat-weapons-arsenal].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 147 | `public/assets/renders/combat-weapons-arsenal/thumbs/06-flintlock-blunderbuss-right-thumb.jpg` | 26.49 | 800x450 | project[combat-weapons-arsenal].renders.thumb, rendersFeed.thumb |
| 148 | `public/assets/renders/combat-weapons-arsenal/thumbs/07-crusader-kite-shield-thumb.jpg` | 33.13 | 800x668 | project[combat-weapons-arsenal].renders.thumb, project[combat-weapons-arsenal].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 149 | `public/assets/renders/combat-weapons-arsenal/thumbs/08-scifi-lightsaber-hilt-thumb.jpg` | 11.68 | 800x450 | project[combat-weapons-arsenal].renders.thumb, rendersFeed.thumb |
| 150 | `public/assets/renders/combat-weapons-arsenal/thumbs/09-chained-chaos-blade-thumb.jpg` | 14.04 | 800x450 | project[combat-weapons-arsenal].renders.thumb, rendersFeed.thumb |
| 151 | `public/assets/renders/combat-weapons-arsenal/thumbs/10-jade-rune-sword-thumb.jpg` | 12.20 | 800x450 | project[combat-weapons-arsenal].renders.thumb, rendersFeed.thumb |
| 152 | `public/assets/renders/combat-weapons-arsenal/thumbs/11-wrapped-rune-dagger-thumb.jpg` | 18.10 | 800x450 | project[combat-weapons-arsenal].renders.thumb, rendersFeed.thumb |
| 153 | `public/assets/renders/cozy-gamer-bedroom/01-gamer-bedroom-final.jpg` | 278.97 | 2048x2048 | project[cozy-gamer-bedroom].cover.src, project[cozy-gamer-bedroom].renders.src, rendersFeed |
| 154 | `public/assets/renders/cozy-gamer-bedroom/02-gamer-bedroom-day-angle.jpg` | 399.96 | 1920x1080 | project[cozy-gamer-bedroom].renders.src, rendersFeed |
| 155 | `public/assets/renders/cozy-gamer-bedroom/03-gamer-bedroom-wip-pass.jpg` | 211.87 | 2048x2048 | project[cozy-gamer-bedroom].renders.src, rendersFeed |
| 156 | `public/assets/renders/cozy-gamer-bedroom/04-gamer-bedroom-night-led.jpg` | 262.79 | 2048x2048 | project[cozy-gamer-bedroom].renders.src, rendersFeed |
| 157 | `public/assets/renders/cozy-gamer-bedroom/thumbs/01-gamer-bedroom-final-thumb.jpg` | 28.94 | 800x800 | project[cozy-gamer-bedroom].cover.thumb, project[cozy-gamer-bedroom].renders.thumb, rendersFeed.thumb |
| 158 | `public/assets/renders/cozy-gamer-bedroom/thumbs/02-gamer-bedroom-day-angle-thumb.jpg` | 39.50 | 800x450 | project[cozy-gamer-bedroom].renders.thumb, rendersFeed.thumb |
| 159 | `public/assets/renders/cozy-gamer-bedroom/thumbs/03-gamer-bedroom-wip-pass-thumb.jpg` | 22.38 | 800x800 | project[cozy-gamer-bedroom].renders.thumb, rendersFeed.thumb |
| 160 | `public/assets/renders/cozy-gamer-bedroom/thumbs/04-gamer-bedroom-night-led-thumb.jpg` | 27.99 | 800x800 | project[cozy-gamer-bedroom].renders.thumb, rendersFeed.thumb |
| 161 | `public/assets/renders/egyptian-sphinx-island/01-egyptian-sphinx-wide.jpg` | 467.96 | 1920x1080 | project[egyptian-sphinx-island].cover.src, project[egyptian-sphinx-island].renders.src, project[egyptian-sphinx-island].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc |
| 162 | `public/assets/renders/egyptian-sphinx-island/02-egyptian-sphinx-avatar-scale.jpg` | 551.09 | 2048x2048 | project[egyptian-sphinx-island].renders.src, rendersFeed |
| 163 | `public/assets/renders/egyptian-sphinx-island/thumbs/01-egyptian-sphinx-wide-thumb.jpg` | 44.25 | 800x450 | project[egyptian-sphinx-island].cover.thumb, project[egyptian-sphinx-island].renders.thumb, project[egyptian-sphinx-island].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 164 | `public/assets/renders/egyptian-sphinx-island/thumbs/02-egyptian-sphinx-avatar-scale-thumb.jpg` | 48.21 | 800x800 | project[egyptian-sphinx-island].renders.thumb, rendersFeed.thumb |
| 165 | `public/assets/renders/furry-guardian/01-furry-hero-sword.jpg` | 1105.99 | 1920x1080 | project[furry-guardian].cover.src, project[furry-guardian].renders.src, rendersFeed |
| 166 | `public/assets/renders/furry-guardian/02-furry-side-blade.jpg` | 1067.23 | 1920x1080 | project[furry-guardian].renders.src, rendersFeed |
| 167 | `public/assets/renders/furry-guardian/03-furry-dramatic-key.jpg` | 1158.40 | 1920x1080 | project[furry-guardian].renders.src, rendersFeed |
| 168 | `public/assets/renders/furry-guardian/thumbs/01-furry-hero-sword-thumb.jpg` | 90.34 | 800x450 | project[furry-guardian].cover.thumb, project[furry-guardian].renders.thumb, rendersFeed.thumb |
| 169 | `public/assets/renders/furry-guardian/thumbs/02-furry-side-blade-thumb.jpg` | 88.91 | 800x450 | project[furry-guardian].renders.thumb, rendersFeed.thumb |
| 170 | `public/assets/renders/furry-guardian/thumbs/03-furry-dramatic-key-thumb.jpg` | 91.80 | 800x450 | project[furry-guardian].renders.thumb, rendersFeed.thumb |
| 171 | `public/assets/renders/graffiti-submarine/01-submarine-hero.png` | 658.75 | 833x675 | project[graffiti-submarine].cover.src, project[graffiti-submarine].renders.src, project[graffiti-submarine].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc, index.html |
| 172 | `public/assets/renders/graffiti-submarine/02-submarine-three-quarter.png` | 754.91 | 833x654 | project[graffiti-submarine].renders.src, rendersFeed |
| 173 | `public/assets/renders/graffiti-submarine/03-submarine-stern.png` | 681.59 | 836x710 | project[graffiti-submarine].renders.src, rendersFeed |
| 174 | `public/assets/renders/graffiti-submarine/thumbs/01-submarine-hero-thumb.jpg` | 56.15 | 800x648 | project[graffiti-submarine].cover.thumb, project[graffiti-submarine].renders.thumb, project[graffiti-submarine].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 175 | `public/assets/renders/graffiti-submarine/thumbs/02-submarine-three-quarter-thumb.jpg` | 72.77 | 800x628 | project[graffiti-submarine].renders.thumb, rendersFeed.thumb |
| 176 | `public/assets/renders/graffiti-submarine/thumbs/03-submarine-stern-thumb.jpg` | 57.83 | 800x679 | project[graffiti-submarine].renders.thumb, rendersFeed.thumb |
| 177 | `public/assets/renders/hooded-hunter-game-pack/01-game-pack-showcase.png` | 585.35 | 1917x803 | project[hooded-hunter-game-pack].cover.src, project[hooded-hunter-game-pack].renders.src, rendersFeed |
| 178 | `public/assets/renders/hooded-hunter-game-pack/02-elemental-slimes-group.png` | 236.93 | 1915x791 | project[hooded-hunter-game-pack].renders.src, rendersFeed |
| 179 | `public/assets/renders/hooded-hunter-game-pack/thumbs/01-game-pack-showcase-thumb.jpg` | 37.00 | 800x335 | project[hooded-hunter-game-pack].cover.thumb, project[hooded-hunter-game-pack].renders.thumb, rendersFeed.thumb |
| 180 | `public/assets/renders/hooded-hunter-game-pack/thumbs/02-elemental-slimes-group-thumb.jpg` | 17.70 | 800x330 | project[hooded-hunter-game-pack].renders.thumb, rendersFeed.thumb |
| 181 | `public/assets/renders/horror-operating-lab/01-operating-lab-hero.jpg` | 179.59 | 1920x1080 | project[horror-operating-lab].cover.src, project[horror-operating-lab].renders.src, project[horror-operating-lab].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc |
| 182 | `public/assets/renders/horror-operating-lab/02-operating-table-closeup.jpg` | 203.78 | 1920x1080 | project[horror-operating-lab].renders.src, rendersFeed |
| 183 | `public/assets/renders/horror-operating-lab/03-wall-cables-monitors.jpg` | 373.88 | 1920x1080 | project[horror-operating-lab].renders.src, rendersFeed |
| 184 | `public/assets/renders/horror-operating-lab/04-dark-mood-alternate.jpg` | 371.94 | 1920x1080 | project[horror-operating-lab].renders.src, rendersFeed |
| 185 | `public/assets/renders/horror-operating-lab/thumbs/01-operating-lab-hero-thumb.jpg` | 19.76 | 800x450 | project[horror-operating-lab].cover.thumb, project[horror-operating-lab].renders.thumb, project[horror-operating-lab].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 186 | `public/assets/renders/horror-operating-lab/thumbs/02-operating-table-closeup-thumb.jpg` | 22.15 | 800x450 | project[horror-operating-lab].renders.thumb, rendersFeed.thumb |
| 187 | `public/assets/renders/horror-operating-lab/thumbs/03-wall-cables-monitors-thumb.jpg` | 34.91 | 800x450 | project[horror-operating-lab].renders.thumb, rendersFeed.thumb |
| 188 | `public/assets/renders/horror-operating-lab/thumbs/04-dark-mood-alternate-thumb.jpg` | 35.89 | 800x450 | project[horror-operating-lab].renders.thumb, rendersFeed.thumb |
| 189 | `public/assets/renders/minimal-bedroom/01-minimal-bedroom-hero.jpg` | 243.42 | 2048x2048 | project[minimal-bedroom].cover.src, project[minimal-bedroom].renders.src, rendersFeed |
| 190 | `public/assets/renders/minimal-bedroom/thumbs/01-minimal-bedroom-hero-thumb.jpg` | 28.50 | 800x800 | project[minimal-bedroom].cover.thumb, project[minimal-bedroom].renders.thumb, rendersFeed.thumb |
| 191 | `public/assets/renders/motorcycle-series/01-kawasaki-zh2-painted.jpg` | 193.13 | 1920x1080 | project[motorcycle-series].cover.src, project[motorcycle-series].renders.src, project[motorcycle-series].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc |
| 192 | `public/assets/renders/motorcycle-series/02-kawasaki-zh2-front.jpg` | 75.50 | 1920x1080 | project[motorcycle-series].renders.src, rendersFeed |
| 193 | `public/assets/renders/motorcycle-series/03-versys-650-side.jpg` | 315.17 | 1920x1080 | project[motorcycle-series].renders.src, project[motorcycle-series].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc |
| 194 | `public/assets/renders/motorcycle-series/04-versys-650-angle.jpg` | 315.31 | 1920x1080 | project[motorcycle-series].renders.src, rendersFeed |
| 195 | `public/assets/renders/motorcycle-series/thumbs/01-kawasaki-zh2-painted-thumb.jpg` | 22.88 | 800x450 | project[motorcycle-series].cover.thumb, project[motorcycle-series].renders.thumb, project[motorcycle-series].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 196 | `public/assets/renders/motorcycle-series/thumbs/02-kawasaki-zh2-front-thumb.jpg` | 10.81 | 800x450 | project[motorcycle-series].renders.thumb, rendersFeed.thumb |
| 197 | `public/assets/renders/motorcycle-series/thumbs/03-versys-650-side-thumb.jpg` | 32.53 | 800x450 | project[motorcycle-series].renders.thumb, project[motorcycle-series].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 198 | `public/assets/renders/motorcycle-series/thumbs/04-versys-650-angle-thumb.jpg` | 32.77 | 800x450 | project[motorcycle-series].renders.thumb, rendersFeed.thumb |
| 199 | `public/assets/renders/pokemon-collection/01-reshiram-textured-front.jpg` | 224.77 | 1920x1080 | project[pokemon-collection].cover.src, project[pokemon-collection].renders.src, project[pokemon-collection].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc |
| 200 | `public/assets/renders/pokemon-collection/02-reshiram-textured-alternate.jpg` | 140.10 | 1920x1080 | project[pokemon-collection].renders.src, rendersFeed |
| 201 | `public/assets/renders/pokemon-collection/03-ceruledge-cel-outline.jpg` | 143.77 | 1920x1080 | project[pokemon-collection].renders.src, rendersFeed |
| 202 | `public/assets/renders/pokemon-collection/04-zygarde-cobra-emissive.png` | 81.30 | 830x832 | project[pokemon-collection].renders.src, rendersFeed |
| 203 | `public/assets/renders/pokemon-collection/05-meowstic-front-plush.jpg` | 24.72 | 960x540 | project[pokemon-collection].renders.src, rendersFeed |
| 204 | `public/assets/renders/pokemon-collection/06-meowstic-three-quarter.jpg` | 23.20 | 960x540 | project[pokemon-collection].renders.src, rendersFeed |
| 205 | `public/assets/renders/pokemon-collection/thumbs/01-reshiram-textured-front-thumb.jpg` | 18.64 | 800x450 | project[pokemon-collection].cover.thumb, project[pokemon-collection].renders.thumb, project[pokemon-collection].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 206 | `public/assets/renders/pokemon-collection/thumbs/02-reshiram-textured-alternate-thumb.jpg` | 17.51 | 800x450 | project[pokemon-collection].renders.thumb, rendersFeed.thumb |
| 207 | `public/assets/renders/pokemon-collection/thumbs/03-ceruledge-cel-outline-thumb.jpg` | 18.52 | 800x450 | project[pokemon-collection].renders.thumb, rendersFeed.thumb |
| 208 | `public/assets/renders/pokemon-collection/thumbs/04-zygarde-cobra-emissive-thumb.jpg` | 20.33 | 800x802 | project[pokemon-collection].renders.thumb, rendersFeed.thumb |
| 209 | `public/assets/renders/pokemon-collection/thumbs/05-meowstic-front-plush-thumb.jpg` | 10.98 | 800x450 | project[pokemon-collection].renders.thumb, rendersFeed.thumb |
| 210 | `public/assets/renders/pokemon-collection/thumbs/06-meowstic-three-quarter-thumb.jpg` | 10.47 | 800x450 | project[pokemon-collection].renders.thumb, rendersFeed.thumb |
| 211 | `public/assets/renders/product-scifi-props/01-hiet-smart-led-bulb.jpg` | 352.59 | 1920x1080 | project[product-scifi-props].cover.src, project[product-scifi-props].renders.src, project[product-scifi-props].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc |
| 212 | `public/assets/renders/product-scifi-props/02-scifi-cryo-pod.png` | 157.82 | 724x623 | project[product-scifi-props].renders.src, rendersFeed |
| 213 | `public/assets/renders/product-scifi-props/03-scifi-fuel-dispenser.png` | 295.35 | 933x655 | project[product-scifi-props].renders.src, rendersFeed |
| 214 | `public/assets/renders/product-scifi-props/04-ancient-spellbook.png` | 283.24 | 855x705 | project[product-scifi-props].renders.src, project[product-scifi-props].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc |
| 215 | `public/assets/renders/product-scifi-props/05-rusted-les-paul-body.jpg` | 181.97 | 1920x1080 | project[product-scifi-props].renders.src, rendersFeed |
| 216 | `public/assets/renders/product-scifi-props/06-dinosaur-fossil-skeleton.jpg` | 50.91 | 960x540 | project[product-scifi-props].renders.src, rendersFeed |
| 217 | `public/assets/renders/product-scifi-props/07-great-white-shark-head.jpg` | 30.81 | 960x540 | project[product-scifi-props].renders.src, rendersFeed |
| 218 | `public/assets/renders/product-scifi-props/08-orange-tabby-cat-warm.jpg` | 243.51 | 1920x1080 | project[product-scifi-props].renders.src, rendersFeed |
| 219 | `public/assets/renders/product-scifi-props/09-orange-tabby-cat-front.jpg` | 159.41 | 1920x1080 | project[product-scifi-props].renders.src, rendersFeed |
| 220 | `public/assets/renders/product-scifi-props/10-orange-tabby-cat-opposite.jpg` | 201.80 | 1920x1080 | project[product-scifi-props].renders.src, rendersFeed |
| 221 | `public/assets/renders/product-scifi-props/11-orange-tabby-cat-bright.jpg` | 209.83 | 1920x1080 | project[product-scifi-props].renders.src, rendersFeed |
| 222 | `public/assets/renders/product-scifi-props/12-orange-tabby-cat-turn.jpg` | 154.77 | 1920x1080 | project[product-scifi-props].renders.src, rendersFeed |
| 223 | `public/assets/renders/product-scifi-props/thumbs/01-hiet-smart-led-bulb-thumb.jpg` | 30.69 | 800x450 | project[product-scifi-props].cover.thumb, project[product-scifi-props].renders.thumb, project[product-scifi-props].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 224 | `public/assets/renders/product-scifi-props/thumbs/02-scifi-cryo-pod-thumb.jpg` | 23.48 | 724x623 | project[product-scifi-props].renders.thumb, rendersFeed.thumb |
| 225 | `public/assets/renders/product-scifi-props/thumbs/03-scifi-fuel-dispenser-thumb.jpg` | 30.98 | 800x562 | project[product-scifi-props].renders.thumb, rendersFeed.thumb |
| 226 | `public/assets/renders/product-scifi-props/thumbs/04-ancient-spellbook-thumb.jpg` | 27.48 | 800x660 | project[product-scifi-props].renders.thumb, project[product-scifi-props].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 227 | `public/assets/renders/product-scifi-props/thumbs/05-rusted-les-paul-body-thumb.jpg` | 18.66 | 800x450 | project[product-scifi-props].renders.thumb, rendersFeed.thumb |
| 228 | `public/assets/renders/product-scifi-props/thumbs/06-dinosaur-fossil-skeleton-thumb.jpg` | 20.31 | 800x450 | project[product-scifi-props].renders.thumb, rendersFeed.thumb |
| 229 | `public/assets/renders/product-scifi-props/thumbs/07-great-white-shark-head-thumb.jpg` | 12.97 | 800x450 | project[product-scifi-props].renders.thumb, rendersFeed.thumb |
| 230 | `public/assets/renders/product-scifi-props/thumbs/08-orange-tabby-cat-warm-thumb.jpg` | 19.74 | 800x450 | project[product-scifi-props].renders.thumb, rendersFeed.thumb |
| 231 | `public/assets/renders/product-scifi-props/thumbs/09-orange-tabby-cat-front-thumb.jpg` | 17.05 | 800x450 | project[product-scifi-props].renders.thumb, rendersFeed.thumb |
| 232 | `public/assets/renders/product-scifi-props/thumbs/10-orange-tabby-cat-opposite-thumb.jpg` | 17.78 | 800x450 | project[product-scifi-props].renders.thumb, rendersFeed.thumb |
| 233 | `public/assets/renders/product-scifi-props/thumbs/11-orange-tabby-cat-bright-thumb.jpg` | 17.57 | 800x450 | project[product-scifi-props].renders.thumb, rendersFeed.thumb |
| 234 | `public/assets/renders/product-scifi-props/thumbs/12-orange-tabby-cat-turn-thumb.jpg` | 16.50 | 800x450 | project[product-scifi-props].renders.thumb, rendersFeed.thumb |
| 235 | `public/assets/renders/roblox-prop-pack/01-prop-pack-group-lineup.jpg` | 68.47 | 960x540 | project[roblox-prop-pack].cover.src, project[roblox-prop-pack].renders.src, rendersFeed |
| 236 | `public/assets/renders/roblox-prop-pack/02-red-crate-blocky-mech.jpg` | 301.83 | 1920x1080 | project[roblox-prop-pack].renders.src, rendersFeed |
| 237 | `public/assets/renders/roblox-prop-pack/03-camo-desert-eagle.jpg` | 63.27 | 960x540 | project[roblox-prop-pack].renders.src, rendersFeed |
| 238 | `public/assets/renders/roblox-prop-pack/04-wooden-rowboat.jpg` | 54.12 | 960x540 | project[roblox-prop-pack].renders.src, rendersFeed |
| 239 | `public/assets/renders/roblox-prop-pack/05-terrazzo-bucket-hat.jpg` | 52.14 | 960x540 | project[roblox-prop-pack].renders.src, rendersFeed |
| 240 | `public/assets/renders/roblox-prop-pack/06-toothless-dragon-hood.jpg` | 36.37 | 960x540 | project[roblox-prop-pack].renders.src, rendersFeed |
| 241 | `public/assets/renders/roblox-prop-pack/07-red-racing-helmet.jpg` | 37.07 | 960x540 | project[roblox-prop-pack].renders.src, rendersFeed |
| 242 | `public/assets/renders/roblox-prop-pack/08-gold-link-chain-necklace.jpg` | 24.46 | 960x540 | project[roblox-prop-pack].renders.src, rendersFeed |
| 243 | `public/assets/renders/roblox-prop-pack/thumbs/01-prop-pack-group-lineup-thumb.jpg` | 24.10 | 800x450 | project[roblox-prop-pack].cover.thumb, project[roblox-prop-pack].renders.thumb, rendersFeed.thumb |
| 244 | `public/assets/renders/roblox-prop-pack/thumbs/02-red-crate-blocky-mech-thumb.jpg` | 36.04 | 800x450 | project[roblox-prop-pack].renders.thumb, rendersFeed.thumb |
| 245 | `public/assets/renders/roblox-prop-pack/thumbs/03-camo-desert-eagle-thumb.jpg` | 21.80 | 800x450 | project[roblox-prop-pack].renders.thumb, rendersFeed.thumb |
| 246 | `public/assets/renders/roblox-prop-pack/thumbs/04-wooden-rowboat-thumb.jpg` | 18.49 | 800x450 | project[roblox-prop-pack].renders.thumb, rendersFeed.thumb |
| 247 | `public/assets/renders/roblox-prop-pack/thumbs/05-terrazzo-bucket-hat-thumb.jpg` | 18.05 | 800x450 | project[roblox-prop-pack].renders.thumb, rendersFeed.thumb |
| 248 | `public/assets/renders/roblox-prop-pack/thumbs/06-toothless-dragon-hood-thumb.jpg` | 15.26 | 800x450 | project[roblox-prop-pack].renders.thumb, rendersFeed.thumb |
| 249 | `public/assets/renders/roblox-prop-pack/thumbs/07-red-racing-helmet-thumb.jpg` | 14.30 | 800x450 | project[roblox-prop-pack].renders.thumb, rendersFeed.thumb |
| 250 | `public/assets/renders/roblox-prop-pack/thumbs/08-gold-link-chain-necklace-thumb.jpg` | 11.60 | 800x450 | project[roblox-prop-pack].renders.thumb, rendersFeed.thumb |
| 251 | `public/assets/renders/sephiroth-chibi/01-sephiroth-hero.jpg` | 226.16 | 1920x1080 | project[sephiroth-chibi].cover.src, project[sephiroth-chibi].renders.src, project[sephiroth-chibi].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc |
| 252 | `public/assets/renders/sephiroth-chibi/02-sephiroth-coat-flow.jpg` | 238.68 | 1920x1080 | project[sephiroth-chibi].renders.src, rendersFeed |
| 253 | `public/assets/renders/sephiroth-chibi/03-sephiroth-side.jpg` | 225.70 | 1920x1080 | project[sephiroth-chibi].renders.src, rendersFeed |
| 254 | `public/assets/renders/sephiroth-chibi/04-sephiroth-back.jpg` | 337.43 | 1920x1080 | project[sephiroth-chibi].renders.src, rendersFeed |
| 255 | `public/assets/renders/sephiroth-chibi/05-sephiroth-closeup.jpg` | 286.89 | 1920x1080 | project[sephiroth-chibi].renders.src, rendersFeed |
| 256 | `public/assets/renders/sephiroth-chibi/thumbs/01-sephiroth-hero-thumb.jpg` | 20.16 | 800x450 | project[sephiroth-chibi].cover.thumb, project[sephiroth-chibi].renders.thumb, project[sephiroth-chibi].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 257 | `public/assets/renders/sephiroth-chibi/thumbs/02-sephiroth-coat-flow-thumb.jpg` | 22.09 | 800x450 | project[sephiroth-chibi].renders.thumb, rendersFeed.thumb |
| 258 | `public/assets/renders/sephiroth-chibi/thumbs/03-sephiroth-side-thumb.jpg` | 24.29 | 800x450 | project[sephiroth-chibi].renders.thumb, rendersFeed.thumb |
| 259 | `public/assets/renders/sephiroth-chibi/thumbs/04-sephiroth-back-thumb.jpg` | 30.84 | 800x450 | project[sephiroth-chibi].renders.thumb, rendersFeed.thumb |
| 260 | `public/assets/renders/sephiroth-chibi/thumbs/05-sephiroth-closeup-thumb.jpg` | 30.28 | 800x450 | project[sephiroth-chibi].renders.thumb, rendersFeed.thumb |
| 261 | `public/assets/renders/stone-crystal-golem/golem-clay-beauty.png` | 321.92 | 987x766 | project[stone-crystal-golem].cover.src, project[stone-crystal-golem].renders.src, project[stone-crystal-golem].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc |
| 262 | `public/assets/renders/stone-crystal-golem/thumbs/golem-clay-beauty-thumb.jpg` | 36.96 | 800x621 | project[stone-crystal-golem].cover.thumb, project[stone-crystal-golem].renders.thumb, project[stone-crystal-golem].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 263 | `public/assets/renders/street-commerce-buildings/01-two-story-burger-stand.jpg` | 183.88 | 1920x1080 | project[street-commerce-buildings].cover.src, project[street-commerce-buildings].renders.src, rendersFeed |
| 264 | `public/assets/renders/street-commerce-buildings/02-brick-corner-bar-wide.jpg` | 185.24 | 1920x1080 | project[street-commerce-buildings].renders.src, rendersFeed |
| 265 | `public/assets/renders/street-commerce-buildings/03-brick-corner-bar-tight.jpg` | 388.88 | 1920x1080 | project[street-commerce-buildings].renders.src, rendersFeed |
| 266 | `public/assets/renders/street-commerce-buildings/04-magma-vein-shop-kiosk.jpg` | 52.40 | 960x540 | project[street-commerce-buildings].renders.src, rendersFeed |
| 267 | `public/assets/renders/street-commerce-buildings/thumbs/01-two-story-burger-stand-thumb.jpg` | 24.45 | 800x450 | project[street-commerce-buildings].cover.thumb, project[street-commerce-buildings].renders.thumb, rendersFeed.thumb |
| 268 | `public/assets/renders/street-commerce-buildings/thumbs/02-brick-corner-bar-wide-thumb.jpg` | 20.00 | 800x450 | project[street-commerce-buildings].renders.thumb, rendersFeed.thumb |
| 269 | `public/assets/renders/street-commerce-buildings/thumbs/03-brick-corner-bar-tight-thumb.jpg` | 46.55 | 800x450 | project[street-commerce-buildings].renders.thumb, rendersFeed.thumb |
| 270 | `public/assets/renders/street-commerce-buildings/thumbs/04-magma-vein-shop-kiosk-thumb.jpg` | 19.68 | 800x450 | project[street-commerce-buildings].renders.thumb, rendersFeed.thumb |
| 271 | `public/assets/renders/stylized-character-showcase/01-nagi-bluelock-chibi-front.jpg` | 205.29 | 1920x1080 | project[stylized-character-showcase].cover.src, project[stylized-character-showcase].renders.src, rendersFeed |
| 272 | `public/assets/renders/stylized-character-showcase/02-nagi-bluelock-chibi-back.jpg` | 259.69 | 1920x1080 | project[stylized-character-showcase].renders.src, rendersFeed |
| 273 | `public/assets/renders/stylized-character-showcase/03-kaiwa-green-coat-chibi.jpg` | 78.62 | 960x540 | project[stylized-character-showcase].renders.src, rendersFeed |
| 274 | `public/assets/renders/stylized-character-showcase/04-kaiwa-chibi-side.jpg` | 74.04 | 960x540 | project[stylized-character-showcase].renders.src, rendersFeed |
| 275 | `public/assets/renders/stylized-character-showcase/05-leon-kennedy-rpd-chibi.jpg` | 192.05 | 1920x1080 | project[stylized-character-showcase].renders.src, rendersFeed |
| 276 | `public/assets/renders/stylized-character-showcase/06-leon-kennedy-chibi-back.jpg` | 165.12 | 1920x1080 | project[stylized-character-showcase].renders.src, rendersFeed |
| 277 | `public/assets/renders/stylized-character-showcase/07-mona-beret-chibi-angle.jpg` | 108.19 | 1920x1080 | project[stylized-character-showcase].renders.src, rendersFeed |
| 278 | `public/assets/renders/stylized-character-showcase/08-mona-beret-chibi-front.jpg` | 103.24 | 1920x1080 | project[stylized-character-showcase].renders.src, rendersFeed |
| 279 | `public/assets/renders/stylized-character-showcase/09-blue-hoodie-stylized-boy.jpg` | 93.63 | 1920x1080 | project[stylized-character-showcase].renders.src, rendersFeed |
| 280 | `public/assets/renders/stylized-character-showcase/10-female-samurai-kimono.jpg` | 90.66 | 1920x1080 | project[stylized-character-showcase].renders.src, rendersFeed |
| 281 | `public/assets/renders/stylized-character-showcase/11-chewbacca-plush-chibi.jpg` | 122.55 | 1920x1080 | project[stylized-character-showcase].renders.src, rendersFeed |
| 282 | `public/assets/renders/stylized-character-showcase/12-lego-dark-trooper-render.jpg` | 138.23 | 2048x2048 | project[stylized-character-showcase].renders.src, rendersFeed |
| 283 | `public/assets/renders/stylized-character-showcase/13-lego-robin-front.jpg` | 50.00 | 960x540 | project[stylized-character-showcase].renders.src, rendersFeed |
| 284 | `public/assets/renders/stylized-character-showcase/14-lego-robin-angle.jpg` | 38.28 | 960x540 | project[stylized-character-showcase].renders.src, rendersFeed |
| 285 | `public/assets/renders/stylized-character-showcase/15-roblox-bandaged-mummy.png` | 456.38 | 1028x783 | project[stylized-character-showcase].renders.src, rendersFeed |
| 286 | `public/assets/renders/stylized-character-showcase/thumbs/01-nagi-bluelock-chibi-front-thumb.jpg` | 16.19 | 800x450 | project[stylized-character-showcase].cover.thumb, project[stylized-character-showcase].renders.thumb, rendersFeed.thumb |
| 287 | `public/assets/renders/stylized-character-showcase/thumbs/02-nagi-bluelock-chibi-back-thumb.jpg` | 21.83 | 800x450 | project[stylized-character-showcase].renders.thumb, rendersFeed.thumb |
| 288 | `public/assets/renders/stylized-character-showcase/thumbs/03-kaiwa-green-coat-chibi-thumb.jpg` | 20.39 | 800x450 | project[stylized-character-showcase].renders.thumb, rendersFeed.thumb |
| 289 | `public/assets/renders/stylized-character-showcase/thumbs/04-kaiwa-chibi-side-thumb.jpg` | 20.17 | 800x450 | project[stylized-character-showcase].renders.thumb, rendersFeed.thumb |
| 290 | `public/assets/renders/stylized-character-showcase/thumbs/05-leon-kennedy-rpd-chibi-thumb.jpg` | 19.69 | 800x450 | project[stylized-character-showcase].renders.thumb, rendersFeed.thumb |
| 291 | `public/assets/renders/stylized-character-showcase/thumbs/06-leon-kennedy-chibi-back-thumb.jpg` | 17.60 | 800x450 | project[stylized-character-showcase].renders.thumb, rendersFeed.thumb |
| 292 | `public/assets/renders/stylized-character-showcase/thumbs/07-mona-beret-chibi-angle-thumb.jpg` | 14.97 | 800x450 | project[stylized-character-showcase].renders.thumb, rendersFeed.thumb |
| 293 | `public/assets/renders/stylized-character-showcase/thumbs/08-mona-beret-chibi-front-thumb.jpg` | 14.50 | 800x450 | project[stylized-character-showcase].renders.thumb, rendersFeed.thumb |
| 294 | `public/assets/renders/stylized-character-showcase/thumbs/09-blue-hoodie-stylized-boy-thumb.jpg` | 14.30 | 800x450 | project[stylized-character-showcase].renders.thumb, rendersFeed.thumb |
| 295 | `public/assets/renders/stylized-character-showcase/thumbs/10-female-samurai-kimono-thumb.jpg` | 13.30 | 800x450 | project[stylized-character-showcase].renders.thumb, rendersFeed.thumb |
| 296 | `public/assets/renders/stylized-character-showcase/thumbs/11-chewbacca-plush-chibi-thumb.jpg` | 15.43 | 800x450 | project[stylized-character-showcase].renders.thumb, rendersFeed.thumb |
| 297 | `public/assets/renders/stylized-character-showcase/thumbs/12-lego-dark-trooper-render-thumb.jpg` | 19.08 | 800x800 | project[stylized-character-showcase].renders.thumb, rendersFeed.thumb |
| 298 | `public/assets/renders/stylized-character-showcase/thumbs/13-lego-robin-front-thumb.jpg` | 18.82 | 800x450 | project[stylized-character-showcase].renders.thumb, rendersFeed.thumb |
| 299 | `public/assets/renders/stylized-character-showcase/thumbs/14-lego-robin-angle-thumb.jpg` | 15.35 | 800x450 | project[stylized-character-showcase].renders.thumb, rendersFeed.thumb |
| 300 | `public/assets/renders/stylized-character-showcase/thumbs/15-roblox-bandaged-mummy-thumb.jpg` | 43.46 | 800x609 | project[stylized-character-showcase].renders.thumb, rendersFeed.thumb |
| 301 | `public/assets/renders/stylized-game-islands/01-space-rocket-island.jpg` | 224.63 | 1920x1080 | project[stylized-game-islands].cover.src, project[stylized-game-islands].renders.src, rendersFeed |
| 302 | `public/assets/renders/stylized-game-islands/02-deep-sea-base-island.jpg` | 54.86 | 960x540 | project[stylized-game-islands].renders.src, rendersFeed |
| 303 | `public/assets/renders/stylized-game-islands/03-dome-sanctuary-island.jpg` | 431.81 | 2048x2048 | project[stylized-game-islands].renders.src, rendersFeed |
| 304 | `public/assets/renders/stylized-game-islands/04-lighthouse-barrel-chest.jpg` | 33.17 | 960x540 | project[stylized-game-islands].renders.src, rendersFeed |
| 305 | `public/assets/renders/stylized-game-islands/05-stylized-treehouse.png` | 245.10 | 678x619 | project[stylized-game-islands].renders.src, rendersFeed |
| 306 | `public/assets/renders/stylized-game-islands/06-trio-elemental-game-eggs.png` | 179.15 | 972x650 | project[stylized-game-islands].renders.src, rendersFeed |
| 307 | `public/assets/renders/stylized-game-islands/07-cube-pet-trio-studio.jpg` | 49.54 | 960x540 | project[stylized-game-islands].renders.src, rendersFeed |
| 308 | `public/assets/renders/stylized-game-islands/08-cube-pet-trio-sky.png` | 202.36 | 942x440 | project[stylized-game-islands].renders.src, rendersFeed |
| 309 | `public/assets/renders/stylized-game-islands/thumbs/01-space-rocket-island-thumb.jpg` | 26.87 | 800x450 | project[stylized-game-islands].cover.thumb, project[stylized-game-islands].renders.thumb, rendersFeed.thumb |
| 310 | `public/assets/renders/stylized-game-islands/thumbs/02-deep-sea-base-island-thumb.jpg` | 18.76 | 800x450 | project[stylized-game-islands].renders.thumb, rendersFeed.thumb |
| 311 | `public/assets/renders/stylized-game-islands/thumbs/03-dome-sanctuary-island-thumb.jpg` | 43.19 | 800x800 | project[stylized-game-islands].renders.thumb, rendersFeed.thumb |
| 312 | `public/assets/renders/stylized-game-islands/thumbs/04-lighthouse-barrel-chest-thumb.jpg` | 14.16 | 800x450 | project[stylized-game-islands].renders.thumb, rendersFeed.thumb |
| 313 | `public/assets/renders/stylized-game-islands/thumbs/05-stylized-treehouse-thumb.jpg` | 31.68 | 678x619 | project[stylized-game-islands].renders.thumb, rendersFeed.thumb |
| 314 | `public/assets/renders/stylized-game-islands/thumbs/06-trio-elemental-game-eggs-thumb.jpg` | 24.56 | 800x535 | project[stylized-game-islands].renders.thumb, rendersFeed.thumb |
| 315 | `public/assets/renders/stylized-game-islands/thumbs/07-cube-pet-trio-studio-thumb.jpg` | 18.83 | 800x450 | project[stylized-game-islands].renders.thumb, rendersFeed.thumb |
| 316 | `public/assets/renders/stylized-game-islands/thumbs/08-cube-pet-trio-sky-thumb.jpg` | 25.35 | 800x374 | project[stylized-game-islands].renders.thumb, rendersFeed.thumb |
| 317 | `public/assets/renders/stylized-slime-stack/01-slime-stack-hero.jpg` | 396.26 | 1920x1080 | project[stylized-slime-stack].cover.src, project[stylized-slime-stack].renders.src, project[stylized-slime-stack].beforeAfter.afterSrc, rendersFeed, beforeAfterPairs.afterSrc |
| 318 | `public/assets/renders/stylized-slime-stack/02-slime-stack-three-quarter.jpg` | 416.68 | 1920x1080 | project[stylized-slime-stack].renders.src, rendersFeed |
| 319 | `public/assets/renders/stylized-slime-stack/thumbs/01-slime-stack-hero-thumb.jpg` | 38.26 | 800x450 | project[stylized-slime-stack].cover.thumb, project[stylized-slime-stack].renders.thumb, project[stylized-slime-stack].beforeAfter.afterThumb, rendersFeed.thumb, beforeAfterPairs.afterThumb |
| 320 | `public/assets/renders/stylized-slime-stack/thumbs/02-slime-stack-three-quarter-thumb.jpg` | 39.07 | 800x450 | project[stylized-slime-stack].renders.thumb, rendersFeed.thumb |
| 321 | `public/assets/renders/toji-fushiguro/01-toji-hero-front.jpg` | 116.68 | 1920x1080 | project[toji-fushiguro].cover.src, project[toji-fushiguro].renders.src, rendersFeed |
| 322 | `public/assets/renders/toji-fushiguro/02-toji-side-torso.jpg` | 103.07 | 1920x1080 | project[toji-fushiguro].renders.src, rendersFeed |
| 323 | `public/assets/renders/toji-fushiguro/03-toji-back-musculature.jpg` | 158.68 | 1920x1080 | project[toji-fushiguro].renders.src, rendersFeed |
| 324 | `public/assets/renders/toji-fushiguro/04-toji-dramatic-rim.jpg` | 146.31 | 1920x1080 | project[toji-fushiguro].renders.src, rendersFeed |
| 325 | `public/assets/renders/toji-fushiguro/05-toji-three-quarter.jpg` | 107.75 | 1920x1080 | project[toji-fushiguro].renders.src, rendersFeed |
| 326 | `public/assets/renders/toji-fushiguro/06-toji-chibi-edition.jpg` | 75.54 | 1920x1080 | project[toji-fushiguro].renders.src, rendersFeed |
| 327 | `public/assets/renders/toji-fushiguro/thumbs/01-toji-hero-front-thumb.jpg` | 14.56 | 800x450 | project[toji-fushiguro].cover.thumb, project[toji-fushiguro].renders.thumb, rendersFeed.thumb |
| 328 | `public/assets/renders/toji-fushiguro/thumbs/02-toji-side-torso-thumb.jpg` | 13.72 | 800x450 | project[toji-fushiguro].renders.thumb, rendersFeed.thumb |
| 329 | `public/assets/renders/toji-fushiguro/thumbs/03-toji-back-musculature-thumb.jpg` | 17.77 | 800x450 | project[toji-fushiguro].renders.thumb, rendersFeed.thumb |
| 330 | `public/assets/renders/toji-fushiguro/thumbs/04-toji-dramatic-rim-thumb.jpg` | 17.55 | 800x450 | project[toji-fushiguro].renders.thumb, rendersFeed.thumb |
| 331 | `public/assets/renders/toji-fushiguro/thumbs/05-toji-three-quarter-thumb.jpg` | 14.27 | 800x450 | project[toji-fushiguro].renders.thumb, rendersFeed.thumb |
| 332 | `public/assets/renders/toji-fushiguro/thumbs/06-toji-chibi-edition-thumb.jpg` | 12.76 | 800x450 | project[toji-fushiguro].renders.thumb, rendersFeed.thumb |
| 333 | `public/assets/workflow/agent-jean/01-jean-maya-wireframe.jpg` | 417.07 | 1920x1080 | project[agent-jean].workflow.src, workflowFeed |
| 334 | `public/assets/workflow/agent-jean/thumbs/01-jean-maya-wireframe-thumb.jpg` | 29.85 | 800x450 | project[agent-jean].workflow.thumb, workflowFeed.thumb |
| 335 | `public/assets/workflow/aircraft-cabin-seat/01-cabin-seat-wireframe.png` | 281.99 | 1317x706 | project[aircraft-cabin-seat].workflow.src, project[aircraft-cabin-seat].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 336 | `public/assets/workflow/aircraft-cabin-seat/thumbs/01-cabin-seat-wireframe-thumb.jpg` | 39.27 | 800x429 | project[aircraft-cabin-seat].workflow.thumb, project[aircraft-cabin-seat].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 337 | `public/assets/workflow/asian-heritage-architecture/01-korean-courtyard-split-wireframe.png` | 413.89 | 1106x473 | project[asian-heritage-architecture].workflow.src, workflowFeed |
| 338 | `public/assets/workflow/asian-heritage-architecture/thumbs/01-korean-courtyard-split-wireframe-thumb.jpg` | 64.99 | 800x342 | project[asian-heritage-architecture].workflow.thumb, workflowFeed.thumb |
| 339 | `public/assets/workflow/bathroom-island-diorama/01-caution-sign-wireframe.png` | 226.58 | 677x787 | project[bathroom-island-diorama].workflow.src, project[bathroom-island-diorama].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 340 | `public/assets/workflow/bathroom-island-diorama/02-bathroom-island-wireframe.png` | 134.32 | 857x484 | project[bathroom-island-diorama].workflow.src, workflowFeed |
| 341 | `public/assets/workflow/bathroom-island-diorama/03-substance-bathroom-kit-textures.png` | 130.62 | 1389x735 | project[bathroom-island-diorama].workflow.src, workflowFeed |
| 342 | `public/assets/workflow/bathroom-island-diorama/thumbs/01-caution-sign-wireframe-thumb.jpg` | 33.40 | 677x787 | project[bathroom-island-diorama].workflow.thumb, project[bathroom-island-diorama].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 343 | `public/assets/workflow/bathroom-island-diorama/thumbs/02-bathroom-island-wireframe-thumb.jpg` | 55.11 | 800x452 | project[bathroom-island-diorama].workflow.thumb, workflowFeed.thumb |
| 344 | `public/assets/workflow/bathroom-island-diorama/thumbs/03-substance-bathroom-kit-textures-thumb.jpg` | 23.51 | 800x423 | project[bathroom-island-diorama].workflow.thumb, workflowFeed.thumb |
| 345 | `public/assets/workflow/character-jin/01-jin-rig-wireframe.png` | 584.09 | 1919x1024 | project[character-jin].workflow.src, workflowFeed |
| 346 | `public/assets/workflow/character-jin/thumbs/01-jin-rig-wireframe-thumb.jpg` | 60.16 | 800x427 | project[character-jin].workflow.thumb, workflowFeed.thumb |
| 347 | `public/assets/workflow/character-mint/01-mint-maya-dual-rig.png` | 266.76 | 1330x794 | project[character-mint].workflow.src, workflowFeed |
| 348 | `public/assets/workflow/character-mint/thumbs/01-mint-maya-dual-rig-thumb.jpg` | 61.21 | 800x478 | project[character-mint].workflow.thumb, workflowFeed.thumb |
| 349 | `public/assets/workflow/character-sculpt-rigging-studies/01-gray-clay-head-sculpt.jpg` | 55.36 | 1920x1080 | project[character-sculpt-rigging-studies].cover.src, project[character-sculpt-rigging-studies].workflow.src, workflowFeed |
| 350 | `public/assets/workflow/character-sculpt-rigging-studies/thumbs/01-gray-clay-head-sculpt-thumb.jpg` | 9.42 | 800x450 | project[character-sculpt-rigging-studies].cover.thumb, project[character-sculpt-rigging-studies].workflow.thumb, workflowFeed.thumb |
| 351 | `public/assets/workflow/character-wich/01-wich-maya-wireframe.png` | 210.11 | 1902x898 | project[character-wich].workflow.src, workflowFeed |
| 352 | `public/assets/workflow/character-wich/thumbs/01-wich-maya-wireframe-thumb.jpg` | 36.93 | 800x378 | project[character-wich].workflow.thumb, workflowFeed.thumb |
| 353 | `public/assets/workflow/chibi-crusader-knight/01-flail-wireframe.png` | 484.94 | 818x800 | project[chibi-crusader-knight].workflow.src, project[chibi-crusader-knight].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 354 | `public/assets/workflow/chibi-crusader-knight/02-knight-substance-wireframe.png` | 734.27 | 892x765 | project[chibi-crusader-knight].workflow.src, workflowFeed |
| 355 | `public/assets/workflow/chibi-crusader-knight/thumbs/01-flail-wireframe-thumb.jpg` | 28.41 | 800x782 | project[chibi-crusader-knight].workflow.thumb, project[chibi-crusader-knight].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 356 | `public/assets/workflow/chibi-crusader-knight/thumbs/02-knight-substance-wireframe-thumb.jpg` | 53.25 | 800x686 | project[chibi-crusader-knight].workflow.thumb, workflowFeed.thumb |
| 357 | `public/assets/workflow/combat-weapons-arsenal/01-hatchet-wireframe.png` | 24.61 | 1317x706 | project[combat-weapons-arsenal].workflow.src, project[combat-weapons-arsenal].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 358 | `public/assets/workflow/combat-weapons-arsenal/02-hatchet-clay-lighting.png` | 28.34 | 1317x706 | project[combat-weapons-arsenal].workflow.src, project[combat-weapons-arsenal].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 359 | `public/assets/workflow/combat-weapons-arsenal/03-hatchet-maya-dual-ui.png` | 250.59 | 1905x939 | project[combat-weapons-arsenal].workflow.src, workflowFeed |
| 360 | `public/assets/workflow/combat-weapons-arsenal/04-karambit-wireframe.png` | 150.36 | 885x753 | project[combat-weapons-arsenal].workflow.src, project[combat-weapons-arsenal].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 361 | `public/assets/workflow/combat-weapons-arsenal/05-flintlock-maya-wireframe.png` | 44.83 | 1317x706 | project[combat-weapons-arsenal].workflow.src, project[combat-weapons-arsenal].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 362 | `public/assets/workflow/combat-weapons-arsenal/06-shield-wireframe.png` | 517.28 | 797x733 | project[combat-weapons-arsenal].workflow.src, project[combat-weapons-arsenal].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 363 | `public/assets/workflow/combat-weapons-arsenal/07-lightsaber-maya-viewport.png` | 207.35 | 1919x832 | project[combat-weapons-arsenal].workflow.src, workflowFeed |
| 364 | `public/assets/workflow/combat-weapons-arsenal/thumbs/01-hatchet-wireframe-thumb.jpg` | 21.81 | 800x429 | project[combat-weapons-arsenal].workflow.thumb, project[combat-weapons-arsenal].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 365 | `public/assets/workflow/combat-weapons-arsenal/thumbs/02-hatchet-clay-lighting-thumb.jpg` | 19.69 | 800x429 | project[combat-weapons-arsenal].workflow.thumb, project[combat-weapons-arsenal].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 366 | `public/assets/workflow/combat-weapons-arsenal/thumbs/03-hatchet-maya-dual-ui-thumb.jpg` | 52.90 | 800x394 | project[combat-weapons-arsenal].workflow.thumb, workflowFeed.thumb |
| 367 | `public/assets/workflow/combat-weapons-arsenal/thumbs/04-karambit-wireframe-thumb.jpg` | 20.54 | 800x681 | project[combat-weapons-arsenal].workflow.thumb, project[combat-weapons-arsenal].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 368 | `public/assets/workflow/combat-weapons-arsenal/thumbs/05-flintlock-maya-wireframe-thumb.jpg` | 49.69 | 800x429 | project[combat-weapons-arsenal].workflow.thumb, project[combat-weapons-arsenal].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 369 | `public/assets/workflow/combat-weapons-arsenal/thumbs/06-shield-wireframe-thumb.jpg` | 42.66 | 797x733 | project[combat-weapons-arsenal].workflow.thumb, project[combat-weapons-arsenal].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 370 | `public/assets/workflow/combat-weapons-arsenal/thumbs/07-lightsaber-maya-viewport-thumb.jpg` | 34.00 | 800x347 | project[combat-weapons-arsenal].workflow.thumb, workflowFeed.thumb |
| 371 | `public/assets/workflow/cozy-gamer-bedroom/01-bedroom-maya-persp.png` | 388.26 | 1918x936 | project[cozy-gamer-bedroom].workflow.src, workflowFeed |
| 372 | `public/assets/workflow/cozy-gamer-bedroom/02-bedroom-front-ortho.png` | 415.18 | 1919x1028 | project[cozy-gamer-bedroom].workflow.src, workflowFeed |
| 373 | `public/assets/workflow/cozy-gamer-bedroom/03-bedroom-side-ortho.png` | 191.94 | 1200x732 | project[cozy-gamer-bedroom].workflow.src, workflowFeed |
| 374 | `public/assets/workflow/cozy-gamer-bedroom/04-bedroom-top-ortho.png` | 302.18 | 1265x768 | project[cozy-gamer-bedroom].workflow.src, workflowFeed |
| 375 | `public/assets/workflow/cozy-gamer-bedroom/thumbs/01-bedroom-maya-persp-thumb.jpg` | 43.77 | 800x390 | project[cozy-gamer-bedroom].workflow.thumb, workflowFeed.thumb |
| 376 | `public/assets/workflow/cozy-gamer-bedroom/thumbs/02-bedroom-front-ortho-thumb.jpg` | 50.94 | 800x429 | project[cozy-gamer-bedroom].workflow.thumb, workflowFeed.thumb |
| 377 | `public/assets/workflow/cozy-gamer-bedroom/thumbs/03-bedroom-side-ortho-thumb.jpg` | 36.21 | 800x488 | project[cozy-gamer-bedroom].workflow.thumb, workflowFeed.thumb |
| 378 | `public/assets/workflow/cozy-gamer-bedroom/thumbs/04-bedroom-top-ortho-thumb.jpg` | 44.00 | 800x486 | project[cozy-gamer-bedroom].workflow.thumb, workflowFeed.thumb |
| 379 | `public/assets/workflow/egyptian-sphinx-island/01-sphinx-island-wireframe.png` | 595.72 | 1919x1002 | project[egyptian-sphinx-island].workflow.src, project[egyptian-sphinx-island].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 380 | `public/assets/workflow/egyptian-sphinx-island/thumbs/01-sphinx-island-wireframe-thumb.jpg` | 56.54 | 800x418 | project[egyptian-sphinx-island].workflow.thumb, project[egyptian-sphinx-island].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 381 | `public/assets/workflow/furry-guardian/01-nurbs-rig-controls.png` | 269.57 | 1818x837 | project[furry-guardian].workflow.src, workflowFeed |
| 382 | `public/assets/workflow/furry-guardian/thumbs/01-nurbs-rig-controls-thumb.jpg` | 47.98 | 800x368 | project[furry-guardian].workflow.thumb, workflowFeed.thumb |
| 383 | `public/assets/workflow/graffiti-submarine/01-split-wireframe-breakdown.png` | 887.15 | 838x767 | project[graffiti-submarine].workflow.src, project[graffiti-submarine].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 384 | `public/assets/workflow/graffiti-submarine/thumbs/01-split-wireframe-breakdown-thumb.jpg` | 80.20 | 800x732 | project[graffiti-submarine].workflow.thumb, project[graffiti-submarine].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 385 | `public/assets/workflow/hooded-hunter-game-pack/01-unity-scene-integration.png` | 298.73 | 1918x914 | project[hooded-hunter-game-pack].workflow.src, workflowFeed |
| 386 | `public/assets/workflow/hooded-hunter-game-pack/02-unity-slime-prefabs.png` | 206.87 | 1170x919 | project[hooded-hunter-game-pack].workflow.src, workflowFeed |
| 387 | `public/assets/workflow/hooded-hunter-game-pack/03-hunter-body-curves.png` | 366.62 | 1919x1079 | project[hooded-hunter-game-pack].workflow.src, workflowFeed |
| 388 | `public/assets/workflow/hooded-hunter-game-pack/04-hunter-rig-pose.png` | 162.89 | 1057x761 | project[hooded-hunter-game-pack].workflow.src, workflowFeed |
| 389 | `public/assets/workflow/hooded-hunter-game-pack/05-hunter-rig-ik.png` | 178.72 | 1078x767 | project[hooded-hunter-game-pack].workflow.src, workflowFeed |
| 390 | `public/assets/workflow/hooded-hunter-game-pack/06-hunter-rig-three-quarter.png` | 166.36 | 1288x798 | project[hooded-hunter-game-pack].workflow.src, workflowFeed |
| 391 | `public/assets/workflow/hooded-hunter-game-pack/thumbs/01-unity-scene-integration-thumb.jpg` | 33.04 | 800x381 | project[hooded-hunter-game-pack].workflow.thumb, workflowFeed.thumb |
| 392 | `public/assets/workflow/hooded-hunter-game-pack/thumbs/02-unity-slime-prefabs-thumb.jpg` | 41.28 | 800x628 | project[hooded-hunter-game-pack].workflow.thumb, workflowFeed.thumb |
| 393 | `public/assets/workflow/hooded-hunter-game-pack/thumbs/03-hunter-body-curves-thumb.jpg` | 50.55 | 800x450 | project[hooded-hunter-game-pack].workflow.thumb, workflowFeed.thumb |
| 394 | `public/assets/workflow/hooded-hunter-game-pack/thumbs/04-hunter-rig-pose-thumb.jpg` | 51.55 | 800x576 | project[hooded-hunter-game-pack].workflow.thumb, workflowFeed.thumb |
| 395 | `public/assets/workflow/hooded-hunter-game-pack/thumbs/05-hunter-rig-ik-thumb.jpg` | 49.81 | 800x569 | project[hooded-hunter-game-pack].workflow.thumb, workflowFeed.thumb |
| 396 | `public/assets/workflow/hooded-hunter-game-pack/thumbs/06-hunter-rig-three-quarter-thumb.jpg` | 40.90 | 800x496 | project[hooded-hunter-game-pack].workflow.thumb, workflowFeed.thumb |
| 397 | `public/assets/workflow/horror-operating-lab/01-maya-scene-wireframe.png` | 667.80 | 1908x949 | project[horror-operating-lab].workflow.src, project[horror-operating-lab].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 398 | `public/assets/workflow/horror-operating-lab/thumbs/01-maya-scene-wireframe-thumb.jpg` | 48.74 | 800x398 | project[horror-operating-lab].workflow.thumb, project[horror-operating-lab].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 399 | `public/assets/workflow/minimal-bedroom/01-minimal-front-ortho.png` | 235.74 | 1444x818 | project[minimal-bedroom].workflow.src, workflowFeed |
| 400 | `public/assets/workflow/minimal-bedroom/02-minimal-side-ortho.png` | 300.58 | 1431x790 | project[minimal-bedroom].workflow.src, workflowFeed |
| 401 | `public/assets/workflow/minimal-bedroom/03-minimal-top-ortho.png` | 222.61 | 1493x868 | project[minimal-bedroom].workflow.src, workflowFeed |
| 402 | `public/assets/workflow/minimal-bedroom/thumbs/01-minimal-front-ortho-thumb.jpg` | 38.81 | 800x453 | project[minimal-bedroom].workflow.thumb, workflowFeed.thumb |
| 403 | `public/assets/workflow/minimal-bedroom/thumbs/02-minimal-side-ortho-thumb.jpg` | 38.98 | 800x442 | project[minimal-bedroom].workflow.thumb, workflowFeed.thumb |
| 404 | `public/assets/workflow/minimal-bedroom/thumbs/03-minimal-top-ortho-thumb.jpg` | 38.99 | 800x465 | project[minimal-bedroom].workflow.thumb, workflowFeed.thumb |
| 405 | `public/assets/workflow/motorcycle-series/01-zh2-clay-render.jpg` | 146.07 | 1920x1080 | project[motorcycle-series].workflow.src, project[motorcycle-series].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 406 | `public/assets/workflow/motorcycle-series/02-zh2-maya-viewport.png` | 629.63 | 1919x989 | project[motorcycle-series].workflow.src, workflowFeed |
| 407 | `public/assets/workflow/motorcycle-series/03-versys-650-wireframe.jpg` | 652.54 | 1920x1080 | project[motorcycle-series].workflow.src, project[motorcycle-series].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 408 | `public/assets/workflow/motorcycle-series/thumbs/01-zh2-clay-render-thumb.jpg` | 20.02 | 800x450 | project[motorcycle-series].workflow.thumb, project[motorcycle-series].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 409 | `public/assets/workflow/motorcycle-series/thumbs/02-zh2-maya-viewport-thumb.jpg` | 61.78 | 800x412 | project[motorcycle-series].workflow.thumb, workflowFeed.thumb |
| 410 | `public/assets/workflow/motorcycle-series/thumbs/03-versys-650-wireframe-thumb.jpg` | 49.76 | 800x450 | project[motorcycle-series].workflow.thumb, project[motorcycle-series].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 411 | `public/assets/workflow/pokemon-collection/01-reshiram-clay-sculpt.jpg` | 118.32 | 1920x1080 | project[pokemon-collection].workflow.src, project[pokemon-collection].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 412 | `public/assets/workflow/pokemon-collection/02-reshiram-clay-alternate.jpg` | 110.35 | 1920x1080 | project[pokemon-collection].workflow.src, workflowFeed |
| 413 | `public/assets/workflow/pokemon-collection/thumbs/01-reshiram-clay-sculpt-thumb.jpg` | 17.52 | 800x450 | project[pokemon-collection].workflow.thumb, project[pokemon-collection].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 414 | `public/assets/workflow/pokemon-collection/thumbs/02-reshiram-clay-alternate-thumb.jpg` | 16.46 | 800x450 | project[pokemon-collection].workflow.thumb, workflowFeed.thumb |
| 415 | `public/assets/workflow/product-scifi-props/01-led-bulb-wireframe.png` | 904.95 | 1311x699 | project[product-scifi-props].workflow.src, project[product-scifi-props].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 416 | `public/assets/workflow/product-scifi-props/02-spellbook-wireframe.png` | 321.80 | 900x734 | project[product-scifi-props].workflow.src, project[product-scifi-props].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 417 | `public/assets/workflow/product-scifi-props/03-shark-head-wireframe.png` | 67.21 | 686x570 | project[product-scifi-props].workflow.src, workflowFeed |
| 418 | `public/assets/workflow/product-scifi-props/thumbs/01-led-bulb-wireframe-thumb.jpg` | 58.71 | 800x427 | project[product-scifi-props].workflow.thumb, project[product-scifi-props].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 419 | `public/assets/workflow/product-scifi-props/thumbs/02-spellbook-wireframe-thumb.jpg` | 32.64 | 800x652 | project[product-scifi-props].workflow.thumb, project[product-scifi-props].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 420 | `public/assets/workflow/product-scifi-props/thumbs/03-shark-head-wireframe-thumb.jpg` | 51.09 | 686x570 | project[product-scifi-props].workflow.thumb, workflowFeed.thumb |
| 421 | `public/assets/workflow/sephiroth-chibi/01-sephiroth-wireframe.png` | 167.80 | 1308x704 | project[sephiroth-chibi].workflow.src, project[sephiroth-chibi].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 422 | `public/assets/workflow/sephiroth-chibi/thumbs/01-sephiroth-wireframe-thumb.jpg` | 32.81 | 800x431 | project[sephiroth-chibi].workflow.thumb, project[sephiroth-chibi].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 423 | `public/assets/workflow/stone-crystal-golem/01-retopo-wireframe.png` | 357.15 | 860x692 | project[stone-crystal-golem].workflow.src, project[stone-crystal-golem].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 424 | `public/assets/workflow/stone-crystal-golem/02-maya-textured-viewport.png` | 362.14 | 1654x906 | project[stone-crystal-golem].workflow.src, workflowFeed |
| 425 | `public/assets/workflow/stone-crystal-golem/03-ik-fk-rig-controls.png` | 327.16 | 1917x892 | project[stone-crystal-golem].workflow.src, workflowFeed |
| 426 | `public/assets/workflow/stone-crystal-golem/thumbs/01-retopo-wireframe-thumb.jpg` | 49.28 | 800x644 | project[stone-crystal-golem].workflow.thumb, project[stone-crystal-golem].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 427 | `public/assets/workflow/stone-crystal-golem/thumbs/02-maya-textured-viewport-thumb.jpg` | 39.50 | 800x438 | project[stone-crystal-golem].workflow.thumb, workflowFeed.thumb |
| 428 | `public/assets/workflow/stone-crystal-golem/thumbs/03-ik-fk-rig-controls-thumb.jpg` | 36.61 | 800x372 | project[stone-crystal-golem].workflow.thumb, workflowFeed.thumb |
| 429 | `public/assets/workflow/stylized-character-showcase/01-nagi-wireframe-turntable-gif.gif` | 527.03 | 1920x1080 | project[stylized-character-showcase].workflow.src, workflowFeed |
| 430 | `public/assets/workflow/stylized-character-showcase/02-kaiwa-wireframe-turntable-gif.gif` | 800.80 | 1920x1080 | project[stylized-character-showcase].workflow.src, workflowFeed |
| 431 | `public/assets/workflow/stylized-character-showcase/03-lego-dark-trooper-arnold-hud.png` | 215.59 | 1125x713 | project[stylized-character-showcase].workflow.src, workflowFeed |
| 432 | `public/assets/workflow/stylized-character-showcase/04-lego-dark-trooper-rear-viewport.png` | 174.66 | 1119x706 | project[stylized-character-showcase].workflow.src, workflowFeed |
| 433 | `public/assets/workflow/stylized-character-showcase/thumbs/01-nagi-wireframe-turntable-gif-poster.jpg` | 319.38 | 1280x720 | **UNUSED (Unreferenced)** |
| 434 | `public/assets/workflow/stylized-character-showcase/thumbs/01-nagi-wireframe-turntable-gif-thumb.jpg` | 50.36 | 800x450 | project[stylized-character-showcase].workflow.thumb, workflowFeed.thumb |
| 435 | `public/assets/workflow/stylized-character-showcase/thumbs/02-kaiwa-wireframe-turntable-gif-poster.jpg` | 324.84 | 1280x720 | **UNUSED (Unreferenced)** |
| 436 | `public/assets/workflow/stylized-character-showcase/thumbs/02-kaiwa-wireframe-turntable-gif-thumb.jpg` | 39.58 | 800x450 | project[stylized-character-showcase].workflow.thumb, workflowFeed.thumb |
| 437 | `public/assets/workflow/stylized-character-showcase/thumbs/03-lego-dark-trooper-arnold-hud-thumb.jpg` | 39.59 | 800x507 | project[stylized-character-showcase].workflow.thumb, workflowFeed.thumb |
| 438 | `public/assets/workflow/stylized-character-showcase/thumbs/04-lego-dark-trooper-rear-viewport-thumb.jpg` | 35.30 | 800x505 | project[stylized-character-showcase].workflow.thumb, workflowFeed.thumb |
| 439 | `public/assets/workflow/stylized-slime-stack/01-slime-stack-wireframe.png` | 973.96 | 1312x698 | project[stylized-slime-stack].workflow.src, project[stylized-slime-stack].beforeAfter.beforeSrc, workflowFeed, beforeAfterPairs.beforeSrc |
| 440 | `public/assets/workflow/stylized-slime-stack/thumbs/01-slime-stack-wireframe-thumb.jpg` | 59.81 | 800x426 | project[stylized-slime-stack].workflow.thumb, project[stylized-slime-stack].beforeAfter.beforeThumb, workflowFeed.thumb, beforeAfterPairs.beforeThumb |
| 441 | `public/assets/workflow/toji-fushiguro/01-toji-maya-wireframe-rig.png` | 105.84 | 1245x818 | project[toji-fushiguro].workflow.src, workflowFeed |
| 442 | `public/assets/workflow/toji-fushiguro/thumbs/01-toji-maya-wireframe-rig-thumb.jpg` | 29.31 | 800x526 | project[toji-fushiguro].workflow.thumb, workflowFeed.thumb |
| 443 | `public/favicon.svg` | 0.88 | 64x64 | index.html |

---

## 3. Change Log & Results (ดำเนินการ Step 2–4 แล้วเมื่อ 2026-11-13)

### A. Backup ก่อนแก้ไข
สำรองไฟล์ต้นฉบับทั้งหมดไว้ที่ `E:/Portfoilo3D_Ball/_backup/`:
- `_backup/index.html` (41,254 B)
- `_backup/styles/streetwall.css` (47,649 B)
- `_backup/js/app.js` (66,163 B)
- `_backup/js/streetfx.js` (28,002 B)
- `_backup/data/projects.js` (914,778 B)
- `_backup/data/projects.json` (1,015,524 B)

### B. สรุปการเปลี่ยนแปลงแต่ละส่วน

1. **Image Cleanup (`_unused/`) & WebP Responsive Pipeline**:
   - ย้ายภาพ Unreferenced (ไม่ถูกเรียกใช้งานในโค้ดเลย) **2 ไฟล์** (รวม `644.22 KB`) ไปเก็บใน `_unused/` แทนการลบทิ้ง:
     - `_unused/public/assets/workflow/stylized-character-showcase/thumbs/01-nagi-wireframe-turntable-gif-poster.jpg` (319.38 KB) — ซ้ำซ้อนกับ `...-thumb.jpg` และไม่ถูกอ้างอิงใน `data/projects.js` หรือ HTML/JS
     - `_unused/public/assets/workflow/stylized-character-showcase/thumbs/02-kaiwa-wireframe-turntable-gif-poster.jpg` (324.84 KB) — ซ้ำซ้อนกับ `...-thumb.jpg` และไม่ถูกอ้างอิงใน `data/projects.js` หรือ HTML/JS
   - แปลงภาพที่ใช้งานจริง **440 ไฟล์** (`65.77 MB` JPG/PNG/GIF) เป็น `.webp` (`15.90 MB`, ลดลง ~75.8%) พร้อมสร้าง `*-400.webp` ขนาดกว้าง `400px` สำหรับมือถือ **246 ไฟล์** (`1.30 MB` ทั้งชุด) โดยคงไฟล์ต้นฉบับ JPG/PNG/GIF เป็น fallback ใน `<picture>` (ห้ามแตะ `Portfolio_Patanawan/WorkingModelmage/` ซึ่งเป็น READ-ONLY)
   - แก้จุดโหลด GIF ขนาดใหญ่ (`527 KB` และ `801 KB`) ในตาราง Workflow และหน้า Project Detail ให้แสดงภาพนิ่ง `thumb` (`*-400.webp` / `*.webp`) แทน พร้อมคงป้าย `ANIMATED GIF` และโหลดไฟล์ animated WebP (`01-nagi-wireframe-turntable-gif.webp`, `02-kaiwa-wireframe-turntable-gif.webp`) เฉพาะเมื่อผู้ใช้กดเปิดดูใน Lightbox

2. **Mobile-First CSS (`styles/streetwall.css` -> `styles/streetwall.min.css`)**:
   - เปลี่ยน Media Queries จาก Desktop-first เป็น Mobile-first ครบทุกช่วง (`0px` base -> `390px` -> `480px` -> `768px` -> `1024px`)
   - ปรับ `#streetLoader` จาก Fullscreen overlay (`inset: 0`) เป็น Stencil badge ขนาดกะทัดรัดมุมขวาล่าง (`pointer-events: none`) เพื่อไม่ให้บล็อก LCP
   - ป้องกัน Horizontal Overflow และข้อความเบียด: ปรับ `.hero-name` เป็น `clamp(1.85rem, 7.6vw, 5.1rem)` + `overflow-wrap: anywhere`, ซ่อน `.brand-name` ที่ `< 480px`, เพิ่ม `flex-wrap: wrap` บน `.modal-topbar`, `.modal-controls`, `.detail-topbar`, `.detail-nav-pair`, `.motion-card-foot`, `.art-card-top`, `.ba-foot`
   - ขยาย Tap Targets ทุกปุ่ม/ลิงก์/คอนโทรล (`hero-thumb-btn`, `filter-btn`, `lang-toggle`, `mobile-menu-btn`, `channel-btn`, `social-pill`, `motion-open-btn`, `ba-handle`, `modal-arrow`) ให้ได้อย่างน้อย `44x44px`
   - ปรับ body copy และ input/select/textarea ให้ไม่ต่ำกว่า `1rem` (`16px`) บนมือถือ ป้องกัน iOS Safari auto-zoom และเพิ่ม `picture { display: block; width: 100%; height: 100%; }`

3. **Data Deduplication & App Logic (`data/projects.js`, `js/app.js` -> `js/app.min.js`)**:
   - ลดความซ้ำซ้อนใน `data/projects.js` จาก **893.34 KB -> 449.37 KB (-49.7%)** โดยเก็บเฉพาะ `projects[]`, `beforeAfterOrder[]`, `motionGroupDefs[]` แล้วให้ `hydrateData()` ใน `js/app.js` สร้าง `rendersFeed`, `workflowFeed`, `beforeAfterPairs`, `motionGroups` และ `cover` ตอนรัน (ยังคง `<script src="./data/projects.js">` สำหรับ `file:///`)
   - เพิ่ม `<picture>` + `<source type="image/webp" srcset="...-400.webp 400w, ....webp 800w" sizes="...">` ให้ Hero, Beauty Wall, Before/After Sliders, Workflow Grid, Motion Posters, Project Archive และ Project Detail Hero พร้อมกำหนด `width`/`height` และ `loading="lazy"` ด้านล่าง fold
   - แบ่งหน้า Before/After Sliders (`state.baLimit = 6`) จากเดิมโหลดรวดเดียว 19 คู่ (38 รูป) เหลือ 6 คู่ (12 รูป) พร้อมปุ่ม `LOAD MORE +6` / `SHOW ALL 19`

4. **HTML, Fonts & Defer (`index.html`, `js/streetfx.min.js`)**:
   - ชี้ Stylesheet ไปยัง `./styles/streetwall.min.css` และสคริปต์ไปยัง `./js/streetfx.min.js` + `./js/app.min.js` พร้อมใส่ `defer` ให้ `<script>` ทุกตัว
   - เพิ่ม `<link rel="preload" as="image" type="image/webp" imagesrcset="..." fetchpriority="high">` และแก้ขนาด `#heroMainImg` เป็น `width="833" height="675"` + `fetchpriority="high"` พร้อม `<picture>` WebP + PNG fallback
   - ตัด Font Family ที่ไม่จำเป็น (`Permanent Marker`) และ weights ซ้ำ ออก เหลือ 5 Google Fonts พร้อม `&display=swap`
   - เพิ่ม `<div id="baLoadMoreWrap" class="load-more-wrap"></div>` สำหรับปุ่มแบ่งหน้า Sliders

### C. Before / After Comparison Table

| Metric | Before | After (Desktop) | After (Mobile `<= 400px`) | Change |
|---|---:|---:|---:|---|
| **Code + Data Transfer** (`index.html`, CSS, JS, `projects.js`) | 1,072.12 KB | 598.96 KB | 598.96 KB | **-44.1%** |
| `data/projects.js` | 893.34 KB | 449.37 KB | 449.37 KB | **-49.7%** |
| CSS + JS (`streetwall` + `streetfx` + `app`) | 138.49 KB | 108.49 KB | 108.49 KB | **-21.7%** |
| **Hero LCP Image** (`01-submarine-hero`) | 658.75 KB (PNG) | 38.65 KB (WebP) | 11.08 KB (`400w` WebP) | **-94.1% / -98.3%** |
| **Above-the-Fold Eager Images** (Hero + 4 Switcher Thumbs = 5 imgs) | 811.73 KB | 116.11 KB | 39.45 KB | **-85.7% / -95.1%** |
| **Initial DOM `<img>` Elements** (Scrolled Full Page) | 135 (108 unique URLs) | 109 (89 unique URLs) | 109 (88 unique URLs) | **-19 unique requests** |
| **Initial DOM Images Weight** (Total if scrolled) | 4.67 MB (4,782 KB) | 1.92 MB (1,971 KB) | 0.61 MB (627 KB) | **-58.8% / -86.9%** |
| **Unreferenced Images Moved to `_unused/`** | 2 files (644.22 KB) | 0 active unused | 0 active unused | Moved safely |
| **Google Fonts Families Loaded** | 6 families | 5 families (`swap`) | 5 families (`swap`) | -1 font family |
| **Render-Blocking Local Scripts** | 3 synchronous JS | 0 (all `defer`) | 0 (all `defer`) | Non-blocking |

### D. สถานะการตรวจสอบ (Verification)
- `node --check`: ผ่านทุกไฟล์ (`js/app.js`, `js/app.min.js`, `js/streetfx.js`, `js/streetfx.min.js`, `data/projects.js`)
- Data & File Integrity Check: ครบทั้ง 30 โปรเจกต์, `.webp` และ `-400.webp` ครบ 100% (`Missing: 0`), ลิงก์ใน `index.html` ครบ 100%
- Mock DOM & Router Smoke Test (`390x844`): Initialize ผ่าน, EN/TH Toggle ผ่าน, Render `<picture>`/`400w` ครบ, ไม่มี `.gif` ดิบในตาราง Workflow, Project Detail Route (`#/work/stylized-character-showcase`) ทำงานปกติ
- **หมายเหตุการซ้ำซ้อนใน Repo**: โฟลเดอร์ `Portfolio_Patanawan/public/` ยังมีไฟล์ภาพ/วิดีโอสำเนาชุดเก่าอยู่บน Disk (ไม่ได้แก้ไขเนื่องจากเป็นโฟลเดอร์สำรองเดิม และ `Portfolio_Patanawan/WorkingModelmage/` เป็น READ-ONLY) แนะนำให้ใส่ใน `.vercelignore` / `.gitignore` หรือลบสำเนาที่ไม่ใช่ `WorkingModelmage` หากไม่ใช้งานแล้ว
