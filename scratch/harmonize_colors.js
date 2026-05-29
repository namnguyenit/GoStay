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
      
      // Emerald
      content = content.replace(/text-emerald-400/g, 'text-emerald-600');
      content = content.replace(/text-emerald-500/g, 'text-emerald-600');
      content = content.replace(/bg-emerald-500\/10/g, 'bg-emerald-50');
      content = content.replace(/bg-emerald-500\/20/g, 'bg-emerald-50');
      content = content.replace(/bg-emerald-950\/10/g, 'bg-emerald-50');
      content = content.replace(/bg-emerald-950\/20/g, 'bg-emerald-50');
      content = content.replace(/bg-emerald-950\/40/g, 'bg-emerald-100');
      content = content.replace(/border-emerald-500\/10/g, 'border-emerald-200');
      content = content.replace(/border-emerald-500\/20/g, 'border-emerald-200');

      // Yellow
      content = content.replace(/text-yellow-500/g, 'text-yellow-600');
      content = content.replace(/text-yellow-400/g, 'text-yellow-600');
      content = content.replace(/bg-yellow-500\/10/g, 'bg-yellow-50');
      content = content.replace(/bg-yellow-500\/20/g, 'bg-yellow-50');
      content = content.replace(/bg-yellow-950\/10/g, 'bg-yellow-50');
      content = content.replace(/bg-yellow-950\/20/g, 'bg-yellow-50');
      content = content.replace(/border-yellow-500\/10/g, 'border-yellow-200');
      content = content.replace(/border-yellow-500\/20/g, 'border-yellow-200');

      // Red
      content = content.replace(/text-red-500/g, 'text-red-600');
      content = content.replace(/text-red-400/g, 'text-red-600');
      content = content.replace(/bg-red-500\/10/g, 'bg-red-50');
      content = content.replace(/bg-red-500\/20/g, 'bg-red-50');
      content = content.replace(/border-red-500\/20/g, 'border-red-200');
      
      // Update primary color badges to look good
      content = content.replace(/bg-app-primary\/10/g, 'bg-app-primary/10');
      content = content.replace(/border-app-primary\/20/g, 'border-app-primary/30');
      content = content.replace(/border-app-primary\/10/g, 'border-app-primary/20');
      
      // Harmonize inputs and cards better
      // For instance in calendar page
      content = content.replace(/bg-gray-50 border-gray-100/g, 'bg-white border-gray-200');
      content = content.replace(/bg-gray-50 border border-gray-100/g, 'bg-white border border-gray-200');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log("Updated colors in", fullPath);
      }
    }
  }
}

processDir('/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host');
