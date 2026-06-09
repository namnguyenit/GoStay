"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Save, Upload, X } from "lucide-react";
import AuthService from "@/services/auth.service";
import { PROVINCES } from "@/shared/constants/provinces";
import { getErrorCode, getErrorMessage } from "@/app/host/_utils";
import LocationCoordinatePicker from "@/shared/components/LocationCoordinatePicker";

type ListingCategory = "STAY" | "EXP" | "SVC";
type PriceUnit = "PER_NIGHT" | "PER_PAX" | "PER_HOUR";
type ServiceSubCategory =
  | "PHOTOGRAPHY"
  | "CHEF"
  | "MASSAGE"
  | "PREPARED_MEALS"
  | "TRAINING"
  | "MAKEUP"
  | "HAIR_STYLING"
  | "SPA"
  | "CATERING";

type ComplexOption = {
  id: string;
  name?: string;
  province?: string;
};

type MediaUploadResponse = {
  data?: {
    url?: string | string[];
    urls?: string[];
  };
};

type ListingServiceApi = {
  createListing: (data: unknown) => Promise<unknown>;
  uploadSingleMedia: (file: File, folder?: string) => Promise<unknown>;
  uploadBulkMedia: (files: File[], folder?: string) => Promise<unknown>;
  getMyComplexes?: () => Promise<{ data?: ComplexOption[] }>;
};

type NewListingFormProps = {
  ownerType: "host" | "enterprise";
  serviceApi: ListingServiceApi;
  redirectPath: string;
};

type ServiceFormState = {
  providerType: "INDIVIDUAL" | "AGENCY";
  durationMinutes: string;
  deliveryDays: string;
  deliverables: string;
  cameraGear: string;
  cuisineType: string[];
  includesIngredients: boolean;
  cleanUpAfter: boolean;
  specialDietary: string[];
  massageType: string[];
  genderPreference: string;
  equipmentProvided: string;
  mealType: string[];
  deliveryFrequency: string;
  mealsPerDay: string;
  caloriesPerDay: string;
  heatingInstructions: string;
  skillTaught: string;
  level: string;
  groupMin: string;
  groupMax: string;
  makeupStyle: string[];
  includesHair: boolean;
  brandsUsed: string[];
  hairServiceType: string[];
  targetGender: string;
  chemicalsIncluded: boolean;
  spaTreatments: string[];
  organicProductsOnly: boolean;
  cateringEventType: string[];
  menuType: string;
  includesStaff: boolean;
  includesTableware: boolean;
};

type LogisticsState = {
  serveAtClientLocation: boolean;
  maxTravelRadiusKm: string;
  equipmentRequiredFromClient: string;
  deliveryTimeWindow: string;
  facilityRequired: string;
  cleanupProvided: boolean;
  equipmentProvided: string;
  setupTimeHours: string;
};

const CATEGORY_OPTIONS: Array<{ value: ListingCategory; label: string; description: string }> = [
  { value: "STAY", label: "Nơi lưu trú", description: "Phòng, căn hộ, homestay, villa, khách sạn." },
  { value: "EXP", label: "Trải nghiệm", description: "Tour, workshop, hoạt động có điểm hẹn và lịch trình." },
  { value: "SVC", label: "Dịch vụ", description: "Chụp ảnh, đầu bếp, spa, catering và dịch vụ tiện ích." },
];

const SERVICE_OPTIONS: Array<{ value: ServiceSubCategory; label: string; hint: string }> = [
  { value: "PHOTOGRAPHY", label: "Chụp ảnh", hint: "Buổi chụp ảnh, video, chỉnh sửa hậu kỳ." },
  { value: "CHEF", label: "Đầu bếp riêng", hint: "Nấu tại chỗ, thực đơn, nguyên liệu, dọn dẹp." },
  { value: "MASSAGE", label: "Massage", hint: "Massage thư giãn, trị liệu, thiết bị đi kèm." },
  { value: "PREPARED_MEALS", label: "Đồ ăn chuẩn bị sẵn", hint: "Meal prep, suất ăn, hướng dẫn hâm nóng." },
  { value: "TRAINING", label: "Huấn luyện / lớp học", hint: "Yoga, fitness, kỹ năng, lớp cá nhân/nhóm." },
  { value: "MAKEUP", label: "Trang điểm", hint: "Trang điểm sự kiện, cô dâu, quay chụp." },
  { value: "HAIR_STYLING", label: "Làm tóc", hint: "Tạo kiểu, uốn/sấy/tết, dịch vụ hóa chất." },
  { value: "SPA", label: "Chăm sóc spa", hint: "Chăm sóc da, body, sản phẩm hữu cơ." },
  { value: "CATERING", label: "Tiệc / catering", hint: "Tiệc nhóm, bàn tiệc, nhân sự phục vụ." },
];

const PRICE_UNIT_LABELS: Record<PriceUnit, string> = {
  PER_NIGHT: "Theo đêm",
  PER_PAX: "Theo khách / người",
  PER_HOUR: "Theo giờ",
};

const SERVICE_DEFAULT_UNIT: Record<ServiceSubCategory, PriceUnit> = {
  PHOTOGRAPHY: "PER_HOUR",
  CHEF: "PER_PAX",
  MASSAGE: "PER_HOUR",
  PREPARED_MEALS: "PER_PAX",
  TRAINING: "PER_HOUR",
  MAKEUP: "PER_HOUR",
  HAIR_STYLING: "PER_HOUR",
  SPA: "PER_HOUR",
  CATERING: "PER_PAX",
};

const DURATION_OPTIONS = [
  { value: "30", label: "30 phút" },
  { value: "60", label: "1 giờ" },
  { value: "90", label: "1 giờ 30 phút" },
  { value: "120", label: "2 giờ" },
  { value: "180", label: "3 giờ" },
  { value: "240", label: "4 giờ" },
  { value: "360", label: "6 giờ" },
  { value: "480", label: "8 giờ" },
];

const DELIVERY_DAY_OPTIONS = [
  { value: "0", label: "Trong ngày" },
  { value: "1", label: "1 ngày" },
  { value: "2", label: "2 ngày" },
  { value: "3", label: "3 ngày" },
  { value: "5", label: "5 ngày" },
  { value: "7", label: "7 ngày" },
  { value: "14", label: "14 ngày" },
];

