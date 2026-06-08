const fs = require('fs');
const axios = require('axios');
const path = require('path');

const VIETNAM_DATA_PATH = path.join(__dirname, 'vietnam-data.js');

// Blacklist keywords for image titles to filter out maps, flags, icons, etc.
const BLACKLIST_KEYWORDS = [
  'icon', 'logo', 'map', 'bản đồ', 'flag', 'quốc kỳ', 'location', 'vị trí', 
  'biểu trưng', 'huy hiệu', 'sơ đồ', 'hành chính', 'vùng', 'chia', 'giới hạn', 
  'vĩ độ', 'tập tin', 'stub', 'coordinate', 'tọa độ', 'wiki', 'letter', 'nút', 
  'button', 'arrow', 'chỉ hướng', 'hướng dẫn', 'hành lang', 'coat of arms', 
  'red link', 'geograph', 'locator', 'district', 'administrative'
];

function isBlacklisted(title) {
  const t = title.toLowerCase();
  return BLACKLIST_KEYWORDS.some(kw => t.includes(kw));
}

// Province-specific Unsplash gallery pools for aesthetic coherence
const REGIONAL_POOLS = {
  HANOI: [
    'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=1200',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200',
    'https://images.unsplash.com/photo-1562914399-bfb17f539e6a?w=1200',
    'https://images.unsplash.com/photo-1555921015-5532091f6026?w=1200',
    'https://images.unsplash.com/photo-1620864388481-98782a64c4c2?w=1200',
    'https://images.unsplash.com/photo-1583417646549-b3a62002b80a?w=1200'
  ],
  CITY: [
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200',
    'https://images.unsplash.com/photo-1621644023249-14a0fc8423f5?w=1200',
    'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200',
    'https://images.unsplash.com/photo-1572948624128-4ce68832a8a7?w=1200',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200'
  ],
  HERITAGE: [
    'https://images.unsplash.com/photo-1602728806416-4b46ef25c71d?w=1200',
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200',
    'https://images.unsplash.com/photo-1533050487297-09b45013190a?w=1200',
    'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200',
    'https://images.unsplash.com/photo-1601004185799-798835f8fc32?w=1200',
    'https://images.unsplash.com/photo-1620864388481-98782a64c4c2?w=1200'
  ],
  BEACH: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
    'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200',
    'https://images.unsplash.com/photo-1543637005-4d639a4e16de?w=1200',
    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
    'https://images.unsplash.com/photo-1583569704400-988c564cd2bd?w=1200'
  ],
  NATURE: [
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200',
    'https://images.unsplash.com/photo-1555921015-5532091f6026?w=1200',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200',
    'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1200',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200',
    'https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=1200'
  ],
  RURAL: [
    'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200',
    'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1200',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200',
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200',
    'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=1200'
  ]
};

// Map each province to a regional pool category
const PROVINCE_TO_POOL_MAP = {
  'Hà Nội': 'HANOI',
  'Hồ Chí Minh': 'CITY',
  'Đà Nẵng': 'HERITAGE',
  'Quảng Ninh': 'BEACH',
  'Lào Cai': 'NATURE',
  'Khánh Hòa': 'BEACH',
  'Lâm Đồng': 'NATURE',
  'Thừa Thiên Huế': 'HERITAGE',
  'Quảng Nam': 'HERITAGE',
  'Kiên Giang': 'BEACH',
  'Hà Giang': 'NATURE',
  'Ninh Bình': 'NATURE',
  'Phú Thọ': 'NATURE',
  'Quảng Bình': 'NATURE',
  'Bình Định': 'BEACH',
  'Phú Yên': 'BEACH',
  'Bình Thuận': 'BEACH',
  'Vũng Tàu': 'BEACH',
  'Cần Thơ': 'RURAL',
  'Tiền Giang': 'RURAL',
  'Bến Tre': 'RURAL',
  'Nghệ An': 'RURAL',
  'Thanh Hóa': 'RURAL',
  'Hải Phòng': 'BEACH',
  'Điện Biên': 'NATURE',
  'Sơn La': 'NATURE',
  'Gia Lai': 'RURAL',
  'Đắk Lắk': 'RURAL',
  'Kon Tum': 'RURAL',
  'Bình Dương': 'CITY'
};

const HEADERS = {
  'User-Agent': 'GoStayTravelSeeder/2.0 (contact: support@gostay.com; research project)'
};

// Axios helper with exponential backoff on 429 errors
async function axiosGetWithRetry(url, retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, { headers: HEADERS });
    } catch (err) {
      if (err.response && err.response.status === 429) {
        console.warn(`      ⚠️  [429 Too Many Requests] Đang đợi ${delay}ms trước khi thử lại (Lần ${i+1}/${retries})...`);
        await new Promise(r => setTimeout(r, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw err;
      }
    }
  }
  throw new Error(`Failed to GET ${url} after ${retries} retries due to rate limiting.`);
}

async function getWikiPageInfo(query) {
  try {
    const res = await axiosGetWithRetry(
      `https://vi.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&srlimit=3`
    );
    if (!res.data.query.search.length) return null;
    return res.data.query.search[0].title;
  } catch (e) {
    console.error(`    ❌ Lỗi tìm kiếm wiki cho "${query}":`, e.message);
    return null;
  }
}

