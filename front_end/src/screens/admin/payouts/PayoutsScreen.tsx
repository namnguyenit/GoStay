"use client";

import Image from "next/image";
import { useState } from "react";
import { useAdminPayouts } from "./hook/useAdminPayouts";
import type { AdminPayout, GroupedPendingPayout } from "./hook/useAdminPayouts";
import { format } from "date-fns";
import { AdminPagination } from "@/screens/admin/_components/AdminPagination";

export function PayoutsScreen() {
  const { 
    payouts, groupedPendingPayouts, historyPayouts, stats, loading, actionResult, handleMarkPaid, handleMarkHostPaid,
    activeTab, setActiveTab, searchQuery, setSearchQuery,
    fetchHostBankDetails, isFetchingBank, selectedHostBank, setSelectedHostBank,
    page, setPage, totalPages, totalElements, pageSize,
    refetch
  } = useAdminPayouts();

  const [selectedBatch, setSelectedBatch] = useState<{ hostId: string; totalAmount: number; count: number } | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<AdminPayout | null>(null);
  const visibleRowCount = activeTab === "PENDING" ? groupedPendingPayouts.length : historyPayouts.length;

  const safeFormatDate = (dateVal: AdminPayout["createdAt"], formatStr: string) => {
    if (!dateVal) return "";
    try {
      let d: Date;
      if (Array.isArray(dateVal)) {
        d = new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0, dateVal[5] || 0);
      } else {
        d = new Date(dateVal);
      }
      return format(d, formatStr);
    } catch {
      return "";
    }
  };

  const openPaymentModalBatch = (batch: GroupedPendingPayout) => {
    setSelectedPayout(null);
    setSelectedBatch(batch);
    fetchHostBankDetails(batch.hostId);
  };

  const closePaymentModal = () => {
    setSelectedPayout(null);
    setSelectedBatch(null);
    setSelectedHostBank(null);
  };

  const confirmPayment = async () => {
    if (selectedBatch) {
      await handleMarkHostPaid(selectedBatch.hostId);
    } else if (selectedPayout) {
      const payoutId = selectedPayout.id || selectedPayout.payoutId;
      if (payoutId) {
        await handleMarkPaid(payoutId);
      }
    }
    closePaymentModal();
  };

  const isMissingBankValue = (value?: string) =>
    !value || value === "Không xác định" || value === "Chưa cấu hình";

  const getVietQrUrl = () => {
    if (!selectedHostBank) return null;
    const { bankName, accountNumber, accountName } = selectedHostBank;
    if (isMissingBankValue(bankName) || isMissingBankValue(accountNumber)) return null;
    
    let amount = 0;
    let content = "";
    
    if (selectedBatch) {
      amount = selectedBatch.totalAmount;
      content = `Thanh toan gop GoTravel Host ${selectedBatch.hostId.substring(0, 8)}`;
    } else if (selectedPayout) {
      amount = selectedPayout.hostAmount || 0;
      content = `Thanh toan GoTravel ${selectedPayout.orderId?.substring(0, 8)}`;
    } else {
      return null;
    }
    
    const encodedBankName = encodeURIComponent(bankName);
    const encodedAccountName = encodeURIComponent(accountName);
    const encodedContent = encodeURIComponent(content);
    
    return `https://img.vietqr.io/image/${encodedBankName}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodedContent}&accountName=${encodedAccountName}`;
  };

  return (
    <div className="min-h-screen min-w-0 space-y-6 animate-smooth-appear">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 leading-tight">Thanh toán (Payouts)</h2>
          <p className="text-xs text-slate-500 mt-1">Quản lý payout host theo dữ liệu phân trang từ Payment service.</p>
        </div>
        <button 
          onClick={refetch} 
          className="px-4 py-2 bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] rounded-full text-xs font-semibold hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-all"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Đồng bộ dữ liệu
        </button>
      </div>

      {actionResult && (
        <div
          className={`p-3.5 rounded-[12px] text-xs font-medium border flex items-center gap-2.5 ${
            actionResult.type === "success"
              ? "bg-white border-slate-200 text-slate-900"
              : "bg-slate-50 border-slate-200 text-slate-700"
          }`}
        >
          {actionResult.type === "success" ? (
            <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          ) : (
            <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          )}
          {actionResult.message}
        </div>
      )}

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="flex min-w-0 flex-col justify-between rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cần Thanh Toán</span>
            <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div>
            <h3 className="break-words text-[clamp(1.15rem,3vw,1.5rem)] font-semibold leading-tight tracking-tight text-slate-900 tabular-nums">{stats.totalPending.toLocaleString()}đ</h3>
            <p className="mt-1 flex flex-wrap items-center gap-1 text-[11px] font-medium text-slate-500">
              <span className="flex items-center font-semibold text-slate-600">
                <svg className="w-3.5 h-3.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Chờ xử lý
              </span>
              trên trang hiện tại
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đã Thanh Toán</span>
            <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div>
            <h3 className="break-words text-[clamp(1.15rem,3vw,1.5rem)] font-semibold leading-tight tracking-tight text-slate-900 tabular-nums">{stats.totalPaid.toLocaleString()}đ</h3>
            <p className="mt-1 flex flex-wrap items-center gap-1 text-[11px] font-medium text-slate-500">
              <span className="flex items-center font-semibold text-slate-600">
                <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                Đã hoàn tất
              </span>
              trên trang hiện tại
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hoa Hồng Theo API</span>
            <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div>
            <h3 className="break-words text-[clamp(1.15rem,3vw,1.5rem)] font-semibold leading-tight tracking-tight text-slate-900 tabular-nums">{stats.totalCommission.toLocaleString()}đ</h3>
            <p className="mt-1 flex flex-wrap items-center gap-1 text-[11px] font-medium text-slate-500">
              <span className="flex items-center font-semibold text-slate-600">
                <svg className="w-3.5 h-3.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Doanh thu
              </span>
              trên trang hiện tại
            </p>
          </div>
        </div>
      </div>

      {/* Tabs & Search Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
        <div className="inline-flex max-w-full flex-wrap self-start rounded-full bg-slate-100/80 p-0.5">
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "PENDING" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Chờ xử lý (Gộp)
          </button>
          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "HISTORY" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Lịch sử chuyển khoản
          </button>
        </div>
        
        <div className="relative w-full sm:w-72">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="Tìm kiếm theo mã..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-100 rounded-full text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-200 transition-all"
          />
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-white rounded-[20px] border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        {loading && payouts.length === 0 ? (
          <div className="p-16 flex justify-center">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin"></div>
          </div>
        ) : visibleRowCount === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs font-medium flex flex-col items-center">
            <svg className="w-10 h-10 text-sky-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            {searchQuery ? "Không tìm thấy dữ liệu phù hợp trong trang hiện tại." : "Tab này chưa có khoản thanh toán nào trong trang hiện tại."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-xs">
              {activeTab === "PENDING" ? (
                // VIEW GỘP THEO HOST CHO PENDING
                <>
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mã Host</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Số đơn hàng</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Tổng cần trả</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right pr-6">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupedPendingPayouts.length === 0 ? (
                      <tr><td colSpan={5} className="p-10 text-center text-slate-500 text-xs">Không có khoản chờ xử lý nào.</td></tr>
                    ) : (
                      groupedPendingPayouts.map((batch) => (
                        <tr key={batch.hostId} className={`hover:bg-slate-50/60 transition-colors group ${batch.hasRequested ? "bg-slate-50/80 hover:bg-slate-100/70" : ""}`}>
                          <td className="px-5 py-3.5 font-mono text-slate-900 font-semibold" title={batch.hostId}>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-sans">
                                H
                              </div>
                              {batch.hostId.substring(0, 12)}...
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className="inline-flex items-center justify-center bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                              {batch.count} đơn
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-semibold text-slate-900 tabular-nums">
                            {batch.totalAmount.toLocaleString()}đ
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            {batch.hasRequested ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white text-slate-900 border border-slate-300">
                                <span className="w-1 h-1 rounded-full bg-blue-800 animate-pulse"></span>
                                Yêu cầu rút
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                                <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                                Chờ đối soát
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right pr-6">
                            <button
                              onClick={() => openPaymentModalBatch(batch)}
                              className="px-3 py-1.5 bg-sky-500 text-white rounded-full text-[11px] font-semibold hover:bg-sky-600 transition-all shadow-sm"
                            >
                              Thanh toán tất cả
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </>
              ) : (
                // VIEW CHI TIẾT TỪNG ĐƠN CHO HISTORY
                <>
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mã đơn & Payout ID</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngày tạo</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mã Host</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tổng tiền đơn</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Thực nhận của Host</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Ngày chuyển</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historyPayouts.length === 0 ? (
                      <tr><td colSpan={6} className="p-10 text-center text-slate-500 text-xs">Không có lịch sử thanh toán nào.</td></tr>
                    ) : (
                      historyPayouts.map((payout) => (
                        <tr key={payout.id || payout.payoutId} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-slate-900" title={payout.orderId}>
                              {payout.orderId?.substring(0, 8)}...
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5" title={payout.id || payout.payoutId}>
                              {(payout.id || payout.payoutId)?.substring(0, 8)}...
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">{safeFormatDate(payout.createdAt, "dd/MM/yyyy HH:mm")}</td>
                          <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500" title={payout.hostId}>
                            {payout.hostId?.substring(0, 8)}...
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 tabular-nums">
                            {payout.totalAmount?.toLocaleString()}đ
                          </td>
                          <td className="px-5 py-3.5 text-right font-semibold text-slate-900 tabular-nums">
                            {payout.hostAmount?.toLocaleString()}đ
                          </td>
                          <td className="px-5 py-3.5 text-center">
                             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                {safeFormatDate(payout.paidAt, "dd/MM HH:mm")}
                             </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </>
              )}
            </table>
          </div>
        )}
        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          loading={loading}
          onPageChange={setPage}
        />
      </div>

      {/* Payment Modal */}
      {(selectedPayout || selectedBatch) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-sky-500/20 backdrop-blur-sm animate-fade-in" onClick={closePaymentModal}></div>
          <div className="relative z-10 flex max-h-[92vh] w-full max-w-sm flex-col overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-xl animate-scale-up">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900 text-sm">Chuyển khoản thanh toán</h3>
              <button onClick={closePaymentModal} className="w-6 h-6 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-600 transition-colors">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="text-center mb-5">
                <div className="text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Số tiền thanh toán</div>
                <div className="break-words text-[clamp(1.35rem,7vw,1.5rem)] font-semibold leading-tight tracking-tight text-slate-900 tabular-nums">
                  {selectedBatch ? selectedBatch.totalAmount.toLocaleString() : selectedPayout?.hostAmount?.toLocaleString()}<span className="text-base text-slate-500 ml-0.5">đ</span>
                </div>
                {selectedBatch && (
                  <div className="text-[10px] font-semibold text-slate-700 mt-2 inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                    Gộp thanh toán {selectedBatch.count} đơn hàng
                  </div>
                )}
              </div>

              {isFetchingBank ? (
                <div className="py-8 flex flex-col items-center justify-center">
                  <div className="w-5 h-5 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500 mt-2">Đang tải thông tin tài khoản...</p>
                </div>
              ) : selectedHostBank ? (
                <div className="space-y-4">
                  <div className="bg-slate-50/50 p-4 rounded-[12px] text-xs border border-slate-100 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-slate-500">Ngân hàng</span>
                      <span className="font-semibold text-slate-700">{selectedHostBank.bankName}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-slate-500">Số tài khoản</span>
                      <span className="break-all font-mono font-semibold text-slate-900">{selectedHostBank.accountNumber}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-slate-500">Chủ tài khoản</span>
                      <span className="break-words text-right font-semibold uppercase text-slate-900">{selectedHostBank.accountName}</span>
                    </div>
                  </div>

                  {getVietQrUrl() && (
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                        <Image
                          unoptimized
                          src={getVietQrUrl()!}
                          alt="VietQR"
                          width={144}
                          height={144}
                          className="w-36 h-36 rounded-lg object-contain"
                        />
                      </div>
                      <p className="text-[10px] font-semibold text-slate-500 mt-2 uppercase tracking-wider">Quét mã để chuyển khoản</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-600 font-medium bg-slate-50 rounded-xl">
                  Không lấy được thông tin ngân hàng của Host này.
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 p-4 sm:flex-row">
              <button 
                onClick={closePaymentModal}
                className="flex-1 py-2 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={confirmPayment}
                disabled={isFetchingBank || !selectedHostBank}
                className="flex-[1.5] py-2 bg-sky-500 rounded-full text-xs font-semibold text-white hover:bg-sky-600 disabled:opacity-50 transition-colors flex justify-center items-center gap-1"
              >
                Xác nhận đã chuyển
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
