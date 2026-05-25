"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthService from "@/services/auth.service";

const NAV_ITEMS = [
  { href: "/admin", label: "📊 Tổng quan", exact: true },
  { href: "/admin/users", label: "👥 Quản lý Users" },
  { href: "/admin/hosts", label: "🏠 Xét duyệt Host" },
  { href: "/admin/approved-hosts", label: "✅ Hosts Đã Duyệt" },
  { href: "/admin/enterprises", label: "💼 Xét duyệt Enterprise" },
  { href: "/admin/approved-enterprises", label: "🏢 DN Đã Duyệt" },
  { href: "/admin/landmarks", label: "📍 Địa danh" },
  { href: "/admin/listings", label: "🏨 Quản lý Dịch vụ" },
  { href: "/admin/inventory", label: "📦 Tồn kho" },
  { href: "/admin/payouts", label: "💰 Payout Hosts" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminName, setAdminName] = useState("");

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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0 h-screen">
        {/* Logo */}
        <div className="p-5 border-b border-gray-200">
          <h1 className="text-lg font-extrabold text-red-500 tracking-tight">GoStay Admin</h1>
          {adminName && (
            <p className="text-xs text-gray-400 mt-1 truncate">Xin chào, {adminName}</p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-red-50 text-red-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => {
              AuthService.logout();
              router.push("/log-in");
            }}
            className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content - offset for fixed sidebar */}
      <div className="flex-1 ml-56">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
          <h2 className="text-sm text-gray-500">
            {NAV_ITEMS.find((item) =>
              item.exact ? pathname === item.href : pathname.startsWith(item.href)
            )?.label?.replace(/^[^ ]+ /, "") ?? "Quản trị hệ thống"}
          </h2>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
