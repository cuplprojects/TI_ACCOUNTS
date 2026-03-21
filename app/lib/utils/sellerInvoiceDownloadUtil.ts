import { showErrorToast, showSuccessToast } from "@/app/lib/swalConfig";

/**
 * Download invoice PDF directly for seller
 */
export const downloadSellerInvoice = async (
  orderId: string,
  sellerId: string
) => {
  try {
    const { getInvoiceData, createInvoice, getOrder, hasInvoice } = await import("@/app/lib/services/seller");
    
    // Check if invoice exists, create if not
    const order = await getOrder(orderId);
    const invoiceAlreadyExists = order ? hasInvoice(order, sellerId) : false;

    if (!invoiceAlreadyExists) {
      await createInvoice(orderId, sellerId);
    }

    // Get invoice data
    const invoiceData = await getInvoiceData(orderId);
    if (!invoiceData) {
      showErrorToast("Failed to load invoice data");
      return;
    }

    // Generate and download PDF using seller template
    await generateSellerPDF(invoiceData);
    showSuccessToast("Invoice downloaded successfully");
  } catch (error) {
    console.error("Error downloading invoice:", error);
    showErrorToast("Failed to download invoice. Please try again.");
  }
};

/**
 * Generate and download PDF for seller invoice
 */
const generateSellerPDF = async (invoiceData: any) => {
  try {
    const html2canvas = await import("html2canvas");
    const jsPDF = await import("jspdf");

    // Create a temporary container
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "-9999px";
    tempContainer.style.width = "210mm";
    tempContainer.style.height = "auto";
    tempContainer.style.backgroundColor = "white";
    tempContainer.style.padding = "20px";
    tempContainer.style.fontFamily = "Arial, sans-serif";

    // Build and set HTML using seller template
    const htmlContent = buildSellerInvoiceHTML(invoiceData);
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
    });

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
    console.error("Error generating seller PDF:", error);
    throw error;
  }
};

/**
 * Build seller invoice HTML
 */
