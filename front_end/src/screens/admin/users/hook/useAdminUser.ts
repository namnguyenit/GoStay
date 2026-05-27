import { useEffect, useState } from "react";
import AdminService from "@/services/admin.service";



export function useAdminUser() {
  const [users, setUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleModal, setRoleModal] = useState<{ open: boolean; user: any | null }>({
    open: false,
    user: null,
  });
  const [detailModal, setDetailModal] = useState<{ open: boolean; user: any | null }>({
    open: false,
    user: null,
  });
  const [selectedRole, setSelectedRole] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getUsers(0, 100);
      const list = res?.data?.content ?? [];
      console.log("Fetched users:", list);
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

  const handleRevokeRole = async (user: any, role: string) => {
    if (role.toUpperCase() === "USER") {
      alert("Không thể gỡ bỏ role USER của người dùng!");
      return;
    }
    if (!confirm(`Bạn có chắc chắn muốn gỡ bỏ role ${role} của tài khoản "${user.username}"?`)) return;
    try {
      await AdminService.revokeRole(user.id, role);
      fetchUsers();
    } catch (err: any) {
      alert("Có lỗi khi gỡ bỏ role.");
    }
  };

  return {
    users: filtered,
    loading,
    search,
    setSearch,
    roleModal,
    setRoleModal,
    selectedRole,
    setSelectedRole,
    detailModal,
    setDetailModal,
    handleToggleBan,
    handleDelete,
    handleUpgradeRole,
    handleRevokeRole,
  }
}