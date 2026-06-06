"use client";

import Link from "next/link";
import Image from "next/image";
import { AdminConfirmDialog } from "@/screens/admin/_components/AdminConfirmDialog";
import { AdminPagination } from "@/screens/admin/_components/AdminPagination";
import { formatCurrency } from "@/screens/admin/_components/admin-utils";
import { AdminListing, ListingStatus } from "@/services/admin.service";
import { useAdminListings } from "./hook/useAdminListings";

const STATUS_TABS: { label: string; value: ListingStatus | "" }[] = [
  { label: "Tất cả", value: "" },
  { label: "Hoạt động", value: "ACTIVE" },
  { label: "Chờ duyệt", value: "PENDING" },
  { label: "Tạm ẩn", value: "HIDDEN" },
  { label: "Đã xóa", value: "DELETED" },
];

function formatAttributeValue(value: unknown) {
  if (typeof value === "boolean") return value ? "Có" : "Không";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return `${value.length} mục`;
  if (value && typeof value === "object") return "Có cấu hình";
  return "—";
}

function ListingThumb({ item }: { item: AdminListing }) {
  if (!item.thumbnailUrl) {
    return <div className="h-11 w-11 rounded-xl border border-slate-100 bg-slate-50" />;
  }

  return (
    <Image
      unoptimized
      src={item.thumbnailUrl}
      alt={item.title ?? "listing"}
      width={44}
      height={44}
      className="h-11 w-11 rounded-xl border border-slate-100 bg-slate-50 object-cover"
    />
  );
}

