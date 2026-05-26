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
    handleUpgradeRole, } = useAdminUser();

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
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.isDeleted
                          ? "bg-red-100 text-red-700"
                          : ""
                      }`}
                    >
                      {user.isDeleted ?"Bị cấm" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailModal({ open: true, user })}
                        className="text-xs px-2 py-1 rounded font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        Chi tiết
                      </button>
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

      {/* User Details Modal */}
      {detailModal.open && detailModal.user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">Chi tiết Người dùng</h3>
              <button 
                onClick={() => setDetailModal({ open: false, user: null })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Basic Info */}
              <div className="flex gap-4 items-start">
                {detailModal.user.userProfile?.avatarUrl ? (
                  <img src={detailModal.user.userProfile.avatarUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover border" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-medium border">
                    {detailModal.user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{detailModal.user.username}</h4>
                  <p className="text-gray-500">{detailModal.user.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {detailModal.user.roles?.map((r: any) => (
                      <span key={r.name ?? r} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {r.name ?? r}
                      </span>
                    ))}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${detailModal.user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {detailModal.user.isActive ? "Hoạt động" : "Bị khóa"}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                      {detailModal.user.provider}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Profile */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b">Thông tin Cá nhân</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Họ tên:</span> <span className="font-medium">{detailModal.user.userProfile?.fullName || "—"}</span></div>
                  <div><span className="text-gray-500">SĐT:</span> <span className="font-medium">{detailModal.user.userProfile?.phoneNumber || "—"}</span></div>
                  <div><span className="text-gray-500">Ngày sinh:</span> <span className="font-medium">{detailModal.user.userProfile?.dateOfBirth || "—"}</span></div>
                </div>
              </div>

              {/* Host Profile (if exists) */}
              {detailModal.user.hostProfile && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b">Hồ sơ Host</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Họ tên:</span> <span className="font-medium">{detailModal.user.userProfile?.fullName || "—"}</span></div>
                    <div><span className="text-gray-500">SĐT:</span> <span className="font-medium">{detailModal.user.userProfile?.phoneNumber || "—"}</span></div>
                    <div><span className="text-gray-500">Số CCCD:</span> <span className="font-medium">{detailModal.user.hostProfile.cccdNumber || "—"}</span></div>
                    <div><span className="text-gray-500">Số tài khoản:</span> <span className="font-medium">{detailModal.user.hostProfile.bankAccount || "—"}</span></div>
                    <div className="col-span-2"><span className="text-gray-500">Ngân hàng:</span> <span className="font-medium">{detailModal.user.hostProfile.bankName || "—"}</span></div>
                  </div>
                </div>
              )}

              {/* Enterprise Profile (if exists) */}
              {detailModal.user.enterpriseProfile && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b">Hồ sơ Doanh nghiệp</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Tên công ty:</span> <span className="font-medium">{detailModal.user.enterpriseProfile.companyName || "—"}</span></div>
                    <div><span className="text-gray-500">Người đại diện:</span> <span className="font-medium">{detailModal.user.enterpriseProfile.representativeName || "—"}</span></div>
                    <div><span className="text-gray-500">Mã số thuế DN:</span> <span className="font-medium">{detailModal.user.enterpriseProfile.taxCode || "—"}</span></div>
                    <div className="col-span-2"><span className="text-gray-500">Địa chỉ công ty:</span> <span className="font-medium">{detailModal.user.enterpriseProfile.companyAddress || "—"}</span></div>
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
