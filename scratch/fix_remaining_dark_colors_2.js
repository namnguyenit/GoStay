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

      content = content.replace(/bg-yellow-950/g, 'bg-yellow-50');
      content = content.replace(/bg-red-950/g, 'bg-red-50');
      content = content.replace(/bg-blue-950/g, 'bg-blue-50');
      content = content.replace(/bg-indigo-950/g, 'bg-indigo-50');
      content = content.replace(/bg-purple-950/g, 'bg-purple-50');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log("Fixed more 950 colors in", fullPath);
      }
    }
  }
}

processDir('/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host');
