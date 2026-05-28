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
          <h2 className="text-lg font-bold text-white">Quản lý dịch vụ</h2>
          <p className="text-xs text-gray-400">Danh sách các chỗ nghỉ, trải nghiệm của bạn đang được niêm yết.</p>
        </div>
        <Link href="/host/listings/new">
          <button className="flex items-center gap-2 bg-app-primary hover:bg-app-primary/95 text-white font-semibold text-xs rounded-xl h-10 px-4 transition-all">
            <PlusCircle className="h-4 w-4" />
            Đăng dịch vụ mới
          </button>
        </Link>
      </div>

      {/* Main Table/Grid */}
      <div className="bg-[#0d0d18] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-app-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-xs">Đang tải danh sách dịch vụ...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xs text-gray-500 mb-4">Bạn chưa đăng ký dịch vụ nào.</p>
            <Link href="/host/listings/new">
              <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs rounded-xl h-10 px-4 transition-all">
                Đăng ký dịch vụ đầu tiên
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-wider bg-black/10">
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
                            className="w-12 h-12 rounded-lg object-cover border border-white/5"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center text-[10px] text-gray-500">
                            Ảnh
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white line-clamp-1 max-w-[200px]">{item.title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">ID: {item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-300">
                      {item.category === "STAY" ? "🏨 Lưu trú" : item.category === "EXP" ? "🧗 Trải nghiệm" : "🛠️ Tiện ích"}
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      {item.province || "Chưa rõ"}
                    </td>
                    <td className="py-4 px-6 font-semibold text-app-accent">
                      {item.basePrice ? `${item.basePrice.toLocaleString("vi-VN")}đ` : "Thỏa thuận"}
                      <span className="text-[10px] text-gray-500 font-normal">
                        /{item.priceUnit === "PER_NIGHT" ? "đêm" : item.priceUnit === "PER_PAX" ? "khách" : "giờ"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block text-[10px] font-medium px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-full">
                        Đang hoạt động
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/host/calendar?listingId=${item.id}`}>
                          <button 
                            className="p-2 hover:bg-white/5 rounded-lg text-blue-400 hover:text-blue-300 transition-all"
                            title="Xem lịch đặt phòng"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-2 hover:bg-white/5 rounded-lg text-red-500 hover:text-red-400 transition-all disabled:opacity-50"
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-black/10 text-xs">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:hover:bg-white/5"
            >
              Trang trước
            </button>
            <span className="text-gray-400">
              Trang <strong className="text-white">{page + 1}</strong> trên <strong className="text-white">{totalPages}</strong>
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:hover:bg-white/5"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
