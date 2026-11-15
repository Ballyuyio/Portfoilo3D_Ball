# รายงานการสำรวจและคัดกรองรูปภาพพอร์ตโฟลิโอ (CLEANUP_REPORT)

> **สถานะ:** ขั้นที่ 2 — จัดทำตารางสรุปเสนอผู้ใช้เพื่อพิจารณาอนุมัติ (ยังไม่มีการลบ เคลื่อนย้าย หรือแก้ไขโค้ดใด ๆ ทั้งสิ้น)

## 1. ภาพรวมการสำรวจ (Executive Summary)

จากการสแกนรูปภาพทั้งหมด **232 รายการ** (194 ไฟล์รูปบนดิสก์) ผ่านการคำนวณ Hash (SHA-256), Perceptual Hash (pHash / dHash สำหรับหามุมกล้องที่คล้ายคลึงกัน), Laplacian Variance (คะแนนความคมชัด), และ Mean Brightness (ระดับความสว่าง 0-255) ควบคู่กับการเปิดตรวจสอบรูปภาพด้วยสายตาทีละรูป พบว่ามีรูปภาพจำนวนหนึ่งที่เป็น:
1. **รูปภาพมืดสนิท / ดำล้วน / WIP Pass ที่ไม่มีแสง:** เช่น pass ทดสอบแสงแรก หรือโมเดลขนาดเล็กจมอยู่กลางความมืดมิด
2. **รูปภาพซ้ำซ้อนเชิงมุมกล้อง (Redundant Lighting Iterations):** โมเดลเดิม มุมกล้องเดิม แต่เซฟแยกเป็น 3-4 รูปเพียงเพราะเปลี่ยนแสงเล็กน้อย
3. **รูปภาพคุณภาพต่ำ / ไม่สมบูรณ์:** เช่น ชิ้นส่วนกระดูกไดโนเสาร์ลอยเคว้ง, หัวฉลามตัดครึ่ง, หรืองานที่มีม (Skibidi) ที่ลดทอนภาพลักษณ์ความเป็นมืออาชีพของศิลปิน 3D
4. **รูปภาพเดี่ยวที่ซ้ำซ้อนกับรูปภาพรวม (Prop Pack Lineup):** ชิ้นพร็อพเล็ก ๆ ที่โชว์รวมอยู่ในภาพหลักอย่างครบถ้วนแล้ว

## 2. สรุปการเปลี่ยนแปลงตัวเลขสถิติบนเว็บไซต์ (Before & After Stats)

| หมวดหมู่บนเว็บไซต์ | ปัจจุบัน (Current) | คาดการณ์หลังดำเนินการ (Proposed) | การเปลี่ยนแปลง (Diff) | หมายเหตุ |
| :--- | :---: | :---: | :---: | :--- |
| **Final Beauty Renders** | 140 รูป | **119 รูป** (หรือ 105 รูปหากตัดกลุ่มตัดสินใจ) | -21 รูป | คัดเฉพาะช็อตสวยที่สุดของแต่ละโปรเจกต์ |
| **Wire vs Beauty Sliders** | 19 อัน | **19 อัน** | 0 (คงเดิม 100%) | ตรวจสอบแล้ว ไม่มี Slider ใดได้รับผลกระทบ |
| **Workflow Breakdowns** | 54 รูป | **53 รูป** | -1 รูป | ตัด Wireframe หัวฉลามที่สอดคล้องกับรูปเรนเดอร์ |
| **Motion Clips (.mp4)** | 26 คลิป | **26 คลิป** | 0 (ไม่แตะต้อง) | เป็นไปตามกฎข้อบังคับ ห้ามแตะต้องไฟล์วิดีโอ |
| **Project Dossiers** | 30 โปรเจกต์ | **30 โปรเจกต์** | 0 (คงเดิม 100%) | ทุกโปรเจกต์ยังมี Hero Shot อย่างน้อย 1 รูปเสมอ |

## 3. ตารางรายละเอียดรูปภาพที่ผ่านการตรวจสอบและข้อเสนอแนะ

