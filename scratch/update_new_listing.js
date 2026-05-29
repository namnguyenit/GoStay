const fs = require('fs');
const filePath = '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host/listings/new/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Colors
content = content.replace(/text-white/g, 'text-gray-900');
content = content.replace(/text-gray-400/g, 'text-gray-600');
content = content.replace(/text-gray-300/g, 'text-gray-700');
content = content.replace(/bg-black\/20/g, 'bg-white');
content = content.replace(/bg-black\/25/g, 'bg-gray-50');
content = content.replace(/bg-black\/40/g, 'bg-white');
content = content.replace(/bg-\[#0d0d18\]/g, 'bg-white');
content = content.replace(/border-white\/10/g, 'border-gray-300');
content = content.replace(/border-white\/5/g, 'border-gray-200');
content = content.replace(/border-white\/20/g, 'border-gray-300');
content = content.replace(/bg-white\/5/g, 'bg-gray-100');
content = content.replace(/hover:bg-white\/10/g, 'hover:bg-gray-200');

// Fix text-white on app-primary buttons (it was replaced with text-gray-900)
content = content.replace(/bg-app-primary hover:bg-app-primary\/95 text-gray-900/g, 'bg-app-primary hover:bg-app-primary/95 text-white');
content = content.replace(/bg-app-primary text-gray-900/g, 'bg-app-primary text-white');

// Fix "border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900" inside inputs
// In light theme, inputs need better contrast, maybe add shadow-sm
content = content.replace(/border-gray-300 rounded-xl px-4/g, 'border-gray-300 shadow-sm rounded-xl px-4');
content = content.replace(/border-gray-300 rounded-xl px-3/g, 'border-gray-300 shadow-sm rounded-xl px-3');

// Fix header title since we removed it from layout
content = content.replace(
  '<div className="flex items-center gap-3">',
  `<div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Đăng dịch vụ mới</h1>
        <p className="text-sm text-gray-500 mt-1">Cung cấp thông tin chi tiết để bắt đầu kinh doanh trên nền tảng.</p>
      </div>
      <div className="flex items-center gap-3">`
);

fs.writeFileSync(filePath, content);
console.log("New Listing form updated.");
