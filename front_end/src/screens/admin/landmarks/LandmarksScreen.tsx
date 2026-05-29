"use client";

import { useEffect, useState } from "react";
import AdminService from "@/services/admin.service";
import { useAdminLandmark } from "./hook/useAdminLandmark";
import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { PROVINCES } from "@/shared/constants/provinces";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function LandmarksScreen() {
    const { tab,
    setTab,
    statusTab,
    setStatusTab,
    suggestions,
    loading,
    handleUpdateStatus,
    form,
    setForm,
    handleCreate,
    submitting,
    successMsg,
    statusBadge,
    pendingCount,
    landmarks,
    loadingLandmarks,
    editingLandmark,
    setEditingLandmark,
    handleUpdateLandmarkStatus,
    handleStartEdit,
    handleSaveEdit,
    thumbnailFile, setThumbnailFile,
    thumbnailPreview, setThumbnailPreview,
    galleryFiles, setGalleryFiles,
    galleryPreviews, setGalleryPreviews
  } = useAdminLandmark();

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setGalleryFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setGalleryPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };


  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quản lý Địa danh</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-gray-200">
        <button
          onClick={() => setTab("suggestions")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === "suggestions"
              ? "border-[#20a8d8] text-[#20a8d8]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          📋 Đề xuất {pendingCount > 0 && `(${pendingCount} chờ duyệt)`}
        </button>
        <button
          onClick={() => setTab("create")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === "create"
              ? "border-[#20a8d8] text-[#20a8d8]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          ➕ Thêm địa danh mới
        </button>
        <button
          onClick={() => setTab("showlandmarks")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === "showlandmarks"
              ? "border-[#20a8d8] text-[#20a8d8]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Xem địa danh
        </button>
      </div>

      {/* Suggestions Tab */}
      {tab === "suggestions" && (
        <div className="space-y-4">
          {/* Sub-tabs for Status */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setStatusTab("PENDING")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusTab === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              ⏳ Chờ duyệt {pendingCount > 0 && `(${pendingCount})`}
            </button>
            <button
              onClick={() => setStatusTab("RESOLVED")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusTab === "RESOLVED"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              ✅ Đã chấp nhận
            </button>
            <button
              onClick={() => setStatusTab("REJECTED")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusTab === "REJECTED"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              ❌ Từ chối
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Ảnh</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Tên</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Mô tả</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Tọa độ</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Tỉnh/Thành phố</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 animate-pulse rounded" />
                      </td>
                    </tr>
                  ))
                ) : suggestions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      Không có đề xuất nào.
                    </td>
                  </tr>
                ) : (
                  suggestions.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt="Thumb" className="w-12 h-12 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">N/A</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {item.suggestedLatitude}, {item.suggestedLongitude}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {item.suggestedProvince}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.status === "PENDING" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateStatus(item.id, "RESOLVED")}
                              className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 font-medium"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(item.id, "REJECTED")}
                              className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 font-medium"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Tab */}
      {tab === "create" && (
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-5xl">
          <h3 className="font-semibold text-gray-800 mb-4">Thêm địa danh mới</h3>

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              ✅ {successMsg}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Text Fields */}
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên địa danh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Hồ Hoàn Kiếm"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={form.province} 
                    onValueChange={(val) => setForm({ ...form, province: val })}
                    required
                  >
                    <SelectTrigger className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 h-[38px] text-sm text-gray-900 focus:ring-1 focus:ring-app-primary">
                      <SelectValue placeholder="-- Chọn tỉnh/thành phố --" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[300px]">
                      <SelectGroup>
                        {PROVINCES.map((province) => (
                          <SelectItem key={province} value={province} className="text-sm">
                            {province}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vĩ độ (Latitude) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={form.latitude}
                      onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                      placeholder="21.0285"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kinh độ (Longitude) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={form.longitude}
                      onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                      placeholder="105.8542"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả thêm</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Mô tả đặc điểm nổi bật của địa danh này..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary resize-none"
                  />
                </div>
              </div>

              {/* Right Column: Image Uploads */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ảnh đại diện (Thumbnail)
                  </label>
                  
                  <div 
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="relative group w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-app-primary/50 transition-colors cursor-pointer bg-gray-50 flex flex-col items-center justify-center"
                  >
                    <input 
                      type="file" 
                      ref={thumbnailInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                    {thumbnailPreview ? (
                      <img src={thumbnailPreview} alt="Thumbnail" className="object-cover w-full h-full" />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Tải ảnh đại diện</p>
                        <p className="text-[10px] text-gray-500 mt-1">PNG, JPG, WEBP lên đến 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thư viện ảnh (Gallery)
                  </label>
                  
                  <div 
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-app-primary/50 transition-colors cursor-pointer bg-gray-50"
                  >
                    <input 
                      type="file" 
                      ref={galleryInputRef} 
                      className="hidden" 
                      multiple
                      accept="image/*"
                      onChange={handleGalleryChange}
                    />
                    <Upload className="w-6 h-6 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-600">Thêm ảnh khác</p>
                  </div>

                  {galleryPreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden">
                          <img src={preview} alt="Gallery" className="object-cover w-full h-full" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGalleryImage(index);
                            }}
                            className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-500 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Đang tạo..." : "Tạo địa danh"}
            </button>
          </form>
        </div>

      )}


        {/* Show Landmarks Tab */}
        {tab === "showlandmarks" && (
          <div className="space-y-6">
            {editingLandmark && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-lg">
                <h3 className="font-semibold text-yellow-800 mb-4">✍️ Chỉnh sửa địa danh</h3>
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên địa danh</label>
                    <input
                      type="text"
                      value={editingLandmark.name}
                      onChange={(e) => setEditingLandmark({ ...editingLandmark, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <textarea
                      value={editingLandmark.description}
                      onChange={(e) => setEditingLandmark({ ...editingLandmark, description: e.target.value })}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none bg-white text-gray-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vĩ độ</label>
                      <input
                        type="number"
                        step="any"
                        value={editingLandmark.latitude}
                        onChange={(e) => setEditingLandmark({ ...editingLandmark, latitude: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kinh độ</label>
                      <input
                        type="number"
                        step="any"
                        value={editingLandmark.longitude}
                        onChange={(e) => setEditingLandmark({ ...editingLandmark, longitude: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white text-gray-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                    <input
                      type="text"
                      value={editingLandmark.province}
                      onChange={(e) => setEditingLandmark({ ...editingLandmark, province: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white text-gray-800"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Lưu thay đổi
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingLandmark(null)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-800">Danh sách địa danh chính thức</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Tên</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Mô tả</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Tọa độ</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Tỉnh/Thành phố</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingLandmarks ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 animate-pulse rounded" />
                        </td>
                      </tr>
                    ))
                  ) : landmarks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        Không có địa danh nào.
                      </td>
                    </tr>
                  ) : (
                    landmarks.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                          {item.description}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {item.latitude}, {item.longitude}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{item.province}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            item.status === "ACTIVE" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleUpdateLandmarkStatus(item.id, item.status)}
                              className={`text-xs px-2 py-1 rounded font-medium ${
                                item.status === "ACTIVE" 
                                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {item.status === "ACTIVE" ? "Ẩn" : "Hiện"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )} 
    </div>
  );
}
