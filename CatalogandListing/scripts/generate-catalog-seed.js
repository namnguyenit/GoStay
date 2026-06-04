const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const deterministicUUID = (seedString) => {
  const hash = crypto.createHash('md5').update(seedString).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
};

const removeAccents = (str) =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

const normalizeSearchText = (str) => removeAccents(str).toLowerCase().replace(/\s+/g, ' ').trim();
const escapeSql = (str) => (str == null ? '' : String(str).replace(/'/g, "''"));
const sqlString = (str) => `'${escapeSql(str)}'`;
const sqlJsonb = (value) => `'${escapeSql(JSON.stringify(value))}'::jsonb`;
const pointSql = (lng, lat) => `ST_SetSRID(ST_MakePoint(${lng.toFixed(6)}, ${lat.toFixed(6)}), 4326)`;

let prngSeed = 1;
const prng = () => {
  const x = Math.sin(prngSeed++) * 10000;
  return x - Math.floor(x);
};

const pick = (items, index = Math.floor(prng() * items.length)) => items[index % items.length];
const intBetween = (min, max) => Math.floor(prng() * (max - min + 1)) + min;
const moneyBetween = (min, max) => Math.round(intBetween(min, max) / 10000) * 10000;
const ratingBetween = (min, max) => (min + prng() * (max - min)).toFixed(1);

const offsetCoord = (lat, lng, radiusKm) => {
  const angle = prng() * Math.PI * 2;
  const distanceKm = Math.sqrt(prng()) * radiusKm;
  const latOffset = (Math.cos(angle) * distanceKm) / 111;
  const lngOffset = (Math.sin(angle) * distanceKm) / (111 * Math.cos((lat * Math.PI) / 180));
  return {
    lat: Number((lat + latOffset).toFixed(6)),
    lng: Number((lng + lngOffset).toFixed(6)),
  };
};

const IMAGE_POOL = {
  LANDMARK: [
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200',
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200',
    'https://images.unsplash.com/photo-1555921015-5532091f6026?w=1200',
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200',
  ],
  COMPLEX: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200',
  ],
  STAY: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200',
  ],
  EXP: [
    'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200',
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200',
  ],
  SVC: [
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200',
    'https://images.unsplash.com/photo-1519824145371-296818a13be1?w=1200',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200',
  ],
};

