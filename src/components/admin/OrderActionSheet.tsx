import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Edit2, 
  Truck, 
  Receipt, 
  Printer, 
  Download, 
  Share2, 
  Link, 
  Package, 
  Tag, 
  User, 
  Clock, 
  FileText, 
  Copy, 
  Send,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Plus,
  MessageSquare,
  QrCode,
  Sparkles
} from 'lucide-react';
import { Order, useOrderStore } from '../../store/useOrderStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { formatPrice } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';

interface OrderActionSheetProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onTracking: () => void;
}

export const OrderActionSheet: React.FC<OrderActionSheetProps> = ({
  order,
  isOpen,
  onClose,
  onEdit,
  onTracking
}) => {
  const { orders, updateOrder, addOrder } = useOrderStore();
  const { customers } = useCustomerStore();
  const { settings } = useSettingsStore();

  // Active view inside the modal sheet
  const [activeSubModal, setActiveSubModal] = useState<
    'none' | 'invoice' | 'packingslip' | 'shippinglabel' | 'customer' | 'timeline' | 'notes'
  >('none');

  // Input states
  const [noteText, setNoteText] = useState(order.notes || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto disappear toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Find linked customer profile if exists
  const matchedCustomer = customers.find(
    c => c.phones.includes(order.mobileNumber) || (order.email && c.emails.includes(order.email))
  );

  const subtotal = order.items.reduce(
    (acc, p) => acc + p.quantity * p.price,
    0
  );
  const currency = settings.currencySymbol || '৳';
  const publicLink = `${window.location.origin}/checkout/invoice/${order.orderId}`;

  // 1. DUPLICATE ORDER CLONE FUNCTION
  const handleDuplicate = () => {
    const rawClonedItems = order.items.map(item => ({
      productId: item.productId,
      name: item.name + ' (Copy)',
      price: item.price,
      quantity: item.quantity,
      variant: item.variant,
      variantDetails: item.variantDetails ? { ...item.variantDetails } : undefined,
      image: item.image
    }));

    const clonedPayload = {
      customerName: order.customerName,
      mobileNumber: order.mobileNumber,
      email: order.email,
      fullAddress: order.fullAddress,
      cityArea: order.cityArea,
      postalCode: order.postalCode,
      deliveryMode: order.deliveryMode,
      paymentMethod: order.paymentMethod,
      status: 'Placed' as const,
      paymentStatus: 'Unpaid' as const,
      type: order.type,
      items: rawClonedItems,
      subtotal: order.subtotal,
      discount: { ...order.discount },
      tax: { ...order.tax },
      deliveryCharge: order.deliveryCharge,
      paidAmount: 0,
      dueAmount: order.total,
      total: order.total,
      notes: order.notes ? `[Cloned] ${order.notes}` : '[Cloned Order]',
      isRead: false
    };

    const newOrd = addOrder(clonedPayload);
    triggerToast(`Order Duplicated Successfully as ${newOrd.orderId}!`);
    onClose();
  };

  // 2. SAVE INTERNAL PRIVATE NOTE
  const handleSaveNotes = () => {
    updateOrder(order.id, { notes: noteText });
    triggerToast('Internal Private Notes Saved!');
    setActiveSubModal('none');
  };

  // 3. GENERATE & DOWNLOAD PACKING SLIP PDF
  const handleDownloadPackingSlip = () => {
    const element = document.getElementById(`packingslip-${order.id}`);
    if (!element) return;
    const opt = {
      margin: 10,
      filename: `packingslip-${order.orderId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a5', orientation: 'landscape' }
    } as const;
    html2pdf().set(opt).from(element).save();
    triggerToast('Downloading Packing Slip PDF...');
  };

  // 4. PRINT CUSTOM CONTAINER
  const handlePrintElement = (elmId: string) => {
    const printElm = document.getElementById(elmId);
    if (!printElm) return;
    const printContent = printElm.innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Create print window style overrides to fit nicely
    const styleAttr = `
      <style>
        body { font-family: sans-serif; padding: 20px; color: #000; background: #fff; }
        .no-print { display: none !important; }
        .border-dashed { border-style: dashed !important; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    `;

    const printWin = window.open('', '', 'width=900,height=650');
    if (printWin) {
      printWin.document.write('<html><head><title>Print Out</title>' + styleAttr + '</head><body>');
      printWin.document.write(printContent);
      printWin.document.write('</body></html>');
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
        printWin.close();
      }, 500);
    }
  };

  // 5. DOWNLOAD PDF
  const handleDownloadInvoice = () => {
    const element = document.getElementById(`invoice-view-${order.id}`);
    if (!element) return;
    const opt = {
      margin: 10,
      filename: `invoice-${settings.invoicePrefix || 'INV-'}${order.orderId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    } as const;
    html2pdf().set(opt).from(element).save();
    triggerToast('Downloading Invoice PDF...');
  };

  // 6. NATIVE OR MULTI-CHANNEL SHARING
  const handleNativeShare = async () => {
    const shareData = {
      title: `Invoice ${order.orderId}`,
      text: `Hello ${order.customerName}, here is your Invoice receipt for Order ${order.orderId}.`,
      url: publicLink
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        triggerToast('Shared successfully!');
      } catch (err) {
        // Fallback or cancelled
      }
    } else {
      navigator.clipboard.writeText(publicLink);
      triggerToast('Public Link Copied to Clipboard!');
    }
  };

  const copyToClipboard = (txt: string, successMsg: string) => {
    navigator.clipboard.writeText(txt);
    triggerToast(successMsg);
  };

  // 7. PUBLIC CHANNELS SHARE
  const getShareUrl = (channel: 'whatsapp' | 'messenger' | 'telegram' | 'email' | 'sms') => {
    const msg = encodeURIComponent(`Hello ${order.customerName},\nHere is your Invoice ID: ${order.orderId}\nTotal Amount: ${formatPrice(order.total)}\nLink: ${publicLink}`);
    switch (channel) {
      case 'whatsapp': return `https://api.whatsapp.com/send?phone=+88${order.mobileNumber}&text=${msg}`;
      case 'telegram': return `https://t.me/share/url?url=${encodeURIComponent(publicLink)}&text=${msg}`;
      case 'email': return `mailto:${order.email || ''}?subject=Invoice%20${order.orderId}&body=${msg}`;
      case 'sms': return `sms:${order.mobileNumber}?body=${msg}`;
      case 'messenger': return `https://www.facebook.com/dialog/send?link=${encodeURIComponent(publicLink)}&app_id=123456789&redirect_uri=${encodeURIComponent(window.location.origin)}`;
    }
  };

  return (
    <>
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-5 right-5 z-[500] px-4 py-3 bg-black text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-zinc-800 shadow-2xl rounded-none"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Transparent Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[80] flex justify-center items-end sm:items-center p-0 sm:p-4 text-black font-sans"
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="bg-white w-full max-w-lg sm:rounded-2xl shadow-3xl overflow-hidden relative max-h-[92vh] sm:max-h-[85vh] flex flex-col border border-zinc-200/50"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-zinc-900 text-white sticky top-0 z-10 shrink-0">
            <div>
              <span className="text-[9px] font-black tracking-widest text-[#9CA3AF] uppercase block mb-0.5">Control Action Center</span>
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5 font-mono">
                Order Reference: <span className="text-yellow-400 font-extrabold">{order.orderId}</span>
              </h3>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 bg-zinc-800 rounded-full hover:bg-zinc-700 hover:text-red-400 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action List Section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            
            {/* Row 1: Immediate Status Edit & Tracking Quick Commands */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button 
                onClick={() => { onEdit(); onClose(); }}
                className="flex items-center gap-3 px-4 py-3 bg-zinc-50 border border-zinc-200 hover:border-black rounded-lg transition-all text-xs font-bold text-zinc-800 cursor-pointer text-left"
              >
                <div className="p-2 bg-purple-50 rounded-md">
                  <Edit2 className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <span className="block font-black uppercase text-[10px] tracking-wide text-zinc-950">✏️ Edit Order</span>
                  <span className="text-[9px] text-zinc-400 font-bold">Configure payload</span>
                </div>
              </button>

              <button 
                onClick={() => { onTracking(); onClose(); }}
                className="flex items-center gap-3 px-4 py-3 bg-zinc-50 border border-zinc-200 hover:border-black rounded-lg transition-all text-xs font-bold text-zinc-800 cursor-pointer text-left"
              >
                <div className="p-2 bg-blue-50 rounded-md">
                  <Truck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <span className="block font-black uppercase text-[10px] tracking-wide text-zinc-950">🚚 Tracking Update</span>
                  <span className="text-[9px] text-zinc-400 font-bold">Courier statuses</span>
                </div>
              </button>
            </div>

            {/* SECTION: Invoice Controls */}
            <div className="border border-zinc-100 rounded-xl p-3 bg-zinc-50/50 space-y-2">
              <h4 className="text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-1 px-1">📄 Transaction Invoice & PDF Center</h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button 
                  onClick={() => setActiveSubModal('invoice')}
                  className="flex flex-col items-center justify-center p-3.5 bg-white border border-zinc-200 hover:border-black rounded-lg text-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Receipt className="w-4 h-4 text-zinc-800" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-900">View Invoice</span>
                </button>

                <button 
                  onClick={() => setActiveSubModal('invoice')}
                  className="flex flex-col items-center justify-center p-3.5 bg-white border border-zinc-200 hover:border-black rounded-lg text-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 text-zinc-800" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-900">Print Invoice</span>
                </button>

                <button 
                  onClick={() => handleDownloadInvoice()}
                  className="flex flex-col items-center justify-center p-3.5 bg-white border border-zinc-200 hover:border-black rounded-lg text-center gap-1.5 transition-all cursor-pointer shadow-xs col-span-2 sm:col-span-1"
                >
                  <Download className="w-4 h-4 text-zinc-800" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-900">Download PDF</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button 
                  onClick={() => {
                    copyToClipboard(publicLink, 'Link Copied to Clipboard!');
                  }}
                  className="flex items-center justify-center gap-2 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  <Link className="w-3.5 h-3.5" /> Copy Share Link
                </button>
                <button 
                  onClick={() => handleNativeShare()}
                  className="flex items-center justify-center gap-2 py-2 bg-zinc-900 hover:bg-zinc-850 text-white border border-black rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-yellow-400" /> Share Channels
                </button>
              </div>
            </div>

            {/* SECTION: Logistics Fulfillment */}
            <div className="border border-zinc-100 rounded-xl p-3 bg-zinc-50/50 space-y-2">
              <h4 className="text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-1 px-1">📦 Fulfillment Logistics Tools</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setActiveSubModal('packingslip')}
                  className="flex items-center gap-3 px-3 py-3 bg-white border border-zinc-200 hover:border-zinc-950 rounded-lg text-left transition-all cursor-pointer hover:shadow-md"
                >
                  <div className="p-1.5 bg-orange-50 rounded-md">
                    <Package className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-black uppercase text-zinc-900">Download Packing Slip</span>
                    <span className="text-[8px] font-bold text-zinc-400">Warehouse guidelines</span>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveSubModal('shippinglabel')}
                  className="flex items-center gap-3 px-3 py-3 bg-white border border-zinc-200 hover:border-zinc-950 rounded-lg text-left transition-all cursor-pointer hover:shadow-md"
                >
                  <div className="p-1.5 bg-emerald-50 rounded-md">
                    <Tag className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-black uppercase text-zinc-900">Shipping Label</span>
                    <span className="text-[8px] font-bold text-zinc-400">Courier packet label</span>
                  </div>
                </button>
              </div>
            </div>

            {/* SECTION: CRM, Timeline & Notes */}
            <div className="border border-zinc-100 rounded-xl p-3 bg-zinc-50/50 space-y-2">
              <h4 className="text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-1 px-1">🗣️ Customer Relationship Management</h4>
              
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setActiveSubModal('customer')}
                  className="flex flex-col items-center justify-center p-3 bg-white border border-zinc-200 hover:border-black rounded-lg text-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <User className="w-4 h-4 text-zinc-800" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-zinc-900">User Profile</span>
                </button>

                <button 
                  onClick={() => setActiveSubModal('timeline')}
                  className="flex flex-col items-center justify-center p-3 bg-white border border-zinc-200 hover:border-black rounded-lg text-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <Clock className="w-4 h-4 text-zinc-800" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-zinc-900">Timeline Log</span>
                </button>

                <button 
                  onClick={() => setActiveSubModal('notes')}
                  className="flex flex-col items-center justify-center p-3 bg-white border border-zinc-200 hover:border-black rounded-lg text-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4 text-zinc-800" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-zinc-900">Internal Notes</span>
                </button>
              </div>
            </div>

            {/* SECTION: UTM & Acquisition Source */}
            <div className="border border-zinc-100 rounded-xl p-3 bg-zinc-50/50 space-y-2">
              <h4 className="text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-1 px-1">📊 UTM Attribution & Acquisition Source</h4>
              <div className="bg-white border border-zinc-200 rounded-lg p-2.5 space-y-1.5 text-[10px]">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest">Traffic Source</span>
                    <span className="inline-flex items-center gap-1.5 font-extrabold uppercase text-xs text-zinc-900 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${order.utmParams?.utm_source === 'facebook' ? 'bg-blue-600' : order.utmParams?.utm_source === 'google' ? 'bg-emerald-600' : order.utmParams?.utm_source === 'tiktok' ? 'bg-rose-500' : order.utmParams?.utm_source === 'instagram' ? 'bg-pink-500' : 'bg-zinc-400'}`} />
                      {order.utmParams?.utm_source || 'direct'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest">Medium / Channel</span>
                    <span className="font-extrabold uppercase text-xs text-zinc-900 mt-0.5">
                      {order.utmParams?.utm_medium || 'none'}
                    </span>
                  </div>
                </div>
                {order.utmParams?.utm_campaign && (
                  <div className="pt-1.5 border-t border-zinc-100 flex justify-between">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[8px]">Campaign:</span>
                    <span className="font-black text-zinc-950 uppercase">{order.utmParams.utm_campaign}</span>
                  </div>
                )}
                {order.utmParams?.utm_content && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[8px]">Ad Content:</span>
                    <span className="font-bold text-zinc-950">{order.utmParams.utm_content}</span>
                  </div>
                )}
                {order.utmParams?.utm_term && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[8px]">Search Term:</span>
                    <span className="font-mono text-zinc-700">{order.utmParams.utm_term}</span>
                  </div>
                )}
                <div className="pt-1.5 border-t border-zinc-100 text-[9px] text-zinc-400 font-medium space-y-0.5">
                  <div className="truncate"><span className="font-bold text-zinc-500">Referrer:</span> {order.utmParams?.referrer || 'Direct visit'}</div>
                  <div className="truncate"><span className="font-bold text-zinc-500">First Touch:</span> {order.utmParams?.firstTouch ? new Date(order.utmParams.firstTouch).toLocaleString() : 'N/A'}</div>
                  <div className="truncate"><span className="font-bold text-zinc-500">Last Touch:</span> {order.utmParams?.lastTouch ? new Date(order.utmParams.lastTouch).toLocaleString() : 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* SECTION: Administrative Controls */}
            <div className="grid grid-cols-1 gap-2 pt-1">
              <button 
                onClick={() => handleDuplicate()}
                className="w-full flex items-center justify-center gap-2.5 py-3 border border-dashed border-zinc-300 hover:border-zinc-900 bg-white hover:bg-zinc-50 text-zinc-800 rounded-xl transition-all cursor-pointer text-xs font-extrabold uppercase tracking-widest text-[#000000]"
              >
                <Copy className="w-4 h-4 text-zinc-650" /> 📋 Duplicate Order / Create Clone
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* SUB-MODAL SWITCHER PORTAL OVERLAYS */}
      <AnimatePresence>
        {activeSubModal !== 'none' && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[100] flex justify-center items-center p-2 sm:p-4 text-zinc-900 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-white rounded-2xl w-full flex flex-col shadow-2xl overflow-hidden relative border border-zinc-200 ${
                activeSubModal === 'invoice' ? 'max-w-[210mm] h-[88vh]' : 'max-w-xl max-h-[85vh]'
              }`}
            >
              
              {/* Overlay Modal Header */}
              <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-900 text-white sticky top-0 z-20 shrink-0">
                <span className="text-xs font-black uppercase tracking-widest">
                  {activeSubModal === 'invoice' && '📄 Digital Store Invoice'}
                  {activeSubModal === 'packingslip' && '📦 Warehouse Packing Slip'}
                  {activeSubModal === 'shippinglabel' && '🏷️ Courier Shipping Label'}
                  {activeSubModal === 'customer' && '👤 Customer Profile CRM Card'}
                  {activeSubModal === 'timeline' && '📜 Order Status History Log'}
                  {activeSubModal === 'notes' && '📝 Internal Notes Editor'}
                </span>
                
                <button 
                  onClick={() => setActiveSubModal('none')} 
                  className="p-1.5 bg-zinc-800 rounded-full hover:bg-zinc-700 text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Content Frame */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-zinc-50/50">
                
                {/* 1. DIGITAL INVOICE */}
                {activeSubModal === 'invoice' && (
                  <div className="space-y-6">
                    
                    {/* Invoice View Control Bars */}
                    <div className="p-3 bg-zinc-100 rounded-xl flex flex-wrap gap-2 items-center justify-between no-print border border-zinc-200">
                      <div className="flex flex-wrap gap-1.5">
                        <button 
                          onClick={() => handlePrintElement(`invoice-view-${order.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white hover:bg-black rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print Invoice
                        </button>
                        <button 
                          onClick={() => handleDownloadInvoice()}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-300 text-zinc-900 hover:bg-zinc-50 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" /> Download PDF
                        </button>
                        <a 
                          href={publicLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-300 text-zinc-900 hover:bg-zinc-50 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open Tab
                        </a>
                      </div>

                      {/* PUBLIC ONE-CLICK CHANNELS */}
                      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-zinc-200">
                        <span className="text-[8px] font-black uppercase text-zinc-400 px-1">Send SMS/WA:</span>
                        <a 
                          href={getShareUrl('whatsapp')} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1 px-2 bg-emerald-500 text-white rounded text-[8px] font-bold hover:bg-emerald-600 uppercase"
                        >
                          WA
                        </a>
                        <a 
                          href={getShareUrl('email')} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1 px-2 bg-blue-500 text-white rounded text-[8px] font-bold hover:bg-blue-600 uppercase"
                        >
                          Email
                        </a>
                        <a 
                          href={getShareUrl('sms')} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1 px-2 bg-zinc-800 text-white rounded text-[8px] font-bold hover:bg-zinc-950 uppercase"
                        >
                          SMS
                        </a>
                      </div>
                    </div>

                    {/* TWO COLUMNS: QR CODE PANEL + INVOICE DESIGN */}
                    <div className="flex flex-col lg:flex-row gap-6">
                      
                      {/* Left: Dynamic QR Generator block for invoice */}
                      <div className="w-full lg:w-44 bg-white border border-zinc-200 p-4 rounded-xl flex flex-col items-center text-center shrink-0 h-fit space-y-3">
                        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Secure Scan QR</span>
                        <div className="border border-zinc-100 p-2 bg-white rounded-lg">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=4&data=${encodeURIComponent(publicLink)}`} 
                            alt="Invoice ID QR" 
                            className="w-28 h-28"
                          />
                        </div>
                        <p className="text-[9px] font-bold leading-normal text-zinc-505 uppercase">
                          Scan this QR code to access electronic invoice public tracking.
                        </p>
                      </div>

                      {/* Right: The actual matching client-side Invoice layout */}
                      <div className="flex-1 bg-white border border-zinc-200 p-6 rounded-xl shadow-xs overflow-hidden">
                        <div 
                          id={`invoice-view-${order.id}`}
                          className="p-4 bg-white text-zinc-900 box-border text-[12px] font-sans"
                        >
                          {/* Top Header */}
                          <div className="border-b border-zinc-200 pb-3 mb-4 flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {settings.invoiceLogo ? (
                                  <img src={settings.invoiceLogo || null} alt="Logo" className="w-7 h-7 object-contain" />
                                ) : (
                                  <div className="w-7 h-7 bg-black rounded flex items-center justify-center text-white font-black text-sm">TM</div>
                                )}
                                <h1 className="text-sm font-black uppercase text-zinc-950">{settings.storeName || 'TAZU MART BD'}</h1>
                              </div>
                              <p className="text-[9px] text-zinc-500 font-bold leading-tight uppercase">
                                {settings.storeEmail || 'admin@luxemart.bd'}<br />
                                {settings.contactNumber || '01700-000000'}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] font-black bg-zinc-950 text-white px-2 py-0.5 rounded uppercase">Invoice</span>
                              <p className="text-[10px] font-mono font-bold mt-1 text-zinc-800">
                                #{settings.invoicePrefix || 'INV-'}{order.orderId}
                              </p>
                            </div>
                          </div>

                          {/* Details Split */}
                          <div className="grid grid-cols-2 gap-4 mb-4 pb-3 border-b border-zinc-100">
                            <div>
                              <h2 className="text-[10px] font-black uppercase text-zinc-400 border-b border-zinc-100 pb-0.5 mb-1.5">Client Information</h2>
                              <p className="font-extrabold text-zinc-950 mb-0.5 text-xs">{order.customerName}</p>
                              <p className="font-semibold text-zinc-500 font-mono">{order.mobileNumber}</p>
                              <p className="text-zinc-630 font-semibold tracking-tight text-[10px] leading-tight mt-0.5 max-w-[200px]">{order.fullAddress}</p>
                            </div>
                            <div>
                              <h2 className="text-[10px] font-black uppercase text-zinc-400 border-b border-zinc-100 pb-0.5 mb-1.5">Order Reference</h2>
                              <div className="space-y-0.5 font-bold text-zinc-600 text-[10px]">
                                <p>Date: <span className="text-zinc-900">{new Date(order.date).toLocaleDateString()}</span></p>
                                <p>Method: <span className="text-zinc-900 bg-zinc-100 px-1.5 py-0.2 rounded uppercase">{order.paymentMethod}</span></p>
                                <p>Payment Status: <span className="text-zinc-900 font-extrabold">{order.paymentStatus}</span></p>
                                <p>Fulfillment: <span className="text-zinc-900">{order.status}</span></p>
                              </div>
                            </div>
                          </div>

                          {/* Items table */}
                          <div className="mb-4">
                            <h2 className="text-[10px] font-black uppercase text-zinc-400 border-b border-zinc-100 pb-0.5 mb-2">Order Products list</h2>
                            <div className="space-y-1.5">
                              {order.items.map((p, i) => (
                                <div key={i} className="flex justify-between items-center border border-zinc-100 rounded-lg p-2 bg-zinc-50/50">
                                  <div>
                                    <p className="font-extrabold text-zinc-900 text-[11px] leading-tight">{p.name}</p>
                                    <p className="text-[9px] text-zinc-450 font-bold uppercase tracking-wider mt-0.5">
                                      Variant: {p.variant || 'Default'} • Code: {p.productId || 'N/A'}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-extrabold text-zinc-950 text-[11px]">{currency}{p.quantity * p.price}</p>
                                    <p className="text-[9px] text-zinc-400 font-bold">{currency}{p.price} x {p.quantity}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Summary Details */}
                          <div className="w-1/2 ml-auto space-y-1 text-right text-[10px] font-bold text-zinc-600">
                            <div className="flex justify-between border-b border-zinc-100 pb-1">
                              <span>Subtotal</span>
                              <span className="text-zinc-900 font-semibold">{currency}{subtotal}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-100 pb-1">
                              <span>Delivery Fee</span>
                              <span className="text-zinc-900 font-semibold">{currency}{order.deliveryCharge || 0}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-zinc-300 text-xs text-zinc-950 font-black">
                              <span className="uppercase text-[10px]">Grand Total</span>
                              <span className="text-sm font-mono">{currency}{order.total}</span>
                            </div>
                          </div>

                          <div className="mt-10 pt-4 border-t border-zinc-200 text-center text-[9px] text-[#222]">
                            <p className="font-black uppercase tracking-wider">{settings.invoiceFooterText || 'Thank you for choosing luxury.'}</p>
                            <p className="text-zinc-400 font-bold leading-relaxed mt-1 uppercase max-w-sm mx-auto">
                              {settings.returnPolicy || 'Exchange claims are valid within 7 working days with order parcel ID copy.'}
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 2. PACKING SLIP */}
                {activeSubModal === 'packingslip' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-xl flex items-center justify-between no-print">
                      <span className="text-[10px] font-black uppercase text-zinc-500">Logistic Packing Slip</span>
                      <button 
                        onClick={() => handlePrintElement(`packingslip-print-${order.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white hover:bg-zinc-850 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print slip
                      </button>
                    </div>

                    <div 
                      id={`packingslip-print-${order.id}`}
                      className="p-5 bg-white border-2 border-dashed border-zinc-400 rounded-xl max-w-lg mx-auto text-zinc-900 text-[11px]"
                    >
                      <div className="flex justify-between items-center border-b border-zinc-200 pb-3 mb-4">
                        <div>
                          <h1 className="text-xs font-black uppercase">📦 COURIER PACKING SLIP</h1>
                          <p className="text-[9px] text-zinc-400 font-bold uppercase mt-0.5"> LUXURY COLLECTION WAREHOUSE DEPT </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-black text-zinc-950">#{order.orderId}</p>
                          <p className="text-[8px] text-zinc-450 font-bold uppercase">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Client info & courier specs */}
                      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-200 mb-4 font-bold text-zinc-600">
                        <div>
                          <span className="block text-[8px] uppercase text-zinc-400 mb-0.5">SHIP TO RECIPIENT</span>
                          <p className="font-black text-zinc-900 text-xs">{order.customerName}</p>
                          <p className="font-mono text-zinc-908 text-xs">{order.mobileNumber}</p>
                          <p className="text-[9px] leading-tight text-zinc-500 mt-0.5 max-w-[180px]">{order.fullAddress}</p>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase text-zinc-400 mb-0.5">PACKAGE INFO</span>
                          <p>Fulfillment Node: <span className="text-zinc-950">Main Hub</span></p>
                          <p>Total Items: <span className="text-zinc-950">{order.items.reduce((s, i) => s + i.quantity, 0)}</span></p>
                          <p>Fulfillment Type: <span className="text-zinc-950 uppercase">{order.type}</span></p>
                          <p>Courier Method: <span className="text-orange-600 uppercase font-black">{order.deliveryMode}</span></p>
                        </div>
                      </div>

                      {/* Items verification checkboxes */}
                      <div className="mb-4">
                        <span className="block text-[8px] uppercase text-zinc-400 mb-1">PACKING VERIFICATION (CHECK BOXES)</span>
                        <div className="space-y-1">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex gap-2.5 items-center p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                              <input type="checkbox" className="w-4 h-4 accent-black cursor-pointer shrink-0 border-zinc-300 rounded" />
                              <div className="flex-1 min-w-0">
                                <p className="font-extrabold text-zinc-900 truncate">{it.name}</p>
                                <p className="text-[8px] text-zinc-400 uppercase font-bold">Variant: {it.variant || 'N/A'} • {it.productId}</p>
                              </div>
                              <span className="font-black bg-zinc-200 px-2 py-0.5 rounded shrink-0">QTY: {it.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer signatures */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200 mt-6 text-center text-[9px] font-bold text-zinc-400">
                        <div className="flex flex-col items-center">
                          <div className="w-24 border-t border-zinc-300 mb-1" />
                          <span>PACKER SIGNATURE</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-24 border-t border-zinc-300 mb-1" />
                          <span>QUALITY DEPT SEAL</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SHIPPING LABEL */}
                {activeSubModal === 'shippinglabel' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-xl flex items-center justify-between no-print">
                      <span className="text-[10px] font-black uppercase text-zinc-500">Courier Shipping label</span>
                      <button 
                        onClick={() => handlePrintElement(`shippinglabel-print-${order.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white hover:bg-zinc-850 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print label
                      </button>
                    </div>

                    <div 
                      id={`shippinglabel-print-${order.id}`}
                      className="p-5 bg-white border-2 border-zinc-950 rounded-xl max-w-sm mx-auto text-zinc-900 text-[10px]"
                    >
                      {/* Brand and Barcode Simulated header */}
                      <div className="border-b-2 border-black pb-2 mb-2 flex justify-between items-center bg-black text-white p-2 text-[10px]">
                        <div>
                          <h1 className="font-black uppercase tracking-widest text-[#FFFFFF]">TAZU MART SHIPMENT</h1>
                          <p className="text-[8px] text-zinc-300 font-bold uppercase leading-none">Parcel routing slip</p>
                        </div>
                        <span className="text-[9px] font-black px-1.5 py-0.5 bg-yellow-400 text-black uppercase">COD</span>
                      </div>

                      {/* Sender Info block */}
                      <div className="border-b border-zinc-200 pb-2 mb-2">
                        <span className="block text-[8px] uppercase text-zinc-400 font-bold">1. FROM (SENDER)</span>
                        <p className="font-black text-zinc-900">{settings.storeName || 'TAZU MART BD'}</p>
                        <p className="text-zinc-500 font-medium">Phone: {settings.contactNumber || '01700-000000'}</p>
                        <p className="text-zinc-500 truncate text-[9px]">{settings.storeEmail || 'Rayarbagh Hub, Dhaka'}</p>
                      </div>

                      {/* Recipient Details */}
                      <div className="border-b-2 border-black pb-3 mb-3 bg-zinc-50 p-2.5 rounded-lg">
                        <span className="block text-[8px] uppercase text-zinc-400 font-bold">2. DELIVER TO (RECIPIENT)</span>
                        <p className="font-black text-zinc-950 text-xs uppercase">{order.customerName}</p>
                        <p className="font-mono text-zinc-950 text-xs font-black mt-0.5">{order.mobileNumber}</p>
                        <p className="leading-snug text-zinc-700 font-bold mt-1 text-[9px] whitespace-pre-wrap">{order.fullAddress}</p>
                      </div>

                      {/* Split courier routing boxes */}
                      <div className="grid grid-cols-2 gap-2 mb-3 border-b border-zinc-200 pb-3 font-bold text-zinc-600">
                        <div className="border-r border-zinc-205 pr-2">
                          <span className="block text-[8px] uppercase text-zinc-400">ROUTE DISTRICT</span>
                          <p className="text-zinc-900 font-black text-xs uppercase">{order.cityArea || 'Dhaka'}</p>
                        </div>
                        <div className="pl-2">
                          <span className="block text-[8px] uppercase text-zinc-400">COD COLLECT AMOUNT</span>
                          <p className="text-red-600 font-mono text-xs font-black">
                            {order.paymentStatus === 'Paid' ? '৳0 (PAID)' : formatPrice(order.total)}
                          </p>
                        </div>
                      </div>

                      {/* Courier simulated Tracking Barcode */}
                      <div className="flex flex-col items-center justify-center p-2.5 bg-white border border-zinc-300 rounded mb-2 text-center">
                        <div className="w-full h-8 bg-zinc-950 flex flex-col justify-between p-1 select-none pointer-events-none mb-1">
                          <div className="flex justify-between w-full h-[60%]">
                            {Array.from({ length: 32 }).map((_, idx) => (
                              <div key={idx} className="bg-white h-full" style={{ width: `${Math.random() > 0.4 ? '1.5px' : '3px'}` }} />
                            ))}
                          </div>
                          <div className="w-full bg-white h-[2px]" />
                        </div>
                        <span className="font-mono text-[9px] font-black tracking-widest text-zinc-800">*{order.orderId}*</span>
                      </div>

                      <p className="text-center text-[7.5px] font-bold text-zinc-400 leading-normal uppercase">
                        DO NOT ACCEPT IF PACKET SEALS ARE DAMAGED OR TAPES ARE CUT.
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. CUSTOMER CRM PROFILE */}
                {activeSubModal === 'customer' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-900 text-white rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700 text-yellow-400 font-black text-lg">
                          {order.customerName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-black uppercase text-sm">{order.customerName}</h3>
                          <span className="text-[9px] font-black uppercase text-yellow-405 tracking-wider">Luxe Client Profile</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700 text-[10px] font-black text-green-400">ACTIVE CLIENT</span>
                    </div>

                    <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3 shadow-xs">
                      <h4 className="text-[10px] font-black uppercase text-zinc-400 border-b border-zinc-100 pb-1">Operational Demographics</h4>
                      
                      <div className="grid grid-cols-2 gap-3.5 text-xs text-zinc-700">
                        <div>
                          <span className="block text-[9px] font-black uppercase text-zinc-400">Registered Phone</span>
                          <p className="font-bold text-black font-mono mt-0.5">{order.mobileNumber}</p>
                        </div>
                        <div>
                          <span className="block text-[9px] font-black uppercase text-zinc-400">Linked Emails</span>
                          <p className="font-bold text-black mt-0.5">{order.email || 'No Linked Emails'}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="block text-[9px] font-black uppercase text-zinc-400">Default Delivery Grid</span>
                          <p className="font-bold text-black mt-0.5">{order.fullAddress}</p>
                        </div>
                      </div>
                    </div>

                    {matchedCustomer && (
                      <div className="bg-white border border-zinc-100 rounded-xl p-4 space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-zinc-400 border-b border-zinc-100 pb-1">Special Occasion Metadata</h4>
                        <div className="grid grid-cols-2 gap-3.5 text-xs">
                          <div>
                            <span className="block text-[9px] font-black uppercase text-zinc-400">Special event name</span>
                            <p className="font-bold text-zinc-950 mt-0.5">{matchedCustomer.occasionName || 'Not catalogued'}</p>
                          </div>
                          <div>
                            <span className="block text-[9px] font-black uppercase text-zinc-400">Event coordinates date</span>
                            <p className="font-bold text-zinc-950 mt-0.5">{matchedCustomer.specialDate || 'Not catalogued'}</p>
                          </div>
                          <div>
                            <span className="block text-[9px] font-black uppercase text-zinc-400">Gender Identity</span>
                            <p className="font-bold text-zinc-955 mt-0.5">{matchedCustomer.gender || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="block text-[9px] font-black uppercase text-zinc-400">User Status Group</span>
                            <p className="font-bold text-emerald-600 mt-0.5 uppercase">{matchedCustomer.status || 'Active'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. ORDER STATUS TIMELINE HISTORY */}
                {activeSubModal === 'timeline' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-xl">
                      <span className="text-[10px] font-black uppercase text-zinc-500">Order System Event Timeline</span>
                    </div>

                    <div className="space-y-5 px-3 py-2">
                      {order.statusHistory.slice().reverse().map((h, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex flex-col items-center shrink-0">
                            <div className={`w-3.5 h-3.5 rounded-full ${i === 0 ? 'bg-zinc-900 border-2 border-amber-400' : 'bg-zinc-300'} ring-4 ring-white relative z-10`} />
                            {i !== order.statusHistory.length - 1 && (
                              <div className="w-[1.5px] h-full bg-zinc-200 -mt-1.5" />
                            )}
                          </div>
                          <div className="pb-3 flex-1">
                            <p className="text-xs font-black uppercase text-zinc-900">{h.status}</p>
                            <p className="text-[9px] font-bold text-zinc-400 mt-0.5">
                              {new Date(h.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' })}
                              {h.updatedBy && ` • Approved by ${h.updatedBy}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. INTERNAL PRIVATE NOTES */}
                {activeSubModal === 'notes' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-2.5 items-start">
                      <FileText className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[10px] font-black uppercase text-yellow-800">Administrative Safeguard Notice</span>
                        <p className="text-[9px] text-yellow-700 leading-normal font-bold">
                          These logs are absolutely private and mapped to admin coordinates. The customer is strictly restricted from seeing these notes upon lookup.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[9px] font-black uppercase text-zinc-500">Admin Private Note content</label>
                      <textarea 
                        rows={5}
                        placeholder="Type any confidential client details, parcel issues, or tracking details..."
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        className="w-full p-4 border border-zinc-200 focus:border-black rounded-lg text-xs font-bold leading-relaxed outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2.5">
                      <button 
                        onClick={() => setActiveSubModal('none')}
                        className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleSaveNotes()}
                        className="px-5 py-2 bg-zinc-900 hover:bg-black text-white rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
                      >
                        Save Confidentially
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
