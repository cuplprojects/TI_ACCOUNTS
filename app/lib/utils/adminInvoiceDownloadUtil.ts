import { showErrorToast, showSuccessToast } from "@/app/lib/swalConfig";
import { getCarrierName } from "@/app/lib/services/admin/shippingCarrierService";

/**
 * Download invoice PDF directly for admin
 */
export const downloadAdminInvoice = async (orderId: string) => {
  try {
    const { getInvoiceData: adminGetInvoiceData, createInvoice: adminCreateInvoice, getOrder } = await import("@/app/lib/services/admin/orderService");

    // Get order to fetch payment currency
    const order = await getOrder(orderId);
    const paymentCurrency = order?.Payment?.currency || "INR";

    // Get invoice data
    let invoiceData = await adminGetInvoiceData(orderId);
    
    if (!invoiceData) {
      // Try to create invoice first
      await adminCreateInvoice(orderId);
      invoiceData = await adminGetInvoiceData(orderId);
    }

    if (!invoiceData) {
      showErrorToast("Failed to load invoice data");
      return;
    }

    // Update invoice data with payment currency
    if (invoiceData.invoice) {
      invoiceData.invoice.currency = paymentCurrency;
    }

    // Generate and download PDF
    await generateAdminPDF(invoiceData);
    showSuccessToast("Invoice downloaded successfully");
  } catch (error) {
    console.error("Error downloading invoice:", error);
    showErrorToast("Failed to download invoice. Please try again.");
  }
};

/**
 * Generate and download PDF for admin invoice
 */
const generateAdminPDF = async (invoiceData: any) => {
  try {
    const html2canvas = await import("html2canvas");
    const jsPDF = await import("jspdf");

    // Debug: Log the invoice data structure
    console.log("Invoice data structure:", {
      company: invoiceData?.company,
      invoice: invoiceData?.invoice,
      products: invoiceData?.products,
      totals: invoiceData?.totals,
    });

    // Build HTML
    const htmlContent = buildAdminInvoiceHTML(invoiceData);
    console.log("Generated HTML length:", htmlContent.length);

    // Create a temporary container with proper A4 styling
    const tempContainer = document.createElement("div");
    tempContainer.style.width = "210mm";
    tempContainer.style.margin = "0";
    tempContainer.style.padding = "0";
    tempContainer.innerHTML = htmlContent;
    document.body.appendChild(tempContainer);

    // Wait for content to render
    await new Promise(resolve => setTimeout(resolve, 500));

    // Convert to canvas
    const canvas = await html2canvas.default(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 0,
      windowWidth: 794, // A4 width in pixels at 96 DPI
      windowHeight: 1123, // A4 height in pixels at 96 DPI
    });

    console.log("Canvas created:", { width: canvas.width, height: canvas.height });

    // Get dimensions
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF.jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Convert canvas to image
    const imgData = canvas.toDataURL("image/jpeg", 0.98);

    // Add image to PDF
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= 297; // A4 height in mm

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }

    // Download
    const invoiceNumber = invoiceData?.invoice?.number || "invoice";
    pdf.save(`${invoiceNumber}.pdf`);

    // Cleanup
    document.body.removeChild(tempContainer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};




/**
 * Get currency symbol from currency code
 */
const getCurrencySymbol = (currencyCode: string): string => {
  const symbols: { [key: string]: string } = {
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'JPY': '¥',
    'INR': '₹',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'AED': 'د.إ',
    'NZD': 'NZ$'
  };
  return symbols[currencyCode] || currencyCode;
};

/**
 * Build admin invoice HTML with exact template for multi-page printing
 */
