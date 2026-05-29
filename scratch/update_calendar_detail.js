const fs = require('fs');

const filePath = '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/app/host/calendar/[listingId]/[date]/page.tsx';
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
  content = content.replace(/hover:bg-white\/10/g, 'hover:bg-gray-200');
  fs.writeFileSync(filePath, content);
  console.log("calendar detail updated");
}
