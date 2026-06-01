"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PaymentService from "@/services/payment";

function PaymentContent() {
  const router = useRouter();
  const params = useSearchParams();

  const orderId = params.get("orderId") || "";
  const amount = Number(params.get("amount") || 0);
  const title = params.get("title") || "Dịch vụ";

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"PENDING" | "PAID" | "FAILED">("PENDING");

  const calledRef = useRef(false);

  // Create payment on mount
  useEffect(() => {
    if (!orderId || calledRef.current) return;
    calledRef.current = true;
    
    PaymentService.createPayment(orderId, amount)
      .then((res: any) => {
        const data = res?.data?.data || res?.data?.result || res?.data;
        setPayment(data);
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err?.response?.data?.message || "Tạo thanh toán thất bại.");
        setLoading(false);
      });
  }, [orderId, amount]);

  const checkPayment = useCallback(async () => {
    if (!payment?.paymentId) return;
    setChecking(true);
    try {
      const res: any = await PaymentService.getPayment(payment.paymentId);
      const data = res?.data?.data || res?.data?.result || res?.data;
      if (data?.status === "PAID" || data?.status === "COMPLETED") {
        setStatus("PAID");
      } else if (data?.status === "FAILED" || data?.status === "CANCELLED") {
        setStatus("FAILED");
      }
    } catch (err: any) {
      console.error("Check payment failed:", err);
    } finally {
      setChecking(false);
    }
  }, [payment?.paymentId]);

  if (!orderId) return (
    <div className="p-8 pt-24 text-center">
      <p className="text-red-500">Không tìm thấy đơn hàng.</p>
      <a href="/" className="mt-4 inline-block underline text-blue-600">Quay về trang chủ</a>
    </div>
  );

  if (loading) return <div className="p-8 pt-24 text-center">Đang tạo thanh toán...</div>;

  if (status === "PAID") return (
    <div className="p-8 pt-24 max-w-md mx-auto text-center">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h1>
      <p className="text-gray-600 mb-6">Đặt dịch vụ <strong>{title}</strong> đã được xác nhận.</p>
      <button onClick={() => router.push("/")} className="bg-rose-500 text-white px-6 py-3 rounded-xl font-semibold">
        Về trang chủ
      </button>
    </div>
  );

  if (status === "FAILED") return (
    <div className="p-8 pt-24 max-w-md mx-auto text-center">
      <div className="text-5xl mb-4">❌</div>
      <h1 className="text-2xl font-bold text-red-600 mb-2">Thanh toán thất bại</h1>
      <p className="text-gray-600 mb-6">Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
      <button onClick={() => router.back()} className="bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold">
        Quay lại
      </button>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-1">Thanh toán</h1>
      <p className="text-gray-500 text-sm mb-6">Dịch vụ: {title}</p>

      <div className="bg-gray-50 border rounded-xl p-4 mb-6 text-sm space-y-2">
        <div className="flex justify-between"><span className="text-gray-500">Mã đơn hàng</span><span className="font-mono text-xs">{orderId.slice(0, 8)}...</span></div>
        <div className="flex justify-between font-bold text-base">
          <span>Tổng tiền</span>
          <span className="text-rose-600">đ{amount.toLocaleString("vi-VN")}</span>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {payment?.qrUrl ? (
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-3">Quét mã QR bằng ứng dụng ngân hàng để thanh toán:</p>
          <img src={payment.qrUrl} alt="QR Code thanh toán" className="w-64 h-64 mx-auto border rounded-xl object-contain" />
          {payment?.paymentCode && (
            <p className="text-xs text-gray-500 mt-2">Nội dung chuyển khoản: <strong>{payment.paymentCode}</strong></p>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-800">
          {payment?.bankAccount
            ? <p>Thanh toán chuyển khoản tới: <strong>{payment.bankName} - {payment.bankAccount}</strong></p>
            : <p>Đang tạo mã thanh toán... Vui lòng chờ.</p>
          }
        </div>
      )}

      <button
        onClick={checkPayment}
        disabled={checking}
        className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors mb-3"
      >
        {checking ? "Đang kiểm tra..." : "Tôi đã thanh toán xong ✓"}
      </button>

      {process.env.NODE_ENV === "development" && payment?.paymentId && (
        <button
          onClick={async () => {
            try {
              await PaymentService.mockPayment(payment.paymentId);
              alert("Mô phỏng thanh toán thành công!");
              checkPayment();
            } catch (err) {
              alert("Lỗi mô phỏng thanh toán");
            }
          }}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-colors mb-3"
        >
          [DEV] Mô phỏng Thanh toán thành công
        </button>
      )}

      <button onClick={() => router.back()} className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl text-sm hover:bg-gray-50">
        Quay lại
      </button>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 pt-24 text-center">Đang tải...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
