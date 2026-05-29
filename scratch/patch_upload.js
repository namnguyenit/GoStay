const fs = require('fs');
let content = fs.readFileSync('/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host/listings/new/page.tsx', 'utf-8');

// 1. Add useRef and lucide-react icons
content = content.replace(
  'import { ArrowLeft, ArrowRight, Save, Plus, Trash } from "lucide-react";',
  'import { ArrowLeft, ArrowRight, Save, Plus, Trash, Upload, X, Image as ImageIcon } from "lucide-react";\nimport { useRef } from "react";'
);

// 2. Add state for file uploads (around line 35)
const uploadStates = `
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
`;
content = content.replace(
  '  const [thumbnailUrl, setThumbnailUrl] = useState("");\n',
  '  const [thumbnailUrl, setThumbnailUrl] = useState("");\n' + uploadStates
);

// 3. Update handleSubmit
const oldSubmitStart = `  const handleSubmit = async () => {
    
    // Safety guard: only submit on final step
    if (step !== 3) {
      return;
    }

    if (!title || !basePrice || !province) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc!");
      return;
    }

    let finalCategoryType = category as string;`;

const newSubmitStart = `  const handleSubmit = async () => {
    if (step !== 3) return;

    if (!title || !basePrice || !province) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc!");
      return;
    }

    setLoading(true);

    try {
      let finalThumbnailUrl = thumbnailUrl;
      let finalGalleryUrls = [...galleryUrls];

      // Upload Thumbnail
      if (thumbnailFile) {
        const thumbRes: any = await HostService.uploadSingleMedia(thumbnailFile, "listings");
        if (thumbRes?.data?.url) {
          finalThumbnailUrl = thumbRes.data.url;
        }
      }

      // Upload Gallery
      if (galleryFiles.length > 0) {
        const galleryRes: any = await HostService.uploadBulkMedia(galleryFiles, "listings");
        if (galleryRes?.data?.url) {
          finalGalleryUrls = [...finalGalleryUrls, ...galleryRes.data.url];
        }
      }

      let finalCategoryType = category as string;`;

content = content.replace(oldSubmitStart, newSubmitStart);

// Replace galleryUrls inside attributesPayload
content = content.replace(
  '      galleryUrls: galleryUrls',
  '      galleryUrls: finalGalleryUrls'
);

// Replace thumbnailUrl inside payload
content = content.replace(
  '      thumbnailUrl: thumbnailUrl || galleryUrls[0] || "",',
  '      thumbnailUrl: finalThumbnailUrl || finalGalleryUrls[0] || "",'
);

content = content.replace(
  '      setLoading(false);\n      const res = await HostService.createListing(payload);',
  '      const res = await HostService.createListing(payload);'
);

// 4. Replace Thumbnail Input in Step 2
const oldThumbnailInput = `            <div>
              <label className="block text-2xs font-bold text-gray-400 uppercase mb-1">Ảnh đại diện (Thumbnail URL)</label>
              <input 
                type="text" 
                placeholder="Nhập đường dẫn ảnh trực tiếp hoặc để trống dùng ảnh album..." 
                value={thumbnailUrl} 
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-app-primary"
              />
            </div>`;
const newThumbnailInput = `            <div className="space-y-2">
              <label className="block text-2xs font-bold text-gray-400 uppercase mb-1">Ảnh đại diện (Thumbnail)</label>
              <div 
                onClick={() => thumbnailInputRef.current?.click()}
                className="relative group w-full h-48 border-2 border-dashed border-white/20 rounded-2xl overflow-hidden hover:border-app-primary/50 transition-colors cursor-pointer bg-black/20 flex flex-col items-center justify-center"
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
                    <p className="text-sm text-gray-400">Tải ảnh đại diện</p>
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
            </div>`;
content = content.replace(oldThumbnailInput, newThumbnailInput);

// 5. Replace Album Gallery in Step 3
const oldGalleryBlock = `{/* Album Gallery */}
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
            </div>`;
const newGalleryBlock = `{/* Album Gallery Upload */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white border-b border-white/5 pb-1">Thư viện ảnh (Gallery)</h3>
              <div className="grid grid-cols-3 gap-3">
                {galleryPreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10">
                    <img src={preview} alt={'Gallery ' + idx} className="object-cover w-full h-full" />
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
                  className="aspect-square border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-app-primary hover:border-app-primary/50 transition-colors cursor-pointer bg-black/20"
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
            </div>`;
content = content.replace(oldGalleryBlock, newGalleryBlock);

fs.writeFileSync('/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host/listings/new/page.tsx', content);
console.log("File patched!");
