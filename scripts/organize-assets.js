#!/usr/bin/env node
/**
 * STREET WALL — Asset Organization & Optimization Script
 * Safely copies verified 3D renders, workflow breakdowns, and animations from ./WorkingModelmage
 * into ./public/assets/{renders|workflow|animations}/{project-slug}/ with clean kebab-case names.
 *
 * SAFETY GUARANTEE:
 * - Source folder ./WorkingModelmage is opened READ-ONLY. Original files are NEVER modified, renamed, or deleted.
 * - Ambiguous, unverified, duplicate, legacy .avi, or >250MB raw files are separated cleanly into report/unsorted.
 * - Generates /data/projects.json AND /data/projects.js (for direct file:/// double-click compatibility).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const WORKSPACE = path.resolve(__dirname, '..');
const SRC_ROOT = path.join(WORKSPACE, 'WorkingModelmage');
const OUT_PUBLIC = path.join(WORKSPACE, 'public', 'assets');
const OUT_DATA_DIR = path.join(WORKSPACE, 'data');
const HELPER_PS1 = path.join(__dirname, 'media_helper.ps1');

// ---------------------------------------------------------------------------
// 1. PROJECT METADATA DEFINITIONS (Verified against Artist CV + Visual Audit)
// ---------------------------------------------------------------------------
const PROJECTS = [
  {
    slug: 'stone-crystal-golem',
    title: 'Crystal Stone Golem',
    titleTh: 'โกเลมหินผลึกคริสตัล',
    year: '2026',
    role: '3D Character Artist, Rigger & Gameplay Animator',
    roleTh: 'ศิลปินปั้นโมเดลตัวละคร ริกกิ้ง และแอนิเมชันเกม 3D',
    category: 'characters',
    featured: true,
    accent: '#1FD0E8',
    polycount: '6,954 Tris',
    timeSpent: 'TODO: replace (e.g. 2 Weeks)',
    software: ['Autodesk Maya', 'ZBrush', 'Substance 3D Painter'],
    tags: ['Game Ready', 'Creature', 'Rigging', 'Combat Cycles'],
    description: 'Stylized fantasy stone golem featuring mossy rock plates, glowing cyan crystal shoulder clusters, custom Maya IK/FK control rig, and 5 real-time gameplay animation cycles. TODO: replace with project brief & engine integration notes.',
    descriptionTh: 'ตัวละครเกมโกเลมหินสไตล์แฟนตาซี พร้อมคริสตัลเรืองแสง ริกคอนโทรลเต็มระบบใน Maya และแอนิเมชันต่อสู้ 5 ท่าสำหรับเอนจินเกมจริง (TODO: เพิ่มรายละเอียดโปรเจกต์เพิ่มเติม)'
  },
  {
    slug: 'graffiti-submarine',
    title: 'Street Graffiti Submarine',
    titleTh: 'เรือดำน้ำกราฟฟิตี้',
    year: '2026',
    role: 'Hard-Surface Modeler & Texture Artist',
    roleTh: 'นักปั้นโมเดล Hard-Surface และเพนต์เท็กซ์เจอร์',
    category: 'hardsurface',
    featured: true,
    accent: '#FF1FA2',
    polycount: '138,304 Tris (High/Turntable)',
    timeSpent: 'TODO: replace (e.g. 1.5 Weeks)',
    software: ['Autodesk Maya', 'Substance 3D Painter', 'Arnold'],
    tags: ['Hard-Surface', 'Graffiti Texture', 'Turntable', 'Lookdev'],
    description: 'Compact sci-fi bathyscaphe submarine wrapped in hand-painted street graffiti decals, stenciled warning badges, rusted thrusters, and weathered dome glass. TODO: replace with personal inspiration.',
    descriptionTh: 'ยานเรือดำน้ำสไตล์สตรีทอาร์ต เพนต์ลวดลายกราฟฟิตี้ทั่วลำตัว พร้อมคราบสนิม ใบพัดท้าย และงานเรนเดอร์ Turntable เต็มรูปแบบ (TODO: เพิ่มรายละเอียดโปรเจกต์เพิ่มเติม)'
  },
  {
    slug: 'hooded-hunter-game-pack',
    title: 'Hooded Hunter & Slime RPG Pack',
    titleTh: 'แพ็กเกมฮันเตอร์สวมฮู้ดและสไลม์ธาตุ',
    year: '2026',
    role: 'Lead 3D Game Artist, Rigger & Unity Integrator',
    roleTh: 'ศิลปินเกม 3D หลัก ริกกิ้ง และประกอบฉาก Unity',
    category: 'characters',
    featured: true,
    accent: '#FF8A1F',
    polycount: '3,886 Tris (Hunter)',
    timeSpent: 'TODO: replace (e.g. 1 Month)',
    software: ['Autodesk Maya', 'AdvancedSkeleton', 'Substance 3D Painter', 'Unity'],
    tags: ['Game Assets', 'Unity Pipeline', 'Low-Poly', 'Locomotion'],
    description: 'Complete Year-3 game asset production pack including the 3,886-tri Hooded Hammer Warrior (rigged with AdvancedSkeleton), 5 elemental slimes, crystal props, and a full Unity locomotion suite (Idle, Walk, Run, Jump, Combat Pose). TODO: replace with game title.',
    descriptionTh: 'ชุดแอสเซ็ตเกมชั้นปีที่ 3 ครบชุด ตั้งแต่ตัวละครหลัก 3,886 Tris ริกด้วย AdvancedSkeleton ไปจนถึงสไลม์ธาตุทั้ง 5 ชนิด คริสตัล และท่าทางเคลื่อนไหวใน Unity (TODO: เพิ่มชื่อโปรเจกต์เกม)'
  },
  {
    slug: 'furry-guardian',
    title: 'Furry Guardian — Mobile Action Hero',
    titleTh: 'การ์เดียนขนฟู — ฮีโร่เกมแอ็กชันมือถือ',
    year: '2026',
    role: 'Character Sculptor, NURBS Rigger & Gameplay Animator',
    roleTh: 'ปั้นโมเดล วางริก NURBS และทำแอนิเมชันลงเกม',
    category: 'characters',
    featured: true,
    accent: '#FFD21F',
    polycount: '9,196 Tris',
    timeSpent: 'TODO: replace (e.g. 3 Weeks)',
    software: ['Autodesk Maya', 'ZBrush', 'Substance 3D Painter', 'Unity'],
    tags: ['Stylized Creature', 'NURBS Rig', 'Mobile Game', 'Playable Demo'],
    description: 'Playable stylized companion creature swinging a greatsword, complete with multi-rim studio lighting renders, Maya NURBS tail/ear control rig, and live mobile HUD gameplay footage. TODO: replace with game story.',
    descriptionTh: 'ตัวละครสัตว์คู่หูถือดาบใหญ่ พร้อมงานจัดแสงสามมุมมอง ริกหูและหางแบบ NURBS และฟุตเทจทดสอบระบบต่อสู้บนมือถือจริง (TODO: เพิ่มเนื้อหาเกม)'
  },
  {
    slug: 'chibi-crusader-knight',
    title: 'Chibi Crusader Knight & Spiked Flail',
    titleTh: 'อัศวินครูเสดจิ๋วและกระบองลูกตุ้มหนาม',
    year: '2026',
    role: 'Character & Weapon Artist, Rigger',
    roleTh: 'ปั้นโมเดลตัวละครและอาวุธ ริกแอนิเมชัน',
    category: 'characters',
    featured: true,
    accent: '#FF8A1F',
    polycount: 'TODO: replace (Game Mid-Poly)',
    timeSpent: 'TODO: replace (e.g. 1.5 Weeks)',
    software: ['Autodesk Maya', 'Substance 3D Painter', 'Arnold'],
    tags: ['Stylized Chibi', 'Armor PBR', 'Weapon Rigging', 'Short Film'],
    description: 'Weather-beaten steel chibi knight (source: knifeAung.png) paired with a dynamic chain-rigged spiked morning-star flail, staged in a dramatic orange studio animation clip. TODO: replace with assignment details.',
    descriptionTh: 'โมเดลอัศวินจิ๋วชุดเกราะเหล็กเปื้อนสนิม พร้อมอาวุธลูกตุ้มหนามติดโซ่ขยับได้จริงและแอนิเมชันฉากสตูดิโอสีส้ม (TODO: เพิ่มข้อมูลผลงาน)'
  },
  {
    slug: 'cloud-strife-chibi',
    title: 'Cloud Strife Chibi & Boss Arena',
    titleTh: 'คลาวด์ สไตรฟ์ จิ๋ว และฉากต่อสู้บอส',
    year: '2025',
    role: '3D Character & Cinematics Artist',
    roleTh: 'ศิลปินตัวละคร 3D และคัตซีนแอนิเมชัน',
    category: 'characters',
    featured: true,
    accent: '#1FD0E8',
    polycount: 'TODO: replace',
    timeSpent: 'TODO: replace (e.g. 2 Weeks)',
    software: ['Autodesk Maya', 'Substance 3D Painter', 'Arnold'],
    tags: ['Fan Art', 'Stylized Hair', 'Buster Sword', 'Cinematic Cut'],
    description: 'High-detail chibi homage to Cloud Strife wielding the Buster Sword, accompanied by studio close-ups and a 4-clip animated confrontation across a rusted seaside platform. TODO: replace with lighting breakdown.',
    descriptionTh: 'ผลงานแฟนอาร์ตคลาวด์ สไตรฟ์สไตล์จิ๋ว พร้อมดาบ Buster Sword งานจัดแสงเรนเดอร์หลายมุม และแอนิเมชันคัตซีนต่อสู้ 4 คัต (TODO: เพิ่มบันทึกการทำงาน)'
  },
  {
    slug: 'sephiroth-chibi',
    title: 'Sephiroth Chibi',
    titleTh: 'เซฟิรอธ จิ๋ว',
    year: '2025',
    role: '3D Character Sculptor',
    roleTh: 'นักปั้นโมเดลตัวละคร 3D',
    category: 'characters',
    featured: false,
    accent: '#FF1FA2',
    polycount: 'TODO: replace',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'ZBrush', 'Substance 3D Painter'],
    tags: ['Fan Art', 'Stylized Chibi', 'Wireframe Study'],
    description: 'Clean silhouette study and multi-angle chibi sculpt of Sephiroth matching Cloud Strife Chibi scale, verified with base wireframe cage. TODO: replace with notes.',
    descriptionTh: 'โมเดลตัวละครเซฟิรอธสไตล์จิ๋วครบมุมมอง พร้อมภาพโครงสร้างตาข่ายก่อนจัดแสง (TODO: เพิ่มรายละเอียด)'
  },
  {
    slug: 'motorcycle-series',
    title: 'Kawasaki ZH2 & Versys 650',
    titleTh: 'บิ๊กไบค์ Kawasaki ZH2 และ Versys 650',
    year: '2025',
    role: 'Hard-Surface Vehicle Modeler',
    roleTh: 'นักปั้นโมเดลยานพาหนะ Hard-Surface',
    category: 'hardsurface',
    featured: true,
    accent: '#1FD0E8',
    polycount: '186,374 Tris (ZH2 High-Poly)',
    timeSpent: 'TODO: replace (e.g. 3 Weeks)',
    software: ['Autodesk Maya', 'Substance 3D Painter', 'Arnold'],
    tags: ['Automotive', 'Sub-D Modeling', 'Mechanical Detail', 'Clay vs Color'],
    description: 'Complex mechanical Sub-D modeling studies of the supercharged Kawasaki ZH2 hypernaked (clay sculpt vs vibrant lime-green paint) and Versys 650 touring frame. TODO: replace with CAD/reference workflow.',
    descriptionTh: 'งานปั้นมอเตอร์ไซค์ความละเอียดสูง 186,374 Tris แสดงครบทั้งขั้นปั้นดิน (Clay) โครงตาข่าย Sub-D และลงสีโลหะจริง (TODO: เพิ่มข้อมูลเทคนิค)'
  },
  {
    slug: 'toji-fushiguro',
    title: 'Toji Fushiguro — Stylized & Chibi',
    titleTh: 'โทจิ ฟุชิงุโระ (เรียลสไตล์ & จิ๋ว)',
    year: '2025',
    role: 'Character Sculptor & Rigger',
    roleTh: 'นักปั้นโมเดลตัวละครและสกินเวท',
    category: 'characters',
    featured: false,
    accent: '#FF1FA2',
    polycount: 'TODO: replace',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'ZBrush', 'Substance 3D Painter'],
    tags: ['Anime Sculpt', 'Anatomy', 'Rigged', 'JJK Fan Art'],
    description: 'Muscular anatomy study of shirtless Toji Fushiguro (originally filed under Gojo*.jpg) complete with chibi counterpart and Maya full-body control rig. TODO: replace with sculpting notes.',
    descriptionTh: 'งานปั้นสรีระตัวละครอนิเมะโทจิ ฟุชิงุโระ (ต้นฉบับไฟล์ Gojo*.jpg) คู่กับเวอร์ชันจิ๋วและโครงสร้างริกใน Maya (TODO: เพิ่มคำอธิบาย)'
  },
  {
    slug: 'horror-operating-lab',
    title: 'Abandoned Operating Theater',
    titleTh: 'ห้องผ่าตัดสยองขวัญ 3D',
    year: '2025',
    role: 'Environment & Lighting Artist',
    roleTh: 'ศิลปินฉากสิ่งแวดล้อมและการจัดแสง',
    category: 'environment',
    featured: true,
    accent: '#FF8A1F',
    polycount: '95,348 Tris',
    timeSpent: 'TODO: replace (e.g. 2 Weeks)',
    software: ['Autodesk Maya', 'Substance 3D Painter', 'Arnold'],
    tags: ['Horror Environment', 'Moody Lighting', 'Diorama', 'Interior'],
    description: 'Gritty horror diorama featuring rusted surgical arms, grimy cable trays, flickering ceiling lamps, and clean sub-100K Maya scene optimization. TODO: replace with project backstory.',
    descriptionTh: 'ฉากไดโอรามาห้องผ่าตัดสุดหลอน จัดแสงเงาแบบ Horror พร้อมสายไฟและอุปกรณ์ผ่าตัดครบชุดในโพลีกอน 95,348 Tris (TODO: เพิ่มรายละเอียด)'
  },
  {
    slug: 'combat-weapons-arsenal',
    title: 'Tactical & Fantasy Weapon Arsenal',
    titleTh: 'คลังอาวุธยุทธวิธีและแฟนตาซี PBR',
    year: '2025',
    role: 'Weapon & Hard-Surface Prop Artist',
    roleTh: 'ศิลปินปั้นอาวุธและพร็อพ 3D',
    category: 'weapons',
    featured: true,
    accent: '#FFD21F',
    polycount: '5K - 18K Tris / Asset',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'Substance 3D Painter', 'Arnold'],
    tags: ['Weapons', 'PBR Texturing', 'Edge Wear', 'Game Props'],
    description: 'Collection of game-ready melee and ranged weapons including a Tactical Hatchet, Karambit, Rune Dagger, Silenced Tactical Pistol (Screenshot 2026-01-11), Flintlock Pistol, Crusader Shield, Lightsaber, Korean Rune Sword, and Blades of Chaos. TODO: replace with polycount breakdowns.',
    descriptionTh: 'รวมผลงานอาวุธพร้อมใช้งานจริงในเกม อาทิ ขวานยุทธวิธี มีด Karambit ปืนเก็บเสียง ปืนคาบศิลา ดาบรูน โล่ครูเสด และไลท์เซเบอร์ พร้อมภาพเปรียบเทียบ Wireframe (TODO: เพิ่มข้อมูล)'
  },
  {
    slug: 'character-jin',
    title: 'Jin — Horror Schoolgirl Character',
    titleTh: 'จิน — ตัวละครนักเรียนหญิงธีมสยองขวัญ',
    year: '2026',
    role: 'Character Sculptor & Rigger',
    roleTh: 'ศิลปินตัวละครและวางริกใบหน้า-ร่างกาย',
    category: 'characters',
    featured: false,
    accent: '#FF1FA2',
    polycount: '145,032 Tris',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'AdvancedSkeleton', 'Substance 3D Painter'],
    tags: ['Horror Character', 'Hair Cards/Mesh', 'Full Rig'],
    description: 'Expressive anime-horror character featuring bun hairstyle, torn crimson-splattered uniform, and full 145K-tri Maya facial & skeletal rig (matched visually to workflow Mint.png). TODO: replace with role/story.',
    descriptionTh: 'ตัวละครนักเรียนหญิงแนวสยองขวัญพร้อมชุดเปื้อนเลือดและโครงสร้างริก AdvanceSkeleton 145,032 Tris (จับคู่ตามภาพจริง) (TODO: เพิ่มรายละเอียด)'
  },
  {
    slug: 'character-wich',
    title: 'Wich — Stylized Campus Girl',
    titleTh: 'วิช — ตัวละครนักเรียนสาวสไตล์อนิเมะ',
    year: '2026',
    role: 'Game Character Artist',
    roleTh: 'ศิลปินตัวละครเกม',
    category: 'characters',
    featured: false,
    accent: '#1FD0E8',
    polycount: '29,030 Tris',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'Substance 3D Painter'],
    tags: ['Game Ready', 'Clean Topology', 'Anime Style'],
    description: 'Clean 29,030-tri stylized schoolgirl model in tan blazer and loafers (matched visually to workflow jin.png wireframe topology). TODO: replace with project info.',
    descriptionTh: 'โมเดลตัวละครเกม 29,030 Tris เน้น Topology สะอาดตาพร้อมลงสีเท็กซ์เจอร์ครบชุด (จับคู่ตรงตามภาพจริง) (TODO: เพิ่มข้อมูล)'
  },
  {
    slug: 'character-mint',
    title: 'Mint — Chibi Kimono Maiden',
    titleTh: 'มินต์ — ตัวละครจิ๋วชุดกิโมโนและโบว์ฟ้า',
    year: '2026',
    role: 'Stylized Character & Rig Artist',
    roleTh: 'ศิลปินตัวละครจิ๋วและริกกิ้ง',
    category: 'characters',
    featured: false,
    accent: '#FFD21F',
    polycount: '33,240 Tris',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'Substance 3D Painter'],
    tags: ['Stylized Chibi', 'Rigged', 'Cloth Painting'],
    description: 'Adorable chibi character wearing a teal kimono jacket, brown pleated skirt, and sky-blue hair ribbon, verified with dual-pane Maya rig wireframe. TODO: replace with bio.',
    descriptionTh: 'ตัวละครจิ๋วชุดกิโมโนสีเขียวและโบว์สีฟ้า พร้อมโครงสร้างริกทวินวิวพอร์ตใน Maya (33,240 Tris) (TODO: เพิ่มรายละเอียด)'
  },
  {
    slug: 'agent-jean',
    title: 'Agent Jean — Glasses & Pistol',
    titleTh: 'เอเจนต์จีน — ตัวละครสาวแว่นถือปืนพก',
    year: '2025',
    role: 'Character Modeler & Animator',
    roleTh: 'นักปั้นตัวละครและทำท่าเดิน',
    category: 'characters',
    featured: false,
    accent: '#FF8A1F',
    polycount: '68,001 Tris',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'Substance 3D Painter'],
    tags: ['Character Design', 'Hard-Surface Pistol', 'Clean Wireframe'],
    description: 'Stylized detective/operative in round glasses and yellow trousers holding a detailed handgun, built with clean deformation loops (68,001 tris). TODO: replace with backstory.',
    descriptionTh: 'ตัวละครหญิงสวมแว่นทรงกลมถือปืนพก พร้อมงานปั้นเสื้อผ้า ใบหน้า และภาพ Wireframe ละเอียดคมชัด (TODO: เพิ่มรายละเอียด)'
  },
  {
    slug: 'cozy-gamer-bedroom',
    title: 'Cozy Gamer Bedroom Diorama',
    titleTh: 'ห้องนอนเกมเมอร์ 3D ไดโอรามา',
    year: '2025',
    role: 'Environment & Lighting Designer',
    roleTh: 'นักออกแบบฉากห้องนอนและจัดแสงบรรยากาศ',
    category: 'environment',
    featured: false,
    accent: '#1FD0E8',
    polycount: '529,006 Tris (Full Prop Scene)',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'Arnold', 'Substance 3D Painter'],
    tags: ['Interior', 'Warm Lighting', 'Orthographic Blueprint'],
    description: 'Warm dual-monitor bedroom interior complete with gaming setup, shelf clutter, neon strips, and full orthographic Maya blueprints (Front/Side/Top/Persp). TODO: replace with course name.',
    descriptionTh: 'ฉากห้องนอนเกมเมอร์สุดอบอุ่น ครบชุดคอมพิวเตอร์ 2 จอ ไฟตกแต่ง และแบบแปลน Orthographic รอบด้านจาก Maya (TODO: เพิ่มชื่อวิชา/โปรเจกต์)'
  },
  {
    slug: 'minimal-bedroom',
    title: 'Minimal Wood Loft Bedroom',
    titleTh: 'ห้องนอนสไตล์มินิมอลอบอุ่น',
    year: '2025',
    role: 'Environment Modeler',
    roleTh: 'นักปั้นฉากสถาปัตยกรรมภายใน',
    category: 'environment',
    featured: false,
    accent: '#FFD21F',
    polycount: '33,208 Tris',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'Arnold'],
    tags: ['Low-Poly Interior', 'ArchViz', 'Orthographic Views'],
    description: 'Lightweight 33,208-tri cozy loft room study featuring sunlit wood flooring, sofa lounge, and complete Maya technical views. TODO: replace with details.',
    descriptionTh: 'ฉากห้องนอนมินิมอลโทนอุ่นขนาดเบา 33,208 Tris พร้อมแบบแปลน Front/Side/Top สำหรับเทียบสเกล (TODO: เพิ่มรายละเอียด)'
  },
  {
    slug: 'asian-heritage-architecture',
    title: 'Asian Heritage Courtyard & Pagoda',
    titleTh: 'สถาปัตยกรรมศาลากลางและเก๋งจีน-เกาหลี',
    year: '2025',
    role: 'Environment Architect & Asset Artist',
    roleTh: 'ศิลปินปั้นฉากสถาปัตยกรรมตะวันออก',
    category: 'environment',
    featured: false,
    accent: '#FF8A1F',
    polycount: 'TODO: replace',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'Substance 3D Painter'],
    tags: ['Architecture', 'Zen Garden', 'Modular Tiles', 'Bridge Courtyard'],
    description: 'Multi-tiered Asian pagoda surrounded by raked Zen sand and modular curved-roof bridge courtyard showcased in split wireframe/clay. TODO: replace with reference history.',
    descriptionTh: 'งานออกแบบฉากสถาปัตยกรรมเอเชีย ทั้งหอเก๋งจีนกลางสวนกรวดและลานสะพานโบราณ พร้อมภาพเปรียบเทียบ Wireframe/Clay (TODO: เพิ่มรายละเอียด)'
  },
  {
    slug: 'aircraft-cabin-seat',
    title: 'Commercial Aircraft Cabin Seat',
    titleTh: 'เก้าอี้โดยสารเครื่องบินพาณิชย์ 3D',
    year: '2025',
    role: 'Product Visualization Artist',
    roleTh: 'นักปั้นโมเดลผลิตภัณฑ์ 3D',
    category: 'hardsurface',
    featured: false,
    accent: '#1FD0E8',
    polycount: 'TODO: replace',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'Substance 3D Painter', 'Arnold'],
    tags: ['Product Viz', 'Ergonomics', 'Leather & Fabric Shader'],
    description: 'Precision product model of a quilted commercial airliner seat with folding tray mechanism, footrest, and stitching bump detail. TODO: replace with client/project context.',
    descriptionTh: 'โมเดลเก้าอี้โดยสารเครื่องบินพร้อมวัสดุหนังเย็บลาย ตะแกรงพักเท้า และกลไกพับเก็บเทียบกับโครงสร้าง Wireframe (TODO: เพิ่มข้อมูล)'
  },
  {
    slug: 'product-scifi-props',
    title: 'HiET Smart Bulb, Sci-Fi & Hero Props',
    titleTh: 'หลอดไฟ HiET พร็อพไซไฟ และงานปั้นสัตว์',
    year: '2025',
    role: 'Product & Prop Artist',
    roleTh: 'ศิลปินพร็อพ 3D และภาพผลิตภัณฑ์',
    category: 'props',
    featured: false,
    accent: '#FFD21F',
    polycount: 'TODO: replace',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'Substance 3D Painter', 'Adobe Photoshop'],
    tags: ['Product Render', 'Sci-Fi Capsule', 'Sculpt Props', 'Stylized Cat'],
    description: 'Diverse commercial and game props spanning HiET Smart Bulb visualization, Sci-Fi cryo-freezer & fuel dispenser, Runic Spellbook, Fossil Dino Skeleton, Shark Bust, Electric Guitar, and 5 lighting turns of a stylized Tabby Cat. TODO: replace with notes.',
    descriptionTh: 'รวมงานปั้นสินค้าและพร็อพหลากหลายแนว ทั้งหลอดไฟอัจฉริยะ HiET ตู้แช่ไซไฟ หัวจ่ายน้ำมัน คัมภีร์เวทมนตร์ โครงกระดูกไดโนเสาร์ หัวฉลาม และแมวส้มสไตล์จิ๋ว (TODO: เพิ่มข้อมูล)'
  },
  {
    slug: 'egyptian-sphinx-island',
    title: 'Egyptian Sphinx Island (Roblox / Stylized)',
    titleTh: 'เกาะสฟิงซ์อียิปต์โบราณ',
    year: '2025',
    role: 'Environment & UGC World Artist',
    roleTh: 'นักออกแบบฉากเกมและโมเดลโลก',
    category: 'environment',
    featured: false,
    accent: '#FFD21F',
    polycount: 'TODO: replace',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'Substance 3D Painter', 'Roblox Studio'],
    tags: ['Roblox World', 'Low-Poly Landmark', 'Sandstone Sculpture'],
    description: 'Desert landmark island anchored by a sculpted Great Sphinx, sandstone pavilion, and low-poly temple gates with wireframe breakdown. TODO: replace with game link.',
    descriptionTh: 'ฉากเกาะทะเลทรายอียิปต์พร้อมประติมากรรมสฟิงซ์ขนาดยักษ์และซุ้มวิหารหินทราย (TODO: เพิ่มลิงก์เกม)'
  },
  {
    slug: 'bathroom-island-diorama',
    title: 'Skibidi Bathroom Diorama & Caution Prop',
    titleTh: 'ฉากเกาะห้องน้ำ 3D และป้ายระวังพื้นลื่น',
    year: '2025',
    role: 'Prop & Lookdev Artist',
    roleTh: 'ศิลปินพร็อพและเท็กซ์เจอร์เกม',
    category: 'environment',
    featured: false,
    accent: '#1FD0E8',
    polycount: 'TODO: replace',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'Substance 3D Painter'],
    tags: ['Substance Workflow', 'Tile Diorama', 'Humorous Prop'],
    description: 'Stylized tiled bathroom island complete with porcelain bathtub, wet floor caution stand, tilted glass shower stall, and full Substance 3D Painter layout sheet. TODO: replace with notes.',
    descriptionTh: 'ฉากเกาะห้องน้ำสไตล์เกม ครบชุดอ่างอาบน้ำ ตู้กระจก กระดาษชำระ และป้ายเตือนพื้นลื่น พร้อมหน้าต่างงานเท็กซ์เจอร์จาก Substance 3D Painter (TODO: เพิ่มรายละเอียด)'
  },
  {
    slug: 'stylized-game-islands',
    title: 'Sci-Fi & Fantasy Game Islands Collection',
    titleTh: 'คอลเลกชันเกาะลอยฟ้าและพร็อพโลกเกม',
    year: '2025',
    role: '3D Game Environment Generalist',
    roleTh: 'ศิลปินฉากและพร็อพเกมทั่วไป',
    category: 'environment',
    featured: false,
    accent: '#1FD0E8',
    polycount: 'TODO: replace',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'Substance 3D Painter', 'Roblox Studio'],
    tags: ['Island Hub', 'Voxel Pets', 'Game Eggs', 'Environment Prop'],
    description: 'Modular game-ready hubs including Space Rocket Launchpad, Submerged Submarine Island, Glass-Dome Tree Sanctuary, Lighthouse Kit, Treehouse, Trio Elemental Eggs, and Blocky Pet Companions. TODO: replace with project name.',
    descriptionTh: 'รวมฉากเกาะและแอสเซ็ตเกมแนวแฟนตาซีและไซไฟ อาทิ เกาะปล่อยจรวด ฐานทัพใต้ทะเล ประภาคาร บ้านต้นไม้ ไข่สุ่มสัตว์ และเหล่าสัตว์เลี้ยง 3D (TODO: เพิ่มข้อมูล)'
  },
  {
    slug: 'street-commerce-buildings',
    title: 'Street Burger Stand, Brick Bar & Lava Shop',
    titleTh: 'ร้านเบอร์เกอร์ บาร์อิฐแดง และร้านค้าลาวา',
    year: '2025',
    role: '3D Environment Prop Artist',
    roleTh: 'นักปั้นโมเดลอาคารและร้านค้าในเกม',
    category: 'environment',
    featured: false,
    accent: '#FF8A1F',
    polycount: 'TODO: replace',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'Substance 3D Painter'],
    tags: ['City Props', 'Shop Booth', 'Game Architecture'],
    description: 'Playable stylized commercial kiosks including a two-story rooftop Burger Container, warm brick Corner Bar (source: Tomyumman/Sung.jpg), and glowing Lava Shop kiosk. TODO: replace with notes.',
    descriptionTh: 'รวมโมเดลอาคารร้านค้าในเกม อาทิ ร้านเบอร์เกอร์สองชั้น บาร์อิฐแดง (ไฟล์ Tomyumman/Sung.jpg) และซุ้มขายของลาวา (TODO: เพิ่มข้อมูล)'
  },
  {
    slug: 'pokemon-collection',
    title: 'Pokémon Stylized 3D Tribute',
    titleTh: 'คอลเลกชันโปเกมอน 3D (Reshiram / Ceruledge / Zygarde / Meowstic)',
    year: '2025',
    role: 'Creature & Character Artist',
    roleTh: 'นักปั้นตัวละครและมอนสเตอร์ 3D',
    category: 'characters',
    featured: false,
    accent: '#FF1FA2',
    polycount: 'TODO: replace',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'ZBrush', 'Substance 3D Painter'],
    tags: ['Creature Sculpt', 'Clay vs Color', 'Outline Style', 'Pokémon'],
    description: 'Collection featuring wing-spread Reshiram (clay sculpt vs textured lookdev), cel-outlined Ceruledge, hexagonal Zygarde serpent, and stylized Meowstic plush. TODO: replace with sculpting pipeline notes.',
    descriptionTh: 'รวมผลงานปั้นโปเกมอนสไตล์ 3D ได้แก่ Reshiram (เทียบงานปั้นดินกับสีจริง) Ceruledge ลายเส้นคอมิก Zygarde และ Meowstic (TODO: เพิ่มรายละเอียด)'
  },
  {
    slug: 'stylized-character-showcase',
    title: 'Chibi Heroes, Lego Minifigs & Stylized Cast',
    titleTh: 'คอลเลกชันตัวละครอนิเมะ จิ๋ว และมินิฟิกเลโก้',
    year: '2025–2026',
    role: 'Character Sculptor & Lookdev Artist',
    roleTh: 'ศิลปินตัวละคร 3D หลากหลายสไตล์',
    category: 'characters',
    featured: false,
    accent: '#FF1FA2',
    polycount: 'Variable (Game / High-Poly)',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'ZBrush', 'Substance 3D Painter'],
    tags: ['Anime Chibi', 'Lego Dark Trooper', 'Blue Lock', 'Resident Evil', 'Roblox UGC'],
    description: 'Curated character studies spanning Nagi Seishiro Chibi (Blue Lock), Kaiwa Green Coat Boy, Leon S. Kennedy Chibi, Mona Beret Chibi, Hoodie Boy, Female Samurai, Chewbacca Chibi, Lego Dark Trooper (230K tris), Lego Robin, and Roblox Mummy. TODO: replace with favorites.',
    descriptionTh: 'รวมคาแรกเตอร์หลากสไตล์ ทั้ง Nagi (Blue Lock) Kaiwa Leon RE2 จิ๋ว โมนา ซามูไรหญิง ชิวแบคคา เลโก้ Dark Trooper & Robin และมัมมี่ Roblox (TODO: เพิ่มรายละเอียด)'
  },
  {
    slug: 'roblox-prop-pack',
    title: 'Roblox / Stylized Wearable & Weapon Pack',
    titleTh: 'ชุดไอเท็มแต่งตัว อาวุธ และพร็อพเกม Roblox',
    year: '2025',
    role: 'UGC & Game Prop Modeler',
    roleTh: 'นักออกแบบพร็อพและ UGC 3D',
    category: 'props',
    featured: false,
    accent: '#FFD21F',
    polycount: 'Low-Poly UGC Ready',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'Substance 3D Painter', 'Roblox Studio'],
    tags: ['Roblox UGC', 'Wearables', 'Camo Gun', 'Low-Poly Pack'],
    description: 'Modular UGC lineup showcased together in Desert.jpg alongside individual beauty shots: Metal Bin Mech (Sung1.jpg), Camo Desert Eagle, Wooden Rowboat, Terrazzo Bucket Hat, Toothless Hat, Racing Helmet, and Gold Link Chain. TODO: replace with catalog link.',
    descriptionTh: 'แพ็กไอเท็มและอุปกรณ์เกมพร้อมใช้ อาทิ หุ่นถังสีแดง ปืนลายพราง เรือไม้ หมวกมังกร หมวกกันน็อก และสร้อยทอง (TODO: เพิ่มลิงก์แคตตาล็อก)'
  },
  {
    slug: 'stylized-slime-stack',
    title: 'Stylized Slime Stack',
    titleTh: 'สไลม์แฟนตาซีซ้อนสามชั้น',
    year: '2026',
    role: 'Creature & Material Artist',
    roleTh: 'นักปั้นมอนสเตอร์และจัดแสงใส',
    category: 'characters',
    featured: false,
    accent: '#1FD0E8',
    polycount: 'TODO: replace',
    timeSpent: 'TODO: replace',
    software: ['Autodesk Maya', 'Substance 3D Painter'],
    tags: ['Cute Creature', 'SSS / Translucent', 'Clean Retopo'],
    description: 'Playful three-tier stacked blue, red, and yellow slimes rendered with soft subsurface feel and matched quad wireframe topology. TODO: replace with notes.',
    descriptionTh: 'ผลงานปั้นสไลม์สามสียืนซ้อนกัน พร้อมการจัดแสงผิวใสและภาพเทียบโครงสร้าง Wireframe (TODO: เพิ่มรายละเอียด)'
  },
  {
    slug: 'sailboat-ocean-prototype',
    title: 'Sailboat Ocean Game Prototype',
    titleTh: 'เกมต้นแบบเรือใบบนมหาสมุทร',
    year: '2026',
    role: 'Game Prototyper & 3D Generalist',
    roleTh: 'ผู้พัฒนาต้นแบบเกมและฉากทะเล 3D',
    category: 'motion',
    featured: false,
    accent: '#FF8A1F',
    polycount: 'Real-time Scene',
    timeSpent: 'TODO: replace',
    software: ['Unity', 'Autodesk Maya', 'Shaders'],
    tags: ['Gameplay Capture', 'Ocean Shader', 'Sailboat Mechanics'],
    description: 'Live gameplay screen captures demonstrating third-person wooden sailboat navigation across stylized ocean waves in dusk lighting. TODO: replace with prototype mechanics.',
    descriptionTh: 'ฟุตเทจทดสอบระบบขับเรือใบบนคลื่นทะเลจำลองแสงค่ำ พร้อมการบังคับเลี้ยวจริงในเอนจินเกม (TODO: เพิ่มข้อมูลเกม)'
  },
  {
    slug: 'character-sculpt-rigging-studies',
    title: 'Head Sculpt & Control Rigging Studies',
    titleTh: 'งานฝึกปั้นศีรษะและระบบควบคุมแอนิเมชัน',
    year: '2025–2026',
    role: '3D Character Sculptor & Technical Artist',
    roleTh: 'ศิลปินปั้นสรีระและฝึกเทคนิคแอนิเมชัน',
    category: 'workflow',
    featured: false,
    accent: '#1FD0E8',
    polycount: '10,224 Tris (Mannequin Rig)',
    timeSpent: 'Ongoing R&D',
    software: ['ZBrush', 'Autodesk Maya'],
    tags: ['Anatomy Clay', 'Walk Cycle', 'Spline Rig'],
    description: 'Foundational R&D studies including raw ZBrush/Maya gray-clay head anatomy blocking and a 10,224-tri bipedal walk cycle exercise in Maya. TODO: replace with course notes.',
    descriptionTh: 'ผลงานศึกษาพื้นฐานการปั้นกายวิภาคใบหน้า (Clay) และแบบฝึกหัดแอนิเมชัน Walk Cycle บนริกหุ่นจำลอง 10,224 Tris (TODO: เพิ่มรายละเอียด)'
  }
];

const PROJECT_MAP = new Map(PROJECTS.map(p => [p.slug, p]));

// ---------------------------------------------------------------------------
// 2. VISUALLY VERIFIED EXPLICIT FILE MAPPING
//    Every entry was personally visually audited to fix swapped/misleading names.
// ---------------------------------------------------------------------------
// Format: { srcRel, project, cat: 'renders'|'workflow'|'animations', slugName, label, labelTh, step?, stepLabel?, motionGroup?, order? }
const VERIFIED_MANIFEST = [
  // === STONE CRYSTAL GOLEM ===
  { srcRel: 'Golem.png', project: 'stone-crystal-golem', cat: 'renders', slugName: 'golem-clay-beauty', label: 'Crystal Stone Golem (Sculpt Beauty)', labelTh: 'โกเลมหินผลึก (เรนเดอร์คลี)', order: 1 },
  { srcRel: 'workflowimage/golem.png', project: 'stone-crystal-golem', cat: 'workflow', slugName: '01-retopo-wireframe', step: 1, stepLabel: 'Retopo & Topology', label: 'Golem Low-Poly Red Wireframe (Matched Angle)', labelTh: 'โครงสร้างตาข่าย Low-Poly โกเลม (มุมตรง)', order: 1 },
  { srcRel: 'workflowimage/golem1.png', project: 'stone-crystal-golem', cat: 'workflow', slugName: '02-maya-textured-viewport', step: 2, stepLabel: 'Lookdev Viewport', label: 'Maya Viewport — 6,954 Tris Moss & Crystal Shader', labelTh: 'หน้าต่าง Maya แสดงพื้นผิวหินมอส (6,954 Tris)', order: 2 },
  { srcRel: 'workflowimage/golem2.png', project: 'stone-crystal-golem', cat: 'workflow', slugName: '03-ik-fk-rig-controls', step: 3, stepLabel: 'IK/FK Rigging', label: 'Maya Outliner & NURBS Hand/Foot Control Rig', labelTh: 'โครงสร้างคอนโทรลริกมือและเท้าใน Maya', order: 3 },
  { srcRel: 'labroom_vedio/GolemAnima/walk.mp4', project: 'stone-crystal-golem', cat: 'animations', slugName: 'golem-walk-cycle', label: 'Golem — Heavy Walk Cycle', labelTh: 'โกเลม — ท่าเดินหนักแน่น', motionGroup: 'golem-combat', order: 1 },
  { srcRel: 'labroom_vedio/GolemAnima/attack.mp4', project: 'stone-crystal-golem', cat: 'animations', slugName: 'golem-melee-attack', label: 'Golem — Smash Attack', labelTh: 'โกเลม — ท่าทุบโจมตี', motionGroup: 'golem-combat', order: 2 },
  { srcRel: 'labroom_vedio/GolemAnima/UseSkill.mp4', project: 'stone-crystal-golem', cat: 'animations', slugName: 'golem-crystal-skill', label: 'Golem — Crystal Surge Skill', labelTh: 'โกเลม — ท่าใช้สกิลคริสตัล', motionGroup: 'golem-combat', order: 3 },
  { srcRel: 'labroom_vedio/GolemAnima/Shied.mp4', project: 'stone-crystal-golem', cat: 'animations', slugName: 'golem-guard-shield', label: 'Golem — Guard Shield Stance', labelTh: 'โกเลม — ท่าตั้งโล่ป้องกัน', motionGroup: 'golem-combat', order: 4 },
  { srcRel: 'labroom_vedio/GolemAnima/Dead.mp4', project: 'stone-crystal-golem', cat: 'animations', slugName: 'golem-death-collapse', label: 'Golem — Crumble Death Cycle', labelTh: 'โกเลม — ท่าล้มสลาย', motionGroup: 'golem-combat', order: 5 },

  // === GRAFFITI SUBMARINE ===
  { srcRel: 'Submarine.png', project: 'graffiti-submarine', cat: 'renders', slugName: '01-submarine-hero', label: 'Graffiti Submarine — Starboard Side', labelTh: 'เรือดำน้ำกราฟฟิตี้ — มุมมองด้านข้าง', order: 1 },
  { srcRel: 'Submarine1.png', project: 'graffiti-submarine', cat: 'renders', slugName: '02-submarine-three-quarter', label: 'Graffiti Submarine — Three-Quarter View', labelTh: 'เรือดำน้ำกราฟฟิตี้ — มุมเฉียง 3/4', order: 2 },
  { srcRel: 'Submarine2.png', project: 'graffiti-submarine', cat: 'renders', slugName: '03-submarine-stern', label: 'Graffiti Submarine — Thruster & Stern', labelTh: 'เรือดำน้ำกราฟฟิตี้ — มุมใบพัดท้ายเรือ', order: 3 },
  { srcRel: 'workflowimage/Submarine_Workflow.png', project: 'graffiti-submarine', cat: 'workflow', slugName: '01-split-wireframe-breakdown', step: 1, stepLabel: 'Wireframe / UV Split', label: 'Split Render vs Quad Topology Wireframe', labelTh: 'ภาพเปรียบเทียบ Wireframe และเท็กซ์เจอร์เรือดำน้ำ', order: 1 },
  { srcRel: 'labroom_vedio/Submarine/Submarine.mp4', project: 'graffiti-submarine', cat: 'animations', slugName: 'submarine-beauty-turntable', label: 'Graffiti Submarine — 360° Beauty Turntable', labelTh: 'เรือดำน้ำกราฟฟิตี้ — หมุนโชว์เต็มรูปแบบ 360°', motionGroup: 'vehicles-prototypes', order: 1 },
  { srcRel: 'labroom_vedio/Submarine/Eiei.mp4', project: 'graffiti-submarine', cat: 'animations', slugName: 'submarine-wireframe-wipe', label: 'Graffiti Submarine — Diagonal Wireframe Transition', labelTh: 'เรือดำน้ำกราฟฟิตี้ — เทียบลาย Wireframe 360°', motionGroup: 'vehicles-prototypes', order: 2 },

  // === HOODED HUNTER (GAME YEAR 3) ===
  { srcRel: 'aliwa.png', project: 'hooded-hunter-game-pack', cat: 'renders', slugName: '01-game-pack-showcase', label: 'Fantasy Game Asset Pack Lineup (Hunter, Slimes, Crystals)', labelTh: 'รวมแอสเซ็ตเกมแฟนตาซีครบชุด (ฮันเตอร์ สไลม์ คริสตัล)', order: 1 },
  { srcRel: 'Farry1.png', project: 'hooded-hunter-game-pack', cat: 'renders', slugName: '02-elemental-slimes-group', label: 'Five Elemental Slimes — Final Shading', labelTh: 'แก๊งสไลม์ธาตุทั้ง 5 — เรนเดอร์สีจริง', order: 2 },
  { srcRel: 'awol.png', project: 'hooded-hunter-game-pack', cat: 'workflow', slugName: '01-unity-scene-integration', step: 1, stepLabel: 'Engine Staging', label: 'Unity Editor — Asset Prefab Alignment', labelTh: 'หน้าต่าง Unity จัดวาง Prefab และคริสตัล', order: 1 },
  { srcRel: 'Farry.png', project: 'hooded-hunter-game-pack', cat: 'workflow', slugName: '02-unity-slime-prefabs', step: 2, stepLabel: 'Unity Scale Check', label: 'Unity Editor — Elemental Slime Scale Check', labelTh: 'เช็กขนาดโมเดลสไลม์ใน Unity Editor', order: 2 },
  { srcRel: 'Char_GameYear3_RigClass.png', project: 'hooded-hunter-game-pack', cat: 'workflow', slugName: '03-hunter-body-curves', step: 3, stepLabel: 'Rig Setup', label: 'Maya AdvancedSkeleton — Root & Body Controls (3,886 Tris)', labelTh: 'ริกหลักและขนาดโมเดลฮันเตอร์ 3,886 Tris', order: 3 },
  { srcRel: 'Char_GameYear3_Rig.png', project: 'hooded-hunter-game-pack', cat: 'workflow', slugName: '04-hunter-rig-pose', step: 4, stepLabel: 'IK/FK Pose Test', label: 'Maya Rig — Control Handles Test 01', labelTh: 'ทดสอบเส้นคอนโทรลริกในมุมมอง Viewport', order: 4 },
  { srcRel: 'Char_GameYear3_Rig1.png', project: 'hooded-hunter-game-pack', cat: 'workflow', slugName: '05-hunter-rig-ik', step: 5, stepLabel: 'Joint Deformation', label: 'Maya Rig — Deformation & Weight Test 02', labelTh: 'เช็กการบิดตัวและข้อต่อ AdvancedSkeleton', order: 5 },
  { srcRel: 'Char_GameYear3_Rig2.png', project: 'hooded-hunter-game-pack', cat: 'workflow', slugName: '06-hunter-rig-three-quarter', step: 6, stepLabel: 'Rig Final', label: 'Maya Rig — Three-Quarter Full Rig', labelTh: 'สรุปคอนโทรลริกเต็มตัวใน Maya', order: 6 },
  { srcRel: 'labroom_vedio/Char_idle.mp4', project: 'hooded-hunter-game-pack', cat: 'animations', slugName: 'hunter-idle', label: 'Hooded Hunter — Idle Cycle', labelTh: 'ฮันเตอร์ — ท่ายืนหายใจ (Idle)', motionGroup: 'hooded-hunter', order: 1 },
  { srcRel: 'labroom_vedio/Char_Walk.mp4', project: 'hooded-hunter-game-pack', cat: 'animations', slugName: 'hunter-walk', label: 'Hooded Hunter — Walk Cycle', labelTh: 'ฮันเตอร์ — ท่าเดิน (Walk)', motionGroup: 'hooded-hunter', order: 2 },
  { srcRel: 'labroom_vedio/Char_Run.mp4', project: 'hooded-hunter-game-pack', cat: 'animations', slugName: 'hunter-run', label: 'Hooded Hunter — Combat Sprint', labelTh: 'ฮันเตอร์ — ท่าวิ่งถือค้อน (Run)', motionGroup: 'hooded-hunter', order: 3 },
  { srcRel: 'labroom_vedio/Char_Jump.mp4', project: 'hooded-hunter-game-pack', cat: 'animations', slugName: 'hunter-jump', label: 'Hooded Hunter — Leap & Landing', labelTh: 'ฮันเตอร์ — ท่ากระโดด (Jump)', motionGroup: 'hooded-hunter', order: 4 },
  { srcRel: 'labroom_vedio/Post.mp4', project: 'hooded-hunter-game-pack', cat: 'animations', slugName: 'hunter-battle-stance-block', label: 'Hooded Hunter — Ready Stance (Clay Rig)', labelTh: 'ฮันเตอร์ — ท่าตั้งรับ (ริก Clay)', motionGroup: 'hooded-hunter', order: 5 },
  { srcRel: 'labroom_vedio/post to idle.mp4', project: 'hooded-hunter-game-pack', cat: 'animations', slugName: 'hunter-pose-to-idle', label: 'Hooded Hunter — Transition Pose to Idle', labelTh: 'ฮันเตอร์ — แอนิเมชันสลับสู่ท่า Idle', motionGroup: 'hooded-hunter', order: 6 },

  // === FURRY GUARDIAN ===
  { srcRel: 'FurryLight.jpg', project: 'furry-guardian', cat: 'renders', slugName: '01-furry-hero-sword', label: 'Furry Guardian — Rim-Lit Sword Pose', labelTh: 'การ์เดียนขนฟูคาบดาบ — จัดแสงหลัก', order: 1 },
  { srcRel: 'FurryLight1.jpg', project: 'furry-guardian', cat: 'renders', slugName: '02-furry-side-blade', label: 'Furry Guardian — Golden Blade Glow', labelTh: 'การ์เดียนขนฟู — จัดแสงดาบทองสว่าง', order: 2 },
  { srcRel: 'FurryLight2.jpg', project: 'furry-guardian', cat: 'renders', slugName: '03-furry-dramatic-key', label: 'Furry Guardian — Studio Profile', labelTh: 'การ์เดียนขนฟู — มุมข้างเต็มตัว', order: 3 },
  { srcRel: 'Furry.png', project: 'furry-guardian', cat: 'workflow', slugName: '01-nurbs-rig-controls', step: 1, stepLabel: 'Creature Rigging', label: 'Maya Viewport — 9,196 Tris Quadruped & Tail NURBS Rig', labelTh: 'โครงสร้างริกสัตว์ 4 ขาและหาง 9,196 Tris ใน Maya', order: 1 },
  { srcRel: 'labroom_vedio/Idle.mp4', project: 'furry-guardian', cat: 'animations', slugName: 'furry-idle', label: 'Furry Guardian — Tail-Wag Idle', labelTh: 'การ์เดียนขนฟู — ท่ายืนกระดิกหาง', motionGroup: 'furry-guardian', order: 1 },
  { srcRel: 'labroom_vedio/walk.mp4', project: 'furry-guardian', cat: 'animations', slugName: 'furry-walk', label: 'Furry Guardian — Quadruped Trot', labelTh: 'การ์เดียนขนฟู — ท่าเดิน 4 ขา', motionGroup: 'furry-guardian', order: 2 },
  { srcRel: 'labroom_vedio/Attck.mp4', project: 'furry-guardian', cat: 'animations', slugName: 'furry-pounce-attack', label: 'Furry Guardian — Lunge Slash Attack', labelTh: 'การ์เดียนขนฟู — ท่ากระโจนโจมตี', motionGroup: 'furry-guardian', order: 3 },
  { srcRel: '20260526-2336-55.5183097 - Copy.mp4', project: 'furry-guardian', cat: 'animations', slugName: 'furry-mobile-gameplay-demo', label: 'Mobile Action Prototype — Live Playtest Capture', labelTh: 'ฟุตเทจเล่นจริงต้นแบบเกมแอ็กชันมือถือ', motionGroup: 'furry-guardian', order: 4 },

  // === CHIBI CRUSADER KNIGHT & FLAIL ===
  { srcRel: 'knifeAung.png', project: 'chibi-crusader-knight', cat: 'renders', slugName: '01-crusader-knight-hero', label: 'Chibi Crusader Knight (src: knifeAung.png)', labelTh: 'อัศวินครูเสดจิ๋ว (ไฟล์ knifeAung.png)', order: 1 },
  { srcRel: 'workflowimage/Bump.png', project: 'chibi-crusader-knight', cat: 'renders', slugName: '02-spiked-flail-beauty', label: 'Weather-Beaten Spiked Flail (Matched Weapon)', labelTh: 'อาวุธกระบองลูกตุ้มหนาม (คู่ตัวละคร)', order: 2 },
  { srcRel: 'workflowimage/Bump2.png', project: 'chibi-crusader-knight', cat: 'workflow', slugName: '01-flail-wireframe', step: 1, stepLabel: 'Weapon Wireframe', label: 'Spiked Flail & Chain Wireframe Topology', labelTh: 'โครงสร้าง Wireframe ลูกตุ้มหนามและห่วงโซ่', order: 1 },
  { srcRel: 'workflowimage/Screenshot 2026-06-22 220730.png', project: 'chibi-crusader-knight', cat: 'workflow', slugName: '02-knight-substance-wireframe', step: 2, stepLabel: 'Texture & UV Grid', label: 'Substance / Marmoset — Knight Armor Wireframe', labelTh: 'ภาพตรวจแนวตาข่ายเกราะเหล็กในโปรแกรมเพนต์', order: 2 },
  { srcRel: 'labroom_vedio/Recording 2026-06-24 234608.mp4', project: 'chibi-crusader-knight', cat: 'animations', slugName: 'crusader-rig-and-flail-test', label: 'Crusader Knight — Dual-Window Rig & Flail Swing Test', labelTh: 'ทดสอบริกอัศวินครูเสดและอาวุธลูกตุ้มใน Maya', motionGroup: 'vehicles-prototypes', order: 5 },
  { srcRel: 'labroom_vedio/AungChibi/Brand_Anima_1.[0001-0300]_2.mp4', project: 'chibi-crusader-knight', cat: 'animations', slugName: 'crusader-orange-studio-final', label: 'Chibi Crusader Knight — Orange Stage Final Animation', labelTh: 'แอนิเมชันอัศวินจิ๋วเดินถือลูกตุ้ม (ฉากส้มสมบูรณ์)', motionGroup: 'chibi-cutscenes', order: 1 },

  // === CLOUD STRIFE CHIBI ===
  { srcRel: 'CloundStrikeChibi.jpg', project: 'cloud-strife-chibi', cat: 'renders', slugName: '01-cloud-hero-buster-sword', label: 'Cloud Strife Chibi — Hero Stance', labelTh: 'คลาวด์ สไตรฟ์ จิ๋ว — ท่ายืนหลัก', order: 1 },
  { srcRel: 'CloundStrikeChibi1.jpg', project: 'cloud-strife-chibi', cat: 'renders', slugName: '02-cloud-action-angle', label: 'Cloud Chibi — Dramatic Angle 01', labelTh: 'คลาวด์ จิ๋ว — มุมมอง 01', order: 2 },
  { srcRel: 'CloundStrikeChibi2.jpg', project: 'cloud-strife-chibi', cat: 'renders', slugName: '03-cloud-portrait-light', label: 'Cloud Chibi — Portrait Glow 02', labelTh: 'คลาวด์ จิ๋ว — มุมใกล้ 02', order: 3 },
  { srcRel: 'CloundStrikeChibi3.jpg', project: 'cloud-strife-chibi', cat: 'renders', slugName: '04-cloud-side-armor', label: 'Cloud Chibi — Pauldron Detail 03', labelTh: 'คลาวด์ จิ๋ว — รายละเอียดเกราะ 03', order: 4 },
  { srcRel: 'CloundStrikeChibi4.jpg', project: 'cloud-strife-chibi', cat: 'renders', slugName: '05-cloud-back-view', label: 'Cloud Chibi — Rear Silhouette 04', labelTh: 'คลาวด์ จิ๋ว — มุมหลัง 04', order: 5 },
  { srcRel: 'CloundStrikeChibi5.jpg', project: 'cloud-strife-chibi', cat: 'renders', slugName: '06-cloud-rim-light-05', label: 'Cloud Chibi — Rim Lighting 05', labelTh: 'คลาวด์ จิ๋ว — จัดแสงขอบ 05', order: 6 },
  { srcRel: 'CloundStrikeChibi6.jpg', project: 'cloud-strife-chibi', cat: 'renders', slugName: '07-cloud-rim-light-06', label: 'Cloud Chibi — Low Camera 06', labelTh: 'คลาวด์ จิ๋ว — มุมเสย 06', order: 7 },
  { srcRel: 'CloundStrikeChibi01.jpg', project: 'cloud-strife-chibi', cat: 'renders', slugName: '08-cloud-studio-pass-01', label: 'Cloud Chibi — Studio Shot 01', labelTh: 'คลาวด์ จิ๋ว — ช็อตสตูดิโอ 01', order: 8 },
  { srcRel: 'CloundStrikeChibi02.jpg', project: 'cloud-strife-chibi', cat: 'renders', slugName: '09-cloud-studio-pass-02', label: 'Cloud Chibi — Studio Shot 02', labelTh: 'คลาวด์ จิ๋ว — ช็อตสตูดิโอ 02', order: 9 },
  { srcRel: 'CloundStrikeChibi03.jpg', project: 'cloud-strife-chibi', cat: 'renders', slugName: '10-cloud-studio-pass-03', label: 'Cloud Chibi — Studio Shot 03', labelTh: 'คลาวด์ จิ๋ว — ช็อตสตูดิโอ 03', order: 10 },
  { srcRel: 'CloundStrikeChibi04.jpg', project: 'cloud-strife-chibi', cat: 'renders', slugName: '11-cloud-studio-pass-04', label: 'Cloud Chibi — Studio Shot 04', labelTh: 'คลาวด์ จิ๋ว — ช็อตสตูดิโอ 04', order: 11 },
  { srcRel: 'labroom_vedio/FinalAnima/Final.mp4', project: 'cloud-strife-chibi', cat: 'animations', slugName: 'cloud-boss-arena-final', label: 'Cloud Chibi — Boss Arena Confrontation (Final Cut)', labelTh: 'คลาวด์ จิ๋ว — แอนิเมชันเผชิญหน้าบอส (คัตหลัก)', motionGroup: 'chibi-cutscenes', order: 2 },
  { srcRel: 'labroom_vedio/FinalAnima/Eiei.mp4', project: 'cloud-strife-chibi', cat: 'animations', slugName: 'cloud-arena-opener', label: 'Cloud Chibi — Arena Platform Intro', labelTh: 'คลาวด์ จิ๋ว — ช็อตเปิดตัวบนดาดฟ้า', motionGroup: 'chibi-cutscenes', order: 3 },
  { srcRel: 'labroom_vedio/FinalAnima/F1.mp4', project: 'cloud-strife-chibi', cat: 'animations', slugName: 'cloud-closeup-sequence', label: 'Cloud Chibi — Dramatic Closeup Cut', labelTh: 'คลาวด์ จิ๋ว — ช็อตโคลสอัพ 01', motionGroup: 'chibi-cutscenes', order: 4 },
  { srcRel: 'labroom_vedio/FinalAnima/F2.mp4', project: 'cloud-strife-chibi', cat: 'animations', slugName: 'cloud-dash-slash-cut', label: 'Cloud Chibi — Quick Sword Swing Cut', labelTh: 'คลาวด์ จิ๋ว — ช็อตแอ็กชันสั้น 02', motionGroup: 'chibi-cutscenes', order: 5 },

  // === SEPHIROTH CHIBI ===
  { srcRel: 'Sephirod.jpg', project: 'sephiroth-chibi', cat: 'renders', slugName: '01-sephiroth-hero', label: 'Sephiroth Chibi — Front Lookdev', labelTh: 'เซฟิรอธ จิ๋ว — มุมหน้าตรง', order: 1 },
  { srcRel: 'Sephirod1.jpg', project: 'sephiroth-chibi', cat: 'renders', slugName: '02-sephiroth-coat-flow', label: 'Sephiroth Chibi — Coat Three-Quarter', labelTh: 'เซฟิรอธ จิ๋ว — มุมเฉียง', order: 2 },
  { srcRel: 'Sephirod2.jpg', project: 'sephiroth-chibi', cat: 'renders', slugName: '03-sephiroth-side', label: 'Sephiroth Chibi — Side Profile', labelTh: 'เซฟิรอธ จิ๋ว — มุมข้าง', order: 3 },
  { srcRel: 'Sephirod3.jpg', project: 'sephiroth-chibi', cat: 'renders', slugName: '04-sephiroth-back', label: 'Sephiroth Chibi — Silver Hair Back', labelTh: 'เซฟิรอธ จิ๋ว — มุมด้านหลัง', order: 4 },
  { srcRel: 'Sephirod4.jpg', project: 'sephiroth-chibi', cat: 'renders', slugName: '05-sephiroth-closeup', label: 'Sephiroth Chibi — Rim Detail', labelTh: 'เซฟิรอธ จิ๋ว — จัดแสงขอบมุมใกล้', order: 5 },
  { srcRel: 'workflowimage/Sephirod.png', project: 'sephiroth-chibi', cat: 'workflow', slugName: '01-sephiroth-wireframe', step: 1, stepLabel: 'Character Wireframe', label: 'Sephiroth Chibi Wireframe (Matched Camera)', labelTh: 'ภาพโครงสร้างตาข่ายเซฟิรอธมุมตรง', order: 1 },

  // === MOTORCYCLE SERIES ===
  { srcRel: 'Zh2Color.jpg', project: 'motorcycle-series', cat: 'renders', slugName: '01-kawasaki-zh2-painted', label: 'Kawasaki ZH2 — Metallic Emerald Paint Render', labelTh: 'Kawasaki ZH2 — เรนเดอร์สีเมทัลลิกสมบูรณ์', order: 1 },
  { srcRel: 'Zh2Front.jpg', project: 'motorcycle-series', cat: 'renders', slugName: '02-kawasaki-zh2-front', label: 'Kawasaki ZH2 — Aggro Front Cowl', labelTh: 'Kawasaki ZH2 — มุมหน้าไฟหน้า', order: 2 },
  { srcRel: 'Versy650.jpg', project: 'motorcycle-series', cat: 'renders', slugName: '03-versys-650-side', label: 'Kawasaki Versys 650 — Touring Trim', labelTh: 'Kawasaki Versys 650 — เรนเดอร์เต็มคัน', order: 3 },
  { srcRel: 'Versy6501.jpg', project: 'motorcycle-series', cat: 'renders', slugName: '04-versys-650-angle', label: 'Kawasaki Versys 650 — Rim Angle', labelTh: 'Kawasaki Versys 650 — มุมเฉียง 3/4', order: 4 },
  { srcRel: 'Zh2.jpg', project: 'motorcycle-series', cat: 'workflow', slugName: '01-zh2-clay-render', step: 1, stepLabel: 'Clay Lookdev', label: 'Kawasaki ZH2 — Gray Clay Mechanical Sculpt', labelTh: 'Kawasaki ZH2 — งานปั้นโมเดลดิน (Clay) ก่อนลงสี', order: 1 },
  { srcRel: 'workflowimage/Zh2.png', project: 'motorcycle-series', cat: 'workflow', slugName: '02-zh2-maya-viewport', step: 2, stepLabel: 'Arnold & Wireframe', label: 'Maya Dual Viewport — 186,374 Tris Arnold Lookdev', labelTh: 'หน้าต่างงาน Maya โมเดลรถ 186,374 Tris', order: 2 },
  { srcRel: 'workflowimage/Versy650.0.jpg', project: 'motorcycle-series', cat: 'workflow', slugName: '03-versys-650-wireframe', step: 3, stepLabel: 'Sub-D Wireframe', label: 'Versys 650 Full Chassis Wireframe Overlay', labelTh: 'โครงสร้างตาข่ายแฟริ่งและล้อ Versys 650', order: 3 },

  // === TOJI FUSHIGURO ===
  { srcRel: 'Gojo.jpg', project: 'toji-fushiguro', cat: 'renders', slugName: '01-toji-hero-front', label: 'Toji Fushiguro — Anatomy Hero (src: Gojo.jpg)', labelTh: 'โทจิ ฟุชิงุโระ — หน้าตรง (ไฟล์ Gojo.jpg)', order: 1 },
  { srcRel: 'Gojo1.jpg', project: 'toji-fushiguro', cat: 'renders', slugName: '02-toji-side-torso', label: 'Toji Fushiguro — Side Torso (src: Gojo1.jpg)', labelTh: 'โทจิ ฟุชิงุโระ — มุมข้าง', order: 2 },
  { srcRel: 'Gojo2.jpg', project: 'toji-fushiguro', cat: 'renders', slugName: '03-toji-back-musculature', label: 'Toji Fushiguro — Back Muscles (src: Gojo2.jpg)', labelTh: 'โทจิ ฟุชิงุโระ — กล้ามเนื้อด้านหลัง', order: 3 },
  { srcRel: 'Gojo3.jpg', project: 'toji-fushiguro', cat: 'renders', slugName: '04-toji-dramatic-rim', label: 'Toji Fushiguro — Dramatic Portrait', labelTh: 'โทจิ ฟุชิงุโระ — โคลสอัพจัดแสง', order: 4 },
  { srcRel: 'Gojo4.jpg', project: 'toji-fushiguro', cat: 'renders', slugName: '05-toji-three-quarter', label: 'Toji Fushiguro — Three-Quarter Turn', labelTh: 'โทจิ ฟุชิงุโระ — มุม 3/4', order: 5 },
  { srcRel: 'Toji.jpg', project: 'toji-fushiguro', cat: 'renders', slugName: '06-toji-chibi-edition', label: 'Toji Fushiguro — Stylized Chibi Version', labelTh: 'โทจิ ฟุชิงุโระ — เวอร์ชันตัวจิ๋ว', order: 6 },
  { srcRel: 'workflowimage/Gojo.png', project: 'toji-fushiguro', cat: 'workflow', slugName: '01-toji-maya-wireframe-rig', step: 1, stepLabel: 'Rig & Wireframe', label: 'Maya Viewport — Full-Body Topology & Skeleton', labelTh: 'หน้าต่าง Maya แสดงตาข่ายกล้ามเนื้อและโครงกระดูก', order: 1 },

  // === HORROR OPERATING LAB ===
  { srcRel: 'Labdocter.jpg', project: 'horror-operating-lab', cat: 'renders', slugName: '01-operating-lab-hero', label: 'Horror Operating Lab — Full Cutaway', labelTh: 'ห้องผ่าตัดสยองขวัญ — มุมเต็มห้อง', order: 1 },
  { srcRel: 'Labdocter1.jpg', project: 'horror-operating-lab', cat: 'renders', slugName: '02-operating-table-closeup', label: 'Surgical Lamps & Operating Table Detail', labelTh: 'โคมไฟผ่าตัดและเตียงคนไข้มุมใกล้', order: 2 },
  { srcRel: 'Labdocter2.jpg', project: 'horror-operating-lab', cat: 'renders', slugName: '03-wall-cables-monitors', label: 'Industrial Wall Wiring & Control Carts', labelTh: 'สายไฟและแผงควบคุมผนังห้องแล็บ', order: 3 },
  { srcRel: 'Labdocter3.jpg', project: 'horror-operating-lab', cat: 'renders', slugName: '04-dark-mood-alternate', label: 'Low-Key Horror Lighting Pass', labelTh: 'การจัดแสงโทนมืดแนวเอาตัวรอด', order: 4 },
  { srcRel: 'workflowimage/Labidiacamp.png', project: 'horror-operating-lab', cat: 'workflow', slugName: '01-maya-scene-wireframe', step: 1, stepLabel: 'Environment Topology', label: 'Maya Viewport — 95,348 Tris Full Scene Wireframe', labelTh: 'โครงสร้างฉาก Wireframe 95,348 Tris ใน Maya', order: 1 },

  // === COMBAT WEAPONS ARSENAL ===
  { srcRel: 'Axe.jpg', project: 'combat-weapons-arsenal', cat: 'renders', slugName: '01-tactical-hatchet-side', label: 'Tactical Hatchet — Side PBR', labelTh: 'ขวานยุทธวิธี — ด้านข้าง', order: 1 },
  { srcRel: 'Axe_1.jpg', project: 'combat-weapons-arsenal', cat: 'renders', slugName: '02-tactical-hatchet-iso', label: 'Tactical Hatchet — Isometric View', labelTh: 'ขวานยุทธวิธี — มุมเฉียง', order: 2 },
  { srcRel: 'Karambit.png', project: 'combat-weapons-arsenal', cat: 'renders', slugName: '03-karambit-blade', label: 'Karambit Combat Knife', labelTh: 'มีดพก Karambit เคลือบโลหะ', order: 3 },
  { srcRel: 'Screenshot 2026-01-11 105454.png', project: 'combat-weapons-arsenal', cat: 'renders', slugName: '04-silenced-tactical-pistol', label: 'Silenced Tactical Pistol (src: Screenshot 01-11)', labelTh: 'ปืนพกเก็บเสียงยุทธวิธี', order: 4 },
  { srcRel: 'OldGun.jpg', project: 'combat-weapons-arsenal', cat: 'renders', slugName: '05-flintlock-blunderbuss-left', label: 'Engraved Flintlock Blunderbuss', labelTh: 'ปืนคาบศิลาโบราณแกะสลัก', order: 5 },
  { srcRel: 'OldGun1.jpg', project: 'combat-weapons-arsenal', cat: 'renders', slugName: '06-flintlock-blunderbuss-right', label: 'Flintlock Blunderbuss — Reverse Lock', labelTh: 'ปืนคาบศิลาโบราณ — มุมกลับ', order: 6 },
  { srcRel: 'Shied.png', project: 'combat-weapons-arsenal', cat: 'renders', slugName: '07-crusader-kite-shield', label: 'Weathered Crusader Kite Shield', labelTh: 'โล่เหล็กอัศวินครูเสด', order: 7 },
  { srcRel: 'LightSaberVer1.jpg', project: 'combat-weapons-arsenal', cat: 'renders', slugName: '08-scifi-lightsaber-hilt', label: 'Sci-Fi Sith Lightsaber Hilt', labelTh: 'ด้ามดาบไลท์เซเบอร์ไซไฟ', order: 8 },
  { srcRel: 'Bladeofchaos.jpg', project: 'combat-weapons-arsenal', cat: 'renders', slugName: '09-chained-chaos-blade', label: 'Chained Chaos Greatsword', labelTh: 'ดาบใหญ่คล้องโซ่แฟนตาซี', order: 9 },
  { srcRel: 'SwordKorel.jpg', project: 'combat-weapons-arsenal', cat: 'renders', slugName: '10-jade-rune-sword', label: 'Runed Jade Blade & Scabbard', labelTh: 'ดาบรูนสีหยกพร้อมฝักดาบ', order: 10 },
  { srcRel: 'knife.jpg', project: 'combat-weapons-arsenal', cat: 'renders', slugName: '11-wrapped-rune-dagger', label: 'Wrapped Mummy Rune Dagger', labelTh: 'มีดสั้นอักษรรูนพันผ้าดิบ', order: 11 },
  { srcRel: 'workflowimage/Axe.1.png', project: 'combat-weapons-arsenal', cat: 'workflow', slugName: '01-hatchet-wireframe', step: 1, stepLabel: 'Hard-Surface Wireframe', label: 'Tactical Hatchet — Blue Wireframe Cage', labelTh: 'โครงสร้างตาข่ายขวานยุทธวิธี', order: 1 },
  { srcRel: 'workflowimage/Axe.-1.png', project: 'combat-weapons-arsenal', cat: 'workflow', slugName: '02-hatchet-clay-lighting', step: 2, stepLabel: 'Clay Render Pass', label: 'Tactical Hatchet — Arnold Gray Clay Pass', labelTh: 'ภาพทดสอบแสง Clay ของขวาน', order: 2 },
  { srcRel: 'workflowimage/Axe.png', project: 'combat-weapons-arsenal', cat: 'workflow', slugName: '03-hatchet-maya-dual-ui', step: 3, stepLabel: 'Arnold Dual Viewport', label: 'Maya Dual Viewport — 4,086 Tris Hatchet', labelTh: 'หน้าต่าง Maya 4,086 Tris Dual-Pane', order: 3 },
  { srcRel: 'workflowimage/Karambit.png', project: 'combat-weapons-arsenal', cat: 'workflow', slugName: '04-karambit-wireframe', step: 4, stepLabel: 'Weapon Wireframe', label: 'Karambit Knife — Matched Wireframe', labelTh: 'ภาพโครงสร้าง Wireframe มีด Karambit', order: 4 },
  { srcRel: 'OldGun.0.png', project: 'combat-weapons-arsenal', cat: 'workflow', slugName: '05-flintlock-maya-wireframe', step: 5, stepLabel: 'Topology HUD', label: 'Flintlock Pistol — 11,448 Tris Maya HUD', labelTh: 'หน้าต่าง Maya ปืนคาบศิลา 11,448 Tris', order: 5 },
  { srcRel: 'workflowimage/Sheid.png', project: 'combat-weapons-arsenal', cat: 'workflow', slugName: '06-shield-wireframe', step: 6, stepLabel: 'Shield Wireframe', label: 'Crusader Shield — Matched Wireframe', labelTh: 'ภาพ Wireframe โล่อัศวินครูเสด', order: 6 },
  { srcRel: 'workflowimage/lightsaber.png', project: 'combat-weapons-arsenal', cat: 'workflow', slugName: '07-lightsaber-maya-viewport', step: 7, stepLabel: 'Emission & Arnold', label: 'Lightsaber Hilt — 11,644 Tris Maya Viewport', labelTh: 'หน้าต่าง Maya ด้ามไลท์เซเบอร์ 11,644 Tris', order: 7 },

  // === CHARACTERS JIN / WICH / MINT / AGENT JEAN ===
  { srcRel: 'CharacterJin.jpg', project: 'character-jin', cat: 'renders', slugName: '01-jin-horror-portrait', label: 'Jin — Splattered Pink Uniform Front', labelTh: 'จิน — มุมหน้าตรง', order: 1 },
  { srcRel: 'CharacterJin1.jpg', project: 'character-jin', cat: 'renders', slugName: '02-jin-three-quarter', label: 'Jin — Three-Quarter Turn', labelTh: 'จิน — มุมเฉียง 3/4', order: 2 },
  { srcRel: 'CharacterJin2.jpg', project: 'character-jin', cat: 'renders', slugName: '03-jin-back-hair-buns', label: 'Jin — Twin Hair Buns Rear', labelTh: 'จิน — มุมด้านหลังทรงผม', order: 3 },
  { srcRel: 'workflowimage/Mint.png', project: 'character-jin', cat: 'workflow', slugName: '01-jin-rig-wireframe', step: 1, stepLabel: 'Rig & Skinning', label: 'Maya AdvancedSkeleton Rig (145,032 Tris, src: Mint.png)', labelTh: 'โครงสร้างริกและ Wireframe ตัวจริงของจิน 145,032 Tris', order: 1 },

  { srcRel: 'Character_Wich.jpg', project: 'character-wich', cat: 'renders', slugName: '01-wich-front-tpose', label: 'Wich — Campus Uniform Front', labelTh: 'วิช — ท่าตรงหน้า', order: 1 },
  { srcRel: 'Character_Wich_1.jpg', project: 'character-wich', cat: 'renders', slugName: '02-wich-three-quarter', label: 'Wich — Three-Quarter Profile', labelTh: 'วิช — มุม 3/4', order: 2 },
  { srcRel: 'Character_Wich_2.jpg', project: 'character-wich', cat: 'renders', slugName: '03-wich-side-hair', label: 'Wich — Side Silhouette', labelTh: 'วิช — มุมด้านข้าง', order: 3 },
  { srcRel: 'Character_Wich_3.jpg', project: 'character-wich', cat: 'renders', slugName: '04-wich-rear-skirt', label: 'Wich — Rear Uniform View', labelTh: 'วิช — ด้านหลัง', order: 4 },
  { srcRel: 'workflowimage/jin.png', project: 'character-wich', cat: 'workflow', slugName: '01-wich-maya-wireframe', step: 1, stepLabel: 'Game Topology', label: 'Maya Clean Quad Wireframe (29,030 Tris, src: jin.png)', labelTh: 'โครงสร้าง Wireframe ตัวจริงของวิช 29,030 Tris', order: 1 },

  { srcRel: 'CharacterMint.jpg', project: 'character-mint', cat: 'renders', slugName: '01-mint-chibi-hero', label: 'Mint — Chibi Pose Hero', labelTh: 'มินต์ จิ๋ว — ท่าหลัก', order: 1 },
  { srcRel: 'CharacterMint1.jpg', project: 'character-mint', cat: 'renders', slugName: '02-mint-front-rigged', label: 'Mint — Soft Light Pass 01', labelTh: 'มินต์ จิ๋ว — จัดแสง 01', order: 2 },
  { srcRel: 'CharacterMint2.jpg', project: 'character-mint', cat: 'renders', slugName: '03-mint-side-bow', label: 'Mint — Profile & Bow 02', labelTh: 'มินต์ จิ๋ว — มุมข้าง 02', order: 3 },
  { srcRel: 'CharacterMint3.jpg', project: 'character-mint', cat: 'renders', slugName: '04-mint-rear-kimono', label: 'Mint — Rear Kimono 03', labelTh: 'มินต์ จิ๋ว — ด้านหลัง 03', order: 4 },
  { srcRel: 'CharacterMint4.jpg', project: 'character-mint', cat: 'renders', slugName: '05-mint-studio-alt', label: 'Mint — Three-Quarter Turn 04', labelTh: 'มินต์ จิ๋ว — มุม 3/4 04', order: 5 },
  { srcRel: 'workflowimage/Screenshot 2026-06-13 031123.png', project: 'character-mint', cat: 'workflow', slugName: '01-mint-maya-dual-rig', step: 1, stepLabel: 'Wireframe & Clay Rig', label: 'Maya Dual Viewport — 33,240 Tris Wireframe & Clay Rig', labelTh: 'หน้าต่าง Maya เปรียบเทียบ Wireframe และ Clay 33,240 Tris', order: 1 },

  { srcRel: 'jean.jpg', project: 'agent-jean', cat: 'renders', slugName: '01-jean-action-aim', label: 'Agent Jean — Action Pistol Aim', labelTh: 'เอเจนต์จีน — ท่าเล็งปืนพก', order: 1 },
  { srcRel: 'jean1.jpg', project: 'agent-jean', cat: 'renders', slugName: '02-jean-portrait-01', label: 'Agent Jean — Three-Quarter Stance', labelTh: 'เอเจนต์จีน — มุมเฉียง', order: 2 },
  { srcRel: 'jean2.jpg', project: 'agent-jean', cat: 'renders', slugName: '03-jean-portrait-02', label: 'Agent Jean — Glasses Closeup', labelTh: 'เอเจนต์จีน — โคลสอัพใบหน้าและแว่น', order: 3 },
  { srcRel: 'jean3.jpg', project: 'agent-jean', cat: 'renders', slugName: '04-jean-side-profile', label: 'Agent Jean — Full Walk Pose', labelTh: 'เอเจนต์จีน — มุมเดินเต็มตัว', order: 4 },
  { srcRel: 'jean4.jpg', project: 'agent-jean', cat: 'renders', slugName: '05-jean-back-jacket', label: 'Agent Jean — Ponytail Rear', labelTh: 'เอเจนต์จีน — ด้านหลังทรงผม', order: 5 },
  { srcRel: 'jean5.jpg', project: 'agent-jean', cat: 'renders', slugName: '06-jean-low-angle', label: 'Agent Jean — Low Rim Lighting', labelTh: 'เอเจนต์จีน — มุมต่ำจัดแสงขอบ', order: 6 },
  { srcRel: 'workflowimage/jean.0.jpg', project: 'agent-jean', cat: 'workflow', slugName: '01-jean-maya-wireframe', step: 1, stepLabel: 'Face & Weapon Topology', label: 'Maya Wireframe — 68,001 Tris Face & Handgun', labelTh: 'โครงสร้าง Wireframe ตัวละครและปืน 68,001 Tris', order: 1 },

  // === COZY GAMER & MINIMAL BEDROOMS ===
  { srcRel: 'FinalRoom.jpg', project: 'cozy-gamer-bedroom', cat: 'renders', slugName: '01-gamer-bedroom-final', label: 'Cozy Gamer Bedroom — Final Warm Look', labelTh: 'ห้องนอนเกมเมอร์ — เรนเดอร์จัดแสงหลัก', order: 1 },
  { srcRel: '1.jpg', project: 'cozy-gamer-bedroom', cat: 'renders', slugName: '02-gamer-bedroom-day-angle', label: 'Gamer Bedroom — Isometric Desk View', labelTh: 'ห้องนอนเกมเมอร์ — มุมโต๊ะคอมพิวเตอร์', order: 2 },
  { srcRel: 'room.jpg', project: 'cozy-gamer-bedroom', cat: 'renders', slugName: '03-gamer-bedroom-wip-pass', label: 'Gamer Bedroom — Clean Studio Lighting', labelTh: 'ห้องนอนเกมเมอร์ — เรนเดอร์สตูดิโอสว่าง', order: 3 },
  { srcRel: 'roomver1.jpg', project: 'cozy-gamer-bedroom', cat: 'renders', slugName: '04-gamer-bedroom-night-led', label: 'Gamer Bedroom — Evening LED Pass', labelTh: 'ห้องนอนเกมเมอร์ — โทนกลางคืนเปิดไฟนีออน', order: 4 },
  { srcRel: 'pers.png', project: 'cozy-gamer-bedroom', cat: 'workflow', slugName: '01-bedroom-maya-persp', step: 1, stepLabel: 'Perspective Blueprint', label: 'Maya 529,006 Tris Perspective Orthographic', labelTh: 'แบบจำลองห้องในมุม Perspective 529,006 Tris', order: 1 },
  { srcRel: 'front.png', project: 'cozy-gamer-bedroom', cat: 'workflow', slugName: '02-bedroom-front-ortho', step: 2, stepLabel: 'Front Orthographic', label: 'Maya Front Elevation Blueprint', labelTh: 'แปลนด้านหน้า (Front Ortho)', order: 2 },
  { srcRel: 'side.png', project: 'cozy-gamer-bedroom', cat: 'workflow', slugName: '03-bedroom-side-ortho', step: 3, stepLabel: 'Side Orthographic', label: 'Maya Side Elevation Blueprint', labelTh: 'แปลนด้านข้าง (Side Ortho)', order: 3 },
  { srcRel: 'Top.png', project: 'cozy-gamer-bedroom', cat: 'workflow', slugName: '04-bedroom-top-ortho', step: 4, stepLabel: 'Top Plan', label: 'Maya Top Floorplan Layout', labelTh: 'แปลนผังพื้นด้านบน (Top View)', order: 4 },

  { srcRel: 'Mpres.jpg', project: 'minimal-bedroom', cat: 'renders', slugName: '01-minimal-bedroom-hero', label: 'Minimal Loft Bedroom — Final Render', labelTh: 'ห้องนอนมินิมอล — เรนเดอร์มุมหลัก', order: 1 },
  { srcRel: 'Mfront.png', project: 'minimal-bedroom', cat: 'workflow', slugName: '01-minimal-front-ortho', step: 1, stepLabel: 'Front Blueprint', label: 'Maya Front Ortho (33,208 Tris)', labelTh: 'แปลนด้านหน้าห้องมินิมอล (33,208 Tris)', order: 1 },
  { srcRel: 'Mside.png', project: 'minimal-bedroom', cat: 'workflow', slugName: '02-minimal-side-ortho', step: 2, stepLabel: 'Side Blueprint', label: 'Maya Side Elevation View', labelTh: 'แปลนด้านข้างห้องมินิมอล', order: 2 },
  { srcRel: 'MTop.png', project: 'minimal-bedroom', cat: 'workflow', slugName: '03-minimal-top-ortho', step: 3, stepLabel: 'Top Blueprint', label: 'Maya Top Floorplan', labelTh: 'ผังพื้นด้านบนห้องมินิมอล', order: 3 },

  // === ASIAN HERITAGE ARCHITECTURE ===
  { srcRel: 'CastleChines.jpg', project: 'asian-heritage-architecture', cat: 'renders', slugName: '01-chinese-pagoda-courtyard', label: 'Chinese Pagoda Tower & Zen Garden', labelTh: 'หอเก๋งจีนและสวนกรวด 3 มิติ', order: 1 },
  { srcRel: 'HosueKorelstyle.png', project: 'asian-heritage-architecture', cat: 'workflow', slugName: '01-korean-courtyard-split-wireframe', step: 1, stepLabel: 'Split Wireframe / Clay', label: 'Korean Courtyard Estate — Wireframe vs Water Lookdev', labelTh: 'เทียบ Wireframe และงาน Clay เรือนโบราณกลางน้ำ', order: 1 },

  // === COMMERCIAL AIRCRAFT SEAT ===
  { srcRel: 'seatAirplane.jpg', project: 'aircraft-cabin-seat', cat: 'renders', slugName: '01-cabin-seat-hero', label: 'Commercial Aircraft Seat — Hero Angle', labelTh: 'เก้าอี้เครื่องบินโดยสาร — มุมหลัก', order: 1 },
  { srcRel: 'seatAirplane1.jpg', project: 'aircraft-cabin-seat', cat: 'renders', slugName: '02-cabin-seat-side-recline', label: 'Aircraft Seat — Side Armrest & Profile', labelTh: 'เก้าอี้เครื่องบิน — ด้านข้างและที่วางแขน', order: 2 },
  { srcRel: 'seatAirplane2.jpg', project: 'aircraft-cabin-seat', cat: 'renders', slugName: '03-cabin-seat-rear-tray', label: 'Aircraft Seat — Rear Tray Table', labelTh: 'เก้าอี้เครื่องบิน — ด้านหลังและถาดพับ', order: 3 },
  { srcRel: 'seatAirplaneVer2.jpg', project: 'aircraft-cabin-seat', cat: 'renders', slugName: '04-cabin-seat-leather-ver2', label: 'Aircraft Seat — Quilted Leather Ver.2', labelTh: 'เก้าอี้เครื่องบิน — เวอร์ชันเบาะหนัง', order: 4 },
  { srcRel: 'workflowimage/Seat_Airplane.1.png', project: 'aircraft-cabin-seat', cat: 'workflow', slugName: '01-cabin-seat-wireframe', step: 1, stepLabel: 'Matched Wireframe', label: 'Aircraft Seat Topology (Matched Hero Camera)', labelTh: 'โครงสร้างตาข่ายเก้าอี้เครื่องบินมุมตรง', order: 1 },

  // === PRODUCT & SCI-FI PROPS ===
  { srcRel: 'LED_BULB.jpg', project: 'product-scifi-props', cat: 'renders', slugName: '01-hiet-smart-led-bulb', label: 'HiET Commercial Smart LED Bulb', labelTh: 'ภาพผลิตภัณฑ์หลอดไฟ HiET Smart LED', order: 1 },
  { srcRel: 'FreezerScifi.png', project: 'product-scifi-props', cat: 'renders', slugName: '02-scifi-cryo-pod', label: 'Sci-Fi Glass Cryo Pod Capsule', labelTh: 'แคปซูลแช่แข็งไซไฟ', order: 2 },
  { srcRel: 'fuelStationScifi.png', project: 'product-scifi-props', cat: 'renders', slugName: '03-scifi-fuel-dispenser', label: 'Sci-Fi Fuel Pump & Hose Station', labelTh: 'หัวจ่ายเชื้อเพลิงสถานีอวกาศ', order: 3 },
  { srcRel: 'BookCover.png', project: 'product-scifi-props', cat: 'renders', slugName: '04-ancient-spellbook', label: 'Ancient Carved Spellbook Prop', labelTh: 'คัมภีร์เวทมนตร์โบราณ 3D', order: 4 },
  { srcRel: 'Guitar.jpg', project: 'product-scifi-props', cat: 'renders', slugName: '05-rusted-les-paul-body', label: 'Weathered Electric Guitar Body', labelTh: 'บอดี้กีตาร์ไฟฟ้าพื้นผิวสนิม', order: 5 },
  { srcRel: 'skull.jpg', project: 'product-scifi-props', cat: 'renders', slugName: '06-dinosaur-fossil-skeleton', label: 'Theropod Dinosaur Fossil Spine & Skull', labelTh: 'ฟอสซิลกะโหลกและกระดูกสันหลังไดโนเสาร์', order: 6 },
  { srcRel: 'HeadShrak.jpg', project: 'product-scifi-props', cat: 'renders', slugName: '07-great-white-shark-head', label: 'Sculpted Shark Bust Trophy', labelTh: 'งานปั้นหัวฉลาม 3 มิติ', order: 7 },
  { srcRel: 'catAung.jpg', project: 'product-scifi-props', cat: 'renders', slugName: '08-orange-tabby-cat-warm', label: 'Stylized Orange Cat — Warm Floor Glow', labelTh: 'แมวส้มจิ๋ว — แสงพื้นอุ่น', order: 8 },
  { srcRel: 'catAung1.jpg', project: 'product-scifi-props', cat: 'renders', slugName: '09-orange-tabby-cat-front', label: 'Stylized Orange Cat — Neutral Front', labelTh: 'แมวส้มจิ๋ว — มุมหน้าตรง', order: 9 },
  { srcRel: 'catAung2.jpg', project: 'product-scifi-props', cat: 'renders', slugName: '10-orange-tabby-cat-opposite', label: 'Stylized Orange Cat — Right Turn', labelTh: 'แมวส้มจิ๋ว — หันขวา', order: 10 },
  { srcRel: 'catAung3.jpg', project: 'product-scifi-props', cat: 'renders', slugName: '11-orange-tabby-cat-bright', label: 'Stylized Orange Cat — Bright Rim', labelTh: 'แมวส้มจิ๋ว — แสงสว่าง', order: 11 },
  { srcRel: 'catAung4.jpg', project: 'product-scifi-props', cat: 'renders', slugName: '12-orange-tabby-cat-turn', label: 'Stylized Orange Cat — Studio Check', labelTh: 'แมวส้มจิ๋ว — เช็กเท็กซ์เจอร์', order: 12 },
  { srcRel: 'workflowimage/led.png', project: 'product-scifi-props', cat: 'workflow', slugName: '01-led-bulb-wireframe', step: 1, stepLabel: 'Product Wireframe', label: 'HiET LED Bulb Heat-Sink Wireframe', labelTh: 'โครงสร้างตาข่ายหลอดไฟ HiET', order: 1 },
  { srcRel: 'workflowimage/BookCover.png', project: 'product-scifi-props', cat: 'workflow', slugName: '02-spellbook-wireframe', step: 2, stepLabel: 'Prop Wireframe', label: 'Spellbook Matched Wireframe Cage', labelTh: 'โครงสร้างตาข่ายคัมภีร์โบราณ', order: 2 },
  { srcRel: 'workflowimage/Screenshot 2026-06-15 011523.png', project: 'product-scifi-props', cat: 'workflow', slugName: '03-shark-head-wireframe', step: 3, stepLabel: 'Creature Wireframe', label: 'Shark Bust Quad Wireframe', labelTh: 'โครงสร้างตาข่ายหัวฉลาม', order: 3 },

  // === EGYPTIAN SPHINX ISLAND ===
  { srcRel: 'islandEygep.jpg', project: 'egyptian-sphinx-island', cat: 'renders', slugName: '01-egyptian-sphinx-wide', label: 'Egyptian Sphinx Island — Full Overview', labelTh: 'เกาะสฟิงซ์อียิปต์ — มุมกว้าง', order: 1 },
  { srcRel: 'Mummy.jpg', project: 'egyptian-sphinx-island', cat: 'renders', slugName: '02-egyptian-sphinx-avatar-scale', label: 'Sphinx Plaza with Roblox Avatar (src: Mummy.jpg)', labelTh: 'ลานหน้าสฟิงซ์เทียบสเกลตัวละคร (ไฟล์ Mummy.jpg)', order: 2 },
  { srcRel: 'workflowimage/iyepisland.png', project: 'egyptian-sphinx-island', cat: 'workflow', slugName: '01-sphinx-island-wireframe', step: 1, stepLabel: 'World Wireframe', label: 'Maya Island & Sphinx Blue Wireframe', labelTh: 'ภาพ Wireframe เกาะสฟิงซ์มุมตรง', order: 1 },

  // === BATHROOM ISLAND DIORAMA ===
  { srcRel: 'islandtoilet.jpg', project: 'bathroom-island-diorama', cat: 'renders', slugName: '01-bathroom-island-diorama', label: 'Floating Bathroom Island Diorama', labelTh: 'เกาะห้องน้ำลอยฟ้า 3D', order: 1 },
  { srcRel: 'Skibidi.jpg', project: 'bathroom-island-diorama', cat: 'renders', slugName: '02-skibidi-prop-render', label: 'Grungy Porcelain Toilet Character Prop', labelTh: 'พร็อพสุขภัณฑ์สกิบิดี', order: 2 },
  { srcRel: 'Caution.png', project: 'bathroom-island-diorama', cat: 'renders', slugName: '03-wet-floor-caution-sign', label: 'Wet Floor Caution Stand on Water Puddle', labelTh: 'ป้ายเตือนพื้นลื่นพร้อมแอ่งน้ำ', order: 3 },
  { srcRel: 'workflowimage/caution.png', project: 'bathroom-island-diorama', cat: 'workflow', slugName: '01-caution-sign-wireframe', step: 1, stepLabel: 'Prop Wireframe', label: 'Wet Floor Sign Wireframe Cage', labelTh: 'โครงสร้างตาข่ายป้ายเตือนพื้นลื่น', order: 1 },
  { srcRel: 'workflowimage/Screenshot 2026-06-16 233628.png', project: 'bathroom-island-diorama', cat: 'workflow', slugName: '02-bathroom-island-wireframe', step: 2, stepLabel: 'Diorama Wireframe', label: 'Bathroom Island Full Wireframe Mesh', labelTh: 'โครงสร้างตาข่ายฉากเกาะห้องน้ำเต็มฉาก', order: 2 },
  { srcRel: 'workflowimage/image.png', project: 'bathroom-island-diorama', cat: 'workflow', slugName: '03-substance-bathroom-kit-textures', step: 3, stepLabel: 'Substance 3D Texturing', label: 'Substance 3D Painter — Bathroom Props Material Sheet', labelTh: 'หน้าต่างลงสี Substance 3D Painter ชุดห้องน้ำ', order: 3 },

  // === STYLIZED GAME ISLANDS & PROPS ===
  { srcRel: 'islandspace.jpg', project: 'stylized-game-islands', cat: 'renders', slugName: '01-space-rocket-island', label: 'Space Launchpad Floating Island', labelTh: 'เกาะฐานปล่อยจรวดอวกาศ', order: 1 },
  { srcRel: 'islandsea.jpg', project: 'stylized-game-islands', cat: 'renders', slugName: '02-deep-sea-base-island', label: 'Deep-Sea Outpost Island', labelTh: 'เกาะฐานทัพใต้ท้องทะเล', order: 2 },
  { srcRel: 'islandtree.jpg', project: 'stylized-game-islands', cat: 'renders', slugName: '03-dome-sanctuary-island', label: 'Golden Dome Sanctuary Island', labelTh: 'เกาะโดมไม้แห่งธรรมชาติ', order: 3 },
  { srcRel: 'assetseaisland.jpg', project: 'stylized-game-islands', cat: 'renders', slugName: '04-lighthouse-barrel-chest', label: 'Sea Island Prop Kit (Barrel, Chest, Lighthouse)', labelTh: 'พร็อพเกาะทะเล (ถังไม้ หีบ ประภาคาร)', order: 4 },
  { srcRel: 'Tree.png', project: 'stylized-game-islands', cat: 'renders', slugName: '05-stylized-treehouse', label: 'Stylized Treehouse Door Prop', labelTh: 'ต้นไม้บ้านหลังน้อยสไตล์การ์ตูน', order: 5 },
  { srcRel: 'Eggs.png', project: 'stylized-game-islands', cat: 'renders', slugName: '06-trio-elemental-game-eggs', label: 'Sci-Fi, Magma & Rocket Game Eggs', labelTh: 'คอลเลกชันไข่สุ่ม 3 สไตล์ (ไซไฟ / ลาวา / จรวด)', order: 6 },
  { srcRel: 'pet.jpg', project: 'stylized-game-islands', cat: 'renders', slugName: '07-cube-pet-trio-studio', label: 'Stylized Cube Pet Companions (Studio Gray)', labelTh: 'สัตว์เลี้ยงกล่อง 3 ตัว (ฉากเทา)', order: 7 },
  { srcRel: 'pet.png', project: 'stylized-game-islands', cat: 'renders', slugName: '08-cube-pet-trio-sky', label: 'Stylized Cube Pet Companions (Sky Backdrop)', labelTh: 'สัตว์เลี้ยงกล่อง 3 ตัว (ฉากท้องฟ้า)', order: 8 },

  // === STREET COMMERCE BUILDINGS ===
  { srcRel: 'Shop1.jpg', project: 'street-commerce-buildings', cat: 'renders', slugName: '01-two-story-burger-stand', label: 'Two-Story Rooftop Burger Container Shop', labelTh: 'ร้านเบอร์เกอร์คอนเทนเนอร์สองชั้น', order: 1 },
  { srcRel: 'Tomyumman.jpg', project: 'street-commerce-buildings', cat: 'renders', slugName: '02-brick-corner-bar-wide', label: 'Brick Corner Bar Booth (src: Tomyumman.jpg)', labelTh: 'ร้านบาร์อิฐแดงมุมกว้าง (ไฟล์ Tomyumman.jpg)', order: 2 },
  { srcRel: 'Sung.jpg', project: 'street-commerce-buildings', cat: 'renders', slugName: '03-brick-corner-bar-tight', label: 'Brick Corner Bar — Neon Rim Pass (src: Sung.jpg)', labelTh: 'ร้านบาร์อิฐแดงจัดแสงขอบ (ไฟล์ Sung.jpg)', order: 3 },
  { srcRel: 'shoplava.jpg', project: 'street-commerce-buildings', cat: 'renders', slugName: '04-magma-vein-shop-kiosk', label: 'Magma-Vein Fantasy Game Shop', labelTh: 'ร้านค้าลายหินลาวาเรืองแสงในเกม', order: 4 },

  // === POKEMON COLLECTION ===
  { srcRel: 'reshiram_pokemon2.jpg', project: 'pokemon-collection', cat: 'renders', slugName: '01-reshiram-textured-front', label: 'Reshiram — Painted Pearl & Gold Lookdev', labelTh: 'Reshiram — ลงสีพื้นผิวสมบูรณ์', order: 1 },
  { srcRel: 'reshiram_pokemon3.jpg', project: 'pokemon-collection', cat: 'renders', slugName: '02-reshiram-textured-alternate', label: 'Reshiram — Wing Pose Color Pass', labelTh: 'Reshiram — มุมกางปีกสีจริง', order: 2 },
  { srcRel: 'NilePokemon.jpg', project: 'pokemon-collection', cat: 'renders', slugName: '03-ceruledge-cel-outline', label: 'Ceruledge — Stylized Dark Ink Outline', labelTh: 'Ceruledge — สไตล์ตัดเส้นอนิเมะ', order: 3 },
  { srcRel: 'pokemonSky.png', project: 'pokemon-collection', cat: 'renders', slugName: '04-zygarde-cobra-emissive', label: 'Zygarde 50% Serpent — Hex Glow', labelTh: 'Zygarde รูปงูหกเหลี่ยมเรืองแสง', order: 4 },
  { srcRel: 'PokemonMoshi.jpg', project: 'pokemon-collection', cat: 'renders', slugName: '05-meowstic-front-plush', label: 'Meowstic — Studio Front', labelTh: 'Meowstic จิ๋ว — หน้าตรง', order: 5 },
  { srcRel: 'PokemonMoshi_Pers.jpg', project: 'pokemon-collection', cat: 'renders', slugName: '06-meowstic-three-quarter', label: 'Meowstic — Three-Quarter Angle', labelTh: 'Meowstic จิ๋ว — มุม 3/4', order: 6 },
  { srcRel: 'reshiram_pokemon.jpg', project: 'pokemon-collection', cat: 'workflow', slugName: '01-reshiram-clay-sculpt', step: 1, stepLabel: 'High-Poly Clay', label: 'Reshiram — Gray Clay Sculpt Pass (Matched Angle)', labelTh: 'Reshiram — โมเดลปั้นดิน (Clay) มุมตรง', order: 1 },
  { srcRel: 'reshiram_pokemon1.jpg', project: 'pokemon-collection', cat: 'workflow', slugName: '02-reshiram-clay-alternate', step: 2, stepLabel: 'Wing Clay Study', label: 'Reshiram — Gray Clay Wing Silhouette', labelTh: 'Reshiram — เช็กทรงปีกขั้นปั้นดิน', order: 2 },

  // === STYLIZED CHARACTER SHOWCASE (CHIBI / LEGO / UGC) ===
  { srcRel: 'Chibi_BlueLock.jpg', project: 'stylized-character-showcase', cat: 'renders', slugName: '01-nagi-bluelock-chibi-front', label: 'Nagi Seishiro #7 Chibi (Blue Lock)', labelTh: 'นางิ เซชิโร่ #7 จิ๋ว (Blue Lock)', order: 1 },
  { srcRel: 'Chibi_BlueLock1.jpg', project: 'stylized-character-showcase', cat: 'renders', slugName: '02-nagi-bluelock-chibi-back', label: 'Nagi #7 Chibi — Hair & Jersey Rear', labelTh: 'นางิ #7 จิ๋ว — ด้านหลังเสื้อ', order: 2 },
  { srcRel: 'Kaiwa.jpg', project: 'stylized-character-showcase', cat: 'renders', slugName: '03-kaiwa-green-coat-chibi', label: 'Kaiwa Chibi — Front Lookdev', labelTh: 'ไควะ จิ๋ว — ชุดโค้ทเขียว', order: 3 },
  { srcRel: 'Kaiwa1.jpg', project: 'stylized-character-showcase', cat: 'renders', slugName: '04-kaiwa-chibi-side', label: 'Kaiwa Chibi — Rear/Angle View', labelTh: 'ไควะ จิ๋ว — มุมด้านหลัง', order: 4 },
  { srcRel: 'LeonChibiPers.jpg', project: 'stylized-character-showcase', cat: 'renders', slugName: '05-leon-kennedy-rpd-chibi', label: 'Leon S. Kennedy Chibi (R.P.D. Armor)', labelTh: 'ลีออน เอส เคนเนดี จิ๋ว (ชุดเกราะ R.P.D.)', order: 5 },
  { srcRel: 'LeonChibiPers1.jpg', project: 'stylized-character-showcase', cat: 'renders', slugName: '06-leon-kennedy-chibi-back', label: 'Leon Chibi — Holster & Gear Rear', labelTh: 'ลีออน จิ๋ว — ด้านหลังอุปกรณ์', order: 6 },
  { srcRel: 'Mona.jpg', project: 'stylized-character-showcase', cat: 'renders', slugName: '07-mona-beret-chibi-angle', label: 'Mona Beret Chibi — Three-Quarter', labelTh: 'โมนา จิ๋วหมวกเบเร่ต์ — มุม 3/4', order: 7 },
  { srcRel: 'Mona2.jpg', project: 'stylized-character-showcase', cat: 'renders', slugName: '08-mona-beret-chibi-front', label: 'Mona Beret Chibi — Front T-Pose', labelTh: 'โมนา จิ๋ว — หน้าตรง', order: 8 },
  { srcRel: 'backguy.jpg', project: 'stylized-character-showcase', cat: 'renders', slugName: '09-blue-hoodie-stylized-boy', label: 'Blue Hoodie Graphic Anime Character', labelTh: 'ตัวละครเด็กหนุ่มเสื้อฮู้ดสีฟ้า', order: 9 },
  { srcRel: 'WomenSamurai.jpg', project: 'stylized-character-showcase', cat: 'renders', slugName: '10-female-samurai-kimono', label: 'Dark Kimono Female Samurai Character', labelTh: 'ตัวละครซามูไรหญิงชุดกิโมโนดำ', order: 10 },
  { srcRel: 'Chibaka.jpg', project: 'stylized-character-showcase', cat: 'renders', slugName: '11-chewbacca-plush-chibi', label: 'Stylized Chewbacca Chibi Bandolier', labelTh: 'ชิวแบคคาจิ๋วสไตล์การ์ตูน', order: 11 },
  { srcRel: 'legoChatacterball.jpg', project: 'stylized-character-showcase', cat: 'renders', slugName: '12-lego-dark-trooper-render', label: 'Lego Dark Trooper Scratched Armor', labelTh: 'เลโก้ Dark Trooper เกราะรอยขีดข่วน', order: 12 },
  { srcRel: 'LegoMoshi.jpg', project: 'stylized-character-showcase', cat: 'renders', slugName: '13-lego-robin-front', label: 'Lego Robin Minifigure — Front', labelTh: 'เลโก้โรบิน — ด้านหน้า', order: 13 },
  { srcRel: 'LegoMoshi1.jpg', project: 'stylized-character-showcase', cat: 'renders', slugName: '14-lego-robin-angle', label: 'Lego Robin Minifigure — Cape Profile', labelTh: 'เลโก้โรบิน — มุมข้างผ้าคลุม', order: 14 },
  { srcRel: 'Screenshot 2026-01-18 234839.png', project: 'stylized-character-showcase', cat: 'renders', slugName: '15-roblox-bandaged-mummy', label: 'Bandaged Roblox Mummy Avatar (src: Screenshot 01-18)', labelTh: 'อวาตาร์มัมมี่พันผ้าดิบ Roblox', order: 15 },
  { srcRel: 'workflowimage/Chibi_bluelock.0.gif', project: 'stylized-character-showcase', cat: 'workflow', slugName: '01-nagi-wireframe-turntable-gif', step: 1, stepLabel: 'Wireframe Turnaround GIF', label: 'Maya Wireframe Turntable GIF — Nagi #7 Chibi', labelTh: 'GIF หมุนโชว์ Wireframe นางิ Blue Lock', isGif: true, order: 1 },
  { srcRel: 'workflowimage/Kaiwa.0.gif', project: 'stylized-character-showcase', cat: 'workflow', slugName: '02-kaiwa-wireframe-turntable-gif', step: 2, stepLabel: 'Wireframe Turnaround GIF', label: 'Maya Wireframe Turntable GIF — Kaiwa Chibi', labelTh: 'GIF หมุนโชว์ Wireframe ไควะ', isGif: true, order: 2 },
  { srcRel: 'legoChatacterball1.png', project: 'stylized-character-showcase', cat: 'workflow', slugName: '03-lego-dark-trooper-arnold-hud', step: 3, stepLabel: 'Arnold Lookdev HUD', label: 'Maya Arnold Viewport — 230,648 Tris Dark Trooper', labelTh: 'หน้าต่าง Arnold Viewport เลโก้ 230,648 Tris', order: 3 },
  { srcRel: 'l.png', project: 'stylized-character-showcase', cat: 'workflow', slugName: '04-lego-dark-trooper-rear-viewport', step: 4, stepLabel: 'Back Armor HUD', label: 'Maya Arnold Rear Check (230,648 Tris)', labelTh: 'ตรวจรายละเอียดด้านหลังเลโก้ใน Maya', order: 4 },

  // === ROBLOX PROP PACK ===
  { srcRel: 'Desert.jpg', project: 'roblox-prop-pack', cat: 'renders', slugName: '01-prop-pack-group-lineup', label: 'Roblox Stylized Prop Pack Lineup (src: Desert.jpg)', labelTh: 'รวมแพ็กไอเท็ม Roblox ครบชุด', order: 1 },
  { srcRel: 'Sung1.jpg', project: 'roblox-prop-pack', cat: 'renders', slugName: '02-red-crate-blocky-mech', label: 'Red Crate Blocky Mech (src: Sung1.jpg)', labelTh: 'หุ่นกล่องเหล็กสีแดงจากแพ็กไอเท็ม', order: 2 },
  { srcRel: 'Gun.jpg', project: 'roblox-prop-pack', cat: 'renders', slugName: '03-camo-desert-eagle', label: 'Forest Camo Desert Eagle Prop', labelTh: 'ปืน Desert Eagle ลายพรางป่า', order: 3 },
  { srcRel: 'Boat.jpg', project: 'roblox-prop-pack', cat: 'renders', slugName: '04-wooden-rowboat', label: 'Hand-Textured Wooden Rowboat', labelTh: 'เรือพายไม้ลายเพนต์มือ', order: 4 },
  { srcRel: 'hat.jpg', project: 'roblox-prop-pack', cat: 'renders', slugName: '05-terrazzo-bucket-hat', label: 'Terrazzo Crimson Bucket Hat', labelTh: 'หมวกบักเก็ตสีแดงลายหินขัด', order: 5 },
  { srcRel: 'Hatcloth.jpg', project: 'roblox-prop-pack', cat: 'renders', slugName: '06-toothless-dragon-hood', label: 'Toothless Dragon Plush Hat', labelTh: 'หมวกมังกร Toothless', order: 6 },
  { srcRel: 'Helmat.jpg', project: 'roblox-prop-pack', cat: 'renders', slugName: '07-red-racing-helmet', label: 'Metallic Red Racing Helmet', labelTh: 'หมวกกันน็อกสีแดงเมทัลลิก', order: 7 },
  { srcRel: 'สร้อย.jpg', project: 'roblox-prop-pack', cat: 'renders', slugName: '08-gold-link-chain-necklace', label: 'Chunky Gold Chain Necklace', labelTh: 'สร้อยโซ่ทองสไตล์สตรีท', order: 8 },

  // === STYLIZED SLIME STACK ===
  { srcRel: 'Slam.jpg', project: 'stylized-slime-stack', cat: 'renders', slugName: '01-slime-stack-hero', label: 'Three-Tier Stylized Slime Stack', labelTh: 'สไลม์สามสียืนซ้อนชั้น', order: 1 },
  { srcRel: 'Slam1.jpg', project: 'stylized-slime-stack', cat: 'renders', slugName: '02-slime-stack-three-quarter', label: 'Slime Stack — Side & Highlight View', labelTh: 'สไลม์ซ้อนชั้น — มุมข้างไฮไลต์ผิว', order: 2 },
  { srcRel: 'workflowimage/Slam.png', project: 'stylized-slime-stack', cat: 'workflow', slugName: '01-slime-stack-wireframe', step: 1, stepLabel: 'Matched Quad Wireframe', label: 'Slime Stack Maya Quad Wireframe Topology', labelTh: 'โครงสร้างตาข่ายสี่เหลี่ยมสไลม์มุมตรง', order: 1 },

  // === SAILBOAT OCEAN PROTOTYPE ===
  { srcRel: 'labroom_vedio/Recording 2026-09-18 224812.mp4', project: 'sailboat-ocean-prototype', cat: 'animations', slugName: 'sailboat-ocean-navigation-reel', label: 'Sailboat Prototype — Open Ocean Sailing (115s)', labelTh: 'ต้นแบบเกมแล่นเรือใบกลางทะเลลึก (115 วินาที)', motionGroup: 'vehicles-prototypes', order: 3 },
  { srcRel: 'labroom_vedio/Recording 2026-09-18 225155.mp4', project: 'sailboat-ocean-prototype', cat: 'animations', slugName: 'sailboat-dusk-wave-test', label: 'Sailboat Prototype — Dusk Waves Test (32s)', labelTh: 'ต้นแบบเรือใบทดสอบแสงค่ำ (32 วินาที)', motionGroup: 'vehicles-prototypes', order: 4 },

  // === WORKFLOW SCULPT & RIG STUDIES ===
  { srcRel: 'face.jpg', project: 'character-sculpt-rigging-studies', cat: 'workflow', slugName: '01-gray-clay-head-sculpt', step: 1, stepLabel: 'Clay Anatomy Blocking', label: 'ZBrush / Maya Gray Clay Stylized Head Blockout', labelTh: 'งานฝึกปั้นใบหน้าดินเทา (Clay Anatomy)', order: 1 },
  { srcRel: 'labroom_vedio/Walk_Anima.mp4', project: 'character-sculpt-rigging-studies', cat: 'animations', slugName: 'bipedal-mannequin-walk-cycle', label: 'Maya Mannequin Rig — Walk Cycle Exercise (10,224 Tris)', labelTh: 'แบบฝึกหัดแอนิเมชันท่าเดินหุ่นริก Maya (10,224 Tris)', motionGroup: 'vehicles-prototypes', order: 6 }
];

// Explicit Confirmed Exact-Byte Duplicates & Raw Render-Farm Sequences to Skip
const CONFIRMED_SKIP_RULES = [
  { srcRel: '67120501057_pers.png', reason: 'Exact MD5 byte duplicate of pers.png (397,576 B)' },
  { srcRel: 'workflowimage/Chibi_bluelock.-1.gif', reason: 'Exact MD5 byte duplicate of Chibi_bluelock.0.gif (539,678 B)' },
  { srcRel: 'workflowimage/Versy650.1.jpg', reason: 'Exact MD5 byte duplicate of Versy650.0.jpg (668,206 B)' }
];

const FRAME_SEQ_DIRS = new Set([
  'labroom_vedio/AungChibi',
  'labroom_vedio/FinalAnima',
  'labroom_vedio/FinalAnima/New folder',
  'labroom_vedio/LED_BULB',
  'labroom_vedio/Submarine'
]);

// Explicitly Documented Ambiguous / Unplayable / Giant Files -> Placed in `unsorted` Report (NEVER guessed or bloated)
const KNOWN_UNSORTED = new Map([
  ['labroom_vedio/Recording 2026-07-04 015623.mp4', { category: 'unsorted-oversized', note: '1,860.89 MB raw 51-minute desktop screen recording (1918x930). Too large for web auto-load; trim to a highlights speed-sculpt if needed.' }],
  ['labroom_vedio/WorkFlow_Gojo.mp4', { category: 'unsorted-oversized', note: '1,096.55 MB raw 24-minute Maya skin-weight painting recording of Gojo_Rig.mb (toji-fushiguro). Speed up 20x for web showcase.' }],
  ['labroom_vedio/AungChibi/Brand_Anima_1.[0001-0300].mp4', { category: 'unsorted-wip-pass', note: 'Earlier 720p grey-stage pass superseded by 1080p orange studio Brand_Anima_1.[0001-0300]_2.mp4.' }],
  ['labroom_vedio/AungChibi/Brand_Anima_1.[0001-0300]_1.mp4', { category: 'unsorted-wip-pass', note: 'Earlier 1080p grey-stage pass superseded by orange studio Brand_Anima_1.[0001-0300]_2.mp4.' }],
  ['labroom_vedio/Women_Walk.avi', { category: 'needs-transcode-avi', note: '747.5 MB uncompressed .avi (matches agent-jean holding handgun). Browsers do not play .avi natively — convert with ffmpeg.' }],
  ['labroom_vedio/Submarine.avi', { category: 'needs-transcode-avi', note: '1,779.8 MB legacy .avi wireframe turntable (playable .mp4 versions already included under graffiti-submarine).' }],
  ['labroom_vedio/FurryAttck.avi', { category: 'needs-transcode-avi', note: '129.5 MB legacy .avi (playable H.264 Attck.mp4 already included under furry-guardian).' }],
  ['labroom_vedio/FurryIdle.avi', { category: 'needs-transcode-avi', note: '154.9 MB legacy .avi (playable H.264 Idle.mp4 already included under furry-guardian).' }],
  ['labroom_vedio/FurryIWalk.avi', { category: 'needs-transcode-avi', note: '256.5 MB legacy .avi (playable H.264 walk.mp4 already included under furry-guardian).' }],
  ['labroom_vedio/FinalAnima/Gracia.avi', { category: 'needs-transcode-avi', note: '3,268.9 MB raw .avi boxing rig test (2 stylized boxers). Needs ffmpeg H.264 transcode to showcase.' }],
  ['labroom_vedio/FinalAnima/Playbash.avi', { category: 'needs-transcode-avi', note: '4,096.0 MB raw .avi playblast test (no preview frame decoded by OS). Needs ffmpeg H.264 transcode.' }],
  ['labroom_vedio/Body3Idle.avi', { category: 'needs-transcode-avi', note: '186.3 MB .avi stitched blue/white plush idle study (2,396 tris). Needs ffmpeg H.264 transcode.' }],
  ['labroom_vedio/Moshi_WalkAnima.avi', { category: 'needs-transcode-avi', note: '267.0 MB .avi stitched blue/white plush walk cycle (same character as Body3Idle). Needs ffmpeg H.264 transcode.' }],
  ['labroom_vedio/ArmSwing.avi', { category: 'needs-transcode-avi', note: '356.0 MB .avi Maya arm pendulum arc exercise. Needs ffmpeg H.264 transcode.' }],
  ['labroom_vedio/BallMovementAnima.avi', { category: 'needs-transcode-avi', note: '194.5 MB .avi Maya ball weight & bounce study 01 (25,096 tris). Needs ffmpeg H.264 transcode.' }],
  ['labroom_vedio/BallMovementAnima2.avi', { category: 'needs-transcode-avi', note: '182.7 MB .avi Maya ball bowling/soccer weight study 02. Needs ffmpeg H.264 transcode.' }],
  ['labroom_vedio/PendulumAnima.avi', { category: 'needs-transcode-avi', note: '302.6 MB .avi Maya dual pendulum overlap exercise. Needs ffmpeg H.264 transcode.' }],
  ['labroom_vedio/PendulumAnima.zip', { category: 'non-media-archive', note: '2.39 MB .zip Maya scene archive (not an image or video).' }]
]);

// ---------------------------------------------------------------------------
// 3. EXACT BEFORE/AFTER COMPARISON SLIDER PAIRS (Matched Cameras)
// ---------------------------------------------------------------------------
const BEFORE_AFTER_SPECS = [
  { id: 'ba-submarine', project: 'graffiti-submarine', title: 'Graffiti Submarine', titleTh: 'เรือดำน้ำกราฟฟิตี้', beforeRel: 'workflowimage/Submarine_Workflow.png', afterRel: 'Submarine.png', beforeLabel: 'Split Wireframe', afterLabel: 'Final Lookdev' },
  { id: 'ba-golem', project: 'stone-crystal-golem', title: 'Crystal Stone Golem', titleTh: 'โกเลมหินผลึก', beforeRel: 'workflowimage/golem.png', afterRel: 'Golem.png', beforeLabel: 'Low-Poly Wireframe', afterLabel: 'Clay Sculpt' },
  { id: 'ba-zh2', project: 'motorcycle-series', title: 'Kawasaki ZH2 Supernaked', titleTh: 'Kawasaki ZH2', beforeRel: 'Zh2.jpg', afterRel: 'Zh2Color.jpg', beforeLabel: 'Gray Clay Model', afterLabel: 'Painted Metallic' },
  { id: 'ba-versys', project: 'motorcycle-series', title: 'Kawasaki Versys 650', titleTh: 'Kawasaki Versys 650', beforeRel: 'workflowimage/Versy650.0.jpg', afterRel: 'Versy650.jpg', beforeLabel: 'Cage Wireframe', afterLabel: 'Final Render' },
  { id: 'ba-flail', project: 'chibi-crusader-knight', title: 'Spiked Morning-Star Flail', titleTh: 'กระบองลูกตุ้มหนาม', beforeRel: 'workflowimage/Bump2.png', afterRel: 'workflowimage/Bump.png', beforeLabel: 'Wireframe Mesh', afterLabel: 'Rusted Iron PBR' },
  { id: 'ba-axe-side', project: 'combat-weapons-arsenal', title: 'Tactical Hatchet (Side)', titleTh: 'ขวานยุทธวิธี (ด้านข้าง)', beforeRel: 'workflowimage/Axe.1.png', afterRel: 'Axe.jpg', beforeLabel: 'Maya Wireframe', afterLabel: 'PBR Texture' },
  { id: 'ba-axe-iso', project: 'combat-weapons-arsenal', title: 'Tactical Hatchet (Clay Pass)', titleTh: 'ขวานยุทธวิธี (แสง Clay)', beforeRel: 'workflowimage/Axe.-1.png', afterRel: 'Axe_1.jpg', beforeLabel: 'Arnold Clay', afterLabel: 'Final Render' },
  { id: 'ba-karambit', project: 'combat-weapons-arsenal', title: 'Karambit Knife', titleTh: 'มีดสั้น Karambit', beforeRel: 'workflowimage/Karambit.png', afterRel: 'Karambit.png', beforeLabel: 'Wireframe', afterLabel: 'Final Steel PBR' },
  { id: 'ba-shield', project: 'combat-weapons-arsenal', title: 'Crusader Kite Shield', titleTh: 'โล่เหล็กอัศวิน', beforeRel: 'workflowimage/Sheid.png', afterRel: 'Shied.png', beforeLabel: 'Quad Topology', afterLabel: 'Battle-Worn Iron' },
  { id: 'ba-flintlock', project: 'combat-weapons-arsenal', title: 'Engraved Flintlock Pistol', titleTh: 'ปืนคาบศิลาโบราณ', beforeRel: 'OldGun.0.png', afterRel: 'OldGun.jpg', beforeLabel: 'Maya HUD 11.4K Tris', afterLabel: 'Studio Render' },
  { id: 'ba-horror-lab', project: 'horror-operating-lab', title: 'Abandoned Operating Theater', titleTh: 'ห้องผ่าตัดสยองขวัญ', beforeRel: 'workflowimage/Labidiacamp.png', afterRel: 'Labdocter.jpg', beforeLabel: 'Maya Wireframe 95K', afterLabel: 'Dark Horror Lit' },
  { id: 'ba-sphinx', project: 'egyptian-sphinx-island', title: 'Egyptian Sphinx Island', titleTh: 'เกาะสฟิงซ์อียิปต์', beforeRel: 'workflowimage/iyepisland.png', afterRel: 'islandEygep.jpg', beforeLabel: 'World Wireframe', afterLabel: 'Sandstone Render' },
  { id: 'ba-caution', project: 'bathroom-island-diorama', title: 'Wet Floor Caution Sign', titleTh: 'ป้ายระวังพื้นลื่น', beforeRel: 'workflowimage/caution.png', afterRel: 'Caution.png', beforeLabel: 'Wireframe Cage', afterLabel: 'Textured + Water' },
  { id: 'ba-seat', project: 'aircraft-cabin-seat', title: 'Commercial Aircraft Seat', titleTh: 'เก้าอี้เครื่องบินโดยสาร', beforeRel: 'workflowimage/Seat_Airplane.1.png', afterRel: 'seatAirplane.jpg', beforeLabel: 'Quad Topology', afterLabel: 'Leather Shader' },
  { id: 'ba-bulb', project: 'product-scifi-props', title: 'HiET Smart LED Bulb', titleTh: 'หลอดไฟ HiET Smart LED', beforeRel: 'workflowimage/led.png', afterRel: 'LED_BULB.jpg', beforeLabel: 'Wireframe', afterLabel: 'Commercial Lit' },
  { id: 'ba-book', project: 'product-scifi-props', title: 'Ancient Spellbook', titleTh: 'คัมภีร์เวทมนตร์โบราณ', beforeRel: 'workflowimage/BookCover.png', afterRel: 'BookCover.png', beforeLabel: 'Topology', afterLabel: 'PBR Finish' },
  { id: 'ba-reshiram', project: 'pokemon-collection', title: 'Reshiram — Clay vs Color', titleTh: 'Reshiram ปั้นดิน vs สีจริง', beforeRel: 'reshiram_pokemon.jpg', afterRel: 'reshiram_pokemon2.jpg', beforeLabel: 'Gray Clay Sculpt', afterLabel: 'Painted Lookdev' },
  { id: 'ba-sephiroth', project: 'sephiroth-chibi', title: 'Sephiroth Chibi', titleTh: 'เซฟิรอธ จิ๋ว', beforeRel: 'workflowimage/Sephirod.png', afterRel: 'Sephirod.jpg', beforeLabel: 'Wireframe Cage', afterLabel: 'Beauty Render' },
  { id: 'ba-slime', project: 'stylized-slime-stack', title: 'Stylized Slime Stack', titleTh: 'สไลม์สามชั้น', beforeRel: 'workflowimage/Slam.png', afterRel: 'Slam.jpg', beforeLabel: 'Maya Wireframe', afterLabel: 'Glossy Lookdev' }
];

// Motion Section Clean Sub-Groups
const MOTION_GROUPS_META = [
  { id: 'golem-combat', title: 'Crystal Stone Golem — Combat Cycles', titleTh: 'โกเลมหินผลึก — แอนิเมชันต่อสู้และเดิน (5 คลิป)', accent: '#1FD0E8', desc: 'Complete low-poly Maya gameplay loop set for real-time engines.' },
  { id: 'hooded-hunter', title: 'Hooded Hunter — Unity Locomotion State Machine', titleTh: 'ฮันเตอร์สวมฮู้ด — ชุดท่าเคลื่อนไหวลงเกม Unity (6 คลิป)', accent: '#FF8A1F', desc: 'AdvancedSkeleton gameplay locomotion set (Idle, Walk, Run, Jump, Ready Stance).' },
  { id: 'furry-guardian', title: 'Furry Guardian — Rig Cycles & Mobile Prototype', titleTh: 'การ์เดียนขนฟู — แอนิเมชัน 4 ขา และเกมเพลย์มือถือ (4 คลิป)', accent: '#FFD21F', desc: 'NURBS quadruped animation cycles plus live mobile combat capture.' },
  { id: 'chibi-cutscenes', title: 'Chibi Cinematics — Cloud Strife & Crusader Knight', titleTh: 'คัตซีนแอนิเมชันตัวละครจิ๋ว — คลาวด์ และ อัศวินครูเสด (5 คลิป)', accent: '#FF1FA2', desc: 'Stylized rendered shorts combining dynamic weapon props and boss encounters.' },
  { id: 'vehicles-prototypes', title: 'Turntables, Sailboat Game & Rigging Studies', titleTh: 'เทิร์นเทเบิลยานพาหนะ เกมเรือใบ และทดสอบริก (6 คลิป)', accent: '#1FD0E8', desc: 'Graffiti submarine 360 turnarounds, dusk ocean sailing prototype, and rig exercises.' }
];

// ---------------------------------------------------------------------------
// 4. UTILITIES
// ---------------------------------------------------------------------------
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function parseMp4Buffer(buf) {
  let durationSec = null, width = null, height = null;
  function scan(start, end) {
    let offset = start;
    while (offset + 8 <= end) {
      let size = buf.readUInt32BE(offset);
      const type = buf.toString('ascii', offset + 4, offset + 8);
      let header = 8;
      if (size === 1) {
        if (offset + 16 > end) break;
        size = buf.readUInt32BE(offset + 8) * 4294967296 + buf.readUInt32BE(offset + 12);
        header = 16;
      } else if (size === 0) size = end - offset;
      if (size < header || offset + size > end) break;
      if (type === 'mvhd') {
        const v = buf[offset + header];
        if (v === 0 && offset + header + 20 <= offset + size) {
          const ts = buf.readUInt32BE(offset + header + 12);
          const dur = buf.readUInt32BE(offset + header + 16);
          if (ts > 0) durationSec = +(dur / ts).toFixed(2);
        } else if (v === 1 && offset + header + 32 <= offset + size) {
          const ts = buf.readUInt32BE(offset + header + 20);
          const dur = buf.readUInt32BE(offset + header + 24) * 4294967296 + buf.readUInt32BE(offset + header + 28);
          if (ts > 0) durationSec = +(dur / ts).toFixed(2);
        }
      } else if (type === 'tkhd') {
        const v = buf[offset + header];
        const wOff = v === 1 ? offset + header + 88 : offset + header + 76;
        if (wOff + 8 <= offset + size) {
          const w = buf.readUInt32BE(wOff) / 65536;
          const h = buf.readUInt32BE(wOff + 4) / 65536;
          if (w > 0 && h > 0 && (!width || w > width)) { width = Math.round(w); height = Math.round(h); }
        }
      } else if (['moov', 'trak', 'mdia'].includes(type)) scan(offset + header, offset + size);
      offset += size;
    }
  }
  scan(0, buf.length);
  return { durationSec, width, height };
}

function walkSourceFiles(dir, all = [], skippedFrames = {}) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(SRC_ROOT, full).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      walkSourceFiles(full, all, skippedFrames);
    } else {
      const parentRel = path.dirname(rel).replace(/\\/g, '/');
      if (FRAME_SEQ_DIRS.has(parentRel) && /\.png$/i.test(entry.name)) {
        skippedFrames[parentRel] = (skippedFrames[parentRel] || 0) + 1;
        continue;
      }
      all.push({ rel, full, ext: path.extname(entry.name).toLowerCase(), size: fs.statSync(full).size });
    }
  }
  return { all, skippedFrames };
}

// ---------------------------------------------------------------------------
// 5. MAIN EXECUTION
// ---------------------------------------------------------------------------
function run() {
  console.log('=== STREET WALL ASSET ORGANIZER ===');
  if (!fs.existsSync(SRC_ROOT)) {
    throw new Error(`Source folder missing: ${SRC_ROOT}`);
  }

  // Clean previous /public/assets so obsolete names never remain
  if (fs.existsSync(OUT_PUBLIC)) {
    fs.rmSync(OUT_PUBLIC, { recursive: true, force: true });
  }
  ensureDir(OUT_PUBLIC);
  ensureDir(OUT_DATA_DIR);

  const manifestMap = new Map(VERIFIED_MANIFEST.map(m => [m.srcRel, m]));
  const skipSet = new Map(CONFIRMED_SKIP_RULES.map(s => [s.srcRel, s.reason]));

  const { all: sourceFiles, skippedFrames } = walkSourceFiles(SRC_ROOT);
  const unsorted = [];
  const skippedDuplicates = [...CONFIRMED_SKIP_RULES];

  // Record frame sequence dirs in skipped list
  for (const [dirRel, count] of Object.entries(skippedFrames)) {
    skippedDuplicates.push({
      srcRel: `${dirRel}/*.png (${count} PNG frames)`,
      reason: `Raw per-frame render sequence already assembled into .mp4 video`
    });
  }

  // Track copied asset lookup by srcRel for before/after resolution
  const assetBySrcRel = new Map();
  const psJobs = [];

  // Initialize runtime project containers
  const projectRecords = new Map();
  for (const p of PROJECTS) {
    projectRecords.set(p.slug, {
      ...p,
      cover: null,
      renders: [],
      workflow: [],
      beforeAfter: [],
      animations: []
    });
  }

  // Process every non-frame source file safely
  for (const file of sourceFiles) {
    if (skipSet.has(file.rel)) continue;

    if (KNOWN_UNSORTED.has(file.rel)) {
      const info = KNOWN_UNSORTED.get(file.rel);
      unsorted.push({
        originalFile: file.rel,
        sizeMB: +(file.size / (1024 * 1024)).toFixed(2),
        status: info.category,
        note: info.note
      });
      continue;
    }

    const entry = manifestMap.get(file.rel);
    if (!entry) {
      // Ambiguous or newly added unmapped file -> NEVER GUESS (put in unsorted!)
      unsorted.push({
        originalFile: file.rel,
        sizeMB: +(file.size / (1024 * 1024)).toFixed(2),
        status: 'unclassified-new-file',
        note: 'Added file or ambiguous filename not yet visually verified. Confirm project & category.'
      });
      continue;
    }

    const proj = projectRecords.get(entry.project);
    const outExt = entry.ext || file.ext;
    const targetDir = path.join(OUT_PUBLIC, entry.cat, entry.project);
    const thumbDir = path.join(targetDir, 'thumbs');
    ensureDir(targetDir);
    ensureDir(thumbDir);

    const outFileName = `${entry.slugName}${outExt}`;
    const dstPath = path.join(targetDir, outFileName);
    const relWebSrc = `./public/assets/${entry.cat}/${entry.project}/${outFileName}`;

    // READ-ONLY Copy from source -> public/assets
    fs.copyFileSync(file.full, dstPath);

    if (entry.cat === 'renders' || entry.cat === 'workflow') {
      const thumbFileName = `${entry.slugName}-thumb.jpg`;
      const thumbPath = path.join(thumbDir, thumbFileName);
      const relWebThumb = `./public/assets/${entry.cat}/${entry.project}/thumbs/${thumbFileName}`;

      if (entry.isGif) {
        const posterFileName = `${entry.slugName}-poster.jpg`;
        const posterPath = path.join(thumbDir, posterFileName);
        psJobs.push({ id: file.rel, kind: 'videoPoster', src: dstPath, posterOut: posterPath, thumbOut: thumbPath });
      } else {
        psJobs.push({ id: file.rel, kind: 'image', src: dstPath, thumbOut: thumbPath });
      }

      const item = {
        id: `${entry.project}-${entry.cat}-${entry.slugName}`,
        order: entry.order || 99,
        label: entry.label,
        labelTh: entry.labelTh,
        originalFile: file.rel,
        src: relWebSrc,
        thumb: relWebThumb,
        lqip: '',
        width: 1920,
        height: 1080,
        sizeKB: +(file.size / 1024).toFixed(1),
        alt: `${proj.title} — ${entry.label}`
      };

      if (entry.cat === 'workflow') {
        item.step = entry.step || 1;
        item.stepLabel = entry.stepLabel || 'Workflow Breakdown';
        item.isGif = !!entry.isGif;
        proj.workflow.push(item);
      } else {
        proj.renders.push(item);
      }
      assetBySrcRel.set(file.rel, item);
    } else if (entry.cat === 'animations') {
      const posterFileName = `${entry.slugName}-poster.jpg`;
      const posterPath = path.join(thumbDir, posterFileName);
      const relWebPoster = `./public/assets/animations/${entry.project}/thumbs/${posterFileName}`;
      const thumbPath = path.join(thumbDir, `${entry.slugName}-thumb.jpg`);
      const relWebThumb = `./public/assets/animations/${entry.project}/thumbs/${entry.slugName}-thumb.jpg`;

      const mp4Meta = parseMp4Buffer(fs.readFileSync(dstPath));
      psJobs.push({ id: file.rel, kind: 'videoPoster', src: dstPath, posterOut: posterPath, thumbOut: thumbPath });

      const animItem = {
        id: `${entry.project}-anim-${entry.slugName}`,
        order: entry.order || 99,
        project: entry.project,
        projectTitle: proj.title,
        projectTitleTh: proj.titleTh,
        group: entry.motionGroup || 'vehicles-prototypes',
        label: entry.label,
        labelTh: entry.labelTh,
        originalFile: file.rel,
        src: relWebSrc,
        poster: relWebPoster,
        thumb: relWebThumb,
        posterLqip: '',
        durationSec: mp4Meta.durationSec || 0,
        width: mp4Meta.width || 1920,
        height: mp4Meta.height || 1080,
        sizeMB: +(file.size / (1024 * 1024)).toFixed(2),
        alt: `${proj.title} animation — ${entry.label}`
      };
      proj.animations.push(animItem);
      assetBySrcRel.set(file.rel, animItem);
    }
  }

  // Batch run PowerShell image + poster + LQIP processor
  const jobsFile = path.join(OUT_DATA_DIR, '_ps_media_jobs.json');
  fs.writeFileSync(jobsFile, JSON.stringify(psJobs, null, 2), 'utf8');
  console.log(`Processing ${psJobs.length} images & video posters for dimensions, 800px thumbs, and LQIP...`);

  execFileSync('powershell', ['-NoProfile', '-STA', '-ExecutionPolicy', 'Bypass', '-File', HELPER_PS1, '-JobsJsonPath', jobsFile], {
    stdio: 'inherit'
  });

  const outJobsRaw = fs.readFileSync(jobsFile + '.out.json', 'utf8').replace(/^\uFEFF/, '');
  const psResults = new Map(JSON.parse(outJobsRaw).map(r => [r.id, r]));

  // Clean up temporary job files from /data/
  fs.unlinkSync(jobsFile);
  fs.unlinkSync(jobsFile + '.out.json');

  // Hydrate exact dimensions + LQIP into asset records
  for (const [rel, item] of assetBySrcRel.entries()) {
    const res = psResults.get(rel);
    if (!res || !res.ok) continue;
    if (res.width > 0 && res.height > 0 && !item.durationSec) {
      item.width = res.width;
      item.height = res.height;
    }
    if (item.durationSec !== undefined) {
      item.posterLqip = res.lqip || '';
    } else {
      item.lqip = res.lqip || '';
    }
  }

  // Sort items and assign cover for each project
  const finalProjects = [];
  for (const proj of projectRecords.values()) {
    proj.renders.sort((a, b) => a.order - b.order);
    proj.workflow.sort((a, b) => (a.step - b.step) || (a.order - b.order));
    proj.animations.sort((a, b) => a.order - b.order);

    const coverCandidate = proj.renders[0] || proj.workflow[0] || null;
    if (coverCandidate) {
      proj.cover = {
        src: coverCandidate.src,
        thumb: coverCandidate.thumb,
        lqip: coverCandidate.lqip || '',
        width: coverCandidate.width,
        height: coverCandidate.height,
        alt: coverCandidate.alt
      };
    } else if (proj.animations[0]) {
      const a0 = proj.animations[0];
      proj.cover = {
        src: a0.poster,
        thumb: a0.thumb,
        lqip: a0.posterLqip || '',
        width: a0.width,
        height: a0.height,
        alt: a0.alt
      };
    }
    finalProjects.push(proj);
  }

  // Wire up exact-angle Before / After Sliders
  const beforeAfterPairs = [];
  for (const spec of BEFORE_AFTER_SPECS) {
    const beforeAsset = assetBySrcRel.get(spec.beforeRel);
    const afterAsset = assetBySrcRel.get(spec.afterRel);
    if (!beforeAsset || !afterAsset) {
      console.warn(`WARN missing before/after ref: ${spec.id}`);
      continue;
    }
    const pairObj = {
      id: spec.id,
      project: spec.project,
      title: spec.title,
      titleTh: spec.titleTh,
      beforeLabel: spec.beforeLabel,
      afterLabel: spec.afterLabel,
      beforeSrc: beforeAsset.src,
      beforeThumb: beforeAsset.thumb,
      beforeLqip: beforeAsset.lqip,
      afterSrc: afterAsset.src,
      afterThumb: afterAsset.thumb,
      afterLqip: afterAsset.lqip,
      width: afterAsset.width,
      height: afterAsset.height
    };
    beforeAfterPairs.push(pairObj);
    const pr = projectRecords.get(spec.project);
    if (pr) pr.beforeAfter.push(pairObj);
  }

  // Group animations into clean separated MOTION section groups
  const allAnimations = finalProjects.flatMap(p => p.animations);
  const motionGroups = MOTION_GROUPS_META.map(g => ({
    ...g,
    clips: allAnimations.filter(a => a.group === g.id).sort((a, b) => a.order - b.order)
  }));

  const allRenders = finalProjects.flatMap(p => p.renders.map(r => ({
    ...r,
    project: p.slug,
    projectTitle: p.title,
    projectTitleTh: p.titleTh,
    category: p.category,
    accent: p.accent,
    software: p.software
  })));

  const allWorkflow = finalProjects.flatMap(p => p.workflow.map(w => ({
    ...w,
    project: p.slug,
    projectTitle: p.title,
    projectTitleTh: p.titleTh,
    accent: p.accent,
    software: p.software
  })));

  const report = {
    generatedAt: new Date().toISOString(),
    artist: 'Patanawan Jarunongkran (Ball Patanawan)',
    concept: 'STREET WALL',
    sourceSafety: 'Read-only copy performed. Zero files modified/deleted inside WorkingModelmage/.',
    counts: {
      projects: finalProjects.length,
      renders: allRenders.length,
      workflow: allWorkflow.length,
      beforeAfterSliders: beforeAfterPairs.length,
      animations: allAnimations.length,
      motionGroups: motionGroups.length,
      unsortedItems: unsorted.length,
      skippedDuplicateFiles: CONFIRMED_SKIP_RULES.length,
      skippedFrameDumpPngs: Object.values(skippedFrames).reduce((a, b) => a + b, 0)
    },
    skippedDuplicates,
    unsorted
  };

  const payload = {
    meta: {
      artist: 'Patanawan Jarunongkran',
      alias: 'Ball Patanawan',
      nameTh: 'ปฐณวรรณ จารุนงคราญ',
      school: 'B.Sc. Media Technology (Game Dev), SoA+D KMUTT',
      schoolTh: 'วท.บ. มีเดียเทคโนโลยี (การพัฒนาเกม) มจธ. (KMUTT)',
      email: 'Ballyuyio@gmail.com',
      phone: '096-782-2469',
      artstation: 'https://www.artstation.com/ball_patanawan',
      concept: 'STREET WALL',
      note: 'WebP re-encoding requires optional sharp/cwebp CLI (not installed on stock Windows .NET); clean source formats + 800px optimized JPEG thumbs + base64 LQIP + H.264 MP4 posters generated.'
    },
    projects: finalProjects,
    rendersFeed: allRenders,
    workflowFeed: allWorkflow,
    beforeAfterPairs,
    motionGroups,
    unsorted,
    report
  };

  // Write JSON + non-module global JS bundle (works on file:/// double-click AND HTTP)
  const jsonPath = path.join(OUT_DATA_DIR, 'projects.json');
  const jsPath = path.join(OUT_DATA_DIR, 'projects.js');
  const reportPath = path.join(OUT_DATA_DIR, 'asset-report.json');

  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
  fs.writeFileSync(jsPath, `/* Auto-generated by scripts/organize-assets.js */\nwindow.PORTFOLIO_DATA = ${JSON.stringify(payload)};\n`, 'utf8');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n=== ORGANIZATION COMPLETE ===');
  console.log(JSON.stringify(report.counts, null, 2));
}

run();
