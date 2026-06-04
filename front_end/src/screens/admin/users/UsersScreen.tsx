"use client";

import { useEffect, useState } from "react";
import AdminService from "@/services/admin.service";
import { useAdminUser } from "./hook/useAdminUser";



export function UsersScreen() {
  const { users: filtered,
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
    handleRevokeRole, } = useAdminUser();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Quản lý Người dùng</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Danh sách và thông tin chi tiết các tài khoản người dùng</p>
        </div>
        <span className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">{filtered.length} tài khoản</span>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Tìm theo username hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-slate-200 transition-all"
        />
        <svg className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] border border-slate-100 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Username</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Email</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Vai trò</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Trạng thái</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-5 py-4">
                    <div className="h-4 bg-slate-50 animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-400 font-medium">
                  Không tìm thấy tài khoản nào khớp với bộ lọc.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-800 text-[13.5px]">{user.username}</td>
                  <td className="px-5 py-3.5 text-slate-455 text-xs font-medium">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {(user.roles ?? []).map((r: any) => {
                        const name = r.name ?? r;
                        const isUser = name.toUpperCase() === "USER";
                        return (
                          <span
                            key={name}
                            className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 bg-blue-50/80 text-blue-600 border border-blue-100/50 rounded-full font-bold"
                          >
                            {name}
                            {!isUser && (
                              <button
                                onClick={() => handleRevokeRole(user, name)}
                                className="hover:bg-blue-100 text-blue-800 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center font-bold text-[8px] transition-colors cursor-pointer"
                                title={`Gỡ bỏ role ${name}`}
                              >
                                ✕
                              </button>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 space-x-1.5">
                    <span
                      className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                        user.isActive
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                          : "bg-rose-50 text-rose-600 border-rose-100/50"
                      }`}
                    >
                      {user.isActive ? "Hoạt động" : "Bị khóa"}
                    </span>
                    {user.isDeleted && (
                      <span className="inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold border bg-rose-50 text-rose-600 border-rose-100/50">
                        Bị cấm
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailModal({ open: true, user })}
                        className="text-[11px] px-2.5 py-1.5 rounded-lg border font-bold bg-white text-slate-650 border-slate-200/70 hover:bg-slate-50 transition-colors"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handleToggleBan(user)}
                        className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-bold transition-colors ${
                          user.isActive
                            ? "bg-amber-50 text-amber-600 border-amber-100/40 hover:bg-amber-100/60"
                            : "bg-emerald-50 text-emerald-600 border-emerald-100/40 hover:bg-emerald-100/60"
                        }`}
                      >
                        {user.isActive ? "Khóa" : "Mở khóa"}
                      </button> 
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-[11px] px-2.5 py-1.5 rounded-lg border font-bold bg-rose-50 text-rose-650 border-rose-100/40 hover:bg-rose-100/60 transition-colors"
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

      {/* User Details Modal */}
      {detailModal.open && detailModal.user && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-base text-slate-800">Chi tiết tài khoản</h3>
              <button 
                onClick={() => setDetailModal({ open: false, user: null })}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Basic Info */}
              <div className="flex gap-4 items-center">
                {detailModal.user.userProfile?.avatarUrl ? (
                  <img src={detailModal.user.userProfile.avatarUrl} alt="avatar" className="w-16 h-16 rounded-full object-cover border border-slate-100 shadow-sm" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 text-xl font-bold border border-slate-100">
                    {detailModal.user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-base font-semibold text-slate-800 leading-none">{detailModal.user.username}</h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{detailModal.user.email}</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {detailModal.user.roles?.map((r: any) => (
                      <span key={r.name ?? r} className="text-[10px] px-2 py-0.5 bg-blue-50/80 text-blue-600 border border-blue-100/50 rounded-full font-bold">
                        {r.name ?? r}
                      </span>
                    ))}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${detailModal.user.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : "bg-rose-50 text-rose-600 border-rose-100/50"}`}>
                      {detailModal.user.isActive ? "Hoạt động" : "Bị khóa"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-100 rounded-full font-semibold">
                      {detailModal.user.provider || "Local"}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Profile */}
              <div>
                <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-50">Thông tin Cá nhân</h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                  <div><span className="text-slate-400">Họ tên:</span> <span className="text-slate-700">{detailModal.user.userProfile?.fullName || "—"}</span></div>
                  <div><span className="text-slate-400">SĐT:</span> <span className="text-slate-700">{detailModal.user.userProfile?.phoneNumber || "—"}</span></div>
                  <div><span className="text-slate-400">Ngày sinh:</span> <span className="text-slate-700">{detailModal.user.userProfile?.dateOfBirth || "—"}</span></div>
                </div>
              </div>

              {/* Host Profile (if exists) */}
              {detailModal.user.hostProfile && (
                <div>
                  <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-50">Hồ sơ đối tác Host</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                    <div><span className="text-slate-400">Họ tên đăng ký:</span> <span className="text-slate-700">{detailModal.user.userProfile?.fullName || "—"}</span></div>
                    <div><span className="text-slate-400">SĐT đối tác:</span> <span className="text-slate-700">{detailModal.user.userProfile?.phoneNumber || "—"}</span></div>
                    <div><span className="text-slate-400">Số CCCD/Passport:</span> <span className="text-slate-700">{detailModal.user.hostProfile.cccdNumber || "—"}</span></div>
                    <div><span className="text-slate-400">Số tài khoản ngân hàng:</span> <span className="text-slate-700">{detailModal.user.hostProfile.bankAccount || "—"}</span></div>
                    <div className="col-span-2"><span className="text-slate-400">Ngân hàng thụ hưởng:</span> <span className="text-slate-700">{detailModal.user.hostProfile.bankName || "—"}</span></div>
                  </div>
                </div>
              )}

              {/* Enterprise Profile (if exists) */}
              {detailModal.user.enterpriseProfile && (
                <div>
                  <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-50">Hồ sơ Doanh nghiệp</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                    <div><span className="text-slate-400">Tên công ty đăng ký:</span> <span className="text-slate-700">{detailModal.user.enterpriseProfile.companyName || "—"}</span></div>
                    <div><span className="text-slate-400">Người đại diện pháp lý:</span> <span className="text-slate-700">{detailModal.user.enterpriseProfile.representativeName || "—"}</span></div>
                    <div><span className="text-slate-400">Mã số thuế DN:</span> <span className="text-slate-700">{detailModal.user.enterpriseProfile.taxCode || "—"}</span></div>
                    <div className="col-span-2"><span className="text-slate-400">Địa chỉ trụ sở:</span> <span className="text-slate-700">{detailModal.user.enterpriseProfile.companyAddress || "—"}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
