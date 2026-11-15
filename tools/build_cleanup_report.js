const fs = require('fs');

const candidates = [
  // 1. cloud-strife-chibi
  {
    file: 'public/assets/renders/cloud-strife-chibi/08-cloud-studio-pass-01.jpg',
    project: 'Cloud Strife — Buster Sword Chibi',
    slug: 'cloud-strife-chibi',
    category: 'renders',
    type: 'คุณภาพต่ำ (WIP / มืดสนิท)',
    reason: 'มืดสนิท (brightness 13.7/255) เป็นเพียง pass ทดสอบแสงแรกที่ไม่มีแสงส่องตัวละคร ไม่เห็นรายละเอียดโมเดล',
    duplicateWith: '-',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '11-cloud-studio-pass-04.jpg'
  },
  {
    file: 'public/assets/renders/cloud-strife-chibi/09-cloud-studio-pass-02.jpg',
    project: 'Cloud Strife — Buster Sword Chibi',
    slug: 'cloud-strife-chibi',
    category: 'renders',
    type: 'ซ้ำ (ภาพซ้ำเชิงมุมมอง/แสง)',
    reason: 'มุมกล้องและท่าทาง 3D เดียวกับ 10 และ 11 ต่างแค่แสงม่วง เป็น lighting iteration ซ้ำซ้อน',
    duplicateWith: 'public/assets/renders/cloud-strife-chibi/11-cloud-studio-pass-04.jpg',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '11-cloud-studio-pass-04.jpg'
  },
  {
    file: 'public/assets/renders/cloud-strife-chibi/10-cloud-studio-pass-03.jpg',
    project: 'Cloud Strife — Buster Sword Chibi',
    slug: 'cloud-strife-chibi',
    category: 'renders',
    type: 'ซ้ำ (ภาพซ้ำเชิงมุมมอง/แสง)',
    reason: 'มุมกล้องและท่าทางเดียวกับ 11 ต่างแค่ยังไม่เปิด glow สีเขียวที่ดาบ Buster Sword',
    duplicateWith: 'public/assets/renders/cloud-strife-chibi/11-cloud-studio-pass-04.jpg',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '11-cloud-studio-pass-04.jpg'
  },
  {
    file: 'public/assets/renders/cloud-strife-chibi/11-cloud-studio-pass-04.jpg',
    project: 'Cloud Strife — Buster Sword Chibi',
    slug: 'cloud-strife-chibi',
    category: 'renders',
    type: 'ซ้ำ (ตัวแทนชุดสตูดิโอ)',
    reason: 'เวอร์ชันสมบูรณ์ที่สุดของชุด Studio: ดาบ Buster Sword มี Mako Green Glow และขอบผมมี Pink Rim Light ชัดเจน',
    duplicateWith: '08, 09, 10 ในโฟลเดอร์เดียวกัน',
    confidence: 'สูง',
    recommendation: 'เก็บ',
    keeper: '11-cloud-studio-pass-04.jpg (เก็บตัวนี้เป็น Beauty Shot)'
  },

  // 2. motorcycle-series
  {
    file: 'public/assets/renders/motorcycle-series/02-kawasaki-zh2-front.jpg',
    project: 'Kawasaki Z H2 Supercharged Streetfighter',
    slug: 'motorcycle-series',
    category: 'renders',
    type: 'คุณภาพต่ำ (มืดสนิท 98% ดำล้วน)',
    reason: 'ความสว่างเฉลี่ย 2.4/255 เฟรมภาพกว่า 98% เป็นความมืดสนิท เห็นเพียงเส้นไฟหน้าเล็ก ๆ 2 ขีด ไม่เห็นโครงรถมอเตอร์ไซค์',
    duplicateWith: '-',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '-'
  },
  {
    file: 'public/assets/renders/motorcycle-series/01-kawasaki-zh2-painted.jpg',
    project: 'Kawasaki Z H2 Supercharged Streetfighter',
    slug: 'motorcycle-series',
    category: 'renders',
    type: 'คุณภาพ (ผูกกับ Before/After Slider)',
    reason: 'ภาพค่อนข้างมืด แต่ถูกผูกเป็นฝั่ง After ของ Before/After Slider (ba-zh2) คู่กับ wireframe หากลบจะกระทบ Slider',
    duplicateWith: '-',
    confidence: 'สูง',
    recommendation: 'เก็บ',
    keeper: '01-kawasaki-zh2-painted.jpg (ต้องเก็บเพื่อรักษา Slider ba-zh2)'
  },

  // 3. cozy-gamer-bedroom
  {
    file: 'public/assets/renders/cozy-gamer-bedroom/03-gamer-bedroom-wip-pass.jpg',
    project: 'Cozy Midnight Gamer Bedroom',
    slug: 'cozy-gamer-bedroom',
    category: 'renders',
    type: 'คุณภาพต่ำ (WIP Pass / มืดสนิท)',
    reason: 'ภาพเรนเดอร์ขนาด 2048x2048 แต่อยู่ในพื้นที่ว่างสีดำ 80% และเป็น pass ทดสอบเทาล้วนไม่มีแสง (brightness 4.9, sharpness 43.8)',
    duplicateWith: '-',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '01-gamer-bedroom-final.jpg & 02-gamer-bedroom-day-angle.jpg'
  },
  {
    file: 'public/assets/renders/cozy-gamer-bedroom/04-gamer-bedroom-night-led.jpg',
    project: 'Cozy Midnight Gamer Bedroom',
    slug: 'cozy-gamer-bedroom',
    category: 'renders',
    type: 'ซ้ำ (มุมกล้องเดียวกับ 01 แต่บรรยากาศแบน)',
    reason: 'มุมกล้อง isometric เดียวกันกับ 01 ลอยอยู่กลางขอบดำ 80% แสงเป็นกลางวันเรียบ ๆ ไม่เด่นเท่า 01 (LED mood) และ 02 (Close-up 1080p)',
    duplicateWith: 'public/assets/renders/cozy-gamer-bedroom/01-gamer-bedroom-final.jpg',
    confidence: 'กลาง',
    recommendation: 'ให้ผู้ใช้ตัดสิน',
    keeper: '01-gamer-bedroom-final.jpg & 02-gamer-bedroom-day-angle.jpg'
  },

  // 4. pokemon-collection
  {
    file: 'public/assets/renders/pokemon-collection/05-meowstic-front-plush.jpg',
    project: 'Legendary & Battle Pokemon Roster',
    slug: 'pokemon-collection',
    category: 'renders',
    type: 'คุณภาพต่ำ (ความละเอียดต่ำ / มืดสนิท)',
    reason: 'ขนาด 960x540 (24 KB) โมเดลขนาดเล็กจมอยู่กลางความมืด (brightness 4.2/255) คุณภาพผิวพลาสติกแข็ง ไม่ถึงเกณฑ์ Final Beauty',
    duplicateWith: 'public/assets/renders/pokemon-collection/06-meowstic-three-quarter.jpg',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '-'
  },
  {
    file: 'public/assets/renders/pokemon-collection/06-meowstic-three-quarter.jpg',
    project: 'Legendary & Battle Pokemon Roster',
    slug: 'pokemon-collection',
    category: 'renders',
    type: 'คุณภาพต่ำ (ความละเอียดต่ำ / มืดสนิท / ซ้ำ)',
    reason: 'ขนาด 960x540 (23 KB) โมเดลเดิมในมุมเอียงเล็กน้อย จมอยู่กลางฉากดำสนิท (brightness 3.1/255)',
    duplicateWith: 'public/assets/renders/pokemon-collection/05-meowstic-front-plush.jpg',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '-'
  },
  {
    file: 'public/assets/renders/pokemon-collection/02-reshiram-textured-alternate.jpg',
    project: 'Legendary & Battle Pokemon Roster',
    slug: 'pokemon-collection',
    category: 'renders',
    type: 'ซ้ำ (ภาพซ้ำเชิงมุมมอง)',
    reason: 'มุม T-pose ของโมเดล Reshiram เกือบซ้ำกับ 01-reshiram-textured-front.jpg แค่หันหัวเล็กน้อย แต่ 01 คมชัดและขนาดไฟล์สมบูรณ์กว่า',
    duplicateWith: 'public/assets/renders/pokemon-collection/01-reshiram-textured-front.jpg',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '01-reshiram-textured-front.jpg'
  },

  // 5. bathroom-island-diorama
  {
    file: 'public/assets/renders/bathroom-island-diorama/02-skibidi-prop-render.jpg',
    project: 'Stylized Restroom Island Diorama',
    slug: 'bathroom-island-diorama',
    category: 'renders',
    type: 'คุณภาพต่ำ (Meme Asset / ลดทอนความเป็นมืออาชีพ)',
    reason: 'ขนาด 960x540 เป็นโมเดลมีมชักโครกหัวคน (Skibidi) พร้อมก้อนอุจจาระ ลดทอนภาพลักษณ์ความเป็น 3D Artist มืออาชีพของพอร์ตโดยรวมอย่างมาก',
    duplicateWith: '-',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '01-bathroom-island-beauty.png'
  },
  {
    file: 'public/assets/renders/bathroom-island-diorama/03-wet-floor-caution-sign.png',
    project: 'Stylized Restroom Island Diorama',
    slug: 'bathroom-island-diorama',
    category: 'renders',
    type: 'คุณภาพ (ผูกกับ Before/After Slider)',
    reason: 'ป้ายเตือนพื้นเปียก ผูกกับ Before/After Slider (ba-caution) คู่กับไฟล์ wireframe ใน workflow',
    duplicateWith: '-',
    confidence: 'สูง',
    recommendation: 'เก็บ',
    keeper: '03-wet-floor-caution-sign.png (ต้องเก็บเพื่อรักษา Slider ba-caution)'
  },

  // 6. toji-fushiguro
  {
    file: 'public/assets/renders/toji-fushiguro/06-toji-chibi-edition.jpg',
    project: 'Toji Fushiguro — Anatomy & Gear Sculpt',
    slug: 'toji-fushiguro',
    category: 'renders',
    type: 'คุณภาพต่ำ (โมเดลหยาบ / ผิดคอนเซ็ปต์โปรเจกต์)',
    reason: 'โมเดล Chibi สัดส่วนบิดเบี้ยว ยืน T-pose กลางพื้นเทา ขัดแย้งกับภาพ 01-05 ที่เป็นงาน High-poly Anatomy & Muscle Sculpt ระดับสมจริง',
    duplicateWith: '-',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '01-toji-hero-front.jpg'
  },
  {
    file: 'public/assets/renders/toji-fushiguro/05-toji-three-quarter.jpg',
    project: 'Toji Fushiguro — Anatomy & Gear Sculpt',
    slug: 'toji-fushiguro',
    category: 'renders',
    type: 'ซ้ำ (มุมมอง T-pose กึ่งซ้ำ)',
    reason: 'ท่ายืน T-pose กึ่งเอียงบนพื้นเทา คล้ายคลึงกับ 01-toji-hero-front.jpg มาก',
    duplicateWith: 'public/assets/renders/toji-fushiguro/01-toji-hero-front.jpg',
    confidence: 'กลาง',
    recommendation: 'ให้ผู้ใช้ตัดสิน',
    keeper: '01-toji-hero-front.jpg'
  },

  // 7. character-wich
  {
    file: 'public/assets/renders/character-wich/02-wich-three-quarter.jpg',
    project: 'Stylized Witch / Sorceress Character',
    slug: 'character-wich',
    category: 'renders',
    type: 'ซ้ำ (ภาพซ้ำเชิงมุมมอง)',
    reason: 'ท่ายืนมุมตรงมุมเดียวกับ 04 (pDist 4) ต่างเพียงการปรับแสงเล็กน้อย',
    duplicateWith: 'public/assets/renders/character-wich/04-wich-rear-skirt.jpg',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '04-wich-rear-skirt.jpg (จัดแสงสวยและมี rim light ดีที่สุด)'
  },
  {
    file: 'public/assets/renders/character-wich/03-wich-side-hair.jpg',
    project: 'Stylized Witch / Sorceress Character',
    slug: 'character-wich',
    category: 'renders',
    type: 'ซ้ำ (ภาพซ้ำเชิงมุมมอง)',
    reason: 'ท่ายืนมุมตรงเดิมซ้ำซ้อนกับ 02 และ 04',
    duplicateWith: 'public/assets/renders/character-wich/04-wich-rear-skirt.jpg',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '04-wich-rear-skirt.jpg'
  },
  {
    file: 'public/assets/renders/character-wich/04-wich-rear-skirt.jpg',
    project: 'Stylized Witch / Sorceress Character',
    slug: 'character-wich',
    category: 'renders',
    type: 'ซ้ำ (ตัวแทนชุดท่ายืนตรง)',
    reason: 'เวอร์ชันจัดแสงสมบูรณ์ที่สุด มี Yellow Rim Light ตัดกับชุดสีม่วงโดดเด่น',
    duplicateWith: '02, 03 ในโฟลเดอร์เดียวกัน',
    confidence: 'สูง',
    recommendation: 'เก็บ',
    keeper: '04-wich-rear-skirt.jpg (เก็บตัวนี้)'
  },

  // 8. character-mint
  {
    file: 'public/assets/renders/character-mint/01-mint-chibi-hero.jpg',
    project: 'Mint — Chibi Anime Character',
    slug: 'character-mint',
    category: 'renders',
    type: 'ซ้ำ / คุณภาพต่ำ (Crop ซ้ำความละเอียดต่ำ)',
    reason: 'ขนาด 960x540 เป็นภาพครอปซ้ำของ 02-mint-front-rigged.jpg ซึ่งเป็นไฟล์ Full HD 1920x1080 คมชัดกว่า',
    duplicateWith: 'public/assets/renders/character-mint/02-mint-front-rigged.jpg',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '02-mint-front-rigged.jpg'
  },
  {
    file: 'public/assets/renders/character-mint/05-mint-studio-alt.jpg',
    project: 'Mint — Chibi Anime Character',
    slug: 'character-mint',
    category: 'renders',
    type: 'ซ้ำ (ท่ายืนและมุมกล้องกึ่งซ้ำ)',
    reason: 'ท่ายืนตรงมุมเดียวกับ 02-mint-front-rigged.jpg ต่างเพียงโทนแสงสตูดิโอเล็กน้อย',
    duplicateWith: 'public/assets/renders/character-mint/02-mint-front-rigged.jpg',
    confidence: 'กลาง',
    recommendation: 'ให้ผู้ใช้ตัดสิน',
    keeper: '02-mint-front-rigged.jpg'
  },

  // 9. character-jin
  {
    file: 'public/assets/renders/character-jin/01-jin-horror-portrait.jpg',
    project: 'Jin — Stylized Fighter Character',
    slug: 'character-jin',
    category: 'renders',
    type: 'คุณภาพต่ำ / ซ้ำ (ความละเอียด 960x540)',
    reason: 'โมเดล T-pose บนพื้นชมพู texture ค่อนข้างหยาบ ท่าทางซ้ำกับ 02 และ 03 (แต่ห้ามลบหมดทุกรูปเพราะโปรเจกต์จะว่าง)',
    duplicateWith: 'public/assets/renders/character-jin/03-jin-turnaround-view.jpg',
    confidence: 'กลาง',
    recommendation: 'ให้ผู้ใช้ตัดสิน',
    keeper: '03-jin-turnaround-view.jpg (1920x1080 คมชัดที่สุด)'
  },
  {
    file: 'public/assets/renders/character-jin/02-jin-three-quarter.jpg',
    project: 'Jin — Stylized Fighter Character',
    slug: 'character-jin',
    category: 'renders',
    type: 'คุณภาพต่ำ / ซ้ำ (ความละเอียด 960x540)',
    reason: 'ขนาด 960x540 ท่าทางกึ่งเอียงเล็กน้อยบนพื้นชมพู ซ้ำซ้อนกับ 03-jin-turnaround-view.jpg',
    duplicateWith: 'public/assets/renders/character-jin/03-jin-turnaround-view.jpg',
    confidence: 'กลาง',
    recommendation: 'ให้ผู้ใช้ตัดสิน',
    keeper: '03-jin-turnaround-view.jpg'
  },

  // 10. product-scifi-props
  {
    file: 'public/assets/renders/product-scifi-props/06-dinosaur-fossil-skeleton.jpg',
    project: 'Sci-Fi Props, Laboratory & Animal Studies',
    slug: 'product-scifi-props',
    category: 'renders',
    type: 'คุณภาพต่ำ (WIP ไม่สมบูรณ์)',
    reason: 'กระดูกสันหลังและกะโหลกไดโนเสาร์ลอยอยู่กลางอากาศ ไม่มีขาหรือลำตัว ดูเป็นงานแบบฝึกหัดที่ยังทำไม่เสร็จ',
    duplicateWith: '-',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '-'
  },
  {
    file: 'public/assets/renders/product-scifi-props/07-great-white-shark-head.jpg',
    project: 'Sci-Fi Props, Laboratory & Animal Studies',
    slug: 'product-scifi-props',
    category: 'renders',
    type: 'คุณภาพต่ำ (960x540 / mesh ไม่สมบูรณ์)',
    reason: 'ขนาด 960x540 หัวฉลามขาดลอยกลางพื้นเทา ผิวเบลอและ mesh ดูไม่เสร็จสมบูรณ์',
    duplicateWith: '-',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '-'
  },
  {
    file: 'public/assets/workflow/product-scifi-props/03-shark-head-wireframe.png',
    project: 'Sci-Fi Props, Laboratory & Animal Studies',
    slug: 'product-scifi-props',
    category: 'workflow',
    type: 'คุณภาพต่ำ (Wireframe ของ asset ที่ถูกเสนอตัด)',
    reason: 'เป็น Wireframe ของหัวฉลาม 07 หากตัดรูปเรนเดอร์ 07 ออก ควรตัด wireframe ชิ้นนี้ออกจาก Workflow ด้วยเพื่อไม่ให้ตกค้าง',
    duplicateWith: 'public/assets/renders/product-scifi-props/07-great-white-shark-head.jpg',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '-'
  },
  {
    file: 'public/assets/renders/product-scifi-props/11-orange-tabby-cat-bright.jpg',
    project: 'Sci-Fi Props, Laboratory & Animal Studies',
    slug: 'product-scifi-props',
    category: 'renders',
    type: 'ซ้ำ (มุมกล้องเดียวกับ 12 แต่แสงแตก/noise)',
    reason: 'มุมมองเดียวกับ 12-orange-tabby-cat-turn.jpg (pDist 4) แต่แสงจ้าเกินไป มี noise และไฮไลต์แตก',
    duplicateWith: 'public/assets/renders/product-scifi-props/12-orange-tabby-cat-turn.jpg',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '12-orange-tabby-cat-turn.jpg (แสงนุ่มนวลและเนียนตากว่ามาก)'
  },
  {
    file: 'public/assets/renders/product-scifi-props/12-orange-tabby-cat-turn.jpg',
    project: 'Sci-Fi Props, Laboratory & Animal Studies',
    slug: 'product-scifi-props',
    category: 'renders',
    type: 'ซ้ำ (ตัวแทนโมเดลแมวส้ม)',
    reason: 'แสงเงาสมดุล ไม่มีไฮไลต์แตก คมชัดระดับ 1080p',
    duplicateWith: '11-orange-tabby-cat-bright.jpg',
    confidence: 'สูง',
    recommendation: 'เก็บ',
    keeper: '12-orange-tabby-cat-turn.jpg (เก็บตัวนี้)'
  },

  // 11. stylized-character-showcase
  {
    file: 'public/assets/renders/stylized-character-showcase/04-kaiwa-chibi-side.jpg',
    project: 'Stylized Character Showcase Collection',
    slug: 'stylized-character-showcase',
    category: 'renders',
    type: 'ซ้ำ (มุมกล้องกึ่งซ้ำ)',
    reason: 'ขนาด 960x540 ท่ายืน T-pose เสื้อเขียว มุมกล้องกึ่งซ้ำกับ 03-kaiwa-green-coat-chibi.jpg (pDist 4)',
    duplicateWith: 'public/assets/renders/stylized-character-showcase/03-kaiwa-green-coat-chibi.jpg',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '03-kaiwa-green-coat-chibi.jpg'
  },
  {
    file: 'public/assets/renders/stylized-character-showcase/13-lego-robin-front.jpg',
    project: 'Stylized Character Showcase Collection',
    slug: 'stylized-character-showcase',
    category: 'renders',
    type: 'ซ้ำ / คุณภาพต่ำ (มุมตรงมีเส้นขอบกวนสายตา)',
    reason: 'มุมตรงทื่อ ๆ และมีเส้นขอบสีเหลืองติดมุมภาพ ขณะที่ 14-lego-robin-angle.jpg จัดมุม 3/4 ได้มีมิติและสวยงามกว่า',
    duplicateWith: 'public/assets/renders/stylized-character-showcase/14-lego-robin-angle.jpg',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '14-lego-robin-angle.jpg'
  },
  {
    file: 'public/assets/renders/stylized-character-showcase/09-blue-hoodie-stylized-boy.jpg',
    project: 'Stylized Character Showcase Collection',
    slug: 'stylized-character-showcase',
    category: 'renders',
    type: 'คุณภาพ (T-pose ธรรมดา)',
    reason: 'ท่ายืน T-pose พื้นเทา เป็นงานพื้นฐานสไตล์ stylized',
    duplicateWith: '-',
    confidence: 'ต่ำ',
    recommendation: 'ให้ผู้ใช้ตัดสิน',
    keeper: 'ให้ผู้ใช้เลือกว่าต้องการเก็บไว้แสดงความหลากหลายหรือไม่'
  },
  {
    file: 'public/assets/renders/stylized-character-showcase/10-female-samurai-kimono.jpg',
    project: 'Stylized Character Showcase Collection',
    slug: 'stylized-character-showcase',
    category: 'renders',
    type: 'คุณภาพ (T-pose ธรรมดา)',
    reason: 'ท่ายืนตรงชุดกิโมโนซามูไรหญิงบนพื้นเทา',
    duplicateWith: '-',
    confidence: 'ต่ำ',
    recommendation: 'ให้ผู้ใช้ตัดสิน',
    keeper: 'ให้ผู้ใช้เลือกว่าต้องการเก็บไว้แสดงความหลากหลายหรือไม่'
  },

  // 12. stylized-game-islands
  {
    file: 'public/assets/renders/stylized-game-islands/08-cube-pet-trio-sky.png',
    project: 'Sci-Fi & Fantasy Game Islands Collection',
    slug: 'stylized-game-islands',
    category: 'renders',
    type: 'ซ้ำ / คุณภาพต่ำ (โมเดลเดียวกับ 07 แสงจ้า/มี artifact)',
    reason: 'โมเดลและตำแหน่งเดียวกับ 07 เป๊ะ แต่เปลี่ยนฉากหลังท้องฟ้า แสงสว่างจ้าเกินไป และมีเส้นขอบสีแดงติดขอบบนขวา',
    duplicateWith: 'public/assets/renders/stylized-game-islands/07-cube-pet-trio-studio.jpg',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '07-cube-pet-trio-studio.jpg'
  },
  {
    file: 'public/assets/renders/stylized-game-islands/04-lighthouse-barrel-chest.jpg',
    project: 'Sci-Fi & Fantasy Game Islands Collection',
    slug: 'stylized-game-islands',
    category: 'renders',
    type: 'คุณภาพต่ำ (ความละเอียด 960x540 / โมเดลง่าย)',
    reason: 'ขนาด 960x540 (33 KB) โมเดลประภาคาร ถังไม้ และหีบ บนพื้นเทาแบบเรียบง่ายมาก',
    duplicateWith: '-',
    confidence: 'กลาง',
    recommendation: 'ให้ผู้ใช้ตัดสิน',
    keeper: '-'
  },
  {
    file: 'public/assets/renders/stylized-game-islands/05-stylized-treehouse.png',
    project: 'Sci-Fi & Fantasy Game Islands Collection',
    slug: 'stylized-game-islands',
    category: 'renders',
    type: 'คุณภาพต่ำ (ความละเอียด 678x619)',
    reason: 'โมเดลต้นไม้บ้านเดี่ยวขนาด 678x619 ตัดฉากหลัง',
    duplicateWith: '-',
    confidence: 'ต่ำ',
    recommendation: 'ให้ผู้ใช้ตัดสิน',
    keeper: '-'
  },

  // 13. roblox-prop-pack
  {
    file: 'public/assets/renders/roblox-prop-pack/08-gold-link-chain-necklace.jpg',
    project: 'Roblox / Stylized Wearable & Weapon Pack',
    slug: 'roblox-prop-pack',
    category: 'renders',
    type: 'คุณภาพต่ำ (ว่างเปล่า / 24 KB)',
    reason: 'ขนาด 960x540 (24 KB) เป็นสร้อยทองเส้นเล็ก ๆ ห่วงเดียวลอยกลางพื้นที่ว่างสีเทากว่า 95% ของภาพ และมีปรากฏรวมอยู่ในภาพ 01 อยู่แล้ว',
    duplicateWith: 'public/assets/renders/roblox-prop-pack/01-prop-pack-group-lineup.jpg',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '01-prop-pack-group-lineup.jpg (ภาพรวมไลน์อัปครบทุกชิ้น)'
  },
  {
    file: 'public/assets/renders/roblox-prop-pack/03-camo-desert-eagle.jpg',
    project: 'Roblox / Stylized Wearable & Weapon Pack',
    slug: 'roblox-prop-pack',
    category: 'renders',
    type: 'ซ้ำซ้อนกับภาพรวม Lineup 01',
    reason: 'ชิ้นพร็อพปืนพกลายพราง โชว์เดี่ยว 960x540 โดยในภาพ 01 มีโชว์อยู่แล้ว',
    duplicateWith: 'public/assets/renders/roblox-prop-pack/01-prop-pack-group-lineup.jpg',
    confidence: 'กลาง',
    recommendation: 'ให้ผู้ใช้ตัดสิน',
    keeper: '01-prop-pack-group-lineup.jpg'
  },
  {
    file: 'public/assets/renders/roblox-prop-pack/04-wooden-rowboat.jpg',
    project: 'Roblox / Stylized Wearable & Weapon Pack',
    slug: 'roblox-prop-pack',
    category: 'renders',
    type: 'ซ้ำซ้อนกับภาพรวม Lineup 01',
    reason: 'เรือไม้ โชว์เดี่ยว 960x540 โดยในภาพ 01 มีโชว์อยู่แล้ว',
    duplicateWith: 'public/assets/renders/roblox-prop-pack/01-prop-pack-group-lineup.jpg',
    confidence: 'กลาง',
    recommendation: 'ให้ผู้ใช้ตัดสิน',
    keeper: '01-prop-pack-group-lineup.jpg'
  },
  {
    file: 'public/assets/renders/roblox-prop-pack/05-terrazzo-bucket-hat.jpg',
    project: 'Roblox / Stylized Wearable & Weapon Pack',
    slug: 'roblox-prop-pack',
    category: 'renders',
    type: 'ซ้ำซ้อนกับภาพรวม Lineup 01',
    reason: 'หมวกบักเก็ต โชว์เดี่ยว 960x540 โดยในภาพ 01 มีโชว์อยู่แล้ว',
    duplicateWith: 'public/assets/renders/roblox-prop-pack/01-prop-pack-group-lineup.jpg',
    confidence: 'กลาง',
    recommendation: 'ให้ผู้ใช้ตัดสิน',
    keeper: '01-prop-pack-group-lineup.jpg'
  },
  {
    file: 'public/assets/renders/roblox-prop-pack/06-toothless-dragon-hood.jpg',
    project: 'Roblox / Stylized Wearable & Weapon Pack',
    slug: 'roblox-prop-pack',
    category: 'renders',
    type: 'ซ้ำซ้อนกับภาพรวม Lineup 01',
    reason: 'ฮู้ดมังกร Toothless โชว์เดี่ยว 960x540 โดยในภาพ 01 มีโชว์อยู่แล้ว',
    duplicateWith: 'public/assets/renders/roblox-prop-pack/01-prop-pack-group-lineup.jpg',
    confidence: 'กลาง',
    recommendation: 'ให้ผู้ใช้ตัดสิน',
    keeper: '01-prop-pack-group-lineup.jpg'
  },
  {
    file: 'public/assets/renders/roblox-prop-pack/07-red-racing-helmet.jpg',
    project: 'Roblox / Stylized Wearable & Weapon Pack',
    slug: 'roblox-prop-pack',
    category: 'renders',
    type: 'ซ้ำซ้อนกับภาพรวม Lineup 01',
    reason: 'หมวกกันน็อกสีแดง โชว์เดี่ยว 960x540 โดยในภาพ 01 มีโชว์อยู่แล้ว',
    duplicateWith: 'public/assets/renders/roblox-prop-pack/01-prop-pack-group-lineup.jpg',
    confidence: 'กลาง',
    recommendation: 'ให้ผู้ใช้ตัดสิน',
    keeper: '01-prop-pack-group-lineup.jpg'
  },

  // 14. street-commerce-buildings
  {
    file: 'public/assets/renders/street-commerce-buildings/04-magma-vein-shop-kiosk.jpg',
    project: 'Street Burger Stand, Brick Bar & Lava Shop',
    slug: 'street-commerce-buildings',
    category: 'renders',
    type: 'คุณภาพต่ำ (ความละเอียด 960x540 / โมเดลหยาบ)',
    reason: 'ขนาด 960x540 ซุ้มขายของลายลาวาแบบง่าย ลอยกลางพื้นเทา อ่อนกว่าชิ้น Burger Stand และ Brick Bar ในโปรเจกต์เดียวกันมาก',
    duplicateWith: '-',
    confidence: 'สูง',
    recommendation: 'ลบ',
    keeper: '01-burger-stand-day-view.jpg และ 03-brick-corner-bar-tight.jpg'
  },

  // 15. minimal-bedroom
  {
    file: 'public/assets/renders/minimal-bedroom/01-minimal-bedroom-hero.jpg',
    project: 'Minimalist Modern Bedroom',
    slug: 'minimal-bedroom',
    category: 'renders',
    type: 'คุณภาพ (พื้นที่ขอบดำ 75%)',
    reason: 'ห้องขนาดเล็กอยู่กลางขอบดำ 2048x2048 แต่เป็นภาพเรนเดอร์ชิ้นเดียวของโปรเจกต์นี้ ห้ามลบเด็ดขาดมิฉะนั้นโปรเจกต์จะเหลือ 0 รูป แนะนำเก็บไว้ (หรือวางแผน Crop ขอบดำในอนาคต)',
    duplicateWith: '-',
    confidence: 'สูง',
    recommendation: 'เก็บ',
    keeper: '01-minimal-bedroom-hero.jpg (ต้องเก็บไว้เพราะเป็นรูปเดียวของโปรเจกต์)'
  },

  // 16. Assets ที่ผูกกับ Before/After Sliders และ Wireframe อื่นๆ
  {
    file: 'public/assets/renders/chibi-crusader-knight/02-spiked-flail-beauty.png',
    project: 'Chibi Crusader Knight & Heavy Armament',
    slug: 'chibi-crusader-knight',
    category: 'renders',
    type: 'ตรวจพบความคล้ายกับไฟล์ Wireframe ใน Workflow',
    reason: 'เป็นคู่ภาพ Beauty กับ Wireframe สำหรับ Before/After Slider (ba-flail)',
    duplicateWith: 'public/assets/workflow/chibi-crusader-knight/01-flail-wireframe.png',
    confidence: 'สูง',
    recommendation: 'เก็บ',
    keeper: 'ต้องเก็บทั้งคู่เพื่อรักษา Slider ba-flail'
  },
  {
    file: 'public/assets/renders/combat-weapons-arsenal/07-crusader-kite-shield.png',
    project: 'Medieval & Fantasy Combat Arsenal',
    slug: 'combat-weapons-arsenal',
    category: 'renders',
    type: 'ตรวจพบความคล้ายกับไฟล์ Wireframe ใน Workflow',
    reason: 'เป็นคู่ภาพ Beauty กับ Wireframe สำหรับ Before/After Slider (ba-shield)',
    duplicateWith: 'public/assets/workflow/combat-weapons-arsenal/02-shield-wireframe.png',
    confidence: 'สูง',
    recommendation: 'เก็บ',
    keeper: 'ต้องเก็บทั้งคู่เพื่อรักษา Slider ba-shield'
  },
  {
    file: 'public/assets/renders/horror-operating-lab/04-dark-mood-alternate.jpg',
    project: 'Abandoned Operating Theater',
    slug: 'horror-operating-lab',
    category: 'renders',
    type: 'แสงโทนสลัวตาม Mood & Tone',
    reason: 'ความละเอียด 1920x1080 คมชัดสูง (sharpness 473.5) เป็นงานเรนเดอร์ห้องผ่าตัดแนวสยองขวัญที่จัดแสงแบบ Low-key จงใจให้มืดเพื่อสร้างอารมณ์สยองขวัญ ไม่ใช่ภาพเสีย',
    duplicateWith: '-',
    confidence: 'สูง',
    recommendation: 'เก็บ',
    keeper: '04-dark-mood-alternate.jpg'
  },
  {
    file: 'public/assets/workflow/asian-heritage-architecture/01-korean-courtyard-split-wireframe.png',
    project: 'Asian Heritage Courtyard & Pagoda',
    slug: 'asian-heritage-architecture',
    category: 'workflow',
    type: 'ความละเอียดแนวกว้าง (Panorama Wireframe)',
    reason: 'ขนาด 1106x473 เป็นรูปภาพเปรียบเทียบแบ่งครึ่ง Wireframe vs Render ความคมชัดสูงมาก (sharpness 2189.5)',
    duplicateWith: '-',
    confidence: 'สูง',
    recommendation: 'เก็บ',
    keeper: '01-korean-courtyard-split-wireframe.png'
  }
];

