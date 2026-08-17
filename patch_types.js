const fs = require('fs');
let content = fs.readFileSync('lib/types.ts', 'utf8');
content = content.replace(
  "imageUrl?: string;",
  "imageUrl?: string;\n    promoCode?: string;\n    targetAudience?: string;"
);
fs.writeFileSync('lib/types.ts', content);
