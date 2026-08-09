import { jsPDF } from 'jspdf';

/**
 * Generate and download a PDF invoice for a rental order.
 * @param {Object} invoiceDetails - The details of the invoice
 * @param {string} invoiceDetails.invoiceNumber - e.g. "INV-2026-8812"
 * @param {string} invoiceDetails.orderId - The order ID
 * @param {string} invoiceDetails.rentalId - The rental ID
 * @param {string} invoiceDetails.productTitle - The product name
 * @param {number} invoiceDetails.totalPaid - Total amount paid
 * @param {number} invoiceDetails.securityDeposit - Security deposit paid
 * @param {string} invoiceDetails.startDate - Start date of lease
 * @param {string} invoiceDetails.endDate - End date of lease
 * @param {string} invoiceDetails.estimatedDelivery - e.g. "Tue, Aug 11"
 */
export const downloadInvoicePdf = (invoiceDetails) => {
  const {
    invoiceNumber = `INV-${Date.now().toString().slice(-6)}`,
    orderId = '—',
    rentalId = '—',
    productTitle = 'Equipment Rental Leased Item',
    totalPaid = 0,
    securityDeposit = 0,
    startDate = new Date().toLocaleDateString(),
    endDate = new Date(Date.now() + 86400000 * 3).toLocaleDateString(),
    estimatedDelivery = '—',
  } = invoiceDetails;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Theme Colors (Orange and White Professional Theme)
  const primaryColor = [255, 102, 0]; // #FF6600
  const secondaryColor = [30, 41, 59]; // #1E293B
  const lightBg = [248, 250, 252]; // #F8FAFC
  const borderLine = [226, 232, 240]; // #E2E8F0

  // 1. Header Band
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  // Title / Logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('RentSphere', 20, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Professional Equipment Lease Invoice', 20, 28);

  // INVOICE text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('INVOICE', 140, 25);

  // 2. Info Block
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('BILLED TO:', 20, 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Verified RentSphere Customer', 20, 58);
  doc.text('Online Payment Gateway Order', 20, 63);

  // Invoice Meta on the Right
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Details:', 130, 52);

  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No:  ${invoiceNumber}`, 130, 58);
  doc.text(`Date:        ${new Date().toLocaleDateString('en-IN')}`, 130, 63);
  doc.text(`Order ID:    ${orderId}`, 130, 68);
  if (rentalId && rentalId !== '—') {
    doc.text(`Agreement ID: ${rentalId}`, 130, 73);
  }

  // Divider Line
  doc.setDrawColor(...borderLine);
  doc.line(20, 80, 190, 80);

  // 3. Rental Information Section
  doc.setFillColor(...lightBg);
  doc.rect(20, 85, 170, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('RENTAL SERVICE DETAILS', 25, 92);

  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'normal');
  doc.text(`Lease Period:   ${startDate} to ${endDate}`, 25, 98);
  if (estimatedDelivery && estimatedDelivery !== '—') {
    doc.text(`Delivery Plan:  Estimated Delivery by ${estimatedDelivery}`, 25, 103);
  } else {
    doc.text(`Delivery Plan:  Standard Handover Protocol`, 25, 103);
  }

  // 4. Products Table Header
  doc.setFillColor(...secondaryColor);
  doc.rect(20, 122, 170, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('Item Description / Equipment Leased', 25, 127);
  doc.text('Amount (INR)', 155, 127);

  // Products Table Row
  doc.setDrawColor(...borderLine);
  doc.line(20, 138, 190, 138);

  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(productTitle, 25, 135);
  doc.text(`INR ${(totalPaid - securityDeposit).toLocaleString('en-IN')}`, 155, 135);

  // Refundable Deposit Row
  doc.line(20, 146, 190, 146);
  doc.text('Refundable Security Deposit (Held)', 25, 143);
  doc.text(`INR ${securityDeposit.toLocaleString('en-IN')}`, 155, 143);

  // 5. Total Calculation Summary
  doc.line(110, 155, 190, 155);

  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', 120, 162);
  doc.text(`INR ${(totalPaid - securityDeposit).toLocaleString('en-IN')}`, 160, 162);

  doc.text('Security Deposit:', 120, 168);
  doc.text(`INR ${securityDeposit.toLocaleString('en-IN')}`, 160, 168);

  // Total Box
  doc.setFillColor(...lightBg);
  doc.rect(110, 173, 80, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Total Paid:', 115, 179);
  doc.text(`INR ${totalPaid.toLocaleString('en-IN')}`, 160, 179);

  // 6. Footer / Support Info
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Thank you for choosing RentSphere as your trusted equipment rental partner!', 20, 205);
  doc.text('Note: The security deposit will be fully refunded upon verification of safe item return.', 20, 210);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  doc.text('Need help? Support contact: support@rentsphere.com', 20, 222);

  // Draw border around page
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1);
  doc.rect(5, 5, 200, 287);

  // Save the PDF
  doc.save(`${invoiceNumber}.pdf`);
};
