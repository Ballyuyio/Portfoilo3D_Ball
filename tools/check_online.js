async function checkOnline() {
  try {
    const resHtml = await fetch('https://ballyuyio.github.io/Portfoilo3D_Ball/index.html', {
      headers: { 'Cache-Control': 'no-cache' }
    });
    const textHtml = await resHtml.text();
    const match = textHtml.match(/<strong id="statRenders">(.*?)<\/strong>/);
    console.log('Live HTML statRenders:', match ? match[1] : 'not found');

    const resData = await fetch('https://ballyuyio.github.io/Portfoilo3D_Ball/data/projects.js?v=2', {
      headers: { 'Cache-Control': 'no-cache' }
    });
    const textData = await resData.text();
    console.log('Live projects.js size:', textData.length);
    console.log('Live projects.js has 119:', textData.includes('"renders":119') || textData.includes('119'));
    console.log('Live projects.js has 140:', textData.includes('"renders":140'));
  } catch (err) {
    console.log('Fetch error:', err.message);
  }
}

checkOnline();
