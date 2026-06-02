"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import CartService from "@/services/cart";
import AuthService from "@/services/auth.service";

export interface CartItem {
  itemId: string;
  listingId: string;
  hostId: string;
  listingTitle: string;
  thumbnailUrl: string;
  startDate: string;
  endDate: string;
  timeSlot?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isAvailable?: boolean; // Set locally after checking availability
}

interface CartContextProps {
  items: CartItem[];
  cartTotal: number;
  itemCount: number;
  loading: boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
  refreshCart: () => Promise<void>;
  addToCart: (payload: { listingId: string; startDate: string; endDate: string; timeSlot?: string; quantity: number }) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

import { useAuthModal } from "./AuthModalContext";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { openModal } = useAuthModal();

  const fetchCart = async () => {
    if (!AuthService.isAuthenticated()) {
      setItems([]);
      setCartTotal(0);
      return;
    }
    
    setLoading(true);
    try {
      const res: any = await CartService.getCart();
      if (res?.data) {
        setItems(res.data.items || []);
        setCartTotal(res.data.cartTotal || 0);
      }
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    
    // Custom event to refresh cart from other non-react places if needed
    const handleRefresh = () => fetchCart();
    window.addEventListener("refresh_cart", handleRefresh);
    return () => window.removeEventListener("refresh_cart", handleRefresh);
  }, []);

  const refreshCart = async () => {
    await fetchCart();
  };

  const addToCart = async (payload: { listingId: string; startDate: string; endDate: string; timeSlot?: string; quantity: number }) => {
    if (!AuthService.isAuthenticated()) {
      openModal("login");
      return;
    }
    await CartService.addItemToCart(payload);
    await fetchCart();
    setIsDrawerOpen(true);
  };

  const removeFromCart = async (itemId: string) => {
    await CartService.removeItemFromCart(itemId);
    await fetchCart();
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      cartTotal,
      itemCount,
      loading,
      isDrawerOpen,
      setIsDrawerOpen,
      refreshCart,
      addToCart,
      removeFromCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
