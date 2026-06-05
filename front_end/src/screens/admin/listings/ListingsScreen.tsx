"use client";

import { useAdminListings } from "./hook/useAdminListings";

export function ListingsScreen() {
  const {
    listings,
    loading,
    statusFilter,
    setStatusFilter,
    selectedListing,
    setSelectedListing,
    handleUpdateStatus,
    getStatusBadge,
  } = useAdminListings();

  return (
    <div className="space-y-6 animate-smooth-appear">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Quản lý dịch vụ (Listings)</h2>
          <p className="text-xs text-slate-400 mt-1">Quản lý thông tin, kiểm duyệt trạng thái hiển thị của các căn hộ/homestay.</p>
        </div>
      </div>

      {/* Filters / Tabs */}
      <div className="inline-flex bg-slate-100/80 p-0.5 rounded-full">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            statusFilter === ""
              ? "bg-white shadow-sm text-slate-800"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          📂 Tất cả ({listings.length})
        </button>
        <button
          onClick={() => setStatusFilter("ACTIVE")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            statusFilter === "ACTIVE"
              ? "bg-white shadow-sm text-slate-800"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          ✅ Hoạt động
        </button>
        <button
          onClick={() => setStatusFilter("PENDING")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            statusFilter === "PENDING"
              ? "bg-white shadow-sm text-slate-800"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          🆕 Chờ duyệt
        </button>
        <button
          onClick={() => setStatusFilter("HIDDEN")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            statusFilter === "HIDDEN"
              ? "bg-white shadow-sm text-slate-800"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          ⏳ Tạm ẩn
        </button>
        <button
          onClick={() => setStatusFilter("DELETED")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            statusFilter === "DELETED"
              ? "bg-white shadow-sm text-slate-800"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          ❌ Đã xóa
        </button>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-[20px] border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dịch vụ</th>
              <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Danh mục</th>
              <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giá cơ bản</th>
              <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tỉnh thành</th>
              <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đánh giá</th>
              <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Host ID</th>
              <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
              <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right pr-6">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="px-5 py-4">
                    <div className="h-4 bg-slate-50 animate-pulse rounded w-full" />
                  </td>
                </tr>
              ))
            ) : listings.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-400 font-medium">
                  Không tìm thấy dịch vụ nào.
                </td>
              </tr>
            ) : (
              listings.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-800">
                    <div className="flex items-center gap-3">
                      {item.thumbnailUrl && (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-100 bg-slate-50"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-slate-800 line-clamp-1">{item.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">ID: {item.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    <div className="font-medium text-slate-700">{item.category}</div>
                    <div className="text-[10px] text-slate-450 mt-0.5">{item.subCategory}</div>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">
                    {item.basePrice?.toLocaleString()}đ <span className="text-[10px] font-normal text-slate-450">/ {item.priceUnit}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-650 font-medium">{item.province}</td>
                  <td className="px-5 py-3.5 text-slate-650">
                    {item.totalReviews > 0 ? (
                      <span className="text-yellow-600 font-semibold">
                        ⭐ {item.averageRating} ({item.totalReviews})
                      </span>
                    ) : (
                      <span className="text-slate-400">Chưa đánh giá</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-[11px] font-mono text-slate-400 truncate max-w-[100px]" title={item.hostId}>
                    {item.hostId}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right pr-6">
                    <div className="flex gap-1.5 justify-end">
                      <button
                        onClick={() => setSelectedListing(item)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                      >
                        Chi tiết
                      </button>

                      <a
                        href={`/admin/inventory?listingId=${item.id}`}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                      >
                        Tồn kho
                      </a>

                      {item.status === "PENDING" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "ACTIVE")}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                        >
                          Duyệt
                        </button>
                      )}

                      {item.status === "HIDDEN" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "ACTIVE")}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
                        >
                          Hiện
                        </button>
                      )}

                      {item.status === "ACTIVE" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "HIDDEN")}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600 font-medium transition-colors"
                        >
                          Ẩn
                        </button>
                      )}

                      {item.status !== "DELETED" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "DELETED")}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-650 font-medium transition-colors"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[20px] max-w-xl w-full shadow-xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up text-xs text-slate-600">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">{selectedListing.title}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">ID: {selectedListing.id}</p>
              </div>
              <button
                onClick={() => setSelectedListing(null)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-650 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Danh mục</h4>
                  <p className="font-semibold text-slate-800">
                    {selectedListing.category} / {selectedListing.subCategory}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Giá bán</h4>
                  <p className="font-semibold text-slate-800">
                    {selectedListing.basePrice?.toLocaleString()}đ / {selectedListing.priceUnit}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Vị trí</h4>
                  <p className="font-semibold text-slate-800">{selectedListing.province}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Trạng thái</h4>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold inline-block mt-0.5 ${getStatusBadge(selectedListing.status)}`}>
                    {selectedListing.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Tọa độ</h4>
                  <p className="font-semibold text-slate-800">
                    {selectedListing.latitude}, {selectedListing.longitude}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Đánh giá chung</h4>
                  <p className="font-semibold text-slate-800">
                    {selectedListing.totalReviews > 0 ? (
                      <span className="text-yellow-600 font-semibold">
                        ⭐ {selectedListing.averageRating} ({selectedListing.totalReviews} đánh giá)
                      </span>
                    ) : (
                      "Chưa có đánh giá nào"
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Chủ sở hữu (Host ID)</h4>
                  <p className="font-mono text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 select-all">
                    {selectedListing.hostId}
                  </p>
                </div>
              </div>

              {selectedListing.description && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mô tả dịch vụ</h4>
                  <p className="text-slate-650 leading-relaxed whitespace-pre-line bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    {selectedListing.description}
                  </p>
                </div>
              )}

               {/* Bộ sưu tập ảnh */}
               {selectedListing.attributes?.galleryUrls && selectedListing.attributes.galleryUrls.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Bộ sưu tập ảnh</h4>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {selectedListing.attributes.galleryUrls.map((url: string, i: number) => (
                      <img
                        key={i}
                        src={url}
                        alt={`gallery-${i}`}
                        className="w-28 h-18 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedListing.attributes && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Tiện ích đi kèm</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedListing.attributes)
                      .filter(([key]) => key !== "galleryUrls" && key !== "categoryType")
                      .map(([key, val]) => (
                        <div key={key} className="flex justify-between p-2 bg-slate-50/30 rounded-lg border border-slate-100">
                          <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-slate-800 font-semibold">{val?.toString() === "true" ? "Có" : val?.toString() === "false" ? "Không" : val?.toString()}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedListing(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-full text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>

              {selectedListing.status === "PENDING" && (
                <button
                  onClick={() => handleUpdateStatus(selectedListing.id, "ACTIVE")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  Duyệt dịch vụ
                </button>
              )}

              {selectedListing.status === "HIDDEN" && (
                <button
                  onClick={() => handleUpdateStatus(selectedListing.id, "ACTIVE")}
                  className="px-4 py-2 bg-slate-800 text-white rounded-full text-xs font-semibold hover:bg-slate-900 transition-colors"
                >
                  Kích hoạt dịch vụ
                </button>
              )}

              {selectedListing.status === "ACTIVE" && (
                <button
                  onClick={() => handleUpdateStatus(selectedListing.id, "HIDDEN")}
                  className="px-4 py-2 bg-slate-800 text-white rounded-full text-xs font-semibold hover:bg-slate-900 transition-colors"
                >
                  Tạm ẩn dịch vụ
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
