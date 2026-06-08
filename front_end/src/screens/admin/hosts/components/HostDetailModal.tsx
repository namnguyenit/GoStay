"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminHostDetail } from "@/services/admin.service";

interface HostDetailModalProps {
  isOpen: boolean;
  hostData: AdminHostDetail | null;
  isLoading: boolean;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">{label}</div>
      <div className="mt-1 break-words text-xs font-semibold text-slate-700">{value || "—"}</div>
    </div>
  );
}

function IdentityImage({ label, url }: { label: string; url?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <div className="mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">{label}</div>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-slate-100 bg-white">
          <div className="relative h-40 w-full">
            <Image
              unoptimized
              fill
              src={url}
              alt={label}
              className="object-cover transition-transform hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>
        </a>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-xs font-semibold text-slate-500">
          Chưa có ảnh
        </div>
      )}
    </div>
  );
}

export function HostDetailModal({ isOpen, hostData, isLoading, onClose }: HostDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[20px] border border-slate-100 bg-white p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-100 p-5">
          <DialogTitle className="text-base font-semibold text-slate-900">Chi tiết Host</DialogTitle>
          <p className="text-xs font-medium text-slate-500">Thông tin xác minh lấy từ endpoint host detail.</p>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-12 rounded-xl bg-slate-50 animate-pulse" />
            ))}
          </div>
        ) : hostData ? (
          <div className="space-y-5 p-5 sm:p-6">
            <div className="flex min-w-0 items-center gap-4">
              {hostData.avatarUrl ? (
                <Image
                  unoptimized
                  src={hostData.avatarUrl}
                  alt={hostData.fullName ?? "Host avatar"}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full border border-slate-100 object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-lg font-bold text-slate-500">
                  {(hostData.fullName ?? "H").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <h4 className="truncate text-base font-semibold text-slate-950">{hostData.fullName || "Host chưa có tên"}</h4>
                <p className="mt-1 break-all text-xs font-medium text-slate-500">{hostData.accountId}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Loại host" value={hostData.hostType} />
              <Field label="Trạng thái duyệt" value={hostData.approvalStatus} />
              <Field label="Mã số thuế" value={hostData.identityInfo?.taxCode} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <IdentityImage label="Ảnh giấy tờ mặt trước" url={hostData.identityInfo?.frontImageUrl} />
              <IdentityImage label="Ảnh giấy tờ mặt sau" url={hostData.identityInfo?.backImageUrl} />
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs font-semibold text-slate-500">
            Không có dữ liệu chi tiết.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
