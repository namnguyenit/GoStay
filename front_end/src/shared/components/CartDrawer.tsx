"use client";

import React, { useEffect, useState } from "react";
import { X, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { useCart, CartItem } from "@/shared/context/CartContext";
import { useRouter } from "next/navigation";
import CartService from "@/services/cart";

export default function CartDrawer() {
  const { isDrawerOpen, setIsDrawerOpen, items, cartTotal, removeFromCart, loading } = useCart();
  const router = useRouter();
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, boolean>>({});
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (isDrawerOpen && items.length > 0) {
      checkItemsAvailability();
    }
  }, [isDrawerOpen, items.length]);

  const checkItemsAvailability = async () => {
    setChecking(true);
    const newMap: Record<string, boolean> = {};
    
    for (const item of items) {
      try {
        const res: any = await CartService.checkAvailability(item.listingId, item.startDate, item.endDate);
        if (res?.data && Array.isArray(res.data)) {
          let calendars: any[] = res.data;
          
          if (item.timeSlot) {
             calendars = calendars.filter(c => c.timeSlot === item.timeSlot);
          } else {
             // Backend mặc định trả ALL_DAY nếu không truyền timeSlot, hoặc ta lấy tất cả
             // Thực tế BookingandInventory dùng "ALL_DAY" nếu không có timeSlot
             calendars = calendars.filter(c => !c.timeSlot || c.timeSlot === "ALL_DAY");
          }

          if (calendars.length === 0) {
            newMap[item.itemId] = false; // Không tìm thấy lịch trống cho ngày/giờ này
          } else {
            // Check if ANY day within the period has availableQuantity < requested quantity
            const isOutOfStock = calendars.some((day) => day.availableQuantity < item.quantity || day.status === "BLOCKED");
            newMap[item.itemId] = !isOutOfStock;
          }
        } else {
          newMap[item.itemId] = false;
        }
      } catch (err) {
        newMap[item.itemId] = false;
      }
    }
    
    setAvailabilityMap(newMap);
    setChecking(false);
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.hostId]) acc[item.hostId] = [];
    acc[item.hostId].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const handleCheckout = (hostId: string) => {
    const hostItems = groupedItems[hostId];
    if (hostItems.some(item => availabilityMap[item.itemId] === false)) return;
    
    const itemIds = hostItems.map(item => item.itemId).join(",");
    setIsDrawerOpen(false);
    router.push(`/checkout?type=cart&itemIds=${itemIds}`);
  };

  // Thay vì unmount hoàn toàn, ta dùng translate-x để tạo hiệu ứng trượt
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsDrawerOpen(false)}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-app-fg" />
            <h2 className="text-lg font-bold text-app-fg">Giỏ hàng của bạn ({items.length})</h2>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loading || checking ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Đang tải giỏ hàng...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
              <p>Giỏ hàng của bạn đang trống.</p>
            </div>
          ) : (
            Object.entries(groupedItems).map(([hostId, hostItems]) => {
              const hostTotal = hostItems.reduce((sum, item) => sum + item.totalPrice, 0);
              const hasUnavailableInGroup = hostItems.some(item => availabilityMap[item.itemId] === false);

              return (
                <div key={hostId} className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-3 bg-zinc-50 border-b flex items-center justify-between">
                    <span className="font-semibold text-sm text-zinc-700">🛒 Đơn hàng của Chủ nhà</span>
                  </div>
                  <div className="p-3 space-y-3">
                    {hostItems.map((item) => {
                      const isAvail = availabilityMap[item.itemId] !== false; // true by default until checked
                      return (
                        <div key={item.itemId} className={`flex gap-3 p-2 rounded-xl border ${!isAvail ? 'border-red-300 bg-red-50' : 'border-zinc-100'}`}>
                          <img src={item.thumbnailUrl || "/images/placeholder.jpg"} alt={item.listingTitle} className="w-20 h-20 object-cover rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-app-fg truncate text-sm">{item.listingTitle}</h4>
                            <p className="text-xs text-zinc-500 mt-1">Từ {item.startDate} đến {item.endDate}</p>
                            {item.timeSlot && <p className="text-xs text-zinc-500">Giờ: {item.timeSlot}</p>}
                            <p className="text-xs text-zinc-500">Số lượng: {item.quantity}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-bold text-app-primary">{item.totalPrice?.toLocaleString()} đ</span>
                              <button 
                                onClick={() => removeFromCart(item.itemId)}
                                className="text-red-500 hover:bg-red-100 p-1.5 rounded-full transition-colors cursor-pointer"
                                title="Xoá khỏi giỏ hàng"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            {!isAvail && (
                              <p className="text-xs text-red-600 font-semibold mt-1">
                                ⚠️ Hết chỗ. Vui lòng xoá!
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="p-3 border-t bg-zinc-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-zinc-600 font-medium text-sm">Tổng đơn này:</span>
                      <span className="text-lg font-bold text-app-primary">{hostTotal?.toLocaleString()} đ</span>
                    </div>
                    
                    <button
                      onClick={() => handleCheckout(hostId)}
                      disabled={loading || checking || hasUnavailableInGroup}
                      className="w-full bg-app-primary hover:bg-app-primary/90 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Thanh toán
                    </button>
                    {hasUnavailableInGroup && (
                      <p className="text-xs text-red-600 mt-1.5 text-center">
                        Vui lòng xoá các dịch vụ hết chỗ để tiếp tục.
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
