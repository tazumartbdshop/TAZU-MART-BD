import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

export async function generateInvoicePDF(order: any, settings: any = {}, branding: any = {}) {
  const orderId = order.orderId || order.id || '892341';
  const invoicePrefix = settings?.invoicePrefix || 'INV-';
  const invoiceId = order.invoiceId || `${invoicePrefix}${orderId}`;
  const pdfFileName = `Invoice-${invoiceId.replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`;

  // Try element capture first if available in DOM
  const element = document.getElementById("invoice-print-sheet");
  
  if (element) {
    try {
      const canvasPromise = html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // 3.5 seconds timeout race so the user never gets stuck waiting forever
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Canvas capture timeout")), 3500)
      );

      const canvas = await Promise.race([canvasPromise, timeoutPromise]) as HTMLCanvasElement;
      
      if (canvas && canvas.width > 0) {
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
        const margin = 5;
        const printWidth = pdfWidth - margin * 2;
        const printHeight = (canvas.height * printWidth) / canvas.width;

        let heightLeft = printHeight;
        let position = margin;

        pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight);
        heightLeft -= (pdfHeight - margin * 2);

        while (heightLeft > 0) {
          position = heightLeft - printHeight + margin;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight);
          heightLeft -= (pdfHeight - margin * 2);
        }

        // Trigger native download
        triggerPdfDownload(pdf, pdfFileName);
        return true;
      }
    } catch (e) {
      console.warn("HTML Canvas capture failed or timed out. Falling back to direct Vector jsPDF generator:", e);
    }
  }

  // Fallback / Direct Vector jsPDF Generator (A4, High Resolution, Vector Quality)
  return buildDirectVectorPDF(order, settings, branding, pdfFileName);
}

function buildDirectVectorPDF(order: any, settings: any, branding: any, pdfFileName: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const currency = settings?.currencySymbol || 'BDT ';
  const storeName = settings?.storeName || branding?.siteTitle || 'TAZU MART BD';
  const hotline = settings?.contactPhone || '+880 1314-541738';
  const website = settings?.websiteUrl || 'www.tazumartbd.com';
  const address = settings?.storeAddress || 'Dhaka, Bangladesh';

  const orderId = order.orderId || order.id || '892341';
  const invoicePrefix = settings?.invoicePrefix || 'INV-';
  const invoiceId = order.invoiceId || `${invoicePrefix}${orderId}`;
  
  const customerName = order.customerName || order.fullName || 'Valued Customer';
  const mobileNumber = order.mobileNumber || order.phone || '+880 1700-000000';
  const fullAddress = order.fullAddress || order.address || 'Dhaka, Bangladesh';
  const dateStr = order.date ? new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB');

  // --- HEADER SECTION ---
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 38, 'F');

  // Store Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(storeName.toUpperCase(), 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text(`${address} | Phone: ${hotline} | ${website}`, 14, 26);

  // INVOICE BADGE
  doc.setFillColor(245, 158, 11); // Amber 500
  doc.roundedRect(145, 10, 51, 18, 2, 2, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL INVOICE', 148, 17);
  doc.setFontSize(8);
  doc.text(`#${invoiceId}`, 148, 23);

  // --- ORDER METADATA BAR ---
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 44, 182, 24, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('ORDER ID:', 18, 52);
  doc.text('INVOICE DATE:', 65, 52);
  doc.text('PAYMENT METHOD:', 115, 52);
  doc.text('PAYMENT STATUS:', 160, 52);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`#${orderId}`, 18, 60);
  doc.text(dateStr, 65, 60);
  doc.text(String(order.paymentMethod || 'Cash on Delivery').toUpperCase(), 115, 60);
  
  const pStatus = String(order.paymentStatus || 'Unpaid').toUpperCase();
  if (pStatus === 'PAID') {
    doc.setTextColor(16, 185, 129); // Green
  } else {
    doc.setTextColor(217, 119, 6); // Amber
  }
  doc.text(pStatus, 160, 60);

  // --- CUSTOMER & SHIPPING DETAILS ---
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('CUSTOMER / SHIPPING DETAILS', 14, 76);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Name: ${customerName}`, 14, 82);
  doc.text(`Phone: ${mobileNumber}`, 14, 87);
  doc.text(`Address: ${fullAddress}`, 14, 92);

  // --- ITEMS TABLE ---
  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [
    { name: 'Standard Item', quantity: 1, price: order.total || 0 }
  ];

  const tableBody = items.map((item: any, idx: number) => {
    const qty = Number(item.quantity || 1);
    const price = Number(item.price || 0);
    const lineTotal = qty * price;
    return [
      idx + 1,
      item.name + (item.variant ? ` (${item.variant})` : ''),
      qty,
      `${currency} ${price.toLocaleString()}`,
      `${currency} ${lineTotal.toLocaleString()}`
    ];
  });

  autoTable(doc, {
    startY: 98,
    head: [['#', 'Item Description', 'Qty', 'Unit Price', 'Total']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 95 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 29, halign: 'right' }
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [30, 41, 59]
    },
    margin: { left: 14, right: 14 }
  });

  // --- TOTALS SUMMARY BOX ---
  const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 6 : 140;

  const subtotal = items.reduce((sum: number, it: any) => sum + (Number(it.quantity || 1) * Number(it.price || 0)), 0);
  const deliveryCharge = Number(order.deliveryCharge ?? 60);
  const discount = Number(order.discount?.amount || order.discount || 0);
  const grandTotal = Number(order.total ?? (subtotal + deliveryCharge - discount));

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(120, finalY, 76, 36, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  doc.text('Subtotal:', 124, finalY + 8);
  doc.text(`${currency} ${subtotal.toLocaleString()}`, 192, finalY + 8, { align: 'right' });

  doc.text('Delivery Charge:', 124, finalY + 14);
  doc.text(`${currency} ${deliveryCharge.toLocaleString()}`, 192, finalY + 14, { align: 'right' });

  if (discount > 0) {
    doc.text('Discount:', 124, finalY + 20);
    doc.text(`- ${currency} ${discount.toLocaleString()}`, 192, finalY + 20, { align: 'right' });
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(124, finalY + 24, 192, finalY + 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Grand Total:', 124, finalY + 31);
  doc.text(`${currency} ${grandTotal.toLocaleString()}`, 192, finalY + 31, { align: 'right' });

  // --- FOOTER & GUARANTEE ---
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('Thank you for shopping with Tazu Mart BD! For support, contact support@tazumartbd.com', 14, 280);

  // Trigger Save/Download
  triggerPdfDownload(doc, pdfFileName);
  return true;
}

function triggerPdfDownload(doc: jsPDF, fileName: string) {
  try {
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    // Secondary save call for browser popup handlers
    try {
      doc.save(fileName);
    } catch (err) {
      console.warn("doc.save secondary call handled:", err);
    }

    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(blobUrl);
    }, 4000);
  } catch (err) {
    console.error("Trigger PDF Download error:", err);
    doc.save(fileName);
  }
}
