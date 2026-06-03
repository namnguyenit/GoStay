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
  Building,
  Menu
} from "lucide-react";
import AuthService from "@/services/auth.service";

export default function EnterpriseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [enterpriseName, setEnterpriseName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (!AuthService.isAuthenticated()) {
        router.push("/");
        return;
      }
      const roles = AuthService.getUserRoles();
      if (!roles.includes("ENTERPRISE")) {
        alert("Bạn không có quyền truy cập kênh doanh nghiệp.");
        router.push("/");
        return;
      }
      const user = AuthService.getCurrentUser();
      if (user) {
        setEnterpriseName(user.lastName || user.fullName || user.username || "Enterprise");
      }
      setIsAuthorized(true);
    };
    checkAuth();
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-app-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm font-medium">Đang xác thực quyền Doanh nghiệp...</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { name: "Tổng quan", href: "/enterprise", icon: TrendingUp },
    { name: "Dịch vụ", href: "/enterprise/listings", icon: Home, match: "/enterprise/listings" },
    { name: "Khu Tổ Hợp", href: "/enterprise/complexes", icon: Building, match: "/enterprise/complexes" },
    { name: "Lịch", href: "/enterprise/calendar", icon: Calendar, match: "/enterprise/calendar" },
    { name: "Đơn hàng", href: "/enterprise/orders", icon: Calendar, match: "/enterprise/orders" },
    { name: "Thu nhập", href: "/enterprise/earnings", icon: DollarSign, match: "/enterprise/earnings" },
    { name: "Đề xuất địa danh", href: "/enterprise/landmark-suggestions", icon: Building, match: "/enterprise/landmark-suggestions" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 h-20 flex items-center justify-between shadow-sm transition-all">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3 w-1/4">
          <div className="p-2 bg-app-primary/10 rounded-xl border border-app-primary/30">
            <Building className="h-6 w-6 text-app-primary" />
          </div>
          <div className="hidden md:block">
            <h2 className="text-sm font-bold text-gray-900 tracking-wide">KÊNH DOANH NGHIỆP</h2>
            <p className="text-[10px] text-gray-500 font-medium">GoStay Enterprise Portal</p>
          </div>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center justify-center gap-6 h-full w-2/4">
          {navLinks.map((link) => {
            const isActive = link.match ? pathname.startsWith(link.match) : pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`flex items-center gap-2 h-full border-b-2 text-sm font-medium transition-colors ${
                  isActive 
                    ? "border-app-primary text-app-primary" 
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-4 w-1/4">
          <Link href="/enterprise/listings/new" className="hidden sm:flex">
            <button className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-800 font-semibold text-xs rounded-full shadow-sm h-10 px-5 transition-all">
              <PlusCircle className="h-4 w-4 text-app-primary" />
              Thêm dịch vụ
            </button>
          </Link>

          <Link href="/">
            <button className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 h-10 px-4 rounded-full transition-all">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Về GoStay</span>
            </button>
          </Link>
          
          <button 
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-2">
           {navLinks.map((link) => {
            const isActive = link.match ? pathname.startsWith(link.match) : pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-gray-100 text-gray-900" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <link.icon className={`h-5 w-5 ${isActive ? "text-app-primary" : ""}`} />
                {link.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full gap-8">
        {/* Dynamic page content */}
        {children}
      </main>
    </div>
  );
}
