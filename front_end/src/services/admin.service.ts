import { Api } from "@/shared/api";

const AdminService = {
  // ==========================================
  // USERS
  // ==========================================
  getUsers: async (page = 0, size = 10) => {
    return await Api.get(`/v1/admin/users?page=${page}&size=${size}`);
  },

  deleteUser: async (id: string) => {
    return await Api.delete(`/v1/admin/users/${id}`);
  },

  banUser: async (id: string) => {
    return await Api.put(`/v1/admin/accounts/${id}/status`, {});
  },

  unbanUser: async (id: string) => {
    // API uses same endpoint, payload might be different or maybe it toggles.
    // Assuming we can pass status or it toggles
    return await Api.put(`/v1/admin/accounts/${id}/status`, {});
  },

  upgradeRole: async (id: string, roleName: string) => {
    return await Api.post(`/v1/admin/users/${id}/role`, { role: roleName });
  },

  // ==========================================
  // HOSTS
  // ==========================================
  getPendingHosts: async (page = 0, size = 10) => {
    return await Api.get(`/v1/admin/hosts?page=${page}&size=${size}`);
  },

  getAllHosts: async (page = 0, size = 10) => {
    return await Api.get(`/v1/admin/hosts/all?page=${page}&size=${size}`);
  },

  getHostDetail: async (id: string) => {
    return await Api.get(`/v1/admin/hosts/${id}`);
  },

  approveHost: async (id: string, isApproved: boolean) => {
    return await Api.put(`/v1/admin/hosts/${id}/approval`, { approved: isApproved });
  },

  completeHostUpgrade: async (id: string) => {
    return await Api.post(`/v1/admin/hosts/${id}/success`, {});
  },

  // ==========================================
  // LANDMARKS
  // ==========================================
  getLandmarkSuggestions: async (page = 0, size = 10) => {
    // Note: uses catalog api
    return await Api.get(`/v1/catalog/admin/landmark-suggestions?page=${page}&size=${size}`);
  },

  updateLandmarkSuggestionStatus: async (id: string, status: string) => {
    return await Api.put(`/v1/catalog/admin/landmark-suggestions/${id}/status`, { status });
  },

  createLandmark: async (data: any) => {
    return await Api.post(`/v1/catalog/admin/landmarks`, data);
  },

  updateLandmark: async (id: string, data: any) => {
    return await Api.put(`/v1/catalog/admin/landmarks/${id}`, data);
  },

  changeLandmarkStatus: async (id: string, status: string) => {
    return await Api.patch(`/v1/catalog/admin/landmarks/${id}/status`, { status }); 
  },
};

export default AdminService;
