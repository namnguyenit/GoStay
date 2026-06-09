"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Eye, Pencil, PlusCircle, Search, Trash2, X } from "lucide-react";
import HostService from "@/services/enterprise.service";
import LocationCoordinatePicker from "@/shared/components/LocationCoordinatePicker";
import {
  HostListing,
  categoryLabel,
  formatCurrency,
  getErrorMessage,
  listingStatusClass,
  listingStatusLabel,
  normalizePage,
  priceUnitLabel,
} from "../_utils";

const PAGE_SIZE = 8;
const CATEGORY_OPTIONS = [
  { value: "ALL", label: "Tất cả loại hình" },
  { value: "STAY", label: "Lưu trú" },
  { value: "EXP", label: "Trải nghiệm" },
  { value: "SVC", label: "Dịch vụ" },
];
const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Đang hiển thị" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "HIDDEN", label: "Tạm ẩn" },
  { value: "DELETED", label: "Đã xóa" },
];

type Feedback = { type: "success" | "error"; message: string } | null;

type EditState = {
  open: boolean;
  listing: HostListing | null;
  title: string;
  description: string;
  province: string;
  basePrice: string;
  priceUnit: string;
  latitude: string;
  longitude: string;
  thumbnailUrl: string;
};

const EMPTY_EDIT: EditState = {
  open: false,
  listing: null,
  title: "",
  description: "",
  province: "",
  basePrice: "",
  priceUnit: "PER_NIGHT",
  latitude: "",
  longitude: "",
  thumbnailUrl: "",
};

