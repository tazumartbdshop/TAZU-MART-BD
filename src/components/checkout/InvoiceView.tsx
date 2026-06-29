import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useBrandingStore } from "../../store/useBrandingStore";

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
  const grandTotal = order.total;
  const currency = settings.currencySymbol || '৳';

  const downloadInvoice = async () => {
    const element = document.getElementById("invoice");
    if (!element) return;
    
    const opt = {
      margin: 5,
      filename: `invoice-${settings.invoicePrefix || 'INV-'}${order.orderId}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };
    
    try {
      await html2pdf().set(opt).from(element).save();
      alert('Invoice Downloaded Successfully');
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to download invoice');
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const shareInvoice = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${order.orderId}`,
          text: `Here is your invoice for order ${order.orderId}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert('Sharing not supported on this browser');
    }
  };

  return (
    <div className={`min-h-screen p-4 font-sans text-[14px] text-black overflow-x-hidden ${settings.invoiceTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-[#FFFFFF] text-black'}`}>
      <div className="max-w-[190mm] mx-auto">
        {/* Buttons - Hidden on print */}
        <div className="flex gap-4 justify-center mb-10 no-print flex-wrap">
          <button
            onClick={downloadInvoice}
            className="bg-black text-white px-6 py-3 rounded-md text-sm font-bold border border-black transition-all hover:bg-neutral-800"
          >
            Download Invoice
          </button>
          <button
            onClick={printInvoice}
            className="bg-white text-black border border-black px-6 py-3 rounded-md text-sm font-bold transition-all hover:bg-neutral-100"
          >
            Print
          </button>
          <button
            onClick={shareInvoice}
            className="bg-white text-black border border-black px-6 py-3 rounded-md text-sm font-bold transition-all hover:bg-neutral-100"
          >
            Share
          </button>
          <button
            onClick={onBack}
            className="bg-white text-black border border-black px-6 py-3 rounded-md text-sm font-bold transition-all hover:bg-neutral-100"
          >
            Back to Home
          </button>
        </div>

        {/* Invoice Component */}
        <div
          id="invoice"
          ref={invoiceRef}
          className="invoice-container mx-auto box-border"
          style={{ width: "100%", maxWidth: "190mm", minHeight: "277mm", padding: "10mm", backgroundColor: settings.invoiceTheme === 'dark' ? '#1f2937' : '#FFFFFF', color: settings.invoiceTheme === 'dark' ? '#ffffff' : '#000000' }}
        >
          {/* Header */}
          <div className="border-b pb-6 mb-6" style={{ borderColor: '#d1d5db' }}>
            <div className="flex items-center gap-3 mb-2">
              {settings.storeLogo || settings.invoiceLogo || branding.invoice_logo || branding.primary_logo ? (
                <img src={settings.storeLogo || settings.invoiceLogo || branding.invoice_logo || branding.primary_logo} alt="Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 bg-black rounded flex items-center justify-center text-white font-black text-lg">
                  {(settings.storeName || branding.site_name || 'T')[0]}
                </div>
              )}
              <h1 className="text-xl font-black uppercase">{settings.storeName || branding.site_name || 'TAZU MART BD'}</h1>
            </div>
            <div className="text-[14px]">
                <p>{settings.storeEmail}</p>
                <p>{settings.contactNumber}</p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="mb-6">
            <h2 className="text-[18px] font-bold uppercase mb-2 border-b pb-1" style={{ borderColor: '#d1d5db' }}>Customer Details</h2>
            <div className="space-y-1">
                <p><strong>Name:</strong> {order.customerName}</p>
                <p><strong>Phone:</strong> {order.mobileNumber}</p>
                <p><strong>Address:</strong> {order.fullAddress}</p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="mb-6">
            <h2 className="text-[18px] font-bold uppercase mb-2 border-b pb-1" style={{ borderColor: '#d1d5db' }}>Order Details</h2>
            <div className="space-y-1">
              <p><strong>Invoice ID:</strong> {order.orderId && order.orderId.startsWith('TMB-') ? order.orderId : `${settings.invoicePrefix || 'INV-'}${order.orderId}`}</p>
              <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
              <p><strong>Status:</strong> Confirmed</p>
            </div>
          </div>

          {/* Product List */}
          <div className="w-full mb-6">
            <h2 className="text-[16px] font-bold uppercase mb-3 border-b pb-1" style={{ borderColor: '#d1d5db' }}>Products</h2>
            {order.items.map((p: any, i: number) => (
              <div key={i} className="w-full border rounded-md p-2 mb-2 box-border text-[13px]" style={{ borderColor: '#d1d5db' }}>
                <div className="flex justify-between">
                  <span className="font-semibold">Product</span>
                  <span className="text-right ml-2">{p.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Quantity</span>
                  <span className="text-right">{p.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Price</span>
                  <span className="text-right">{currency}{p.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-right">{currency}{p.quantity * p.price}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="w-full mb-10">
            <div className="flex justify-between py-1"><span>Subtotal</span><span>{currency}{subtotal}</span></div>
            {order.discount?.amount > 0 && (
              <div className="flex justify-between py-1" style={{ color: '#059669' }}>
                <span>Coupon Discount</span>
                <span>-{currency}{order.discount.amount}</span>
              </div>
            )}
            <div className="flex justify-between py-1"><span>Delivery Fee</span><span>{currency}{deliveryCharge}</span></div>
            <div className="flex justify-between py-2 border-t mt-2" style={{ borderColor: '#d1d5db' }}>
              <span className="font-black uppercase text-[16px]">Grand Total</span>
              <span className="grand-total font-black text-[20px]">{currency}{grandTotal}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center border-t pt-5" style={{ borderColor: '#d1d5db' }}>
            <p className="font-bold">{settings.invoiceFooterText}</p>
            <p className="mt-1 text-[12px]">{settings.returnPolicy}</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};