let md = '# รายงานการสำรวจและคัดกรองรูปภาพพอร์ตโฟลิโอ (CLEANUP_REPORT)\n\n';
md += '> **สถานะ:** ขั้นที่ 2 — จัดทำตารางสรุปเสนอผู้ใช้เพื่อพิจารณาอนุมัติ (ยังไม่มีการลบ เคลื่อนย้าย หรือแก้ไขโค้ดใด ๆ ทั้งสิ้น)\n\n';
md += '## 1. ภาพรวมการสำรวจ (Executive Summary)\n\n';
md += 'จากการสแกนรูปภาพทั้งหมด **232 รายการ** (194 ไฟล์รูปบนดิสก์) ผ่านการคำนวณ Hash (SHA-256), Perceptual Hash (pHash / dHash สำหรับหามุมกล้องที่คล้ายคลึงกัน), Laplacian Variance (คะแนนความคมชัด), และ Mean Brightness (ระดับความสว่าง 0-255) ควบคู่กับการเปิดตรวจสอบรูปภาพด้วยสายตาทีละรูป พบว่ามีรูปภาพจำนวนหนึ่งที่เป็น:\n';
md += '1. **รูปภาพมืดสนิท / ดำล้วน / WIP Pass ที่ไม่มีแสง:** เช่น pass ทดสอบแสงแรก หรือโมเดลขนาดเล็กจมอยู่กลางความมืดมิด\n';
md += '2. **รูปภาพซ้ำซ้อนเชิงมุมกล้อง (Redundant Lighting Iterations):** โมเดลเดิม มุมกล้องเดิม แต่เซฟแยกเป็น 3-4 รูปเพียงเพราะเปลี่ยนแสงเล็กน้อย\n';
md += '3. **รูปภาพคุณภาพต่ำ / ไม่สมบูรณ์:** เช่น ชิ้นส่วนกระดูกไดโนเสาร์ลอยเคว้ง, หัวฉลามตัดครึ่ง, หรืองานที่มีม (Skibidi) ที่ลดทอนภาพลักษณ์ความเป็นมืออาชีพของศิลปิน 3D\n';
md += '4. **รูปภาพเดี่ยวที่ซ้ำซ้อนกับรูปภาพรวม (Prop Pack Lineup):** ชิ้นพร็อพเล็ก ๆ ที่โชว์รวมอยู่ในภาพหลักอย่างครบถ้วนแล้ว\n\n';

