const fs = require('fs');

const path = '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/screens/home/hooks/useHome.ts';
let content = fs.readFileSync(path, 'utf-8');

// Use landmarks for clock loop
content = content.replace(/experiences\?.length/g, 'landmarks?.length');

// Initialize with max 6 landmarks
content = content.replace(
  'const [landmarks, setLandmarks] = useState<any[]>(initLandmarks);',
  'const [landmarks, setLandmarks] = useState<any[]>(initLandmarks.slice(0, 6));'
);

fs.writeFileSync(path, content);
