"use client";

import Image from "next/image";
import React from "react";
import { AdminUser } from "@/services/admin.service";

interface EnterpriseDetailModalProps {
  isOpen: boolean;
  user: AdminUser | null;
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
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-xl animate-scale-up">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-800 text-sm">Chi tiết Hồ sơ Doanh nghiệp</h3>
            <p className="mt-0.5 max-w-[260px] truncate text-[10px] text-slate-400">Tài khoản: {user.username}</p>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 text-xs text-slate-600 sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            {user.userProfile?.avatarUrl ? (
              <Image
                unoptimized
                src={user.userProfile.avatarUrl}
                alt="avatar"
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover border border-slate-100 bg-slate-50"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm border border-slate-200">
                {user.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h4 className="truncate text-sm font-semibold text-slate-800">{user.username}</h4>
              <p className="break-all text-[11px] text-slate-400">{user.email}</p>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider inline-block mt-1 ${
                  ep?.approvalStatus === "PENDING"
                    ? "bg-white text-slate-800 border border-slate-300"
                    : ep?.approvalStatus === "APPROVED"
                    ? "bg-slate-100 text-slate-900 border border-slate-200"
                    : "bg-white text-slate-500 border border-slate-300"
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
                  <span className="break-words font-semibold text-slate-800">{ep.companyName || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Mã số thuế doanh nghiệp</span>
                  <span className="inline-block max-w-full break-all rounded border border-slate-100 bg-slate-50 px-2 py-1 font-mono font-semibold text-slate-700">
                    {ep.taxCode || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Người đại diện pháp luật</span>
                  <span className="break-words font-semibold text-slate-800">{ep.representativeName || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Địa chỉ trụ sở chính</span>
                  <span className="block break-words rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 font-medium leading-relaxed text-slate-700">
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