md += '## 2. สรุปการเปลี่ยนแปลงตัวเลขสถิติบนเว็บไซต์ (Before & After Stats)\n\n';
md += '| หมวดหมู่บนเว็บไซต์ | ปัจจุบัน (Current) | คาดการณ์หลังดำเนินการ (Proposed) | การเปลี่ยนแปลง (Diff) | หมายเหตุ |\n';
md += '| :--- | :---: | :---: | :---: | :--- |\n';
md += '| **Final Beauty Renders** | 140 รูป | **119 รูป** (หรือ 105 รูปหากตัดกลุ่มตัดสินใจ) | -21 รูป | คัดเฉพาะช็อตสวยที่สุดของแต่ละโปรเจกต์ |\n';
md += '| **Wire vs Beauty Sliders** | 19 อัน | **19 อัน** | 0 (คงเดิม 100%) | ตรวจสอบแล้ว ไม่มี Slider ใดได้รับผลกระทบ |\n';
md += '| **Workflow Breakdowns** | 54 รูป | **53 รูป** | -1 รูป | ตัด Wireframe หัวฉลามที่สอดคล้องกับรูปเรนเดอร์ |\n';
md += '| **Motion Clips (.mp4)** | 26 คลิป | **26 คลิป** | 0 (ไม่แตะต้อง) | เป็นไปตามกฎข้อบังคับ ห้ามแตะต้องไฟล์วิดีโอ |\n';
md += '| **Project Dossiers** | 30 โปรเจกต์ | **30 โปรเจกต์** | 0 (คงเดิม 100%) | ทุกโปรเจกต์ยังมี Hero Shot อย่างน้อย 1 รูปเสมอ |\n\n';

