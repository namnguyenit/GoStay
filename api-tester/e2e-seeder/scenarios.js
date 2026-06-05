const ApiClient = require('./api-client');
const {
  faker, IMAGE_POOLS, PROVINCES_AND_LANDMARKS, LISTING_TITLES, AMENITIES_LIST,
  offsetCoord, pick, pickN, randomInt, randomPrice
} = require('./vietnam-data');

// Small delay to prevent overwhelming local services
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class SeederScenarios {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.admin = new ApiClient(baseURL);
    this.users = [];    // All 30 created users
    this.hosts = [];    // Users[0..6] upgraded to HOST
    this.enterprises = []; // Users[7..9] upgraded to ENTERPRISE
    this.guests = [];   // Users[10..29] remain as USER
    this.landmarks = []; // Landmark objects fetched after creation
    this.createdListingIds = []; // Track all listing IDs for reviews
  }

  // ============================================================
  // CLEAR DATABASE
  // ============================================================
  async clearDatabase() {
    console.log('\n🗑️  CLEAR DATABASE — Đang xóa toàn bộ dữ liệu cũ...');

    // 1. Clear all listings via admin (soft delete by status change, or owner delete)
    console.log('   Xóa Listings...');
    let listingsDeleted = 0;
    let page = 0;
    while (true) {
      const listings = await this.admin.adminGetAllListings(page, 50);
      if (!listings || listings.length === 0) break;
      // Listings can only be deleted by owner, but we don't have owners' tokens anymore
      // So we mark them HIDDEN instead (admin action)
      for (const listing of listings) {
        try {
          await this.admin.client.patch(`/api/v1/catalog/admin/listings/${listing.id}/status?status=HIDDEN`);
          listingsDeleted++;
        } catch (e) { /* ignore */ }
      }
      if (listings.length < 50) break;
      page++;
    }
    console.log(`   → ${listingsDeleted} listings đã được ẩn.`);

    // 2. Delete non-admin users (fresh re-seed will create them anyway)
    // We do this via admin API
    console.log('   Xóa Users cũ (trừ admin)...');
    let usersDeleted = 0;
    page = 0;
    while (true) {
      const response = await this.admin.client.get(`/api/v1/admin/users?page=${page}&size=50`).catch(() => null);
      const content = response?.data?.data?.content || response?.data?.data || [];
      if (!content || content.length === 0) break;
      for (const user of content) {
        if (user.username === 'admin' || user.roles?.includes('ADMIN')) continue;
        const deleted = await this.admin.adminDeleteUser(user.id || user.userId);
        if (deleted) usersDeleted++;
        await sleep(50);
      }
      if (content.length < 50) break;
      page++;
    }
    console.log(`   → ${usersDeleted} users cũ đã xóa.`);

    console.log('✅ Clear xong! Bắt đầu seed data mới...\n');
  }

  // ============================================================
  // MAIN RUNNER
  // ============================================================
  async runAll() {
    console.log('🚀 Bắt đầu quá trình E2E Seeding...\n');

    // 1. Admin login
    await this.setupAdmin();

    // 2. Create 30 users
    await this.createUsers(30);

    // Partition users
    this.hosts = this.users.slice(0, 7);
    this.enterprises = this.users.slice(7, 10);
    this.guests = this.users.slice(10);

    // 3. Role upgrades + admin approval + token refresh
    await this.setupRoles();

    // 4. Admin creates Landmarks
    await this.createLandmarks();

    // 5. Hosts create listings (spread across provinces & near landmarks)
    await this.hostCreateListings();

    // 6. Enterprises create complexes + listings inside them
    await this.enterpriseCreateComplexes();

    // 7. Guests write reviews
    await this.guestSimulateReviews();

    console.log('\n✅ Quá trình E2E Seeding hoàn tất!');
  }

  // ============================================================
  // STEP 1: ADMIN SETUP
  // ============================================================
  async setupAdmin() {
    console.log('👤 [1/7] Setup Admin...');
    try {
      await this.admin.login('admin', '12345678');
      await this.admin.getProfile();
      console.log('   ✓ Admin đăng nhập thành công!');
    } catch (e) {
      console.log('   Admin chưa tồn tại, đang tạo mới...');
      await this.admin.register('admin', 'admin@gotravel.com', '12345678', 'System Admin', '0900000001', '1990-01-01', IMAGE_POOLS.AVATAR[0]);
      await this.admin.login('admin', '12345678');
      await this.admin.getProfile();
      console.log('   ✓ Admin đã tạo và đăng nhập!');
    }
  }

  // ============================================================
  // STEP 2: CREATE USERS
  // ============================================================
  async createUsers(count) {
    console.log(`\n👥 [2/7] Tạo ${count} người dùng ảo...`);
    let successCount = 0;

    for (let i = 0; i < count; i++) {
      const client = new ApiClient(this.baseURL);
      const username = 'user_' + faker.internet.username()
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase()
        .substring(0, 12)
        + '_' + randomInt(100, 999);
      const password = '1234567890';
      const fullName = faker.person.fullName();
      const dob = faker.date.past({ years: 20, refDate: '2000-01-01' }).toISOString().split('T')[0];
      const phone = '09' + randomInt(10000000, 99999999);

      try {
        await client.register(username, `${username}@gmail.com`, password, fullName, phone, dob, pick(IMAGE_POOLS.AVATAR));
        await client.login(username, password);
        await client.getProfile();
        client.password = password;
        this.users.push(client);
        successCount++;
        process.stdout.write(successCount % 10 === 0 ? `${successCount}` : '.');
        await sleep(100);
      } catch (e) {
        process.stdout.write('✗');
      }
    }
    console.log(`\n   ✓ Tạo xong ${successCount}/${count} users.`);
  }

  // ============================================================
  // STEP 3: SETUP ROLES
  // ============================================================
  async setupRoles() {
    console.log('\n🛡️  [3/7] Phân quyền Host và Enterprise...');

    // 3a. All hosts request HOST upgrade
    console.log('   → Hosts xin nâng cấp...');
    for (const host of this.hosts) {
      await host.upgradeToHost();
      await sleep(200);
    }

    // 3b. All enterprises request ENTERPRISE upgrade
    console.log('   → Enterprises xin nâng cấp...');
    for (const ent of this.enterprises) {
      await ent.upgradeToEnterprise();
      await sleep(200);
    }

    // 3c. Admin approves all hosts
    console.log('   → Admin phê duyệt Hosts...');
    let hostApproved = 0;
    for (const host of this.hosts) {
      if (!host.userId) { console.error(`     [WARN] Host ${host.username} has no userId`); continue; }
      const ok = await this.admin.adminApproveHost(host.userId);
      if (ok) hostApproved++;
      await sleep(200);
    }
    console.log(`     ✓ ${hostApproved}/${this.hosts.length} hosts approved`);

    // 3d. Admin approves all enterprises
    console.log('   → Admin phê duyệt Enterprises...');
    let entApproved = 0;
    for (const ent of this.enterprises) {
      if (!ent.userId) { console.error(`     [WARN] Enterprise ${ent.username} has no userId`); continue; }
      const ok = await this.admin.adminApproveEnterprise(ent.userId);
      if (ok) entApproved++;
      await sleep(200);
    }
    console.log(`     ✓ ${entApproved}/${this.enterprises.length} enterprises approved`);

    // 3e. CRITICAL: Relogin to get JWT with new roles
    console.log('   → Refresh JWT tokens với role mới...');
    for (const host of this.hosts) {
      await host.refreshToken();
      await sleep(150);
    }
    for (const ent of this.enterprises) {
      await ent.refreshToken();
      await sleep(150);
    }
    console.log('   ✓ Phân quyền hoàn tất!');
  }

  // ============================================================
  // STEP 4: CREATE LANDMARKS
  // ============================================================
  async createLandmarks() {
    console.log('\n🏛️  [4/7] Admin tạo Landmarks...');
    let created = 0;

    for (const provinceData of PROVINCES_AND_LANDMARKS) {
      for (const lm of provinceData.landmarks) {
        const payload = {
          name: lm.name,
          description: `Địa danh nổi tiếng bậc nhất tại ${provinceData.province}, thu hút hàng triệu du khách mỗi năm.`,
          province: provinceData.province,
          latitude: lm.lat,
          longitude: lm.lng,
          radiusMeters: randomInt(2000, 8000),
          isFeatured: true,
          thumbnailUrl: lm.thumbnail || pick(IMAGE_POOLS.LANDMARK),
          galleryUrls: lm.gallery || pickN(IMAGE_POOLS.LANDMARK, 4)
        };
        const res = await this.admin.createLandmark(payload);
        if (res && res.success) {
          created++;
        }
        await sleep(100);
      }
    }

    // After creating, fetch them back to get their IDs
    console.log(`   → ${created} landmarks đã được gửi. Đang lấy danh sách...`);
    await sleep(500);
    this.landmarks = await this.admin.adminGetLandmarks(0, 200);
    console.log(`   ✓ Fetch được ${this.landmarks.length} landmarks từ DB.`);
  }

  // ============================================================
  // GENERATE LISTING PAYLOAD
  // ============================================================
  generateListingPayload(provinceData, anchorLm, complexId = null) {
    const categories = ['STAY', 'STAY', 'EXP', 'SVC']; // STAY có tỉ lệ cao hơn
    const cat = pick(categories);
    const coord = offsetCoord(anchorLm.lat, anchorLm.lng, complexId ? 0.5 : 4.0);

    let subCategory = 'NONE';
    if (cat === 'SVC') {
      subCategory = pick(['SPA', 'MASSAGE', 'CHEF', 'PHOTOGRAPHY', 'TRAINING', 'MAKEUP', 'HAIR_STYLING', 'PREPARED_MEALS', 'CATERING']);
    }

    const priceUnit = cat === 'STAY' ? 'PER_NIGHT' : (cat === 'EXP' ? 'PER_PAX' : 'PER_HOUR');
    const titlePrefix = pick(LISTING_TITLES[cat]);
    const title = `${titlePrefix} ${anchorLm.name} ${randomInt(1, 999)}`;

    const attributes = {
      categoryType: cat === 'SVC' ? `SVC_${subCategory}` : cat,
      galleryUrls: pickN(IMAGE_POOLS[cat], 4),
    };

    if (cat === 'STAY') {
      const numBedrooms = randomInt(1, 5);
      attributes.stayDetail = {
        propertyType: pick(['homestay', 'villa', 'apartment', 'resort', 'bungalow', 'guesthouse']),
        maxGuests: numBedrooms * randomInt(1, 3),
        bedrooms: numBedrooms,
        beds: [{ type: pick(['single', 'double', 'queen', 'king']), quantity: numBedrooms }],
        bathrooms: randomInt(1, numBedrooms),
        roomSizeSqM: randomInt(18, 250)
      };
      attributes.amenities = pickN(AMENITIES_LIST, randomInt(4, 10));
      attributes.policies = {
        checkInTime: pick(['13:00', '14:00', '15:00']),
        checkOutTime: pick(['11:00', '12:00', '13:00']),
        cancellationPolicy: pick(['FLEXIBLE', 'MODERATE', 'STRICT'])
      };
    } else if (cat === 'EXP') {
      attributes.expDetail = {
        durationMinutes: pick([60, 90, 120, 180, 240, 360, 480]),
        difficulty: pick(['easy', 'moderate', 'hard']),
        groupSize: { min: 1, max: randomInt(5, 20) },
        meetingPoint: `${anchorLm.name}, ${provinceData.province}`,
        meetingPointLat: anchorLm.lat,
        meetingPointLng: anchorLm.lng,
        languages: pickN(['Tiếng Việt', 'English', '中文', '한국어', '日本語'], randomInt(1, 3)),
        includedItems: pickN(['Nước uống', 'Bữa sáng', 'Thiết bị', 'Hướng dẫn viên', 'Bảo hiểm'], randomInt(2, 4))
      };
    } else {
      // SVC
      attributes.serviceDetail = {
        durationMinutes: pick([60, 90, 120]),
        subType: subCategory
      };
      attributes.logistics = {
        serveAtClientLocation: Math.random() > 0.5,
        maxTravelRadiusKm: randomInt(5, 30)
      };
    }

    return {
      title,
      description: `${title} — Một trải nghiệm đặc sắc tại ${provinceData.province}. ${faker.lorem.sentence()}`,
      category: cat,
      subCategory,
      province: provinceData.province,
      basePrice: randomPrice(
        cat === 'STAY' ? 300000 : (cat === 'EXP' ? 150000 : 100000),
        cat === 'STAY' ? 5000000 : (cat === 'EXP' ? 2000000 : 1500000)
      ),
      priceUnit,
      latitude: coord.lat,
      longitude: coord.lng,
      complexId: complexId || null,
      thumbnailUrl: pick(IMAGE_POOLS[cat]),
      attributes
    };
  }

  // ============================================================
  // STEP 5: HOST CREATE LISTINGS
  // ============================================================
  async hostCreateListings() {
    console.log('\n🏠 [5/7] Hosts tạo Listings...');
    let totalCreated = 0;

    for (let i = 0; i < this.hosts.length; i++) {
      const host = this.hosts[i];
      // Each host operates in 3-5 different provinces
      const numProvinces = randomInt(3, 5);
      const hostProvinces = pickN(PROVINCES_AND_LANDMARKS, numProvinces);

      let hostCreated = 0;
      for (let j = 0; j < 20; j++) {
        const p = pick(hostProvinces);
        const lm = pick(p.landmarks);
        const payload = this.generateListingPayload(p, lm);
        const res = await host.createListing(payload);
        if (res && res.success) {
          hostCreated++;
          totalCreated++;
        }
        await sleep(120);
      }
      // Khởi tạo tồn kho (Inventory) cho các listings vừa tạo
      let hostInventoryInit = 0;
      if (hostCreated > 0) {
        await sleep(500); // Đợi DB commit xong
        const myLists = await host.getMyListings(0, 50); // Fetch lại 20 listings vừa tạo
        for (const ls of myLists) {
          const invPayload = {
            category: ls.category,
            quantity: ls.category === 'STAY' ? randomInt(2, 10) : randomInt(10, 50),
            timeSlots: ls.category === 'STAY' ? [] : ['08:00', '10:00', '14:00', '16:00']
          };
          const initRes = await host.initializeInventory(ls.id, invPayload);
          if (initRes && initRes.success) {
            hostInventoryInit++;
            await this.admin.adminChangeListingStatus(ls.id, 'ACTIVE');
          }
        }
      }

      console.log(`   Host ${i + 1} (@${host.username}): ✓ ${hostCreated}/20 listings, đã tạo kho cho ${hostInventoryInit} dịch vụ`);
    }
    console.log(`   ✓ Tổng: ${totalCreated} listings từ Hosts`);
  }

  // ============================================================
  // STEP 6: ENTERPRISE CREATE COMPLEXES + LISTINGS
  // ============================================================
  async enterpriseCreateComplexes() {
    console.log('\n🏢 [6/7] Enterprises tạo Complexes & Listings...');
    let totalComplexes = 0;
    let totalListings = 0;

    for (let i = 0; i < this.enterprises.length; i++) {
      const ent = this.enterprises[i];
      const entProvinces = pickN(PROVINCES_AND_LANDMARKS, 10);
      let entComplexes = 0;
      let entListings = 0;

      for (const p of entProvinces) {
        const lm = pick(p.landmarks);
        const coord = offsetCoord(lm.lat, lm.lng, 1.0);

        // Create complex
        const complexPayload = {
          name: `${pick(['Khu nghỉ dưỡng', 'Tổ hợp du lịch', 'Resort', 'Làng du lịch'])} ${p.province} — ${faker.company.name()}`,
          description: `Tổ hợp cao cấp nằm trong lòng ${p.province}, cách ${lm.name} chưa đến 5km.`,
          province: p.province,
          latitude: coord.lat,
          longitude: coord.lng,
          thumbnailUrl: pick(IMAGE_POOLS.COMPLEX),
          galleryUrls: pickN(IMAGE_POOLS.COMPLEX, 4)
        };

        const cRes = await ent.createComplex(complexPayload);
        if (cRes && cRes.success) {
          entComplexes++;
          totalComplexes++;

          // Fetch the created complex to get its ID
          await sleep(300);
          const myComplexes = await ent.getMyComplexes();
          // Use the most recently created one (last in list)
          const complexId = myComplexes.length > 0 ? myComplexes[myComplexes.length - 1].id : null;

          // Create 10 listings inside this complex
          for (let k = 0; k < 10; k++) {
            const anchor = { name: complexPayload.name, lat: coord.lat, lng: coord.lng };
            const listPayload = this.generateListingPayload(p, anchor, complexId);
            const lRes = await ent.createListing(listPayload);
            if (lRes && lRes.success) {
              entListings++;
              totalListings++;
            }
            await sleep(120);
          }
        } else {
          console.log(`   [WARN] Enterprise ${i + 1} không tạo được complex tại ${p.province} — JWT có thể chưa đúng role`);
        }
        await sleep(200);
      }
      // Khởi tạo tồn kho (Inventory) cho các listings của Enterprise
      let entInventoryInit = 0;
      if (entListings > 0) {
        await sleep(500);
        const myLists = await ent.getMyListings(0, 150); // Fetch tối đa 100 listings
        for (const ls of myLists) {
          const invPayload = {
            category: ls.category,
            quantity: ls.category === 'STAY' ? randomInt(5, 20) : randomInt(20, 100),
            timeSlots: ls.category === 'STAY' ? [] : ['08:00', '10:00', '14:00', '16:00']
          };
          const initRes = await ent.initializeInventory(ls.id, invPayload);
          if (initRes && initRes.success) {
            entInventoryInit++;
            await this.admin.adminChangeListingStatus(ls.id, 'ACTIVE');
          }
        }
      }

      console.log(`   Enterprise ${i + 1} (@${ent.username}): ✓ ${entComplexes}/10 complexes, ${entListings} listings, đã tạo kho cho ${entInventoryInit} dịch vụ`);
    }
    console.log(`   ✓ Tổng: ${totalComplexes} complexes, ${totalListings} listings từ Enterprises`);
  }

  // ============================================================
  // STEP 7: GUESTS WRITE REVIEWS
  // ============================================================
  async guestSimulateReviews() {
    console.log('\n⭐ [7/7] Guests viết Reviews...');

    // Fetch all listings via admin
    let allListings = [];
    let page = 0;
    while (true) {
      const batch = await this.admin.adminGetAllListings(page, 100);
      if (!batch || batch.length === 0) break;
      allListings = allListings.concat(batch);
      if (batch.length < 100) break;
      page++;
    }

    if (allListings.length === 0) {
      console.log('   [WARN] Không tìm được listing nào để review');
      return;
    }
    console.log(`   Tìm thấy ${allListings.length} listings để fake review...`);

    const reviewComments = [
      'Phục vụ quá tuyệt vời, rất hài lòng! Nhất định sẽ quay lại.',
      'Gần các địa điểm nổi tiếng, dễ di chuyển. Rất tiện lợi!',
      'Phòng sạch sẽ, giá cả hợp lý, chủ nhà thân thiện!',
      'Trải nghiệm thú vị đáng đồng tiền, mình đã giới thiệu cho bạn bè.',
      'Dịch vụ tốt, tiện ích đầy đủ đúng như mô tả.',
      'Cảnh đẹp, không khí trong lành, rất thích hợp để thư giãn.',
      'Đội ngũ hỗ trợ nhiệt tình, phản hồi nhanh. Thumbs up!',
      'Vị trí thuận tiện, gần trung tâm nhưng yên tĩnh.',
      'Bữa sáng ngon, view đẹp, giá cả cạnh tranh. Recommend!',
      'Hoàn toàn đáng tiền, sẽ đặt lại trong chuyến đi tiếp theo.',
      'Hướng dẫn viên nhiệt tình, hiểu biết địa điểm rất kỹ.',
      'Trải nghiệm khác biệt hoàn toàn so với tour thông thường.',
      'Không gian ấm cúng, decor đẹp, chụp ảnh ra là đẹp.',
      'Ổn định về chất lượng dịch vụ, đúng giờ, chuyên nghiệp.',
      'Lần đầu thử nhưng sẽ không phải lần cuối. Quá ổn!',
    ];

    let totalReviews = 0;
    for (const guest of this.guests) {
      const numReviews = randomInt(2, 6);
      const listingsToReview = pickN(allListings, numReviews);
      for (const listing of listingsToReview) {
        const rating = randomInt(3, 5); // Mostly positive (3-5 stars)
        const comment = pick(reviewComments);
        const res = await guest.createReview(listing.id, rating, comment);
        if (res) totalReviews++;
        await sleep(100);
      }
    }
    console.log(`   ✓ Đã tạo ${totalReviews} reviews từ ${this.guests.length} guests`);
  }
}

module.exports = SeederScenarios;