const PROVINCES = [
  {
    name: 'Hà Nội',
    stay: 15,
    exp: 5,
    svc: 5,
    landmarks: [
      { name: 'Hồ Hoàn Kiếm', lat: 21.028779, lng: 105.852437, radiusMeters: 2500, featured: true },
      { name: 'Văn Miếu Quốc Tử Giám', lat: 21.028071, lng: 105.835536, radiusMeters: 2500 },
      { name: 'Phố cổ Hà Nội', lat: 21.035785, lng: 105.852248, radiusMeters: 3000 },
      { name: 'Lăng Bác', lat: 21.036873, lng: 105.834667, radiusMeters: 2500 },
      { name: 'Hồ Tây', lat: 21.061193, lng: 105.819454, radiusMeters: 4500 },
    ],
  },
  {
    name: 'Hồ Chí Minh',
    stay: 15,
    exp: 5,
    svc: 5,
    landmarks: [
      { name: 'Chợ Bến Thành', lat: 10.772129, lng: 106.698278, radiusMeters: 3000, featured: true },
      { name: 'Dinh Độc Lập', lat: 10.777034, lng: 106.695316, radiusMeters: 2500 },
      { name: 'Nhà thờ Đức Bà', lat: 10.779784, lng: 106.699018, radiusMeters: 2500 },
      { name: 'Phố đi bộ Nguyễn Huệ', lat: 10.774057, lng: 106.703919, radiusMeters: 2500 },
      { name: 'Landmark 81', lat: 10.795028, lng: 106.721831, radiusMeters: 3500 },
    ],
  },
  {
    name: 'Đà Nẵng',
    stay: 15,
    exp: 10,
    svc: 5,
    landmarks: [
      { name: 'Bà Nà Hills', lat: 15.995056, lng: 107.996919, radiusMeters: 12000, featured: true },
      { name: 'Bãi biển Mỹ Khê', lat: 16.054407, lng: 108.247459, radiusMeters: 5000 },
      { name: 'Cầu Rồng', lat: 16.06118, lng: 108.227018, radiusMeters: 3000 },
      { name: 'Bán đảo Sơn Trà', lat: 16.11533, lng: 108.273028, radiusMeters: 9000 },
      { name: 'Ngũ Hành Sơn', lat: 16.003677, lng: 108.263561, radiusMeters: 4500 },
    ],
  },
  {
    name: 'Quảng Ninh',
    stay: 10,
    exp: 10,
    svc: 5,
    landmarks: [
      { name: 'Vịnh Hạ Long', lat: 20.910052, lng: 107.183903, radiusMeters: 18000, featured: true },
      { name: 'Bãi Cháy', lat: 20.960938, lng: 107.040875, radiusMeters: 6000 },
      { name: 'Tuần Châu', lat: 20.923392, lng: 106.986694, radiusMeters: 6000 },
      { name: 'Yên Tử', lat: 21.151324, lng: 106.724806, radiusMeters: 10000 },
      { name: 'Bảo tàng Quảng Ninh', lat: 20.951973, lng: 107.081474, radiusMeters: 3500 },
    ],
  },
  {
    name: 'Lào Cai',
    stay: 10,
    exp: 5,
    svc: 5,
    landmarks: [
      { name: 'Đỉnh Fansipan', lat: 22.30331, lng: 103.775682, radiusMeters: 14000, featured: true },
      { name: 'Bản Cát Cát', lat: 22.32932, lng: 103.822247, radiusMeters: 5000 },
      { name: 'Núi Hàm Rồng', lat: 22.337437, lng: 103.845544, radiusMeters: 3500 },
      { name: 'Thung lũng Mường Hoa', lat: 22.303939, lng: 103.884674, radiusMeters: 8000 },
      { name: 'Nhà thờ đá Sapa', lat: 22.335178, lng: 103.842211, radiusMeters: 3000 },
    ],
  },
  {
    name: 'Ninh Bình',
    stay: 10,
    exp: 5,
    svc: 5,
    landmarks: [
      { name: 'Tràng An', lat: 20.250614, lng: 105.919182, radiusMeters: 9000, featured: true },
      { name: 'Tam Cốc Bích Động', lat: 20.21673, lng: 105.936044, radiusMeters: 6500 },
      { name: 'Hang Múa', lat: 20.229019, lng: 105.936953, radiusMeters: 4500 },
      { name: 'Chùa Bái Đính', lat: 20.276548, lng: 105.864799, radiusMeters: 8000 },
      { name: 'Cố đô Hoa Lư', lat: 20.252951, lng: 105.908633, radiusMeters: 5000 },
    ],
  },
  {
    name: 'Quảng Nam',
    stay: 10,
    exp: 5,
    svc: 5,
    landmarks: [
      { name: 'Phố cổ Hội An', lat: 15.880058, lng: 108.338047, radiusMeters: 4500, featured: true },
      { name: 'Cù Lao Chàm', lat: 15.953709, lng: 108.506752, radiusMeters: 9000 },
      { name: 'Thánh địa Mỹ Sơn', lat: 15.764996, lng: 108.122305, radiusMeters: 7000 },
      { name: 'Rừng dừa Bảy Mẫu', lat: 15.888295, lng: 108.376923, radiusMeters: 4500 },
      { name: 'Chùa Cầu', lat: 15.877873, lng: 108.326522, radiusMeters: 3000 },
    ],
  },
  {
    name: 'Thừa Thiên Huế',
    stay: 5,
    exp: 5,
    svc: 5,
    landmarks: [
      { name: 'Đại Nội Huế', lat: 16.469336, lng: 107.577947, radiusMeters: 4000, featured: true },
      { name: 'Lăng Tự Đức', lat: 16.432841, lng: 107.565676, radiusMeters: 4500 },
      { name: 'Chùa Thiên Mụ', lat: 16.453923, lng: 107.545971, radiusMeters: 4000 },
      { name: 'Cầu Trường Tiền', lat: 16.469279, lng: 107.592681, radiusMeters: 3000 },
      { name: 'Lăng Khải Định', lat: 16.397927, lng: 107.590013, radiusMeters: 4500 },
    ],
  },
  {
    name: 'Kiên Giang',
    stay: 10,
    exp: 5,
    svc: 5,
    landmarks: [
      { name: 'VinWonders Phú Quốc', lat: 10.33784, lng: 103.853291, radiusMeters: 7000, featured: true },
      { name: 'Bãi Sao', lat: 10.058596, lng: 104.03565, radiusMeters: 6500 },
      { name: 'Dinh Cậu', lat: 10.216551, lng: 103.959791, radiusMeters: 3500 },
      { name: 'Grand World Phú Quốc', lat: 10.327509, lng: 103.862151, radiusMeters: 6500 },
      { name: 'Hòn Thơm', lat: 9.955986, lng: 104.013811, radiusMeters: 7500 },
    ],
  },
  {
    name: 'Khánh Hòa',
    stay: 10,
    exp: 5,
    svc: 5,
    landmarks: [
      { name: 'VinWonders Nha Trang', lat: 12.21635, lng: 109.241655, radiusMeters: 6500, featured: true },
      { name: 'Tháp Bà Ponagar', lat: 12.265384, lng: 109.195628, radiusMeters: 3500 },
      { name: 'Hòn Mun', lat: 12.168193, lng: 109.309773, radiusMeters: 9000 },
      { name: 'Chợ Đầm', lat: 12.25287, lng: 109.191559, radiusMeters: 3000 },
      { name: 'Bãi Dài', lat: 12.060548, lng: 109.190627, radiusMeters: 9000 },
    ],
  },
];

