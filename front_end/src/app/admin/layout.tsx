"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthService from "@/services/auth.service";

interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
}

interface NavGroup {
  title: string;
  key: string;
  items: NavItem[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminName, setAdminName] = useState("");

  // Collapsible state for sidebar groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    partners: true,
    services: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const checkAuth = () => {
      if (!AuthService.isAuthenticated()) {
        router.push("/log-in");
        return;
      }
      const roles = AuthService.getUserRoles();
      if (!roles.includes("ROLE_ADMIN")) {
        alert("Bạn không có quyền truy cập trang quản trị.");
        router.push("/");
        return;
      }
      const user = AuthService.getCurrentUser();
      if (user?.username) setAdminName(user.username);
      setIsAuthorized(true);
    };
    checkAuth();
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f3f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium">Đang xác thực quyền Admin...</p>
        </div>
      </div>
    );
  }

  // Sidebar Layout Groups (CoreUI style)
  const navGroups: NavGroup[] = [
    {
      title: "ĐỐI TÁC (PARTNERS)",
      key: "partners",
      items: [
        { href: "/admin/hosts", label: "🏠 Xét duyệt Host" },
        { href: "/admin/approved-hosts", label: "✅ Hosts Đã Duyệt" },
        { href: "/admin/enterprises", label: "💼 Xét duyệt Enterprise" },
        { href: "/admin/approved-enterprises", label: "🏢 DN Đã Duyệt" },
      ],
    },
    {
      title: "DỊCH VỤ & DANH MỤC",
      key: "services",
      items: [
        { href: "/admin/landmarks", label: "📍 Địa danh" },
        { href: "/admin/listings", label: "🏨 Quản lý Dịch vụ" },
        { href: "/admin/inventory", label: "📦 Tồn kho" },
      ],
    },
  ];

  // Flat helper to find active page labels
  const getActiveItemLabel = () => {
    if (pathname === "/admin") return "Tổng quan";
    if (pathname.startsWith("/admin/users")) return "Quản lý Users";
    if (pathname.startsWith("/admin/payouts")) return "Payout Hosts";
    
    for (const group of navGroups) {
      for (const item of group.items) {
        if (pathname.startsWith(item.href)) {
          return item.label.replace(/^[^ ]+ /, ""); // strip emoji
        }
      }
    }
    return "Trang quản trị";
  };

  return (
    <div className="flex min-h-screen bg-[#e4e5e6] text-[#23282c]">
      {/* Sidebar CoreUI Dark Style */}
      <aside className="w-[230px] bg-[#2f353a] flex flex-col fixed top-0 left-0 h-screen z-20 shadow-lg text-[#fff]">
        {/* Sidebar Brand Section */}
        <div className="h-[55px] bg-[#202428] flex items-center justify-between px-4 border-b border-[#181b1d]">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm uppercase tracking-wider text-[#20a8d8]">
              🌀 GoStay Admin
            </span>
          </div>
          <span className="text-3xs bg-[#20a8d8] text-white px-1.5 py-0.5 rounded font-bold uppercase">PRO</span>
        </div>

        {/* Sidebar Nav links container */}
        <nav className="flex-1 overflow-y-auto py-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-800">
          {/* Dashboard (Root level) */}
          <Link
            href="/admin"
            className={`flex items-center px-4 py-3 text-sm font-medium transition-all ${
              pathname === "/admin"
                ? "bg-[#3a4248] text-white border-l-4 border-[#20a8d8]"
                : "text-[#e4e5e6] hover:bg-[#202428] hover:text-white"
            }`}
          >
            📊 Dashboard <span className="ml-auto text-3xs bg-[#20a8d8] text-white px-1 py-0.5 rounded font-extrabold">NEW</span>
          </Link>

          <Link
            href="/admin/users"
            className={`flex items-center px-4 py-3 text-sm font-medium transition-all ${
              pathname.startsWith("/admin/users")
                ? "bg-[#3a4248] text-white border-l-4 border-[#20a8d8]"
                : "text-[#e4e5e6] hover:bg-[#202428] hover:text-white"
            }`}
          >
            👥 Quản lý Users
          </Link>

          {/* Collapsible Groups */}
          {navGroups.map((group) => {
            const isOpen = openGroups[group.key];
            return (
              <div key={group.key} className="space-y-0.5">
                {/* Group Header Toggle */}
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-3xs font-extrabold tracking-wider text-[#a4b7c1] hover:text-[#fff] transition-colors bg-[#202428]/40"
                >
                  <span>{group.title}</span>
                  <svg
                    className={`w-2.5 h-2.5 transform transition-transform ${isOpen ? "rotate-90" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Sub Menu items */}
                {isOpen && (
                  <div className="bg-[#24282c]">
                    {group.items.map((item) => {
                      const isActive = pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center pl-6 pr-4 py-2 text-xs font-semibold transition-all ${
                            isActive
                              ? "bg-[#20a8d8] text-white"
                              : "text-[#cbd5e1] hover:bg-[#2f353a] hover:text-[#fff]"
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Payout Hosts */}
          <Link
            href="/admin/payouts"
            className={`flex items-center px-4 py-3 text-sm font-medium transition-all ${
              pathname.startsWith("/admin/payouts")
                ? "bg-[#3a4248] text-white border-l-4 border-[#20a8d8]"
                : "text-[#e4e5e6] hover:bg-[#202428] hover:text-white"
            }`}
          >
            💰 Payout Hosts
          </Link>
        </nav>

        {/* Sidebar Footer - Admin Info */}
        <div className="p-3 bg-[#202428] border-t border-[#181b1d] flex items-center justify-between">
          <div className="truncate max-w-[120px]">
            <p className="text-2xs text-[#a4b7c1]">Đăng nhập làm</p>
            <p className="text-xs font-bold text-white truncate">{adminName}</p>
          </div>
          <button
            onClick={() => {
              AuthService.logout();
              router.push("/log-in");
            }}
            className="text-xs px-2 py-1.5 rounded font-bold border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white transition-all"
            title="Đăng xuất"
          >
            🚪 Thoát
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 ml-[230px] flex flex-col min-h-screen">
        {/* CoreUI White Header (Topbar) */}
        <header className="h-[55px] bg-[#fff] border-b border-[#c8ced3] flex items-center justify-between px-6 sticky top-0 z-10 shadow-2xs">
          {/* Breadcrumb pathing */}
          <div className="flex items-center gap-1.5 text-xs text-[#73818f] font-medium">
            <span className="text-[#20a8d8] font-semibold hover:underline cursor-pointer">Home</span>
            <span>/</span>
            <span className="text-[#20a8d8] font-semibold hover:underline cursor-pointer">Admin</span>
            <span>/</span>
            <span className="text-gray-800 font-bold">{getActiveItemLabel()}</span>
          </div>

          {/* Right Header Navigation */}
          <div className="flex items-center gap-4">
            {/* Notifications icon + badge */}
            <div className="relative cursor-pointer p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-3xs font-extrabold flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                5
              </span>
            </div>

            {/* Separator */}
            <div className="w-[1px] h-6 bg-gray-200"></div>

            {/* Admin Avatar & Dropdown mock */}
            <div className="flex items-center gap-2 cursor-pointer group">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
                alt="Admin avatar"
                className="w-8 h-8 rounded-full object-cover border border-gray-200 bg-gray-50 shadow-sm"
              />
              <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors uppercase tracking-tight">
                {adminName}
              </span>
            </div>
          </div>
        </header>

        {/* CoreUI Light Grey Content Area */}
        <main className="p-6 flex-1 bg-[#e4e5e6]">
          {children}
        </main>
      </div>
    </div>
  );
}
