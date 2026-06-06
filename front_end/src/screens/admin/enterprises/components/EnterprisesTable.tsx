"use client";

import { AdminUser } from "@/services/admin.service";
import { Tab } from "../hook/useAdminEnterprises";

interface EnterprisesTableProps {
  loading: boolean;
  displayed: AdminUser[];
  tab: Tab;
  onViewDetail: (user: AdminUser) => void;
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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Username</th>
            <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Doanh nghiệp</th>
            <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Người đại diện</th>
            <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Mã số thuế</th>
            <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Trạng thái</th>
            <th className="px-5 py-3 pr-6 text-right text-[10px] font-bold tracking-wider text-slate-400 uppercase">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td colSpan={6} className="px-5 py-4">
                  <div className="h-4 rounded bg-slate-50 animate-pulse" />
                </td>
              </tr>
            ))
          ) : displayed.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-5 py-8 text-center font-medium text-slate-400">
                {tab === "pending"
                  ? "Không có doanh nghiệp nào chờ duyệt."
                  : "Chưa có doanh nghiệp nào."}
              </td>
            </tr>
          ) : (
            displayed.map((user) => {
              const ep = user.enterpriseProfile;
              const status = ep?.approvalStatus ?? "PENDING";

              return (
                <tr key={user.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <div>
                      <div className="font-semibold text-slate-800">{user.username || "—"}</div>
                      <div className="mt-0.5 text-[10px] text-slate-400">{user.email || "—"}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-650">
                    <div className="font-semibold text-slate-800">{ep?.companyName || "—"}</div>
                    <div className="mt-0.5 max-w-xs truncate text-[10px] text-slate-400">{ep?.companyAddress || "—"}</div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-600">{ep?.representativeName || "—"}</td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">{ep?.taxCode || "—"}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        status === "PENDING"
                          ? "border border-amber-100/50 bg-amber-50 text-amber-700"
                          : status === "APPROVED"
                          ? "border border-emerald-100/50 bg-emerald-50 text-emerald-700"
                          : "border border-red-100/50 bg-red-50 text-red-700"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 pr-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onViewDetail(user)}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-200"
                      >
                        Chi tiết
                      </button>

                      {status === "PENDING" && (
                        <>
                          <button
                            type="button"
                            onClick={() => onApprove(user.id, true)}
                            className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-emerald-700"
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            onClick={() => onApprove(user.id, false)}
                            className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-100"
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
