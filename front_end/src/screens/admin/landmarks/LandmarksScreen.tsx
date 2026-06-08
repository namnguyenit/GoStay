"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { Upload, X } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminConfirmDialog } from "@/screens/admin/_components/AdminConfirmDialog";
import { AdminPagination } from "@/screens/admin/_components/AdminPagination";
import type { LandmarkSuggestion } from "@/services/admin.service";
import { PROVINCES } from "@/shared/constants/provinces";
import LandmarkMapPicker from "@/shared/components/LandmarkMapPicker";
import LocationMapPreview from "@/shared/components/LocationMapPreview";
import { useAdminLandmark } from "./hook/useAdminLandmark";

export function LandmarksScreen() {
  const {
    tab,
    setTab,
    statusTab,
    setStatusTab,
    suggestions,
    suggestionsPage,
    setSuggestionsPage,
    suggestionsTotalPages,
    suggestionsTotalElements,
    loading,
    handleApproveSuggestion,
    openRejectSuggestion,
    rejectModal,
    setRejectModal,
    handleRejectSuggestion,
    form,
    setForm,
    handleCreate,
    submitting,
    feedback,
    statusBadge,
    pendingCount,
    landmarks,
    landmarksPage,
    setLandmarksPage,
    landmarksTotalPages,
    landmarksTotalElements,
    loadingLandmarks,
    editingLandmark,
    setEditingLandmark,
    handleUpdateLandmarkStatus,
    handleStartEdit,
    handleSaveEdit,
    setThumbnailFile,
    thumbnailPreview,
    setThumbnailPreview,
    existingGalleryUrls,
    setExistingGalleryUrls,
    setGalleryFiles,
    galleryPreviews,
    setGalleryPreviews,
    pageSize,
  } = useAdminLandmark();

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<LandmarkSuggestion | null>(null);

  const handleThumbnailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setGalleryFiles((prev) => [...prev, ...files]);
    setGalleryPreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
  };

  const removeNewGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    setGalleryPreviews((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setForm({ ...form, thumbnailUrl: "" });
  };

  return (
    <div className="min-w-0 space-y-6 animate-smooth-appear">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold text-slate-900">Quản lý địa danh</h2>
        <p className="mt-1 text-xs text-slate-500">
          Duyệt đề xuất bằng cách tạo địa danh chính thức trong bán kính mặc định 5km.
        </p>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-xs font-semibold ${
            feedback.type === "success"
              ? "border-slate-200 bg-white text-slate-900"
              : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="inline-flex flex-wrap rounded-full bg-slate-100/80 p-0.5">
        <button
          type="button"
          onClick={() => setTab("suggestions")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            tab === "suggestions" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Đề xuất {pendingCount > 0 && `(${pendingCount} chờ)`}
        </button>
        <button
          type="button"
          onClick={() => setTab("create")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            tab === "create" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Thêm địa danh
        </button>
        <button
          type="button"
          onClick={() => setTab("showlandmarks")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            tab === "showlandmarks" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Địa danh chính thức
        </button>
      </div>

      {tab === "suggestions" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["PENDING", "RESOLVED", "REJECTED"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusTab(status)}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${
                  statusTab === status
                    ? "border-slate-200 bg-white text-slate-900 shadow-sm"
                    : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {status === "PENDING" ? `Chờ duyệt (${pendingCount})` : status === "RESOLVED" ? "Đã chấp nhận" : "Từ chối"}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="w-16 px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Ảnh</th>
                    <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Tên</th>
                    <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Mô tả</th>
                    <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Tọa độ</th>
                    <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Tỉnh/TP</th>
                    <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Status</th>
                    <th className="px-5 py-3 pr-6 text-right text-[10px] font-bold tracking-wider text-slate-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        <td colSpan={7} className="px-5 py-4">
                          <div className="h-4 rounded bg-slate-50 animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : suggestions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center font-medium text-slate-500">
                        Không có đề xuất nào.
                      </td>
                    </tr>
                  ) : (
                    suggestions.map((item) => {
                      const thumb = item.thumbnailUrl ?? item.referenceImageUrl;

                      return (
                        <tr key={item.id} className="transition-colors hover:bg-slate-50/60">
                          <td className="px-5 py-3">
                            {thumb ? (
                              <Image
                                unoptimized
                                src={thumb}
                                alt={item.name ?? "thumbnail"}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-lg border border-slate-100 bg-slate-50 object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-[9px] text-slate-500">N/A</div>
                            )}
                          </td>
                          <td className="px-5 py-3 font-semibold text-slate-900">{item.name || "—"}</td>
                          <td className="max-w-xs truncate px-5 py-3 text-slate-500">{item.description || "—"}</td>
                          <td className="px-5 py-3 font-mono text-[11px] text-slate-500">
                            {item.suggestedLatitude ?? "—"}, {item.suggestedLongitude ?? "—"}
                          </td>
                          <td className="px-5 py-3 font-medium text-slate-600">{item.suggestedProvince || "—"}</td>
                          <td className="px-5 py-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusBadge(item.status)}`}>
                              {item.status}
                            </span>
                            {item.rejectReason && (
                              <div className="mt-1 max-w-[160px] truncate text-[10px] text-slate-500" title={item.rejectReason}>
                                {item.rejectReason}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3 pr-6 text-right">
                            {item.status === "PENDING" ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedSuggestion(item)}
                                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-100"
                                >
                                  Xem hồ sơ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApproveSuggestion(item)}
                                  className="rounded-full bg-sky-500 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-sky-600"
                                >
                                  Tạo từ đề xuất
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openRejectSuggestion(item.id)}
                                  className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-100"
                                >
                                  Từ chối
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedSuggestion(item)}
                                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-100"
                              >
                                Xem hồ sơ
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <AdminPagination
              page={suggestionsPage}
              totalPages={suggestionsTotalPages}
              totalElements={suggestionsTotalElements}
              pageSize={pageSize}
              loading={loading}
              onPageChange={setSuggestionsPage}
            />
          </div>
        </div>
      )}

      {tab === "create" && (
        <div className="max-w-5xl rounded-[20px] border border-slate-100 bg-white p-6 text-xs shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Thêm địa danh mới</h3>
              {form.resolvedSuggestionId && (
                <p className="mt-1 text-[11px] font-medium text-slate-700">
                  Đang tạo từ đề xuất: {form.resolvedSuggestionId}
                </p>
              )}
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700">
              Radius mặc định: 5km
            </span>
          </div>

          <form onSubmit={handleCreate} className="space-y-5">
            <LandmarkMapPicker
              allowNameOverwrite
              value={{
                name: form.name,
                suggestedProvince: form.province,
                suggestedLatitude: form.latitude,
                suggestedLongitude: form.longitude,
              }}
              onChange={(patch) =>
                setForm({
                  ...form,
                  name: patch.name ?? form.name,
                  province: patch.suggestedProvince ?? form.province,
                  latitude: patch.suggestedLatitude ?? form.latitude,
                  longitude: patch.suggestedLongitude ?? form.longitude,
                })
              }
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                    Tên địa danh <span className="text-slate-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="VD: Hồ Hoàn Kiếm"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                    Tỉnh/Thành phố <span className="text-slate-500">*</span>
                  </label>
                  <Select value={form.province} onValueChange={(value) => setForm({ ...form, province: value })}>
                    <SelectTrigger className="h-8 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-slate-300">
                      <SelectValue placeholder="-- Chọn tỉnh/thành phố --" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[250px] rounded-xl border border-slate-100 bg-white shadow-lg">
                      <SelectGroup>
                        {PROVINCES.map((province) => (
                          <SelectItem key={province} value={province} className="cursor-pointer text-xs text-slate-700 hover:bg-slate-50">
                            {province}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-slate-500 uppercase">Vĩ độ *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={form.latitude}
                      onChange={(event) => setForm({ ...form, latitude: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-slate-500 uppercase">Kinh độ *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={form.longitude}
                      onChange={(event) => setForm({ ...form, longitude: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-slate-500 uppercase">Bán kính (m)</label>
                    <input
                      type="number"
                      min={100}
                      value={form.radiusMeters}
                      onChange={(event) => setForm({ ...form, radiusMeters: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                    />
                  </div>
                </div>

                <label className="flex w-fit items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })}
                  />
                  Đánh dấu địa danh nổi bật
                </label>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold tracking-wider text-slate-500 uppercase">Mô tả thêm</label>
                  <textarea
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    placeholder="Mô tả đặc điểm nổi bật của địa danh này..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                    Ảnh đại diện
                  </label>
                  <div
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="group relative flex h-40 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50/50 transition-colors hover:border-slate-1000"
                  >
                    <input
                      type="file"
                      ref={thumbnailInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                    {thumbnailPreview ? (
                      <>
                        <Image
                          unoptimized
                          fill
                          src={thumbnailPreview}
                          alt="Thumbnail"
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 320px"
                        />
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            clearThumbnail();
                          }}
                          className="absolute top-2 right-2 rounded-full bg-sky-600/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <div className="p-3 text-center">
                        <Upload className="mx-auto mb-1.5 h-6 w-6 text-slate-500" />
                        <p className="text-xs font-medium text-slate-600">Tải ảnh đại diện</p>
                        <p className="mt-0.5 text-[9px] text-slate-500">PNG, JPG, WEBP</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                    Thư viện ảnh
                  </label>
                  <div
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 transition-colors hover:border-slate-1000"
                  >
                    <input
                      type="file"
                      ref={galleryInputRef}
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleGalleryChange}
                    />
                    <Upload className="mb-1.5 h-5 w-5 text-slate-500" />
                    <p className="text-xs font-medium text-slate-600">Thêm ảnh gallery</p>
                  </div>

                  {(existingGalleryUrls.length > 0 || galleryPreviews.length > 0) && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {existingGalleryUrls.map((url, index) => (
                        <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-100 shadow-2xs">
                          <Image
                            unoptimized
                            fill
                            src={url}
                            alt={`Existing gallery ${index}`}
                            className="object-cover"
                            sizes="120px"
                          />
                          <button
                            type="button"
                            onClick={() => setExistingGalleryUrls((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
                            className="absolute top-1 right-1 rounded-full bg-sky-600/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}
                      {galleryPreviews.map((preview, index) => (
                        <div key={`${preview}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-100 shadow-2xs">
                          <Image
                            unoptimized
                            fill
                            src={preview}
                            alt={`New gallery ${index}`}
                            className="object-cover"
                            sizes="120px"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewGalleryImage(index)}
                            className="absolute top-1 right-1 rounded-full bg-sky-600/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-2.5 w-2.5" />
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
              className="mt-4 w-full rounded-full bg-sky-500 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-sky-600 disabled:opacity-50"
            >
              {submitting ? "Đang tạo..." : form.resolvedSuggestionId ? "Tạo địa danh và duyệt đề xuất" : "Tạo địa danh"}
            </button>
          </form>
        </div>
      )}

      {tab === "showlandmarks" && (
        <div className="space-y-6 text-xs">
          {editingLandmark && (
            <div className="max-w-6xl rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm animate-scale-up">
              <h3 className="mb-3.5 text-xs font-semibold tracking-wider text-slate-900 uppercase">Chỉnh sửa địa danh</h3>
              <form onSubmit={handleSaveEdit} className="space-y-5">
                <LandmarkMapPicker
                  allowNameOverwrite
                  value={{
                    name: editingLandmark.name,
                    suggestedProvince: editingLandmark.province,
                    suggestedLatitude: editingLandmark.latitude,
                    suggestedLongitude: editingLandmark.longitude,
                  }}
                  onChange={(patch) =>
                    setEditingLandmark({
                      ...editingLandmark,
                      name: patch.name ?? editingLandmark.name,
                      province: patch.suggestedProvince ?? editingLandmark.province,
                      latitude: patch.suggestedLatitude ?? editingLandmark.latitude,
                      longitude: patch.suggestedLongitude ?? editingLandmark.longitude,
                    })
                  }
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={editingLandmark.name}
                    onChange={(event) => setEditingLandmark({ ...editingLandmark, name: event.target.value })}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                    placeholder="Tên địa danh"
                  />
                  <input
                    type="text"
                    value={editingLandmark.province}
                    onChange={(event) => setEditingLandmark({ ...editingLandmark, province: event.target.value })}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                    placeholder="Tỉnh/Thành phố"
                  />
                  <input
                    type="number"
                    step="any"
                    value={editingLandmark.latitude}
                    onChange={(event) => setEditingLandmark({ ...editingLandmark, latitude: event.target.value })}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                    placeholder="Vĩ độ"
                  />
                  <input
                    type="number"
                    step="any"
                    value={editingLandmark.longitude}
                    onChange={(event) => setEditingLandmark({ ...editingLandmark, longitude: event.target.value })}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                    placeholder="Kinh độ"
                  />
                  <input
                    type="number"
                    value={editingLandmark.radiusMeters}
                    onChange={(event) => setEditingLandmark({ ...editingLandmark, radiusMeters: event.target.value })}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                    placeholder="Bán kính mét"
                  />
                  <input
                    type="text"
                    value={editingLandmark.thumbnailUrl}
                    onChange={(event) => setEditingLandmark({ ...editingLandmark, thumbnailUrl: event.target.value })}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                    placeholder="Thumbnail URL"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                    <div className="mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Ảnh đại diện</div>
                    <div className="relative h-44 overflow-hidden rounded-xl border border-slate-100 bg-white">
                      {editingLandmark.thumbnailUrl ? (
                        <Image
                          unoptimized
                          fill
                          src={editingLandmark.thumbnailUrl}
                          alt={editingLandmark.name || "landmark thumbnail"}
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 320px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs font-medium text-slate-500">
                          Chưa có ảnh đại diện
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 lg:col-span-2">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Ảnh con / gallery</div>
                      <span className="text-[10px] font-semibold text-slate-500">{editingLandmark.galleryUrls.length} ảnh</span>
                    </div>
                    {editingLandmark.galleryUrls.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                        {editingLandmark.galleryUrls.map((url, index) => (
                          <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-100 bg-white">
                            <Image
                              unoptimized
                              fill
                              src={url}
                              alt={`Landmark gallery ${index + 1}`}
                              className="object-cover"
                              sizes="180px"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setEditingLandmark({
                                  ...editingLandmark,
                                  galleryUrls: editingLandmark.galleryUrls.filter((_, itemIndex) => itemIndex !== index),
                                })
                              }
                              className="absolute right-1.5 top-1.5 rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              Xóa
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-xs font-medium text-slate-500">
                        Chưa có ảnh gallery
                      </div>
                    )}
                  </div>
                </div>
                <label className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={editingLandmark.isFeatured}
                    onChange={(event) => setEditingLandmark({ ...editingLandmark, isFeatured: event.target.checked })}
                  />
                  Địa danh nổi bật
                </label>
                <textarea
                  value={editingLandmark.description}
                  onChange={(event) => setEditingLandmark({ ...editingLandmark, description: event.target.value })}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                  placeholder="Mô tả"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-sky-500 px-4 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-sky-600 disabled:opacity-50"
                  >
                    {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingLandmark(null)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
              <h3 className="font-semibold text-slate-900">Danh sách địa danh chính thức</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Ảnh</th>
                    <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Tên</th>
                    <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Tọa độ</th>
                    <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Tỉnh/TP</th>
                    <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Bán kính</th>
                    <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Trạng thái</th>
                    <th className="px-5 py-3 pr-6 text-right text-[10px] font-bold tracking-wider text-slate-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loadingLandmarks ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        <td colSpan={7} className="px-5 py-4">
                          <div className="h-4 rounded bg-slate-50 animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : landmarks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center font-medium text-slate-500">
                        Không có địa danh nào.
                      </td>
                    </tr>
                  ) : (
                    landmarks.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-slate-50/60">
                        <td className="px-5 py-3.5">
                          {item.thumbnailUrl ? (
                            <Image
                              unoptimized
                              src={item.thumbnailUrl}
                              alt={item.name ?? "landmark"}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-lg border border-slate-100 object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-slate-100" />
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="mt-0.5 max-w-xs truncate text-[10px] text-slate-500">{item.description || "—"}</div>
                          {item.isFeatured && (
                            <span className="mt-1 inline-block rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-700">
                              Nổi bật
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">{item.latitude}, {item.longitude}</td>
                        <td className="px-5 py-3.5 text-slate-700">{item.province}</td>
                        <td className="px-5 py-3.5 text-slate-600">{item.radiusMeters ?? 5000}m</td>
                        <td className="px-5 py-3.5">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 pr-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(item)}
                              className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-200"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateLandmarkStatus(item.id, item.status)}
                              disabled={submitting}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                item.status === "ACTIVE"
                                  ? "bg-slate-50 text-slate-700 hover:bg-slate-100"
                                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
            <AdminPagination
              page={landmarksPage}
              totalPages={landmarksTotalPages}
              totalElements={landmarksTotalElements}
              pageSize={pageSize}
              loading={loadingLandmarks}
              onPageChange={setLandmarksPage}
            />
          </div>
        </div>
      )}

      {selectedSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-500/20 p-4 backdrop-blur-sm animate-fade-in">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[20px] border border-slate-100 bg-white text-xs text-slate-600 shadow-xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
                  Hồ sơ đề xuất địa danh
                </h3>
                <p className="mt-0.5 break-all text-[10px] text-slate-500">ID: {selectedSuggestion.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSuggestion(null)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                x
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <LocationMapPreview
                    latitude={selectedSuggestion.suggestedLatitude}
                    longitude={selectedSuggestion.suggestedLongitude}
                    title={selectedSuggestion.name || "Vị trí địa danh đề xuất"}
                    address={selectedSuggestion.suggestedProvince}
                  />
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                    <div className="mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Ảnh đại diện</div>
                    <div className="relative h-44 overflow-hidden rounded-xl border border-slate-100 bg-white">
                      {(selectedSuggestion.thumbnailUrl || selectedSuggestion.referenceImageUrl) ? (
                        <Image
                          unoptimized
                          fill
                          src={selectedSuggestion.thumbnailUrl || selectedSuggestion.referenceImageUrl || ""}
                          alt={selectedSuggestion.name || "suggestion thumbnail"}
                          className="object-cover"
                          sizes="320px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs font-medium text-slate-500">
                          Chưa có ảnh
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-100 bg-white p-3">
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Tên</div>
                      <div className="mt-1 font-semibold text-slate-900">{selectedSuggestion.name || "—"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Tỉnh/TP</div>
                      <div className="mt-1 font-semibold text-slate-900">{selectedSuggestion.suggestedProvince || "—"}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Host ID</div>
                      <div className="mt-1 break-all font-mono text-[11px] text-slate-700">{selectedSuggestion.hostId || "—"}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Trạng thái</div>
                      <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusBadge(selectedSuggestion.status)}`}>
                        {selectedSuggestion.status || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedSuggestion.description && (
                <div>
                  <h4 className="mb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Mô tả</h4>
                  <p className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 leading-relaxed whitespace-pre-line text-slate-600">
                    {selectedSuggestion.description}
                  </p>
                </div>
              )}

              {(selectedSuggestion.galleryUrls?.length ?? 0) > 0 && (
                <div>
                  <h4 className="mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Ảnh con</h4>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {selectedSuggestion.galleryUrls?.map((url, index) => (
                      <div key={`${url}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                        <Image
                          unoptimized
                          fill
                          src={url}
                          alt={`Suggestion gallery ${index + 1}`}
                          className="object-cover"
                          sizes="200px"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSuggestion.rejectReason && (
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <h4 className="mb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Lý do từ chối</h4>
                  <p className="leading-relaxed text-slate-600">{selectedSuggestion.rejectReason}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50/50 p-4">
              <button
                type="button"
                onClick={() => setSelectedSuggestion(null)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Đóng
              </button>
              {selectedSuggestion.status === "PENDING" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      openRejectSuggestion(selectedSuggestion.id);
                      setSelectedSuggestion(null);
                    }}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    Từ chối
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleApproveSuggestion(selectedSuggestion);
                      setSelectedSuggestion(null);
                    }}
                    className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-600"
                  >
                    Tạo địa danh từ hồ sơ
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <AdminConfirmDialog
        open={rejectModal.open}
        title="Từ chối đề xuất địa danh"
        description="Nhập lý do để người gửi hiểu vì sao đề xuất không được duyệt."
        confirmLabel="Từ chối"
        intent="danger"
        loading={submitting}
        disabled={!rejectModal.reason.trim()}
        onOpenChange={(open) => setRejectModal(open ? rejectModal : { open: false, suggestionId: null, reason: "" })}
        onConfirm={handleRejectSuggestion}
      >
        <textarea
          value={rejectModal.reason}
          onChange={(event) => setRejectModal({ ...rejectModal, reason: event.target.value })}
          rows={4}
          placeholder="VD: Tọa độ chưa chính xác hoặc ảnh tham chiếu không phù hợp..."
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-slate-300 focus:outline-none"
        />
      </AdminConfirmDialog>
    </div>
  );
}
