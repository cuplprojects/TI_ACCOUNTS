import React, { useState } from "react";
import { showErrorToast } from "../../lib/swalConfig";

// TaxInvoiceSeller Component
function TaxInvoiceSeller({ invoiceData = {} }) {
  const {
    company = {},
    billTo = {},
    shipTo = {},
    invoice = {},
    shipping = {},
    products = [],
    totals = {},
    bankDetails = {},
    paymentStatus = "Pending",
    taxSummary = [],
  } = invoiceData;

  return (
    <div
      style={{
        maxWidth: "100%",
        margin: "0",
        backgroundColor: "white",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        fontSize: "10px",
      }}
    >
      {/* Header */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
        }}
      >
        <tbody>
          <tr>
            {company.logo && (
              <td style={{ width: "80px" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "#003366",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "20px",
                    border: "1px solid #000",
                  }}
                >
                  {company.logo}
                </div>
              </td>
            )}
            <td style={{ width: company.logo ? "60%" : "80%", paddingLeft: "10px" }}>
              <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
                {company.name && (
                  <>
                    <strong style={{ fontSize: "13px" }}>{company.name}</strong>
                    <br />
                  </>
                )}
                {company.address && (
                  <>
                    {company.address}
                    <br />
                  </>
                )}
                {company.gstin && (
                  <>
                    GSTIN: {company.gstin}
                    <br />
                  </>
                )}
                {(company.contact || company.email) && (
                  <>
                    {company.contact && <>Mobile: {company.contact}</>}
                    {company.contact && company.email && <> | </>}
                    {company.email && <>Email: {company.email}</>}
                    <br />
                  </>
                )}
                {company.irn && (
                  <>
                    IRN: {company.irn}
                    <br />
                  </>
                )}
                {company.acknowledgementNumber && (
                  <>
                    Acknowledgement Number: {company.acknowledgementNumber}
                    <br />
                  </>
                )}
              </div>
            </td>
            <td style={{ width: "20%", textAlign: "right" }}>
              <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "12px",
                    marginBottom: "5px",
                    color: "rgb(20, 23, 134)",
                  }}
                >
                  TAX INVOICE
                </div>
                <div>ORIGINAL FOR RECIPIENT</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Details Section */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "10px",
          border: "1px solid #000",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                width: "33.33%",
                borderRight: "1px solid #000",
                padding: "8px",
                fontSize: "11px",
                verticalAlign: "top",
              }}
            >
              <strong>Customer Details:</strong>
              <br />
              <strong>{billTo.name || "-"}</strong>
              <br />
              {billTo.gstin && (
                <>
                  GSTIN: {billTo.gstin}
                  <br />
                </>
              )}
              <strong>Billing address:</strong>
              <br />
              {billTo.address1 || "-"}
              <br />
              {billTo.address2 || "-"}
              <br />
              <strong>Shipping address:</strong>
              <br />
              {shipTo.address1 || "-"}
              <br />
              {shipTo.address2 || "-"}
              <br />
              {(billTo.phone || billTo.email) && (
                <>
                  {billTo.phone && <>Mobile: {billTo.phone}</>}
                  {billTo.phone && billTo.email && <> | </>}
                  {billTo.email && <>Email: {billTo.email}</>}
                </>
              )}
            </td>
            <td
              style={{
                width: "33.33%",
                borderRight: "1px solid #000",
                padding: "8px",
                fontSize: "11px",
                verticalAlign: "top",
              }}
            >
              <div style={{ marginBottom: "8px", borderBottom: "1px solid #000", paddingBottom: "8px" }}>
                <strong>Invoice #:</strong>
                <br />
                {invoice.number || "-"}
              </div>
              <div style={{ marginBottom: "8px", borderBottom: "1px solid #000", paddingBottom: "8px" }}>
                <strong>Place of Supply:</strong>
                <br />
                {shipping.placeOfSupply || "-"}
              </div>
              <div style={{ marginBottom: "8px", borderBottom: "1px solid #000", paddingBottom: "8px" }}>
                <strong>Ewy Bill #</strong>
                <br />
                {shipping.ewayBill || "-"}
              </div>
              <div>
                <strong>Dispatch From:</strong>
                <br />
                {company.name && (
                  <>
                    {company.name}
                    <br />
                  </>
                )}
                {company.dispatchAddress && (
                  <>
                    {company.dispatchAddress}
                  </>
                )}
              </div>
            </td>
            <td
              style={{
                width: "33.33%",
                padding: "8px",
                fontSize: "11px",
                verticalAlign: "top",
              }}
            >
              <div style={{ marginBottom: "8px", borderBottom: "1px solid #000", paddingBottom: "8px" }}>
                <strong>Date:</strong>
                <br />
                {invoice.date || "-"}
              </div>
              <div style={{ marginBottom: "8px", borderBottom: "1px solid #000", paddingBottom: "8px" }}>
                <strong>Due Date:</strong>
                <br />
                {invoice.dueDate || "-"}
              </div>
              <div style={{ marginBottom: "8px", borderBottom: "1px solid #000", paddingBottom: "8px" }}>
                <strong>Vehicle Number:</strong>
                <br />
                {shipping.vehicleNumber || "-"}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Items Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "10px",
          border: "1px solid #000",
          fontSize: "11px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "10px" }}>#</th>
            <th style={{ border: "1px solid #000", padding: "6px", textAlign: "left", fontWeight: "bold", fontSize: "10px" }}>Item</th>
            <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "10px" }}>HSN/SAC</th>
            <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "10px" }}>Rate Item</th>
            <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "10px" }}>Qty(PCS)</th>
            <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "10px" }}>GST %</th>
            {/* <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "10px" }}>Amount</th> */}
            <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "10px" }}>Taxable Value</th>
          </tr>
        </thead>
        <tbody>
          {products && products.length > 0 ? (
            products.map((product, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{index + 1}</td>
                <td style={{ border: "1px solid #000", padding: "6px", textAlign: "left", fontWeight: "600" }}>{product.description || "-"}</td>
                <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{product.hsnCode || "-"}</td>
                <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{product.rate || "-"}</td>
                <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{product.quantity || "-"}</td>
                {/* <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{product.amount || "-"}</td> */}
                <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{product.gstPercent || "-"}%</td>
                <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{product.amount || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>-</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Summary Section */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "10px",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                width: "50%",
                border: "1px solid #000",
                padding: "8px",
                fontSize: "11px",
                verticalAlign: "top",
              }}
            >
              {/* <strong style={{ lineHeight: "1.2" }}>Total Items / Qty : {products.length || 0} / {totals.totalQuantity || 0}</strong> */}
              {/* <br /> */}
              <div style={{ marginTop: "4px", lineHeight: "1.3" }}>
                Total amount (in words): {totals.amountInWords || "-"}
              </div>
              <div style={{ marginTop: "6px" }}>
                <p style={{ marginBottom: "3px", fontWeight: "bold" }}>
                  Bank Details:
                </p>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: "2px 0", width: "30%" }}>Bank</td>
                      <td style={{ padding: "2px 0" }}>
                        : <span style={{ fontWeight: "bold" }}>{bankDetails.bankName || "-"}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 0" }}>Account #</td>
                      <td style={{ padding: "2px 0" }}>
                        : <span style={{ fontWeight: "bold" }}>{bankDetails.accountNumber || "-"}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 0" }}>IFSC</td>
                      <td style={{ padding: "2px 0" }}>
                        : <span style={{ fontWeight: "bold" }}>{bankDetails.ifscCode || "-"}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 0" }}>Branch</td>
                      <td style={{ padding: "2px 0" }}>
                        : <span style={{ fontWeight: "bold" }}>{bankDetails.branch || "-"}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 0" }}>UPI ID</td>
                      <td style={{ padding: "2px 0" }}>
                        : <span style={{ fontWeight: "bold" }}>{bankDetails.upiId || "-"}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
            <td
              style={{
                width: "50%",
                border: "1px solid #000",
                borderLeft: "none",
                padding: "8px",
                fontSize: "11px",
                verticalAlign: "top",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", lineHeight: "1.2" }}>
                <span>Taxable Amount</span>
                <span>₹{totals.taxableAmount || "-"}</span>
              </div>
              {parseFloat(totals.cgst || 0) > 0 && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", lineHeight: "1.2" }}>
                    <span>CGST ({products && products.length > 0 ? (parseFloat(products[0].gstPercent) / 2) : 0}%)</span>
                    <span>₹{totals.cgst || "-"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", lineHeight: "1.2" }}>
                    <span>SGST ({products && products.length > 0 ? (parseFloat(products[0].gstPercent) / 2) : 0}%)</span>
                    <span>₹{totals.sgst || "-"}</span>
                  </div>
                </>
              )}
              {parseFloat(totals.igst || 0) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", lineHeight: "1.2" }}>
                  <span>IGST ({products && products.length > 0 ? products[0].gstPercent : 0}%)</span>
                  <span>₹{totals.igst || "-"}</span>
                </div>
              )}
              <div
                style={{
                  borderTop: "1px solid #000",
                  borderBottom: "1px solid #000",
                  padding: "3px 0",
                  margin: "6px 0 10px 0",
                  lineHeight: "1.2",
                  fontWeight: "bold",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Total</span>
                <span>₹{totals.finalTotal || "-"}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tax Breakdown Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "10px",
          border: "1px solid #000",
          fontSize: "11px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "10px" }}>
              HSN/SAC
            </th>
            <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "10px" }}>
              Taxable Value
            </th>
            <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "10px" }}>
              Rate
            </th>
            <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "10px" }}>
              Tax Amount
            </th>
            <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "10px" }}>
              Total Tax Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {taxSummary && taxSummary.length > 0 ? (
            (() => {
              const cgstRow = taxSummary.find(tax => tax.type === 'CGST');
              const igstRow = taxSummary.find(tax => tax.type === 'IGST');
              const taxRow = cgstRow || igstRow;
              const hsnCode = products && products.length > 0 ? products[0].hsnCode : "-";
              
              return taxRow ? (
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{hsnCode}</td>
                  <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>₹{taxRow.taxableValue || "-"}</td>
                  <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>
                    {cgstRow && `9% (CGST) + 9% (SGST)`}
                    {igstRow && !cgstRow && `${igstRow.rate}% (IGST)`}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>
                    {cgstRow && `₹${(parseFloat(totals.cgst || 0) + parseFloat(totals.sgst || 0)).toFixed(2)}`}
                    {igstRow && !cgstRow && `₹${igstRow.taxAmount || "-"}`}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>
                    {cgstRow && `₹${(parseFloat(totals.cgst || 0) + parseFloat(totals.sgst || 0)).toFixed(2)}`}
                    {igstRow && !cgstRow && `₹${igstRow.totalTaxAmount || "-"}`}
                  </td>
                </tr>
              ) : null;
            })()
          ) : (
            <tr>
              <td colSpan="5" style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>-</td>
            </tr>
          )}
          <tr>
            <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold" }}>TOTAL</td>
            <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold" }}>₹{totals.taxableAmount || "-"}</td>
            <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold" }}>-</td>
            <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold" }}>₹{(parseFloat(totals.cgst || 0) + parseFloat(totals.sgst || 0) + parseFloat(totals.igst || 0)).toFixed(2)}</td>
            <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold" }}>₹{(parseFloat(totals.cgst || 0) + parseFloat(totals.sgst || 0) + parseFloat(totals.igst || 0)).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {/* Notes and Footer */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "10px",
          border: "1px solid #000",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                width: "60%",
                borderRight: "1px solid #000",
                padding: "10px",
                fontSize: "11px",
                verticalAlign: "top",
              }}
            >
              <strong>Notes:</strong>
              <br />
              Thank you for the Business!
              <br />
              <br />
              <strong>Terms and Conditions:</strong>
              <br />
              1. As Per Agreement Singed.
              <br />
              2. Subject To Realization.              
            </td>
            <td
              style={{
                width: "40%",
                padding: "10px",
                fontSize: "11px",
                textAlign: "center",
                verticalAlign: "top",
              }}
            >
              <div style={{ marginBottom: "10px" }}>
                <strong>For {company.name || "-"}</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "20px",
                  minHeight: "80px",
                  pageBreakInside: "avoid",
                }}
              >
                {company.stampImage && (
                  <img
                    src={company.stampImage}
                    alt="Stamp"
                    style={{ 
                      maxWidth: "60px", 
                      maxHeight: "60px",
                      display: "block",
                      pageBreakInside: "avoid"
                    }}
                  />
                )}
                {company.signatureImage && (
                  <img
                    src={company.signatureImage}
                    alt="Signature"
                    style={{ 
                      maxWidth: "80px", 
                      maxHeight: "60px",
                      display: "block",
                      pageBreakInside: "avoid"
                    }}
                  />
                )}
              </div>
              <div>
                <strong>Authorized Signatory</strong>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Page Info */}
      <div style={{ textAlign: "left", padding: "0", marginTop: "4px", fontSize: "11px" }}>
        <p>
          <strong>Page 1 / 1</strong> &nbsp;&nbsp;&nbsp; This is a digitally signed document.
        </p>
      </div>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Object} props.invoiceData - The invoice data object
 * @param {Function} [props.onButtonClick] - Optional click handler for the button
 * @param {string} [props.buttonText] - Text to display on the button
 * @param {boolean} [props.isButtonLoading] - Loading state for the button
 * @param {boolean} [props.buttonDisabled] - Disabled state for the button
 */
