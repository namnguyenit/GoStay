const fs = require('fs');
const path = '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/screens/admin/landmarks/hook/useAdminLandmark.ts';
let content = fs.readFileSync(path, 'utf-8');

// Add import HostService if not present
if (!content.includes('HostService')) {
  content = content.replace('import AdminService from "@/services/admin.service";', 'import AdminService from "@/services/admin.service";\nimport HostService from "@/services/host.service";');
}

// Add state variables
const stateVars = `
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
`;
content = content.replace(/const \[submitting, setSubmitting\] = useState\(false\);/, stateVars + '\n  const [submitting, setSubmitting] = useState(false);');

// Update handleCreate
const handleCreateRegex = /const handleCreate = async \(e: React\.FormEvent\) => \{[\s\S]*?finally \{\s*setSubmitting\(false\);\s*\}\s*\};/;
const newHandleCreate = `const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.latitude || !form.longitude || !form.province) {
      alert("Vui lòng điền đủ Tên, Tỉnh/Thành phố, Vĩ độ và Kinh độ.");
      return;
    }
    setSubmitting(true);
    try {
      let uploadedThumbnailUrl = "";
      let uploadedGalleryUrls: string[] = [];

      if (thumbnailFile) {
        const thumbRes: any = await HostService.uploadSingleMedia(thumbnailFile, "landmarks");
        uploadedThumbnailUrl = thumbRes?.data?.url || "";
      }

      if (galleryFiles.length > 0) {
        const galleryRes: any = await HostService.uploadBulkMedia(galleryFiles, "landmarks");
        uploadedGalleryUrls = galleryRes?.data?.url || [];
      }

      await AdminService.createLandmark({
        name: form.name,
        description: form.description,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        province: form.province,
        thumbnailUrl: uploadedThumbnailUrl,
        galleryUrls: uploadedGalleryUrls
      });
      setSuccessMsg(\`Đã tạo địa danh "\${form.name}" thành công!\`);
      setForm({ name: "", description: "", latitude: "", longitude: "", province: "" });
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setGalleryFiles([]);
      setGalleryPreviews([]);
    } catch (err) {
      alert("Có lỗi khi tạo địa danh.");
    } finally {
      setSubmitting(false);
    }
  };`;
content = content.replace(handleCreateRegex, newHandleCreate);

// Update return
content = content.replace(/handleSaveEdit\n\s*\};/, `handleSaveEdit,
    thumbnailFile, setThumbnailFile,
    thumbnailPreview, setThumbnailPreview,
    galleryFiles, setGalleryFiles,
    galleryPreviews, setGalleryPreviews
  };`);

fs.writeFileSync(path, content);
