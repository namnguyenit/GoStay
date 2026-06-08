const inquirer = require('inquirer');
const SeederScenarios = require('./scenarios');
const { hardWipeDatabase } = require('./wipe');

const BASE_URL = 'http://localhost:5555'; // Cổng của APIGateway

async function showMenu(seeder) {
  const { choice } = await inquirer.default.prompt([
    {
      type: 'select',
      name: 'choice',
      message: 'Vui lòng chọn chức năng để chạy (Data Sheet Seeder):',
      choices: [
        { name: '1. Xoá hết toàn bộ dữ liệu Database (Hard Wipe SQL)', value: '1' },
        { name: '2. Chạy toàn bộ tiến trình sinh Data Sheet (Tự động từ A-Z)', value: '2' },
        new inquirer.default.Separator('--- Chạy từng bước cụ thể ---'),
        { name: '3. [Bước 1] - Đăng nhập / Tạo tài khoản Admin', value: '3' },
        { name: '4. [Bước 2] - Sinh 30 người dùng (User)', value: '4' },
        { name: '5. [Bước 3] - Nâng cấp quyền Host và Enterprise', value: '5' },
        { name: '6. [Bước 4] - Admin tạo các Địa danh (Landmarks)', value: '6' },
        { name: '7. [Bước 5] - Host tạo Listings (Khách sạn, Trải nghiệm, Dịch vụ)', value: '7' },
        { name: '8. [Bước 6] - Enterprise tạo Complexes (Tổ hợp) & Listings', value: '8' },
        { name: '9. [Bước 7] - Guest viết đánh giá (Reviews)', value: '9' },
        new inquirer.default.Separator(),
        { name: '0. Thoát chương trình', value: '0' }
      ]
    }
  ]);

  return choice;
}

async function main() {
  console.log('============================================');
  console.log('       🚀 BẮT ĐẦU E2E DATA SEEDER 🚀        ');
  console.log('============================================\n');

  // Initialize seeder state
  const seeder = new SeederScenarios(BASE_URL);

  while (true) {
    const choice = await showMenu(seeder);

    try {
      switch (choice) {
        case '1':
          await hardWipeDatabase();
          break;
        case '2':
          await hardWipeDatabase(); // Có thể hỏi lại hoặc mặc định wipe trước khi full run
          await seeder.runAll();
          printSummary(seeder);
          break;
        case '3':
          await seeder.setupAdmin();
          break;
        case '4':
          await seeder.createUsers(30);
          break;
        case '5':
          // Phân tách nếu array trống (nghĩa là user tự chọn B5 mà chưa chạy B4 trong phiên hiện tại)
          if (seeder.users.length === 0) {
            console.log('\n⚠️  Bạn chưa chạy Bước 2 trong phiên làm việc này. Cần có dữ liệu User trên bộ nhớ.');
            console.log('   Nếu Database đã có Users, hãy tự code logic fetchUsers() để nạp vào mảng.');
          } else {
            seeder.hosts = seeder.users.slice(0, 7);
            seeder.enterprises = seeder.users.slice(7, 10);
            seeder.guests = seeder.users.slice(10);
            await seeder.setupRoles();
          }
          break;
        case '6':
          if (!seeder.admin.token) await seeder.setupAdmin();
          await seeder.createLandmarks();
          break;
        case '7':
          if (seeder.hosts.length === 0) {
            console.log('\n⚠️  Chưa có dữ liệu Host trên bộ nhớ để chạy.');
          } else {
            await seeder.hostCreateListings();
          }
          break;
        case '8':
          if (seeder.enterprises.length === 0) {
            console.log('\n⚠️  Chưa có dữ liệu Enterprise trên bộ nhớ để chạy.');
          } else {
            await seeder.enterpriseCreateComplexes();
          }
          break;
        case '9':
          if (seeder.guests.length === 0) {
            console.log('\n⚠️  Chưa có dữ liệu Guest trên bộ nhớ để chạy.');
          } else {
            if (!seeder.admin.token) await seeder.setupAdmin();
            await seeder.guestSimulateReviews();
          }
          break;
        case '0':
          console.log('\n👋 Đã thoát chương trình.\n');
          process.exit(0);
      }
      console.log('\n--------------------------------------------\n');
    } catch (error) {
      console.error('\n❌ Quá trình gặp lỗi nghiêm trọng:', error);
      console.log('\n--------------------------------------------\n');
    }
  }
}

function printSummary(seeder) {
  console.log('\n============================================');
  console.log('🎉 TỔNG KẾT QUÁ TRÌNH SEEDING');
  console.log('============================================');
  console.log(`- Admin: 1 (admin/12345678)`);
  console.log(`- Hosts: ${seeder.hosts.length} users`);
  console.log(`- Enterprises: ${seeder.enterprises.length} users`);
  console.log(`- Guests: ${seeder.guests.length} users`);
  console.log(`- Landmarks lấy lại từ DB: ${seeder.landmarks.length}`);
  console.log('\n[Lưu ý]: Các password đều là "1234567890".');
  console.log('         Mở Elasticsearch dashboard hoặc đợi vài phút để data đồng bộ sang Search service.');
}

main();
