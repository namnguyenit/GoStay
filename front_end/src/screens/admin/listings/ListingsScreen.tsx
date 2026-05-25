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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Quản lý Dịch vụ (Listings)</h2>
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b border-gray-200 pb-px">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            statusFilter === ""
              ? "border-red-500 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          📂 Tất cả ({listings.length})
        </button>
        <button
          onClick={() => setStatusFilter("ACTIVE")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            statusFilter === "ACTIVE"
              ? "border-red-500 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          ✅ Hoạt động
        </button>
        <button
          onClick={() => setStatusFilter("HIDDEN")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            statusFilter === "HIDDEN"
              ? "border-red-500 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          ⏳ Tạm ẩn
        </button>
        <button
          onClick={() => setStatusFilter("DELETED")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            statusFilter === "DELETED"
              ? "border-red-500 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          ❌ Đã xóa
        </button>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Dịch vụ</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Danh mục</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Giá cơ bản</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Tỉnh thành</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Đánh giá</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Host ID</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="px-4 py-4">
                    <div className="h-4 bg-gray-100 animate-pulse rounded w-full" />
                  </td>
                </tr>
              ))
            ) : listings.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  Không tìm thấy dịch vụ nào.
                </td>
              </tr>
            ) : (
              listings.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <div className="flex items-center gap-3">
                      {item.thumbnailUrl && (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-10 h-10 object-cover rounded-md border border-gray-200 bg-gray-50"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900 line-clamp-1">{item.title}</div>
                        <div className="text-xs text-gray-400">ID: {item.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    <div>{item.category}</div>
                    <div className="text-xs text-gray-400">{item.subCategory}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {item.basePrice?.toLocaleString()}đ / {item.priceUnit}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.province}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.totalReviews > 0 ? (
                      <span className="text-yellow-600 font-semibold">
                        ⭐ {item.averageRating} ({item.totalReviews})
                      </span>
                    ) : (
                      <span className="text-gray-400">Chưa đánh giá</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-400 truncate max-w-[100px]" title={item.hostId}>
                    {item.hostId}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setSelectedListing(item)}
                        className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium"
                      >
                        Chi tiết
                      </button>

                      {item.status === "HIDDEN" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "ACTIVE")}
                          className="text-xs px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100 font-medium"
                        >
                          Hiện
                        </button>
                      )}

                      {item.status === "ACTIVE" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "HIDDEN")}
                          className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-600 hover:bg-amber-100 font-medium"
                        >
                          Ẩn
                        </button>
                      )}

                      {item.status !== "DELETED" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "DELETED")}
                          className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedListing.title}</h3>
                <p className="text-xs text-gray-500">ID dịch vụ: {selectedListing.id}</p>
              </div>
              <button
                onClick={() => setSelectedListing(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Danh mục</h4>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedListing.category} / {selectedListing.subCategory}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Giá bán</h4>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedListing.basePrice?.toLocaleString()}đ / {selectedListing.priceUnit}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Vị trí</h4>
                  <p className="text-sm font-medium text-gray-800">{selectedListing.province}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Trạng thái</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block mt-1 ${getStatusBadge(selectedListing.status)}`}>
                    {selectedListing.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Tọa độ</h4>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedListing.latitude}, {selectedListing.longitude}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Đánh giá chung</h4>
                  <p className="text-sm font-medium text-gray-800">
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
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Chủ sở hữu (Host ID)</h4>
                  <p className="text-sm font-mono text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 select-all">
                    {selectedListing.hostId}
                  </p>
                </div>
              </div>

              {selectedListing.description && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Mô tả dịch vụ</h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {selectedListing.description}
                  </p>
                </div>
              )}

              {selectedListing.attributes && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Tiện ích đi kèm</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedListing.attributes).map(([key, val]) => (
                      <div key={key} className="flex justify-between p-2 bg-gray-50 rounded border border-gray-100">
                        <span className="text-gray-500 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-gray-800 font-semibold">{val?.toString() === "true" ? "Có" : val?.toString() === "false" ? "Không" : val?.toString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedListing(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>

              {selectedListing.status === "HIDDEN" && (
                <button
                  onClick={() => handleUpdateStatus(selectedListing.id, "ACTIVE")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Kích hoạt dịch vụ
                </button>
              )}

              {selectedListing.status === "ACTIVE" && (
                <button
                  onClick={() => handleUpdateStatus(selectedListing.id, "HIDDEN")}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
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
