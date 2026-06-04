import { useState, useEffect } from "react";
import AdminService from "@/services/admin.service";

export function useAdminPayouts() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionResult, setActionResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res: any = await AdminService.getAllPayouts(0, 50);
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
    if (!confirm(`Bạn có chắc chắn muốn đánh dấu Payout [${payoutId}] là ĐÃ THANH TOÁN?`)) {
      return;
    }

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

  return {
    payouts,
    loading,
    actionResult,
    handleMarkPaid,
  }
}