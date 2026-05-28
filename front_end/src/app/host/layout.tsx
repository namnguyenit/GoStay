"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  DollarSign, 
  Calendar, 
  PlusCircle, 
  ArrowLeft,
  TrendingUp,
  Building
} from "lucide-react";
import AuthService from "@/services/auth.service";
import { Button } from "@/components/ui/button";

export default function HostLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [hostName, setHostName] = useState("");

  useEffect(() => {
    const checkAuth = () => {
      if (!AuthService.isAuthenticated()) {
        router.push("/log-in");
        return;
      }
      const roles = AuthService.getUserRoles();
      if (!roles.includes("HOST")) {
        alert("Bạn không có quyền truy cập kênh chủ nhà.");
        router.push("/");
        return;
      }
      const user = AuthService.getCurrentUser();
      if (user) {
        setHostName(user.lastName || user.fullName || user.username || "Host");
      }
      setIsAuthorized(true);
    };
    checkAuth();
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07070d]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-app-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm font-medium">Đang xác thực quyền Chủ nhà...</p>
        </div>
      </div>
    );
  }

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
          <Link 
            href="/host" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/host" 
                ? "bg-app-primary text-white shadow-lg shadow-app-primary/10" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Tổng quan (Dashboard)
          </Link>
          
          <Link 
            href="/host/listings" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              pathname.startsWith("/host/listings") 
                ? "bg-app-primary text-white shadow-lg shadow-app-primary/10" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Home className="h-4 w-4" />
            Quản lý dịch vụ
          </Link>

          <Link 
            href="/host/calendar" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              pathname.startsWith("/host/calendar") 
                ? "bg-app-primary text-white shadow-lg shadow-app-primary/10" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Quản lý lịch
          </Link>

          <Link 
            href="/host/earnings" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              pathname.startsWith("/host/earnings") 
                ? "bg-app-primary text-white shadow-lg shadow-app-primary/10" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Thu nhập & Payout
          </Link>
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
            <h1 className="text-xl font-bold text-white sm:text-2xl">Xin chào, {hostName}!</h1>
            <p className="text-xs text-gray-400 mt-1">Chào mừng bạn đến với Kênh quản trị chủ nhà GoStay.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/host/listings/new">
              <button className="flex items-center gap-2 bg-app-primary hover:bg-app-primary/95 text-white font-semibold text-xs rounded-xl shadow-lg shadow-app-primary/20 h-10 px-4 transition-all">
                <PlusCircle className="h-4 w-4" />
                Thêm dịch vụ mới
              </button>
            </Link>
          </div>
        </header>

        {/* Dynamic page content */}
        {children}

      </main>

    </div>
  );
}
