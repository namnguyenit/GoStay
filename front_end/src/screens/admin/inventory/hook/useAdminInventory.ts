import { useState } from "react";
import AdminService from "@/services/admin.service";

export function useAdminInventory() {
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

  return {
    listingId,
    setListingId,
    forceUpdateData,
    setForceUpdateData,
    loading,
    actionResult,
    handleForceUpdate,
    handleSync,
  }
}