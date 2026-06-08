"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Lock, Unlock, Percent } from "lucide-react";
import HostService from "@/services/enterprise.service";
import { HostListing, getErrorMessage, normalizePage } from "../_utils";

type CalendarEntry = {
  date?: string;
  status?: string;
  availableQuantity?: number;
  totalQuantity?: number;
  confirmedQuantity?: number;
};

type CalendarDay = {
  isPadding: boolean;
  day: number;
  dateStr: string;
  status?: string;
  info?: CalendarEntry;
};

type OccupancyRate = {
  occupancyRate?: number;
  totalCapacityInMonth?: number;
  soldCapacity?: number;
};

function CalendarComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [listings, setListings] = useState<HostListing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string>("");
  const [loadingListings, setLoadingListings] = useState(true);

  // Calendar Date State
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [calendarData, setCalendarData] = useState<CalendarEntry[]>([]);
  const [occupancyRate, setOccupancyRate] = useState<OccupancyRate | null>(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Tab & Initial Configuration States
  const [activeTab, setActiveTab] = useState<"calendar" | "config">("calendar");
  const [defaultQuantity, setDefaultQuantity] = useState<number>(2);
  const [slotsList, setSlotsList] = useState<Array<{ slot: string }>>([
    { slot: "08:00 - 10:00" },
    { slot: "14:00 - 16:00" }
  ]);
  const [newSlot, setNewSlot] = useState<string>("");
  const [initializing, setInitializing] = useState(false);

  const currentMonth = currentDate.getMonth() + 1; // 1-indexed
  const currentYear = currentDate.getFullYear();

  // 1. Fetch Listings initially
  useEffect(() => {
    async function loadListings() {
      try {
        setLoadingListings(true);
        const res = await HostService.getMyListings(0, 100);
        if (res && res.data) {
          const content = normalizePage<HostListing>(res, 100).content;
          setListings(content);
          
          // Check query param
          const queryId = searchParams.get("listingId");
          if (queryId) {
            setSelectedListingId(queryId);
          } else if (content.length > 0) {
            setSelectedListingId(content[0].id);
          }
        }
      } catch {
        setFeedback({ type: "error", message: "Không thể tải danh sách dịch vụ." });
      } finally {
        setLoadingListings(false);
      }
    }
    loadListings();
  }, [searchParams]);

  // 2. Fetch Calendar data once listing/date changes
  const fetchCalendarAndStats = useCallback(async () => {
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
      } catch {
        setOccupancyRate(null);
      }
    } catch {
      setFeedback({ type: "error", message: "Không thể tải lịch nhận khách." });
    } finally {
      setLoadingCalendar(false);
    }
  }, [currentMonth, currentYear, selectedListingId]);

  useEffect(() => {
    fetchCalendarAndStats();
  }, [fetchCalendarAndStats]);

  const selectedListing = listings.find((l) => l.id === selectedListingId);
  const category = selectedListing?.category || "STAY";

  // Slots Helpers
  const addSlot = () => {
    if (newSlot.trim() && !slotsList.some((s) => s.slot === newSlot.trim())) {
      setSlotsList([...slotsList, { slot: newSlot.trim() }]);
      setNewSlot("");
    }
  };
  const removeSlot = (index: number) => {
    setSlotsList(slotsList.filter((_, i) => i !== index));
  };

  // Initialize Inventory Config
  const handleInitialize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListingId) return;

    try {
      setInitializing(true);
      const isAlreadyInitialized = calendarData && calendarData.length > 0;
      const configPayload = {
        category: category,
        quantity: defaultQuantity,
        totalQuantity: defaultQuantity,
        timeSlots: category !== "STAY" ? slotsList.map((s) => s.slot) : []
      };

      if (isAlreadyInitialized) {
        await HostService.updateInventoryConfig(selectedListingId, configPayload);
        setFeedback({ type: "success", message: "Cập nhật cấu hình khả dụng thành công." });
      } else {
        await HostService.initializeInventory(selectedListingId, configPayload);
        setFeedback({ type: "success", message: "Khởi tạo cấu hình khả dụng thành công. Hệ thống đã tự động sinh lịch 90 ngày." });
      }
      
      setActiveTab("calendar");
      fetchCalendarAndStats();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: `Khởi tạo thất bại: ${getErrorMessage(err)}` });
    } finally {
      setInitializing(false);
    }
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 2, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth, 1));
  };

  // Day Click handler
  const handleDayClick = (item: CalendarDay) => {
    if (!selectedListingId) return;
    router.push(`/enterprise/calendar/${selectedListingId}/${item.dateStr}`);
  };

  // Build Calendar grid
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay(); // Sunday=0, Monday=1...

  const daysGrid: CalendarDay[] = [];
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
    const dayInfo = calendarData.find((item) => item.date === dateStr);
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
          <h2 className="text-lg font-bold text-gray-900">Lịch nhận khách</h2>
          <p className="text-xs text-gray-600">Theo dõi ngày mở bán, ngày khóa và lượng đặt theo từng dịch vụ.</p>
        </div>

        {/* Dropdown Select Listing */}
        <div className="w-full sm:w-64">
          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Chọn dịch vụ chỗ nghỉ</label>
          {loadingListings ? (
            <div className="h-10 bg-gray-100 border border-gray-300 rounded-xl animate-pulse" />
          ) : (
            <select
              value={selectedListingId}
              onChange={(e) => {
                setSelectedListingId(e.target.value);
                router.replace(`/enterprise/calendar?listingId=${e.target.value}`);
              }}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-app-primary"
            >
              {listings.map((l) => (
                <option key={l.id} value={l.id} className="bg-white">
                  {l.category === "STAY" ? "🏨 " : "🧗 "}{l.title}
                </option>
              ))}
            </select>
          )}
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

      {/* Tab Switcher */}
      {selectedListingId && (
        <div className="flex gap-4 border-b border-gray-200 pb-0.5">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`pb-2.5 text-xs font-bold transition-all relative ${
              activeTab === "calendar"
                ? "text-app-primary border-b-2 border-app-primary"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Lịch trạng thái
          </button>
          <button
            onClick={() => router.push(`/enterprise/availability?listingId=${selectedListingId}`)}
            className="pb-2.5 text-xs font-bold text-gray-600 transition-all hover:text-gray-900"
          >
            Sang cấu hình khả dụng
          </button>
        </div>
      )}

      {/* Main Grid: Occupancy rate & Calendar view */}
      {selectedListingId ? (
        activeTab === "config" ? (
          /* CONFIG INVENTORY VIEW */
          <form onSubmit={handleInitialize} className="bg-white border border-gray-200 rounded-2xl p-6 max-w-xl space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Thiết lập khả dụng cho: <span className="text-app-primary">{selectedListing?.title}</span>
              </h3>
              <p className="text-2xs text-gray-600 uppercase tracking-wider">
                Loại hình: {category === "STAY" ? "Lưu trú (STAY)" : category === "EXP" ? "Trải nghiệm (EXP)" : "Dịch vụ (SVC)"}
              </p>
            </div>

            {category === "STAY" ? (
              /* STAY CAPACITY SETUP */
              <div className="space-y-2">
                <label className="block text-2xs font-bold text-gray-600 uppercase">
                  Số phòng / Căn hộ khả dụng mặc định mỗi ngày
                </label>
                <input
                  type="number"
                  min="1"
                  value={defaultQuantity}
                  onChange={(e) => setDefaultQuantity(Number(e.target.value))}
                  required
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-app-primary"
                  placeholder="Ví dụ: 2"
                />
                <p className="text-[10px] text-gray-500 leading-normal">
                  * Thiết lập này xác định số lượng phòng tối đa của chỗ lưu trú này có thể nhận đặt trực tuyến mỗi ngày.
                </p>
              </div>
            ) : (
              /* EXP/SVC SLOTS SETUP */
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-2xs font-bold text-gray-600 uppercase">
                    Số chỗ phục vụ tối đa của mỗi khung giờ
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={defaultQuantity}
                    onChange={(e) => setDefaultQuantity(Number(e.target.value))}
                    required
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-app-primary"
                    placeholder="Ví dụ: 5"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-1">
                    <span className="text-2xs font-bold text-gray-600 uppercase">Khung giờ hoạt động</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ví dụ: 08:00 - 10:00"
                      value={newSlot}
                      onChange={(e) => setNewSlot(e.target.value)}
                      className="flex-grow bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-app-primary"
                    />
                    <button
                      type="button"
                      onClick={addSlot}
                      className="bg-gray-100 hover:bg-white/10 border border-gray-300 text-gray-900 px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      Thêm giờ
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {slotsList.length === 0 ? (
                      <p className="text-[10px] text-gray-500 text-center py-2">Chưa cấu hình khung giờ nào. Vui lòng thêm giờ hoạt động!</p>
                    ) : (
                      slotsList.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-2xs">
                          <span className="text-gray-900 font-semibold">{item.slot}</span>
                          <button
                            type="button"
                            onClick={() => removeSlot(index)}
                            className="text-red-600 hover:text-red-600 font-bold px-1"
                          >
                            Xóa
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <button
                type="submit"
                disabled={initializing || (category !== "STAY" && slotsList.length === 0)}
                className="bg-app-primary hover:bg-app-primary/95 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-app-primary/20 disabled:opacity-50 transition-all"
              >
                {initializing ? "Đang xử lý khởi tạo..." : "Khởi tạo khả dụng & mở lịch 90 ngày"}
              </button>
            </div>
          </form>
        ) : (
          /* CALENDAR RENDER VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Calendar Controller & Grid */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
            
            {/* Calendar Month Header Controller */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-app-primary" />
                {monthNames[currentMonth - 1]} năm {currentYear}
              </h3>
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={prevMonth}
                  className="p-1.5 bg-gray-100 hover:bg-white/10 border border-gray-300 rounded-lg text-gray-900"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={nextMonth}
                  className="p-1.5 bg-gray-100 hover:bg-white/10 border border-gray-300 rounded-lg text-gray-900"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Loading State */}
            {loadingCalendar ? (
              <div className="space-y-4 w-full">
                <div className="grid grid-cols-7 gap-2">
                  {[1,2,3,4,5,6,7].map(i => <div key={i} className="h-4 bg-gray-200 animate-shimmer rounded"></div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({length: 35}).map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-100 border border-gray-200 animate-shimmer rounded-xl"></div>
                  ))}
                </div>
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
                {calendarData.length === 0 ? (
                  /* UN-INITIALIZED INVENTORY BANNER */
                  <div className="p-8 border border-dashed border-gray-300 rounded-2xl text-center space-y-3">
                    <p className="text-xs text-gray-600">
                      Dịch vụ này chưa được thiết lập khả dụng và lịch nhận khách.
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push(`/enterprise/availability?listingId=${selectedListingId}`)}
                      className="bg-app-primary hover:bg-app-primary/95 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      Thiết lập khả dụng ngay
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-2">
                    {daysGrid.map((item, index) => {
                      if (item.isPadding) {
                        return <div key={`pad-${index}`} className="aspect-square bg-transparent" />;
                      }

                      const isBlocked = item.status === "BLOCKED";
                      const info = item.info;

                      return (
                        <button
                          key={item.dateStr}
                          type="button"
                          onClick={() => handleDayClick(item)}
                          disabled={false}
                          className={`aspect-square rounded-xl border p-2 flex flex-col justify-between items-start transition-all relative group ${
                            isBlocked 
                              ? "bg-red-50/20 border-red-200 hover:border-red-500 text-red-600"
                              : "bg-emerald-50 border-emerald-200 hover:border-emerald-500 text-emerald-600"
                          } disabled:opacity-50`}
                        >
                          <span className="text-[10px] font-bold text-gray-900">{item.day}</span>
                          
                          {/* Occupancy Indicator */}
                          {info && (
                            <div className="text-[8px] font-semibold text-gray-700 mt-0.5 leading-tight">
                              Còn: <span className={(info.availableQuantity ?? 0) > 0 ? "text-emerald-600" : "text-gray-500"}>{info.availableQuantity ?? 0}</span>/{info.totalQuantity ?? 0}
                              {(info.confirmedQuantity ?? 0) > 0 && (
                                <span className="text-app-accent block text-[7px] mt-0.5 font-bold">Đặt: {info.confirmedQuantity ?? 0}</span>
                              )}
                            </div>
                          )}
                          
                          <div className="w-full flex justify-between items-center mt-auto pt-1">
                            <span className="text-[8px] uppercase font-bold tracking-tight">
                              {isBlocked ? "Khóa" : "Mở"}
                            </span>
                            {isBlocked ? (
                              <Lock className="w-2.5 h-2.5 text-red-600" />
                            ) : (
                              <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                            )}
                          </div>

                          {/* Hover Overlay Tooltip */}
                          <div className="absolute inset-0 bg-gray-900/5 backdrop-blur-[1px] rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-gray-800 transition-opacity">
                            Click để thiết lập
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Sidebar Stats panel */}
          <div className="space-y-6">
            
            {/* Occupancy stats Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-200">
                <Percent className="w-4 h-4 text-app-primary" /> Thống kê lấp đầy
              </h3>

              {loadingCalendar ? (
                <div className="h-24 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-app-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : occupancyRate ? (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Công suất (Occupancy Rate):</span>
                    <strong className="text-app-accent text-sm font-bold">{occupancyRate.occupancyRate}%</strong>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-app-accent h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, occupancyRate.occupancyRate ?? 0)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] text-gray-600">
                    <div className="bg-white border border-gray-200 p-2 rounded-xl">
                      <p>Khả năng phục vụ</p>
                      <strong className="text-gray-900 text-xs">{occupancyRate.totalCapacityInMonth} lượt</strong>
                    </div>
                    <div className="bg-white border border-gray-200 p-2 rounded-xl">
                      <p>Đã chốt (Confirmed)</p>
                      <strong className="text-gray-900 text-xs">{occupancyRate.soldCapacity} lượt</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 text-center py-4">Chưa có số liệu thống kê cho tháng này.</p>
              )}
            </div>

            {/* Legend Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
              <h3 className="text-xs font-bold text-gray-900 pb-2 border-b border-gray-200">Chú giải trạng thái</h3>
              
              <div className="space-y-2 text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-100 border border-emerald-200 rounded" />
                  <span className="text-gray-700"><strong>AVAILABLE (Trống):</strong> Ngày phòng trống, khách hàng có thể đặt phòng trực tuyến.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-50/40 border border-red-200 rounded" />
                  <span className="text-gray-700"><strong>BLOCKED (Khóa):</strong> Doanh nghiệp đã khóa ngày (bảo trì, kín lịch...). Khách không thể đặt.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
        )
      ) : (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
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
          <p className="text-gray-600 text-xs">Đang tải cấu phần lịch...</p>
        </div>
      </div>
    }>
      <CalendarComponent />
    </Suspense>
  );
}
