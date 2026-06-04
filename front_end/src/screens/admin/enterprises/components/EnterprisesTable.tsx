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
    <div className="bg-white rounded-[20px] border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username</th>
            <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doanh nghiệp</th>
            <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Người đại diện</th>
            <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã số thuế</th>
            <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
            <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right pr-6">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-5 py-6 text-center text-slate-400 font-medium">
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : displayed.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-5 py-8 text-center text-slate-400 font-medium">
                {tab === "pending"
                  ? "Không có doanh nghiệp nào chờ duyệt."
                  : "Chưa có doanh nghiệp nào."}
              </td>
            </tr>
          ) : (
            displayed.map((user) => {
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
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                        ep?.approvalStatus === "PENDING"
                          ? "bg-amber-50 text-amber-700 border border-amber-100/50"
                          : ep?.approvalStatus === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100/50"
                          : "bg-red-50 text-red-700 border border-red-100/50"
                      }`}
                    >
                      {ep?.approvalStatus || "PENDING"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right pr-6">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => onViewDetail(user)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                      >
                        Chi tiết
                      </button>

                      {ep?.approvalStatus === "PENDING" && (
                        <>
                          <button
                            onClick={() => onApprove(user.id, true)}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => onApprove(user.id, false)}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors"
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
