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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Xét duyệt Doanh nghiệp (Enterprise)</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-px">
        {(["pending", "all"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t
                ? "border-[#20a8d8] text-[#20a8d8]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "pending"
              ? `⏳ Chờ xét duyệt (${pendingCount})`
              : `🏢 Tất cả Doanh nghiệp (${allCount})`}
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
