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
  blockCalendar: async (listingId: string, data: { startDate: string; endDate: string; timeSlot?: string; action: "BLOCK" | "UNBLOCK" }) => {
    return await Api.put(`/v1/host/inventory/listings/${listingId}/calendars/block`, data);
  },

  // Get occupancy rate for a listing in a specific month and year
  getOccupancyRate: async (listingId: string, month: number, year: number) => {
    return await Api.get(`/v1/host/inventory/listings/${listingId}/occupancy-rate?month=${month}&year=${year}`);
  },

  // Get earnings/payouts of current Host (with pagination)
  getMyPayouts: async (page = 0, size = 10) => {
    return await Api.get(`/v1/payouts/me?page=${page}&size=${size}`);
  }
};

export default HostService;
