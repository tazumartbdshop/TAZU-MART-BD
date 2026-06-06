import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  MessageCircle, 
  Mail, 
  PhoneCall, 
  Settings, 
  Send, 
  CheckCircle, 
  Trash2, 
  X, 
  Check, 
  FileText, 
  Clock, 
  HelpCircle,
  Paperclip,
  Image as ImageIcon,
  MessageSquare,
  Bot,
  User,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  ChevronLeft,
  Phone,
  Video,
  MoreVertical,
  ShieldCheck,
  CheckCheck,
  Sparkles,
  AlertCircle,
  Smile,
  SendHorizontal,
  MapPin,
  Home,
  Building2,
  Truck,
  Copy,
  ArrowUpRight,
  BarChart3,
  Ban,
  CheckCircle2,
  ShoppingBag,
  History,
  TrendingUp,
  Map as MapIcon,
  CreditCard
} from 'lucide-react';
import { useSupportStore, ChatSession, SupportTicket, ChatMessage } from '../../store/useSupportStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useOfferStore } from '../../store/useOfferStore';
import { useBannerStore } from '../../store/useBannerStore';
import { useNavigate } from 'react-router-dom';
import { getCompletedOrdersCount, LoyaltyBadge, VerifiedTick } from '../../lib/loyalty';

// Profile images fallback logic
const getAvatarImage = (id: string, name: string, customerProfileImage?: string) => {
  if (customerProfileImage) return customerProfileImage;
  const PROFILE_IMAGES: Record<string, string> = {
    'TAZU-MART-BD-OFFICIAL': 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=120&fit=crop&q=80',
    'TAZU-MART-BD': 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=120&fit=crop&q=80',
  };
  if (PROFILE_IMAGES[id]) return PROFILE_IMAGES[id];
  const charCode = name.charCodeAt(0) || 0;
  const ids = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&fit=crop&q=80'
  ];
  return ids[charCode % ids.length];
};


