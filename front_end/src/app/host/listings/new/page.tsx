"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Save, Plus, Trash } from "lucide-react";
import HostService from "@/services/host.service";

export default function NewListing() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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
  const [thumbnailUrl, setThumbnailUrl] = useState("");

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

  const [galleryUrls, setGalleryUrls] = useState<string[]>([
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=600"
  ]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  // Step Navigations
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // Beds Helpers
  const addBed = () => {
    setBeds([...beds, { type: "Single", quantity: 1 }]);
  };
  const updateBed = (index: number, field: "type" | "quantity", value: any) => {
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

  // Gallery Helpers
  const addGalleryUrl = () => {
    if (newGalleryUrl.trim() && !galleryUrls.includes(newGalleryUrl.trim())) {
      setGalleryUrls([...galleryUrls, newGalleryUrl.trim()]);
      setNewGalleryUrl("");
    }
  };
  const removeGalleryUrl = (index: number) => {
    setGalleryUrls(galleryUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    
    // Safety guard: only submit on final step
    if (step !== 3) {
      return;
    }

    if (!title || !basePrice || !province) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc!");
      return;
    }

    let finalCategoryType = category as string;
    if (category === "SVC") {
        finalCategoryType = `SVC_${subCategory}`;
    }

    // Build SaveListingRequest DTO
    const attributesPayload: any = {
      categoryType: finalCategoryType,
      galleryUrls: galleryUrls
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
        durationMinutes: 120,
        difficulty: "EASY",
        languages: ["Tiếng Việt", "English"],
        groupSize: { min: 1, max: 10 },
        meetingPoint: province,
        meetingPointLat: Number(latitude),
        meetingPointLng: Number(longitude)
      };
      attributesPayload.inclusions = [];
      attributesPayload.exclusions = [];
      attributesPayload.itinerary = [];
    } else {
      // General SVC standard attributes fallback
      attributesPayload.serviceDetail = {
        durationMinutes: 60,
        providerType: "INDIVIDUAL"
      };
    }

    const payload = {
      category,
      subCategory: category === "SVC" ? subCategory : "NONE",
      title,
      description,
      province,
      basePrice: Number(basePrice),
      priceUnit,
      latitude: Number(latitude),
      longitude: Number(longitude),
      thumbnailUrl: thumbnailUrl || galleryUrls[0] || "",
      attributes: attributesPayload
    };

    try {
      setLoading(false);
      const res = await HostService.createListing(payload);
      alert("Đăng ký dịch vụ mới thành công!");
      router.push("/host/listings");
    } catch (err: any) {
      console.error("Create listing failed:", err);
      alert(`Đăng dịch vụ thất bại: ${err?.message || "Lỗi không xác định"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-smooth-appear pb-12">
      
      {/* Header Link */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-white/5 rounded-xl border border-white/5 text-gray-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">Đăng dịch vụ mới</h2>
          <p className="text-xs text-gray-400">Bước {step} trên 3: {step === 1 ? "Thông tin cơ bản" : step === 2 ? "Địa điểm & Giá cả" : "Thuộc tính chi tiết"}</p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex gap-2">
        <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-app-primary" : "bg-white/5"}`} />
        <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-app-primary" : "bg-white/5"}`} />
        <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? "bg-app-primary" : "bg-white/5"}`} />
      </div>

      {/* Main Skeleton Form Container */}
      <div className="bg-[#0d0d18] border border-white/5 rounded-2xl p-6 space-y-6">
        
        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-2xs font-bold text-gray-400 uppercase mb-1">Tên dịch vụ *</label>
              <input 
                type="text" 
                placeholder="Ví dụ: Căn hộ Deluxe View Hồ Tây" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-app-primary"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold text-gray-400 uppercase mb-1">Mô tả chi tiết</label>
              <textarea 
                rows={4}
                placeholder="Mô tả các tiện nghi, không gian và quy tắc..." 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-app-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-bold text-gray-400 uppercase mb-1">Danh mục lớn *</label>
                <select 
                  value={category} 
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setCategory(val);
                    setSubCategory(val === "SVC" ? "PHOTOGRAPHY" : "NONE");
                  }}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-app-primary"
                >
                  <option value="STAY" className="bg-[#0d0d18]">Lưu trú (STAY)</option>
                  <option value="EXP" className="bg-[#0d0d18]">Trải nghiệm (EXP)</option>
                  <option value="SVC" className="bg-[#0d0d18]">Dịch vụ (SVC)</option>
                </select>
              </div>

              {category === "SVC" && (
                <div>
                  <label className="block text-2xs font-bold text-gray-400 uppercase mb-1">Danh mục phụ *</label>
                  <select 
                    value={subCategory} 
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-app-primary"
                  >
                    <option value="PHOTOGRAPHY" className="bg-[#0d0d18]">Photography</option>
                    <option value="CHEF" className="bg-[#0d0d18]">Chef</option>
                    <option value="MASSAGE" className="bg-[#0d0d18]">Massage</option>
                    <option value="PREPARED_MEALS" className="bg-[#0d0d18]">Prepared Meals</option>
                    <option value="TRAINING" className="bg-[#0d0d18]">Training</option>
                    <option value="MAKEUP" className="bg-[#0d0d18]">Makeup</option>
                    <option value="HAIR_STYLING" className="bg-[#0d0d18]">Hair Styling</option>
                    <option value="SPA" className="bg-[#0d0d18]">Spa</option>
                    <option value="CATERING" className="bg-[#0d0d18]">Catering</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Location & Price */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-bold text-gray-400 uppercase mb-1">Tỉnh/Thành phố *</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Hà Nội" 
                  value={province} 
                  onChange={(e) => setProvince(e.target.value)}
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-app-primary"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold text-gray-400 uppercase mb-1">Đơn vị giá *</label>
                <select 
                  value={priceUnit} 
                  onChange={(e) => setPriceUnit(e.target.value as any)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-app-primary"
                >
                  <option value="PER_NIGHT" className="bg-[#0d0d18]">Mỗi đêm (PER_NIGHT)</option>
                  <option value="PER_PAX" className="bg-[#0d0d18]">Mỗi người (PER_PAX)</option>
                  <option value="PER_HOUR" className="bg-[#0d0d18]">Mỗi giờ (PER_HOUR)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-2xs font-bold text-gray-400 uppercase mb-1">Giá cơ bản (VNĐ) *</label>
              <input 
                type="number" 
                placeholder="Ví dụ: 1200000" 
                value={basePrice} 
                onChange={(e) => setBasePrice(e.target.value)}
                required
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-app-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-bold text-gray-400 uppercase mb-1">Vĩ độ (Latitude) *</label>
                <input 
                  type="text" 
                  value={latitude} 
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-app-primary"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold text-gray-400 uppercase mb-1">Kinh độ (Longitude) *</label>
                <input 
                  type="text" 
                  value={longitude} 
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-app-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-2xs font-bold text-gray-400 uppercase mb-1">Ảnh đại diện (Thumbnail URL)</label>
              <input 
                type="text" 
                placeholder="Nhập đường dẫn ảnh trực tiếp hoặc để trống dùng ảnh album..." 
                value={thumbnailUrl} 
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-app-primary"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Attributes (STAY Specialized) */}
        {step === 3 && (
          <div className="space-y-6">
            
            {category !== "STAY" ? (
              <div className="p-4 border border-dashed border-white/10 rounded-xl text-center">
                <p className="text-xs text-gray-400">Các cấu hình thuộc tính nâng cao của Trải nghiệm/Dịch vụ sẽ tự động được thiết lập mặc định.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Stay Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white border-b border-white/5 pb-1">Chi tiết phòng lưu trú</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Loại bất động sản</label>
                      <select 
                        value={propertyType} 
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-app-primary"
                      >
                        <option value="Apartment" className="bg-[#0d0d18]">Căn hộ (Apartment)</option>
                        <option value="Villa" className="bg-[#0d0d18]">Biệt thự (Villa)</option>
                        <option value="Homestay" className="bg-[#0d0d18]">Homestay</option>
                        <option value="Hotel" className="bg-[#0d0d18]">Khách sạn (Hotel)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Diện tích (m²)</label>
                      <input 
                        type="number" 
                        value={roomSizeSqM} 
                        onChange={(e) => setRoomSizeSqM(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Khách tối đa</label>
                      <input 
                        type="number" 
                        value={maxGuests} 
                        onChange={(e) => setMaxGuests(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Phòng ngủ</label>
                      <input 
                        type="number" 
                        value={bedrooms} 
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Phòng tắm</label>
                      <input 
                        type="number" 
                        value={bathrooms} 
                        onChange={(e) => setBathrooms(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Beds Configuration */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1">
                    <h3 className="text-xs font-bold text-white">Cấu hình giường</h3>
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
                          className="flex-grow bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="King" className="bg-[#0d0d18]">King Bed</option>
                          <option value="Queen" className="bg-[#0d0d18]">Queen Bed</option>
                          <option value="Double" className="bg-[#0d0d18]">Double Bed</option>
                          <option value="Single" className="bg-[#0d0d18]">Single Bed</option>
                        </select>
                        <input 
                          type="number" 
                          placeholder="SL" 
                          value={bed.quantity}
                          min={1}
                          onChange={(e) => updateBed(index, "quantity", e.target.value)}
                          className="w-16 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                        {beds.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeBed(index)}
                            className="p-2 hover:bg-white/5 rounded-lg text-red-500"
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
                  <h3 className="text-xs font-bold text-white border-b border-white/5 pb-1">Tiện ích</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Thêm tiện ích (Ví dụ: Hồ bơi)" 
                      value={newAmenity} 
                      onChange={(e) => setNewAmenity(e.target.value)}
                      className="flex-grow bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <button 
                      type="button" 
                      onClick={addAmenity}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      Thêm
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((item, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 bg-white/5 border border-white/5 rounded-full text-gray-300">
                        {item}
                        <button type="button" onClick={() => removeAmenity(index)} className="text-gray-500 hover:text-white">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Policies */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white border-b border-white/5 pb-1">Chính sách chỗ nghỉ</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-1">Giờ nhận phòng</label>
                      <input 
                        type="text" 
                        value={checkInTime} 
                        onChange={(e) => setCheckInTime(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-1">Giờ trả phòng</label>
                      <input 
                        type="text" 
                        value={checkOutTime} 
                        onChange={(e) => setCheckOutTime(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 text-xs">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={allowPets} 
                        onChange={(e) => setAllowPets(e.target.checked)}
                        className="rounded border-white/10 bg-black/20 text-app-primary focus:ring-0 focus:ring-offset-0 w-4 h-4"
                      />
                      <span className="text-gray-300">Cho phép mang theo thú cưng</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={allowSmoking} 
                        onChange={(e) => setAllowSmoking(e.target.checked)}
                        className="rounded border-white/10 bg-black/20 text-app-primary focus:ring-0 focus:ring-offset-0 w-4 h-4"
                      />
                      <span className="text-gray-300">Cho phép hút thuốc</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={partyAllowed} 
                        onChange={(e) => setPartyAllowed(e.target.checked)}
                        className="rounded border-white/10 bg-black/20 text-app-primary focus:ring-0 focus:ring-offset-0 w-4 h-4"
                      />
                      <span className="text-gray-300">Cho phép tổ chức tiệc tùng</span>
                    </label>
                  </div>
                </div>

                {/* Album Gallery */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-white border-b border-white/5 pb-1">Album ảnh (Gallery URLs)</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Nhập đường dẫn ảnh trực tiếp..." 
                      value={newGalleryUrl} 
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      className="flex-grow bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <button 
                      type="button" 
                      onClick={addGalleryUrl}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      Thêm
                    </button>
                  </div>
                  <div className="space-y-2">
                    {galleryUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-black/25 border border-white/5 rounded-xl text-2xs">
                        <span className="truncate flex-grow text-gray-400">{url}</span>
                        <button type="button" onClick={() => removeGalleryUrl(index)} className="text-red-500 hover:text-red-400 font-semibold px-1">Xóa</button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Buttons Controls */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          {step > 1 ? (
            <button 
              type="button" 
              onClick={prevStep}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-all font-semibold"
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
              className="flex items-center gap-1.5 text-xs text-white bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-xl transition-all font-semibold"
            >
              Tiếp tục <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-white bg-app-primary hover:bg-app-primary/95 px-5 py-2.5 rounded-xl transition-all font-bold shadow-lg shadow-app-primary/20 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Lưu & Đăng bán"} <Save className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
