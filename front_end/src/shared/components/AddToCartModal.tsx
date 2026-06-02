import React, { useState } from "react";
import { X, Calendar, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: { startDate: string; endDate: string; quantity: number; timeSlot?: string }) => void;
  categoryType: "place" | "experience" | "service";
  itemName: string;
}

export default function AddToCartModal({ isOpen, onClose, onConfirm, categoryType, itemName }: AddToCartModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const nextDay = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextDay);
  const [date, setDate] = useState(today);
  const [timeSlot, setTimeSlot] = useState("09:00");
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (categoryType === "place") {
      onConfirm({ startDate, endDate, quantity });
    } else if (categoryType === "experience") {
      onConfirm({ startDate: date, endDate: date, quantity });
    } else {
      onConfirm({ startDate: date, endDate: date, quantity, timeSlot });
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

            {categoryType === "service" && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Khung giờ</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="time"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-app-primary outline-none"
                  />
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
            <Button variant="outline" onClick={onClose}>Huỷ</Button>
            <Button onClick={handleConfirm} className="bg-app-primary text-white hover:bg-app-primary/90">
              Xác nhận thêm
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
