with open('./components/QuoteDocument.tsx', 'r') as f:
    content = f.read()

content = content.replace(
"""    '': 'Not Selected',
    residential: 'Residential',
    deep: 'Deep Clean',
    move: 'Move In/Out',""",
"""    '': 'Not Selected',
    residential: 'Residential',
    deep: 'Deep Clean',
    ttb: 'Top to Bottom',
    move: 'Move In/Out',"""
)

content = content.replace(
"""    residential: ["General dusting & wipe down of surfaces", "Vacuum & mop all accessible floors", "Kitchen counters & exterior of appliances", "Full bathroom sanitization", "Empty small trash bins"],
    deep: ["Everything in Residential, PLUS:", "Baseboards & window sills wiped", "Ceiling fans & light fixtures dusted", "Extra scrubbing in high-traffic bathrooms", "Heavy dusting & cobweb removal"],
    move: ["Everything in Deep Clean, PLUS:", "Inside all empty cabinets and drawers", "Inside all empty closets", "Inside & behind appliances (if moved)"],""",
"""    residential: ["General dusting & wipe down of surfaces", "Vacuum & mop all accessible floors", "Kitchen counters & exterior of appliances", "Full bathroom sanitization", "Empty small trash bins"],
    deep: ["Everything in Residential, PLUS:", "Detailed scrubbing of kitchen and bathrooms", "Dusting reachable surfaces", "Sanitizing high touch areas"],
    ttb: ["Everything in Deep Clean, PLUS:", "Baseboards & window sills wiped by hand", "Ceiling fans & light fixtures dusted", "Extra scrubbing in high-traffic bathrooms", "Heavy dusting & cobweb removal"],
    move: ["Everything in TTB, PLUS:", "Inside all empty cabinets and drawers", "Inside all empty closets", "Inside & behind appliances (if moved)"],"""
)

with open('./components/QuoteDocument.tsx', 'w') as f:
    f.write(content)
