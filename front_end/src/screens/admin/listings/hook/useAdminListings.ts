import { useCallback, useEffect, useState } from "react";
import AdminService, { AdminListing, ListingStatus } from "@/services/admin.service";
import {
  ConfirmState,
  DEFAULT_ADMIN_PAGE_SIZE,
  getAdminErrorMessage,
} from "@/screens/admin/_components/admin-utils";

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

export function useAdminListings() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setRawStatusFilter] = useState<ListingStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false });
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const setStatusFilter = (nextStatus: ListingStatus | "") => {
    setRawStatusFilter(nextStatus);
    setPage(0);
  };

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdminService.getListings(statusFilter, page, DEFAULT_ADMIN_PAGE_SIZE, search);
      setListings(res?.data?.content ?? []);
      setTotalPages(Math.max(res?.data?.totalPages ?? 1, 1));
      setTotalElements(res?.data?.totalElements ?? 0);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getAdminErrorMessage(error, "Không thể tải danh sách dịch vụ."),
      });
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const runConfirm = async () => {
    if (!confirm.open) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      await confirm.onConfirm();
      setConfirm({ open: false });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getAdminErrorMessage(error),
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: ListingStatus) => {
    const labelMap: Record<ListingStatus, string> = {
      ACTIVE: "kích hoạt",
      HIDDEN: "tạm ẩn",
      DELETED: "xóa",
      PENDING: "chuyển về chờ duyệt",
    };

    setConfirm({
      open: true,
      title: "Đổi trạng thái dịch vụ",
      description: `Bạn đang chuẩn bị ${labelMap[newStatus]} dịch vụ này.`,
      confirmLabel: newStatus === "DELETED" ? "Xóa dịch vụ" : "Xác nhận",
      intent: newStatus === "DELETED" ? "danger" : "default",
      onConfirm: async () => {
        await AdminService.changeListingStatus(id, newStatus);
        setFeedback({ type: "success", message: "Đã cập nhật trạng thái dịch vụ." });
        if (selectedListing?.id === id) {
          setSelectedListing({ ...selectedListing, status: newStatus });
        }
        await fetchListings();
      },
    });
  };

  const getStatusBadge = (status?: string) => {
    const map: Record<string, string> = {
      PENDING: "bg-white text-slate-800 border border-slate-300",
      ACTIVE: "bg-slate-100 text-slate-900 border border-slate-200",
      HIDDEN: "bg-slate-50 text-slate-600 border border-slate-200",
      DELETED: "bg-white text-slate-500 border border-slate-300",
    };
    return map[status ?? ""] ?? "bg-gray-100 text-gray-600 border border-gray-200";
  };

  return {
    listings,
    rawListings: listings,
    loading,
    actionLoading,
    statusFilter,
    setStatusFilter,
    search,
    setSearch: handleSearchChange,
    page,
    setPage,
    totalPages,
    totalElements,
    pageSize: DEFAULT_ADMIN_PAGE_SIZE,
    selectedListing,
    setSelectedListing,
    confirm,
    setConfirm,
    feedback,
    handleConfirm: runConfirm,
    handleUpdateStatus,
    getStatusBadge,
    refresh: fetchListings,
  };
}
