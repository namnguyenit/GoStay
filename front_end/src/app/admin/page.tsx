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
          AdminService.getLandmarkSuggestions(0, 1),
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

  const statCards = [
    {
      label: "Tổng người dùng",
      value: stats.totalUsers,
      icon: "👥",
      href: "/admin/users",
      color: "blue",
    },
    {
      label: "Hosts đang hoạt động",
      value: stats.totalHosts,
      icon: "🏠",
      href: "/admin/hosts",
      color: "green",
    },
    {
      label: "Host chờ duyệt",
      value: stats.pendingHosts,
      icon: "⏳",
      href: "/admin/hosts",
      color: "orange",
    },
    {
      label: "Địa danh đề xuất",
      value: stats.pendingLandmarks,
      icon: "📍",
      href: "/admin/landmarks",
      color: "purple",
    },
  ];

  const colorMap: Record<string, string> = {
    blue: "border-blue-200 bg-blue-50",
    green: "border-green-200 bg-green-50",
    orange: "border-orange-200 bg-orange-50",
    purple: "border-purple-200 bg-purple-50",
  };
  const valueColorMap: Record<string, string> = {
    blue: "text-blue-700",
    green: "text-green-700",
    orange: "text-orange-700",
    purple: "text-purple-700",
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Tổng quan hệ thống</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            href={card.href}
            key={card.label}
            className={`block rounded-xl border p-5 hover:shadow-md transition-shadow ${colorMap[card.color]}`}
          >
            <div className="text-2xl mb-2">{card.icon}</div>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mb-1" />
            ) : (
              <div className={`text-3xl font-bold ${valueColorMap[card.color]}`}>{card.value}</div>
            )}
            <div className="text-sm text-gray-600 mt-1">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Người dùng gần đây</h3>
            <Link href="/admin/users" className="text-xs text-red-500 hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Username</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={3} className="px-5 py-3">
                      <div className="h-4 bg-gray-100 animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              ) : recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-4 text-center text-gray-400">
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{u.username}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{u.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
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

        {/* Quick Action Links */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Tác vụ nhanh</h3>
          <div className="space-y-3">
            <Link
              href="/admin/hosts"
              className="flex items-center justify-between p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <span className="text-sm font-medium text-orange-800">
                ⏳ Duyệt đơn đăng ký Host
              </span>
              {stats.pendingHosts > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {stats.pendingHosts}
                </span>
              )}
            </Link>
            <Link
              href="/admin/landmarks"
              className="flex items-center justify-between p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <span className="text-sm font-medium text-purple-800">
                📍 Duyệt đề xuất Địa danh
              </span>
              {stats.pendingLandmarks > 0 && (
                <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {stats.pendingLandmarks}
                </span>
              )}
            </Link>
            <Link
              href="/admin/payouts"
              className="flex items-center justify-between p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
            >
              <span className="text-sm font-medium text-green-800">
                💰 Quản lý Payout cho Hosts
              </span>
            </Link>
            <Link
              href="/admin/inventory"
              className="flex items-center justify-between p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <span className="text-sm font-medium text-blue-800">
                📦 Đồng bộ / Phong tỏa Tồn kho
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
