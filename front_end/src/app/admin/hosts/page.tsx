"use client";

import { useEffect, useState } from "react";
import AdminService from "@/services/admin.service";

export default function AdminHostsPage() {
  const [hosts, setHosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingHosts = async () => {
    setLoading(true);
    try {
      // Fetch pending hosts using the admin service
      const res = await AdminService.getPendingHosts(0, 50); // Get first 50
      if (res && res.data && res.data.content) {
        setHosts(res.data.content);
      }
    } catch (error) {
      console.error("Failed to fetch pending hosts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingHosts();
  }, []);

  const handleApprove = async (id: string, isApproved: boolean) => {
    const actionName = isApproved ? "PHÊ DUYỆT" : "TỪ CHỐI";
    if (confirm(`Bạn có chắc chắn muốn ${actionName} đơn đăng ký Host này?`)) {
      try {
        await AdminService.approveHost(id, isApproved);
        if (isApproved) {
            // Also call success endpoint to complete upgrade if backend requires it
            try {
                await AdminService.completeHostUpgrade(id);
            } catch (err) {
                console.error("Failed to complete host upgrade", err);
            }
        }
        fetchPendingHosts(); // Refresh after action
      } catch (error) {
        console.error("Failed to process host approval", error);
        alert("Có lỗi xảy ra khi thực hiện thao tác.");
      }
    }
  };

  if (loading) {
    return <div>Đang tải danh sách chờ duyệt...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Xét duyệt Đơn đăng ký Host</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Username</th>
              <th className="p-4 font-semibold text-gray-600">Email</th>
              <th className="p-4 font-semibold text-gray-600">CCCD/CMND</th>
              <th className="p-4 font-semibold text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {hosts.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  Không có đơn đăng ký nào chờ duyệt.
                </td>
              </tr>
            ) : (
              hosts.map((host) => (
                <tr key={host.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{host.username}</td>
                  <td className="p-4 text-gray-600">{host.email}</td>
                  <td className="p-4 text-gray-600">
                    {/* Assuming host profile data comes here. 
                        Adjust field names based on actual API response */}
                    {host.hostProfile?.idCardNumber || "Chưa cập nhật"}
                  </td>
                  <td className="p-4 space-x-2">
                    <button
                      onClick={() => handleApprove(host.id, true)}
                      className="px-3 py-1 rounded text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200"
                    >
                      Phê duyệt
                    </button>
                    <button
                      onClick={() => handleApprove(host.id, false)}
                      className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Từ chối
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
