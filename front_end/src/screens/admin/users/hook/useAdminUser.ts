import { useEffect, useMemo, useState } from "react";
import AdminService, { AdminRoleName, AdminUser } from "@/services/admin.service";
import {
  ConfirmState,
  DEFAULT_ADMIN_PAGE_SIZE,
  getAdminErrorMessage,
  roleName,
} from "@/screens/admin/_components/admin-utils";

type DetailModalState = {
  open: boolean;
  user: AdminUser | null;
};

type RoleModalState = {
  open: boolean;
  user: AdminUser | null;
};

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

const ASSIGNABLE_ROLES: AdminRoleName[] = ["HOST", "ENTERPRISE", "ADMIN"];

export function useAdminUser() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false });
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [roleModal, setRoleModal] = useState<RoleModalState>({
    open: false,
    user: null,
  });
  const [detailModal, setDetailModal] = useState<DetailModalState>({
    open: false,
    user: null,
  });
  const [selectedRole, setSelectedRole] = useState<AdminRoleName>("HOST");

  const fetchUsers = async (pageToLoad = page) => {
    setLoading(true);
    try {
      const res = await AdminService.getUsers(pageToLoad, DEFAULT_ADMIN_PAGE_SIZE);
      setUsers(res?.data?.content ?? []);
      setTotalPages(Math.max(res?.data?.totalPages ?? 1, 1));
      setTotalElements(res?.data?.totalElements ?? 0);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getAdminErrorMessage(error, "Không thể tải danh sách người dùng."),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter(
      (user) =>
        user.username?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.userProfile?.fullName?.toLowerCase().includes(q)
    );
  }, [search, users]);

  const refreshCurrentPage = async () => {
    await fetchUsers(page);
  };

  const runConfirm = async () => {
    if (!confirm.open) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      await confirm.onConfirm();
      setConfirm({ open: false });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getAdminErrorMessage(error),
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openToggleBanConfirm = (user: AdminUser) => {
    const action = user.isActive ? "khóa" : "mở khóa";
    setConfirm({
      open: true,
      title: `${user.isActive ? "Khóa" : "Mở khóa"} tài khoản`,
      description: `Bạn đang chuẩn bị ${action} tài khoản "${user.username ?? user.email ?? user.id}".`,
      confirmLabel: user.isActive ? "Khóa tài khoản" : "Mở khóa",
      intent: user.isActive ? "danger" : "success",
      onConfirm: async () => {
        const newStatus = user.isActive ? "BANNED" : "ACTIVE";
        await AdminService.toggleAccountStatus(user.id, newStatus);
        setFeedback({ type: "success", message: `Đã ${action} tài khoản thành công.` });
        await refreshCurrentPage();
      },
    });
  };

  const openDeleteConfirm = (user: AdminUser) => {
    setConfirm({
      open: true,
      title: "Xóa vĩnh viễn tài khoản",
      description: `Tài khoản "${user.username ?? user.email ?? user.id}" sẽ bị xóa. Hành động này không thể hoàn tác.`,
      confirmLabel: "Xóa tài khoản",
      intent: "danger",
      onConfirm: async () => {
        await AdminService.deleteUser(user.id);
        setFeedback({ type: "success", message: "Đã xóa tài khoản." });
        await refreshCurrentPage();
      },
    });
  };

  const openRoleModal = (user: AdminUser) => {
    const existingRoles = new Set((user.roles ?? []).map((role) => roleName(role).toUpperCase()));
    const nextRole = ASSIGNABLE_ROLES.find((role) => !existingRoles.has(role.toUpperCase())) ?? "HOST";
    setSelectedRole(nextRole);
    setRoleModal({ open: true, user });
  };

  const handleUpgradeRole = async () => {
    if (!roleModal.user || !selectedRole) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      await AdminService.upgradeRole(roleModal.user.id, selectedRole);
      setFeedback({ type: "success", message: `Đã thêm role ${selectedRole}.` });
      setRoleModal({ open: false, user: null });
      await refreshCurrentPage();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getAdminErrorMessage(error, "Có lỗi khi nâng cấp role."),
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openRevokeRoleConfirm = (user: AdminUser, role: string) => {
    if (role.toUpperCase() === "USER") {
      setFeedback({ type: "error", message: "Không thể gỡ bỏ role USER của người dùng." });
      return;
    }

    setConfirm({
      open: true,
      title: `Gỡ role ${role}`,
      description: `Role ${role} sẽ bị gỡ khỏi tài khoản "${user.username ?? user.email ?? user.id}".`,
      confirmLabel: "Gỡ role",
      intent: "danger",
      onConfirm: async () => {
        await AdminService.revokeRole(user.id, role);
        setFeedback({ type: "success", message: `Đã gỡ role ${role}.` });
        await refreshCurrentPage();
      },
    });
  };

  return {
    users: filtered,
    rawUsers: users,
    loading,
    actionLoading,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    totalElements,
    pageSize: DEFAULT_ADMIN_PAGE_SIZE,
    roleModal,
    setRoleModal,
    selectedRole,
    setSelectedRole,
    assignableRoles: ASSIGNABLE_ROLES,
    detailModal,
    setDetailModal,
    confirm,
    setConfirm,
    feedback,
    handleConfirm: runConfirm,
    handleToggleBan: openToggleBanConfirm,
    handleDelete: openDeleteConfirm,
    handleOpenRoleModal: openRoleModal,
    handleUpgradeRole,
    handleRevokeRole: openRevokeRoleConfirm,
  };
}
