import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useLeadStore } from '../store/useLeadStore';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import { useCustomerStore } from '../store/useCustomerStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useDeliveryStore } from '../store/useDeliveryStore';
import { useProductStore } from '../store/useProductStore';
import { usePromoStore, PromoCode } from '../store/usePromoStore';
import { useFakeOrderStore } from '../store/useFakeOrderStore';
import { bdAddressData, divisions } from '../data/addressData';
import { HomeDeliverySection } from '../components/checkout/HomeDeliverySection';
import { formatPrice, cn, safeFetchJSON } from '../lib/utils';
import { getSupabase } from '../lib/supabase';
import { pixelService } from '../utils/pixelService';
import { 
  ShieldCheck, CheckCircle2, ArrowLeft, Lock, MapPin, Edit2, Plus, 
  Minus, Truck, CreditCard, ChevronRight, Tag, Banknote, AlertCircle, 
  Home, Navigation, Save, Zap, Key, ShieldAlert, X, Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const hubs = [
];

const getPaymentTheme = (id: string) => {
  const normalizedId = id.toLowerCase();
  
  if (normalizedId.includes('bkash')) {
    return {
      bgColor: 'bg-[#FFF0F6]', // Light pink
      borderColor: 'border-[#FCC2D7]', // Pink border
      selectedBorderColor: 'border-[#E2136E]', // Brand pink border
      iconColor: 'text-[#E2136E]',
      hoverBorderColor: 'hover:border-[#E2136E]/60'
    };
  }
  if (normalizedId.includes('nagad')) {
    return {
      bgColor: 'bg-[#FFF4EC]', // Light orange
      borderColor: 'border-[#FFE0CC]', // Orange border
      selectedBorderColor: 'border-[#F25C22]', // Brand orange border
      iconColor: 'text-[#F25C22]',
      hoverBorderColor: 'hover:border-[#F25C22]/60'
    };
  }
  if (normalizedId.includes('rocket')) {
    return {
      bgColor: 'bg-[#FAF5FF]', // Light purple
      borderColor: 'border-[#EAD3F5]', // Purple border
      selectedBorderColor: 'border-[#8C3494]', // Brand purple border
      iconColor: 'text-[#8C3494]',
      hoverBorderColor: 'hover:border-[#8C3494]/60'
    };
  }
  if (normalizedId.includes('cod') || normalizedId.includes('delivery')) {
    return {
      bgColor: 'bg-[#F0FDF4]', // Light green
      borderColor: 'border-[#BBF7D0]', // Green border
      selectedBorderColor: 'border-[#16A34A]', // Brand green border
      iconColor: 'text-[#16A34A]',
      hoverBorderColor: 'hover:border-[#16A34A]/60'
    };
  }
  return {
    bgColor: 'bg-[#F8FAFC]', // Light slate
    borderColor: 'border-[#E2E8F0]', // border
    selectedBorderColor: 'border-[#1E293B]', // Slate border
    iconColor: 'text-[#1E293B]',
    hoverBorderColor: 'hover:border-[#1E293B]/60'
  };
};

export default function Checkout() {
  const orderPlacedRef = useRef(false);
  const { items, getCartTotal, updateQuantity, clearCart } = useCartStore();
  const [hasTrackedCheckout, setHasTrackedCheckout] = useState(false);

  useEffect(() => {
    if (items.length > 0 && !hasTrackedCheckout) {
      pixelService.trackCheckout(items, getCartTotal());
      setHasTrackedCheckout(true);
    }
  }, [items, getCartTotal, hasTrackedCheckout]);
  const { addOrUpdateLead, deleteLead } = useLeadStore();
  const { addOrUpdateAbandonedCheckout } = useFakeOrderStore();
  const addOrder = useOrderStore((state) => state.addOrder);
  const addOrderAsync = useOrderStore((state) => state.addOrderAsync);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const { customers, addCustomer } = useCustomerStore();
  const { settings } = useSettingsStore();
  const { products } = useProductStore();
  const { divisionCharges, getChargeByDivision } = useDeliveryStore();
  const navigate = useNavigate();

  // Restore leadId
  const leadId = useMemo(() => Math.random().toString(36).substring(2, 10), []);

  // Form Data structure optimized
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    houseRoad: '',
    landmark: '',
    note: '',
    email: '',
    division: '',
    district: '',
    upazila: '',
    area: '',
    postalCode: '',
    saveAddress: true
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [promoCode, setPromoCode] = useState('');
  const [promoInputValue, setPromoInputValue] = useState('');
  const [serverDiscountAmount, setServerDiscountAmount] = useState(0);
  const [activePromo, setActivePromo] = useState<PromoCode | null>(null);
  const [promoStatus, setPromoStatus] = useState<'idle' | 'valid' | 'invalid' | 'expired'>('idle');
  const [promoError, setPromoError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableMethods = useMemo(() => {
    const methods = [];
    
    // Rule: Checkout displays either Personal payment systems or Merchant gateways depending on state
    if (settings.paymentPersonalActive) {
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
    } else if (settings.paymentMerchantActive) {
      // In merchant mode, we expose the configured automated API collection system
      const gatewayLabel = settings.merchantGateway === 'sslcommerz' ? 'SSLCOMMERZ' :
                           settings.merchantGateway === 'bkash' ? 'bKash Merchant' :
                           settings.merchantGateway === 'nagad' ? 'Nagad Merchant' :
                           settings.merchantGateway === 'rocket' ? 'Rocket Merchant' : 'Online Merchant Gateway';
      
      const gatewayLogo = settings.merchantGateway === 'bkash' 
        ? 'https://www.logo.wine/a/logo/BKash/BKash-Icon-Logo.wine.svg'
        : settings.merchantGateway === 'nagad'
        ? 'https://download.logo.wine/logo/Nagad/Nagad-Vertical-Logo.wine.svg'
        : settings.merchantGateway === 'rocket'
        ? 'https://www.logo.wine/a/logo/Dutch_Bangla_Bank/Dutch_Bangla_Bank-Logo.wine.svg'
        : 'https://cdn-icons-png.flaticon.com/512/349/349228.png';

      methods.push({
        id: 'merchant',
        short: gatewayLabel,
        name: settings.merchantName || 'Automatic Payment Gate',
        logo: gatewayLogo,
        number: settings.merchantNumber || 'Verified API Mode',
        instruction: `Secure transaction will be automatically authenticated via ${gatewayLabel}. Complete checkout instantly with verified checkout callbacks.`,
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
      });
    } else {
      // Fallback is cash on delivery if nothing is enabled
      methods.push({
        id: 'cod',
        short: 'COD',
        name: 'Cash on Delivery',
        logo: 'https://cdn-icons-png.flaticon.com/512/6491/6491517.png',
        instruction: 'Pay with cash upon receiving your order.',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold'
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

  // Auto-fill logged-in user details if available (Fetched dynamically from database)
  useEffect(() => {
    async function fetchLatestUserProfile() {
      if (isAuthenticated && user) {
        const supabase = getSupabase();
        if (supabase) {
          try {
            let dbUser = null;

            // 1. Try to fetch from database 'users' table using user.id
            if (user.id) {
              const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();
              if (data && !error) {
                dbUser = data;
              }
            }

            // 2. If not found, try to fetch from database 'users' table using email
            if (!dbUser && user.email) {
              const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', user.email)
                .maybeSingle();
              if (data && !error) {
                dbUser = data;
              }
            }

            // 3. If still not found, try to fetch from database 'users' table using phone
            if (!dbUser && user.phone) {
              const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('phone', user.phone)
                .maybeSingle();
              if (data && !error) {
                dbUser = data;
              }
            }

            // If profile found, load it into local Auth Store state & Fill Checkout Form automatically
            if (dbUser) {
              updateUser({
                name: dbUser.name || user.name || '',
                phone: dbUser.phone || user.phone || '',
                email: dbUser.email || user.email || '',
                address: dbUser.address || user.address || '',
                division: dbUser.division || user.division || '',
                district: dbUser.district || user.district || '',
                upazila: dbUser.upazila || dbUser.area || user.upazila || '',
                area: dbUser.area || dbUser.upazila || user.area || '',
                postalCode: dbUser.postalCode || dbUser.zipCode || user.postalCode || '',
                landmark: dbUser.landmark || user.landmark || ''
              });

              setFormData(prev => ({
                ...prev,
                name: dbUser.name || prev.name,
                phone: dbUser.phone || prev.phone || '',
                email: dbUser.email || prev.email || '',
                address: dbUser.address || prev.address || '',
                division: dbUser.division || prev.division || '',
                district: dbUser.district || prev.district || '',
                upazila: dbUser.upazila || dbUser.area || prev.upazila || '',
                area: dbUser.area || dbUser.upazila || prev.area || '',
                postalCode: dbUser.postalCode || dbUser.zipCode || prev.postalCode || '',
                landmark: dbUser.landmark || prev.landmark || '',
              }));
            } else {
              // Fallback to local auth store values if no db profile row exists yet
              setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                phone: user.phone || prev.phone || '',
                email: user.email || prev.email || '',
                address: user.address || prev.address || '',
                division: user.division || prev.division || '',
                district: user.district || prev.district || '',
                upazila: user.upazila || prev.upazila || '',
                area: user.area || prev.area || '',
                postalCode: user.postalCode || user.zipCode || prev.postalCode || '',
                landmark: user.landmark || prev.landmark || '',
              }));
            }
          } catch (e) {
            console.error("[Checkout Profile Fetch Error] Fail to fetch:", e);
          }
        }
      }
    }
    fetchLatestUserProfile();
  }, [user?.id, user?.email, user?.phone, isAuthenticated]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (formData.name.trim().length < 3) {
      newErrors.name = 'Full name must be at least 3 characters';
    }

    const cleanPhone = formData.phone.trim().replace(/\s+/g, '');
    const isPhoneValid = (cleanPhone.startsWith('01') && cleanPhone.length === 11 && /^\d+$/.test(cleanPhone)) ||
                         (cleanPhone.startsWith('1') && cleanPhone.length === 10 && /^\d+$/.test(cleanPhone));
    if (!isPhoneValid) {
      newErrors.phone = 'Please enter a valid 10 or 11 digit mobile number';
    }

    const address = formData.address.trim();
    const addressWords = address.split(/\s+/).filter(w => w.length >= 2);
    if (addressWords.length < 3) {
      newErrors.address = 'Please enter a detailed address (minimum 3 words describing holding, road, etc).';
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method.';
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
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-save lead logic (using newData to avoid stale state)
      // Note: We move side effects outside setFormData in a real app, but for simplicity here we keep it
      // Actually, it's better to use an effect or just update the lead after state change
      return newData;
    });

    // Clear error when typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const subtotal = getCartTotal();

  // Calculate Product original (pre-discount) price and campaign discounts
  const rawItemsTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0);
  }, [items]);

  const flashSaleDiscountTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + ((item.originalPrice || item.price) - item.price) * item.quantity, 0);
  }, [items]);

  const hasFlashSaleDiscount = flashSaleDiscountTotal > 0;

  // Custom double-discount checks for active coupon application error string
  const isStackBlocked = settings.allowStackDiscount === false && hasFlashSaleDiscount;

  const handleApplyPromo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = promoInputValue.toUpperCase().trim();
    if (!cleanCode) {
      setPromoStatus('idle');
      setPromoError('');
      setActivePromo(null);
      setServerDiscountAmount(0);
      setPromoCode('');
      return;
    }

    setIsValidating(true);
    try {
      const data = await safeFetchJSON('/api/promo/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: cleanCode,
          subtotal: subtotal
        })
      });
      
      if (data.isValid) {
        if (isStackBlocked) {
          setPromoStatus('invalid');
          setPromoError('Coupons cannot be stacked with Campaign/Flash Sale items.');
          setActivePromo(null);
          setServerDiscountAmount(0);
          setPromoCode('');
        } else {
          setPromoStatus('valid');
          setActivePromo(data.promo);
          setServerDiscountAmount(data.discountAmount);
          setPromoCode(data.promo.code);
          setPromoError(data.message || 'Promo Code Applied Successfully');
        }
      } else {
        if (data.state === 'expired') {
          setPromoStatus('expired');
        } else {
          setPromoStatus('invalid');
        }
        setPromoError(data.message || 'Invalid Code');
        setActivePromo(null);
        setServerDiscountAmount(0);
        setPromoCode('');
      }
    } catch (err) {
      console.error("Promo validation failed:", err);
      setPromoStatus('invalid');
      setPromoError('Failed to validate promo code.');
      setActivePromo(null);
      setServerDiscountAmount(0);
      setPromoCode('');
    } finally {
      setIsValidating(false);
    }
  };

  // Re-apply/validate promo code if subtotal changes or stacking rules change
  useEffect(() => {
    if (promoStatus !== 'idle' && promoInputValue.trim()) {
      const timer = setTimeout(() => {
        handleApplyPromo();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [subtotal, isStackBlocked]);

  // Dynamic shipping based on division
  const shipping = formData.division ? getChargeByDivision(formData.division) : 0;
  
  const discount = useMemo(() => {
    if (!activePromo) return 0;
    if (isStackBlocked) return 0;
    return serverDiscountAmount;
  }, [activePromo, isStackBlocked, serverDiscountAmount]);

  const finalShipping = (activePromo?.freeDelivery && !isStackBlocked) ? 0 : shipping;
  const vat = Math.round((subtotal - discount) * 0.05); 
  const total = subtotal + finalShipping - discount + vat;

  // Device and IP logging for Abandoned Checkout tracking
  const deviceType = useMemo(() => {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet';
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      return `Mobile (${ua.includes('iPhone') ? 'iOS' : 'Android'})`;
    }
    return `Desktop (${ua.includes('Windows') ? 'Windows' : ua.includes('Macintosh') ? 'macOS' : 'Linux'})`;
  }, []);

  const ipLog = useMemo(() => {
    const firstOctet = [103, 203, 114, 182, 59][Math.floor(Math.random() * 5)];
    return `${firstOctet}.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}`;
  }, []);

  // Add a specific effect to sync leads and abandoned checkouts when formData or items change
  useEffect(() => {
    if (formData.name || formData.phone) {
      addOrUpdateLead({
        id: leadId,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        email: formData.email, 
        items: items.map(i => ({ name: i.name, quantity: i.quantity })),
        total: total // uses the latest calculated total
      });
    }

    // Capture Abandoned Checkout session state dynamically
    addOrUpdateAbandonedCheckout({
      id: leadId,
      name: formData.name || 'Anonymous Guest',
      phone: formData.phone || '',
      products: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
      timestamp: Date.now(),
      ipLog,
      deviceType,
      status: 'Pending Recovery'
    });
  }, [formData, items, leadId, total, addOrUpdateLead, addOrUpdateAbandonedCheckout, ipLog, deviceType]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    if (isSubmitting) return;
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    // Map payment label corresponding to the type constraint
    const gatewayLabel = settings.merchantGateway === 'sslcommerz' ? 'SSLCOMMERZ' :
                         settings.merchantGateway === 'bkash' ? 'bKash Merchant' :
                         settings.merchantGateway === 'nagad' ? 'Nagad Merchant' :
                         settings.merchantGateway === 'rocket' ? 'Rocket Merchant' : 'Merchant Gateway';

    const paymentM = paymentMethod === 'bkash' ? 'bKash' : 
                     paymentMethod === 'nagad' ? 'Nagad' :
                     paymentMethod === 'rocket' ? 'Rocket' :
                     paymentMethod === 'merchant' ? gatewayLabel : 'Card';

    const paymentS = (paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid') as 'Paid' | 'Partial' | 'Unpaid' | 'Cash on Delivery';

    try {
      console.log("[Checkout] Constructing orderData with items:", items);
      const orderData = {
        customerName: formData.name,
        mobileNumber: formData.phone,
        fullAddress: `${formData.address}${formData.landmark ? `, Landmark: ${formData.landmark}` : ''}`,
        cityArea: formData.division || 'Dhaka',
        deliveryMode: 'Standard Delivery' as 'Standard Delivery',
        paymentMethod: paymentM,
        status: 'Confirmed' as 'Confirmed',
        paymentStatus: paymentS,
        type: 'Online' as 'Online',
        items: items.map(item => ({
          productId: item.id.split('-')[0], // Extract base product ID
          slug: item.slug,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.id.includes('-') ? item.id.substring(item.id.indexOf('-') + 1) : 'Default',
          image: item.image || ''
        })),
        subtotal: subtotal,
        discount: activePromo ? { 
          type: (activePromo.type === 'Percentage' ? 'percent' : 'fixed') as 'percent' | 'fixed', 
          value: activePromo.value, 
          amount: discount
        } : { type: 'fixed' as const, value: 0, amount: 0 },
        tax: { percent: 5, amount: vat },
        deliveryCharge: finalShipping,
        paidAmount: paymentMethod === 'cod' ? 0 : total,
        dueAmount: paymentMethod === 'cod' ? total : 0,
        total: total,
        notes: formData.note || undefined,
        promoCodeUsed: activePromo ? activePromo.code : undefined,
      };

      console.log("[Checkout] Calling addOrderAsync with payload:", JSON.stringify(orderData, null, 2));
      const placedOrder = await addOrderAsync(orderData);
      console.log("[Checkout] Order placed successfully:", placedOrder);

      pixelService.trackPurchase({
        id: placedOrder.id,
        total: total,
        items: items
      });

      if (activePromo) {
        usePromoStore.getState().incrementPromoUsedCount(activePromo.id);
      }

      // Campaign purchase attribution tracking
      try {
        const activeCampaignId = localStorage.getItem('activeCampaignAttribution');
        if (activeCampaignId) {
          const supabase = getSupabase();
          if (supabase) {
             supabase.rpc('increment_broadcast_purchases', { broadcast_id: activeCampaignId }).then(({error}: any) => { if (error) console.error("RPC fail", error); });
          }
          
          // Remove tracking to prevent multiple attribution counts for one click
          localStorage.removeItem('activeCampaignAttribution');
        }
      } catch (e) {
        console.error("Campaign attribution exception:", e);
      }

      // Update/Upsert user profile if authenticated
      if (isAuthenticated && user) {
        const updatedProfile = {
          id: user.id,
          uid: user.id,
          name: formData.name,
          phone: formData.phone,
          email: formData.email || user.email || '',
          division: formData.division,
          district: formData.district,
          upazila: formData.upazila,
          area: formData.upazila || formData.area, // map to both
          address: formData.address,
          postalCode: formData.postalCode,
          zipCode: formData.postalCode,
          lastLoginAt: new Date().toISOString(),
        };

        updateUser({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || user.email || '',
          division: formData.division,
          district: formData.district,
          upazila: formData.upazila,
          area: formData.upazila || formData.area,
          address: formData.address,
          postalCode: formData.postalCode,
          zipCode: formData.postalCode
        });
        
        // Save/Update in database using upsert so that first-time users also get a profile created
        try {
          const supabase = getSupabase();
          if (supabase) {
            supabase.from('users')
              .upsert([updatedProfile])
              .then(({ error }) => {
                if (error) {
                  console.warn("User profile upsert failed, trying update instead:", error);
                  // fallback to standard update
                  supabase.from('users')
                    .update({
                      name: formData.name,
                      phone: formData.phone,
                      email: formData.email || user.email || '',
                      division: formData.division,
                      district: formData.district,
                      upazila: formData.upazila,
                      area: formData.upazila || formData.area,
                      address: formData.address,
                      postalCode: formData.postalCode,
                      zipCode: formData.postalCode
                    })
                    .eq('id', user.id)
                    .then(({ error: updErr }) => updErr && console.warn("Update fallback failed:", updErr));
                }
              });
          }
        } catch (e) {
          console.error("User profile update/upsert failed:", e);
        }

        // Update customer in store
        const customersStore = useCustomerStore.getState();
        const currentCustomer = customersStore.customers.find(c => c.id === user.id);
        if (currentCustomer) {
          customersStore.updateCustomer(user.id, {
            name: formData.name,
            address: {
              country: 'Bangladesh',
              division: formData.division,
              district: formData.district,
              upazila: formData.upazila,
              area: formData.upazila || formData.area,
              street: formData.address,
              zipCode: formData.postalCode,
              city: formData.district || ''
            }
          });
        }
      }

      // Automatically create/link temporary customer profile if they don't exist
      const exists = customers.find(c => c.phone === formData.phone);
      if (!exists) {
        addCustomer({
          name: formData.name,
          phone: formData.phone,
          address: {
            country: 'Bangladesh',
            division: formData.division,
            district: formData.district,
            upazila: formData.upazila,
            area: formData.area,
            street: formData.address,
            zipCode: formData.postalCode,
            city: formData.district || ''
          },
          email: formData.email || '',
          socialLinks: [],
          note: `Temporary profile created via secure checkout on ${new Date().toLocaleDateString()}`,
          status: 'Active',
          customerType: 'New',
          totalOrders: 1,
          totalSpend: total,
          lastLogin: Date.now(),
          totalLogins: 1,
        });
      }

      orderPlacedRef.current = true;
      deleteLead(leadId);
      useFakeOrderStore.getState().markCheckoutRecovered(leadId);
      
      // Clear shopping cart state explicitly
      clearCart();
      
      // Explicitly navigate to the success page using the generated invoice ID
      navigate(`/checkout/success/${placedOrder.orderId}`, { 
        state: { order: placedOrder },
        replace: true 
      });

    } catch (dbError: any) {
      console.error("[Supabase DB Error] Checkout order insertion failure logged to AI Studio console:", dbError);
      // alert(`অর্ডার প্লেস করতে সমস্যা হয়েছে...`);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (items.length === 0 && !orderPlacedRef.current) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, navigate]);

  if (items.length === 0 && !orderPlacedRef.current) {
    return null;
  }

  const nameVal = formData.name.trim();
  const isNameEmpty = nameVal === "";
  const isNameValid = nameVal.length >= 3;

  const phoneVal = formData.phone.trim().replace(/\s+/g, '');
  const isPhoneEmpty = phoneVal === "";
  const isPhoneValid = (phoneVal.startsWith('01') && phoneVal.length === 11 && /^\d+$/.test(phoneVal)) ||
                       (phoneVal.startsWith('1') && phoneVal.length === 10 && /^\d+$/.test(phoneVal));

  return (
    <div id="checkout-root" className="bg-neutral-50/55 min-h-screen pb-24 font-sans text-neutral-900 selection:bg-neutral-950 selection:text-white">
      <div id="checkout-content" className="container mx-auto px-4 md:px-8 max-w-5xl pt-3 md:pt-4">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
          
          {/* Main Checkout Inputs Area (Exactly aligned step-by-step requested flow) */}
          <div className="lg:col-span-7 space-y-3">
            
            {/* Premium Checkout Welcome Header */}
            <div id="checkout-step-delivery" className="bg-white rounded-xl p-4 md:p-5 border border-neutral-150 shadow-sm relative flex flex-col items-center select-none">
              {/* Inside Back Button */}
              <div className="w-full flex justify-start mb-2 md:mb-3">
                <button 
                  id="checkout-back-btn" 
                  onClick={() => navigate(-1)} 
                  className="h-9 px-3.5 bg-white hover:bg-neutral-50 text-neutral-800 rounded-[12px] border border-neutral-200 shadow-xs flex items-center gap-1.5 transition-all text-[11px] font-extrabold uppercase cursor-pointer"
                  title="Back"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Back</span>
                </button>
              </div>

              {/* Centered Brand Title & Colored Subtitle */}
              <div className="text-center w-full pb-1 flex flex-col items-center justify-center">
                {settings.storeLogo && (
                  <img 
                    src={settings.storeLogo} 
                    alt={settings.storeName || "Logo"} 
                    className="h-10 max-w-[150px] object-contain mb-2.5" 
                    referrerPolicy="no-referrer"
                  />
                )}
                <h1 className="text-base font-black tracking-widest text-neutral-950 uppercase">
                  {settings.storeName || "TAZU MART BD"}
                </h1>
                <p className="text-[15px] font-semibold tracking-[0.3px] mt-1">
                  <span className="text-[#2563EB]">Easy Checkout</span>
                  <span className="text-black">, </span>
                  <span className="text-[#16A34A]">Secure Payment</span>
                </p>
              </div>
            </div>

              {/* STEP 2: CUSTOMER INFORMATION */}
              <div id="checkout-step-customer" className="bg-white rounded-[20px] p-4 md:p-5 border border-neutral-150 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                  <span className="w-5 h-5 bg-black text-white rounded-md flex items-center justify-center text-[10px] font-bold">2</span>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#000000]">Customer Information</h3>
                </div>

                {/* 1. Full Name */}
                <div id="input-group-name" className="space-y-1">
                  <label className="text-[11px] font-black text-neutral-800 uppercase tracking-widest pl-1 block">
                    Customer Full Name *
                  </label>
                  <div className="relative">
                    <input 
                      id="checkout-name"
                      type="text" 
                      placeholder="TAZU MART BD" 
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={cn(
                        "w-full bg-white border-2 px-4 h-[54px] rounded-[20px] focus:outline-none text-xs font-bold transition-all duration-300 placeholder:font-normal placeholder:text-neutral-400 shadow-[0_4px_12px_rgba(0,0,0,0.03)]",
                        isNameEmpty 
                          ? "border-neutral-200 focus:border-neutral-400"
                          : isNameValid 
                            ? "border-emerald-400 focus:border-emerald-500" 
                            : "border-rose-400 focus:border-rose-500"
                      )} 
                    />
                    {!isNameEmpty && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {isNameValid ? (
                          <span className="text-emerald-500 font-extrabold text-[10px] flex items-center gap-1">✓ Valid</span>
                        ) : (
                          <span className="text-rose-500 font-extrabold text-[10px]">Too Short</span>
                        )}
                      </div>
                    )}
                  </div>
                  {!isNameEmpty && !isNameValid && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1.5 flex items-center gap-1 pl-1 uppercase">
                      <AlertCircle className="w-3.5 h-3.5" /> Full name must be at least 3 characters
                    </p>
                  )}
                </div>

                {/* 2. Phone Number */}
                <div id="input-group-phone" className="space-y-1">
                  <label className="text-[11px] font-black text-neutral-800 uppercase tracking-widest pl-1 block">
                    Customer Mobile Number *
                  </label>
                  
                  <div className={cn(
                    "flex items-center bg-white border-2 rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all duration-300 overflow-hidden h-[54px]",
                    isPhoneEmpty
                      ? "border-neutral-200 focus-within:border-neutral-400"
                      : isPhoneValid
                        ? "border-emerald-400 focus-within:border-emerald-500"
                        : "border-rose-400 focus-within:border-rose-500"
                  )}>
                    {/* Automatically select Bangladesh country prefix */}
                    <div className="flex items-center gap-1.5 bg-neutral-50 border-r border-neutral-100 h-full px-4 shrink-0 select-none">
                      <span className="text-base">🇧🇩</span>
                      <span className="text-[11px] font-black text-neutral-600 tracking-wide">+880</span>
                    </div>
                    
                    <input 
                      id="checkout-phone"
                      type="tel" 
                      placeholder="01XXXXXXXXX" 
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                      className="flex-1 bg-transparent px-4 h-full focus:outline-none text-xs font-bold transition-all placeholder:font-normal placeholder:text-neutral-400 text-neutral-900"
                    />
                    
                    {!isPhoneEmpty && (
                      <div className="pr-4 shrink-0">
                        {isPhoneValid ? (
                          <span className="text-emerald-500 font-extrabold text-[10px] flex items-center gap-1">
                            ✓ Correct
                          </span>
                        ) : (
                          <span className="text-rose-500 font-extrabold text-[10px]">
                            Invalid
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {!isPhoneEmpty && !isPhoneValid && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1.5 flex items-center gap-1 pl-1 uppercase">
                      <AlertCircle className="w-3.5 h-3.5" /> Please enter a valid 10 or 11 digit mobile number
                    </p>
                  )}
                </div>

              {/* 3. Address Details */}
              <div id="input-group-address">
                <HomeDeliverySection 
                  formData={formData} 
                  handleInputChange={handleInputChange} 
                  errors={errors}
                />
              </div>

              {/* 4. Instruction Note */}
              <div id="input-group-note">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-0.5 block mb-1">Order Notes (Optional)</label>
                <textarea 
                  id="checkout-note"
                  rows={2}
                  placeholder="Any delivery instruction?" 
                  value={formData.note}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  className="w-full bg-white border border-neutral-250 px-3.5 py-2 rounded-lg focus:outline-none focus:border-black text-xs font-semibold placeholder:font-normal placeholder:text-neutral-400 resize-none"
                />
              </div>

              {/* 5. Save to Profile Toggle */}
              {isAuthenticated && (
                <div className="flex items-center gap-3 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => handleInputChange('saveAddress', !formData.saveAddress)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-sm",
                      formData.saveAddress ? "bg-black" : "bg-neutral-200"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white ring-0 transition duration-200 ease-in-out shadow-sm",
                        formData.saveAddress ? "translate-x-4" : "translate-x-0"
                      )}
                    />
                  </button>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-wider text-black leading-none">Update My Profile</span>
                    <span className="text-[9px] font-bold text-neutral-500 mt-0.5 uppercase tracking-wide">Save this updated address for future usage</span>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3: PAYMENT MODE */}
            <div id="checkout-step-payment" className="bg-white rounded-xl p-5 border border-neutral-150 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
                <span className="w-5 h-5 bg-black text-white rounded-md flex items-center justify-center text-[10px] font-bold">3</span>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#000000]">Payment Mode</h3>
              </div>
              
              {errors.paymentMethod && <p className="text-[10px] text-red-500 font-bold mb-3 flex items-center gap-1 pl-1 uppercase"><AlertCircle className="w-3.5 h-3.5" /> {errors.paymentMethod}</p>}
              
              <div className="grid grid-cols-2 gap-3.5">
                {availableMethods.map(method => {
                  const theme = getPaymentTheme(method.id);
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button 
                      id={`payment-method-${method.id}`}
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        "p-3.5 rounded-[18px] cursor-pointer transition-all duration-300 flex items-center justify-between text-left gap-3 relative overflow-hidden select-none",
                        isSelected 
                          ? `${theme.bgColor} ${theme.selectedBorderColor} shadow-md scale-[1.01]` 
                          : `${theme.bgColor} ${theme.borderColor} opacity-90 shadow-xs hover:opacity-100 ${theme.hoverBorderColor}`
                      )}
                      style={isSelected ? { borderWidth: '2px' } : { borderWidth: '1px' }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {method.logo ? (
                          <div className="w-12 h-9 bg-white rounded-[10px] flex items-center justify-center p-1 shrink-0 border border-neutral-150/40 shadow-xs">
                            <img 
                              src={method.logo} 
                              alt={method.name} 
                              className="max-h-6.5 max-w-[38px] object-contain" 
                              referrerPolicy="no-referrer" 
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-9 rounded-[10px] bg-neutral-900 text-white flex items-center justify-center shrink-0 text-[10px] font-black uppercase shadow-xs">
                            {method.short}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-neutral-900 block truncate leading-none">
                            {method.name.replace(/Personal|Merchant/gi, '').trim() || method.short}
                          </span>
                          <span className="text-[8px] md:text-[9px] font-bold text-neutral-500 font-mono tracking-wider block mt-1 leading-none truncate">
                            {method.id === 'cod' ? 'Hand Cash' : 'Instant Pay'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Selection Badge */}
                      <div className="shrink-0 flex items-center justify-center">
                        {isSelected ? (
                          <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shadow-xs text-[10px] font-black border-2 border-white bg-current", theme.iconColor)}>
                            <span className="text-white">✓</span>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-neutral-300 bg-white shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
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
                          <p className="text-[11px] text-neutral-550 leading-normal font-semibold uppercase tracking-wide">
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

                {paymentMethod === 'merchant' && (
                  (() => {
                    const merchantMethod = availableMethods.find(m => m.id === 'merchant');
                    if (!merchantMethod) return null;
                    const merchantLabel = settings.merchantGateway === 'sslcommerz' ? 'SSLCOMMERZ' :
                                         settings.merchantGateway === 'bkash' ? 'bKash Merchant' :
                                         settings.merchantGateway === 'nagad' ? 'Nagad Merchant' :
                                         settings.merchantGateway === 'rocket' ? 'Rocket Merchant' : 'Online Merchant';
                    return (
                      <motion.div
                        key="merchant-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-neutral-50 rounded-none border border-neutral-200 space-y-4 overflow-hidden text-left"
                      >
                        {/* Secure Info Badges */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pb-3 border-b border-neutral-200">
                          <div className="flex items-center gap-1 text-[9px] font-bold text-neutral-600 uppercase tracking-widest">
                            <Lock className="w-3 h-3 text-indigo-600" />
                            <span>AUTOMATIC SECURED PAYMENT</span>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-neutral-600 uppercase tracking-widest">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                            <span>LIVE HANDSHAKE ENCRYPTED</span>
                          </div>
                        </div>

                        {/* Instruction content */}
                        <div className="space-y-1.5 font-sans">
                          <h4 className="text-xs font-black text-[#000000] uppercase tracking-wider">
                            {settings.merchantName || 'Automatic API Payment Collection'}
                          </h4>
                          <span className="inline-block bg-neutral-900 text-emerald-400 font-mono font-black px-2 py-0.5 text-[8.5px] tracking-wider select-none uppercase">
                            CHANNEL: {merchantLabel}
                          </span>
                          <p className="text-[11px] text-neutral-500 leading-normal font-semibold uppercase tracking-wide">
                            {merchantMethod.instruction}
                          </p>
                        </div>

                        {/* Handshake Simulation details */}
                        <div className="bg-white p-3 border border-neutral-200 shadow-sm space-y-2">
                          <div className="flex items-center gap-1.5 text-[9.5px] font-black uppercase text-neutral-450">
                            <Zap className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                            <span>API Gateway Parameters</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-neutral-600 font-mono uppercase">
                            <div>Merchant Num: <span className="text-neutral-950 block tracking-normal select-all">{settings.merchantNumber || '01XXXXXXXXX'}</span></div>
                            <div>Store ID: <span className="text-neutral-950 block tracking-normal select-all">{settings.merchantStoreId || 'TAZUM_PORT_LIVE'}</span></div>
                          </div>
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
              <div id="checkout-promo-wrapper" className="space-y-3">
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className={cn(
                      "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                      promoStatus === 'valid' ? "text-emerald-500" : 
                      (promoStatus === 'invalid' || promoStatus === 'expired') ? "text-red-500" : "text-neutral-400"
                    )} />
                    <input 
                      id="checkout-promocode-input"
                      type="text" 
                      placeholder="Enter Promo Code" 
                      value={promoInputValue}
                      onChange={(e) => setPromoInputValue(e.target.value.toUpperCase())}
                      className={cn(
                        "w-full bg-neutral-50 border text-neutral-900 pl-10 pr-10 h-10 rounded-lg text-xs uppercase placeholder:text-neutral-400 placeholder:normal-case font-extrabold tracking-wider focus:outline-none transition-all",
                        promoStatus === 'valid' ? "border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-50/10" :
                        (promoStatus === 'invalid' || promoStatus === 'expired') ? "border-red-500 ring-2 ring-red-500/10 bg-red-50/5" : "border-neutral-200 focus:bg-white focus:ring-1 focus:ring-black"
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
                    {(promoStatus === 'invalid' || promoStatus === 'expired') && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500 animate-in zoom-in duration-300" />}
                  </div>
                  <button
                    type="submit"
                    disabled={isValidating}
                    className="bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider px-5 h-10 rounded-lg hover:shadow-md transition-all active:scale-95 disabled:opacity-50 font-sans"
                  >
                    Apply
                  </button>
                </form>
                
                <AnimatePresence>
                  {promoStatus !== 'idle' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "text-[11px] font-bold flex items-start gap-1.5 whitespace-pre-line p-3 rounded-lg border",
                        promoStatus === 'valid' ? "text-emerald-850 text-emerald-800 bg-emerald-50/80 border-emerald-200" : "text-red-850 text-red-800 bg-red-50/80 border-red-200"
                      )}
                    >
                      {promoStatus === 'valid' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{promoError}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <span>{promoError}</span>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2.5 text-xs font-semibold font-sans border-t border-b border-neutral-100 py-3">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-neutral-900">{formatPrice(rawItemsTotal)}</span>
                </div>

                {flashSaleDiscountTotal > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold bg-rose-50/40 p-2 border border-rose-100/50 pt-2">
                    <span>Offer Discount</span>
                    <span>-{formatPrice(flashSaleDiscountTotal)}</span>
                  </div>
                )}

                {/* Total Tazu Coins Reward */}
                {(() => {
                  const totalCoins = items.reduce((acc, item) => {
                    const prod = products.find(p => p.id === item.id.split('-')[0]);
                    const coinValue = prod?.reward_coins || 250;
                    const isEnabled = prod?.coin_enabled !== false;
                    return isEnabled ? acc + (coinValue * item.quantity) : acc;
                  }, 0);
                  
                  if (totalCoins <= 0) return null;
                  
                  return (
                    <div className="flex justify-between text-orange-600 font-extrabold text-[10px] bg-orange-50/50 p-2 border border-orange-100/50">
                      <div className="flex items-center gap-1.5 uppercase tracking-widest">
                        <Coins className="w-3.5 h-3.5" />
                        <span>Rewards Earned</span>
                      </div>
                      <span className="tracking-tight">+{totalCoins} TA ZU COINS</span>
                    </div>
                  );
                })()}

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-extrabold">
                    <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Promo Code Discount</span>
                    <span className="font-extrabold text-emerald-600">-{formatPrice(discount)}</span>
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
                <span>Grand Total</span>
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
                disabled={isSubmitting}
                onClick={() => handleSubmit()}
                className="hidden md:flex w-full bg-neutral-900 hover:bg-black text-white h-[48px] font-black uppercase text-xs tracking-widest transition-all rounded-lg items-center justify-center gap-2 cursor-pointer shadow-sm select-none active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    Processing... <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </>
                ) : (
                  <>
                    Place Order <Lock className="w-3.5 h-3.5" />
                  </>
                )}
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
              disabled={isSubmitting}
              onClick={() => handleSubmit()}
              className="flex-1 h-[44px] bg-neutral-900 hover:bg-black text-white rounded-lg font-black uppercase text-xs tracking-widest shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  Processing... <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                <>
                  Place Order <Lock className="w-3.5 h-3.5" />
                </>
              )}
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
