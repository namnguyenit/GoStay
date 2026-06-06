"use client";

import Image from "next/image";
import { useAdminInventory } from "./hook/useAdminInventory";
import type { InventoryAvailability } from "./hook/useAdminInventory";

export function InventoryScreen() {
  const {
    listingId,
    setListingId,
    listingsList,
    loadingListings,
    availability,
    loadingCalendar,
    forceUpdateData,
    setForceUpdateData,
    loading,
    actionResult,
    handleForceUpdate,
    handleSync,
    selectedDateDetail,
    setSelectedDateDetail,
    handleQuickForceUpdate,
    handleQuickRangeUnlock,
  } = useAdminInventory();

  const selectedListingInfo = listingsList.find((x) => x.id === listingId);
  const isAvailableStatus = (status: string) => status === "ACTIVE" || status === "AVAILABLE";

  // Group consecutive blocked dates
  const getBlockedRanges = (availList: InventoryAvailability[]) => {
    const blockedDates = Array.from(
      new Set(availList.filter((x) => x.status === "BLOCKED").map((x) => x.date))
    ).sort() as string[];

    const ranges: { startDate: string; endDate: string; count: number }[] = [];
    let start: string | null = null;
    let end: string | null = null;

    blockedDates.forEach((dateStr) => {
      if (!start) {
        start = dateStr;
        end = dateStr;
      } else {
        const prevDate = new Date(end!);
        const currDate = new Date(dateStr);
        const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
          end = dateStr;
        } else {
          ranges.push({
            startDate: start,
            endDate: end!,
            count: Math.ceil((new Date(end!).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1,
          });
          start = dateStr;
          end = dateStr;
        }
      }
    });

    if (start && end) {
      ranges.push({
        startDate: start,
        endDate: end,
        count: Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1,
      });
    }

    return ranges;
  };

  const blockedRanges = getBlockedRanges(availability);

  // Helper to color-code availability cards
  const getAvailabilityColor = (avail: number, total: number, status: string) => {
    if (!isAvailableStatus(status)) return "bg-white border-slate-300 text-slate-700";
    if (avail === 0) return "bg-white border-slate-300 text-slate-700";
    if (total <= 0) return "bg-slate-50 border-slate-200 text-slate-700";
    const percent = (avail / total) * 100;
    if (percent < 50) return "bg-slate-50 border-slate-300 text-slate-700";
    return "bg-slate-100 border-slate-300 text-slate-900";
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const w = weekdays[d.getDay()];
    return { date: `${day}/${month}`, weekday: w };
  };

  return (
    <div className="min-w-0 max-w-6xl space-y-6 animate-smooth-appear">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Quản lý tồn kho (Inventory)</h2>
        <p className="text-xs text-slate-500 mt-1">Đồng bộ, khóa ngày khẩn cấp và cập nhật trạng thái kho phòng của các dịch vụ.</p>
      </div>

      {actionResult && (
        <div
          className={`p-3.5 rounded-xl text-xs border flex items-center gap-2 ${
            actionResult.type === "success"
              ? "bg-white border-slate-200 text-slate-900"
              : "bg-slate-50 border-slate-200 text-slate-700"
          }`}
        >
          {actionResult.type === "success" ? "✅" : "❌"} {actionResult.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Selector & Actions */}
        <div className="space-y-6 md:col-span-1">
          {/* Target Listing Card */}
          <div className="bg-white rounded-[20px] border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Chọn Dịch vụ</h3>

            {/* Select dropdown from list */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Danh sách dịch vụ đang hoạt động
              </label>
              {loadingListings ? (
                <div className="h-8 bg-slate-50 animate-pulse rounded-lg" />
              ) : (
                <select
                  value={listingId}
                  onChange={(e) => setListingId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300 bg-white text-slate-700 font-medium"
                >
                  <option value="">-- Chọn dịch vụ --</option>
                  {listingsList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} ({item.province})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedListingInfo && (
              <div className="mb-4 p-3.5 bg-slate-50/50 rounded-[14px] border border-slate-100 space-y-3 text-xs">
                <div className="flex gap-2.5 items-center">
                  {selectedListingInfo.thumbnailUrl ? (
                    <Image
                      unoptimized
                      src={selectedListingInfo.thumbnailUrl}
                      alt={selectedListingInfo.title ?? "listing thumbnail"}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-100 bg-white"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 text-[10px] font-bold">
                      GoStay
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-slate-900 text-xs truncate" title={selectedListingInfo.title}>{selectedListingInfo.title}</h4>
                    <p className="text-[9px] text-slate-500 font-mono truncate">ID: {selectedListingInfo.id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  <div>Danh mục: <span className="text-slate-700 block text-xs font-semibold normal-case mt-0.5">{selectedListingInfo.category}</span></div>
                  <div>Vị trí: <span className="text-slate-700 block text-xs font-semibold normal-case mt-0.5">{selectedListingInfo.province}</span></div>
                  <div>Giá cơ bản: <span className="text-slate-700 block text-xs font-semibold normal-case mt-0.5">{selectedListingInfo.basePrice?.toLocaleString()}đ</span></div>
                  <div>Trạng thái: <span className="text-slate-700 block text-xs font-semibold normal-case mt-0.5">{selectedListingInfo.status}</span></div>
                </div>
              </div>
            )}

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-3 text-slate-500 text-[9px] uppercase font-bold tracking-wider">Hoặc nhập ID thủ công</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Manual UUID Input */}
            <div className="mb-4 mt-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Listing ID (UUID)
              </label>
              <input
                type="text"
                value={listingId}
                onChange={(e) => setListingId(e.target.value)}
                placeholder="Nhập UUID dịch vụ..."
                className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300 text-slate-700 font-medium"
              />
            </div>

            <button
              onClick={handleSync}
              disabled={loading || !listingId}
              className="w-full px-4 py-2 bg-sky-500 text-white rounded-full text-xs font-semibold hover:bg-sky-600 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? "Đang xử lý..." : "🔄 Đồng bộ tồn kho ngay (Sync)"}
            </button>
          </div>

          {/* Force Update Panel */}
          <div className="bg-white rounded-[20px] border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Can thiệp khẩn cấp (Force Update)</h3>
            <form onSubmit={handleForceUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Trạng thái mới <span className="text-slate-500">*</span>
                </label>
                <select
                  value={forceUpdateData.status}
                  onChange={(e) => setForceUpdateData({ ...forceUpdateData, status: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300 bg-white text-slate-700 font-medium"
                >
                  <option value="">-- Chọn trạng thái --</option>
                  <option value="BLOCKED">Phong tỏa / Đóng kho (BLOCKED)</option>
                  <option value="AVAILABLE">Mở kho / Hoạt động (AVAILABLE)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                    Từ ngày <span className="text-slate-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={forceUpdateData.startDate}
                    onChange={(e) => setForceUpdateData({ ...forceUpdateData, startDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300 text-slate-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                    Đến ngày <span className="text-slate-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={forceUpdateData.endDate}
                    onChange={(e) => setForceUpdateData({ ...forceUpdateData, endDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300 text-slate-700 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Lý do can thiệp
                </label>
                <textarea
                  value={forceUpdateData.reason}
                  onChange={(e) => setForceUpdateData({ ...forceUpdateData, reason: e.target.value })}
                  placeholder="Ghi chú lý do thay đổi..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300 resize-none text-slate-700 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !listingId || !forceUpdateData.status || !forceUpdateData.startDate || !forceUpdateData.endDate}
                className="w-full px-4 py-2 bg-sky-500 text-white rounded-full text-xs font-semibold hover:bg-sky-600 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? "Đang xử lý..." : "⚠️ Thực thi Force Update"}
              </button>
            </form>
          </div>

          {/* Blocked Ranges visual list */}
          {listingId && (
            <div className="bg-white rounded-[20px] border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
              <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">🔒 Ngày đang phong tỏa</span>
                <span className="text-[10px] bg-slate-50 text-slate-700 px-2 py-0.5 rounded-full font-semibold border border-slate-200">
                  {blockedRanges.length} khoảng
                </span>
              </h3>
              
              {blockedRanges.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  🍃 Không có ngày nào bị khóa trong 30 ngày tới.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {blockedRanges.map((range, idx) => {
                    const startFmt = new Date(range.startDate).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
                    const endFmt = new Date(range.endDate).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
                    return (
                      <div key={idx} className="p-3 bg-slate-50/70 rounded-[14px] border border-slate-200 flex flex-col justify-between gap-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-slate-900 text-xs">
                              📅 {startFmt} - {endFmt}
                            </span>
                            <span className="text-[10px] text-slate-500 block font-medium mt-0.5">
                              Tổng cộng: {range.count} ngày bị đóng
                            </span>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-300 font-bold tracking-wider uppercase">
                            LOCKED
                          </span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleQuickRangeUnlock(range.startDate, range.endDate)}
                          disabled={loading}
                          className="w-full py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-semibold transition-all shadow-sm"
                        >
                          {loading ? "Đang xử lý..." : "🔓 Mở khóa nhanh khoảng này"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Visual 30-day calendar view */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-[20px] border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-[500px]">
            <div className="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center text-xs">
              <h3 className="font-semibold text-slate-900">Lịch trống & Tồn kho (30 ngày tiếp theo)</h3>
              {listingId && (
                <span className="text-[10px] font-mono text-slate-500">Dịch vụ: {listingId.substring(0, 16)}...</span>
              )}
            </div>

            {loadingCalendar ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : !listingId ? (
              <div className="flex flex-col items-center justify-center h-80 text-slate-500 text-xs">
                <span>📍 Hãy chọn một dịch vụ để xem lịch tồn kho</span>
              </div>
            ) : availability.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 text-slate-500 text-xs text-center">
                <span>⚠️ Chưa cấu hình tồn kho hoặc không tìm thấy dữ liệu tồn kho.</span>
                <span className="text-[10px] text-slate-500 mt-1">Bấm &quot;Đồng bộ tồn kho ngay&quot; ở bên trái để khởi tạo lịch!</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Visual Legend */}
                <div className="flex gap-4 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span> Còn trống nhiều
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span> Còn ít chỗ (&lt;50%)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-300"></span> Hết chỗ / Khóa
                  </div>
                </div>

                {/* Date-by-date Availability Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {availability.map((item, index) => {
                    const label = formatDateLabel(item.date);
                    const safeTotal = item.totalQuantity ?? 0;
                    const fillPercent = safeTotal > 0 ? (item.availableQuantity / safeTotal) * 100 : 0;
                    const isFull = item.availableQuantity === 0 || !isAvailableStatus(item.status);
                    const isAllDay = item.timeSlot === "ALL_DAY";

                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedDateDetail(item)}
                        className={`p-3 rounded-xl border flex flex-col justify-between transition-all hover:shadow-sm cursor-pointer ${getAvailabilityColor(
                          item.availableQuantity,
                          safeTotal,
                          item.status
                        )}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-slate-900 text-[13px]">{label.date}</div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Thứ {label.weekday}</div>
                          </div>
                          <span
                            className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                              item.status === "ACTIVE" || item.status === "AVAILABLE"
                                ? "bg-slate-100 text-slate-900"
                                : "bg-white text-slate-600 border border-slate-300"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <div className="mt-2.5">
                          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Sức chứa</div>
                          <div className="flex justify-between items-baseline text-xs text-slate-700">
                            <span className="font-semibold text-slate-900">{item.availableQuantity}</span>
                            <span className="text-[9px] text-slate-500">
                              {safeTotal > 0 ? `/ ${safeTotal} chỗ` : "/ chưa có tổng"}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isFull
                                  ? "bg-sky-300"
                                  : safeTotal > 0 && item.availableQuantity / safeTotal < 0.5
                                  ? "bg-blue-600"
                                  : "bg-sky-500"
                              }`}
                              style={{
                                width: `${fillPercent}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {!isAllDay && (
                          <div className="mt-2 text-[9px] font-semibold text-slate-500 border-t border-slate-100 pt-1 truncate" title={item.timeSlot ?? ""}>
                            🕒 {item.timeSlot}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date Details Modal */}
      {selectedDateDetail && (
        <div className="fixed inset-0 bg-sky-500/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-[20px] shadow-xl border border-slate-100 w-full max-w-xs overflow-hidden animate-scale-up">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-semibold text-slate-900 text-xs">🗓️ Chi tiết ngày: {new Date(selectedDateDetail.date).toLocaleDateString("vi-VN")}</h3>
              <button
                onClick={() => setSelectedDateDetail(null)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/40 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Trạng thái</span>
                  <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-bold mt-1 ${
                    selectedDateDetail.status === "ACTIVE" || selectedDateDetail.status === "AVAILABLE"
                      ? "bg-slate-100 text-slate-900 border border-slate-200"
                      : "bg-white text-slate-600 border border-slate-300"
                  }`}>
                    {selectedDateDetail.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Khung giờ</span>
                  <span className="font-semibold text-slate-700 mt-1 block">{selectedDateDetail.timeSlot}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Đã đặt chỗ</span>
                  <span className="font-semibold text-slate-700 block mt-1">
                    {selectedDateDetail.totalQuantity !== undefined
                      ? `${Math.max(0, selectedDateDetail.totalQuantity - (selectedDateDetail.availableQuantity || 0))} chỗ`
                      : "Chưa có dữ liệu"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Còn trống</span>
                  <span className="font-semibold text-slate-900 block mt-1">
                    {selectedDateDetail.availableQuantity} / {selectedDateDetail.totalQuantity ?? "chưa có tổng"} chỗ
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3.5 space-y-2">
                <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-700">Can thiệp khẩn cấp (Emergency Lock)</h4>
                <p className="text-[9px] text-slate-500 leading-relaxed">
                  Thay đổi trạng thái cưỡng chế trực tiếp đối với ngày này trên hệ thống. Lịch hiển thị của khách hàng sẽ được cập nhật ngay lập tức.
                </p>
                <div className="flex gap-2 pt-1">
                  {(selectedDateDetail.status === "ACTIVE" || selectedDateDetail.status === "AVAILABLE") ? (
                    <button
                      onClick={() => handleQuickForceUpdate(selectedDateDetail.date, "BLOCKED")}
                      disabled={loading}
                      className="flex-1 py-2 bg-sky-500 text-white rounded-full text-[10px] font-semibold hover:bg-sky-600 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {loading ? "Đang xử lý..." : "🔒 Khóa khẩn cấp"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleQuickForceUpdate(selectedDateDetail.date, "AVAILABLE")}
                      disabled={loading}
                      className="flex-1 py-2 bg-sky-500 text-white rounded-full text-[10px] font-semibold hover:bg-sky-600 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {loading ? "Đang xử lý..." : "🔓 Mở kho hoạt động"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
