import React, { useEffect, useState } from "react";
import { CarService } from "../services/car.service";
import type { Car } from "../types";
import {
  Bus,
  Search,
  AlertCircle,
  RefreshCw,
  Users,
  Shield,
} from "lucide-react";

export const CarListPage: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchCars = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await CarService.getCars({ page, limit: 9, search });
      setCars(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách xe từ Gateway";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCars();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
            <Bus className="h-7 w-7 text-blue-600" />
            <span>Danh sách Xe khách & Nhà xe</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Dữ liệu kết nối trực tiếp tới API Gateway (/api/v1/cars)
          </p>
        </div>

        {/* Filter Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center space-x-2"
        >
          <div className="relative">
            <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên xe, biển số..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 rounded-lg border border-gray-200 py-2 pr-4 pl-9 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={fetchCars}
            className="flex items-center space-x-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800 transition-colors hover:bg-red-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="animate-pulse space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="h-40 rounded-xl bg-gray-200"></div>
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      ) : cars.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-gray-100 bg-white px-4 py-16 text-center shadow-sm">
          <Bus className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-700">
            Chưa tìm thấy chuyến xe nào
          </h3>
          <p className="mx-auto max-w-md text-sm text-gray-400">
            Hiện chưa có dữ liệu xe khớp với từ khóa tìm kiếm của bạn hoặc chưa
            có xe nào được kích hoạt.
          </p>
        </div>
      ) : (
        /* Cars List Grid */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {cars.map((car) => (
            <div
              key={car.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="space-y-4 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold tracking-wider text-blue-600 uppercase">
                      {car.brand || "Xe đường dài"}
                    </span>
                    <h3 className="mt-2 text-xl font-bold text-gray-900">
                      {car.name}
                    </h3>
                  </div>
                  <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs font-medium text-gray-700">
                    {car.licensePlate}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                  <div className="flex items-center space-x-1.5">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>
                      Sức chứa: <strong>{car.seatCapacity} ghế</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>
                      Trạng thái: <strong>{car.status}</strong>
                    </span>
                  </div>
                </div>

                {car.description && (
                  <p className="line-clamp-2 text-xs text-gray-500">
                    {car.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
                <div>
                  <span className="block text-xs text-gray-400">
                    Giá trung bình
                  </span>
                  <span className="text-lg font-extrabold text-blue-600">
                    {car.pricePerTrip
                      ? `${car.pricePerTrip.toLocaleString()}đ`
                      : "Liên hệ"}
                  </span>
                </div>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700">
                  Chọn chuyến
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Trang {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};