md += '## 3. ตารางรายละเอียดรูปภาพที่ผ่านการตรวจสอบและข้อเสนอแนะ\n\n';
md += '| ไฟล์ | โปรเจกต์ | ประเภท (ซ้ำ/คุณภาพต่ำ) | เหตุผลสั้น ๆ | ซ้ำกับไฟล์ไหน | ความมั่นใจ (สูง/กลาง/ต่ำ) | แนะนำ (ลบ/เก็บ/ให้ผู้ใช้ตัดสิน) |\n';
md += '| :--- | :--- | :--- | :--- | :--- | :---: | :---: |\n';

candidates.forEach(c => {
  const dupStr = c.duplicateWith === '-' ? '-' : '`' + c.duplicateWith + '`';
  md += '| `' + c.file + '` | ' + c.project + ' | ' + c.type + ' | ' + c.reason + ' | ' + dupStr + ' | ' + c.confidence + ' | **' + c.recommendation + '** |\n';
});

md += '\n## 4. สรุปรายละเอียดกลุ่มรูปภาพที่ซ้ำซ้อน (Duplicate Sets & Keepers)\n\n';
md += 'สำหรับชุดรูปภาพที่มีหลายเวอร์ชัน ได้คัดเลือก **"ตัวที่ควรเก็บ"** ซึ่งเป็นเวอร์ชันที่มีความละเอียดสูงสุด แสงสมบูรณ์ที่สุด และองค์ประกอบภาพดีที่สุดไว้ดังนี้:\n\n';

