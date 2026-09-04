const fs = require('fs');
const file = 'app/kpi/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldSnippet = `  const stageData = Object.entries(stageDataMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value);`;

const newSnippet = `  const stageData = Object.entries(stageDataMap as Record<string, number>)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value);`;

content = content.replace(oldSnippet, newSnippet);
fs.writeFileSync(file, content);
console.log('done');
