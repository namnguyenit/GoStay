"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Home, 
  DollarSign, 
  Calendar, 
  Star, 
  PlusCircle, 
  ArrowRight
} from "lucide-react";
import HostService from "@/services/host.service";

export default function HostDashboard() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [totalListings, setTotalListings] = useState(0);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Fetch listings
        const listingsRes = await HostService.getMyListings(0, 5);
        if (listingsRes && listingsRes.data) {
          const content = listingsRes.data.content || listingsRes.data || [];
          setListings(content.slice(0, 3));
          setTotalListings(listingsRes.data.totalElements || content.length || 0);
        }

        // Fetch payouts/earnings
        try {
          const payoutsRes = await HostService.getMyPayouts(0, 5);
          if (payoutsRes && payoutsRes.data) {
            const content = payoutsRes.data.content || payoutsRes.data || [];
            setPayouts(content);
            
            // Calculate total earnings
            let total = 0;
            content.forEach((p: any) => {
              if (p.amount) total += p.amount;
            });
            setTotalEarnings(total);
          }
        } catch (err) {
          console.error("Failed to load payouts for dashboard", err);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-app-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-xs">Đang tải dữ liệu tổng quan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-smooth-appear">
      {/* Basic Stats Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#0d0d18] border border-white/5 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng thu nhập</span>
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/10">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {totalEarnings.toLocaleString("vi-VN")}đ
            </h3>
            <p className="text-[9px] text-emerald-400 font-medium mt-1">Cập nhật từ lịch sử thanh toán</p>
          </div>
        </div>

        <div className="bg-[#0d0d18] border border-white/5 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lượt chi trả</span>
            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/10">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{payouts.length} đợt</h3>
            <p className="text-[9px] text-blue-400 font-medium mt-1">Lịch sử giao dịch ví của bạn</p>
          </div>
        </div>

        <div className="bg-[#0d0d18] border border-white/5 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dịch vụ hoạt động</span>
            <div className="p-1.5 bg-app-primary/10 rounded-lg text-app-primary border border-app-primary/10">
              <Home className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{totalListings} dịch vụ</h3>
            <p className="text-[9px] text-gray-500 mt-1">Đang kinh doanh trên GoStay</p>
          </div>
        </div>

        <div className="bg-[#0d0d18] border border-white/5 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Đánh giá bình quân</span>
            <div className="p-1.5 bg-yellow-500/10 rounded-lg text-yellow-500 border border-yellow-500/10">
              <Star className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">4.8 / 5.0</h3>
            <p className="text-[9px] text-yellow-500 font-medium mt-1">Mức độ hài lòng của khách hàng</p>
          </div>
        </div>

      </section>

      {/* Main Content Area */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Listings Summary */}
        <div className="lg:col-span-2 bg-[#0d0d18] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white">Dịch vụ chỗ nghỉ gần đây</h3>
            <Link href="/host/listings" className="text-[10px] font-semibold text-app-accent hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {listings.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-white/5 rounded-xl">
                <p className="text-xs text-gray-500">Bạn chưa đăng dịch vụ chỗ nghỉ nào.</p>
                <Link href="/host/listings/new" className="text-xs text-app-primary hover:underline mt-2 inline-block font-semibold">
                  Tạo chỗ nghỉ đầu tiên ngay
                </Link>
              </div>
            ) : (
              listings.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-black/25 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    {item.thumbnailUrl ? (
                      <img 
                        src={item.thumbnailUrl} 
                        alt={item.title} 
                        className="w-12 h-12 rounded-lg object-cover border border-white/5 animate-fade-in"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center text-[10px] text-gray-500">
                        Ảnh
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.province || "Chưa cập nhật địa chỉ"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-app-accent">
                      {item.basePrice ? `${item.basePrice.toLocaleString("vi-VN")}đ` : "Thỏa thuận"}
                      <span className="text-[8px] text-gray-400">/{item.priceUnit === "PER_NIGHT" ? "đêm" : item.priceUnit === "PER_PAX" ? "khách" : "giờ"}</span>
                    </p>
                    <span className="inline-block text-[9px] px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-full mt-1">
                      Đang hoạt động
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick calendar and earnings access */}
        <div className="bg-[#0d0d18] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white">Lối tắt tính năng</h3>
          </div>
          
          <div className="space-y-3">
            <Link 
              href="/host/calendar"
              className="flex items-center gap-3 p-3 bg-black/25 hover:bg-white/5 rounded-xl border border-white/5 transition-all"
            >
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Quản lý lịch & Tồn kho</h4>
                <p className="text-[9px] text-gray-400 mt-0.5">Khóa/mở phòng và điều chỉnh lịch trống</p>
              </div>
            </Link>

            <Link 
              href="/host/listings/new"
              className="flex items-center gap-3 p-3 bg-black/25 hover:bg-white/5 rounded-xl border border-white/5 transition-all"
            >
              <div className="p-2 bg-app-primary/10 rounded-lg text-app-primary">
                <PlusCircle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Đăng thêm dịch vụ mới</h4>
                <p className="text-[9px] text-gray-400 mt-0.5">Tạo chỗ nghỉ Stay, Trải nghiệm, hoặc Dịch vụ khác</p>
              </div>
            </Link>

            <Link 
              href="/host/earnings"
              className="flex items-center gap-3 p-3 bg-black/25 hover:bg-white/5 rounded-xl border border-white/5 transition-all"
            >
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Xem chi tiết doanh thu</h4>
                <p className="text-[9px] text-gray-400 mt-0.5">Xem lịch sử thanh toán và số dư ví</p>
              </div>
            </Link>
          </div>
        </div>

      </section>
    </div>
  );
}
