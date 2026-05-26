"use client";

import { useAdminInventory } from "./hook/useAdminInventory";

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

  // Group consecutive blocked dates
  const getBlockedRanges = (availList: any[]) => {
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
    if (status !== "ACTIVE" && status !== "AVAILABLE") return "bg-red-50 border-red-200 text-red-800";
    if (avail === 0) return "bg-red-50 border-red-200 text-red-800";
    const percent = (avail / total) * 100;
    if (percent < 50) return "bg-amber-50 border-amber-200 text-amber-800";
    return "bg-green-50 border-green-200 text-green-800";
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
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-bold text-gray-900">Quản lý Tồn kho (Inventory)</h2>

      {actionResult && (
        <div
          className={`p-4 rounded-xl text-sm border shadow-sm ${
            actionResult.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {actionResult.type === "success" ? "✅" : "❌"} {actionResult.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Selector & Actions */}
        <div className="space-y-6 md:col-span-1">
          {/* Target Listing Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Chọn Dịch vụ</h3>

            {/* Select dropdown from list */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh sách dịch vụ đang hoạt động
              </label>
              {loadingListings ? (
                <div className="h-10 bg-gray-100 animate-pulse rounded-lg" />
              ) : (
                <select
                  value={listingId}
                  onChange={(e) => setListingId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 outline-none bg-white text-gray-800"
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
              <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-150 space-y-3">
                <div className="flex gap-3 items-center">
                  {selectedListingInfo.thumbnailUrl ? (
                    <img
                      src={selectedListingInfo.thumbnailUrl}
                      alt={selectedListingInfo.title}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs font-semibold">
                      GoStay
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-900 text-xs truncate" title={selectedListingInfo.title}>{selectedListingInfo.title}</h4>
                    <p className="text-[10px] text-gray-400 font-mono truncate">ID: {selectedListingInfo.id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold">
                  <div className="text-gray-500">Danh mục: <span className="text-gray-800 block text-xs">{selectedListingInfo.category}</span></div>
                  <div className="text-gray-500">Vị trí: <span className="text-gray-800 block text-xs">{selectedListingInfo.province}</span></div>
                  <div className="text-gray-500">Giá cơ bản: <span className="text-gray-800 block text-xs">{selectedListingInfo.basePrice?.toLocaleString()}đ</span></div>
                  <div className="text-gray-500">Trạng thái: <span className="text-gray-800 block text-xs">{selectedListingInfo.status}</span></div>
                </div>
              </div>
            )}

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase font-semibold">Hoặc nhập ID thủ công</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Manual UUID Input */}
            <div className="mb-4 mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Listing ID (UUID)
              </label>
              <input
                type="text"
                value={listingId}
                onChange={(e) => setListingId(e.target.value)}
                placeholder="Nhập UUID dịch vụ..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 outline-none text-gray-800"
              />
            </div>

            <button
              onClick={handleSync}
              disabled={loading || !listingId}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? "Đang xử lý..." : "🔄 Đồng bộ tồn kho ngay (Sync)"}
            </button>
          </div>

          {/* Force Update Panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2 text-red-600">Can thiệp khẩn cấp (Force Update)</h3>
            <form onSubmit={handleForceUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái mới <span className="text-red-500">*</span>
                </label>
                <select
                  value={forceUpdateData.status}
                  onChange={(e) => setForceUpdateData({ ...forceUpdateData, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 outline-none bg-white text-gray-800"
                >
                  <option value="">-- Chọn trạng thái --</option>
                  <option value="BLOCKED">Phong tỏa / Đóng kho (BLOCKED)</option>
                  <option value="AVAILABLE">Mở kho / Hoạt động (AVAILABLE)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-2xs font-semibold text-gray-500 uppercase mb-1">
                    Từ ngày <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={forceUpdateData.startDate}
                    onChange={(e) => setForceUpdateData({ ...forceUpdateData, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-red-300 outline-none text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-gray-500 uppercase mb-1">
                    Đến ngày <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={forceUpdateData.endDate}
                    onChange={(e) => setForceUpdateData({ ...forceUpdateData, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-red-300 outline-none text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lý do can thiệp
                </label>
                <textarea
                  value={forceUpdateData.reason}
                  onChange={(e) => setForceUpdateData({ ...forceUpdateData, reason: e.target.value })}
                  placeholder="Ghi chú lý do thay đổi..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 outline-none resize-none text-gray-800"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !listingId || !forceUpdateData.status || !forceUpdateData.startDate || !forceUpdateData.endDate}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? "Đang xử lý..." : "⚠️ Thực thi Force Update"}
              </button>
            </form>
          </div>

          {/* Blocked Ranges visual list */}
          {listingId && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">🔒 Khoảng ngày đang phong tỏa</span>
                <span className="text-2xs bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold">
                  {blockedRanges.length} khoảng
                </span>
              </h3>
              
              {blockedRanges.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400">
                  🍃 Không có ngày nào bị khóa trong khoảng 30 ngày tới.
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {blockedRanges.map((range, idx) => {
                    const startFmt = new Date(range.startDate).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
                    const endFmt = new Date(range.endDate).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
                    return (
                      <div key={idx} className="p-3 bg-red-50/50 rounded-xl border border-red-100 flex flex-col justify-between gap-2.5 hover:bg-red-50/80 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-extrabold text-gray-900 text-xs">
                              📅 {startFmt} - {endFmt}
                            </span>
                            <span className="text-2xs text-gray-500 block font-medium mt-0.5">
                              Tổng cộng: {range.count} ngày bị đóng
                            </span>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-200 text-red-800 font-extrabold tracking-wider uppercase">
                            LOCKED
                          </span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleQuickRangeUnlock(range.startDate, range.endDate)}
                          disabled={loading}
                          className="w-full py-1.5 bg-white border border-red-200 hover:bg-red-100 text-red-700 rounded-lg text-2xs font-extrabold transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
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
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-[500px]">
            <div className="border-b pb-4 mb-4 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Lịch trống & Tồn kho (30 ngày tiếp theo)</h3>
              {listingId && (
                <span className="text-xs font-mono text-gray-400">Dịch vụ: {listingId}</span>
              )}
            </div>

            {loadingCalendar ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : !listingId ? (
              <div className="flex flex-col items-center justify-center h-80 text-gray-400 text-sm">
                <span>📍 Hãy chọn một dịch vụ để xem lịch tồn kho</span>
              </div>
            ) : availability.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 text-gray-400 text-sm">
                <span>⚠️ Chưa cấu hình tồn kho hoặc không tìm thấy dữ liệu tồn kho.</span>
                <span className="text-xs text-gray-400 mt-2">Bấm "Đồng bộ tồn kho ngay" ở bên trái để khởi tạo lịch!</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Visual Legend */}
                <div className="flex gap-4 text-xs text-gray-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span> Còn trống nhiều
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span> Còn ít chỗ (&lt;50%)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span> Hết chỗ / Khóa
                  </div>
                </div>

                {/* Date-by-date Availability Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {availability.map((item, index) => {
                    const label = formatDateLabel(item.date);
                    const isFull = item.availableQuantity === 0 || item.status !== "ACTIVE";
                    const isAllDay = item.timeSlot === "ALL_DAY";

                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedDateDetail(item)}
                        className={`p-3 rounded-xl border flex flex-col justify-between transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer ${getAvailabilityColor(
                          item.availableQuantity,
                          item.totalQuantity || 5,
                          item.status
                        )}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-extrabold text-sm text-gray-900">{label.date}</div>
                            <div className="text-2xs text-gray-400 font-bold tracking-tight">Thứ {label.weekday}</div>
                          </div>
                          <span
                            className={`text-2xs px-1 rounded font-bold uppercase tracking-wider ${
                              item.status === "ACTIVE" || item.status === "AVAILABLE"
                                ? "bg-green-200 text-green-800"
                                : "bg-red-200 text-red-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <div className="mt-3">
                          <div className="text-2xs text-gray-400 font-bold uppercase mb-1">Sức chứa</div>
                          <div className="flex justify-between items-baseline text-sm">
                            <span className="font-extrabold text-gray-900">{item.availableQuantity}</span>
                            <span className="text-2xs text-gray-400">/ {item.totalQuantity || 5} chỗ</span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isFull
                                  ? "bg-red-500"
                                  : item.availableQuantity / (item.totalQuantity || 5) < 0.5
                                  ? "bg-amber-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${((item.availableQuantity || 0) / (item.totalQuantity || 5)) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {!isAllDay && (
                          <div className="mt-2 text-2xs font-semibold text-gray-500 border-t pt-1 border-gray-100 truncate" title={item.timeSlot}>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-900 text-sm">🗓️ Chi tiết ngày: {new Date(selectedDateDetail.date).toLocaleDateString("vi-VN")}</h3>
              <button
                onClick={() => setSelectedDateDetail(null)}
                className="text-gray-400 hover:text-gray-600 font-semibold text-sm"
              >✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Trạng thái</span>
                  <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-extrabold mt-1 ${
                    selectedDateDetail.status === "ACTIVE" || selectedDateDetail.status === "AVAILABLE"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {selectedDateDetail.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Khung giờ</span>
                  <span className="font-bold text-gray-800 mt-1 block">{selectedDateDetail.timeSlot}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Đã đặt chỗ</span>
                  <span className="font-bold text-gray-800 block mt-1">
                    {Math.max(0, (selectedDateDetail.totalQuantity || 5) - (selectedDateDetail.availableQuantity || 0))} chỗ
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Còn trống</span>
                  <span className="font-bold text-green-600 block mt-1">
                    {selectedDateDetail.availableQuantity} / {selectedDateDetail.totalQuantity || 5} chỗ
                  </span>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-red-500">Can thiệp khẩn cấp (Emergency Lock)</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Thay đổi trạng thái cưỡng chế trực tiếp đối với ngày này trên hệ thống. Lịch hiển thị của khách hàng sẽ được cập nhật ngay lập tức.
                </p>
                <div className="flex gap-2 pt-1">
                  {(selectedDateDetail.status === "ACTIVE" || selectedDateDetail.status === "AVAILABLE") ? (
                    <button
                      onClick={() => handleQuickForceUpdate(selectedDateDetail.date, "BLOCKED")}
                      disabled={loading}
                      className="flex-1 py-2 bg-red-600 text-white rounded-lg text-[10px] font-bold hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {loading ? "Đang xử lý..." : "🔒 Khóa khẩn cấp ngày này"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleQuickForceUpdate(selectedDateDetail.date, "AVAILABLE")}
                      disabled={loading}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg text-[10px] font-bold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {loading ? "Đang xử lý..." : "🔓 Mở kho hoạt động lại"}
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
