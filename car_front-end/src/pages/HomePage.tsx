import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Calendar,
  ShieldCheck,
  Clock,
  Award,
} from "lucide-react";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState("Hà Nội");
  const [to, setTo] = useState("Đà Nẵng");
  const [date, setDate] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/cars?search=${encodeURIComponent(to)}`);
  };

  return (
    <div className="space-y-12">
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 text-white shadow-xl sm:p-12">
        <div className="max-w-3xl space-y-4">
          <span className="inline-block rounded-full border border-blue-400/30 bg-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-100 backdrop-blur-sm">
            Hệ thống Đặt vé Xe khách Đường dài GoStay
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Đặt vé xe khách đường dài nhanh chóng & an toàn
          </h1>
          <p className="text-base text-blue-100 sm:text-lg">
            Hơn 1,000+ chuyến xe mỗi ngày nối liền các tỉnh thành Việt Nam với
            trải nghiệm thoải mái nhất.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-8 grid grid-cols-1 gap-4 rounded-2xl bg-white p-4 text-gray-900 shadow-2xl sm:grid-cols-4 sm:p-6"
        >
          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Điểm đi
            </label>
            <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5">
              <MapPin className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Tỉnh/Thành đi"
                className="w-full bg-transparent text-sm font-medium focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Điểm đến
            </label>
            <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5">
              <MapPin className="h-5 w-5 flex-shrink-0 text-red-500" />
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Tỉnh/Thành đến"
                className="w-full bg-transparent text-sm font-medium focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Ngày đi
            </label>
            <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5">
              <Calendar className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
            >
              <Search className="h-5 w-5" />
              <span>Tìm Chuyến Xe</span>
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-start space-x-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Nhà xe uy tín</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tất cả đối tác nhà xe đều được xác minh giấy phép kinh doanh
              nghiêm ngặt.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="rounded-xl bg-green-50 p-3 text-green-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Đúng giờ & Linh hoạt
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Cập nhật lịch trình thời gian thực, hủy vé và đổi vé dễ dàng trực
              tuyến.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Xe Giường Nằm & Limousine
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Đa dạng các loại xe hiện đại với đầy đủ tiện nghi wifi, cổng sạc,
              khăn lạnh.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
