const fs = require('fs');

// 1. Update place.ts, service.ts, experience.ts
['place.ts', 'service.ts', 'experience.ts'].forEach(file => {
  let p = '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/services/' + file;
  if(fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    content = content.replace(/img: item\.thumbnailUrl,/g, 'img: item.thumbnailUrl,\n          address: item.province,');
    fs.writeFileSync(p, content);
  }
});

// 2. Update DTOs
const dtos = [
  '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/dto/responses/place/get-all-places.ts',
  '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/dto/responses/service/get-all-services.ts',
  '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/dto/responses/experience/get-all-experiences.ts'
];
dtos.forEach(p => {
  if(fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    content = content.replace(/img: z\.string\(\)\.optional\(\),/g, 'img: z.string().optional(),\n            address: z.string().optional(),');
    fs.writeFileSync(p, content);
  }
});

// 3. Update mappers
const mappers = [
  '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/modules/place/mappers/map-places.ts',
  '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/modules/service/mappers/map-services.ts',
  '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/modules/experience/mappers/map-experiences.ts'
];
mappers.forEach(p => {
  if(fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    content = content.replace(/image: e\?\.img,/g, 'image: e?.img,\n      address: e?.address,');
    fs.writeFileSync(p, content);
  }
});

console.log("Fixed mapping");
