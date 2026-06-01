import { SavedQuote, PricingSettings } from "./types";

export function generateQuoteEmailHtml(quote: SavedQuote, settings: PricingSettings, estimateUrl: string): string {
  // Ensure we have fallbacks
  const basePrice = settings.basePrice || 49;
  const pricePerSqFt = settings.pricePerSqFt || 0.08;
  const bedPrice = settings.bedPrice || 15;
  const bathPrice = settings.bathPrice || 25;
  const halfBathPrice = settings.halfBathPrice || 15;
  const rawExtras = settings.extras || {};

  const areaPrice = Math.round((quote.sqFt || 0) * pricePerSqFt);
  const roomsPrice =
    ((quote.beds || 0) * bedPrice) +
    ((quote.baths || 0) * bathPrice) +
    ((quote.halfBaths || 0) * halfBathPrice);

  const serviceNames: Record<string, string> = {
    residential: "Residential",
    deep: "Deep Clean",
    move: "Move In/Out",
    vacation: "Vacation/Airbnb",
    commercial: "Commercial",
    construction: "Post-Construction",
  };

  const serviceType = quote.serviceType || "residential";
  const displayService = serviceNames[serviceType] || "Residential";
  const displayFrequency = (quote.frequency || "one-time").toUpperCase();

  const generalCleaningList = [
    "Ceiling fans & light fixtures (dusted)",
    "Cobwebs removed",
    "Blinds, window sills, & lock ledges (dusted)",
    "Moldings & woodwork (dusted)",
    "Baseboards (dusted)",
    "Lamps & lampshades (dusted)",
    "Pictures & knick-knacks (dusted)",
    "Furniture (dusted & polished)",
    "Top of refrigerator (dusted)",
    "Outside of appliances cleaned",
    "Stovetop & drip pans scrubbed",
    "Counter tops & backsplashes (washed)",
    "All sinks (scrubbed/disinfected)",
    "Mirrors (Windexed)",
    "Tub/shower & tiles (scrubbed)",
    "All bathroom counters & fixtures (sanitized)",
    "Wastebaskets (emptied/washed/relined)",
    "Beds made, 1 set of sheets changed",
    "Stairs (vacuumed, wood dusted)",
    "Floors (vacuumed &/or mopped)"
  ];

  const serviceDescriptions: Record<string, string[]> = {
    residential: generalCleaningList,
    deep: generalCleaningList,
    move: generalCleaningList,
    vacation: generalCleaningList,
    commercial: generalCleaningList,
    construction: generalCleaningList
  };

  const selectedExtrasList = quote.selectedExtras || [];
  const additionalBeds = Math.max(0, (quote.beds || 0) - 1);
  const bedChangeCost = (quote.selectedExtras || []).includes('sheetChange') && additionalBeds > 0
    ? additionalBeds * (rawExtras.sheetChange || 10) 
    : 0;

  // Calculate extrasTotal ignoring sheetChange since we calculate it separately above, or add it to both and subtract.
  const extrasTotal = selectedExtrasList.reduce((sum, extra) => {
    if (extra === 'sheetChange') return sum; // Skip since we calculated it in bedChangeCost
    const cost = rawExtras[extra as keyof typeof rawExtras] || 0;
    return sum + cost;
  }, 0);

  let preDiscountTotal = quote.total || 0;
  let militaryDiscountAmount = 0;
  
  if (quote.manualDiscount) {
    preDiscountTotal += quote.manualDiscount;
  }
  
  if (quote.militaryDiscount) {
    preDiscountTotal = Math.round(preDiscountTotal / 0.9);
    militaryDiscountAmount = preDiscountTotal - ((quote.total || 0) + (quote.manualDiscount || 0));
  }

  const primaryServiceCost = Math.max(0, preDiscountTotal - extrasTotal - bedChangeCost);

  let totalEstimateVal = quote.total || 0;

  // Recurring Estimates
  const standardTotalForPreview = basePrice + areaPrice + roomsPrice;
  const weeklyPrice = Math.round(standardTotalForPreview * (settings.weeklyMultiplier || 0.8));
  const biWeeklyPrice = Math.round(standardTotalForPreview * (settings.biWeeklyMultiplier || 0.85));
  const monthlyPrice = Math.round(standardTotalForPreview * (settings.monthlyMultiplier || 0.9));

  // Build Included Items HTML (COMPACT FORMAT)
  const descriptionItems = serviceDescriptions[serviceType] || generalCleaningList;
  const includedListHtml = descriptionItems.map(
    (item) => `<span style="display: inline-block; padding-right: 8px; margin-bottom: 4px; font-size: 10px; color: #4b5563; line-height: 1.3;"><span style="color: #10b981; font-weight: bold; margin-right: 2px;">✓</span>${item}</span>`
  ).join("");

  // Build Extra list items
  let extrasRowsHtml = "";
  if (selectedExtrasList.length > 0) {
    extrasRowsHtml += `
      <tr>
        <td colspan="2" style="padding-top: 16px; padding-bottom: 4px;">
          <strong style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af;">Add-on Services</strong>
        </td>
      </tr>
    `;
    selectedExtrasList.forEach((extra) => {
      if (extra === 'sheetChange') return; // Handled separately
      const label = extra.replace(/([A-Z])/g, " $1").trim();
      const cost = rawExtras[extra as keyof typeof rawExtras] || 0;
      extrasRowsHtml += `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #4b5563; text-transform: capitalize;">
            ${label}
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; text-align: right; font-weight: 500; color: #111827;">
            $${cost}
          </td>
        </tr>
      `;
    });
  }

  if (bedChangeCost > 0) {
    extrasRowsHtml += `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #4b5563;">
          Sheet Change (Extra ${additionalBeds} ${additionalBeds === 1 ? 'bed' : 'beds'})
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; text-align: right; font-weight: 500; color: #111827;">
          $${bedChangeCost}
        </td>
      </tr>
    `;
  }

  // Build Recurring Box HTML
  let recurringBoxHtml = "";
  if (["residential", "deep"].includes(serviceType)) {
    recurringBoxHtml = `
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 18px; border-radius: 12px; margin-top: 24px;">
        <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: bold; color: #166534; text-transform: uppercase; letter-spacing: 0.05em;">Recurring Benefits & Discounts</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #15803d;">
          <tr>
            <td style="padding: 4px 0; font-weight: 500;">Weekly Plan (Save 20%)</td>
            <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #166534;">$${weeklyPrice} <span style="font-weight: normal; font-size: 10px;">/visit</span></td>
          </tr>
          <tr>
            <td style="padding: 6px 0 4px 0; font-weight: 500; border-top: 1px solid #dcfce7;">Bi-weekly Plan (Save 15%)</td>
            <td style="padding: 6px 0 4px 0; text-align: right; font-weight: bold; color: #166534; border-top: 1px solid #dcfce7;">$${biWeeklyPrice} <span style="font-weight: normal; font-size: 10px;">/visit</span></td>
          </tr>
          <tr>
            <td style="padding: 6px 0 0 0; font-weight: 500; border-top: 1px solid #dcfce7;">Monthly Plan (Save 10%)</td>
            <td style="padding: 6px 0 0 0; text-align: right; font-weight: bold; color: #166534; border-top: 1px solid #dcfce7;">$${monthlyPrice} <span style="font-weight: normal; font-size: 10px;">/visit</span></td>
          </tr>
        </table>
      </div>
    `;
  }

  const approveUrl = `https://webhook.infra-remakingautomacoes.cloud/webhook/estimateap?id=${encodeURIComponent(quote.id)}&customerName=${encodeURIComponent(quote.customerName || '')}&customerEmail=${encodeURIComponent(quote.customerEmail || '')}&total=${quote.total}&serviceType=${encodeURIComponent(serviceType)}&sqFt=${encodeURIComponent(quote.sqFt || 0)}&beds=${encodeURIComponent(quote.beds || 0)}&baths=${encodeURIComponent(quote.baths || 0)}&frequency=${encodeURIComponent(quote.frequency || 'one-time')}`;
  const rejectUrl = `https://webhook.infra-remakingautomacoes.cloud/webhook/estimaterj?id=${encodeURIComponent(quote.id)}&customerName=${encodeURIComponent(quote.customerName || '')}&customerEmail=${encodeURIComponent(quote.customerEmail || '')}&total=${quote.total}`;

  const estimateNo = quote.id !== "latest" ? quote.id.split("-")[0].toUpperCase() : Math.floor(100000 + Math.random() * 900000).toString();
  const validUntilStr = new Date(new Date(quote.date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Estimate Proposal - Star Cleaning SC</title>
  <style type="text/css">
    /* Outlook fix */
    table { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    a { text-decoration: none; }
    @media screen and (max-width: 600px) {
      .main-table { width: 100% !important; max-width: 100% !important; border-radius: 8px !important; }
      .pad-all { padding: 20px 15px !important; }
      .pad-side { padding: 0 15px 20px 15px !important; }
      .pad-top { padding-top: 20px !important; }
      .mobile-col { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; text-align: left !important; margin: 0 !important; }
      .mobile-pad { padding-left: 15px !important; padding-right: 15px !important; }
      .mobile-center { text-align: center !important; }
      .mobile-mb { margin-bottom: 20px !important; }
      .mobile-border { border-right: none !important; border-bottom: 1px solid #f3f4f6 !important; margin-bottom: 15px !important; padding-bottom: 15px !important; }
      .btn-approve { font-size: 18px !important; line-height: 56px !important; letter-spacing: 0.1em !important; box-shadow: 0 6px 18px rgba(16,185,129,0.35) !important; margin-bottom: 8px !important; }
      table { width: 100% !important; }
      .header-info { text-align: left !important; padding-top: 15px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" bgcolor="#f4f4f5" cellpadding="0" cellspacing="0" border="0" style="table-layout: fixed; width: 100%;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <!-- Wrapper container -->
        <!--[if mso]>
        <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
        <tr>
        <td align="center" valign="top">
        <![endif]-->
        <table class="main-table" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin: 0 auto;">
          <!-- Top Header Stripe -->
          <tr>
            <td height="6" style="background-color: #0369a1; font-size: 1px; line-height: 1px;">&nbsp;</td>
          </tr>
          
          <!-- Brand Logo and Header Info -->
          <tr>
            <td style="padding: 35px 35px 25px 35px;" class="pad-all">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="50%" valign="top" class="mobile-col mobile-center">
                    <img src="https://img1.wsimg.com/isteam/ip/97a5d835-7b16-4991-b3c6-3d6956b6b82b/ESBOC%CC%A7O-STAR-CLEANING_full.png" alt="Star Cleaning SC" width="130" style="display: block; border: 0; outline: none; max-width: 100%; margin: 0 auto;" />
                  </td>
                  <td width="50%" valign="top" style="text-align: right;" class="mobile-col header-info mobile-center">
                    <h1 style="margin: 0 0 5px 0; font-size: 24px; font-weight: 300; letter-spacing: 0.1em; color: #d4d4d8; text-transform: uppercase;">Estimate</h1>
                    <p style="margin: 0 0 3px 0; font-size: 12px; color: #71717a;"><strong style="color: #4b5563;">No.</strong> #${estimateNo}</p>
                    <p style="margin: 0; font-size: 12px; color: #71717a;"><strong style="color: #4b5563;">Date:</strong> ${new Date(quote.date).toLocaleDateString()}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer and Company Info Boxes -->
          <tr>
            <td style="padding: 0 35px 25px 35px;" class="pad-side">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fafafa; border-radius: 10px; border: 1px solid #f3f4f6;">
                <tr>
                  <!-- From -->
                  <td width="50%" valign="top" style="padding: 16px; border-right: 1px solid #f3f4f6;" class="mobile-col mobile-border">
                    <strong style="display: block; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 6px;">From</strong>
                    <strong style="display: block; font-size: 13px; color: #111827; margin-bottom: 4px;">Star Cleaning SC</strong>
                    <span style="font-size: 11px; line-height: 1.4; color: #4b5563; display: block;">
                      Charleston, South Carolina<br />
                      admin@starcleaningsc.com<br />
                      www.starcleaningsc.com
                    </span>
                  </td>
                  <!-- Prepared For -->
                  <td width="50%" valign="top" style="padding: 16px;" class="mobile-col">
                    <strong style="display: block; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 6px;">Prepared For</strong>
                    <strong style="display: block; font-size: 13px; color: #111827; margin-bottom: 4px;">${quote.customerName || "Valued Customer"}</strong>
                    <span style="font-size: 11px; line-height: 1.4; color: #4b5563; display: block;">
                      ${quote.customerPhone ? quote.customerPhone + "<br />" : ""}
                      ${quote.customerEmail ? quote.customerEmail + "<br />" : ""}
                      ${quote.customerAddress || ""}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Service Overview Heading -->
          <tr>
            <td style="padding: 0 35px 15px 35px;" class="pad-side">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 2px solid #111827; padding-bottom: 8px;">
                <tr>
                  <td valign="bottom" style="text-align: left;" class="mobile-col">
                    <strong style="display: block; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 4px;">Service Overview</strong>
                    <strong style="font-size: 16px; color: #0369a1; margin: 0; display: block;">${displayService} Cleaning</strong>
                    <span style="font-size: 11px; color: #71717a; display: block; margin-top: 4px;">Frequency: <b>${displayFrequency}</b></span>
                  </td>
                  <td valign="bottom" style="text-align: right; font-size: 12px; color: #4b5563;" class="mobile-col pad-top text-left">
                    <strong style="color: #111827;">${quote.sqFt}</strong> sq ft &nbsp;•&nbsp; <strong style="color: #111827;">${quote.beds}B / ${quote.baths + (quote.halfBaths || 0)}b</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Line Items Table -->
          <tr>
            <td style="padding: 0 35px 30px 35px;" class="pad-side">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                <tr>
                  <th align="left" style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af;">Description</th>
                  <th align="right" style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af;" width="30%">Amount</th>
                </tr>
                
                <!-- Main Service Item -->
                <tr>
                  <td valign="top" style="padding: 16px 0 16px 0; border-bottom: 1px solid #f3f4f6;">
                    <strong style="font-size: 14px; color: #111827; display: block; margin-bottom: 4px;">${displayService} Cleaning Package</strong>
                    <span style="font-size: 11px; color: #71717a; display: block; margin-bottom: 12px;">Detailed sanitize clean representing ${quote.sqFt} sq ft, ${quote.beds} Bedrooms, and ${quote.baths + (quote.halfBaths || 0)} Bathrooms.</span>
                    
                    <!-- What's Included Card -->
                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-top: 8px;">
                      <strong style="display: block; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 8px;">Our General Cleaning includes the following:</strong>
                      <div style="margin: 0; padding: 0;">
                        ${includedListHtml}
                      </div>
                    </div>
                  </td>
                  <td valign="top" align="right" style="padding: 16px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; font-weight: 500; color: #111827;">
                    $${primaryServiceCost}
                  </td>
                </tr>

                <!-- Extra Rows (if any) -->
                ${extrasRowsHtml}
              </table>
            </td>
          </tr>

          <!-- Pricing Totals & Recurring Box -->
          <tr>
            <td style="padding: 0 35px 35px 35px;" class="pad-side">
              
              <!--[if mso]>
              <table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
              <td width="${["residential", "deep"].includes(serviceType) ? "255" : "0"}" valign="top">
              <![endif]-->
              ${
                ["residential", "deep"].includes(serviceType)
                ? `
                <table class="mobile-col mobile-mb" align="left" width="48%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="top">
                      ${recurringBoxHtml}
                    </td>
                  </tr>
                </table>
                `
                : ""
              }
              <!--[if mso]>
              </td>
              <td width="${["residential", "deep"].includes(serviceType) ? "255" : "510"}" valign="top">
              <![endif]-->
              <table class="mobile-col" align="${["residential", "deep"].includes(serviceType) ? "right" : "center"}" width="${["residential", "deep"].includes(serviceType) ? "48%" : "100%"}" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="top" style="${["residential", "deep"].includes(serviceType) ? "padding-top: 24px;" : ""}">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px;">
                      <tr>
                        <td style="font-size: 12px; color: #71717a; padding-bottom: 8px;">${displayService} Clean Price</td>
                        <td align="right" style="font-size: 12px; font-weight: 500; color: #111827; padding-bottom: 8px;">$${primaryServiceCost}</td>
                      </tr>
                      ${
                        extrasTotal + bedChangeCost > 0
                          ? `
                      <tr>
                        <td style="font-size: 12px; color: #71717a; padding-bottom: 12px;">Add-ons & Extras</td>
                        <td align="right" style="font-size: 12px; font-weight: 500; color: #111827; padding-bottom: 12px;">+ $${
                          extrasTotal + bedChangeCost
                        }</td>
                      </tr>
                      `
                          : ""
                      }
                      ${
                        quote.militaryDiscount
                          ? `
                      <tr>
                        <td style="font-size: 12px; color: #16a34a; padding-bottom: 12px; font-weight: 500;">Military Discount (10%)</td>
                        <td align="right" style="font-size: 12px; font-weight: 500; color: #16a34a; padding-bottom: 12px;">- $${militaryDiscountAmount}</td>
                      </tr>
                      `
                          : ""
                      }
                      ${
                        quote.manualDiscount && quote.manualDiscount > 0
                          ? `
                      <tr>
                        <td style="font-size: 12px; color: #0284c7; padding-bottom: 12px; font-weight: 500;">Special Discount</td>
                        <td align="right" style="font-size: 12px; font-weight: 500; color: #0284c7; padding-bottom: 12px;">- $${quote.manualDiscount}</td>
                      </tr>
                      `
                          : ""
                      }
                      <tr>
                        <td style="border-top: 1px solid #e4e4e7; padding-top: 12px; font-size: 11px; font-weight: bold; color: #111827; text-transform: uppercase; letter-spacing: 0.05em;">Total Estimate</td>
                        <td align="right" style="border-top: 1px solid #e4e4e7; padding-top: 8px; font-size: 24px; font-weight: bold; color: #0369a1;">$${totalEstimateVal}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!--[if mso]>
              </td></tr></table>
              <![endif]-->
              
              <!-- Clearfix to ensure container height wraps floats -->
              <div style="clear:both;"></div>
            </td>
          </tr>

          <!-- Call to Action Box -->
          <tr>
            <td align="center" style="padding: 35px 35px; background-color: #f8fafc; border-top: 1px solid #edf2f7; text-align: center;" class="pad-all">
              <h2 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #0f172a;">Review & Respond to Your Proposal</h2>
              <p style="margin: 0 0 25px 0; font-size: 13px; color: #4b5563; line-height: 1.5;">Please accept or reject this estimate below. You can also customize your selection or add more options anytime through the interactive Client Portal link.</p>
              
              <!-- Decision Buttons Table -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; margin-bottom: 22px; width: 100%; max-width: 320px;">
                <tr>
                  <!-- Approve Button -->
                  <td align="center" style="padding-bottom: 12px;">
                    <a href="${approveUrl}" target="_blank" class="btn-approve" style="background-color: #10b981; border: 1px solid #059669; border-radius: 12px; color: #ffffff; display: block; font-family: sans-serif; font-size: 16px; font-weight: 800; line-height: 56px; text-align: center; text-decoration: none; width: 100%; box-shadow: 0 4px 12px rgba(16,185,129,0.3); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 auto; -webkit-text-size-adjust: none;">✓ APPROVE PROPOSAL</a>
                  </td>
                </tr>
                <tr>
                  <!-- Reject Button -->
                  <td align="center">
                    <a href="${rejectUrl}" target="_blank" style="color: #9ca3af; font-family: sans-serif; font-size: 13px; font-weight: 500; text-decoration: underline; -webkit-text-size-adjust: none;">✕ Reject Proposal</a>
                  </td>
                </tr>
              </table>

              <!-- Policies section -->
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 35px; border-top: 1px solid #f3f4f6; background-color: #fafafa;" class="pad-all">
              <strong style="display: block; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #111827; margin-bottom: 20px; font-weight: bold;">📌 Policies</strong>
              
              <strong style="display: block; font-size: 12px; color: #374151; margin-bottom: 8px;">❌ Cancellation Policy</strong>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #6b7280; line-height: 1.5;">We value the time of both our clients and cleaning technicians. To ensure smooth scheduling for everyone, we ask for proper notice for all cancellations or rescheduling.</p>
              <ul style="margin: 0 0 20px 0; padding: 0 0 0 16px; font-size: 11px; color: #71717a; line-height: 1.6;">
                <li style="margin-bottom: 4px;">Cancellations made less than 24 hours before the appointment will incur a $100 fee</li>
                <li style="margin-bottom: 4px;">Same-day cancellations are non-refundable</li>
                <li style="margin-bottom: 4px;">Deposits for cancellations made within 24 hours are non-refundable</li>
                <li style="margin-bottom: 4px;">If water or electricity is unavailable at the property, Star Cleaning may cancel the appointment and fees may still apply</li>
                <li style="margin-bottom: 4px;">Excessive trash, hazardous conditions, or unsafe environments may result in cancellation or additional charges</li>
              </ul>

              <strong style="display: block; font-size: 12px; color: #374151; margin-bottom: 8px;">💯 Satisfaction Guarantee</strong>
              <p style="margin: 0 0 20px 0; font-size: 11px; color: #6b7280; line-height: 1.5;">If you are not satisfied with your cleaning, please notify us within 24–48 hours after the service. We will gladly return to address any issues or perform necessary touch-ups.</p>
              
              <strong style="display: block; font-size: 12px; color: #374151; margin-bottom: 8px;">🔁 Rescheduling Policy</strong>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #6b7280; line-height: 1.5;">Appointments may be rescheduled without penalty if notice is given at least 24 hours in advance, subject to availability.</p>
              
              <p style="margin: 0; font-size: 11px; color: #4b5563; line-height: 1.5; font-style: italic;">By booking with Star Cleaning, the client acknowledges and agrees to these terms.</p>
            </td>
          </tr>
          
          <!-- Bottom Footer -->
          <tr>
            <td align="center" style="padding: 25px 35px 35px 35px; background-color: #ffffff; text-align: center; border-top: 1px solid #f3f4f6;" class="pad-all">
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #9ca3af;">Thank you for choosing Star Cleaning SC! We look forward to shining for you.</p>
              <p style="margin: 0; font-size: 10px; color: #d4d4d8;">&copy; ${new Date().getFullYear()} Star Cleaning SC. All rights reserved.</p>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}
