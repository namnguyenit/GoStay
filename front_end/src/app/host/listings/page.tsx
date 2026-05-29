"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Trash2, Calendar } from "lucide-react";
import HostService from "@/services/host.service";

export default function HostListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const size = 6;

  async function fetchListings() {
    try {
      setLoading(true);
      const res = await HostService.getMyListings(page, size);
      if (res && res.data) {
        const content = res.data.content || res.data || [];
        setListings(content);
        if (res.data.totalPages !== undefined) {
          setTotalPages(res.data.totalPages);
        } else {
          setTotalPages(1);
        }
      }
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchListings();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này không? Hành động này không thể hoàn tác.")) {
      return;
    }
    try {
      setDeletingId(id);
      await HostService.deleteListing(id);
      alert("Xóa dịch vụ thành công!");
      fetchListings();
    } catch (err) {
      console.error("Failed to delete listing", err);
      alert("Xóa dịch vụ thất bại. Vui lòng thử lại!");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-smooth-appear">
      
      {/* Title & Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Quản lý dịch vụ</h2>
          <p className="text-xs text-gray-500">Danh sách các chỗ nghỉ, trải nghiệm của bạn đang được niêm yết.</p>
        </div>
        <Link href="/host/listings/new">
          <button className="flex items-center gap-2 bg-app-primary hover:bg-app-primary/95 text-white font-semibold text-xs rounded-xl h-10 px-4 transition-all">
            <PlusCircle className="h-4 w-4" />
            Đăng dịch vụ mới
          </button>
        </Link>
      </div>

      {/* Main Table/Grid */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="w-full">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
               {[1,2,3,4,5].map(i => <div key={i} className="h-3 w-16 bg-gray-200 animate-shimmer rounded"></div>)}
            </div>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-4 w-1/4">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 animate-shimmer shrink-0"></div>
                  <div className="space-y-2 flex-grow">
                    <div className="h-3.5 w-3/4 bg-gray-200 animate-shimmer rounded"></div>
                    <div className="h-2.5 w-1/2 bg-gray-100 animate-shimmer rounded"></div>
                  </div>
                </div>
                <div className="w-1/4 flex justify-center"><div className="h-4 w-16 bg-gray-100 animate-shimmer rounded"></div></div>
                <div className="w-1/4 flex justify-center"><div className="h-4 w-20 bg-gray-100 animate-shimmer rounded"></div></div>
                <div className="w-1/4 flex justify-end gap-3">
                  <div className="h-6 w-20 bg-gray-200 animate-shimmer rounded-full"></div>
                  <div className="h-6 w-6 bg-gray-100 animate-shimmer rounded"></div>
                  <div className="h-6 w-6 bg-gray-100 animate-shimmer rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xs text-gray-500 mb-4">Bạn chưa đăng ký dịch vụ nào.</p>
            <Link href="/host/listings/new">
              <button className="bg-gray-50 border border-gray-300 hover:bg-white/10 text-gray-900 font-semibold text-xs rounded-xl h-10 px-4 transition-all">
                Đăng ký dịch vụ đầu tiên
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-wider bg-gray-50">
                  <th className="py-4 px-6">Dịch vụ</th>
                  <th className="py-4 px-6">Loại hình</th>
                  <th className="py-4 px-6">Vị trí</th>
                  <th className="py-4 px-6">Giá cơ bản</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {listings.map((item) => (
                  <tr key={item.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {item.thumbnailUrl ? (
                          <img 
                            src={item.thumbnailUrl} 
                            alt={item.title} 
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-[10px] text-gray-500">
                            Ảnh
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1 max-w-[200px]">{item.title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">ID: {item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-700">
                      {item.category === "STAY" ? "🏨 Lưu trú" : item.category === "EXP" ? "🧗 Trải nghiệm" : "🛠️ Tiện ích"}
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      {item.province || "Chưa rõ"}
                    </td>
                    <td className="py-4 px-6 font-semibold text-app-accent">
                      {item.basePrice ? `${item.basePrice.toLocaleString("vi-VN")}đ` : "Thỏa thuận"}
                      <span className="text-[10px] text-gray-500 font-normal">
                        /{item.priceUnit === "PER_NIGHT" ? "đêm" : item.priceUnit === "PER_PAX" ? "khách" : "giờ"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block text-[10px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                        Đang hoạt động
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/host/calendar?listingId=${item.id}`}>
                          <button 
                            className="p-2 hover:bg-gray-50 rounded-lg text-blue-600 hover:text-blue-300 transition-all"
                            title="Xem lịch đặt phòng"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-2 hover:bg-gray-50 rounded-lg text-red-600 hover:text-red-600 transition-all disabled:opacity-50"
                          title="Xóa dịch vụ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 text-xs">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 hover:bg-white/10 transition-all disabled:opacity-30 disabled:hover:bg-gray-50"
            >
              Trang trước
            </button>
            <span className="text-gray-500">
              Trang <strong className="text-gray-900">{page + 1}</strong> trên <strong className="text-gray-900">{totalPages}</strong>
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 hover:bg-white/10 transition-all disabled:opacity-30 disabled:hover:bg-gray-50"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
