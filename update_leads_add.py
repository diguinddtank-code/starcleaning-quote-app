import re

with open('./app/leads/page.tsx', 'r') as f:
    content = f.read()

content = content.replace(
"""        REMINDER_DATE: newLeadForm.REMINDER_DATE || ''
      });""",
"""        REMINDER_DATE: newLeadForm.REMINDER_DATE || '',
        is_referral: newLeadForm.is_referral || false
      });"""
)

with open('./app/leads/page.tsx', 'w') as f:
    f.write(content)
