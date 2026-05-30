const fs = require('fs');

const path = '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/screens/home/components/HomeClient.tsx';
let content = fs.readFileSync(path, 'utf-8');

const heroRegex = /\{\/\* BG \*\/\}([\s\S]*?)\{\/\* 4 famous places \*\/\}/;
const match = content.match(heroRegex);
if (match) {
  let heroSection = match[1];

  heroSection = heroSection.replace(/experiences\?\.\[imageIndex\]\?\.id/g, 'landmarks?.[imageIndex]?.id');
  heroSection = heroSection.replace(/experiences\?\.\[imageIndex\]\?\.image/g, 'landmarks?.[imageIndex]?.thumbnailUrl');
  heroSection = heroSection.replace(/experiences\?\.\[imageIndex\]\?\.name/g, 'landmarks?.[imageIndex]?.name');
  
  // Replace price, address, rating with description and province
  heroSection = heroSection.replace(
    /<div className="text-content text-white">\s*\{experiences\?\.\[imageIndex\]\?\.price\}\s*<\/div>/,
    '<div className="text-content text-white mt-2 max-w-2xl line-clamp-2">{landmarks?.[imageIndex]?.description}</div>'
  );
  heroSection = heroSection.replace(
    /<div className="text-content text-white">\s*\{experiences\?\.\[imageIndex\]\?\.address\}\s*<\/div>/,
    '<div className="text-content text-white mt-1 font-medium">{landmarks?.[imageIndex]?.province}</div>'
  );
  heroSection = heroSection.replace(
    /<div className="text-content text-white">\s*\{experiences\?\.\[imageIndex\]\?\.rating\}\s*<\/div>/,
    ''
  );

  heroSection = heroSection.replace(/const activeExp = experiences\?\.\[imageIndex\];/, 'const activeLandmark = landmarks?.[imageIndex];');
  heroSection = heroSection.replace(/if \(activeExp\?\.id\) \{[\s\S]*?\}/, `if (activeLandmark?.id) {
                      // navigate to landmark detail later if needed
                      // router.push(\`/landmark/\${activeLandmark.id}/detail\`);
                    }`);
                    
  content = content.replace(heroRegex, '{/* BG */}' + heroSection + '{/* 4 famous places */}');
  fs.writeFileSync(path, content);
}
