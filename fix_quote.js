const fs = require('fs');
const file = 'components/QuoteDocument.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldSnippet = `  // Calculate standard total for recurring preview exactly like estimate/page.tsx
  const standardTotalForPreview = settings.basePrice + areaPrice + roomsPrice;
  const weeklyPrice = Math.round(standardTotalForPreview * (settings.weeklyMultiplier || 0.8));
  const biWeeklyPrice = Math.round(standardTotalForPreview * (settings.biWeeklyMultiplier || 0.85));
  const monthlyPrice = Math.round(standardTotalForPreview * (settings.monthlyMultiplier || 0.9));`;

const newSnippet = `  let weeklyPrice = 0;
  let biWeeklyPrice = 0;
  let monthlyPrice = 0;

  const matchingTiers = settings.quoteTiers?.filter(t => t.name === serviceType) || [];
  let tier = null;
  if (matchingTiers.length > 0) {
    tier = matchingTiers.reduce((prev, curr) => 
      Math.abs(curr.maxSqft - (quote.sqFt || 0)) < Math.abs(prev.maxSqft - (quote.sqFt || 0)) ? curr : prev
    );
  }

  if (tier) {
    weeklyPrice = tier.recurring.weekly.max;
    biWeeklyPrice = tier.recurring.biWeekly.max;
    monthlyPrice = tier.recurring.monthly.max;
  } else {
    const standardTotalForPreview = settings.basePrice + areaPrice + roomsPrice;
    weeklyPrice = Math.round(standardTotalForPreview * (settings.weeklyMultiplier || 0.8));
    biWeeklyPrice = Math.round(standardTotalForPreview * (settings.biWeeklyMultiplier || 0.85));
    monthlyPrice = Math.round(standardTotalForPreview * (settings.monthlyMultiplier || 0.9));
  }`;

content = content.replace(oldSnippet, newSnippet);
fs.writeFileSync(file, content);
console.log('done');
