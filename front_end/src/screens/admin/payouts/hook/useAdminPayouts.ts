import { useState } from "react";
import AdminService from "@/services/admin.service";

export function useAdminPayouts() {
const [payoutId, setPayoutId] = useState("");
const [loading, setLoading] = useState(false);
const [actionResult, setActionResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // In a real application, we would probably have a GET /api/v1/payouts/all endpoint
  // to list all payouts. However, the API Gateway payment.route.js currently only exposes:
  // GET /me (for Host)
  // PUT /{payoutId}/mark-paid (for Admin)
  // Therefore, the admin will need to input the Payout ID manually to mark it as paid,
  // or we wait for backend to expose a list endpoint for admins.

  const handleMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutId) {
      alert("Vui lòng nhập Payout ID.");
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn đánh dấu Payout [${payoutId}] là ĐÃ THANH TOÁN?`)) {
      return;
    }

    setLoading(true);
    setActionResult(null);
    try {
      await AdminService.markPayoutPaid(payoutId);
      setActionResult({ type: "success", message: `Đã đánh dấu Payout ${payoutId} thành ĐÃ THANH TOÁN.` });
      setPayoutId(""); // Clear input on success
    } catch (err: any) {
      setActionResult({ type: "error", message: err?.message || "Có lỗi xảy ra. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  return {
    payoutId,
    setPayoutId,
    loading,
    actionResult,
    handleMarkPaid,
  }

}