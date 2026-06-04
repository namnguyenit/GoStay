import { useState, useEffect, useMemo } from "react";
import AdminService from "@/services/admin.service";

export function useAdminPayouts() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionResult, setActionResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [activeTab, setActiveTab] = useState<"PENDING" | "HISTORY">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");

  const [isFetchingBank, setIsFetchingBank] = useState(false);
  const [selectedHostBank, setSelectedHostBank] = useState<{
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | null>(null);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res: any = await AdminService.getAllPayouts(0, 100);
      if (res && res.data && res.data.content) {
        setPayouts(res.data.content);
      } else {
        setPayouts([]);
      }
    } catch (err) {
      console.error(err);
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleMarkPaid = async (payoutId: string) => {
    setLoading(true);
    setActionResult(null);
    try {
      await AdminService.markPayoutPaid(payoutId);
      setActionResult({ type: "success", message: `Đã đánh dấu Payout ${payoutId} thành ĐÃ THANH TOÁN.` });
      await fetchPayouts();
    } catch (err: any) {
      setActionResult({ type: "error", message: err?.message || "Có lỗi xảy ra. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  const fetchHostBankDetails = async (hostId: string) => {
    setIsFetchingBank(true);
    setSelectedHostBank(null);
    try {
      const res: any = await AdminService.getHostDetail(hostId);
      if (res && res.data) {
        setSelectedHostBank({
          bankName: res.data.bankName || "Không xác định",
          accountNumber: res.data.bankAccountNumber || "Không xác định",
          accountName: res.data.bankAccountName || "Không xác định",
        });
      }
    } catch (err) {
      console.error("Failed to fetch host bank details", err);
      // Fallback: Cho phép Admin tiếp tục thanh toán thủ công kể cả khi Host chưa có profile ngân hàng
      setSelectedHostBank({
        bankName: "Không xác định",
        accountNumber: "Không xác định",
        accountName: "Không xác định",
      });
    } finally {
      setIsFetchingBank(false);
    }
  };

  const filteredPayouts = useMemo(() => {
    let filtered = payouts;

    if (searchQuery.trim()) {
      const lowerQ = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        (p.orderId && p.orderId.toLowerCase().includes(lowerQ)) ||
        (p.hostId && p.hostId.toLowerCase().includes(lowerQ)) ||
        (p.id && p.id.toLowerCase().includes(lowerQ))
      );
    }
    
    return filtered;
  }, [payouts, searchQuery]);

  // Group Pending/Requested by Host
  const groupedPendingPayouts = useMemo(() => {
    const pendingList = filteredPayouts.filter(p => p.status === "PENDING" || p.status === "REQUESTED");
    const groupMap: Record<string, { hostId: string; totalAmount: number; count: number; hasRequested: boolean }> = {};

    pendingList.forEach(p => {
      if (!groupMap[p.hostId]) {
        groupMap[p.hostId] = { hostId: p.hostId, totalAmount: 0, count: 0, hasRequested: false };
      }
      groupMap[p.hostId].totalAmount += (p.hostAmount || 0);
      groupMap[p.hostId].count += 1;
      if (p.status === "REQUESTED") {
        groupMap[p.hostId].hasRequested = true;
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

    payouts.forEach(p => {
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
      await fetchPayouts();
    } catch (err: any) {
      setActionResult({ type: "error", message: err?.message || "Có lỗi xảy ra. Vui lòng thử lại." });
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
    refetch: fetchPayouts
  }
}