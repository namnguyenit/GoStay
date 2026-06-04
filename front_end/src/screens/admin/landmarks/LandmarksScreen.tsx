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
    <div className="space-y-6 animate-smooth-appear">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Quản lý địa danh</h2>
        <p className="text-xs text-slate-400 mt-1">Duyệt các đề xuất địa danh từ người dùng hoặc tự thiết lập địa danh chính thức.</p>
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-slate-100/80 p-0.5 rounded-full">
        <button
          onClick={() => setTab("suggestions")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            tab === "suggestions"
              ? "bg-white shadow-sm text-slate-800"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          📋 Đề xuất {pendingCount > 0 && `(${pendingCount} chờ duyệt)`}
        </button>
        <button
          onClick={() => setTab("create")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            tab === "create"
              ? "bg-white shadow-sm text-slate-800"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          ➕ Thêm địa danh mới
        </button>
        <button
          onClick={() => setTab("showlandmarks")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            tab === "showlandmarks"
              ? "bg-white shadow-sm text-slate-800"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Xem địa danh
        </button>
      </div>

      {/* Suggestions Tab */}
      {tab === "suggestions" && (
        <div className="space-y-4">
          {/* Sub-tabs for Status */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusTab("PENDING")}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                statusTab === "PENDING"
                  ? "bg-amber-50 text-amber-700 border-amber-250"
                  : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
              }`}
            >
              ⏳ Chờ duyệt {pendingCount > 0 && `(${pendingCount})`}
            </button>
            <button
              onClick={() => setStatusTab("RESOLVED")}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                statusTab === "RESOLVED"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-250"
                  : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
              }`}
            >
              ✅ Đã chấp nhận
            </button>
            <button
              onClick={() => setStatusTab("REJECTED")}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                statusTab === "REJECTED"
                  ? "bg-red-50 text-red-700 border-red-250"
                  : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
              }`}
            >
              ❌ Từ chối
            </button>
          </div>

          <div className="bg-white rounded-[20px] border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-16">Ảnh</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mô tả</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tọa độ</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tỉnh/Thành phố</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right pr-6">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-5 py-4">
                        <div className="h-4 bg-slate-50 animate-pulse rounded" />
                      </td>
                    </tr>
                  ))
                ) : suggestions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400 font-medium">
                      Không có đề xuất nào.
                    </td>
                  </tr>
                ) : (
                  suggestions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3">
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt="Thumb" className="w-10 h-10 rounded-lg object-cover border border-slate-100 bg-slate-50" />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-[9px] text-slate-400">N/A</div>
                        )}
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-800">{item.name}</td>
                      <td className="px-5 py-3 text-slate-500 max-w-xs truncate">
                        {item.description}
                      </td>
                      <td className="px-5 py-3 text-slate-500 font-mono text-[11px]">
                        {item.suggestedLatitude}, {item.suggestedLongitude}
                      </td>
                      <td className="px-5 py-3 text-slate-650 font-medium">
                        {item.suggestedProvince}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                          item.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-100/50"
                            : item.status === "RESOLVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100/50"
                            : "bg-red-50 text-red-700 border border-red-100/50"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right pr-6">
                        {item.status === "PENDING" ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleUpdateStatus(item.id, "RESOLVED")}
                              className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(item.id, "REJECTED")}
                              className="text-[11px] px-2.5 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
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
        <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] max-w-4xl text-xs">
          <h3 className="font-semibold text-slate-800 text-sm mb-4">Thêm địa danh mới</h3>

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-800">
              ✅ {successMsg}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Text Fields */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                    Tên địa danh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Hồ Hoàn Kiếm"
                    className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-350 focus:border-slate-350 text-slate-700 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={form.province} 
                    onValueChange={(val) => setForm({ ...form, province: val })}
                    required
                  >
                    <SelectTrigger className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 h-8 text-xs text-slate-800 focus:ring-1 focus:ring-slate-350">
                      <SelectValue placeholder="-- Chọn tỉnh/thành phố --" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[250px] bg-white border border-slate-100 rounded-xl shadow-lg">
                      <SelectGroup>
                        {PROVINCES.map((province) => (
                          <SelectItem key={province} value={province} className="text-xs text-slate-700 hover:bg-slate-50 cursor-pointer">
                            {province}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                      Vĩ độ (Latitude) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={form.latitude}
                      onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                      placeholder="21.0285"
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-350 text-slate-700 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                      Kinh độ (Longitude) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={form.longitude}
                      onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                      placeholder="105.8542"
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-350 text-slate-700 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5">Mô tả thêm</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Mô tả đặc điểm nổi bật của địa danh này..."
                    rows={4}
                    className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-350 text-slate-700 bg-white resize-none"
                  />
                </div>
              </div>

              {/* Right Column: Image Uploads */}
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    Ảnh đại diện (Thumbnail)
                  </label>
                  
                  <div 
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="relative group w-full h-40 border border-dashed border-slate-300 rounded-xl overflow-hidden hover:border-slate-400 transition-colors cursor-pointer bg-slate-50/50 flex flex-col items-center justify-center"
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
                      <div className="text-center p-3">
                        <Upload className="w-6 h-6 text-slate-450 mx-auto mb-1.5" />
                        <p className="text-xs text-slate-650 font-medium">Tải ảnh đại diện</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">PNG, JPG, WEBP lên đến 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    Thư viện ảnh (Gallery)
                  </label>
                  
                  <div 
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-full h-24 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center hover:border-slate-400 transition-colors cursor-pointer bg-slate-50/50"
                  >
                    <input 
                      type="file" 
                      ref={galleryInputRef} 
                      className="hidden" 
                      multiple
                      accept="image/*"
                      onChange={handleGalleryChange}
                    />
                    <Upload className="w-5 h-5 text-slate-450 mb-1.5" />
                    <p className="text-xs text-slate-650 font-medium">Thêm ảnh khác</p>
                  </div>

                  {galleryPreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-100 shadow-2xs">
                          <img src={preview} alt="Gallery" className="object-cover w-full h-full" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGalleryImage(index);
                            }}
                            className="absolute top-1 right-1 bg-slate-900/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="w-2.5 h-2.5" />
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
              className="w-full bg-slate-800 text-white px-4 py-2.5 rounded-full text-xs font-semibold hover:bg-slate-900 disabled:opacity-50 transition-colors mt-4"
            >
              {submitting ? "Đang tạo..." : "Tạo địa danh"}
            </button>
          </form>
        </div>
      )}

      {/* Show Landmarks Tab */}
      {tab === "showlandmarks" && (
        <div className="space-y-6 text-xs">
          {editingLandmark && (
            <div className="bg-amber-50/50 border border-amber-100 rounded-[20px] p-5 max-w-md animate-scale-up">
              <h3 className="font-semibold text-amber-800 mb-3.5 text-xs uppercase tracking-wider">✍️ Chỉnh sửa địa danh</h3>
              <form onSubmit={handleSaveEdit} className="space-y-3.5">
                <div>
                  <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Tên địa danh</label>
                  <input
                    type="text"
                    value={editingLandmark.name}
                    onChange={(e) => setEditingLandmark({ ...editingLandmark, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Mô tả</label>
                  <textarea
                    value={editingLandmark.description}
                    onChange={(e) => setEditingLandmark({ ...editingLandmark, description: e.target.value })}
                    rows={2}
                    className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300 bg-white text-slate-800 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Vĩ độ</label>
                    <input
                      type="number"
                      step="any"
                      value={editingLandmark.latitude}
                      onChange={(e) => setEditingLandmark({ ...editingLandmark, latitude: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300 bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Kinh độ</label>
                    <input
                      type="number"
                      step="any"
                      value={editingLandmark.longitude}
                      onChange={(e) => setEditingLandmark({ ...editingLandmark, longitude: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300 bg-white text-slate-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Tỉnh/Thành phố</label>
                  <input
                    type="text"
                    value={editingLandmark.province}
                    onChange={(e) => setEditingLandmark({ ...editingLandmark, province: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300 bg-white text-slate-800"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-full text-[11px] font-semibold transition-colors"
                  >
                    Lưu thay đổi
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingLandmark(null)}
                    className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-full text-[11px] font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-[20px] border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800">Danh sách địa danh chính thức</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mô tả</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tọa độ</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tỉnh/Thành phố</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right pr-6">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loadingLandmarks ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-5 py-4">
                        <div className="h-4 bg-slate-50 animate-pulse rounded" />
                      </td>
                    </tr>
                  ))
                ) : landmarks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400 font-medium">
                      Không có địa danh nào.
                    </td>
                  </tr>
                ) : (
                  landmarks.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-800">{item.name}</td>
                      <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">
                        {item.description}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                        {item.latitude}, {item.longitude}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">{item.province}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          item.status === "ACTIVE" 
                            ? "bg-green-50 text-green-700 border border-green-100/30" 
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right pr-6">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleUpdateLandmarkStatus(item.id, item.status)}
                            className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                              item.status === "ACTIVE" 
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100" 
                                : "bg-green-55/40 text-emerald-700 hover:bg-emerald-50 border border-emerald-100/30"
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