export function ListingsScreen() {
  const {
    listings,
    loading,
    actionLoading,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    totalElements,
    pageSize,
    selectedListing,
    setSelectedListing,
    confirm,
    setConfirm,
    feedback,
    handleConfirm,
    handleUpdateStatus,
    getStatusBadge,
  } = useAdminListings();

  const galleryUrls = selectedListing?.attributes?.galleryUrls ?? [];
  const attributes = selectedListing?.attributes
    ? Object.entries(selectedListing.attributes).filter(
        ([key]) => key !== "galleryUrls" && key !== "categoryType"
      )
    : [];

  return (
    <div className="space-y-6 animate-smooth-appear">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Quản lý dịch vụ (Listings)</h2>
          <p className="mt-1 text-xs text-slate-400">
            Phân trang theo API, kiểm duyệt trạng thái hiển thị và xem nhanh dữ liệu listing.
          </p>
        </div>
        <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-400">
          {totalElements} dịch vụ
        </span>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-xs font-semibold ${
            feedback.type === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-rose-100 bg-rose-50 text-rose-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex flex-wrap rounded-full bg-slate-100/80 p-0.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value || "all"}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === tab.value
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm trong trang hiện tại: tên, tỉnh, host..."
          className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:border-slate-200 focus:outline-none lg:max-w-sm"
        />
      </div>

      <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Dịch vụ</th>
                <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Danh mục</th>
                <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Giá cơ bản</th>
                <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Tỉnh thành</th>
                <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Đánh giá</th>
                <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Trạng thái</th>
                <th className="px-5 py-3 pr-6 text-right text-[10px] font-bold tracking-wider text-slate-400 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={7} className="px-5 py-4">
                      <div className="h-4 rounded bg-slate-50 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center font-medium text-slate-400">
                    Không tìm thấy dịch vụ nào trong trang hiện tại.
                  </td>
                </tr>
              ) : (
                listings.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      <div className="flex items-center gap-3">
                        <ListingThumb item={item} />
                        <div>
                          <div className="line-clamp-1 font-semibold text-slate-800">{item.title || "—"}</div>
                          <div className="mt-0.5 text-[10px] text-slate-400">ID: {item.id}</div>
                          <div className="mt-0.5 max-w-[180px] truncate text-[10px] text-slate-400">Host: {item.hostId || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      <div className="font-medium text-slate-700">{item.category || "—"}</div>
                      <div className="mt-0.5 text-[10px] text-slate-450">{item.subCategory || "—"}</div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      {formatCurrency(item.basePrice)} <span className="text-[10px] font-normal text-slate-450">/ {item.priceUnit || "—"}</span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-650">{item.province || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-650">
                      {(item.totalReviews ?? 0) > 0 ? (
                        <span className="font-semibold text-yellow-600">
                          {item.averageRating} ({item.totalReviews})
                        </span>
                      ) : (
                        <span className="text-slate-400">Chưa đánh giá</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${getStatusBadge(item.status)}`}>
                        {item.status || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 pr-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedListing(item)}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-200"
                        >
                          Chi tiết
                        </button>
                        <Link
                          href={`/admin/inventory?listingId=${item.id}`}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-200"
                        >
                          Tồn kho
                        </Link>
                        {item.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(item.id, "ACTIVE")}
                            className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-blue-700"
                          >
                            Duyệt
                          </button>
                        )}
                        {item.status === "HIDDEN" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(item.id, "ACTIVE")}
                            className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-emerald-700"
                          >
                            Hiện
                          </button>
                        )}
                        {item.status === "ACTIVE" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(item.id, "HIDDEN")}
                            className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-600 transition-colors hover:bg-amber-100"
                          >
                            Ẩn
                          </button>
                        )}
                        {item.status !== "DELETED" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(item.id, "DELETED")}
                            className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-650 transition-colors hover:bg-red-100"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          loading={loading}
          onPageChange={setPage}
        />
      </div>

      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm animate-fade-in">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[20px] border border-slate-100 bg-white text-xs text-slate-600 shadow-xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/50 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">{selectedListing.title || "Chi tiết dịch vụ"}</h3>
                <p className="mt-0.5 text-[10px] text-slate-400">ID: {selectedListing.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedListing(null)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-650"
              >
                x
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              {selectedListing.thumbnailUrl && (
                <div className="relative h-52 w-full overflow-hidden rounded-2xl border border-slate-100">
                  <Image
                    unoptimized
                    fill
                    src={selectedListing.thumbnailUrl}
                    alt={selectedListing.title ?? "listing thumbnail"}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="mb-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Danh mục</h4>
                  <p className="font-semibold text-slate-800">{selectedListing.category || "—"} / {selectedListing.subCategory || "—"}</p>
                </div>
                <div>
                  <h4 className="mb-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Giá bán</h4>
                  <p className="font-semibold text-slate-800">{formatCurrency(selectedListing.basePrice)} / {selectedListing.priceUnit || "—"}</p>
                </div>
                <div>
                  <h4 className="mb-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Vị trí</h4>
                  <p className="font-semibold text-slate-800">{selectedListing.province || "—"}</p>
                </div>
                <div>
                  <h4 className="mb-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Tọa độ</h4>
                  <p className="font-semibold text-slate-800">{selectedListing.latitude ?? "—"}, {selectedListing.longitude ?? "—"}</p>
                </div>
                <div className="sm:col-span-2">
                  <h4 className="mb-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Host ID</h4>
                  <p className="select-all rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 font-mono text-slate-700">{selectedListing.hostId || "—"}</p>
                </div>
              </div>

              {selectedListing.description && (
                <div>
                  <h4 className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Mô tả dịch vụ</h4>
                  <p className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 leading-relaxed whitespace-pre-line text-slate-650">
                    {selectedListing.description}
                  </p>
                </div>
              )}

              {galleryUrls.length > 0 && (
                <div>
                  <h4 className="mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Bộ sưu tập ảnh</h4>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {galleryUrls.map((url, index) => (
                      <Image
                        unoptimized
                        key={`${url}-${index}`}
                        src={url}
                        alt={`gallery-${index}`}
                        width={144}
                        height={96}
                        className="h-24 w-36 flex-shrink-0 rounded-lg border border-slate-100 object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              {attributes.length > 0 && (
                <div>
                  <h4 className="mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Thuộc tính dịch vụ</h4>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {attributes.map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/30 p-2">
                        <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                        <span className="text-right font-semibold text-slate-800">{formatAttributeValue(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/50 p-4">
              <button
                type="button"
                onClick={() => setSelectedListing(null)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Đóng
              </button>

              {selectedListing.status === "PENDING" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedListing.id, "ACTIVE")}
                  className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Duyệt dịch vụ
                </button>
              )}
              {selectedListing.status === "ACTIVE" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedListing.id, "HIDDEN")}
                  className="rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-900"
                >
                  Tạm ẩn dịch vụ
                </button>
              )}
              {selectedListing.status === "HIDDEN" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedListing.id, "ACTIVE")}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  Kích hoạt dịch vụ
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <AdminConfirmDialog
        open={confirm.open}
        title={confirm.open ? confirm.title : ""}
        description={confirm.open ? confirm.description : undefined}
        confirmLabel={confirm.open ? confirm.confirmLabel : undefined}
        intent={confirm.open ? confirm.intent : "default"}
        loading={actionLoading}
        onOpenChange={(open) => setConfirm(open ? confirm : { open: false })}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
