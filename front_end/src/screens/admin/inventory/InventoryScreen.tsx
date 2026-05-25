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
  } = useAdminInventory();

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
                  <option value="SUSPENDED">Phong tỏa (SUSPENDED)</option>
                  <option value="ACTIVE">Kích hoạt lại (ACTIVE)</option>
                  <option value="MAINTENANCE">Bảo trì (MAINTENANCE)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lý do can thiệp
                </label>
                <textarea
                  value={forceUpdateData.reason}
                  onChange={(e) => setForceUpdateData({ ...forceUpdateData, reason: e.target.value })}
                  placeholder="Ghi chú lý do thay đổi..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 outline-none resize-none text-gray-800"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !listingId || !forceUpdateData.status}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? "Đang xử lý..." : "⚠️ Thực thi Force Update"}
              </button>
            </form>
          </div>
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
                        className={`p-3 rounded-xl border flex flex-col justify-between transition-shadow hover:shadow-md ${getAvailabilityColor(
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
                              item.status === "ACTIVE"
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
    </div>
  );
}
