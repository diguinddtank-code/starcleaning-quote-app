import re

with open('./app/kpi/page.tsx', 'r') as f:
    content = f.read()

content = content.replace(
"""  const conversionRate = totalLeads === 0 ? 0 : Math.round((scheduledCount / totalLeads) * 100);""",
"""  const conversionRate = totalLeads === 0 ? 0 : Math.round((scheduledCount / totalLeads) * 100);

  const referralLeads = createdLeads.filter(l => l.is_referral);
  const internetLeads = createdLeads.filter(l => !l.is_referral);
  const referralCount = referralLeads.length;
  const internetCount = internetLeads.length;

  const referralScheduled = referralLeads.filter(l => {
    const s = l.ETAPA?.toLowerCase() || '';
    return s.includes('agendado') || s.includes('scheduling') || s.includes('closing') || s.includes('fechado') || s.includes('agendou');
  }).length;

  const internetScheduled = internetLeads.filter(l => {
    const s = l.ETAPA?.toLowerCase() || '';
    return s.includes('agendado') || s.includes('scheduling') || s.includes('closing') || s.includes('fechado') || s.includes('agendou');
  }).length;

  const referralConversion = referralCount === 0 ? 0 : Math.round((referralScheduled / referralCount) * 100);
  const internetConversion = internetCount === 0 ? 0 : Math.round((internetScheduled / internetCount) * 100);"""
)

with open('./app/kpi/page.tsx', 'w') as f:
    f.write(content)
