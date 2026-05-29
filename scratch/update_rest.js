const fs = require('fs');

const files = [
  '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host/earnings/page.tsx',
  '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host/landmark-suggestions/page.tsx',
  '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host/orders/page.tsx',
  '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host/calendar/page.tsx'
];

files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/bg-\[#0d0d18\]/g, 'bg-white');
    content = content.replace(/text-white/g, 'text-gray-900');
    content = content.replace(/text-gray-400/g, 'text-gray-600');
    content = content.replace(/text-gray-300/g, 'text-gray-700');
    content = content.replace(/bg-black\/20/g, 'bg-gray-50');
    content = content.replace(/bg-black\/40/g, 'bg-white');
    content = content.replace(/border-white\/5/g, 'border-gray-200');
    content = content.replace(/border-white\/10/g, 'border-gray-300');
    content = content.replace(/border-white\/20/g, 'border-gray-300');
    content = content.replace(/bg-white\/5/g, 'bg-gray-100');
    content = content.replace(/hover:bg-white\/5/g, 'hover:bg-gray-100');
    
    // Fix text-white on app-primary buttons
    content = content.replace(/bg-app-primary hover:bg-app-primary\/95 text-gray-900/g, 'bg-app-primary hover:bg-app-primary/95 text-white');
    content = content.replace(/bg-app-primary text-gray-900/g, 'bg-app-primary text-white');
    
    // For landmark suggestions specifically
    if (filePath.includes('landmark-suggestions')) {
      content = content.replace(
        '<div className="space-y-6 animate-smooth-appear max-w-4xl">',
        `<div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Đề xuất địa danh</h1>
        </div>
        <div className="space-y-6 animate-smooth-appear max-w-4xl">`
      );
    }
    
    fs.writeFileSync(filePath, content);
    console.log("Updated", filePath);
  }
});

