"use client";

import { useState } from "react";
import AdminService from "@/services/admin.service";
import { useAdminPayouts } from "./hook/useAdminPayouts";

export function PayoutsScreen() {
    const { payoutId, setPayoutId, loading, actionResult, handleMarkPaid } = useAdminPayouts();

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quản lý Thanh toán cho Host (Payouts)</h2>

      {actionResult && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm border ${
            actionResult.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {actionResult.type === "success" ? "✅" : "❌"} {actionResult.message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Đánh dấu Đã thanh toán (Mark as Paid)</h3>
        <p className="text-sm text-gray-500 mb-4">
          Sử dụng chức năng này sau khi bạn đã chuyển khoản thủ công cho Host để cập nhật trạng thái trên hệ thống.
        </p>
        
        <form onSubmit={handleMarkPaid}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã yêu cầu thanh toán (Payout ID) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={payoutId}
              onChange={(e) => setPayoutId(e.target.value)}
              placeholder="VD: 550e8400-e29b-41d4-a716-446655440000"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !payoutId}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Đang xử lý..." : "✔️ Xác nhận Đã chuyển tiền"}
          </button>
        </form>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
        <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
          <span className="mr-2">💡</span> Ghi chú quan trọng
        </h4>
        <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
          <li>API hiện tại chưa hỗ trợ lấy danh sách toàn bộ yêu cầu rút tiền của các Host.</li>
          <li>Bạn cần lấy Payout ID từ thông báo hệ thống hoặc database để thực hiện thao tác này.</li>
          <li>Việc đánh dấu đã thanh toán không thể hoàn tác trên giao diện.</li>
        </ul>
      </div>
    </div>
  );
}