md += '1. **Cloud Strife Chibi (Studio Passes):**\n';
md += '   - ❌ **เสนอตัดออก:** `08-cloud-studio-pass-01.jpg` (มืดสนิท), `09-cloud-studio-pass-02.jpg` (แสงม่วงดิบ), `10-cloud-studio-pass-03.jpg` (ยังไม่เปิดดาบเรืองแสง)\n';
md += '   - ✅ **ตัวที่ควรเก็บ:** `11-cloud-studio-pass-04.jpg` (ดาบเรืองแสงเขียว Mako + ขอบผมมี Pink Rim Light สวยงามที่สุด)\n\n';

md += '2. **Stylized Witch / Sorceress (ท่ายืนตรง):**\n';
md += '   - ❌ **เสนอตัดออก:** `02-wich-three-quarter.jpg`, `03-wich-side-hair.jpg` (มุมกล้องเดียวกัน แสงยังไม่สมบูรณ์)\n';
md += '   - ✅ **ตัวที่ควรเก็บ:** `04-wich-rear-skirt.jpg` (จัดแสง Rim Light สีทองตัดกับชุดแม่มดสีม่วงสวยงามที่สุด)\n\n';

md += '3. **Mint Chibi Anime:**\n';
md += '   - ❌ **เสนอตัดออก:** `01-mint-chibi-hero.jpg` (ขนาด 960x540 เป็นภาพครอปซ้ำความละเอียดต่ำ)\n';
md += '   - ✅ **ตัวที่ควรเก็บ:** `02-mint-front-rigged.jpg` (ขนาด Full HD 1920x1080 คมชัดเต็มตัว)\n';
md += '   - ❓ **ให้ผู้ใช้ตัดสิน:** `05-mint-studio-alt.jpg` (มุมมองคล้าย 02 แต่เป็นแสงสตูดิโออีกแบบ)\n\n';

