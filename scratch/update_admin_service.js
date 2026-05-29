const fs = require('fs');

const path = '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/services/admin.service.ts';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace(
  /createLandmark: async \(data: \{\n\s+name: string;\n\s+description: string;\n\s+latitude: number;\n\s+longitude: number;\n\s+address\?: string;\n\s+province\?: string;\n\s+\}\)/,
  `createLandmark: async (data: {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    address?: string;
    province?: string;
    thumbnailUrl?: string;
    galleryUrls?: string[];
  })`
);

fs.writeFileSync(path, content);
