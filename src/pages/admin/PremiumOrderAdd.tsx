import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  Save, 
  Bell, 
  User, 
  Copy, 
  CheckCircle2, 
  Circle, 
  Package, 
  Edit3, 
  Minus, 
  Plus, 
  Search, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Check, 
  Printer, 
  Share2, 
  ChevronDown,
  Trash2,
  PhoneCall,
  SearchCheck,
  AlertTriangle,
  History,
  Truck,
  CreditCard,
  Image as ImageIcon
} from 'lucide-react';
import { useOrderStore, OrderItem, Order } from '../../store/useOrderStore';
import { useProductStore } from '../../store/useProductStore';
import { useDeliveryStore } from '../../store/useDeliveryStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { formatPrice } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PremiumOrderAddProps {
  editId?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export default function PremiumOrderAdd({ editId, isModal, onClose }: PremiumOrderAddProps = {}) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = editId || paramId;
  const { addOrder, orders, updateOrder } = useOrderStore();
  const { products } = useProductStore();
  const { courierApis } = useDeliveryStore();
  const { customers, fetchCustomers } = useCustomerStore();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const activeCouriers = useMemo(() => courierApis.filter(api => api.status === 'active'), [courierApis]);

  const editingOrder = useMemo(() => orders.find(o => o.id === id), [orders, id]);

  // State
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(editingOrder?.userId);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    area: '',
    postalCode: ''
  });
  const [customerImage, setCustomerImage] = useState<string | undefined>(undefined);
  const [orderStatus, setOrderStatus] = useState<Order['status']>('Placed');
  const [paymentStatus, setPaymentStatus] = useState<Order['paymentStatus']>('Unpaid');
  const [paidAmount, setPaidAmount] = useState(0);
  const [discount, setDiscount] = useState<{ type: 'percent' | 'fixed', value: number }>({ type: 'fixed', value: 0 });
  const [taxPercent, setTaxPercent] = useState(0);
  const [deliveryZone, setDeliveryZone] = useState('Inside Dhaka');
  const [courier, setCourier] = useState('Steadfast');
  const [courierTrackingId, setCourierTrackingId] = useState('');
  const [courierStatus, setCourierStatus] = useState('');
  const [notes, setNotes] = useState('');
  
  // Pre-fill if editing
  useEffect(() => {
    if (editingOrder) {
      setOrderItems(editingOrder.items);
      const [area, ...cityRest] = (editingOrder.cityArea || '').split(', ');
      setCustomer({
        name: editingOrder.customerName,
        phone: editingOrder.mobileNumber,
        email: editingOrder.email || '',
        address: editingOrder.fullAddress,
        city: cityRest.join(', ') || area || '',
        area: area || '',
        postalCode: editingOrder.postalCode || ''
      });
      setOrderStatus(editingOrder.status);
      setPaymentStatus(editingOrder.paymentStatus);
      setPaidAmount(editingOrder.paidAmount);
      setDiscount({ 
        type: editingOrder.discount.type, 
        value: editingOrder.discount.value 
      });
      setTaxPercent(editingOrder.tax.percent);
      setNotes(editingOrder.notes || '');
      setCourier(editingOrder.courier?.name || 'Steadfast');
      setCourierTrackingId(editingOrder.courier?.trackingId || '');
      setCourierStatus(editingOrder.courier?.status || '');
      setCustomerImage(editingOrder.customerImage);
      setSelectedUserId(editingOrder.userId);
    }
  }, [editingOrder]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return [];
    return customers.filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase())
    ).slice(0, 5);
  }, [customers, customerSearch]);

  const handleSelectCustomer = (c: any) => {
    setSelectedUserId(c.id);
    setCustomer({
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      address: c.address?.street || '',
      city: c.address?.city || c.address?.district || '',
      area: c.address?.area || c.address?.upazila || '',
      postalCode: c.address?.zipCode || ''
    });
    setCustomerImage(c.profileImage);
    setCustomerSearch('');
    setShowCustomerResults(false);
  };

  // Modals
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState<{itemIndex: number} | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Auto-generated IDs for preview
  const previewOrderNum = useMemo(() => Math.floor(100000 + Math.random() * 900000), []);
  const previewBillNum = useMemo(() => Math.floor(100000 + Math.random() * 900000), []);

  const deliveryCharges: Record<string, number> = {
    'Inside Dhaka': 60,
    'Outside Dhaka': 120,
    'Express': 150,
    'International': 500
  };

  const subtotal = useMemo(() => 
    orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  , [orderItems]);

  const discountAmount = useMemo(() => {
    if (discount.type === 'percent') {
      return (subtotal * discount.value) / 100;
    }
    return discount.value;
  }, [subtotal, discount]);

  const taxAmount = useMemo(() => 
    ((subtotal - discountAmount) * taxPercent) / 100
  , [subtotal, discountAmount, taxPercent]);

  const deliveryCharge = deliveryCharges[deliveryZone] || 0;
  const total = subtotal - discountAmount + taxAmount + deliveryCharge;
  const dueAmount = Math.max(0, total - paidAmount);

  // Status Stepper Data
  const steps: Order['status'][] = ['Placed', 'Confirmed', 'Preparing', 'Packed', 'Shipping', 'Delivered', 'Completed'];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const updateQuantity = (index: number, delta: number) => {
    setOrderItems(prev => prev.map((item, i) => {
      if (i === index) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const addProductToOrder = (product: any) => {
    const existing = orderItems.findIndex(i => i.productId === product.id);
    if (existing !== -1) {
      updateQuantity(existing, 1);
    } else {
      setOrderItems(prev => [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        variant: 'Default',
        image: product.image
      }]);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
    else navigate(-1);
  };

  const handleSaveOrder = () => {
    const orderData = {
      customerName: customer.name,
      mobileNumber: customer.phone,
      email: customer.email,
      fullAddress: customer.address,
      cityArea: customer.area && customer.city ? `${customer.area}, ${customer.city}` : (customer.area || customer.city),
      postalCode: customer.postalCode,
      customerImage,
      deliveryMode: editingOrder?.deliveryMode || 'Standard Delivery',
      paymentMethod: editingOrder?.paymentMethod || 'bKash',
      status: orderStatus,
      paymentStatus,
      type: editingOrder?.type || 'Online',
      items: orderItems,
      subtotal,
      discount: { ...discount, amount: discountAmount },
      tax: { percent: taxPercent, amount: taxAmount },
      deliveryCharge,
      paidAmount,
      dueAmount,
      total,
      notes,
      userId: selectedUserId,
      courier: { 
        name: courier, 
        trackingId: courierTrackingId,
        status: courierStatus || (courierTrackingId ? 'Parcel Created' : 'Pending')
      }
    };

    if (id && editingOrder) {
      updateOrder(id, orderData);
    } else {
      addOrder(orderData as any);
    }
    if (onClose) {
      onClose();
    } else {
      navigate('/admin/orders');
    }
  };

  return (
    <div className={`${isModal ? 'h-full' : 'min-h-screen'} bg-[#f7f7f7] font-sans pb-20 overflow-x-hidden relative`}>
      {/* Compact Responsive Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-3 md:px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <button 
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-lg transition-all active:scale-95 text-black"
          >
            {isModal ? <X className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <div className="title-area truncate">
             <h2 className="text-base md:text-lg font-bold text-black leading-tight">
               {id ? 'Edit Order' : 'Add Order'}
             </h2>
             <p className="text-[10px] md:text-xs text-gray-500 font-medium tracking-tight">
               {id ? `Editing Order ID: ${editingOrder?.orderId}` : 'Order Management'}
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 hidden sm:flex items-center justify-center bg-gray-50 border border-gray-100 rounded-lg relative text-black">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>
          <button 
            onClick={handleSaveOrder}
            className="h-10 px-6 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-900 transition-all active:scale-95 shadow-sm"
          >
            Save
          </button>
        </div>
      </div>

      <div className="w-full px-2 md:px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 max-w-full mx-0">
        
        {/* Left Column - Form & Main Info */}
        <div className="lg:col-span-8 space-y-4 md:space-y-6">
          
          {/* Order Summary & Status Card */}
          <div className="bg-white border border-gray-200 p-4 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-xl md:rounded-2xl">
            <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6 mb-6">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 flex items-center justify-center rounded-lg">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                    <div className="flex items-center gap-2">
                       <span className="text-xs md:text-sm font-black text-black">
                         {id ? editingOrder?.orderId : `#ORD-${previewOrderNum}`}
                       </span>
                       <button onClick={() => handleCopy(id ? editingOrder?.orderId || '' : `#ORD-${previewOrderNum}`)} className="p-1 hover:bg-gray-50 text-gray-400 hover:text-purple-600">
                          <Copy className="w-3 h-3" />
                       </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 flex items-center justify-center rounded-lg">
                    <Printer className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Bill ID</p>
                    <span className="text-xs md:text-sm font-black text-black">
                      {id ? editingOrder?.billId : `BILL-${previewBillNum}`}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#fcfcfc] border border-dashed border-gray-200 p-3 md:p-4 flex-1 md:max-w-sm rounded-lg">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Product Link</p>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] md:text-[11px] font-bold text-purple-600 truncate">
                    tazumart.bd/order/{id ? editingOrder?.orderId : previewOrderNum}
                  </span>
                  <button onClick={() => handleCopy(`https://tazumart.bd/order/${id ? editingOrder?.orderId : `ORD-${previewOrderNum}`}`)} className="shrink-0 bg-black text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md">
                     {copySuccess ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            {/* Stepper - Optimized for Mobile */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between relative px-2">
                {/* Connector Line */}
                <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-100 z-0"></div>
                <div 
                  className="absolute top-4 left-0 h-[2px] bg-purple-600 transition-all duration-500 z-0" 
                  style={{ width: `${(steps.indexOf(orderStatus) / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, idx) => {
                  const isCompleted = steps.indexOf(orderStatus) >= idx;
                  const isCurrent = orderStatus === step;
                  return (
                    <div key={step} className="relative z-10 flex flex-col items-center gap-2 cursor-pointer group" onClick={() => setOrderStatus(step)}>
                      <div className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center transition-all rounded-lg ${
                        isCompleted ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' : 'bg-white border-2 border-gray-100 text-gray-300'
                      }`}>
                         {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-[10px] font-black">{idx + 1}</span>}
                      </div>
                      <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${isCompleted ? 'text-black' : 'text-gray-300'} hidden sm:block`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-center">
                 <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                    Current Status: {orderStatus}
                 </span>
              </div>
            </div>
          </div>

          {/* Product Section */}
          <div className="bg-white border border-gray-200 p-4 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-xl md:rounded-2xl">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-50">
              <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-black flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-600" />
                Products ({orderItems.length})
              </h3>
              <button 
                onClick={() => setShowProductSelector(true)}
                className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode='popLayout'>
                {orderItems.map((item, idx) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={`${item.productId}-${idx}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-gray-100 rounded-xl gap-4 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-[70px] h-[70px] bg-gray-50 border border-gray-50 rounded-lg overflow-hidden shrink-0">
                         {item.image ? (
                           <img src={item.image} className="w-full h-full object-cover" alt="" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-200">
                             <Package className="w-6 h-6" />
                           </div>
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs md:text-sm font-bold text-black truncate pr-4">{item.name}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                            {item.variant}
                          </span>
                          <button 
                            className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-all"
                            onClick={() => setShowVariantModal({itemIndex: idx})}
                          >
                            Varient
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(idx, -1)} className="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all text-gray-400 font-bold">
                           <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-black">{item.quantity}</span>
                        <button onClick={() => updateQuantity(idx, 1)} className="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all text-gray-400 font-bold">
                           <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right flex-1 sm:flex-none sm:w-28">
                        <p className="text-sm font-black text-black">{formatPrice(item.price * item.quantity)}</p>
                        <p className="text-[9px] font-bold text-gray-400">@ {formatPrice(item.price)}</p>
                      </div>
                      <button onClick={() => updateQuantity(idx, -item.quantity)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {orderItems.length === 0 && (
                <div className="py-12 text-center border border-dashed border-gray-200 bg-gray-50/50 rounded-xl">
                  <Package className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Cart is empty</p>
                </div>
              )}
            </div>

            {/* Calculations Box */}
            <div className="mt-8 pt-6 border-t border-gray-100">
               <div className="w-full md:max-w-sm md:ml-auto space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                     <span>Subtotal</span>
                     <span className="text-black font-black">{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                     <span className="text-[11px] font-bold text-gray-500 shrink-0">Discount</span>
                     <div className="flex items-center border border-gray-100 rounded-lg overflow-hidden flex-1 h-9">
                        <button 
                          onClick={() => setDiscount({ ...discount, type: 'percent' })}
                          className={`px-3 h-full text-[10px] font-black transition-colors ${discount.type === 'percent' ? 'bg-black text-white' : 'bg-gray-50 text-gray-400'}`}
                        >
                          %
                        </button>
                        <button 
                          onClick={() => setDiscount({ ...discount, type: 'fixed' })}
                          className={`px-3 h-full text-[10px] font-black transition-colors ${discount.type === 'fixed' ? 'bg-black text-white' : 'bg-gray-50 text-gray-400'}`}
                        >
                          ৳
                        </button>
                        <input 
                          type="number" 
                          value={discount.value} 
                          onChange={(e) => setDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })}
                          className="flex-1 px-3 bg-white text-xs font-black outline-none text-right"
                        />
                     </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                     <span className="text-[11px] font-bold text-gray-500 shrink-0">Tax (%)</span>
                     <input 
                        type="number" 
                        value={taxPercent} 
                        onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                        className="w-20 md:w-32 h-9 border border-gray-100 px-3 bg-white text-xs font-black outline-none rounded-lg text-right focus:border-black transition-all"
                     />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                     <span className="text-[11px] font-bold text-gray-500 shrink-0">Delivery</span>
                     <div className="relative flex-1">
                       <select 
                          value={deliveryZone}
                          onChange={(e) => setDeliveryZone(e.target.value)}
                          className="w-full h-9 border border-gray-100 px-3 bg-white text-xs font-black outline-none appearance-none cursor-pointer rounded-lg focus:border-black transition-all pr-8"
                       >
                          {Object.keys(deliveryCharges).map(zone => <option key={zone} value={zone}>{zone}</option>)}
                       </select>
                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                     </div>
                  </div>

                  <div className="pt-3 border-t-2 border-black">
                     <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm font-black uppercase tracking-wider text-black">Total</span>
                        <span className="text-lg md:text-xl font-black text-black">{formatPrice(total)}</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Customer Image Upload */}
          <div className="bg-white border border-gray-200 p-4 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-xl md:rounded-2xl">
            <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-black mb-6 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-purple-600" />
              Customer Photo
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center overflow-hidden relative group">
                {customerImage ? (
                  <>
                    <img src={customerImage} className="w-full h-full object-cover" alt="Customer" />
                    <button 
                      onClick={() => setCustomerImage(undefined)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </>
                ) : (
                  <label className="flex flex-col items-center gap-1 cursor-pointer w-full h-full justify-center">
                    <Plus className="w-6 h-6 text-gray-300" />
                    <span className="text-[8px] font-black text-gray-300 uppercase">Upload</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const { uploadImage } = await import('../../lib/imageUtils');
                            const url = await uploadImage(file, 'customers', `premium-order-${Date.now()}`);
                            setCustomerImage(url);
                          } catch (err) {
                            console.error('Failed to upload image', err);
                            alert('Failed to upload customer image');
                          }
                        }
                      }} 
                    />
                  </label>
                )}
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400">Add a profile picture for this customer for easier identification.</p>
                <p className="text-[9px] text-gray-300 mt-1">Supports JPG, PNG up to 2MB.</p>
              </div>
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="bg-white border border-gray-200 p-4 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-xl md:rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-black flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                Customer Information
              </h3>
              
              <div className="relative">
                <div className="flex items-center gap-2">
                   <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search existing customer..."
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          setShowCustomerResults(true);
                        }}
                        onFocus={() => setShowCustomerResults(true)}
                        className="h-8 pl-8 pr-3 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold focus:outline-none focus:border-black w-48 md:w-64"
                      />
                   </div>
                   {selectedUserId && (
                     <button 
                       onClick={() => {
                         setSelectedUserId(undefined);
                         setCustomer({ name: '', phone: '', email: '', address: '', city: '', area: '', postalCode: '' });
                         setCustomerImage(undefined);
                       }}
                       className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-600 hover:text-white transition-all"
                       title="Unlink Customer"
                     >
                       <X className="w-3.5 h-3.5" />
                     </button>
                   )}
                </div>

                <AnimatePresence>
                  {showCustomerResults && filteredCustomers.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-full md:w-72 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      {filteredCustomers.map(c => (
                        <button 
                          key={c.id}
                          onClick={() => handleSelectCustomer(c)}
                          className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 text-left"
                        >
                          <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                            {c.profileImage ? <img src={c.profileImage} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-purple-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-black truncate">{c.name}</p>
                            <p className="text-[9px] font-bold text-gray-400">{c.phone}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe" 
                      value={customer.name}
                      onChange={(e) => setCustomer({...customer, name: e.target.value})}
                      className="w-full h-11 bg-gray-50 border border-gray-100 px-4 text-xs font-bold rounded-lg focus:outline-none focus:bg-white focus:border-black transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Phone Number</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="tel" 
                        placeholder="017XXXXXXXX" 
                        value={customer.phone}
                        onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                        className="flex-1 h-11 bg-gray-50 border border-gray-100 px-4 text-xs font-bold rounded-lg focus:outline-none focus:bg-white focus:border-black transition-all" 
                      />
                      <button className="h-11 w-11 flex items-center justify-center bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all shadow-sm">
                         <PhoneCall className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="customer@example.com" 
                      value={customer.email}
                      onChange={(e) => setCustomer({...customer, email: e.target.value})}
                      className="w-full h-11 bg-gray-50 border border-gray-100 px-4 text-xs font-bold rounded-lg focus:outline-none focus:bg-white focus:border-black transition-all" 
                    />
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Address</label>
                    <textarea 
                      placeholder="Street, House, Area etc." 
                      rows={2}
                      value={customer.address}
                      onChange={(e) => setCustomer({...customer, address: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 px-4 py-3 text-xs font-bold rounded-lg focus:outline-none focus:bg-white focus:border-black transition-all resize-none min-h-[92px]" 
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="City" 
                      value={customer.city}
                      onChange={(e) => setCustomer({...customer, city: e.target.value})}
                      className="w-full h-11 bg-gray-50 border border-gray-100 px-4 text-xs font-bold rounded-lg focus:outline-none focus:bg-white focus:border-black transition-all" 
                    />
                    <input 
                      type="text" 
                      placeholder="Zip" 
                      value={customer.postalCode}
                      onChange={(e) => setCustomer({...customer, postalCode: e.target.value})}
                      className="w-full h-11 bg-gray-50 border border-gray-100 px-4 text-xs font-bold rounded-lg focus:outline-none focus:bg-white focus:border-black transition-all" 
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                     <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
                        <SearchCheck className="w-3.5 h-3.5 text-purple-600" />
                        Validity Check
                     </span>
                     <button className="h-9 px-3 bg-black text-white text-[10px] font-black uppercase rounded-lg shadow-sm">
                        Verify
                     </button>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column - Calculations & Secondary Info */}
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
           
           {/* Payment Summary */}
           <div className="bg-white border-2 border-black p-6 md:p-8 shadow-xl rounded-2xl space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black text-center pb-4 border-b border-gray-50">
                Payment Stats
              </h3>
              
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 border border-green-100 p-3 rounded-xl text-center">
                       <p className="text-[8px] font-bold text-green-600 uppercase tracking-widest mb-1">Total</p>
                       <p className="text-xs font-black text-green-800">{formatPrice(total)}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-100 p-3 rounded-xl text-center">
                       <p className="text-[8px] font-bold text-purple-600 uppercase tracking-widest mb-1">Paid</p>
                       <p className="text-xs font-black text-purple-800">{formatPrice(paidAmount)}</p>
                    </div>
                 </div>
                 <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
                    <p className="text-[9px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">Balance Due</p>
                    <p className="text-xl font-black text-red-800">{formatPrice(dueAmount)}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Status</label>
                    <div className="relative">
                      <select 
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value as any)}
                        className="w-full h-11 bg-gray-50 border border-gray-100 px-4 text-xs font-black rounded-lg outline-none appearance-none cursor-pointer focus:border-black transition-all pr-8"
                      >
                        {['Unpaid', 'Partial', 'Paid', 'Cash on Delivery'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                 </div>
                 <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Paid Amount</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="number" 
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                        className="w-full h-11 bg-gray-50 border border-gray-100 pl-11 pr-4 text-xs font-black rounded-lg focus:border-black focus:bg-white transition-all font-mono" 
                      />
                    </div>
                 </div>
              </div>
           </div>

           {/* Courier & Tracking */}
           <div className="space-y-4">
             {activeCouriers.map((api) => (
               <div key={api.id} className="bg-white border border-[#eee] p-4 md:p-6 rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[14px] font-bold text-gray-900">{api.name}</h3>
                    <span className="text-[10px] font-bold text-green-500 flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded-full bg-green-500" />
                       ONLINE
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="relative">
                        <select 
                           value={courier === api.name ? courier : api.name}
                           onChange={(e) => setCourier(e.target.value)}
                           className="w-full h-[52px] bg-gray-50 border border-gray-100 px-4 text-[14px] font-semibold rounded-[10px] outline-none appearance-none cursor-pointer"
                        >
                           <option value={api.name}>{api.name}</option>
                           {['Standard', 'Express'].map(c => <option key={c} value={c}>{c} Service</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                     </div>
                     
                     <button 
                        onClick={() => {
                          const trackingId = `${api.id.substring(0, 3).toUpperCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`;
                          // Simulated API call
                          const parcelData = {
                            customer_name: customer.name,
                            customer_phone: customer.phone,
                            address: customer.address,
                            cash_collection: dueAmount,
                            order_id: id ? editingOrder?.orderId : `ORD-${previewOrderNum}`
                          };
                          console.log(`Sending to ${api.name}:`, parcelData);
                          
                          setCourier(api.name);
                          setCourierTrackingId(trackingId);
                          setCourierStatus('Parcel Created');

                          if (id) {
                            updateOrder(id, {
                              courier: {
                                name: api.name,
                                trackingId: trackingId,
                                status: 'Parcel Created'
                              }
                            });
                          }
                          alert(`Parcel Sent Successfully to ${api.name}!\nTracking ID: ${trackingId}`);
                        }}
                        className="w-full h-[54px] bg-gradient-to-br from-[#8e2de2] to-[#c026ff] text-white text-[16px] font-bold rounded-[12px] shadow-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                     >
                        <Truck className="w-5 h-5" />
                        SEND PARCEL INFO
                     </button>

                     {((editingOrder?.courier?.name === api.name && editingOrder?.courier?.trackingId) || (courier === api.name && courierTrackingId)) && (
                       <div className="mt-4 pt-4 border-t border-gray-100 bg-purple-50/50 p-4 rounded-xl space-y-2">
                         <div className="flex items-center justify-between">
                           <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Tracking ID:</span>
                           <span className="text-[12px] font-black text-black select-all">{courierTrackingId || editingOrder?.courier?.trackingId}</span>
                         </div>
                         <div className="flex items-center justify-between">
                           <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Status:</span>
                           <span className="text-[11px] font-black text-purple-600 uppercase bg-purple-100 px-2 py-0.5 rounded-md">{courierStatus || editingOrder?.courier?.status || 'Parcel Created'}</span>
                         </div>
                       </div>
                     )}
                  </div>
               </div>
             ))}

             {activeCouriers.length === 0 && (
               <div className="bg-white border border-gray-200 p-6 rounded-2xl text-center">
                 <Truck className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Active Couriers</p>
                 <p className="text-[8px] text-gray-300 mt-1">Enable couriers in Delivery Settings</p>
               </div>
             )}
           </div>

           {/* Notes */}
           <div className="bg-white border border-gray-200 p-4 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-xl md:rounded-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-black mb-3">Admin Notes</h3>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Staff only..." 
                maxLength={512}
                className="w-full min-h-[100px] bg-gray-50 border border-gray-100 p-3 text-xs font-medium rounded-lg focus:border-black transition-all resize-none"
              ></textarea>
           </div>
        </div>
      </div>

      {/* Compact Bottom Sticky Bar */}
      <div className={`${isModal ? 'absolute' : 'fixed'} bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]`}>
         <div className="flex flex-col flex-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Grand Total</span>
            <span className="text-sm md:text-base font-black text-black">{formatPrice(total)}</span>
         </div>
         
         <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={handleClose}
              className="h-10 px-4 border border-gray-100 text-gray-400 text-[10px] font-black uppercase rounded-lg hover:bg-gray-50"
            >
               Cancel
            </button>
            <button 
              onClick={handleSaveOrder}
              disabled={orderItems.length === 0 || !customer.name || !customer.phone}
              className="h-10 px-6 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-purple-50 hover:bg-purple-700 transition-all flex items-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
            >
               <Save className="w-4 h-4" />
               <span className="hidden sm:inline">Save Order</span>
               <span className="sm:hidden">Save</span>
            </button>
         </div>
      </div>

      {/* Rest of modals (Product Selector, Variant Modal) - keeping existing logic but making them more compact */}
      <AnimatePresence>
        {showProductSelector && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-8 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl rounded-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setShowProductSelector(false)}
                className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur border border-gray-100 rounded-full shadow-lg hover:bg-black hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-base md:text-lg font-black uppercase tracking-tight">Select Product</h2>
                <div className="flex items-center gap-2 w-full max-w-sm">
                   <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        className="w-full h-10 bg-gray-50 border border-gray-100 pl-9 pr-4 text-xs font-bold rounded-lg focus:outline-none focus:border-black" 
                      />
                   </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                 {/* Categories Horizontal on mobile, sidebar on desktop */}
                 <div className="md:w-56 border-b md:border-b-0 md:border-r border-gray-50 bg-[#fafafa] p-2 md:p-4 space-y-1 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-2 no-scrollbar">
                    {['All', 'Shirts', 'Polo', 'Panjabi', 'Hoodies', 'Kids', 'Ladies', 'Shoes', 'Bags'].map(cat => (
                      <button key={cat} className={`whitespace-nowrap px-4 py-2.5 text-[10px] font-black uppercase rounded-lg transition-all ${cat === 'All' ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-gray-400 hover:text-black hover:bg-white'}`}>
                         {cat}
                      </button>
                    ))}
                 </div>

                 {/* Products Grid */}
                 <div className="flex-1 p-3 md:p-6 overflow-y-auto grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                    {products.map(product => (
                       <div key={product.id} className="bg-white border border-gray-100 p-2 md:p-3 rounded-xl group hover:border-black transition-all cursor-pointer shadow-sm" onClick={() => addProductToOrder(product)}>
                          <div className="aspect-square bg-gray-50 mb-3 border border-gray-50 rounded-lg overflow-hidden relative">
                             <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                             <div className="absolute bottom-2 left-2">
                                <span className="bg-white/95 backdrop-blur px-2 py-1 text-[8px] font-black uppercase rounded-md shadow-sm border border-gray-50">
                                   Qty: {product.stock}
                                </span>
                             </div>
                          </div>
                          <h3 className="text-[10px] md:text-[11px] font-bold text-black uppercase truncate mb-1">{product.name}</h3>
                          <div className="flex items-center justify-between">
                             <span className="text-xs md:text-sm font-black text-black">{formatPrice(product.price)}</span>
                             <div className="w-7 h-7 bg-black text-white flex items-center justify-center rounded-lg shadow-lg shadow-black/10 transition-all active:scale-90">
                                <Plus className="w-4 h-4" />
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Variant Modal */}
      <AnimatePresence>
        {showVariantModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-2xl space-y-6"
            >
               <div className="flex items-center justify-between">
                  <h3 className="text-base font-black uppercase tracking-tight">Configure</h3>
                  <button onClick={() => setShowVariantModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                     <X className="w-5 h-5 text-gray-400" />
                  </button>
               </div>

               <div className="space-y-5">
                  <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Colors</p>
                     <div className="flex flex-wrap gap-2">
                        {['Black', 'Navy', 'Silver'].map(color => (
                          <button key={color} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-[10px] font-bold uppercase rounded-lg hover:border-black active:bg-black active:text-white transition-all">
                             {color}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Sizes</p>
                     <div className="flex flex-wrap gap-2">
                        {['M', 'L', 'XL'].map(size => (
                          <button key={size} className="w-10 h-10 bg-gray-50 border border-gray-100 text-[10px] font-black uppercase flex items-center justify-center rounded-lg hover:border-black active:bg-black active:text-white transition-all">
                             {size}
                          </button>
                        ))}
                     </div>
                  </div>

                  <button 
                    onClick={() => setShowVariantModal(null)}
                    className="w-full h-11 bg-black text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 rounded-lg active:scale-95 transition-all"
                  >
                    Apply Config
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
