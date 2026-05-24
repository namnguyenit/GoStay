"use client";

import { useEffect, useState } from "react";
import AdminService from "@/services/admin.service";

const ROLES = ["ROLE_USER", "ROLE_HOST", "ROLE_ENTERPRISE", "ROLE_ADMIN"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleModal, setRoleModal] = useState<{ open: boolean; user: any | null }>({
    open: false,
    user: null,
  });
  const [selectedRole, setSelectedRole] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getUsers(0, 100);
      const list = res?.data?.content ?? [];
      setUsers(list);
      setFiltered(list);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Client-side search filter
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      users.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      )
    );
  }, [search, users]);

  const handleToggleBan = async (user: any) => {
    const action = user.isActive ? "khóa" : "mở khóa";
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản "${user.username}"?`)) return;
    try {
      const newStatus = user.isActive ? "BANNED" : "ACTIVE";
      await AdminService.toggleAccountStatus(user.id, newStatus);
      fetchUsers();
    } catch (err) {
      alert("Có lỗi xảy ra.");
    }
  };

  const handleDelete = async (user: any) => {
    if (!confirm(`XÓA VĨNH VIỄN tài khoản "${user.username}"? Hành động này không thể hoàn tác.`))
      return;
    try {
      await AdminService.deleteUser(user.id);
      fetchUsers();
    } catch (err) {
      alert("Có lỗi xảy ra khi xóa.");
    }
  };

  const handleUpgradeRole = async () => {
    if (!roleModal.user || !selectedRole) return;
    try {
      await AdminService.upgradeRole(roleModal.user.id, selectedRole);
      setRoleModal({ open: false, user: null });
      fetchUsers();
    } catch (err) {
      alert("Có lỗi khi nâng cấp role.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Quản lý Người dùng</h2>
        <span className="text-sm text-gray-400">{filtered.length} tài khoản</span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm theo username hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Username</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Roles</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Không tìm thấy kết quả.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{user.username}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{user.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(user.roles ?? []).map((r: any) => (
                        <span
                          key={r.name ?? r}
                          className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full"
                        >
                          {r.name ?? r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.isActive ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleBan(user)}
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          user.isActive
                            ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {user.isActive ? "Khóa" : "Mở khóa"}
                      </button>
                      <button
                        onClick={() => {
                          setRoleModal({ open: true, user });
                          setSelectedRole("");
                        }}
                        className="text-xs px-2 py-1 rounded font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        Đổi Role
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-xs px-2 py-1 rounded font-medium bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Role Upgrade Modal */}
      {roleModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-1">Nâng cấp Role</h3>
            <p className="text-sm text-gray-500 mb-4">
              Tài khoản: <span className="font-medium text-gray-800">{roleModal.user?.username}</span>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn Role mới</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 mb-4"
            >
              <option value="">-- Chọn --</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={handleUpgradeRole}
                disabled={!selectedRole}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40"
              >
                Xác nhận
              </button>
              <button
                onClick={() => setRoleModal({ open: false, user: null })}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
