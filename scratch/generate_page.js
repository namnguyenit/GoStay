const fs = require('fs');

const content = fs.readFileSync('/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host/listings/new/page.tsx', 'utf-8');

// We will do precise replacements to build the new file.
let updatedContent = content;

// 1. Add new state variables
const stateVars = `
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
`;
updatedContent = updatedContent.replace(
  '  const [thumbnailUrl, setThumbnailUrl] = useState("");',
  '  const [thumbnailUrl, setThumbnailUrl] = useState("");\n' + stateVars
);

// 2. Add helper functions
const helpers = `
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
`;
updatedContent = updatedContent.replace(
  '  const removeGalleryUrl = (index: number) => {',
  '  const removeGalleryUrl = (index: number) => {'
).replace(
  '    setGalleryUrls(galleryUrls.filter((_, i) => i !== index));\n  };',
  '    setGalleryUrls(galleryUrls.filter((_, i) => i !== index));\n  };\n' + helpers
);

// 3. Update handleSubmit
const oldHandleSubmit = `    } else if (category === "EXP") {
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
      category,`;
const newHandleSubmit = `    } else if (category === "EXP") {
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
      category,`;
updatedContent = updatedContent.replace(oldHandleSubmit, newHandleSubmit);

// 4. Update Step 1 Complex Id
const complexInput = `              )}
            </div>

            <div>
              <label className="block text-2xs font-bold text-gray-400 uppercase mb-1">Mã Khu Tổ Hợp (Complex ID) - Tuỳ chọn</label>
              <input 
                type="text" 
                placeholder="Nhập mã nếu dịch vụ này thuộc một khu tổ hợp lớn..." 
                value={complexId} 
                onChange={(e) => setComplexId(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-app-primary"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Location & Price */}`;
updatedContent = updatedContent.replace(
  `              )}
            </div>
          </div>
        )}

        {/* STEP 2: Location & Price */}`,
  complexInput
);

// 5. Update Step 3
// Find where Step 3 starts and ends.
const step3Start = `{/* STEP 3: Attributes (STAY Specialized) */}`;
const step3End = `{/* Buttons Controls */}`;
const step3Parts = updatedContent.split(step3Start);
const step3ContentRaw = step3Parts[1].split(step3End)[0];

