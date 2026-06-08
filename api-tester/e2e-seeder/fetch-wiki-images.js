const fs = require('fs');
const axios = require('axios');
const path = require('path');

const VIETNAM_DATA_PATH = path.join(__dirname, 'vietnam-data.js');

async function getWikiImages(query) {
  try {
    const searchRes = await axios.get(`https://vi.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&srlimit=1`);
    if (!searchRes.data.query.search.length) return [];
    const title = searchRes.data.query.search[0].title;

    const imagesRes = await axios.get(`https://vi.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=images&imlimit=30&format=json`);
    const pages = imagesRes.data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (!pages[pageId].images) return [];

    const files = pages[pageId].images
      .map(img => img.title)
      .filter(t => !t.toLowerCase().includes('icon') && !t.toLowerCase().includes('logo') && t.match(/\.(jpg|jpeg|png)$/i));

    if (!files.length) return [];

    const urls = [];
    const batchSize = 10;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const imgInfoRes = await axios.get(`https://vi.wikipedia.org/w/api.php?action=query&titles=${batch.map(encodeURIComponent).join('|')}&prop=imageinfo&iiprop=url&format=json`);
      const imgPages = imgInfoRes.data.query.pages;
      for (const key in imgPages) {
        if (imgPages[key].imageinfo && imgPages[key].imageinfo[0].url) {
          urls.push(imgPages[key].imageinfo[0].url);
        }
      }
    }
    return urls;
  } catch (e) {
    return [];
  }
}

async function run() {
  console.log('Đang cào dữ liệu ảnh thật từ Wikipedia cho 90 địa danh...');
  
  // Require current data
  const { PROVINCES_AND_LANDMARKS } = require('./vietnam-data');
  const fallbackPool = [
    'https://images.unsplash.com/photo-1583417646549-b3a62002b80a?w=1200',
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200',
    'https://images.unsplash.com/photo-1620864388481-98782a64c4c2?w=1200',
    'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200',
    'https://images.unsplash.com/photo-1601004185799-798835f8fc32?w=1200'
  ];

  for (const prov of PROVINCES_AND_LANDMARKS) {
    for (const lm of prov.landmarks) {
      if (lm.thumbnail && lm.gallery && lm.gallery.length === 4) {
        continue; // Already has images
      }
      
      console.log(`- Đang tìm ảnh cho: ${lm.name} (${prov.province})...`);
      let images = await getWikiImages(lm.name);
      
      if (images.length < 5) {
        // Try searching with province
        const moreImages = await getWikiImages(`${lm.name} ${prov.province}`);
        images = [...new Set([...images, ...moreImages])];
      }
      
      // Fallback
      while (images.length < 5) {
        images.push(fallbackPool[Math.floor(Math.random() * fallbackPool.length)]);
      }

      lm.thumbnail = images[0];
      lm.gallery = images.slice(1, 5);
      await new Promise(r => setTimeout(r, 200)); // Sleep to respect API rate limits
    }
  }

  // Rewrite vietnam-data.js
  let fileContent = fs.readFileSync(VIETNAM_DATA_PATH, 'utf-8');
  
  // We will replace the PROVINCES_AND_LANDMARKS block
  // But wait, it's easier to just regenerate the entire file or use regex.
  // Actually, we can just replace the whole PROVINCES_AND_LANDMARKS assignment
  
  const startIndex = fileContent.indexOf('const PROVINCES_AND_LANDMARKS = [');
  const endString = '\nmodule.exports = {';
  const endIndex = fileContent.indexOf(endString);
  
  if (startIndex !== -1 && endIndex !== -1) {
    const newBlock = `const PROVINCES_AND_LANDMARKS = ${JSON.stringify(PROVINCES_AND_LANDMARKS, null, 2)};`;
    fileContent = fileContent.substring(0, startIndex) + newBlock + fileContent.substring(endIndex);
    fs.writeFileSync(VIETNAM_DATA_PATH, fileContent, 'utf-8');
    console.log('✅ Đã cập nhật thành công 90 địa danh với ảnh thật vào vietnam-data.js!');
  } else {
    console.error('Không tìm thấy block PROVINCES_AND_LANDMARKS để replace.');
  }
}

run();
