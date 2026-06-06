"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type AdminConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  intent?: "default" | "danger" | "success";
  loading?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  intent = "default",
  loading = false,
  disabled = false,
  children,
  onOpenChange,
  onConfirm,
}: AdminConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[20px] border border-slate-100 bg-white p-0 text-slate-800 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
        <DialogHeader className="p-5 pb-2">
          <DialogTitle className="text-base font-semibold text-slate-850">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-xs font-medium leading-5 text-slate-500">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children && <div className="px-5 pb-4">{children}</div>}

        <DialogFooter className="mx-0 mb-0 rounded-b-[20px] border-t border-slate-100 bg-slate-50/70 p-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-full border-slate-200 bg-white px-4 text-xs text-slate-650"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading || disabled}
            className={cn(
              "rounded-full px-4 text-xs text-white",
              intent === "danger" && "bg-slate-900 hover:bg-slate-950",
              intent === "success" && "bg-slate-900 hover:bg-slate-950",
              intent === "default" && "bg-slate-850 hover:bg-slate-950"
            )}
          >
            {loading ? "Đang xử lý..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
