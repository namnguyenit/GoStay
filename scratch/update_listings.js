const fs = require('fs');
const filePath = '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host/listings/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// The file has a lot of `bg-[#0d0d18]`, `text-white`, `border-white/5`
content = content.replace(/bg-\[#0d0d18\]/g, 'bg-white');
content = content.replace(/text-white/g, 'text-gray-900');
content = content.replace(/border-white\/5/g, 'border-gray-200');
content = content.replace(/border-white\/10/g, 'border-gray-300');
content = content.replace(/text-gray-400/g, 'text-gray-500');
content = content.replace(/text-gray-300/g, 'text-gray-700');
content = content.replace(/bg-black\/20/g, 'bg-gray-50');
content = content.replace(/bg-white\/5/g, 'bg-gray-50');
content = content.replace(/hover:bg-white\/5/g, 'hover:bg-gray-50');
content = content.replace(/bg-\[#07070d\]/g, 'bg-gray-50');
content = content.replace(/bg-app-primary\/10/g, 'bg-app-primary/10 text-app-primary'); // Make sure text is visible

// Ensure top title is visible if it was missing
content = content.replace(
  '<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">',
  `<div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Quản lý Dịch vụ</h1>
        <p className="text-sm text-gray-500 mb-6">Theo dõi và quản lý tất cả các dịch vụ (STAY, EXP, SVC) của bạn.</p>
      </div>\n      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">`
);

fs.writeFileSync(filePath, content);
console.log("Listings updated.");
