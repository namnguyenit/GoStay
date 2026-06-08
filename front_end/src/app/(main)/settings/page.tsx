"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { 
  User, 
  Key, 
  Briefcase, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Calendar,
  Mail
} from "lucide-react";
import { UserServices } from "@/services";
import AuthService from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import UpgradeApplicationsPanel from "@/shared/components/UpgradeApplicationsPanel";

type CurrentUser = {
  username?: string;
  email?: string;
};

type UserProfile = {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
};

function SettingsContent() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<"profile" | "upgrade" | "settings">("profile");

  // User State
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    avatarUrl: "",
  });

  // Form states - Profile
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
  });

  // Form states - Password
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification Banners
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get auth details
      const user = AuthService.getCurrentUser();
      setCurrentUser(user);

      // 2. Fetch latest detailed profile
      const profRes = await UserServices.getMyProfile();
      if (profRes && profRes.data) {
        setProfile(profRes.data);
        setProfileForm({
          fullName: profRes.data.fullName || "",
          phoneNumber: profRes.data.phoneNumber || "",
          dateOfBirth: profRes.data.dateOfBirth || "",
        });
      }

    } catch (error) {
      console.error("Failed to load settings data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Determine initial tab from URL query params
    const tabParam = searchParams.get("tab");
    if (tabParam === "profile" || tabParam === "upgrade" || tabParam === "settings") {
      setActiveTab(tabParam);
    }
    // Refresh roles từ DB trước khi fetch data — đảm bảo settings hiển thị đúng
    // dù admin vừa nâng quyền mà user chưa logout
    if (AuthService.isAuthenticated()) {
      AuthService.refreshRoles().then(() => fetchData());
    } else {
      fetchData();
    }
  }, [searchParams]);

  // Show banner alert helper
  const triggerBanner = (type: "success" | "error", message: string) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 5000);
  };

  // 1. Save Profile Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Update detailed user profile
      await UserServices.updateMyProfile(profileForm);
      // Update basic info in identity database as well
      await UserServices.updateMyInfo({
        fullName: profileForm.fullName,
        phoneNumber: profileForm.phoneNumber,
      });

      // Update LocalStorage user_info by refetching basic info
      const infoRes = await UserServices.getMyInfo();
      if (infoRes && infoRes.data) {
        localStorage.setItem("user_info", JSON.stringify(infoRes.data));
      }

      triggerBanner("success", "Cập nhật hồ sơ cá nhân thành công!");
      fetchData();
    } catch {
      triggerBanner("error", "Lỗi cập nhật hồ sơ cá nhân.");
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Upload Avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubmitting(true);
    try {
      const res = await UserServices.uploadAvatar(file);
      if (res && res.data) {
        // Refetch and sync user_info to sync everywhere
        const infoRes = await UserServices.getMyInfo();
        if (infoRes && infoRes.data) {
          localStorage.setItem("user_info", JSON.stringify(infoRes.data));
        }
        triggerBanner("success", "Đã cập nhật ảnh đại diện mới!");
        fetchData();
      }
    } catch {
      triggerBanner("error", "Tải ảnh đại diện thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      triggerBanner("error", "Mật khẩu xác nhận không khớp!");
      return;
    }

    setSubmitting(true);
    try {
      await UserServices.updateMyInfo({
        password: passwordForm.newPassword,
      });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      triggerBanner("success", "Đổi mật khẩu tài khoản thành công!");
    } catch {
      triggerBanner("error", "Không thể cập nhật mật khẩu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="center h-[80vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-app-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Đang tải cấu hình cài đặt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 pt-28 pb-12 px-4 sm:px-6 lg:px-8 animate-smooth-appear">
      <div className="max-w-4xl mx-auto">
        
        {/* Banner Notifications */}
        {banner && (
          <div 
            className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl transition-all duration-300 border ${
              banner.type === "success" 
                ? "bg-emerald-100 dark:bg-green-950/80 border-emerald-300 dark:border-green-500 text-emerald-800 dark:text-green-200" 
                : "bg-rose-100 dark:bg-red-950/80 border-red-500 text-rose-800 dark:text-red-200"
            }`}
          >
            {banner.type === "success" ? <CheckCircle className="h-5 w-5 text-green-400" /> : <AlertCircle className="h-5 w-5 text-red-400" />}
            <span className="text-sm font-medium">{banner.message}</span>
          </div>
        )}

        {/* Page Title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-app-primary/10 rounded-xl border border-app-primary/20">
            <User className="h-8 w-8 text-app-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">Cài đặt Tài khoản</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Quản lý hồ sơ cá nhân, nâng cấp đối tác và bảo mật tài khoản của bạn.</p>
          </div>
        </div>

        {/* Layout: Sidebar + Main Content Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar Nav */}
          <div className="flex flex-col gap-2 md:col-span-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "profile" 
                  ? "bg-app-primary text-white shadow-lg shadow-app-primary/20" 
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:bg-white/5"
              }`}
            >
              <User className="h-4 w-4" />
              Hồ sơ cá nhân
            </button>
            
            <button
              onClick={() => setActiveTab("upgrade")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "upgrade" 
                  ? "bg-app-primary text-white shadow-lg shadow-app-primary/20" 
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:bg-white/5"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Nâng cấp Đối tác
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "settings" 
                  ? "bg-app-primary text-white shadow-lg shadow-app-primary/20" 
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:bg-white/5"
              }`}
            >
              <Key className="h-4 w-4" />
              Bảo mật & Mật khẩu
            </button>
          </div>

          {/* Main Card Panel */}
          <div className="md:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Soft decorative glow */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-app-primary/5 rounded-full blur-[100px] pointer-events-none" />

            {/* TAB 1: Profile Details */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Thông tin cá nhân</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Cập nhật ảnh đại diện và hồ sơ liên hệ cơ bản của bạn.</p>
                </div>

                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-200 dark:border-white/5">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {profile.avatarUrl ? (
                      <Image
                        unoptimized
                        src={profile.avatarUrl}
                        alt="avatar"
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-full border border-zinc-200 object-cover transition-opacity group-hover:opacity-85 dark:border-white/10"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-app-primary/10 border border-app-primary/20 flex items-center justify-center text-app-primary text-2xl font-bold group-hover:bg-app-primary/20 transition-all">
                        {currentUser?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <Upload className="h-6 w-6 text-zinc-900 dark:text-zinc-50" />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Ảnh đại diện</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-3">Nhấp vào ảnh để tải lên ảnh mới. Định dạng hỗ trợ: JPG, PNG.</p>
                    <Button 
                      onClick={() => fileInputRef.current?.click()} 
                      variant="secondary" 
                      className="text-xs px-3 py-1.5 h-auto bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-50 hover:bg-white/10"
                      disabled={submitting}
                    >
                      Chọn ảnh
                    </Button>
                  </div>
                </div>

                {/* Profile Edit Form */}
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">Họ và tên</label>
                      <input 
                        type="text" 
                        required 
                        value={profileForm.fullName} 
                        onChange={e => setProfileForm({...profileForm, fullName: e.target.value})}
                        className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-app-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">Số điện thoại</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                        <input 
                          type="text" 
                          required 
                          value={profileForm.phoneNumber} 
                          onChange={e => setProfileForm({...profileForm, phoneNumber: e.target.value})}
                          className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-app-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">Ngày sinh</label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                        <input 
                          type="text" 
                          placeholder="YYYY-MM-DD" 
                          value={profileForm.dateOfBirth} 
                          onChange={e => setProfileForm({...profileForm, dateOfBirth: e.target.value})}
                          className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-app-primary transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">Địa chỉ Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                        <input 
                          type="text" 
                          disabled 
                          value={currentUser?.email || "—"}
                          className="w-full bg-zinc-50 dark:bg-zinc-950/50/50 border border-zinc-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-app-primary hover:bg-app-primary/95 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-app-primary/20 transition-all"
                      disabled={submitting}
                    >
                      {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: Upgrade Account Portal */}
            {activeTab === "upgrade" && (
              <UpgradeApplicationsPanel onChanged={fetchData} />
            )}

            {/* TAB 3: Security & Password */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Bảo mật & Mật khẩu</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Đổi mật khẩu tài khoản để tăng tính bảo mật.</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">Mật khẩu mới</label>
                    <input 
                      type="password" 
                      required 
                      value={passwordForm.newPassword} 
                      onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-app-primary transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">Xác nhận mật khẩu mới</label>
                    <input 
                      type="password" 
                      required 
                      value={passwordForm.confirmPassword} 
                      onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-app-primary transition-all"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-app-primary hover:bg-app-primary/95 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-app-primary/20 transition-all"
                      disabled={submitting}
                    >
                      {submitting ? "Đang cập nhật..." : "Đổi mật khẩu"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-900 dark:text-zinc-50">Đang tải...</div>}>
      <SettingsContent />
    </Suspense>
  );
}

