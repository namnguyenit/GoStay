import { Api } from "@/shared/api";

export type AdminPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
};

export type AdminRoleName = "USER" | "HOST" | "ENTERPRISE" | "ADMIN" | string;
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ListingStatus = "PENDING" | "ACTIVE" | "HIDDEN" | "DELETED";
export type LandmarkStatus = "ACTIVE" | "HIDDEN" | "MAINTENANCE";
export type SuggestionStatus = "PENDING" | "RESOLVED" | "REJECTED";

export type AdminApiResponse<T> = {
  data: T;
  message?: string;
  status?: number;
  errorCode?: string;
};

export type AdminUser = {
  id: string;
  username?: string;
  email?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  provider?: string;
  roles?: AdminRoleName[];
  avatarUrl?: string;
  userProfile?: {
    fullName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    avatarUrl?: string;
  };
  hostProfile?: {
    cccdNumber?: string;
    bankAccount?: string;
    bankName?: string;
    avatarUrl?: string;
    approvalStatus?: ApprovalStatus;
  };
  enterpriseProfile?: {
    companyName?: string;
    taxCode?: string;
    companyAddress?: string;
    representativeName?: string;
    avatarUrl?: string;
    approvalStatus?: ApprovalStatus;
  };
};

export type AdminHostDetail = {
  accountId?: string;
  fullName?: string;
  avatarUrl?: string;
  hostType?: string;
  approvalStatus?: ApprovalStatus;
  identityInfo?: {
    taxCode?: string;
    frontImageUrl?: string;
    backImageUrl?: string;
  };
};

export type AdminListing = {
  id: string;
  hostId?: string;
  complexId?: string;
  title?: string;
  description?: string;
  province?: string;
  category?: string;
  subCategory?: string;
  basePrice?: number;
  priceUnit?: string;
  latitude?: number;
  longitude?: number;
  thumbnailUrl?: string;
  averageRating?: number;
  totalReviews?: number;
  status?: ListingStatus;
  attributes?: Record<string, unknown> & {
    galleryUrls?: string[];
    categoryType?: string;
  };
};

export type LandmarkSuggestion = {
  id: string;
  hostId?: string;
  name?: string;
  description?: string;
  suggestedProvince?: string;
  suggestedLatitude?: number;
  suggestedLongitude?: number;
  referenceImageUrl?: string;
  thumbnailUrl?: string;
  galleryUrls?: string[];
  status?: SuggestionStatus;
  rejectReason?: string;
  createdAt?: string;
};

export type AdminLandmark = {
  id: string;
  name?: string;
  description?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  thumbnailUrl?: string;
  galleryUrls?: string[];
  isFeatured?: boolean;
  status?: LandmarkStatus;
};

export type SaveLandmarkPayload = {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  province: string;
  radiusMeters?: number;
  thumbnailUrl?: string;
  galleryUrls?: string[];
  resolvedSuggestionId?: string;
  isFeatured?: boolean;
};

const pageQuery = (page: number, size: number) => `page=${page}&size=${size}`;

