"use client";

import { useEffect, useState } from "react";
import AdminService from "@/services/admin.service";
import Link from "next/link";
import AuthService from "@/services/auth.service";

interface Stats {
  totalUsers: number;
  pendingHosts: number;
  totalHosts: number;
  pendingLandmarks: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    pendingHosts: 0,
    totalHosts: 0,
    pendingLandmarks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [usersRes, pendingHostsRes, allHostsRes, landmarksRes] = await Promise.allSettled([
          AdminService.getUsers(0, 5),
          AdminService.getPendingHosts(0, 1),
          AdminService.getAllHosts(0, 1),
          AdminService.getLandmarkSuggestions("PENDING", 0, 1),
        ]);

        if (usersRes.status === "fulfilled" && usersRes.value?.data) {
          const d = usersRes.value.data;
          setStats((s) => ({
            ...s,
            totalUsers: d.totalElements ?? d.content?.length ?? 0,
          }));
          setRecentUsers(d.content?.slice(0, 5) ?? []);
        }
        if (pendingHostsRes.status === "fulfilled" && pendingHostsRes.value?.data) {
          setStats((s) => ({
            ...s,
            pendingHosts: pendingHostsRes.value.data.totalElements ?? 0,
          }));
        }
        if (allHostsRes.status === "fulfilled" && allHostsRes.value?.data) {
          setStats((s) => ({
            ...s,
            totalHosts: allHostsRes.value.data.totalElements ?? 0,
          }));
        }
        if (landmarksRes.status === "fulfilled" && landmarksRes.value?.data) {
          setStats((s) => ({
            ...s,
            pendingLandmarks: landmarksRes.value.data.totalElements ?? 0,
          }));
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    const user = AuthService.getCurrentUser();
    if (user?.username) setAdminName(user.username);
  }, []);

  const statCards = [
    {
      label: "Người dùng đăng ký",
      value: stats.totalUsers,
      subtext: "Tổng số thành viên",
      trend: "+12.5%",
      trendColor: "text-emerald-600 bg-emerald-50/60 border-emerald-100/50",
      detail: "Hoạt động: 94% • Khóa: 6%",
      href: "/admin/users",
      iconBg: "bg-blue-50/80 text-blue-500 border border-blue-100/30",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    },
    {
      label: "Host Đã duyệt",
      value: stats.totalHosts,
      subtext: "Đối tác hoạt động",
      trend: "+4.2%",
      trendColor: "text-emerald-600 bg-emerald-50/60 border-emerald-100/50",
      detail: "Khách sạn: 65% • Homestay: 35%",
      href: "/admin/approved-hosts",
      iconBg: "bg-teal-50/80 text-teal-600 border border-teal-100/30",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    },
    {
      label: "Host Chờ duyệt",
      value: stats.pendingHosts,
      subtext: "Yêu cầu đăng ký mới",
      trend: "Cần xử lý",
      trendColor: "text-amber-600 bg-amber-50/60 border-amber-100/50",
      detail: `${stats.pendingHosts} yêu cầu mới chờ phản hồi`,
      href: "/admin/hosts",
      iconBg: "bg-amber-50/80 text-amber-500 border border-amber-100/30",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: "Đề xuất Địa danh",
      value: stats.pendingLandmarks,
      subtext: "Đang chờ duyệt",
      trend: "Mới nhận",
      trendColor: "text-rose-600 bg-rose-50/60 border-rose-100/50",
      detail: `${stats.pendingLandmarks} đề xuất địa điểm tham quan`,
      href: "/admin/landmarks",
      iconBg: "bg-rose-50/80 text-rose-500 border border-rose-100/30",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
  ];
  
  return (
    <div className="space-y-6 max-w-[1400px] animate-smooth-appear">
      
      {/* Page Title & Subtitle for Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Tổng quan hệ thống</h2>
          <p className="text-slate-400 text-xs mt-0.5 font-medium">Thống kê hoạt động nền tảng GoStay & thông tin đối tác</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-55/10 text-emerald-600 rounded-full text-xs font-semibold border border-emerald-100/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Hệ thống: Hoạt động ổn định
        </div>
      </div>

      {/* Main Grid Layout matching the reference CrewMate design */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left & Center Main Area (Span 2) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Card 1: Doanh thu & Hoa hồng (Monthly Payroll style) */}
          <div className="bg-white rounded-[20px] border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-base text-slate-800 tracking-tight">Doanh thu & Hoa hồng</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Biến động doanh thu phòng & đối soát hoa hồng</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 text-left sm:text-right">
                <div>
                  <div className="flex items-center gap-1.5 sm:justify-end">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]"></div>
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Doanh thu đối tác</span>
                  </div>
                  <div className="text-base font-semibold text-slate-850 flex items-center gap-1.5 mt-0.5 sm:justify-end">
                    85,270,000đ
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50/60 border border-emerald-100/50 px-1 py-0.2 rounded">↑ 8%</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 sm:justify-end">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#60a5fa]"></div>
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Hoa hồng GoStay</span>
                  </div>
                  <div className="text-base font-semibold text-slate-850 flex items-center gap-1.5 mt-0.5 sm:justify-end">
                    4,480,000đ
                    <span className="text-[9px] font-bold text-rose-600 bg-rose-50/60 border border-rose-100/50 px-1 py-0.2 rounded">↓ 3%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dot Chart SVG */}
            <div className="h-[120px] w-full mt-6 bg-slate-50/30 rounded-xl border border-slate-100/50 p-2 relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 500 80" preserveAspectRatio="none">
                {/* Vertical grid lines */}
                {Array.from({ length: 11 }).map((_, idx) => {
                  const x = 20 + idx * 46;
                  return (
                    <g key={idx}>
                      <line x1={x} y1="0" x2={x} y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                      {/* Purple scatter dots (indigo-500) */}
                      <circle cx={x} cy={15 + (idx % 3) * 18 + (idx % 2) * 5} r="3.5" fill="#6366f1" />
                      {/* Light blue scatter dots (blue-450) */}
                      <circle cx={x} cy={30 + (idx % 2) * 22 + (idx % 3) * 4} r="3.5" fill="#60a5fa" opacity="0.6" />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Card 2: Hiệu suất đặt phòng (Work Hours Tracked style) */}
          <div className="bg-white rounded-[20px] border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <div>
                  <h3 className="font-semibold text-base text-slate-800 tracking-tight">Hiệu suất đặt phòng</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">Tần suất giao dịch đặt phòng thành công</p>
                </div>
                
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-semibold text-slate-800">12.5 phòng</span>
                      <span className="text-xs text-slate-450">/ ngày</span>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-1.5 py-0.5 rounded inline-block mt-1">
                      ↑ 8% so với hôm qua
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-semibold text-slate-800">88 phòng</span>
                      <span className="text-xs text-slate-450">/ tuần</span>
                    </div>
                    <div className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100/50 px-1.5 py-0.5 rounded inline-block mt-1">
                      ↓ 8% so với tuần trước
                    </div>
                  </div>
                </div>
              </div>

              {/* Orange Bar Chart SVG (Spans 2 columns) */}
              <div className="md:col-span-2 h-[130px] flex items-end bg-slate-50/30 rounded-xl border border-slate-100/50 p-2 relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 320 100" preserveAspectRatio="none">
                  <line x1="0" y1="50" x2="320" y2="50" stroke="#f8fafc" strokeWidth="1" strokeDasharray="4 4" />
                  {Array.from({ length: 30 }).map((_, idx) => {
                    const w = 4;
                    const spacing = 6;
                    const x = idx * (w + spacing) + 12;
                    const h = 20 + Math.sin(idx * 0.4) * 22 + Math.cos(idx * 0.25) * 18 + (idx % 5) * 6;
                    return (
                      <rect
                        key={idx}
                        x={x}
                        y={100 - h}
                        width={w}
                        height={h}
                        rx={2}
                        fill="#f97316"
                        opacity="0.85"
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3: Lịch trình duyệt & Hoạt động (Schedule style) */}
          <div className="bg-white rounded-[20px] border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-base text-slate-800 tracking-tight">Lịch duyệt & Hoạt động</h3>
              <button className="text-slate-400 hover:text-slate-650">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </button>
            </div>

            {/* Search bar wrapper */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm lịch biểu, hoạt động quản trị..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50/80 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white focus:border-slate-200 transition-all"
              />
              <svg className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-slate-500">Hôm nay, {new Date().toLocaleDateString("vi-VN", { day: "numeric", month: "long" })}</span>
              <div className="flex items-center gap-1 bg-slate-50/80 p-0.5 rounded-lg border border-slate-150">
                <button className="px-2.5 py-1 rounded bg-white text-slate-800 text-[10px] font-bold shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-100">Danh sách</button>
                <button className="px-2.5 py-1 rounded text-slate-400 text-[10px] font-medium hover:text-slate-855 transition-colors">Lịch biểu</button>
              </div>
            </div>

            {/* Event Highlight Item */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/60 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">Tiêu điểm hôm nay</div>
                <p className="text-[13px] font-semibold text-slate-700">Duyệt yêu cầu đăng ký Host từ doanh nghiệp mới — trước 17:00</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-50/80 flex items-center justify-center text-blue-500 border border-blue-100/30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            </div>
          </div>

          {/* Card 4: Recent Users Table */}
          <div className="bg-white rounded-[20px] border border-slate-100 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between p-5 pb-3 border-b border-slate-50">
              <div>
                <h3 className="font-semibold text-base text-slate-800 tracking-tight">Thành viên mới đăng ký</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Danh sách thành viên hệ thống mới cập nhật</p>
              </div>
              <Link href="/admin/users" className="text-xs text-blue-600 font-semibold hover:bg-blue-50/50 px-3 py-1.5 rounded-full transition-colors border border-blue-50">
                Xem tất cả
              </Link>
            </div>
            <div className="p-3">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2.5">Người dùng</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2.5">Email</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2.5 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={3} className="px-4 py-4.5">
                          <div className="h-4 bg-slate-50 animate-pulse rounded" />
                        </td>
                      </tr>
                    ))
                  ) : recentUsers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-xs text-slate-400 font-medium">
                        Chưa có thành viên nào hoạt động.
                      </td>
                    </tr>
                  ) : (
                    recentUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-50/60 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100/20">
                              {u.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-800 text-[13px]">{u.username}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-slate-450 text-[13px] font-medium">{u.email}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                              u.isActive
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                                : "bg-rose-50 text-rose-600 border-rose-100/50"
                            }`}
                          >
                            {u.isActive ? "Hoạt động" : "Bị khóa"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Area (Span 1) */}
        <div className="space-y-6">
          
          {/* Side by side small stats */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Stat 1: Total Users */}
            <Link href="/admin/users" className="block bg-white p-4.5 rounded-[20px] border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-slate-200/60 hover:shadow-[0_8px_20px_rgba(0,0,0,0.03)] transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Thành viên</span>
              <div className="flex justify-between items-center mt-3">
                <span className="text-xl font-semibold text-slate-800">{loading ? "..." : stats.totalUsers}</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100/20">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
              </div>
            </Link>

            {/* Stat 2: Pending Hosts */}
            <Link href="/admin/hosts" className="block bg-white p-4.5 rounded-[20px] border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-slate-200/60 hover:shadow-[0_8px_20px_rgba(0,0,0,0.03)] transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Yêu cầu Host</span>
              <div className="flex justify-between items-center mt-3">
                <span className="text-xl font-semibold text-slate-800">{loading ? "..." : stats.pendingHosts}</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100/20">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
            </Link>

          </div>

          {/* Card 2: Khu vực đối tác (Workforce Location Stats style) */}
          <div className="bg-white rounded-[20px] border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <h3 className="font-semibold text-base text-slate-800 tracking-tight">Khu vực đối tác</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Mật độ đối tác hoạt động trên GoStay</p>

            {/* Side-by-side location totals */}
            <div className="flex items-center gap-6 mt-4">
              <div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase">TP. Hồ Chí Minh</div>
                <div className="text-lg font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  100
                  <span className="w-4 h-4 rounded bg-blue-50 text-blue-600 text-[10px] flex items-center justify-center border border-blue-100/20">🏢</span>
                </div>
              </div>
              
              <div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Hà Nội</div>
                <div className="text-lg font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  120
                  <span className="w-4 h-4 rounded bg-slate-50 text-slate-655 text-[10px] flex items-center justify-center border border-slate-200/40">🏛️</span>
                </div>
              </div>
            </div>

            {/* Matrix grid of dots matching the image */}
            <div className="grid grid-cols-8 gap-2.5 mt-5">
              {Array.from({ length: 48 }).map((_, idx) => {
                let bgClass = "bg-slate-100";
                if (idx % 7 === 0) bgClass = "bg-blue-600";
                else if (idx % 5 === 0) bgClass = "bg-blue-500";
                else if (idx % 3 === 0) bgClass = "bg-blue-400";
                else if (idx % 2 === 0) bgClass = "bg-blue-100";
                
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full ${bgClass} transition-transform hover:scale-110`}
                    title={`Vùng mật độ ${idx}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Card 3: Tài khoản Admin (Profile style) */}
          <div className="bg-slate-50/60 rounded-[20px] border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
                alt="Admin Avatar"
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-semibold text-sm text-slate-850 capitalize leading-none">{adminName || "Quản trị viên"}</h4>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Hệ thống quản trị GoStay</p>
                
                <span className="inline-block mt-1.5 text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100/50 px-2 py-0.5 rounded-full">
                  Độ ổn định: 99.9%
                </span>
              </div>
            </div>

            {/* Small stats summary widgets under profile */}
            <div className="grid grid-cols-2 gap-3.5">
              <Link href="/admin/payouts" className="bg-white p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors block">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Yêu cầu Payout</span>
                <div className="text-xs font-semibold text-slate-700 mt-1 flex items-baseline gap-1">
                  8 yêu cầu
                  <span className="text-[9px] text-rose-500 font-bold">↓ 4%</span>
                </div>
              </Link>
              <Link href="/admin/landmarks" className="bg-white p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors block">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Đề xuất địa danh</span>
                <div className="text-xs font-semibold text-slate-700 mt-1 flex items-baseline gap-1">
                  {stats.pendingLandmarks} đề xuất
                  <span className="text-[9px] text-emerald-500 font-bold">↑ 8%</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Task Actions Panel */}
          <div className="bg-white rounded-[20px] border border-slate-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
            <div>
              <h3 className="font-semibold text-base text-slate-800 tracking-tight">Tác vụ khẩn</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Báo cáo phê duyệt các mục tồn đọng</p>
            </div>
            
            <div className="space-y-2.5">
              <Link
                href="/admin/hosts"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100/30">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-slate-700 group-hover:text-amber-700 transition-colors">Duyệt Host mới</div>
                    <div className="text-[10px] text-slate-400 font-medium">Host đang chờ</div>
                  </div>
                </div>
                {stats.pendingHosts > 0 && (
                  <span className="bg-amber-50 text-amber-600 border border-amber-100/50 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {stats.pendingHosts}
                  </span>
                )}
              </Link>

              <Link
                href="/admin/payouts"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100/30">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors">Chuyển Payout</div>
                    <div className="text-[10px] text-slate-400 font-medium">Hoa hồng host</div>
                  </div>
                </div>
                <span className="text-emerald-600 border border-emerald-100/50 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Có sẵn</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