const STAY_TYPES = [
  { propertyType: 'villa', title: 'Villa riêng gần {landmark}', base: 2200000, max: 6800000 },
  { propertyType: 'homestay', title: 'Homestay ấm cúng tại {province}', base: 650000, max: 1800000 },
  { propertyType: 'boutique_hotel', title: 'Phòng boutique gần {landmark}', base: 900000, max: 2600000 },
  { propertyType: 'apartment', title: 'Căn hộ dịch vụ trung tâm {province}', base: 1100000, max: 3200000 },
  { propertyType: 'resort_room', title: 'Phòng nghỉ dưỡng cạnh {landmark}', base: 1800000, max: 5200000 },
];

const EXP_TYPES = [
  { title: 'Tour khám phá {landmark} nửa ngày', difficulty: 'easy', duration: 240 },
  { title: 'Trải nghiệm văn hóa địa phương tại {province}', difficulty: 'easy', duration: 180 },
  { title: 'City tour qua {landmark}', difficulty: 'easy', duration: 300 },
  { title: 'Workshop ẩm thực và chợ địa phương {province}', difficulty: 'easy', duration: 210 },
  { title: 'Hành trình ngắm cảnh quanh {landmark}', difficulty: 'moderate', duration: 360 },
];

const SVC_TYPES = [
  { subCategory: 'SPA', title: 'Gói spa thư giãn gần {landmark}', priceUnit: 'PER_HOUR', min: 450000, max: 1200000 },
  { subCategory: 'MASSAGE', title: 'Massage trị liệu tận nơi tại {province}', priceUnit: 'PER_HOUR', min: 350000, max: 950000 },
  { subCategory: 'CHEF', title: 'Đầu bếp riêng bữa tối địa phương {province}', priceUnit: 'PER_HOUR', min: 1200000, max: 3500000 },
  { subCategory: 'PHOTOGRAPHY', title: 'Nhiếp ảnh gia chụp ảnh tại {landmark}', priceUnit: 'PER_HOUR', min: 900000, max: 2500000 },
  { subCategory: 'MAKEUP', title: 'Makeup và làm tóc du lịch tại {province}', priceUnit: 'PER_HOUR', min: 500000, max: 1600000 },
];

const DUMMY_HOSTS = Array.from({ length: 24 }, (_, i) => deterministicUUID(`host_${i}`));
const DUMMY_USERS = Array.from({ length: 80 }, (_, i) => deterministicUUID(`user_${i}`));

const fillTemplate = (template, context) =>
  template.replace(/\{province\}/g, context.province.name).replace(/\{landmark\}/g, context.landmark.name);

