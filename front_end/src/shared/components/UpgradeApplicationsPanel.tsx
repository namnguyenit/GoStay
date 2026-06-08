"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle, Clock, History, Upload, User, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserServices } from "@/services";
import AuthService from "@/services/auth.service";

type HostApplication = {
  fullName?: string;
  phone?: string;
  cccdNumber?: string;
  taxCode?: string;
  bankAccount?: string;
  bankName?: string;
  bankAccountName?: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  approvalStatus?: string;
  createdAt?: string;
  updatedAt?: string;
};

type EnterpriseApplication = {
  companyName?: string;
  taxCode?: string;
  companyAddress?: string;
  representativeName?: string;
  bankAccount?: string;
  bankName?: string;
  bankAccountName?: string;
  approvalStatus?: string;
  createdAt?: string;
  updatedAt?: string;
};

type HistoryEntry = {
  type?: string;
  status?: string;
  title?: string;
  description?: string;
  occurredAt?: string;
};

type ApplicationsResponse = {
  hostApplication?: HostApplication | null;
  enterpriseApplication?: EnterpriseApplication | null;
  history?: HistoryEntry[];
};

const emptyHostForm = {
  fullName: "",
  phoneNumber: "",
  cccdNumber: "",
  bankAccount: "",
  bankName: "",
  bankAccountName: "",
};

const emptyEnterpriseForm = {
  companyName: "",
  companyAddress: "",
  taxCode: "",
  representativeName: "",
  bankAccount: "",
  bankName: "",
  bankAccountName: "",
};

const unwrapApplications = (response: unknown): ApplicationsResponse => {
  const root = response as { data?: unknown };
  const data = root?.data as { data?: unknown } | undefined;
  return ((data?.data ?? data ?? {}) as ApplicationsResponse);
};

const formatDateTime = (value?: string) => {
  if (!value) return "Chưa có dữ liệu";
  return new Date(value).toLocaleString("vi-VN");
};

const statusLabel = (status?: string) => {
  const normalized = String(status ?? "").toUpperCase();
  if (normalized === "APPROVED") return "Đã duyệt";
  if (normalized === "REJECTED") return "Bị từ chối";
  if (normalized === "PENDING") return "Đang chờ duyệt";
  return "Chưa nộp";
};

const statusClass = (status?: string) => {
  const normalized = String(status ?? "").toUpperCase();
  if (normalized === "APPROVED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (normalized === "REJECTED") return "bg-rose-50 text-rose-700 border-rose-200";
  if (normalized === "PENDING") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-zinc-50 text-zinc-600 border-zinc-200";
};

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-zinc-950/40">
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-xs font-semibold text-zinc-900 dark:text-zinc-50">{value || "—"}</p>
    </div>
  );
}

