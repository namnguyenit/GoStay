import React from "react";
import { Tab } from "@/screens/admin/hosts/hook/useAdminHosts";

interface HostsTableProps {
  loading: boolean;
  displayed: any[];
  tab: Tab;
  onViewDetail: (id: string) => void;
  onApprove: (id: string, approved: boolean) => void;
}

export function HostsTable({ loading, displayed, tab, onViewDetail, onApprove }: HostsTableProps) {
  return (
    <div className="bg-white rounded-[20px] border border-slate-100 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Username</th>
            <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Email</th>
            <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Trạng thái</th>
            <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td colSpan={4} className="px-5 py-4">
                  <div className="h-4 bg-slate-50 animate-pulse rounded" />
                </td>
              </tr>
            ))
          ) : displayed.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-xs text-slate-400 font-medium">
                {tab === "pending" ? "Không có đơn nào đang chờ duyệt." : "Chưa có Host nào."}
              </td>
            </tr>
          ) : (
            displayed.map((host) => (
              <tr key={host.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-slate-800 text-[13.5px]">{host.username}</td>
                <td className="px-5 py-3.5 text-slate-455 text-xs font-medium">{host.email}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    (host.approvalStatus ?? host.status ?? "PENDING") === "PENDING"
                      ? "bg-amber-50 text-amber-600 border-amber-100/50"
                      : (host.approvalStatus ?? host.status ?? "") === "APPROVED"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                      : "bg-rose-50 text-rose-600 border-rose-100/50"
                  }`}>
                    {host.approvalStatus ?? host.status ?? "PENDING"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetail(host.id)}
                      className="text-[11px] px-2.5 py-1.5 rounded-lg border font-bold bg-white text-slate-650 border-slate-200/70 hover:bg-slate-50 transition-colors"
                    >
                      Chi tiết
                    </button>
                    {tab === "pending" && (
                      <>
                        <button
                          onClick={() => onApprove(host.id, true)}
                          className="text-[11px] px-2.5 py-1.5 rounded-lg border font-bold bg-emerald-50 text-emerald-600 border-emerald-100/40 hover:bg-emerald-100/60 transition-colors"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => onApprove(host.id, false)}
                          className="text-[11px] px-2.5 py-1.5 rounded-lg border font-bold bg-rose-50 text-rose-650 border-rose-100/40 hover:bg-rose-100/60 transition-colors"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}