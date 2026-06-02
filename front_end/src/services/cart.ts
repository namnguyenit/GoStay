import { Api } from "@/shared/api";

export interface CartItemPayload {
  listingId: string;
  startDate: string;
  endDate: string;
  timeSlot?: string;
  quantity: number;
}

const CartService = {
  getCart: async () => {
    return await Api.get("/v1/carts");
  },

  addItemToCart: async (payload: CartItemPayload) => {
    return await Api.post("/v1/carts/items", payload);
  },

  removeItemFromCart: async (itemId: string) => {
    return await Api.delete(`/v1/carts/items/${itemId}`);
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    return await Api.put(`/v1/carts/items/${itemId}`, { quantity });
  },
  
  checkAvailability: async (listingId: string, startDate: string, endDate: string) => {
    return await Api.get(`/v1/public/inventory/listings/${listingId}/availability?startDate=${startDate}&endDate=${endDate}`);
  }
};

export default CartService;