export default function UpgradeApplicationsPanel({ onChanged }: { onChanged?: () => void }) {
  const [applications, setApplications] = useState<ApplicationsResponse>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<"host" | "enterprise" | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hostForm, setHostForm] = useState(emptyHostForm);
  const [enterpriseForm, setEnterpriseForm] = useState(emptyEnterpriseForm);
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);

  const roles = AuthService.getUserRoles();
  const hasHost = roles.includes("HOST");
  const hasEnterprise = roles.includes("ENTERPRISE");
  const hostApplication = applications.hostApplication ?? null;
  const enterpriseApplication = applications.enterpriseApplication ?? null;
  const hostStatus = hostApplication?.approvalStatus;
  const enterpriseStatus = enterpriseApplication?.approvalStatus;
  const canEditHost = !hasHost && String(hostStatus ?? "").toUpperCase() !== "APPROVED";
  const canEditEnterprise = !hasEnterprise && String(enterpriseStatus ?? "").toUpperCase() !== "APPROVED";

  const orderedHistory = useMemo(
    () => [...(applications.history ?? [])].sort((a, b) => String(b.occurredAt ?? "").localeCompare(String(a.occurredAt ?? ""))),
    [applications.history],
  );

  const loadApplications = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await UserServices.getUpgradeApplications();
      const next = unwrapApplications(response);
      setApplications(next);
      setHostForm({
        fullName: next.hostApplication?.fullName ?? "",
        phoneNumber: next.hostApplication?.phone ?? "",
        cccdNumber: next.hostApplication?.cccdNumber ?? "",
        bankAccount: next.hostApplication?.bankAccount ?? "",
        bankName: next.hostApplication?.bankName ?? "",
        bankAccountName: next.hostApplication?.bankAccountName ?? "",
      });
      setEnterpriseForm({
        companyName: next.enterpriseApplication?.companyName ?? "",
        companyAddress: next.enterpriseApplication?.companyAddress ?? "",
        taxCode: next.enterpriseApplication?.taxCode ?? "",
        representativeName: next.enterpriseApplication?.representativeName ?? "",
        bankAccount: next.enterpriseApplication?.bankAccount ?? "",
        bankName: next.enterpriseApplication?.bankName ?? "",
        bankAccountName: next.enterpriseApplication?.bankAccountName ?? "",
      });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Không tải được hồ sơ nâng cấp." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const submitHost = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!hostApplication && (!frontImage || !backImage)) {
      setMessage({ type: "error", text: "Vui lòng tải ảnh CCCD mặt trước và mặt sau khi nộp hồ sơ HOST lần đầu." });
      return;
    }

    const formData = new FormData();
    formData.append("fullName", hostForm.fullName);
    formData.append("phone", hostForm.phoneNumber);
    formData.append("cccdNumber", hostForm.cccdNumber);
    formData.append("bankAccount", hostForm.bankAccount);
    formData.append("bankName", hostForm.bankName);
    formData.append("bankAccountName", hostForm.bankAccountName);
    if (frontImage) formData.append("frontImage", frontImage);
    if (backImage) formData.append("backImage", backImage);

    setSubmitting("host");
    setMessage(null);
    try {
      if (hostApplication) {
        await UserServices.updateUpgradeHost(formData);
      } else {
        await UserServices.upgradeToHost(formData);
      }
      setFrontImage(null);
      setBackImage(null);
      setMessage({ type: "success", text: hostApplication ? "Đã cập nhật và nộp lại hồ sơ HOST." : "Đã gửi hồ sơ nâng cấp HOST." });
      await loadApplications();
      onChanged?.();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Không gửi được hồ sơ HOST." });
    } finally {
      setSubmitting(null);
    }
  };

  const submitEnterprise = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting("enterprise");
    setMessage(null);
    try {
      if (enterpriseApplication) {
        await UserServices.updateUpgradeEnterprise(enterpriseForm);
      } else {
        await UserServices.upgradeToEnterprise(enterpriseForm);
      }
      setMessage({
        type: "success",
        text: enterpriseApplication ? "Đã cập nhật và nộp lại hồ sơ doanh nghiệp." : "Đã gửi hồ sơ nâng cấp doanh nghiệp.",
      });
      await loadApplications();
      onChanged?.();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Không gửi được hồ sơ doanh nghiệp." });
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500 dark:border-white/10 dark:bg-white/[0.02]">
        Đang tải hồ sơ nâng cấp...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Nâng cấp Đối tác</h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Xem lại hồ sơ đã nộp, theo dõi lịch sử trạng thái và sửa/nộp lại khi cần.
        </p>
      </div>

      {message && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {message.text}
        </div>
      )}

      <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-app-primary" />
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Lịch sử nộp hồ sơ</h4>
        </div>
        {orderedHistory.length === 0 ? (
          <p className="text-sm text-zinc-500">Bạn chưa nộp hồ sơ nâng cấp nào.</p>
        ) : (
          <div className="space-y-3">
            {orderedHistory.map((item, index) => (
              <div key={`${item.type}-${item.status}-${item.occurredAt}-${index}`} className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-white/10 dark:bg-zinc-950/40">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-50">{item.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.description}</p>
                  <p className="mt-1 text-[11px] font-semibold text-zinc-400">{formatDateTime(item.occurredAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-app-primary" />
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Hồ sơ HOST cá nhân</h4>
              <p className="text-[11px] text-zinc-500">Dành cho cá nhân kinh doanh dịch vụ lưu trú/trải nghiệm.</p>
            </div>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass(hostStatus)}`}>{statusLabel(hostStatus)}</span>
        </div>

        {hasHost && (
          <div className="mb-4 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
            <UserCheck className="h-4 w-4 shrink-0" />
            Tài khoản của bạn đã có quyền HOST. Thông tin nhận tiền có thể chỉnh trong kênh chủ nhà.
          </div>
        )}

        {hostApplication && (
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailRow label="Họ tên" value={hostApplication.fullName} />
            <DetailRow label="Số điện thoại" value={hostApplication.phone} />
            <DetailRow label="CCCD/Hộ chiếu" value={hostApplication.cccdNumber} />
            <DetailRow label="Ngân hàng" value={hostApplication.bankName} />
            <DetailRow label="Số tài khoản" value={hostApplication.bankAccount} />
            <DetailRow label="Chủ tài khoản" value={hostApplication.bankAccountName} />
            <DetailRow label="Ngày nộp" value={formatDateTime(hostApplication.createdAt)} />
            <DetailRow label="Cập nhật gần nhất" value={formatDateTime(hostApplication.updatedAt)} />
            <div className="sm:col-span-2 flex flex-wrap gap-2 text-xs">
              {hostApplication.frontImageUrl && (
                <Link className="rounded-full border border-zinc-200 px-3 py-2 font-semibold hover:border-zinc-900" href={hostApplication.frontImageUrl} target="_blank">
                  Xem CCCD mặt trước
                </Link>
              )}
              {hostApplication.backImageUrl && (
                <Link className="rounded-full border border-zinc-200 px-3 py-2 font-semibold hover:border-zinc-900" href={hostApplication.backImageUrl} target="_blank">
                  Xem CCCD mặt sau
                </Link>
              )}
            </div>
          </div>
        )}

        {canEditHost && !hasEnterprise && (
          <form onSubmit={submitHost} className="space-y-4 border-t border-zinc-200 pt-5 dark:border-white/10">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Họ tên trên CCCD</span>
                <input required value={hostForm.fullName} onChange={(e) => setHostForm({ ...hostForm, fullName: e.target.value })} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs outline-none focus:border-app-primary dark:border-white/10 dark:bg-zinc-950/50" />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Số điện thoại</span>
                <input required value={hostForm.phoneNumber} onChange={(e) => setHostForm({ ...hostForm, phoneNumber: e.target.value })} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs outline-none focus:border-app-primary dark:border-white/10 dark:bg-zinc-950/50" />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Số CCCD/Hộ chiếu</span>
                <input required value={hostForm.cccdNumber} onChange={(e) => setHostForm({ ...hostForm, cccdNumber: e.target.value })} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs outline-none focus:border-app-primary dark:border-white/10 dark:bg-zinc-950/50" />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Tên ngân hàng</span>
                <input required value={hostForm.bankName} onChange={(e) => setHostForm({ ...hostForm, bankName: e.target.value })} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs outline-none focus:border-app-primary dark:border-white/10 dark:bg-zinc-950/50" />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Số tài khoản</span>
                <input required value={hostForm.bankAccount} onChange={(e) => setHostForm({ ...hostForm, bankAccount: e.target.value })} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs outline-none focus:border-app-primary dark:border-white/10 dark:bg-zinc-950/50" />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Tên chủ tài khoản</span>
                <input required value={hostForm.bankAccountName} onChange={(e) => setHostForm({ ...hostForm, bankAccountName: e.target.value })} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs outline-none focus:border-app-primary dark:border-white/10 dark:bg-zinc-950/50" />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FileInput label={hostApplication ? "Thay ảnh CCCD mặt trước nếu cần" : "Tải ảnh CCCD mặt trước"} file={frontImage} onChange={setFrontImage} />
              <FileInput label={hostApplication ? "Thay ảnh CCCD mặt sau nếu cần" : "Tải ảnh CCCD mặt sau"} file={backImage} onChange={setBackImage} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="h-auto bg-app-primary px-5 py-2 text-xs hover:bg-app-primary/90" disabled={submitting === "host"}>
                {submitting === "host" ? "Đang gửi..." : hostApplication ? "Cập nhật/nộp lại HOST" : "Gửi yêu cầu HOST"}
              </Button>
            </div>
          </form>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-app-primary" />
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Hồ sơ ENTERPRISE doanh nghiệp</h4>
              <p className="text-[11px] text-zinc-500">Dành cho pháp nhân công ty/tổ chức kinh doanh dịch vụ.</p>
            </div>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass(enterpriseStatus)}`}>{statusLabel(enterpriseStatus)}</span>
        </div>

        {hasEnterprise && (
          <div className="mb-4 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Tài khoản của bạn đã có quyền ENTERPRISE. Thông tin nhận tiền có thể chỉnh trong kênh doanh nghiệp.
          </div>
        )}

        {enterpriseApplication && (
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailRow label="Tên công ty" value={enterpriseApplication.companyName} />
            <DetailRow label="Mã số thuế" value={enterpriseApplication.taxCode} />
            <DetailRow label="Người đại diện" value={enterpriseApplication.representativeName} />
            <DetailRow label="Địa chỉ trụ sở" value={enterpriseApplication.companyAddress} />
            <DetailRow label="Ngân hàng" value={enterpriseApplication.bankName} />
            <DetailRow label="Số tài khoản" value={enterpriseApplication.bankAccount} />
            <DetailRow label="Chủ tài khoản" value={enterpriseApplication.bankAccountName} />
            <DetailRow label="Ngày nộp" value={formatDateTime(enterpriseApplication.createdAt)} />
            <DetailRow label="Cập nhật gần nhất" value={formatDateTime(enterpriseApplication.updatedAt)} />
          </div>
        )}

        {canEditEnterprise && !hasHost && (
          <form onSubmit={submitEnterprise} className="space-y-4 border-t border-zinc-200 pt-5 dark:border-white/10">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Tên công ty</span>
                <input required value={enterpriseForm.companyName} onChange={(e) => setEnterpriseForm({ ...enterpriseForm, companyName: e.target.value })} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs outline-none focus:border-app-primary dark:border-white/10 dark:bg-zinc-950/50" />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Người đại diện</span>
                <input required value={enterpriseForm.representativeName} onChange={(e) => setEnterpriseForm({ ...enterpriseForm, representativeName: e.target.value })} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs outline-none focus:border-app-primary dark:border-white/10 dark:bg-zinc-950/50" />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Mã số thuế</span>
                <input required value={enterpriseForm.taxCode} onChange={(e) => setEnterpriseForm({ ...enterpriseForm, taxCode: e.target.value })} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs outline-none focus:border-app-primary dark:border-white/10 dark:bg-zinc-950/50" />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Địa chỉ trụ sở</span>
                <input required value={enterpriseForm.companyAddress} onChange={(e) => setEnterpriseForm({ ...enterpriseForm, companyAddress: e.target.value })} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs outline-none focus:border-app-primary dark:border-white/10 dark:bg-zinc-950/50" />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Tên ngân hàng</span>
                <input required value={enterpriseForm.bankName} onChange={(e) => setEnterpriseForm({ ...enterpriseForm, bankName: e.target.value })} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs outline-none focus:border-app-primary dark:border-white/10 dark:bg-zinc-950/50" />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Số tài khoản</span>
                <input required value={enterpriseForm.bankAccount} onChange={(e) => setEnterpriseForm({ ...enterpriseForm, bankAccount: e.target.value })} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs outline-none focus:border-app-primary dark:border-white/10 dark:bg-zinc-950/50" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Tên chủ tài khoản</span>
                <input required value={enterpriseForm.bankAccountName} onChange={(e) => setEnterpriseForm({ ...enterpriseForm, bankAccountName: e.target.value })} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs outline-none focus:border-app-primary dark:border-white/10 dark:bg-zinc-950/50" />
              </label>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="h-auto bg-app-primary px-5 py-2 text-xs hover:bg-app-primary/90" disabled={submitting === "enterprise"}>
                {submitting === "enterprise" ? "Đang gửi..." : enterpriseApplication ? "Cập nhật/nộp lại ENTERPRISE" : "Gửi yêu cầu ENTERPRISE"}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function FileInput({ label, file, onChange }: { label: string; file: File | null; onChange: (file: File | null) => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-white/10 dark:bg-zinc-950/50">
      <Upload className="mb-2 h-5 w-5 text-zinc-400" />
      <label className="block cursor-pointer text-xs font-semibold text-zinc-600 dark:text-zinc-300">
        {file ? file.name : label}
        <input type="file" className="hidden" accept="image/*" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
}
