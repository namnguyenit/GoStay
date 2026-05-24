"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthService from "@/services/auth.service";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check authentication and roles
    const checkAuth = () => {
      if (!AuthService.isAuthenticated()) {
        router.push("/log-in");
        return;
      }
      
      const roles = AuthService.getUserRoles();
      if (!roles.includes("ROLE_ADMIN")) {
        // Not an admin, redirect to home
        alert("Bạn không có quyền truy cập trang quản trị.");
        router.push("/");
        return;
      }

      setIsAuthorized(true);
    };

    checkAuth();
  }, [router]);

  if (!isAuthorized) {
    return <div className="min-h-screen flex items-center justify-center">Đang kiểm tra quyền truy cập...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-red-500">GoStay Admin</h1>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <Link
            href="/admin/users"
            className={`block px-4 py-2 rounded-md ${
              pathname === "/admin/users"
                ? "bg-red-50 text-red-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Quản lý Users
          </Link>
          <Link
            href="/admin/hosts"
            className={`block px-4 py-2 rounded-md ${
              pathname === "/admin/hosts"
                ? "bg-red-50 text-red-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Xét duyệt Host
          </Link>
          <Link
            href="/admin/landmarks"
            className={`block px-4 py-2 rounded-md ${
              pathname === "/admin/landmarks"
                ? "bg-red-50 text-red-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Quản lý Địa danh
          </Link>
        </nav>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <button
            onClick={() => {
              AuthService.logout();
              router.push("/log-in");
            }}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md font-medium"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
