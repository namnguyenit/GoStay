"use client";

import React from "react";
import { useApprovedEnterprises } from "./hook/useApprovedEnterprises";
import { EnterpriseDetailModal } from "../enterprises/components/EnterpriseDetailModal";

export function ApprovedEnterprisesScreen() {
  const { enterprises, loading, detailModal, setDetailModal } = useApprovedEnterprises();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Doanh nghiệp Đã Duyệt</h2>
        <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border">
          {enterprises.length} đối tác doanh nghiệp
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Username</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Doanh nghiệp</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Người đại diện</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Mã số thuế</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Đang tải danh sách...
                </td>
              </tr>
            ) : enterprises.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Chưa có doanh nghiệp nào được xét duyệt.
                </td>
              </tr>
            ) : (
              enterprises.map((user) => {
                const ep = user.enterpriseProfile;
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      <div>
                        <div className="font-semibold text-gray-900">{user.username}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="font-semibold text-gray-900">{ep?.companyName || "—"}</div>
                      <div className="text-xs text-gray-400 truncate max-w-xs">{ep?.companyAddress}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-medium">{ep?.representativeName || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{ep?.taxCode || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDetailModal({ open: true, user })}
                        className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Enterprise Detail Modal */}
      <EnterpriseDetailModal
        isOpen={detailModal.open}
        user={detailModal.user}
        onClose={() => setDetailModal({ open: false, user: null })}
      />
    </div>
  );
}
