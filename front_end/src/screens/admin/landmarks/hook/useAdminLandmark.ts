import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import AdminService, {
  AdminLandmark,
  LandmarkSuggestion,
  LandmarkStatus,
  SuggestionStatus,
} from "@/services/admin.service";
import HostService from "@/services/host.service";
import {
  DEFAULT_ADMIN_PAGE_SIZE,
  getAdminErrorMessage,
} from "@/screens/admin/_components/admin-utils";

type Tab = "suggestions" | "create" | "showlandmarks";
type StatusTab = "PENDING" | "RESOLVED" | "REJECTED";

type LandmarkForm = {
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  province: string;
  radiusMeters: string;
  isFeatured: boolean;
  resolvedSuggestionId?: string;
  thumbnailUrl?: string;
};

type EditingLandmark = LandmarkForm & {
  id: string;
  galleryUrls: string[];
};

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

type RejectModalState = {
  open: boolean;
  suggestionId: string | null;
  reason: string;
};

type MediaUploadResponse = {
  data?: {
    url?: string | string[];
    urls?: string[];
  };
};

const EMPTY_FORM: LandmarkForm = {
  name: "",
  description: "",
  latitude: "",
  longitude: "",
  province: "",
  radiusMeters: "5000",
  isFeatured: false,
};

function firstUploadUrl(response: MediaUploadResponse) {
  const url = response.data?.url;
  if (Array.isArray(url)) return url[0] ?? "";
  return url ?? "";
}

function uploadUrls(response: MediaUploadResponse) {
  const url = response.data?.url;
  if (Array.isArray(url)) return url;
  if (typeof url === "string" && url) return [url];
  return response.data?.urls ?? [];
}

