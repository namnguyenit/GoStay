const fs = require('fs');

const files = [
  '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host/listings/new/page.tsx',
  '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host/landmark-suggestions/page.tsx'
];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // Image overlays usually have text-gray-900 which was originally text-white
  content = content.replace(/<p className="text-gray-900 text-sm font-semibold flex items-center gap-2">/g, '<p className="text-white text-sm font-semibold flex items-center gap-2">');
  
  // Close button on images
  content = content.replace(/bg-black\/60 text-gray-900/g, 'bg-black/60 text-white');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log("Fixed overlay text colors in", filePath);
  }
});
