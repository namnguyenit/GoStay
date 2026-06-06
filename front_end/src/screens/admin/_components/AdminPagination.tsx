"use client";

import { Button } from "@/components/ui/button";

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
};

export function AdminPagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  loading = false,
  onPageChange,
}: AdminPaginationProps) {
  const safeTotalPages = Math.max(totalPages || 1, 1);
  const start = totalElements === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="flex min-w-0 flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-xs font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <span className="break-words">
        Hiển thị {start}-{end} / {totalElements} bản ghi
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading || page <= 0}
          onClick={() => onPageChange(Math.max(page - 1, 0))}
          className="rounded-full border-slate-200 bg-white text-xs"
        >
          Trước
        </Button>
        <span className="min-w-20 text-center text-[11px] font-bold text-slate-650 sm:min-w-24">
          Trang {page + 1}/{safeTotalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading || page >= safeTotalPages - 1}
          onClick={() => onPageChange(Math.min(page + 1, safeTotalPages - 1))}
          className="rounded-full border-slate-200 bg-white text-xs"
        >
          Sau
        </Button>
      </div>
    </div>
  );
}
