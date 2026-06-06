"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminConfirmDialog } from "@/screens/admin/_components/AdminConfirmDialog";
import { AdminPagination } from "@/screens/admin/_components/AdminPagination";
import { roleName } from "@/screens/admin/_components/admin-utils";
import { AdminUser } from "@/services/admin.service";
import { useAdminUser } from "./hook/useAdminUser";

function UserAvatar({ user }: { user: AdminUser }) {
  const avatarUrl = user.userProfile?.avatarUrl ?? user.avatarUrl;
  const initial = user.username?.charAt(0).toUpperCase() ?? "?";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={user.username ?? "avatar"}
        className="h-10 w-10 rounded-full border border-slate-100 object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-sm font-bold text-slate-500">
      {initial}
    </div>
  );
}

export function UsersScreen() {
  const {
    users,
    loading,
    actionLoading,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    totalElements,
    pageSize,
    roleModal,
    setRoleModal,
    selectedRole,
    setSelectedRole,
    assignableRoles,
    detailModal,
    setDetailModal,
    confirm,
    setConfirm,
    feedback,
    handleConfirm,
    handleToggleBan,
    handleDelete,
    handleOpenRoleModal,
    handleUpgradeRole,
    handleRevokeRole,
  } = useAdminUser();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-800">Quản lý Người dùng</h2>
          <p className="mt-0.5 text-xs font-medium text-slate-400">
            Phân trang theo API, tìm kiếm trong trang hiện tại.
          </p>
        </div>
        <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-400">
          {totalElements} tài khoản
        </span>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-xs font-semibold ${
            feedback.type === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-rose-100 bg-rose-50 text-rose-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Tìm username, email hoặc họ tên trong trang hiện tại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-100 bg-white py-2 pr-4 pl-9 text-xs font-semibold text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all focus:border-slate-200 focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
        />
        <svg className="absolute top-2.5 left-3.5 h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 text-left text-[10px] font-bold tracking-wider text-slate-400 uppercase">Người dùng</th>
                <th className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 text-left text-[10px] font-bold tracking-wider text-slate-400 uppercase">Vai trò</th>
                <th className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 text-left text-[10px] font-bold tracking-wider text-slate-400 uppercase">Trạng thái</th>
                <th className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 text-right text-[10px] font-bold tracking-wider text-slate-400 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={4} className="px-5 py-4">
                      <div className="h-4 rounded bg-slate-50 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-xs font-medium text-slate-400">
                    Không tìm thấy tài khoản nào trong trang hiện tại.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-slate-50/30">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <div>
                          <div className="text-[13.5px] font-semibold text-slate-800">{user.username || "—"}</div>
                          <div className="mt-0.5 text-xs font-medium text-slate-455">{user.email || "—"}</div>
                          {user.userProfile?.fullName && (
                            <div className="mt-0.5 text-[10px] font-medium text-slate-400">{user.userProfile.fullName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {(user.roles ?? []).map((role) => {
                          const name = roleName(role);
                          const isUser = name.toUpperCase() === "USER";

                          return (
                            <span
                              key={name}
                              className="inline-flex items-center gap-1 rounded-full border border-blue-100/50 bg-blue-50/80 px-2 py-0.5 text-[10.5px] font-bold text-blue-600"
                            >
                              {name}
                              {!isUser && (
                                <button
                                  type="button"
                                  onClick={() => handleRevokeRole(user, name)}
                                  className="inline-flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full text-[8px] font-bold text-blue-800 transition-colors hover:bg-blue-100"
                                  title={`Gỡ bỏ role ${name}`}
                                >
                                  x
                                </button>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="space-x-1.5 px-5 py-3.5">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                          user.isActive
                            ? "border-emerald-100/50 bg-emerald-50 text-emerald-600"
                            : "border-rose-100/50 bg-rose-50 text-rose-600"
                        }`}
                      >
                        {user.isActive ? "Hoạt động" : "Bị khóa"}
                      </span>
                      {user.isDeleted && (
                        <span className="inline-block rounded-full border border-rose-100/50 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-600">
                          Đã xóa
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailModal({ open: true, user })}
                          className="rounded-lg border border-slate-200/70 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-650 transition-colors hover:bg-slate-50"
                        >
                          Chi tiết
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenRoleModal(user)}
                          className="rounded-lg border border-blue-100/60 bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-650 transition-colors hover:bg-blue-100/60"
                        >
                          Nâng role
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleBan(user)}
                          className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                            user.isActive
                              ? "border-amber-100/40 bg-amber-50 text-amber-600 hover:bg-amber-100/60"
                              : "border-emerald-100/40 bg-emerald-50 text-emerald-600 hover:bg-emerald-100/60"
                          }`}
                        >
                          {user.isActive ? "Khóa" : "Mở khóa"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          className="rounded-lg border border-rose-100/40 bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-650 transition-colors hover:bg-rose-100/60"
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

        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          loading={loading}
          onPageChange={setPage}
        />
      </div>

      <Dialog open={roleModal.open} onOpenChange={(open) => setRoleModal({ open, user: open ? roleModal.user : null })}>
        <DialogContent className="rounded-[20px] border border-slate-100 bg-white p-0 sm:max-w-md">
          <DialogHeader className="border-b border-slate-100 p-5">
            <DialogTitle className="text-base font-semibold text-slate-800">Nâng role tài khoản</DialogTitle>
            <p className="text-xs font-medium text-slate-400">
              Chọn role cần thêm cho {roleModal.user?.username ?? roleModal.user?.email ?? "người dùng"}.
            </p>
          </DialogHeader>
          <div className="space-y-2 p-5">
            <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Role mới</label>
            <select
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-slate-300 focus:outline-none"
            >
              {assignableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter className="mx-0 mb-0 rounded-b-[20px] border-t border-slate-100 bg-slate-50/70 p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRoleModal({ open: false, user: null })}
              disabled={actionLoading}
              className="rounded-full bg-white text-xs"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleUpgradeRole}
              disabled={actionLoading}
              className="rounded-full bg-blue-600 text-xs text-white hover:bg-blue-700"
            >
              {actionLoading ? "Đang xử lý..." : "Thêm role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailModal.open} onOpenChange={(open) => setDetailModal({ open, user: open ? detailModal.user : null })}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[20px] border border-slate-100 bg-white p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-slate-100 p-5">
            <DialogTitle className="text-base font-semibold text-slate-800">Chi tiết tài khoản</DialogTitle>
          </DialogHeader>
          {detailModal.user && (
            <div className="space-y-6 p-6 text-xs font-medium">
              <div className="flex items-center gap-4">
                <UserAvatar user={detailModal.user} />
                <div>
                  <h4 className="text-base font-semibold leading-none text-slate-800">{detailModal.user.username}</h4>
                  <p className="mt-1 text-xs text-slate-400">{detailModal.user.email}</p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 border-b border-slate-50 pb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">Thông tin cá nhân</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div><span className="text-slate-400">Họ tên:</span> <span className="text-slate-700">{detailModal.user.userProfile?.fullName || "—"}</span></div>
                  <div><span className="text-slate-400">SĐT:</span> <span className="text-slate-700">{detailModal.user.userProfile?.phoneNumber || "—"}</span></div>
                  <div><span className="text-slate-400">Ngày sinh:</span> <span className="text-slate-700">{detailModal.user.userProfile?.dateOfBirth || "—"}</span></div>
                  <div><span className="text-slate-400">Provider:</span> <span className="text-slate-700">{detailModal.user.provider || "Local"}</span></div>
                </div>
              </div>

              {detailModal.user.hostProfile && (
                <div>
                  <h4 className="mb-3 border-b border-slate-50 pb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">Hồ sơ Host</h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div><span className="text-slate-400">CCCD/Passport:</span> <span className="text-slate-700">{detailModal.user.hostProfile.cccdNumber || "—"}</span></div>
                    <div><span className="text-slate-400">Ngân hàng:</span> <span className="text-slate-700">{detailModal.user.hostProfile.bankName || "—"}</span></div>
                    <div><span className="text-slate-400">Số tài khoản:</span> <span className="text-slate-700">{detailModal.user.hostProfile.bankAccount || "—"}</span></div>
                    <div><span className="text-slate-400">Trạng thái:</span> <span className="text-slate-700">{detailModal.user.hostProfile.approvalStatus || "—"}</span></div>
                  </div>
                </div>
              )}

              {detailModal.user.enterpriseProfile && (
                <div>
                  <h4 className="mb-3 border-b border-slate-50 pb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">Hồ sơ Enterprise</h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div><span className="text-slate-400">Công ty:</span> <span className="text-slate-700">{detailModal.user.enterpriseProfile.companyName || "—"}</span></div>
                    <div><span className="text-slate-400">MST:</span> <span className="text-slate-700">{detailModal.user.enterpriseProfile.taxCode || "—"}</span></div>
                    <div><span className="text-slate-400">Đại diện:</span> <span className="text-slate-700">{detailModal.user.enterpriseProfile.representativeName || "—"}</span></div>
                    <div className="sm:col-span-2"><span className="text-slate-400">Địa chỉ:</span> <span className="text-slate-700">{detailModal.user.enterpriseProfile.companyAddress || "—"}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AdminConfirmDialog
        open={confirm.open}
        title={confirm.open ? confirm.title : ""}
        description={confirm.open ? confirm.description : undefined}
        confirmLabel={confirm.open ? confirm.confirmLabel : undefined}
        intent={confirm.open ? confirm.intent : "default"}
        loading={actionLoading}
        onOpenChange={(open) => setConfirm(open ? confirm : { open: false })}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
