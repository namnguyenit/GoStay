import React, { useEffect, useState } from "react";
import { X, Calendar, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import CartService from "@/services/cart";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: { startDate: string; endDate: string; quantity: number; timeSlot?: string }) => void | Promise<void>;
  categoryType: "place" | "experience" | "service";
  itemName: string;
  listingId: string;
  loading?: boolean;
  error?: string;
}

type CalendarSlot = {
  date?: string;
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

export default function AddToCartModal({
  isOpen,
  onClose,
  onConfirm,
  categoryType,
  itemName,
  listingId,
  loading = false,
  error = "",
}: AddToCartModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextDay = tomorrow.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextDay);
  const [date, setDate] = useState(today);
  const [timeSlot, setTimeSlot] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!isOpen || categoryType === "place" || !listingId || !date) return;

    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) setLoadingSlots(true);
    });

    CartService.checkAvailability(listingId, date, date)
      .then((res) => {
        if (cancelled) return;
        const availableSlots = getAvailabilityRows(res)
          .filter((slot) => (slot.availableQuantity ?? 0) > 0 && slot.status !== "BLOCKED")
          .sort((a, b) => String(a.timeSlot ?? "").localeCompare(String(b.timeSlot ?? "")));

        setSlots(availableSlots);
        setTimeSlot((current) => {
          if (current && availableSlots.some((slot) => slot.timeSlot === current)) return current;
          return availableSlots[0]?.timeSlot ?? "";
        });
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setTimeSlot("");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoryType, date, isOpen, listingId]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (loading) return;

    if (categoryType === "place") {
      await onConfirm({ startDate, endDate, quantity });
    } else if (categoryType === "experience") {
      if (!timeSlot) return;
      await onConfirm({ startDate: date, endDate: date, quantity, timeSlot });
    } else {
      if (!timeSlot) return;
      await onConfirm({ startDate: date, endDate: date, quantity, timeSlot });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden pointer-events-auto transform transition-all">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold text-app-fg">Thêm vào giỏ hàng</h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full cursor-pointer">
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <p className="font-medium text-app-fg">{itemName}</p>

            {categoryType === "place" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Ngày nhận</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="date"
                      value={startDate}
                      min={today}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-app-primary outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Ngày trả</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-app-primary outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {(categoryType === "experience" || categoryType === "service") && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Ngày đặt</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="date"
                    value={date}
                    min={today}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-app-primary outline-none"
                  />
                </div>
              </div>
            )}

            {(categoryType === "experience" || categoryType === "service") && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Khung giờ</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    disabled={loadingSlots || slots.length === 0}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-app-primary outline-none"
                  >
                    {loadingSlots ? (
                      <option value="">Đang tải khung giờ...</option>
                    ) : slots.length === 0 ? (
                      <option value="">Không còn khung giờ trống</option>
                    ) : (
                      slots.map((slot) => (
                        <option key={slot.timeSlot} value={slot.timeSlot}>
                          {slot.timeSlot} - còn {slot.availableQuantity} chỗ
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                {categoryType === "place" ? "Số lượng phòng" : categoryType === "experience" ? "Số người" : "Số lượng"}
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-app-primary outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t bg-zinc-50 flex justify-end gap-3">
            {error && (
              <p className="mr-auto max-w-[220px] text-xs font-medium text-red-600">
                {error}
              </p>
            )}
            <Button variant="outline" onClick={onClose} disabled={loading}>Huỷ</Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || (categoryType !== "place" && (!timeSlot || loadingSlots))}
              className="bg-app-primary text-white hover:bg-app-primary/90 disabled:opacity-50"
            >
              {loading ? "Đang thêm..." : "Xác nhận thêm"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
