import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Shield,
  Building2,
  UserCheck,
  ArrowLeft,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/modules/auth/presentation/context/AuthContext";

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white shadow-sm">
        <div className="flex h-16 items-center space-x-2 border-b border-gray-200 px-6">
          <div className="rounded-lg bg-purple-600 p-2 text-white shadow-sm">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900">
              GoStay Admin
            </span>
            <Badge
              variant="secondary"
              className="ml-2 border-purple-200 bg-purple-50 text-[10px] font-semibold text-purple-700"
            >
              Quản trị
            </Badge>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <Link
            to="/admin/operators"
            className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive("/admin/operators") || isActive("/admin")
                ? "bg-purple-50 font-semibold text-purple-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Building2 className="h-4 w-4 text-purple-600" />
            <span>Quản lý Nhà xe</span>
          </Link>

          <Link
            to="/admin/applications"
            className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive("/admin/applications") ||
              isActive("/admin/operator-applications") ||
              isActive("/operator/admin")
                ? "bg-purple-50 font-semibold text-purple-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <UserCheck className="h-4 w-4 text-purple-600" />
            <span>Duyệt đơn Nhà xe</span>
          </Link>

          <div className="pt-4 pb-1">
            <p className="px-3 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
              Hệ thống
            </p>
          </div>

          <Link
            to="/profile"
            className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive("/profile")
                ? "bg-purple-50 font-semibold text-purple-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Users className="h-4 w-4 text-gray-500" />
            <span>Hồ sơ Quản trị</span>
          </Link>
        </nav>

        <div className="border-t border-gray-100 p-4 text-center text-xs text-gray-400">
          GoStay Admin Center &copy; 2026
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
          <div className="flex items-center space-x-3">
            <div className="rounded-md bg-purple-100 p-1.5 text-purple-700">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-gray-800">
              Hệ Thống Quản Trị Trung Tâm (GoStay Admin Portal)
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-800">
                {user?.fullName || "Quản trị viên"}
              </p>
              <p className="text-[10px] text-gray-500">{user?.email}</p>
            </div>
            <Link
              to="/"
              className="flex items-center space-x-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Về trang người dùng</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
