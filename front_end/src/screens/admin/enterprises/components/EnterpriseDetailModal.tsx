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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Chi tiết Hồ sơ Doanh nghiệp</h3>
            <p className="text-xs text-gray-500">Tài khoản: {user.username}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="flex gap-4 items-center">
            {user.userProfile?.avatarUrl ? (
              <img
                src={user.userProfile.avatarUrl}
                alt="avatar"
                className="w-14 h-14 rounded-full object-cover border border-gray-200 bg-gray-50"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-extrabold text-xl border border-red-200">
                {user.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h4 className="text-lg font-bold text-gray-900">{user.username}</h4>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span
                className={`text-2xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block mt-1 ${
                  ep?.approvalStatus === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : ep?.approvalStatus === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                Trạng thái: {ep?.approvalStatus || "PENDING"}
              </span>
            </div>
          </div>

          {ep && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-2 border-b pb-1">
                Thông tin Pháp nhân
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs">Tên công ty / Doanh nghiệp:</span>
                  <span className="font-semibold text-gray-800 text-base">{ep.companyName || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Mã số thuế doanh nghiệp:</span>
                  <span className="font-mono font-bold text-gray-800 bg-gray-50 px-2 py-1 rounded border border-gray-100 inline-block mt-0.5">
                    {ep.taxCode || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Người đại diện pháp luật:</span>
                  <span className="font-semibold text-gray-800">{ep.representativeName || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Địa chỉ trụ sở chính:</span>
                  <span className="font-medium text-gray-700 leading-relaxed block bg-gray-50 p-2.5 rounded border border-gray-100">
                    {ep.companyAddress || "—"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
