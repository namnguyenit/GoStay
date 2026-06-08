"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Eye, ExternalLink, MapPin, Search, X } from "lucide-react";
import EnterpriseService from "@/services/enterprise.service";
import {
  HostListing,
  categoryLabel,
  formatCurrency,
  formatDate,
  getErrorMessage,
  listingStatusClass,
  listingStatusLabel,
  normalizePage,
  priceUnitLabel,
} from "../../_utils";

type EnterpriseComplex = {
  id: string;
  name?: string;
  description?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  thumbnailUrl?: string;
  galleryUrls?: string[];
  status?: string;
  createdAt?: string | number[] | null;
};

type RuntimeListing = HostListing & {
  complex_id?: string;
};

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Đang hiển thị" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "HIDDEN", label: "Tạm ẩn" },
  { value: "DELETED", label: "Đã xóa" },
];

const CATEGORY_OPTIONS = [
  { value: "ALL", label: "Tất cả loại hình" },
  { value: "STAY", label: "Lưu trú" },
  { value: "EXP", label: "Trải nghiệm" },
  { value: "SVC", label: "Dịch vụ" },
];

function unwrapData<T>(response: unknown): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data?: T }).data as T;
  }
  return response as T;
}

function getListingComplexId(listing: RuntimeListing) {
  return String(listing.complexId ?? listing.complex_id ?? "");
}

function publicListingHref(listing: HostListing) {
  if (listing.category === "STAY") return `/place/${listing.id}/detail`;
  if (listing.category === "EXP") return `/experience/${listing.id}/detail`;
  return `/service/${listing.id}/detail`;
}

