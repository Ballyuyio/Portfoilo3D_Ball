# STREET WALL — Patanawan Jarunongkran (Ball Patanawan) 3D Portfolio

Production-ready, zero-build-step 3D artist portfolio designed in a **Graffiti / Street Art ("STREET WALL")** aesthetic with calm high-contrast viewing zones around artwork, bilingual **EN / TH** support, interactive **Before/After wireframe sliders**, **unified workflow breakdowns**, **separated motion groups**, and dedicated **project dossier routes (`#/work/[slug]`)**.

## Artist Profile (Verified)
- **Name**: Patanawan Jarunongkran (ปฐณวรรณ จารุนงคราญ) / **Ball Patanawan**
- **Program**: B.Sc. Media Technology (Game Development), SoA+D, KMUTT (2024–Present)
- **Software**: Autodesk Maya (+ AdvancedSkeleton), ZBrush, Substance 3D Painter, Adobe Photoshop, Unity, Roblox Studio, Arnold
- **Email**: `Ballyuyio@gmail.com` | **Phone**: `096-782-2469` | **ArtStation**: `https://www.artstation.com/ball_patanawan`

---

## Quick Start (Windows)

### Option 1: Double-Click `START_PORTFOLIO.bat` (Recommended for full video scrubbing)
Double-click `START_PORTFOLIO.bat`. It starts the zero-dependency Node static server on `http://127.0.0.1:3000` (with HTTP Range byte streaming for `.mp4` reels) and opens your default browser automatically.

### Option 2: Direct Double-Click `index.html` (`file:///`)
Double-clicking `index.html` works directly in Chrome / Edge without any server or build step because all portfolio data is pre-compiled into `./data/projects.js` (`window.PORTFOLIO_DATA`) alongside `./data/projects.json`.

---

## Folder Structure

```text
E:\Portfoilo3D_Ball\
├── index.html                    # Semantic STREET WALL entry (preload LCP WebP, deferred scripts)
├── AUDIT_AND_OPTIMIZATION_LOG.md # Full Step 1-4 audit, 443-image inventory & optimization change log
├── styles/
│   ├── streetwall.css            # Mobile-first CSS source (360px/390px/768px/1024px, >=44px tap targets)
│   └── streetwall.min.css        # Minified production stylesheet linked by index.html
├── js/
│   ├── streetfx.js / .min.js     # Desktop spray cursor canvas, non-blocking stencil loader, ScrollTrigger / Lenis
│   └── app.js / .min.js          # Runtime data hydration, responsive <picture> WebP, router (#/work/[slug]), modals
├── data/
│   ├── projects.json             # Complete normalized portfolio metadata backup
│   ├── projects.js               # Deduplicated script payload (window.PORTFOLIO_DATA, 449 KB) for file:/// support
│   └── asset-report.json         # Full audit report (counts, duplicate skips, frame sequence skips, unsorted items)
├── public/
│   ├── favicon.svg               # Stencil BP SVG icon
│   └── assets/{renders|workflow|animations}/{project-slug}/
│       ├── *.webp                # Optimized WebP full-res / animated WebP + original JPG/PNG/GIF fallbacks
│       └── thumbs/               # 800px WebP/JPG thumbnails & *-400.webp mobile-first responsive variants
├── _backup/                      # Original unedited copies of index.html, CSS, JS, and data/ before optimization
├── _unused/                      # Unreferenced images moved safely out of public/ (review before permanent removal)
└── Portfolio_Patanawan/          # Legacy subfolder copy + WorkingModelmage/ (UNTOUCHED, READ-ONLY source of truth)
```

---

## How to Add / Update 3D Artwork

