"use client";

import React from "react";
import { Tab } from "../hook/useAdminEnterprises";

interface EnterprisesTableProps {
  loading: boolean;
  displayed: any[];
  tab: Tab;
  onViewDetail: (user: any) => void;
  onApprove: (id: string, approved: boolean) => void;
}

export function EnterprisesTable({
  loading,
  displayed,
  tab,
  onViewDetail,
  onApprove,
}: EnterprisesTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Username</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Doanh nghiệp</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Người đại diện</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Mã số thuế</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : displayed.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                {tab === "pending"
                  ? "Không có doanh nghiệp nào chờ duyệt."
                  : "Chưa có doanh nghiệp nào."}
              </td>
            </tr>
          ) : (
            displayed.map((user) => {
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
                    <div className="font-medium">{ep?.companyName || "—"}</div>
                    <div className="text-xs text-gray-400 truncate max-w-xs">{ep?.companyAddress}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-medium">{ep?.representativeName || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{ep?.taxCode || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        ep?.approvalStatus === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : ep?.approvalStatus === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {ep?.approvalStatus || "PENDING"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => onViewDetail(user)}
                        className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium"
                      >
                        Chi tiết
                      </button>

                      {ep?.approvalStatus === "PENDING" && (
                        <>
                          <button
                            onClick={() => onApprove(user.id, true)}
                            className="text-xs px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100 font-medium"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => onApprove(user.id, false)}
                            className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