const imageSet = (type, seed) => {
  const pool = IMAGE_POOL[type];
  const first = pool[Math.abs(seed) % pool.length];
  const second = pool[Math.abs(seed + 1) % pool.length];
  const third = pool[Math.abs(seed + 2) % pool.length];
  return {
    thumbnailUrl: first,
    galleryUrls: [first, second, third],
  };
};

const stayAttributes = (variant, images, guests) => ({
  categoryType: 'STAY',
  galleryUrls: images.galleryUrls,
  stayDetail: {
    propertyType: variant.propertyType,
    roomSizeSqM: intBetween(28, 120),
    maxGuests: guests,
    bedrooms: Math.max(1, Math.ceil(guests / 2) - 1),
    beds: [
      {
        type: guests > 4 ? 'queen' : 'double',
        quantity: Math.max(1, Math.ceil(guests / 2)),
      },
    ],
    bathrooms: guests > 4 ? 2 : 1,
  },
  amenities: ['wifi', 'air_conditioning', 'private_bathroom', 'breakfast', 'pool'].slice(0, intBetween(3, 5)),
  policies: {
    checkInTime: '14:00',
    checkOutTime: '12:00',
    allowPets: prng() > 0.7,
    allowSmoking: false,
    partyAllowed: false,
  },
});

const expAttributes = (variant, anchor) => ({
  categoryType: 'EXP',
  galleryUrls: imageSet('EXP', intBetween(1, 100)).galleryUrls,
  expDetail: {
    durationMinutes: variant.duration,
    difficulty: variant.difficulty,
    languages: ['vi', 'en'],
    groupSize: {
      min: 1,
      max: intBetween(8, 20),
    },
    meetingPoint: `Cổng chính ${anchor.name}`,
    meetingPointLat: anchor.lat,
    meetingPointLng: anchor.lng,
  },
  inclusions: ['hướng dẫn viên', 'vé tham quan cơ bản', 'nước uống'],
  exclusions: ['chi phí cá nhân', 'đưa đón ngoài khu vực'],
  itinerary: [
    { time: '08:00', activity: `Gặp hướng dẫn viên tại ${anchor.name}` },
    { time: '10:00', activity: 'Tham quan và trải nghiệm chính' },
    { time: '12:00', activity: 'Kết thúc chương trình' },
  ],
});

const logistics = (radiusKm = 10) => ({
  serveAtClientLocation: true,
  maxTravelRadiusKm: radiusKm,
  equipmentRequiredFromClient: 'Không',
  deliveryTimeWindow: '08:00 - 20:00',
  facilityRequired: 'Không gian phù hợp với dịch vụ',
  cleanupProvided: true,
  equipmentProvided: 'Đầy đủ thiết bị cơ bản',
  setupTimeHours: 1,
});

const serviceAttributes = (subCategory, images) => {
  const base = {
    categoryType: `SVC_${subCategory}`,
    galleryUrls: images.galleryUrls,
    logistics: logistics(intBetween(8, 18)),
  };

  switch (subCategory) {
    case 'SPA':
      return {
        ...base,
        serviceDetail: {
          treatments: ['body treatment', 'facial care', 'aroma therapy'],
          organicProductsOnly: true,
          durationMinutes: 120,
          genderPreference: 'any',
        },
      };
    case 'MASSAGE':
      return {
        ...base,
        serviceDetail: {
          massageType: ['relaxing', 'deep tissue'],
          durationMinutes: 90,
          genderPreference: 'any',
          equipmentProvided: 'massage bed, essential oil, towel',
        },
      };
    case 'CHEF':
      return {
        ...base,
        serviceDetail: {
          cuisineType: ['Vietnamese', 'local seafood'],
          includesIngredients: true,
          cleanUpAfter: true,
          specialDietary: ['vegetarian on request'],
        },
      };
    case 'PHOTOGRAPHY':
      return {
        ...base,
        serviceDetail: {
          providerType: 'professional_photographer',
          durationMinutes: 120,
          deliveryDays: 3,
          deliverables: '80 edited photos',
          cameraGear: 'full-frame camera, prime lens',
        },
      };
    case 'MAKEUP':
      return {
        ...base,
        serviceDetail: {
          makeupStyle: ['natural', 'travel portrait', 'event'],
          includesHair: true,
          durationMinutes: 90,
          brandsUsed: ['MAC', 'NARS', 'Dior'],
        },
      };
    default:
      return base;
  }
};

