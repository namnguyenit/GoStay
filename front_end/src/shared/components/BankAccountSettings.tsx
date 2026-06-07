"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Building2, CreditCard, Save, ShieldCheck } from "lucide-react";
import HostService from "@/services/host.service";

type OwnerType = "host" | "enterprise";

type BankAccount = {
  ownerType?: string;
  approvalStatus?: string;
  bankName?: string;
  bankAccount?: string;
  bankAccountName?: string;
};

const EMPTY_FORM = {
  bankName: "",
  bankAccount: "",
  bankAccountName: "",
};

const unwrapBankAccount = (response: unknown): BankAccount => {
  const root = response as { data?: unknown };
  const data = root?.data as { data?: unknown } | undefined;
  return ((data?.data ?? data ?? {}) as BankAccount);
};

export default function BankAccountSettings({ ownerType }: { ownerType: OwnerType }) {
  const isEnterprise = ownerType === "enterprise";
  const [form, setForm] = useState(EMPTY_FORM);
  const [profile, setProfile] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = isEnterprise
          ? await HostService.getMyEnterpriseBankAccount()
          : await HostService.getMyHostBankAccount();
        if (cancelled) return;
        const bank = unwrapBankAccount(response);
        setProfile(bank);
        setForm({
          bankName: bank.bankName ?? "",
          bankAccount: bank.bankAccount ?? "",
          bankAccountName: bank.bankAccountName ?? "",
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Không tải được thông tin ngân hàng.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isEnterprise]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
    setError("");
  };

  const submit = async () => {
    const payload = {
      bankName: form.bankName.trim(),
      bankAccount: form.bankAccount.trim(),
      bankAccountName: form.bankAccountName.trim(),
    };

    if (!payload.bankName || !payload.bankAccount || !payload.bankAccountName) {
      setError("Vui lòng nhập đầy đủ tên ngân hàng, số tài khoản và tên chủ tài khoản.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = isEnterprise
        ? await HostService.updateMyEnterpriseBankAccount(payload)
        : await HostService.updateMyHostBankAccount(payload);
      const bank = unwrapBankAccount(response);
      setProfile(bank);
      setForm({
        bankName: bank.bankName ?? payload.bankName,
        bankAccount: bank.bankAccount ?? payload.bankAccount,
        bankAccountName: bank.bankAccountName ?? payload.bankAccountName,
      });
      setMessage("Đã lưu tài khoản nhận tiền.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không lưu được tài khoản nhận tiền.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-sky-100 bg-white shadow-sm">
        <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-white p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                <CreditCard className="h-4 w-4" />
                Cấu hình ngân hàng
              </div>
              <h1 className="text-2xl font-bold text-gray-950">Tài khoản nhận tiền payout</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Đây là tài khoản nền tảng dùng để chuyển tiền doanh thu sau khi đơn hàng đủ điều kiện chi trả.
              </p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Loại hồ sơ</p>
              <p className="mt-1 flex items-center gap-2 font-bold text-gray-900">
                <Building2 className="h-4 w-4 text-sky-600" />
                {isEnterprise ? "Doanh nghiệp" : "Chủ nhà"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Tên ngân hàng *</span>
              <input
                value={form.bankName}
                onChange={(event) => updateField("bankName", event.target.value)}
                placeholder="VD: Vietcombank, Techcombank, MB Bank..."
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                disabled={loading || saving}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Số tài khoản *</span>
              <input
                value={form.bankAccount}
                onChange={(event) => updateField("bankAccount", event.target.value)}
                placeholder="Nhập số tài khoản nhận payout"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                disabled={loading || saving}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Tên chủ tài khoản *</span>
              <input
                value={form.bankAccountName}
                onChange={(event) => updateField("bankAccountName", event.target.value)}
                placeholder={isEnterprise ? "Tên công ty hoặc người đại diện" : "Tên chủ tài khoản"}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                disabled={loading || saving}
              />
            </label>

            {error && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {message && (
              <div className="flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={loading || saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <Save className="h-4 w-4" />
              {saving ? "Đang lưu..." : "Lưu tài khoản nhận tiền"}
            </button>
          </div>

          <aside className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
            <p className="text-sm font-bold text-gray-900">Trạng thái hiện tại</p>
            {loading ? (
              <p className="mt-3 text-sm text-gray-500">Đang tải...</p>
            ) : (
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Duyệt hồ sơ</p>
                  <p className="mt-1 font-bold text-gray-900">{profile?.approvalStatus || "Chưa có dữ liệu"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ngân hàng</p>
                  <p className="mt-1 font-bold text-gray-900">{profile?.bankName || "Chưa cấu hình"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Số tài khoản</p>
                  <p className="mt-1 break-all font-mono font-bold text-gray-900">{profile?.bankAccount || "Chưa cấu hình"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Chủ tài khoản</p>
                  <p className="mt-1 font-bold text-gray-900">{profile?.bankAccountName || "Chưa cấu hình"}</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
