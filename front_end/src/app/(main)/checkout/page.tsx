"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OrderService from "@/services/order";

function CheckoutForm() {
  const router = useRouter();
  const params = useSearchParams();

  const listingId = params.get("id") || "";
  const title = params.get("title") || "Dịch vụ";
  const price = Number(params.get("price") || 0);
  const image = params.get("image") || "";
  const category = params.get("category") || "place";

  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nights = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
  const total = price * (category === "place" ? nights : quantity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingId) { setError("Không tìm thấy dịch vụ."); return; }
    if (new Date(endDate) < new Date(startDate)) { setError("Ngày kết thúc phải sau ngày bắt đầu."); return; }
    setLoading(true);
    setError("");
    try {
      const res: any = await OrderService.bookNow({
        item: {
          listingId,
          startDate,
          endDate,
          quantity,
          unitPrice: price,
          listingTitle: title,
          thumbnailUrl: image,
        },
        fullName: fullName || undefined,
        email: email || undefined,
        phone: phone || undefined,
      });
      const responseData = res?.data?.data || res?.data;
      const orderId = responseData?.orderId;
      const totalAmount = responseData?.totalAmount || total;
      if (!orderId) {
        console.error("book-now raw response:", JSON.stringify(res?.data));
        setError("Đặt dịch vụ thất bại: Không nhận được mã đơn hàng từ server.");
        return;
      }
      router.push(`/payment?orderId=${orderId}&amount=${totalAmount}&title=${encodeURIComponent(title)}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Đặt dịch vụ thất bại.");
    } finally {
      setLoading(false);
    }
  };

  if (!listingId) return <div className="p-8">Không tìm thấy dịch vụ. <a href="/" className="underline">Quay về trang chủ</a></div>;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2">Xác nhận đặt dịch vụ</h1>

      {image && <img src={image} alt={title} className="w-full h-48 object-cover rounded-xl mb-3" />}
      <p className="font-semibold text-lg mb-1">{title}</p>
      <p className="text-sm text-gray-500 mb-6">
        đ{price.toLocaleString("vi-VN")} / {category === "place" ? "đêm" : category === "experience" ? "người" : "buổi"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Ngày bắt đầu *</label>
            <input type="date" required value={startDate} min={today}
              onChange={e => setStartDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày kết thúc *</label>
            <input type="date" required value={endDate} min={startDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>

        {category !== "place" && (
          <div>
            <label className="block text-sm font-medium mb-1">Số lượng người *</label>
            <input type="number" required min={1} value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        )}

        <hr />
        <p className="text-sm font-medium text-gray-600">Thông tin liên hệ (tuỳ chọn)</p>

        <input type="text" placeholder="Họ và tên" value={fullName} onChange={e => setFullName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
        <input type="tel" placeholder="Số điện thoại" value={phone} onChange={e => setPhone(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />

        <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
          <div className="flex justify-between"><span>Đơn giá</span><span>đ{price.toLocaleString("vi-VN")}</span></div>
          {category === "place"
            ? <div className="flex justify-between"><span>Số đêm</span><span>{nights}</span></div>
            : <div className="flex justify-between"><span>Số lượng</span><span>{quantity}</span></div>
          }
          <div className="flex justify-between font-bold text-base pt-2 border-t">
            <span>Tổng tiền</span>
            <span className="text-rose-600">đ{total.toLocaleString("vi-VN")}</span>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {loading ? "Đang xử lý..." : "Tiến hành thanh toán →"}
        </button>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-8 pt-24">Đang tải...</div>}>
      <CheckoutForm />
    </Suspense>
  );
}
