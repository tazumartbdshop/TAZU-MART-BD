import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Headset, 
  Bot, 
  Send, 
  User, 
  Phone, 
  CheckCircle, 
  CheckCircle2,
  Clock, 
  Undo2, 
  Lock, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  MessageSquare, 
  X, 
  Image as ImageIcon, 
  Search, 
  Smile, 
  Trash2, 
  ArrowUpRight,
  ShieldCheck,
  CheckCheck,
  Mail,
  Package,
  MessageCircle,
  Facebook,
  FileText,
  ChevronRight,
  History
} from 'lucide-react';
import { useSupportStore, ChatMessage, ChatSession, SupportTicket } from '../../store/useSupportStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useProductStore } from '../../store/useProductStore';
import { usePromoStore } from '../../store/usePromoStore';
import { useAuthStore } from '../../store/useAuthStore';
import { formatPrice } from '../../lib/utils';
import { db } from '../../lib/db';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Web Audio API Synthesizer for pleasant, offline-friendly notification sound feedback
const playTone = (type: 'send' | 'receive' | 'open') => {
  try {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass || typeof AudioContextClass !== 'function') return;
    
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08); // E5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.12);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } else if (type === 'receive') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, audioCtx.currentTime); // G5
      osc.frequency.exponentialRampToValueAtTime(523.25, audioCtx.currentTime + 0.12); // C5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.18);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } else {
      // open
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    }
  } catch (e) {
    // Audio Context might be locked on first interaction, fail silently
  }
};

interface SupportCenterProps {
  isModal?: boolean;
  onClose?: () => void;
}