const PROPERTY_TYPES = ["Căn hộ", "Phòng riêng", "Homestay", "Villa", "Khách sạn", "Bungalow", "Nhà nguyên căn"];
const BED_TYPES = ["Giường đơn", "Giường đôi", "Queen", "King", "Sofa bed", "Nệm phụ"];
const AMENITY_OPTIONS = ["Wifi", "Điều hòa", "TV", "Bếp", "Máy giặt", "Bãi đỗ xe", "Hồ bơi", "Ban công", "Máy sấy"];
const LANGUAGE_OPTIONS = ["Tiếng Việt", "Tiếng Anh", "Tiếng Hàn", "Tiếng Trung", "Tiếng Nhật", "Tiếng Pháp"];

const OPTION_SETS = {
  cuisineType: ["Việt Nam", "Âu", "Á", "Chay", "Hải sản", "BBQ", "Fusion"],
  specialDietary: ["Ăn chay", "Không gluten", "Ít đường", "Ít tinh bột", "Halal", "Dị ứng hải sản"],
  massageType: ["Thư giãn", "Trị liệu", "Đá nóng", "Aroma", "Foot massage", "Body massage"],
  mealType: ["Bữa sáng", "Bữa trưa", "Bữa tối", "Meal prep tuần", "Ăn kiêng", "Đồ ăn địa phương"],
  makeupStyle: ["Tự nhiên", "Dự tiệc", "Cô dâu", "Chụp ảnh", "Sân khấu", "Kỷ yếu"],
  brandsUsed: ["MAC", "NARS", "Dior", "Chanel", "Make Up For Ever", "Maybelline"],
  hairServiceType: ["Sấy tạo kiểu", "Tết tóc", "Uốn giả", "Tạo kiểu cô dâu", "Gội dưỡng", "Nhuộm/tẩy"],
  spaTreatments: ["Chăm sóc da mặt", "Body scrub", "Body wrap", "Gội đầu dưỡng sinh", "Xông hơi", "Trị liệu cổ vai gáy"],
  cateringEventType: ["Sinh nhật", "Tiệc công ty", "Tiệc gia đình", "Đám cưới", "Workshop", "Team building"],
};

const EMPTY_SERVICE_FORM: ServiceFormState = {
  providerType: "INDIVIDUAL",
  durationMinutes: "60",
  deliveryDays: "0",
  deliverables: "",
  cameraGear: "",
  cuisineType: ["Việt Nam"],
  includesIngredients: true,
  cleanUpAfter: true,
  specialDietary: [],
  massageType: ["Thư giãn"],
  genderPreference: "Không yêu cầu",
  equipmentProvided: "",
  mealType: ["Bữa trưa"],
  deliveryFrequency: "Một lần",
  mealsPerDay: "1",
  caloriesPerDay: "",
  heatingInstructions: "",
  skillTaught: "",
  level: "Người mới bắt đầu",
  groupMin: "1",
  groupMax: "10",
  makeupStyle: ["Tự nhiên"],
  includesHair: false,
  brandsUsed: [],
  hairServiceType: ["Sấy tạo kiểu"],
  targetGender: "Mọi giới tính",
  chemicalsIncluded: false,
  spaTreatments: ["Chăm sóc da mặt"],
  organicProductsOnly: false,
  cateringEventType: ["Tiệc gia đình"],
  menuType: "Set menu",
  includesStaff: true,
  includesTableware: true,
};

const EMPTY_LOGISTICS: LogisticsState = {
  serveAtClientLocation: false,
  maxTravelRadiusKm: "0",
  equipmentRequiredFromClient: "",
  deliveryTimeWindow: "08:00 - 18:00",
  facilityRequired: "",
  cleanupProvided: false,
  equipmentProvided: "",
  setupTimeHours: "0",
};

const uploadUrls = (response: MediaUploadResponse) => {
  const url = response.data?.url;
  if (Array.isArray(url)) return url;
  if (typeof url === "string" && url) return [url];
  return response.data?.urls ?? [];
};

const defaultPriceUnit = (category: ListingCategory, subCategory: ServiceSubCategory): PriceUnit => {
  if (category === "STAY") return "PER_NIGHT";
  if (category === "EXP") return "PER_PAX";
  return SERVICE_DEFAULT_UNIT[subCategory];
};

const priceUnitOptions = (category: ListingCategory, subCategory: ServiceSubCategory): PriceUnit[] => {
  if (category === "STAY") return ["PER_NIGHT"];
  if (category === "EXP") return ["PER_PAX"];
  if (["CHEF", "PREPARED_MEALS", "CATERING"].includes(subCategory)) return ["PER_PAX", "PER_HOUR"];
  return ["PER_HOUR", "PER_PAX"];
};

const serviceLabel = (value: ServiceSubCategory) =>
  SERVICE_OPTIONS.find((option) => option.value === value)?.label ?? value;

function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<string | { value: string; label: string }>;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-600">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-xs font-medium text-gray-900 outline-none transition-colors focus:border-app-primary"
      >
        {options.map((option) => {
          const valueText = typeof option === "string" ? option : option.value;
          const labelText = typeof option === "string" ? option : option.label;
          return (
            <option key={valueText} value={valueText}>
              {labelText}
            </option>
          );
        })}
      </select>
      {hint && <span className="mt-1 block text-[10px] leading-4 text-gray-500">{hint}</span>}
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-xs font-medium text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-app-primary"
      />
      {hint && <span className="mt-1 block text-[10px] leading-4 text-gray-500">{hint}</span>}
    </label>
  );
}

function TimeField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-600">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-xs font-medium text-gray-900 outline-none transition-colors focus:border-app-primary"
      />
      {hint && <span className="mt-1 block text-[10px] leading-4 text-gray-500">{hint}</span>}
    </label>
  );
}