export default function TaxInvoiceSellerGenerator({
  invoiceData = {},
  onButtonClick = null,
  buttonText = "Download PDF",
  isButtonLoading = false,
  buttonDisabled = false,
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const html2canvas = await import("html2canvas");
      const jsPDF = await import("jspdf");
      const element = document.getElementById("invoice-seller-to-print");

      if (!element) {
        throw new Error("Invoice element not found");
      }

      // Convert HTML to canvas with high quality
      const canvas = await html2canvas.default(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 0,
      });

      // Get canvas dimensions
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

      pdf.save("tax-invoice-seller.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showErrorToast(
        "Error generating PDF. Please ensure html2canvas and jspdf are installed."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Download Button */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <button
            onClick={onButtonClick ? onButtonClick : generatePDF}
            disabled={isButtonLoading || buttonDisabled || isGenerating}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "15px 30px",
              borderRadius: "8px",
              cursor:
                isButtonLoading || buttonDisabled || isGenerating
                  ? "not-allowed"
                  : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              opacity:
                isButtonLoading || buttonDisabled || isGenerating ? 0.7 : 1,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
            }}
          >
            {isButtonLoading
              ? "Loading..."
              : isGenerating
              ? "Generating PDF..."
              : buttonText}
          </button>
        </div>

        {/* Invoice Preview */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <div id="invoice-seller-to-print">
            <TaxInvoiceSeller invoiceData={invoiceData} />
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          img {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            max-width: 100% !important;
            height: auto !important;
            page-break-inside: avoid !important;
          }
          table {
            page-break-inside: avoid;
            border-collapse: collapse;
          }
          tr {
            page-break-inside: avoid;
          }
          td, th {
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          div {
            page-break-inside: avoid;
          }
          #invoice-seller-to-print {
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}
