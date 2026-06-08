const ApiClient = require('./api-client');

async function test() {
  const baseURL = 'http://localhost:5555'; // APIGateway Port
  const admin = new ApiClient(baseURL);
  
  console.log('1. Logging in as admin...');
  try {
    await admin.login('admin', '12345678');
    console.log('   ✅ Login successful!');
    
    console.log('2. Fetching profile...');
    await admin.getProfile();
    console.log('   ✅ Profile fetched, userId:', admin.userId);
    
    console.log('3. Sending test landmark creation request...');
    const testPayload = {
      name: 'Địa danh Thử nghiệm E2E',
      description: 'Mô tả thử nghiệm hệ thống địa danh.',
      province: 'Hà Nội',
      latitude: 21.0285,
      longitude: 105.8542,
      radiusMeters: 5000,
      isFeatured: true,
      thumbnailUrl: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=1200',
      galleryUrls: [
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200',
        'https://images.unsplash.com/photo-1562914399-bfb17f539e6a?w=1200'
      ]
    };
    
    const res = await admin.createLandmark(testPayload);
    if (res && res.success) {
      console.log('   🎉 SUCCESS! The Admin Landmark Creation feature is working perfectly!');
    } else {
      console.log('   ❌ FAILED! Create landmark returned invalid response.');
    }
  } catch (err) {
    console.error('   ❌ ERROR:', err.message);
    if (err.response) {
      console.error('   Response Status:', err.response.status);
      console.error('   Response Data:', JSON.stringify(err.response.data));
    }
  }
}

test();
