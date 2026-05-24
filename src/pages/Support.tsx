import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  PhoneCall, 
  HelpCircle, 
  FileText, 
  ChevronRight, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Paperclip, 
  Smile, 
  Image as ImageIcon, 
  Bot, 
  ArrowRight, 
  User, 
  Phone, 
  ShoppingBag, 
  ChevronDown, 
  Check, 
  X, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupportStore, SupportTicket, ChatMessage } from '../store/useSupportStore';
import { useSupportBannerStore } from '../store/useSupportBannerStore';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  'Order Problem',
  'Payment Issue',
  'Refund Request',
  'Delivery Delay',
  'Account Problem',
  'Product Issue',
  'Technical Problem',
  'Other'
];

const FAQS = [
  {
    q: 'How can I track my active order?',
    a: 'You can easily track your order by visiting the "Orders" page in your customer dashboard. Alternatively, you can drop your order ID in our Support Live Chat and our system will instantly update you.'
  },
  {
    q: 'What is your refund and return policy?',
    a: 'We offer a 7-day hassle-free return and replacement policy for all unused products with original packaging intact. Refunds are processed to the source payment method within 3 to 5 business days.'
  },
  {
    q: 'How long does standard delivery take?',
    a: 'Deliveries within Dhaka take 24–48 hours. Standard nationwide delivery outside Dhaka takes 3–5 business days. Express next-day delivery options are also available.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Cash on Delivery (COD), Mobile Financial Services (bKash, Nagad, Rocket), and all major debit/credit cards (Visa, Mastercard, Amex).'
  },
  {
    q: 'Can I change my delivery address after placing an order?',
    a: 'Yes, if your order is not shipped yet, please contact our support immediately via Phone or WhatsApp with your Order ID, and we will update it for you.'
  }
];

