"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, PackageCheck, Plus, Trash2 } from "lucide-react";
import HostService from "@/services/enterprise.service";
import { HostListing, categoryLabel, getErrorMessage, normalizePage } from "../_utils";

type Slot = { slot: string };
type Feedback = { type: "success" | "error"; message: string } | null;

function AvailabilityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<HostListing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState("");
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [calendarData, setCalendarData] = useState<unknown[]>([]);
  const [defaultQuantity, setDefaultQuantity] = useState(2);
  const [slots, setSlots] = useState<Slot[]>([{ slot: "08:00 - 10:00" }, { slot: "14:00 - 16:00" }]);
  const [newSlot, setNewSlot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const selectedListing = useMemo(
    () => listings.find((item) => item.id === selectedListingId),
    [listings, selectedListingId]
  );
  const category = selectedListing?.category || "STAY";
  const isInitialized = calendarData.length > 0;

  useEffect(() => {
    async function loadListings() {
      try {
        setLoadingListings(true);
        const res = await HostService.getMyListings(0, 200);
        const content = normalizePage<HostListing>(res, 200).content;
        setListings(content);
        const queryId = searchParams.get("listingId");
        setSelectedListingId(queryId || content[0]?.id || "");
      } catch (err: unknown) {
        setFeedback({ type: "error", message: getErrorMessage(err, "Không thể tải danh sách dịch vụ.") });
      } finally {
        setLoadingListings(false);
      }
    }
    loadListings();
  }, [searchParams]);

  useEffect(() => {
    async function loadCalendarStatus() {
      if (!selectedListingId) return;
      try {
        setLoadingCalendar(true);
        const now = new Date();
        const res = await HostService.getCalendar(selectedListingId, now.getMonth() + 1, now.getFullYear());
        setCalendarData(res?.data || []);
      } catch {
        setCalendarData([]);
      } finally {
        setLoadingCalendar(false);
      }
    }
    loadCalendarStatus();
  }, [selectedListingId]);

  const addSlot = () => {
    const value = newSlot.trim();
    if (!value || slots.some((item) => item.slot === value)) return;
    setSlots((prev) => [...prev, { slot: value }]);
    setNewSlot("");
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedListingId || !selectedListing) return;
    if (defaultQuantity < 1) {
      setFeedback({ type: "error", message: "Sức chứa mặc định phải lớn hơn 0." });
      return;
    }
    if (category !== "STAY" && slots.length === 0) {
      setFeedback({ type: "error", message: "Trải nghiệm/Dịch vụ cần ít nhất một khung giờ hoạt động." });
      return;
    }

    const payload = {
      category,
      quantity: defaultQuantity,
      totalQuantity: defaultQuantity,
      timeSlots: category === "STAY" ? [] : slots.map((item) => item.slot),
    };

    try {
      setSubmitting(true);
      setFeedback(null);
      if (isInitialized) {
        await HostService.updateInventoryConfig(selectedListingId, payload);
        setFeedback({ type: "success", message: "Đã cập nhật cấu hình khả dụng cho dịch vụ." });
      } else {
        await HostService.initializeInventory(selectedListingId, payload);
        setFeedback({ type: "success", message: "Đã khởi tạo khả dụng và mở lịch 90 ngày cho dịch vụ." });
      }
      const now = new Date();
      const res = await HostService.getCalendar(selectedListingId, now.getMonth() + 1, now.getFullYear());
      setCalendarData(res?.data || []);
    } catch (err: unknown) {
      setFeedback({ type: "error", message: getErrorMessage(err, "Không thể lưu cấu hình khả dụng.") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-smooth-appear">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Khả dụng & sức chứa</h2>
          <p className="text-xs text-gray-600">
            Thiết lập số phòng/chỗ mặc định và khung giờ mở bán cho từng dịch vụ.
          </p>
        </div>
        <button
          type="button"
          onClick={() => selectedListingId && router.push(`/enterprise/calendar?listingId=${selectedListingId}`)}
          disabled={!selectedListingId}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Xem lịch nhận khách
        </button>
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

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Chọn dịch vụ</label>
        {loadingListings ? (
          <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />
        ) : (
          <select
            value={selectedListingId}
            onChange={(event) => {
              setSelectedListingId(event.target.value);
              router.replace(`/enterprise/availability?listingId=${event.target.value}`);
            }}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-900 outline-none focus:border-app-primary"
          >
            {listings.map((item) => (
              <option key={item.id} value={item.id}>
                {categoryLabel(item.category)} - {item.title}
              </option>
            ))}
          </select>
        )}
      </section>

      {selectedListing ? (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{selectedListing.title}</h3>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  {categoryLabel(category)} · {isInitialized ? "Đã khởi tạo" : "Chưa khởi tạo"}
                </p>
              </div>
              <PackageCheck className="h-5 w-5 text-app-primary" />
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  {category === "STAY" ? "Số phòng/căn khả dụng mặc định mỗi ngày" : "Số chỗ phục vụ tối đa mỗi khung giờ"}
                </label>
                <input
                  type="number"
                  min={1}
                  value={defaultQuantity}
                  onChange={(event) => setDefaultQuantity(Number(event.target.value))}
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm font-semibold text-gray-900 outline-none focus:border-app-primary"
                />
                <p className="mt-1 text-[10px] text-gray-500">
                  Giá trị này dùng để tạo lịch mở bán và làm mặc định khi cập nhật cấu hình.
                </p>
              </div>

              {category !== "STAY" && (
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Khung giờ hoạt động
                  </label>
                  <div className="mb-3 flex gap-2">
                    <input
                      value={newSlot}
                      onChange={(event) => setNewSlot(event.target.value)}
                      placeholder="VD: 08:00 - 10:00"
                      className="h-10 flex-1 rounded-xl border border-gray-200 px-3 text-xs outline-none focus:border-app-primary"
                    />
                    <button type="button" onClick={addSlot} className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-gray-800 hover:bg-white">
                      <Plus className="h-3.5 w-3.5" />
                      Thêm
                    </button>
                  </div>
                  <div className="space-y-2">
                    {slots.map((item, index) => (
                      <div key={`${item.slot}-${index}`} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs">
                        <span className="inline-flex items-center gap-2 font-semibold text-gray-800">
                          <Clock className="h-3.5 w-3.5 text-gray-500" />
                          {item.slot}
                        </span>
                        <button type="button" onClick={() => removeSlot(index)} className="rounded-lg p-1 text-red-600 hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <button
                type="submit"
                disabled={submitting || loadingCalendar}
                className="rounded-xl bg-app-primary px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-app-primary/20 transition-all hover:bg-app-primary/95 disabled:opacity-50"
              >
                {submitting ? "Đang lưu..." : isInitialized ? "Cập nhật cấu hình khả dụng" : "Khởi tạo khả dụng & mở lịch 90 ngày"}
              </button>
            </div>
          </section>

          <aside className="rounded-2xl border border-gray-200 bg-white p-6 text-xs">
            <h3 className="mb-3 text-sm font-bold text-gray-900">Ghi chú vận hành</h3>
            <div className="space-y-3 text-gray-600">
              <p>Khả dụng là số lượng dịch vụ có thể nhận đặt trực tuyến.</p>
              <p>Lưu trú thường dùng số phòng/căn mỗi ngày. Trải nghiệm và dịch vụ dùng số chỗ theo từng khung giờ.</p>
              <p>Sau khi khởi tạo, bạn có thể qua trang lịch để khóa/mở từng ngày hoặc điều chỉnh số chỗ cụ thể.</p>
            </div>
          </aside>
        </form>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-xs text-gray-500">
          Bạn chưa có dịch vụ nào để cấu hình khả dụng.
        </div>
      )}
    </div>
  );
}

export default function HostAvailabilityPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs text-gray-500">Đang tải cấu hình khả dụng...</div>}>
      <AvailabilityContent />
    </Suspense>
  );
}
