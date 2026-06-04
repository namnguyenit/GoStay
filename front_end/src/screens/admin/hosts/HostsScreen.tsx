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
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Quản lý đối tác Host</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Phê duyệt và theo dõi các đối tác lưu trú</p>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="inline-flex bg-slate-100/85 p-1 rounded-full border border-slate-150 mb-2">
        {(["pending", "all"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              tab === t
                ? "bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] text-slate-800"
                : "text-slate-500 hover:text-slate-800"
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