export default function Support() {
  const { 
    tickets, 
    sessions, 
    settings, 
    addTicket, 
    sendMessageToSession,
    createNewSession,
    currentCustomerSessionId
  } = useSupportStore();

  const { banner, fetchBanner } = useSupportBannerStore();

  // Selected Support Tab / Type
  const [activeTab, setActiveTab] = useState<'contact' | 'ticket' | 'chat' | 'faq'>('contact');

  // Customer Chat Session setup
  const [chatName, setChatName] = useState('');
  const [chatPhone, setChatPhone] = useState('');
  const [chatJoined, setChatJoined] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatEmojiOpen, setChatEmojiOpen] = useState(false);
  
  // File attachments state
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string } | null>(null);

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ticket Form States
  const [ticketCategory, setTicketCategory] = useState('Order Problem');
  const [ticketName, setTicketName] = useState('');
  const [ticketPhone, setTicketPhone] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketOrderId, setTicketOrderId] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState<SupportTicket | null>(null);

  // Accordion State
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null);

  // AI Assistant States
  const [aiInput, setAiInput] = useState('');
  const [aiChat, setAiChat] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your automated assistant to help with quick FAQ or guide you to our sections. How can I help?' }
  ]);
  const [aiTyping, setAiTyping] = useState(false);

  // Fetch the active user session if exists
  const activeUserSession = sessions.find(s => s.id === currentCustomerSessionId);

  useEffect(() => {
    fetchBanner();
  }, [fetchBanner]);

  useEffect(() => {
    if (activeUserSession) {
      setChatJoined(true);
    }
  }, [activeUserSession]);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chatJoined) {
      scrollToBottom();
    }
  }, [activeUserSession?.messages, chatJoined]);

  // --- Actions ---

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatName || !chatPhone) return;
    createNewSession(chatName, chatPhone);
    setChatJoined(true);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !attachedImage && !attachedFile) return;

    sendMessageToSession(
      currentCustomerSessionId, 
      'customer', 
      chatInput.trim() || undefined,
      attachedImage || undefined,
      attachedFile?.url || undefined,
      attachedFile?.name || undefined
    );

    setChatInput('');
    setAttachedImage(null);
    setAttachedFile(null);
    setChatEmojiOpen(false);
  };

  // Image attach helper via FileReader
  const handleImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Custom File attach helper
  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile({
        name: file.name,
        url: URL.createObjectURL(file)
      });
    }
  };

  // Ticket Submit helper
  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketName || !ticketPhone || !ticketSubject || !ticketMessage) return;

    const created = addTicket({
      fullName: ticketName,
      phoneNumber: ticketPhone,
      email: ticketEmail || undefined,
      orderId: ticketOrderId || undefined,
      subject: ticketSubject,
      message: ticketMessage,
      category: ticketCategory
    });

    setTicketSuccess(created);
    
    // Reset Form
    setTicketName('');
    setTicketPhone('');
    setTicketEmail('');
    setTicketOrderId('');
    setTicketSubject('');
    setTicketMessage('');
  };

  // AI Assistant trigger
  const handleAiSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = aiInput.trim();
    setAiChat(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiInput('');
    setAiTyping(true);

    setTimeout(() => {
      let replyText = "I see. Let me direct you to write a detailed support ticket or connect to our dedicated support agents above!";
      const textLower = userMsg.toLowerCase();
      if (textLower.includes('track') || textLower.includes('order')) {
        replyText = "To track your order instantly, you can paste your Order ID in the support form or click the Live Chat tab above to get real-time human connection.";
      } else if (textLower.includes('refund') || textLower.includes('money')) {
        replyText = "We process refunds within 3-5 days of product return approval. View our Refund policy accordion below for more guidance.";
      } else if (textLower.includes('delivery') || textLower.includes('time')) {
        replyText = "Deliveries within Dhaka are within 48 hours. Outside Dhaka takes 3-5 business days.";
      } else if (textLower.includes('bkash') || textLower.includes('nagad') || textLower.includes('payment')) {
        replyText = "Yes! We accept online payments with bKash, SSLCommerz, and Cards, or cash on delivery anytime.";
      } else if (textLower.includes('hello') || textLower.includes('hi')) {
        replyText = "Hello! I am your AI assistant. How can I help with quick Tazu Mart information?";
      }

      setAiChat(prev => [...prev, { sender: 'ai', text: replyText }]);
      setAiTyping(false);
    }, 1000);
  };

  // Add emoji helper
  const handleAddEmoji = (emoji: string) => {
    setChatInput(prev => prev + emoji);
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'In Review':
      case 'Under Review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Solved':
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-[90vh] font-sans pb-12">
      
      {/* SECTION 1 — SUPPORT HEADER (FULL WIDTH BANNER) */}
      {banner && banner.status ? (
        <div className="relative w-full overflow-hidden bg-zinc-900 group">
          {/* Edge-to-Edge Image */}
          <div className="relative w-full h-[220px] md:h-[300px]">
            {banner.banner_image ? (
              <img 
                src={banner.banner_image} 
                alt="Support Banner" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900 to-black" />
            )}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/30 backdrop-blur-md border border-purple-500/30 rounded-full">
                  <Bot className="w-3.5 h-3.5 text-purple-300" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-200">
                    Tazu Mart Support Desk
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                  {banner.heading}
                </h1>
                
                <p className="text-xs md:text-sm font-bold uppercase tracking-[0.1em] text-gray-300 max-w-lg mx-auto">
                  {banner.sub_heading}
                </p>

                {banner.button_text && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to={banner.button_link}
                      className="mt-4 inline-flex items-center gap-3 px-8 py-3 bg-white text-black font-black uppercase text-[11px] tracking-widest hover:bg-purple-50 transition-colors shadow-2xl"
                    >
                      {banner.button_text} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-black py-12 text-center text-white">
           <h1 className="text-3xl font-black uppercase">Support Hub</h1>
        </div>
      )}

      <div className="container mx-auto px-4 mt-8 max-w-6xl">
        {/* INNER DASHBOARD LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CONTACT CHANNELS & NAVIGATION */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
             <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-4 border-b border-gray-100 pb-2">Support Channels</h3>
             <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setActiveTab('contact')}
                  className={`w-full px-4 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-between border transition-all ${activeTab === 'contact' ? 'bg-black text-white border-black shadow-md' : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'}`}
                >
                   <span>1. Contact Channels</span>
                   <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className={`w-full px-4 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-between border transition-all ${activeTab === 'chat' ? 'bg-black text-white border-black shadow-md' : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'}`}
                >
                   <span className="flex items-center gap-1.5">
                      2. Live Agent Chat 
                      {sessions.some(s => s.id === currentCustomerSessionId && s.messages.some(m => !m.seen && m.sender === 'admin')) && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      )}
                   </span>
                   <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setActiveTab('ticket')}
                  className={`w-full px-4 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-between border transition-all ${activeTab === 'ticket' ? 'bg-black text-white border-black shadow-md' : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'}`}
                >
                   <span>3. Submit Ticket</span>
                   <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setActiveTab('faq')}
                  className={`w-full px-4 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-between border transition-all ${activeTab === 'faq' ? 'bg-black text-white border-black shadow-md' : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'}`}
                >
                   <span>4. Collapsible FAQs</span>
                   <ChevronRight className="w-3.5 h-3.5" />
                </button>
             </div>
          </div>

          {/* SECTION 8 — SUPPORT STATUS LIST FOR CURRENT CLIENT'S TICKETS */}
          <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
             <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Your Ticket Logs</h3>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold uppercase">{tickets.length} Active</span>
             </div>

             {tickets.length === 0 ? (
               <p className="text-[11px] font-bold text-gray-400 text-center py-4 uppercase">No submitted tickets yet</p>
             ) : (
               <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-purple-600">{ticket.id}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 border ${getStatusColor(ticket.status)}`}>
                             {ticket.status}
                          </span>
                       </div>
                       <p className="text-[11px] font-black text-gray-900 line-clamp-1 leading-tight uppercase">{ticket.subject}</p>
                       <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold">
                          <span>{ticket.category}</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>

          {/* CONTACT ASSISTANCE CARD */}
          <div className="bg-gradient-to-br from-purple-900 to-indigo-950 p-6 text-white rounded-2xl space-y-4">
             <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-purple-300">
                <PhoneCall className="w-5 h-5" />
             </div>
             <div>
                <h4 className="text-sm font-black uppercase tracking-widest">Phone Support</h4>
                <p className="text-[11px] text-purple-200 font-medium leading-relaxed mt-1 uppercase">Our hotline is open from 9:00 AM to 10:00 PM everyday for direct order dispatch.</p>
             </div>
             <a 
               href={`tel:${settings.callNumber}`} 
               className="w-full inline-flex py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest justify-center items-center gap-2 hover:bg-purple-50 transition-colors"
             >
                <PhoneCall className="w-3.5 h-3.5" /> Call Hotline
             </a>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE WORKSPACE */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
           
           <AnimatePresence mode="wait">
              
              {/* CONTACT CHANNELS / SECTION 2 */}
              {activeTab === 'contact' && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="p-8 space-y-8 flex-1"
                >
                   <div>
                      <h2 className="text-xl font-black uppercase tracking-tight text-gray-950">Quick Help Channels</h2>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">Access quick support directly with one click</p>
                   </div>

                   {/* SECTION 2 — QUICK CONTACT CARDS */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* WhatsApp Card */}
                      <a 
                        href={`https://wa.me/${settings.whatsappNumber.replace(/\+/g, '')}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="p-5 border border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50 hover:shadow-md transition-all rounded-2xl flex items-start gap-4 text-left group"
                      >
                         <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center text-lg">
                            <span className="font-extrabold font-mono">WA</span>
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#065f46]">WhatsApp Support</h4>
                            <p className="text-sm font-black text-[#047857]">{settings.whatsappNumber}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-1 group-hover:text-emerald-700">
                               Click to start chat <ExternalLink className="w-3 h-3" />
                            </p>
                         </div>
                      </a>

                      {/* Phone Support Card */}
                      <a 
                        href={`tel:${settings.callNumber}`}
                        className="p-5 border border-[#EEEEEE] bg-gray-50/30 hover:bg-gray-50 hover:shadow-md transition-all rounded-2xl flex items-start gap-4 text-left group"
                      >
                         <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center">
                            <PhoneCall className="w-4 h-4" />
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-xs font-extrabold uppercase tracking-widest text-purple-900">Direct Call Support</h4>
                            <p className="text-sm font-black text-gray-900">{settings.callNumber}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-1 group-hover:text-purple-600">
                               Dial number instantly <ExternalLink className="w-3 h-3" />
                            </p>
                         </div>
                      </a>

                      {/* Support Email Card */}
                      <a 
                        href={`mailto:${settings.supportEmail}`}
                        className="p-5 border border-blue-100 bg-blue-50/10 hover:bg-blue-50 hover:shadow-md transition-all rounded-2xl flex items-start gap-4 text-left group"
                      >
                         <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
                            <Mail className="w-4 h-4" />
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-xs font-extrabold uppercase tracking-widest text-blue-900">Support Email Portal</h4>
                            <p className="text-sm font-black text-gray-900">{settings.supportEmail}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-1 group-hover:text-blue-600">
                               Compose official email <ExternalLink className="w-3 h-3" />
                            </p>
                         </div>
                      </a>

                      {/* Messenger Card */}
                      <a 
                        href={settings.messengerLink}
                        target="_blank" 
                        rel="noreferrer"
                        className="p-5 border border-[#EEEEEE] bg-gray-50/30 hover:bg-gray-50 hover:shadow-md transition-all rounded-2xl flex items-start gap-4 text-left group"
                      >
                         <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center text-lg font-black">
                            M
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-900">Messenger Chat</h4>
                            <p className="text-sm font-black text-gray-900">Tazu Mart Messenger Page</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-1 group-hover:text-amber-700">
                               Connect via facebook <ExternalLink className="w-3 h-3" />
                            </p>
                         </div>
                      </a>

                      {/* Telegram Support Card */}
                      <a 
                        href={settings.telegramLink}
                        target="_blank" 
                        rel="noreferrer"
                        className="p-5 border border-sky-100 bg-sky-50/10 hover:bg-sky-50 hover:shadow-md transition-all rounded-2xl flex items-start gap-4 text-left group"
                      >
                         <div className="w-10 h-10 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center text-lg font-black">
                            TG
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-xs font-extrabold uppercase tracking-widest text-sky-900">Telegram Channel</h4>
                            <p className="text-sm font-black text-gray-900">@tazumartbd</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-1 group-hover:text-sky-700">
                               Open official chat <ExternalLink className="w-3 h-3" />
                            </p>
                         </div>
                      </a>

                      {/* Live Chat Launcher Trigger CARD */}
                      <button 
                        onClick={() => setActiveTab('chat')}
                        className="p-5 border border-purple-200 bg-purple-50/30 hover:bg-purple-50 hover:shadow-md transition-all rounded-2xl flex items-start gap-4 text-left group"
                      >
                         <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center">
                            <MessageCircle className="w-4 h-4" />
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-xs font-extrabold uppercase tracking-widest text-purple-900">Instant Live Chat</h4>
                            <p className="text-sm font-black text-purple-700">Connect with Live Agent</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-1 group-hover:text-purple-600">
                               Launch chat dashboard <ArrowRight className="w-3 h-3" />
                            </p>
                         </div>
                      </button>

                   </div>

                   {/* BRAND PROMISE */}
                   <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                         <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                         <h5 className="text-[11px] font-black uppercase tracking-wider text-black">Human-First Support Policy</h5>
                         <p className="text-[10px] text-gray-400 leading-normal font-bold uppercase mt-0.5">We prioritize direct human solutions. Average chat response time is under 2 minutes during office hours.</p>
                      </div>
                   </div>
                </motion.div>
              )}

              {/* TICKET SUBMIT SYSTEM / SECTION 3 & SECTION 4 */}
              {activeTab === 'ticket' && (
                <motion.div
                  key="ticket"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="p-8 space-y-6 flex-1"
                >
                   <div>
                      <h2 className="text-xl font-black uppercase tracking-tight text-gray-950">Formal Ticket Submission</h2>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">Drop your complaints and we will assign a specialized manager to audit</p>
                   </div>

                   {ticketSuccess ? (
                     <div className="p-8 text-center space-y-4 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                        <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
                           ✓
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tight">Support Ticket Registered!</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Your ticket ID has been generated successfully:</p>
                        
                        <div className="p-4 bg-black text-purple-400 font-mono text-lg font-black max-w-xs mx-auto tracking-widest border border-white/5">
                           {ticketSuccess.id}
                        </div>

                        <p className="text-[11px] font-bold text-gray-400 uppercase max-w-sm mx-auto leading-relaxed">
                           Our backoffice manager will review the ticket parameters: <strong>{ticketSuccess.subject}</strong> under <strong>{ticketSuccess.category}</strong>. You will receive an SMS and Email update shortly.
                        </p>

                        <button 
                          onClick={() => setTicketSuccess(null)}
                          className="px-6 py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                        >
                           Submit Another Ticket
                        </button>
                     </div>
                   ) : (
                     <form onSubmit={handleTicketSubmit} className="space-y-4">
                        
                        {/* SECTION 3 - SUPPORT CATEGORY */}
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Select Category of Complaint</label>
                           <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {CATEGORIES.map(cat => (
                                <button
                                  type="button"
                                  key={cat}
                                  onClick={() => setTicketCategory(cat)}
                                  className={`p-2.5 text-[9px] font-black uppercase border transition-all text-center ${ticketCategory === cat ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-[#EEEEEE] hover:bg-gray-50'}`}
                                >
                                   {cat}
                                </button>
                              ))}
                           </div>
                        </div>

                        {/* SECTION 4 - FORM FIELDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Full Name *</label>
                              <input 
                                type="text"
                                required
                                value={ticketName}
                                onChange={e => setTicketName(e.target.value)}
                                placeholder="e.g. Arif Hossain"
                                className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-[11px] font-bold uppercase rounded hover:border-gray-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Phone Number *</label>
                              <input 
                                type="text"
                                required
                                value={ticketPhone}
                                onChange={e => setTicketPhone(e.target.value)}
                                placeholder="e.g. +8801700000000"
                                className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-[11px] font-bold uppercase rounded hover:border-gray-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Email Address (Optional)</label>
                              <input 
                                type="email"
                                value={ticketEmail}
                                onChange={e => setTicketEmail(e.target.value)}
                                placeholder="email@gmail.com"
                                className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-[11px] font-bold rounded hover:border-gray-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Order ID (Optional)</label>
                              <input 
                                type="text"
                                value={ticketOrderId}
                                onChange={e => setTicketOrderId(e.target.value)}
                                placeholder="e.g. TM-9981"
                                className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-[11px] font-bold uppercase rounded hover:border-gray-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                              />
                           </div>
                        </div>

                        <div className="space-y-1">
                           <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Subject Description *</label>
                           <input 
                             type="text"
                             required
                             value={ticketSubject}
                             onChange={e => setTicketSubject(e.target.value)}
                             placeholder="Summary of the situation"
                             className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-[11px] font-bold uppercase rounded hover:border-gray-300 focus:outline-none focus:border-purple-600"
                           />
                        </div>

                        <div className="space-y-1">
                           <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Detailed Message *</label>
                           <textarea 
                             rows={4}
                             required
                             value={ticketMessage}
                             onChange={e => setTicketMessage(e.target.value)}
                             placeholder="Describe the complaint in detail. Add tracking code or item specifications if possible."
                             className="w-full p-4 bg-white border border-[#EEEEEE] text-[11px] font-bold rounded hover:border-gray-300 focus:outline-none focus:border-purple-600"
                           />
                        </div>

                        <div className="flex gap-4 pt-2">
                           <button 
                             type="button"
                             onClick={() => {
                                setTicketName('');
                                setTicketPhone('');
                                setTicketEmail('');
                                setTicketOrderId('');
                                setTicketSubject('');
                                setTicketMessage('');
                             }}
                             className="px-6 py-3 border border-gray-200 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-colors"
                           >
                              Reset
                           </button>
                           <button 
                             type="submit"
                             className="px-10 py-3 bg-purple-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-purple-700 transition-colors shadow-md shadow-purple-900/10"
                           >
                              Submit Ticket
                           </button>
                        </div>

                     </form>
                   )}
                </motion.div>
              )}

              {/* MANUAL LIVE CHAT SYSTEM / SECTION 5 */}
              {activeTab === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="p-0 flex-1 flex flex-col h-[650px]"
                >
                   {/* Chat onboarding screen */}
                   {!chatJoined ? (
                     <div className="p-8 flex-grow flex flex-col justify-center max-w-md mx-auto space-y-6 text-center">
                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-3xl flex items-center justify-center mx-auto">
                           <MessageCircle className="w-8 h-8" />
                        </div>
                        <div>
                           <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Live Web Chat Support</h2>
                           <p className="text-xs text-gray-400 font-bold uppercase mt-1">Connect with our support executive in real-time</p>
                        </div>

                        <form onSubmit={handleStartChat} className="space-y-3 text-left">
                           <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase tracking-widest text-gray-400">Full Name</label>
                              <input 
                                type="text"
                                required
                                value={chatName}
                                onChange={e => setChatName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-[11px] font-bold uppercase rounded focus:outline-none focus:border-purple-600"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase tracking-widest text-gray-400">Mobile Number</label>
                              <input 
                                type="text"
                                required
                                value={chatPhone}
                                onChange={e => setChatPhone(e.target.value)}
                                placeholder="e.g. +8801700000000"
                                className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-[11px] font-bold uppercase rounded focus:outline-none focus:border-purple-600"
                              />
                           </div>
                           <button 
                             type="submit"
                             className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                           >
                              Connect to Live Executive <ArrowRight className="w-4 h-4" />
                           </button>
                        </form>
                     </div>
                   ) : (
                     /* ACTIVE REAL CHAT BODY */
                     <div className="flex flex-col h-full bg-white">
                        
                        {/* CHAT HEADER */}
                        <div className="px-6 py-4 bg-black text-white flex items-center justify-between border-b border-white/5 shadow-md">
                           <div className="flex items-center gap-3">
                              <div className="relative">
                                 <div className="w-10 h-10 bg-purple-900 border border-purple-400 rounded-full flex items-center justify-center font-black text-xs text-white">
                                    TM
                                 </div>
                                 <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></span>
                              </div>
                              <div>
                                 <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-white">Tazu Mart Desk</h4>
                                    <span className="text-[8px] font-black tracking-widest text-[#10b981] bg-green-950/40 px-2 py-0.5 rounded border border-green-800/20">LIVE</span>
                                 </div>
                                 <p className="text-[9px] text-[#9ca3af] font-bold uppercase tracking-tight flex items-center gap-1 mt-0.5">
                                    {activeUserSession?.isTyping ? (
                                      <span className="text-purple-400 animate-pulse">Typing reply...</span>
                                    ) : (
                                      <span>Active Host: Human Support Executive</span>
                                    )}
                                 </p>
                              </div>
                           </div>

                           <button 
                             onClick={() => setActiveTab('contact')}
                             className="text-gray-400 hover:text-white p-2 transition-colors"
                           >
                              <X className="w-5 h-5" />
                           </button>
                        </div>

                        {/* CHAT MESSAGES PANEL */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 custom-scrollbar space-y-4">
                           
                           {/* Seed initial welcome if message empty */}
                           {(!activeUserSession?.messages || activeUserSession.messages.length === 0) ? (
                             <div className="text-center py-12 text-gray-400 space-y-2">
                                <MessageCircle className="w-8 h-8 mx-auto opacity-30 text-purple-600" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Chat initialized with Desk</p>
                                <p className="text-[9px] font-bold uppercase">Send your message to start talking with active admin</p>
                             </div>
                           ) : (
                             activeUserSession.messages.map((m) => {
                               // "Customer side: Left = Customer message, Right = Admin reply"
                               const isCustomer = m.sender === 'customer';
                               return (
                                 <div 
                                   key={m.id}
                                   className={`flex ${isCustomer ? 'justify-start' : 'justify-end'} gap-2`}
                                 >
                                    <div className={`max-w-[75%] rounded-[18px] p-4 text-left shadow-sm relative transition-all duration-300 ${
                                      isCustomer 
                                        ? 'bg-zinc-100 text-zinc-900 rounded-tl-sm border border-zinc-200/50' 
                                        : 'bg-zinc-900 text-white border border-zinc-950 rounded-tr-sm shadow-md'
                                    }`}>
                                       {/* Brand identity header for Admin messages on customer view too */}
                                       {!isCustomer && (
                                         <div className="flex items-center gap-1 text-[8px] text-zinc-400 font-extrabold tracking-widest uppercase border-b border-zinc-800 pb-1 mt-0 mb-1.5 whitespace-nowrap">
                                            <span className="w-3.5 h-3.5 bg-purple-600 text-white font-serif rounded-full flex items-center justify-center text-[7px] font-black shrink-0">T</span>
                                            <span className="font-sans">TAZU MART BD</span>
                                            <span className="text-[6.5px] bg-purple-950 text-purple-300 border border-purple-800/40 px-1 py-0.2 rounded font-black uppercase ml-auto">Official Support</span>
                                         </div>
                                       )}

                                       {/* Message body text */}
                                       {m.text && <p className="text-[11px] leading-relaxed select-text font-semibold">{m.text}</p>}

                                       {/* Attached thumbnail */}
                                       {m.imageUrl && (
                                         <div className="rounded-lg overflow-hidden border border-black/10 max-h-48 max-w-xs mt-2 relative bg-gray-100">
                                            <img src={m.imageUrl} alt="attachment-img" className="object-cover max-h-48 w-full" referrerPolicy="no-referrer" />
                                         </div>
                                       )}

                                       {/* Attached generic file */}
                                       {m.fileUrl && (
                                         <div className="flex items-center gap-2 p-2 bg-black/10 rounded-lg text-[9px] uppercase font-bold tracking-tight">
                                            <Paperclip className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate max-w-[150px]">{m.fileName || 'document.pdf'}</span>
                                         </div>
                                       )}

                                       {/* Timestamp */}
                                       <div className="flex justify-between items-center text-[8px] opacity-60 font-black tracking-widest pt-1.5 border-t border-black/5 mt-1">
                                          <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                                          
                                          <div className="flex items-center gap-0.5 ml-3">
                                             {isCustomer && (
                                                <>
                                                   {(m.deliveryStatus || (m.seen ? 'seen' : 'delivered')) === 'sending' && (
                                                     <span className="text-zinc-500 font-bold italic animate-pulse">Sending...</span>
                                                   )}
                                                   {(m.deliveryStatus || (m.seen ? 'seen' : 'delivered')) === 'sent' && (
                                                     <span className="text-zinc-500 font-bold">Sent ✓</span>
                                                   )}
                                                   {(m.deliveryStatus || (m.seen ? 'seen' : 'delivered')) === 'delivered' && (
                                                     <span className="text-zinc-500 font-bold">Delivered ✓✓</span>
                                                   )}
                                                   {(m.deliveryStatus || (m.seen ? 'seen' : 'delivered')) === 'seen' && (
                                                     <span className="text-sky-400 font-extrabold">Seen ✓✓</span>
                                                   )}
                                                </>
                                             )}
                                             {!isCustomer && (
                                                <span className="text-purple-400 font-extrabold">Support Unit</span>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                               );
                             })
                           )}

                           {/* Seen indicator / Typing indicator */}
                           {activeUserSession?.isTyping && (
                             <div className="flex justify-start gap-2">
                                <div className="bg-zinc-900 border border-zinc-950 text-zinc-300 py-2.5 px-4 rounded-[18px] rounded-tl-sm text-[10px] font-bold tracking-wide animate-pulse">
                                   Support administrator is typing...
                                </div>
                             </div>
                           )}

                           {/* Dummy div to scroll to */}
                           <div ref={messagesEndRef} />
                        </div>

                        {/* ATTACHMENT TEMP BAR */}
                        {(attachedImage || attachedFile) && (
                          <div className="px-6 py-2.5 bg-gray-100 border-t border-gray-200 flex items-center justify-between text-xs font-bold uppercase tracking-tight">
                             <div className="flex items-center gap-2">
                                {attachedImage ? (
                                  <>
                                     <span className="text-purple-600">★ Image Attached</span>
                                     <button onClick={() => setAttachedImage(null)} className="text-red-500 ml-2">Remove</button>
                                  </>
                                ) : (
                                  <>
                                     <span className="text-blue-600">★ File: {attachedFile?.name}</span>
                                     <button onClick={() => setAttachedFile(null)} className="text-red-500 ml-2">Remove</button>
                                  </>
                                )}
                             </div>
                          </div>
                        )}

                        {/* ENTER CHAT ACTION GROUP */}
                        <form onSubmit={handleSendChatMessage} className="p-4 border-t border-gray-100 bg-white flex items-center gap-3">
                           
                           {/* Hidden input tags */}
                           <input 
                             type="file" 
                             accept="image/*"
                             ref={imageInputRef}
                             onChange={handleImageAttach} 
                             className="hidden" 
                           />
                           <input 
                             type="file" 
                             ref={fileInputRef}
                             onChange={handleFileAttach} 
                             className="hidden" 
                           />

                           {/* Attachment Actions */}
                           <div className="flex gap-1.5 shrink-0 relative">
                              <button 
                                type="button" 
                                onClick={() => imageInputRef.current?.click()}
                                className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                 <ImageIcon className="w-4 h-4 text-gray-500" />
                              </button>
                              <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                 <Paperclip className="w-4 h-4 text-gray-500" />
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setChatEmojiOpen(!chatEmojiOpen)}
                                className={`w-10 h-10 border rounded-full flex items-center justify-center transition-colors ${chatEmojiOpen ? 'bg-purple-100 border-purple-400 text-purple-600' : 'border-gray-200 hover:bg-gray-50 text-gray-500'}`}
                              >
                                 <Smile className="w-4 h-4" />
                              </button>

                              {/* Emoji Dropdown mockup */}
                              {chatEmojiOpen && (
                                <div className="absolute bottom-12 left-0 bg-black text-white p-3 shadow-2xl border border-white/10 flex gap-2 z-30">
                                   {['👍', '❤️', '🔥', '📦', '🙏', '😊', '😭'].map(emo => (
                                     <button 
                                       type="button" 
                                       key={emo} 
                                       onClick={() => handleAddEmoji(emo)}
                                       className="text-lg hover:scale-125 transition-transform"
                                     >
                                        {emo}
                                     </button>
                                   ))}
                                </div>
                              )}
                           </div>

                           {/* Message Input text field */}
                           <input 
                             type="text"
                             value={chatInput}
                             onChange={e => setChatInput(e.target.value)}
                             placeholder="Write details or drop complaint coordinates..."
                             className="flex-1 bg-gray-50 border border-gray-100 px-4 py-3 text-[11px] font-bold uppercase tracking-wide focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                           />

                           {/* Send Button */}
                           <button 
                             type="submit"
                             className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 active:scale-90 transition-all shadow-md shadow-purple-900/20 shrink-0"
                           >
                              <Send className="w-4 h-4" />
                           </button>

                        </form>

                     </div>
                   )}
                </motion.div>
              )}

              {/* FAQ KNOWLEDGE HUB / SECTION 7 */}
              {activeTab === 'faq' && (
                <motion.div
                  key="faq"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="p-8 space-y-6 flex-1"
                >
                   <div>
                      <h2 className="text-xl font-black uppercase tracking-tight text-gray-950">Knowledge Base & FAQ</h2>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">Review official guidelines and instructions instantly</p>
                   </div>

                   {/* Collapse Accordions Section */}
                   <div className="space-y-4">
                      {FAQS.map((faq, idx) => {
                        const isOpen = faqOpenIdx === idx;
                        return (
                          <div 
                            key={idx} 
                            className="border border-[#EEEEEE] rounded-2xl overflow-hidden transition-all duration-300"
                          >
                             <button
                               onClick={() => setFaqOpenIdx(isOpen ? null : idx)}
                               className="w-full p-5 bg-white hover:bg-gray-50 flex items-center justify-between text-left transition-colors"
                             >
                                <span className="text-xs font-black uppercase tracking-wide text-gray-900">{faq.q}</span>
                                <ChevronDown className={`w-4 h-4 text-purple-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                             </button>
                             
                             <AnimatePresence>
                               {isOpen && (
                                 <motion.div
                                   initial={{ height: 0, opacity: 0 }}
                                   animate={{ height: 'auto', opacity: 1 }}
                                   exit={{ height: 0, opacity: 0 }}
                                   transition={{ duration: 0.2 }}
                                   className="bg-gray-50/50 border-t border-[#EEEEEE] p-5 text-[11px] leading-relaxed text-gray-500 font-medium uppercase"
                                 >
                                    {faq.a}
                                 </motion.div>
                               )}
                             </AnimatePresence>
                          </div>
                        );
                      })}
                   </div>
                </motion.div>
              )}

           </AnimatePresence>

        </div>

      </div>

      {/* SECTION 9 — AI CHAT SECTION (LAST) */}
      <div className="mt-12 bg-gray-50 border border-gray-200 p-8 rounded-3xl relative overflow-hidden shadow-inner">
         <div className="absolute top-4 right-4 w-12 h-12 text-purple-100 flex items-center justify-center">
            <Bot className="w-8 h-8 text-purple-300" />
         </div>
         <div className="space-y-2 mb-6">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-700 bg-purple-100 border border-purple-200 px-3 py-1 rounded-full">
               Help Widget Support
            </span>
            <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Virtual AI Helper</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Clearly Separate Optional Helper for Quick FAQs, Order guide, Navigation help</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* AI message list */}
            <div className="md:col-span-8 bg-white border border-gray-200 rounded-2xl h-[255px] overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3">
               {aiChat.map((msg, i) => (
                 <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-4 rounded-xl text-left max-w-[85%] text-[10px] uppercase font-bold leading-normal ${
                      msg.sender === 'user' 
                        ? 'bg-purple-600 text-white rounded-tr-none' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
                    }`}>
                       {msg.text}
                    </div>
                 </div>
               ))}
               {aiTyping && (
                 <div className="flex justify-start">
                    <div className="p-3 bg-gray-100 text-gray-400 text-[10px] uppercase font-bold rounded-xl rounded-tl-none border tracking-widest animate-pulse">
                       AI is thinking...
                    </div>
                 </div>
               )}
            </div>

            {/* AI action inputs */}
            <div className="md:col-span-4 space-y-4">
               <form onSubmit={handleAiSend} className="space-y-3">
                  <div className="space-y-1">
                     <label className="text-[8px] font-black uppercase tracking-widest text-gray-400">Ask Quick Question</label>
                     <input 
                       type="text"
                       value={aiInput}
                       onChange={e => setAiInput(e.target.value)}
                       placeholder="e.g. Can I pay via bKash?"
                       className="w-full px-4 py-3 bg-white border border-gray-200 text-[10px] uppercase font-bold rounded focus:outline-none focus:border-purple-600"
                     />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-3 bg-black text-white text-[9px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                     Analyze Question <Bot className="w-3.5 h-3.5 text-purple-400" />
                  </button>
               </form>

               <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl space-y-2">
                  <h5 className="text-[9px] font-black uppercase tracking-wider text-purple-900">Try these topics:</h5>
                  <div className="flex flex-wrap gap-1">
                     {['refund', 'delivery time', 'bkash payment'].map(term => (
                       <button
                         key={term}
                         onClick={() => {
                            setAiInput(term);
                         }}
                         className="px-2 py-1 bg-white border border-purple-200 hover:border-purple-400 text-[8px] font-black uppercase rounded text-purple-800"
                       >
                          {term}
                       </button>
                     ))}
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  </div>
);
}
