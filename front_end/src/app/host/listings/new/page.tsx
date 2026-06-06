"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Save, Plus, Trash, Upload, X, Image as ImageIcon } from "lucide-react";
import { useRef } from "react";
import HostService from "@/services/host.service";
import AuthService from "@/services/auth.service";
import { PROVINCES } from "@/shared/constants/provinces";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getErrorCode, getErrorMessage } from "../../_utils";

type ComplexOption = {
  id: string;
  name?: string;
  province?: string;
};

type MediaUploadResponse = {
  data?: {
    url?: string | string[];
  };
};

type AttributesPayload = {
  categoryType: string;
  galleryUrls: string[];
  stayDetail?: {
    propertyType: string;
    roomSizeSqM: number;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    beds: Array<{ type: string; quantity: number }>;
  };
  amenities?: string[];
  policies?: {
    checkInTime: string;
    checkOutTime: string;
    allowPets: boolean;
    allowSmoking: boolean;
    partyAllowed: boolean;
  };
  expDetail?: {
    durationMinutes: number;
    difficulty: string;
    languages: string[];
    groupSize: { min: number; max: number };
    meetingPoint: string;
    meetingPointLat: number;
    meetingPointLng: number;
  };
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: Array<{ time: string; activity: string }>;
  serviceDetail?: {
    providerType: string;
    durationMinutes: number;
    deliveryDays: number;
    deliverables: string;
    cameraGear: string;
  };
  logistics?: {
    serveAtClientLocation: boolean;
    maxTravelRadiusKm: number;
    equipmentRequiredFromClient: string;
    deliveryTimeWindow: string;
    facilityRequired: string;
    cleanupProvided: boolean;
    equipmentProvided: string;
    setupTimeHours: number;
  };
};