export function useAdminLandmark() {
  const [tab, setTab] = useState<Tab>("suggestions");
  const [statusTab, setRawStatusTab] = useState<StatusTab>("PENDING");
  const [suggestions, setSuggestions] = useState<LandmarkSuggestion[]>([]);
  const [suggestionsPage, setSuggestionsPage] = useState(0);
  const [suggestionsTotalPages, setSuggestionsTotalPages] = useState(1);
  const [suggestionsTotalElements, setSuggestionsTotalElements] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<LandmarkForm>(EMPTY_FORM);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [rejectModal, setRejectModal] = useState<RejectModalState>({
    open: false,
    suggestionId: null,
    reason: "",
  });

  const [landmarks, setLandmarks] = useState<AdminLandmark[]>([]);
  const [landmarksPage, setLandmarksPage] = useState(0);
  const [landmarksTotalPages, setLandmarksTotalPages] = useState(1);
  const [landmarksTotalElements, setLandmarksTotalElements] = useState(0);
  const [loadingLandmarks, setLoadingLandmarks] = useState(false);
  const [editingLandmark, setEditingLandmark] = useState<EditingLandmark | null>(null);

  const setStatusTab = (nextStatus: StatusTab) => {
    setRawStatusTab(nextStatus);
    setSuggestionsPage(0);
  };

  const resetCreateForm = () => {
    setForm(EMPTY_FORM);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setExistingGalleryUrls([]);
    setGalleryFiles([]);
    setGalleryPreviews([]);
  };

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getLandmarkSuggestions(
        statusTab,
        suggestionsPage,
        DEFAULT_ADMIN_PAGE_SIZE
      );
      setSuggestions(res?.data?.content ?? []);
      setSuggestionsTotalPages(Math.max(res?.data?.totalPages ?? 1, 1));
      setSuggestionsTotalElements(res?.data?.totalElements ?? 0);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getAdminErrorMessage(error, "Không thể tải đề xuất địa danh."),
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const res = await AdminService.getLandmarkSuggestions("PENDING", 0, 1);
      setPendingCount(res?.data?.totalElements ?? 0);
    } catch {
      setPendingCount(0);
    }
  };

  const fetchLandmarks = async () => {
    setLoadingLandmarks(true);
    try {
      const res = await AdminService.getLandmarks("", landmarksPage, DEFAULT_ADMIN_PAGE_SIZE);
      setLandmarks(res?.data?.content ?? []);
      setLandmarksTotalPages(Math.max(res?.data?.totalPages ?? 1, 1));
      setLandmarksTotalElements(res?.data?.totalElements ?? 0);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getAdminErrorMessage(error, "Không thể tải địa danh chính thức."),
      });
    } finally {
      setLoadingLandmarks(false);
    }
  };

  useEffect(() => {
    if (tab === "suggestions") {
      fetchSuggestions();
      fetchPendingCount();
    }
  }, [tab, statusTab, suggestionsPage]);

  useEffect(() => {
    if (tab === "showlandmarks") {
      fetchLandmarks();
    }
  }, [tab, landmarksPage]);

  const handleApproveSuggestion = (suggestion: LandmarkSuggestion) => {
    resetCreateForm();
    setForm({
      name: suggestion.name ?? "",
      description: suggestion.description ?? "",
      latitude: suggestion.suggestedLatitude?.toString() ?? "",
      longitude: suggestion.suggestedLongitude?.toString() ?? "",
      province: suggestion.suggestedProvince ?? "",
      radiusMeters: "5000",
      isFeatured: false,
      resolvedSuggestionId: suggestion.id,
      thumbnailUrl: suggestion.thumbnailUrl ?? suggestion.referenceImageUrl ?? "",
    });
    setThumbnailPreview(suggestion.thumbnailUrl ?? suggestion.referenceImageUrl ?? null);
    setExistingGalleryUrls(suggestion.galleryUrls ?? []);
    setTab("create");
    setFeedback({
      type: "success",
      message: "Đã đưa đề xuất vào form tạo địa danh. Kiểm tra lại rồi bấm tạo để duyệt chính thức.",
    });
  };

  const openRejectSuggestion = (suggestionId: string) => {
    setRejectModal({ open: true, suggestionId, reason: "" });
  };

  const handleRejectSuggestion = async () => {
    if (!rejectModal.suggestionId || !rejectModal.reason.trim()) return;
    setSubmitting(true);
    try {
      await AdminService.updateLandmarkSuggestionStatus(
        rejectModal.suggestionId,
        "REJECTED",
        rejectModal.reason.trim()
      );
      setRejectModal({ open: false, suggestionId: null, reason: "" });
      setFeedback({ type: "success", message: "Đã từ chối đề xuất địa danh." });
      await fetchSuggestions();
      await fetchPendingCount();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getAdminErrorMessage(error, "Có lỗi khi từ chối đề xuất."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    if (!form.name || !form.latitude || !form.longitude || !form.province) {
      setFeedback({
        type: "error",
        message: "Vui lòng điền đủ Tên, Tỉnh/Thành phố, Vĩ độ và Kinh độ.",
      });
      return;
    }

    setSubmitting(true);
    try {
      let uploadedThumbnailUrl = form.thumbnailUrl ?? "";
      let uploadedGalleryUrls: string[] = [];

      if (thumbnailFile) {
        const thumbRes = (await HostService.uploadSingleMedia(
          thumbnailFile,
          "landmarks"
        )) as MediaUploadResponse;
        uploadedThumbnailUrl = firstUploadUrl(thumbRes);
      }

      if (galleryFiles.length > 0) {
        const galleryRes = (await HostService.uploadBulkMedia(
          galleryFiles,
          "landmarks"
        )) as MediaUploadResponse;
        uploadedGalleryUrls = uploadUrls(galleryRes);
      }

      await AdminService.createLandmark({
        name: form.name,
        description: form.description,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        province: form.province,
        radiusMeters: parseInt(form.radiusMeters, 10) || 5000,
        isFeatured: form.isFeatured,
        thumbnailUrl: uploadedThumbnailUrl,
        galleryUrls: [...existingGalleryUrls, ...uploadedGalleryUrls],
        resolvedSuggestionId: form.resolvedSuggestionId,
      });

      setFeedback({
        type: "success",
        message: `Đã tạo địa danh "${form.name}" thành công.`,
      });
      resetCreateForm();
      await fetchPendingCount();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getAdminErrorMessage(error, "Có lỗi khi tạo địa danh."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLandmarkStatus = async (id: string, currentStatus?: LandmarkStatus) => {
    const nextStatus: LandmarkStatus = currentStatus === "ACTIVE" ? "HIDDEN" : "ACTIVE";
    setSubmitting(true);
    try {
      await AdminService.changeLandmarkStatus(id, nextStatus);
      setFeedback({ type: "success", message: "Đã cập nhật trạng thái địa danh." });
      await fetchLandmarks();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getAdminErrorMessage(error, "Có lỗi khi đổi trạng thái địa danh."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (landmark: AdminLandmark) => {
    setEditingLandmark({
      id: landmark.id,
      name: landmark.name ?? "",
      description: landmark.description ?? "",
      latitude: landmark.latitude?.toString() ?? "",
      longitude: landmark.longitude?.toString() ?? "",
      province: landmark.province ?? "",
      radiusMeters: (landmark.radiusMeters ?? 5000).toString(),
      isFeatured: Boolean(landmark.isFeatured),
      thumbnailUrl: landmark.thumbnailUrl ?? "",
      galleryUrls: landmark.galleryUrls ?? [],
    });
  };

  const handleSaveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingLandmark) return;

    if (!editingLandmark.name || !editingLandmark.latitude || !editingLandmark.longitude || !editingLandmark.province) {
      setFeedback({
        type: "error",
        message: "Vui lòng điền đủ Tên, Tỉnh/Thành phố, Vĩ độ và Kinh độ.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await AdminService.updateLandmark(editingLandmark.id, {
        name: editingLandmark.name,
        description: editingLandmark.description,
        latitude: parseFloat(editingLandmark.latitude),
        longitude: parseFloat(editingLandmark.longitude),
        province: editingLandmark.province,
        radiusMeters: parseInt(editingLandmark.radiusMeters, 10) || 5000,
        isFeatured: editingLandmark.isFeatured,
        thumbnailUrl: editingLandmark.thumbnailUrl,
        galleryUrls: editingLandmark.galleryUrls,
      });
      setFeedback({ type: "success", message: "Cập nhật địa danh thành công." });
      setEditingLandmark(null);
      await fetchLandmarks();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getAdminErrorMessage(error, "Có lỗi xảy ra khi cập nhật địa danh."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status?: SuggestionStatus | LandmarkStatus) => {
    const map: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700 border border-yellow-100",
      RESOLVED: "bg-green-100 text-green-700 border border-green-100",
      REJECTED: "bg-red-100 text-red-700 border border-red-100",
      ACTIVE: "bg-green-50 text-green-700 border border-green-100",
      HIDDEN: "bg-slate-100 text-slate-600 border border-slate-200",
      MAINTENANCE: "bg-amber-50 text-amber-700 border border-amber-100",
    };
    return map[status ?? ""] ?? "bg-gray-100 text-gray-600 border border-gray-200";
  };

  return {
    tab,
    setTab,
    statusTab,
    setStatusTab,
    suggestions,
    suggestionsPage,
    setSuggestionsPage,
    suggestionsTotalPages,
    suggestionsTotalElements,
    loading,
    handleApproveSuggestion,
    openRejectSuggestion,
    rejectModal,
    setRejectModal,
    handleRejectSuggestion,
    form,
    setForm,
    handleCreate,
    submitting,
    feedback,
    statusBadge,
    pendingCount,
    landmarks,
    landmarksPage,
    setLandmarksPage,
    landmarksTotalPages,
    landmarksTotalElements,
    loadingLandmarks,
    editingLandmark,
    setEditingLandmark,
    handleUpdateLandmarkStatus,
    handleStartEdit,
    handleSaveEdit,
    thumbnailFile,
    setThumbnailFile,
    thumbnailPreview,
    setThumbnailPreview,
    existingGalleryUrls,
    setExistingGalleryUrls,
    galleryFiles,
    setGalleryFiles,
    galleryPreviews,
    setGalleryPreviews,
    pageSize: DEFAULT_ADMIN_PAGE_SIZE,
  };
}
