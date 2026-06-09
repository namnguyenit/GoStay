"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building, Loader2, MapPin } from "lucide-react";
import EnterpriseService from "@/services/enterprise.service";
import { PROVINCES } from "@/shared/constants/provinces";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getErrorMessage } from "../../_utils";
import LocationCoordinatePicker from "@/shared/components/LocationCoordinatePicker";

export default function NewComplexPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error"; message: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    province: "",
    latitude: "",
    longitude: "",
    thumbnailUrl: "",
  });

  const setField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);
    if (!formData.name.trim() || !formData.province.trim() || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setFeedback({ type: "error", message: "Vui lòng nhập tên, tỉnh/thành và tọa độ hợp lệ." });
      return;
    }

    try {
      setLoading(true);
      await EnterpriseService.createComplex({
        name: formData.name.trim(),
        description: formData.description.trim(),
        province: formData.province,
        latitude,
        longitude,
        thumbnailUrl: formData.thumbnailUrl.trim(),
        galleryUrls: [],
      });
      router.push("/enterprise/complexes");
    } catch (err: unknown) {
      setFeedback({ type: "error", message: getErrorMessage(err, "Có lỗi xảy ra khi tạo khu tổ hợp.") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/enterprise/complexes">
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo khu tổ hợp mới</h1>
          <p className="mt-0.5 text-sm text-gray-500">Thiết lập tâm khu tổ hợp để các listing thuộc khu nằm trong bán kính 3km.</p>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Building className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Thông tin cơ bản</h2>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Tên khu tổ hợp <span className="text-red-500">*</span></label>
            <input
              value={formData.name}
              onChange={(event) => setField("name", event.target.value)}
              required
              placeholder="VD: Vinpearl Resort Nha Trang"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition-all focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(event) => setField("description", event.target.value)}
              rows={4}
              placeholder="Mô tả quy mô, tiện ích chung và điểm nổi bật của khu tổ hợp..."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition-all focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Thumbnail URL</label>
            <input
              value={formData.thumbnailUrl}
              onChange={(event) => setField("thumbnailUrl", event.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition-all focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
            />
          </div>
        </section>

        <section className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <div className="rounded-xl bg-green-50 p-2 text-green-600">
              <MapPin className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Vị trí & tọa độ</h2>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
            <Select value={formData.province} onValueChange={(value) => setField("province", value)} required>
              <SelectTrigger className="h-[46px] w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 focus:ring-1 focus:ring-app-primary">
                <SelectValue placeholder="-- Chọn tỉnh/thành phố --" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-[300px]">
                <SelectGroup>
                  {PROVINCES.map((province) => (
                    <SelectItem key={province} value={province} className="text-sm">{province}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <LocationCoordinatePicker
            title="Chọn tâm khu tổ hợp trên bản đồ"
            hint="Tìm khu nghỉ dưỡng hoặc bấm lên bản đồ để lấy tọa độ trung tâm. Listing gắn vào khu này phải nằm trong bán kính 3km."
            searchPlaceholder="Nhập tên khu tổ hợp, resort hoặc địa chỉ..."
            allowNameOverwrite
            value={{
              name: formData.name,
              province: formData.province,
              latitude: formData.latitude,
              longitude: formData.longitude,
            }}
            onChange={(patch) =>
              setFormData((current) => ({
                ...current,
                name: patch.name ?? current.name,
                province: patch.province ?? current.province,
                latitude: patch.latitude ?? current.latitude,
                longitude: patch.longitude ?? current.longitude,
              }))
            }
          />
        </section>

        <div className="flex items-center justify-end gap-4 pt-4">
          <Link href="/enterprise/complexes">
            <button type="button" className="rounded-full px-6 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100">Hủy</button>
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex min-w-[160px] items-center justify-center gap-2 rounded-full bg-app-primary px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-app-primary/90 disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Lưu khu tổ hợp"}
          </button>
        </div>
      </form>
    </div>
  );
}
