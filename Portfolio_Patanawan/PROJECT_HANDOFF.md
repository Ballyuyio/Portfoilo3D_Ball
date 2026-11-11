# PROJECT HANDOFF & SESSION MEMORY — Portfolio Patanawan (STREET WALL)

> **วิธีใช้งานไฟล์นี้ในแชทใหม่ (For the User)**
> เวลาเปิดแชทใหม่และอยากเพิ่มงาน 3D, อัปเดตข้อมูล, หรือให้แก้งานต่อ เพียงพิมพ์บอกในแชทใหม่ว่า:
> `"อ่านไฟล์ E:/Portfolio_Patanawan/PROJECT_HANDOFF.md ก่อน แล้วช่วยทำต่อเรื่อง ..."`

---

## 1. ภาพรวมโปรเจกต์และข้อมูลศิลปิน (Verified Artist Identity)
- **ชื่อศิลปิน**: ปฐณวรรณ จารุนงคราญ (`Patanawan Jarunongkran` / **Ball Patanawan**)
- **การศึกษา**: วท.บ. มีเดียเทคโนโลยี (การพัฒนาเกม) คณะสถาปัตยกรรมศาสตร์และการออกแบบ มจธ. (`B.Sc. Media Technology (Game Development), SoA+D, KMUTT`, 2024–Present)
- **ซอฟต์แวร์หลัก**: Autodesk Maya (+ AdvancedSkeleton), ZBrush, Substance 3D Painter, Adobe Photoshop, Unity, Roblox Studio, Arnold
- **ช่องทางติดต่อยืนยันแล้ว**:
  - Email: `Ballyuyio@gmail.com`
  - Phone: `096-782-2469`
  - ArtStation: `https://www.artstation.com/ball_patanawan`
  - Instagram: `https://www.instagram.com/ball_patanawan/`
  - Facebook: `https://www.facebook.com/ball.patanawan.2025`
- **ตำแหน่งอ้างอิง CV ต้นทาง**: `E:\CV_Patanawan_Jarunongkran.docx`

---

## 2. กฎเหล็กห้ามละเมิด (Non-Negotiable Rules for AI Continuation)
1. **Source Folder Safety**: โฟลเดอร์ `E:\Portfolio_Patanawan\WorkingModelmage\` เป็น **READ-ONLY** ห้ามแก้ไข ย้าย เปลี่ยนชื่อ หรือลบไฟล์ข้างในเด็ดขาด! การนำไฟล์ขึ้นเว็บต้องแก้ไขสคริปต์ `scripts/organize-assets.js` แล้วรัน `node scripts/organize-assets.js` เพื่อคัดลอกไฟล์ไปที่ `public/assets/{renders|workflow|animations}/{project-slug}/` เท่านั้น
2. **ห้ามคาดเดาจากชื่อไฟล์**: ถ้าไฟล์ใหม่ชื่อกำกวม (เช่น `Screenshot ...`, `Eiei.mp4`) ให้เปิดดูภาพจริงก่อนเสมอ หรือถ้าไม่ชัวร์ให้ Script ส่งเข้า `unsorted` ใน `data/asset-report.json` แล้วถามผู้ใช้
3. **เปิดได้ทั้งดับเบิลคลิก `index.html` (`file:///`) และ `START_PORTFOLIO.bat` (`node server.js`)**:
   - ห้ามใช้ `<script type="module">` หรือบังคับ `fetch()` ไฟล์ Local JSON ตอนเปิดหน้าเว็บเด็ดขาด (ติด CORS บน Windows `file:///`)
   - ต้องคงระบบการสร้าง `data/projects.js` (`window.PORTFOLIO_DATA = ...`) ควบคู่กับ `data/projects.json`
   - ห้ามใส่ Header `Cross-Origin-Embedder-Policy: require-corp` ใน `server.js` เพราะจะบล็อก Google Fonts / GSAP CDN
