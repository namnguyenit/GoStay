import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({ username, password });
      navigate("/");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto my-12 max-w-md">
      <Card className="border-gray-200 shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-1 inline-flex rounded-full bg-blue-50 p-3 text-blue-600">
            <LogIn className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Đăng Nhập Tài Khoản
          </CardTitle>
          <CardDescription>
            Truy cập hệ thống xe khách đường dài GoStay
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center space-x-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập / Username *</Label>
              <div className="relative">
                <User className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu *</Label>
              <div className="relative">
                <Lock className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="pr-9 pl-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-2.5 right-3 cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700"
            >
              {loading ? "Đang xác thực..." : "Đăng Nhập"}
            </Button>
          </form>

          <div className="border-t border-gray-100 pt-2 text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:underline"
            >
              Đăng ký ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
