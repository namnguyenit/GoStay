"use client";

import React from "react";
import { useApprovedEnterprises } from "./hook/useApprovedEnterprises";
import { EnterpriseDetailModal } from "../enterprises/components/EnterpriseDetailModal";

export function ApprovedEnterprisesScreen() {
  const { enterprises, loading, detailModal, setDetailModal } = useApprovedEnterprises();

  return (
    <div className="space-y-6 animate-smooth-appear">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Doanh nghiệp đã duyệt</h2>
          <p className="text-xs text-slate-400 mt-1">Danh sách đối tác doanh nghiệp đã được xác thực trên hệ thống.</p>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 bg-slate-105/80 border border-slate-100 px-2.5 py-0.5 rounded-full self-start">
          {enterprises.length} đối tác
        </span>
      </div>

      <div className="bg-white rounded-[20px] border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username</th>
              <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doanh nghiệp</th>
              <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Người đại diện</th>
              <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã số thuế</th>
              <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right pr-6">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-400 font-medium">
                  Đang tải danh sách...
                </td>
              </tr>
            ) : enterprises.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400 font-medium">
                  Chưa có doanh nghiệp nào được xét duyệt.
                </td>
              </tr>
            ) : (
              enterprises.map((user) => {
                const ep = user.enterpriseProfile;
                return (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <div className="font-semibold text-slate-800">{user.username}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-650">
                      <div className="font-semibold text-slate-800">{ep?.companyName || "—"}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">{ep?.companyAddress}</div>
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

      {/* Enterprise Detail Modal */}
      <EnterpriseDetailModal
        isOpen={detailModal.open}
        user={detailModal.user}
        onClose={() => setDetailModal({ open: false, user: null })}
      />
    </div>
  );
}
