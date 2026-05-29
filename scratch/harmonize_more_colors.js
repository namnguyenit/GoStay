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

      // Blue
      content = content.replace(/text-blue-400/g, 'text-blue-600');
      content = content.replace(/text-blue-500/g, 'text-blue-600');
      content = content.replace(/bg-blue-500\/10/g, 'bg-blue-50');
      content = content.replace(/bg-blue-500\/20/g, 'bg-blue-50');
      content = content.replace(/bg-blue-950\/10/g, 'bg-blue-50');
      content = content.replace(/border-blue-500\/10/g, 'border-blue-200');
      content = content.replace(/border-blue-500\/20/g, 'border-blue-200');

      // Indigo
      content = content.replace(/text-indigo-400/g, 'text-indigo-600');
      content = content.replace(/text-indigo-500/g, 'text-indigo-600');
      content = content.replace(/bg-indigo-500\/10/g, 'bg-indigo-50');
      content = content.replace(/bg-indigo-500\/20/g, 'bg-indigo-50');
      content = content.replace(/bg-indigo-950\/10/g, 'bg-indigo-50');
      content = content.replace(/border-indigo-500\/10/g, 'border-indigo-200');

      // Purple
      content = content.replace(/text-purple-400/g, 'text-purple-600');
      content = content.replace(/text-purple-500/g, 'text-purple-600');
      content = content.replace(/bg-purple-500\/10/g, 'bg-purple-50');
      content = content.replace(/bg-purple-500\/20/g, 'bg-purple-50');
      content = content.replace(/border-purple-500\/10/g, 'border-purple-200');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log("Fixed more colors in", fullPath);
      }
    }
  }
}

processDir('/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host');
