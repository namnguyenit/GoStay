const fs = require('fs');
const path = '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/screens/home/components/HomeClient.tsx';
let content = fs.readFileSync(path, 'utf-8');

if (content.includes('// router.push(')) {
  content = content.replace(
    '// router.push(`/landmark/\\${activeLandmark.id}/detail`);',
    'router.push(`/landmark/${activeLandmark.id}/detail`);'
  );
  fs.writeFileSync(path, content);
  console.log("HomeClient updated");
}
