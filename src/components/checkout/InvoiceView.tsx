import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useBrandingStore } from "../../store/useBrandingStore";
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
  QrCode,
  Barcode
} from "lucide-react";

interface InvoiceViewProps {
  order: any;
  onBack: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ order, onBack }) => {
  const invoiceRef = useRef(null);
  const { settings } = useSettingsStore();
  const { settings: branding } = useBrandingStore();

  const subtotal = order.items.reduce(
    (acc: number, p: any) => acc + p.quantity * p.price,
    0
  );
  
  const deliveryCharge = order.deliveryCharge || 0;
  const discountAmount = order.discount?.amount || 0;
  const grandTotal = order.total;
  const currency = settings.currencySymbol || '৳';

  const downloadInvoice = async () => {
    const element = document.getElementById("invoice");
    if (!element) return;
    
    const opt = {
      margin: 0,
      filename: `invoice-${settings.invoicePrefix || 'INV-'}${order.orderId}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };
    
    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.orderId);
    alert('Order ID copied to clipboard');
  };

  const shareViaWhatsApp = () => {
    const text = `Check out my invoice for Order #${order.orderId} at Tazu Mart BD!`;
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-8 px-4 md:py-12 font-sans selection:bg-neutral-900 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Controls - Hidden on print */}
        <div className="flex flex-wrap items-center justify-between gap-4 no-print bg-white p-4 rounded-3xl border border-neutral-200 shadow-sm">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-900 rounded-xl font-bold text-sm transition-all active:scale-95 border border-neutral-200"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={copyOrderId}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-xl font-bold text-sm transition-all active:scale-95 border border-neutral-200"
            >
              <Copy className="w-4 h-4" />
              Copy ID
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-xl font-bold text-sm transition-all active:scale-95 border border-neutral-200"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Invoice Paper */}
        <div
          id="invoice"
          ref={invoiceRef}
          className="bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] rounded-[40px] overflow-hidden border border-neutral-200"
          style={{ width: "100%", minHeight: "297mm" }}
        >
          {/* Header Banner */}
          <div className="bg-neutral-950 p-10 md:p-14 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {settings.storeLogo || branding.primary_logo ? (
                    <img src={settings.storeLogo || branding.primary_logo} alt="Logo" className="h-14 w-auto object-contain brightness-0 invert" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-black font-black text-2xl">
                      {settings.storeName?.[0] || "T"}
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight leading-none mb-1">
                      {settings.storeName || "TAZU MART BD"}
                    </h1>
                    <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">Premium Shopping Experience</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 text-[11px] font-bold text-neutral-400 uppercase tracking-widest pt-2">
                  <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {settings.contactNumber || "8801314541738"}</div>
                  <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {settings.storeEmail || "support@tazumart.com"}</div>
                  <div className="flex items-center gap-2"><Globe className="w-3 h-3" /> www.tazumartbd.com</div>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-5xl font-black uppercase tracking-tighter opacity-20 mb-2">INVOICE</h2>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Issued On</p>
                  <p className="text-lg font-black">{new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 md:p-14">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] mb-4">Billed To</h3>
                  <div className="space-y-1">
                    <p className="text-xl font-black text-neutral-900">{order.customerName}</p>
                    <p className="text-sm font-bold text-neutral-600">{order.mobileNumber}</p>
                    <p className="text-sm font-medium text-neutral-500 leading-relaxed max-w-xs">{order.fullAddress}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6 md:text-right">
                <div className="grid grid-cols-2 gap-8 md:flex md:flex-col md:gap-6">
                  <div>
                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] mb-1">Invoice Number</h3>
                    <p className="text-base font-black text-neutral-900">#INV-{order.orderId.split('-').pop()}</p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] mb-1">Reference</h3>
                    <p className="text-base font-black text-neutral-900">#{order.orderId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Table */}
            <div className="mb-16">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-neutral-900">
                    <th className="pb-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Item Description</th>
                    <th className="pb-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-center">Qty</th>
                    <th className="pb-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Unit Price</th>
                    <th className="pb-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {order.items.map((item: any, idx: number) => (
                    <tr key={idx} className="group">
                      <td className="py-6">
                        <p className="text-base font-black text-neutral-900 mb-1">{item.name}</p>
                        <p className="text-xs font-bold text-neutral-400 uppercase">Product SKU: #{idx + 100}</p>
                      </td>
                      <td className="py-6 text-center text-base font-bold text-neutral-900">{item.quantity}</td>
                      <td className="py-6 text-right text-base font-bold text-neutral-900">{currency}{item.price.toLocaleString()}</td>
                      <td className="py-6 text-right text-base font-black text-neutral-900">{currency}{(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 pt-8 border-t border-neutral-900">
              <div className="flex-1 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">Payment Method</h3>
                    <div className="inline-flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-black text-neutral-900 uppercase">{order.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">Payment Status</h3>
                    <div className="inline-flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-[10px] font-black text-orange-700 uppercase">Pending</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 opacity-30 pt-4">
                  <QrCode className="w-16 h-16" strokeWidth={1} />
                  <Barcode className="w-24 h-16" strokeWidth={1} />
                </div>
              </div>

              <div className="w-full md:w-72 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-neutral-400 uppercase tracking-widest">Subtotal</span>
                  <span className="font-bold text-neutral-900">{currency}{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-neutral-400 uppercase tracking-widest">Shipping</span>
                  <span className="font-bold text-neutral-900">{currency}{deliveryCharge.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-emerald-500 uppercase tracking-widest">Discount</span>
                    <span className="font-bold text-emerald-500">-{currency}{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-4 border-t-2 border-neutral-900">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-neutral-950 uppercase tracking-widest">Grand Total</span>
                    <span className="text-3xl font-black text-neutral-950">{currency}{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures & Footer */}
            <div className="mt-24 pt-12 border-t border-neutral-100">
              <div className="grid grid-cols-2 gap-12 mb-16">
                <div className="space-y-4">
                  <div className="h-16 w-40 border-b border-neutral-300 relative flex items-end justify-center pb-2">
                    <p className="text-[10px] font-serif italic text-neutral-400">Digital Signature</p>
                  </div>
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Customer Signature</p>
                </div>
                <div className="space-y-4 text-right flex flex-col items-end">
                  <div className="h-16 w-40 border-b border-neutral-300 relative flex items-end justify-center pb-2">
                    <p className="text-[10px] font-serif italic text-neutral-900 opacity-50">Tazu Mart Admin</p>
                  </div>
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Authorized Signature</p>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs font-black text-neutral-900 uppercase tracking-[0.2em]">Thank You For Shopping ❤️</p>
                </div>
                <p className="text-[10px] text-neutral-400 font-medium leading-relaxed max-w-sm mx-auto">
                  {settings.invoiceFooterText || "This is a computer generated document. No signature is required for digital verification."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Row - Hidden on print */}
        <div className="flex flex-wrap items-center justify-center gap-4 no-print bg-neutral-950 p-6 rounded-[32px] shadow-2xl">
          <button
            onClick={downloadInvoice}
            className="flex-1 h-14 bg-white hover:bg-neutral-100 text-neutral-950 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={shareViaWhatsApp}
            className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
          >
            <Share2 className="w-4 h-4" />
            Share WhatsApp
          </button>
        </div>

      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; margin: 0 !important; padding: 0 !important; }
          .min-h-screen { min-height: 0 !important; padding: 0 !important; }
          #invoice { border: none !important; shadow: none !important; border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
};