import re

with open('./context/QuoteContext.tsx', 'r') as f:
    content = f.read()

content = content.replace(
"""         if (quote.serviceType === 'deep') total = detail.deep.max;
         else if (quote.serviceType === 'move') total = detail.moveInOut.max;""",
"""         if (quote.serviceType === 'ttb') total = detail.deep.max;
         else if (quote.serviceType === 'deep') total = detail.general.max;
         else if (quote.serviceType === 'move') total = detail.moveInOut.max;"""
)

content = content.replace(
"""      if (quote.serviceType === 'deep') total *= settings.deepCleanMultiplier;
      else if (quote.serviceType === 'move') total *= settings.moveInOutMultiplier;""",
"""      if (quote.serviceType === 'ttb') total *= settings.deepCleanMultiplier;
      else if (quote.serviceType === 'deep') total *= 1.2;
      else if (quote.serviceType === 'move') total *= settings.moveInOutMultiplier;"""
)

with open('./context/QuoteContext.tsx', 'w') as f:
    f.write(content)
