"use client";

import { useAdminPayouts } from "./hook/useAdminPayouts";
import { format } from "date-fns";

export function PayoutsScreen() {
  const { payouts, loading, actionResult, handleMarkPaid } = useAdminPayouts();

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-600";
      case "REQUESTED":
        return "bg-blue-50 text-blue-600";
      case "PAID":
        return "bg-green-500/20 text-green-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  return (
    <div className="space-y-6 animate-smooth-appear">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Quản lý Thanh toán cho Host (Payouts)</h2>
        <p className="text-sm text-gray-600">Kiểm tra lịch sử doanh thu và chuyển tiền cho Host.</p>
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

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading && payouts.length === 0 ? (
          <div className="p-10 flex justify-center">
            <div className="w-8 h-8 border-4 border-app-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : payouts.length === 0 ? (
          <div className="p-10 text-center text-gray-600 text-sm">
            Chưa có dữ liệu thanh toán.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-600 uppercase tracking-wider border-b">
                  <th className="p-4 font-semibold">Mã Đơn & Payout ID</th>
                  <th className="p-4 font-semibold">Ngày Tạo</th>
                  <th className="p-4 font-semibold">Mã Host</th>
                  <th className="p-4 font-semibold">Tổng Đơn</th>
                  <th className="p-4 font-semibold">Hoa Hồng (5%)</th>
                  <th className="p-4 font-semibold text-green-600">Thực Nhận</th>
                  <th className="p-4 font-semibold text-center">Trạng Thái</th>
                  <th className="p-4 font-semibold text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50 transition-colors text-sm text-gray-800">
                    <td className="p-4">
                      <div className="font-medium text-gray-900" title={payout.orderId}>
                        Order: {payout.orderId?.substring(0, 8)}...
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono mt-1" title={payout.id}>
                        {payout.id?.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{safeFormatDate(payout.createdAt, "dd/MM/yyyy HH:mm")}</td>
                    <td className="p-4 font-mono text-[11px] text-gray-500" title={payout.hostId}>
                      {payout.hostId?.substring(0, 8)}...
                    </td>
                    <td className="p-4 text-gray-700">
                      {payout.totalAmount?.toLocaleString()}đ
                    </td>
                    <td className="p-4 text-orange-600">
                      -{payout.commissionAmount?.toLocaleString()}đ
                    </td>
                    <td className="p-4 font-bold text-green-600">
                      {payout.hostAmount?.toLocaleString()}đ
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusColor(payout.status)}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {(payout.status === "PENDING" || payout.status === "REQUESTED") ? (
                        <button
                          onClick={() => handleMarkPaid(payout.id)}
                          disabled={loading}
                          className="px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded text-xs font-semibold hover:bg-green-600 hover:text-white transition-colors disabled:opacity-50"
                        >
                          Đã CK
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