md += '4. **Legendary Pokemon (Reshiram):**\n';
md += '   - ❌ **เสนอตัดออก:** `02-reshiram-textured-alternate.jpg` (ท่ายืน T-pose กึ่งซ้ำ)\n';
md += '   - ✅ **ตัวที่ควรเก็บ:** `01-reshiram-textured-front.jpg` (คมชัดกว่าและขนาดไฟล์สมบูรณ์กว่า)\n\n';

md += '5. **Sci-Fi Props (Orange Tabby Cat):**\n';
md += '   - ❌ **เสนอตัดออก:** `11-orange-tabby-cat-bright.jpg` (มุมเดียวกับ 12 แต่แสงจ้าเกินไป ไฮไลต์แตกและมี noise)\n';
md += '   - ✅ **ตัวที่ควรเก็บ:** `12-orange-tabby-cat-turn.jpg` (แสงเงานุ่มนวล คมชัด ไม่มี noise)\n\n';

md += '6. **Stylized Game Islands (Cube Pet Trio):**\n';
md += '   - ❌ **เสนอตัดออก:** `08-cube-pet-trio-sky.png` (โมเดลเดียวกับ 07 เป๊ะ แต่แสงจ้าเกินไปและมีเส้นขอบสีแดงติดมุมภาพ)\n';
md += '   - ✅ **ตัวที่ควรเก็บ:** `07-cube-pet-trio-studio.jpg` (จัดแสง Studio Gray คมชัดและสะอาดตา)\n\n';

