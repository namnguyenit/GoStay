"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Lock, Unlock, Percent } from "lucide-react";
import HostService from "@/services/host.service";

function CalendarComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [listings, setListings] = useState<any[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string>("");
  const [loadingListings, setLoadingListings] = useState(true);

  // Calendar Date State
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [occupancyRate, setOccupancyRate] = useState<any>(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [submittingBlock, setSubmittingBlock] = useState<string | null>(null);

  const currentMonth = currentDate.getMonth() + 1; // 1-indexed
  const currentYear = currentDate.getFullYear();

  // 1. Fetch Listings initially
  useEffect(() => {
    async function loadListings() {
      try {
        setLoadingListings(true);
        const res = await HostService.getMyListings(0, 100);
        if (res && res.data) {
          const content = res.data.content || res.data || [];
          setListings(content);
          
          // Check query param
          const queryId = searchParams.get("listingId");
          if (queryId) {
            setSelectedListingId(queryId);
          } else if (content.length > 0) {
            setSelectedListingId(content[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load listings", err);
      } finally {
        setLoadingListings(false);
      }
    }
    loadListings();
  }, [searchParams]);

  // 2. Fetch Calendar data once listing/date changes
  async function fetchCalendarAndStats() {
    if (!selectedListingId) return;
    try {
      setLoadingCalendar(true);
      
      // Get monthly calendar info
      const calRes = await HostService.getCalendar(selectedListingId, currentMonth, currentYear);
      if (calRes && calRes.data) {
        setCalendarData(calRes.data);
      } else {
        setCalendarData([]);
      }

      // Get occupancy rate
      try {
        const occRes = await HostService.getOccupancyRate(selectedListingId, currentMonth, currentYear);
        if (occRes && occRes.data) {
          setOccupancyRate(occRes.data);
        } else {
          setOccupancyRate(null);
        }
      } catch (_) {
        setOccupancyRate(null);
      }
    } catch (err) {
      console.error("Failed to fetch calendar", err);
    } finally {
      setLoadingCalendar(false);
    }
  }

  useEffect(() => {
    fetchCalendarAndStats();
  }, [selectedListingId, currentDate]);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 2, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth, 1));
  };

  // Block/unblock date
  const handleToggleDay = async (dateStr: string, currentStatus: string) => {
    if (!selectedListingId) return;
    const action = currentStatus === "BLOCKED" ? "UNBLOCK" : "BLOCK";
    const actionLabel = action === "BLOCK" ? "Khóa ngày" : "Mở ngày";
    
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionLabel.toLowerCase()} ${dateStr} không?`)) {
      return;
    }

    try {
      setSubmittingBlock(dateStr);
      await HostService.blockCalendar(selectedListingId, {
        startDate: dateStr,
        endDate: dateStr,
        timeSlot: "ALL_DAY",
        action: action
      });
      alert(`${actionLabel} thành công!`);
      fetchCalendarAndStats();
    } catch (err: any) {
      console.error("Failed to update day availability", err);
      alert(`Thao tác thất bại: ${err?.message || "Lỗi không xác định"}`);
    } finally {
      setSubmittingBlock(null);
    }
  };

  // Build Calendar grid
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay(); // Sunday=0, Monday=1...

  const daysGrid = [];
  // Padding for previous month
  for (let i = 0; i < firstDayIndex; i++) {
    daysGrid.push({ isPadding: true, day: 0, dateStr: "" });
  }
  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedDay = d.toString().padStart(2, "0");
    const formattedMonth = currentMonth.toString().padStart(2, "0");
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    
    // Find calendar info for this date from API response
    const dayInfo = calendarData.find((item: any) => item.date === dateStr);
    daysGrid.push({
      isPadding: false,
      day: d,
      dateStr,
      status: dayInfo?.status || "AVAILABLE",
      info: dayInfo
    });
  }

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  return (
    <div className="space-y-6 animate-smooth-appear">
      
      {/* Title & Dropdown Listing selection */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Lịch & Tồn kho</h2>
          <p className="text-xs text-gray-400">Đóng mở ngày nhận phòng cho từng dịch vụ của bạn.</p>
        </div>

        {/* Dropdown Select Listing */}
        <div className="w-full sm:w-64">
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Chọn dịch vụ chỗ nghỉ</label>
          {loadingListings ? (
            <div className="h-10 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
          ) : (
            <select
              value={selectedListingId}
              onChange={(e) => {
                setSelectedListingId(e.target.value);
                router.replace(`/host/calendar?listingId=${e.target.value}`);
              }}
              className="w-full bg-[#0d0d18] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-app-primary"
            >
              {listings.map((l) => (
                <option key={l.id} value={l.id} className="bg-[#0d0d18]">
                  {l.category === "STAY" ? "🏨 " : "🧗 "}{l.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Grid: Occupancy rate & Calendar view */}
      {selectedListingId ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Calendar Controller & Grid */}
          <div className="lg:col-span-2 bg-[#0d0d18] border border-white/5 rounded-2xl p-6 space-y-6">
            
            {/* Calendar Month Header Controller */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-app-primary" />
                {monthNames[currentMonth - 1]} năm {currentYear}
              </h3>
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={prevMonth}
                  className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={nextMonth}
                  className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Loading State */}
            {loadingCalendar ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-app-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 text-xs">Đang tải lịch trạng thái phòng...</p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <div>CN</div>
                  <div>T2</div>
                  <div>T3</div>
                  <div>T4</div>
                  <div>T5</div>
                  <div>T6</div>
                  <div>T7</div>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {daysGrid.map((item, index) => {
                    if (item.isPadding) {
                      return <div key={`pad-${index}`} className="aspect-square bg-transparent" />;
                    }

                    const isBlocked = item.status === "BLOCKED";
                    const isUpdating = submittingBlock === item.dateStr;

                    return (
                      <button
                        key={item.dateStr}
                        type="button"
                        onClick={() => handleToggleDay(item.dateStr, item.status)}
                        disabled={isUpdating}
                        className={`aspect-square rounded-xl border p-2 flex flex-col justify-between items-start transition-all relative group ${
                          isBlocked 
                            ? "bg-red-950/20 border-red-500/20 hover:border-red-500 text-red-400"
                            : "bg-emerald-950/10 border-emerald-500/10 hover:border-emerald-500 text-emerald-400"
                        } disabled:opacity-50`}
                      >
                        <span className="text-[10px] font-bold text-white">{item.day}</span>
                        
                        <div className="w-full flex justify-between items-center mt-auto">
                          <span className="text-[8px] uppercase font-bold tracking-tight">
                            {isBlocked ? "Khóa" : "Mở"}
                          </span>
                          {isBlocked ? (
                            <Lock className="w-2.5 h-2.5 text-red-500" />
                          ) : (
                            <Unlock className="w-2.5 h-2.5 text-emerald-500" />
                          )}
                        </div>

                        {/* Hover Overlay Tooltip */}
                        <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] font-bold text-white transition-opacity">
                          {isBlocked ? "Click để MỞ" : "Click để KHÓA"}
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>
            )}
          </div>

          {/* Sidebar Stats panel */}
          <div className="space-y-6">
            
            {/* Occupancy stats Card */}
            <div className="bg-[#0d0d18] border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
                <Percent className="w-4 h-4 text-app-primary" /> Thống kê lấp đầy
              </h3>

              {loadingCalendar ? (
                <div className="h-24 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-app-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : occupancyRate ? (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Công suất (Occupancy Rate):</span>
                    <strong className="text-app-accent text-sm font-bold">{occupancyRate.occupancyRate}%</strong>
                  </div>

                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-app-accent h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, occupancyRate.occupancyRate)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] text-gray-400">
                    <div className="bg-black/25 border border-white/5 p-2 rounded-xl">
                      <p>Khả năng phục vụ</p>
                      <strong className="text-white text-xs">{occupancyRate.totalCapacityInMonth} lượt</strong>
                    </div>
                    <div className="bg-black/25 border border-white/5 p-2 rounded-xl">
                      <p>Đã chốt (Confirmed)</p>
                      <strong className="text-white text-xs">{occupancyRate.soldCapacity} lượt</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 text-center py-4">Chưa có số liệu thống kê cho tháng này.</p>
              )}
            </div>

            {/* Legend Card */}
            <div className="bg-[#0d0d18] border border-white/5 rounded-2xl p-6 space-y-3">
              <h3 className="text-xs font-bold text-white pb-2 border-b border-white/5">Chú giải trạng thái</h3>
              
              <div className="space-y-2 text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-950/40 border border-emerald-500/20 rounded" />
                  <span className="text-gray-300"><strong>AVAILABLE (Trống):</strong> Ngày phòng trống, khách hàng có thể đặt phòng trực tuyến.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-950/40 border border-red-500/20 rounded" />
                  <span className="text-gray-300"><strong>BLOCKED (Khóa):</strong> Chủ nhà đã khóa ngày (sửa chữa, bận...). Khách không thể đặt.</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="text-center py-12 bg-[#0d0d18] border border-white/5 rounded-2xl">
          <p className="text-xs text-gray-500">Bạn chưa có chỗ nghỉ nào để quản lý lịch.</p>
        </div>
      )}

    </div>
  );
}

export default function HostCalendar() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-app-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-xs">Đang tải cấu phần lịch...</p>
        </div>
      </div>
    }>
      <CalendarComponent />
    </Suspense>
  );
}
