const { Client } = require('pg');

async function runTruncate(dbName, queries) {
  const client = new Client({
    connectionString: `postgresql://gotravel_db:123456@localhost:5432/${dbName}`
  });
  try {
    await client.connect();
    for (const q of queries) {
      await client.query(q);
    }
    console.log(`   ✓ Xóa sạch dữ liệu trong [${dbName}]`);
  } catch (err) {
    console.error(`   ❌ Lỗi khi xóa dữ liệu [${dbName}]:`, err.message);
  } finally {
    await client.end();
  }
}

async function hardWipeDatabase() {
  console.log('\n⚠️  Đang thực hiện XÓA SẠCH (TRUNCATE) TOÀN BỘ Database Microservices...');

  try {
    // 1. CatalogListing
    await runTruncate('cataloglisting', [
      'TRUNCATE TABLE reviews CASCADE;',
      'TRUNCATE TABLE listings CASCADE;',
      'TRUNCATE TABLE complexes CASCADE;',
      'TRUNCATE TABLE landmark_suggestions CASCADE;',
      'TRUNCATE TABLE landmarks CASCADE;'
    ]);

    // 2. PaymentWallet
    await runTruncate('paymentwallet', [
      'TRUNCATE TABLE host_payouts CASCADE;',
      'TRUNCATE TABLE payment_requests CASCADE;',
      'TRUNCATE TABLE payment_transactions CASCADE;'
    ]);

    // 3. BookingInventory
    await runTruncate('bookinginventory', [
      'TRUNCATE TABLE inventory_locks CASCADE;',
      'TRUNCATE TABLE inventory_configs CASCADE;',
      'TRUNCATE TABLE inventory_calendars CASCADE;'
    ]);

    // 4. CartOrder
    await runTruncate('cartorder', [
      'TRUNCATE TABLE cart_items CASCADE;',
      'TRUNCATE TABLE carts CASCADE;',
      'TRUNCATE TABLE order_items CASCADE;',
      'TRUNCATE TABLE orders CASCADE;'
    ]);

    // 5. AuthDB (Xóa cẩn thận để giữ lại admin)
    const authClient = new Client({
      connectionString: 'postgresql://gotravel_db:123456@localhost:5432/auth_db'
    });
    await authClient.connect();
    await authClient.query(`
      DELETE FROM enterprise_profiles;
      DELETE FROM host_profiles;
      DELETE FROM users_roles WHERE user_id IN (SELECT id FROM users WHERE username != 'admin');
      DELETE FROM user_profiles WHERE user_id IN (SELECT id FROM users WHERE username != 'admin');
      DELETE FROM users WHERE username != 'admin';
    `);
    console.log(`   ✓ Xóa sạch dữ liệu trong [auth_db] (giữ lại admin)`);
    await authClient.end();

    console.log('\n✅ XÓA SẠCH TẤT CẢ DATABASE THÀNH CÔNG!\n');
  } catch (error) {
    console.error('\n❌ Lỗi nghiêm trọng khi xóa database:', error);
  }
}

module.exports = { hardWipeDatabase };
