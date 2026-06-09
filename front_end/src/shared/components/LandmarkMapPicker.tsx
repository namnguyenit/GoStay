"use client";

import LocationCoordinatePicker from "@/shared/components/LocationCoordinatePicker";

type LandmarkLocationValue = {
  name: string;
  suggestedProvince: string;
  suggestedLatitude: string;
  suggestedLongitude: string;
};

type LandmarkMapPickerProps = {
  value: LandmarkLocationValue;
  onChange: (patch: Partial<LandmarkLocationValue>) => void;
  allowNameOverwrite?: boolean;
};

export default function LandmarkMapPicker({
  value,
  onChange,
  allowNameOverwrite = false,
}: LandmarkMapPickerProps) {
  return (
    <LocationCoordinatePicker
      title="Chọn địa danh trên bản đồ"
      hint="Tìm địa danh hoặc bấm trực tiếp lên bản đồ để hệ thống tự lấy kinh độ, vĩ độ."
      searchPlaceholder="Nhập tên địa danh, ví dụ: Bà Nà Hills, Hồ Hoàn Kiếm..."
      allowNameOverwrite={allowNameOverwrite}
      value={{
        name: value.name,
        province: value.suggestedProvince,
        latitude: value.suggestedLatitude,
        longitude: value.suggestedLongitude,
      }}
      onChange={(patch) =>
        onChange({
          name: patch.name,
          suggestedProvince: patch.province,
          suggestedLatitude: patch.latitude,
          suggestedLongitude: patch.longitude,
        })
      }
    />
  );
}
