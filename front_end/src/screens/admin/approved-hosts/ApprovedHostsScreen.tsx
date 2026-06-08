"use client";

import Image from "next/image";
import { useApprovedHosts } from "./hook/useApprovedHosts";

export function ApprovedHostsScreen() {
  const { hosts, loading, feedback, detailModal, setDetailModal } = useApprovedHosts();

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Đối tác Host đã duyệt</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Danh sách các đối tác hoạt động cung cấp dịch vụ lưu trú</p>
        </div>
        <span className="w-fit rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">{hosts.length} hosts</span>
      </div>

      {feedback && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-700">
          {feedback.message}
        </div>
      )}

      <div className="bg-white rounded-[20px] border border-slate-100 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Username</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Email</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Họ tên Host</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">SĐT</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-500 font-medium">Đang tải dữ liệu...</td>
                </tr>
              ) : hosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-500 font-medium">Chưa có Host nào được duyệt.</td>
                </tr>
              ) : (
                hosts.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900 text-[13.5px]">{user.username}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs font-medium">{user.email}</td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs font-semibold">{user.userProfile?.fullName || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs font-medium">{user.userProfile?.phoneNumber || "—"}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setDetailModal({ open: true, user })}
                        className="text-[11px] px-2.5 py-1.5 rounded-lg border font-bold bg-white text-slate-600 border-slate-200/70 hover:bg-slate-50 transition-colors"
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
      </div>

      {/* User Details Modal (Minimal version) */}
      {detailModal.open && detailModal.user && (
        <div className="fixed inset-0 bg-sky-600/35 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-base text-slate-900">Chi tiết đối tác Host</h3>
              <button 
                onClick={() => setDetailModal({ open: false, user: null })}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >✕</button>
            </div>
            
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex min-w-0 gap-4 items-center">
                {detailModal.user.userProfile?.avatarUrl ? (
                  <Image
                    unoptimized
                    src={detailModal.user.userProfile.avatarUrl}
                    alt="avatar"
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover border border-slate-100 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 text-xl font-bold border border-slate-100">
                    {detailModal.user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="truncate text-base font-semibold leading-none text-slate-900">{detailModal.user.username}</h4>
                  <p className="mt-1 break-all text-xs font-medium text-slate-500">{detailModal.user.email}</p>
                  <p className="text-[10px] mt-2 text-slate-700 font-bold bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full inline-block">ĐÃ DUYỆT HOẠT ĐỘNG</p>
                </div>
              </div>

              {detailModal.user.hostProfile && (
                <div>
                  <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">Hồ sơ đối tác Host</h4>
                  <div className="grid grid-cols-1 gap-4 text-xs font-medium sm:grid-cols-2">
                    <div><span className="text-slate-500">Họ tên:</span> <span className="text-slate-700">{detailModal.user.userProfile?.fullName || "—"}</span></div>
                    <div><span className="text-slate-500">SĐT liên hệ:</span> <span className="text-slate-700">{detailModal.user.userProfile?.phoneNumber || "—"}</span></div>
                    <div><span className="text-slate-500">Số CCCD/Passport:</span> <span className="text-slate-700">{detailModal.user.hostProfile.cccdNumber || "—"}</span></div>
                    <div><span className="text-slate-500">Số tài khoản ngân hàng:</span> <span className="text-slate-700">{detailModal.user.hostProfile.bankAccount || "—"}</span></div>
                    <div className="sm:col-span-2"><span className="text-slate-500">Ngân hàng thụ hưởng:</span> <span className="text-slate-700">{detailModal.user.hostProfile.bankName || "—"}</span></div>
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
