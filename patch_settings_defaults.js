const fs = require('fs');
let content = fs.readFileSync('context/SettingsContext.tsx', 'utf8');
content = content.replace(
  "discountPercent: 0,",
  "discountPercent: 0,\n    promoCode: '',\n    targetAudience: 'All Clients',"
);
fs.writeFileSync('context/SettingsContext.tsx', content);
