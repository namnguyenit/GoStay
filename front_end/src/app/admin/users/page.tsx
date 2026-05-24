"use client";

import { useEffect, useState } from "react";
import AdminService from "@/services/admin.service";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users using the admin service
      const res = await AdminService.getUsers(0, 50); // Get first 50
      if (res && res.data && res.data.content) {
        setUsers(res.data.content);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBan = async (user: any) => {
    if (confirm(`Bạn có chắc chắn muốn ${user.isActive ? "khóa" : "mở khóa"} tài khoản ${user.username}?`)) {
      try {
        await AdminService.banUser(user.id);
        fetchUsers(); // Refresh after action
      } catch (error) {
        console.error("Failed to toggle ban status", error);
        alert("Có lỗi xảy ra khi thực hiện thao tác.");
      }
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản ${username}?`)) {
      try {
        await AdminService.deleteUser(id);
        fetchUsers(); // Refresh after action
      } catch (error) {
        console.error("Failed to delete user", error);
        alert("Có lỗi xảy ra khi xóa tài khoản.");
      }
    }
  };

  if (loading) {
    return <div>Đang tải danh sách người dùng...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Quản lý Tài khoản (Users)</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Username</th>
              <th className="p-4 font-semibold text-gray-600">Email</th>
              <th className="p-4 font-semibold text-gray-600">Roles</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Không có dữ liệu.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{user.username}</td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4">
                    {user.roles?.map((r: any) => r.name).join(", ")}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.isActive ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    <button
                      onClick={() => handleToggleBan(user)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        user.isActive
                          ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {user.isActive ? "Khóa" : "Mở khóa"}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
