import { useCallback, useEffect, useMemo, useState } from "react";
import AdminService, { AdminPayout } from "@/services/admin.service";
import { DEFAULT_ADMIN_PAGE_SIZE } from "@/screens/admin/_components/admin-utils";

export type { AdminPayout } from "@/services/admin.service";

export type GroupedPendingPayout = {
  hostId: string;
  totalAmount: number;
  count: number;
  hasRequested: boolean;
};

export type HostBankDetails = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};

type HostDetailResponse = {
  data?: {
    bankName?: string;
    bankAccount?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
    fullName?: string;
  };
};

type ActionError = {
  message?: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as ActionError).message;
    if (message) return message;
  }
  return fallback;
};

export function useAdminPayouts() {
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionResult, setActionResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [activeTab, setActiveTab] = useState<"PENDING" | "HISTORY">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");

  const [isFetchingBank, setIsFetchingBank] = useState(false);
  const [selectedHostBank, setSelectedHostBank] = useState<HostBankDetails | null>(null);

  const fetchPayouts = useCallback(async (pageToLoad = page) => {
    setLoading(true);
    try {
      const res = await AdminService.getAllPayouts(pageToLoad, DEFAULT_ADMIN_PAGE_SIZE);
      setPayouts(res?.data?.content ?? []);
      setTotalPages(Math.max(res?.data?.totalPages ?? 1, 1));
      setTotalElements(res?.data?.totalElements ?? 0);
    } catch (err) {
      setPayouts([]);
      setTotalPages(1);
      setTotalElements(0);
      setActionResult({
        type: "error",
        message: getErrorMessage(err, "Không thể tải danh sách payout."),
      });
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPayouts(page);
  }, [fetchPayouts, page]);

  const handleMarkPaid = async (payoutId: string) => {
    setLoading(true);
    setActionResult(null);
    try {
      await AdminService.markPayoutPaid(payoutId);
      setActionResult({ type: "success", message: `Đã đánh dấu Payout ${payoutId} thành ĐÃ THANH TOÁN.` });
      await fetchPayouts(page);
    } catch (err: unknown) {
      setActionResult({ type: "error", message: getErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") });
    } finally {
      setLoading(false);
    }
  };

  const fetchHostBankDetails = async (hostId: string) => {
    setIsFetchingBank(true);
    setSelectedHostBank(null);
    try {
      const res = await AdminService.getHostDetail(hostId) as HostDetailResponse;
      if (res && res.data) {
        setSelectedHostBank({
          bankName: res.data.bankName || "Không xác định",
          accountNumber: res.data.bankAccountNumber || res.data.bankAccount || "Không xác định",
          accountName: res.data.bankAccountName || res.data.fullName || "Không xác định",
        });
      }
    } catch (err) {
      setSelectedHostBank({
        bankName: "Không xác định",
        accountNumber: "Không xác định",
        accountName: "Không xác định",
      });
      setActionResult({
        type: "error",
        message: getErrorMessage(err, "Không lấy được thông tin ngân hàng của Host. Vui lòng kiểm tra thủ công trước khi xác nhận."),
      });
    } finally {
      setIsFetchingBank(false);
    }
  };

  const filteredPayouts = useMemo(() => {
    let filtered = payouts;

    if (searchQuery.trim()) {
      const lowerQ = searchQuery.toLowerCase();
      filtered = filtered.filter((p) =>
        (p.orderId && p.orderId.toLowerCase().includes(lowerQ)) ||
        (p.hostId && p.hostId.toLowerCase().includes(lowerQ)) ||
        (p.id && p.id.toLowerCase().includes(lowerQ)) ||
        (p.payoutId && p.payoutId.toLowerCase().includes(lowerQ))
      );
    }
    
    return filtered;
  }, [payouts, searchQuery]);

  // Group Pending/Requested by Host
  const groupedPendingPayouts = useMemo(() => {
    const pendingList = filteredPayouts.filter(p => p.status === "PENDING" || p.status === "REQUESTED");
    const groupMap: Record<string, GroupedPendingPayout> = {};

    pendingList.forEach((p) => {
      const hostId = p.hostId || "UNKNOWN_HOST";
      if (!groupMap[hostId]) {
        groupMap[hostId] = { hostId, totalAmount: 0, count: 0, hasRequested: false };
      }
      groupMap[hostId].totalAmount += (p.hostAmount || 0);
      groupMap[hostId].count += 1;
      if (p.status === "REQUESTED") {
        groupMap[hostId].hasRequested = true;
      }
    });

    return Object.values(groupMap).sort((a, b) => {
      // Requested first
      if (a.hasRequested && !b.hasRequested) return -1;
      if (!a.hasRequested && b.hasRequested) return 1;
      return b.totalAmount - a.totalAmount;
    });
  }, [filteredPayouts]);

  const historyPayouts = useMemo(() => {
    return filteredPayouts.filter(p => p.status === "PAID");
  }, [filteredPayouts]);

  const stats = useMemo(() => {
    let totalPending = 0;
    let totalPaid = 0;
    let totalCommission = 0;

    payouts.forEach((p) => {
      totalCommission += p.commissionAmount || 0;
      if (p.status === "PENDING" || p.status === "REQUESTED") {
        totalPending += p.hostAmount || 0;
      } else if (p.status === "PAID") {
        totalPaid += p.hostAmount || 0;
      }
    });

    return { totalPending, totalPaid, totalCommission };
  }, [payouts]);

  const handleMarkHostPaid = async (hostId: string) => {
    setLoading(true);
    setActionResult(null);
    try {
      await AdminService.markHostPayoutsPaid(hostId);
      setActionResult({ type: "success", message: `Đã thanh toán gộp thành công cho Host ${hostId}.` });
      await fetchPayouts(page);
    } catch (err: unknown) {
      setActionResult({ type: "error", message: getErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") });
    } finally {
      setLoading(false);
    }
  };

  return {
    payouts: filteredPayouts,
    groupedPendingPayouts,
    historyPayouts,
    stats,
    loading,
    actionResult,
    page,
    setPage,
    totalPages,
    totalElements,
    pageSize: DEFAULT_ADMIN_PAGE_SIZE,
    handleMarkPaid,
    handleMarkHostPaid,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    fetchHostBankDetails,
    isFetchingBank,
    selectedHostBank,
    setSelectedHostBank,
    refetch: () => fetchPayouts(page)
  }
}
