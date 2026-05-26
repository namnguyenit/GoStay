"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await AuthService.login({ username, password });
      
      const roles = AuthService.getUserRoles();
      if (roles.includes("ROLE_ADMIN")) {
        router.push("/admin");
      } else if (roles.includes("ROLE_HOST")) {
        router.push("/host");
      } else {
        router.push("/");
      }
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

  return (
    <div className="flex min-h-[100dvh] font-sans text-[#222222] bg-white">
      {/* Left Column: Background Image */}
      <div 
        className="fixed inset-y-0 left-0 hidden w-1/2 bg-cover bg-center lg:block" 
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-0 left-0 p-10">
          <h2 className="text-3xl font-bold leading-tight text-white drop-shadow-md">
            Khám phá những điểm đến<br/>tuyệt vời nhất cùng GoStay.
          </h2>
          <p className="mt-2 text-base text-white/90 drop-shadow">Hơn 10,000 chỗ ở trên toàn thế giới đang chờ đón bạn.</p>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-white p-4 sm:p-8 lg:ml-[50%] lg:w-1/2">
        <div className="w-full max-w-[400px] animate-smooth-appear py-8">
          {/* Mobile Logo */}
          <div className="mb-6 lg:hidden">
            <h1 className="text-2xl font-bold tracking-tighter text-[#FF5A5F]">GoStay</h1>
          </div>
          
          <h2 className="mb-1 text-2xl font-bold tracking-tight">Chào mừng bạn trở lại</h2>
          <p className="mb-6 text-sm text-[#717171]">Vui lòng điền thông tin để đăng nhập vào tài khoản của bạn.</p>
          
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-3">
              {/* Username Input */}
              <div>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="peer w-full rounded-lg border border-[#B0B0B0] bg-white px-3 pb-1 pt-5 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-70 focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
                    placeholder=" "
                  />
                  <label
                    htmlFor="username"
                    className="pointer-events-none absolute left-3 top-1.5 z-10 origin-[0] transform text-[11px] text-[#717171] duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px]"
                  >
                    Tên đăng nhập
                  </label>
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="peer w-full rounded-lg border border-[#B0B0B0] bg-white px-3 pb-1 pt-5 pr-10 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-70 focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
                    placeholder=" "
                  />
                  <label
                    htmlFor="password"
                    className="pointer-events-none absolute left-3 top-1.5 z-10 origin-[0] transform text-[11px] text-[#717171] duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px]"
                  >
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717171] hover:text-[#222222] focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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

            <Button disabled={loading} type="submit" className="mt-2 h-11 w-full rounded-lg bg-[#FF5A5F] text-sm font-semibold text-white transition-colors hover:bg-[#E35054] active:scale-[0.98]">
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>

          <div className="my-5 flex items-center justify-between">
            <div className="h-px w-full bg-[#DDDDDD]"></div>
            <span className="px-3 text-[11px] font-semibold uppercase text-[#717171]">hoặc</span>
            <div className="h-px w-full bg-[#DDDDDD]"></div>
          </div>

          <div className="space-y-3">
            <button type="button" className="flex h-11 w-full items-center justify-between rounded-lg border border-[#222222] bg-white px-4 text-sm font-semibold transition-colors hover:bg-[#F7F7F7] active:scale-[0.98]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Tiếp tục với Google</span>
              <div className="w-5"></div>
            </button>

            <button type="button" className="flex h-11 w-full items-center justify-between rounded-lg border border-[#222222] bg-white px-4 text-sm font-semibold transition-colors hover:bg-[#F7F7F7] active:scale-[0.98]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Tiếp tục với Facebook</span>
              <div className="w-5"></div>
            </button>
          </div>

          <div className="mt-6 text-center text-xs">
            <span>Chưa có tài khoản? </span>
            <Link href="/sign-up" className="font-semibold underline transition-colors hover:text-[#717171]">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}