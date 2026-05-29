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

      // Fix specific leftover dark badges
      content = content.replace(/bg-emerald-950/g, 'bg-emerald-50');
      
      // Fix button text colors for app-primary background
      // specifically looking for "bg-app-primary hover:bg-app-primary/95 text-gray-900"
      content = content.replace(/bg-app-primary hover:bg-app-primary\/95 text-gray-900/g, 'bg-app-primary hover:bg-app-primary/95 text-white');
      
      // There might be others
      content = content.replace(/bg-app-primary text-gray-900/g, 'bg-app-primary text-white');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log("Fixed remaining colors in", fullPath);
      }
    }
  }
}

processDir('/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host');