export default function EnterpriseListings() {
  const [listings, setListings] = useState<HostListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [selected, setSelected] = useState<HostListing | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<HostListing | null>(null);
  const [edit, setEdit] = useState<EditState>(EMPTY_EDIT);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function fetchListings() {
    try {
      setLoading(true);
      setFeedback(null);
      const res = await HostService.getMyListings(0, 200);
      setListings(normalizePage<HostListing>(res, 200).content);
    } catch (err: unknown) {
      setFeedback({ type: "error", message: getErrorMessage(err, "Không thể tải danh sách dịch vụ.") });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [search, category, status]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return listings.filter((item) => {
      const matchKeyword = !keyword
        || item.title?.toLowerCase().includes(keyword)
        || item.province?.toLowerCase().includes(keyword)
        || item.description?.toLowerCase().includes(keyword)
        || item.id?.toLowerCase().includes(keyword);
      const matchCategory = category === "ALL" || item.category === category;
      const matchStatus = status === "ALL" || item.status === status;
      return matchKeyword && matchCategory && matchStatus;
    });
  }, [listings, search, category, status]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const openEdit = (listing: HostListing) => {
    setEdit({
      open: true,
      listing,
      title: listing.title || "",
      description: listing.description || "",
      province: listing.province || "",
      basePrice: listing.basePrice?.toString() || "",
      priceUnit: listing.priceUnit || "PER_NIGHT",
      latitude: listing.latitude?.toString() || "",
      longitude: listing.longitude?.toString() || "",
      thumbnailUrl: listing.thumbnailUrl || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!edit.listing) return;
    if (!edit.title.trim() || !edit.province.trim() || !edit.basePrice.trim() || !edit.latitude.trim() || !edit.longitude.trim()) {
      setFeedback({ type: "error", message: "Vui lòng nhập đủ tên, tỉnh/thành, giá và tọa độ trước khi lưu." });
      return;
    }

    try {
      setActionLoading(true);
      const listing = edit.listing;
      await HostService.updateListing(listing.id, {
        category: listing.category,
        subCategory: listing.subCategory || "NONE",
        title: edit.title.trim(),
        description: edit.description.trim(),
        province: edit.province.trim(),
        basePrice: Number(edit.basePrice),
        priceUnit: edit.priceUnit,
        latitude: Number(edit.latitude),
        longitude: Number(edit.longitude),
        thumbnailUrl: edit.thumbnailUrl.trim(),
        attributes: {
          ...(listing.attributes || {}),
          galleryUrls: listing.attributes?.galleryUrls || [],
        },
      });
      setFeedback({ type: "success", message: "Đã cập nhật dịch vụ. Nếu dịch vụ cần duyệt lại, trạng thái sẽ do admin xử lý." });
      setEdit(EMPTY_EDIT);
      fetchListings();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: getErrorMessage(err, "Cập nhật dịch vụ thất bại.") });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setActionLoading(true);
      await HostService.deleteListing(confirmDelete.id);
      setFeedback({ type: "success", message: "Đã xóa dịch vụ." });
      setConfirmDelete(null);
      fetchListings();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: getErrorMessage(err, "Xóa dịch vụ thất bại.") });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-smooth-appear">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Quản lý dịch vụ</h2>
          <p className="text-xs text-gray-500">
            Tìm kiếm, chỉnh sửa và theo dõi trạng thái các dịch vụ đang kinh doanh.
          </p>
        </div>
        <Link href="/enterprise/listings/new">
          <button className="flex h-10 items-center gap-2 rounded-xl bg-app-primary px-4 text-xs font-semibold text-white transition-all hover:bg-app-primary/95">
            <PlusCircle className="h-4 w-4" />
            Đăng dịch vụ mới
          </button>
        </Link>
      </div>

      {feedback && (
        <div className={`rounded-2xl border px-4 py-3 text-xs font-semibold ${
          feedback.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-red-200 bg-red-50 text-red-700"
        }`}>
          {feedback.message}
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên, tỉnh thành, mô tả hoặc ID..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs font-medium text-gray-900 outline-none transition-all focus:border-app-primary"
            />
          </div>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-app-primary"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-app-primary"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </section>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : pageItems.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xs text-gray-500">Không có dịch vụ phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3 font-bold">Dịch vụ</th>
                  <th className="px-5 py-3 font-bold">Loại hình</th>
                  <th className="px-5 py-3 font-bold">Vị trí</th>
                  <th className="px-5 py-3 font-bold">Giá</th>
                  <th className="px-5 py-3 font-bold">Đánh giá</th>
                  <th className="px-5 py-3 font-bold">Trạng thái</th>
                  <th className="px-5 py-3 text-right font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        {item.thumbnailUrl ? (
                          <Image
                            unoptimized
                            src={item.thumbnailUrl}
                            alt={item.title || "listing"}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-xl border border-gray-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-[10px] text-gray-500">
                            Ảnh
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="line-clamp-1 max-w-[260px] font-bold text-gray-900">{item.title || "—"}</p>
                          <p className="mt-0.5 max-w-[240px] truncate font-mono text-[10px] text-gray-500">ID: {item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-700">
                      {categoryLabel(item.category)}
                      {item.subCategory && item.subCategory !== "NONE" && (
                        <div className="mt-0.5 text-[10px] text-gray-500">{item.subCategory}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{item.province || "Chưa rõ"}</td>
                    <td className="px-5 py-4 font-bold text-gray-900">
                      {formatCurrency(item.basePrice)}
                      <span className="font-normal text-gray-500">/{priceUnitLabel(item.priceUnit)}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {(item.totalReviews ?? 0) > 0 ? `${item.averageRating ?? 0}/5 (${item.totalReviews})` : "Chưa có"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${listingStatusClass(item.status)}`}>
                        {listingStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => setSelected(item)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900" title="Xem chi tiết">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEdit(item)} className="rounded-lg p-2 text-sky-600 hover:bg-sky-50" title="Sửa dịch vụ">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <Link href={`/enterprise/calendar?listingId=${item.id}`} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Xem lịch">
                          <Calendar className="h-4 w-4" />
                        </Link>
                        {item.status !== "DELETED" && (
                          <button onClick={() => setConfirmDelete(item)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Xóa dịch vụ">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Hiển thị {filtered.length === 0 ? 0 : page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} / {filtered.length} dịch vụ
          </span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 0} onClick={() => setPage((prev) => Math.max(prev - 1, 0))} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">
              Trước
            </button>
            <span className="font-bold text-gray-900">Trang {page + 1}/{totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-40">
              Sau
            </button>
          </div>
        </div>
      </div>

      {selected && <ListingDetailModal listing={selected} onClose={() => setSelected(null)} onEdit={() => { openEdit(selected); setSelected(null); }} />}
      {edit.open && (
        <EditListingModal
          edit={edit}
          setEdit={setEdit}
          loading={actionLoading}
          onClose={() => setEdit(EMPTY_EDIT)}
          onSave={handleSaveEdit}
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          title="Xóa dịch vụ?"
          description={`Dịch vụ "${confirmDelete.title}" sẽ bị xóa mềm khỏi danh sách kinh doanh.`}
          loading={actionLoading}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function ListingDetailModal({ listing, onClose, onEdit }: { listing: HostListing; onClose: () => void; onEdit: () => void }) {
  const gallery = Array.isArray(listing.attributes?.galleryUrls) ? listing.attributes.galleryUrls.filter((url): url is string => typeof url === "string") : [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="line-clamp-1 text-base font-bold text-gray-900">{listing.title}</h3>
            <p className="mt-0.5 text-[10px] text-gray-500">{listing.id}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5 text-xs">
          {listing.thumbnailUrl && (
            <div className="relative mb-5 h-56 overflow-hidden rounded-2xl border border-gray-100">
              <Image unoptimized fill src={listing.thumbnailUrl} alt={listing.title || "listing"} className="object-cover" sizes="768px" />
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Info label="Loại hình" value={`${categoryLabel(listing.category)}${listing.subCategory && listing.subCategory !== "NONE" ? ` / ${listing.subCategory}` : ""}`} />
            <Info label="Trạng thái" value={listingStatusLabel(listing.status)} />
            <Info label="Vị trí" value={listing.province || "—"} />
            <Info label="Giá" value={`${formatCurrency(listing.basePrice)}/${priceUnitLabel(listing.priceUnit)}`} />
            <Info label="Tọa độ" value={`${listing.latitude ?? "—"}, ${listing.longitude ?? "—"}`} />
            <Info label="Đánh giá" value={(listing.totalReviews ?? 0) > 0 ? `${listing.averageRating ?? 0}/5 (${listing.totalReviews})` : "Chưa có đánh giá"} />
          </div>
          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">Mô tả</div>
            <p className="whitespace-pre-line leading-relaxed text-gray-700">{listing.description || "—"}</p>
          </div>
          {gallery.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Gallery</div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((url: string, index: number) => (
                  <Image key={`${url}-${index}`} unoptimized src={url} alt={`gallery-${index}`} width={128} height={88} className="h-24 w-32 rounded-xl border border-gray-100 object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4">
          <button onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700">Đóng</button>
          <button onClick={onEdit} className="rounded-xl bg-app-primary px-4 py-2 text-xs font-semibold text-white">Sửa dịch vụ</button>
        </div>
      </div>
    </div>
  );
}

function EditListingModal({ edit, setEdit, loading, onClose, onSave }: {
  edit: EditState;
  setEdit: (value: EditState) => void;
  loading: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const setField = (key: keyof EditState, value: string) => setEdit({ ...edit, [key]: value });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-bold text-gray-900">Sửa dịch vụ</h3>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto p-5 text-xs sm:grid-cols-2">
          <Field label="Tên dịch vụ" value={edit.title} onChange={(value) => setField("title", value)} required />
          <Field label="Tỉnh/Thành phố" value={edit.province} onChange={(value) => setField("province", value)} required />
          <Field label="Giá cơ bản" value={edit.basePrice} onChange={(value) => setField("basePrice", value)} type="number" required />
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Đơn vị giá</label>
            <select value={edit.priceUnit} onChange={(event) => setField("priceUnit", event.target.value)} className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-app-primary">
              <option value="PER_NIGHT">Theo đêm</option>
              <option value="PER_PAX">Theo khách</option>
              <option value="PER_HOUR">Theo giờ</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <LocationCoordinatePicker
              title="Chọn vị trí dịch vụ"
              hint="Bấm lên bản đồ hoặc tìm địa chỉ để cập nhật vĩ độ/kinh độ của dịch vụ."
              searchPlaceholder="Nhập địa chỉ hoặc địa danh gần dịch vụ..."
              value={{
                name: edit.title,
                province: edit.province,
                latitude: edit.latitude,
                longitude: edit.longitude,
              }}
              onChange={(patch) =>
                setEdit({
                  ...edit,
                  province: patch.province ?? edit.province,
                  latitude: patch.latitude ?? edit.latitude,
                  longitude: patch.longitude ?? edit.longitude,
                })
              }
            />
          </div>
          <div className="sm:col-span-2">
            <Field label="Thumbnail URL" value={edit.thumbnailUrl} onChange={(value) => setField("thumbnailUrl", value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Mô tả</label>
            <textarea value={edit.description} onChange={(event) => setField("description", event.target.value)} rows={4} className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-app-primary" />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4">
          <button onClick={onClose} disabled={loading} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700">Hủy</button>
          <button onClick={onSave} disabled={loading} className="rounded-xl bg-app-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, description, loading, onCancel, onConfirm }: {
  title: string;
  description: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-xs leading-5 text-gray-600">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} disabled={loading} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700">Hủy</button>
          <button onClick={onConfirm} disabled={loading} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
            {loading ? "Đang xóa..." : "Xóa dịch vụ"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
        {label}{required ? " *" : ""}
      </label>
      <input value={value} onChange={(event) => onChange(event.target.value)} type={type} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-xs outline-none focus:border-app-primary" />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</div>
      <div className="mt-1 break-words font-semibold text-gray-900">{value}</div>
    </div>
  );
}