4. **Concept & Design ("STREET WALL")**:
   - พื้นหลังคอนกรีตดำด้าน `#0A0A0A` + Calm Art Zone `#111115` รอบภาพเรนเดอร์และพารากราฟ (WCAG AA)
   - Pigments ต่อ Section: Renders = `#FF1FA2` (Hot Pink), Workflow = `#1FD0E8` (Cyan), Motion = `#FF8A1F` (Orange), Contact/Stickers = `#FFD21F` (Yellow)
   - ฟอนต์กราฟฟิตี้ (`Rubik Spray Paint` / `Bungee` / `Permanent Marker`) ใช้เฉพาะหัวข้อ/สติ๊กเกอร์เท่านั้น เนื้อหายาวใช้ `Space Grotesk` / `Noto Sans Thai`
   - ห้ามใส่ Emoji ใน HTML/JS (ใช้ Inline SVG เท่านั้น), ห้ามใช้ Purple Gradient, ต้องรองรับ `@media (prefers-reduced-motion: reduce)` และปุ่มสลับภาษา EN/TH
5. **โครงสร้างหมวดหมู่ที่ผู้ใช้กำหนดไว้**:
   - รวมงาน Workflow/Process ทั้งหมด (Sliders ก่อน-หลัง + ภาพ Wireframe/Rig/UI) ไว้ในหมวด **`#workflow`** หมวดเดียว
   - แยกกลุ่มแอนิเมชันออกเป็น sub-groups ชัดเจนในหมวด **`#motion`**

---

## 3. สถาปัตยกรรมไฟล์และสถานะปัจจุบัน (Current Verified State)

| File | หน้าที่ |
|---|---|
| `index.html` | หน้าเว็บ STREET WALL ครบทุก Section (Loader, Hero, Renders, Workflow, Motion, Archive, About, Services, Contact, Lightbox, Motion Theater, Project Detail `#/work/[slug]`) |
| `styles/streetwall.css` | CSS Variables, Concrete Texture, Spray Band Wipes, Drip SVGs, Responsive Grid, Before/After Sliders, Detail View, Reduced-Motion |
| `js/streetfx.js` | Stencil Loader (<1s + skip via `sessionStorage`), Desktop-only Spray Cursor Canvas, `IntersectionObserver` Reveal + Lenis/GSAP |
| `js/app.js` | Bilingual EN/TH Dictionary, Hash Router `#/work/[slug]`, Filter/Search, Render Load-More (`24/step`), `wireBeforeAfterSlider`, Concurrency-capped `1` active inline Video, Lightbox & Motion Modals |
| `scripts/organize-assets.js` | Manifest & Metadata ทั้ง 30 โปรเจกต์, 19 Before/After pairs, กฎข้ามไฟล์ซ้ำและโฟลเดอร์เฟรม sequence |
| `scripts/media_helper.ps1` | .NET `System.Drawing` + `Shell32 IShellItemImageFactory` สร้าง `800px` JPEG thumb, `1280px` MP4/GIF poster, อ่าน Width/Height และสร้าง Base64 LQIP |
| `data/projects.json` & `.js` | ข้อมูลหลักที่ Build ออกมาสมบูรณ์แล้ว (`missingCount: 0`, `zeroDimCount: 0`, `noLqipCount: 0`) |
| `data/asset-report.json` | รายงานสรุปสถานะไฟล์ทุกชิ้นใน `WorkingModelmage/` |
| `server.js` & `START_PORTFOLIO.bat` | Static server พอร์ต `3000` รองรับ `206 Partial Content` Video Streaming และบล็อกการเข้าถึง `/WorkingModelmage` & `/scripts` ผ่าน HTTP |
| `public/favicon.svg` | ไอคอน SVG ลาย Stencil Monogram `BP` |

