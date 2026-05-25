"use client";

import { useEffect, useState } from "react";
import AdminService from "@/services/admin.service";
import Link from "next/link";

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
  }, []);

  // CoreUI colorful flat panels
  const statCards = [
    {
      label: "Người dùng đăng ký",
      value: stats.totalUsers,
      subtext: "Thành viên trực tuyến",
      href: "/admin/users",
      bgClass: "bg-[#20a8d8]", // CoreUI primary blue
      svgPath: "M0,15 Q15,5 30,12 T60,5 T90,15 T120,8 L120,30 L0,30 Z",
    },
    {
      label: "Đăng ký Host hoạt động",
      value: stats.totalHosts,
      subtext: "Đối tác đã xác thực",
      href: "/admin/approved-hosts",
      bgClass: "bg-[#63c2de]", // CoreUI info cyan
      svgPath: "M0,10 Q20,20 40,8 T80,12 T120,5 L120,30 L0,30 Z",
    },
    {
      label: "Yêu cầu duyệt Host",
      value: stats.pendingHosts,
      subtext: "Hồ sơ đang chờ duyệt",
      href: "/admin/hosts",
      bgClass: "bg-[#f8cb00]", // CoreUI warning yellow
      svgPath: "M0,8 Q25,2 50,15 T100,5 T120,12 L120,30 L0,30 Z",
    },
    {
      label: "Đề xuất Địa danh",
      value: stats.pendingLandmarks,
      subtext: "Địa điểm chờ phê duyệt",
      href: "/admin/landmarks",
      bgClass: "bg-[#f86c6b]", // CoreUI danger red
      svgPath: "M0,20 C30,10 60,5 90,25 C100,30 110,12 120,10 L120,30 L0,30 Z",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 CoreUI Premium Color-blocked Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link
            href={card.href}
            key={card.label}
            className={`block rounded-lg overflow-hidden text-white shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-0.5 ${card.bgClass}`}
          >
            <div className="p-4 space-y-1">
              <div className="text-2xl font-bold">
                {loading ? "..." : card.value}
              </div>
              <div className="text-xs font-semibold opacity-90">{card.label}</div>
              <div className="text-[10px] opacity-75">{card.subtext}</div>
            </div>
            
            {/* Simulated mini line chart underlay */}
            <div className="h-10 w-full opacity-35 relative mt-2 overflow-hidden">
              <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 120 30" preserveAspectRatio="none">
                <path d={card.svgPath} fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"></path>
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Premium Traffic Chart Panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Lưu lượng Giao dịch & Booking</h3>
            <p className="text-xs text-gray-400 font-semibold uppercase mt-0.5">Thống kê hoạt động GoStay toàn quốc</p>
          </div>
          
          {/* Day / Month / Year Filters */}
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg p-0.5 bg-gray-50 text-xs font-bold text-gray-600">
            <button className="px-3 py-1.5 rounded-md hover:bg-white hover:text-gray-900 transition-colors">Ngày</button>
            <button className="px-3 py-1.5 rounded-md bg-white text-gray-900 shadow-sm border border-gray-200/50">Tháng</button>
            <button className="px-3 py-1.5 rounded-md hover:bg-white hover:text-gray-900 transition-colors">Năm</button>
            <button className="p-1.5 hover:bg-white rounded-md text-[#20a8d8] ml-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>

        {/* High-fidelity SVG Simulated Traffic Line Chart */}
        <div className="w-full h-64 relative bg-gray-50/50 rounded-xl border border-gray-100 p-4 overflow-hidden">
          {/* Y-axis helper lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-4 opacity-55">
            <div className="border-b border-gray-200/60 w-full text-3xs font-bold text-gray-400">250 lượt</div>
            <div className="border-b border-gray-200/60 w-full text-3xs font-bold text-gray-400">200 lượt</div>
            <div className="border-b border-gray-200/60 w-full text-3xs font-bold text-gray-400">150 lượt</div>
            <div className="border-b border-gray-200/60 w-full text-3xs font-bold text-gray-400">100 lượt</div>
            <div className="border-b border-gray-200/60 w-full text-3xs font-bold text-gray-400">50 lượt</div>
            <div className="text-3xs font-bold text-gray-400">0</div>
          </div>

          {/* Lines */}
          <svg className="w-full h-full absolute inset-0 p-4" viewBox="0 0 600 200" preserveAspectRatio="none">
            {/* Filled green area for overall bookings */}
            <path
              d="M0,150 C50,80 100,120 150,60 C200,40 250,140 300,90 C350,70 400,160 450,80 C500,60 550,110 600,70 L600,200 L0,200 Z"
              fill="rgba(32,168,216,0.06)"
            ></path>
            
            {/* Booking Line (Blue) */}
            <path
              d="M0,150 C50,80 100,120 150,60 C200,40 250,140 300,90 C350,70 400,160 450,80 C500,60 550,110 600,70"
              fill="none"
              stroke="#20a8d8"
              strokeWidth="2.5"
              strokeLinecap="round"
            ></path>
            
            {/* Host Signups Line (Green) */}
            <path
              d="M0,110 C60,105 120,115 180,95 C240,112 300,85 360,98 C420,118 480,90 540,102 C560,95 580,108 600,95"
              fill="none"
              stroke="#4dbd74"
              strokeWidth="2"
              strokeDasharray="4 3"
              strokeLinecap="round"
            ></path>
          </svg>
        </div>

        {/* Chart Legend Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center border-t border-gray-100 pt-6">
          <div className="space-y-1">
            <div className="text-xs text-gray-500 font-semibold">Lượt ghé thăm</div>
            <div className="text-base font-extrabold text-gray-800">29.703 Users <span className="text-xs font-bold text-blue-500 ml-1">(40%)</span></div>
            <div className="w-full bg-gray-100 rounded-full h-1"><div className="bg-[#20a8d8] h-1 rounded-full w-[40%]"></div></div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-500 font-semibold">Đăng ký mới</div>
            <div className="text-base font-extrabold text-gray-800">24.093 Unique <span className="text-xs font-bold text-teal-500 ml-1">(20%)</span></div>
            <div className="w-full bg-gray-100 rounded-full h-1"><div className="bg-[#63c2de] h-1 rounded-full w-[20%]"></div></div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-500 font-semibold">Xem dịch vụ</div>
            <div className="text-base font-extrabold text-gray-800">78.706 Views <span className="text-xs font-bold text-green-500 ml-1">(60%)</span></div>
            <div className="w-full bg-gray-100 rounded-full h-1"><div className="bg-[#4dbd74] h-1 rounded-full w-[60%]"></div></div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-500 font-semibold">Đơn đặt phòng</div>
            <div className="text-base font-extrabold text-gray-800">22.123 Bookings <span className="text-xs font-bold text-yellow-500 ml-1">(80%)</span></div>
            <div className="w-full bg-gray-100 rounded-full h-1"><div className="bg-[#f8cb00] h-1 rounded-full w-[80%]"></div></div>
          </div>
          <div className="space-y-1 col-span-2 md:col-span-1">
            <div className="text-xs text-gray-500 font-semibold">Tỷ lệ hủy đơn</div>
            <div className="text-base font-extrabold text-gray-800">40.15% <span className="text-xs font-bold text-red-500 ml-1">(Tốt)</span></div>
            <div className="w-full bg-gray-100 rounded-full h-1"><div className="bg-[#f86c6b] h-1 rounded-full w-[40%]"></div></div>
          </div>
        </div>
      </div>

      {/* Grid: Recent Users Table & Quick Actions Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-sm uppercase text-gray-700 tracking-wider">Thành viên mới đăng ký</h3>
            <Link href="/admin/users" className="text-xs text-[#20a8d8] font-bold hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-500">Tài khoản</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500">Email</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={3} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              ) : recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                    Chưa có thành viên nào.
                  </td>
                </tr>
              ) : (
                recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-3 font-semibold text-gray-800">{u.username}</td>
                    <td className="px-6 py-3 text-gray-500 text-xs font-medium">{u.email}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-2xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          u.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
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

        {/* Quick Task Actions Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b pb-3 mb-4">
              <h3 className="font-bold text-sm uppercase text-gray-700 tracking-wider">Tác vụ Quản trị nhanh</h3>
            </div>
            <div className="space-y-3.5">
              <Link
                href="/admin/hosts"
                className="flex items-center justify-between p-3.5 rounded-xl bg-yellow-50/50 hover:bg-yellow-50 border border-yellow-100 transition-all transform hover:translate-x-1"
              >
                <span className="text-xs font-bold text-yellow-800">
                  ⏳ Phê duyệt đăng ký đối tác Host
                </span>
                {stats.pendingHosts > 0 ? (
                  <span className="bg-[#f8cb00] text-gray-900 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-[#e2ba00] shadow-sm animate-bounce">
                    {stats.pendingHosts} chờ
                  </span>
                ) : (
                  <span className="text-3xs text-gray-400 font-semibold">Đã duyệt hết</span>
                )}
              </Link>

              <Link
                href="/admin/landmarks"
                className="flex items-center justify-between p-3.5 rounded-xl bg-red-50/50 hover:bg-red-50 border border-red-100 transition-all transform hover:translate-x-1"
              >
                <span className="text-xs font-bold text-red-800">
                  📍 Phê duyệt đề xuất địa danh mới
                </span>
                {stats.pendingLandmarks > 0 ? (
                  <span className="bg-[#f86c6b] text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-red-500 shadow-sm animate-bounce">
                    {stats.pendingLandmarks} mới
                  </span>
                ) : (
                  <span className="text-3xs text-gray-400 font-semibold">Không có đề xuất</span>
                )}
              </Link>

              <Link
                href="/admin/payouts"
                className="flex items-center justify-between p-3.5 rounded-xl bg-green-50/50 hover:bg-green-50 border border-green-100 transition-all transform hover:translate-x-1"
              >
                <span className="text-xs font-bold text-green-800">
                  💰 Quản lý thanh toán hoa hồng cho Host
                </span>
                <span className="text-3xs text-green-600 font-bold uppercase tracking-wider">Hàng tháng</span>
              </Link>

              <Link
                href="/admin/inventory"
                className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100 transition-all transform hover:translate-x-1"
              >
                <span className="text-xs font-bold text-blue-800">
                  📦 Đồng bộ & can thiệp khẩn cấp tồn kho
                </span>
                <span className="text-3xs text-blue-600 font-bold uppercase tracking-wider">Bản đồ 30 ngày</span>
              </Link>
            </div>
          </div>
          
          <div className="text-center text-3xs text-gray-400 font-semibold pt-4 border-t border-gray-50 mt-4">
            GoStay Admin Dashboard | CoreUI Inspired High-Fidelity Design System
          </div>
        </div>
      </div>
    </div>
  );
}
