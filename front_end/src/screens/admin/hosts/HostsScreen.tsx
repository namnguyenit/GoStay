"use client";

import React from "react";
import { useAdminHosts, Tab } from "./hook/useAdminHosts";
import { HostsTable } from "./components/HostsTable";
import { HostDetailModal } from "./components/HostDetailModal";

export function HostsScreen() {
  const {
    tab, setTab, pendingCount, allCount, loading, displayed,
    detailModal, setDetailModal, detailLoading, handleViewDetail, handleApprove
  } = useAdminHosts();

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quản lý Host</h2>

      {/* Tabs Layout */}
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
            {t === "pending" ? `⏳ Chờ duyệt (${pendingCount})` : `🏠 Tất cả Hosts (${allCount})`}
          </button>
        ))}
      </div>

      {/* Tái sử dụng Component Bảng */}
      <HostsTable 
        loading={loading} 
        displayed={displayed} 
        tab={tab} 
        onViewDetail={handleViewDetail} 
        onApprove={handleApprove} 
      />

      {/* Tái sử dụng Component Modal */}
      <HostDetailModal 
        isOpen={detailModal.open}
        hostData={detailModal.host}
        isLoading={detailLoading}
        onClose={() => setDetailModal({ open: false, host: null })}
      />
    </div>
  );
}