const newStep3 = `
        {/* STEP 3: Attributes */}
        {step === 3 && (
          <div className="space-y-6">
            
            {category === "STAY" && (
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

              </div>
            )}

            {category === "EXP" && (
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-white border-b border-white/5 pb-1">Chi tiết Trải nghiệm (Experience)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Thời lượng (Phút)</label>
                    <input type="number" value={expDuration} onChange={(e) => setExpDuration(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-app-primary" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Độ khó</label>
                    <select value={expDifficulty} onChange={(e) => setExpDifficulty(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-app-primary">
                      <option value="EASY" className="bg-[#0d0d18]">Dễ (Easy)</option>
                      <option value="MEDIUM" className="bg-[#0d0d18]">Trung bình (Medium)</option>
                      <option value="HARD" className="bg-[#0d0d18]">Khó (Hard)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Quy mô nhóm (Min - Max)</label>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Min" value={expGroupSizeMin} onChange={(e) => setExpGroupSizeMin(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                      <input type="number" placeholder="Max" value={expGroupSizeMax} onChange={(e) => setExpGroupSizeMax(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Ngôn ngữ</label>
                    <div className="flex gap-2 mb-2">
                      <input type="text" placeholder="Thêm ngôn ngữ..." value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} className="flex-grow bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                      <button type="button" onClick={addExpLanguage} className="bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-xs">Thêm</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {expLanguages.map((item, i) => (
                        <span key={i} className="inline-flex gap-1 items-center px-2 py-1 bg-white/5 rounded-full text-[10px] text-gray-300">
                          {item} <button type="button" onClick={() => removeExpLanguage(i)} className="text-gray-500 hover:text-white">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Điểm hẹn (Tên + Tọa độ)</label>
                    <input type="text" placeholder="Tên điểm hẹn (VD: Sảnh A, Khách sạn Mường Thanh)" value={expMeetingPoint} onChange={(e) => setExpMeetingPoint(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none mb-2" />
                    <div className="flex gap-2">
                      <input type="text" placeholder="Lat" value={expMeetingLat} onChange={(e) => setExpMeetingLat(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                      <input type="text" placeholder="Lng" value={expMeetingLng} onChange={(e) => setExpMeetingLng(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Bao gồm (Inclusions)</label>
                    <div className="flex gap-2 mb-2">
                      <input type="text" value={newInclusion} onChange={(e) => setNewInclusion(e.target.value)} className="flex-grow bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                      <button type="button" onClick={addExpInclusion} className="bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-xs">Thêm</button>
                    </div>
                    <div className="space-y-1">
                      {expInclusions.map((item, i) => (
                        <div key={i} className="flex justify-between bg-white/5 px-2 py-1 rounded text-xs text-gray-300"><span>{item}</span><button type="button" onClick={() => removeExpInclusion(i)} className="text-red-400">×</button></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Không bao gồm (Exclusions)</label>
                    <div className="flex gap-2 mb-2">
                      <input type="text" value={newExclusion} onChange={(e) => setNewExclusion(e.target.value)} className="flex-grow bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                      <button type="button" onClick={addExpExclusion} className="bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-xs">Thêm</button>
                    </div>
                    <div className="space-y-1">
                      {expExclusions.map((item, i) => (
                        <div key={i} className="flex justify-between bg-white/5 px-2 py-1 rounded text-xs text-gray-300"><span>{item}</span><button type="button" onClick={() => removeExpExclusion(i)} className="text-red-400">×</button></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Lịch trình (Itinerary)</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" placeholder="Thời gian (VD: 08:00)" value={newItineraryTime} onChange={(e) => setNewItineraryTime(e.target.value)} className="w-1/3 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                    <input type="text" placeholder="Hoạt động" value={newItineraryActivity} onChange={(e) => setNewItineraryActivity(e.target.value)} className="flex-grow bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                    <button type="button" onClick={addExpItinerary} className="bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-xs">Thêm</button>
                  </div>
                  <div className="space-y-2 border-l-2 border-white/10 pl-3">
                    {expItinerary.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-xs text-gray-300">
                        <div><span className="font-bold text-app-primary">{item.time}</span> - {item.activity}</div>
                        <button type="button" onClick={() => removeExpItinerary(i)} className="text-red-400 px-2 py-1">×</button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {category === "SVC" && (
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-white border-b border-white/5 pb-1">Chi tiết Dịch vụ (Service)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Loại nhà cung cấp</label>
                    <select value={svcProviderType} onChange={(e) => setSvcProviderType(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-app-primary">
                      <option value="INDIVIDUAL" className="bg-[#0d0d18]">Cá nhân (Individual)</option>
                      <option value="AGENCY" className="bg-[#0d0d18]">Doanh nghiệp/Agency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Thời lượng phục vụ (Phút)</label>
                    <input type="number" value={svcDuration} onChange={(e) => setSvcDuration(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-app-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Số ngày giao kết quả (Delivery Days)</label>
                    <input type="number" value={svcDeliveryDays} onChange={(e) => setSvcDeliveryDays(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-app-primary" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Sản phẩm bàn giao (Deliverables)</label>
                    <input type="text" placeholder="VD: 50 ảnh retouch, 1 video 5 phút" value={svcDeliverables} onChange={(e) => setSvcDeliverables(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-app-primary" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Trang thiết bị (Camera Gear / Tool)</label>
                  <input type="text" placeholder="VD: Sony A7IV, Đèn Flash Godox..." value={svcCameraGear} onChange={(e) => setSvcCameraGear(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-app-primary" />
                </div>

                <h3 className="text-xs font-bold text-white border-b border-white/5 pb-1 mt-6">Cấu hình Logistics</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                    <input type="checkbox" checked={logisticsServeAtClient} onChange={(e) => setLogisticsServeAtClient(e.target.checked)} className="rounded border-white/10 bg-black/20 text-app-primary focus:ring-0 w-4 h-4" />
                    <span className="text-gray-300">Phục vụ tại địa điểm của khách hàng (Serve at client location)</span>
                  </label>

                  {logisticsServeAtClient && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Bán kính tối đa (Km)</label>
                        <input type="number" value={logisticsMaxTravelRadius} onChange={(e) => setLogisticsMaxTravelRadius(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Thời gian Setup (Giờ)</label>
                        <input type="number" value={logisticsSetupTimeHours} onChange={(e) => setLogisticsSetupTimeHours(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Khung giờ giao hàng (Time Window)</label>
                      <input type="text" placeholder="VD: 08:00 - 18:00" value={logisticsDeliveryTimeWindow} onChange={(e) => setLogisticsDeliveryTimeWindow(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Thiết bị yêu cầu từ khách (Nếu có)</label>
                      <input type="text" value={logisticsEquipmentRequired} onChange={(e) => setLogisticsEquipmentRequired(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Thiết bị Host tự chuẩn bị</label>
                      <input type="text" value={logisticsEquipmentProvided} onChange={(e) => setLogisticsEquipmentProvided(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Yêu cầu không gian (Facility)</label>
                      <input type="text" placeholder="VD: Cần không gian rộng 5m2" value={logisticsFacilityRequired} onChange={(e) => setLogisticsFacilityRequired(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                  </div>
                  
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                    <input type="checkbox" checked={logisticsCleanupProvided} onChange={(e) => setLogisticsCleanupProvided(e.target.checked)} className="rounded border-white/10 bg-black/20 text-app-primary focus:ring-0 w-4 h-4" />
                    <span className="text-gray-300">Cung cấp dọn dẹp sau dịch vụ (Cleanup provided)</span>
                  </label>
                </div>
              </div>
            )}

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
`;

updatedContent = step3Parts[0] + newStep3 + step3End + step3Parts[1].split(step3End)[1];

fs.writeFileSync('/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host/listings/new/page.tsx', updatedContent);
console.log("Rewrite completed.");