const AdminService = {
  // ==========================================
  // USERS (Identity Admin)
  // ==========================================
  getUsers: async (page = 0, size = 20): Promise<AdminApiResponse<AdminPage<AdminUser>>> => {
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

  revokeRole: async (id: string, role: string) => {
    // POST /api/v1/admin/users/{id}/revokerole
    return await Api.post(`/v1/admin/users/${id}/revokerole?role=${role}`, null);
  },

  // ==========================================
  // HOSTS (Identity Admin)
  // ==========================================
  getPendingHosts: async (page = 0, size = 20): Promise<AdminApiResponse<AdminPage<AdminUser>>> => {
    // GET /api/v1/admin/hosts → Danh sách Host PENDING
    return await Api.get(`/v1/admin/hosts?${pageQuery(page, size)}`);
  },

  getAllHosts: async (page = 0, size = 20): Promise<AdminApiResponse<AdminPage<AdminUser>>> => {
    // GET /api/v1/admin/hosts/all → Tất cả Hosts
    return await Api.get(`/v1/admin/hosts/all?${pageQuery(page, size)}`);
  },

  getApprovedHosts: async (page = 0, size = 20): Promise<AdminApiResponse<AdminPage<AdminUser>>> => {
    // GET /api/v1/admin/hosts/approved → Danh sách Host APPROVED
    return await Api.get(`/v1/admin/hosts/approved?${pageQuery(page, size)}`);
  },

  getHostDetail: async (accountId: string): Promise<AdminApiResponse<AdminHostDetail>> => {
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
  // ENTERPRISES (Identity Admin)
  // ==========================================
  getPendingEnterprises: async (page = 0, size = 20): Promise<AdminApiResponse<AdminPage<AdminUser>>> => {
    // GET /api/v1/admin/enterprises → Enterprise PENDING
    return await Api.get(`/v1/admin/enterprises?${pageQuery(page, size)}`);
  },

  getAllEnterprises: async (page = 0, size = 20): Promise<AdminApiResponse<AdminPage<AdminUser>>> => {
    // GET /api/v1/admin/enterprises/all → Tất cả Enterprises
    return await Api.get(`/v1/admin/enterprises/all?${pageQuery(page, size)}`);
  },

  getApprovedEnterprises: async (page = 0, size = 20): Promise<AdminApiResponse<AdminPage<AdminUser>>> => {
    // GET /api/v1/admin/enterprises/approved → Danh sách Enterprise APPROVED
    return await Api.get(`/v1/admin/enterprises/approved?${pageQuery(page, size)}`);
  },

  approveEnterprise: async (accountId: string, approved: boolean) => {
    // PUT /api/v1/admin/enterprises/{accountId}/approval
    return await Api.put(`/v1/admin/enterprises/${accountId}/approval?type=ENTERPRISE`, { 
      status: approved ? "APPROVED" : "REJECTED" 
    });
  },

  completeEnterpriseUpgrade: async (accountId: string) => {
    // POST /api/v1/admin/enterprises/{accountId}/success
    return await Api.post(`/v1/admin/enterprises/${accountId}/success`, {});
  },

  // ==========================================
  // LANDMARKS (Catalog Admin)
  // ==========================================
  getLandmarkSuggestions: async (
    status?: SuggestionStatus | "",
    page = 0,
    size = 20
  ): Promise<AdminApiResponse<AdminPage<LandmarkSuggestion>>> => {
    // GET /api/v1/catalog/admin/landmark-suggestions
    const statusQuery = status ? `&status=${encodeURIComponent(status)}` : "";
    return await Api.get(`/v1/catalog/admin/landmark-suggestions?${pageQuery(page, size)}${statusQuery}`);
  },

  updateLandmarkSuggestionStatus: async (id: string, status: SuggestionStatus, rejectReason?: string) => {
    // PUT /api/v1/catalog/admin/landmark-suggestions/{id}/status
    return await Api.put(`/v1/catalog/admin/landmark-suggestions/${id}/status`, {
      status,
      ...(rejectReason ? { rejectReason } : {}),
    });
  },

  getLandmarks: async (
    status?: LandmarkStatus | "",
    page = 0,
    size = 20
  ): Promise<AdminApiResponse<AdminPage<AdminLandmark>>> => {
    // GET /api/v1/catalog/admin/landmarks
    const statusQuery = status ? `&status=${encodeURIComponent(status)}` : "";
    return await Api.get(`/v1/catalog/admin/landmarks?${pageQuery(page, size)}${statusQuery}`);
  },

  createLandmark: async (data: SaveLandmarkPayload) => {
    // POST /api/v1/catalog/admin/landmarks
    return await Api.post(`/v1/catalog/admin/landmarks`, data);
  },

  updateLandmark: async (landmarkId: string, data: SaveLandmarkPayload) => {
    // PUT /api/v1/catalog/admin/landmarks/{landmarkId}
    return await Api.put(`/v1/catalog/admin/landmarks/${landmarkId}`, data);
  },

  changeLandmarkStatus: async (landmarkId: string, status: LandmarkStatus) => {
    // PATCH /api/v1/catalog/admin/landmarks/{landmarkId}/status
    return await Api.patch(`/v1/catalog/admin/landmarks/${landmarkId}/status`, { status });
  },

  // ==========================================
  // LISTINGS (Catalog Admin)
  // ==========================================
  getListings: async (
    status?: ListingStatus | "",
    page = 0,
    size = 20
  ): Promise<AdminApiResponse<AdminPage<AdminListing>>> => {
    // GET /api/v1/catalog/admin/listings
    const statusQuery = status ? `&status=${encodeURIComponent(status)}` : "";
    return await Api.get(`/v1/catalog/admin/listings?${pageQuery(page, size)}${statusQuery}`);
  },

  changeListingStatus: async (listingId: string, status: ListingStatus) => {
    // PATCH /api/v1/catalog/admin/listings/{listingId}/status
    return await Api.patch(`/v1/catalog/admin/listings/${listingId}/status?status=${status}`, {});
  },

  // ==========================================
  // INVENTORY (Booking Admin)
  // ==========================================
  getInventoryAvailability: async (listingId: string, startDate: string, endDate: string) => {
    // GET /api/v1/admin/inventory/listings/{listingId}/availability
    return await Api.get(`/v1/admin/inventory/listings/${listingId}/availability?startDate=${startDate}&endDate=${endDate}`);
  },

  forceUpdateInventory: async (listingId: string, data: Record<string, unknown>) => {
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
  getAllPayouts: async (page = 0, size = 10) => {
    // GET /api/v1/payouts/all
    return await Api.get(`/v1/payouts/all?page=${page}&size=${size}`);
  },

  markPayoutPaid: async (payoutId: string) => {
    // PUT /api/v1/payouts/{payoutId}/mark-paid
    return await Api.put(`/v1/payouts/${payoutId}/mark-paid`, {});
  },

  markHostPayoutsPaid: async (hostId: string) => {
    // PUT /api/v1/payouts/host/{hostId}/mark-paid
    return await Api.put(`/v1/payouts/host/${hostId}/mark-paid`, {});
  },
};

export default AdminService;
