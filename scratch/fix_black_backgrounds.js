const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let originalContent = content;

      // Replace bg-black/10 with bg-gray-50 (used in table headers/footers)
      content = content.replace(/bg-black\/10/g, 'bg-gray-50');

      // Replace bg-black/25 with bg-white (used in inputs and cards)
      content = content.replace(/bg-black\/25/g, 'bg-white');

      // Fix overlays where text-gray-900 should be text-white
      content = content.replace(/bg-black\/50 text-gray-900/g, 'bg-black/50 text-white');
      content = content.replace(/bg-black\/60 text-gray-900/g, 'bg-black/60 text-white');
      
      // Fix overlay backgrounds that might have been changed to bg-white
      // Actually overlays were explicitly bg-black/50 and bg-black/60 which were not changed.
      // But text-white inside them was changed to text-gray-900.
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log("Fixed black backgrounds in", fullPath);
      }
    }
  }
}

processDir('/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host');
