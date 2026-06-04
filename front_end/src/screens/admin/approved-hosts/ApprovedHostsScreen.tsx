"use client";

import { useApprovedHosts } from "./hook/useApprovedHosts";

export function ApprovedHostsScreen() {
  const { hosts, loading, detailModal, setDetailModal } = useApprovedHosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Đối tác Host đã duyệt</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Danh sách các đối tác hoạt động cung cấp dịch vụ lưu trú</p>
        </div>
        <span className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">{hosts.length} hosts</span>
      </div>

      <div className="bg-white rounded-[20px] border border-slate-100 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Username</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Email</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Họ tên Host</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">SĐT</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-400 font-medium">Đang tải dữ liệu...</td>
              </tr>
            ) : hosts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-400 font-medium">Chưa có Host nào được duyệt.</td>
              </tr>
            ) : (
              hosts.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-800 text-[13.5px]">{user.username}</td>
                  <td className="px-5 py-3.5 text-slate-455 text-xs font-medium">{user.email}</td>
                  <td className="px-5 py-3.5 text-slate-650 text-xs font-semibold">{user.userProfile?.fullName || "—"}</td>
                  <td className="px-5 py-3.5 text-slate-455 text-xs font-medium">{user.userProfile?.phoneNumber || "—"}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setDetailModal({ open: true, user })}
                      className="text-[11px] px-2.5 py-1.5 rounded-lg border font-bold bg-white text-slate-650 border-slate-200/70 hover:bg-slate-50 transition-colors"
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
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-base text-slate-800">Chi tiết đối tác Host</h3>
              <button 
                onClick={() => setDetailModal({ open: false, user: null })}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-colors"
              >✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex gap-4 items-center">
                {detailModal.user.userProfile?.avatarUrl ? (
                  <img src={detailModal.user.userProfile.avatarUrl} alt="avatar" className="w-16 h-16 rounded-full object-cover border border-slate-100 shadow-sm" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 text-xl font-bold border border-slate-100">
                    {detailModal.user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-base font-semibold text-slate-800 leading-none">{detailModal.user.username}</h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{detailModal.user.email}</p>
                  <p className="text-[10px] mt-2 text-emerald-600 font-bold bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-full inline-block">ĐÃ DUYỆT HOẠT ĐỘNG</p>
                </div>
              </div>

              {detailModal.user.hostProfile && (
                <div>
                  <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-50">Hồ sơ đối tác Host</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                    <div><span className="text-slate-400">Họ tên:</span> <span className="text-slate-700">{detailModal.user.userProfile?.fullName || "—"}</span></div>
                    <div><span className="text-slate-400">SĐT liên hệ:</span> <span className="text-slate-700">{detailModal.user.userProfile?.phoneNumber || "—"}</span></div>
                    <div><span className="text-slate-400">Số CCCD/Passport:</span> <span className="text-slate-700">{detailModal.user.hostProfile.cccdNumber || "—"}</span></div>
                    <div><span className="text-slate-400">Số tài khoản ngân hàng:</span> <span className="text-slate-700">{detailModal.user.hostProfile.bankAccount || "—"}</span></div>
                    <div className="col-span-2"><span className="text-slate-400">Ngân hàng thụ hưởng:</span> <span className="text-slate-700">{detailModal.user.hostProfile.bankName || "—"}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
