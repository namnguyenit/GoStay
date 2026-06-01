"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Building, MapPin, Loader2, ArrowRight } from "lucide-react";
import HostService from "@/services/host.service";

export default function HostComplexesPage() {
  const [complexes, setComplexes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplexes();
  }, []);

  const fetchComplexes = async () => {
    try {
      setLoading(true);
      const res = await HostService.getMyComplexes();
      if (res.data) {
        setComplexes(res.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách Khu tổ hợp:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Khu Tổ Hợp của bạn</h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý các khu tổ hợp lưu trú, nghỉ dưỡng dành riêng cho Doanh Nghiệp.
          </p>
        </div>
        <Link href="/host/complexes/new">
          <button className="flex items-center justify-center gap-2 bg-app-primary hover:bg-app-primary/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm">
            <Plus className="h-4 w-4" />
            Tạo Khu Tổ Hợp
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-app-primary animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Đang tải danh sách khu tổ hợp...</p>
        </div>
      ) : complexes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Building className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có Khu Tổ Hợp nào</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Khu tổ hợp giúp bạn nhóm các dịch vụ lưu trú lại với nhau (ví dụ: một resort có nhiều loại phòng, hoặc một chuỗi homestay).
          </p>
          <Link href="/host/complexes/new">
            <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all shadow-md">
              <Plus className="h-4 w-4" />
              Tạo Khu Tổ Hợp Đầu Tiên
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complexes.map((complex) => (
            <div 
              key={complex.id} 
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:border-gray-300 cursor-pointer flex flex-col h-full"
            >
              <div className="h-40 bg-gray-100 relative w-full border-b border-gray-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-app-primary/20 to-purple-500/20 mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {complex.status || "Hoạt động"}
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white drop-shadow-md">
                  <h3 className="font-bold text-xl truncate">{complex.name}</h3>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-start gap-2 text-gray-500 text-sm mb-4">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-app-primary" />
                  <p className="line-clamp-2 leading-relaxed">
                    {complex.streetAddress ? `${complex.streetAddress}, ` : ""}
                    {[complex.ward, complex.district, complex.province].filter(Boolean).join(", ")}
                  </p>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                  {complex.description || "Chưa có mô tả."}
                </p>
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <span className="text-xs font-medium text-gray-400">
                    ID: {complex.id.substring(0, 8)}...
                  </span>
                  <div className="text-app-primary text-sm font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Xem chi tiết <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
