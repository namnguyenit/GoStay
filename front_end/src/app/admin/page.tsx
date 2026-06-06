"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminService, { AdminUser } from "@/services/admin.service";
import AuthService from "@/services/auth.service";
import { getAdminErrorMessage } from "@/screens/admin/_components/admin-utils";

type Stats = {
  totalUsers: number;
  approvedHosts: number;
  pendingHosts: number;
  approvedEnterprises: number;
  pendingEnterprises: number;
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  officialLandmarks: number;
  pendingLandmarks: number;
};

const EMPTY_STATS: Stats = {
  totalUsers: 0,
  approvedHosts: 0,
  pendingHosts: 0,
  approvedEnterprises: 0,
  pendingEnterprises: 0,
  totalListings: 0,
  activeListings: 0,
  pendingListings: 0,
  officialLandmarks: 0,
  pendingLandmarks: 0,
};

const numberFormat = new Intl.NumberFormat("vi-VN");

function pickTotal(result: PromiseSettledResult<{ data?: { totalElements?: number; content?: unknown[] } }>) {
  if (result.status !== "fulfilled") return 0;
  return result.value?.data?.totalElements ?? result.value?.data?.content?.length ?? 0;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          usersRes,
          approvedHostsRes,
          pendingHostsRes,
          approvedEnterprisesRes,
          pendingEnterprisesRes,
          listingsRes,
          activeListingsRes,
          pendingListingsRes,
          landmarksRes,
          pendingLandmarksRes,
        ] = await Promise.allSettled([
          AdminService.getUsers(0, 5),
          AdminService.getApprovedHosts(0, 1),
          AdminService.getPendingHosts(0, 1),
          AdminService.getApprovedEnterprises(0, 1),
          AdminService.getPendingEnterprises(0, 1),
          AdminService.getListings("", 0, 1),
          AdminService.getListings("ACTIVE", 0, 1),
          AdminService.getListings("PENDING", 0, 1),
          AdminService.getLandmarks("", 0, 1),
          AdminService.getLandmarkSuggestions("PENDING", 0, 1),
        ]);

        if (usersRes.status === "fulfilled") {
          setRecentUsers(usersRes.value?.data?.content ?? []);
        }

        setStats({
          totalUsers: pickTotal(usersRes),
          approvedHosts: pickTotal(approvedHostsRes),
          pendingHosts: pickTotal(pendingHostsRes),
          approvedEnterprises: pickTotal(approvedEnterprisesRes),
          pendingEnterprises: pickTotal(pendingEnterprisesRes),
          totalListings: pickTotal(listingsRes),
          activeListings: pickTotal(activeListingsRes),
          pendingListings: pickTotal(pendingListingsRes),
          officialLandmarks: pickTotal(landmarksRes),
          pendingLandmarks: pickTotal(pendingLandmarksRes),
        });
      } catch (err) {
        setError(getAdminErrorMessage(err, "Không thể tải dữ liệu dashboard."));
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
      label: "Người dùng",
      value: stats.totalUsers,
      detail: "Tổng tài khoản trong Identity",
      href: "/admin/users",
      tone: "bg-blue-50 text-blue-650 border-blue-100",
    },
    {
      label: "Host đã duyệt",
      value: stats.approvedHosts,
      detail: `${stats.pendingHosts} hồ sơ đang chờ duyệt`,
      href: "/admin/hosts",
      tone: "bg-emerald-50 text-emerald-650 border-emerald-100",
    },
    {
      label: "Enterprise đã duyệt",
      value: stats.approvedEnterprises,
      detail: `${stats.pendingEnterprises} doanh nghiệp đang chờ`,
      href: "/admin/enterprises",
      tone: "bg-cyan-50 text-cyan-650 border-cyan-100",
    },
    {
      label: "Listings",
      value: stats.totalListings,
      detail: `${stats.activeListings} active • ${stats.pendingListings} chờ duyệt`,
      href: "/admin/listings",
      tone: "bg-amber-50 text-amber-650 border-amber-100",
    },
    {
      label: "Địa danh chính thức",
      value: stats.officialLandmarks,
      detail: `${stats.pendingLandmarks} đề xuất địa danh đang chờ`,
      href: "/admin/landmarks",
      tone: "bg-rose-50 text-rose-650 border-rose-100",
    },
  ];

  const urgentTasks = [
    {
      label: "Duyệt Host",
      count: stats.pendingHosts,
      href: "/admin/hosts",
      empty: "Không có host chờ duyệt",
    },
    {
      label: "Duyệt Enterprise",
      count: stats.pendingEnterprises,
      href: "/admin/enterprises",
      empty: "Không có doanh nghiệp chờ duyệt",
    },
    {
      label: "Duyệt Listing",
      count: stats.pendingListings,
      href: "/admin/listings",
      empty: "Không có listing chờ duyệt",
    },
    {
      label: "Duyệt Địa danh",
      count: stats.pendingLandmarks,
      href: "/admin/landmarks",
      empty: "Không có địa danh chờ duyệt",
    },
  ];

  return (
    <div className="max-w-[1400px] space-y-6 animate-smooth-appear">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-800">Tổng quan hệ thống</h2>
          <p className="mt-0.5 text-xs font-medium text-slate-400">
            Dữ liệu lấy từ API quản trị hiện có, không dùng số liệu demo.
          </p>
        </div>
        <div className="rounded-full border border-slate-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          Admin: <span className="text-slate-800">{adminName || "Quản trị viên"}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_14px_30px_rgba(15,23,42,0.06)]"
          >
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${card.tone}`}>
              {card.label}
            </span>
            <div className="mt-4 text-3xl font-semibold text-slate-850">
              {loading ? "..." : numberFormat.format(card.value)}
            </div>
            <p className="mt-2 text-xs font-medium leading-5 text-slate-450">{card.detail}</p>
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2 rounded-[20px] border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="border-b border-slate-50 p-5">
            <h3 className="text-base font-semibold text-slate-800">Tác vụ cần xử lý</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-400">
              Các mục này đều lấy từ count thật của API.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
            {urgentTasks.map((task) => (
              <Link
                key={task.label}
                href={task.href}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:border-slate-200 hover:bg-white"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-800">{task.label}</div>
                  <div className="mt-1 text-xs font-medium text-slate-400">
                    {task.count > 0 ? "Cần admin xử lý" : task.empty}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    task.count > 0 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {loading ? "..." : task.count}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="border-b border-slate-50 p-5">
            <h3 className="text-base font-semibold text-slate-800">Chưa có API thống kê</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-400">
              Dashboard không hiển thị số giả cho các nhóm này.
            </p>
          </div>
          <div className="space-y-3 p-5">
            {["Doanh thu theo ngày", "Hoa hồng GoStay", "Tỷ lệ lấp đầy", "Biểu đồ vùng đối tác"].map((item) => (
              <div key={item} className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-3">
                <div className="text-xs font-semibold text-slate-700">{item}</div>
                <div className="mt-1 text-[11px] font-medium text-slate-400">
                  Chưa có endpoint thống kê tổng hợp.
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[20px] border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between border-b border-slate-50 p-5">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Thành viên mới cập nhật</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-400">5 tài khoản đầu từ API users.</p>
          </div>
          <Link href="/admin/users" className="rounded-full border border-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50/50">
            Xem tất cả
          </Link>
        </div>
        <div className="overflow-x-auto p-3">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Người dùng</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Vai trò</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={4} className="px-4 py-4">
                      <div className="h-4 rounded bg-slate-50 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-xs font-medium text-slate-400">
                    Chưa có dữ liệu người dùng.
                  </td>
                </tr>
              ) : (
                recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{user.username || "—"}</td>
                    <td className="px-4 py-3 font-medium text-slate-500">{user.email || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{user.roles?.join(", ") || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                          user.isActive
                            ? "border-emerald-100 bg-emerald-50 text-emerald-650"
                            : "border-rose-100 bg-rose-50 text-rose-650"
                        }`}
                      >
                        {user.isActive ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