md += '7. **Stylized Characters (Lego Robin & Kaiwa Chibi):**\n';
md += '   - ❌ **เสนอตัดออก:** `13-lego-robin-front.jpg` (มุมตรงทื่อ มีเส้นขอบเหลืองติดขอบภาพ), `04-kaiwa-chibi-side.jpg` (T-pose กึ่งซ้ำกับ 03)\n';
md += '   - ✅ **ตัวที่ควรเก็บ:** `14-lego-robin-angle.jpg` (มุม 3/4 สวยงามมีมิติ), `03-kaiwa-green-coat-chibi.jpg` (คมชัดสมบูรณ์)\n\n';

md += '8. **Roblox Prop Pack:**\n';
md += '   - ❌ **เสนอตัดออก:** `08-gold-link-chain-necklace.jpg` (สร้อยทองเส้นเล็ก 24 KB จมในพื้นที่ว่างสีเทากว่า 95%)\n';
md += '   - ✅ **ตัวที่ควรเก็บ:** `01-prop-pack-group-lineup.jpg` (รวมพร็อพทุกชิ้นไว้ในภาพเดียวอย่างสวยงาม)\n';
md += '   - ❓ **ให้ผู้ใช้ตัดสิน:** `03`, `04`, `05`, `06`, `07` (พร็อพแยกเดี่ยว 960x540 เลือกว่าจะเก็บไว้โชว์แยกชิ้น หรือแสดงเฉพาะรูปหลัก 01 เพื่อความกระชับ)\n\n';

