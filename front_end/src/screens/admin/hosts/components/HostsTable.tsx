import { AdminUser } from "@/services/admin.service";
import { Tab } from "@/screens/admin/hosts/hook/useAdminHosts";

interface HostsTableProps {
  loading: boolean;
  displayed: AdminUser[];
  tab: Tab;
  onViewDetail: (id: string) => void;
  onApprove: (id: string, approved: boolean) => void;
}

export function HostsTable({ loading, displayed, tab, onViewDetail, onApprove }: HostsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr>
            <th className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 text-left text-[10px] font-bold tracking-wider text-slate-400 uppercase">Username</th>
            <th className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 text-left text-[10px] font-bold tracking-wider text-slate-400 uppercase">Email</th>
            <th className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 text-left text-[10px] font-bold tracking-wider text-slate-400 uppercase">Trạng thái</th>
            <th className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 text-right text-[10px] font-bold tracking-wider text-slate-400 uppercase">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td colSpan={4} className="px-5 py-4">
                  <div className="h-4 rounded bg-slate-50 animate-pulse" />
                </td>
              </tr>
            ))
          ) : displayed.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-xs font-medium text-slate-400">
                {tab === "pending" ? "Không có đơn nào đang chờ duyệt." : "Chưa có Host nào."}
              </td>
            </tr>
          ) : (
            displayed.map((host) => {
              const status = host.hostProfile?.approvalStatus ?? "PENDING";

              return (
                <tr key={host.id} className="transition-colors hover:bg-slate-50/30">
                  <td className="px-5 py-3.5 text-[13.5px] font-semibold text-slate-800">
                    <div className="max-w-[220px] truncate">{host.username || "—"}</div>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-medium text-slate-455">
                    <div className="max-w-[260px] truncate">{host.email || "—"}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                      status === "PENDING"
                        ? "border-slate-300 bg-white text-slate-800"
                        : status === "APPROVED"
                        ? "border-slate-200 bg-slate-100 text-slate-900"
                        : "border-slate-300 bg-white text-slate-500"
                    }`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onViewDetail(host.id)}
                        className="rounded-lg border border-slate-200/70 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-650 transition-colors hover:bg-slate-50"
                      >
                        Chi tiết
                      </button>
                      {status === "PENDING" && (
                        <>
                          <button
                            type="button"
                            onClick={() => onApprove(host.id, true)}
                            className="rounded-lg border border-slate-900 bg-slate-900 px-2.5 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-slate-950"
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            onClick={() => onApprove(host.id, false)}
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-100"
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
