const axios = require('axios');

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' }
    });
    this.token = null;
    this.userId = null;
    this.username = null;
    this.password = null;
  }

  setToken(token) {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // ============================================================
  // AUTH
  // ============================================================
  async register(username, email, password, fullName, phoneNumber, dateOfBirth, avatarUrl) {
    try {
      const res = await this.client.post('/api/v1/auth/register', {
        username, email, password, fullName, phoneNumber, dateOfBirth, avatarUrl
      });
      return res.data;
    } catch (e) {
      console.error(`  [FAIL] Register ${username}: ${e.response?.data?.message || e.message}`);
      throw e;
    }
  }

  async login(username, password) {
    try {
      const res = await this.client.post('/api/v1/auth/login', { username, password });
      const token = res.data?.data?.token;
      if (!token) throw new Error('No token returned from login');
      this.setToken(token);
      this.username = username;
      this.password = password;
      return res.data;
    } catch (e) {
      console.error(`  [FAIL] Login ${username}: ${e.response?.data?.message || e.message}`);
      throw e;
    }
  }

  async getProfile() {
    try {
      const res = await this.client.get('/api/v1/me');
      this.userId = res.data?.data?.id || res.data?.id;
      if (this.userId) {
        this.client.defaults.headers.common['X-User-Id'] = this.userId;
      }
      return res.data;
    } catch (e) {
      // Non-fatal: just log
      console.error(`  [WARN] getProfile failed: ${e.response?.data?.message || e.message}`);
    }
  }

  // Relogin to refresh JWT with new roles after role upgrade
  async refreshToken() {
    if (!this.username || !this.password) return;
    try {
      await this.login(this.username, this.password);
    } catch (e) {
      console.error(`  [FAIL] refreshToken for ${this.username}`);
    }
  }

  // ============================================================
  // USER ROLE UPGRADES
  // ============================================================
  async upgradeToHost() {
    try {
      const randomID = () => Math.floor(100000000000 + Math.random() * 900000000000).toString();
      const randomTax = () => Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const FormData = require('form-data');
      const form = new FormData();
      form.append('fullName', this.username || 'Nguyen Van Host');
      form.append('phone', '09' + Math.floor(10000000 + Math.random() * 89999999));
      form.append('cccdNumber', randomID());
      form.append('taxCode', randomTax());
      form.append('idCard', randomID());
      form.append('bankAccount', '' + Math.floor(100000000 + Math.random() * 899999999));
      form.append('bankName', ['VCB', 'MB', 'TCB', 'ACB', 'BIDV'][Math.floor(Math.random() * 5)]);
      form.append('frontImage', Buffer.from('fake-front-image'), { filename: 'front.jpg', contentType: 'image/jpeg' });
      form.append('backImage', Buffer.from('fake-back-image'), { filename: 'back.jpg', contentType: 'image/jpeg' });
      const res = await this.client.post('/api/v1/me/upgrade-host', form, {
        headers: form.getHeaders()
      });
      return res.data;
    } catch (e) {
      console.error(`  [FAIL] upgradeToHost ${this.username}: ${e.response?.data?.message || e.message}`);
    }
  }

  async upgradeToEnterprise() {
    try {
      const randomTax = () => Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const companyNames = [
        'Công ty TNHH GoTravel', 'Tập đoàn Du lịch Việt', 'Công ty CP Lữ Hành Quốc Tế',
        'Tổng Công ty Du lịch Saigon', 'Công ty TNHH Vietravel',
        'Công ty Du lịch Hà Nội', 'Công ty CP Thế Giới Lữ Hành'
      ];
      const res = await this.client.post('/api/v1/me/upgrade-enterprise', {
        companyName: companyNames[Math.floor(Math.random() * companyNames.length)] + ' ' + Math.floor(Math.random() * 999),
        taxCode: randomTax(),
        companyAddress: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'][Math.floor(Math.random() * 3)],
        representativeName: 'Nguyen Van Doanh Nghiep'
      });
      return res.data;
    } catch (e) {
      console.error(`  [FAIL] upgradeToEnterprise ${this.username}: ${e.response?.data?.message || e.message}`);
    }
  }

  // ============================================================
  // ADMIN ACTIONS
  // ============================================================
  async adminApproveHost(userId) {
    try {
      const res = await this.client.post(`/api/v1/admin/hosts/${userId}/success`, {});
      return res.data;
    } catch (e) {
      console.error(`  [FAIL] adminApproveHost ${userId}: ${e.response?.data?.message || e.message}`);
    }
  }

  async adminApproveEnterprise(userId) {
    try {
      const res = await this.client.post(`/api/v1/admin/enterprises/${userId}/success`, {});
      return res.data;
    } catch (e) {
      console.error(`  [FAIL] adminApproveEnterprise ${userId}: ${e.response?.data?.message || e.message}`);
    }
  }

  async adminGetAllUsers(page = 0, size = 50) {
    try {
      const res = await this.client.get(`/api/v1/admin/users?page=${page}&size=${size}`);
      return res.data?.data || [];
    } catch (e) {
      console.error(`  [FAIL] adminGetAllUsers: ${e.response?.data?.message || e.message}`);
      return [];
    }
  }

  async adminDeleteUser(userId) {
    try {
      await this.client.delete(`/api/v1/admin/users/${userId}`);
      return true;
    } catch (e) {
      // Silently fail – user might not exist
      return false;
    }
  }

  // ============================================================
  // LANDMARKS
  // ============================================================
  async createLandmark(payload) {
    try {
      const res = await this.client.post('/api/v1/catalog/admin/landmarks', payload);
      // API returns 201 with no body data (Void return type)
      // We just return true to indicate success
      return res.status === 201 ? { success: true } : null;
    } catch (e) {
      console.error(`  [FAIL] createLandmark "${payload.name}": ${e.response?.data?.message || e.message}`);
      return null;
    }
  }

  async adminGetLandmarks(page = 0, size = 100) {
    try {
      const res = await this.client.get(`/api/v1/catalog/admin/landmarks?page=${page}&size=${size}`);
      return res.data?.data?.content || [];
    } catch (e) {
      console.error(`  [FAIL] adminGetLandmarks: ${e.response?.data?.message || e.message}`);
      return [];
    }
  }

  // ============================================================
  // COMPLEXES
  // ============================================================
  async createComplex(payload) {
    try {
      const res = await this.client.post('/api/v1/catalog/host/complexes', payload);
      return res.status === 201 ? { success: true } : null;
    } catch (e) {
      console.error(`  [FAIL] createComplex "${payload.name}": ${e.response?.data?.message || e.message}`);
      return null;
    }
  }

  async getMyComplexes() {
    try {
      const res = await this.client.get('/api/v1/catalog/host/complexes');
      return res.data?.data || [];
    } catch (e) {
      console.error(`  [FAIL] getMyComplexes: ${e.response?.data?.message || e.message}`);
      return [];
    }
  }

  // ============================================================
  // LISTINGS
  // ============================================================
  async createListing(payload) {
    try {
      const res = await this.client.post('/api/v1/catalog/host/listings', payload);
      return res.status === 201 ? { success: true, data: res.data?.data } : null;
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      console.error(`  [FAIL] createListing "${payload.title?.substring(0, 40)}": ${msg}`);
      return null;
    }
  }

  async getMyListings(page = 0, size = 100) {
    try {
      const res = await this.client.get(`/api/v1/catalog/host/listings?page=${page}&size=${size}`);
      return res.data?.data?.content || [];
    } catch (e) {
      return [];
    }
  }

  async adminGetAllListings(page = 0, size = 100) {
    try {
      const res = await this.client.get(`/api/v1/catalog/admin/listings?page=${page}&size=${size}`);
      return res.data?.data?.content || [];
    } catch (e) {
      console.error(`  [FAIL] adminGetAllListings: ${e.response?.data?.message || e.message}`);
      return [];
    }
  }

  async adminChangeListingStatus(listingId, status) {
    try {
      const res = await this.client.patch(`/api/v1/catalog/admin/listings/${listingId}/status?status=${status}`);
      return res.status === 200;
    } catch (e) {
      console.error(`  [FAIL] adminChangeListingStatus: ${e.response?.data?.message || e.message}`);
      return false;
    }
  }

  async deleteListing(listingId) {
    try {
      await this.client.delete(`/api/v1/catalog/host/listings/${listingId}`);
      return true;
    } catch (e) {
      return false;
    }
  }

  async initializeInventory(listingId, payload) {
    try {
      const res = await this.client.post(`/api/v1/host/inventory/listings/${listingId}/initialize`, payload);
      return res.status === 200 ? { success: true } : null;
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      console.error(`  [FAIL] initializeInventory for listing ${listingId}: ${msg}`);
      return null;
    }
  }

  // ============================================================
  // ORDERS & PAYMENTS
  // ============================================================
  async bookNow(payload) {
    try {
      const res = await this.client.post('/api/v1/orders/book-now', payload);
      return res.data?.data || res.data;
    } catch (e) {
      const listingId = payload?.item?.listingId || 'unknown listing';
      console.error(`  [FAIL] bookNow listing ${listingId}: ${e.response?.data?.message || e.message}`);
      return null;
    }
  }

  async createPayment(orderId, amount, hostId) {
    try {
      const res = await this.client.post('/api/v1/payments/create', {
        orderId,
        amount,
        hostId
      });
      return res.data?.data || res.data;
    } catch (e) {
      console.error(`  [FAIL] createPayment order ${orderId}: ${e.response?.data?.message || e.message}`);
      return null;
    }
  }

  async mockPayment(paymentId) {
    try {
      const res = await this.client.post(`/api/v1/payments/${paymentId}/mock-pay`, {});
      return res.status === 200 ? { success: true } : null;
    } catch (e) {
      console.error(`  [FAIL] mockPayment ${paymentId}: ${e.response?.data?.message || e.message}`);
      return null;
    }
  }

  async checkPurchased(listingId) {
    try {
      const res = await this.client.get(`/api/v1/orders/check-purchased/${listingId}`);
      return Boolean(res.data?.data ?? res.data);
    } catch (e) {
      console.error(`  [WARN] checkPurchased listing ${listingId}: ${e.response?.data?.message || e.message}`);
      return false;
    }
  }

  // ============================================================
  // REVIEWS
  // ============================================================
  async createReview(listingId, rating, comment, images = []) {
    try {
      const res = await this.client.post('/api/v1/catalog/reviews', {
        listingId, rating, comment, images
      });
      return res.data;
    } catch (e) {
      console.error(`  [FAIL] createReview listing ${listingId}: ${e.response?.data?.message || e.message}`);
      return null;
    }
  }
}

module.exports = ApiClient;
