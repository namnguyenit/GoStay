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
export type PayoutStatus = "PENDING" | "REQUESTED" | "PAID" | string;
export type AdminDisputeStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED" | "REFUNDED" | string;

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

export type AdminInventoryAvailability = {
  date: string;
  timeSlot?: string;
  totalQuantity?: number;
  availableQuantity: number;
  lockedQuantity?: number;
  confirmedQuantity?: number;
  status: string;
};

export type AdminInventorySyncResponse = {
  recordsFixed?: number;
};

export type AdminPayout = {
  id?: string;
  payoutId?: string;
  orderId?: string;
  hostId?: string;
  totalAmount?: number;
  commissionRate?: number;
  commissionAmount?: number;
  hostAmount?: number;
  status?: PayoutStatus;
  paidAt?: string | number | number[] | Date;
  createdAt?: string | number | number[] | Date;
};

export type AdminIdentitySummary = {
  totalAccounts?: number;
  totalUsers?: number;
  activeAccounts?: number;
  bannedAccounts?: number;
  deletedAccounts?: number;
  totalHosts?: number;
  pendingHosts?: number;
  approvedHosts?: number;
  rejectedHosts?: number;
  totalEnterprises?: number;
  pendingEnterprises?: number;
  approvedEnterprises?: number;
  rejectedEnterprises?: number;
};

export type AdminCatalogSummary = {
  totalListings?: number;
  activeListings?: number;
  pendingListings?: number;
  hiddenListings?: number;
  deletedListings?: number;
  totalLandmarks?: number;
  activeLandmarks?: number;
  hiddenLandmarks?: number;
  maintenanceLandmarks?: number;
  featuredLandmarks?: number;
  totalLandmarkSuggestions?: number;
  pendingLandmarkSuggestions?: number;
  resolvedLandmarkSuggestions?: number;
  rejectedLandmarkSuggestions?: number;
};

export type AdminOrderSummary = {
  totalOrders?: number;
  pendingOrders?: number;
  paymentPendingOrders?: number;
  confirmedOrders?: number;
  completedOrders?: number;
  cancelledOrders?: number;
  totalOrderAmount?: number;
  confirmedOrderAmount?: number;
  completedOrderAmount?: number;
  cancelledOrderAmount?: number;
};

export type AdminPaymentSummary = {
  totalPaymentRequests?: number;
  pendingPayments?: number;
  completedPayments?: number;
  failedPayments?: number;
  expiredPayments?: number;
  totalRequestedAmount?: number;
  completedPaymentAmount?: number;
  totalTransactionAmount?: number;
  totalPayouts?: number;
  pendingPayouts?: number;
  requestedPayouts?: number;
  paidPayouts?: number;
  cancelledPayouts?: number;
  totalPayoutAmount?: number;
  totalHostAmount?: number;
  totalCommissionAmount?: number;
  pendingHostAmount?: number;
  requestedHostAmount?: number;
  paidHostAmount?: number;
  paidCommissionAmount?: number;
};

export type AdminRevenueReport = {
  startDate?: string;
  endDate?: string;
  totalAmount?: number;
  hostAmount?: number;
  commissionAmount?: number;
  payoutCount?: number;
  daily?: Array<{
    date?: string;
    totalAmount?: number;
    hostAmount?: number;
    commissionAmount?: number;
    payoutCount?: number;
  }>;
};

export type AdminOrder = {
  orderId?: string;
  userId?: string;
  hostId?: string;
  orderNumber?: string;
  status?: string;
  totalAmount?: number;
  currency?: string;
  customerInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  createdAt?: string;
};