const listingInsert = (listing) => {
  const attrs = sqlJsonb(listing.attributes);
  return `INSERT INTO public.listings (id, created_at, updated_at, title, title_normalized, description, category, sub_category, province, base_price, price_unit, latitude, longitude, location, complex_id, host_id, average_rating, total_reviews, status, thumbnail_url, attributes) VALUES ` +
    `(${sqlString(listing.id)}, NOW(), NOW(), ${sqlString(listing.title)}, ${sqlString(normalizeSearchText(listing.title))}, ${sqlString(listing.description)}, ${sqlString(listing.category)}, ${sqlString(listing.subCategory)}, ${sqlString(listing.province)}, ${listing.basePrice}, ${sqlString(listing.priceUnit)}, ${listing.lat.toFixed(6)}, ${listing.lng.toFixed(6)}, ${pointSql(listing.lng, listing.lat)}, ${listing.complexId ? sqlString(listing.complexId) : 'NULL'}, ${sqlString(listing.hostId)}, ${listing.averageRating}, ${listing.totalReviews}, 'ACTIVE', ${sqlString(listing.thumbnailUrl)}, ${attrs})\n` +
    `ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, title_normalized = EXCLUDED.title_normalized, description = EXCLUDED.description, category = EXCLUDED.category, sub_category = EXCLUDED.sub_category, province = EXCLUDED.province, base_price = EXCLUDED.base_price, price_unit = EXCLUDED.price_unit, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, location = EXCLUDED.location, complex_id = EXCLUDED.complex_id, host_id = EXCLUDED.host_id, average_rating = EXCLUDED.average_rating, total_reviews = EXCLUDED.total_reviews, status = EXCLUDED.status, thumbnail_url = EXCLUDED.thumbnail_url, attributes = EXCLUDED.attributes, updated_at = NOW();\n`;
};

let sql = `-- Flyway Migration: Seed realistic demo data for Catalog & Listing\n`;
sql += `-- Generated by CatalogandListing/scripts/generate-catalog-seed.js\n`;
sql += `SET statement_timeout = 0;\n\n`;

const landmarks = [];
for (const province of PROVINCES) {
  province.landmarks.forEach((landmark, index) => {
    const id = deterministicUUID(`landmark_${province.name}_${landmark.name}`);
    const images = imageSet('LANDMARK', index + province.name.length);
    const row = {
      id,
      ...landmark,
      province: province.name,
      thumbnailUrl: images.thumbnailUrl,
      galleryUrls: images.galleryUrls,
    };
    landmarks.push(row);

    sql += `INSERT INTO public.landmarks (id, created_at, updated_at, name, name_normalized, description, province, latitude, longitude, location, radius_meters, is_featured, status, thumbnail_url, gallery_urls) VALUES `;
    sql += `(${sqlString(id)}, NOW(), NOW(), ${sqlString(landmark.name)}, ${sqlString(normalizeSearchText(landmark.name))}, ${sqlString(`Thông tin du lịch và các dịch vụ nổi bật quanh ${landmark.name}.`)}, ${sqlString(province.name)}, ${landmark.lat.toFixed(6)}, ${landmark.lng.toFixed(6)}, ${pointSql(landmark.lng, landmark.lat)}, ${landmark.radiusMeters}, ${landmark.featured === true}, 'ACTIVE', ${sqlString(images.thumbnailUrl)}, ${sqlJsonb(images.galleryUrls)})\n`;
    sql += `ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, name_normalized = EXCLUDED.name_normalized, description = EXCLUDED.description, province = EXCLUDED.province, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, location = EXCLUDED.location, radius_meters = EXCLUDED.radius_meters, is_featured = EXCLUDED.is_featured, status = EXCLUDED.status, thumbnail_url = EXCLUDED.thumbnail_url, gallery_urls = EXCLUDED.gallery_urls, updated_at = NOW();\n`;
  });
}
sql += `\n`;

