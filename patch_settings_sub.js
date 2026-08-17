const fs = require('fs');
let content = fs.readFileSync('context/SettingsContext.tsx', 'utf8');

const targetStr = `monthlyMultiplier: Number(data.monthly_multiplier || 0.9),
                extras:`;
const replacementStr = `monthlyMultiplier: Number(data.monthly_multiplier || 0.9),
                campaign: data.campaign ? (typeof data.campaign === 'string' ? JSON.parse(data.campaign) : data.campaign) : defaultSettings.campaign,
                extras:`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('context/SettingsContext.tsx', content);
