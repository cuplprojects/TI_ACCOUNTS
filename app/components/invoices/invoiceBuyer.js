// src/components/InvoicePDFGenerator.js
// This will be userd by admin as admin will generate the final invoice fro the buyer
import React, { useState } from "react";
import { showErrorToast } from "../../lib/swalConfig";
import { getCarrierName } from "../../lib/services/admin/shippingCarrierService";

// Invoice Component
function TaxInvoiceComponent({ invoiceData }) {
  const styles = {
    body: {
      fontFamily: "Arial, sans-serif",
      margin: "0",
      padding: "20px",
      fontSize: "12px",
      lineHeight: "1.3",
      backgroundColor: "#ffffff",
      display: "flex",
      justifyContent: "center",
      width: "100%",
    },

    invoiceContainer: {
      maxWidth: "900px",
      width: "100%",
      backgroundColor: "white",
      padding: "30px",
    },

    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "10px",
      paddingBottom: "10px",
    },

    headerLeft: {
      flex: 1,
    },

    headerRight: {
      textAlign: "right",
      flex: 1,
    },

    companyName: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#003366",
      marginBottom: "2px",
    },

    companyDetails: {
      fontSize: "11px",
      color: "#666",
      lineHeight: "1.3",
    },

    invoiceLabel: {
      fontSize: "13px",
      color: "#999",
      marginBottom: "10px",
    },

    logoSection: {
      textAlign: "right",
      display: "flex",
      justifyContent: "flex-end",
    },

    logo: {
      maxWidth: "250px",
      maxHeight: "140px",
      marginBottom: "10px",
    },

    invoiceTitle: {
      fontSize: "14px",
      fontWeight: "bold",
      color: "#333",
      marginBottom: "20px",
    },

    detailsGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "15px 15px",
      marginBottom: "5px",
      fontSize: "12px",
    },

    detailBox: {
      paddingBottom: "5px",
    },

    detailLabel: {
      fontWeight: "bold",
      color: "#333",
      marginBottom: "2px",
    },

    detailValue: {
      color: "#666",
    },

    partiesSection: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "15px 15px",
      marginBottom: "5px",
      fontSize: "12px",
    },

    partyBox: {
      paddingBottom: "5px",
    },

    partyTitle: {
      fontWeight: "bold",
      color: "#333",
      marginBottom: "5px",
      fontSize: "12px",
    },

    partyContent: {
      color: "#666",
      lineHeight: "1.3",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginBottom: "0px",
      fontSize: "12px",
    },

    tableHeader: {
      backgroundColor: "#f5f5f5",
      borderTop: "2px solid #333",
      padding: "4px",
      fontWeight: "bold",
      textAlign: "center",
      color: "#333",
    },

    tableCell: {
      padding: "4px",
      textAlign: "center",
    },

    tableCellLeft: {
      textAlign: "left",
    },

    tableRow: {},

    totalRow: {
      backgroundColor: "#f9f9f9",
      fontWeight: "bold",
      borderTop: "2px solid #333",
      color: "#003366",
      fontSize: "15px",
    },

    amountSection: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
      marginBottom: "20px",
      fontSize: "11px",
    },

    amountBox: {
      paddingBottom: "10px",
    },

    amountLabel: {
      fontWeight: "bold",
      color: "#333",
      marginBottom: "5px",
    },

    amountValue: {
      color: "#666",
    },

    termsSection: {
      fontSize: "11px",
      color: "#666",
      marginBottom: "10px",
      lineHeight: "1.4",
      paddingTop: "10px",
      borderTop: "1px solid #ddd",
      wordWrap: "break-word",
      overflowWrap: "break-word",
    },

    termsTitle: {
      fontWeight: "bold",
      color: "#333",
      marginBottom: "8px",
    },

    link: {
      color: "#0066cc",
      textDecoration: "none",
      wordWrap: "break-word",
      overflowWrap: "break-word",
    },

    signatureSection: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr",
      gap: "20px",
      marginTop: "30px",
      paddingTop: "20px",
      borderTop: "1px solid #ddd",
      fontSize: "12px",
      alignItems: "flex-end",
    },

    signatureBox: {
      textAlign: "center",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: "20px",
    },

    signatureImage: {
      maxWidth: "120px",
      maxHeight: "80px",
      marginBottom: "10px",
    },

    stampImage: {
      maxWidth: "80px",
      maxHeight: "60px",
    },

    signatureLabel: {
      fontWeight: "bold",
      color: "#333",
    },

    footerNote: {
      fontSize: "9px",
      color: "#999",
      marginTop: "15px",
      textAlign: "center",
      fontStyle: "italic",
    },
  };

  return (
    <div style={styles.body}>
      <div style={styles.invoiceContainer}>
        {/* Header Section */}
        <div style={styles.headerRow}>
          <div style={styles.headerLeft}>
            <div style={styles.invoiceLabel}>INVOICE</div>
            <div style={styles.companyName}>{invoiceData.company.name}</div>
            <div style={styles.companyDetails}>
              <div>
                LUT {invoiceData.company.lut || "AD27102500041951"} YEAR FY {new Date().getFullYear()}-{new Date().getFullYear() + 1}
              </div>
              <div>GSTIN {invoiceData.company.gstin}</div>
              <div>PAN {invoiceData.company.iecPan}</div>
              <div>{invoiceData.company.address}</div>
              <div>
                Mobile {invoiceData.company.contact} | Email{" "}
                {invoiceData.company.email}
              </div>
            </div>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.invoiceLabel}>ORIGINAL FOR RECIPIENT</div>
            <div style={styles.logoSection}>
              <img
                src="/images/invoice/Logo_Totallyindian.png"
                alt="Company Logo"
                style={styles.logo}
              />
            </div>
          </div>
        </div>

        {/* Invoice Details Grid */}
        <div style={styles.detailsGrid}>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>Invoice #:</div>
            <div style={styles.detailValue}>{invoiceData.invoice.number}</div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>Invoice Date:</div>
            <div style={styles.detailValue}>{invoiceData.invoice.date}</div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>Order Ref :</div>
            <div style={styles.detailValue}>
              {invoiceData.invoice.orderRef || "-"}
            </div>
          </div>
        </div>

        {/* Parties Section */}
        <div style={styles.partiesSection}>
          <div style={styles.partyBox}>
            <div style={styles.partyTitle}>Customer Details:</div>
            <div style={styles.partyContent}>
              <div>{invoiceData.billTo.name}</div>
            </div>
          </div>
          <div style={styles.partyBox}>
            <div style={styles.partyTitle}>Billing Address:</div>
            <div style={styles.partyContent}>
              <div>{invoiceData.billTo.address1}</div>
              <div>{invoiceData.billTo.address2}</div>
            </div>
          </div>
          <div style={styles.partyBox}>
            <div style={styles.partyTitle}>Shipping Address:</div>
            <div style={styles.partyContent}>
              <div>{invoiceData.shipTo.address1}</div>
              <div>{invoiceData.shipTo.address2}</div>
            </div>
          </div>
        </div>

        {/* Additional Details Grid */}
        <div style={styles.detailsGrid}>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>Place Of Supply :</div>
            <div style={styles.detailValue}>
              {invoiceData.shipping.countryOfSupply}
            </div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>Port Of Lading :</div>
            <div style={styles.detailValue}>
              { "-" || invoiceData.shipping.port || "-"}
            </div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>Terms Of Trade :</div>
            <div style={styles.detailValue}>
              {"FOB"}
            </div>
          </div>
        </div>

        {/* Logistics Details */}
        <div style={styles.detailsGrid}>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>Logistics :</div>
            <div style={styles.detailValue}>
              {getCarrierName(invoiceData.shipping.logistics) || "-"}
            </div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>Airway Bill :</div>
            <div style={styles.detailValue}>
              {"-" ||invoiceData.shipping.airwayBill}
            </div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>Shipping Bill #</div>
            <div style={styles.detailValue}>
              {"-" || invoiceData.shipping.shippingBill}
            </div>
          </div>
        </div>

        <div style={styles.detailsGrid}>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>EGM #</div>
            <div style={styles.detailValue}>
              {"-" || invoiceData.shipping.egmNumber}
            </div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>EGM Date :</div>
            <div style={styles.detailValue}>
              {"-" || invoiceData.shipping.date || "-"}
            </div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>Export Type :</div>
            <div style={styles.detailValue}>
              {"Export Against Undertaking" || "-"}
            </div>
          </div>
        </div>

        {/* Product Table */}
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.tableHeader, width: "5%" }}>#</th>
              <th
                style={{
                  ...styles.tableHeader,
                  width: "30%",
                  textAlign: "left",
                }}
              >
                Item Name
              </th>
              <th style={{ ...styles.tableHeader, width: "12%" }}>HSN</th>
              <th style={{ ...styles.tableHeader, width: "8%" }}>Rate</th>
              <th style={{ ...styles.tableHeader, width: "8%" }}>Disc %</th>
              <th style={{ ...styles.tableHeader, width: "8%" }}>Qty (pcs)</th>
              <th style={{ ...styles.tableHeader, width: "13%" }}>Amount</th>
            </tr>
          </thead>

          <tbody>
            {invoiceData.products.map((product, index) => (
              <tr key={index} style={styles.tableRow}>
                <td style={styles.tableCell}>{index + 1}</td>
                <td style={{ ...styles.tableCell, ...styles.tableCellLeft }}>
                  {product.description}
                </td>
                <td style={styles.tableCell}>{product.hsnCode } </td>
                <td style={styles.tableCell}>₹{product.rate}</td>
                <td style={styles.tableCell}>{product.discountPercent}%</td>
                <td style={styles.tableCell}>{product.quantity}</td>
                <td style={styles.tableCell}>₹{product.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Amount Section - Redesigned */}
        <div style={{ marginBottom: "20px", marginTop: "5px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
              paddingTop: "15px",
              borderTop: "2px solid #333",
            }}
          >
            {/* Left: Amount in Words */}
            <div>
              <div style={styles.detailLabel}>Total Amount (in words) :</div>
              <div style={{ ...styles.detailValue, marginTop: "8px", lineHeight: "1.5", fontSize: "12px" }}>
                {invoiceData.totals.amountInWords}
              </div>
            </div>

            {/* Right: Amount Breakdown - Aligned with table */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginLeft: "auto", width: "100%" }}>
              {/* Subtotal */} 
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", paddingRight:"40px" }}>
                <div style={{ ...styles.detailLabel, marginBottom: "0" }}>Subtotal :</div>
                <div style={{ ...styles.detailValue, fontWeight: "600" }}>
                  ₹{invoiceData.totals.subtotal}
                </div>
              </div>

              {/* Shipping Charges */}
              {invoiceData.totals.shippingCharges && parseFloat(invoiceData.totals.shippingCharges) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", paddingRight:"40px"  }}>
                  <div style={{ ...styles.detailLabel, marginBottom: "0" }}>Shipping Charges :</div>
                  <div style={{ ...styles.detailValue, fontWeight: "600" }}>
                    ₹{invoiceData.totals.shippingCharges}
                  </div>
                </div>
              )}

              {/* Tax */}
              {/* {invoiceData.totals.taxAmount && parseFloat(invoiceData.totals.taxAmount) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <div style={{ ...styles.detailLabel, marginBottom: "0" }}>Tax (IGST/SGST) :</div>
                  <div style={{ ...styles.detailValue, fontWeight: "600" }}>
                    ₹{invoiceData.totals.taxAmount}
                  </div>
                </div>
              )} */}

              {/* Final Total - Highlighted */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  borderTop: "2px solid #333",
                  borderBottom: "2px solid #333",
                  fontSize: "13px",
                 paddingRight:"40px" 
                }}
              >
                <div style={{ ...styles.detailLabel, marginBottom: "0", fontWeight: "bold" }}>
                  Total :
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#003366",
                    fontSize: "14px",
                  }}
                >
                  ₹{invoiceData.totals.finalTotal}
                </div>
              </div>

              {/* Taxable Amount */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginTop: "5px", paddingRight:"40px"  }}>
                <div style={{ ...styles.detailLabel, marginBottom: "0" }}>Taxable Amount :</div>
                <div style={styles.detailValue}>
                  ₹{invoiceData.totals.taxableAmount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions and Signature Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            marginTop: "20px",
            marginBottom: "20px",
            paddingTop: "20px",
            borderTop: "1px solid #ddd",
            alignItems: "flex-start",
          }}
        >
          {/* Terms & Conditions */}
          <div style={{ flex: 1 }}>
            <div style={styles.termsTitle}>
              Terms & Conditions : Please refer to these links for our shipping
              policy & cancellation/refund policy:
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#666",
                lineHeight: "1.4",
                marginTop: "8px",
              }}
            >
              <div>
                Shipping Policy:{" "}
                <a
                  href={invoiceData.company.shippingPolicy}
                  style={styles.link}
                >
                  {invoiceData.company.shippingPolicy}
                </a>
              </div>
              <div>
                Cancellation/Refund Policy:{" "}
                <a href={invoiceData.company.refundPolicy} style={styles.link}>
                  {invoiceData.company.refundPolicy}
                </a>
              </div>
              <div style={{ marginTop: "8px" }}>
                For any queries, please contact us at{" "}
                <a
                  href={`mailto:${invoiceData.company.email}`}
                  style={styles.link}
                >
                  {invoiceData.company.email}
                </a>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center", // vertical center of whole block
              height: "130px", // FIXED height is important
            }}
          >
            {/* Images Row */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center", // vertical align images
                justifyContent: "center",
                width: "100%",
              }}
            >
              <img
                src="/images/img_lp.jpeg"
                alt="Company Stamp"
                style={styles.stampImage}
              />

              <img
                src="/images/invoice/sign_lp.png"
                alt="Authorized Signature"
                style={styles.signatureImage}
              />
            </div>

            {/* Text Below Both Images */}
            <div style={{ textAlign: "center" }}>
              <div style={styles.signatureLabel}>
                For {invoiceData.company.name}
              </div>
              <div style={styles.signatureLabel}>Authorised Signatory</div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={styles.footerNote}>
          Supply meant for Export under bond or letter of undertaking without
          Payment of Integrated Tax
          <br />
          This is a computer generated document and requires no signature
        </div>
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
export default function InvoicePDFGenerator({
  invoiceData,
  onButtonClick = null,
  buttonText = "Download PDF",
  isButtonLoading = false,
  buttonDisabled = false,
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const html2pdf = await import("html2pdf.js");
      const element = document.getElementById("invoice-to-print");

      if (!element) {
        throw new Error("Invoice element not found");
      }

      // Configure PDF options
      const options = {
        margin: 0,
        filename: `invoice-${invoiceData.invoice.number}.pdf`,
        image: { type: "jpeg", quality: 1.0 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: null,
        },
        jsPDF: {
          unit: "in",
          format: "a4",
          orientation: "portrait",
          compress: true,
        },
        pagebreak: { mode: "avoid-all" },
      };

      await html2pdf.default().set(options).from(element).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      showErrorToast(
        "Error generating PDF. Please install html2pdf.js: npm install html2pdf.js"
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
          <div id="invoice-to-print">
            <TaxInvoiceComponent invoiceData={invoiceData} />
          </div>
        </div>
      </div>
    </div>
  );
}
