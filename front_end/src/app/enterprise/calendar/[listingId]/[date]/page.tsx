"use client";

import { useCallback, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Calendar, Users, Briefcase } from "lucide-react";
import HostService from "@/services/enterprise.service";
import { format } from "date-fns";
import { getErrorMessage } from "../../../_utils";

type InventoryLock = {
  lockStatus?: string;
  lockedQuantity?: number;
  orderId?: string;
  timeSlot?: string;
};

type CalendarConfig = {
  date?: string;
  timeSlot?: string;
  availableQuantity?: number;
  status?: string;
};

type DayConfig = {
  timeSlot: string;
  quantity: string;
  status: string;
};

export default function DayDetailsPage({ params }: { params: Promise<{ listingId: string; date: string }> }) {
  const router = useRouter();
  
  const { listingId, date } = use(params);

  const [locks, setLocks] = useState<InventoryLock[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mảng chứa cấu hình của từng khung giờ trong ngày
  const [dayConfigs, setDayConfigs] = useState<DayConfig[]>([]);
  const [savingSlot, setSavingSlot] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchDayData = useCallback(async () => {
    try {
      setLoading(true);
      const d = new Date(date);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      
      const calRes = await HostService.getCalendar(listingId, month, year) as { data?: CalendarConfig[] };
      const calendars = calRes?.data || [];
      const dayCals = calendars.filter((c) => c.date === date);
      
      if (dayCals.length > 0) {
        setDayConfigs(dayCals.map((c) => ({
          timeSlot: c.timeSlot || "ALL_DAY",
          quantity: c.availableQuantity?.toString() || "0",
          status: c.status || "AVAILABLE"
        })));
      }

      const locksRes = await HostService.getLocks(listingId, date) as { data?: InventoryLock[] };
      setLocks(locksRes?.data || []);
      
    } catch {
      setFeedback({ type: "error", message: "Không thể tải chi tiết ngày." });
    } finally {
      setLoading(false);
    }
  }, [date, listingId]);

  useEffect(() => {
    if (listingId && date) {
      fetchDayData();
    }
  }, [fetchDayData, listingId, date]);

  const handleUpdateSlot = async (slotConfig: typeof dayConfigs[0]) => {
    try {
      setSavingSlot(slotConfig.timeSlot);
      // Update quantity
      await HostService.blockCalendar(listingId, {
        startDate: date,
        endDate: date,
        timeSlot: slotConfig.timeSlot,
        action: "UPDATE_QUANTITY",
        availableQuantity: parseInt(slotConfig.quantity, 10)
      });
      
      // Update status
      const actionStatus = slotConfig.status === "BLOCKED" ? "BLOCK" : "UNBLOCK";
      await HostService.blockCalendar(listingId, {
        startDate: date,
        endDate: date,
        timeSlot: slotConfig.timeSlot,
        action: actionStatus
      });
      
      setFeedback({ type: "success", message: `Đã lưu cấu hình cho khung giờ [${slotConfig.timeSlot === "ALL_DAY" ? "Cả ngày" : slotConfig.timeSlot}] thành công.` });
    } catch (err: unknown) {
      setFeedback({ type: "error", message: `Lưu thất bại: ${getErrorMessage(err)}` });
    } finally {
      setSavingSlot(null);
    }
  };

  const updateConfigValue = (index: number, field: "quantity" | "status", value: string) => {
    const newConfigs = [...dayConfigs];
    newConfigs[index][field] = value;
    setDayConfigs(newConfigs);
  };

  const confirmedLocks = locks.filter(l => l.lockStatus === "CONFIRMED");
  const pendingLocks = locks.filter(l => l.lockStatus === "LOCKED");

  return (
    <div className="space-y-6 animate-smooth-appear max-w-5xl mx-auto w-full pb-20">
      
      <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
        <button 
          onClick={() => router.back()}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-app-primary" />
            Chi tiết ngày: {format(new Date(date), "dd/MM/yyyy")}
          </h2>
          <p className="text-xs text-gray-600 mt-1">Quản lý chuyên sâu số lượng chỗ trống và các đơn đặt phòng theo từng khung giờ trong ngày.</p>
        </div>
      </div>

      {feedback && (
        <div className={`rounded-2xl border px-4 py-3 text-xs font-semibold ${
          feedback.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-red-200 bg-red-50 text-red-700"
        }`}>
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Stats & Locks */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Trạng Thái Lấp Đầy</h3>
            
            {loading ? (
              <div className="flex justify-center p-6">
                <div className="w-6 h-6 border-2 border-app-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold mb-1">
                      <Briefcase className="w-4 h-4" /> Đã chốt (Confirmed)
                    </div>
                    <span className="text-2xl font-bold text-emerald-600">
                      {confirmedLocks.reduce((acc, l) => acc + (l.lockedQuantity ?? 0), 0)}
                    </span>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-yellow-600 text-xs font-semibold mb-1">
                      <Users className="w-4 h-4" /> Đang giữ chỗ (Held)
                    </div>
                    <span className="text-2xl font-bold text-yellow-600">
                      {pendingLocks.reduce((acc, l) => acc + (l.lockedQuantity ?? 0), 0)}
                    </span>
                  </div>
                </div>

                {locks.length > 0 ? (
                  <div className="mt-4 border-t border-gray-200 pt-4 space-y-3">
                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Danh sách chi tiết giao dịch</h4>
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                      {locks.map((lock, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-100 rounded-xl border border-gray-200 text-xs hover:border-gray-300 transition-all">
                          <div>
                            <span className="text-gray-900 font-bold block mb-1">HĐ: {lock.orderId?.substring(0,8)}</span>
                            <span className="text-gray-600 text-[10px] bg-black/50 px-2 py-0.5 rounded">
                              {lock.timeSlot === "ALL_DAY" ? "Cả ngày" : `Giờ: ${lock.timeSlot}`}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-app-accent font-bold text-sm">SL: {lock.lockedQuantity}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              lock.lockStatus === "CONFIRMED" ? "bg-emerald-50 text-emerald-600" : "bg-yellow-50 text-yellow-600"
                            }`}>
                              {lock.lockStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-4 text-center border border-dashed border-gray-300 rounded-xl py-6">
                    Chưa có giao dịch giữ chỗ nào trong ngày này.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Edit Config per Timeslot */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 h-fit">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Điều chỉnh & Phân bổ Chỗ Trống</h3>
          
          {loading ? (
             <div className="flex justify-center p-6">
               <div className="w-6 h-6 border-2 border-app-primary border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : dayConfigs.length === 0 ? (
             <p className="text-xs text-gray-500 text-center">Không tìm thấy dữ liệu khung giờ cho ngày này.</p>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {dayConfigs.map((config, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span className="text-xs font-bold text-app-primary bg-app-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
                      {config.timeSlot === "ALL_DAY" ? "Cả ngày" : `Khung giờ: ${config.timeSlot}`}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-600 uppercase">Trạng Thái</label>
                      <select
                        value={config.status}
                        onChange={(e) => updateConfigValue(idx, "status", e.target.value)}
                        className={`w-full text-xs font-bold px-3 py-2.5 rounded-lg border focus:outline-none ${
                          config.status === "AVAILABLE" 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                            : "bg-red-50/20 text-red-600 border-red-200"
                        }`}
                      >
                        <option value="AVAILABLE">MỞ CỬA</option>
                        <option value="BLOCKED">ĐÓNG (BẢO TRÌ)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-600 uppercase">Chỗ Trống (Quantity)</label>
                      <input
                        type="number"
                        min="0"
                        value={config.quantity}
                        onChange={(e) => updateConfigValue(idx, "quantity", e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-app-primary"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpdateSlot(config)}
                    disabled={savingSlot === config.timeSlot}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded-lg text-xs font-bold transition-all border border-gray-200"
                  >
                    {savingSlot === config.timeSlot ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                    Lưu khung giờ này
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
