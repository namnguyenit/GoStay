"use client";

import { useState } from "react";
import AdminService from "@/services/admin.service";

export default function AdminInventoryPage() {
  const [listingId, setListingId] = useState("");
  const [forceUpdateData, setForceUpdateData] = useState({
    status: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [actionResult, setActionResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleForceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingId || !forceUpdateData.status) {
      alert("Vui lòng nhập Listing ID và chọn trạng thái.");
      return;
    }
    setLoading(true);
    setActionResult(null);
    try {
      await AdminService.forceUpdateInventory(listingId, forceUpdateData);
      setActionResult({ type: "success", message: `Cập nhật trạng thái Listing ${listingId} thành công.` });
    } catch (err: any) {
      setActionResult({ type: "error", message: err?.message || "Có lỗi xảy ra khi cập nhật." });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!listingId) {
      alert("Vui lòng nhập Listing ID để đồng bộ.");
      return;
    }
    setLoading(true);
    setActionResult(null);
    try {
      await AdminService.syncInventory(listingId);
      setActionResult({ type: "success", message: `Đồng bộ tồn kho cho Listing ${listingId} thành công.` });
    } catch (err: any) {
      setActionResult({ type: "error", message: err?.message || "Có lỗi xảy ra khi đồng bộ." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quản lý Tồn kho (Inventory)</h2>

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
        <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Target Listing</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Listing ID (UUID) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={listingId}
            onChange={(e) => setListingId(e.target.value)}
            placeholder="Nhập ID của dịch vụ..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        
        <button
          onClick={handleSync}
          disabled={loading || !listingId}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Đang xử lý..." : "🔄 Đồng bộ tồn kho ngay (Sync)"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Can thiệp khẩn cấp (Force Update)</h3>
        <form onSubmit={handleForceUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái mới <span className="text-red-500">*</span>
            </label>
            <select
              value={forceUpdateData.status}
              onChange={(e) => setForceUpdateData({ ...forceUpdateData, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            >
              <option value="">-- Chọn trạng thái --</option>
              <option value="SUSPENDED">Đình chỉ (SUSPENDED)</option>
              <option value="ACTIVE">Kích hoạt lại (ACTIVE)</option>
              <option value="MAINTENANCE">Bảo trì (MAINTENANCE)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lý do (Tùy chọn)
            </label>
            <textarea
              value={forceUpdateData.reason}
              onChange={(e) => setForceUpdateData({ ...forceUpdateData, reason: e.target.value })}
              placeholder="Ghi chú lý do thay đổi trạng thái..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !listingId || !forceUpdateData.status}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Đang xử lý..." : "⚠️ Thực thi Force Update"}
          </button>
        </form>
      </div>
    </div>
  );
}
