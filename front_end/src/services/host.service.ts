import { Api } from "@/shared/api";

const HostService = {
  // Get detailed HOST profile
  getMyHostProfile: async () => {
    return await Api.get("/v1/me/host-profile");
  },

  // Get all listings of current Host (with pagination)
  getMyListings: async (page = 0, size = 10) => {
    return await Api.get(`/v1/catalog/host/listings?page=${page}&size=${size}`);
  },

  // Create a new listing
  createListing: async (data: any) => {
    return await Api.post("/v1/catalog/host/listings", data);
  },

  // Update a listing
  updateListing: async (id: string, data: any) => {
    return await Api.put(`/v1/catalog/host/listings/${id}`, data);
  },

  // Delete listing (soft delete)
  deleteListing: async (id: string) => {
    return await Api.delete(`/v1/catalog/host/listings/${id}`);
  },

  // Get calendar for a listing in a specific month and year
  getCalendar: async (listingId: string, month: number, year: number) => {
    return await Api.get(`/v1/host/inventory/listings/${listingId}/calendars?month=${month}&year=${year}`);
  },

  // Block/unblock dates for a listing
  blockCalendar: async (listingId: string, data: { startDate: string; endDate: string; timeSlot?: string; action: "BLOCK" | "UNBLOCK" | "UPDATE_QUANTITY"; availableQuantity?: number }) => {
    return await Api.put(`/v1/host/inventory/listings/${listingId}/calendars/block`, data);
  },

  // Initialize inventory for a listing with configurations
  initializeInventory: async (listingId: string, data: { category: string; quantity?: number; totalQuantity?: number; timeSlots?: string[] }) => {
    return await Api.post(`/v1/host/inventory/listings/${listingId}/initialize`, data);
  },

  // Update inventory configuration for a listing
  updateInventoryConfig: async (listingId: string, data: { category: string; quantity?: number; totalQuantity?: number; timeSlots?: string[] }) => {
    return await Api.put(`/v1/host/inventory/listings/${listingId}/inventory-config`, data);
  },

  // Get occupancy rate for a listing in a specific month and year
  getOccupancyRate: async (listingId: string, month: number, year: number) => {
    return await Api.get(`/v1/host/inventory/listings/${listingId}/occupancy-rate?month=${month}&year=${year}`);
  },

  // Get earnings/payouts of current Host (with pagination)
  getMyPayouts: async (page = 0, size = 10) => {
    return await Api.get(`/v1/payouts/me?page=${page}&size=${size}`);
  },

  // Request withdrawal of pending payouts
  requestWithdrawal: async () => {
    return await Api.post(`/v1/payouts/withdraw`, {});
  },

  // Get orders placed for the host's listings
  getHostOrders: async (page = 0, size = 10) => {
    return await Api.get(`/v1/orders/host?page=${page}&size=${size}`);
  },

  // Get inventory locks for a listing on a specific date
  getLocks: async (listingId: string, date: string) => {
    return await Api.get(`/v1/host/inventory/listings/${listingId}/locks?date=${date}`);
  },

  // Suggest a new landmark
  suggestLandmark: async (data: any) => {
    return await Api.post(`/v1/catalog/host/landmark-suggestions`, data);
  },

  // Upload a single media file
  uploadSingleMedia: async (file: File, folder: string = "uploads") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    return await Api.post("/v1/media/upload", formData);
  },

  // Upload multiple media files (max 10)
  uploadBulkMedia: async (files: File[], folder: string = "uploads") => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("folder", folder);
    return await Api.post("/v1/media/upload/bulk", formData);
  }
};

export default HostService;
