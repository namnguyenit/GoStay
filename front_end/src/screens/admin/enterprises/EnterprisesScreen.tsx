"use client";

import React from "react";
import { useAdminEnterprises, Tab } from "./hook/useAdminEnterprises";
import { EnterprisesTable } from "./components/EnterprisesTable";
import { EnterpriseDetailModal } from "./components/EnterpriseDetailModal";

export function EnterprisesScreen() {
  const {
    tab,
    setTab,
    pendingCount,
    allCount,
    loading,
    displayed,
    detailModal,
    setDetailModal,
    handleApprove,
  } = useAdminEnterprises();

  return (
    <div className="space-y-6 animate-smooth-appear">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Xét duyệt doanh nghiệp</h2>
          <p className="text-xs text-slate-400 mt-1">Xét duyệt các yêu cầu đăng ký tài khoản doanh nghiệp (Enterprise).</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-slate-100/80 p-0.5 rounded-full">
        {(["pending", "all"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              tab === t
                ? "bg-white shadow-sm text-slate-800"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t === "pending"
              ? `⏳ Chờ xét duyệt (${pendingCount})`
              : `🏢 Tất cả doanh nghiệp (${allCount})`}
          </button>
        ))}
      </div>

      {/* Table List */}
      <EnterprisesTable
        loading={loading}
        displayed={displayed}
        tab={tab}
        onViewDetail={(user) => setDetailModal({ open: true, user })}
        onApprove={handleApprove}
      />

      {/* Detail Modal */}
      <EnterpriseDetailModal
        isOpen={detailModal.open}
        user={detailModal.user}
        onClose={() => setDetailModal({ open: false, user: null })}
      />
    </div>
  );
}
