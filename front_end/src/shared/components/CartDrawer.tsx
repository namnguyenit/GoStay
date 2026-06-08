"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { X, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { useCart, CartItem } from "@/shared/context/CartContext";
import { useRouter } from "next/navigation";
import CartService from "@/services/cart";

type CalendarSlot = {
  timeSlot?: string;
  availableQuantity?: number;
  status?: string;
};

const getAvailabilityRows = (res: unknown): CalendarSlot[] => {
  const data = (res as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as CalendarSlot[];
  if (data && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: CalendarSlot[] }).data;
  }
  return [];
};

export default function CartDrawer() {
  const { isDrawerOpen, setIsDrawerOpen, items, removeFromCart, loading } = useCart();
  const router = useRouter();
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, boolean>>({});
  const [checking, setChecking] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const checkItemsAvailability = useCallback(async () => {
    await Promise.resolve();
    setChecking(true);
    const newMap: Record<string, boolean> = {};
    
    for (const item of items) {
      try {
        const res = await CartService.checkAvailability(item.listingId, item.startDate, item.endDate);
        const availabilityRows = getAvailabilityRows(res);
        if (availabilityRows.length > 0) {
          let calendars = availabilityRows;
          
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
            const isOutOfStock = calendars.some((day) => (day.availableQuantity ?? 0) < item.quantity || day.status === "BLOCKED");
            newMap[item.itemId] = !isOutOfStock;
          }
        } else {
          newMap[item.itemId] = false;
        }
      } catch {
        newMap[item.itemId] = false;
      }
    }
    
    setAvailabilityMap(newMap);
    setChecking(false);
  }, [items]);

  useEffect(() => {
    let cancelled = false;
    if (isDrawerOpen && items.length > 0) {
      queueMicrotask(() => {
        if (!cancelled) void checkItemsAvailability();
      });
    }

    return () => {
      cancelled = true;
    };
  }, [checkItemsAvailability, isDrawerOpen, items.length]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setSelectedItemIds((current) => {
        const existingIds = new Set(items.map((item) => item.itemId));
        const kept = current.filter((itemId) => existingIds.has(itemId));
        return kept.length > 0 ? kept : items.map((item) => item.itemId);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [items]);

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.hostId]) acc[item.hostId] = [];
    acc[item.hostId].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const selectedItems = items.filter((item) => selectedItemIds.includes(item.itemId));
  const selectedAvailableItems = selectedItems.filter((item) => availabilityMap[item.itemId] !== false);
  const selectedTotal = selectedAvailableItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const hasUnavailableSelected = selectedItems.some((item) => availabilityMap[item.itemId] === false);
  const canCheckout =
    selectedAvailableItems.length > 0 &&
    !hasUnavailableSelected &&
    !loading &&
    !checking;

  const toggleSelected = (itemId: string) => {
    setSelectedItemIds((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId],
    );
  };

  const toggleAllAvailable = () => {
    const availableIds = items
      .filter((item) => availabilityMap[item.itemId] !== false)
      .map((item) => item.itemId);
    const selectedAvailableIds = selectedItemIds.filter((itemId) => availableIds.includes(itemId));

    setSelectedItemIds(
      selectedAvailableIds.length === availableIds.length ? [] : availableIds,
    );
  };

  const handleCheckoutSelected = () => {
    if (!canCheckout) return;
    const itemIds = selectedAvailableItems.map(item => item.itemId).join(",");
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

              return (
                <div key={hostId} className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-3 bg-zinc-50 border-b flex items-center justify-between">
                    <span className="font-semibold text-sm text-zinc-700">🛒 Đơn hàng của Chủ nhà</span>
                    <span className="text-xs font-semibold text-app-primary">{hostTotal?.toLocaleString()} đ</span>
                  </div>
                  <div className="p-3 space-y-3">
                    {hostItems.map((item) => {
                      const isAvail = availabilityMap[item.itemId] !== false; // true by default until checked
                      const selected = selectedItemIds.includes(item.itemId);
                      return (
                        <div key={item.itemId} className={`flex gap-3 p-2 rounded-xl border ${!isAvail ? 'border-red-300 bg-red-50' : selected ? 'border-app-primary/50 bg-app-primary/5' : 'border-zinc-100'}`}>
                          <label className="pt-7">
                            <input
                              type="checkbox"
                              checked={selected}
                              disabled={!isAvail}
                              onChange={() => toggleSelected(item.itemId)}
                              className="h-4 w-4 rounded border-zinc-300 accent-app-primary disabled:opacity-40"
                              aria-label={`Chọn ${item.listingTitle}`}
                            />
                          </label>
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                            <Image
                              unoptimized
                              src={item.thumbnailUrl || "/images/placeholder.jpg"}
                              alt={item.listingTitle}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
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
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t bg-white p-4 shadow-[0_-8px_24px_rgba(15,23,42,.08)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={toggleAllAvailable}
                className="text-sm font-semibold text-app-primary hover:underline"
              >
                {selectedAvailableItems.length === items.filter((item) => availabilityMap[item.itemId] !== false).length
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả còn hàng"}
              </button>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Đã chọn {selectedAvailableItems.length} dịch vụ</p>
                <p className="text-lg font-bold text-app-primary">{selectedTotal.toLocaleString()} đ</p>
              </div>
            </div>

            <button
              onClick={handleCheckoutSelected}
              disabled={!canCheckout}
              className="w-full rounded-xl bg-app-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-app-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Thanh toán dịch vụ đã chọn
            </button>

            {hasUnavailableSelected && (
              <p className="mt-2 text-center text-xs text-red-600">
                Bỏ chọn hoặc xoá dịch vụ hết chỗ trước khi thanh toán.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
