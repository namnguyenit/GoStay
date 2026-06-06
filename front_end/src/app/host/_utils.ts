export type HostPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type HostListing = {
  id: string;
  title?: string;
  description?: string;
  category?: "STAY" | "EXP" | "SVC" | string;
  subCategory?: string;
  province?: string;
  basePrice?: number;
  priceUnit?: string;
  status?: string;
  thumbnailUrl?: string;
  latitude?: number;
  longitude?: number;
  averageRating?: number;
  totalReviews?: number;
  attributes?: Record<string, unknown>;
};

export type HostPayout = {
  id?: string;
  payoutId?: string;
  orderId?: string;
  totalAmount?: number;
  commissionRate?: number;
  commissionAmount?: number;
  hostAmount?: number;
  amount?: number;
  status?: string;
  paidAt?: string | number[] | null;
  createdAt?: string | number[] | null;
};

export type HostOrder = {
  id?: string;
  orderId?: string;
  userId?: string;
  orderNumber?: string;
  createdAt?: string | number[] | null;
  createdDate?: string | number[] | null;
  created_at?: string | number[] | null;
  status?: string;
  totalAmount?: number;
  customerInfo?: {
    fullName?: string;
    phone?: string;
    email?: string;
  };
  items?: Array<{
    listingId?: string;
    listingTitle?: string;
    startDate?: string | number[] | null;
    endDate?: string | number[] | null;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
  }>;
};

export function normalizePage<T>(raw: unknown, fallbackSize = 10): HostPage<T> {
  const envelope = raw && typeof raw === "object" && "data" in raw ? raw as { data?: unknown } : undefined;
  const data = envelope?.data ?? raw;
  const pageData = data && typeof data === "object" ? data as Partial<HostPage<T>> & { content?: unknown } : {};
  const content = Array.isArray(pageData.content) ? pageData.content as T[] : Array.isArray(data) ? data as T[] : [];
  return {
    content,
    totalElements: Number(pageData.totalElements ?? content.length ?? 0),
    totalPages: Math.max(Number(pageData.totalPages ?? 1), 1),
    number: Number(pageData.number ?? 0),
    size: Number(pageData.size ?? fallbackSize),
  };
}

export function getErrorMessage(error: unknown, fallback = "Lỗi không xác định") {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error && typeof (error as { message?: unknown }).message === "string") {
    return (error as { message: string }).message;
  }
  return fallback;
}

export function getErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error && typeof (error as { code?: unknown }).code === "string") {
    return (error as { code: string }).code;
  }
  return "";
}

export const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

export function parseDate(value?: string | number[] | null) {
  if (!value) return null;
  if (Array.isArray(value)) {
    return new Date(value[0], (value[1] ?? 1) - 1, value[2] ?? 1, value[3] ?? 0, value[4] ?? 0, value[5] ?? 0);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value?: string | number[] | null, withTime = false) {
  const date = parseDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function categoryLabel(category?: string) {
  if (category === "STAY") return "Lưu trú";
  if (category === "EXP") return "Trải nghiệm";
  if (category === "SVC") return "Dịch vụ";
  return category || "Chưa rõ";
}

export function priceUnitLabel(unit?: string) {
  if (unit === "PER_NIGHT") return "đêm";
  if (unit === "PER_PAX") return "khách";
  if (unit === "PER_HOUR") return "giờ";
  return unit || "lượt";
}

export function listingStatusLabel(status?: string) {
  const map: Record<string, string> = {
    ACTIVE: "Đang hiển thị",
    PENDING: "Chờ duyệt",
    HIDDEN: "Tạm ẩn",
    DELETED: "Đã xóa",
  };
  return map[status ?? ""] ?? status ?? "Chưa rõ";
}

export function listingStatusClass(status?: string) {
  if (status === "ACTIVE") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "PENDING") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "HIDDEN") return "border-slate-200 bg-slate-50 text-slate-600";
  if (status === "DELETED") return "border-red-200 bg-red-50 text-red-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

export function payoutStatusLabel(status?: string) {
  const map: Record<string, string> = {
    PAID: "Đã chi trả",
    PENDING: "Chờ đối soát",
    REQUESTED: "Đã yêu cầu rút",
    FAILED: "Thất bại",
  };
  return map[status ?? ""] ?? status ?? "Chưa rõ";
}

export function payoutStatusClass(status?: string) {
  if (status === "PAID") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "REQUESTED") return "border-sky-200 bg-sky-50 text-sky-700";
  if (status === "PENDING") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-red-200 bg-red-50 text-red-700";
}

export function orderStatusLabel(status?: string) {
  const map: Record<string, string> = {
    PAYMENT_PENDING: "Chờ thanh toán",
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    COMPLETED: "Hoàn tất",
    CANCELLED: "Đã hủy",
  };
  return map[status ?? ""] ?? status ?? "Chưa rõ";
}

export function orderStatusClass(status?: string) {
  if (status === "CONFIRMED" || status === "COMPLETED") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "PAYMENT_PENDING" || status === "PENDING") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "CANCELLED") return "border-red-200 bg-red-50 text-red-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}