export type AdminDispute = {
  disputeId?: string;
  orderId?: string;
  userId?: string;
  orderNumber?: string;
  orderStatus?: string;
  orderAmount?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  reason?: string;
  description?: string;
  status?: AdminDisputeStatus;
  adminNote?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CommissionConfig = {
  rate?: number;
  percent?: number;
  updatedBy?: string;
  reason?: string;
  updatedAt?: string;
};

const pageQuery = (page: number, size: number) => `page=${page}&size=${size}`;

const AdminService = {
  // ==========================================
  // USERS (Identity Admin)
  // ==========================================
  getUsers: async (page = 0, size = 20, keyword = ""): Promise<AdminApiResponse<AdminPage<AdminUser>>> => {
    const keywordQuery = keyword.trim() ? `&keyword=${encodeURIComponent(keyword.trim())}` : "";
    return await Api.get(`/v1/admin/users?page=${page}&size=${size}${keywordQuery}`);
  },

  getIdentitySummary: async (): Promise<AdminApiResponse<AdminIdentitySummary>> => {
    return await Api.get(`/v1/admin/users/summary`);
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
    size = 20,
    keyword = ""
  ): Promise<AdminApiResponse<AdminPage<AdminListing>>> => {
    // GET /api/v1/catalog/admin/listings
    const statusQuery = status ? `&status=${encodeURIComponent(status)}` : "";
    const keywordQuery = keyword.trim() ? `&keyword=${encodeURIComponent(keyword.trim())}` : "";
    return await Api.get(`/v1/catalog/admin/listings?${pageQuery(page, size)}${statusQuery}${keywordQuery}`);
  },

  getCatalogSummary: async (): Promise<AdminApiResponse<AdminCatalogSummary>> => {
    return await Api.get(`/v1/catalog/admin/summary`);
  },

  changeListingStatus: async (listingId: string, status: ListingStatus) => {
    // PATCH /api/v1/catalog/admin/listings/{listingId}/status
    return await Api.patch(`/v1/catalog/admin/listings/${listingId}/status?status=${status}`, {});
  },

  // ==========================================
  // INVENTORY (Booking Admin)
  // ==========================================
  getInventoryAvailability: async (
    listingId: string,
    startDate: string,
    endDate: string
  ): Promise<AdminApiResponse<AdminInventoryAvailability[]>> => {
    // GET /api/v1/admin/inventory/listings/{listingId}/availability
    return await Api.get(`/v1/admin/inventory/listings/${listingId}/availability?startDate=${startDate}&endDate=${endDate}`);
  },

  forceUpdateInventory: async (listingId: string, data: Record<string, unknown>) => {
    // PUT /api/v1/admin/inventory/listings/{listingId}/force-update
    return await Api.put(`/v1/admin/inventory/listings/${listingId}/force-update`, data);
  },

  syncInventory: async (listingId: string): Promise<AdminApiResponse<AdminInventorySyncResponse>> => {
    // POST /api/v1/admin/inventory/listings/{listingId}/sync
    return await Api.post(`/v1/admin/inventory/listings/${listingId}/sync`, {});
  },

  // ==========================================
  // PAYOUTS (Payment Admin)
  // ==========================================
  getAllPayouts: async (page = 0, size = 10): Promise<AdminApiResponse<AdminPage<AdminPayout>>> => {
    // GET /api/v1/payouts/all
    return await Api.get(`/v1/payouts/all?page=${page}&size=${size}`);
  },

  getPaymentSummary: async (): Promise<AdminApiResponse<AdminPaymentSummary>> => {
    return await Api.get(`/v1/payouts/admin/summary`);
  },

  getRevenueReport: async (startDate?: string, endDate?: string): Promise<AdminApiResponse<AdminRevenueReport>> => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const query = params.toString();
    return await Api.get(`/v1/payouts/admin/revenue-report${query ? `?${query}` : ""}`);
  },

  getOrderSummary: async (): Promise<AdminApiResponse<AdminOrderSummary>> => {
    return await Api.get(`/v1/orders/admin/summary`);
  },

  getAdminOrders: async (page = 0, size = 20): Promise<AdminApiResponse<AdminPage<AdminOrder>>> => {
    return await Api.get(`/v1/orders/admin?page=${page}&size=${size}`);
  },

  forceCancelOrder: async (orderId: string, reason?: string) => {
    return await Api.put(`/v1/orders/admin/${orderId}/force-cancel`, { reason });
  },

  getDisputes: async (
    status?: AdminDisputeStatus | "",
    page = 0,
    size = 20
  ): Promise<AdminApiResponse<AdminPage<AdminDispute>>> => {
    const statusQuery = status ? `&status=${encodeURIComponent(status)}` : "";
    return await Api.get(`/v1/orders/admin/disputes?page=${page}&size=${size}${statusQuery}`);
  },

  resolveDispute: async (disputeId: string, action: "REFUND" | "REJECT" | "RESOLVE", adminNote?: string) => {
    return await Api.put(`/v1/orders/admin/disputes/${disputeId}/resolve`, { action, adminNote });
  },

  getCommissionConfig: async (): Promise<AdminApiResponse<CommissionConfig>> => {
    return await Api.get(`/v1/payouts/admin/commission`);
  },

  updateCommissionConfig: async (rate: number, reason?: string): Promise<AdminApiResponse<CommissionConfig>> => {
    return await Api.put(`/v1/payouts/admin/commission`, { rate, reason });
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
