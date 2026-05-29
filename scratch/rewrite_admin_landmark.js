const fs = require('fs');

const path = '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/screens/admin/landmarks/LandmarksScreen.tsx';
let content = fs.readFileSync(path, 'utf-8');

// 1. Add imports
if (!content.includes('import { useRef }')) {
  content = content.replace(
    'import { useAdminLandmark } from "./hook/useAdminLandmark";',
    `import { useAdminLandmark } from "./hook/useAdminLandmark";
import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { PROVINCES } from "@/shared/constants/provinces";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";`
  );
}

// 2. Add refs
const refsCode = `
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setGalleryFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setGalleryPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };
`;

content = content.replace(
  /handleSaveEdit \} = useAdminLandmark\(\);/,
  `handleSaveEdit,
    thumbnailFile, setThumbnailFile,
    thumbnailPreview, setThumbnailPreview,
    galleryFiles, setGalleryFiles,
    galleryPreviews, setGalleryPreviews
  } = useAdminLandmark();\n${refsCode}`
);

// 3. Replace Create Tab form
const newCreateForm = `
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-5xl">
          <h3 className="font-semibold text-gray-800 mb-4">Thêm địa danh mới</h3>

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              ✅ {successMsg}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Text Fields */}
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên địa danh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Hồ Hoàn Kiếm"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={form.province} 
                    onValueChange={(val) => setForm({ ...form, province: val })}
                    required
                  >
                    <SelectTrigger className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 h-[38px] text-sm text-gray-900 focus:ring-1 focus:ring-app-primary">
                      <SelectValue placeholder="-- Chọn tỉnh/thành phố --" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[300px]">
                      <SelectGroup>
                        {PROVINCES.map((province) => (
                          <SelectItem key={province} value={province} className="text-sm">
                            {province}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vĩ độ (Latitude) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={form.latitude}
                      onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                      placeholder="21.0285"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kinh độ (Longitude) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={form.longitude}
                      onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                      placeholder="105.8542"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả thêm</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Mô tả đặc điểm nổi bật của địa danh này..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary resize-none"
                  />
                </div>
              </div>

              {/* Right Column: Image Uploads */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ảnh đại diện (Thumbnail)
                  </label>
                  
                  <div 
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="relative group w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-app-primary/50 transition-colors cursor-pointer bg-gray-50 flex flex-col items-center justify-center"
                  >
                    <input 
                      type="file" 
                      ref={thumbnailInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                    {thumbnailPreview ? (
                      <img src={thumbnailPreview} alt="Thumbnail" className="object-cover w-full h-full" />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Tải ảnh đại diện</p>
                        <p className="text-[10px] text-gray-500 mt-1">PNG, JPG, WEBP lên đến 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thư viện ảnh (Gallery)
                  </label>
                  
                  <div 
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-app-primary/50 transition-colors cursor-pointer bg-gray-50"
                  >
                    <input 
                      type="file" 
                      ref={galleryInputRef} 
                      className="hidden" 
                      multiple
                      accept="image/*"
                      onChange={handleGalleryChange}
                    />
                    <Upload className="w-6 h-6 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-600">Thêm ảnh khác</p>
                  </div>

                  {galleryPreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden">
                          <img src={preview} alt="Gallery" className="object-cover w-full h-full" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGalleryImage(index);
                            }}
                            className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-500 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Đang tạo..." : "Tạo địa danh"}
            </button>
          </form>
        </div>
`;

content = content.replace(
  /<div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">\s*<h3 className="font-semibold text-gray-800 mb-4">Thêm địa danh mới<\/h3>[\s\S]*?<\/form>\s*<\/div>/,
  newCreateForm
);

fs.writeFileSync(path, content);
console.log("Rewrite completed.");
