"use client";

import React from "react";
import { useApprovedEnterprises } from "./hook/useApprovedEnterprises";
import { EnterpriseDetailModal } from "../enterprises/components/EnterpriseDetailModal";

export function ApprovedEnterprisesScreen() {
  const { enterprises, loading, feedback, detailModal, setDetailModal } = useApprovedEnterprises();

  return (
    <div className="min-w-0 space-y-6 animate-smooth-appear">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-slate-900">Doanh nghiệp đã duyệt</h2>
          <p className="text-xs text-slate-500 mt-1">Danh sách đối tác doanh nghiệp đã được xác thực trên hệ thống.</p>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100/80 border border-slate-100 px-2.5 py-0.5 rounded-full self-start">
          {enterprises.length} đối tác
        </span>
      </div>

      {feedback && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-700">
          {feedback.message}
        </div>
      )}

      <div className="bg-white rounded-[20px] border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Username</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Doanh nghiệp</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Người đại diện</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mã số thuế</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right pr-6">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-slate-500 font-medium">
                    Đang tải danh sách...
                  </td>
                </tr>
              ) : enterprises.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500 font-medium">
                    Chưa có doanh nghiệp nào được xét duyệt.
                  </td>
                </tr>
              ) : (
                enterprises.map((user) => {
                  const ep = user.enterpriseProfile;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900">{user.username}</div>
                          <div className="mt-0.5 max-w-[220px] truncate text-[10px] text-slate-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        <div className="font-semibold text-slate-900">{ep?.companyName || "—"}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">{ep?.companyAddress}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-medium">{ep?.representativeName || "—"}</td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">{ep?.taxCode || "—"}</td>
                      <td className="px-5 py-3.5 text-right pr-6">
                        <button
                          onClick={() => setDetailModal({ open: true, user })}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
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
