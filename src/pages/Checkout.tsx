import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useLeadStore } from '../store/useLeadStore';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import { useCustomerStore } from '../store/useCustomerStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useDeliveryStore } from '../store/useDeliveryStore';
import { usePromoStore, PromoCode } from '../store/usePromoStore';
import { HomeDeliverySection } from '../components/checkout/HomeDeliverySection';
import { formatPrice, cn } from '../lib/utils';
import { 
  ShieldCheck, CheckCircle2, ArrowLeft, Lock, MapPin, Edit2, Plus, 
  Minus, Truck, CreditCard, ChevronRight, Tag, Banknote, AlertCircle, 
  Home, Navigation, Save, Zap, Key, ShieldAlert, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const hubs = [
];

export default function Checkout() {
  const orderPlacedRef = useRef(false);
  const { items, getCartTotal, updateQuantity, clearCart } = useCartStore();
  const { addOrUpdateLead, deleteLead } = useLeadStore();
  const addOrder = useOrderStore((state) => state.addOrder);
  const { user, isAuthenticated } = useAuthStore();
  const { customers, addCustomer } = useCustomerStore();
  const { settings } = useSettingsStore();
  const { divisionCharges, getChargeByDivision } = useDeliveryStore();
  const navigate = useNavigate();

  // Restore leadId
  const leadId = useMemo(() => Math.random().toString(36).substring(2, 10), []);

  // Form Data structure optimized
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    landmark: '',
    note: '',
    email: '',
    division: '',
    saveAddress: true
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [promoCode, setPromoCode] = useState('');
  const [activePromo, setActivePromo] = useState<PromoCode | null>(null);
  const [promoStatus, setPromoStatus] = useState<'idle' | 'valid' | 'invalid' | 'expired'>('idle');
  const [promoError, setPromoError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableMethods = useMemo(() => {
    const methods = [];
    if (settings.codEnabled) {
      methods.push({
        id: 'cod',
        short: 'COD',
        name: settings.codName || 'Cash on Delivery',
        logo: settings.codLogo || 'https://cdn-icons-png.flaticon.com/512/6491/6491517.png',
        instruction: settings.codInstruction || 'Pay with cash upon receiving your order at your doorstep.',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      });
    }
    if (settings.bkashEnabled) {
      methods.push({
        id: 'bkash',
        short: 'bKash',
        name: settings.bkashName || 'bKash Personal',
        logo: settings.bkashLogo || 'https://www.logo.wine/a/logo/BKash/BKash-Icon-Logo.wine.svg',
        number: settings.bkashNumber || '01711223344',
        instruction: settings.bkashInstruction || 'Please Send Money to the bKash Personal number above. Enter your bKash wallet number and your transaction reference ID (TxnID) below.',
        badgeColor: 'bg-[#E2125B]/10 text-[#E2125B] border-[#E2125B]/20'
      });
    }
    if (settings.nagadEnabled) {
      methods.push({
        id: 'nagad',
        short: 'Nagad',
        name: settings.nagadName || 'Nagad Personal',
        logo: settings.nagadLogo || 'https://download.logo.wine/logo/Nagad/Nagad-Vertical-Logo.wine.svg',
        number: settings.nagadNumber || '01811223344',
        instruction: settings.nagadInstruction || 'Please Send Money to the Nagad Personal number above. Enter your Nagad wallet number and your transaction reference ID (TxnID) below.',
        badgeColor: 'bg-[#F25C22]/10 text-[#F25C22] border-[#F25C22]/20'
      });
    }
    if (settings.rocketEnabled) {
      methods.push({
        id: 'rocket',
        short: 'Rocket',
        name: settings.rocketName || 'Rocket Personal',
        logo: settings.rocketLogo || 'https://www.logo.wine/a/logo/Dutch_Bangla_Bank/Dutch_Bangla_Bank-Logo.wine.svg',
        number: settings.rocketNumber || '01911223344',
        instruction: settings.rocketInstruction || 'Please Send Money to the Rocket Personal number above. Enter your Rocket wallet number and your transaction reference ID (TxnID) below.',
        badgeColor: 'bg-[#8C3494]/10 text-[#8C3494] border-[#8C3494]/20'
      });
    }
    if (settings.cardEnabled) {
      methods.push({
        id: 'card',
        short: 'Card',
        name: settings.cardName || 'Secure SSL Gateway',
        logo: settings.cardLogo || 'https://cdn-icons-png.flaticon.com/512/349/349228.png',
        number: settings.cardNumber || 'Secure 256-Bit Sandbox Handshake',
        instruction: settings.cardInstruction || 'Please authorize card payment securely via our sandbox-integrated SSL connection gateway.',
        gatewayLink: settings.cardGatewayLink || '',
        badgeColor: 'bg-gray-105 text-neutral-750 border-gray-300'
      });
    }
    return methods;
  }, [settings]);

  useEffect(() => {
    if (availableMethods.length > 0) {
      const isCurrentValid = availableMethods.some(m => m.id === paymentMethod);
      if (!isCurrentValid) {
        setPaymentMethod(availableMethods[0].id);
      }
    }
  }, [availableMethods, paymentMethod]);

  // Payment integration state helpers
  const [bkashNumber, setBkashNumber] = useState('');
  const [bkashTxnId, setBkashTxnId] = useState('');
  const [nagadNumber, setNagadNumber] = useState('');
  const [nagadTxnId, setNagadTxnId] = useState('');
  const [rocketNumber, setRocketNumber] = useState('');
  const [rocketTxnId, setRocketTxnId] = useState('');
  const [isGatewayPaid, setIsGatewayPaid] = useState(false);
  const [gatewayTxnCode, setGatewayTxnCode] = useState('');
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [copyFeedbackMsg, setCopyFeedbackMsg] = useState('Number copied successfully');
  const [gatewayStep, setGatewayStep] = useState<'idle' | 'processing' | 'success'>('idle');

  const triggerCopy = (text: string, message: string = 'Number copied successfully') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopyFeedbackMsg(message);
    setShowCopyFeedback(true);
    setTimeout(() => {
      setShowCopyFeedback(false);
    }, 2500);
  };

  useEffect(() => {
    if (showGatewayModal) {
      setGatewayStep('idle');
    }
  }, [showGatewayModal]);

  // Auto-fill logged-in user details if available
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone || '',
        address: user.address || prev.address || '',
        landmark: user.landmark || prev.landmark || '',
      }));
    }
  }, [user, isAuthenticated]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your full name';
    if (!/^01[3-9]\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (01XXXXXXXXX)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Detailed delivery address is required';
    }
    
    if (!formData.division) {
      newErrors.division = 'Please select your division';
    }

    // Conditional payment field validations
    if (paymentMethod === 'bkash') {
      if (!bkashNumber.trim()) newErrors.bkashNumber = 'bKash phone number is required';
      if (!bkashTxnId.trim()) newErrors.bkashTxnId = 'Transaction ID is required';
    } else if (paymentMethod === 'nagad') {
      if (!nagadNumber.trim()) {
        newErrors.nagadNumber = 'Nagad phone number is required';
      }
      if (!nagadTxnId.trim()) {
        newErrors.nagadTxnId = 'Transaction ID is required';
      }
    } else if (paymentMethod === 'rocket') {
      if (!rocketNumber.trim()) {
        newErrors.rocketNumber = 'Rocket phone number is required';
      }
      if (!rocketTxnId.trim()) {
        newErrors.rocketTxnId = 'Transaction ID is required';
      }
    } else if (paymentMethod === 'card') {
      if (!isGatewayPaid) {
        newErrors.cardGateway = 'Please authorize the payment gateway transaction by clicking "OPEN PAYMENT GATEWAY" first';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Track field changes for incomplete orders (Leads feature)
  const handleInputChange = (field: string, value: string | boolean) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Clear error when typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
    
    // Auto-save lead logic
    addOrUpdateLead({
      id: leadId,
      name: newData.name,
      phone: newData.phone,
      address: newData.address,
      email: newData.email, 
      items: items.map(i => ({ name: i.name, quantity: i.quantity })),
      total: subtotal + shipping - discount + vat
    });
  };

  const handleUseLocation = () => {
    handleInputChange('address', 'House 12, Road 5, Block C, Dhanmondi 27, Dhaka-1209');
  };

  const subtotal = getCartTotal();

  // Live Promo Validation
  const validatePromo = usePromoStore(state => state.validatePromoCode);
  
  useEffect(() => {
    if (!promoCode) {
      setPromoStatus('idle');
      setActivePromo(null);
      setPromoError('');
      return;
    }

    setIsValidating(true);
    const debounceTimer = setTimeout(() => {
      const result = validatePromo(promoCode, subtotal);
      if (result.isValid && result.promo) {
        setPromoStatus('valid');
        setActivePromo(result.promo);
        setPromoError('');
      } else {
        if (result.error === 'Coupon Expired') {
          setPromoStatus('expired');
        } else {
          setPromoStatus('invalid');
        }
        setPromoError(result.error || 'Invalid Code');
        setActivePromo(null);
      }
      setIsValidating(false);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [promoCode, subtotal, validatePromo]);

  // Dynamic shipping based on division
  const shipping = formData.division ? getChargeByDivision(formData.division) : 0;
  
  const discount = useMemo(() => {
    if (!activePromo) return 0;
    if (activePromo.type === 'Percentage') {
      return Math.round((subtotal * activePromo.value) / 100);
    }
    if (activePromo.type === 'Fixed Amount') {
      return activePromo.value;
    }
    return 0; // Free delivery handled separately
  }, [activePromo, subtotal]);

  const finalShipping = activePromo?.freeDelivery ? 0 : shipping;
  const vat = Math.round((subtotal - discount) * 0.05); 
  const total = subtotal + finalShipping - discount + vat;

  const handleSubmit = (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Map payment label corresponding to the type constraint
    const paymentM = (paymentMethod === 'bkash' ? 'bKash' : 
                     paymentMethod === 'nagad' ? 'Nagad' :
                     paymentMethod === 'rocket' ? 'Rocket' : 'Card') as 'bKash' | 'Nagad' | 'Rocket' | 'Card';

    const paymentS = (paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid') as 'Paid' | 'Partial' | 'Unpaid' | 'Cash on Delivery';

    const placedOrder = addOrder({
      customerName: formData.name,
      mobileNumber: formData.phone,
      fullAddress: `${formData.address}${formData.landmark ? `, Landmark: ${formData.landmark}` : ''}`,
      cityArea: formData.division || 'Dhaka',
      deliveryMode: 'Standard Delivery',
      paymentMethod: paymentM,
      status: 'Placed',
      paymentStatus: paymentS,
      type: 'Online',
      items: items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        variant: 'Default',
        image: item.image
      })),
      subtotal: subtotal,
      discount: activePromo ? { 
        type: activePromo.type === 'Percentage' ? 'percent' : 'fixed', 
        value: activePromo.value, 
        amount: discount
      } : { type: 'fixed', value: 0, amount: 0 },
      tax: { percent: 5, amount: vat },
      deliveryCharge: finalShipping,
      paidAmount: paymentMethod === 'cod' ? 0 : total,
      dueAmount: paymentMethod === 'cod' ? total : 0,
      total: total,
      notes: formData.note || undefined,
    });

    // Automatically create/link temporary customer profile if they don't exist
    const exists = customers.find(c => c.phones.includes(formData.phone));
    if (!exists) {
      addCustomer({
        name: formData.name,
        phones: [formData.phone],
        address: {
          country: 'Bangladesh',
          city: 'Dhaka',
          area: 'Dhaka',
          street: formData.address,
        },
        emails: formData.email ? [formData.email] : [],
        socialLinks: [],
        note: `Temporary profile created via secure checkout on ${new Date().toLocaleDateString()}`
      });
    }

    orderPlacedRef.current = true;
    deleteLead(leadId);
    
    navigate(`/checkout/success/${placedOrder.orderId}`, { replace: true });
    
    // Clear cart after navigation to prevent UI flicker
    setTimeout(() => {
      clearCart();
    }, 100);
  };

  useEffect(() => {
    if (items.length === 0 && !orderPlacedRef.current) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, navigate]);

  if (items.length === 0 && !orderPlacedRef.current) {
    return null;
  }

  return (
    <div id="checkout-root" className="bg-neutral-50/55 min-h-screen pb-24 font-sans text-neutral-900 selection:bg-neutral-950 selection:text-white">
      {/* Premium Compact Header */}
      <div id="checkout-header" className="sticky top-[72px] z-30 bg-white/95 backdrop-blur-md border-b border-neutral-100 py-3 px-4 md:px-8 flex items-center justify-between">
        <button id="checkout-back-btn" onClick={() => navigate(-1)} className="p-2 -ml-2 text-neutral-900 hover:bg-neutral-50 rounded-full transition-colors flex items-center gap-1 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden md:block font-bold text-xs uppercase tracking-wider">Back</span>
        </button>
        <span id="checkout-title" className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">
          Fast Express Checkout
        </span>
        <div id="checkout-secure-badge" className="p-1.5 text-neutral-950 flex items-center gap-1 bg-neutral-50 rounded border border-neutral-200">
          <Lock className="w-3.5 h-3.5" />
          <span className="text-[9px] font-black uppercase tracking-wider text-neutral-500">SSL SECURE</span>
        </div>
      </div>

      <div id="checkout-content" className="container mx-auto px-4 md:px-8 max-w-5xl pt-6 md:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* Main Checkout Inputs Area (Exactly aligned step-by-step requested flow) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* STEP 1: DELIVERY TYPE (Home Delivery vs Point Pickup) */}
            <div id="checkout-step-delivery" className="bg-white rounded-lg p-5 border border-neutral-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
                <span className="w-5 h-5 bg-black text-white rounded-md flex items-center justify-center text-[10px] font-black">1</span>
                <h3 className="text-xs font-black uppercase tracking-widest text-[#000000]">Delivery Method</h3>
              </div>
              
              <div className="flex items-center gap-2.5 h-14 w-full bg-neutral-950 rounded-lg border border-neutral-950 text-white shadow-sm justify-center">
                <Truck className="w-5 h-5 text-white" />
                <span className="text-sm font-black uppercase tracking-widest leading-none">Home Delivery (Standard)</span>
              </div>
            </div>

            {/* STEP 2: CUSTOMER INFORMATION */}
            <div id="checkout-step-customer" className="bg-white rounded-lg p-5 border border-neutral-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
                <span className="w-5 h-5 bg-black text-white rounded-md flex items-center justify-center text-[10px] font-black">2</span>
                <h3 className="text-xs font-black uppercase tracking-widest text-[#000000]">Customer Information</h3>
              </div>

              {/* 1. Full Name */}
              <div id="input-group-name">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-0.5 block mb-1">Full Name (Required)</label>
                <input 
                  id="checkout-name"
                  type="text" 
                  placeholder="E.g. Imtiaz Khan" 
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={cn(
                    "w-full bg-white border px-3.5 h-10 rounded-lg focus:outline-none focus:border-black text-xs font-bold transition-all placeholder:font-normal placeholder:text-neutral-400",
                    errors.name ? "border-red-500 bg-red-50/5" : "border-neutral-250"
                  )} 
                />
                {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1.5 flex items-center gap-1 pl-1 uppercase"><AlertCircle className="w-3.5 h-3.5" /> {errors.name}</p>}
              </div>

              {/* 2. Phone Number */}
              <div id="input-group-phone">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-0.5 block mb-1">Phone Number (Required)</label>
                <input 
                  id="checkout-phone"
                  type="tel" 
                  placeholder="01XXXXXXXXX" 
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={cn(
                    "w-full bg-white border px-3.5 h-10 rounded-lg focus:outline-none focus:border-black text-xs font-bold transition-all placeholder:font-normal placeholder:text-neutral-400",
                    errors.phone ? "border-red-500 bg-red-50/5" : "border-neutral-250"
                  )} 
                />
                {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1.5 flex items-center gap-1 pl-1 uppercase"><AlertCircle className="w-3.5 h-3.5" /> {errors.phone}</p>}
              </div>

              {/* Division Selection */}
              <div id="input-group-division">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-0.5 block mb-1">Select Division (For Delivery Charge)</label>
                <select 
                  id="checkout-division"
                  value={formData.division}
                  onChange={(e) => handleInputChange('division', e.target.value)}
                  className={cn(
                    "w-full bg-white border px-3.5 h-10 rounded-lg focus:outline-none focus:border-black text-xs font-bold transition-all appearance-none cursor-pointer",
                    errors.division ? "border-red-500 bg-red-50/5" : "border-neutral-250"
                  )}
                >
                  <option value="">Select your division</option>
                  {divisionCharges.map(div => (
                    <option key={div.id} value={div.name}>{div.name}</option>
                  ))}
                </select>
                {errors.division && <p className="text-[10px] text-red-500 font-bold mt-1.5 flex items-center gap-1 pl-1 uppercase"><AlertCircle className="w-3.5 h-3.5" /> {errors.division}</p>}
              </div>

              {/* 3. Address Details (Home Delivery vs Hub Select summary) */}
              <div id="input-group-address">
                <HomeDeliverySection 
                  formData={formData} 
                  handleInputChange={handleInputChange} 
                  handleUseLocation={handleUseLocation}
                  errors={errors}
                />
              </div>

              {/* 4. Email Address */}
              <div id="input-group-email">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-0.5 block mb-1">Gmail Address (Optional)</label>
                <input 
                  id="checkout-email"
                  type="email" 
                  placeholder="you@domain.com" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full bg-white border border-neutral-250 px-3.5 h-10 rounded-lg focus:outline-none focus:border-black text-xs font-semibold placeholder:font-normal placeholder:text-neutral-400"
                />
              </div>

              {/* 5. Instruction Note */}
              <div id="input-group-note">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-0.5 block mb-1">Instruction Note (Optional)</label>
                <textarea 
                  id="checkout-note"
                  rows={2}
                  placeholder="Any delivery instruction?" 
                  value={formData.note}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  className="w-full bg-white border border-neutral-250 px-3.5 py-2 rounded-lg focus:outline-none focus:border-black text-xs font-semibold placeholder:font-normal placeholder:text-neutral-400 resize-none"
                />
              </div>
            </div>

            {/* STEP 3: PAYMENT MODE */}
            <div id="checkout-step-payment" className="bg-white rounded-none p-5 border border-neutral-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
                <span className="w-5 h-5 bg-black text-white rounded-none flex items-center justify-center text-[10px] font-black">3</span>
                <h3 className="text-xs font-black uppercase tracking-widest text-[#000000]">Payment Mode</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableMethods.map(method => (
                  <button 
                    id={`payment-method-${method.id}`}
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      "p-3 border rounded-none cursor-pointer transition-all flex items-center justify-between text-left gap-3 min-h-[56px] hover:border-neutral-400",
                      paymentMethod === method.id 
                        ? "border-neutral-900 bg-neutral-950 text-white shadow-sm" 
                        : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {method.logo ? (
                        <div className="w-12 h-8 bg-neutral-100 flex items-center justify-center border border-neutral-250 shrink-0">
                          <img 
                            src={method.logo} 
                            alt={method.name} 
                            className="max-h-6 max-w-[40px] object-contain" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-8 bg-neutral-900 text-white flex items-center justify-center border border-neutral-250 shrink-0 text-[10px] font-bold uppercase">
                          {method.short}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-xs font-black uppercase tracking-wide truncate block">{method.name}</span>
                        {method.number && (
                          <span className={cn("text-[8px] font-mono block tracking-wider leading-none mt-0.5", paymentMethod === method.id ? "text-neutral-300" : "text-neutral-500")}>
                            {method.number}
                          </span>
                        )}
                      </div>
                    </div>
                    {paymentMethod === method.id ? (
                      <div className="w-4 h-4 rounded-none bg-white text-black flex items-center justify-center text-[9px] font-black shrink-0">
                        ✓
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-none border border-neutral-300 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Conditional payment verification inputs */}
              <AnimatePresence mode="wait">
                {['bkash', 'nagad', 'rocket'].includes(paymentMethod) && (
                  (() => {
                    const activeMethod = availableMethods.find(m => m.id === paymentMethod);
                    if (!activeMethod) return null;
                    const colorMap = {
                      bkash: '#E2125B',
                      nagad: '#F25C22',
                      rocket: '#8C3494'
                    };
                    const color = colorMap[paymentMethod as 'bkash' | 'nagad' | 'rocket'] || '#000000';
                    const numVal = paymentMethod === 'bkash' ? bkashNumber : paymentMethod === 'nagad' ? nagadNumber : rocketNumber;
                    const setNumVal = paymentMethod === 'bkash' ? setBkashNumber : paymentMethod === 'nagad' ? setNagadNumber : setRocketNumber;
                    const txnVal = paymentMethod === 'bkash' ? bkashTxnId : paymentMethod === 'nagad' ? nagadTxnId : rocketTxnId;
                    const setTxnVal = paymentMethod === 'bkash' ? setBkashTxnId : paymentMethod === 'nagad' ? setNagadTxnId : setRocketTxnId;
                    const labelSender = `${activeMethod.name} Sender Mobile`;
                    const labelTxn = `${activeMethod.name} Transaction ID`;
                    const errNum = paymentMethod === 'bkash' ? errors.bkashNumber : paymentMethod === 'nagad' ? errors.nagadNumber : errors.rocketNumber;
                    const errTxn = paymentMethod === 'bkash' ? errors.bkashTxnId : paymentMethod === 'nagad' ? errors.nagadTxnId : errors.rocketTxnId;

                    return (
                      <motion.div
                        key={`${paymentMethod}-fields`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-neutral-50 rounded-none border border-neutral-200 space-y-3.5 overflow-hidden text-left"
                      >
                        <div className="p-3 bg-white border border-neutral-200 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-neutral-100">
                            <p className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color }}>
                              <span className="inline-block w-2.5 h-2.5 rounded-none" style={{ backgroundColor: color }} />
                              Send Money to: <span className="text-neutral-900 font-extrabold font-mono text-sm tracking-widest select-all">{activeMethod.number}</span>
                            </p>
                            <button
                              type="button"
                              onClick={() => triggerCopy(activeMethod.number || '', 'Number copied successfully')}
                              className="px-2 py-1 bg-white hover:bg-neutral-50 border border-neutral-250 text-neutral-900 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 active:scale-[0.95] transition-all cursor-pointer shadow-sm select-none rounded-none"
                            >
                              <span>📋 COPY</span>
                            </button>
                          </div>
                          <p className="text-[10.5px] text-neutral-500 leading-relaxed font-semibold uppercase">
                            {activeMethod.instruction}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black tracking-wider text-neutral-400 uppercase block">{labelSender}</label>
                            <input
                              type="text"
                              placeholder="e.g. 017XXXXXXXX"
                              value={numVal}
                              onChange={(e) => setNumVal(e.target.value)}
                              className={cn(
                                "w-full h-10 bg-white border rounded-none px-3 text-xs font-bold focus:outline-none focus:border-neutral-900 placeholder:font-normal",
                                errNum ? "border-red-500" : "border-neutral-300"
                              )}
                            />
                            {errNum && <p className="text-[10px] text-red-500 font-bold uppercase mt-1 pl-0.5">{errNum}</p>}
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black tracking-wider text-neutral-400 uppercase block">{labelTxn}</label>
                            <input
                              type="text"
                              placeholder="e.g. TXN9824XW"
                              value={txnVal}
                              onChange={(e) => setTxnVal(e.target.value)}
                              className={cn(
                                "w-full h-10 bg-white border rounded-none px-3 text-xs font-bold focus:outline-none focus:border-neutral-900 placeholder:font-normal",
                                errTxn ? "border-red-500" : "border-neutral-300"
                              )}
                            />
                            {errTxn && <p className="text-[10px] text-red-500 font-bold uppercase mt-1 pl-0.5">{errTxn}</p>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()
                )}

                {paymentMethod === 'card' && (
                  (() => {
                    const cardMethod = availableMethods.find(m => m.id === 'card');
                    if (!cardMethod) return null;
                    return (
                      <motion.div
                        key="card-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-neutral-50 rounded-none border border-neutral-200 space-y-4 overflow-hidden text-left"
                      >
                        {/* Secure Info Badges */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pb-3 border-b border-neutral-200">
                          <div className="flex items-center gap-1 text-[9px] font-bold text-neutral-600 uppercase tracking-wider">
                            <Lock className="w-3 h-3 text-emerald-600" />
                            <span>SSL Secured Payment</span>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-neutral-600 uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>PCI Compliant</span>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-neutral-600 uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Trusted Gateway</span>
                          </div>
                        </div>

                        {/* Instruction content */}
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-black text-[#000000] uppercase tracking-wider">{cardMethod.name}</h4>
                          <p className="text-[11px] text-neutral-500 leading-normal font-semibold uppercase tracking-wide">
                            {cardMethod.instruction}
                          </p>
                        </div>

                        {/* Accepted Card Badges */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest block">Accepted Cards</span>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-[#1A1F71] text-white font-extrabold italic px-2 py-0.5 rounded-none text-[8.5px] tracking-wider select-none">VISA</span>
                            <span className="bg-[#FF5F00] text-white font-black px-2 py-0.5 rounded-none text-[8.5px] tracking-wider select-none">MASTERCARD</span>
                            <span className="bg-[#0070CD] text-white font-extrabold px-2 py-0.5 rounded-none text-[8.5px] tracking-wider select-none">AMEX</span>
                          </div>
                        </div>

                        {/* Reference Card Payment Number / Gateway details */}
                        <div className="bg-white p-2.5 border border-neutral-200 flex items-center justify-between gap-2 shadow-sm rounded-none">
                          <div className="flex flex-col min-w-0">
                            <span className="text-[8px] font-black uppercase tracking-widest text-neutral-450 leading-none mb-1">Gateway Details / Info</span>
                            <span className="text-[11px] font-bold font-mono text-neutral-900 tracking-wider uppercase select-all truncate">{cardMethod.number}</span>
                          </div>
                          <button
                            id="copy-payment-num-btn"
                            type="button"
                            onClick={() => triggerCopy(cardMethod.number || '', 'Gateway info copied successfully')}
                            className="px-2.5 py-1.5 shrink-0 bg-white hover:bg-neutral-50 border border-neutral-250 text-neutral-900 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 active:scale-[0.95] transition-all cursor-pointer shadow-sm select-none rounded-none"
                          >
                            <span>📋 COPY</span>
                          </button>
                        </div>

                        {/* Gateway Trigger Action Area */}
                        <div className="pt-3 border-t border-dashed border-neutral-200 space-y-2">
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Or click to authorize card payment:</p>
                          
                          {isGatewayPaid ? (
                            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-none border border-emerald-200 text-xs font-bold leading-relaxed flex items-center gap-2">
                              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                              <div className="text-left">
                                <p className="uppercase tracking-wider text-[10.5px]">Secure Gateway Verified</p>
                                <p className="text-[9.5px] text-emerald-600 font-mono mt-0.5 uppercase">Reference ID: {gatewayTxnCode}</p>
                              </div>
                            </div>
                          ) : (
                            <button
                              id="open-gateway-btn"
                              type="button"
                              onClick={() => {
                                if (cardMethod.gatewayLink) {
                                  window.open(cardMethod.gatewayLink, '_blank');
                                }
                                setShowGatewayModal(true);
                              }}
                              className="w-full h-11 bg-neutral-900 hover:bg-black text-white rounded-none text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm select-none"
                            >
                              <Lock className="w-3.5 h-3.5 text-emerald-400" /> OPEN SECURE PAYMENT GATEWAY
                            </button>
                          )}
                          
                          {errors.cardGateway && (
                            <p id="error-card-gateway" className="text-[10px] text-red-500 font-bold mt-1.5 flex items-center gap-1 pl-1 uppercase">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.cardGateway}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })()
                )}
              </AnimatePresence>
            </div>

            {/* PRODUCT SUMMARY COMPACT VIEWS */}
            <div id="checkout-cart-items" className="bg-white rounded-lg p-5 border border-neutral-200 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-2">Shopping Items ({items.length})</h4>
              <div className="divide-y divide-neutral-100">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="w-12 h-12 shrink-0 bg-neutral-50 rounded border border-neutral-200 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-neutral-900 truncate leading-tight mb-1">{item.name}</h5>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Quantity: {item.quantity}</span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-neutral-900">{formatPrice(item.price)}</span>
                        <div className="flex items-center gap-1.5 border border-neutral-200 rounded p-0.5 bg-neutral-50">
                          <button 
                            id={`minus-qty-${item.id}`}
                            type="button"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-black transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-4 text-center text-[10px] font-black text-neutral-900 leading-none">{item.quantity}</span>
                          <button 
                            id={`plus-qty-${item.id}`}
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-black transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          
          {/* Right Column: Billing / Order Summary Section */}
          <div className="lg:col-span-5">
            <div id="checkout-sidebar" className="bg-white rounded-lg border border-neutral-200 p-5 lg:sticky lg:top-28 shadow-sm space-y-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#000000] border-b border-neutral-150 pb-2 mb-2">Order Billing Summary</h3>
              
              {/* Promo Code input wrapper */}
              <div id="checkout-promo-wrapper" className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className={cn(
                      "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                      promoStatus === 'valid' ? "text-emerald-500" : 
                      promoStatus === 'invalid' ? "text-red-500" :
                      promoStatus === 'expired' ? "text-orange-500" : "text-neutral-400"
                    )} />
                    <input 
                      id="checkout-promocode-input"
                      type="text" 
                      placeholder="Coupon / Promo" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className={cn(
                        "w-full bg-neutral-50 border text-neutral-900 pl-10 pr-10 h-10 rounded-lg text-xs uppercase placeholder:text-neutral-400 placeholder:normal-case font-bold focus:outline-none transition-all",
                        promoStatus === 'valid' ? "border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-50/10" :
                        promoStatus === 'invalid' ? "border-red-500 ring-2 ring-red-500/10 animate-shake" :
                        promoStatus === 'expired' ? "border-orange-500 ring-2 ring-orange-500/10" : "border-neutral-200 focus:bg-white focus:ring-1 focus:ring-black"
                      )}
                    />
                    {isValidating && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="animate-spin h-3.5 w-3.5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                    {promoStatus === 'valid' && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 animate-in zoom-in duration-300" />}
                    {promoStatus === 'invalid' && <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500 animate-in zoom-in duration-300" />}
                    {promoStatus === 'expired' && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 animate-in zoom-in duration-300" />}
                  </div>
                </div>
                
                <AnimatePresence>
                  {promoStatus !== 'idle' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                        promoStatus === 'valid' ? "text-emerald-600" :
                        promoStatus === 'expired' ? "text-orange-600" : "text-red-600"
                      )}
                    >
                      {promoStatus === 'valid' ? 'Valid Coupon Applied' : promoError}
                      {promoStatus === 'valid' && activePromo?.freeDelivery && (
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded-none text-[8px] animate-pulse">Free Delivery Activated</span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2.5 text-xs font-semibold font-sans border-t border-b border-neutral-100 py-3">
                <div className="flex justify-between text-neutral-500">
                  <span>Cart Subtotal</span>
                  <span className="font-extrabold text-neutral-900">{formatPrice(subtotal)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Discount ({activePromo?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className={cn(
                  "flex justify-between p-2 rounded-md border italic transition-all",
                  activePromo?.freeDelivery ? "bg-blue-50 text-blue-700 border-blue-200" : "text-neutral-900 bg-neutral-50 border-neutral-100"
                )}>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Delivery Charge ({formData.division || 'Select Division'})</span>
                  </div>
                  <span className={cn("font-black", activePromo?.freeDelivery && "line-through text-neutral-400")}>
                    {formatPrice(shipping)}
                  </span>
                  {activePromo?.freeDelivery && <span className="font-black ml-2">FREE</span>}
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Tax & Govt VAT (5%)</span>
                  <span className="font-extrabold text-neutral-900">{formatPrice(vat)}</span>
                </div>
              </div>

              <div className="flex justify-between text-neutral-900 text-base font-black uppercase tracking-tight">
                <span>Total Amount</span>
                <span>{formatPrice(total)}</span>
              </div>

              <div className="flex items-center gap-2 text-neutral-500 text-[9px] font-black uppercase tracking-widest justify-center bg-neutral-50 py-2 rounded-lg border border-neutral-150">
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>SSL Encrypted Gate</span>
              </div>
              
              {/* Large Place Order Button for Desktop */}
              <button 
                id="place-order-desktop-btn"
                type="button"
                onClick={() => handleSubmit()}
                className="hidden md:flex w-full bg-neutral-900 hover:bg-black text-white h-[48px] font-black uppercase text-xs tracking-widest transition-all rounded-lg items-center justify-center gap-2 cursor-pointer shadow-sm select-none active:scale-[0.99]"
              >
                Place Order <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky Bottom Bar (Mobile thumb-friendly) */}
      <div id="checkout-sticky-bottom" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 p-3 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
         <div className="container mx-auto max-w-7xl flex items-center justify-between gap-3">
            <div className="flex flex-col">
               <span className="text-[8px] text-neutral-405 font-black uppercase tracking-wider">{items.length} Product Items</span>
               <span className="text-base font-black text-neutral-950 tracking-tight leading-none">{formatPrice(total)}</span>
            </div>
            <button 
              id="place-order-mobile-btn"
              type="button"
              onClick={() => handleSubmit()}
              className="flex-1 h-[44px] bg-neutral-900 hover:bg-black text-white rounded-lg font-black uppercase text-xs tracking-widest shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Place Order <Lock className="w-3.5 h-3.5" />
            </button>
         </div>
      </div>



      {/* Secure Payment Gateway Simulator Overlay (SSLCommerz / Stripe style) */}
      <AnimatePresence>
        {showGatewayModal && (
          <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (gatewayStep !== 'processing') setShowGatewayModal(false);
              }}
              className="absolute inset-0 bg-neutral-950/65 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl w-full max-w-lg relative z-10 shadow-2xl border border-neutral-200 overflow-hidden font-sans text-neutral-900"
            >
              {/* Simulator Top Header Bar */}
              <div className="bg-neutral-900 text-white px-5 py-4 flex items-center justify-between border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Secure Sandboxed Gateway</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-neutral-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>256-Bit SSL protection</span>
                </div>
              </div>

              {gatewayStep === 'idle' && (
                <div className="p-6 md:p-8 space-y-6 text-left">
                  {/* Merchant & Order details */}
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#000000] block mb-0.5 opacity-55">Merchant Account</span>
                      <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wide">Express Ecommerce BD</h4>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#000000] block mb-0.5 opacity-55">Order Amount</span>
                      <p className="text-sm font-black text-neutral-900 tracking-tight">{formatPrice(total)}</p>
                    </div>
                  </div>

                  {/* Gateway options summary */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block pl-0.5">Select Sandbox Processor Gateway</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-neutral-50 rounded-xl border-2 border-neutral-900 cursor-pointer text-left relative flex flex-col justify-between h-20 select-none">
                        <CheckCircle2 className="w-4 h-4 text-neutral-900 absolute top-2 right-2" />
                        <span className="text-xs font-black tracking-wide text-neutral-800 uppercase">SSLCommerz</span>
                        <div className="flex gap-1">
                          <span className="text-[8px] font-bold tracking-widest uppercase border border-neutral-300 px-1 py-0.5 rounded text-neutral-500 bg-white">VISA</span>
                          <span className="text-[8px] font-bold tracking-widest uppercase border border-neutral-300 px-1 py-0.5 rounded text-neutral-500 bg-white">M/CARD</span>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-neutral-50/20 rounded-xl border border-neutral-200 cursor-not-allowed opacity-60 text-left flex flex-col justify-between h-20 select-none">
                        <span className="text-xs font-black tracking-wide text-neutral-400 uppercase">Stripe Gateway</span>
                        <span className="text-[8px] font-bold uppercase text-neutral-400">Simulation Offline</span>
                      </div>
                    </div>
                  </div>

                  {/* Regulatory disclaimer info */}
                  <div className="bg-emerald-50/45 p-4 rounded-xl border border-emerald-100 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-800 uppercase tracking-wide">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Regulatory Trust & Certification</span>
                    </div>
                    <p className="text-[10px] text-emerald-700/85 leading-relaxed font-semibold">
                      This simulated sandbox complies entirely with PCI-DSS network requirements. For security assurance purposes, no bank transaction passwords or live pins will ever be collected.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5 pt-2 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => {
                        setGatewayStep('processing');
                        setTimeout(() => {
                          setGatewayStep('success');
                          const txn = 'SSL-MC-4242-' + Math.floor(100000 + Math.random() * 900000);
                          setIsGatewayPaid(true);
                          setGatewayTxnCode(txn);
                          // Clear validator error
                          if (errors.cardGateway) {
                            const updatedErr = { ...errors };
                            delete updatedErr.cardGateway;
                            setErrors(updatedErr);
                          }
                          setTimeout(() => {
                            setShowGatewayModal(false);
                          }, 1200);
                        }, 2200);
                      }}
                      className="w-full h-12 bg-neutral-900 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer select-none"
                    >
                      <Lock className="w-4 h-4 text-emerald-400" /> Proceed to Sandbox Pay ({formatPrice(total)})
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowGatewayModal(false)}
                      className="w-full h-10 bg-white hover:bg-neutral-50 text-neutral-500 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer select-none"
                    >
                      Cancel Transaction
                    </button>
                  </div>
                </div>
              )}

              {gatewayStep === 'processing' && (
                <div className="p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    {/* Ripple outer spinner */}
                    <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin" />
                    <Lock className="w-5 h-5 text-slate-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-[#000000]">Securing Gateway Handshake</h4>
                    <p className="text-[11px] text-neutral-500 max-w-sm leading-relaxed font-semibold">
                      Please do not close this window. We are authorizing secure handshake requests with sandbox SSLCommerz endpoints...
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 py-2 px-4 rounded-xl flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 font-mono">Status: Routing auth net handshake...</span>
                  </div>
                </div>
              )}

              {gatewayStep === 'success' && (
                <div className="p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-6">
                  {/* Success pulse wrapper */}
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-black uppercase tracking-widest text-emerald-800">Payment Certified</h4>
                    <p className="text-[11px] text-neutral-500 max-w-sm leading-relaxed font-semibold">
                      Sandbox payment completed! Returning to verified checkout session.
                    </p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-150 py-2.5 px-4 rounded-xl text-[10px] text-emerald-700 font-extrabold uppercase font-mono tracking-wider">
                    TXN CODE: {gatewayTxnCode}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Copy notification toast */}
      <AnimatePresence>
        {showCopyFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] bg-neutral-900 text-white px-4 py-2.5 rounded-none shadow-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border border-neutral-800"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{copyFeedbackMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
