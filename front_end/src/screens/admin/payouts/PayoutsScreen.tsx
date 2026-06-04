"use client";

import { useState } from "react";
import { useAdminPayouts } from "./hook/useAdminPayouts";
import { format } from "date-fns";

export function PayoutsScreen() {
  const { 
    payouts, groupedPendingPayouts, historyPayouts, stats, loading, actionResult, handleMarkPaid, handleMarkHostPaid,
    activeTab, setActiveTab, searchQuery, setSearchQuery,
    fetchHostBankDetails, isFetchingBank, selectedHostBank, setSelectedHostBank,
    refetch
  } = useAdminPayouts();

  // For modal, we need to know if we are paying a single payout or a batch for a host
  const [selectedBatch, setSelectedBatch] = useState<{ hostId: string; totalAmount: number; count: number } | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);

  const safeFormatDate = (dateVal: any, formatStr: string) => {
    if (!dateVal) return "";
    try {
      let d = dateVal;
      if (Array.isArray(dateVal)) {
        d = new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0, dateVal[5] || 0);
      } else {
        d = new Date(dateVal);
      }
      return format(d, formatStr);
    } catch (e) {
      return "";
    }
  };

  const openPaymentModalSingle = (payout: any) => {
    setSelectedBatch(null);
    setSelectedPayout(payout);
    fetchHostBankDetails(payout.hostId);
  };

  const openPaymentModalBatch = (batch: any) => {
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
      await handleMarkPaid(selectedPayout.id || selectedPayout.payoutId);
    }
    closePaymentModal();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-600";
      case "REQUESTED":
        return "bg-red-50 text-red-600 animate-pulse";
      case "PAID":
        return "bg-green-500/20 text-green-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const getVietQrUrl = () => {
    if (!selectedHostBank) return null;
    const { bankName, accountNumber, accountName } = selectedHostBank;
    if (bankName === "Không xác định" || accountNumber === "Không xác định") return null;
    
    let amount = 0;
    let content = "";
    
    if (selectedBatch) {
      amount = selectedBatch.totalAmount;
      content = `Thanh toan gop GoStay Host ${selectedBatch.hostId.substring(0, 8)}`;
    } else if (selectedPayout) {
      amount = selectedPayout.hostAmount;
      content = `Thanh toan GoStay ${selectedPayout.orderId?.substring(0, 8)}`;
    } else {
      return null;
    }
    
    const encodedBankName = encodeURIComponent(bankName);
    const encodedAccountName = encodeURIComponent(accountName);
    const encodedContent = encodeURIComponent(content);
    
    return `https://img.vietqr.io/image/${encodedBankName}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodedContent}&accountName=${encodedAccountName}`;
  };

  return (
    <div className="space-y-6 animate-smooth-appear">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Quản lý Thanh toán (Payouts)</h2>
          <p className="text-sm text-gray-600">Kiểm tra lịch sử doanh thu và chuyển tiền cho Host.</p>
        </div>
        <button onClick={refetch} className="px-4 py-2 bg-white border shadow-sm rounded-lg text-sm font-medium hover:bg-gray-50">
          ↻ Làm mới
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Cần Thanh Toán (Nợ)</div>
          <div className="text-2xl font-bold text-orange-600">{stats.totalPending.toLocaleString()}đ</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Đã Thanh Toán</div>
          <div className="text-2xl font-bold text-green-600">{stats.totalPaid.toLocaleString()}đ</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Hoa Hồng Tạm Tính (5%)</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalCommission.toLocaleString()}đ</div>
        </div>
      </div>

      {actionResult && (
        <div
          className={`p-4 rounded-lg text-sm border ${
            actionResult.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {actionResult.type === "success" ? "✅" : "❌"} {actionResult.message}
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("PENDING")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "PENDING" ? "bg-white shadow border border-gray-200 text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Chờ xử lý (Gộp)
            </button>
            <button
              onClick={() => setActiveTab("HISTORY")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "HISTORY" ? "bg-white shadow border border-gray-200 text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Lịch sử đã CK
            </button>
          </div>
          <div className="w-full md:w-64">
            <input 
              type="text" 
              placeholder="Tìm mã đơn, mã host..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        {/* Data Table */}
        {loading && payouts.length === 0 ? (
          <div className="p-10 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : payouts.length === 0 ? (
          <div className="p-10 text-center text-gray-600 text-sm">
            {searchQuery ? "Không tìm thấy dữ liệu phù hợp." : "Chưa có dữ liệu thanh toán."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {activeTab === "PENDING" ? (
                // VIEW GỘP THEO HOST CHO PENDING
                <>
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-600 uppercase tracking-wider border-b">
                      <th className="p-4 font-semibold">Mã Host</th>
                      <th className="p-4 font-semibold text-center">Số lượng Đơn</th>
                      <th className="p-4 font-semibold text-green-600 text-right">Tổng Cần Thanh Toán</th>
                      <th className="p-4 font-semibold text-center">Trạng Thái</th>
                      <th className="p-4 font-semibold text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {groupedPendingPayouts.length === 0 ? (
                      <tr><td colSpan={5} className="p-10 text-center text-gray-500 text-sm">Không có khoản chờ xử lý nào.</td></tr>
                    ) : (
                      groupedPendingPayouts.map((batch) => (
                        <tr key={batch.hostId} className={`hover:bg-gray-50 transition-colors text-sm ${batch.hasRequested ? "bg-red-50/30" : ""}`}>
                          <td className="p-4 font-mono text-[13px] text-gray-800 font-semibold" title={batch.hostId}>
                            {batch.hostId.substring(0, 12)}...
                          </td>
                          <td className="p-4 text-center text-gray-700 font-medium">
                            {batch.count} đơn
                          </td>
                          <td className="p-4 font-bold text-green-600 text-right text-lg">
                            {batch.totalAmount.toLocaleString()}đ
                          </td>
                          <td className="p-4 text-center">
                            {batch.hasRequested ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse border border-red-200">
                                YÊU CẦU RÚT TIỀN
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-600">
                                CHỜ ĐỐI SOÁT
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => openPaymentModalBatch(batch)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors shadow-sm"
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
                    <tr className="bg-gray-50 text-xs text-gray-600 uppercase tracking-wider border-b">
                      <th className="p-4 font-semibold">Mã Đơn & Payout ID</th>
                      <th className="p-4 font-semibold">Ngày Tạo</th>
                      <th className="p-4 font-semibold">Mã Host</th>
                      <th className="p-4 font-semibold">Tổng Đơn</th>
                      <th className="p-4 font-semibold text-green-600">Thực Nhận</th>
                      <th className="p-4 font-semibold text-center">Ngày CK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {historyPayouts.length === 0 ? (
                      <tr><td colSpan={6} className="p-10 text-center text-gray-500 text-sm">Không có lịch sử thanh toán nào.</td></tr>
                    ) : (
                      historyPayouts.map((payout) => (
                        <tr key={payout.id || payout.payoutId} className="hover:bg-gray-50 transition-colors text-sm text-gray-800">
                          <td className="p-4">
                            <div className="font-medium text-gray-900" title={payout.orderId}>
                              Order: {payout.orderId?.substring(0, 8)}...
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono mt-1" title={payout.id || payout.payoutId}>
                              {(payout.id || payout.payoutId)?.substring(0, 8)}...
                            </div>
                          </td>
                          <td className="p-4 text-gray-600">{safeFormatDate(payout.createdAt, "dd/MM/yyyy HH:mm")}</td>
                          <td className="p-4 font-mono text-[11px] text-gray-500" title={payout.hostId}>
                            {payout.hostId?.substring(0, 8)}...
                          </td>
                          <td className="p-4 text-gray-700">
                            {payout.totalAmount?.toLocaleString()}đ
                          </td>
                          <td className="p-4 font-bold text-green-600">
                            {payout.hostAmount?.toLocaleString()}đ
                          </td>
                          <td className="p-4 text-center text-gray-500 text-xs font-medium">
                            {safeFormatDate(payout.paidAt, "dd/MM/yyyy HH:mm")}
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
      </div>

      {/* Payment Modal */}
      {(selectedPayout || selectedBatch) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-smooth-appear">
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-900">
                Thông tin chuyển khoản {selectedBatch ? "(Gộp)" : ""}
              </h3>
              <button onClick={closePaymentModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-sm text-gray-500 mb-1">Số tiền cần chuyển:</div>
                <div className="text-3xl font-bold text-green-600">
                  {selectedBatch ? selectedBatch.totalAmount.toLocaleString() : selectedPayout?.hostAmount?.toLocaleString()}đ
                </div>
                {selectedBatch && (
                  <div className="text-xs text-gray-500 mt-1">Đã gộp thanh toán cho {selectedBatch.count} đơn hàng</div>
                )}
              </div>

              {isFetchingBank ? (
                <div className="py-8 flex justify-center text-green-500">
                  <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : selectedHostBank ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-500">Ngân hàng:</span>
                      <span className="font-semibold text-gray-900">{selectedHostBank.bankName}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-500">Số tài khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 font-mono">{selectedHostBank.accountNumber}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Chủ tài khoản:</span>
                      <span className="font-semibold text-gray-900 uppercase">{selectedHostBank.accountName}</span>
                    </div>
                  </div>

                  {getVietQrUrl() && (
                    <div className="flex flex-col items-center mt-4 border-t pt-4">
                      <p className="text-xs text-gray-500 mb-2">Hoặc quét mã QR để chuyển nhanh</p>
                      <img src={getVietQrUrl()!} alt="VietQR" className="w-48 h-48 border rounded-lg p-2 bg-white shadow-sm" />
                    </div>
                  )}

                  <div className="bg-orange-50 text-orange-800 text-xs p-3 rounded-lg mt-4">
                    Vui lòng sử dụng app ngân hàng hoặc quét QR để chuyển tiền cho Host. Sau khi thành công, hãy bấm Xác nhận.
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-red-500">
                  Không thể lấy thông tin ngân hàng của Host.
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 flex gap-3 justify-end">
              <button 
                onClick={closePaymentModal}
                className="px-4 py-2 bg-white border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmPayment}
                disabled={isFetchingBank || !selectedHostBank}
                className="px-4 py-2 bg-green-600 rounded-lg text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                Xác nhận đã CK {selectedBatch ? "Tất Cả" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
