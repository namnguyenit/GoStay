import re

with open('/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host/listings/new/page.tsx', 'r') as f:
    content = f.read()

# We want to replace the Step 3 section.
# It starts from `{/* STEP 3: Attributes (STAY Specialized) */}`
# We'll split the file and rebuild it.

start_marker = '{/* STEP 3: Attributes (STAY Specialized) */}'
end_marker = '{/* Buttons Controls */}'

parts = content.split(start_marker)
if len(parts) < 2:
    print("Cannot find start marker")
    exit(1)

pre = parts[0]
rest = parts[1]

parts2 = rest.split(end_marker)
if len(parts2) < 2:
    print("Cannot find end marker")
    exit(1)

step3_content = parts2[0]
post = end_marker + parts2[1]

# We will extract the STAY details and Album Gallery from step3_content.
stay_start = '{/* Stay Details */}'
album_start = '{/* Album Gallery */}'

s1 = step3_content.split(stay_start)[1]
stay_block = stay_start + s1.split(album_start)[0]
album_block = album_start + s1.split(album_start)[1]

new_step_3 = """{/* STEP 3: Attributes */}
        {step === 3 && (
          <div className="space-y-6">
            
            {/* STAY DETAILS */}
            {category === "STAY" && (
              <div className="space-y-6">
                %s
              </div>
            )}

            {/* EXP DETAILS */}
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

            {/* SVC DETAILS */}
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

            %s
            
          </div>
        )}

        """ % (stay_block.replace("                {/* Album Gallery */}", "").strip()[:-17], album_block.split("              </div>\n            )}")[0].strip())

new_content = pre + new_step_3 + "\n        " + post

with open('/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host/listings/new/page.tsx', 'w') as f:
    f.write(new_content)

print("Patched Step 3 successfully.")