| ไฟล์ | โปรเจกต์ | ประเภท (ซ้ำ/คุณภาพต่ำ) | เหตุผลสั้น ๆ | ซ้ำกับไฟล์ไหน | ความมั่นใจ (สูง/กลาง/ต่ำ) | แนะนำ (ลบ/เก็บ/ให้ผู้ใช้ตัดสิน) |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| `public/assets/renders/cloud-strife-chibi/08-cloud-studio-pass-01.jpg` | Cloud Strife — Buster Sword Chibi | คุณภาพต่ำ (WIP / มืดสนิท) | มืดสนิท (brightness 13.7/255) เป็นเพียง pass ทดสอบแสงแรกที่ไม่มีแสงส่องตัวละคร ไม่เห็นรายละเอียดโมเดล | - | สูง | **ลบ** |
| `public/assets/renders/cloud-strife-chibi/09-cloud-studio-pass-02.jpg` | Cloud Strife — Buster Sword Chibi | ซ้ำ (ภาพซ้ำเชิงมุมมอง/แสง) | มุมกล้องและท่าทาง 3D เดียวกับ 10 และ 11 ต่างแค่แสงม่วง เป็น lighting iteration ซ้ำซ้อน | `public/assets/renders/cloud-strife-chibi/11-cloud-studio-pass-04.jpg` | สูง | **ลบ** |
| `public/assets/renders/cloud-strife-chibi/10-cloud-studio-pass-03.jpg` | Cloud Strife — Buster Sword Chibi | ซ้ำ (ภาพซ้ำเชิงมุมมอง/แสง) | มุมกล้องและท่าทางเดียวกับ 11 ต่างแค่ยังไม่เปิด glow สีเขียวที่ดาบ Buster Sword | `public/assets/renders/cloud-strife-chibi/11-cloud-studio-pass-04.jpg` | สูง | **ลบ** |
| `public/assets/renders/cloud-strife-chibi/11-cloud-studio-pass-04.jpg` | Cloud Strife — Buster Sword Chibi | ซ้ำ (ตัวแทนชุดสตูดิโอ) | เวอร์ชันสมบูรณ์ที่สุดของชุด Studio: ดาบ Buster Sword มี Mako Green Glow และขอบผมมี Pink Rim Light ชัดเจน | `08, 09, 10 ในโฟลเดอร์เดียวกัน` | สูง | **เก็บ** |
| `public/assets/renders/motorcycle-series/02-kawasaki-zh2-front.jpg` | Kawasaki Z H2 Supercharged Streetfighter | คุณภาพต่ำ (มืดสนิท 98% ดำล้วน) | ความสว่างเฉลี่ย 2.4/255 เฟรมภาพกว่า 98% เป็นความมืดสนิท เห็นเพียงเส้นไฟหน้าเล็ก ๆ 2 ขีด ไม่เห็นโครงรถมอเตอร์ไซค์ | - | สูง | **ลบ** |
| `public/assets/renders/motorcycle-series/01-kawasaki-zh2-painted.jpg` | Kawasaki Z H2 Supercharged Streetfighter | คุณภาพ (ผูกกับ Before/After Slider) | ภาพค่อนข้างมืด แต่ถูกผูกเป็นฝั่ง After ของ Before/After Slider (ba-zh2) คู่กับ wireframe หากลบจะกระทบ Slider | - | สูง | **เก็บ** |
| `public/assets/renders/cozy-gamer-bedroom/03-gamer-bedroom-wip-pass.jpg` | Cozy Midnight Gamer Bedroom | คุณภาพต่ำ (WIP Pass / มืดสนิท) | ภาพเรนเดอร์ขนาด 2048x2048 แต่อยู่ในพื้นที่ว่างสีดำ 80% และเป็น pass ทดสอบเทาล้วนไม่มีแสง (brightness 4.9, sharpness 43.8) | - | สูง | **ลบ** |
| `public/assets/renders/cozy-gamer-bedroom/04-gamer-bedroom-night-led.jpg` | Cozy Midnight Gamer Bedroom | ซ้ำ (มุมกล้องเดียวกับ 01 แต่บรรยากาศแบน) | มุมกล้อง isometric เดียวกันกับ 01 ลอยอยู่กลางขอบดำ 80% แสงเป็นกลางวันเรียบ ๆ ไม่เด่นเท่า 01 (LED mood) และ 02 (Close-up 1080p) | `public/assets/renders/cozy-gamer-bedroom/01-gamer-bedroom-final.jpg` | กลาง | **ให้ผู้ใช้ตัดสิน** |
| `public/assets/renders/pokemon-collection/05-meowstic-front-plush.jpg` | Legendary & Battle Pokemon Roster | คุณภาพต่ำ (ความละเอียดต่ำ / มืดสนิท) | ขนาด 960x540 (24 KB) โมเดลขนาดเล็กจมอยู่กลางความมืด (brightness 4.2/255) คุณภาพผิวพลาสติกแข็ง ไม่ถึงเกณฑ์ Final Beauty | `public/assets/renders/pokemon-collection/06-meowstic-three-quarter.jpg` | สูง | **ลบ** |
| `public/assets/renders/pokemon-collection/06-meowstic-three-quarter.jpg` | Legendary & Battle Pokemon Roster | คุณภาพต่ำ (ความละเอียดต่ำ / มืดสนิท / ซ้ำ) | ขนาด 960x540 (23 KB) โมเดลเดิมในมุมเอียงเล็กน้อย จมอยู่กลางฉากดำสนิท (brightness 3.1/255) | `public/assets/renders/pokemon-collection/05-meowstic-front-plush.jpg` | สูง | **ลบ** |
| `public/assets/renders/pokemon-collection/02-reshiram-textured-alternate.jpg` | Legendary & Battle Pokemon Roster | ซ้ำ (ภาพซ้ำเชิงมุมมอง) | มุม T-pose ของโมเดล Reshiram เกือบซ้ำกับ 01-reshiram-textured-front.jpg แค่หันหัวเล็กน้อย แต่ 01 คมชัดและขนาดไฟล์สมบูรณ์กว่า | `public/assets/renders/pokemon-collection/01-reshiram-textured-front.jpg` | สูง | **ลบ** |
| `public/assets/renders/bathroom-island-diorama/02-skibidi-prop-render.jpg` | Stylized Restroom Island Diorama | คุณภาพต่ำ (Meme Asset / ลดทอนความเป็นมืออาชีพ) | ขนาด 960x540 เป็นโมเดลมีมชักโครกหัวคน (Skibidi) พร้อมก้อนอุจจาระ ลดทอนภาพลักษณ์ความเป็น 3D Artist มืออาชีพของพอร์ตโดยรวมอย่างมาก | - | สูง | **ลบ** |
| `public/assets/renders/bathroom-island-diorama/03-wet-floor-caution-sign.png` | Stylized Restroom Island Diorama | คุณภาพ (ผูกกับ Before/After Slider) | ป้ายเตือนพื้นเปียก ผูกกับ Before/After Slider (ba-caution) คู่กับไฟล์ wireframe ใน workflow | - | สูง | **เก็บ** |
| `public/assets/renders/toji-fushiguro/06-toji-chibi-edition.jpg` | Toji Fushiguro — Anatomy & Gear Sculpt | คุณภาพต่ำ (โมเดลหยาบ / ผิดคอนเซ็ปต์โปรเจกต์) | โมเดล Chibi สัดส่วนบิดเบี้ยว ยืน T-pose กลางพื้นเทา ขัดแย้งกับภาพ 01-05 ที่เป็นงาน High-poly Anatomy & Muscle Sculpt ระดับสมจริง | - | สูง | **ลบ** |
| `public/assets/renders/toji-fushiguro/05-toji-three-quarter.jpg` | Toji Fushiguro — Anatomy & Gear Sculpt | ซ้ำ (มุมมอง T-pose กึ่งซ้ำ) | ท่ายืน T-pose กึ่งเอียงบนพื้นเทา คล้ายคลึงกับ 01-toji-hero-front.jpg มาก | `public/assets/renders/toji-fushiguro/01-toji-hero-front.jpg` | กลาง | **ให้ผู้ใช้ตัดสิน** |
| `public/assets/renders/character-wich/02-wich-three-quarter.jpg` | Stylized Witch / Sorceress Character | ซ้ำ (ภาพซ้ำเชิงมุมมอง) | ท่ายืนมุมตรงมุมเดียวกับ 04 (pDist 4) ต่างเพียงการปรับแสงเล็กน้อย | `public/assets/renders/character-wich/04-wich-rear-skirt.jpg` | สูง | **ลบ** |
| `public/assets/renders/character-wich/03-wich-side-hair.jpg` | Stylized Witch / Sorceress Character | ซ้ำ (ภาพซ้ำเชิงมุมมอง) | ท่ายืนมุมตรงเดิมซ้ำซ้อนกับ 02 และ 04 | `public/assets/renders/character-wich/04-wich-rear-skirt.jpg` | สูง | **ลบ** |
| `public/assets/renders/character-wich/04-wich-rear-skirt.jpg` | Stylized Witch / Sorceress Character | ซ้ำ (ตัวแทนชุดท่ายืนตรง) | เวอร์ชันจัดแสงสมบูรณ์ที่สุด มี Yellow Rim Light ตัดกับชุดสีม่วงโดดเด่น | `02, 03 ในโฟลเดอร์เดียวกัน` | สูง | **เก็บ** |
| `public/assets/renders/character-mint/01-mint-chibi-hero.jpg` | Mint — Chibi Anime Character | ซ้ำ / คุณภาพต่ำ (Crop ซ้ำความละเอียดต่ำ) | ขนาด 960x540 เป็นภาพครอปซ้ำของ 02-mint-front-rigged.jpg ซึ่งเป็นไฟล์ Full HD 1920x1080 คมชัดกว่า | `public/assets/renders/character-mint/02-mint-front-rigged.jpg` | สูง | **ลบ** |
| `public/assets/renders/character-mint/05-mint-studio-alt.jpg` | Mint — Chibi Anime Character | ซ้ำ (ท่ายืนและมุมกล้องกึ่งซ้ำ) | ท่ายืนตรงมุมเดียวกับ 02-mint-front-rigged.jpg ต่างเพียงโทนแสงสตูดิโอเล็กน้อย | `public/assets/renders/character-mint/02-mint-front-rigged.jpg` | กลาง | **ให้ผู้ใช้ตัดสิน** |
| `public/assets/renders/character-jin/01-jin-horror-portrait.jpg` | Jin — Stylized Fighter Character | คุณภาพต่ำ / ซ้ำ (ความละเอียด 960x540) | โมเดล T-pose บนพื้นชมพู texture ค่อนข้างหยาบ ท่าทางซ้ำกับ 02 และ 03 (แต่ห้ามลบหมดทุกรูปเพราะโปรเจกต์จะว่าง) | `public/assets/renders/character-jin/03-jin-turnaround-view.jpg` | กลาง | **ให้ผู้ใช้ตัดสิน** |
| `public/assets/renders/character-jin/02-jin-three-quarter.jpg` | Jin — Stylized Fighter Character | คุณภาพต่ำ / ซ้ำ (ความละเอียด 960x540) | ขนาด 960x540 ท่าทางกึ่งเอียงเล็กน้อยบนพื้นชมพู ซ้ำซ้อนกับ 03-jin-turnaround-view.jpg | `public/assets/renders/character-jin/03-jin-turnaround-view.jpg` | กลาง | **ให้ผู้ใช้ตัดสิน** |
| `public/assets/renders/product-scifi-props/06-dinosaur-fossil-skeleton.jpg` | Sci-Fi Props, Laboratory & Animal Studies | คุณภาพต่ำ (WIP ไม่สมบูรณ์) | กระดูกสันหลังและกะโหลกไดโนเสาร์ลอยอยู่กลางอากาศ ไม่มีขาหรือลำตัว ดูเป็นงานแบบฝึกหัดที่ยังทำไม่เสร็จ | - | สูง | **ลบ** |
| `public/assets/renders/product-scifi-props/07-great-white-shark-head.jpg` | Sci-Fi Props, Laboratory & Animal Studies | คุณภาพต่ำ (960x540 / mesh ไม่สมบูรณ์) | ขนาด 960x540 หัวฉลามขาดลอยกลางพื้นเทา ผิวเบลอและ mesh ดูไม่เสร็จสมบูรณ์ | - | สูง | **ลบ** |
| `public/assets/workflow/product-scifi-props/03-shark-head-wireframe.png` | Sci-Fi Props, Laboratory & Animal Studies | คุณภาพต่ำ (Wireframe ของ asset ที่ถูกเสนอตัด) | เป็น Wireframe ของหัวฉลาม 07 หากตัดรูปเรนเดอร์ 07 ออก ควรตัด wireframe ชิ้นนี้ออกจาก Workflow ด้วยเพื่อไม่ให้ตกค้าง | `public/assets/renders/product-scifi-props/07-great-white-shark-head.jpg` | สูง | **ลบ** |
| `public/assets/renders/product-scifi-props/11-orange-tabby-cat-bright.jpg` | Sci-Fi Props, Laboratory & Animal Studies | ซ้ำ (มุมกล้องเดียวกับ 12 แต่แสงแตก/noise) | มุมมองเดียวกับ 12-orange-tabby-cat-turn.jpg (pDist 4) แต่แสงจ้าเกินไป มี noise และไฮไลต์แตก | `public/assets/renders/product-scifi-props/12-orange-tabby-cat-turn.jpg` | สูง | **ลบ** |
| `public/assets/renders/product-scifi-props/12-orange-tabby-cat-turn.jpg` | Sci-Fi Props, Laboratory & Animal Studies | ซ้ำ (ตัวแทนโมเดลแมวส้ม) | แสงเงาสมดุล ไม่มีไฮไลต์แตก คมชัดระดับ 1080p | `11-orange-tabby-cat-bright.jpg` | สูง | **เก็บ** |
| `public/assets/renders/stylized-character-showcase/04-kaiwa-chibi-side.jpg` | Stylized Character Showcase Collection | ซ้ำ (มุมกล้องกึ่งซ้ำ) | ขนาด 960x540 ท่ายืน T-pose เสื้อเขียว มุมกล้องกึ่งซ้ำกับ 03-kaiwa-green-coat-chibi.jpg (pDist 4) | `public/assets/renders/stylized-character-showcase/03-kaiwa-green-coat-chibi.jpg` | สูง | **ลบ** |
| `public/assets/renders/stylized-character-showcase/13-lego-robin-front.jpg` | Stylized Character Showcase Collection | ซ้ำ / คุณภาพต่ำ (มุมตรงมีเส้นขอบกวนสายตา) | มุมตรงทื่อ ๆ และมีเส้นขอบสีเหลืองติดมุมภาพ ขณะที่ 14-lego-robin-angle.jpg จัดมุม 3/4 ได้มีมิติและสวยงามกว่า | `public/assets/renders/stylized-character-showcase/14-lego-robin-angle.jpg` | สูง | **ลบ** |
| `public/assets/renders/stylized-character-showcase/09-blue-hoodie-stylized-boy.jpg` | Stylized Character Showcase Collection | คุณภาพ (T-pose ธรรมดา) | ท่ายืน T-pose พื้นเทา เป็นงานพื้นฐานสไตล์ stylized | - | ต่ำ | **ให้ผู้ใช้ตัดสิน** |
| `public/assets/renders/stylized-character-showcase/10-female-samurai-kimono.jpg` | Stylized Character Showcase Collection | คุณภาพ (T-pose ธรรมดา) | ท่ายืนตรงชุดกิโมโนซามูไรหญิงบนพื้นเทา | - | ต่ำ | **ให้ผู้ใช้ตัดสิน** |
| `public/assets/renders/stylized-game-islands/08-cube-pet-trio-sky.png` | Sci-Fi & Fantasy Game Islands Collection | ซ้ำ / คุณภาพต่ำ (โมเดลเดียวกับ 07 แสงจ้า/มี artifact) | โมเดลและตำแหน่งเดียวกับ 07 เป๊ะ แต่เปลี่ยนฉากหลังท้องฟ้า แสงสว่างจ้าเกินไป และมีเส้นขอบสีแดงติดขอบบนขวา | `public/assets/renders/stylized-game-islands/07-cube-pet-trio-studio.jpg` | สูง | **ลบ** |
| `public/assets/renders/stylized-game-islands/04-lighthouse-barrel-chest.jpg` | Sci-Fi & Fantasy Game Islands Collection | คุณภาพต่ำ (ความละเอียด 960x540 / โมเดลง่าย) | ขนาด 960x540 (33 KB) โมเดลประภาคาร ถังไม้ และหีบ บนพื้นเทาแบบเรียบง่ายมาก | - | กลาง | **ให้ผู้ใช้ตัดสิน** |
| `public/assets/renders/stylized-game-islands/05-stylized-treehouse.png` | Sci-Fi & Fantasy Game Islands Collection | คุณภาพต่ำ (ความละเอียด 678x619) | โมเดลต้นไม้บ้านเดี่ยวขนาด 678x619 ตัดฉากหลัง | - | ต่ำ | **ให้ผู้ใช้ตัดสิน** |
| `public/assets/renders/roblox-prop-pack/08-gold-link-chain-necklace.jpg` | Roblox / Stylized Wearable & Weapon Pack | คุณภาพต่ำ (ว่างเปล่า / 24 KB) | ขนาด 960x540 (24 KB) เป็นสร้อยทองเส้นเล็ก ๆ ห่วงเดียวลอยกลางพื้นที่ว่างสีเทากว่า 95% ของภาพ และมีปรากฏรวมอยู่ในภาพ 01 อยู่แล้ว | `public/assets/renders/roblox-prop-pack/01-prop-pack-group-lineup.jpg` | สูง | **ลบ** |
| `public/assets/renders/roblox-prop-pack/03-camo-desert-eagle.jpg` | Roblox / Stylized Wearable & Weapon Pack | ซ้ำซ้อนกับภาพรวม Lineup 01 | ชิ้นพร็อพปืนพกลายพราง โชว์เดี่ยว 960x540 โดยในภาพ 01 มีโชว์อยู่แล้ว | `public/assets/renders/roblox-prop-pack/01-prop-pack-group-lineup.jpg` | กลาง | **ให้ผู้ใช้ตัดสิน** |
| `public/assets/renders/roblox-prop-pack/04-wooden-rowboat.jpg` | Roblox / Stylized Wearable & Weapon Pack | ซ้ำซ้อนกับภาพรวม Lineup 01 | เรือไม้ โชว์เดี่ยว 960x540 โดยในภาพ 01 มีโชว์อยู่แล้ว | `public/assets/renders/roblox-prop-pack/01-prop-pack-group-lineup.jpg` | กลาง | **ให้ผู้ใช้ตัดสิน** |
| `public/assets/renders/roblox-prop-pack/05-terrazzo-bucket-hat.jpg` | Roblox / Stylized Wearable & Weapon Pack | ซ้ำซ้อนกับภาพรวม Lineup 01 | หมวกบักเก็ต โชว์เดี่ยว 960x540 โดยในภาพ 01 มีโชว์อยู่แล้ว | `public/assets/renders/roblox-prop-pack/01-prop-pack-group-lineup.jpg` | กลาง | **ให้ผู้ใช้ตัดสิน** |
| `public/assets/renders/roblox-prop-pack/06-toothless-dragon-hood.jpg` | Roblox / Stylized Wearable & Weapon Pack | ซ้ำซ้อนกับภาพรวม Lineup 01 | ฮู้ดมังกร Toothless โชว์เดี่ยว 960x540 โดยในภาพ 01 มีโชว์อยู่แล้ว | `public/assets/renders/roblox-prop-pack/01-prop-pack-group-lineup.jpg` | กลาง | **ให้ผู้ใช้ตัดสิน** |
| `public/assets/renders/roblox-prop-pack/07-red-racing-helmet.jpg` | Roblox / Stylized Wearable & Weapon Pack | ซ้ำซ้อนกับภาพรวม Lineup 01 | หมวกกันน็อกสีแดง โชว์เดี่ยว 960x540 โดยในภาพ 01 มีโชว์อยู่แล้ว | `public/assets/renders/roblox-prop-pack/01-prop-pack-group-lineup.jpg` | กลาง | **ให้ผู้ใช้ตัดสิน** |
| `public/assets/renders/street-commerce-buildings/04-magma-vein-shop-kiosk.jpg` | Street Burger Stand, Brick Bar & Lava Shop | คุณภาพต่ำ (ความละเอียด 960x540 / โมเดลหยาบ) | ขนาด 960x540 ซุ้มขายของลายลาวาแบบง่าย ลอยกลางพื้นเทา อ่อนกว่าชิ้น Burger Stand และ Brick Bar ในโปรเจกต์เดียวกันมาก | - | สูง | **ลบ** |
| `public/assets/renders/minimal-bedroom/01-minimal-bedroom-hero.jpg` | Minimalist Modern Bedroom | คุณภาพ (พื้นที่ขอบดำ 75%) | ห้องขนาดเล็กอยู่กลางขอบดำ 2048x2048 แต่เป็นภาพเรนเดอร์ชิ้นเดียวของโปรเจกต์นี้ ห้ามลบเด็ดขาดมิฉะนั้นโปรเจกต์จะเหลือ 0 รูป แนะนำเก็บไว้ (หรือวางแผน Crop ขอบดำในอนาคต) | - | สูง | **เก็บ** |
| `public/assets/renders/chibi-crusader-knight/02-spiked-flail-beauty.png` | Chibi Crusader Knight & Heavy Armament | ตรวจพบความคล้ายกับไฟล์ Wireframe ใน Workflow | เป็นคู่ภาพ Beauty กับ Wireframe สำหรับ Before/After Slider (ba-flail) | `public/assets/workflow/chibi-crusader-knight/01-flail-wireframe.png` | สูง | **เก็บ** |
| `public/assets/renders/combat-weapons-arsenal/07-crusader-kite-shield.png` | Medieval & Fantasy Combat Arsenal | ตรวจพบความคล้ายกับไฟล์ Wireframe ใน Workflow | เป็นคู่ภาพ Beauty กับ Wireframe สำหรับ Before/After Slider (ba-shield) | `public/assets/workflow/combat-weapons-arsenal/02-shield-wireframe.png` | สูง | **เก็บ** |
| `public/assets/renders/horror-operating-lab/04-dark-mood-alternate.jpg` | Abandoned Operating Theater | แสงโทนสลัวตาม Mood & Tone | ความละเอียด 1920x1080 คมชัดสูง (sharpness 473.5) เป็นงานเรนเดอร์ห้องผ่าตัดแนวสยองขวัญที่จัดแสงแบบ Low-key จงใจให้มืดเพื่อสร้างอารมณ์สยองขวัญ ไม่ใช่ภาพเสีย | - | สูง | **เก็บ** |
| `public/assets/workflow/asian-heritage-architecture/01-korean-courtyard-split-wireframe.png` | Asian Heritage Courtyard & Pagoda | ความละเอียดแนวกว้าง (Panorama Wireframe) | ขนาด 1106x473 เป็นรูปภาพเปรียบเทียบแบ่งครึ่ง Wireframe vs Render ความคมชัดสูงมาก (sharpness 2189.5) | - | สูง | **เก็บ** |