### สถิติล่าสุดที่ตรวจสอบแล้ว (`data/asset-report.json`):
- **Projects**: `30`
- **Renders**: `140`
- **Workflow Breakdowns**: `54` (รวม Animated Wireframe GIF 2 ไฟล์: `Chibi_bluelock.0.gif`, `Kaiwa.0.gif`)
- **Before/After Sliders**: `19` คู่ (มุมกล้องตรงกัน)
- **Animations (Playable H.264 MP4)**: `26` คลิป แยกเป็น **`5` Motion Groups** (`golem-combat`, `hooded-hunter`, `furry-guardian`, `chibi-cutscenes`, `vehicles-prototypes`)
- **Skipped Exact MD5 Duplicates (`3`)**: `67120501057_pers.png`, `workflowimage/Chibi_bluelock.-1.gif`, `workflowimage/Versy650.1.jpg`
- **Skipped Render-Farm PNG Frame Sequences (`1,680` PNGs)**: `labroom_vedio/AungChibi/*.png`, `labroom_vedio/FinalAnima/*.png`, `labroom_vedio/FinalAnima/New folder/*.png`, `labroom_vedio/LED_BULB/*.png`, `labroom_vedio/Submarine/*.png`

---

## 4. บันทึกชื่อไฟล์ที่ตรวจสอบด้วยตาแล้วพบว่าสลับ/ต้องแมปพิเศษ (Visual Audit Map)
> ใช้ส่วนนี้อ้างอิงเพื่อไม่ให้แชทใหม่หลงจำผิดจากชื่อไฟล์:
- `Gojo.jpg`..`Gojo4.jpg` + `workflowimage/Gojo.png` = ตัวละคร **Toji Fushiguro (`toji-fushiguro`)**
- `knifeAung.png` = ตัวละคร **Chibi Crusader Knight** + `workflowimage/Bump.png`/`Bump2.png` = **Spiked Flail** (`chibi-crusader-knight`)
- `workflowimage/Mint.png` (145,032 Tris) = จริงๆ คือ Wireframe Rig ของ **`character-jin`** (`CharacterJin*.jpg`)
- `workflowimage/jin.png` (29,030 Tris) = จริงๆ คือ Wireframe ของ **`character-wich`** (`Character_Wich*.jpg`)
- `workflowimage/Screenshot 2026-06-13 031123.png` (33,240 Tris) = Maya Dual Rig Wireframe/Clay ของ **`character-mint`**
- `Tomyumman.jpg` & `Sung.jpg` = **Brick Corner Bar** (`street-commerce-buildings`) | ส่วน `Sung1.jpg` = **Red Crate Blocky Mech** (`roblox-prop-pack`, ปรากฏในฉาก `Desert.jpg`)
- `Mummy.jpg` = รูปเกาะสฟิงซ์ที่มี Avatar Roblox ยืนอยู่ (`egyptian-sphinx-island`) | ส่วนตัวมัมมี่พันผ้าจริงคือ `Screenshot 2026-01-18 234839.png` (`stylized-character-showcase`)
- `Screenshot 2026-01-11 105454.png` = **Silenced Tactical Pistol** (`combat-weapons-arsenal`)
- `workflowimage/Screenshot 2026-06-15 011523.png` = Wireframe ของ `HeadShrak.jpg` (`product-scifi-props`)
- `workflowimage/Screenshot 2026-06-16 233628.png` = Wireframe ของ `islandtoilet.jpg` + `workflowimage/image.png` = Substance Sheet ห้องน้ำ (`bathroom-island-diorama`)
- `workflowimage/Screenshot 2026-06-22 220730.png` = Wireframe เกราะของ `knifeAung.png` (`chibi-crusader-knight`)
- `workflowimage/jean.0.jpg` (68,001 Tris) = Wireframe ของ `agent-jean`
- `20260526-2336-55.5183097 - Copy.mp4` = คลิปเกมเพลย์มือถือจริงของ **`furry-guardian`**
- `pet.jpg` / `pet.png` (ตัวพิมพ์เล็กบนดิสก์) = สัตว์เลี้ยง Cube 3 ตัว (`stylized-game-islands`)