async function getWikiMainImage(title) {
  try {
    const res = await axiosGetWithRetry(
      `https://vi.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&piprop=original&format=json`
    );
    const pages = res.data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pages[pageId] && pages[pageId].original && pages[pageId].original.source) {
      const source = pages[pageId].original.source;
      const isInvalidExt = source.toLowerCase().match(/\.(svg|gif|tif)$/i);
      const filename = source.substring(source.lastIndexOf('/') + 1);
      if (!isInvalidExt && !isBlacklisted(filename)) {
        return source;
      }
    }
    return null;
  } catch (e) {
    console.error(`    ❌ Lỗi lấy ảnh wiki chính cho "${title}":`, e.message);
    return null;
  }
}

// Balance bracket finder to locate the end of the array definition in vietnam-data.js
function findArrayEnd(content, startIndex) {
  let depth = 0;
  let inString = false;
  let stringChar = '';
  
  let openBracketIndex = content.indexOf('[', startIndex);
  if (openBracketIndex === -1) return -1;
  
  for (let i = openBracketIndex; i < content.length; i++) {
    const char = content[i];
    
    if ((char === '"' || char === "'" || char === "`") && content[i-1] !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }
    
    if (!inString) {
      if (char === '[' || char === '{') {
        depth++;
      } else if (char === ']' || char === '}') {
        depth--;
        if (depth === 0) {
          return i + 1; // return index after the closing bracket
        }
      }
    }
  }
  return -1;
}

async function run() {
  console.log('====================================================');
  console.log('🏛️  BẮT ĐẦU CÀO ẢNH ĐỊA DANH CHÍNH XÁC TỪ WIKIPEDIA');
  console.log('====================================================\n');
  
  const { PROVINCES_AND_LANDMARKS } = require('./vietnam-data');
  let successCount = 0;
  let fallbackCount = 0;
  
  for (let pIdx = 0; pIdx < PROVINCES_AND_LANDMARKS.length; pIdx++) {
    const prov = PROVINCES_AND_LANDMARKS[pIdx];
    const poolKey = PROVINCE_TO_POOL_MAP[prov.province] || 'NATURE';
    const pool = REGIONAL_POOLS[poolKey];
    
    console.log(`\n📍 Tỉnh/Thành phố: ${prov.province} (${pIdx + 1}/${PROVINCES_AND_LANDMARKS.length}) [Vùng: ${poolKey}]`);
    
    for (let lIdx = 0; lIdx < prov.landmarks.length; lIdx++) {
      const lm = prov.landmarks[lIdx];
      console.log(`  - Địa danh: "${lm.name}"`);
      
      let wikiTitle = await getWikiPageInfo(lm.name);
      if (!wikiTitle) {
        wikiTitle = await getWikiPageInfo(`${lm.name} ${prov.province}`);
      }
      
      let mainImage = null;
      if (wikiTitle) {
        mainImage = await getWikiMainImage(wikiTitle);
      }
      
      // Shuffle regional pool for unique gallery images
      const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
      
      if (mainImage) {
        lm.thumbnail = mainImage;
        // Make sure gallery doesn't repeat the thumbnail if it's from Unsplash (though mainImage is wiki)
        lm.gallery = shuffledPool.slice(0, 4);
        successCount++;
        console.log(`    ✅ Thành công! Lấy ảnh thật từ Wiki: ${mainImage}`);
      } else {
        // Fallback for both thumbnail and gallery
        lm.thumbnail = shuffledPool[0];
        lm.gallery = shuffledPool.slice(1, 5);
        fallbackCount++;
        console.log(`    ⚠️  Không có ảnh Wiki. Gán ảnh Unsplash vùng ${poolKey} (Thumbnail: ${lm.thumbnail})`);
      }
      
      // Short sleep to respect API limits
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // Safe overwrite of vietnam-data.js using bracket balancer
  console.log('\n📝 Đang lưu lại kết quả vào vietnam-data.js...');
  let fileContent = fs.readFileSync(VIETNAM_DATA_PATH, 'utf-8');
  
  const startIndex = fileContent.indexOf('const PROVINCES_AND_LANDMARKS = [');
  if (startIndex === -1) {
    console.error('❌ Lỗi: Không tìm thấy khai báo PROVINCES_AND_LANDMARKS trong vietnam-data.js!');
    return;
  }
  
  const endIndex = findArrayEnd(fileContent, startIndex);
  if (endIndex === -1) {
    console.error('❌ Lỗi: Không thể tìm thấy điểm kết thúc của mảng PROVINCES_AND_LANDMARKS!');
    return;
  }
  
  const newBlock = `const PROVINCES_AND_LANDMARKS = ${JSON.stringify(PROVINCES_AND_LANDMARKS, null, 2)};`;
  fileContent = fileContent.substring(0, startIndex) + newBlock + fileContent.substring(endIndex);
  
  fs.writeFileSync(VIETNAM_DATA_PATH, fileContent, 'utf-8');
  console.log(`\n🎉 HOÀN TẤT THÀNH CÔNG!`);
  console.log(`- Địa danh lấy được ảnh Wiki chính xác: ${successCount}`);
  console.log(`- Địa danh dùng ảnh Unsplash vùng: ${fallbackCount}`);
  console.log(`- Đã cập nhật tệp: ${VIETNAM_DATA_PATH}`);
}

run();
