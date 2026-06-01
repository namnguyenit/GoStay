"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Building, MapPin, AlignLeft } from "lucide-react";
import HostService from "@/services/host.service";
import Link from "next/link";

export default function NewComplexPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    province: "",
    district: "",
    ward: "",
    streetAddress: "",
    latitude: "",
    longitude: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      if (isNaN(payload.latitude) || isNaN(payload.longitude)) {
        throw new Error("Tọa độ Latitude và Longitude phải là số hợp lệ.");
      }

      await HostService.createComplex(payload);
      router.push("/enterprise/complexes");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Có lỗi xảy ra khi tạo Khu Tổ Hợp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/enterprise/complexes">
          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo Khu Tổ Hợp Mới</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Điền thông tin chi tiết về khu vực kinh doanh của bạn
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Building className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Thông tin cơ bản</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên Khu Tổ Hợp <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="VD: Vinpearl Resort Nha Trang, Chuỗi Homestay Sapa..." 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <AlignLeft className="h-4 w-4 text-gray-400" /> Mô tả chi tiết
              </label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Mô tả về quy mô, các tiện ích chung nổi bật của tổ hợp..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all text-sm outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-xl">
              <MapPin className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Vị trí & Tọa độ</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
              <input type="text" name="province" required value={formData.province} onChange={handleChange} placeholder="VD: Hà Nội" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quận / Huyện</label>
              <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="VD: Cầu Giấy" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phường / Xã</label>
              <input type="text" name="ward" value={formData.ward} onChange={handleChange} placeholder="VD: Dịch Vọng" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all text-sm outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ cụ thể (Số nhà, Tên đường)</label>
            <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} placeholder="VD: 123 Đường Xuân Thủy" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all text-sm outline-none" />
          </div>

          <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl">
            <p className="text-sm text-orange-800 font-medium mb-4 flex items-center gap-2">
              ⚠️ Tọa độ trung tâm Khu Tổ Hợp (Các dịch vụ thuộc tổ hợp này không được cách xa quá 3km).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vĩ độ (Latitude) <span className="text-red-500">*</span></label>
                <input type="number" step="any" name="latitude" required value={formData.latitude} onChange={handleChange} placeholder="VD: 21.028511" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm outline-none bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kinh độ (Longitude) <span className="text-red-500">*</span></label>
                <input type="number" step="any" name="longitude" required value={formData.longitude} onChange={handleChange} placeholder="VD: 105.804817" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm outline-none bg-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link href="/enterprise/complexes">
            <button type="button" className="px-6 py-3 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
              Hủy bỏ
            </button>
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-app-primary hover:bg-app-primary/90 disabled:opacity-70 text-white px-8 py-3 rounded-full text-sm font-semibold transition-all shadow-md min-w-[160px]"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Lưu Khu Tổ Hợp"}
          </button>
        </div>

      </form>
    </div>
  );
}
