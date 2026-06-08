export type ConfirmState =
  | {
      open: false;
    }
  | {
      open: true;
      title: string;
      description?: string;
      confirmLabel?: string;
      intent?: "default" | "danger" | "success";
      onConfirm: () => void | Promise<void>;
    };

export const DEFAULT_ADMIN_PAGE_SIZE = 10;

export function getAdminErrorMessage(error: unknown, fallback = "Có lỗi xảy ra. Vui lòng thử lại.") {
  if (typeof error === "object" && error !== null) {
    const maybeMessage = "message" in error ? (error as { message?: unknown }).message : undefined;
    const maybeError = "error" in error ? (error as { error?: unknown }).error : undefined;

    if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage;
    if (typeof maybeError === "string" && maybeError.trim()) return maybeError;
  }

  return fallback;
}

export function roleName(role: string | { name?: string }) {
  return typeof role === "string" ? role : role.name ?? "";
}

export function formatCurrency(value?: number | string | null) {
  const numeric = typeof value === "string" ? Number(value) : value;
  if (typeof numeric !== "number" || Number.isNaN(numeric)) return "—";
  return `${numeric.toLocaleString("vi-VN")}đ`;
}