const buildAdminInvoiceHTML = (invoiceData: any): string => {
  const company = invoiceData?.company || {};
  const invoice = invoiceData?.invoice || {};
  const billTo = invoiceData?.billTo || {};
  const shipTo = invoiceData?.shipTo || {};
  const products = invoiceData?.products || [];
  const totals = invoiceData?.totals || {};
  const shipping = invoiceData?.shipping || {};

  // Get currency symbol
  const currencySymbol = getCurrencySymbol(invoice.currency || 'EUR');

  // Build product rows with variant support
  const productRows = products.map((product: any, index: number) => {
    const capitalizeVariant = (str: string) => str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const variant = product.variant ? `<div class="item-variant">${capitalizeVariant(product.variant)}</div>` : '';
    return `<tr><td class="center">${index + 1}</td><td class="desc"><div class="item-name">${product.description || '-'}</div>${variant}</td><td>${product.hsnCode || '-'}</td><td class="center">${product.quantity || '0'}</td><td class="right">${currencySymbol} ${parseFloat(product.rate || 0).toFixed(2)}</td><td class="right">${currencySymbol} ${parseFloat(product.amount || 0).toFixed(2)}</td></tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice - ${invoice.number || 'Invoice'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --paper: #ffffff;
      --bg: #f3f3f3;
      --text: #111111;
      --muted: #6e6e6e;
      --line: #e5e5e5;
      --soft: #fafafa;
      --brand: #0b5e86;
    }
    * {
      box-sizing: border-box;
      min-width: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: var(--bg);
      color: var(--text);
      font-family: "Poppins", sans-serif;
      width: 100%;
      height: 100%;
    }
    .page {
      width: 210mm;
      height: auto;
      margin: 0 auto;
      background: var(--paper);
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.05);
      overflow: visible;
      page-break-after: always;
    }
    .invoice {
      padding: 10mm 10mm 10mm 10mm;
      overflow: visible;
      height: auto;
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
      gap: 16px;
    }
    .invoice-label, .original-copy {
      font-family: "Montserrat", sans-serif;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 1.2px;
      color: #666;
      text-transform: uppercase;
      flex-shrink: 0;
    }
    .original-copy {
      text-align: right;
    }
    .header-main {
      display: grid;
      grid-template-columns: 1.4fr 0.6fr;
      gap: 24px;
      align-items: start;
      margin-bottom: 16px;
    }
    .company-left {
      overflow: hidden;
    }
    .company-left h1 {
      margin: 0 0 8px;
      font-family: "Montserrat", sans-serif;
      font-size: 24px;
      line-height: 1.08;
      font-weight: 800;
      color: var(--brand);
      text-transform: uppercase;
      letter-spacing: 0;
      white-space: normal;
      overflow-wrap: break-word;
      word-break: break-word;
    }
    .company-lines div {
      font-size: 13px;
      line-height: 1.65;
      color: var(--text);
      margin-bottom: 2px;
      font-weight: 500;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .company-lines strong {
      font-weight: 700;
    }
    .logo-right {
      min-height: 120px;
      display: flex;
      justify-content: flex-end;
      align-items: flex-start;
      overflow: hidden;
    }
    .logo-right img {
      width: 100%;
      max-width: 230px;
      max-height: 100px;
      object-fit: contain;
      object-position: center right;
      display: block;
    }
    .logo-placeholder {
      width: 230px;
      height: 100px;
      border: 1px dashed #dddddd;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Montserrat", sans-serif;
      font-size: 14px;
      letter-spacing: 1px;
      color: #9a9a9a;
      text-transform: uppercase;
      overflow: hidden;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      margin-bottom: 16px;
      overflow: hidden;
    }
    .meta-box {
      padding: 12px 10px;
      border-right: 1px solid var(--line);
      min-height: 74px;
      overflow: hidden;
    }
    .meta-box:last-child {
      border-right: none;
    }
    .meta-label {
      font-family: "Montserrat", sans-serif;
      font-size: 10px;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 5px;
      line-height: 1.2;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .meta-value {
      font-size: 13px;
      font-weight: 700;
      line-height: 1.45;
      color: var(--text);
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .meta-value.nowrap {
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .address-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-bottom: 16px;
    }
    .address-card {
      border: 1px solid var(--line);
      padding: 14px;
      background: #fff;
      min-height: 110px;
      overflow: hidden;
    }
    .address-title {
      font-family: "Montserrat", sans-serif;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 10px;
      color: #444;
    }
    .address-card p {
      margin: 0;
      font-size: 13px;
      line-height: 1.7;
      color: #222;
      font-weight: 500;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .shipping-grid {
      display: grid;
      grid-template-columns: 0.9fr 1fr 1fr 1.1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }
    .shipping-card {
      border: 1px solid var(--line);
      padding: 12px;
      background: var(--soft);
      min-height: 78px;
      overflow: hidden;
    }
    .shipping-label {
      font-family: "Montserrat", sans-serif;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--muted);
      margin-bottom: 5px;
      line-height: 1.2;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .shipping-value {
      font-size: 13px;
      font-weight: 700;
      line-height: 1.45;
      color: var(--text);
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .shipping-value.nowrap {
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .table-wrap {
      border: 1px solid var(--line);
      overflow: hidden;
      margin-bottom: 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    thead th {
      font-family: "Montserrat", sans-serif;
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      text-align: left;
      color: #666;
      padding: 12px 10px;
      border-bottom: 1px solid var(--line);
      background: #fff;
    }
    tbody td {
      font-size: 13px;
      font-weight: 500;
      color: #222;
      padding: 12px 10px;
      border-bottom: 1px solid #f0f0f0;
      vertical-align: top;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    tbody tr:last-child td {
      border-bottom: none;
    }
    .desc {
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .desc .item-name {
      font-weight: 600;
      color: #222;
      line-height: 1.5;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .desc .item-variant {
      font-size: 12px;
      font-weight: 500;
      color: #666;
      line-height: 1.45;
      margin-top: 2px;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .center {
      text-align: center;
    }
    .right {
      text-align: right;
      white-space: nowrap;
      font-weight: 600;
    }
    .bottom-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 18px;
      margin-bottom: 20px;
    }
    .notes-box, .totals-box {
      border: 1px solid var(--line);
      padding: 14px;
      background: #fff;
      overflow: hidden;
    }
    .notes-title {
      font-family: "Montserrat", sans-serif;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 10px;
      color: #444;
    }
    .notes-box p {
      margin: 0 0 8px;
      font-size: 13px;
      line-height: 1.7;
      font-weight: 500;
      color: #333;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .notes-box p:last-child {
      margin-bottom: 0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
    }
    .total-row:last-child {
      border-bottom: none;
    }
    .total-label {
      color: #444;
      font-weight: 500;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .total-value {
      color: #111;
      font-weight: 700;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .grand-total {
      margin-top: 4px;
      padding-top: 12px;
      border-top: 1px solid var(--line);
    }
    .grand-total .total-label, .grand-total .total-value {
      font-family: "Montserrat", sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: var(--text);
    }
    .amount-words {
      margin-top: 14px;
      padding: 12px;
      background: #fafafa;
      border: 1px solid #f1f1f1;
      font-size: 12.5px;
      line-height: 1.6;
      color: #333;
      font-weight: 600;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .footer {
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
      border-top: 1px solid var(--line);
      margin-top: auto;
      padding-bottom: 10px;
    }
    .footer-note {
      font-size: 11px;
      line-height: 1.4;
      color: #333;
      font-weight: 500;
      max-width: 60%;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .signature-box {
      width: 180px;
      min-height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .signature-box img {
      max-width: 100%;
      max-height: 85px;
      object-fit: contain;
      object-position: right bottom;
      display: block;
    }
    .signature-placeholder {
      width: 220px;
      height: 80px;
      border: 1px dashed #dddddd;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Montserrat", sans-serif;
      font-size: 12px;
      color: #9a9a9a;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      overflow: hidden;
      background: #fafafa;
    }
    @page {
      size: A4;
      margin: 0;
    }
    @media print {
      html, body {
        background: #fff;
      }
      .page {
        width: 210mm;
        min-height: 297mm;
        margin: 0;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="invoice">
      <div class="header-top">
        <div class="invoice-label">Invoice</div>
        <div class="original-copy">Original for Recipient</div>
      </div>
      
      <div class="header-main">
        <div class="company-left">
          <h1>${company.name || 'COMPANY NAME'}</h1>
          <div class="company-lines">
            <div><strong>LUT</strong> ${company.lut || 'AD271025004195I'} <strong>YEAR</strong> FY ${new Date().getFullYear()}-${new Date().getFullYear() + 1}</div>
            <div><strong>GSTIN</strong> ${company.gstin || '-'} <strong>PAN</strong> ${company.iecPan || '-'}</div>
            <div>${company.address || '-'}</div>
            <div>Mobile <strong>${company.contact || '-'}</strong> | Email <strong>${company.email || '-'}</strong></div>
          </div>
        </div>
        <div class="logo-right">
          <img src="/images/invoice/Logo_Totallyindian.png" alt="Company Logo" />
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-box">
          <div class="meta-label">Invoice No.</div>
          <div class="meta-value nowrap">${invoice.number || '-'}</div>
        </div>
        <div class="meta-box">
          <div class="meta-label">Invoice Date</div>
          <div class="meta-value">${invoice.date || '-'}</div>
        </div>
        <div class="meta-box">
          <div class="meta-label">Order Ref</div>
          <div class="meta-value">${invoice.orderNumber || invoice.orderRef || '-'}</div>
        </div>
        <div class="meta-box">
          <div class="meta-label">Currency</div>
          <div class="meta-value">${invoice.currency || 'GBP'}</div>
        </div>
        <div class="meta-box">
          <div class="meta-label">Terms of Trade</div>
          <div class="meta-value">FOB</div>
        </div>
        <div class="meta-box">
          <div class="meta-label">Export Type</div>
          <div class="meta-value">LUT</div>
        </div>
      </div>

      <div class="address-grid">
        <div class="address-card">
          <div class="address-title">Customer Details</div>
          <p>${billTo.name || '-'}</p>
        </div>
        <div class="address-card">
          <div class="address-title">Billing Address</div>
          <p>${billTo.address1 || '-'}<br>${billTo.address2 || '-'}</p>
        </div>
        <div class="address-card">
          <div class="address-title">Shipping Address</div>
          <p>${shipTo.address1 || '-'}<br>${shipTo.address2 || '-'}</p>
        </div>
      </div>

      <div class="shipping-grid">
        <div class="shipping-card">
          <div class="shipping-label">Place of Supply</div>
          <div class="shipping-value">${shipping.countryOfSupply || '-'}</div>
        </div>
        <div class="shipping-card">
          <div class="shipping-label">Port of Lading</div>
          <div class="shipping-value nowrap">${shipping.port || '-'}</div>
        </div>
        <div class="shipping-card">
          <div class="shipping-label">Logistics</div>
          <div class="shipping-value">${getCarrierName(shipping.logistics) || '-'}</div>
        </div>
        <div class="shipping-card">
          <div class="shipping-label">Airway Bill</div>
          <div class="shipping-value nowrap">${shipping.airwayBill || '-'}</div>
        </div>
        <div class="shipping-card">
          <div class="shipping-label">Shipping Bill #</div>
          <div class="shipping-value">${shipping.shippingBill || '-'}</div>
        </div>
      </div>



      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width: 6%;">#</th>
              <th style="width: 40%;">Item Description</th>
              <th style="width: 14%;">HSN Code</th>
              <th style="width: 12%;" class="center">Qty (Pcs)</th>
              <th style="width: 14%;" class="right">Unit Price</th>
              <th style="width: 14%;" class="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>
      </div>

      <div class="bottom-grid">
        <div class="notes-box">
          <div class="notes-title">Notes & Terms</div>
          <p>Supply meant for export under bond or letter of undertaking without payment of Integrated Tax.</p>
          <p>Shipping Policy: ${company.shippingPolicy || 'https://totallyindian.com/policies/shippingpolicy'}</p>
          <p>Cancellation / Refund Policy: ${company.refundPolicy || 'https://totallyindian.com/policies/refundpolicy'}</p>
          <p>For any queries, please contact us at ${company.email || 'contact@totallyindian.com'}</p>
        </div>
        <div class="totals-box">
          <div class="total-row">
            <div class="total-label">Subtotal</div>
            <div class="total-value">${currencySymbol} ${parseFloat(totals.subtotal || 0).toFixed(2)}</div>
          </div>
          <div class="total-row">
            <div class="total-label">Shipping Amount</div>
            <div class="total-value">${currencySymbol} ${parseFloat(totals.shippingCharges || 0).toFixed(2)}</div>
          </div>
          <div class="total-row">
            <div class="total-label">Discount</div>
            <div class="total-value">${currencySymbol} ${parseFloat(totals.discount || 0).toFixed(2)}</div>
          </div>
          <div class="total-row grand-total">
            <div class="total-label">Total</div>
            <div class="total-value">${currencySymbol} ${parseFloat(totals.finalTotal || totals.totalAmount || totals.paidAmount || 0).toFixed(2)}</div>
          </div>
          <div class="amount-words">Amount in Words:<br>${totals.amountInWords || '-'}</div>
        </div>
      </div>

      <div class="footer">
        <div class="footer-note">This is a computer generated document and requires no signature.</div>
        <div class="signature-box">
          <img src="/images/img_lp.jpeg" alt="Company Stamp" style="max-width: 60px; max-height: 50px;" />
          <img src="/images/sign_lp.png" alt="Authorized Signature" style="max-width: 90px; max-height: 60px;" />
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
};