const buildSellerInvoiceHTML = (invoiceData: any): string => {
  const {
    company = {},
    billTo = {},
    shipTo = {},
    invoice = {},
    shipping = {},
    products = [],
    totals = {},
    bankDetails = {},
  } = invoiceData;

  const productRows = products.map((product: any, index: number) => `
    <tr style="line-height: 1.8;">
      <td style="border: 1px solid #000; padding: 10px; text-align: center;">${index + 1}</td>
      <td style="border: 1px solid #000; padding: 10px; text-align: left; font-weight: 600;">${product.description || '-'}</td>
      <td style="border: 1px solid #000; padding: 10px; text-align: center;">${product.hsnCode || '-'}</td>
      <td style="border: 1px solid #000; padding: 10px; text-align: center;">₹${product.rate || '-'}</td>
      <td style="border: 1px solid #000; padding: 10px; text-align: center;">${product.quantity || '-'}</td>
      <td style="border: 1px solid #000; padding: 10px; text-align: center;">${product.gstPercent || '-'}%</td>
      <td style="border: 1px solid #000; padding: 10px; text-align: center;">₹${product.amount || '-'}</td>
    </tr>
  `).join('');

  return `
    <div style="max-width: 100%; margin: 0; background-color: white; padding: 20px; font-family: Arial, sans-serif; font-size: 10px;">
      <!-- Header -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tbody>
          <tr>
            <td style="width: 80%; padding-left: 10px;">
              <div style="font-size: 11px; line-height: 1.4;">
                ${company.name ? `<strong style="font-size: 13px;">${company.name}</strong><br />` : ''}
                ${company.address ? `${company.address}<br />` : ''}
                ${company.gstin ? `GSTIN: ${company.gstin}<br />` : ''}
                ${(company.contact || company.email) ? `${company.contact ? `Mobile: ${company.contact}` : ''} ${company.contact && company.email ? ' | ' : ''} ${company.email ? `Email: ${company.email}` : ''}<br />` : ''}
              </div>
            </td>
            <td style="width: 20%; text-align: right;">
              <div style="font-size: 11px; line-height: 1.4;">
                <div style="font-weight: bold; font-size: 12px; margin-bottom: 5px; color: rgb(20, 23, 134);">TAX INVOICE</div>
                <div>ORIGINAL FOR RECIPIENT</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Details Section -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1px solid #000;">
        <tbody>
          <tr>
            <td style="width: 33.33%; border-right: 1px solid #000; padding: 12px; font-size: 11px; vertical-align: top;">
              <strong>Customer Details:</strong><br />
              <strong>${billTo.name || '-'}</strong><br />
              ${billTo.gstin ? `GSTIN: ${billTo.gstin}<br />` : ''}
              <strong>Billing address:</strong><br />
              ${billTo.address1 || '-'}<br />
              ${billTo.address2 || '-'}<br />
              <strong>Shipping address:</strong><br />
              ${shipTo.address1 || '-'}<br />
              ${shipTo.address2 || '-'}<br />
            </td>
            <td style="width: 33.33%; border-right: 1px solid #000; padding: 12px; font-size: 11px; vertical-align: top;">
              <div style="margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 10px;">
                <strong>Invoice #:</strong><br />
                ${invoice.number || '-'}
              </div>
              <div style="margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 10px;">
                <strong>Place of Supply:</strong><br />
                ${shipping.placeOfSupply || '-'}
              </div>
            </td>
            <td style="width: 33.33%; padding: 12px; font-size: 11px; vertical-align: top;">
              <div style="margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 10px;">
                <strong>Date:</strong><br />
                ${invoice.date || '-'}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1px solid #000; font-size: 11px; line-height: 1.8;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold; font-size: 10px;">#</th>
            <th style="border: 1px solid #000; padding: 10px; text-align: left; font-weight: bold; font-size: 10px;">Item</th>
            <th style="border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold; font-size: 10px;">HSN/SAC</th>
            <th style="border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold; font-size: 10px;">Rate</th>
            <th style="border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold; font-size: 10px;">Qty(PCS)</th>
            <th style="border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold; font-size: 10px;">GST %</th>
            <th style="border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold; font-size: 10px;">Taxable Value</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>

      <!-- Summary Section -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; line-height: 1.8;">
        <tbody>
          <tr>
            <td style="width: 50%; border: 1px solid #000; padding: 12px; font-size: 11px; vertical-align: top;">
              <div style="margin-top: 4px; line-height: 1.8;">
                Total amount (in words): ${totals.amountInWords || '-'}
              </div>
              <div style="margin-top: 6px;">
                <p style="margin-bottom: 3px; font-weight: bold;">Bank Details:</p>
                <table style="width: 100%; border-collapse: collapse;">
                  <tbody>
                    <tr>
                      <td style="padding: 2px 0; width: 30%;">Bank</td>
                      <td style="padding: 2px 0;">: <span style="font-weight: bold;">${bankDetails.bankName || '-'}</span></td>
                    </tr>
                    <tr>
                      <td style="padding: 2px 0;">Account #</td>
                      <td style="padding: 2px 0;">: <span style="font-weight: bold;">${bankDetails.accountNumber || '-'}</span></td>
                    </tr>
                    <tr>
                      <td style="padding: 2px 0;">IFSC</td>
                      <td style="padding: 2px 0;">: <span style="font-weight: bold;">${bankDetails.ifscCode || '-'}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
            <td style="width: 50%; border: 1px solid #000; border-left: none; padding: 12px; font-size: 11px; vertical-align: top;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px; line-height: 1.8;">
                <span>Taxable Amount</span>
                <span>₹${totals.taxableAmount || '-'}</span>
              </div>
              <div style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 0; margin: 6px 0 10px 0; line-height: 1.8; font-weight: bold; display: flex; justify-content: space-between;">
                <span>Total</span>
                <span>₹${totals.finalTotal || '-'}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Notes and Footer -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1px solid #000;">
        <tbody>
          <tr>
            <td style="width: 60%; border-right: 1px solid #000; padding: 12px; font-size: 11px; vertical-align: top;">
              <strong>Notes:</strong><br />
              Thank you for the Business!<br /><br />
              <strong>Terms and Conditions:</strong><br />
              1. As Per Agreement Signed.<br />
              2. Subject To Realization.
            </td>
            <td style="width: 40%; padding: 12px; font-size: 11px; text-align: center; vertical-align: top;">
              <div style="margin-bottom: 10px;">
                <strong>For ${company.name || '-'}</strong>
              </div>
              <div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 20px; min-height: 80px;">
                ${company.stampImage ? `<img src="${company.stampImage}" alt="Stamp" style="max-width: 60px; max-height: 60px;" />` : ''}
                ${company.signatureImage ? `<img src="${company.signatureImage}" alt="Signature" style="max-width: 80px; max-height: 60px;" />` : ''}
              </div>
              <div>
                <strong>Authorized Signatory</strong>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Page Info -->
      <div style="text-align: left; padding: 0; margin-top: 4px; font-size: 11px;">
        <p><strong>Page 1 / 1</strong> &nbsp;&nbsp;&nbsp; This is a digitally signed document.</p>
      </div>
    </div>
  `;
};
