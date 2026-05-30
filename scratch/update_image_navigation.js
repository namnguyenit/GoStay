const fs = require('fs');

const path = '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/screens/home/components/ImageNavigation.tsx';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace(
  'const { imageIndex, setImageIndex, setClock, experiences, setExperiences } =',
  'const { imageIndex, setImageIndex, setClock, landmarks } ='
);

content = content.replace(/experiences\?/g, 'landmarks?');
content = content.replace(/e\.image/g, 'e.thumbnailUrl');

fs.writeFileSync(path, content);
