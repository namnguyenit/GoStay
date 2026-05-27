"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Home, 
  DollarSign, 
  Calendar, 
  Star, 
  PlusCircle, 
  Settings, 
  ArrowLeft,
  Users,
  TrendingUp,
  Building,
  Menu,
  ChevronRight
} from "lucide-react";
import AuthService from "@/services/auth.service";
import { Button } from "@/components/ui/button";

export default function HostPortal() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(AuthService.getCurrentUser());
  }, []);

  return (
    <div className="min-h-screen bg-[#07070d] text-gray-100 flex flex-col md:flex-row animate-smooth-appear">
      
      {/* 1. Host Sidebar (Khung điều hướng bên trái) */}
      <aside className="w-full md:w-64 bg-[#0d0d18] border-r border-white/5 flex flex-col p-6 gap-6 shrink-0">
        
        {/* Brand/Portal Title */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <div className="p-2 bg-app-primary/10 rounded-lg border border-app-primary/20">
            <Building className="h-5 w-5 text-app-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wider">KÊNH CHỦ NHÀ</h2>
            <p className="text-[10px] text-app-accent font-medium">GoStay Host Portal</p>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex flex-col gap-1.5 flex-grow">
          <Link href="/host" className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold bg-app-primary text-white shadow-lg shadow-app-primary/10 transition-all">
            <TrendingUp className="h-4 w-4" />
            Tổng quan (Dashboard)
          </Link>
          
          <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all text-left">
            <div className="flex items-center gap-3">
              <Home className="h-4 w-4" />
              Quản lý chỗ nghỉ
            </div>
            <ChevronRight className="h-3 w-3 text-gray-600" />
          </button>

          <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all text-left">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4" />
              Quản lý đơn đặt phòng
            </div>
            <ChevronRight className="h-3 w-3 text-gray-600" />
          </button>

          <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all text-left">
            <div className="flex items-center gap-3">
              <Settings className="h-4 w-4" />
              Cài đặt chỗ nghỉ
            </div>
            <ChevronRight className="h-3 w-3 text-gray-600" />
          </button>
        </nav>

        {/* Quick action: back to customer site */}
        <div className="pt-4 border-t border-white/5">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 gap-2 px-3 h-10 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              Về trang khách hàng
            </Button>
          </Link>
        </div>

      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-grow flex flex-col p-6 sm:p-8 lg:p-10 gap-8 overflow-y-auto">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">Xin chào, {currentUser?.lastName || "Host"}!</h1>
            <p className="text-xs text-gray-400 mt-1">Chào mừng bạn đến với Kênh quản trị chỗ nghỉ GoStay.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-app-primary hover:bg-app-primary/95 text-white font-semibold text-xs rounded-xl shadow-lg shadow-app-primary/20 h-10 px-4 transition-all">
              <PlusCircle className="h-4 w-4" />
              Thêm chỗ nghỉ mới
            </button>
          </div>
        </header>

        {/* Basic Stats Cards (Khung số liệu mẫu) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-[#0d0d18] border border-white/5 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Doanh thu tháng này</span>
              <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/10">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">45.200.000đ</h3>
              <p className="text-[9px] text-emerald-400 font-medium mt-1">+12% so với tháng trước</p>
            </div>
          </div>

          <div className="bg-[#0d0d18] border border-white/5 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lượt đặt chỗ</span>
              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/10">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">28 đơn đặt</h3>
              <p className="text-[9px] text-blue-400 font-medium mt-1">+5 đơn đặt phòng mới</p>
            </div>
          </div>

          <div className="bg-[#0d0d18] border border-white/5 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Số chỗ nghỉ hoạt động</span>
              <div className="p-1.5 bg-app-primary/10 rounded-lg text-app-primary border border-app-primary/10">
                <Home className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">4 chỗ nghỉ</h3>
              <p className="text-[9px] text-gray-500 mt-1">Đang kinh doanh ổn định</p>
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
              <p className="text-[9px] text-yellow-500 font-medium mt-1">16 đánh giá tích cực</p>
            </div>
          </div>

        </section>

        {/* Content Skeletons (Khung danh mục bài đăng & đặt phòng đang kinh doanh) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Listings Skeleton */}
          <div className="lg:col-span-2 bg-[#0d0d18] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white">Bài đăng của bạn</h3>
              <button className="text-[10px] font-semibold text-app-accent hover:underline">Xem tất cả</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-black/25 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center text-xs text-gray-500">Ảnh</div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Căn hộ Deluxe View Hồ Tây</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Tây Hồ, Hà Nội</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-app-accent">1.200.000đ/đêm</p>
                  <span className="inline-block text-[9px] px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-full mt-1">Đang hoạt động</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-black/25 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center text-xs text-gray-500">Ảnh</div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Villa hồ bơi riêng biệt Tam Đảo</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Tam Đảo, Vĩnh Phúc</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-app-accent">4.500.000đ/đêm</p>
                  <span className="inline-block text-[9px] px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-full mt-1">Đang hoạt động</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Skeleton */}
          <div className="bg-[#0d0d18] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white">Đơn đặt phòng mới nhất</h3>
              <button className="text-[10px] font-semibold text-app-accent hover:underline">Xem lịch đặt</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-black/25 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-app-primary/10 border border-app-primary/20 flex items-center justify-center text-[10px] font-bold text-app-primary">ND</div>
                <div className="flex-grow">
                  <h4 className="text-xs font-bold text-white">Nguyen Van D</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Deluxe View Hồ Tây • 27/05 - 29/05</p>
                </div>
                <span className="text-[9px] px-2 py-0.5 bg-blue-950 text-blue-400 rounded-full shrink-0">Chờ check-in</span>
              </div>
            </div>
          </div>

        </section>

      </main>

    </div>
  );
}