---

## 5. รายการค้าง/รอตัดสินใจ (`unsorted` 18 รายการ) & `TODO: replace`
### A. ไฟล์ 18 รายการใน `unsorted` (`data/asset-report.json`)
1. **`.avi` ที่เบราว์เซอร์ไม่รองรับ (13 ไฟล์)**:
   - `Women_Walk.avi` (747.51 MB — `agent-jean`), `Body3Idle.avi` (186.26 MB) & `Moshi_WalkAnima.avi` (266.97 MB — ตุ๊กตาเย็บสีน้ำเงินขาว), `Gracia.avi` (3,268.88 MB — มวย 2 ตัวละคร), `Playbash.avi` (4,096 MB)
   - แบบฝึกหัด Maya: `ArmSwing.avi`, `BallMovementAnima.avi`, `BallMovementAnima2.avi`, `PendulumAnima.avi`
   - ไฟล์ซ้ำฟอร์แมตที่มี `.mp4` บนเว็บแล้ว: `Submarine.avi`, `FurryAttck.avi`, `FurryIdle.avi`, `FurryIWalk.avi`
2. **WIP/Screen Capture ขนาดยักษ์ (4 ไฟล์)**:
   - `AungChibi/Brand_Anima_1.[0001-0300].mp4` & `_1.mp4` (พาสเทาก่อนฉากส้ม `_2.mp4`)
   - `WorkFlow_Gojo.mp4` (1,096.55 MB, 24 นาที), `Recording 2026-07-04 015623.mp4` (1,860.89 MB, 51 นาที)
3. **Archive ไม่ใช่สื่อ (1 ไฟล์)**: `labroom_vedio/PendulumAnima.zip` (2.39 MB)

### B. จุดที่มี `TODO: replace` รอผู้ใช้มาเติมภายหลัง
- **รูป Portrait ศิลปิน**: ใน `#about` ของ `index.html`
- **Social Links ที่ยังไม่มี URL**: Behance และ YouTube ใน `#contact` ของ `index.html` (Instagram และ Facebook เพิ่มเรียบร้อยแล้ว)
- **ข้อมูลเชิงลึกบางโปรเจกต์**: ค่า `polycount` และ `timeSpent` ใน `PROJECTS` ภายใน `scripts/organize-assets.js`

---

## 6. วิธีทำงานต่อเมื่อมีไฟล์ใหม่ & ข้อควรระวังของเครื่องนี้
### ขั้นตอนเพิ่มผลงานใหม่:
1. นำภาพเรนเดอร์ / ภาพขั้นตอน / `.mp4` ใหม่ใส่ไว้ใน `WorkingModelmage/` (ตั้งชื่อชัดเจน)
2. แก้ `PROJECTS`, `VERIFIED_MANIFEST` และ/หรือ `BEFORE_AFTER_SPECS` ใน `scripts/organize-assets.js`
3. รันคำสั่งอัปเดตฐานข้อมูลและ Asset ใหม่ทั้งหมดอัตโนมัติ:
   ```powershell
   node E:\Portfolio_Patanawan\scripts\organize-assets.js
   ```
4. ตรวจ Syntax:
   ```powershell
   npm run check
   ```

### Environment Quirks on This Windows Machine:
- **Shell**: Windows PowerShell 5.1 — ใช้ `;` คั่นคำสั่งแทน `&&` และหลีกเลี่ยงตัวแปร `$` ใน inline `node -e "..."` (ถ้าสคริปต์ซับซ้อนให้เขียนลงไฟล์ `.js`)
- **Tool Availability**: เครื่องมี `Node v24.22.0` และ `.NET System.Drawing` / `Shell32` **แต่ยังไม่มี `ffmpeg`, `python`, `magick` หรือ `sharp`** — จึงยังไม่ได้แปลง `.avi` หรือ Batch Convert เป็น `.webp` (ดูคำสั่ง `ffmpeg` สำเร็จรูปใน `README.md`)

