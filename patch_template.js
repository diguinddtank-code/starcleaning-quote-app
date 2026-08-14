const fs = require('fs');
const file = 'lib/emailTemplate.ts';
let content = fs.readFileSync(file, 'utf8');

const search = `  // Recurring Estimates
  const standardTotalForPreview = basePrice + areaPrice + roomsPrice;
  const weeklyPrice = Math.round(standardTotalForPreview * (settings.weeklyMultiplier || 0.8));
  const biWeeklyPrice = Math.round(standardTotalForPreview * (settings.biWeeklyMultiplier || 0.85));
  const monthlyPrice = Math.round(standardTotalForPreview * (settings.monthlyMultiplier || 0.9));`;

const replace = `  // Recurring Estimates
  let weeklyPrice = 0;
  let biWeeklyPrice = 0;
  let monthlyPrice = 0;

  let tier = settings.pricingTiers?.find(t => (quote.sqFt || 0) >= t.minSqft && (quote.sqFt || 0) <= t.maxSqft);
  if (!tier && settings.pricingTiers && settings.pricingTiers.length > 0) {
    tier = settings.pricingTiers.reduce((prev, curr) => 
      Math.abs(curr.maxSqft - (quote.sqFt || 0)) < Math.abs(prev.maxSqft - (quote.sqFt || 0)) ? curr : prev
    );
  }

  if (tier) {
    weeklyPrice = tier.recurring.weekly.max;
    biWeeklyPrice = tier.recurring.biWeekly.max;
    monthlyPrice = tier.recurring.monthly.max;
  } else {
    const standardTotalForPreview = basePrice + areaPrice + roomsPrice;
    weeklyPrice = Math.round(standardTotalForPreview * (settings.weeklyMultiplier || 0.8));
    biWeeklyPrice = Math.round(standardTotalForPreview * (settings.biWeeklyMultiplier || 0.85));
    monthlyPrice = Math.round(standardTotalForPreview * (settings.monthlyMultiplier || 0.9));
  }`;

if (content.includes('const standardTotalForPreview = basePrice + areaPrice + roomsPrice;')) {
    content = content.replace(search, replace);
    fs.writeFileSync(file, content);
    console.log("Patched successfully");
} else {
    console.log("Could not find search string");
}