md += '## 5. ตรวจสอบความปลอดภัย (Safety & Integrity Checks)\n\n';
md += '- [x] **ไม่มีโปรเจกต์ไหนที่รูปเหลือ 0:** ตรวจสอบแล้วทั้ง 30 โปรเจกต์ ทุกโปรเจกต์ที่มีภาพ Render ยังคงมีภาพเรนเดอร์อย่างน้อย 1-13 รูปเสมอ\n';
md += '- [x] **ไม่กระทบ Before/After Slider:** ตรวจสอบ Slider ทั้ง 19 ตัวแล้ว คู่ภาพเช่น `ba-zh2`, `ba-caution`, `ba-flail`, `ba-shield` ได้รับการรักษาไว้ครบถ้วน 100%\n';
md += '- [x] **ไม่แตะต้อง Motion Clips:** ไฟล์วิดีโออนิเมชัน 26 คลิปใน `public/assets/animations/` ไม่มีการแก้ไขหรือแตะต้องใด ๆ\n';
md += '- [x] **ยังไม่มีการลบไฟล์:** ทุกไฟล์ยังคงอยู่ในตำแหน่งเดิมบนดิสก์ จะดำเนินการย้ายไฟล์ไปยังโฟลเดอร์ `_removed/` ในขั้นที่ 3 เฉพาะเมื่อได้รับอนุมัติจากผู้ใช้เท่านั้น\n';

fs.writeFileSync('CLEANUP_REPORT.md', md, 'utf8');
console.log('CLEANUP_REPORT.md written successfully!');

