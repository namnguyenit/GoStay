const fs = require('fs');

const filePath = '/Users/nhannt/Desktop/desktop/project/GoStay/front_end/src/screens/home/components/HomeClient.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// The first one was already replaced. I will replace the others.
// We can use a regex that matches the map block
const regex = /\.map\(\(\[name, list\]\) => \{\s+const maxRating = Math\.max\(\.\.\.list\.map\(x => x\.rating \|\| 0\)\);\s+return \{ name, list, maxRating \};\s+\}\)/g;

const replacement = `.map(([name, list]) => {
        const maxRating = Math.max(...list.map(x => x.rating || 0));
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        return { name, list, maxRating };
      })`;

content = content.replace(regex, replacement);

fs.writeFileSync(filePath, content);
console.log("Updated HomeClient.tsx successfully");
