"use client";

import React from "react";

interface EnterpriseDetailModalProps {
  isOpen: boolean;
  user: any | null;
  onClose: () => void;
}

export function EnterpriseDetailModal({
  isOpen,
  user,
  onClose,
}: EnterpriseDetailModalProps) {
  if (!isOpen || !user) return null;

  const ep = user.enterpriseProfile;

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-[20px] shadow-xl border border-slate-100 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Chi tiết Hồ sơ Doanh nghiệp</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Tài khoản: {user.username}</p>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-600">
          <div className="flex gap-3 items-center">
            {user.userProfile?.avatarUrl ? (
              <img
                src={user.userProfile.avatarUrl}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover border border-slate-100 bg-slate-50"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm border border-slate-200">
                {user.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h4 className="font-semibold text-slate-800 text-sm">{user.username}</h4>
              <p className="text-[11px] text-slate-400">{user.email}</p>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider inline-block mt-1 ${
                  ep?.approvalStatus === "PENDING"
                    ? "bg-amber-50 text-amber-700 border border-amber-100/50"
                    : ep?.approvalStatus === "APPROVED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100/50"
                    : "bg-red-50 text-red-700 border border-red-100/50"
                }`}
              >
                Trạng thái: {ep?.approvalStatus || "PENDING"}
              </span>
            </div>
          </div>

          {ep && (
            <div className="space-y-4">
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-100 pb-1">
                Thông tin Pháp nhân
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Tên công ty / Doanh nghiệp</span>
                  <span className="font-semibold text-slate-800">{ep.companyName || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Mã số thuế doanh nghiệp</span>
                  <span className="font-mono font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100 inline-block">
                    {ep.taxCode || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Người đại diện pháp luật</span>
                  <span className="font-semibold text-slate-800">{ep.representativeName || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Địa chỉ trụ sở chính</span>
                  <span className="font-medium text-slate-700 leading-relaxed block bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                    {ep.companyAddress || "—"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-full text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
