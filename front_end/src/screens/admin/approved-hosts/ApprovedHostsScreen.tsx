"use client";

import { useApprovedHosts } from "./hook/useApprovedHosts";

export function ApprovedHostsScreen() {
  const { hosts, loading, detailModal, setDetailModal } = useApprovedHosts();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Hosts Đã Duyệt</h2>
        <span className="text-sm text-gray-400">{hosts.length} hosts</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Username</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Họ tên Host</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">SĐT</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">Đang tải...</td>
              </tr>
            ) : hosts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">Chưa có Host nào được duyệt.</td>
              </tr>
            ) : (
              hosts.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{user.username}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{user.hostProfile?.fullName || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{user.hostProfile?.phoneNumber || "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDetailModal({ open: true, user })}
                      className="text-xs px-2 py-1 rounded font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Details Modal (Minimal version) */}
      {detailModal.open && detailModal.user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">Chi tiết Host</h3>
              <button 
                onClick={() => setDetailModal({ open: false, user: null })}
                className="text-gray-400 hover:text-gray-600"
              >✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex gap-4 items-start">
                {detailModal.user.userProfile?.avatarUrl ? (
                  <img src={detailModal.user.userProfile.avatarUrl} alt="avatar" className="w-16 h-16 rounded-full object-cover border" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl border">
                    {detailModal.user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{detailModal.user.username}</h4>
                  <p className="text-gray-500">{detailModal.user.email}</p>
                  <p className="text-sm mt-1 text-green-600 font-medium">Trạng thái: ĐÃ DUYỆT</p>
                </div>
              </div>

              {detailModal.user.hostProfile && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b">Hồ sơ Host</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Họ tên:</span> <span className="font-medium">{detailModal.user.hostProfile.fullName || "—"}</span></div>
                    <div><span className="text-gray-500">SĐT:</span> <span className="font-medium">{detailModal.user.hostProfile.phoneNumber || "—"}</span></div>
                    <div><span className="text-gray-500">Mã số thuế:</span> <span className="font-medium">{detailModal.user.hostProfile.taxCode || "—"}</span></div>
                  </div>
                  
                  {(detailModal.user.hostProfile.frontImageUrl || detailModal.user.hostProfile.backImageUrl) && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {detailModal.user.hostProfile.frontImageUrl && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Mặt trước CCCD</p>
                          <img src={detailModal.user.hostProfile.frontImageUrl} alt="CCCD Front" className="w-full h-32 object-cover rounded-lg border" />
                        </div>
                      )}
                      {detailModal.user.hostProfile.backImageUrl && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Mặt sau CCCD</p>
                          <img src={detailModal.user.hostProfile.backImageUrl} alt="CCCD Back" className="w-full h-32 object-cover rounded-lg border" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
