"use client";

import { useEffect, useState } from "react";
import AdminService from "@/services/admin.service";

type Tab = "pending" | "all";

export default function AdminHostsPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [pendingHosts, setPendingHosts] = useState<any[]>([]);
  const [allHosts, setAllHosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState<{ open: boolean; host: any | null }>({
    open: false,
    host: null,
  });
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.allSettled([
        AdminService.getPendingHosts(0, 50),
        AdminService.getAllHosts(0, 50),
      ]);
      if (pendingRes.status === "fulfilled") {
        setPendingHosts(pendingRes.value?.data?.content ?? []);
      }
      if (allRes.status === "fulfilled") {
        setAllHosts(allRes.value?.data?.content ?? []);
      }
    } catch (err) {
      console.error("Failed to load hosts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewDetail = async (id: string) => {
    setDetailModal({ open: true, host: null });
    setDetailLoading(true);
    try {
      const res = await AdminService.getHostDetail(id);
      setDetailModal({ open: true, host: res?.data ?? null });
    } catch {
      setDetailModal({ open: true, host: { error: true } });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async (id: string, approved: boolean) => {
    const label = approved ? "PHÊ DUYỆT" : "TỪ CHỐI";
    if (!confirm(`Bạn có chắc muốn ${label} đơn này?`)) return;
    try {
      await AdminService.approveHost(id, approved);
      if (approved) {
        try {
          await AdminService.completeHostUpgrade(id);
        } catch {}
      }
      fetchData();
    } catch {
      alert("Có lỗi xảy ra.");
    }
  };

  const displayed = tab === "pending" ? pendingHosts : allHosts;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quản lý Host</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-gray-200">
        {(["pending", "all"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "pending"
              ? `⏳ Chờ duyệt (${pendingHosts.length})`
              : `🏠 Tất cả Hosts (${allHosts.length})`}
          </button>
        ))}
      </div>

      {/* Table */}
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
                        onClick={() => handleViewDetail(host.id)}
                        className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
                      >
                        Chi tiết
                      </button>
                      {tab === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(host.id, true)}
                            className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 font-medium"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleApprove(host.id, false)}
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

      {/* Detail Modal */}
      {detailModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Chi tiết Host</h3>
              <button
                onClick={() => setDetailModal({ open: false, host: null })}
                className="text-gray-400 hover:text-gray-700 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {detailLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-100 animate-pulse rounded" />
                ))}
              </div>
            ) : detailModal.host?.error ? (
              <p className="text-red-500 text-sm">Không thể tải thông tin chi tiết.</p>
            ) : detailModal.host ? (
              <div className="space-y-2 text-sm">
                {Object.entries(detailModal.host).map(([key, val]) => (
                  <div key={key} className="flex gap-2 border-b border-gray-100 pb-2">
                    <span className="font-medium text-gray-500 w-36 shrink-0">{key}</span>
                    <span className="text-gray-800 break-all">
                      {typeof val === "object" ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Không có dữ liệu.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