## 4. สรุปรายละเอียดกลุ่มรูปภาพที่ซ้ำซ้อน (Duplicate Sets & Keepers)

สำหรับชุดรูปภาพที่มีหลายเวอร์ชัน ได้คัดเลือก **"ตัวที่ควรเก็บ"** ซึ่งเป็นเวอร์ชันที่มีความละเอียดสูงสุด แสงสมบูรณ์ที่สุด และองค์ประกอบภาพดีที่สุดไว้ดังนี้:

1. **Cloud Strife Chibi (Studio Passes):**
   - ❌ **เสนอตัดออก:** `08-cloud-studio-pass-01.jpg` (มืดสนิท), `09-cloud-studio-pass-02.jpg` (แสงม่วงดิบ), `10-cloud-studio-pass-03.jpg` (ยังไม่เปิดดาบเรืองแสง)
   - ✅ **ตัวที่ควรเก็บ:** `11-cloud-studio-pass-04.jpg` (ดาบเรืองแสงเขียว Mako + ขอบผมมี Pink Rim Light สวยงามที่สุด)

2. **Stylized Witch / Sorceress (ท่ายืนตรง):**
   - ❌ **เสนอตัดออก:** `02-wich-three-quarter.jpg`, `03-wich-side-hair.jpg` (มุมกล้องเดียวกัน แสงยังไม่สมบูรณ์)
   - ✅ **ตัวที่ควรเก็บ:** `04-wich-rear-skirt.jpg` (จัดแสง Rim Light สีทองตัดกับชุดแม่มดสีม่วงสวยงามที่สุด)