export function SupportCenter({ isModal = false, onClose }: SupportCenterProps) {
  const { user } = useAuthStore();
  const { orders } = useOrderStore();
  const { products } = useProductStore();
  const { promoCodes } = usePromoStore();
  const { 
    sessions, 
    tickets, 
    createNewSession, 
    sendMessageToSession, 
    subscribeLiveSupport, 
    subscribeMessages,
    addTicket,
    subscribeTickets,
    updateSessionStatus,
    settings
  } = useSupportStore();

  // Mode settings
  const [chatType, setChatType] = useState<'human' | 'ai' | 'ticket_form' | 'ticket_history' | null>(null);
  
  // Ticket Form state
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketDetails, setTicketDetails] = useState('');
  const [ticketAddress, setTicketAddress] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);
  
  const PROBLEM_CATEGORIES = [
    'Order Problem',
    'Payment Problem',
    'Product Problem',
    'Delivery Problem',
    'Refund Problem'
  ];
  const [fullName, setFullName] = useState(user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.phone || '');
  const [ticketEmail, setTicketEmail] = useState(user?.email || '');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<{name?: string; phone?: string}>({});

  // Chat window state
  const [userInput, setUserInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<ChatMessage[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showEmails, setShowEmails] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  const handleTrackOrder = () => {
    if (!trackingInput.trim()) return;
    
    setHasSearched(true);
    const input = trackingInput.trim().toUpperCase();
    
    // Search in orders store
    const foundOrder = orders.find(o => 
      o.orderId.toUpperCase() === input || 
      o.id.toUpperCase() === input ||
      o.mobileNumber === input ||
      o.mobileNumber.replace(/[+\s-]+/g, '') === input.replace(/[+\s-]+/g, '')
    );
    
    setTrackedOrder(foundOrder || null);
    if (foundOrder) playTone('open');
    else playTone('receive'); // Non-success alert
  };

  // Attachment states (mocks uploading/simulates)
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{name: string; url: string} | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '38px'; // Default slim height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.max(38, Math.min(scrollHeight, 150))}px`;
    }
  }, [userInput]);

  // Real-time listen for Support Sessions & Sub-Messages dynamically
  useEffect(() => {
    const unsubSupport = subscribeLiveSupport();
    const unsubTickets = subscribeTickets();
    return () => {
      unsubSupport();
      unsubTickets();
    };
  }, []);

  // When form is submitted and Human Chat selected, sync messages sub-collection in real-time
  useEffect(() => {
    if (formSubmitted && chatType === 'human' && activeSessionId) {
      const unsubMessages = subscribeMessages(activeSessionId);
      return () => {
        unsubMessages();
      };
    }
  }, [formSubmitted, chatType, activeSessionId]);

  // Pre-fill fields if user changes or logs in
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name);
      if (!mobileNumber && user.phone) setMobileNumber(user.phone);
      if (!ticketEmail && user.email) setTicketEmail(user.email);
    }
  }, [user]);

  // Auto-recovery of existing chat threads for returning customers
  useEffect(() => {
    if (chatType === 'human' && !formSubmitted && sessions.length > 0) {
      // Look for any existing session that matches this customer's persona
      const identifiedUid = user?.id;
      const identifiedEmail = user?.email?.toLowerCase();
      const identifiedPhone = (mobileNumber || user?.phone || '').replace(/[+\s-]+/g, '').replace(/^880/, '0');
      
      const existingSession = sessions.find(s => {
        if (identifiedUid && s.customerUid === identifiedUid) return true;
        
        const isEmailMatch = identifiedEmail && s.customerEmail?.toLowerCase() === identifiedEmail;
        const sPhoneClean = s.customerPhone?.replace(/[+\s-]+/g, '').replace(/^880/, '0');
        const isPhoneMatch = identifiedPhone && identifiedPhone.length > 5 && sPhoneClean === identifiedPhone;
        
        return isEmailMatch || isPhoneMatch;
      });

      if (existingSession) {
        // Recovery path: The customer already has a thread, so skip the form
        setFullName(user?.name || existingSession.customerName);
        setMobileNumber(user?.phone || existingSession.customerPhone || identifiedPhone);
        setFormSubmitted(true);
        setActiveSessionId(existingSession.id);
        console.log("!!! RECOVERED EXISTING SESSION:", existingSession.id);
      }
    }
  }, [user, chatType, sessions, formSubmitted, mobileNumber]);

  // Read Customer orders count from store based on mobile number
  const matchedOrders = useMemo(() => {
    if (!mobileNumber) return [];
    const cleanInput = mobileNumber.replace(/\D/g, '');
    return orders.filter(o => {
      const oPhone = o.mobileNumber ? o.mobileNumber.replace(/\D/g, '') : '';
      return oPhone && cleanInput && (oPhone.includes(cleanInput) || cleanInput.includes(oPhone));
    });
  }, [orders, mobileNumber]);

  // Read Customer previous tickets
  const matchedTickets = useMemo(() => {
    if (!mobileNumber && !user?.email && !user?.id) return [];
    const cleanInput = mobileNumber.replace(/\D/g, '');
    return tickets.filter(t => {
      const tPhone = t.phoneNumber ? t.phoneNumber.replace(/\D/g, '') : '';
      const phoneMatch = tPhone && cleanInput && (tPhone.includes(cleanInput) || cleanInput.includes(tPhone));
      const emailMatch = user?.email && t.email === user.email;
      const uidMatch = user?.id && t.customerUid === user.id;
      return phoneMatch || emailMatch || uidMatch;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tickets, mobileNumber, user]);

  // Active chat session object
  const currentSession = useMemo(() => {
    if (!activeSessionId) return null;
    return sessions.find(s => s.id === activeSessionId) || null;
  }, [activeSessionId, sessions]);

  // Auto-scroll on new messages
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages?.length, aiChatHistory.length, isAiTyping]);

  // Quick feedback alert triggers
  useEffect(() => {
    if (currentSession?.messages?.length) {
      const last = currentSession.messages[currentSession.messages.length - 1];
      if (last && last.sender === 'admin') {
        playTone('receive');
      }
    }
  }, [currentSession?.messages?.length]);

  // Form submit handler
  const handlePreChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: {name?: string; phone?: string} = {};
    if (!fullName.trim()) errors.name = 'নাম খালি রাখা যাবে না';
    if (!mobileNumber.trim()) errors.phone = 'মোবাইল নাম্বার খালি রাখা যাবে না';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setFormSubmitted(true);
    playTone('open');

    if (chatType === 'human') {
      const sessId = createNewSession(fullName, mobileNumber, user?.email, user?.profileImage, user?.id);
      setActiveSessionId(sessId);
    } else {
      // Inception AI greeting message
      setAiChatHistory([
        {
          id: 'ai-init',
          sender: 'admin',
          text: `নমস্কার, **${fullName}**! তজু মার্চ **TAZU AI Support**-এ আপনাকে স্বাগতম। \n\nআমি আপনাকে অর্ডার গাইডেন্স, পেমেন্ট ইনফো, শিপিং চার্জ, রিফান্ড রিকোয়েস্ট, ডিসকাউন্ট কুপন কোড এবং স্টোরের অন্যান্য পলিসি জানতে তাৎক্ষণিক সাহায্য করতে পারি। \n\nআপনার যেকোনো জিজ্ঞাসার কথা নিচে টাইপ করুন অথবা নিচের Quick Suggestions ব্যবহার করুন!`,
          timestamp: new Date().toISOString(),
          seen: true
        }
      ]);
    }
  };

  // Human message sender
  const handleSendHumanMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() && !attachedImage && !attachedFile) return;
    if (!activeSessionId) return;

    sendMessageToSession(
      activeSessionId,
      'customer',
      userInput.trim() || undefined,
      attachedImage || undefined,
      attachedFile?.url || undefined,
      attachedFile?.name || undefined
    );

    setUserInput('');
    setAttachedImage(null);
    setAttachedFile(null);
    playTone('send');
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCategory || !ticketDetails.trim() || !fullName.trim() || !mobileNumber.trim()) {
      alert('Please fill all required fields');
      return;
    }

    setIsSubmittingTicket(true);
    try {
      const ticketNum = await addTicket({
        fullName,
        phoneNumber: mobileNumber,
        email: ticketEmail,
        address: ticketAddress,
        category: ticketCategory,
        details: ticketDetails,
        attachmentUrl: attachedImage || attachedFile?.url || undefined,
        attachmentName: attachedFile?.name || (attachedImage ? 'image.jpg' : undefined),
        customerUid: user?.id
      });

      setTicketSuccess(ticketNum);
      playTone('receive');
      // Reset form
      setTicketDetails('');
      setTicketCategory('');
      setAttachedImage(null);
      setAttachedFile(null);
    } catch (error) {
      console.error("Ticket submission failed:", error);
      alert('Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleResetTicketForm = () => {
    setTicketDetails('');
    setTicketCategory('');
    setTicketAddress('');
    setAttachedImage(null);
    setAttachedFile(null);
    if (!user) {
      setFullName('');
      setMobileNumber('');
      setTicketEmail('');
    }
  };

  // AI Knowledge responder (TAZU AI Support Local engine)
  const executeLocalAIResponse = (queryText: string) => {
    const q = queryText.toLowerCase().trim();
    setIsAiTyping(true);

    const matchQueryResponse = (): string => {
      // 1. Order Help / Status
      if (q.includes('order') || q.includes('track') || q.includes('অর্ডার') || q.includes('স্ট্যাটাস') || q.includes('ট্র্যাক')) {
        if (matchedOrders.length === 0) {
          return `🔍 আমরা আপনার মোবাইল নাম্বার **${mobileNumber}** দিয়ে কোনো একটিভ অর্ডার খুঁজে পাচ্ছি না। দয়া করে সঠিক মোবাইল নাম্বার চেকআউট প্রসেসে দিয়েছেন কিনা তা নিশ্চিত করুন।`;
        }
        let response = `📦 **আপনার মোবাইল (${mobileNumber}) দিয়ে পাওয়া অর্ডার সমূহ (মোট ${matchedOrders.length} টি):**\n\n`;
        matchedOrders.forEach((o, i) => {
          response += `**${i+1}. অর্ডার আইডি:** #${o.orderId || o.id}\n`;
          response += `   • প্রোডাক্ট: ${o.items?.map(it => it.name).join(', ') || 'পণ্য পাওয়া যায়নি'}\n`;
          response += `   • মোট মূল্য: ৳${o.total}\n`;
          response += `   • স্ট্যাটাস: **${o.status}**\n`;
          response += `   • শিপিং টেক্সট: ${o.shippingCost ? `চার্জ ৳${o.shippingCost}` : 'ফ্রি শিপিং'}\n\n`;
        });
        return response + `*আপনি সরাসরি শপ ড্যাশবোর্ড বা অর্ডার পেজ থেকেও ট্র্যাকিং ডেটা দেখতে পারেন।*`;
      }

      // 2. Delivery Help
      if (q.includes('delivery') || q.includes('shipping') || q.includes('ডেলিভারি') || q.includes('চার্জ') || q.includes('শিপিং') || q.includes('সময়')) {
        return `🚚 **তজু মার্ট ডেলিভারি পলিসি ও চার্জসমূহ:**\n\n` +
               `• **ঢাকা সিটি (Inside Dhaka):** চার্জ ৳৬০ টাকা (সময় ১-২ কার্যদিবস)।\n` +
               `• **ঢাকার বাইরে (Outside Dhaka):** চার্জ ৳১২০ টাকা (সময় ৩-৫ কার্যদিবস)।\n` +
               `• **এক্সপ্রেস ডেলিভারি:** ঢাকার ভেতর ২৪ ঘণ্টার মধ্যে হোম ডেলিভারি পাওয়া সম্ভব।\n\n` +
               `*১০০% ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা সারাদেশে উপলব্ধ!*`;
      }

      // 3. Payment Help
      if (q.includes('payment') || q.includes('pay') || q.includes('বিকাশ') || q.includes('নগদ') || q.includes('পেমেন্ট')) {
        return `💳 **পেমেন্ট করার নিয়মাবলী:**\n\n` +
               `• আমরা **bKash (বিকাশ)**, **Nagad (নগদ)**, **Rocket (রকেট)** এবং সকল ক্রেডিট/ডেবিট কার্ড সমর্থন করি।\n` +
               `• এছাড়াও আপনি অর্ডার রিসিভ করার সময় সম্পূর্ণ মূল্য পরিশোধ করতে পারবেন (ক্যাশ অন ডেলিভারি)।\n` +
               `• পেমেন্ট করার সময় অর্ডারের বিবরণ ও ট্রানজেকশন আইডি নিরাপদে আপনার ড্যাশবোর্ডে যোগ করতে পারেন।`;
      }

      // 4. Return and Refund Help
      if (q.includes('return') || q.includes('refund') || q.includes('ফেরত') || q.includes('রিটার্ন') || q.includes('রিফান্ড')) {
        return `🔄 **রিটার্ন এবং রিফান্ড পলিসি গাইড:**\n\n` +
               `• পণ্য রিসিভ করার পর ৭ দিনের মধ্যে যেকোনো অরিজিনাল অব্যবহৃত প্যাকেট ও স্ক্র্যাচ বিহীন প্রোডাক্ট ফেরত দিতে পারবেন।\n` +
               `• যদি আপনি ভুল সাইজ বা ত্রুটিযুক্ত প্রোডাক্ট পেয়ে থাকেন, তবে আমরা একদম বিনামূল্যে এক্সচেঞ্জ করে দেব।\n` +
               `• রিফান্ড রিভিউ সফল হওয়ার ৩ থেকে ৫ কার্যদিবসের মধ্যে আপনার বিকাশ বা নগদ অ্যাকাউন্টে টাকা ফেরত পাঠিয়ে দেয়া হবে।`;
      }

      // 5. Coupon Help
      if (q.includes('coupon') || q.includes('discount') || q.includes('কুপন') || q.includes('ছাড়') || q.includes('অফার')) {
        const activeCoupons = promoCodes.filter(p => {
          const exp = p.expiryDate ? new Date(p.expiryDate + 'T23:59:59') : new Date();
          return p.status === 'Active' && exp >= new Date();
        });

        if (activeCoupons.length === 0) {
          return `🏷️ এই মুহূর্তে কোনো একটিভ ডিসকাউন্ট কুপন ডেটাবেজে সেট করা নেই। তবে যেকোনো আকর্ষণীয় ফ্ল্যাশ সেল অফার চেক করতে আমাদের Offers পেইজে চোখ রাখুন!`;
        }

        let coupText = `🏷️ **আমাদের স্টোরের অ্যাক্টিভ ডিসকাউন্ট কুপন কোড সমূহ:**\n\n`;
        activeCoupons.forEach((cp) => {
          coupText += `• **কোড:** \`${cp.code}\`\n` +
                      `  • টাইপ: ${cp.type === 'Percentage' ? `${cp.value}% ছাড়` : `৳${cp.value} ফ্ল্যাট ছাড়`}\n` +
                      `  • ন্যূনতম পারচেজ: ৳${cp.minOrder || 0}\n` +
                      `  • মেয়াদ: ${cp.expiryDate}\n\n`;
        });
        return coupText + `*চেকআউট কার্ট পেজে সুন্দরভাবে ডিসকাউন্ট কোড এপ্লাই করলেই মূল্য কমে যাবে।*`;
      }

      // 6. Product Help
      if (q.includes('product') || q.includes('stock') || q.includes('পণ্য') || q.includes('স্টক') || q.includes('দাম') || q.includes('প্রোডাক্ট')) {
        const topProds = products.slice(0, 5);
        if (topProds.length === 0) {
          return `🛍️ তজু মার্টের প্রোডাক্ট লিস্টে এই মুহূর্তে কোনো পণ্য তালিকাভুক্ত পাওয়া যায়নি। নতুন পণ্য খুব শীঘ্রই স্টক করা হবে।`;
        }

        let prodText = `🛍️ **আমাদের স্টোরের সেরা কয়েকটি প্রোডাক্ট স্টক ও দামের তালিকা:**\n\n`;
        topProds.forEach((p) => {
          prodText += `• **${p.name}**\n` +
                      `  • ক্যাটাগরি: ${p.category || 'General'}\n` +
                      `  • মূল্য: ৳${p.price.toLocaleString()}\n` +
                      `  • স্টক: ${p.stock > 0 ? `ইন-স্টক (${p.stock} টি উপলব্ধ)` : 'আউট অফ স্টক'}\n\n`;
        });
        return prodText + `*যেকোনো প্রোডাক্টের ইনফো জানতে সরাসরি আমাদের প্রিমিয়াম স্টোর ক্যাটালগও দেখতে পারেন।*`;
      }

      // 7. Account Help
      if (q.includes('account') || q.includes('login') || q.includes('রেজিস্ট্রেশন') || q.includes('লগইন') || q.includes('অ্যাকাউন্ট')) {
        return `👤 **অ্যাকাউন্ট হেল্প:**\n\n` +
               `• আপনি আপনার মোবাইল ও জিমেইল দিয়ে সহজে রেজিস্ট্রেশন করতে পারেন।\n` +
               `• ড্যাশবোর্ডে গিয়ে আপনার শিপিং ঠিকানা, নাম, জেন্ডার এবং পূর্বে কেনা প্রোডাক্টের ইতিহাস বা রসিদ দেখতে পারবেন।\n` +
               `• পাসওয়ার্ড ভুলে গেলে 'Forgot Password' অপশনে ক্লিক করে জিমেইল কোডের মাধ্যমে রিসেট করে নিন।`;
      }

      // Default polite responder
      return `🤖 দুঃখিত, আমি আপনার প্রশ্নটি সঠিকভাবে বুঝতে পারিনি। \n\nআমি তজু মার্টের **Smart AI Assistant**। আমি আপনাকে প্রোডাক্টের দাম ও স্টক, একটিভ ডিসকাউন্ট কুপন কোড, শিপিং ঠিকানা, রিফান্ড বা এক্সচেঞ্জ পলিসি এবং মোবাইল নম্বর **(${mobileNumber})** সংক্রান্ত অর্ডারের সঠিক অবস্থা জানাতে পারবো। অনুগ্রহ করে স্পষ্ট প্রশ্ন করুন!`;
    };

    setTimeout(() => {
      const resp = matchQueryResponse();
      setAiChatHistory(prev => [...prev, {
        id: `ai-msg-${Date.now()}`,
        sender: 'admin',
        text: resp,
        timestamp: new Date().toISOString(),
        seen: true
      }]);
      setIsAiTyping(false);
      playTone('receive');
    }, 850);
  };

  const handleSendAiMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const text = userInput.trim();
    setAiChatHistory(prev => [...prev, {
      id: `user-msg-${Date.now()}`,
      sender: 'customer',
      text: text,
      timestamp: new Date().toISOString(),
      seen: true
    }]);

    setUserInput('');
    playTone('send');
    executeLocalAIResponse(text);
  };

  // Search local messages
  const filteredMessages = useMemo(() => {
    const rawMessages = chatType === 'human' ? currentSession?.messages || [] : aiChatHistory;
    if (!searchQuery.trim()) return rawMessages;
    return rawMessages.filter(m => m.text?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [chatType, currentSession?.messages, aiChatHistory, searchQuery]);

  // Handle Mock attachment selectors
  const triggerImageUpload = () => {
    if (imageInputRef.current) imageInputRef.current.click();
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleImageFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large (max 5MB)');
      return;
    }

    setIsUploading(true);
    const { uploadImage } = await import('../../lib/imageUtils');
    try {
      const folder = chatType === 'ticket_form' ? 'support-attachments' : 'chat-images';
      const downloadUrl = await uploadImage(file, folder, `upload-${Date.now()}`);
      setAttachedImage(downloadUrl);
      playTone('open');
    } catch (err) {
      console.error(err);
      alert('Failed to upload image');
    } finally {
      setIsUploading(null);
    }
  };

  const handleDocFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Document is too large (max 10MB)');
      return;
    }

    setIsUploading(true);
    const { uploadImage } = await import('../../lib/imageUtils');
    try {
      const folder = chatType === 'ticket_form' ? 'support-attachments' : 'chat-images';
      const downloadUrl = await uploadImage(file, folder, `doc-${Date.now()}-${file.name}`);
      setAttachedFile({
        name: file.name,
        url: downloadUrl
      });
      playTone('open');
    } catch (err) {
      console.error(err);
      alert('Failed to upload document');
    } finally {
      setIsUploading(null);
    }
  };

  // Quick chips trigger
  const handleChipClick = (queryText: string) => {
    if (chatType === 'human') {
      setUserInput(queryText);
    } else {
      setAiChatHistory(prev => [...prev, {
        id: `user-msg-${Date.now()}`,
        sender: 'customer',
        text: queryText,
        timestamp: new Date().toISOString(),
        seen: true
      }]);
      executeLocalAIResponse(queryText);
    }
  };

  // Re-open Ticket handler
  const handleReopenTicket = (ticketId: string) => {
    const found = tickets.find(t => t.id === ticketId);
    if (found) {
      const { id, status, createdAt, ...rest } = found;
      // Re-create a new updated ticket in Pending state or update state
      useSupportStore.setState(state => ({
        tickets: state.tickets.map(t => t.id === ticketId ? { ...t, status: 'Pending' } : t)
      }));
      playTone('open');
      alert(`Success: Ticket #${ticketId} has been successfully reopened for support review`);
    }
  };

  return (
    <div className={`font-sans leading-relaxed text-slate-900 bg-slate-50 border border-slate-200 shadow-xl overflow-hidden rounded-2xl flex flex-col ${isModal ? 'h-[80vh] max-h-[750px] w-full max-w-4xl' : 'min-h-[85vh] w-full max-w-6xl mx-auto'}`} id="support-desk-system-card">
      
      {/* 24/7 SUPPORT BANNER HEADER */}
      <div className="bg-slate-950 text-white p-5 md:p-6 shrink-0 relative flex items-center justify-between border-b border-slate-800" id="support-center-banner-header">
        <div className="flex items-center gap-3.5 text-left">
          <div className="w-12 h-12 bg-white/10 hover:bg-white/20 transition-all text-amber-400 flex items-center justify-center rounded-2xl border border-white/10 shrink-0">
            <Headset className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black uppercase tracking-wider flex items-center gap-1.5 leading-none">
              TAZU Support Desk <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded tracking-widest uppercase animate-pulse">24/7 LIVE</span>
            </h1>
            <p className="text-[10.5px] text-zinc-400 font-extrabold uppercase mt-1 tracking-widest flex items-center gap-1.5">
              <span>● Professional Customer Care</span>
              <span className="text-zinc-600">|</span>
              <span className="text-emerald-400">Response Speed: Premium Fast</span>
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-white relative">
        
        {/* WORKSPACE & CHAT FORMS CENTER */}
        <div className="flex-1 flex flex-col border-r border-slate-100 overflow-hidden relative">
          
          <AnimatePresence mode="wait">
            {!chatType ? (
              /* PANEL A: SUPPORT TYPE SELECTION SCREEN */
              <motion.div
                key="support-types"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col space-y-6 max-w-2xl mx-auto w-full no-scrollbar"
              >
                <div className="text-center">
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-slate-950">How can we help today?</h2>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1.5">
                    যেকোনো সমস্যা, অর্ডার, পেমেন্ট, ডেলিভারি অথবা অ্যাকাউন্ট সংক্রান্ত সাহায্যের জন্য যোগাযোগ করুন।
                  </p>
                </div>

                <div className="space-y-4">
                  {/* 1. HUMAN SUPPORT CARD */}
                  <div 
                    onClick={() => { setChatType('human'); playTone('open'); }}
                    className="group border border-slate-200 hover:border-slate-900 p-5 rounded-2xl bg-white hover:shadow-xl transition-all cursor-pointer flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 group-hover:bg-slate-950 group-hover:text-white rounded-xl flex items-center justify-center transition-colors shrink-0">
                      <Headset className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-sm font-black uppercase text-slate-900 leading-none">Human Support Chat</h3>
                      <p className="text-[10px] text-zinc-400 font-bold mt-1 leading-tight uppercase">
                        লাইভ মডারেটরের সাথে সরাসরি চ্যাট করুন
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-slate-950 group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* 2. AI SUPPORT ASSISTANT CARD */}
                  <div 
                    onClick={() => { setChatType('ai'); playTone('open'); }}
                    className="group border border-slate-200 hover:border-slate-900 p-5 rounded-2xl bg-white hover:shadow-xl transition-all cursor-pointer flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 group-hover:bg-slate-950 group-hover:text-white rounded-xl flex items-center justify-center transition-colors shrink-0">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-sm font-black uppercase text-slate-900 leading-none">AI Support Assistant</h3>
                      <p className="text-[10px] text-zinc-400 font-bold mt-1 leading-tight uppercase">
                        তাৎক্ষণিক উত্তর ও গাইডের জন্য চ্যাট করুন
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-slate-950 group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* 3. WHATSAPP & HOTLINE CARDS (Side by Side) */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* WHATSAPP BOX */}
                    <a 
                      href="https://wa.me/8801700000000" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group border border-slate-200 hover:border-green-600 p-5 rounded-2xl bg-white hover:shadow-lg transition-all text-center flex flex-col items-center justify-center space-y-2"
                    >
                      <div className="w-10 h-10 bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white rounded-xl flex items-center justify-center transition-all">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black uppercase text-slate-900">WhatsApp Support</h4>
                        <p className="text-[10px] font-bold text-zinc-500 mt-0.5">+8801XXXXXXXXX</p>
                      </div>
                      <span className="inline-block px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-tighter rounded-lg group-hover:bg-green-600 group-hover:text-white transition-all">Open WhatsApp</span>
                    </a>

                    {/* HOTLINE BOX */}
                    <a 
                      href="tel:+8801700000000"
                      className="group border border-slate-200 hover:border-slate-900 p-5 rounded-2xl bg-white hover:shadow-lg transition-all text-center flex flex-col items-center justify-center space-y-2"
                    >
                      <div className="w-10 h-10 bg-slate-50 text-slate-900 group-hover:bg-slate-950 group-hover:text-white rounded-xl flex items-center justify-center transition-all">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black uppercase text-slate-900">Hotline Support</h4>
                        <p className="text-[10px] font-bold text-zinc-500 mt-0.5">+8801XXXXXXXXX</p>
                      </div>
                      <span className="inline-block px-3 py-1 bg-slate-50 text-slate-900 text-[9px] font-black uppercase tracking-tighter rounded-lg group-hover:bg-slate-950 group-hover:text-white transition-all">Call Now</span>
                    </a>
                  </div>

                  {/* 4. OFFICIAL SUPPORT EMAILS (Expandable Card) */}
                  <div id="email-support-section" className="border border-slate-200 bg-white rounded-2xl overflow-hidden transition-all">
                    <button 
                      onClick={() => {
                        setShowEmails(!showEmails);
                        playTone('open');
                      }}
                      className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-[11px] font-black uppercase text-slate-900">Official Support Emails</h4>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mt-0.5">Click to view all departments</p>
                        </div>
                      </div>
                      <ArrowRight className={`w-4 h-4 text-zinc-300 transition-transform duration-300 ${showEmails ? 'rotate-90' : 'rotate-0'}`} />
                    </button>

                    <AnimatePresence>
                      {showEmails && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-100 bg-slate-50/50 overflow-hidden"
                        >
                          <div className="p-4 space-y-3">
                            {[
                              { label: 'Super Admin', email: 'admin@tazumartbd.com' },
                              { label: 'Moderator Team', email: 'moderator@tazumartbd.com' },
                              { label: 'Customer Support', email: 'support@tazumartbd.com' },
                              { label: 'Order Department', email: 'orders@tazumartbd.com' },
                              { label: 'Accounts Department', email: 'accounts@tazumartbd.com' }
                            ].map((item, idx) => (
                              <a 
                                key={idx}
                                href={`mailto:${item.email}`}
                                className="flex items-center justify-between p-3 bg-white border border-slate-150 rounded-xl hover:border-slate-900 transition-all group"
                              >
                                <div className="text-left">
                                  <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest block leading-none mb-1">{item.label}</span>
                                  <span className="text-[11px] font-bold text-slate-900">{item.email}</span>
                                </div>
                                <Mail className="w-3.5 h-3.5 text-zinc-200 group-hover:text-slate-900 transition-colors" />
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 5. PROBLEM SOLVER CENTER / SUPPORT TICKET */}
                  <div className="border border-slate-200 bg-white rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-md">
                    <div className="p-5 flex flex-col space-y-4">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black uppercase text-slate-900 leading-none">Problem Solver Center</h4>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mt-1">Submit a support ticket for faster resolution</p>
                        </div>
                      </div>
                      
                      <p className="text-[11px] text-zinc-500 font-medium text-left leading-relaxed">
                        আপনার সমস্যার বিস্তারিত তথ্য দিন। আমাদের টিম দ্রুত সমাধান করবে।
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => {
                            setChatType('ticket_form');
                            playTone('open');
                            setTicketSuccess(null);
                          }}
                          className="bg-slate-950 text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                        >
                          Submit Ticket
                        </button>
                        <button 
                          onClick={() => {
                            setChatType('ticket_history');
                            playTone('open');
                          }}
                          className="bg-white border border-slate-200 text-slate-950 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                          Ticket History
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="border border-slate-200 bg-white rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Search className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-[11px] font-black uppercase text-slate-900 tracking-wider">Track Your Order</h4>
                        <p className="text-[10px] font-bold text-zinc-400 leading-tight">
                          মোবাইল নাম্বার বা অর্ডার নাম্বার দিয়ে স্ট্যাটাস দেখুন।
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         placeholder="ORD-XXXXX or Mobile"
                         className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all"
                         value={trackingInput}
                         onChange={(e) => {
                           setTrackingInput(e.target.value);
                           if (hasSearched) setHasSearched(false);
                         }}
                         onKeyDown={(e) => e.key === 'Enter' && handleTrackOrder()}
                       />
                       <button 
                         onClick={handleTrackOrder}
                         className="bg-slate-950 text-white px-5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black active:scale-95 transition-all shadow-sm"
                       >
                         Track
                       </button>
                    </div>

                    {/* TRACKING RESULT AREA */}
                    <AnimatePresence mode="wait">
                      {hasSearched && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="pt-2"
                        >
                          {trackedOrder ? (
                            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-4 text-left">
                              <div className="flex justify-between items-start">
                                 <div>
                                   <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest block mb-1">Order Tracking Found</span>
                                   <h5 className="text-sm font-black text-slate-950 uppercase">#{trackedOrder.orderId}</h5>
                                 </div>
                                 <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                   trackedOrder.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 
                                   trackedOrder.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                 }`}>
                                   {trackedOrder.paymentStatus}
                                 </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                                 <div>
                                   <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest block">Customer</span>
                                   <span className="text-[10px] font-bold text-slate-700 uppercase">{trackedOrder.customerName}</span>
                                 </div>
                                 <div>
                                   <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest block">Product</span>
                                   <span className="text-[10px] font-bold text-slate-700 truncate block">{trackedOrder.items?.[0]?.name || 'Direct Order'}</span>
                                 </div>
                              </div>

                              {/* TRACKING TIMELINE V2 */}
                              <div className="pt-4 space-y-3">
                                 <h6 className="text-[9px] font-black uppercase text-slate-900 tracking-widest mb-4">Journey Roadmap</h6>
                                 <div className="relative">
                                    {/* Vertical Line */}
                                    <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-slate-200" />
                                    
                                    <div className="space-y-5 relative">
                                       {[
                                         { label: 'Placed', info: 'Order successfully received.' },
                                         { label: 'Confirmed', info: 'Verified by moderating team.' },
                                         { label: 'Packaging', info: 'Products being wrapped securely.' },
                                         { label: 'Shipping', info: 'In transit with delivery partner.' },
                                         { label: 'Delivered', info: 'Handed over successfully.' }
                                       ].map((step, idx) => {
                                         const stages = ['Placed', 'Confirmed', 'Packaging', 'Shipping', 'Delivered'];
                                         const currentStageIdx = stages.indexOf(trackedOrder.status);
                                         const isCompleted = currentStageIdx >= idx;
                                         const isCurrent = trackedOrder.status === step.label;

                                         return (
                                           <div key={idx} className="flex gap-4 items-start relative pl-0">
                                              <div className={`w-3.5 h-3.5 rounded-full border-2 z-10 transition-all duration-500 mt-1 ${
                                                isCompleted ? 'bg-slate-950 border-slate-950 shadow-sm' : 'bg-white border-slate-200'
                                              }`}>
                                                {isCompleted && <div className="w-1.5 h-1.5 bg-white rounded-full m-0.5 animate-pulse" />}
                                              </div>
                                              <div>
                                                 <h6 className={`text-[10px] font-black uppercase tracking-wide leading-none ${isCompleted ? 'text-slate-950' : 'text-zinc-300'}`}>
                                                   {step.label}
                                                 </h6>
                                                 {isCurrent && (
                                                   <p className="text-[9px] font-bold text-indigo-600 mt-1 uppercase italic">Current Status: {step.info}</p>
                                                 )}
                                              </div>
                                           </div>
                                         );
                                       })}
                                    </div>
                                 </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">No matching order found</p>
                              <p className="text-[9px] font-bold text-red-400 mt-1">Please check your Order ID or Mobile Number.</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="pt-4 text-center">
                  <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest flex items-center justify-center gap-1.5 opacity-50">
                    <ShieldCheck className="w-3 h-3" /> Secure Support Environment
                  </p>
                </div>
              </motion.div>
            ) : chatType === 'ticket_form' ? (
              /* PANEL E: SUPPORT TICKET SUBMISSION FORM */
              <motion.div
                key="ticket-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col overflow-hidden bg-white h-full"
              >
                <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
                  <div className="max-w-xl mx-auto space-y-6">
                    {ticketSuccess ? (
                      <div className="text-center py-12 space-y-6 animate-fade-in">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                          <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-wider text-slate-950">Ticket Submitted!</h2>
                        <p className="text-sm text-zinc-500 font-medium px-4">
                          আপনার সাপোর্ট টিকিটটি সফলভাবে জমা দেওয়া হয়েছে। আমাদের টিম দ্রুত আপনার সমস্যাটি রিভিউ করবে।
                        </p>
                        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl inline-block shadow-sm">
                          <span className="text-[10px] font-black text-slate-400 uppercase block mb-1.5 tracking-widest">Your Ticket Number</span>
                          <span className="text-2xl font-mono font-black text-slate-950 tracking-tighter">{ticketSuccess}</span>
                        </div>
                        <div className="pt-6">
                          <button 
                            onClick={() => {
                              setChatType(null);
                              setTicketSuccess(null);
                            }}
                            className="bg-slate-950 text-white px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black active:scale-95 transition-all shadow-lg"
                          >
                            Back to Center
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                          <div className="flex items-center gap-3">
                            <button onClick={() => setChatType(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                              <Undo2 className="w-5 h-5 text-zinc-400" />
                            </button>
                            <div className="text-left">
                              <h2 className="text-lg font-black uppercase tracking-wider text-slate-950">Submit Support Ticket</h2>
                              <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Provide details for professional assistance</p>
                            </div>
                          </div>
                          <ShieldCheck className="w-6 h-6 text-rose-500" />
                        </div>

                        <form onSubmit={handleSubmitTicket} className="space-y-5 text-left">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 block pl-1">Full Name *</label>
                              <input 
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-950 outline-none transition-all shadow-xs"
                                placeholder={user?.name || "আপনার পূর্ণ নাম"}
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 block pl-1">Mobile Number *</label>
                              <input 
                                type="tel"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-950 outline-none transition-all shadow-xs"
                                placeholder={user?.phone || "০১XXXXXXXXX"}
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 block pl-1">Email Address</label>
                              <input 
                                type="email"
                                value={ticketEmail}
                                onChange={(e) => setTicketEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-950 outline-none transition-all shadow-xs"
                                placeholder={user?.email || "আপনার ইমেইল ঠিকানা"}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 block pl-1">Problem Category *</label>
                              <select 
                                value={ticketCategory}
                                onChange={(e) => setTicketCategory(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-950 outline-none transition-all shadow-xs appearance-none"
                                required
                              >
                                <option value="">Select Problem Category</option>
                                {PROBLEM_CATEGORIES.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 block pl-1">Full Address *</label>
                            <textarea 
                              value={ticketAddress}
                              onChange={(e) => setTicketAddress(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-950 outline-none transition-all shadow-xs min-h-[60px]"
                              placeholder="আপনার সমস্যার বিস্তারিত ঠিকানা বা অবস্থান দিন (প্রয়োজন হলে)..."
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 block pl-1">Problem Details *</label>
                            <textarea 
                              value={ticketDetails}
                              onChange={(e) => setTicketDetails(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-950 outline-none transition-all shadow-xs min-h-[140px]"
                              placeholder="আপনার সমস্যার বিস্তারিত এখানে লিখুন। আমাদের সাপোর্ট টিম দ্রুত রিপ্লাই দেবে।"
                              required
                            />
                          </div>

                          {/* Attachment Button */}
                          <div className="flex flex-wrap items-center gap-3">
                            <button 
                              type="button" 
                              onClick={triggerImageUpload}
                              className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all font-bold text-[10px] uppercase text-zinc-600"
                            >
                              <ImageIcon className="w-4 h-4 text-zinc-400" />
                              Scan / Image
                            </button>
                            <button 
                              type="button" 
                              onClick={triggerFileUpload}
                              className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all font-bold text-[10px] uppercase text-zinc-600"
                            >
                              <HelpCircle className="w-4 h-4 text-zinc-400 rotate-180" />
                              Doc / File
                            </button>
                          </div>

                          {(attachedImage || attachedFile) && (
                            <div className="flex gap-2 flex-wrap">
                               {attachedImage && (
                                 <div className="relative group">
                                   <img src={attachedImage} className="w-16 h-16 object-cover rounded-xl border border-slate-200" alt="attached" />
                                   <button 
                                     onClick={() => setAttachedImage(null)}
                                     className="absolute -top-1.5 -right-1.5 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-md"
                                   >
                                     ×
                                   </button>
                                 </div>
                               )}
                               {attachedFile && (
                                 <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                   <FileText className="w-4 h-4 text-indigo-500" />
                                   <span className="max-w-[120px] truncate">{attachedFile.name}</span>
                                   <button onClick={() => setAttachedFile(null)} className="text-red-600 ml-1.5 font-black hover:scale-125 transition-transform">×</button>
                                 </div>
                               )}
                            </div>
                          )}

                          <div className="flex gap-3 pt-6 border-t border-slate-100">
                            <button 
                              type="submit"
                              disabled={isSubmittingTicket}
                              className="flex-1 bg-slate-950 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                            >
                              {isSubmittingTicket ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                              Submit Support Ticket
                            </button>
                            <button 
                              type="button"
                              onClick={handleResetTicketForm}
                              className="px-6 border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              Reset
                            </button>
                          </div>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : chatType === 'ticket_history' ? (
              /* PANEL F: SUPPORT TICKET HISTORY LIST & REAL-TIME TRACKING */
              <motion.div
                key="ticket-history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col overflow-hidden bg-white h-full"
              >
                <div className="p-4 md:p-8 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-10">
                   <div className="flex items-center gap-3">
                      <button onClick={() => setChatType(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                        <Undo2 className="w-5 h-5 text-zinc-400" />
                      </button>
                      <div className="text-left">
                        <h2 className="text-lg font-black uppercase tracking-wider text-slate-950">Ticket History</h2>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Real-time status updates from support team</p>
                      </div>
                   </div>
                   <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                      <History className="w-5 h-5" />
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar bg-slate-50/20">
                   {matchedTickets.length === 0 ? (
                     <div className="text-center py-24 space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-dashed border-slate-200">
                          <AlertCircle className="w-8 h-8 text-zinc-300" />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No support tickets found</p>
                     </div>
                   ) : (
                     <div className="max-w-2xl mx-auto space-y-4 pb-8">
                       {matchedTickets.map(ticket => {
                         const isExpanded = expandedTicketId === ticket.id;
                         const stages: SupportTicket['status'][] = ['Open', 'Pending', 'In Review', 'Resolved', 'Closed'];
                         const currentIndex = stages.indexOf(ticket.status);

                         return (
                           <div key={ticket.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                             <div 
                               onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                               className="p-5 flex justify-between items-center cursor-pointer"
                             >
                                <div className="text-left">
                                   <div className="flex items-center gap-2 mb-1">
                                     <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{ticket.ticketNumber}</span>
                                     <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ticket.category}</span>
                                   </div>
                                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight line-clamp-1">{ticket.details}</h3>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest border shadow-xs ${
                                    ticket.status === 'Open' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    ticket.status === 'Closed' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                                    'bg-indigo-50 text-indigo-600 border-indigo-100'
                                  }`}>
                                    {ticket.status}
                                  </span>
                                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                </div>
                             </div>

                             <AnimatePresence>
                               {isExpanded && (
                                 <motion.div
                                   initial={{ height: 0, opacity: 0 }}
                                   animate={{ height: 'auto', opacity: 1 }}
                                   exit={{ height: 0, opacity: 0 }}
                                   className="border-t border-slate-100 bg-slate-50/50"
                                 >
                                   <div className="p-5 space-y-6 text-left">
                                     {/* Problem Status Grid */}
                                     <div className="grid grid-cols-2 gap-4">
                                       <div className="space-y-1">
                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Customer Problem</p>
                                         <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{ticket.category}</p>
                                       </div>
                                       <div className="space-y-1">
                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Admin Status</p>
                                         <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{ticket.status}</p>
                                       </div>
                                     </div>

                                     {/* Customer Request */}
                                     <div className="space-y-2">
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Customer Request</p>
                                       <div className="bg-white border border-slate-200 p-3 rounded-xl">
                                         <p className="text-[12px] text-slate-700 font-medium leading-relaxed">{ticket.details}</p>
                                       </div>
                                     </div>

                                     {/* Admin Progress Message */}
                                     <div className="space-y-2">
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Admin Progress</p>
                                       <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl">
                                         <p className="text-[11px] text-indigo-900 font-bold leading-relaxed">
                                           {ticket.status === 'Open' && "আপনার অভিযোগটি সফলভাবে জমা হয়েছে। আমাদের টিম শীঘ্রই তা যাচাই করবে।"}
                                           {ticket.status === 'Pending' && "আপনার সমস্যাটি পেন্ডিং লিস্টে আছে, অল্প সময়ের মধ্যেই কাজ শুরু হবে।"}
                                           {ticket.status === 'In Review' && "এই সমস্যাটি বর্তমানে যাচাই করা হচ্ছে।"}
                                           {ticket.status === 'Resolved' && "অভিনন্দন! আপনার সমস্যাটি সফলভাবে সমাধান করা হয়েছে।"}
                                           {ticket.status === 'Closed' && "এই টিকিটটি বন্ধ করা হয়েছে। কোনো প্রয়োজনে আবার যোগাযোগ করুন।"}
                                         </p>
                                       </div>
                                     </div>

                                     {/* Status Timeline */}
                                     <div className="space-y-4">
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status Timeline</p>
                                       <div className="flex items-center justify-between px-2 relative py-4">
                                         {/* Background Line */}
                                         <div className="absolute left-8 right-8 h-1 bg-slate-200 top-1/2 -translate-y-1/2"></div>
                                         <motion.div 
                                           className="absolute left-8 h-1 bg-rose-500 top-1/2 -translate-y-1/2 origin-left"
                                           initial={{ scaleX: 0 }}
                                           animate={{ scaleX: Math.max(0, currentIndex / (stages.length - 1)) }}
                                           transition={{ duration: 1, ease: "easeOut" }}
                                           style={{ width: 'calc(100% - 64px)' }}
                                         ></motion.div>

                                         {stages.map((stage, idx) => {
                                           const isPassed = idx <= currentIndex;
                                           const isCurrent = idx === currentIndex;
                                           
                                           return (
                                             <div key={stage} className="relative z-10 flex flex-col items-center gap-2">
                                               <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-500 ${
                                                 isCurrent ? 'bg-white border-rose-600 scale-125 ring-4 ring-rose-100 shadow-lg' :
                                                 isPassed ? 'bg-rose-500 border-rose-500' :
                                                 'bg-white border-slate-200'
                                               }`}></div>
                                               <span className={`text-[8px] font-black uppercase tracking-tight absolute -bottom-5 whitespace-nowrap ${
                                                 isCurrent ? 'text-rose-600 font-black' : 
                                                 isPassed ? 'text-slate-900' : 'text-slate-300'
                                               }`}>
                                                 {stage}
                                               </span>
                                             </div>
                                           );
                                         })}
                                       </div>
                                     </div>

                                     {/* Last Updated Footer */}
                                     <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                                       <div className="flex items-center gap-1.5 text-zinc-400">
                                         <Clock className="w-3 h-3" />
                                         <span className="text-[9px] font-black uppercase tracking-widest">
                                           Last Updated: {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : new Date(ticket.createdAt).toLocaleString()}
                                         </span>
                                       </div>
                                       <div className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                         Real-Time Sync Active
                                       </div>
                                     </div>
                                   </div>
                                 </motion.div>
                               )}
                             </AnimatePresence>
                           </div>
                         );
                       })}
                     </div>
                   )}
                </div>
              </motion.div>
            ) : !formSubmitted ? (
              /* PANEL B: PRE-CHAT REGISTRATION MANDATORY FORM */
              <motion.div
                key="pre-chat-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col justify-center max-w-md mx-auto w-full text-left"
              >
                <div className="space-y-2 text-center mb-6">
                  <div className="w-12 h-12 bg-slate-950 text-white rounded-xl flex items-center justify-center mx-auto shadow-lg">
                    {chatType === 'human' ? <Headset className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-950">
                    {chatType === 'human' ? 'Fill Verification for Human support' : 'Initialize Tazu AI Support'}
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wide">
                    Please provide your authentic details to retrieve database logs automatically.
                  </p>
                </div>

                <form onSubmit={handlePreChatSubmit} className="space-y-4">
                  {/* FULL NAME FIELD */}
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] uppercase tracking-wider font-extrabold text-zinc-500 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-zinc-400" /> Full Name / নাম *
                    </label>
                    <input
                      type="text"
                      placeholder="Imtiaz Khan"
                      className="w-full bg-slate-50 border border-slate-200 outline-none p-3 text-xs font-semibold focus:border-black focus:bg-white rounded-xl"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                    {formErrors.name && (
                      <p className="text-[9.5px] text-red-500 font-black tracking-wide flex items-center gap-0.5">
                        ⚠️ {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* MOBILE PHONE FIELD */}
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] uppercase tracking-wider font-extrabold text-zinc-500 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" /> Mobile Number / মোবাইল *
                    </label>
                    <input
                      type="tel"
                      placeholder="01712345678"
                      className="w-full bg-slate-50 border border-slate-200 outline-none p-3 text-xs font-semibold focus:border-black focus:bg-white rounded-xl"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                    />
                    {formErrors.phone && (
                      <p className="text-[9.5px] text-red-500 font-black tracking-wide flex items-center gap-0.5">
                        ⚠️ {formErrors.phone}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2.5 pt-4">
                    <button
                      type="button"
                      onClick={() => setChatType(null)}
                      className="flex-1 h-11 border border-slate-200 text-slate-500 font-bold hover:bg-slate-55 rounded-xl uppercase text-[10px] tracking-widest transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Undo2 className="w-3.5 h-3.5" /> Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 h-11 bg-black text-white font-black hover:bg-slate-900 rounded-xl uppercase text-[10px] tracking-widest transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-lg"
                    >
                      Verify & Start Chat <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

                <div className="mt-6 flex items-center justify-center gap-1.5 text-[9px] text-slate-400 uppercase tracking-widest font-bold self-center">
                  <Lock className="w-3 h-3 text-emerald-500" /> Read-Only DB Integration Active
                </div>
              </motion.div>
            ) : (
              /* PANEL C: ACTIVE CHAT CONSOLE MODULE */
              <motion.div
                key="active-support-chat-hub"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-grow flex flex-col justify-between h-[480px] md:h-[550px] relative"
              >
                
                {/* 1. MESSENGER STYLE AGENT HEADER */}
                <div className="bg-white border-b border-slate-100 p-4 md:px-6 shrink-0 flex items-center justify-between shadow-sm z-10">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-inner ${chatType === 'human' ? 'bg-indigo-600' : 'bg-slate-950 border border-slate-800'}`}>
                        {chatType === 'human' ? <Headset className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-black uppercase text-slate-950 leading-none tracking-tight">
                        {chatType === 'human' ? 'Support Agent' : 'TAZU AI Assistant'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-black uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online Status
                        </span>
                        <span className="text-[9.5px] text-slate-300 font-bold uppercase tracking-wider">• Last seen: Just now</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        if (window.confirm('আপনি কি এই চ্যাট সেশনটি বন্ধ করতে চান?')) {
                          setFormSubmitted(false);
                          setChatType(null);
                          setAiChatHistory([]);
                          setActiveSessionId(null);
                        }
                      }}
                      className="p-2.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      title="Exit Chat"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* TEXTS AND DIALOG THREAD WINDOW */}
                <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/15 w-full relative no-scrollbar">
                  {filteredMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 space-y-2 p-6">
                      <MessageSquare className="w-8 h-8 opacity-25" />
                      <p className="text-[11px] uppercase tracking-wider font-black">No messages matching query</p>
                    </div>
                  )}

                  {filteredMessages.map((msg) => {
                    const isSelf = msg.sender === 'customer';
                    const senderLabel = isSelf ? (user?.name || fullName) : (chatType === 'human' ? 'Support Agent' : 'TAZU AI Assistant');
                    const avatarUrl = isSelf 
                      ? user?.profileImage 
                      : (chatType === 'human' ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' : undefined);
                    const initials = senderLabel.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isSelf ? 'justify-end' : 'justify-start'} items-end gap-2.5 max-w-full`}
                      >
                        {!isSelf && (
                          <div className={`w-9 h-9 flex items-center justify-center shrink-0 rounded-lg shadow-sm text-white sticky bottom-0 overflow-hidden ${chatType === 'human' ? 'bg-indigo-600' : 'bg-slate-950 border border-slate-800'}`}>
                            {avatarUrl ? (
                              <img src={avatarUrl} alt="Agent" className="w-full h-full object-cover" />
                            ) : (
                              chatType === 'human' ? <Headset className="w-5 h-5" /> : <Bot className="w-5 h-5" />
                            )}
                          </div>
                        )}

                        <div className={`max-w-[85%] flex flex-col space-y-1 ${isSelf ? 'items-end' : 'items-start'}`}>
                          <div className={`p-3 md:p-3.5 leading-relaxed text-[13px] font-semibold relative shadow-sm transition-all ${
                            isSelf 
                              ? 'bg-slate-950 text-white rounded-lg rounded-br-[2px]' 
                              : 'bg-white border border-slate-150 text-slate-800 rounded-lg rounded-bl-[2px]'
                          }`}>
                            <p className="whitespace-pre-line">{msg.text}</p>

                            {msg.imageUrl && (
                              <div className="rounded-lg overflow-hidden border border-slate-200 mt-2.5 bg-slate-50 max-h-[220px] max-w-full">
                                <img src={msg.imageUrl} alt="attachment" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                              </div>
                            )}
                          </div>

                          <div className={`flex items-center gap-2 px-1 text-[9px] text-zinc-400 font-bold uppercase tracking-wider ${isSelf ? 'justify-end' : 'justify-start'}`}>
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isSelf && (
                              <span className="flex items-center gap-0.5">
                                {msg.seen ? (
                                  <span className="text-indigo-600 flex items-center gap-0.5">Seen <CheckCheck className="w-3 h-3" /></span>
                                ) : (
                                  <span className="text-zinc-300">Delivered <CheckCheck className="w-3 h-3" /></span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {isSelf && (
                          <div className="w-9 h-9 bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 rounded-lg uppercase text-[10.5px] font-black text-slate-800 shadow-inner sticky bottom-0 overflow-hidden">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt="Me" className="w-full h-full object-cover" />
                            ) : (
                              initials || 'Me'
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* LIVE TYPING INDICATORS */}
                  {isAiTyping && (
                    <div className="flex justify-start items-center gap-2 text-zinc-400 text-[10px] font-mono px-2">
                      <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
                      TAZU AI is matching order status and database rows...
                    </div>
                  )}

                  {chatType === 'human' && currentSession?.isTyping && (
                    <div className="flex justify-start items-center gap-2 text-zinc-400 text-[10px] font-mono px-2">
                      <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
                      Executive is typing a professional reply...
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* SUGGESTION QUICK CHIPS WRAPPER - ONLY FOR AI CHAT */}
                {chatType === 'ai' && (
                  <div className="p-2 bg-slate-50 border-t border-slate-100 flex gap-2 overflow-x-auto shrink-0 select-none no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {[
                      { text: '📦 Track My Order', query: 'আমার অর্ডার ট্র্যাক করো' },
                      { text: '🚚 Shipping Charges', query: 'ডেলিভারি চার্জ কত?' },
                      { text: '💳 bKash Payment', query: 'বিকাশ পেমেন্ট গাইড' },
                      { text: '🔄 Return Policy', query: 'রিটার্ন এক্সচেঞ্জ পলিসি' },
                      { text: '🏷️ Active Coupons', query: 'স্টোর ডিসকাউন্ট কুপন' },
                      { text: '🛍️ Best Products', query: 'স্টক প্রোডাক্টস ও প্রাইস' },
                    ].map((chip) => (
                      <button
                        key={chip.text}
                        type="button"
                        onClick={() => handleChipClick(chip.query)}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-950 hover:text-white border border-slate-200 text-slate-700 text-[10.5px] font-bold rounded-lg transition-all shrink-0 cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        {chip.text}
                      </button>
                    ))}
                  </div>
                )}

                {/* CHAT INPUT FROM SENDER PANEL */}
                <div className="p-2 md:p-3 bg-white border-t border-slate-200 flex flex-col shrink-0 gap-2 z-10 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.02)]">
                  {/* Attached media draft preview bar */}
                  {(attachedImage || attachedFile) && (
                    <div className="mx-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-[10px] uppercase font-black text-rose-400 tracking-widest shadow-lg animate-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>Ready to send attachment</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => { setAttachedImage(null); setAttachedFile(null); }}
                        className="text-white hover:text-rose-300 px-2 py-1 rounded transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* MESSENGER STYLE INPUT BAR */}
                  <div className="flex items-center gap-2 px-1">
                    {/* ATTACHMENT TOOLS AREA */}
                    <div className="flex items-center gap-1">
                      <button 
                        type="button" 
                        onClick={triggerImageUpload}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                        title="Upload Gallery"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      
                      <div className="relative">
                        <button 
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer ${showEmojiPicker ? 'bg-amber-50 text-amber-500' : 'text-slate-400 hover:text-slate-950 hover:bg-slate-50'}`}
                          title="Add Emoji"
                        >
                          <Smile className="w-5 h-5" />
                        </button>

                        {showEmojiPicker && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setShowEmojiPicker(false)} />
                            <div className="absolute left-0 bottom-full mb-3 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xl flex gap-2 z-40 animate-in fade-in zoom-in-95 origin-bottom-left">
                              {['👍', '❤️', '🔥', '📦', '⏳', '✅', '❓'].map(em => (
                                <button
                                  key={em}
                                  type="button"
                                  onClick={() => {
                                    setUserInput(prev => prev + em);
                                    setShowEmojiPicker(false);
                                    playTone('open');
                                  }}
                                  className="text-lg hover:scale-125 transition-transform"
                                >
                                  {em}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* INPUT FORM WRAPPER */}
                    <form 
                      onSubmit={chatType === 'human' ? handleSendHumanMessage : handleSendAiMessage} 
                      className="flex-1 flex items-center gap-2"
                    >
                      {/* MESSAGE BOX: AUTO-EXPANDING TEXTAREA */}
                      <div className="flex-grow min-w-0 bg-slate-50 border border-slate-150 focus-within:border-slate-300 focus-within:bg-white rounded-lg px-2 transition-all">
                        <textarea
                          ref={textareaRef}
                          placeholder="Type your message..."
                          rows={1}
                          className="w-full bg-transparent border-none outline-none px-2 text-[14px] font-semibold text-slate-800 placeholder-slate-400 resize-none py-2.5 scrollbar-none"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              const form = e.currentTarget.form;
                              if (form) form.requestSubmit();
                            }
                          }}
                        />
                      </div>

                      {/* SEND BUTTON - Messenger Style */}
                      <button
                        type="submit"
                        disabled={!userInput.trim() && !attachedImage}
                        className="w-11 h-11 shrink-0 bg-slate-950 text-white flex items-center justify-center rounded-lg hover:bg-black disabled:opacity-20 disabled:scale-95 transition-all shadow-sm active:scale-90 group cursor-pointer"
                      >
                        <Send className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      </button>
                    </form>
                  </div>
                  {/* Hidden Global Inputs for Attachments */}
                  <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageFileSelected} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