export default function NewListing() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [myComplexes, setMyComplexes] = useState<ComplexOption[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const userRoles = AuthService.getUserRoles();
    setRoles(userRoles);
    
    if (userRoles.includes("ENTERPRISE")) {
      HostService.getMyComplexes().then(res => {
        if (res.data) setMyComplexes(res.data);
      }).catch(() => {
        setFeedback({ type: "error", message: "Không tải được danh sách khu tổ hợp của doanh nghiệp." });
      });
    }
  }, []);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"STAY" | "EXP" | "SVC">("STAY");
  const [subCategory, setSubCategory] = useState<string>("NONE");
  
  const [province, setProvince] = useState("Hà Nội");
  const [basePrice, setBasePrice] = useState("");
  const [priceUnit, setPriceUnit] = useState<"PER_NIGHT" | "PER_PAX" | "PER_HOUR">("PER_NIGHT");
  const [latitude, setLatitude] = useState("21.0285");
  const [longitude, setLongitude] = useState("105.8542");

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setGalleryFiles(prev => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setGalleryPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const [complexId, setComplexId] = useState("");

  // Exp Attributes State
  const [expDuration, setExpDuration] = useState("120");
  const [expDifficulty, setExpDifficulty] = useState("EASY");
  const [expLanguages, setExpLanguages] = useState<string[]>(["Tiếng Việt"]);
  const [newLanguage, setNewLanguage] = useState("");
  const [expGroupSizeMin, setExpGroupSizeMin] = useState("1");
  const [expGroupSizeMax, setExpGroupSizeMax] = useState("10");
  const [expMeetingPoint, setExpMeetingPoint] = useState("");
  const [expMeetingLat, setExpMeetingLat] = useState("21.0285");
  const [expMeetingLng, setExpMeetingLng] = useState("105.8542");
  const [expInclusions, setExpInclusions] = useState<string[]>([]);
  const [newInclusion, setNewInclusion] = useState("");
  const [expExclusions, setExpExclusions] = useState<string[]>([]);
  const [newExclusion, setNewExclusion] = useState("");
  const [expItinerary, setExpItinerary] = useState<Array<{time: string, activity: string}>>([]);
  const [newItineraryTime, setNewItineraryTime] = useState("");
  const [newItineraryActivity, setNewItineraryActivity] = useState("");

  // Svc Attributes State
  const [svcProviderType, setSvcProviderType] = useState("INDIVIDUAL");
  const [svcDuration, setSvcDuration] = useState("60");
  const [svcDeliveryDays, setSvcDeliveryDays] = useState("0");
  const [svcDeliverables, setSvcDeliverables] = useState("");
  const [svcCameraGear, setSvcCameraGear] = useState("");

  // Logistics State (for SVC)
  const [logisticsServeAtClient, setLogisticsServeAtClient] = useState(false);
  const [logisticsMaxTravelRadius, setLogisticsMaxTravelRadius] = useState("0");
  const [logisticsEquipmentRequired, setLogisticsEquipmentRequired] = useState("");
  const [logisticsDeliveryTimeWindow, setLogisticsDeliveryTimeWindow] = useState("");
  const [logisticsFacilityRequired, setLogisticsFacilityRequired] = useState("");
  const [logisticsCleanupProvided, setLogisticsCleanupProvided] = useState(false);
  const [logisticsEquipmentProvided, setLogisticsEquipmentProvided] = useState("");
  const [logisticsSetupTimeHours, setLogisticsSetupTimeHours] = useState("0");


  // Stay Attributes State
  const [propertyType, setPropertyType] = useState("Apartment");
  const [roomSizeSqM, setRoomSizeSqM] = useState("35");
  const [maxGuests, setMaxGuests] = useState("2");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  
  const [beds, setBeds] = useState<Array<{ type: string; quantity: number }>>([
    { type: "King", quantity: 1 }
  ]);

  const [amenities, setAmenities] = useState<string[]>([
    "Wifi", "Air Conditioning", "TV"
  ]);
  const [newAmenity, setNewAmenity] = useState("");

  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("12:00");
  const [allowPets, setAllowPets] = useState(false);
  const [allowSmoking, setAllowSmoking] = useState(false);
  const [partyAllowed, setPartyAllowed] = useState(false);

  // Step Navigations
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // Beds Helpers
  const addBed = () => {
    setBeds([...beds, { type: "Single", quantity: 1 }]);
  };
  const updateBed = (index: number, field: "type" | "quantity", value: string | number) => {
    const updated = [...beds];
    updated[index] = { ...updated[index], [field]: field === "quantity" ? Number(value) : value };
    setBeds(updated);
  };
  const removeBed = (index: number) => {
    setBeds(beds.filter((_, i) => i !== index));
  };

  // Amenities Helpers
  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity("");
    }
  };
  const removeAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  // EXP Helpers
  const addExpLanguage = () => {
    if (newLanguage.trim() && !expLanguages.includes(newLanguage.trim())) {
      setExpLanguages([...expLanguages, newLanguage.trim()]);
      setNewLanguage("");
    }
  };
  const removeExpLanguage = (index: number) => setExpLanguages(expLanguages.filter((_, i) => i !== index));

  const addExpInclusion = () => {
    if (newInclusion.trim() && !expInclusions.includes(newInclusion.trim())) {
      setExpInclusions([...expInclusions, newInclusion.trim()]);
      setNewInclusion("");
    }
  };
  const removeExpInclusion = (index: number) => setExpInclusions(expInclusions.filter((_, i) => i !== index));

  const addExpExclusion = () => {
    if (newExclusion.trim() && !expExclusions.includes(newExclusion.trim())) {
      setExpExclusions([...expExclusions, newExclusion.trim()]);
      setNewExclusion("");
    }
  };
  const removeExpExclusion = (index: number) => setExpExclusions(expExclusions.filter((_, i) => i !== index));

  const addExpItinerary = () => {
    if (newItineraryTime.trim() && newItineraryActivity.trim()) {
      setExpItinerary([...expItinerary, { time: newItineraryTime.trim(), activity: newItineraryActivity.trim() }]);
      setNewItineraryTime("");
      setNewItineraryActivity("");
    }
  };
  const removeExpItinerary = (index: number) => setExpItinerary(expItinerary.filter((_, i) => i !== index));


  const handleSubmit = async () => {
    if (step !== 3) return;
    setFeedback(null);

    if (!title || !basePrice || !province || !latitude || !longitude) {
      setFeedback({ type: "error", message: "Vui lòng điền đầy đủ các trường bắt buộc: tên, giá, địa điểm và tọa độ." });
      return;
    }

    if (category === "STAY") {
      if (!roomSizeSqM || !maxGuests || !bedrooms || !bathrooms || beds.length === 0) {
        setFeedback({ type: "error", message: "Vui lòng nhập đầy đủ diện tích, số khách, phòng ngủ, phòng tắm và cấu hình giường cho nơi lưu trú." });
        return;
      }
      if (!checkInTime || !checkOutTime) {
        setFeedback({ type: "error", message: "Vui lòng nhập giờ nhận phòng và trả phòng." });
        return;
      }
    } else if (category === "EXP") {
      if (!expDuration || !expGroupSizeMin || !expGroupSizeMax || !expMeetingPoint || !expMeetingLat || !expMeetingLng) {
        setFeedback({ type: "error", message: "Vui lòng nhập đầy đủ thời lượng, quy mô nhóm và thông tin điểm hẹn cho trải nghiệm." });
        return;
      }
      if (Number(expGroupSizeMax) < Number(expGroupSizeMin)) {
        setFeedback({ type: "error", message: "Quy mô nhóm tối đa phải lớn hơn hoặc bằng tối thiểu." });
        return;
      }
    } else if (category === "SVC") {
      if (!svcDuration) {
        setFeedback({ type: "error", message: "Vui lòng nhập thời lượng cho dịch vụ." });
        return;
      }
    }

    setLoading(true);

    try {
      let finalThumbnailUrl = "";
      let finalGalleryUrls: string[] = [];

      // Upload Thumbnail
      if (thumbnailFile) {
        const thumbRes = await HostService.uploadSingleMedia(thumbnailFile, "listings") as MediaUploadResponse;
        if (typeof thumbRes?.data?.url === "string") {
          finalThumbnailUrl = thumbRes.data.url;
        }
      }

      // Upload Gallery
      if (galleryFiles.length > 0) {
        const galleryRes = await HostService.uploadBulkMedia(galleryFiles, "listings") as MediaUploadResponse;
        if (Array.isArray(galleryRes?.data?.url)) {
          finalGalleryUrls = [...finalGalleryUrls, ...galleryRes.data.url];
        }
      }

      let finalCategoryType = category as string;
    if (category === "SVC") {
        finalCategoryType = `SVC_${subCategory}`;
    }

    // Build SaveListingRequest DTO
    const attributesPayload: AttributesPayload = {
      categoryType: finalCategoryType,
      galleryUrls: finalGalleryUrls
    };

    if (category === "STAY") {
      attributesPayload.stayDetail = {
        propertyType,
        roomSizeSqM: Number(roomSizeSqM),
        maxGuests: Number(maxGuests),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        beds: beds
      };
      attributesPayload.amenities = amenities;
      attributesPayload.policies = {
        checkInTime,
        checkOutTime,
        allowPets,
        allowSmoking,
        partyAllowed
      };
    } else if (category === "EXP") {
      attributesPayload.expDetail = {
        durationMinutes: Number(expDuration),
        difficulty: expDifficulty,
        languages: expLanguages,
        groupSize: { min: Number(expGroupSizeMin), max: Number(expGroupSizeMax) },
        meetingPoint: expMeetingPoint,
        meetingPointLat: Number(expMeetingLat),
        meetingPointLng: Number(expMeetingLng)
      };
      attributesPayload.inclusions = expInclusions;
      attributesPayload.exclusions = expExclusions;
      attributesPayload.itinerary = expItinerary;
    } else {
      // Service Attributes
      attributesPayload.serviceDetail = {
        providerType: svcProviderType,
        durationMinutes: Number(svcDuration),
        deliveryDays: Number(svcDeliveryDays),
        deliverables: svcDeliverables,
        cameraGear: svcCameraGear
      };
      attributesPayload.logistics = {
        serveAtClientLocation: logisticsServeAtClient,
        maxTravelRadiusKm: Number(logisticsMaxTravelRadius),
        equipmentRequiredFromClient: logisticsEquipmentRequired,
        deliveryTimeWindow: logisticsDeliveryTimeWindow,
        facilityRequired: logisticsFacilityRequired,
        cleanupProvided: logisticsCleanupProvided,
        equipmentProvided: logisticsEquipmentProvided,
        setupTimeHours: Number(logisticsSetupTimeHours)
      };
    }

    const payload = {
      complexId: complexId || undefined,
      category,
      subCategory: category === "SVC" ? subCategory : "NONE",
      title,
      description,
      province,
      basePrice: Number(basePrice),
      priceUnit,
      latitude: Number(latitude),
      longitude: Number(longitude),
      thumbnailUrl: finalThumbnailUrl || finalGalleryUrls[0] || "",
      attributes: attributesPayload
    };

      await HostService.createListing(payload);
      setFeedback({ type: "success", message: "Đăng ký dịch vụ mới thành công." });
      router.push("/host/listings");
    } catch (err: unknown) {
      let errMsg = getErrorMessage(err);
      // Xử lý lỗi khoảng cách (LISTING_OUT_OF_RANGE)
      if (getErrorCode(err) === 'LISTING_OUT_OF_RANGE' || errMsg.includes('Khoảng cách')) {
        errMsg = "Dịch vụ này nằm cách Khu Tổ Hợp quá 3km. Vui lòng kiểm tra lại tọa độ hoặc chọn đúng Khu Tổ Hợp!";
      }
      setFeedback({ type: "error", message: `Đăng dịch vụ thất bại: ${errMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-smooth-appear pb-12">
      
      {/* Header Link */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Đăng dịch vụ mới</h1>
        <p className="text-sm text-gray-500 mt-1">Cung cấp thông tin chi tiết để bắt đầu kinh doanh trên nền tảng.</p>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Đăng dịch vụ mới</h2>
          <p className="text-xs text-gray-600">Bước {step} trên 3: {step === 1 ? "Thông tin cơ bản" : step === 2 ? "Địa điểm & Giá cả" : "Thuộc tính chi tiết"}</p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex gap-2">
        <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-app-primary" : "bg-gray-100"}`} />
        <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-app-primary" : "bg-gray-100"}`} />
        <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? "bg-app-primary" : "bg-gray-100"}`} />
      </div>

      {feedback && (
        <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
          feedback.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-red-200 bg-red-50 text-red-700"
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Main Skeleton Form Container */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
        
        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-2xs font-bold text-gray-600 uppercase mb-1">Tên dịch vụ *</label>
              <input 
                type="text" 
                placeholder="Ví dụ: Căn hộ Deluxe View Hồ Tây" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required
                className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-app-primary"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold text-gray-600 uppercase mb-1">Mô tả chi tiết</label>
              <textarea 
                rows={4}
                placeholder="Mô tả các tiện nghi, không gian và quy tắc..." 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-app-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-bold text-gray-600 uppercase mb-1">Danh mục lớn *</label>
                <select 
                  value={category} 
                  onChange={(e) => {
                    const val = e.target.value as "STAY" | "EXP" | "SVC";
                    setCategory(val);
                    setSubCategory(val === "SVC" ? "PHOTOGRAPHY" : "NONE");
                  }}
                  className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-app-primary"
                >
                  <option value="STAY" className="bg-white">Lưu trú (STAY)</option>
                  <option value="EXP" className="bg-white">Trải nghiệm (EXP)</option>
                  <option value="SVC" className="bg-white">Dịch vụ (SVC)</option>
                </select>
              </div>

              {category === "SVC" && (
                <div>
                  <label className="block text-2xs font-bold text-gray-600 uppercase mb-1">Danh mục phụ *</label>
                  <select 
                    value={subCategory} 
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-app-primary"
                  >
                    <option value="PHOTOGRAPHY" className="bg-white">Photography</option>
                    <option value="CHEF" className="bg-white">Chef</option>
                    <option value="MASSAGE" className="bg-white">Massage</option>
                    <option value="PREPARED_MEALS" className="bg-white">Prepared Meals</option>
                    <option value="TRAINING" className="bg-white">Training</option>
                    <option value="MAKEUP" className="bg-white">Makeup</option>
                    <option value="HAIR_STYLING" className="bg-white">Hair Styling</option>
                    <option value="SPA" className="bg-white">Spa</option>
                    <option value="CATERING" className="bg-white">Catering</option>
                  </select>
                </div>
              )}
            </div>

            {roles.includes("ENTERPRISE") && (
              <div>
                <label className="block text-2xs font-bold text-gray-600 uppercase mb-1">Khu Tổ Hợp (Tuỳ chọn)</label>
                <select 
                  value={complexId} 
                  onChange={(e) => setComplexId(e.target.value)}
                  className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-app-primary"
                >
                  <option value="">-- Không thuộc Khu tổ hợp nào --</option>
                  {myComplexes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.province}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Location & Price */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-bold text-gray-600 uppercase mb-1">Tỉnh/Thành phố *</label>
                <Select value={province} onValueChange={setProvince} required>
                  <SelectTrigger className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-4 py-2.5 h-[42px] text-xs text-gray-900 focus:ring-1 focus:ring-app-primary">
                    <SelectValue placeholder="-- Chọn tỉnh/thành phố --" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-[300px]">
                    <SelectGroup>
                      {PROVINCES.map(p => (
                        <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-2xs font-bold text-gray-600 uppercase mb-1">Đơn vị giá *</label>
                <select 
                  value={priceUnit} 
                  onChange={(e) => setPriceUnit(e.target.value as "PER_NIGHT" | "PER_PAX" | "PER_HOUR")}
                  className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-app-primary"
                >
                  <option value="PER_NIGHT" className="bg-white">Mỗi đêm (PER_NIGHT)</option>
                  <option value="PER_PAX" className="bg-white">Mỗi người (PER_PAX)</option>
                  <option value="PER_HOUR" className="bg-white">Mỗi giờ (PER_HOUR)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-2xs font-bold text-gray-600 uppercase mb-1">Giá cơ bản (VNĐ) *</label>
              <input 
                type="number" 
                placeholder="Ví dụ: 1200000" 
                value={basePrice} 
                onChange={(e) => setBasePrice(e.target.value)}
                required
                className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-app-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-bold text-gray-600 uppercase mb-1">Vĩ độ (Latitude) *</label>
                <input 
                  type="text" 
                  value={latitude} 
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                  className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-app-primary"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold text-gray-600 uppercase mb-1">Kinh độ (Longitude) *</label>
                <input 
                  type="text" 
                  value={longitude} 
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                  className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-app-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-2xs font-bold text-gray-600 uppercase mb-1">Ảnh đại diện (Thumbnail)</label>
              <div 
                onClick={() => thumbnailInputRef.current?.click()}
                className="relative group w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden hover:border-app-primary/50 transition-colors cursor-pointer bg-white flex flex-col items-center justify-center"
              >
                <input 
                  type="file" 
                  ref={thumbnailInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
                {thumbnailPreview ? (
                  <Image unoptimized src={thumbnailPreview} alt="Thumbnail" fill className="object-cover" sizes="(max-width: 768px) 100vw, 672px" />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Tải ảnh đại diện</p>
                    <p className="text-[10px] text-gray-500 mt-1">PNG, JPG, WEBP lên đến 10MB</p>
                  </div>
                )}
                {thumbnailPreview && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm font-semibold flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Thay đổi ảnh
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        
        {/* STEP 3: Attributes */}
        {step === 3 && (
          <div className="space-y-6">
            
            {category === "STAY" && (
              <div className="space-y-6">
                
                {/* Stay Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1">Chi tiết phòng lưu trú</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Loại bất động sản</label>
                      <select 
                        value={propertyType} 
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-app-primary"
                      >
                        <option value="Apartment" className="bg-white">Căn hộ (Apartment)</option>
                        <option value="Villa" className="bg-white">Biệt thự (Villa)</option>
                        <option value="Homestay" className="bg-white">Homestay</option>
                        <option value="Hotel" className="bg-white">Khách sạn (Hotel)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Diện tích (m²)</label>
                      <input 
                        type="number" 
                        value={roomSizeSqM} 
                        onChange={(e) => setRoomSizeSqM(e.target.value)}
                        className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Khách tối đa</label>
                      <input 
                        type="number" 
                        value={maxGuests} 
                        onChange={(e) => setMaxGuests(e.target.value)}
                        className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Phòng ngủ</label>
                      <input 
                        type="number" 
                        value={bedrooms} 
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Phòng tắm</label>
                      <input 
                        type="number" 
                        value={bathrooms} 
                        onChange={(e) => setBathrooms(e.target.value)}
                        className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Beds Configuration */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                    <h3 className="text-xs font-bold text-gray-900">Cấu hình giường</h3>
                    <button 
                      type="button" 
                      onClick={addBed}
                      className="text-[10px] font-bold text-app-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Thêm giường
                    </button>
                  </div>

                  <div className="space-y-2">
                    {beds.map((bed, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <select 
                          value={bed.type}
                          onChange={(e) => updateBed(index, "type", e.target.value)}
                          className="flex-grow bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                        >
                          <option value="King" className="bg-white">King Bed</option>
                          <option value="Queen" className="bg-white">Queen Bed</option>
                          <option value="Double" className="bg-white">Double Bed</option>
                          <option value="Single" className="bg-white">Single Bed</option>
                        </select>
                        <input 
                          type="number" 
                          placeholder="SL" 
                          value={bed.quantity}
                          min={1}
                          onChange={(e) => updateBed(index, "quantity", e.target.value)}
                          className="w-16 bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                        />
                        {beds.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeBed(index)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1">Tiện ích</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Thêm tiện ích (Ví dụ: Hồ bơi)" 
                      value={newAmenity} 
                      onChange={(e) => setNewAmenity(e.target.value)}
                      className="flex-grow bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                    />
                    <button 
                      type="button" 
                      onClick={addAmenity}
                      className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      Thêm
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((item, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-full text-gray-700">
                        {item}
                        <button type="button" onClick={() => removeAmenity(index)} className="text-gray-500 hover:text-gray-900">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Policies */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1">Chính sách chỗ nghỉ</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">Giờ nhận phòng</label>
                      <input 
                        type="text" 
                        value={checkInTime} 
                        onChange={(e) => setCheckInTime(e.target.value)}
                        className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">Giờ trả phòng</label>
                      <input 
                        type="text" 
                        value={checkOutTime} 
                        onChange={(e) => setCheckOutTime(e.target.value)}
                        className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 text-xs">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={allowPets} 
                        onChange={(e) => setAllowPets(e.target.checked)}
                        className="rounded border-gray-300 bg-white text-app-primary focus:ring-0 focus:ring-offset-0 w-4 h-4"
                      />
                      <span className="text-gray-700">Cho phép mang theo thú cưng</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={allowSmoking} 
                        onChange={(e) => setAllowSmoking(e.target.checked)}
                        className="rounded border-gray-300 bg-white text-app-primary focus:ring-0 focus:ring-offset-0 w-4 h-4"
                      />
                      <span className="text-gray-700">Cho phép hút thuốc</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={partyAllowed} 
                        onChange={(e) => setPartyAllowed(e.target.checked)}
                        className="rounded border-gray-300 bg-white text-app-primary focus:ring-0 focus:ring-offset-0 w-4 h-4"
                      />
                      <span className="text-gray-700">Cho phép tổ chức tiệc tùng</span>
                    </label>
                  </div>
                </div>

              </div>
            )}

            {category === "EXP" && (
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1">Chi tiết Trải nghiệm (Experience)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Thời lượng (Phút)</label>
                    <input type="number" value={expDuration} onChange={(e) => setExpDuration(e.target.value)} className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-app-primary" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Độ khó</label>
                    <select value={expDifficulty} onChange={(e) => setExpDifficulty(e.target.value)} className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-app-primary">
                      <option value="EASY" className="bg-white">Dễ (Easy)</option>
                      <option value="MEDIUM" className="bg-white">Trung bình (Medium)</option>
                      <option value="HARD" className="bg-white">Khó (Hard)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Quy mô nhóm (Min - Max)</label>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Min" value={expGroupSizeMin} onChange={(e) => setExpGroupSizeMin(e.target.value)} className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                      <input type="number" placeholder="Max" value={expGroupSizeMax} onChange={(e) => setExpGroupSizeMax(e.target.value)} className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Ngôn ngữ</label>
                    <div className="flex gap-2 mb-2">
                      <input type="text" placeholder="Thêm ngôn ngữ..." value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} className="flex-grow bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                      <button type="button" onClick={addExpLanguage} className="bg-gray-100 border border-gray-300 px-3 py-1 rounded-xl text-xs">Thêm</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {expLanguages.map((item, i) => (
                        <span key={i} className="inline-flex gap-1 items-center px-2 py-1 bg-gray-100 rounded-full text-[10px] text-gray-700">
                          {item} <button type="button" onClick={() => removeExpLanguage(i)} className="text-gray-500 hover:text-gray-900">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Điểm hẹn (Tên + Tọa độ)</label>
                    <input type="text" placeholder="Tên điểm hẹn (VD: Sảnh A, Khách sạn Mường Thanh)" value={expMeetingPoint} onChange={(e) => setExpMeetingPoint(e.target.value)} className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none mb-2" />
                    <div className="flex gap-2">
                      <input type="text" placeholder="Lat" value={expMeetingLat} onChange={(e) => setExpMeetingLat(e.target.value)} className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                      <input type="text" placeholder="Lng" value={expMeetingLng} onChange={(e) => setExpMeetingLng(e.target.value)} className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Bao gồm (Inclusions)</label>
                    <div className="flex gap-2 mb-2">
                      <input type="text" value={newInclusion} onChange={(e) => setNewInclusion(e.target.value)} className="flex-grow bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                      <button type="button" onClick={addExpInclusion} className="bg-gray-100 border border-gray-300 px-3 py-1 rounded-xl text-xs">Thêm</button>
                    </div>
                    <div className="space-y-1">
                      {expInclusions.map((item, i) => (
                        <div key={i} className="flex justify-between bg-gray-100 px-2 py-1 rounded text-xs text-gray-700"><span>{item}</span><button type="button" onClick={() => removeExpInclusion(i)} className="text-red-600">×</button></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Không bao gồm (Exclusions)</label>
                    <div className="flex gap-2 mb-2">
                      <input type="text" value={newExclusion} onChange={(e) => setNewExclusion(e.target.value)} className="flex-grow bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                      <button type="button" onClick={addExpExclusion} className="bg-gray-100 border border-gray-300 px-3 py-1 rounded-xl text-xs">Thêm</button>
                    </div>
                    <div className="space-y-1">
                      {expExclusions.map((item, i) => (
                        <div key={i} className="flex justify-between bg-gray-100 px-2 py-1 rounded text-xs text-gray-700"><span>{item}</span><button type="button" onClick={() => removeExpExclusion(i)} className="text-red-600">×</button></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Lịch trình (Itinerary)</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" placeholder="Thời gian (VD: 08:00)" value={newItineraryTime} onChange={(e) => setNewItineraryTime(e.target.value)} className="w-1/3 bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                    <input type="text" placeholder="Hoạt động" value={newItineraryActivity} onChange={(e) => setNewItineraryActivity(e.target.value)} className="flex-grow bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                    <button type="button" onClick={addExpItinerary} className="bg-gray-100 border border-gray-300 px-3 py-1 rounded-xl text-xs">Thêm</button>
                  </div>
                  <div className="space-y-2 border-l-2 border-gray-300 pl-3">
                    {expItinerary.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-xs text-gray-700">
                        <div><span className="font-bold text-app-primary">{item.time}</span> - {item.activity}</div>
                        <button type="button" onClick={() => removeExpItinerary(i)} className="text-red-600 px-2 py-1">×</button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {category === "SVC" && (
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1">Chi tiết Dịch vụ (Service)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Loại nhà cung cấp</label>
                    <select value={svcProviderType} onChange={(e) => setSvcProviderType(e.target.value)} className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-app-primary">
                      <option value="INDIVIDUAL" className="bg-white">Cá nhân (Individual)</option>
                      <option value="AGENCY" className="bg-white">Doanh nghiệp/Agency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Thời lượng phục vụ (Phút)</label>
                    <input type="number" value={svcDuration} onChange={(e) => setSvcDuration(e.target.value)} className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-app-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Số ngày giao kết quả (Delivery Days)</label>
                    <input type="number" value={svcDeliveryDays} onChange={(e) => setSvcDeliveryDays(e.target.value)} className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-app-primary" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Sản phẩm bàn giao (Deliverables)</label>
                    <input type="text" placeholder="VD: 50 ảnh retouch, 1 video 5 phút" value={svcDeliverables} onChange={(e) => setSvcDeliverables(e.target.value)} className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-app-primary" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Trang thiết bị (Camera Gear / Tool)</label>
                  <input type="text" placeholder="VD: Sony A7IV, Đèn Flash Godox..." value={svcCameraGear} onChange={(e) => setSvcCameraGear(e.target.value)} className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-app-primary" />
                </div>

                <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1 mt-6">Cấu hình Logistics</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                    <input type="checkbox" checked={logisticsServeAtClient} onChange={(e) => setLogisticsServeAtClient(e.target.checked)} className="rounded border-gray-300 bg-white text-app-primary focus:ring-0 w-4 h-4" />
                    <span className="text-gray-700">Phục vụ tại địa điểm của khách hàng (Serve at client location)</span>
                  </label>

                  {logisticsServeAtClient && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Bán kính tối đa (Km)</label>
                        <input type="number" value={logisticsMaxTravelRadius} onChange={(e) => setLogisticsMaxTravelRadius(e.target.value)} className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Thời gian Setup (Giờ)</label>
                        <input type="number" value={logisticsSetupTimeHours} onChange={(e) => setLogisticsSetupTimeHours(e.target.value)} className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Khung giờ giao hàng (Time Window)</label>
                      <input type="text" placeholder="VD: 08:00 - 18:00" value={logisticsDeliveryTimeWindow} onChange={(e) => setLogisticsDeliveryTimeWindow(e.target.value)} className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Thiết bị yêu cầu từ khách (Nếu có)</label>
                      <input type="text" value={logisticsEquipmentRequired} onChange={(e) => setLogisticsEquipmentRequired(e.target.value)} className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Thiết bị Host tự chuẩn bị</label>
                      <input type="text" value={logisticsEquipmentProvided} onChange={(e) => setLogisticsEquipmentProvided(e.target.value)} className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">Yêu cầu không gian (Facility)</label>
                      <input type="text" placeholder="VD: Cần không gian rộng 5m2" value={logisticsFacilityRequired} onChange={(e) => setLogisticsFacilityRequired(e.target.value)} className="w-full bg-white border border-gray-300 shadow-sm rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none" />
                    </div>
                  </div>
                  
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                    <input type="checkbox" checked={logisticsCleanupProvided} onChange={(e) => setLogisticsCleanupProvided(e.target.checked)} className="rounded border-gray-300 bg-white text-app-primary focus:ring-0 w-4 h-4" />
                    <span className="text-gray-700">Cung cấp dọn dẹp sau dịch vụ (Cleanup provided)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Album Gallery Upload */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1">Thư viện ảnh (Gallery)</h3>
              <div className="grid grid-cols-3 gap-3">
                {galleryPreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-300">
                    <Image unoptimized src={preview} alt={'Gallery ' + idx} fill className="object-cover" sizes="(max-width: 768px) 33vw, 220px" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <div 
                  onClick={() => galleryInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-app-primary hover:border-app-primary/50 transition-colors cursor-pointer bg-white"
                >
                  <input 
                    type="file" 
                    ref={galleryInputRef} 
                    className="hidden" 
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                  />
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">Tải ảnh lên</span>
                </div>
              </div>
            </div>
            
          </div>
        )}
{/* Buttons Controls */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          {step > 1 ? (
            <button 
              type="button" 
              onClick={prevStep}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-all font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button 
              type="button" 
              onClick={nextStep}
              className="flex items-center gap-1.5 text-xs text-gray-900 bg-gray-100 border border-gray-300 hover:bg-gray-200 px-4 py-2 rounded-xl transition-all font-semibold"
            >
              Tiếp tục <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-gray-900 bg-app-primary hover:bg-app-primary/95 px-5 py-2.5 rounded-xl transition-all font-bold shadow-lg shadow-app-primary/20 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Lưu & Đăng bán"} <Save className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
