import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "@/modules/auth/presentation/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShieldAlert, ArrowLeft, LogIn } from "lucide-react";

export const AdminGuard: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-3">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-sm font-medium text-gray-600">
          Đang kiểm tra quyền Quản trị viên...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto my-16 max-w-md px-4">
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto inline-flex rounded-full bg-red-50 p-3 text-red-600">
              <ShieldAlert className="h-10 w-10" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Yêu cầu đăng nhập
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-gray-600">
              Bạn cần đăng nhập với tài khoản Quản trị viên để truy cập khu vực
              này.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link to="/">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Trang chủ</span>
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="sm"
                  className="gap-1.5 bg-purple-600 text-white hover:bg-purple-700"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Đăng nhập</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto my-16 max-w-lg px-4">
        <Card className="border-red-200 shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto inline-flex rounded-full bg-red-100 p-4 text-red-600">
              <ShieldAlert className="h-12 w-12" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-700">
              403 - Từ chối truy cập
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
              Bạn không có quyền thực hiện thao tác này. Chỉ Quản trị viên
              (Admin) mới có quyền truy cập.
            </div>
            <p className="text-xs text-gray-500">
              Tài khoản hiện tại của bạn không mang vai trò ADMIN trong hệ
              thống.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link to="/">
                <Button variant="outline" className="gap-1.5">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Quay về trang chủ</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Outlet />;
};