1. **Never edit directly inside `public/assets/`** if you plan to re-run the pipeline. Place new files cleanly inside `./WorkingModelmage/`.
2. Open `scripts/organize-assets.js`:
   - Add new project definitions to `PROJECTS` (or attach to an existing slug).
   - Add visually verified entries to `VERIFIED_MANIFEST` (`cat: 'renders' | 'workflow' | 'animations'`).
   - Add matched camera pairs to `BEFORE_AFTER_SPECS` if you want an interactive slider.
   - Any unmapped files placed into `./WorkingModelmage/` are safely routed to `unsorted` in `data/asset-report.json` instead of being guessed.
3. Re-run the organizer:
   ```bash
   node scripts/organize-assets.js
   ```
4. Replace remaining `TODO: replace` placeholders inside:
   - `index.html`: `#about` portrait photo slot and missing social URLs (Behance, Instagram, YouTube, LinkedIn).
   - `scripts/organize-assets.js`: per-project `timeSpent`, `polycount`, and personal brief notes.

---

## Optional Media Upgrades (Requires `ffmpeg` or `cwebp` / `sharp`)

18 items inside `WorkingModelmage/` are currently held in `data/asset-report.json -> unsorted` because Windows stock binaries do not include `ffmpeg` or `cwebp`. Once `ffmpeg` is installed, you can convert legacy `.avi` animations or trim giant raw captures before mapping them:

```bash
# Convert legacy uncompressed .avi exercises to browser-ready H.264 MP4
ffmpeg -i "WorkingModelmage/labroom_vedio/Women_Walk.avi" -c:v libx264 -crf 20 -pix_fmt yuv420p -movflags +faststart "WorkingModelmage/labroom_vedio/Women_Walk.mp4"
ffmpeg -i "WorkingModelmage/labroom_vedio/Moshi_WalkAnima.avi" -c:v libx264 -crf 20 -pix_fmt yuv420p -movflags +faststart "WorkingModelmage/labroom_vedio/Moshi_WalkAnima.mp4"
ffmpeg -i "WorkingModelmage/labroom_vedio/Body3Idle.avi" -c:v libx264 -crf 20 -pix_fmt yuv420p -movflags +faststart "WorkingModelmage/labroom_vedio/Body3Idle.mp4"
ffmpeg -i "WorkingModelmage/labroom_vedio/PendulumAnima.avi" -c:v libx264 -crf 20 -pix_fmt yuv420p -movflags +faststart "WorkingModelmage/labroom_vedio/PendulumAnima.mp4"

# Speed up 24-minute Gojo skin-weight screen recording 20x into a crisp timelapse
ffmpeg -i "WorkingModelmage/labroom_vedio/WorkFlow_Gojo.mp4" -filter:v "setpts=0.05*PTS" -an -c:v libx264 -crf 22 -pix_fmt yuv420p "WorkingModelmage/workflowimage/Gojo_SkinWeight_Timelapse.mp4"
```

*(Note: WebP batch re-encoding is also optional via Node `sharp` if deploying with strict image size budgets; currently clean 800px JPEGs + 24px LQIP blur previews + 1280px MP4 posters are generated automatically by `.NET`.)*

---

## Deploying Online (Static Host Ready)

- **Vercel / Netlify / Cloudflare Pages / GitHub Pages**: Deploy root `.` as a pure static site (`Framework Preset: Other`, `Build Command`: empty, `Output Directory`: `.`).
- **Keep out of deployment / Git if size-limited**: Exclude `Portfolio_Patanawan/` (which includes the ~11 GB READ-ONLY `WorkingModelmage/` and duplicate `Portfolio_Patanawan/public/`), `_backup/`, `_unused/`, and `scripts/` via `.vercelignore` / `.gitignore`.
- **Note on minified files**: `index.html` loads `./styles/streetwall.min.css`, `./js/streetfx.min.js`, and `./js/app.min.js`. If you edit `styles/streetwall.css` or `js/*.js`, re-generate the `.min.*` files before deploying. See [AUDIT_AND_OPTIMIZATION_LOG.md](./AUDIT_AND_OPTIMIZATION_LOG.md) for the full audit & optimization history.