const complexes = [];
for (const province of PROVINCES) {
  const provinceLandmarks = landmarks.filter((item) => item.province === province.name);
  for (let i = 0; i < 2; i++) {
    const anchor = provinceLandmarks[i % provinceLandmarks.length];
    const coord = offsetCoord(anchor.lat, anchor.lng, 1.2);
    const id = deterministicUUID(`complex_${province.name}_${i}`);
    const hostId = DUMMY_HOSTS[(PROVINCES.indexOf(province) * 2 + i) % DUMMY_HOSTS.length];
    const images = imageSet('COMPLEX', i + province.name.length);
    const name =
      i === 0
        ? `Tổ hợp nghỉ dưỡng gần ${anchor.name}`
        : `Khu trải nghiệm và lưu trú ${province.name}`;

    const complex = {
      id,
      hostId,
      name,
      province: province.name,
      lat: coord.lat,
      lng: coord.lng,
      thumbnailUrl: images.thumbnailUrl,
      galleryUrls: images.galleryUrls,
    };
    complexes.push(complex);

    sql += `INSERT INTO public.complexes (id, created_at, updated_at, name, description, province, latitude, longitude, location, status, thumbnail_url, gallery_urls, host_id) VALUES `;
    sql += `(${sqlString(id)}, NOW(), NOW(), ${sqlString(name)}, ${sqlString(`Tổ hợp lưu trú, trải nghiệm và dịch vụ tại ${province.name}, thuận tiện di chuyển tới ${anchor.name}.`)}, ${sqlString(province.name)}, ${coord.lat.toFixed(6)}, ${coord.lng.toFixed(6)}, ${pointSql(coord.lng, coord.lat)}, 'ACTIVE', ${sqlString(images.thumbnailUrl)}, ${sqlJsonb(images.galleryUrls)}, ${sqlString(hostId)})\n`;
    sql += `ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, province = EXCLUDED.province, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, location = EXCLUDED.location, status = EXCLUDED.status, thumbnail_url = EXCLUDED.thumbnail_url, gallery_urls = EXCLUDED.gallery_urls, host_id = EXCLUDED.host_id, updated_at = NOW();\n`;
  }
}
sql += `\n`;

const listings = [];
for (const province of PROVINCES) {
  const provinceLandmarks = landmarks.filter((item) => item.province === province.name);
  const provinceComplexes = complexes.filter((item) => item.province === province.name);

  const createListing = (category, index) => {
    const anchor = provinceLandmarks[index % provinceLandmarks.length];
    const complex = category === 'STAY' && prng() < 0.65 ? provinceComplexes[index % provinceComplexes.length] : null;
    const baseCoord = complex || anchor;
    const coord = offsetCoord(baseCoord.lat, baseCoord.lng, complex ? 0.45 : Math.min(anchor.radiusMeters / 1000, 3.5));
    const images = imageSet(category, index + province.name.length);
    const hostId = complex ? complex.hostId : DUMMY_HOSTS[(index + category.length + province.name.length) % DUMMY_HOSTS.length];

    if (category === 'STAY') {
      const variant = STAY_TYPES[index % STAY_TYPES.length];
      const guests = intBetween(2, 8);
      const title = fillTemplate(variant.title, { province, landmark: anchor });
      return {
        id: deterministicUUID(`listing_${province.name}_STAY_${index}`),
        title: `${title} ${index + 1}`,
        description: `Không gian lưu trú phù hợp cho khách du lịch muốn khám phá ${anchor.name} và các điểm đến tại ${province.name}.`,
        category: 'STAY',
        subCategory: 'NONE',
        province: province.name,
        basePrice: moneyBetween(variant.base, variant.max),
        priceUnit: 'PER_NIGHT',
        lat: coord.lat,
        lng: coord.lng,
        complexId: complex?.id,
        hostId,
        averageRating: ratingBetween(4.1, 5),
        totalReviews: intBetween(18, 180),
        thumbnailUrl: images.thumbnailUrl,
        attributes: stayAttributes(variant, images, guests),
      };
    }

    if (category === 'EXP') {
      const variant = EXP_TYPES[index % EXP_TYPES.length];
      const title = fillTemplate(variant.title, { province, landmark: anchor });
      return {
        id: deterministicUUID(`listing_${province.name}_EXP_${index}`),
        title: `${title} ${index + 1}`,
        description: `Trải nghiệm được thiết kế cho du khách muốn hiểu sâu hơn về ${anchor.name} và văn hóa địa phương ${province.name}.`,
        category: 'EXP',
        subCategory: 'NONE',
        province: province.name,
        basePrice: moneyBetween(350000, 1800000),
        priceUnit: 'PER_PAX',
        lat: coord.lat,
        lng: coord.lng,
        complexId: null,
        hostId,
        averageRating: ratingBetween(4.0, 5),
        totalReviews: intBetween(12, 130),
        thumbnailUrl: images.thumbnailUrl,
        attributes: expAttributes(variant, anchor),
      };
    }

    const variant = SVC_TYPES[index % SVC_TYPES.length];
    const title = fillTemplate(variant.title, { province, landmark: anchor });
    return {
      id: deterministicUUID(`listing_${province.name}_SVC_${index}`),
      title: `${title} ${index + 1}`,
      description: `Dịch vụ tận nơi quanh khu vực ${anchor.name}, phù hợp để kết hợp cùng lưu trú và trải nghiệm tại ${province.name}.`,
      category: 'SVC',
      subCategory: variant.subCategory,
      province: province.name,
      basePrice: moneyBetween(variant.min, variant.max),
      priceUnit: variant.priceUnit,
      lat: coord.lat,
      lng: coord.lng,
      complexId: null,
      hostId,
      averageRating: ratingBetween(4.0, 5),
      totalReviews: intBetween(10, 110),
      thumbnailUrl: images.thumbnailUrl,
      attributes: serviceAttributes(variant.subCategory, images),
    };
  };

  for (let i = 0; i < province.stay; i++) listings.push(createListing('STAY', i));
  for (let i = 0; i < province.exp; i++) listings.push(createListing('EXP', i));
  for (let i = 0; i < province.svc; i++) listings.push(createListing('SVC', i));
}

