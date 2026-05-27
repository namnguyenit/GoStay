"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  User, 
  Key, 
  Briefcase, 
  Upload, 
  CheckCircle, 
  Building2, 
  ShieldAlert, 
  AlertCircle,
  Phone,
  Calendar,
  Mail,
  UserCheck
} from "lucide-react";
import { UserServices } from "@/services";
import AuthService from "@/services/auth.service";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<"profile" | "upgrade" | "settings">("profile");

  // User State
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    avatarUrl: "",
  });

  // Profiles detail (if host/enterprise)
  const [hostProfile, setHostProfile] = useState<any>(null);
  const [enterpriseProfile, setEnterpriseProfile] = useState<any>(null);

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

  // Form states - Host Upgrade
  const [hostForm, setHostForm] = useState({
    fullName: "",
    phoneNumber: "",
    cccdNumber: "",
    bankAccount: "",
    bankName: "",
  });
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);

  // Form states - Enterprise Upgrade
  const [entForm, setEntForm] = useState({
    companyName: "",
    companyAddress: "",
    taxCode: "",
    representativeName: "",
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

      // 3. If user has HOST role, fetch host profile
      const roles = AuthService.getUserRoles();
      if (roles.includes("HOST")) {
        try {
          const hostRes = await UserServices.getHostProfile();
          if (hostRes && hostRes.data) {
            setHostProfile(hostRes.data);
          }
        } catch (e) {
          console.error("Could not fetch Host profile", e);
        }
      }

      // 4. If user has ENTERPRISE role, fetch enterprise profile
      if (roles.includes("ENTERPRISE")) {
        try {
          const entRes = await UserServices.getEnterpriseProfile();
          if (entRes && entRes.data) {
            setEnterpriseProfile(entRes.data);
          }
        } catch (e) {
          console.error("Could not fetch Enterprise profile", e);
        }
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
    fetchData();
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
    } catch (err: any) {
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
    } catch (err: any) {
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
    } catch (err: any) {
      triggerBanner("error", "Không thể cập nhật mật khẩu.");
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Submit Host Upgrade Application
  const handleApplyHost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontImage || !backImage) {
      triggerBanner("error", "Vui lòng tải lên cả ảnh mặt trước và mặt sau CCCD!");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("fullName", hostForm.fullName);
      formData.append("phoneNumber", hostForm.phoneNumber);
      formData.append("cccdNumber", hostForm.cccdNumber);
      formData.append("bankAccount", hostForm.bankAccount);
      formData.append("bankName", hostForm.bankName);
      formData.append("frontImage", frontImage);
      formData.append("backImage", backImage);

      await UserServices.upgradeToHost(formData);
      triggerBanner("success", "Yêu cầu nâng cấp lên HOST đã được gửi thành công!");
      fetchData();
    } catch (err: any) {
      triggerBanner("error", "Không thể gửi yêu cầu nâng cấp HOST. Có thể bạn đang có hồ sơ chờ duyệt.");
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Submit Enterprise Upgrade Application
  const handleApplyEnterprise = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await UserServices.upgradeToEnterprise(entForm);
      triggerBanner("success", "Yêu cầu nâng cấp lên DOANH NGHIỆP đã gửi thành công!");
      fetchData();
    } catch (err: any) {
      triggerBanner("error", "Gửi yêu cầu nâng cấp Enterprise thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="center h-[80vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-app-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Đang tải cấu hình cài đặt...</p>
        </div>
      </div>
    );
  }

  const userRoles = AuthService.getUserRoles();
  const hasHost = userRoles.includes("HOST");
  const hasEnterprise = userRoles.includes("ENTERPRISE");

  const hostApproval = currentUser?.hostProfile?.approvalStatus;
  const enterpriseApproval = currentUser?.enterpriseProfile?.approvalStatus;

  const isHostPending = hostApproval === "PENDING";
  const isEnterprisePending = enterpriseApproval === "PENDING";

  return (
    <div className="min-h-screen bg-[#0a0a14] text-gray-100 py-12 px-4 sm:px-6 lg:px-8 animate-smooth-appear">
      <div className="max-w-4xl mx-auto">
        
        {/* Banner Notifications */}
        {banner && (
          <div 
            className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl transition-all duration-300 border ${
              banner.type === "success" 
                ? "bg-green-950/80 border-green-500 text-green-200" 
                : "bg-red-950/80 border-red-500 text-red-200"
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
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Cài đặt Tài khoản</h1>
            <p className="text-sm text-gray-400 mt-1">Quản lý hồ sơ cá nhân, nâng cấp đối tác và bảo mật tài khoản của bạn.</p>
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
                  : "text-gray-400 hover:text-white hover:bg-white/5"
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
                  : "text-gray-400 hover:text-white hover:bg-white/5"
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
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Key className="h-4 w-4" />
              Bảo mật & Mật khẩu
            </button>
          </div>

          {/* Main Card Panel */}
          <div className="md:col-span-3 bg-[#11111f] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Soft decorative glow */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-app-primary/5 rounded-full blur-[100px] pointer-events-none" />

            {/* TAB 1: Profile Details */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Thông tin cá nhân</h3>
                  <p className="text-xs text-gray-400 mt-1">Cập nhật ảnh đại diện và hồ sơ liên hệ cơ bản của bạn.</p>
                </div>

                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {profile.avatarUrl ? (
                      <img 
                        src={profile.avatarUrl} 
                        alt="avatar" 
                        className="w-24 h-24 rounded-full object-cover border border-white/10 group-hover:opacity-85 transition-opacity" 
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-app-primary/10 border border-app-primary/20 flex items-center justify-center text-app-primary text-2xl font-bold group-hover:bg-app-primary/20 transition-all">
                        {currentUser?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <Upload className="h-6 w-6 text-white" />
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
                    <h4 className="text-sm font-semibold text-white">Ảnh đại diện</h4>
                    <p className="text-xs text-gray-400 mt-1 mb-3">Nhấp vào ảnh để tải lên ảnh mới. Định dạng hỗ trợ: JPG, PNG.</p>
                    <Button 
                      onClick={() => fileInputRef.current?.click()} 
                      variant="secondary" 
                      className="text-xs px-3 py-1.5 h-auto bg-white/5 border-white/10 text-white hover:bg-white/10"
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
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Họ và tên</label>
                      <input 
                        type="text" 
                        required 
                        value={profileForm.fullName} 
                        onChange={e => setProfileForm({...profileForm, fullName: e.target.value})}
                        className="w-full bg-[#16162a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-app-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Số điện thoại</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
                        <input 
                          type="text" 
                          required 
                          value={profileForm.phoneNumber} 
                          onChange={e => setProfileForm({...profileForm, phoneNumber: e.target.value})}
                          className="w-full bg-[#16162a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-app-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Ngày sinh</label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
                        <input 
                          type="text" 
                          placeholder="YYYY-MM-DD" 
                          value={profileForm.dateOfBirth} 
                          onChange={e => setProfileForm({...profileForm, dateOfBirth: e.target.value})}
                          className="w-full bg-[#16162a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-app-primary transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Địa chỉ Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-600" />
                        <input 
                          type="text" 
                          disabled 
                          value={currentUser?.email || "—"}
                          className="w-full bg-[#16162a]/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
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
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Nâng cấp Đối tác</h3>
                  <p className="text-xs text-gray-400 mt-1">Đăng ký trở thành đối tác cá nhân (HOST) hoặc đối tác doanh nghiệp (ENTERPRISE) để bắt đầu kinh doanh.</p>
                </div>

                {/* Case 1: Already a HOST */}
                {hasHost && (
                  <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-6 w-6 text-emerald-400" />
                      <div>
                        <h4 className="text-sm font-semibold text-white">Bạn đang là HOST của hệ thống</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Hồ sơ đối tác cá nhân của bạn đã được kiểm duyệt hoạt động.</p>
                      </div>
                    </div>
                    {hostProfile && (
                      <div className="grid grid-cols-2 gap-3 text-xs bg-black/20 p-4 rounded-lg border border-white/5 mt-2">
                        <div><span className="text-gray-400">Họ và tên:</span> <span className="font-semibold text-white">{hostProfile.fullName || "—"}</span></div>
                        <div><span className="text-gray-400">Số CCCD:</span> <span className="font-semibold text-white">{hostProfile.cccdNumber || "—"}</span></div>
                        <div><span className="text-gray-400">Ngân hàng:</span> <span className="font-semibold text-white">{hostProfile.bankName || "—"}</span></div>
                        <div><span className="text-gray-400">Số tài khoản:</span> <span className="font-semibold text-white">{hostProfile.bankAccount || "—"}</span></div>
                      </div>
                    )}
                    
                    <div className="bg-yellow-950/20 border border-yellow-500/10 rounded-lg p-3.5 flex gap-2">
                      <ShieldAlert className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-yellow-200">
                        <strong>Quy tắc loại trừ:</strong> Do đã là đối tác HOST (Cá nhân), bạn không được phép nâng cấp lên đối tác ENTERPRISE (Doanh nghiệp).
                      </p>
                    </div>
                  </div>
                )}

                {/* Case 2: Already an ENTERPRISE */}
                {hasEnterprise && (
                  <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-6 w-6 text-emerald-400" />
                      <div>
                        <h4 className="text-sm font-semibold text-white">Bạn đang là DOANH NGHIỆP của hệ thống</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Hồ sơ đối tác pháp nhân doanh nghiệp đã được kiểm duyệt hoạt động.</p>
                      </div>
                    </div>
                    {enterpriseProfile && (
                      <div className="grid grid-cols-2 gap-3 text-xs bg-black/20 p-4 rounded-lg border border-white/5 mt-2">
                        <div><span className="text-gray-400">Tên doanh nghiệp:</span> <span className="font-semibold text-white">{enterpriseProfile.companyName || "—"}</span></div>
                        <div><span className="text-gray-400">Mã số thuế:</span> <span className="font-semibold text-white">{enterpriseProfile.taxCode || "—"}</span></div>
                        <div><span className="text-gray-400">Đại diện pháp luật:</span> <span className="font-semibold text-white">{enterpriseProfile.representativeName || "—"}</span></div>
                        <div className="col-span-2"><span className="text-gray-400">Địa chỉ trụ sở:</span> <span className="font-semibold text-white">{enterpriseProfile.companyAddress || "—"}</span></div>
                      </div>
                    )}
                    
                    <div className="bg-yellow-950/20 border border-yellow-500/10 rounded-lg p-3.5 flex gap-2">
                      <ShieldAlert className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-yellow-200">
                        <strong>Quy tắc loại trừ:</strong> Do đã là đối tác ENTERPRISE (Doanh nghiệp), bạn không được phép nâng cấp lên đối tác HOST (Cá nhân).
                      </p>
                    </div>
                  </div>
                )}

                {/* Case 3: Regular USER - Show both options or Pending states */}
                {!hasHost && !hasEnterprise && (
                  <div className="space-y-8">
                    {/* Show Pending Host Notification */}
                    {isHostPending && (
                      <div className="bg-yellow-950/30 border border-yellow-500/20 rounded-xl p-5 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-6 w-6 text-yellow-400" />
                          <div>
                            <h4 className="text-sm font-semibold text-white">Yêu cầu nâng cấp HOST đang chờ phê duyệt</h4>
                            <p className="text-xs text-gray-400 mt-0.5">Chúng tôi đang xác minh thông tin giấy tờ tùy thân của bạn. Vui lòng quay lại sau.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show Pending Enterprise Notification */}
                    {isEnterprisePending && (
                      <div className="bg-yellow-950/30 border border-yellow-500/20 rounded-xl p-5 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-6 w-6 text-yellow-400" />
                          <div>
                            <h4 className="text-sm font-semibold text-white">Yêu cầu nâng cấp DOANH NGHIỆP đang chờ phê duyệt</h4>
                            <p className="text-xs text-gray-400 mt-0.5">Hồ sơ pháp lý doanh nghiệp của bạn đang được kiểm duyệt.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isHostPending && !isEnterprisePending && (
                      <>
                        {/* HOST application form */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 sm:p-6 space-y-4">
                          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                            <User className="h-5 w-5 text-app-primary" />
                            <div>
                              <h4 className="text-sm font-semibold text-white">Đăng ký Đối tác cá nhân (HOST)</h4>
                              <p className="text-[11px] text-gray-400">Kinh doanh bất động sản, phòng nghỉ dưới tư cách cá nhân.</p>
                            </div>
                          </div>

                          {hostApproval === "REJECTED" && (
                            <div className="bg-red-950/20 border border-red-500/20 rounded-lg p-3 flex gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-red-200">
                                Yêu cầu nâng cấp HOST trước đây của bạn đã bị từ chối. Vui lòng gửi lại hồ sơ chính xác.
                              </p>
                            </div>
                          )}

                          <form onSubmit={handleApplyHost} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2">Họ tên trên CCCD</label>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="NGUYEN VAN A"
                                  value={hostForm.fullName} 
                                  onChange={e => setHostForm({...hostForm, fullName: e.target.value})}
                                  className="w-full bg-[#16162a] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-app-primary transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2">Số điện thoại liên hệ</label>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="09XXXXXXXX"
                                  value={hostForm.phoneNumber} 
                                  onChange={e => setHostForm({...hostForm, phoneNumber: e.target.value})}
                                  className="w-full bg-[#16162a] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-app-primary transition-all"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2">Số CCCD / Hộ chiếu</label>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="037XXXXXXXXX"
                                  value={hostForm.cccdNumber} 
                                  onChange={e => setHostForm({...hostForm, cccdNumber: e.target.value})}
                                  className="w-full bg-[#16162a] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-app-primary transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2">Tên ngân hàng thụ hưởng</label>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="Vietcombank, MB..."
                                  value={hostForm.bankName} 
                                  onChange={e => setHostForm({...hostForm, bankName: e.target.value})}
                                  className="w-full bg-[#16162a] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-app-primary transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2">Số tài khoản ngân hàng</label>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="102XXXXXXXX"
                                  value={hostForm.bankAccount} 
                                  onChange={e => setHostForm({...hostForm, bankAccount: e.target.value})}
                                  className="w-full bg-[#16162a] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-app-primary transition-all"
                                />
                              </div>
                            </div>

                            {/* File Upload fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-[#16162a]/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                                <Upload className="h-5 w-5 text-gray-500 mb-2" />
                                <label className="block text-xs font-semibold text-gray-300 cursor-pointer">
                                  {frontImage ? frontImage.name : "Tải ảnh CCCD mặt trước"}
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={e => setFrontImage(e.target.files?.[0] || null)} 
                                  />
                                </label>
                              </div>
                              <div className="bg-[#16162a]/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                                <Upload className="h-5 w-5 text-gray-500 mb-2" />
                                <label className="block text-xs font-semibold text-gray-300 cursor-pointer">
                                  {backImage ? backImage.name : "Tải ảnh CCCD mặt sau"}
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={e => setBackImage(e.target.files?.[0] || null)} 
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="flex justify-end pt-2">
                              <Button 
                                type="submit" 
                                className="bg-app-primary hover:bg-app-primary/90 text-xs px-5 py-2 h-auto"
                                disabled={submitting}
                              >
                                Gửi yêu cầu HOST
                              </Button>
                            </div>
                          </form>
                        </div>

                        {/* ENTERPRISE application form */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 sm:p-6 space-y-4">
                          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                            <Building2 className="h-5 w-5 text-app-primary" />
                            <div>
                              <h4 className="text-sm font-semibold text-white">Đăng ký Đối tác doanh nghiệp (ENTERPRISE)</h4>
                              <p className="text-[11px] text-gray-400">Kinh doanh phòng nghỉ, các gói trải nghiệm dưới tư cách pháp nhân công ty.</p>
                            </div>
                          </div>

                          {enterpriseApproval === "REJECTED" && (
                            <div className="bg-red-950/20 border border-red-500/20 rounded-lg p-3 flex gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-red-200">
                                Yêu cầu nâng cấp DOANH NGHIỆP trước đây của bạn đã bị từ chối. Vui lòng gửi lại hồ sơ chính xác.
                              </p>
                            </div>
                          )}

                          <form onSubmit={handleApplyEnterprise} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2">Tên công ty doanh nghiệp</label>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="CÔNG TY TNHH GOSTAY VIỆT NAM"
                                  value={entForm.companyName} 
                                  onChange={e => setEntForm({...entForm, companyName: e.target.value})}
                                  className="w-full bg-[#16162a] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-app-primary transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2">Người đại diện pháp luật</label>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="NGUYEN VAN A"
                                  value={entForm.representativeName} 
                                  onChange={e => setEntForm({...entForm, representativeName: e.target.value})}
                                  className="w-full bg-[#16162a] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-app-primary transition-all"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="sm:col-span-1">
                                <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2">Mã số thuế Doanh nghiệp</label>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="MST-XXXXXXXX"
                                  value={entForm.taxCode} 
                                  onChange={e => setEntForm({...entForm, taxCode: e.target.value})}
                                  className="w-full bg-[#16162a] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-app-primary transition-all"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2">Địa chỉ trụ sở chính</label>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="Số 1, Đường Trần Hưng Đạo, Hà Nội"
                                  value={entForm.companyAddress} 
                                  onChange={e => setEntForm({...entForm, companyAddress: e.target.value})}
                                  className="w-full bg-[#16162a] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-app-primary transition-all"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end pt-2">
                              <Button 
                                type="submit" 
                                className="bg-app-primary hover:bg-app-primary/90 text-xs px-5 py-2 h-auto"
                                disabled={submitting}
                              >
                                Gửi yêu cầu ENTERPRISE
                              </Button>
                            </div>
                          </form>
                        </div>
                      </>
                    )}

                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Security & Password */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Bảo mật & Mật khẩu</h3>
                  <p className="text-xs text-gray-400 mt-1">Đổi mật khẩu tài khoản để tăng tính bảo mật.</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Mật khẩu mới</label>
                    <input 
                      type="password" 
                      required 
                      value={passwordForm.newPassword} 
                      onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full bg-[#16162a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-app-primary transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Xác nhận mật khẩu mới</label>
                    <input 
                      type="password" 
                      required 
                      value={passwordForm.confirmPassword} 
                      onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full bg-[#16162a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-app-primary transition-all"
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
