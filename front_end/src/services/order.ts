import { Api } from "@/shared/api";

export interface BookNowPayload {
  item: {
    listingId: string;
    hostId?: string;
    listingTitle?: string;
    thumbnailUrl?: string;
    startDate: string; // "YYYY-MM-DD"
    endDate: string;   // "YYYY-MM-DD"
    timeSlot?: string;
    quantity: number;
    unitPrice?: number;
  };
  fullName?: string;
  email?: string;
  phone?: string;
}

const OrderService = {
  bookNow: async (payload: BookNowPayload) => {
    return await Api.post("/v1/orders/book-now", payload);
  },
  getOrder: async (orderId: string) => {
    return await Api.get(`/v1/orders/${orderId}`);
  },
  getUserOrders: async (page = 0, size = 10) => {
    return await Api.get(`/v1/orders?page=${page}&size=${size}`);
  },
  cancelOrder: async (orderId: string) => {
    return await Api.put(`/v1/orders/${orderId}/cancel`, {});
  },
  checkPurchased: async (listingId: string) => {
    return await Api.get(`/v1/orders/check-purchased/${listingId}`);
  },
};

export default OrderService;