for (const listing of listings) {
  sql += listingInsert(listing);
}
sql += `\n`;

const reviewComments = [
  'Vị trí thuận tiện, trải nghiệm đúng như mô tả.',
  'Dịch vụ chuyên nghiệp, phù hợp cho chuyến đi gia đình.',
  'Ảnh và thông tin rõ ràng, đặt dịch vụ rất yên tâm.',
  'Nhân viên hỗ trợ tốt, khu vực xung quanh nhiều điểm tham quan.',
  'Tôi sẽ quay lại nếu có dịp đến khu vực này.',
];

for (const [listingIndex, listing] of listings.entries()) {
  const reviewCount = intBetween(2, 4);
  for (let i = 0; i < reviewCount; i++) {
    const id = deterministicUUID(`review_${listing.id}_${i}`);
    const userId = DUMMY_USERS[(listingIndex + i) % DUMMY_USERS.length];
    const rating = intBetween(4, 5);
    const comment = `${pick(reviewComments, listingIndex + i)} ${listing.title}`;
    sql += `INSERT INTO public.reviews (id, created_at, listing_id, user_id, rating, comment, images) VALUES `;
    sql += `(${sqlString(id)}, NOW(), ${sqlString(listing.id)}, ${sqlString(userId)}, ${rating}, ${sqlString(comment)}, '[]'::jsonb)\n`;
    sql += `ON CONFLICT (id) DO NOTHING;\n`;
  }
}

