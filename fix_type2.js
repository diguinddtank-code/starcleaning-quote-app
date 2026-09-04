const fs = require('fs');
const file = 'app/kpi/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldSnippet = `  const timeData = Object.entries(timeMap)
    .filter(([key]) => key !== 'Unknown')
    .map(([name, data]) => ({ name, Leads: data.Leads, ClosedLeads: data.ClosedLeads, _date: data._date }))
    .sort((a, b) => a._date.getTime() - b._date.getTime());`;

const newSnippet = `  const timeData = Object.entries(timeMap as Record<string, { Leads: number; ClosedLeads: number; _date: Date }>)
    .filter(([key]) => key !== 'Unknown')
    .map(([name, data]) => ({ name, Leads: data.Leads, ClosedLeads: data.ClosedLeads, _date: data._date }))
    .sort((a, b) => a._date.getTime() - b._date.getTime());`;

content = content.replace(oldSnippet, newSnippet);
fs.writeFileSync(file, content);
console.log('done');