3. **Mint Chibi Anime:**
   - ❌ **เสนอตัดออก:** `01-mint-chibi-hero.jpg` (ขนาด 960x540 เป็นภาพครอปซ้ำความละเอียดต่ำ)
   - ✅ **ตัวที่ควรเก็บ:** `02-mint-front-rigged.jpg` (ขนาด Full HD 1920x1080 คมชัดเต็มตัว)
   - ❓ **ให้ผู้ใช้ตัดสิน:** `05-mint-studio-alt.jpg` (มุมมองคล้าย 02 แต่เป็นแสงสตูดิโออีกแบบ)

4. **Legendary Pokemon (Reshiram):**
   - ❌ **เสนอตัดออก:** `02-reshiram-textured-alternate.jpg` (ท่ายืน T-pose กึ่งซ้ำ)
   - ✅ **ตัวที่ควรเก็บ:** `01-reshiram-textured-front.jpg` (คมชัดกว่าและขนาดไฟล์สมบูรณ์กว่า)

5. **Sci-Fi Props (Orange Tabby Cat):**
   - ❌ **เสนอตัดออก:** `11-orange-tabby-cat-bright.jpg` (มุมเดียวกับ 12 แต่แสงจ้าเกินไป ไฮไลต์แตกและมี noise)
   - ✅ **ตัวที่ควรเก็บ:** `12-orange-tabby-cat-turn.jpg` (แสงเงานุ่มนวล คมชัด ไม่มี noise)

