import { Api } from "@/shared/api";

const AdminService = {
  // ==========================================
  // USERS (Identity Admin)
  // ==========================================
  getUsers: async (page = 0, size = 20) => {
    return await Api.get(`/v1/admin/users?page=${page}&size=${size}`);
  },

  deleteUser: async (id: string) => {
    return await Api.delete(`/v1/admin/users/${id}`);
  },

  toggleAccountStatus: async (accountId: string, status: string) => {
    // PUT /api/v1/admin/accounts/{accountId}/status
    return await Api.put(`/v1/admin/accounts/${accountId}/status`, { status });
  },

  upgradeRole: async (id: string, role: string) => {
    // POST /api/v1/admin/users/{id}/role
    return await Api.post(`/v1/admin/users/${id}/role?role=${role}`, null);
  },

  // ==========================================
  // HOSTS (Identity Admin)
  // ==========================================
  getPendingHosts: async (page = 0, size = 20) => {
    // GET /api/v1/admin/hosts → Danh sách Host PENDING
    return await Api.get(`/v1/admin/hosts?page=${page}&size=${size}`);
  },

  getAllHosts: async (page = 0, size = 20) => {
    // GET /api/v1/admin/hosts/all → Tất cả Hosts
    return await Api.get(`/v1/admin/hosts/all?page=${page}&size=${size}`);
  },

  getApprovedHosts: async (page = 0, size = 20) => {
    // GET /api/v1/admin/hosts/approved → Danh sách Host APPROVED
    return await Api.get(`/v1/admin/hosts/approved?page=${page}&size=${size}`);
  },

  getHostDetail: async (accountId: string) => {
    // GET /api/v1/admin/hosts/{accountId}
    return await Api.get(`/v1/admin/hosts/${accountId}`);
  },

  approveHost: async (accountId: string, approved: boolean) => {
    // PUT /api/v1/admin/hosts/{accountId}/approval
    return await Api.put(`/v1/admin/hosts/${accountId}/approval?type=HOST`, { 
      status: approved ? "APPROVED" : "REJECTED" 
    });
  },

  completeHostUpgrade: async (accountId: string) => {
    // POST /api/v1/admin/hosts/{accountId}/success
    return await Api.post(`/v1/admin/hosts/${accountId}/success`, {});
  },

  // ==========================================
  // LANDMARKS (Catalog Admin)
  // ==========================================
  getLandmarkSuggestions: async (status?: string, page = 0, size = 20) => {
    // GET /api/v1/catalog/admin/landmark-suggestions
    const statusQuery = status ? `&status=${status}` : "";
    return await Api.get(`/v1/catalog/admin/landmark-suggestions?page=${page}&size=${size}${statusQuery}`);
  },

  updateLandmarkSuggestionStatus: async (id: string, status: string) => {
    // PUT /api/v1/catalog/admin/landmark-suggestions/{id}/status
    return await Api.put(`/v1/catalog/admin/landmark-suggestions/${id}/status`, { status });
  },

  getLandmarks: async (status?: string, page = 0, size = 20) => {
    // GET /api/v1/catalog/admin/landmarks
    const statusQuery = status ? `&status=${status}` : "";
    return await Api.get(`/v1/catalog/admin/landmarks?page=${page}&size=${size}${statusQuery}`);
  },

  createLandmark: async (data: {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    // POST /api/v1/catalog/admin/landmarks
    return await Api.post(`/v1/catalog/admin/landmarks`, data);
  },

  updateLandmark: async (landmarkId: string, data: any) => {
    // PUT /api/v1/catalog/admin/landmarks/{landmarkId}
    return await Api.put(`/v1/catalog/admin/landmarks/${landmarkId}`, data);
  },

  changeLandmarkStatus: async (landmarkId: string, status: string) => {
    // PATCH /api/v1/catalog/admin/landmarks/{landmarkId}/status
    return await Api.patch(`/v1/catalog/admin/landmarks/${landmarkId}/status`, { status });
  },

  // ==========================================
  // LISTINGS (Catalog Admin)
  // ==========================================
  getListings: async (status?: string, page = 0, size = 20) => {
    // GET /api/v1/catalog/admin/listings
    const statusQuery = status ? `&status=${status}` : "";
    return await Api.get(`/v1/catalog/admin/listings?page=${page}&size=${size}${statusQuery}`);
  },

  changeListingStatus: async (listingId: string, status: string) => {
    // PATCH /api/v1/catalog/admin/listings/{listingId}/status
    return await Api.patch(`/v1/catalog/admin/listings/${listingId}/status?status=${status}`, {});
  },

  // ==========================================
  // INVENTORY (Booking Admin)
  // ==========================================
  forceUpdateInventory: async (listingId: string, data: any) => {
    // PUT /api/v1/admin/inventory/listings/{listingId}/force-update
    return await Api.put(`/v1/admin/inventory/listings/${listingId}/force-update`, data);
  },

  syncInventory: async (listingId: string) => {
    // POST /api/v1/admin/inventory/listings/{listingId}/sync
    return await Api.post(`/v1/admin/inventory/listings/${listingId}/sync`, {});
  },

  // ==========================================
  // PAYOUTS (Payment Admin)
  // ==========================================
  markPayoutPaid: async (payoutId: string) => {
    // PUT /api/v1/payouts/{payoutId}/mark-paid
    return await Api.put(`/v1/payouts/${payoutId}/mark-paid`, {});
  },
};

export default AdminService;
