"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building, MapPin, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import EnterpriseService from "@/services/enterprise.service";
import { formatDate, getErrorMessage } from "../_utils";

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

type Feedback = { type: "success" | "error"; message: string } | null;

type EditState = {
  open: boolean;
  complex: EnterpriseComplex | null;
  name: string;
  description: string;
  province: string;
  latitude: string;
  longitude: string;
  thumbnailUrl: string;
};

const EMPTY_EDIT: EditState = {
  open: false,
  complex: null,
  name: "",
  description: "",
  province: "",
  latitude: "",
  longitude: "",
  thumbnailUrl: "",
};

export default function EnterpriseComplexesPage() {
  const [complexes, setComplexes] = useState<EnterpriseComplex[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [selected, setSelected] = useState<EnterpriseComplex | null>(null);
  const [edit, setEdit] = useState<EditState>(EMPTY_EDIT);
  const [confirmDelete, setConfirmDelete] = useState<EnterpriseComplex | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function fetchComplexes() {
    try {
      setLoading(true);
      setFeedback(null);
      const res = await EnterpriseService.getMyComplexes();
      setComplexes(Array.isArray(res?.data) ? res.data : []);
    } catch (err: unknown) {
      setFeedback({ type: "error", message: getErrorMessage(err, "Không thể tải danh sách khu tổ hợp.") });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComplexes();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return complexes.filter((item) => {
      const searchable = [item.name, item.description, item.province, item.id, item.status].join(" ").toLowerCase();
      return !keyword || searchable.includes(keyword);
    });
  }, [complexes, search]);

  const openEdit = (complex: EnterpriseComplex) => {
    setEdit({
      open: true,
      complex,
      name: complex.name || "",
      description: complex.description || "",
      province: complex.province || "",
      latitude: complex.latitude?.toString() || "",
      longitude: complex.longitude?.toString() || "",
      thumbnailUrl: complex.thumbnailUrl || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!edit.complex) return;
    if (!edit.name.trim() || !edit.province.trim() || !edit.latitude.trim() || !edit.longitude.trim()) {
      setFeedback({ type: "error", message: "Vui lòng nhập đủ tên, tỉnh/thành và tọa độ khu tổ hợp." });
      return;
    }

    try {
      setActionLoading(true);
      await EnterpriseService.updateComplex(edit.complex.id, {
        name: edit.name.trim(),
        description: edit.description.trim(),
        province: edit.province.trim(),
        latitude: Number(edit.latitude),
        longitude: Number(edit.longitude),
        thumbnailUrl: edit.thumbnailUrl.trim(),
        galleryUrls: edit.complex.galleryUrls || [],
      });
      setFeedback({ type: "success", message: "Đã cập nhật khu tổ hợp." });
      setEdit(EMPTY_EDIT);
      fetchComplexes();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: getErrorMessage(err, "Cập nhật khu tổ hợp thất bại.") });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setActionLoading(true);
      await EnterpriseService.deleteComplex(confirmDelete.id);
      setFeedback({ type: "success", message: "Đã ẩn khu tổ hợp. Các dịch vụ đang gắn với khu này không bị xóa." });
      setConfirmDelete(null);
      fetchComplexes();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: getErrorMessage(err, "Ẩn khu tổ hợp thất bại.") });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-smooth-appear">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Khu tổ hợp</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý resort/chuỗi homestay và vùng bán kính 3km dành cho listing thuộc doanh nghiệp.
          </p>
        </div>
        <Link href="/enterprise/complexes/new">
          <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-app-primary px-4 text-xs font-bold text-white shadow-sm hover:bg-app-primary/90">
            <Plus className="h-4 w-4" />
            Tạo khu tổ hợp
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
        <div className="relative">
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Tìm khu tổ hợp</label>
          <Search className="absolute left-3 top-[calc(50%+10px)] h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên, tỉnh/thành, trạng thái hoặc ID..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs font-medium text-gray-900 outline-none focus:border-app-primary"
          />
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-64 rounded-2xl border border-gray-100 bg-white p-5">
              <div className="h-24 rounded-xl bg-gray-100 animate-pulse" />
              <div className="mt-4 h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
              <div className="mt-3 h-3 w-full rounded bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Building className="mx-auto mb-4 h-10 w-10 text-gray-300" />
          <h3 className="text-base font-bold text-gray-900">Chưa có khu tổ hợp phù hợp</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Tạo khu tổ hợp để gom nhiều listing cùng một resort/chuỗi và kiểm soát bán kính 3km.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((complex) => (
            <article key={complex.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
              <div className="relative flex h-36 items-end overflow-hidden bg-gradient-to-br from-sky-100 via-cyan-50 to-white p-4">
                <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(14,165,233,.25),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(6,182,212,.2),transparent_35%)]" />
                <span className={`absolute right-4 top-4 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                  complex.status === "HIDDEN"
                    ? "border-slate-200 bg-slate-50 text-slate-600"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}>
                  {complex.status === "HIDDEN" ? "Đã ẩn" : "Đang hoạt động"}
                </span>
                <h3 className="relative line-clamp-2 text-lg font-bold text-gray-900">{complex.name || "Khu tổ hợp chưa có tên"}</h3>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-app-primary" />
                  <span>{complex.province || "Chưa cập nhật tỉnh/thành"} · {complex.latitude ?? "—"}, {complex.longitude ?? "—"}</span>
                </div>
                <p className="line-clamp-3 min-h-[60px] text-sm leading-relaxed text-gray-600">{complex.description || "Chưa có mô tả."}</p>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="font-mono text-[10px] text-gray-400" title={complex.id}>ID: {complex.id.slice(0, 8)}...</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setSelected(complex)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900" title="Xem chi tiết">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button onClick={() => openEdit(complex)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900" title="Sửa">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setConfirmDelete(complex)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Ẩn">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && <ComplexDetailModal complex={selected} onClose={() => setSelected(null)} onEdit={() => { setSelected(null); openEdit(selected); }} />}
      {edit.open && <ComplexEditModal edit={edit} setEdit={setEdit} onSave={handleSaveEdit} saving={actionLoading} />}
      {confirmDelete && (
        <ConfirmModal
          title="Ẩn khu tổ hợp?"
          description={`Khu "${confirmDelete.name || confirmDelete.id}" sẽ chuyển sang trạng thái ẩn. Listing đang gắn với khu này không bị xóa.`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

function ComplexDetailModal({ complex, onClose, onEdit }: { complex: EnterpriseComplex; onClose: () => void; onEdit: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">{complex.name || "Khu tổ hợp"}</h3>
            <p className="mt-0.5 text-[10px] text-gray-500">Tạo lúc {formatDate(complex.createdAt, true)}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4 p-5 text-xs">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Info label="Trạng thái" value={complex.status === "HIDDEN" ? "Đã ẩn" : "Đang hoạt động"} />
            <Info label="Tỉnh/Thành phố" value={complex.province || "—"} />
            <Info label="Tọa độ trung tâm" value={`${complex.latitude ?? "—"}, ${complex.longitude ?? "—"}`} />
            <Info label="Bán kính listing" value="3km quanh khu tổ hợp" />
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Mô tả</div>
            <p className="mt-1 whitespace-pre-line leading-relaxed text-gray-700">{complex.description || "—"}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4">
          <button onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700">Đóng</button>
          <button onClick={onEdit} className="rounded-xl bg-app-primary px-4 py-2 text-xs font-semibold text-white">Sửa khu tổ hợp</button>
        </div>
      </div>
    </div>
  );
}

function ComplexEditModal({ edit, setEdit, onSave, saving }: { edit: EditState; setEdit: (value: EditState) => void; onSave: () => void; saving: boolean }) {
  const setField = (field: "name" | "description" | "province" | "latitude" | "longitude" | "thumbnailUrl", value: string) => {
    setEdit({ ...edit, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-bold text-gray-900">Sửa khu tổ hợp</h3>
          <button onClick={() => setEdit(EMPTY_EDIT)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 text-xs">
          <Field label="Tên khu tổ hợp" value={edit.name} onChange={(value) => setField("name", value)} />
          <TextArea label="Mô tả" value={edit.description} onChange={(value) => setField("description", value)} />
          <Field label="Tỉnh/Thành phố" value={edit.province} onChange={(value) => setField("province", value)} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude" value={edit.latitude} onChange={(value) => setField("latitude", value)} />
            <Field label="Longitude" value={edit.longitude} onChange={(value) => setField("longitude", value)} />
          </div>
          <Field label="Thumbnail URL" value={edit.thumbnailUrl} onChange={(value) => setField("thumbnailUrl", value)} />
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4">
          <button onClick={() => setEdit(EMPTY_EDIT)} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700">Hủy</button>
          <button onClick={onSave} disabled={saving} className="rounded-xl bg-app-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, description, onCancel, onConfirm, loading }: { title: string; description: string; onCancel: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-xs leading-relaxed text-gray-600">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700">Hủy</button>
          <button onClick={onConfirm} disabled={loading} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{loading ? "Đang xử lý..." : "Xác nhận"}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-xs text-gray-900 outline-none focus:border-app-primary" />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-900 outline-none focus:border-app-primary" />
    </label>
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
