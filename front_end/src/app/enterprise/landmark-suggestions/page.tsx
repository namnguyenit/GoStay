"use client";
import { useState, useRef } from "react";
import HostService from "@/services/enterprise.service";
import { MapPin, Send, Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { PROVINCES } from "@/shared/constants/provinces";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getErrorMessage } from "../_utils";

type MediaUploadResponse = {
  data?: {
    url?: string | string[];
  };
};

export default function HostLandmarkSuggestPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    suggestedProvince: "",
    suggestedLatitude: "",
    suggestedLongitude: ""
  });
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setGalleryFiles(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setGalleryPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    setLoading(true);

    try {
      let uploadedThumbnailUrl = "";
      let uploadedGalleryUrls: string[] = [];

      if (thumbnailFile) {
        const thumbRes = await HostService.uploadSingleMedia(thumbnailFile, "landmarks") as MediaUploadResponse;
        uploadedThumbnailUrl = typeof thumbRes?.data?.url === "string" ? thumbRes.data.url : "";
      }

      if (galleryFiles.length > 0) {
        const galleryRes = await HostService.uploadBulkMedia(galleryFiles, "landmarks") as MediaUploadResponse;
        // data.url is an array of strings in bulk upload
        uploadedGalleryUrls = Array.isArray(galleryRes?.data?.url) ? galleryRes.data.url : [];
      }

      await HostService.suggestLandmark({
        name: form.name,
        description: form.description,
        suggestedProvince: form.suggestedProvince,
        suggestedLatitude: parseFloat(form.suggestedLatitude),
        suggestedLongitude: parseFloat(form.suggestedLongitude),
        thumbnailUrl: uploadedThumbnailUrl,
        galleryUrls: uploadedGalleryUrls
      });
      
      setSuccessMsg("Đề xuất địa danh đã được gửi thành công! Quản trị viên sẽ xem xét và phê duyệt trong thời gian tới.");
      setForm({
        name: "",
        description: "",
        suggestedProvince: "",
        suggestedLatitude: "",
        suggestedLongitude: ""
      });
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setGalleryFiles([]);
      setGalleryPreviews([]);
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, "Đã xảy ra lỗi khi gửi đề xuất địa danh. Vui lòng kiểm tra lại thông tin."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Đề xuất địa danh</h1>
      </div>
      <div className="space-y-6 animate-smooth-appear max-w-4xl">

      
      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-app-primary" />
          Đề Xuất Địa Danh Mới
        </h2>
        <p className="text-xs text-gray-600 mt-1">
          Nếu chỗ nghỉ hoặc dịch vụ của bạn nằm gần một địa danh nổi tiếng nhưng chưa có trên hệ thống, 
          bạn có thể đề xuất thêm mới tại đây.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-2xl text-sm font-medium">
          ✅ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm font-medium">
          ❌ {errorMsg}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Tên địa danh <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ví dụ: Thung lũng Tình Yêu"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-app-primary focus:ring-1 focus:ring-app-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Tỉnh/Thành phố <span className="text-red-600">*</span>
                </label>
                <Select 
                  value={form.suggestedProvince} 
                  onValueChange={(val) => setForm({ ...form, suggestedProvince: val })}
                  required
                >
                  <SelectTrigger className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 h-[46px] text-sm text-gray-900 focus:ring-1 focus:ring-app-primary">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Vĩ độ (Latitude) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={form.suggestedLatitude}
                    onChange={(e) => setForm({ ...form, suggestedLatitude: e.target.value })}
                    placeholder="Ví dụ: 11.9547"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-app-primary focus:ring-1 focus:ring-app-primary transition-all"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Kinh độ (Longitude) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={form.suggestedLongitude}
                    onChange={(e) => setForm({ ...form, suggestedLongitude: e.target.value })}
                    placeholder="Ví dụ: 108.4452"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-app-primary focus:ring-1 focus:ring-app-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Mô tả thêm</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả đặc điểm nổi bật của địa danh này..."
                  rows={4}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-app-primary focus:ring-1 focus:ring-app-primary transition-all resize-none"
                />
              </div>
            </div>

            {/* Right Column: Image Uploads */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex justify-between">
                  <span>Ảnh đại diện (Thumbnail)</span>
                </label>
                
                <div 
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="relative group w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden hover:border-app-primary/50 transition-colors cursor-pointer bg-gray-50 flex flex-col items-center justify-center"
                >
                  <input 
                    type="file" 
                    ref={thumbnailInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleThumbnailChange}
                  />
                  {thumbnailPreview ? (
                    <Image unoptimized src={thumbnailPreview} alt="Thumbnail" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 420px" />
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Tải ảnh đại diện</p>
                      <p className="text-[10px] text-gray-500 mt-1">PNG, JPG, WEBP lên đến 10MB</p>
                    </div>
                  )}
                  {thumbnailPreview && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-sm font-semibold flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Thay đổi ảnh
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex justify-between">
                  <span>Thư viện ảnh (Gallery)</span>
                </label>
                
                <div className="grid grid-cols-3 gap-3">
                  {galleryPreviews.map((preview, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-300">
                      <Image unoptimized src={preview} alt={`Gallery ${idx}`} fill className="object-cover" sizes="(max-width: 768px) 33vw, 140px" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  <div 
                    onClick={() => galleryInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-app-primary hover:border-app-primary/50 transition-colors cursor-pointer bg-gray-50"
                  >
                    <input 
                      type="file" 
                      ref={galleryInputRef} 
                      className="hidden" 
                      accept="image/*"
                      multiple
                      onChange={handleGalleryChange}
                    />
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Thêm ảnh</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-app-primary hover:bg-app-primary/95 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-app-primary/20 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
              {loading ? "Đang xử lý tải ảnh & Gửi..." : "Gửi Yêu Cầu Đề Xuất"}
            </button>
          </div>

        </form>
      </div>
    </div>
    </>
  );
}
