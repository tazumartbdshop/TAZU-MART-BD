import React, { useState, useRef, useEffect } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { useSupportStore, ChatSession, SupportTicket } from '../../store/useSupportStore';

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

  const [activeTab, setActiveTab] = useState<'chats' | 'tickets' | 'settings'>('chats');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  
  // Settings Form state
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [messengerLink, setMessengerLink] = useState(settings.messengerLink);
  const [telegramLink, setTelegramLink] = useState(settings.telegramLink);
  const [callNumber, setCallNumber] = useState(settings.callNumber);
  const [autoReplyMessage, setAutoReplyMessage] = useState(settings.autoReplyMessage);
  const [welcomeMessage, setWelcomeMessage] = useState(settings.welcomeMessage);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // File states for replies
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [replyFile, setReplyFile] = useState<{ name: string; url: string } | null>(null);

  const replyImageRef = useRef<HTMLInputElement>(null);
  const replyFileRef = useRef<HTMLInputElement>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Sync settings when they update in store
  useEffect(() => {
    setSupportEmail(settings.supportEmail);
    setWhatsappNumber(settings.whatsappNumber);
    setMessengerLink(settings.messengerLink);
    setTelegramLink(settings.telegramLink);
    setCallNumber(settings.callNumber);
    setAutoReplyMessage(settings.autoReplyMessage);
    setWelcomeMessage(settings.welcomeMessage);
  }, [settings]);

  // Find currently active chat
  const currentChat = sessions.find(s => s.id === activeSessionId);

  // Auto scroll to bottom of active chat
  useEffect(() => {
    if (currentChat) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentChat?.messages]);

  // Admin reply handler
  const handleAdminSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSessionId) return;
    if (!replyInput.trim() && !replyImage && !replyFile) return;

    // Simulate real-time typing stop
    setTypingIndicator(activeSessionId, true);
    
    setTimeout(() => {
      sendMessageToSession(
        activeSessionId, 
        'admin', 
        replyInput.trim() || undefined,
        replyImage || undefined,
        replyFile?.url || undefined,
        replyFile?.name || undefined
      );
      setTypingIndicator(activeSessionId, false);
    }, 400);

    setReplyInput('');
    setReplyImage(null);
    setReplyFile(null);
  };

  const handleReplyImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setReplyImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReplyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReplyFile({
        name: file.name,
        url: URL.createObjectURL(file)
      });
    }
  };

  // Settings Save handler
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

  const getUnreadCount = (session: ChatSession) => {
    return session.messages.filter(m => m.sender === 'customer' && !m.seen).length;
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100/80 text-amber-900 border-amber-200';
      case 'In Review':
      case 'Under Review': return 'bg-sky-100/80 text-sky-900 border-sky-200';
      case 'Solved':
      case 'Approved': return 'bg-emerald-100/80 text-emerald-900 border-emerald-200';
      case 'Closed': return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Top action block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-5">
         <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">Support Control Center</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-tight mt-1">Manage core customer communications, live threads, & feedback loops</p>
         </div>

         {/* Admin Control tabs */}
         <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('chats')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'chats' ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
               Live Chats ({sessions.length})
            </button>
            <button 
              onClick={() => setActiveTab('tickets')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'tickets' ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
               Tickets ({tickets.length})
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'settings' ? 'bg-black text-white font-black' : 'text-gray-500 hover:text-gray-900'}`}
            >
               Settings
            </button>
         </div>
      </div>

      {activeTab === 'chats' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
           
           {/* Sessions Sidebar Column (Left) */}
           <div className="lg:col-span-4 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm space-y-4 p-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 border-b pb-2 mb-2">Customer Threads</h3>
              
              <div className="space-y-2 max-h-[550px] overflow-y-auto custom-scrollbar">
                 {sessions.length === 0 ? (
                   <p className="text-center py-8 text-[11px] text-gray-400 uppercase font-black">No active chat sessions</p>
                 ) : (
                   sessions.map(session => {
                     const isSelected = session.id === activeSessionId;
                     const unread = getUnreadCount(session);
                     const lastMsg = session.messages[session.messages.length - 1];

                     return (
                       <button
                         key={session.id}
                         onClick={() => setActiveSession(session.id)}
                         className={`w-full text-left p-3.5 border transition-all rounded-xl relative flex flex-col gap-2 ${isSelected ? 'bg-purple-50 border-purple-400 text-purple-950' : 'bg-gray-50 hover:bg-gray-100 border-[#EEEEEE]'}`}
                       >
                          <div className="flex justify-between items-center w-full">
                             <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${session.customerOnline ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                <h4 className="text-[11px] font-black uppercase tracking-wide truncate max-w-[150px]">{session.customerName}</h4>
                             </div>
                             
                             {unread > 0 && (
                               <span className="bg-red-500 text-white text-[9px] font-black rounded-lg px-2 py-0.5 animate-pulse">
                                  {unread} NEW
                               </span>
                             )}
                          </div>

                          <p className="text-[10px] font-mono font-bold text-gray-400 uppercase">{session.customerPhone}</p>

                          {lastMsg && (
                            <p className="text-[10px] text-gray-500 truncate leading-tight mt-1 capitalize">
                               {lastMsg.sender === 'admin' ? 'Admin: ' : 'User: '} {lastMsg.text || '📄 Atachment'}
                            </p>
                          )}

                          <div className="flex justify-between items-center text-[8px] font-bold text-gray-400 border-t border-black/5 pt-1.5">
                             <span>ID: {session.id}</span>
                             <span className="uppercase text-purple-600 font-extrabold">{session.status}</span>
                          </div>
                       </button>
                     );
                   })
                 )}
              </div>
           </div>

           {/* ACTIVE CHAT MAIN AREA (Right) */}
           <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[650px]">
              
              {currentChat ? (
                <div className="flex flex-col h-full bg-white">
                   
                   {/* ACTION TOP BAR */}
                   <div className="px-5 py-4 bg-white border-b border-gray-150 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-left">
                         <div className="relative">
                            <div className="w-10 h-10 uppercase bg-zinc-100 text-zinc-800 font-extrabold text-xs flex items-center justify-center rounded-full border border-zinc-200">
                               {currentChat.customerName.slice(0, 2)}
                            </div>
                            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${currentChat.customerOnline ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                         </div>
                         <div>
                            <div className="flex items-center gap-1.5">
                               <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900">{currentChat.customerName}</h4>
                               <span className={`text-[8px] font-extrabold tracking-widest uppercase px-1.5 py-0.5 rounded ${currentChat.customerOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                                  {currentChat.customerOnline ? 'Online' : 'Offline'}
                               </span>
                            </div>
                            <p className="text-[9px] text-gray-400 font-mono mt-0.5 uppercase tracking-wide">ID: {currentChat.id} • Mobile: {currentChat.customerPhone}</p>
                         </div>
                      </div>

                      {/* State Modifier Actions */}
                      <div className="flex items-center gap-1.5">
                         <button 
                           type="button"
                           onClick={() => solveSession(currentChat.id)}
                           className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all"
                         >
                            Mark Solved
                         </button>
                         <button 
                           type="button"
                           onClick={() => closeSession(currentChat.id)}
                           className="px-3 py-1.5 bg-red-50 border border-red-105 text-red-600 hover:bg-red-100 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all"
                         >
                            Close Ticket
                         </button>
                         <button 
                           type="button"
                           onClick={() => {
                              setActiveSession(null);
                           }}
                           className="text-gray-400 hover:text-black p-1 ml-1"
                         >
                            <X className="w-5 h-5" />
                         </button>
                      </div>
                   </div>

                   {/* MESSAGE WATERFALL */}
                   <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 custom-scrollbar space-y-4">
                      {currentChat.messages.map(msg => {
                        const isCustomer = msg.sender === 'customer';
                        return (
                          <div 
                            key={msg.id}
                            className={`flex ${isCustomer ? 'justify-start' : 'justify-end'} gap-2`}
                          >
                             <div className={`max-w-[75%] rounded-[18px] p-3.5 md:p-4 text-left shadow-sm relative transition-all duration-300 ${
                               isCustomer 
                                 ? 'bg-zinc-100 text-zinc-900 rounded-tl-sm border border-zinc-200/50' 
                                 : 'bg-zinc-900 text-white border border-zinc-950 rounded-tr-sm'
                             }`}>
                                
                                {/* Company Official branding block on Admin Message inside bubble */}
                                {!isCustomer && (
                                  <div className="flex items-center gap-1 text-[8px] text-zinc-400 font-extrabold tracking-widest uppercase border-b border-zinc-800 pb-1 mt-0 mb-1.5 whitespace-nowrap">
                                     <span className="w-3.5 h-3.5 bg-purple-600 text-white font-serif rounded-full flex items-center justify-center text-[7px] font-black shrink-0">T</span>
                                     <span className="font-sans">TAZU MART BD</span>
                                     <span className="text-[6.5px] bg-purple-950 text-purple-300 border border-purple-800/40 px-1 py-0.2 rounded font-black uppercase ml-auto">Official Support</span>
                                  </div>
                                )}
                                {msg.text && <p className="text-[11px] leading-relaxed">{msg.text}</p>}

                                {msg.imageUrl && (
                                  <div className="rounded-lg overflow-hidden border border-black/10 max-h-48 mt-2">
                                     <img src={msg.imageUrl} alt="attachment-admin" className="object-cover max-h-48 w-full" referrerPolicy="no-referrer" />
                                  </div>
                                )}

                                {msg.fileUrl && (
                                  <div className="flex items-center gap-2 p-2 bg-black/15 rounded-lg text-[9px] uppercase font-bold tracking-tight">
                                     <Paperclip className="w-3.5 h-3.5 shrink-0" />
                                     <span className="truncate max-w-[150px]">{msg.fileName || 'file'}</span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between text-[8px] opacity-60 font-black tracking-widest pt-1.5 border-t border-black/5 mt-1">
                                   <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                                   
                                   <div className="flex items-center gap-0.5 ml-3">
                                      {(msg.deliveryStatus || (msg.seen ? 'seen' : 'delivered')) === 'sending' && (
                                        <span className="text-zinc-500 font-bold italic animate-pulse">Sending...</span>
                                      )}
                                      {(msg.deliveryStatus || (msg.seen ? 'seen' : 'delivered')) === 'sent' && (
                                        <span className="text-zinc-500 font-bold">Sent ✓</span>
                                      )}
                                      {(msg.deliveryStatus || (msg.seen ? 'seen' : 'delivered')) === 'delivered' && (
                                        <span className="text-zinc-500 font-bold">Delivered ✓✓</span>
                                      )}
                                      {(msg.deliveryStatus || (msg.seen ? 'seen' : 'delivered')) === 'seen' && (
                                        <span className="text-sky-400 font-extrabold">Seen ✓✓</span>
                                      )}
                                   </div>
                                </div>
                             </div>
                          </div>
                        );
                      })}
                      {currentChat.isTyping && (
                        <div className="flex justify-start">
                           <div className="bg-zinc-100 border border-zinc-200 text-zinc-500 py-2.5 px-4 rounded-[18px] rounded-tl-sm text-[10px] font-bold animate-pulse">
                               Customer is typing a response...
                           </div>
                        </div>
                      )}
                      
                      <div ref={chatMessagesEndRef} />
                   </div>

                   {/* ATTACHMENT TEMP HOLDER */}
                   {(replyImage || replyFile) && (
                     <div className="px-6 py-2.5 bg-gray-100 border-t border-gray-200 flex items-center justify-between text-xs font-bold uppercase tracking-tight">
                        <div className="flex items-center gap-2">
                           {replyImage ? (
                             <>
                                <span className="text-purple-600">★ Image Attachment Ready</span>
                                <button onClick={() => setReplyImage(null)} className="text-red-500 ml-2">Remove</button>
                             </>
                           ) : (
                             <>
                                <span className="text-blue-600">★ Document Ready: {replyFile?.name}</span>
                                <button onClick={() => setReplyFile(null)} className="text-red-500 ml-2">Remove</button>
                             </>
                           )}
                        </div>
                     </div>
                   )}

                   {/* ADMIN CONTROLLER MESSAGE BAR */}
                   <form onSubmit={handleAdminSendReply} className="p-4 border-t border-gray-100 bg-white flex items-center gap-3">
                      
                      <input 
                        type="file" 
                        accept="image/*"
                        ref={replyImageRef}
                        onChange={handleReplyImageChange}
                        className="hidden" 
                      />
                      <input 
                        type="file" 
                        ref={replyFileRef}
                        onChange={handleReplyFileChange}
                        className="hidden" 
                      />

                      <div className="flex gap-1.5 shrink-0">
                         <button 
                           type="button" 
                           onClick={() => replyImageRef.current?.click()}
                           className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                         >
                            <ImageIcon className="w-4 h-4 text-gray-500" />
                         </button>
                         <button 
                           type="button" 
                           onClick={() => replyFileRef.current?.click()}
                           className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                         >
                            <Paperclip className="w-4 h-4 text-gray-500" />
                         </button>
                      </div>

                      <input 
                        type="text"
                        value={replyInput}
                        onChange={e => setReplyInput(e.target.value)}
                        placeholder={`Write reply to ${currentChat.customerName}...`}
                        className="flex-1 bg-gray-50 border border-gray-100 px-4 py-3 text-[11px] font-bold uppercase tracking-wide focus:outline-none focus:bg-white focus:border-purple-600"
                      />

                      <button 
                        type="submit"
                        className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-neutral-800 transition-all shadow shrink-0"
                      >
                         <Send className="w-4 h-4" />
                      </button>
                   </form>

                </div>
              ) : (
                <div className="flex-grow flex flex-col justify-center items-center p-8 space-y-4 text-center">
                   <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-7 h-7" />
                   </div>
                   <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">No Session Selected</h3>
                      <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Please select an ongoing chat session from left dashboard panel to start assisting customers</p>
                   </div>
                </div>
              )}

           </div>

        </div>
      )}

      {/* FORMAL TICKET REGISTRY VIEW / SECTION 6 */}
      {activeTab === 'tickets' && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
           <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Internal Complaints & Tickets</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-black text-white font-extrabold uppercase">{tickets.length} Registered</span>
           </div>

           {tickets.length === 0 ? (
             <div className="p-12 text-center text-gray-400 space-y-2 uppercase">
                <FileText className="w-8 h-8 mx-auto opacity-30 text-purple-400" />
                <p className="text-[11px] font-black tracking-widest">No support tickets found</p>
             </div>
           ) : (
             <div className="p-4 md:p-6 space-y-4 max-w-full overflow-hidden">
                {tickets.map(ticket => {
                  const isExpanded = expandedTicketId === ticket.id;
                  
                  return (
                    <div 
                      key={ticket.id} 
                      className={`border rounded-2xl transition-all duration-200 bg-white ${
                        isExpanded ? 'border-black ring-1 ring-black shadow-md' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50/40'
                      }`}
                    >
                      {/* Compact List Item Header Button (Clickable) */}
                      <button
                        type="button"
                        onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                        className="w-full text-left p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                             <span className="font-mono text-[9px] text-gray-500 uppercase font-black tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                               #{ticket.id}
                             </span>
                             <span className="text-[10px] text-gray-400 font-bold uppercase">
                                {new Date(ticket.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                             </span>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 pt-1">
                             <h4 className="text-sm font-black uppercase tracking-tight text-gray-900 shrink-0">
                                {ticket.fullName}
                             </h4>
                             <span className="text-gray-400 hidden sm:inline">•</span>
                             <p className="text-xs text-gray-500 font-bold uppercase truncate">
                                {ticket.subject}
                             </p>
                          </div>
                        </div>

                        {/* Status Pin and Chevron */}
                        <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-dashed border-gray-100">
                          <div className="flex flex-col items-start md:items-end gap-1">
                            <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest block">Refund Status</span>
                            <span className={`inline-block text-[10px] font-black border px-2.5 py-0.5 rounded-lg ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </div>
                          
                          <div className="text-gray-400">
                            <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-black' : ''}`} />
                          </div>
                        </div>
                      </button>

                      {/* Expandable Details Container (Accordion system) */}
                      <div 
                        className={`transition-all duration-300 ease-in-out border-t border-gray-100 overflow-hidden ${
                          isExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                        }`}
                      >
                        <div className="p-5 md:p-6 bg-gray-50/50 space-y-6">
                           
                           {/* Serial-wise Expanded Details */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                             
                             <div className="space-y-4">
                                <div className="space-y-0.5">
                                   <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">• Full Name</span>
                                   <p className="text-sm font-black text-gray-950 uppercase">{ticket.fullName}</p>
                                </div>
                                <div className="space-y-0.5">
                                   <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">• Mobile Number</span>
                                   <p className="text-sm font-mono font-black text-gray-950">{ticket.phoneNumber}</p>
                                </div>
                                <div className="space-y-0.5">
                                   <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">• Full Address</span>
                                   <p className="text-sm font-bold text-gray-800 uppercase leading-snug">{ticket.address || "No Information"}</p>
                                </div>
                                <div className="space-y-0.5">
                                   <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">• Email Address</span>
                                   <p className="text-sm font-bold text-gray-800 lowercase">{ticket.email || "No Information"}</p>
                                </div>
                             </div>

                             <div className="space-y-4">
                                <div className="space-y-0.5">
                                   <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">• Order ID</span>
                                   <p className="text-sm font-mono font-black text-neutral-800 uppercase">{ticket.orderId || "No Information"}</p>
                                </div>
                                <div className="space-y-0.5">
                                   <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">• Refund Reason</span>
                                   <p className="text-sm font-black text-gray-950 uppercase">{ticket.category || "No Information"}</p>
                                </div>
                                <div className="space-y-0.5">
                                   <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">• Attached Message/Complaint</span>
                                   <p className="text-sm font-medium text-gray-700 bg-white border border-gray-100 p-3 rounded-lg leading-relaxed select-text shadow-sm">
                                      {ticket.message}
                                   </p>
                                </div>
                                <div className="space-y-0.5">
                                   <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">• Order Reference</span>
                                   <p className="text-sm font-mono font-black text-neutral-800 uppercase">{ticket.orderId || "No Information"}</p>
                                </div>
                             </div>

                           </div>

                           {/* Status Custom Box */}
                           <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                                 <div>
                                    <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Refund Request Status Box</h5>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Change refund request state immediately</p>
                                 </div>
                                 <span className="text-[10px] font-bold text-gray-400">Current Status: <strong className="text-black uppercase">{ticket.status}</strong></span>
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
                                       className={`py-2.5 px-3 text-[10px] font-black uppercase transition-all rounded-lg border text-center ${
                                         isSelected 
                                           ? 'bg-black text-white border-black shadow-sm ring-1 ring-black' 
                                           : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                                       }`}
                                     >
                                        {st}
                                     </button>
                                   );
                                 })}
                              </div>

                              <div className="flex justify-end pt-2 border-t border-gray-100/80">
                                 <button
                                   type="button"
                                   onClick={() => {
                                      if (confirm('Are you sure you want to delete this support ticket?')) {
                                         deleteTicket(ticket.id);
                                      }
                                   }}
                                   className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors"
                                 >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete Ticket
                                 </button>
                              </div>
                           </div>

                        </div>
                      </div>

                    </div>
                  );
                })}
             </div>
           )}
        </div>
      )}

      {/* SUPPORT SETTINGS EDITOR / SECTION 10 */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm space-y-6">
           <div className="border-b border-gray-100 pb-4 flex justify-between items-center">
              <div>
                 <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Support System configuration</h3>
                 <p className="text-xs text-gray-400 font-bold uppercase mt-1">Setup default contact links, phone hotlines, and instant auto replays</p>
              </div>
              <Settings className="w-5 h-5 text-purple-600 animate-spin-slow" />
           </div>

           {settingsSaved && (
             <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-xl text-xs font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Settings Updated Successfully! Sync complete.
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Support Email Portal</label>
                 <input 
                   type="email"
                   value={supportEmail}
                   onChange={e => setSupportEmail(e.target.value)}
                   className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-[11px] font-bold rounded focus:outline-none focus:border-purple-600"
                 />
              </div>

              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">WhatsApp Hot Number</label>
                 <input 
                   type="text"
                   value={whatsappNumber}
                   onChange={e => setWhatsappNumber(e.target.value)}
                   className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-[11px] font-bold rounded focus:outline-none focus:border-purple-600"
                 />
              </div>

              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Messenger Chat URL Link</label>
                 <input 
                   type="text"
                   value={messengerLink}
                   onChange={e => setMessengerLink(e.target.value)}
                   className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-[11px] font-bold rounded focus:outline-none focus:border-purple-600"
                 />
              </div>

              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Telegram Invite Code / Link</label>
                 <input 
                   type="text"
                   value={telegramLink}
                   onChange={e => setTelegramLink(e.target.value)}
                   className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-[11px] font-bold rounded focus:outline-none focus:border-purple-600"
                 />
              </div>

              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Hotline Dial Number</label>
                 <input 
                   type="text"
                   value={callNumber}
                   onChange={e => setCallNumber(e.target.value)}
                   className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-[11px] font-bold rounded focus:outline-none focus:border-purple-600"
                 />
              </div>

           </div>

           <div className="space-y-1.5 pt-4">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Auto reply Message template (Triggers on first text)</label>
              <textarea 
                rows={3}
                value={autoReplyMessage}
                onChange={e => setAutoReplyMessage(e.target.value)}
                className="w-full p-4 bg-white border border-[#EEEEEE] text-[11px] font-bold rounded focus:outline-none focus:border-purple-600"
              />
           </div>

           <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Initial greetings Welcome message (Sent when chat starts)</label>
              <textarea 
                rows={3}
                value={welcomeMessage}
                onChange={e => setWelcomeMessage(e.target.value)}
                className="w-full p-4 bg-white border border-[#EEEEEE] text-[11px] font-bold rounded focus:outline-none focus:border-purple-600"
              />
           </div>

           <div className="pt-4">
              <button 
                type="submit"
                className="px-8 py-3.5 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-md shadow-purple-950/20"
              >
                 Save Settings Configuration
              </button>
           </div>
        </form>
      )}

    </div>
  );
}
