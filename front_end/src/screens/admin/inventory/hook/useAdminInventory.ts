import { useEffect, useState } from "react";
import AdminService from "@/services/admin.service";

export function useAdminInventory() {
  const [listingId, setListingId] = useState("");
  const [listingsList, setListingsList] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
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
  const fetchListings = async () => {
    setLoadingListings(true);
    try {
      const res = await AdminService.getListings("ACTIVE", 0, 100);
      setListingsList(res?.data?.content ?? []);
    } catch (err) {
      console.error("Failed to load listings for dropdown", err);
    } finally {
      setLoadingListings(false);
    }
  };

  // Load inventory calendar availability
  const fetchAvailability = async (targetId = listingId) => {
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
      console.error("Failed to fetch availability", err);
      setAvailability([]);
    } finally {
      setLoadingCalendar(false);
    }
  };

  useEffect(() => {
    fetchListings();

    // Check query param for cross-linking
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("listingId");
      if (id) {
        setListingId(id);
        fetchAvailability(id);
      }
    }
  }, []);

  useEffect(() => {
    if (listingId) {
      fetchAvailability();
    } else {
      setAvailability([]);
    }
  }, [listingId]);

  const handleForceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingId || !forceUpdateData.status || !forceUpdateData.startDate || !forceUpdateData.endDate) {
      alert("Vui lòng chọn Listing ID, chọn trạng thái và khoảng thời gian can thiệp.");
      return;
    }
    setLoading(true);
    setActionResult(null);
    try {
      await AdminService.forceUpdateInventory(listingId, forceUpdateData);
      setActionResult({ type: "success", message: `Thực thi cập nhật cưỡng chế trạng thái kho thành công.` });
      fetchAvailability();
    } catch (err: any) {
      setActionResult({ type: "error", message: err?.message || "Có lỗi xảy ra khi can thiệp." });
    } finally {
      setLoading(false);
    }
  };

  const [selectedDateDetail, setSelectedDateDetail] = useState<any | null>(null);

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
      await fetchAvailability();
      
      // Cập nhật state modal cục bộ để đồng bộ giao diện
      setSelectedDateDetail((prev: any) => prev ? { ...prev, status: newStatus === "BLOCKED" ? "BLOCKED" : "AVAILABLE" } : null);
    } catch (err: any) {
      setActionResult({ type: "error", message: err?.message || "Có lỗi xảy ra khi can thiệp." });
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
      await fetchAvailability();
    } catch (err: any) {
      setActionResult({ type: "error", message: err?.message || "Có lỗi xảy ra khi mở khóa." });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!listingId) {
      alert("Vui lòng chọn hoặc nhập Listing ID để đồng bộ.");
      return;
    }
    setLoading(true);
    setActionResult(null);
    try {
      await AdminService.syncInventory(listingId);
      setActionResult({ type: "success", message: `Đồng bộ lại tồn kho chuẩn xác thành công.` });
      fetchAvailability();
    } catch (err: any) {
      setActionResult({ type: "error", message: err?.message || "Có lỗi xảy ra khi đồng bộ." });
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