sql += `\n-- Verification Block\n`;
sql += `DO $$\n`;
sql += `DECLARE\n`;
sql += `  missing_listing_locations integer;\n`;
sql += `  missing_landmark_locations integer;\n`;
sql += `  missing_complex_locations integer;\n`;
sql += `  missing_listing_normalized integer;\n`;
sql += `  missing_landmark_normalized integer;\n`;
sql += `  missing_thumbnail_count integer;\n`;
sql += `  stay_count integer;\n`;
sql += `  exp_count integer;\n`;
sql += `  svc_count integer;\n`;
sql += `  featured_landmark_count integer;\n`;
sql += `  province_without_all_categories integer;\n`;
sql += `BEGIN\n`;
sql += `  SELECT COUNT(*) INTO missing_listing_locations FROM public.listings WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL;\n`;
sql += `  SELECT COUNT(*) INTO missing_landmark_locations FROM public.landmarks WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL;\n`;
sql += `  SELECT COUNT(*) INTO missing_complex_locations FROM public.complexes WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL;\n`;
sql += `  IF missing_listing_locations > 0 OR missing_landmark_locations > 0 OR missing_complex_locations > 0 THEN\n`;
sql += `    RAISE EXCEPTION 'Seed verification failed: missing locations listings=%, landmarks=%, complexes=%', missing_listing_locations, missing_landmark_locations, missing_complex_locations;\n`;
sql += `  END IF;\n`;
sql += `  SELECT COUNT(*) INTO missing_listing_normalized FROM public.listings WHERE status = 'ACTIVE' AND title IS NOT NULL AND title_normalized IS NULL;\n`;
sql += `  SELECT COUNT(*) INTO missing_landmark_normalized FROM public.landmarks WHERE status = 'ACTIVE' AND name IS NOT NULL AND name_normalized IS NULL;\n`;
sql += `  IF missing_listing_normalized > 0 OR missing_landmark_normalized > 0 THEN\n`;
sql += `    RAISE EXCEPTION 'Seed verification failed: missing normalized text listings=%, landmarks=%', missing_listing_normalized, missing_landmark_normalized;\n`;
sql += `  END IF;\n`;
sql += `  SELECT COUNT(*) INTO missing_thumbnail_count FROM public.listings WHERE status = 'ACTIVE' AND (thumbnail_url IS NULL OR thumbnail_url = '');\n`;
sql += `  IF missing_thumbnail_count > 0 THEN\n`;
sql += `    RAISE EXCEPTION 'Seed verification failed: % active listings missing thumbnail', missing_thumbnail_count;\n`;
sql += `  END IF;\n`;
sql += `  SELECT COUNT(*) INTO stay_count FROM public.listings WHERE status = 'ACTIVE' AND category = 'STAY';\n`;
sql += `  SELECT COUNT(*) INTO exp_count FROM public.listings WHERE status = 'ACTIVE' AND category = 'EXP';\n`;
sql += `  SELECT COUNT(*) INTO svc_count FROM public.listings WHERE status = 'ACTIVE' AND category = 'SVC';\n`;
sql += `  IF stay_count < 100 OR exp_count < 60 OR svc_count < 50 THEN\n`;
sql += `    RAISE EXCEPTION 'Seed verification failed: category counts STAY=%, EXP=%, SVC=%', stay_count, exp_count, svc_count;\n`;
sql += `  END IF;\n`;
sql += `  SELECT COUNT(*) INTO featured_landmark_count FROM public.landmarks WHERE status = 'ACTIVE' AND is_featured = true;\n`;
sql += `  IF featured_landmark_count < 6 THEN\n`;
sql += `    RAISE EXCEPTION 'Seed verification failed: only % featured landmarks', featured_landmark_count;\n`;
sql += `  END IF;\n`;
sql += `  WITH active_provinces AS (\n`;
sql += `    SELECT DISTINCT province FROM public.landmarks WHERE status = 'ACTIVE' AND province IS NOT NULL\n`;
sql += `  ), province_category_counts AS (\n`;
sql += `    SELECT p.province, COUNT(DISTINCT l.category) AS category_count\n`;
sql += `    FROM active_provinces p\n`;
sql += `    LEFT JOIN public.listings l ON l.province = p.province AND l.status = 'ACTIVE'\n`;
sql += `    GROUP BY p.province\n`;
sql += `  )\n`;
sql += `  SELECT COUNT(*) INTO province_without_all_categories FROM province_category_counts WHERE category_count < 3;\n`;
sql += `  IF province_without_all_categories > 0 THEN\n`;
sql += `    RAISE EXCEPTION 'Seed verification failed: % provinces do not have all listing categories', province_without_all_categories;\n`;
sql += `  END IF;\n`;
sql += `  RAISE NOTICE 'Seed verification passed: STAY=%, EXP=%, SVC=%, featured landmarks=%', stay_count, exp_count, svc_count, featured_landmark_count;\n`;
sql += `END $$;\n`;

const destDir = path.join(__dirname, '..', 'src', 'main', 'resources', 'db', 'migration');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const destFile = path.join(destDir, 'V10__seed_demo_catalog_data.sql');
fs.writeFileSync(destFile, sql, 'utf8');

console.log(
  `Generated catalog seed: ${landmarks.length} landmarks, ${complexes.length} complexes, ${listings.length} listings -> ${destFile}`,
);