// Test edit
export default function AdminSupport() {
  const { 
    tickets, 
    sessions, 
    settings, 
    activeSessionId, 
    setActiveSession, 
    sendMessageToSession,
    setTypingIndicator,
    closeSession,
    solveSession,
    updateTicketStatus,
    deleteTicket,
    updateSettings
  } = useSupportStore();

  const { orders } = useOrderStore();
  const { offers } = useOfferStore();
  const { banners } = useBannerStore();
  const { customers } = useCustomerStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'chats' | 'tickets' | 'settings'>('chats');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeModalView, setActiveModalView] = useState<'addresses' | 'tickets' | 'activity' | 'block' | null>(null);

  // Find customer profile for sessions
  const getCustomerForSession = (session: ChatSession) => {
    if (session.id === 'TAZU-MART-BD-OFFICIAL') return null;
    const cleanPhone = session.customerPhone.replace(/[+\s-]+/g, '');
    return customers.find(c => c.phones.some(p => p.replace(/[+\s-]+/g, '') === cleanPhone));
  };
  
  // Settings Form state
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || 'support@tazumartbd.com');
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '+8801711223344');
  const [messengerLink, setMessengerLink] = useState(settings.messengerLink || 'https://m.me/tazumartbd');
  const [telegramLink, setTelegramLink] = useState(settings.telegramLink || 'https://t.me/tazumartbd');
  const [callNumber, setCallNumber] = useState(settings.callNumber || '+8801811223344');
  const [autoReplyMessage, setAutoReplyMessage] = useState(settings.autoReplyMessage || 'Thanks for reaching out! A support representative will be with you shortly.');
  const [welcomeMessage, setWelcomeMessage] = useState(settings.welcomeMessage || 'Welcome to TAZU MART BD Help Desk. Let us know how we can help you.');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // File attachments state & drawer simulation
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [replyFile, setReplyFile] = useState<{ name: string; url: string } | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const replyImageRef = useRef<HTMLInputElement>(null);
  const replyFileRef = useRef<HTMLInputElement>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time typing lists
  const [activeTypingSessions, setActiveTypingSessions] = useState<Record<string, boolean>>({});

  // Sync settings when they update in store
  useEffect(() => {
    setSupportEmail(settings.supportEmail || 'support@tazumartbd.com');
    setWhatsappNumber(settings.whatsappNumber || '+8801711223344');
    setMessengerLink(settings.messengerLink || 'https://m.me/tazumartbd');
    setTelegramLink(settings.telegramLink || 'https://t.me/tazumartbd');
    setCallNumber(settings.callNumber || '+8801811223344');
    setAutoReplyMessage(settings.autoReplyMessage || 'Thanks for reaching out!');
    setWelcomeMessage(settings.welcomeMessage || 'Welcome to TAZU MART BD.');
  }, [settings]);

  // Combine active customer problem sessions from Firestore, sorted by last message time
  const allSessions = useMemo(() => {
    const customerChats = sessions.filter(s => s.id !== 'TAZU-MART-BD-OFFICIAL');
    
    return [...customerChats].sort((a, b) => {
      const timeA = new Date(a.lastMessageAt).getTime();
      const timeB = new Date(b.lastMessageAt).getTime();
      return timeB - timeA;
    });
  }, [sessions]);

  // Find currently active chat session
  const currentChat = useMemo(() => {
    if (!activeSessionId) return null;
    return sessions.find(s => s.id === activeSessionId) || null;
  }, [activeSessionId, sessions]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (currentChat) {
      setTimeout(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [currentChat?.messages?.length, activeTypingSessions]);

  // Customer order counter
  const getCustomerOrderCount = (phone: string) => {
    if (!phone || phone === 'OFFICIAL INBOX') return 0;
    const cleanPhone = phone.replace(/\s+/g, '');
    return orders.filter(o => o.mobileNumber?.replace(/\s+/g, '') === cleanPhone).length;
  };

  // Sender reply handlers
  const handleAdminSendReply = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    if (!activeSessionId) return;

    const textToSend = (customText || replyInput).trim();
    if (!textToSend && !replyImage && !replyFile) return;

    // Clear input
    if (!customText) setReplyInput('');

    // Send the message directly into the central store session
    sendMessageToSession(
      activeSessionId, 
      'admin', 
      textToSend || undefined,
      replyImage || undefined,
      replyFile?.url || undefined,
      replyFile?.name || undefined
    );

    setReplyImage(null);
    setReplyFile(null);
  };

  const handleQuickReply = (text: string) => {
    handleAdminSendReply(undefined, text);
  };

  // Media Attachment simulator
  const handleSimulatedAttachment = (type: 'invoice' | 'screenshot' | 'image' | 'voice') => {
    setShowAttachmentMenu(false);
    if (type === 'invoice') {
      setReplyFile({
        name: 'INV_TM_2849_Paid.pdf',
        url: '#invoice'
      });
    } else if (type === 'screenshot') {
      setReplyImage('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=60');
    } else if (type === 'image') {
      setReplyImage('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=650&auto=format&fit=crop&q=80');
    } else if (type === 'voice') {
      setReplyFile({
        name: 'Voice_Note_Customer_Query.mp3',
        url: '#audiomessage'
      });
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      supportEmail,
      whatsappNumber,
      messengerLink,
      telegramLink,
      callNumber,
      autoReplyMessage,
      welcomeMessage
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Counters for Quick Cards
  const totalUnreadChats = useMemo(() => {
    let unreads = 0;
    sessions.forEach(s => {
      unreads += s.messages.filter(m => m.sender === 'customer' && !m.seen).length;
    });
    return unreads;
  }, [sessions]);

  const activeAnnouncementsCount = banners ? banners.length : 3;
  const runningOffersCount = offers ? offers.length : 5;
  const openSupportTickets = tickets ? tickets.filter(t => t.status !== 'Closed' && t.status !== 'Solved').length : 2;

  return (
    <div className="py-6 px-4 md:px-8 max-w-[1550px] w-full mx-auto space-y-6 font-sans text-left">
      
      {/* Top Section / Header Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-2">
              Support Control Center
            </h1>
            <p className="text-[12px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
              Manage Customer Conversations, Support Requests & Live Messaging
            </p>
         </div>

         {/* Admin Control tabs - Elegant SaaS Style */}
         <div className="flex gap-1.5 bg-gray-50 border border-gray-200 p-1 rounded-xl shadow-xs self-stretch md:self-auto justify-between md:justify-start">
            <button 
              onClick={() => setActiveTab('chats')}
              className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'chats' ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
               Live Inbox 💬
            </button>
            <button 
              onClick={() => setActiveTab('tickets')}
              className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'tickets' ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
               Tickets 🏷 ({tickets.length})
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'settings' ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
               Settings ⚙️
            </button>
         </div>
      </div>

      {/* NEW TOP ACTION BAR - 4 CARDS SINGLE ROW EQUAL WIDTH */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full" id="quick-action-cards-grid">
        {/* CARD 1 */}
        <div 
          onClick={() => setActiveTab('chats')}
          className={`h-[90px] rounded-[14px] bg-white border border-gray-150 p-2 sm:p-3 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer select-none min-w-0 ${activeTab === 'chats' ? 'border-purple-300 ring-1 ring-purple-100' : ''}`}
          id="quick-card-chats"
        >
          <div className="flex justify-between items-start w-full min-w-0">
            <span className="text-[16px] sm:text-[18px] md:text-[20px]">💬</span>
            <span className="bg-purple-100 text-purple-700 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none shrink-0">
              {totalUnreadChats}
            </span>
          </div>
          <div className="text-left mt-1 min-w-0 w-full">
            <h4 className="text-[11px] sm:text-[12px] md:text-[13px] font-bold text-gray-800 leading-none break-words whitespace-normal [word-break:break-word] [overflow-wrap:anywhere]">Chats</h4>
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium leading-tight mt-0.5 break-words whitespace-normal [word-break:break-word] [overflow-wrap:anywhere]">All Messages</p>
          </div>
        </div>

        {/* CARD 2 */}
        <div 
          onClick={() => setActiveTab('settings')}
          className="h-[90px] rounded-[14px] bg-white border border-gray-150 p-2 sm:p-3 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer select-none min-w-0"
          id="quick-card-announcements"
        >
          <div className="flex justify-between items-start w-full min-w-0">
            <span className="text-[16px] sm:text-[18px] md:text-[20px]">📢</span>
            <span className="bg-gray-100 text-gray-700 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none shrink-0">
              {activeAnnouncementsCount}
            </span>
          </div>
          <div className="text-left mt-1 min-w-0 w-full">
            <h4 className="text-[11px] sm:text-[12px] md:text-[13px] font-bold text-gray-800 leading-none break-words whitespace-normal [word-break:break-word] [overflow-wrap:anywhere]">Announcements</h4>
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium leading-tight mt-0.5 break-words whitespace-normal [word-break:break-word] [overflow-wrap:anywhere]">Updates & News</p>
          </div>
        </div>

        {/* CARD 3 */}
        <div 
          onClick={() => setActiveTab('settings')}
          className="h-[90px] rounded-[14px] bg-white border border-gray-150 p-2 sm:p-3 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer select-none min-w-0"
          id="quick-card-offers"
        >
          <div className="flex justify-between items-start w-full min-w-0">
            <span className="text-[16px] sm:text-[18px] md:text-[20px]">🏷️</span>
            <span className="bg-gray-100 text-gray-700 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none shrink-0">
              {runningOffersCount}
            </span>
          </div>
          <div className="text-left mt-1 min-w-0 w-full">
            <h4 className="text-[11px] sm:text-[12px] md:text-[13px] font-bold text-gray-800 leading-none break-words whitespace-normal [word-break:break-word] [overflow-wrap:anywhere]">Offers</h4>
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium leading-tight mt-0.5 break-words whitespace-normal [word-break:break-word] [overflow-wrap:anywhere]">Special Offers</p>
          </div>
        </div>

        {/* CARD 4 */}
        <div 
          onClick={() => setActiveTab('tickets')}
          className="h-[90px] rounded-[14px] bg-white border border-gray-150 p-2 sm:p-3 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer select-none min-w-0"
          id="quick-card-support"
        >
          <div className="flex justify-between items-start w-full min-w-0">
            <span className="text-[16px] sm:text-[18px] md:text-[20px]">🎧</span>
            <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none shrink-0">
              {openSupportTickets}
            </span>
          </div>
          <div className="text-left mt-1 min-w-0 w-full">
            <h4 className="text-[11px] sm:text-[12px] md:text-[13px] font-bold text-gray-800 leading-none break-words whitespace-normal [word-break:break-word] [overflow-wrap:anywhere]">Support</h4>
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium leading-tight mt-0.5 break-words whitespace-normal [word-break:break-word] [overflow-wrap:anywhere]">Help & Support</p>
          </div>
        </div>
      </div>

      {/* CHATS TAB (MAIN INBOX WORKSPACE) */}
      {activeTab === 'chats' && (
        <div className="w-full flex h-[720px] bg-transparent border-t border-b border-gray-200 select-none animate-fade-in" id="messenger-layout-container">
           
           {/* LEFT COLUMN: Customer Chats Inbox & Support Banner */}
           <div 
             className={`${activeSessionId ? 'hidden md:flex' : 'flex'} w-full md:w-[360px] lg:w-[410px] shrink-0 border-r border-gray-200 flex-col bg-transparent h-full`}
              id="chats-sidebar-panel"
            >
              {/* Inbox Header & Search Bar */}
              <div className="px-5 py-4 border-b border-gray-200 bg-transparent shrink-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black uppercase tracking-wider text-gray-950">
                    MESSENGER
                  </h3>
                  <button 
                    onClick={() => setActiveSession(null)}
                    className="text-[11px] font-bold text-gray-400 hover:text-black tracking-wider uppercase bg-transparent border-0 cursor-pointer"
                  >
                     Reset Select
                  </button>
                </div>
              </div>
              
              {/* Vertical Scroll of Threads */}
              <div className="flex-grow overflow-y-auto divide-y divide-gray-200 custom-scrollbar relative">
                 {allSessions.map((session, index) => {
                   const isSelected = session.id === activeSessionId;
                   const isOfficial = session.isOfficial || session.id === 'TAZU-MART-BD-OFFICIAL';
                   const lastMsg = session.messages ? session.messages[session.messages.length - 1] : null;
                   const customer = getCustomerForSession(session);
                   
                   // Find actual unread count
                   const unread = isOfficial ? 0 : (session.unreadCount ?? session.messages?.filter((m: any) => m.sender === 'customer' && !m.seen).length ?? 0);
                   
                   // Dynamic profile picture fallback
                   const profilePicture = getAvatarImage(session.id, customer?.name || session.customerName, customer?.profileImage);
                   const isOnline = session.customerOnline;

                   return (
                     <div 
                       key={session.id} 
                       className="relative"
                       style={{ zIndex: isOfficial ? 20 - index : 1 }}
                     >
                       <button
                         onClick={() => setActiveSession(session.id)}
                         className={`w-full text-left px-5 py-3 hover:bg-gray-100/60 transition-all flex items-center gap-3.5 relative h-[78px] ${
                           isSelected 
                             ? 'bg-gray-100' 
                             : 'bg-transparent'
                         }`}
                       >
                          {/* Circular Profile Avatar (50px) with Status Indicator */}
                          <div className="relative shrink-0" style={{ width: '50px', height: '50px' }}>
                             <img 
                               src={profilePicture} 
                               alt={customer?.name || session.customerName} 
                               className="w-full h-full object-cover border border-gray-200" 
                               style={{ borderRadius: '50%' }}
                               referrerPolicy="no-referrer"
                             />
                             {/* Online dot indicator bottom right status */}
                             <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                          </div>

                          {/* Customer Name, Message Preview, and Badges */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                             <div className="flex justify-between items-center gap-1">
                                <h4 className="text-xs font-extrabold text-gray-900 uppercase flex items-center gap-1.5 min-w-0 flex-1">
                                   <span className="truncate block" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                     {customer?.name || session.customerName}
                                   </span>
                                   {isOfficial && (
                                     <span className="inline-flex items-center justify-center w-3.5 h-3.5 bg-blue-500 text-white rounded-full shrink-0" title="Verified Account">
                                        <svg className="w-2 h-2 fill-current" viewBox="0 0 20 20">
                                          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                        </svg>
                                     </span>
                                   )}
                                </h4>
                                {lastMsg && (
                                   <span className="text-[9px] text-gray-400 font-mono shrink-0">
                                      {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                   </span>
                                )}
                             </div>

                             <p className="text-[11.5px] text-gray-500 truncate pr-6 mt-0.5 leading-normal">
                                {lastMsg ? (
                                   <span>
                                      {lastMsg.sender === 'admin' ? (
                                         <span className="bg-purple-100 text-purple-700 text-[8px] font-black px-1 py-0.2 rounded uppercase mr-1">You</span>
                                      ) : null}
                                      {lastMsg.text || '📄 Attachment Media File'}
                                   </span>
                                ) : (
                                   <span className="text-gray-400 italic">No messages</span>
                                )}
                             </p>
                          </div>

                          {/* Unread circle badge right center */}
                          {unread > 0 && (
                            <div className="shrink-0 ml-1">
                              <span className="w-5 h-5 bg-purple-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                                 {unread}
                              </span>
                            </div>
                          )}
                       </button>
                     </div>
                   );
                 })}
              </div>

              {/* SUPPORT BANNER (BOTTOM OF SIDEBAR) */}
              <div className="p-5 bg-transparent border-t border-gray-200 shrink-0 text-center select-none">
                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Active Executive Workspace</p>
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Desk Server: Operational</p>
                </div>
              </div>
            </div>

           {/* RIGHT COLUMN: Active Chat Frame / Dynamic Messenger Screen */}
           <div className={`${activeSessionId ? 'flex' : 'hidden md:flex'} flex-1 flex-col h-full bg-white relative`} id="chat-stream-workspace">
              
              {currentChat ? (
                <div className="flex flex-col h-full bg-white">
                   
                   {/* DYNAMIC TOP BAR HEADER */}
                   <div className="px-5 py-3.5 bg-white border-b border-gray-150 flex items-center justify-between shrink-0" id="chat-panel-top-bar">
                      <div className="flex items-center gap-3 text-left">
                         
                         {/* Back button (Mobile viewports back switcher) */}
                         <button 
                           onClick={() => setActiveSession(null)}
                           className="md:hidden p-1.5 -ml-1 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
                         >
                            <ChevronLeft className="w-5 h-5" />
                         </button>

                         {(() => {
                            const customer = getCustomerForSession(currentChat);
                            const profilePicture = getAvatarImage(currentChat.id, customer?.name || currentChat.customerName, customer?.profileImage);
                            
                            return (
                              <>
                                <div className="relative w-10 h-10">
                                   <img 
                                     src={profilePicture} 
                                     alt={customer?.name || currentChat.customerName} 
                                     className="w-10 h-10 object-cover" 
                                     style={{ borderRadius: '50%' }}
                                     referrerPolicy="no-referrer"
                                   />
                                   <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${currentChat.customerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></span>
                                </div>
                                
                                <div className="min-w-0">
                                   <div className="flex items-center gap-1.5">
                                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 truncate">
                                        {customer?.name || currentChat.customerName}
                                      </h4>
                                      {currentChat.isOfficial && (
                                        <span className="inline-flex items-center justify-center w-3.5 h-3.5 bg-blue-500 text-white rounded-full p-0.5" title="Verified Account">
                                           <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                             <path d="M6.269 12l2.387 2.386a1 1 0 001.414 0L17.222 7.23a1 1 0 10-1.414-1.415l-6.438 6.438-1.686-1.686a1 1 0 10-1.415 1.414z"></path>
                                           </svg>
                                        </span>
                                      )}
                                   </div>
                                   <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wide">
                                     {currentChat.customerOnline ? '● Active now' : '● Offline'}
                                   </p>
                                </div>
                              </>
                            );
                          })()}
                      </div>

                      {/* Header Menu Buttons */}
                      <div className="flex items-center gap-2">
                         <button 
                           onClick={() => alert(`Initiating telephone voice call connection directly to ${currentChat.customerPhone}...`)}
                           className="hidden sm:p-2 hover:bg-gray-100 text-gray-600 hover:text-black rounded-lg transition-colors"
                           title="Voice Call"
                         >
                            <Phone className="w-4 h-4" />
                         </button>
                         
                         <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />

                         {/* Profile Dropdown Menu */}
                         <div className="relative">
                           <button 
                             onClick={() => setShowProfileMenu(!showProfileMenu)}
                             className={`p-2 rounded-lg transition-all ${showProfileMenu ? 'bg-zinc-900 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-600 hover:text-black'}`}
                             title="Customer Menu"
                           >
                              <MoreVertical className="w-5 h-5" />
                           </button>

                           {showProfileMenu && (
                             <>
                               <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                               <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-150 rounded-xl shadow-2xl z-50 overflow-hidden animate-scale-in origin-top-right">
                                 <div className="px-4 py-3 bg-zinc-50 border-b border-gray-100 text-left">
                                   <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Quick Actions</p>
                                   <p className="text-[11px] font-black text-zinc-900 truncate uppercase leading-none">
                                     {(() => {
                                       const customer = getCustomerForSession(currentChat);
                                       return customer?.name || currentChat.customerName;
                                     })()}
                                   </p>
                                 </div>
                                 
                                 <div className="p-1.5 flex flex-col gap-0.5 text-left">
                                   {[
                                     { label: 'Customer Information', icon: <User className="w-3.5 h-3.5" />, action: 'open' },
                                     { label: 'Open Customer Profile', icon: <ExternalLink className="w-3.5 h-3.5" />, action: 'open' },
                                     { label: 'Customer Orders', icon: <FileText className="w-3.5 h-3.5" />, action: 'orders' },
                                     { label: 'Customer Addresses', icon: <MapPin className="w-3.5 h-3.5 text-blue-500" />, action: 'addresses' },
                                     { label: 'Customer Tickets', icon: <AlertCircle className="w-3.5 h-3.5 text-amber-500" />, action: 'tickets' },
                                     { label: 'Customer Activity', icon: <Clock className="w-3.5 h-3.5 text-emerald-500" />, action: 'activity' },
                                     { label: 'Block Customer', icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />, action: 'block' },
                                   ].map((item, idx) => (
                                     <button
                                       key={idx}
                                       onClick={() => {
                                         setShowProfileMenu(false);
                                         const customer = getCustomerForSession(currentChat);
                                         if (item.action === 'open' && customer) {
                                           navigate(`/admin/customers?profile=${customer.id}`);
                                         } else if (item.action === 'orders' && customer) {
                                           navigate(`/admin/orders?search=${customer.phones[0]}`);
                                         } else if (item.action === 'addresses') {
                                           setActiveModalView('addresses');
                                         } else if (item.action === 'tickets') {
                                           setActiveModalView('tickets');
                                         } else if (item.action === 'activity') {
                                           setActiveModalView('activity');
                                         } else if (item.action === 'block') {
                                           setActiveModalView('block');
                                         } else {
                                           alert(`Opening ${item.label} submodule (Demo Flow)...`);
                                         }
                                       }}
                                       className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold flex items-center justify-between transition-colors ${
                                         item.action === 'block' ? 'text-rose-600 hover:bg-rose-50' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                     >
                                       <span className="flex items-center gap-2.5">
                                         {item.icon}
                                         {item.label}
                                       </span>
                                       <ChevronRight className="w-3 h-3 opacity-30" />
                                     </button>
                                   ))}
                                 </div>

                                 <div className="p-1.5 border-t border-gray-100">
                                   <button 
                                     onClick={() => {
                                       setShowProfileMenu(false);
                                       solveSession(currentChat.id);
                                     }}
                                     className="w-full text-left px-3 py-2 rounded-lg text-[10px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                                   >
                                      Mark Session Solved
                                   </button>
                                 </div>
                               </div>
                             </>
                           )}
                         </div>
                      </div>
                   </div>

                   {/* MESSAGES SCROLL AREA */}
                   <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/30 custom-scrollbar space-y-4 text-left w-full overflow-x-hidden">
                      
                      {/* Notice of conversation encrypted security info */}
                      <div className="flex justify-center my-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-[10px] font-bold text-gray-500 rounded-full uppercase tracking-wider">
                           Conversation with {currentChat.customerName} is active for resolution
                        </span>
                      </div>

                      {currentChat.messages.map((msg: any) => {
                        const isCustomer = msg.sender === 'customer';
                        const customerProfile = getCustomerForSession(currentChat);
                        const avatarPic = getAvatarImage(currentChat.id, customerProfile?.name || currentChat.customerName, customerProfile?.profileImage);

                        return (
                          <div 
                            key={msg.id}
                            className={`flex ${isCustomer ? 'justify-start' : 'justify-end'} gap-2.5 items-end`}
                          >
                             {/* Customer Avatar bubble on left for received responses */}
                             {isCustomer && (
                                <img 
                                  src={avatarPic} 
                                  alt="" 
                                  className="w-7 h-7 object-cover shrink-0" 
                                  style={{ borderRadius: '50%' }}
                                  referrerPolicy="no-referrer"
                                />
                             )}

                             <div className={`max-w-[75%] w-fit break-words [word-break:break-word] [overflow-wrap:anywhere] whitespace-pre-wrap rounded-2xl p-3 text-left relative text-xs shadow-custom ${
                               isCustomer 
                                 ? 'bg-gray-200 text-gray-900 rounded-bl-none border border-gray-300/40' 
                                 : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-br-none shadow-sm'
                             }`}>
                                
                                {/* Header badge watermark inside Admin system replies */}
                                {!isCustomer && (
                                  <div className="flex items-center gap-1 border-b border-white/10 pb-1 mb-1.5 text-[8px] text-white/70 font-extrabold tracking-widest uppercase">
                                     <span className="w-3.5 h-3.5 bg-white/20 text-white rounded-full flex items-center justify-center text-[7px] font-black shrink-0">🛡️</span>
                                     <span>TAZU MART BD EXECUTIVE</span>
                                  </div>
                                )}

                                {msg.text && (
                                  <p className="text-[12px] leading-relaxed font-medium break-words whitespace-pre-wrap [word-break:break-word] [overflow-wrap:anywhere]">
                                     {msg.text}
                                  </p>
                                )}

                                {msg.imageUrl && (
                                  <div className="rounded-lg mt-2 overflow-hidden border border-black/10 bg-white shadow-xs">
                                     <img src={msg.imageUrl} alt="attached-media" className="object-cover max-h-48 w-full" referrerPolicy="no-referrer" />
                                  </div>
                                )}

                                {msg.fileUrl && (
                                  <div className="flex items-center gap-2 p-2 bg-black/10 rounded-lg mt-2 text-[10px] uppercase font-bold tracking-tight text-white">
                                     <Paperclip className="w-3.5 h-3.5 shrink-0" />
                                     <span className="truncate max-w-[150px]">{msg.fileName || 'Document File'}</span>
                                  </div>
                                )}

                                {/* Timestamp row and sent checks */}
                                <div className="flex items-center justify-between text-[8px] opacity-70 font-medium tracking-wide mt-1.5 border-t border-black/5 pt-1">
                                   <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                                   
                                   {!isCustomer && (
                                     <div className="flex items-center gap-0.5 ml-4 text-white">
                                        <span className="font-bold uppercase tracking-wider text-[7px]">Delivered ✓✓</span>
                                     </div>
                                   )}
                                </div>
                             </div>

                             {/* System Icon on the right for Admin sent bubbles */}
                             {!isCustomer && (
                                <div className="w-7 h-7 rounded-full bg-purple-600 text-white text-[9px] font-black flex items-center justify-center uppercase shrink-0">
                                   AD
                                </div>
                             )}
                          </div>
                        );
                      })}

                      {/* Typing indicator simulator */}
                      {(currentChat.isTyping || activeTypingSessions[currentChat.id]) && (
                        <div className="flex justify-start items-center gap-2 pb-2">
                           <img 
                             src={getAvatarImage(currentChat.id, getCustomerForSession(currentChat)?.name || currentChat.customerName, getCustomerForSession(currentChat)?.profileImage)} 
                             alt="" 
                             className="w-7 h-7 object-cover animate-pulse" 
                             style={{ borderRadius: '50%' }}
                           />
                           
                           {/* Pulsing indicator style dots */}
                           <div className="bg-gray-100 border border-gray-200 text-gray-500 px-3 py-2 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
                              <span className="text-gray-500 font-bold ml-1.5 uppercase text-[9px] tracking-wider">Customer is typing...</span>
                           </div>
                        </div>
                      )}
                      
                      <div ref={chatMessagesEndRef} />
                   </div>

                   {/* TEMP ATTACHMENT DRAFT PREVIEWS AREA */}
                   {(replyImage || replyFile) && (
                     <div className="px-5 py-2.5 bg-purple-50/50 border-t border-gray-200 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-left">
                        <div className="flex items-center gap-2">
                           {replyImage ? (
                             <>
                                <span className="text-purple-700 font-black">• Image ready for dispatch (Screenshot/Media)</span>
                                <button onClick={() => setReplyImage(null)} className="text-red-500 ml-1.5 hover:underline uppercase text-[9px]">Remove</button>
                             </>
                           ) : (
                             <>
                                <span className="text-purple-700 font-black">• Attachment Selected: {replyFile?.name}</span>
                                <button onClick={() => setReplyFile(null)} className="text-red-500 ml-1.5 hover:underline uppercase text-[9px]">Remove</button>
                             </>
                           )}
                        </div>
                     </div>
                   )}

                   {/* HORIZONTAL QUICK REPLY STREAM */}
                   <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-150 flex items-center gap-2 overflow-x-auto select-none shrink-0 custom-scrollbar whitespace-nowrap">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider shrink-0 mr-1">
                        Quick Replies:
                      </span>
                      {['Hello 👋', 'Order Number?', 'Please Wait', 'Issue Resolved', 'Thank You'].map(reply => (
                        <button
                          key={reply}
                          type="button"
                          onClick={() => handleQuickReply(reply)}
                          className="px-3.5 py-1.5 bg-white hover:bg-purple-600 hover:text-white border border-gray-200 text-gray-700 text-[10.5px] font-bold rounded-full transition-all shrink-0 shadow-xs cursor-pointer"
                        >
                          {reply}
                        </button>
                      ))}
                   </div>

                   {/* COMPOSER INBOX FORM */}
                   <div className="p-4 border-t border-gray-150 bg-white flex items-center gap-3 shrink-0 relative">
                      
                      <input 
                        type="file" 
                        accept="image/*"
                        ref={replyImageRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setReplyImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden" 
                      />
                      <input 
                        type="file" 
                        ref={replyFileRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setReplyFile({ name: file.name, url: '#file-mock' });
                          }
                        }}
                        className="hidden" 
                      />

                      {/* Attachment Menu Toggle Button */}
                      <div className="relative shrink-0">
                        <button 
                          type="button" 
                          onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                          className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 text-gray-500 hover:text-purple-600 transition-colors focus:outline-none"
                          title="Attach files"
                        >
                           <Paperclip className="w-5 h-5" />
                        </button>

                        {showAttachmentMenu && (
                          <div className="absolute left-0 bottom-12 w-48 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-30 flex flex-col gap-1 text-left">
                            <button 
                              type="button" 
                              onClick={() => handleSimulatedAttachment('invoice')}
                              className="w-full text-left p-2 hover:bg-purple-50 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-2"
                            >
                              📄 Attach simulated Invoice
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleSimulatedAttachment('screenshot')}
                              className="w-full text-left p-2 hover:bg-purple-50 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-2"
                            >
                              📸 Attach screenshot info
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleSimulatedAttachment('image')}
                              className="w-full text-left p-2 hover:bg-purple-50 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-2"
                            >
                              🖼️ Attach product image
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleSimulatedAttachment('voice')}
                              className="w-full text-left p-2 hover:bg-purple-50 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-2"
                            >
                              🎙️ Attach voice recording
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Main Message Input Textarea / Input bar */}
                      <form onSubmit={handleAdminSendReply} className="flex-1 flex gap-2">
                        <input 
                          type="text"
                          value={replyInput}
                          onChange={e => setReplyInput(e.target.value)}
                          placeholder={`Type a message to ${currentChat.customerName}...`}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[12px] font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                        />

                        <button 
                          type="submit"
                          className="w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center justify-center shadow-md shadow-purple-200 transition-colors shrink-0"
                        >
                           <SendHorizontal className="w-4 h-4" />
                        </button>
                      </form>
                   </div>

                </div>
              ) : (
                <div className="flex-grow flex flex-col justify-center items-center p-8 space-y-3 text-center bg-gray-50/10">
                   <div className="w-14 h-14 bg-purple-50 text-purple-600 border border-purple-100 rounded-2xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 animate-pulse" />
                   </div>
                   <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">
                         Messenger Workspace
                      </h3>
                      <p className="text-[11px] text-gray-400 uppercase tracking-widest max-w-sm mt-1.5 leading-relaxed">
                         Select a customer session thread from the recent active inbox to reply to their inquiries
                      </p>
                   </div>
                </div>
              )}

           </div>

        </div>
      )}

      {/* COMPLAINTS / TICKETS TAB PORTAL */}
      {activeTab === 'tickets' && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
           <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Complaints Registry & Actions</h3>
              <span className="text-[10px] bg-black text-white px-2.5 py-0.5 rounded font-mono font-black uppercase">{tickets.length} Registered</span>
           </div>

           {tickets.length === 0 ? (
             <div className="p-16 text-center text-gray-400 space-y-2 uppercase">
                <FileText className="w-8 h-8 mx-auto opacity-35 text-zinc-400" />
                <p className="text-[10px] font-black tracking-widest">No customer complaints currently registered</p>
             </div>
           ) : (
             <div className="divide-y divide-gray-100 bg-white text-left">
                {tickets.map(ticket => {
                  const isExpanded = expandedTicketId === ticket.id;
                  
                  return (
                    <div 
                      key={ticket.id} 
                      className={`transition-all duration-150 ${
                        isExpanded ? 'bg-gray-50/60 ring-1 ring-inset ring-gray-200 shadow-sm' : 'hover:bg-gray-50/30'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                        className="w-full text-left p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                         <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center">
                            <div className="md:col-span-2">
                               <span className="font-mono text-[9px] text-gray-500 uppercase font-bold tracking-wider bg-gray-100 px-2 py-0.5 rounded block w-fit border border-gray-200">
                                  #{ticket.id.slice(0, 8)}
                               </span>
                            </div>

                            <div className="md:col-span-3">
                               <h4 className="text-xs font-bold text-gray-950 uppercase truncate">
                                  {ticket.fullName}
                               </h4>
                               <p className="text-[9px] text-gray-400 font-mono mt-0.5">{ticket.phoneNumber}</p>
                            </div>

                            <div className="md:col-span-4">
                               <p className="text-[9px] text-purple-650 font-black uppercase tracking-wider block">{ticket.category || 'Support Request'}</p>
                               <p className="text-xs text-gray-600 font-medium truncate uppercase mt-0.5">
                                  {ticket.subject}
                               </p>
                            </div>

                            <div className="md:col-span-3">
                               <span className="text-[9.5px] text-gray-400 font-bold uppercase flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-gray-300" />
                                  {new Date(ticket.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
                            </div>
                         </div>

                         <div className="flex items-center justify-between md:justify-end gap-5 pt-2 md:pt-0 border-t md:border-t-0 border-dashed border-gray-150">
                            <span className="inline-block text-[10px] font-black border px-2.5 py-0.5 rounded uppercase tracking-wider bg-rose-50 text-rose-800 border-rose-100">
                               {ticket.status}
                            </span>
                            
                            <div className="text-gray-400 animate-none">
                               <ChevronRight className={`w-4 h-4 transition-transform duration-250 ${isExpanded ? 'rotate-90 text-black' : ''}`} />
                            </div>
                         </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-150 bg-white p-5 md:p-6 space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-left">
                              <div className="space-y-3.5">
                                 <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-900 border-b pb-1">Customer Profile Contact</h5>
                                 
                                 <div className="grid grid-cols-3 py-1 border-b border-gray-50">
                                    <span className="text-[9px] font-black text-gray-400 uppercase">Full Name</span>
                                    <span className="col-span-2 text-xs font-bold text-gray-950 uppercase">{ticket.fullName}</span>
                                 </div>
                                 <div className="grid grid-cols-3 py-1 border-b border-gray-50">
                                    <span className="text-[9px] font-black text-gray-400 uppercase">Mobile</span>
                                    <span className="col-span-2 text-xs font-mono font-bold text-gray-950">{ticket.phoneNumber}</span>
                                 </div>
                                 <div className="grid grid-cols-3 py-1 border-b border-gray-50">
                                    <span className="text-[9px] font-black text-gray-400 uppercase">Email</span>
                                    <span className="col-span-2 text-xs font-bold text-gray-800 lowercase">{ticket.email || "No Information"}</span>
                                 </div>
                                 <div className="grid grid-cols-3 py-1 border-b border-gray-50">
                                    <span className="text-[9px] font-black text-gray-400 uppercase">Address</span>
                                    <span className="col-span-2 text-xs font-medium text-gray-800 uppercase leading-snug">{ticket.address || "No Information"}</span>
                                 </div>
                              </div>

                              <div className="space-y-3.5">
                                 <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-900 border-b pb-1">Refund & Context Information</h5>
                                 
                                 <div className="grid grid-cols-3 py-1 border-b border-gray-50">
                                    <span className="text-[9px] font-black text-gray-400 uppercase">Order Ref</span>
                                    <span className="col-span-2 text-xs font-mono font-bold text-gray-900 uppercase">#{ticket.orderId || "No Information"}</span>
                                 </div>
                                 <div className="grid grid-cols-3 py-1 border-b border-gray-50">
                                    <span className="text-[9px] font-black text-gray-400 uppercase">Category</span>
                                    <span className="col-span-2 text-xs font-bold text-gray-950 uppercase">{ticket.category || "No Information"}</span>
                                 </div>
                                 <div className="grid grid-cols-3 py-1">
                                    <span className="text-[9px] font-black text-gray-400 uppercase">Problem Text</span>
                                    <div className="col-span-2 text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 p-3 rounded-xl leading-relaxed whitespace-pre-wrap select-text">
                                       {ticket.message}
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-5 space-y-4 text-left">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
                                 <div>
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Modify Ticket Status</h5>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Toggle and sync ticket complaint progress</p>
                                 </div>
                                 <span className="text-[10px] font-bold text-gray-500">Currently: <strong className="text-black uppercase underline">{ticket.status}</strong></span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                 {(['Pending', 'Under Review', 'Approved', 'Closed'] as const).map(st => {
                                   const isSelected = ticket.status === st;
                                   return (
                                     <button
                                       type="button"
                                       key={st}
                                       onClick={() => {
                                          updateTicketStatus(ticket.id, st);
                                       }}
                                       className={`py-2 px-3 text-[9px] font-black uppercase transition-all rounded-lg border text-center ${
                                         isSelected 
                                           ? 'bg-black text-white border-black shadow-xs' 
                                           : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                                       }`}
                                     >
                                        {st}
                                     </button>
                                   );
                                 })}
                              </div>

                              <div className="flex justify-end pt-2 border-t border-gray-200">
                                 <button
                                   type="button"
                                   onClick={() => {
                                      if (confirm('Are you sure you want to delete this support complaint ticket?')) {
                                         deleteTicket(ticket.id);
                                      }
                                   }}
                                   className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors border border-red-100"
                                 >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete Ticket
                                 </button>
                              </div>
                           </div>
                        </div>
                      )}
                    </div>
                  );
                })}
             </div>
           )}
        </div>
      )}

      {/* SUPPORT SETTINGS EDITOR TAB SECTION */}

      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-gray-200 p-6 md:p-8 rounded-2xl shadow-xs space-y-6">
           <div className="border-b border-gray-150 pb-4 flex justify-between items-center text-left">
              <div>
                 <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Configuration Portal</h3>
                 <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Configure live hotlines, links, and instant AI auto greetings</p>
              </div>
              <Settings className="w-5 h-5 text-gray-500 animate-spin-slow" />
           </div>

           {settingsSaved && (
             <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3.5 rounded-xl text-[9.5px] font-black uppercase tracking-wider text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4 shadow-xs" /> System synced & updated successfully!
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Support Email Portal</label>
                 <input 
                   type="email"
                   value={supportEmail}
                   onChange={e => setSupportEmail(e.target.value)}
                   className="w-full px-3.5 py-2.5 bg-white border border-gray-200 text-xs font-bold rounded-xl focus:outline-none focus:border-black"
                 />
              </div>

              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">WhatsApp Hot Line</label>
                 <input 
                   type="text"
                   value={whatsappNumber}
                   onChange={e => setWhatsappNumber(e.target.value)}
                   className="w-full px-3.5 py-2.5 bg-white border border-gray-200 text-xs font-bold rounded-xl focus:outline-none focus:border-black"
                 />
              </div>

              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Messenger Link API</label>
                 <input 
                   type="text"
                   value={messengerLink}
                   onChange={e => setMessengerLink(e.target.value)}
                   className="w-full px-3.5 py-2.5 bg-white border border-gray-200 text-xs font-bold rounded-xl focus:outline-none focus:border-black"
                 />
              </div>

              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Telegram Invite Code</label>
                 <input 
                   type="text"
                   value={telegramLink}
                   onChange={e => setTelegramLink(e.target.value)}
                   className="w-full px-3.5 py-2.5 bg-white border border-gray-200 text-xs font-bold rounded-xl focus:outline-none focus:border-black"
                 />
              </div>

              <div className="space-y-1 col-span-1 md:col-span-2">
                 <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Primary Voice Hotline</label>
                 <input 
                   type="text"
                   value={callNumber}
                   onChange={e => setCallNumber(e.target.value)}
                   className="w-full px-3.5 py-2.5 bg-white border border-gray-200 text-xs font-bold rounded-xl focus:outline-none focus:border-black"
                 />
              </div>
           </div>

           <div className="space-y-1 pt-3 text-left">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">First-text Auto Reply (Triggers synchronously)</label>
              <textarea 
                rows={3}
                value={autoReplyMessage}
                onChange={e => setAutoReplyMessage(e.target.value)}
                className="w-full p-3.5 bg-white border border-gray-200 text-xs font-bold rounded-xl focus:outline-none focus:border-black leading-relaxed"
              />
           </div>

           <div className="space-y-1 text-left">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Welcome Greetings Message Template</label>
              <textarea 
                rows={3}
                value={welcomeMessage}
                onChange={e => setWelcomeMessage(e.target.value)}
                className="w-full p-3.5 bg-white border border-gray-200 text-xs font-bold rounded-xl focus:outline-none focus:border-black leading-relaxed"
              />
           </div>

           <div className="pt-2 text-left">
              <button 
                type="submit"
                className="px-6 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all rounded-xl shadow-md"
              >
                 Save Settings Integration
              </button>
           </div>
        </form>
      )}

      {/* Customer Detailed Features Modal Overlay */}
      {activeModalView && currentChat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-zinc-900 px-6 py-4 flex justify-between items-center text-white">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                     {activeModalView === 'addresses' && <MapIcon className="w-5 h-5 text-blue-400" />}
                     {activeModalView === 'tickets' && <AlertCircle className="w-5 h-5 text-amber-400" />}
                     {activeModalView === 'activity' && <History className="w-5 h-5 text-emerald-400" />}
                     {activeModalView === 'block' && <ShieldAlert className="w-5 h-5 text-rose-400" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider">
                      {activeModalView === 'addresses' && 'Address Management'}
                      {activeModalView === 'tickets' && 'Support Ticket History'}
                      {activeModalView === 'activity' && 'User Activity Timeline'}
                      {activeModalView === 'block' && 'Security: Account Access'}
                    </h3>
                    <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-black">
                      Customer: {getCustomerForSession(currentChat)?.name || currentChat.customerName}
                    </p>
                  </div>
               </div>
               <button 
                 onClick={() => setActiveModalView(null)}
                 className="w-8 h-8 flex items-center justify-center hover:bg-zinc-800 rounded-full transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>

            {/* Content Area */}
            <div className="p-6 max-h-[70vh] overflow-y-auto no-scrollbar">
               {activeModalView === 'addresses' && (
                 <div className="space-y-4">
                    {(() => {
                       const customer = getCustomerForSession(currentChat);
                       const addresses = [
                         { type: 'Home Address', icon: <Home className="w-4 h-4" />, address: customer?.address ? `${customer.address.street}, ${customer.address.area}, ${customer.address.city}` : 'No Home Address Set', default: true },
                         { type: 'Office Address', icon: <Building2 className="w-4 h-4" />, address: 'Level 4, Navana Tower, Gulshan-1, Dhaka', default: false },
                         { type: 'Delivery Address', icon: <Truck className="w-4 h-4" />, address: 'Apt 4B, House 12, Road 4, Banani, Dhaka', default: false }
                       ];
                       
                       return addresses.map((addr, idx) => (
                         <div key={idx} className="p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-3">
                               <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-500 group-hover:bg-black group-hover:text-white transition-colors">
                                     {addr.icon}
                                  </div>
                                  <div>
                                     <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-900">{addr.type}</h4>
                                     {addr.default && <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Default</span>}
                                  </div>
                               </div>
                               <div className="flex gap-2">
                                  <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-black transition-colors" title="Copy Address">
                                     <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-black transition-colors" title="View on Map">
                                     <MapIcon className="w-3.5 h-3.5" />
                                  </button>
                               </div>
                            </div>
                            <p className="text-[12px] font-bold text-zinc-600 leading-relaxed px-1">
                              {addr.address}
                            </p>
                            <div className="mt-4 pt-3 border-t border-dashed border-zinc-100 flex gap-2">
                               <button className="flex-1 h-9 bg-zinc-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all">Set Default</button>
                               <button className="flex-1 h-9 bg-zinc-50 text-zinc-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-100 border border-zinc-200 transition-all">Edit Details</button>
                            </div>
                         </div>
                       ));
                    })()}
                 </div>
               )}

               {activeModalView === 'tickets' && (
                 <div className="space-y-3">
                    {(() => {
                       const customer = getCustomerForSession(currentChat);
                       const customerTickets = tickets.filter(t => t.email === customer?.emails[0] || t.phoneNumber === currentChat.customerPhone);
                       
                       if (customerTickets.length === 0) {
                         return (
                           <div className="p-12 text-center space-y-3">
                              <AlertCircle className="w-12 h-12 text-zinc-200 mx-auto" />
                              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No support tickets found</p>
                           </div>
                         );
                       }

                       return customerTickets.map(ticket => (
                         <div key={ticket.id} className="p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm hover:border-black transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-2">
                               <div>
                                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">#{ticket.id}</span>
                                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-tight group-hover:text-purple-600 truncate max-w-[300px]">{ticket.subject}</h4>
                               </div>
                               <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                 ticket.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                 ticket.status === 'Solved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                 'bg-zinc-100 text-zinc-600 border-zinc-200'
                               }`}>
                                 {ticket.status}
                               </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 font-medium line-clamp-1 mb-3">{ticket.message}</p>
                            <div className="flex justify-between items-center bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                               <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                               <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-black text-zinc-900 uppercase">Category: {ticket.category}</span>
                                  <ChevronRight className="w-3 h-3 text-zinc-400" />
                               </div>
                            </div>
                         </div>
                       ));
                    })()}
                 </div>
               )}

               {activeModalView === 'activity' && (
                 <div className="space-y-8 py-4">
                    {(() => {
                       const customer = getCustomerForSession(currentChat);
                       const phone = currentChat.customerPhone.replace(/\s+/g, '');
                       const email = customer?.emails[0];
                       
                       // Filtered Data from Real Stores
                       const customerOrders = orders.filter(o => 
                         (email && o.email === email) || 
                         (o.mobileNumber?.replace(/\s+/g, '') === phone)
                       );
                       const customerTickets = tickets.filter(t => 
                         (email && t.email === email) || 
                         (t.phoneNumber === currentChat.customerPhone)
                       );
                       const customerMessagesCount = currentChat.messages.length;
                       const totalSpent = customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
                       
                       // Construct Activity Timeline
                       const timelineEvents = [
                         ...(customer?.createdAt ? [{
                           event: 'Account Registered',
                           timestamp: new Date(customer.createdAt),
                           icon: <User className="w-3 h-3" />,
                           color: 'bg-zinc-900',
                           type: 'System'
                         }] : []),
                         ...(customer?.lastLogin ? [{
                           event: 'Last System Login',
                           timestamp: new Date(customer.lastLogin),
                           icon: <TrendingUp className="w-3 h-3" />,
                           color: 'bg-emerald-500',
                           type: 'Security'
                         }] : []),
                         ...customerOrders.map(o => ({
                           event: `Order Placed: #${o.orderId}`,
                           timestamp: new Date(o.date),
                           icon: <ShoppingBag className="w-3 h-3" />,
                           color: 'bg-amber-500',
                           type: 'Commerce'
                         })),
                         ...customerTickets.map(t => ({
                           event: `Ticket Submitted: ${t.subject}`,
                           timestamp: new Date(t.createdAt),
                           icon: <AlertCircle className="w-3 h-3" />,
                           color: 'bg-purple-500',
                           type: 'Support'
                         })),
                         {
                           event: 'Live Support Chat Active',
                           timestamp: new Date(currentChat.lastMessageAt),
                           icon: <MessageSquare className="w-3 h-3" />,
                           color: 'bg-blue-500',
                           type: 'Chat'
                         }
                       ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

                       return (
                         <>
                            {/* Customer Information & Stats Summary */}
                            <div className="space-y-4 mb-6">
                               <div className="bg-zinc-900 rounded-3xl p-5 text-white shadow-xl">
                                  <div className="flex items-center gap-4 mb-4">
                                     <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-xl">👤</div>
                                     <div>
                                        <h3 className="text-sm font-black uppercase tracking-wider">{customer?.name || currentChat.customerName}</h3>
                                        <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">ID: {customer?.id || 'GUEST'}</p>
                                     </div>
                                     <div className="ml-auto text-right">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${customer?.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                                           {customer?.status || 'GUEST'}
                                        </span>
                                     </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 border-t border-zinc-800 pt-4">
                                     <div className="flex items-center gap-2">
                                        <Phone className="w-3 h-3 text-zinc-500" />
                                        <span className="text-[10px] font-bold text-zinc-300">{currentChat.customerPhone}</span>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <Mail className="w-3 h-3 text-zinc-500" />
                                        <span className="text-[10px] font-bold text-zinc-300 truncate">{email || 'No email set'}</span>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <History className="w-3 h-3 text-zinc-500" />
                                        <span className="text-[9px] font-black uppercase text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">Join: {customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}</span>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-zinc-500" />
                                        <span className="text-[9px] font-black uppercase text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">Login: {customer?.lastLogin ? new Date(customer.lastLogin).toLocaleDateString() : 'N/A'}</span>
                                     </div>
                                  </div>
                               </div>
                               
                               <div className="grid grid-cols-3 gap-3">
                                  <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 text-center shadow-sm">
                                     <span className="block text-[8px] font-black text-zinc-400 uppercase mb-1">Orders</span>
                                     <span className="text-lg font-black text-zinc-900">{customerOrders.length}</span>
                                  </div>
                                  <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 text-center shadow-sm">
                                     <span className="block text-[8px] font-black text-zinc-400 uppercase mb-1">Spent</span>
                                     <span className="text-lg font-black text-emerald-600">৳{totalSpent.toLocaleString()}</span>
                                  </div>
                                  <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 text-center shadow-sm">
                                     <span className="block text-[8px] font-black text-zinc-400 uppercase mb-1">Tickets</span>
                                     <span className="text-lg font-black text-amber-600">{customerTickets.length}</span>
                                  </div>
                               </div>
                            </div>

                            {/* Timeline Feed */}
                            <div className="relative space-y-6 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-zinc-100">
                               {timelineEvents.map((item, idx) => (
                                 <div key={idx} className="relative pl-10">
                                    <div className={`absolute left-0 w-7 h-7 rounded-full ${item.color} text-white flex items-center justify-center z-10 border-4 border-white shadow-sm transition-transform hover:scale-110`}>
                                       {item.icon}
                                    </div>
                                    <div className={`p-3 bg-white border border-zinc-100 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] group hover:bg-zinc-50 transition-colors border-l-4 ${item.color.replace('bg-', 'border-')}`}>
                                       <div className="flex justify-between items-start mb-1">
                                          <h4 className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">{item.event}</h4>
                                          <span className="text-[9px] font-black text-zinc-400 uppercase">
                                            {item.timestamp.toLocaleDateString() === new Date().toLocaleDateString() ? 'Today' : item.timestamp.toLocaleDateString()}
                                          </span>
                                       </div>
                                       <div className="flex justify-between items-center">
                                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </p>
                                          <span className="text-[8px] font-black text-zinc-300 uppercase tracking-tight bg-zinc-100/50 px-1.5 py-0.5 rounded">{item.type}</span>
                                       </div>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </>
                       );
                    })()}
                 </div>
               )}

               {activeModalView === 'block' && (
                 <div className="text-center space-y-6 py-8">
                    <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl mx-auto flex items-center justify-center border border-rose-100 shadow-inner group">
                       <Ban className="w-10 h-10 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Are you absolutely sure?</h3>
                       <p className="text-sm font-bold text-zinc-500 leading-relaxed max-w-sm mx-auto">
                          Blocking this customer will instantly terminate their current session and prevent them from placing any future orders or starting new chats.
                       </p>
                    </div>

                    <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 text-left space-y-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Reason for Restriction</label>
                          <select className="w-full h-11 bg-white border border-zinc-200 rounded-xl px-4 text-xs font-bold uppercase focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none">
                             <option>Spamming Support Inbox</option>
                             <option>Fraudulent Transaction Attempt</option>
                             <option>Policy Violation & Abuse</option>
                             <option>Other / Administrative Request</option>
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Additional Notes</label>
                          <textarea className="w-full p-4 bg-white border border-zinc-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none" rows={3} placeholder="Provide internal details for other admins..." />
                       </div>
                    </div>
                 </div>
               )}
            </div>

            {/* Footer Button Row */}
            <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
               {activeModalView === 'block' ? (
                 <>
                   <button 
                     onClick={() => setActiveModalView(null)}
                     className="px-8 h-12 bg-white text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all border border-zinc-200 shadow-sm"
                   >
                     Cancel Action
                   </button>
                   <button 
                     onClick={() => {
                       solveSession(currentChat.id); // Also solves session
                       setActiveModalView(null);
                       alert('Customer account has been successfully restricted.');
                     }}
                     className="px-8 h-12 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg active:scale-95"
                   >
                     Confirm Block
                   </button>
                 </>
               ) : (
                 <button 
                   onClick={() => setActiveModalView(null)}
                   className="px-12 h-12 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-sm active:scale-95"
                 >
                   Dismiss View
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
