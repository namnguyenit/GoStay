const fs = require('fs');
const filePath = '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// The file has a lot of `bg-[#0d0d18]`, `text-white`, `border-white/5`
content = content.replace(/bg-\[#0d0d18\]/g, 'bg-white');
content = content.replace(/text-white/g, 'text-gray-900');
content = content.replace(/border-white\/5/g, 'border-gray-100');
content = content.replace(/border-white\/10/g, 'border-gray-200');
content = content.replace(/text-gray-400/g, 'text-gray-500');
content = content.replace(/text-gray-300/g, 'text-gray-700');
content = content.replace(/bg-white\/5/g, 'bg-gray-50');

// Replace standard dashboard title "Xin chào, HostName!" if it was in layout before, now it's in layout or not?
// In the old layout, the top header was IN the layout. Let's check my new layout.
// Ah, my new layout removed the Top Header `Xin chào, HostName` from `layout.tsx`.
// So I should add a simple Page Header inside `page.tsx` or let `page.tsx` handle its own title.
// Actually, `page.tsx` doesn't have a title right now because it was in `layout.tsx`. Let me add it.

content = content.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">',
  `<div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Theo dõi hoạt động kinh doanh và hiệu suất dịch vụ của bạn.</p>
      </div>\n      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">`
);

fs.writeFileSync(filePath, content);
console.log("Dashboard updated.");
