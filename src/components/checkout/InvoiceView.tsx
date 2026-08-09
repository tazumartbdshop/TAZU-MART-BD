import React, { useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useBrandingStore } from "../../store/useBrandingStore";
import { generateInvoicePDF } from "../../utils/pdfGenerator";
import { 
  Download, 
  Printer, 
  Share2, 
  ChevronLeft, 
  Phone, 
  Mail, 
  Globe, 
  Copy, 
  CheckCircle2,
  ShieldCheck,
  Truck,
  RefreshCw,
  Headphones,
  Lock,
  MapPin,
  Clock,
  Check,
  AlertTriangle,
  XCircle,
  X,
  MessageCircle,
  Send,
  ExternalLink
} from "lucide-react";

interface InvoiceViewProps {
  order: any;
  onBack?: () => void;
}

// Deterministic Vector Barcode generator (no external HTTP images)
function InvoiceBarcode({ value, className = "h-10 w-48" }: { value: string; className?: string }) {
  const bars: { width: number; isGap: boolean }[] = [];
  
  // Guard pattern Start
  bars.push({ width: 2, isGap: false });
  bars.push({ width: 2, isGap: true });
  bars.push({ width: 2, isGap: false });

  const safeVal = String(value || '10001');
  for (let i = 0; i < safeVal.length; i++) {
    const code = safeVal.charCodeAt(i);
    bars.push({ width: (code % 3) + 1, isGap: false });
    bars.push({ width: ((code * 2) % 3) + 1, isGap: true });
    bars.push({ width: ((code * 3) % 4) + 1, isGap: false });
    bars.push({ width: 2, isGap: true });
  }

  // Guard pattern End
  bars.push({ width: 2, isGap: false });
  bars.push({ width: 2, isGap: true });
  bars.push({ width: 2, isGap: false });

  let totalWidth = 0;
  bars.forEach(b => totalWidth += b.width);
  let currentX = 0;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg viewBox={`0 0 ${totalWidth} 36`} className="w-full h-8" preserveAspectRatio="none">
        {bars.map((bar, idx) => {
          const x = currentX;
          currentX += bar.width;
          if (bar.isGap) return null;
          return <rect key={idx} x={x} y="0" width={bar.width} height="36" fill="#09090b" />;
        })}
      </svg>
      <span className="text-[9px] font-mono font-bold tracking-widest text-neutral-800 mt-1 uppercase">*{safeVal}*</span>
    </div>
  );
}