6. **Stylized Game Islands (Cube Pet Trio):**
   - ❌ **เสนอตัดออก:** `08-cube-pet-trio-sky.png` (โมเดลเดียวกับ 07 เป๊ะ แต่แสงจ้าเกินไปและมีเส้นขอบสีแดงติดมุมภาพ)
   - ✅ **ตัวที่ควรเก็บ:** `07-cube-pet-trio-studio.jpg` (จัดแสง Studio Gray คมชัดและสะอาดตา)

7. **Stylized Characters (Lego Robin & Kaiwa Chibi):**
   - ❌ **เสนอตัดออก:** `13-lego-robin-front.jpg` (มุมตรงทื่อ มีเส้นขอบเหลืองติดขอบภาพ), `04-kaiwa-chibi-side.jpg` (T-pose กึ่งซ้ำกับ 03)
   - ✅ **ตัวที่ควรเก็บ:** `14-lego-robin-angle.jpg` (มุม 3/4 สวยงามมีมิติ), `03-kaiwa-green-coat-chibi.jpg` (คมชัดสมบูรณ์)

8. **Roblox Prop Pack:**
   - ❌ **เสนอตัดออก:** `08-gold-link-chain-necklace.jpg` (สร้อยทองเส้นเล็ก 24 KB จมในพื้นที่ว่างสีเทากว่า 95%)
   - ✅ **ตัวที่ควรเก็บ:** `01-prop-pack-group-lineup.jpg` (รวมพร็อพทุกชิ้นไว้ในภาพเดียวอย่างสวยงาม)
   - ❓ **ให้ผู้ใช้ตัดสิน:** `03`, `04`, `05`, `06`, `07` (พร็อพแยกเดี่ยว 960x540 เลือกว่าจะเก็บไว้โชว์แยกชิ้น หรือแสดงเฉพาะรูปหลัก 01 เพื่อความกระชับ)

