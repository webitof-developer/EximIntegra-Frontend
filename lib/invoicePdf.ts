import { jsPDF } from "jspdf";

export interface InvoicePdfData {
  invoiceNumber: string;
  amount: number;
  currency: string;
  createdAt?: string;
  planId?: string;
  billingCycle?: string;
  customerName?: string;
  customerEmail?: string;
  organizationName?: string;
  gstin?: string;
  billingEmail?: string;
  adminCompany?: string;
  adminEmail?: string;
  paymentGateway?: string;
  paymentStatus?: string;
}

/**
 * Helper to fetch a public image asset and convert to a base64 Data URL.
 */
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    if (typeof window === "undefined") return null;
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateInvoicePdf(data: InvoicePdfData): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const isINR = data.currency === "INR";
  const currencyCode = isINR ? "INR" : "USD";
  const symbol = isINR ? "INR " : "USD ";
  const rawAmt = Number(data.amount) || 0;
  // Normalize if raw amount was in paise/cents
  const totalAmount = rawAmt > 100000 ? Math.round(rawAmt / 100) : rawAmt;

  // Tax calculations (18% GST for INR, Zero rated for USD export)
  const taxableAmount = isINR ? Math.round((totalAmount / 1.18) * 100) / 100 : totalAmount;
  const totalGst = isINR ? Math.round((totalAmount - taxableAmount) * 100) / 100 : 0;
  const cgst = isINR ? Math.round((totalGst / 2) * 100) / 100 : 0;
  const sgst = cgst;

  const invoiceDate = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const adminCompany = data.adminCompany || "EximIntegra HQ";
  const adminEmail = data.adminEmail || "admin@eximintegra.co";
  const paymentGateway = data.paymentGateway || "Razorpay";
  const paymentStatus = data.paymentStatus || "PAID";

  // ---------------------------------------------------------------------------
  // 1. Header with Logo & Invoice Title
  // ---------------------------------------------------------------------------
  // Try loading official EximIntegra logo
  const logoData = await fetchImageAsBase64("/eximintegra-logo-without-bg-name.png");
  if (logoData) {
    // 3:1 aspect ratio: 54mm wide x 18mm high
    doc.addImage(logoData, "PNG", 15, 12, 54, 18);
  } else {
    // Elegant typographic fallback if image fetch fails
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // #0F172A
    doc.text("EximIntegra", 15, 23);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("TRADE INTELLIGENCE & LANDED COST PLATFORM", 15, 28);
  }

  // Right Header: TAX INVOICE & PAID pill
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // #0F172A
  doc.text("TAX INVOICE", 195, 21, { align: "right" });

  // Emerald "PAID" Status Badge
  doc.setFillColor(236, 253, 245); // #ECFDF5 light emerald
  doc.setDrawColor(167, 243, 208); // #A7F3D0 border
  doc.setLineWidth(0.3);
  doc.roundedRect(171, 25, 24, 6.5, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(5, 150, 105); // #059669
  doc.text("PAID", 183, 29.5, { align: "center" });

  // Divider Line
  doc.setDrawColor(226, 232, 240); // #E2E8F0
  doc.setLineWidth(0.4);
  doc.line(15, 34, 195, 34);

  // ---------------------------------------------------------------------------
  // 2. Two-Column Information Cards: ISSUED BY & INVOICE DETAILS
  // ---------------------------------------------------------------------------
  const cardY = 39;
  const cardHeight = 31;
  const colWidth = 87;

  // --- Left Card: ISSUED BY ---
  doc.setFillColor(248, 250, 252); // #F8FAFC
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, cardY, colWidth, cardHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // #64748B
  doc.text("ISSUED BY", 20, cardY + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Company: ${adminCompany}`, 20, cardY + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Email: ${adminEmail}`, 20, cardY + 22);

  // --- Right Card: INVOICE DETAILS ---
  const rightColX = 108;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightColX, cardY, colWidth, cardHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("INVOICE DETAILS", rightColX + 5, cardY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice No:`, rightColX + 5, cardY + 13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${data.invoiceNumber}`, rightColX + 35, cardY + 13);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice Date:`, rightColX + 5, cardY + 18.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${invoiceDate}`, rightColX + 35, cardY + 18.5);

  doc.setTextColor(71, 85, 105);
  doc.text(`Payment Gateway:`, rightColX + 5, cardY + 24);
  doc.setTextColor(15, 23, 42);
  doc.text(`${paymentGateway}`, rightColX + 35, cardY + 24);

  doc.setTextColor(71, 85, 105);
  doc.text(`Payment Status:`, rightColX + 5, cardY + 29.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(5, 150, 105);
  doc.text(`${paymentStatus}`, rightColX + 35, cardY + 29.5);

  // ---------------------------------------------------------------------------
  // 3. BILLED TO / CUSTOMER DETAILS
  // ---------------------------------------------------------------------------
  const billedY = 74;
  const billedHeight = 24;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, billedY, 180, billedHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("BILLED TO / CUSTOMER DETAILS", 20, billedY + 6.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const orgName = data.organizationName || "Registered Enterprise Customer";
  const custName = data.customerName || data.customerEmail || "Authorized Account Holder";
  const gstin = data.gstin ? data.gstin : "Not Provided (Consumer / Unregistered)";
  const bEmail = data.billingEmail || data.customerEmail || "N/A";

  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`Organization:`, 20, billedY + 13);
  doc.setFont("helvetica", "normal");
  doc.text(`${orgName}`, 45, billedY + 13);

  doc.setFont("helvetica", "bold");
  doc.text(`Contact:`, 20, billedY + 19);
  doc.setFont("helvetica", "normal");
  doc.text(`${custName} (${bEmail})`, 45, billedY + 19);

  doc.setFont("helvetica", "bold");
  doc.text(`Customer GSTIN:`, 115, billedY + 13);
  doc.setFont("helvetica", "normal");
  doc.text(`${gstin}`, 145, billedY + 13);

  // ---------------------------------------------------------------------------
  // 4. Particulars Table
  // ---------------------------------------------------------------------------
  const tableY = 104;
  const tableHeadHeight = 8.5;

  // Table Header Background (Professional Slate Navy #0F172A)
  doc.setFillColor(15, 23, 42);
  doc.rect(15, tableY, 180, tableHeadHeight, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("ITEM / SUBSCRIPTION DESCRIPTION", 20, tableY + 5.5);
  doc.text("BILLING TERM", 105, tableY + 5.5);
  doc.text("TAXABLE AMT", 155, tableY + 5.5, { align: "right" });
  doc.text("TOTAL AMOUNT", 190, tableY + 5.5, { align: "right" });

  // Table Row Content
  const rowY = tableY + tableHeadHeight;
  const rowHeight = 12;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, rowY, 180, rowHeight, "FD");

  const planTitle = `${(data.planId || "Platform").toUpperCase()} Tier Subscription`;
  const cycleTitle = (data.billingCycle || "Monthly").toUpperCase();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(planTitle, 20, rowY + 7.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(cycleTitle, 105, rowY + 7.5);
  doc.text(
    `${symbol}${taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    155,
    rowY + 7.5,
    { align: "right" }
  );

  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(
    `${symbol}${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    190,
    rowY + 7.5,
    { align: "right" }
  );

  // ---------------------------------------------------------------------------
  // 5. Tax Breakdown & Summary Section
  // ---------------------------------------------------------------------------
  let sumY = rowY + rowHeight + 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text("Taxable Value:", 135, sumY);
  doc.setTextColor(15, 23, 42);
  doc.text(`${symbol}${taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, sumY, { align: "right" });

  if (isINR) {
    sumY += 6;
    doc.setTextColor(71, 85, 105);
    doc.text("CGST @ 9.0%:", 135, sumY);
    doc.setTextColor(15, 23, 42);
    doc.text(`${symbol}${cgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, sumY, { align: "right" });

    sumY += 6;
    doc.setTextColor(71, 85, 105);
    doc.text("SGST @ 9.0%:", 135, sumY);
    doc.setTextColor(15, 23, 42);
    doc.text(`${symbol}${sgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, sumY, { align: "right" });

    sumY += 6;
    doc.setTextColor(71, 85, 105);
    doc.text("Total GST (18.0%):", 135, sumY);
    doc.setTextColor(15, 23, 42);
    doc.text(`${symbol}${totalGst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, sumY, { align: "right" });
  } else {
    sumY += 6;
    doc.setTextColor(71, 85, 105);
    doc.text("Export of Services (0%):", 135, sumY);
    doc.setTextColor(15, 23, 42);
    doc.text(`${symbol}0.00`, 190, sumY, { align: "right" });
  }

  // Grand Total Box
  sumY += 8;
  doc.setFillColor(239, 246, 255); // #EFF6FF light blue
  doc.setDrawColor(37, 99, 235); // #2563EB
  doc.setLineWidth(0.4);
  doc.roundedRect(125, sumY - 5, 70, 11, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 64, 175); // #1E40AF
  doc.text("Total Amount Paid:", 130, sumY + 2);
  doc.text(`${symbol}${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, sumY + 2, { align: "right" });

  // ---------------------------------------------------------------------------
  // 6. Footer & Digital Signature
  // ---------------------------------------------------------------------------
  const footerDividerY = 240;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(15, footerDividerY, 195, footerDividerY);

  const footerY = footerDividerY + 6;
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("TERMS & COMPLIANCE NOTES:", 15, footerY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("1. This is a computer-generated GST Tax Invoice issued under Section 31 of CGST Act, 2017.", 15, footerY + 5);
  doc.text("2. Subscription fees are billed in advance and activate SaaS services immediately upon payment confirmation.", 15, footerY + 9);
  doc.text("3. Input Tax Credit (ITC) can be claimed against the Customer GSTIN reflected in monthly GSTR-2B filings.", 15, footerY + 13);

  // Digital Signatory Box (Right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`For ${adminCompany}`, 195, footerY + 5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Authorized Signatory (Digital Seal)", 195, footerY + 10, { align: "right" });
  doc.text("Digitally signed & verified via EximIntegra Finance", 195, footerY + 14, { align: "right" });

  // ---------------------------------------------------------------------------
  // 7. Save and trigger browser download
  // ---------------------------------------------------------------------------
  doc.save(`${data.invoiceNumber || "Invoice"}.pdf`);
}
