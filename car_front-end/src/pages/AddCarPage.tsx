import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CarService } from "../services/car.service";
import type { CreateCarInput } from "../services/car.service";
import { PlusCircle, AlertCircle } from "lucide-react";

export const AddCarPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateCarInput>({
    name: "",
    brand: "Hoàng Long",
    licensePlate: "",
    seatCapacity: 40,
    type: "Limousine Giường Nằm",
    pricePerTrip: 350000,
    description: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await CarService.addCar(formData);
      navigate("/cars");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Thêm xe mới thất bại";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <PlusCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Đăng ký Thêm Xe Mới
            </h1>
            <p className="text-xs text-gray-500">
              Chỉ dành cho Nhà xe đối tác đã được kiểm duyệt
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase">
              Tên Chuyến / Loại xe *
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Xe Giường Nằm Chất Lượng Cao Hà Nội - Đà Nẵng"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase">
                Tên Nhà Xe / Thương hiệu
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Hoàng Long"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase">
                Biển số xe *
              </label>
              <input
                type="text"
                required
                placeholder="29B-123.45"
                value={formData.licensePlate}
                onChange={(e) =>
                  setFormData({ ...formData, licensePlate: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase">
                Sức chứa (Ghế/Giường) *
              </label>
              <input
                type="number"
                required
                min={4}
                max={100}
                value={formData.seatCapacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seatCapacity: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase">
                Giá mỗi chuyến (VNĐ)
              </label>
              <input
                type="number"
                value={formData.pricePerTrip}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricePerTrip: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase">
              Mô tả chi tiết
            </label>
            <textarea
              rows={3}
              placeholder="Thông tin tiện nghi (Wifi, điều hòa, nước uống...)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Xác nhận Thêm Xe"}
          </button>
        </form>
      </div>
    </div>
  );
};