## 5. ตรวจสอบความปลอดภัย (Safety & Integrity Checks)

- [x] **ไม่มีโปรเจกต์ไหนที่รูปเหลือ 0:** ตรวจสอบแล้วทั้ง 30 โปรเจกต์ ทุกโปรเจกต์ที่มีภาพ Render ยังคงมีภาพเรนเดอร์อย่างน้อย 1-13 รูปเสมอ
- [x] **ไม่กระทบ Before/After Slider:** ตรวจสอบ Slider ทั้ง 19 ตัวแล้ว คู่ภาพเช่น `ba-zh2`, `ba-caution`, `ba-flail`, `ba-shield` ได้รับการรักษาไว้ครบถ้วน 100%
- [x] **ไม่แตะต้อง Motion Clips:** ไฟล์วิดีโออนิเมชัน 26 คลิปใน `public/assets/animations/` ไม่มีการแก้ไขหรือแตะต้องใด ๆ
- [x] **ยังไม่มีการลบไฟล์:** ทุกไฟล์ยังคงอยู่ในตำแหน่งเดิมบนดิสก์ จะดำเนินการย้ายไฟล์ไปยังโฟลเดอร์ `_removed/` ในขั้นที่ 3 เฉพาะเมื่อได้รับอนุมัติจากผู้ใช้เท่านั้น
