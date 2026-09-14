import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  UserPlus,
  User,
  Lock,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Đăng ký tài khoản thất bại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto my-8 max-w-lg">
      <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-md">
        <div className="space-y-2 text-center">
          <div className="mb-1 inline-flex rounded-full bg-blue-50 p-3 text-blue-600">
            <UserPlus className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tạo Tài Khoản Mới
          </h1>
          <p className="text-sm text-gray-500">
            Trở thành thành viên GoStay để đặt vé xe nhanh chóng
          </p>
        </div>

        {success && (
          <div className="flex items-center space-x-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
            <span>
              Đăng ký thành công! Đang chuyển hướng sang trang Đăng nhập...
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase">
              Tên đăng nhập / Username *
            </label>
            <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5 focus-within:border-blue-500 focus-within:bg-white">
              <User className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Ví dụ: user123"
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase">
              Họ và tên *
            </label>
            <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5 focus-within:border-blue-500 focus-within:bg-white">
              <User className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase">
                Email *
              </label>
              <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5 focus-within:border-blue-500 focus-within:bg-white">
                <Mail className="h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase">
                Số điện thoại *
              </label>
              <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5 focus-within:border-blue-500 focus-within:bg-white">
                <Phone className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="phoneNumber"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="0912345678"
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase">
                Mật khẩu *
              </label>
              <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5 focus-within:border-blue-500 focus-within:bg-white">
                <Lock className="h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase">
                Ngày sinh
              </label>
              <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5 focus-within:border-blue-500 focus-within:bg-white">
                <Calendar className="h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-gray-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Đang tạo tài khoản..." : "Tạo Tài Khoản"}
          </button>
        </form>

        <div className="border-t border-gray-100 pt-2 text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