function TimeRangeField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  const [start = "08:00", end = "18:00"] = value.split(" - ");

  return (
    <div>
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-600">{label}</span>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <input
          type="time"
          value={start}
          onChange={(event) => onChange(`${event.target.value} - ${end || "18:00"}`)}
          className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-xs font-medium text-gray-900 outline-none transition-colors focus:border-app-primary"
        />
        <span className="text-xs font-semibold text-gray-400">đến</span>
        <input
          type="time"
          value={end}
          onChange={(event) => onChange(`${start || "08:00"} - ${event.target.value}`)}
          className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-xs font-medium text-gray-900 outline-none transition-colors focus:border-app-primary"
        />
      </div>
      {hint && <span className="mt-1 block text-[10px] leading-4 text-gray-500">{hint}</span>}
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300 bg-white text-app-primary focus:ring-0"
      />
      {label}
    </label>
  );
}

function MultiChoice({
  label,
  values,
  options,
  onChange,
  hint,
}: {
  label: string;
  values: string[];
  options: string[];
  onChange: (values: string[]) => void;
  hint?: string;
}) {
  const toggle = (option: string) => {
    onChange(values.includes(option) ? values.filter((item) => item !== option) : [...values, option]);
  };

  return (
    <div>
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-600">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = values.includes(option);
          return (
            <button
              type="button"
              key={option}
              onClick={() => toggle(option)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                selected
                  ? "border-app-primary bg-app-primary/10 text-app-primary"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {hint && <p className="mt-1 text-[10px] leading-4 text-gray-500">{hint}</p>}
    </div>
  );
}

export default function NewListingForm({ ownerType, serviceApi, redirectPath }: NewListingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [myComplexes, setMyComplexes] = useState<ComplexOption[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ListingCategory>("STAY");
  const [subCategory, setSubCategory] = useState<ServiceSubCategory>("PHOTOGRAPHY");
  const [province, setProvince] = useState("Hà Nội");
  const [basePrice, setBasePrice] = useState("");
  const [priceUnit, setPriceUnit] = useState<PriceUnit>("PER_NIGHT");
  const [latitude, setLatitude] = useState("21.0285");
  const [longitude, setLongitude] = useState("105.8542");
  const [complexId, setComplexId] = useState("");

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [propertyType, setPropertyType] = useState("Căn hộ");
  const [roomSizeSqM, setRoomSizeSqM] = useState("35");
  const [maxGuests, setMaxGuests] = useState("2");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [beds, setBeds] = useState<Array<{ type: string; quantity: number }>>([{ type: "King", quantity: 1 }]);
  const [amenities, setAmenities] = useState<string[]>(["Wifi", "Điều hòa", "TV"]);
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("12:00");
  const [allowPets, setAllowPets] = useState(false);
  const [allowSmoking, setAllowSmoking] = useState(false);
  const [partyAllowed, setPartyAllowed] = useState(false);

  const [expDuration, setExpDuration] = useState("120");
  const [expDifficulty, setExpDifficulty] = useState("EASY");
  const [expLanguages, setExpLanguages] = useState<string[]>(["Tiếng Việt"]);
  const [expGroupSizeMin, setExpGroupSizeMin] = useState("1");
  const [expGroupSizeMax, setExpGroupSizeMax] = useState("10");
  const [expMeetingPoint, setExpMeetingPoint] = useState("");
  const [expMeetingLat, setExpMeetingLat] = useState("21.0285");
  const [expMeetingLng, setExpMeetingLng] = useState("105.8542");
  const [expInclusionsText, setExpInclusionsText] = useState("");
  const [expExclusionsText, setExpExclusionsText] = useState("");
  const [expItinerary, setExpItinerary] = useState<Array<{ time: string; activity: string }>>([]);
  const [newItineraryTime, setNewItineraryTime] = useState("08:00");
  const [newItineraryActivity, setNewItineraryActivity] = useState("");

  const [serviceForm, setServiceForm] = useState<ServiceFormState>(EMPTY_SERVICE_FORM);
  const [logistics, setLogistics] = useState<LogisticsState>(EMPTY_LOGISTICS);

  const ownerLabel = ownerType === "enterprise" ? "doanh nghiệp" : "host";
  const canUseComplex = ownerType === "enterprise" || roles.includes("ENTERPRISE");
  const currentService = SERVICE_OPTIONS.find((item) => item.value === subCategory);

  const availablePriceUnits = useMemo(() => priceUnitOptions(category, subCategory), [category, subCategory]);

  useEffect(() => {
    const nextRoles = AuthService.getUserRoles();
    setRoles(nextRoles);

    if ((ownerType === "enterprise" || nextRoles.includes("ENTERPRISE")) && serviceApi.getMyComplexes) {
      serviceApi.getMyComplexes()
        .then((res) => setMyComplexes(res.data ?? []))
        .catch(() => setFeedback({ type: "error", message: "Không tải được danh sách khu tổ hợp." }));
    }
  }, [ownerType, serviceApi]);

  useEffect(() => {
    setPriceUnit(defaultPriceUnit(category, subCategory));
  }, [category, subCategory]);

  const updateServiceForm = <K extends keyof ServiceFormState>(key: K, value: ServiceFormState[K]) => {
    setServiceForm((current) => ({ ...current, [key]: value }));
  };

  const updateLogistics = <K extends keyof LogisticsState>(key: K, value: LogisticsState[K]) => {
    setLogistics((current) => ({ ...current, [key]: value }));
  };

  const handleThumbnailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setGalleryFiles((current) => [...current, ...files]);
    setGalleryPreviews((current) => [...current, ...files.map((file) => URL.createObjectURL(file))]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setGalleryPreviews((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const addBed = () => setBeds((current) => [...current, { type: "Giường đơn", quantity: 1 }]);
  const updateBed = (index: number, field: "type" | "quantity", value: string) => {
    setBeds((current) =>
      current.map((bed, itemIndex) =>
        itemIndex === index ? { ...bed, [field]: field === "quantity" ? Number(value) : value } : bed,
      ),
    );
  };
  const removeBed = (index: number) => setBeds((current) => current.filter((_, itemIndex) => itemIndex !== index));

  const addExpItinerary = () => {
    if (!newItineraryActivity.trim()) return;
    setExpItinerary((current) => [...current, { time: newItineraryTime, activity: newItineraryActivity.trim() }]);
    setNewItineraryActivity("");
  };
  const removeExpItinerary = (index: number) =>
    setExpItinerary((current) => current.filter((_, itemIndex) => itemIndex !== index));

  const textLines = (value: string) =>
    value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

  const buildLogistics = () => ({
    serveAtClientLocation: logistics.serveAtClientLocation,
    maxTravelRadiusKm: Number(logistics.maxTravelRadiusKm),
    equipmentRequiredFromClient: logistics.equipmentRequiredFromClient,
    deliveryTimeWindow: logistics.deliveryTimeWindow,
    facilityRequired: logistics.facilityRequired,
    cleanupProvided: logistics.cleanupProvided,
    equipmentProvided: logistics.equipmentProvided,
    setupTimeHours: Number(logistics.setupTimeHours),
  });

  const buildServiceDetail = () => {
    switch (subCategory) {
      case "PHOTOGRAPHY":
        return {
          providerType: serviceForm.providerType,
          durationMinutes: Number(serviceForm.durationMinutes),
          deliveryDays: Number(serviceForm.deliveryDays),
          deliverables: serviceForm.deliverables,
          cameraGear: serviceForm.cameraGear,
        };
      case "CHEF":
        return {
          cuisineType: serviceForm.cuisineType,
          includesIngredients: serviceForm.includesIngredients,
          cleanUpAfter: serviceForm.cleanUpAfter,
          specialDietary: serviceForm.specialDietary,
        };
      case "MASSAGE":
        return {
          massageType: serviceForm.massageType,
          durationMinutes: Number(serviceForm.durationMinutes),
          genderPreference: serviceForm.genderPreference,
          equipmentProvided: serviceForm.equipmentProvided,
        };
      case "PREPARED_MEALS":
        return {
          mealType: serviceForm.mealType,
          deliveryFrequency: serviceForm.deliveryFrequency,
          mealsPerDay: Number(serviceForm.mealsPerDay),
          caloriesPerDay: serviceForm.caloriesPerDay,
          heatingInstructions: serviceForm.heatingInstructions,
        };
      case "TRAINING":
        return {
          skillTaught: serviceForm.skillTaught,
          level: serviceForm.level,
          durationMinutes: Number(serviceForm.durationMinutes),
          groupSize: { min: Number(serviceForm.groupMin), max: Number(serviceForm.groupMax) },
          equipmentProvided: serviceForm.equipmentProvided,
        };
      case "MAKEUP":
        return {
          makeupStyle: serviceForm.makeupStyle,
          includesHair: serviceForm.includesHair,
          durationMinutes: Number(serviceForm.durationMinutes),
          brandsUsed: serviceForm.brandsUsed,
        };
      case "HAIR_STYLING":
        return {
          serviceType: serviceForm.hairServiceType,
          targetGender: serviceForm.targetGender,
          chemicalsIncluded: serviceForm.chemicalsIncluded,
          durationMinutes: Number(serviceForm.durationMinutes),
        };
      case "SPA":
        return {
          treatments: serviceForm.spaTreatments,
          organicProductsOnly: serviceForm.organicProductsOnly,
          durationMinutes: Number(serviceForm.durationMinutes),
          genderPreference: serviceForm.genderPreference,
        };
      case "CATERING":
        return {
          eventType: serviceForm.cateringEventType,
          menuType: serviceForm.menuType,
          guestCapacity: { min: Number(serviceForm.groupMin), max: Number(serviceForm.groupMax) },
          includesStaff: serviceForm.includesStaff,
          includesTableware: serviceForm.includesTableware,
        };
      default:
        return {};
    }
  };

  const validateCurrentForm = () => {
    if (!title.trim() || !basePrice || !province || !latitude || !longitude) {
      return "Vui lòng nhập đủ tên, giá, tỉnh/thành và tọa độ dịch vụ.";
    }
    if (category === "EXP" && Number(expGroupSizeMax) < Number(expGroupSizeMin)) {
      return "Số khách tối đa của trải nghiệm phải lớn hơn hoặc bằng số tối thiểu.";
    }
    if (category === "SVC" && ["TRAINING", "CATERING"].includes(subCategory) && Number(serviceForm.groupMax) < Number(serviceForm.groupMin)) {
      return "Sức chứa tối đa phải lớn hơn hoặc bằng số tối thiểu.";
    }
    if (category === "SVC" && subCategory === "TRAINING" && !serviceForm.skillTaught.trim()) {
      return "Vui lòng nhập kỹ năng hoặc nội dung lớp học.";
    }
    return "";
  };

  const handleSubmit = async () => {
    if (step !== 3) return;
    setFeedback(null);

    const validationMessage = validateCurrentForm();
    if (validationMessage) {
      setFeedback({ type: "error", message: validationMessage });
      return;
    }

    setLoading(true);
    try {
      let finalThumbnailUrl = "";
      let finalGalleryUrls: string[] = [];

      if (thumbnailFile) {
        const thumbRes = (await serviceApi.uploadSingleMedia(thumbnailFile, "listings")) as MediaUploadResponse;
        finalThumbnailUrl = uploadUrls(thumbRes)[0] ?? "";
      }

      if (galleryFiles.length > 0) {
        const galleryRes = (await serviceApi.uploadBulkMedia(galleryFiles, "listings")) as MediaUploadResponse;
        finalGalleryUrls = uploadUrls(galleryRes);
      }

      const categoryType = category === "SVC" ? `SVC_${subCategory}` : category;
      const attributes: Record<string, unknown> = {
        categoryType,
        galleryUrls: finalGalleryUrls,
      };

      if (category === "STAY") {
        attributes.stayDetail = {
          propertyType,
          roomSizeSqM: Number(roomSizeSqM),
          maxGuests: Number(maxGuests),
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          beds,
        };
        attributes.amenities = amenities;
        attributes.policies = { checkInTime, checkOutTime, allowPets, allowSmoking, partyAllowed };
      } else if (category === "EXP") {
        attributes.expDetail = {
          durationMinutes: Number(expDuration),
          difficulty: expDifficulty,
          languages: expLanguages,
          groupSize: { min: Number(expGroupSizeMin), max: Number(expGroupSizeMax) },
          meetingPoint: expMeetingPoint,
          meetingPointLat: Number(expMeetingLat),
          meetingPointLng: Number(expMeetingLng),
        };
        attributes.inclusions = textLines(expInclusionsText);
        attributes.exclusions = textLines(expExclusionsText);
        attributes.itinerary = expItinerary;
      } else {
        attributes.serviceDetail = buildServiceDetail();
        attributes.logistics = buildLogistics();
      }

      await serviceApi.createListing({
        complexId: complexId || undefined,
        category,
        subCategory: category === "SVC" ? subCategory : "NONE",
        title: title.trim(),
        description,
        province,
        basePrice: Number(basePrice),
        priceUnit,
        latitude: Number(latitude),
        longitude: Number(longitude),
        thumbnailUrl: finalThumbnailUrl || finalGalleryUrls[0] || "",
        attributes,
      });

      setFeedback({ type: "success", message: "Đăng dịch vụ mới thành công." });
      router.push(redirectPath);
    } catch (error: unknown) {
      let message = getErrorMessage(error);
      if (getErrorCode(error) === "LISTING_OUT_OF_RANGE" || message.includes("Khoảng cách") || message.includes("bán kính")) {
        message = "Dịch vụ nằm ngoài bán kính 3km của khu tổ hợp. Vui lòng kiểm tra lại tọa độ hoặc chọn đúng khu tổ hợp.";
      }
      setFeedback({ type: "error", message: `Đăng dịch vụ thất bại: ${message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-12 animate-smooth-appear">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Đăng dịch vụ mới</h1>
          <p className="mt-1 text-xs text-gray-500">
            Bước {step}/3: {step === 1 ? "Loại hình & thông tin chính" : step === 2 ? "Giá, vị trí & ảnh" : "Thông tin vận hành"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((item) => (
          <div key={item} className={`h-1.5 rounded-full ${step >= item ? "bg-app-primary" : "bg-gray-100"}`} />
        ))}
      </div>

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="min-h-[640px] w-full space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Chọn loại dịch vụ</h2>
              <p className="mt-1 text-xs text-gray-500">Loại hình sẽ quyết định các trường cần nhập và đơn vị giá phù hợp.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setCategory(option.value)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    category === option.value
                      ? "border-app-primary bg-app-primary/10 text-gray-900"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="block text-sm font-bold">{option.label}</span>
                  <span className="mt-1 block text-[11px] leading-4 text-gray-500">{option.description}</span>
                </button>
              ))}
            </div>

            {category === "SVC" && (
              <div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-600">Loại dịch vụ cụ thể</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SERVICE_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => setSubCategory(option.value)}
                      className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                        subCategory === option.value
                          ? "border-app-primary bg-app-primary/10 text-app-primary"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="block text-xs font-bold">{option.label}</span>
                      <span className="mt-0.5 block text-[10px] leading-4 text-gray-500">{option.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <TextField
              label="Tên hiển thị trên web"
              value={title}
              onChange={setTitle}
              placeholder={
                category === "STAY"
                  ? "Ví dụ: Căn hộ view hồ cho 2 khách"
                  : category === "EXP"
                    ? "Ví dụ: Tour chèo SUP ngắm hoàng hôn"
                    : `Ví dụ: ${serviceLabel(subCategory)} tại trung tâm thành phố`
              }
            />
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-600">Mô tả cho khách hàng</span>
              <textarea
                rows={5}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Mô tả điểm nổi bật, khách sẽ nhận được gì, điều kiện sử dụng và lưu ý quan trọng..."
                className="w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-app-primary"
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Giá, vị trí và ảnh</h2>
              <p className="mt-1 text-xs text-gray-500">Đơn vị giá đã được lọc theo loại hình để tránh chọn sai.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Giá cơ bản" value={basePrice} onChange={setBasePrice} type="number" placeholder="VD: 500000" />
              <SelectField
                label="Đơn vị tính giá"
                value={priceUnit}
                onChange={(value) => setPriceUnit(value as PriceUnit)}
                options={availablePriceUnits.map((unit) => ({ value: unit, label: PRICE_UNIT_LABELS[unit] }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Tỉnh / thành phố" value={province} onChange={setProvince} options={PROVINCES} />
              {canUseComplex && (
                <SelectField
                  label="Khu tổ hợp của doanh nghiệp"
                  value={complexId}
                  onChange={setComplexId}
                  options={[
                    { value: "", label: "Không gắn vào khu tổ hợp" },
                    ...myComplexes.map((complex) => ({
                      value: complex.id,
                      label: `${complex.name ?? complex.id}${complex.province ? ` - ${complex.province}` : ""}`,
                    })),
                  ]}
                  hint="Nếu gắn khu tổ hợp, dịch vụ phải nằm trong bán kính 3km quanh khu đó."
                />
              )}
            </div>

            <LocationCoordinatePicker
              title="Chọn vị trí dịch vụ trên bản đồ"
              hint="Tìm địa chỉ hoặc bấm trực tiếp lên bản đồ. Front sẽ tự lấy vĩ độ/kinh độ gửi về backend."
              searchPlaceholder="Nhập địa chỉ dịch vụ, tên khách sạn, địa danh gần đó..."
              value={{ name: title, province, latitude, longitude }}
              onChange={(patch) => {
                setLatitude(patch.latitude ?? latitude);
                setLongitude(patch.longitude ?? longitude);
                if (patch.province) setProvince(patch.province);
              }}
            />

            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
              <div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-600">Ảnh đại diện</div>
                <div
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50"
                >
                  <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                  {thumbnailPreview ? (
                    <>
                      <Image unoptimized fill src={thumbnailPreview} alt="Ảnh đại diện" className="object-cover" sizes="220px" />
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setThumbnailFile(null);
                          setThumbnailPreview(null);
                        }}
                        className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center text-xs font-medium text-gray-500">
                      <Upload className="mx-auto mb-2 h-5 w-5" />
                      Tải ảnh chính
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-600">Thư viện ảnh</div>
                <div className="grid grid-cols-3 gap-3">
                  {galleryPreviews.map((preview, index) => (
                    <div key={`${preview}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200">
                      <Image unoptimized fill src={preview} alt={`Gallery ${index + 1}`} className="object-cover" sizes="140px" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <div
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-xs font-medium text-gray-500 hover:border-app-primary hover:text-app-primary"
                  >
                    <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
                    <Upload className="mb-1 h-5 w-5" />
                    Thêm ảnh
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Thông tin vận hành</h2>
              <p className="mt-1 text-xs text-gray-500">Các trường dưới đây sẽ thay đổi theo loại hình đã chọn.</p>
            </div>

            {category === "STAY" && (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField label="Loại chỗ ở" value={propertyType} onChange={setPropertyType} options={PROPERTY_TYPES} />
                  <TextField label="Diện tích phòng (m2)" value={roomSizeSqM} onChange={setRoomSizeSqM} type="number" />
                  <TextField label="Số khách tối đa" value={maxGuests} onChange={setMaxGuests} type="number" />
                  <TextField label="Số phòng ngủ" value={bedrooms} onChange={setBedrooms} type="number" />
                  <TextField label="Số phòng tắm" value={bathrooms} onChange={setBathrooms} type="number" />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-gray-600">Cấu hình giường</div>
                    <button type="button" onClick={addBed} className="text-xs font-bold text-app-primary hover:underline">Thêm giường</button>
                  </div>
                  <div className="space-y-2">
                    {beds.map((bed, index) => (
                      <div key={index} className="grid grid-cols-[1fr_120px_32px] gap-2">
                        <select
                          value={bed.type}
                          onChange={(event) => updateBed(index, "type", event.target.value)}
                          className="h-10 rounded-xl border border-gray-300 bg-white px-3 text-xs font-medium text-gray-900 outline-none focus:border-app-primary"
                        >
                          {BED_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <input
                          type="number"
                          min={1}
                          value={bed.quantity}
                          onChange={(event) => updateBed(index, "quantity", event.target.value)}
                          className="h-10 rounded-xl border border-gray-300 bg-white px-3 text-xs font-medium text-gray-900 outline-none focus:border-app-primary"
                        />
                        <button type="button" onClick={() => removeBed(index)} className="rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                <MultiChoice label="Tiện nghi" values={amenities} options={AMENITY_OPTIONS} onChange={setAmenities} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <TimeField label="Giờ nhận phòng" value={checkInTime} onChange={setCheckInTime} />
                  <TimeField label="Giờ trả phòng" value={checkOutTime} onChange={setCheckOutTime} />
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <CheckboxField label="Cho phép thú cưng" checked={allowPets} onChange={setAllowPets} />
                  <CheckboxField label="Cho phép hút thuốc" checked={allowSmoking} onChange={setAllowSmoking} />
                  <CheckboxField label="Cho phép tổ chức tiệc" checked={partyAllowed} onChange={setPartyAllowed} />
                </div>
              </div>
            )}

            {category === "EXP" && (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField label="Thời lượng trải nghiệm" value={expDuration} onChange={setExpDuration} options={DURATION_OPTIONS} />
                  <SelectField
                    label="Mức vận động / kỹ năng yêu cầu"
                    value={expDifficulty}
                    onChange={setExpDifficulty}
                    options={[
                      { value: "EASY", label: "Nhẹ - phù hợp hầu hết khách" },
                      { value: "MEDIUM", label: "Vừa - cần sức khỏe cơ bản" },
                      { value: "HARD", label: "Cao - cần kinh nghiệm hoặc thể lực tốt" },
                    ]}
                    hint="Trường này thay cho cách gọi khó hiểu “độ khó”."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField label="Số khách tối thiểu" value={expGroupSizeMin} onChange={setExpGroupSizeMin} options={Array.from({ length: 20 }, (_, i) => String(i + 1))} />
                  <SelectField label="Số khách tối đa" value={expGroupSizeMax} onChange={setExpGroupSizeMax} options={Array.from({ length: 50 }, (_, i) => String(i + 1))} />
                </div>

                <MultiChoice label="Ngôn ngữ hỗ trợ" values={expLanguages} options={LANGUAGE_OPTIONS} onChange={setExpLanguages} />

                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField label="Tên điểm hẹn" value={expMeetingPoint} onChange={setExpMeetingPoint} placeholder="VD: Cổng chính Nhà hát lớn" />
                </div>
                <LocationCoordinatePicker
                  title="Chọn điểm hẹn trải nghiệm"
                  hint="Tìm điểm hẹn hoặc bấm lên bản đồ để lấy tọa độ điểm hẹn cho khách."
                  searchPlaceholder="Nhập tên điểm hẹn, ví dụ: Cổng chính Nhà hát lớn..."
                  allowNameOverwrite
                  value={{
                    name: expMeetingPoint,
                    province,
                    latitude: expMeetingLat,
                    longitude: expMeetingLng,
                  }}
                  onChange={(patch) => {
                    setExpMeetingLat(patch.latitude ?? expMeetingLat);
                    setExpMeetingLng(patch.longitude ?? expMeetingLng);
                    if (patch.name) setExpMeetingPoint(patch.name);
                    if (patch.province) setProvince(patch.province);
                  }}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-600">Bao gồm trong giá</span>
                    <textarea value={expInclusionsText} onChange={(event) => setExpInclusionsText(event.target.value)} rows={4} placeholder="Mỗi dòng một mục: vé vào cổng, nước uống, hướng dẫn viên..." className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-xs outline-none focus:border-app-primary" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-600">Không bao gồm</span>
                    <textarea value={expExclusionsText} onChange={(event) => setExpExclusionsText(event.target.value)} rows={4} placeholder="Mỗi dòng một mục: chi phí cá nhân, di chuyển tự túc..." className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-xs outline-none focus:border-app-primary" />
                  </label>
                </div>

                <div>
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-600">Lịch trình</div>
                  <div className="grid gap-2 sm:grid-cols-[160px_1fr_90px] sm:items-end">
                    <TimeField label="Giờ" value={newItineraryTime} onChange={setNewItineraryTime} />
                    <TextField label="Hoạt động" value={newItineraryActivity} onChange={setNewItineraryActivity} placeholder="Hoạt động tại thời điểm này" />
                    <button type="button" onClick={addExpItinerary} className="h-10 rounded-xl bg-gray-100 px-3 text-xs font-bold text-gray-700 hover:bg-gray-200">Thêm</button>
                  </div>
                  <div className="mt-3 space-y-2 border-l-2 border-gray-200 pl-3">
                    {expItinerary.map((item, index) => (
                      <div key={`${item.time}-${index}`} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-700">
                        <span><b className="text-app-primary">{item.time}</b> - {item.activity}</span>
                        <button type="button" onClick={() => removeExpItinerary(index)} className="font-bold text-red-600">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {category === "SVC" && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="text-sm font-bold text-gray-900">{currentService?.label}</h3>
                  <p className="mt-1 text-xs text-gray-500">{currentService?.hint}</p>
                </div>

                {subCategory === "PHOTOGRAPHY" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField label="Loại nhà cung cấp" value={serviceForm.providerType} onChange={(value) => updateServiceForm("providerType", value as ServiceFormState["providerType"])} options={[{ value: "INDIVIDUAL", label: "Cá nhân" }, { value: "AGENCY", label: "Đội nhóm / agency" }]} />
                    <SelectField label="Thời lượng buổi chụp" value={serviceForm.durationMinutes} onChange={(value) => updateServiceForm("durationMinutes", value)} options={DURATION_OPTIONS} />
                    <SelectField label="Thời gian giao ảnh" value={serviceForm.deliveryDays} onChange={(value) => updateServiceForm("deliveryDays", value)} options={DELIVERY_DAY_OPTIONS} />
                    <TextField label="Sản phẩm bàn giao" value={serviceForm.deliverables} onChange={(value) => updateServiceForm("deliverables", value)} placeholder="VD: 50 ảnh chỉnh màu + 10 ảnh retouch" />
                    <TextField label="Thiết bị sử dụng" value={serviceForm.cameraGear} onChange={(value) => updateServiceForm("cameraGear", value)} placeholder="VD: Sony A7IV, lens 35mm, flash..." />
                  </div>
                )}

                {subCategory === "CHEF" && (
                  <div className="space-y-4">
                    <MultiChoice label="Phong cách món ăn" values={serviceForm.cuisineType} options={OPTION_SETS.cuisineType} onChange={(values) => updateServiceForm("cuisineType", values)} />
                    <MultiChoice label="Chế độ ăn hỗ trợ" values={serviceForm.specialDietary} options={OPTION_SETS.specialDietary} onChange={(values) => updateServiceForm("specialDietary", values)} />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <CheckboxField label="Bao gồm nguyên liệu" checked={serviceForm.includesIngredients} onChange={(value) => updateServiceForm("includesIngredients", value)} />
                      <CheckboxField label="Có dọn dẹp sau bữa ăn" checked={serviceForm.cleanUpAfter} onChange={(value) => updateServiceForm("cleanUpAfter", value)} />
                    </div>
                  </div>
                )}

                {subCategory === "MASSAGE" && (
                  <div className="space-y-4">
                    <MultiChoice label="Loại massage" values={serviceForm.massageType} options={OPTION_SETS.massageType} onChange={(values) => updateServiceForm("massageType", values)} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField label="Thời lượng liệu trình" value={serviceForm.durationMinutes} onChange={(value) => updateServiceForm("durationMinutes", value)} options={DURATION_OPTIONS} />
                      <SelectField label="Yêu cầu giới tính kỹ thuật viên" value={serviceForm.genderPreference} onChange={(value) => updateServiceForm("genderPreference", value)} options={["Không yêu cầu", "Nam", "Nữ"]} />
                      <TextField label="Thiết bị mang theo" value={serviceForm.equipmentProvided} onChange={(value) => updateServiceForm("equipmentProvided", value)} placeholder="VD: giường massage, tinh dầu, khăn..." />
                    </div>
                  </div>
                )}

                {subCategory === "PREPARED_MEALS" && (
                  <div className="space-y-4">
                    <MultiChoice label="Loại suất ăn" values={serviceForm.mealType} options={OPTION_SETS.mealType} onChange={(values) => updateServiceForm("mealType", values)} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField label="Tần suất giao" value={serviceForm.deliveryFrequency} onChange={(value) => updateServiceForm("deliveryFrequency", value)} options={["Một lần", "Hàng ngày", "Theo tuần", "Theo lịch hẹn"]} />
                      <SelectField label="Số bữa mỗi ngày" value={serviceForm.mealsPerDay} onChange={(value) => updateServiceForm("mealsPerDay", value)} options={["1", "2", "3", "4", "5"]} />
                      <TextField label="Mức calo/ngày" value={serviceForm.caloriesPerDay} onChange={(value) => updateServiceForm("caloriesPerDay", value)} placeholder="VD: 1800 kcal" />
                      <TextField label="Hướng dẫn hâm nóng" value={serviceForm.heatingInstructions} onChange={(value) => updateServiceForm("heatingInstructions", value)} placeholder="VD: hâm 3 phút bằng lò vi sóng" />
                    </div>
                  </div>
                )}

                {subCategory === "TRAINING" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField label="Kỹ năng / nội dung dạy" value={serviceForm.skillTaught} onChange={(value) => updateServiceForm("skillTaught", value)} placeholder="VD: yoga cơ bản, gym, làm gốm..." />
                    <SelectField label="Cấp độ phù hợp" value={serviceForm.level} onChange={(value) => updateServiceForm("level", value)} options={["Người mới bắt đầu", "Cơ bản", "Trung cấp", "Nâng cao", "Mọi cấp độ"]} />
                    <SelectField label="Thời lượng buổi học" value={serviceForm.durationMinutes} onChange={(value) => updateServiceForm("durationMinutes", value)} options={DURATION_OPTIONS} />
                    <TextField label="Thiết bị cung cấp" value={serviceForm.equipmentProvided} onChange={(value) => updateServiceForm("equipmentProvided", value)} placeholder="VD: thảm yoga, dụng cụ tập..." />
                    <SelectField label="Số người tối thiểu" value={serviceForm.groupMin} onChange={(value) => updateServiceForm("groupMin", value)} options={Array.from({ length: 20 }, (_, i) => String(i + 1))} />
                    <SelectField label="Số người tối đa" value={serviceForm.groupMax} onChange={(value) => updateServiceForm("groupMax", value)} options={Array.from({ length: 50 }, (_, i) => String(i + 1))} />
                  </div>
                )}

                {subCategory === "MAKEUP" && (
                  <div className="space-y-4">
                    <MultiChoice label="Phong cách trang điểm" values={serviceForm.makeupStyle} options={OPTION_SETS.makeupStyle} onChange={(values) => updateServiceForm("makeupStyle", values)} />
                    <MultiChoice label="Thương hiệu mỹ phẩm" values={serviceForm.brandsUsed} options={OPTION_SETS.brandsUsed} onChange={(values) => updateServiceForm("brandsUsed", values)} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField label="Thời lượng" value={serviceForm.durationMinutes} onChange={(value) => updateServiceForm("durationMinutes", value)} options={DURATION_OPTIONS} />
                      <CheckboxField label="Bao gồm làm tóc cơ bản" checked={serviceForm.includesHair} onChange={(value) => updateServiceForm("includesHair", value)} />
                    </div>
                  </div>
                )}

                {subCategory === "HAIR_STYLING" && (
                  <div className="space-y-4">
                    <MultiChoice label="Loại dịch vụ tóc" values={serviceForm.hairServiceType} options={OPTION_SETS.hairServiceType} onChange={(values) => updateServiceForm("hairServiceType", values)} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField label="Khách mục tiêu" value={serviceForm.targetGender} onChange={(value) => updateServiceForm("targetGender", value)} options={["Mọi giới tính", "Nam", "Nữ", "Trẻ em"]} />
                      <SelectField label="Thời lượng" value={serviceForm.durationMinutes} onChange={(value) => updateServiceForm("durationMinutes", value)} options={DURATION_OPTIONS} />
                      <CheckboxField label="Có sử dụng hóa chất" checked={serviceForm.chemicalsIncluded} onChange={(value) => updateServiceForm("chemicalsIncluded", value)} />
                    </div>
                  </div>
                )}

                {subCategory === "SPA" && (
                  <div className="space-y-4">
                    <MultiChoice label="Liệu trình spa" values={serviceForm.spaTreatments} options={OPTION_SETS.spaTreatments} onChange={(values) => updateServiceForm("spaTreatments", values)} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField label="Thời lượng" value={serviceForm.durationMinutes} onChange={(value) => updateServiceForm("durationMinutes", value)} options={DURATION_OPTIONS} />
                      <SelectField label="Yêu cầu giới tính kỹ thuật viên" value={serviceForm.genderPreference} onChange={(value) => updateServiceForm("genderPreference", value)} options={["Không yêu cầu", "Nam", "Nữ"]} />
                      <CheckboxField label="Chỉ dùng sản phẩm hữu cơ" checked={serviceForm.organicProductsOnly} onChange={(value) => updateServiceForm("organicProductsOnly", value)} />
                    </div>
                  </div>
                )}

                {subCategory === "CATERING" && (
                  <div className="space-y-4">
                    <MultiChoice label="Loại sự kiện" values={serviceForm.cateringEventType} options={OPTION_SETS.cateringEventType} onChange={(values) => updateServiceForm("cateringEventType", values)} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField label="Kiểu thực đơn" value={serviceForm.menuType} onChange={(value) => updateServiceForm("menuType", value)} options={["Set menu", "Buffet", "Finger food", "BBQ", "Theo yêu cầu"]} />
                      <SelectField label="Số khách tối thiểu" value={serviceForm.groupMin} onChange={(value) => updateServiceForm("groupMin", value)} options={Array.from({ length: 50 }, (_, i) => String(i + 1))} />
                      <SelectField label="Số khách tối đa" value={serviceForm.groupMax} onChange={(value) => updateServiceForm("groupMax", value)} options={Array.from({ length: 100 }, (_, i) => String(i + 1))} />
                      <CheckboxField label="Bao gồm nhân sự phục vụ" checked={serviceForm.includesStaff} onChange={(value) => updateServiceForm("includesStaff", value)} />
                      <CheckboxField label="Bao gồm chén đĩa/bàn tiệc" checked={serviceForm.includesTableware} onChange={(value) => updateServiceForm("includesTableware", value)} />
                    </div>
                  </div>
                )}

                <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700">Phạm vi phục vụ</h3>
                  <CheckboxField label="Có thể phục vụ tại địa điểm của khách" checked={logistics.serveAtClientLocation} onChange={(value) => updateLogistics("serveAtClientLocation", value)} />
                  {logistics.serveAtClientLocation && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField label="Bán kính di chuyển tối đa" value={logistics.maxTravelRadiusKm} onChange={(value) => updateLogistics("maxTravelRadiusKm", value)} options={["1", "3", "5", "10", "20", "50"]} />
                      <SelectField label="Thời gian chuẩn bị tại chỗ" value={logistics.setupTimeHours} onChange={(value) => updateLogistics("setupTimeHours", value)} options={["0", "1", "2", "3", "4", "6"]} />
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TimeRangeField
                      label="Khung giờ nhận/giao dịch vụ"
                      value={logistics.deliveryTimeWindow}
                      onChange={(value) => updateLogistics("deliveryTimeWindow", value)}
                      hint="Chọn giờ bắt đầu và kết thúc thay vì nhập tay."
                    />
                    <TextField label="Yêu cầu không gian" value={logistics.facilityRequired} onChange={(value) => updateLogistics("facilityRequired", value)} placeholder="VD: cần ổ điện, bàn 2m, không gian 5m2..." />
                    <TextField label="Thiết bị khách cần chuẩn bị" value={logistics.equipmentRequiredFromClient} onChange={(value) => updateLogistics("equipmentRequiredFromClient", value)} />
                    <TextField label={`${ownerLabel} tự chuẩn bị`} value={logistics.equipmentProvided} onChange={(value) => updateLogistics("equipmentProvided", value)} />
                  </div>
                  <CheckboxField label="Có dọn dẹp sau khi hoàn tất" checked={logistics.cleanupProvided} onChange={(value) => updateLogistics("cleanupProvided", value)} />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          {step > 1 ? (
            <button type="button" onClick={() => setStep((current) => current - 1)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" /> Quay lại
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button type="button" onClick={() => setStep((current) => current + 1)} className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-900 transition-colors hover:bg-gray-200">
              Tiếp tục <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-app-primary px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-app-primary/20 transition-colors hover:bg-app-primary/95 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Lưu & gửi duyệt"} <Save className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
