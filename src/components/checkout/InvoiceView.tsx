import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import { useSettingsStore } from "../../store/useSettingsStore";

interface InvoiceViewProps {
  order: any;
  onBack: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ order, onBack }) => {
  const invoiceRef = useRef(null);
  const { settings } = useSettingsStore();

  const subtotal = order.items.reduce(
    (acc: number, p: any) => acc + p.quantity * p.price,
    0
  );
  
  const deliveryCharge = order.deliveryCharge || 0;
  const grandTotal = order.total;
  const currency = settings.currencySymbol || '৳';

  const downloadInvoice = () => {
    const element = document.getElementById("invoice");
    const opt = {
      margin: 10,
      filename: `invoice-${settings.invoicePrefix || 'INV-'}${order.orderId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    } as const;
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className={`min-h-screen p-4 font-sans text-[14px] text-black overflow-x-hidden ${settings.invoiceTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-[#FFFFFF] text-black'}`}>
      <div className="max-w-[190mm] mx-auto">
        {/* Buttons - Hidden on print */}
        <div className="flex gap-4 justify-center mb-10 no-print">
          <button
            onClick={downloadInvoice}
            className="bg-black text-white px-8 py-3 rounded-md text-sm font-bold border border-black transition-all"
          >
            Download Invoice
          </button>
          <button
            onClick={onBack}
            className="bg-white text-black border border-black px-8 py-3 rounded-md text-sm font-bold transition-all"
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
          <div className="border-b border-gray-300 pb-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              {settings.invoiceLogo ? (
                <img src={settings.invoiceLogo} alt="Logo" className="w-10 h-10 object-contain" />
              ) : (
                <div className="w-10 h-10 bg-black rounded flex items-center justify-center text-white font-black text-lg">TM</div>
              )}
              <h1 className="text-xl font-black uppercase">{settings.storeName || 'TAZU MART BD'}</h1>
            </div>
            <div className="text-[14px]">
                <p>{settings.storeEmail}</p>
                <p>{settings.contactNumber}</p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="mb-6">
            <h2 className="text-[18px] font-bold uppercase mb-2 border-b border-gray-300 pb-1">Customer Details</h2>
            <div className="space-y-1">
                <p><strong>Name:</strong> {order.customerName}</p>
                <p><strong>Phone:</strong> {order.mobileNumber}</p>
                <p><strong>Address:</strong> {order.fullAddress}</p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="mb-6">
            <h2 className="text-[18px] font-bold uppercase mb-2 border-b border-gray-300 pb-1">Order Details</h2>
            <div className="space-y-1">
              <p><strong>Invoice ID:</strong> {settings.invoicePrefix || 'INV-'}{order.orderId}</p>
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
              <p><strong>Status:</strong> Confirmed</p>
            </div>
          </div>

          {/* Product List */}
          <div className="w-full mb-6">
            <h2 className="text-[16px] font-bold uppercase mb-3 border-b border-gray-300 pb-1">Products</h2>
            {order.items.map((p: any, i: number) => (
              <div key={i} className="w-full border border-gray-300 rounded-md p-2 mb-2 box-border text-[13px]">
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
            <div className="flex justify-between py-1"><span>Delivery Fee</span><span>{currency}{deliveryCharge}</span></div>
            <div className="flex justify-between py-2 border-t border-gray-300 mt-2">
              <span className="font-black uppercase text-[16px]">Grand Total</span>
              <span className="grand-total font-black text-[20px]">{currency}{grandTotal}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center border-t border-gray-300 pt-5">
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