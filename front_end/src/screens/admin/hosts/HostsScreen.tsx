"use client";

import React from "react";
import { useAdminHosts, Tab } from "./hook/useAdminHosts";
import { HostsTable } from "./components/HostsTable";
import { HostDetailModal } from "./components/HostDetailModal";
import { AdminConfirmDialog } from "@/screens/admin/_components/AdminConfirmDialog";
import { AdminPagination } from "@/screens/admin/_components/AdminPagination";

export function HostsScreen() {
  const {
    tab, setTab, pendingCount, allCount, loading, actionLoading, displayed,
    page, setPage, totalPages, totalElements, pageSize,
    detailModal, setDetailModal, detailLoading,
    confirm, setConfirm, feedback, handleConfirm,
    handleViewDetail, handleApprove
  } = useAdminHosts();

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Quản lý đối tác Host</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Phê duyệt và theo dõi các đối tác lưu trú</p>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-xs font-semibold ${
            feedback.type === "success"
              ? "border-slate-200 bg-white text-slate-900"
              : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Tabs Layout */}
      <div className="mb-2 inline-flex max-w-full flex-wrap rounded-full border border-slate-200 bg-slate-100/85 p-1">
        {(["pending", "all"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              tab === t
                ? "bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] text-slate-900"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {t === "pending" ? `⏳ Chờ duyệt (${pendingCount})` : `🏠 Tất cả Hosts (${allCount})`}
          </button>
        ))}
      </div>

      {/* Tái sử dụng Component Bảng */}
      <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <HostsTable 
          loading={loading} 
          displayed={displayed} 
          tab={tab} 
          onViewDetail={handleViewDetail} 
          onApprove={handleApprove} 
        />
        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          loading={loading}
          onPageChange={setPage}
        />
      </div>

      {/* Tái sử dụng Component Modal */}
      <HostDetailModal 
        isOpen={detailModal.open}
        hostData={detailModal.host}
        isLoading={detailLoading}
        onClose={() => setDetailModal({ open: false, host: null })}
      />

      <AdminConfirmDialog
        open={confirm.open}
        title={confirm.open ? confirm.title : ""}
        description={confirm.open ? confirm.description : undefined}
        confirmLabel={confirm.open ? confirm.confirmLabel : undefined}
        intent={confirm.open ? confirm.intent : "default"}
        loading={actionLoading}
        onOpenChange={(open) => setConfirm(open ? confirm : { open: false })}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
