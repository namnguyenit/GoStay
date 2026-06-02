"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, EyeOff, X } from "lucide-react";
import AuthService from "@/services/auth.service";
import { useAuthModal } from "../context/AuthModalContext";

export default function AuthModal() {
  const { isOpen, view, setView, closeModal } = useAuthModal();

  // Common loading & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login states
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register states
  const [regUsername, setRegUsername] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhoneNumber, setRegPhoneNumber] = useState("");
  const [regDateOfBirth, setRegDateOfBirth] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  if (!isOpen) return null;

  const handleSuccess = () => {
    closeModal();
    window.location.reload();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await AuthService.login({ username: loginUsername, password: loginPassword });
      handleSuccess();
    } catch (err: any) {
      const errorMessages: Record<string, string> = {
        USER_NOT_FOUND: "Tài khoản không tồn tại. Vui lòng kiểm tra lại tên đăng nhập.",
        UNAUTHENTICATED: "Mật khẩu không chính xác. Vui lòng thử lại.",
        BANNED_USER: "Tài khoản của bạn đã bị khóa.",
        DELETE_USER: "Tài khoản này đã bị xóa.",
      };
      const msg = errorMessages[err?.code] || err?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (regUsername.trim().length < 3) {
      setError("Tên đăng nhập phải từ 3 ký tự trở lên.");
      return;
    }

    if (regPassword.length < 8) {
      setError("Mật khẩu phải từ 8 ký tự trở lên.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError("Mật khẩu và Xác nhận mật khẩu không khớp.");
      return;
    }

    setLoading(true);
    try {
      await AuthService.register({
        username: regUsername,
        password: regPassword,
        email: regEmail,
        fullName: regFullName,
        phoneNumber: regPhoneNumber,
        dateOfBirth: regDateOfBirth,
        role: "USER"
      });
      // Tự động đăng nhập sau khi đăng ký thành công
      await AuthService.login({ username: regUsername, password: regPassword });
      handleSuccess();
    } catch (err: any) {
      setError(err?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-sans text-[#222222]">
      {/* Background with blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-[568px] bg-white rounded-xl shadow-2xl m-4 animate-smooth-appear overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <button onClick={closeModal} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-800" />
          </button>
          <h2 className="text-base font-bold text-center">Đăng nhập hoặc đăng ký</h2>
          <div className="w-9"></div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <h3 className="mb-2 text-2xl font-semibold tracking-tight">
            {view === "login" ? "Chào mừng bạn trở lại" : "Tạo tài khoản mới"}
          </h3>
          <p className="mb-6 text-sm text-[#717171]">
            {view === "login" 
              ? "Vui lòng điền thông tin để đăng nhập vào tài khoản của bạn." 
              : "Mọi tiện ích du lịch chỉ cách bạn vài thao tác đơn giản."}
          </p>
          
          {view === "login" ? (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-3">
                <div>
                  <div className="relative">
                    <input
                      id="login_username"
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      required
                      className="peer w-full rounded-lg border border-[#B0B0B0] bg-white px-3 pb-1 pt-5 text-sm outline-none transition focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
                      placeholder=" "
                    />
                    <label htmlFor="login_username" className="pointer-events-none absolute left-3 top-1.5 z-10 origin-[0] transform text-[11px] text-[#717171] duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px]">
                      Tên đăng nhập
                    </label>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <input
                      id="login_password"
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="peer w-full rounded-lg border border-[#B0B0B0] bg-white px-3 pb-1 pt-5 pr-10 text-sm outline-none transition focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
                      placeholder=" "
                    />
                    <label htmlFor="login_password" className="pointer-events-none absolute left-3 top-1.5 z-10 origin-[0] transform text-[11px] text-[#717171] duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px]">
                      Mật khẩu
                    </label>
                    <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717171] hover:text-[#222222] focus:outline-none">
                      {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex justify-between text-xs">
                <Link href="#" className="font-semibold underline transition-colors hover:text-[#717171]">
                  Quên mật khẩu?
                </Link>
              </div>

              <Button disabled={loading} type="submit" className="mt-2 h-12 w-full rounded-lg bg-[#FF5A5F] text-base font-semibold text-white transition-colors hover:bg-[#E35054] active:scale-[0.98]">
                {loading ? "Đang xử lý..." : "Tiếp tục"}
              </Button>
            </form>
          ) : (
            <form className="space-y-3" onSubmit={handleRegister}>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        id="reg_username"
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        required
                        className="peer w-full rounded-lg border border-[#B0B0B0] bg-white px-3 pb-1 pt-5 text-sm outline-none transition focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
                        placeholder=" "
                      />
                      <label htmlFor="reg_username" className="pointer-events-none absolute left-3 top-1.5 z-10 origin-[0] transform text-[11px] text-[#717171] duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px]">
                        Tên đăng nhập
                      </label>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="relative">
                      <input
                        id="reg_fullName"
                        type="text"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        required
                        className="peer w-full rounded-lg border border-[#B0B0B0] bg-white px-3 pb-1 pt-5 text-sm outline-none transition focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
                        placeholder=" "
                      />
                      <label htmlFor="reg_fullName" className="pointer-events-none absolute left-3 top-1.5 z-10 origin-[0] transform text-[11px] text-[#717171] duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px]">
                        Họ và Tên
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <input
                      id="reg_email"
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      className="peer w-full rounded-lg border border-[#B0B0B0] bg-white px-3 pb-1 pt-5 text-sm outline-none transition focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
                      placeholder=" "
                    />
                    <label htmlFor="reg_email" className="pointer-events-none absolute left-3 top-1.5 z-10 origin-[0] transform text-[11px] text-[#717171] duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px]">
                      Email
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        id="reg_phoneNumber"
                        type="tel"
                        value={regPhoneNumber}
                        onChange={(e) => setRegPhoneNumber(e.target.value)}
                        required
                        className="peer w-full rounded-lg border border-[#B0B0B0] bg-white px-3 pb-1 pt-5 text-sm outline-none transition focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
                        placeholder=" "
                      />
                      <label htmlFor="reg_phoneNumber" className="pointer-events-none absolute left-3 top-1.5 z-10 origin-[0] transform text-[11px] text-[#717171] duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px]">
                        Số điện thoại
                      </label>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="relative">
                      <input
                        id="reg_dateOfBirth"
                        type="date"
                        value={regDateOfBirth}
                        onChange={(e) => setRegDateOfBirth(e.target.value)}
                        required
                        className="peer w-full rounded-lg border border-[#B0B0B0] bg-white px-3 pb-1 pt-5 text-sm outline-none transition focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
                        placeholder=" "
                      />
                      <label htmlFor="reg_dateOfBirth" className="pointer-events-none absolute left-3 top-1.5 z-10 origin-[0] transform text-[11px] text-[#717171] duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px]">
                        Ngày sinh
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <input
                      id="reg_password"
                      type={showRegPassword ? "text" : "password"}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      className="peer w-full rounded-lg border border-[#B0B0B0] bg-white px-3 pb-1 pt-5 pr-10 text-sm outline-none transition focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
                      placeholder=" "
                    />
                    <label htmlFor="reg_password" className="pointer-events-none absolute left-3 top-1.5 z-10 origin-[0] transform text-[11px] text-[#717171] duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px]">
                      Mật khẩu
                    </label>
                    <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717171] hover:text-[#222222] focus:outline-none">
                      {showRegPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <input
                      id="reg_confirm_password"
                      type={showRegConfirmPassword ? "text" : "password"}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                      className="peer w-full rounded-lg border border-[#B0B0B0] bg-white px-3 pb-1 pt-5 pr-10 text-sm outline-none transition focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
                      placeholder=" "
                    />
                    <label htmlFor="reg_confirm_password" className="pointer-events-none absolute left-3 top-1.5 z-10 origin-[0] transform text-[11px] text-[#717171] duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px]">
                      Xác nhận mật khẩu
                    </label>
                    <button type="button" onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717171] hover:text-[#222222] focus:outline-none">
                      {showRegConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <p className="text-[11px] leading-relaxed text-[#717171]">
                Bằng cách chọn Đồng ý và tiếp tục, tôi đồng ý với các <Link href="#" className="font-semibold text-[#222] underline">Điều khoản</Link> của GoStay.
              </p>

              <Button disabled={loading} type="submit" className="mt-2 h-12 w-full rounded-lg bg-[#FF5A5F] text-base font-semibold text-white transition-colors hover:bg-[#E35054] active:scale-[0.98]">
                {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
              </Button>
            </form>
          )}

          <div className="my-6 flex items-center justify-between">
            <div className="h-px w-full bg-[#DDDDDD]"></div>
            <span className="px-4 text-xs font-normal text-[#717171]">hoặc</span>
            <div className="h-px w-full bg-[#DDDDDD]"></div>
          </div>

          <div className="space-y-4">
            <button type="button" className="flex h-12 w-full items-center justify-between rounded-lg border border-[#222222] bg-white px-5 text-sm font-semibold transition-colors hover:bg-[#F7F7F7]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="flex-1 text-center">Tiếp tục với Google</span>
            </button>

            <button type="button" className="flex h-12 w-full items-center justify-between rounded-lg border border-[#222222] bg-white px-5 text-sm font-semibold transition-colors hover:bg-[#F7F7F7]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="flex-1 text-center">Tiếp tục với Facebook</span>
            </button>
          </div>

          <div className="mt-6 text-center text-sm">
            {view === "login" ? (
              <>
                <span>Chưa có tài khoản? </span>
                <button type="button" onClick={() => setView("register")} className="font-semibold underline transition-colors hover:text-[#717171]">
                  Đăng ký ngay
                </button>
              </>
            ) : (
              <>
                <span>Đã có tài khoản? </span>
                <button type="button" onClick={() => setView("login")} className="font-semibold underline transition-colors hover:text-[#717171]">
                  Đăng nhập
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