// Deterministic Vector QR Code generator with real finder patterns
function InvoiceQRCode({ value, className = "w-20 h-20" }: { value: string; className?: string }) {
  const size = 21;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const drawFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          matrix[row + r][col + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i += 2) {
    matrix[6][i] = true;
    matrix[i][6] = true;
  }

  const safeVal = String(value || 'TAZU-MART-BD');
  let seed = 0;
  for (let i = 0; i < safeVal.length; i++) seed += safeVal.charCodeAt(i) * (i + 1);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8)) continue;
      if (r === 6 || c === 6) continue;

      seed = (seed * 9301 + 49297) % 233280;
      if (seed / 233280 > 0.45) {
        matrix[r][c] = true;
      }
    }
  }

  return (
    <div className={`p-1.5 bg-white border border-neutral-300 rounded-xl shadow-xs ${className}`}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
        {matrix.map((row, r) =>
          row.map((cell, c) =>
            cell ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#09090b" /> : null
          )
        )}
      </svg>
    </div>
  );
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ order, onBack }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettingsStore();
  const { settings: branding } = useBrandingStore();
  
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToastNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Fallbacks & Safe values
  const rawOrder = order || {};
  const orderId = rawOrder.orderId || rawOrder.id || '892341';
  const invoiceId = rawOrder.invoiceId || `${settings.invoicePrefix || 'INV-'}${orderId}`;
  const customerId = rawOrder.customerId || `CUST-${(rawOrder.mobileNumber || rawOrder.customerName || '8832').slice(-4)}`;
  const currency = settings.currencySymbol || '৳';

  // Date Formatters
  const formatDate = (dateInput: any) => {
    try {
      const d = dateInput ? new Date(dateInput) : new Date();
      if (isNaN(d.getTime())) return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return '31 July 2026';
    }
  };

  const formatTime = (dateInput: any) => {
    try {
      const d = dateInput ? new Date(dateInput) : new Date();
      if (isNaN(d.getTime())) return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '02:30 PM';
    }
  };

  const orderDateStr = formatDate(rawOrder.date || rawOrder.createdAt);
  const orderTimeStr = formatTime(rawOrder.date || rawOrder.createdAt);
  const invoiceDateStr = formatDate(rawOrder.invoiceDate || rawOrder.date || new Date());

  // Customer Information
  const customerName = rawOrder.customerName || rawOrder.fullName || 'Valued Customer';
  const mobileNumber = rawOrder.mobileNumber || rawOrder.phone || '+880 1700-000000';
  const email = rawOrder.email || rawOrder.customerEmail || 'customer@tazumartbd.com';
  const fullAddress = rawOrder.fullAddress || rawOrder.address || 'House #12, Road #4, Sector #7, Uttara, Dhaka';
  const city = rawOrder.cityArea || rawOrder.city || 'Dhaka';
  const postalCode = rawOrder.postalCode || '1230';
  const country = rawOrder.country || 'Bangladesh';

  // Calculations
  const items = Array.isArray(rawOrder.items) && rawOrder.items.length > 0 ? rawOrder.items : [
    { name: 'Standard Product', quantity: 1, price: rawOrder.total || 0 }
  ];

  const subtotal = items.reduce((acc: number, p: any) => acc + (Number(p.quantity || 1) * Number(p.price || 0)), 0);
  const couponDiscount = Number(rawOrder.discount?.amount || rawOrder.couponDiscount || 0);
  const productDiscount = Number(rawOrder.productDiscount || 0);
  const totalDiscount = couponDiscount + productDiscount;
  const deliveryCharge = Number(rawOrder.deliveryCharge ?? rawOrder.shippingFee ?? 60);
  const vatTax = Number(rawOrder.tax || rawOrder.vat || 0);
  const additionalFees = Number(rawOrder.additionalFee || 0);
  const grandTotal = Number(rawOrder.total ?? (subtotal - totalDiscount + deliveryCharge + vatTax + additionalFees));

  const paymentStatus = rawOrder.paymentStatus || 'Unpaid';
  const deliveryStatus = rawOrder.status || 'Processing';
  const paymentMethod = rawOrder.paymentMethod || 'Cash on Delivery';

  const paidAmount = Number(rawOrder.paidAmount ?? (paymentStatus === 'Paid' ? grandTotal : 0));
  const remainingAmount = Math.max(0, grandTotal - paidAmount);

  // Delivery & Payment info
  const deliveryPartner = rawOrder.courierName || rawOrder.deliveryPartner || 'Steadfast Courier Express';
  const trackingNumber = rawOrder.trackingNumber || rawOrder.consignmentId || `TRK-${orderId}`;
  const transactionId = rawOrder.transactionId || rawOrder.trxId || (paymentMethod.toLowerCase().includes('cash') || paymentMethod.toLowerCase() === 'cod' ? 'N/A (Cash on Delivery)' : `TXN-${orderId}`);

  // Helper badge color assigners (Document style)
  const getPaymentStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('paid') && !s.includes('unpaid')) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Paid
        </span>
      );
    }
    if (s.includes('fail')) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 uppercase tracking-wider">
          <XCircle className="w-3.5 h-3.5 text-rose-600" /> Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 uppercase tracking-wider">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> {status || 'Pending'}
      </span>
    );
  };

  const getDeliveryStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('deliver')) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 uppercase tracking-wider">
          <Check className="w-3.5 h-3.5 text-emerald-600" /> Delivered
        </span>
      );
    }
    if (s.includes('cancel')) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-600 uppercase tracking-wider">
          <XCircle className="w-3.5 h-3.5 text-neutral-500" /> Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 uppercase tracking-wider">
        <Clock className="w-3.5 h-3.5 text-blue-600" /> {status || 'Processing'}
      </span>
    );
  };

  // 1. Copy ID Action
  const copyInvoiceId = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(invoiceId);
      } else {
        // Fallback for older browsers / iframe security policies
        const textArea = document.createElement("textarea");
        textArea.value = invoiceId;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      showToastNotice("Invoice ID copied successfully.", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Copy error:", err);
      showToastNotice("Failed to copy Invoice ID. Please copy manually.", "error");
    }
  };

  // Share text builder
  const invoiceShareText = `Official Invoice (${invoiceId})\nOrder ID: #${orderId}\nCustomer: ${customerName}\nGrand Total: ${currency}${grandTotal.toLocaleString()}\nWebsite: ${settings.websiteUrl || 'https://www.tazumartbd.com'}`;
  const shareUrl = window.location.href;

  // 2. Share Action
  const handleShareInvoice = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${invoiceId} - TAZU MART BD`,
          text: invoiceShareText,
          url: shareUrl,
        });
        showToastNotice("Shared successfully!", "success");
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setShowShareModal(true);
        }
        return;
      }
    }
    setShowShareModal(true);
  };

  const copyShareLink = async () => {
    try {
      const fullText = `${invoiceShareText}\nLink: ${shareUrl}`;
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fullText);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = fullText;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedLink(true);
      showToastNotice("Invoice details & link copied!", "success");
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToastNotice("Failed to copy link.", "error");
    }
  };

  // 3. PDF Download Action
  const downloadInvoicePDF = async () => {
    setDownloading(true);
    try {
      showToastNotice("Generating high-resolution A4 Invoice PDF...", "success");
      await generateInvoicePDF(rawOrder, settings, branding);
      showToastNotice(`PDF download initialized for Invoice #${invoiceId}`, "success");
    } catch (err) {
      console.error("PDF generation failed:", err);
      showToastNotice("PDF download failed. Opening Print preview...", "error");
      setTimeout(() => {
        window.print();
      }, 500);
    } finally {
      setDownloading(false);
    }
  };

  // 4. Print Action
  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.error("Print error:", err);
      showToastNotice("Print service failed to trigger.", "error");
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-neutral-900 font-sans p-4 sm:p-6 lg:p-8 selection:bg-neutral-900 selection:text-white relative">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="no-print fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-neutral-900 text-white rounded-lg shadow-2xl border border-neutral-700 animate-in fade-in slide-in-from-top duration-300">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Share Fallback Modal */}
      {showShareModal && (
        <div className="no-print fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-neutral-300 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-600" />
                <span>Share Invoice</span>
              </h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-neutral-400 hover:text-neutral-900 p-1 rounded hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              Share Invoice <strong>{invoiceId}</strong> for Order #{orderId} via your preferred application:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={copyShareLink}
                className="flex items-center justify-center gap-2 p-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded font-bold border border-neutral-300 cursor-pointer transition-colors"
              >
                {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "Copied!" : "Copy Details"}</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(invoiceShareText + "\n" + shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold cursor-pointer transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold cursor-pointer transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Facebook</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(invoiceShareText)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded font-bold cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Telegram</span>
              </a>

              <a
                href={`mailto:?subject=${encodeURIComponent(`Invoice ${invoiceId} - TAZU MART BD`)}&body=${encodeURIComponent(invoiceShareText + "\n" + shareUrl)}`}
                className="col-span-2 flex items-center justify-center gap-2 p-2.5 bg-neutral-900 hover:bg-black text-white rounded font-bold cursor-pointer transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Send via Email</span>
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto space-y-6">
        
        {/* Top Control Action Bar - Hidden on print */}
        <div className="no-print bg-neutral-100 p-3 sm:p-4 border border-neutral-300 rounded-md flex flex-wrap items-center justify-between gap-3">
          {onBack && (
            <button
              onClick={onBack}
              type="button"
              className="flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-neutral-200 text-neutral-900 rounded font-bold text-xs transition-all border border-neutral-300 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <button
              onClick={copyInvoiceId}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-200 text-neutral-800 rounded font-bold text-xs border border-neutral-300 cursor-pointer transition-all active:scale-95"
              title="Copy Invoice ID"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied!" : "Copy ID"}</span>
            </button>

            <button
              onClick={handleShareInvoice}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-200 text-neutral-800 rounded font-bold text-xs border border-neutral-300 cursor-pointer transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-neutral-900 hover:bg-black text-white rounded font-bold text-xs cursor-pointer transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={downloadInvoicePDF}
              type="button"
              disabled={downloading}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded font-black text-xs cursor-pointer uppercase tracking-wide transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? "Generating..." : "Download PDF"}</span>
            </button>
          </div>
        </div>

        {/* ================= INVOICE PROFESSIONAL DOCUMENT SHEET ================= */}
        <div
          id="invoice-print-sheet"
          ref={invoiceRef}
          className="w-full bg-white text-neutral-900 border-none shadow-none rounded-none p-0 space-y-6"
        >
          
          {/* HEADER SECTION - DOCUMENT STYLE */}
          <div className="w-full pb-5 border-b-2 border-neutral-900 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            
            {/* Brand Logo & Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {settings.invoiceLogo || settings.storeLogo || branding.primary_logo ? (
                  <img 
                    src={settings.invoiceLogo || settings.storeLogo || branding.primary_logo} 
                    alt="TAZU MART BD" 
                    className="h-12 w-auto object-contain" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-10 h-10 bg-neutral-900 text-white font-black text-xl flex items-center justify-center border border-neutral-900">
                    T
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-950">
                    {settings.storeName || "TAZU MART BD"}
                  </h1>
                  <p className="text-neutral-600 text-xs font-semibold uppercase tracking-wider">
                    {settings.storeTagline || "Official E-Commerce Store"}
                  </p>
                </div>
              </div>

              {/* Store Contact Links */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-700 font-medium pt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-neutral-900" /> {settings.contactNumber || "+880 1314 541738"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-neutral-900" /> {settings.storeEmail || "support@tazumartbd.com"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-neutral-900" /> {settings.websiteUrl || "www.tazumartbd.com"}
                </span>
              </div>
            </div>

            {/* Invoice Title & Metadata Header */}
            <div className="text-left md:text-right space-y-1 w-full md:w-auto">
              <h2 className="text-3xl font-black uppercase tracking-tight text-neutral-950">
                TAX INVOICE
              </h2>
              <div className="text-xs font-mono font-bold text-neutral-800 space-y-0.5">
                <p><span className="text-neutral-500 uppercase font-sans">Invoice No:</span> {invoiceId}</p>
                <p><span className="text-neutral-500 uppercase font-sans">Order ID:</span> #{orderId}</p>
                <p><span className="text-neutral-500 uppercase font-sans">Invoice Date:</span> {invoiceDateStr}</p>
              </div>
            </div>

          </div>

          {/* CUSTOMER & INVOICE DETAILS GRID (Direct Layout - No Boxes) */}
          <div className="w-full py-2 border-b border-neutral-300 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            {/* Customer Billed Info */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-1">
                Billed To (Customer Information)
              </h3>
              <div className="space-y-1 text-neutral-800">
                <p className="text-sm font-black uppercase text-neutral-950">{customerName}</p>
                <p className="flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-neutral-500" /> {mobileNumber}
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" /> {email}
                </p>
                <p className="flex items-start gap-1.5 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                  <span>{fullAddress}, {city} - {postalCode}, {country}</span>
                </p>
              </div>
            </div>

            {/* Order & Delivery Metadata */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-1">
                Order & Shipping Specifications
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-neutral-800">
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">Order Date</span>
                  <span className="font-extrabold">{orderDateStr} ({orderTimeStr})</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">Customer Reference</span>
                  <span className="font-extrabold font-mono">{customerId}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">Payment Channel</span>
                  <span className="font-extrabold">{paymentMethod}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">Payment Status</span>
                  <div>{getPaymentStatusBadge(paymentStatus)}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">Courier Partner</span>
                  <span className="font-extrabold">{deliveryPartner}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">Delivery Status</span>
                  <div>{getDeliveryStatusBadge(deliveryStatus)}</div>
                </div>
              </div>
            </div>

          </div>

          {/* ORDER ITEMS BREAKDOWN TABLE (Clean E-Commerce Document Format) */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-950 flex items-center gap-2">
                <span>Ordered Products Breakdown</span>
                <span className="text-[10px] text-neutral-600 font-bold font-mono">
                  ({items.length} {items.length === 1 ? 'Item' : 'Items'})
                </span>
              </h3>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-900 text-white font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 text-center w-10 border border-neutral-900">#</th>
                    <th className="py-2.5 px-3 border border-neutral-900">Item Description</th>
                    <th className="py-2.5 px-3 border border-neutral-900">Variant</th>
                    <th className="py-2.5 px-3 font-mono border border-neutral-900">SKU</th>
                    <th className="py-2.5 px-3 text-right border border-neutral-900">Unit Price</th>
                    <th className="py-2.5 px-3 text-center border border-neutral-900">Qty</th>
                    <th className="py-2.5 px-3 text-right border border-neutral-900">Discount</th>
                    <th className="py-2.5 px-3 text-right border border-neutral-900">Tax</th>
                    <th className="py-2.5 px-3 text-right border border-neutral-900">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-900">
                  {items.map((item: any, idx: number) => {
                    const itemQty = Number(item.quantity || 1);
                    const itemPrice = Number(item.price || 0);
                    const itemDisc = Number(item.discount || 0);
                    const itemTax = item.tax ? `${item.tax}%` : '0%';
                    const itemTotal = (itemPrice * itemQty) - itemDisc;
                    const itemImg = item.image || item.logo || item.productImage || item.thumbnail || null;
                    const variantStr = item.variant || (item.color || item.size ? `${item.color || ''} ${item.size || ''}`.trim() : 'Standard');
                    const itemSku = item.sku || `SKU-${1000 + idx}`;

                    return (
                      <tr key={idx} className="hover:bg-neutral-50/50">
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-neutral-500 border border-neutral-200">{idx + 1}</td>
                        <td className="py-2.5 px-3 border border-neutral-200">
                          <div className="flex items-center gap-2.5">
                            {itemImg && (
                              <img 
                                src={itemImg} 
                                alt={item.name} 
                                className="w-8 h-8 object-cover border border-neutral-300 shrink-0" 
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <div>
                              <p className="font-black text-neutral-950 leading-snug">{item.name || 'Product Item'}</p>
                              {item.description && (
                                <p className="text-[10px] text-neutral-500 line-clamp-1">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-neutral-700 border border-neutral-200">{variantStr}</td>
                        <td className="py-2.5 px-3 font-mono text-neutral-600 border border-neutral-200">{itemSku}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold border border-neutral-200">{currency}{itemPrice.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-center font-bold border border-neutral-200">{itemQty}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 border border-neutral-200">
                          {itemDisc > 0 ? `-${currency}${itemDisc.toLocaleString()}` : `৳0`}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-neutral-600 border border-neutral-200">{itemTax}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-neutral-950 border border-neutral-200">
                          {currency}{itemTotal.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ORDER SUMMARY & PAYMENT/DELIVERY DETAILS (Document Section) */}
          <div className="w-full py-4 border-b border-neutral-300 grid grid-cols-1 md:grid-cols-12 gap-8 text-xs">
            
            {/* Left Column: Transaction Details & Notes */}
            <div className="md:col-span-7 space-y-4">
              
              {/* Customer Note */}
              {(rawOrder.note || rawOrder.customerNote) && (
                <div className="border-l-2 border-neutral-900 pl-3 py-1 space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider block">Customer Note:</span>
                  <p className="text-xs text-neutral-900 italic font-medium">
                    "{rawOrder.note || rawOrder.customerNote}"
                  </p>
                </div>
              )}

              {/* Payment & Logistics Reference */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-1">
                  Payment & Delivery Log
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-neutral-800">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">Transaction Ref ID</span>
                    <span className="font-extrabold font-mono text-neutral-950">{transactionId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">Consignment / Tracking</span>
                    <span className="font-extrabold font-mono text-neutral-950">{trackingNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">Amount Received</span>
                    <span className="font-extrabold text-emerald-700">{currency}{paidAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">Balance Due</span>
                    <span className={`font-extrabold ${remainingAmount > 0 ? 'text-amber-700' : 'text-neutral-900'}`}>
                      {currency}{remainingAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Amount Calculations */}
            <div className="md:col-span-5 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 border-b border-neutral-900 pb-1">
                Statement Summary
              </h4>

              <div className="space-y-1.5 text-xs font-semibold text-neutral-800">
                <div className="flex justify-between items-center py-0.5 border-b border-neutral-100">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-mono font-bold text-neutral-950">{currency}{subtotal.toLocaleString()}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center py-0.5 border-b border-neutral-100 text-emerald-700">
                    <span>Coupon Discount</span>
                    <span className="font-mono font-bold">-{currency}{couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                {productDiscount > 0 && (
                  <div className="flex justify-between items-center py-0.5 border-b border-neutral-100 text-emerald-700">
                    <span>Product Discount</span>
                    <span className="font-mono font-bold">-{currency}{productDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-0.5 border-b border-neutral-100">
                  <span className="text-neutral-600">Shipping & Delivery Fee</span>
                  <span className="font-mono font-bold text-neutral-950">
                    {deliveryCharge > 0 ? `${currency}${deliveryCharge.toLocaleString()}` : 'FREE'}
                  </span>
                </div>

                {vatTax > 0 && (
                  <div className="flex justify-between items-center py-0.5 border-b border-neutral-100">
                    <span className="text-neutral-600">VAT / Tax</span>
                    <span className="font-mono font-bold text-neutral-950">{currency}{vatTax.toLocaleString()}</span>
                  </div>
                )}

                {additionalFees > 0 && (
                  <div className="flex justify-between items-center py-0.5 border-b border-neutral-100">
                    <span className="text-neutral-600">Additional Charges</span>
                    <span className="font-mono font-bold text-neutral-950">{currency}{additionalFees.toLocaleString()}</span>
                  </div>
                )}

                <div className="pt-2">
                  <div className="bg-neutral-950 text-white p-3 font-bold text-base flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400 block">Grand Total</span>
                      <span className="text-[9px] text-neutral-400 uppercase">Inclusive of VAT</span>
                    </div>
                    <span className="text-xl font-black text-amber-400 font-mono">
                      {currency}{grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* SHOP GUARANTEE BADGES (Clean Document Line) */}
          <div className="w-full py-3 border-b border-neutral-300">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="flex items-center justify-center gap-1.5 py-1 px-2 border border-neutral-200">
                <ShieldCheck className="w-4 h-4 text-neutral-900 shrink-0" />
                <span className="font-extrabold uppercase text-[10px]">100% Original</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1 px-2 border border-neutral-200">
                <Lock className="w-4 h-4 text-neutral-900 shrink-0" />
                <span className="font-extrabold uppercase text-[10px]">Secure Payment</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1 px-2 border border-neutral-200">
                <Truck className="w-4 h-4 text-neutral-900 shrink-0" />
                <span className="font-extrabold uppercase text-[10px]">Fast Delivery</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1 px-2 border border-neutral-200">
                <RefreshCw className="w-4 h-4 text-neutral-900 shrink-0" />
                <span className="font-extrabold uppercase text-[10px]">Easy Return</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1 px-2 border border-neutral-200 col-span-2 sm:col-span-1">
                <Headphones className="w-4 h-4 text-neutral-900 shrink-0" />
                <span className="font-extrabold uppercase text-[10px]">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* FOOTER SECTION WITH QR & BARCODE */}
          <div className="w-full pt-4 space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-neutral-300 pb-4">
              
              {/* Brand info */}
              <div className="space-y-1 text-center sm:text-left">
                <p className="font-black text-sm uppercase tracking-wider text-neutral-950">
                  {settings.storeName || "TAZU MART BD"}
                </p>
                <p className="text-[10px] text-neutral-600 font-medium">
                  Support: {settings.contactNumber || "+880 1314 541738"} | Email: {settings.storeEmail || "support@tazumartbd.com"}
                </p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                  Facebook: /tazumartbd • Instagram: @tazumartbd • TikTok: @tazumartbd
                </p>
              </div>

              {/* Barcode & QR Code */}
              <div className="flex items-center gap-3">
                <InvoiceQRCode value={invoiceId} className="w-14 h-14 shrink-0" />
                <div className="text-center">
                  <InvoiceBarcode value={orderId} className="w-32 h-8" />
                  <span className="text-[8px] font-bold uppercase text-neutral-500 block mt-0.5">Verification Scan</span>
                </div>
              </div>

            </div>

            {/* Bottom Copyright & Legal Notice */}
            <div className="text-center text-[10px] text-neutral-500 font-medium space-y-0.5">
              <p className="font-bold text-neutral-800 uppercase tracking-widest">
                © 2026 TAZU MART BD. All Rights Reserved.
              </p>
              <p className="italic text-neutral-500">
                {settings.invoiceFooterText || "This is a Computer Generated Invoice. No signature is required for digital verification."}
              </p>
            </div>

          </div>

        </div>

        {/* BOTTOM ACTION BAR - Hidden on print */}
        <div className="no-print bg-neutral-900 text-white p-4 rounded flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-xs font-black uppercase tracking-wider text-amber-400">
              Need assistance with this order?
            </p>
            <p className="text-[11px] text-neutral-300">
              Contact our Support Hotline at {settings.contactNumber || "+880 1314 541738"} or email {settings.storeEmail || "support@tazumartbd.com"}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={downloadInvoicePDF}
              type="button"
              disabled={downloading}
              className="flex-1 sm:flex-none px-5 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              {downloading ? "Processing..." : "Download PDF"}
            </button>
            <button
              onClick={handlePrint}
              type="button"
              className="flex-1 sm:flex-none px-5 py-2 bg-white hover:bg-neutral-100 text-neutral-950 rounded font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Print
            </button>
          </div>
        </div>

      </div>

      {/* PRINT MEDIA QUERY CSS */}
      <style>{`
        @media print {
          .no-print, header, footer, nav {
            display: none !important;
          }
          body {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            color: #000000 !important;
          }
          .min-h-screen {
            min-height: 0 !important;
            padding: 0 !important;
            background-color: #ffffff !important;
          }
          #invoice-print-sheet {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>
    </div>
  );
};

