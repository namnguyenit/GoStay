"use client";

import React from "react";
import { useAdminEnterprises, Tab } from "./hook/useAdminEnterprises";
import { EnterprisesTable } from "./components/EnterprisesTable";
import { EnterpriseDetailModal } from "./components/EnterpriseDetailModal";
import { AdminConfirmDialog } from "@/screens/admin/_components/AdminConfirmDialog";
import { AdminPagination } from "@/screens/admin/_components/AdminPagination";

export function EnterprisesScreen() {
  const {
    tab,
    setTab,
    pendingCount,
    allCount,
    loading,
    actionLoading,
    displayed,
    page,
    setPage,
    totalPages,
    totalElements,
    pageSize,
    detailModal,
    setDetailModal,
    confirm,
    setConfirm,
    feedback,
    handleConfirm,
    handleApprove,
  } = useAdminEnterprises();

  return (
    <div className="min-w-0 space-y-6 animate-smooth-appear">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-slate-800">Xét duyệt doanh nghiệp</h2>
          <p className="text-xs text-slate-400 mt-1">Xét duyệt các yêu cầu đăng ký tài khoản doanh nghiệp (Enterprise).</p>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-xs font-semibold ${
            feedback.type === "success"
              ? "border-slate-200 bg-white text-slate-800"
              : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Tabs */}
      <div className="inline-flex max-w-full flex-wrap rounded-full bg-slate-100/80 p-0.5">
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
      <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <EnterprisesTable
          loading={loading}
          displayed={displayed}
          tab={tab}
          onViewDetail={(user) => setDetailModal({ open: true, user })}
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

      {/* Detail Modal */}
      <EnterpriseDetailModal
        isOpen={detailModal.open}
        user={detailModal.user}
        onClose={() => setDetailModal({ open: false, user: null })}
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