export default function EnterpriseComplexDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const complexId = params.id;
  const [complex, setComplex] = useState<EnterpriseComplex | null>(null);
  const [listings, setListings] = useState<RuntimeListing[]>([]);
  const [selected, setSelected] = useState<RuntimeListing | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");
        const [complexRes, listingsRes] = await Promise.all([
          EnterpriseService.getComplex(complexId),
          EnterpriseService.getMyListings(0, 500),
        ]);

        const complexData = unwrapData<EnterpriseComplex>(complexRes);
        const listingPage = normalizePage<RuntimeListing>(listingsRes, 500);
        setComplex(complexData);
        setListings(listingPage.content.filter((item) => getListingComplexId(item) === complexId));
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Không thể tải dữ liệu khu tổ hợp."));
      } finally {
        setLoading(false);
      }
    }

    if (complexId) fetchData();
  }, [complexId]);

  const filteredListings = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return listings.filter((item) => {
      const text = [item.title, item.description, item.province, item.id, item.subCategory].join(" ").toLowerCase();
      const matchKeyword = !keyword || text.includes(keyword);
      const matchStatus = status === "ALL" || item.status === status;
      const matchCategory = category === "ALL" || item.category === category;
      return matchKeyword && matchStatus && matchCategory;
    });
  }, [category, listings, search, status]);

  const gallery = complex?.galleryUrls?.filter(Boolean) ?? [];

  return (
    <div className="space-y-6 animate-smooth-appear">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push("/enterprise/complexes")}
            className="mt-1 rounded-xl border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {complex?.name || "Chi tiết khu tổ hợp"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Xem các dịch vụ đang gắn với khu tổ hợp này và kiểm tra từng dịch vụ trước khi vận hành.
            </p>
          </div>
        </div>
        <Link
          href="/enterprise/listings/new"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-app-primary px-4 text-xs font-bold text-white shadow-sm hover:bg-app-primary/90"
        >
          Đăng dịch vụ mới
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="h-64 animate-pulse bg-gray-100" />
        ) : (
          <>
            <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
              <div className="relative min-h-64 bg-gradient-to-br from-sky-100 via-cyan-50 to-white">
                {complex?.thumbnailUrl ? (
                  <Image
                    unoptimized
                    fill
                    src={complex.thumbnailUrl}
                    alt={complex.name || "Khu tổ hợp"}
                    className="object-cover"
                    sizes="360px"
                  />
                ) : (
                  <div className="flex h-full min-h-64 items-center justify-center text-sm font-semibold text-gray-400">
                    Chưa có ảnh đại diện
                  </div>
                )}
              </div>
              <div className="space-y-5 p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Info label="Trạng thái" value={complex?.status === "HIDDEN" ? "Đã ẩn" : "Đang hoạt động"} />
                  <Info label="Tạo lúc" value={formatDate(complex?.createdAt, true)} />
                  <Info label="Tỉnh/Thành phố" value={complex?.province || "—"} />
                  <Info label="Tọa độ trung tâm" value={`${complex?.latitude ?? "—"}, ${complex?.longitude ?? "—"}`} />
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Mô tả</div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                    {complex?.description || "Chưa có mô tả khu tổ hợp."}
                  </p>
                </div>
                {gallery.length > 0 && (
                  <div>
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Ảnh khu tổ hợp</div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {gallery.map((url, index) => (
                        <Image
                          key={`${url}-${index}`}
                          unoptimized
                          src={url}
                          alt={`Ảnh khu tổ hợp ${index + 1}`}
                          width={120}
                          height={84}
                          className="h-20 w-28 rounded-xl border border-gray-100 object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm dịch vụ trong khu tổ hợp..."
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

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Dịch vụ trong khu tổ hợp</h2>
            <p className="text-xs text-gray-500">
              Hiển thị {filteredListings.length}/{listings.length} dịch vụ thuộc khu này.
            </p>
          </div>
          <Link href="/enterprise/listings" className="text-xs font-bold text-app-primary hover:underline">
            Xem toàn bộ dịch vụ doanh nghiệp
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-2xl border border-gray-100 bg-white" />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <MapPin className="mx-auto mb-4 h-10 w-10 text-gray-300" />
            <h3 className="text-base font-bold text-gray-900">Chưa có dịch vụ phù hợp</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Nếu vừa tạo dịch vụ, hãy kiểm tra dịch vụ đã chọn đúng khu tổ hợp và nằm trong bán kính 3km chưa.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} onSelect={() => setSelected(listing)} />
            ))}
          </div>
        )}
      </section>

      {selected && <ListingDetailModal listing={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ListingCard({ listing, onSelect }: { listing: RuntimeListing; onSelect: () => void }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md">
      <div className="relative h-44 bg-gray-100">
        {listing.thumbnailUrl ? (
          <Image
            unoptimized
            fill
            src={listing.thumbnailUrl}
            alt={listing.title || "Dịch vụ"}
            className="object-cover"
            sizes="360px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-semibold text-gray-400">Chưa có ảnh</div>
        )}
        <span className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-bold ${listingStatusClass(listing.status)}`}>
          {listingStatusLabel(listing.status)}
        </span>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-gray-900">{listing.title || "Dịch vụ chưa có tên"}</h3>
          <p className="mt-1 text-xs text-gray-500">
            {categoryLabel(listing.category)}
            {listing.subCategory && listing.subCategory !== "NONE" ? ` · ${listing.subCategory}` : ""}
          </p>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-900">
            {formatCurrency(listing.basePrice)}
            <span className="font-normal text-gray-500">/{priceUnitLabel(listing.priceUnit)}</span>
          </span>
          <span className="text-gray-500">{listing.province || "—"}</span>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <Link
            href={`/enterprise/calendar?listingId=${listing.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Calendar className="h-4 w-4" />
            Lịch
          </Link>
          <button
            type="button"
            onClick={onSelect}
            className="inline-flex items-center gap-1.5 rounded-xl bg-app-primary px-3 py-2 text-xs font-bold text-white hover:bg-app-primary/90"
          >
            <Eye className="h-4 w-4" />
            Xem chi tiết
          </button>
        </div>
      </div>
    </article>
  );
}

function ListingDetailModal({ listing, onClose }: { listing: RuntimeListing; onClose: () => void }) {
  const gallery = Array.isArray(listing.attributes?.galleryUrls)
    ? listing.attributes.galleryUrls.filter((url): url is string => typeof url === "string")
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="line-clamp-1 text-base font-bold text-gray-900">{listing.title || "Chi tiết dịch vụ"}</h3>
            <p className="mt-0.5 text-[10px] text-gray-500">{listing.id}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5 text-xs">
          {listing.thumbnailUrl && (
            <div className="relative mb-5 h-56 overflow-hidden rounded-2xl border border-gray-100">
              <Image unoptimized fill src={listing.thumbnailUrl} alt={listing.title || "Dịch vụ"} className="object-cover" sizes="768px" />
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
                {gallery.map((url, index) => (
                  <Image key={`${url}-${index}`} unoptimized src={url} alt={`gallery-${index}`} width={128} height={88} className="h-24 w-32 rounded-xl border border-gray-100 object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700">
            Đóng
          </button>
          <Link href={publicListingHref(listing)} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-app-primary px-4 py-2 text-xs font-semibold text-white">
            Mở trang khách xem
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
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
