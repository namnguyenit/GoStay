import { useCallback, useEffect, useState } from "react";
import AdminService, { AdminInventoryAvailability, AdminListing } from "@/services/admin.service";

export type InventoryAvailability = AdminInventoryAvailability;

type InventoryActionError = {
  message?: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as InventoryActionError).message;
    if (message) return message;
  }
  return fallback;
};

export function useAdminInventory() {
  const [listingId, setListingId] = useState("");
  const [listingsList, setListingsList] = useState<AdminListing[]>([]);
  const [availability, setAvailability] = useState<InventoryAvailability[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  const [forceUpdateData, setForceUpdateData] = useState({
    status: "",
    reason: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [actionResult, setActionResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load listings for selector dropdown
  const fetchListings = useCallback(async () => {
    setLoadingListings(true);
    try {
      const res = await AdminService.getListings("ACTIVE", 0, 100);
      setListingsList(res?.data?.content ?? []);
    } catch (err) {
      setActionResult({
        type: "error",
        message: getErrorMessage(err, "Không thể tải danh sách dịch vụ đang hoạt động."),
      });
    } finally {
      setLoadingListings(false);
    }
  }, []);

  // Load inventory calendar availability
  const fetchAvailability = useCallback(async (targetId: string) => {
    if (!targetId) return;
    setLoadingCalendar(true);
    try {
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(today.getDate() + 30);

      const formatDate = (date: Date) => date.toISOString().split("T")[0];

      const res = await AdminService.getInventoryAvailability(
        targetId,
        formatDate(today),
        formatDate(nextMonth)
      );
      setAvailability(res?.data ?? []);
    } catch (err) {
      setAvailability([]);
      setActionResult({
        type: "error",
        message: getErrorMessage(err, "Không thể tải lịch tồn kho của dịch vụ này."),
      });
    } finally {
      setLoadingCalendar(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();

    // Check query param for cross-linking
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("listingId");
      if (id) {
        setListingId(id);
      }
    }
  }, [fetchListings]);

  useEffect(() => {
    if (listingId) {
      fetchAvailability(listingId);
    } else {
      setAvailability([]);
    }
  }, [fetchAvailability, listingId]);

  const handleForceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingId || !forceUpdateData.status || !forceUpdateData.startDate || !forceUpdateData.endDate) {
      setActionResult({
        type: "error",
        message: "Vui lòng chọn Listing ID, chọn trạng thái và khoảng thời gian can thiệp.",
      });
      return;
    }
    setLoading(true);
    setActionResult(null);
    try {
      await AdminService.forceUpdateInventory(listingId, forceUpdateData);
      setActionResult({ type: "success", message: `Thực thi cập nhật cưỡng chế trạng thái kho thành công.` });
      await fetchAvailability(listingId);
    } catch (err: unknown) {
      setActionResult({ type: "error", message: getErrorMessage(err, "Có lỗi xảy ra khi can thiệp.") });
    } finally {
      setLoading(false);
    }
  };

  const [selectedDateDetail, setSelectedDateDetail] = useState<InventoryAvailability | null>(null);

  const handleQuickForceUpdate = async (dateStr: string, newStatus: string) => {
    if (!listingId) return;
    setLoading(true);
    setActionResult(null);
    try {
      await AdminService.forceUpdateInventory(listingId, {
        status: newStatus,
        reason: `Can thiệp khẩn cấp ngày ${dateStr}`,
        startDate: dateStr,
        endDate: dateStr,
      });
      setActionResult({ type: "success", message: `Can thiệp trạng thái ngày ${dateStr} thành công.` });
      await fetchAvailability(listingId);
      
      // Cập nhật state modal cục bộ để đồng bộ giao diện
      setSelectedDateDetail((prev) => prev ? { ...prev, status: newStatus === "BLOCKED" ? "BLOCKED" : "AVAILABLE" } : null);
    } catch (err: unknown) {
      setActionResult({ type: "error", message: getErrorMessage(err, "Có lỗi xảy ra khi can thiệp.") });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRangeUnlock = async (startStr: string, endStr: string) => {
    if (!listingId) return;
    setLoading(true);
    setActionResult(null);
    try {
      await AdminService.forceUpdateInventory(listingId, {
        status: "AVAILABLE",
        reason: `Mở khóa nhanh khoảng ngày từ ${startStr} đến ${endStr}`,
        startDate: startStr,
        endDate: endStr,
      });
      setActionResult({ type: "success", message: `Mở khóa khoảng ngày từ ${startStr} đến ${endStr} thành công.` });
      await fetchAvailability(listingId);
    } catch (err: unknown) {
      setActionResult({ type: "error", message: getErrorMessage(err, "Có lỗi xảy ra khi mở khóa.") });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!listingId) {
      setActionResult({ type: "error", message: "Vui lòng chọn hoặc nhập Listing ID để đồng bộ." });
      return;
    }
    setLoading(true);
    setActionResult(null);
    try {
      const res = await AdminService.syncInventory(listingId);
      const fixedCount = res?.data?.recordsFixed;
      setActionResult({
        type: "success",
        message: fixedCount !== undefined
          ? `Đồng bộ tồn kho thành công, đã sửa ${fixedCount} bản ghi.`
          : "Đồng bộ lại tồn kho chuẩn xác thành công.",
      });
      await fetchAvailability(listingId);
    } catch (err: unknown) {
      setActionResult({ type: "error", message: getErrorMessage(err, "Có lỗi xảy ra khi đồng bộ.") });
    } finally {
      setLoading(false);
    }
  };

  return {
    listingId,
    setListingId,
    listingsList,
    loadingListings,
    availability,
    loadingCalendar,
    forceUpdateData,
    setForceUpdateData,
    loading,
    actionResult,
    handleForceUpdate,
    handleSync,
    selectedDateDetail,
    setSelectedDateDetail,
    handleQuickForceUpdate,
    handleQuickRangeUnlock,
    refreshAvailability: fetchAvailability,
  };
}
