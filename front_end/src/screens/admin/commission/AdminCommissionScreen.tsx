"use client";

import { useEffect, useState } from "react";
import { Percent, Save } from "lucide-react";
import AdminService, { type CommissionConfig } from "@/services/admin.service";

export function AdminCommissionScreen() {
  const [config, setConfig] = useState<CommissionConfig | null>(null);
  const [percent, setPercent] = useState("5");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getCommissionConfig();
      const data = (res.data as unknown as { data?: CommissionConfig })?.data ?? res.data;
      setConfig(data);
      setPercent(String(data.percent ?? Number(data.rate ?? 0) * 100));
      setReason(data.reason ?? "");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Không tải được cấu hình hoa hồng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchConfig();
  }, []);

  const handleSave = async () => {
    const numericPercent = Number(percent);
    if (!Number.isFinite(numericPercent) || numericPercent < 0 || numericPercent > 50) {
      setFeedback("Tỷ lệ hoa hồng phải nằm trong khoảng 0% - 50%.");
      return;
    }

    setSaving(true);
    setFeedback("");
    try {
      const res = await AdminService.updateCommissionConfig(numericPercent / 100, reason.trim() || undefined);
      const data = (res.data as unknown as { data?: CommissionConfig })?.data ?? res.data;
      setConfig(data);
      setPercent(String(data.percent ?? numericPercent));
      setFeedback("Đã cập nhật tỷ lệ hoa hồng. Tỷ lệ mới sẽ áp dụng cho các payment phát sinh sau thời điểm này.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Không lưu được cấu hình hoa hồng.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Cấu hình hoa hồng</h2>
        <p className="mt-1 text-xs text-slate-500">Tỷ lệ này được Payment service dùng khi tạo payout mới sau khi khách thanh toán.</p>
      </div>

      {feedback && <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700">{feedback}</div>}

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">Đang tải cấu hình...</div>
          ) : (
            <>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <Percent className="h-7 w-7" />
              </div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tỷ lệ hoa hồng nền tảng</label>
              <div className="mt-2 flex max-w-xs items-center rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <input
                  value={percent}
                  onChange={(event) => setPercent(event.target.value)}
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  className="min-w-0 flex-1 text-2xl font-semibold text-slate-900 outline-none"
                />
                <span className="text-xl font-semibold text-slate-400">%</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Cho phép từ 0% đến 50%. Ví dụ 5% nghĩa là host nhận 95% giá trị đơn.</p>

              <label className="mt-6 block text-xs font-bold uppercase tracking-wider text-slate-500">Lý do / ghi chú thay đổi</label>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-sky-300"
                placeholder="VD: Điều chỉnh chính sách hoa hồng mùa cao điểm..."
              />

              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "Đang lưu..." : "Lưu cấu hình"}
              </button>
            </>
          )}
        </section>

        <aside className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Cấu hình hiện tại</h3>
          <div className="mt-5 space-y-4 text-sm">
            <InfoRow label="Tỷ lệ" value={`${config?.percent ?? Number(config?.rate ?? 0) * 100}%`} />
            <InfoRow label="Người cập nhật" value={config?.updatedBy || "Chưa có"} />
            <InfoRow label="Thời điểm" value={config?.updatedAt ? new Date(config.updatedAt).toLocaleString("vi-VN") : "Chưa có"} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Ghi chú</p>
              <p className="mt-1 rounded-2xl bg-slate-50 p-3 text-slate-700">{config?.reason || "Không có ghi chú"}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 break-all font-semibold text-slate-900">{value}</p>
    </div>
  );
}
