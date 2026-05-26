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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Username</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td colSpan={4} className="px-4 py-3">
                  <div className="h-4 bg-gray-100 animate-pulse rounded" />
                </td>
              </tr>
            ))
          ) : displayed.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                {tab === "pending" ? "Không có đơn nào đang chờ duyệt." : "Chưa có Host nào."}
              </td>
            </tr>
          ) : (
            displayed.map((host) => (
              <tr key={host.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{host.username}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{host.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                    {host.approvalStatus ?? host.status ?? "PENDING"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetail(host.id)}
                      className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
                    >
                      Chi tiết
                    </button>
                    {tab === "pending" && (
                      <>
                        <button
                          onClick={() => onApprove(host.id, true)}
                          className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 font-medium"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => onApprove(host.id, false)}
                          className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 font-medium"
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