import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  category: string;
  details: string;
  attachmentUrl?: string;
  attachmentName?: string;
  status: 'Open' | 'Pending' | 'In Review' | 'Resolved' | 'Closed';
  createdAt: string;
  updatedAt?: string;
  customerUid?: string;
}

export interface Broadcast {
  id: string;
  type: 'text' | 'image' | 'banner' | 'product' | 'offer' | 'coupon' | 'poll' | 'video' | 'category' | 'custom_campaign';
  title: string;
  content: string;
  audience: 'all' | 'new' | 'vip' | 'active' | 'returning' | 'premium' | 'selected';
  pinned: boolean;
  createdAt: string;
  imageUrl?: string;
  productId?: string;
  productName?: string;
  productPrice?: number;
  productDiscount?: number;
  categoryName?: string;
  offerPercentage?: number;
  ctaText?: string;
  ctaLink?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  startDate?: string;
  endDate?: string;
  status?: 'draft' | 'active' | 'scheduled' | 'expired';
  opensCount?: number;
  clicksCount?: number;
  sentCount?: number;
  likesCount?: number;
  supportsCount?: number;
  viewsCount?: number;
  productClicks?: number;
  categoryClicks?: number;
  campaignClicks?: number;
  purchasesCount?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'admin';
  text?: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  timestamp: string;
  seen: boolean;
  deliveryStatus?: 'sending' | 'sent' | 'delivered' | 'seen';
}

export interface ChatSession {
  id: string;
  customerUid?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAvatar?: string;
  customerOnline: boolean;
  isTyping?: boolean;
  lastMessageAt: string;
  lastMessageText?: string;
  unreadCount?: number;
  messages: ChatMessage[];
  status: 'open' | 'pending' | 'solved' | 'closed';
  ticketNumber?: string;
  assignedModerator?: string;
  isBlocked?: boolean;
  internalNotes?: string;
}

export interface SupportSettings {
  supportEmail: string;
  whatsappNumber: string;
  messengerLink: string;
  telegramLink: string;
  callNumber: string;
  autoReplyMessage: string;
  welcomeMessage: string;
}

interface SupportState {
  tickets: SupportTicket[];
  sessions: ChatSession[];
  broadcasts: Broadcast[];
  settings: SupportSettings;
  activeSessionId: string | null;
  currentCustomerSessionId: string; // The session ID representing the current browser customer
  blockedPhones: string[]; // Track globally blocked phone numbers
  isLoaded: boolean;

  // Actions
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'status' | 'createdAt'>) => Promise<string>;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
  deleteTicket: (ticketId: string) => void;
  subscribeTickets: () => () => void;
  
  addBroadcast: (broadcast: Omit<Broadcast, 'id' | 'createdAt'>) => void;
  deleteBroadcast: (broadcastId: string) => void;
  pinBroadcast: (broadcastId: string) => void;

  // Active session selector
  setActiveSession: (sessionId: string | null) => void;
  
  // Send Messages
  sendMessageToSession: (sessionId: string, sender: 'customer' | 'admin', text?: string, imageUrl?: string, fileUrl?: string, fileName?: string) => void;
  setTypingIndicator: (sessionId: string, isTyping: boolean) => void;
  setSeenStatus: (sessionId: string, sender: 'customer' | 'admin') => void;
  closeSession: (sessionId: string) => void;
  solveSession: (sessionId: string) => void;
  createNewSession: (name: string, phone: string, email?: string, avatar?: string, uid?: string) => string;

  // Advanced Support Desk Actions
  updateSessionNotes: (sessionId: string, notes: string) => void;
  assignSessionModerator: (sessionId: string, moderator: string) => void;
  updateSessionStatus: (sessionId: string, status: ChatSession['status']) => void;
  toggleBlockPhone: (phone: string, sessionId?: string) => void;

  // Real-time Listeners
  subscribeLiveSupport: () => () => void;
  subscribeMessages: (sessionId: string) => () => void;
  subscribeSettingsAndBroadcasts: () => () => void;

  // Settings Action
  updateSettings: (settings: Partial<SupportSettings>) => void;
}

const DEFAULT_SETTINGS: SupportSettings = {
  supportEmail: 'support@tazumartbd.com',
  whatsappNumber: '+8801711223344',
  messengerLink: 'https://m.me/tazumartbd',
  telegramLink: 'https://t.me/tazumartbd',
  callNumber: '+8801811223344',
  autoReplyMessage: 'Thanks for reaching out! A human support executive has been notified and will be here in a moment.',
  welcomeMessage: 'Hello and welcome to Tazu Mart Help Desk. Please type your query and we will assist you'
};

const SEED_SESSIONS: ChatSession[] = [];

const SEED_BROADCASTS: Broadcast[] = [
  {
    id: 'BC-1',
    type: 'text',
    title: '🔥 Flash Sale Started',
    content: 'Get up to 50% off on electronics!',
    audience: 'all',
    pinned: true,
    createdAt: new Date().toISOString()
  }
];

export const useSupportStore = create<SupportState>((set, get) => ({
  tickets: [],
  sessions: SEED_SESSIONS,
  broadcasts: SEED_BROADCASTS,
  settings: DEFAULT_SETTINGS,
  activeSessionId: null,
  currentCustomerSessionId: '',
  blockedPhones: [],
  isLoaded: false,

  subscribeSettingsAndBroadcasts: () => {
    const supabase = getSupabase();
    if (!supabase) return () => {};

    const loadSettings = async () => {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 'support_settings').limit(1);
      if (!error && data && data.length > 0) {
        set({ settings: { ...DEFAULT_SETTINGS, ...data[0].data } });
      } else if (!error && data && data.length === 0) {
        supabase.from('settings').upsert([{ id: 'support_settings', data: DEFAULT_SETTINGS }]).then(({error})=> error && console.warn(error));
      }
    };
    
    const loadBroadcasts = async () => {
       const { data, error } = await supabase.from('broadcasts').select('*').order('createdAt', { ascending: false });
       if (!error && data) {
           if (data.length === 0) {
              set({ broadcasts: SEED_BROADCASTS });
              supabase.from('broadcasts').upsert(SEED_BROADCASTS).then(({error})=> error && console.warn(error));
           } else {
              set({ broadcasts: data as Broadcast[] });
           }
       }
    };

    const loadBlockedPhones = async () => {
        const { data, error } = await supabase.from('settings').select('*').eq('id', 'blocked_phones').limit(1);
        if (!error && data && data.length > 0) {
            set({ blockedPhones: data[0].phones || [] });
        }
    };

    loadSettings();
    loadBroadcasts();
    loadBlockedPhones();

    const channel1 = supabase.channel('public:settings:support')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.support_settings' }, loadSettings)
        .subscribe();
        
    const channel2 = supabase.channel('public:broadcasts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'broadcasts' }, loadBroadcasts)
        .subscribe();
        
    const channel3 = supabase.channel('public:settings:blocked_phones')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.blocked_phones' }, loadBlockedPhones)
        .subscribe();

    set({ isLoaded: true });

    return () => {
       supabase.removeChannel(channel1);
       supabase.removeChannel(channel2);
       supabase.removeChannel(channel3);
    };
  },

  addTicket: async (ticketInput) => {
    const supabase = getSupabase();
    const ticketCounter = get().tickets.length + 1001;
    const ticketNumber = `TKT-${ticketCounter}`;
    const ticketId = `ticket-${Date.now()}`;
    const newTicket: SupportTicket = {
      ...ticketInput,
      id: ticketId,
      ticketNumber,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (supabase) {
        const { error } = await supabase.from('support_tickets').insert([newTicket]);
        if (error) throw error;
      }
      return ticketNumber;
    } catch (error) {
      console.error("Error adding ticket to Supabase:", error);
      throw error;
    }
  },

  updateTicketStatus: async (ticketId, status) => {
    const now = new Date().toISOString();
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('support_tickets').update({ status, updatedAt: now }).eq('id', ticketId);
    }
  },

  deleteTicket: async (ticketId) => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('support_tickets').delete().eq('id', ticketId);
    }
  },

  subscribeTickets: () => {
    const supabase = getSupabase();
    if (!supabase) return () => {};
    
    const loadTickets = async () => {
      const { data, error } = await supabase.from('support_tickets').select('*').order('createdAt', { ascending: false });
      if (!error && data) {
         set({ tickets: data as SupportTicket[] });
      }
    };
    
    loadTickets();
    const channel = supabase.channel('public:support_tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, loadTickets)
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  },

  addBroadcast: (broadcastInput) => {
    const supabase = getSupabase();
    const id = `BC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBC = { ...broadcastInput, id, createdAt: new Date().toISOString() };
    if (supabase) {
        supabase.from('broadcasts').insert([newBC]).then(({error}) => { if (error) console.error("Supabase addBroadcast failed:", error); });
    }
  },

  deleteBroadcast: (broadcastId) => {
    const supabase = getSupabase();
    if (supabase) {
       supabase.from('broadcasts').delete().eq('id', broadcastId).then(({error}) => { if (error) console.error(error); });
    }
  },

  pinBroadcast: (broadcastId) => {
    const broadcasts = get().broadcasts;
    const found = broadcasts.find(b => b.id === broadcastId);
    if (found) {
      const newPinned = !found.pinned;
      const supabase = getSupabase();
      if (supabase) supabase.from('broadcasts').update({ pinned: newPinned }).eq('id', broadcastId);
    }
  },

  setActiveSession: (sessionId) => {
    set({ activeSessionId: sessionId });
    if (sessionId) {
      get().setSeenStatus(sessionId, 'admin');
    }
  },

  sendMessageToSession: async (sessionId, sender, text, imageUrl, fileUrl, fileName) => {
    const supabase = getSupabase();
    const messageId = `msg-${Math.floor(100000 + Math.random() * 900000)}`;
    const newMessage: ChatMessage = {
      id: messageId,
      sender,
      text,
      imageUrl,
      fileUrl,
      fileName,
      timestamp: new Date().toISOString(),
      seen: sender === 'admin' && get().activeSessionId === sessionId,
      deliveryStatus: 'sending'
    };

    set((state) => {
      const updatedSessions = state.sessions.map((sess) => {
        if (sess.id === sessionId) {
          const updatedMessages = [...sess.messages, newMessage];
          return {
            ...sess,
            messages: updatedMessages,
            lastMessageAt: newMessage.timestamp,
            customerOnline: sender === 'customer' ? true : sess.customerOnline
          };
        }
        return sess;
      });

      const sessionExists = updatedSessions.some(s => s.id === sessionId);
      
      if (!sessionExists && sessionId === state.currentCustomerSessionId) {
        const newSess: ChatSession = {
          id: sessionId,
          customerName: 'Anonymous Customer',
          customerPhone: 'N/A',
          customerOnline: true,
          lastMessageAt: newMessage.timestamp,
          messages: [newMessage],
          status: 'open'
        };
        return { sessions: [...updatedSessions, newSess] };
      }
      return { sessions: updatedSessions };
    });

    try {
      if (supabase) {
          // store message in conversation_messages
          const msgData: Record<string, any> = {
            id: newMessage.id,
            conversation_id: sessionId,
            sender: newMessage.sender,
            timestamp: newMessage.timestamp,
            seen: newMessage.seen,
            createdAt: new Date().toISOString(),
          };
          if (newMessage.text) msgData.text = newMessage.text;
          if (newMessage.imageUrl) msgData.imageUrl = newMessage.imageUrl;
          if (newMessage.fileUrl) msgData.fileUrl = newMessage.fileUrl;
          if (newMessage.fileName) msgData.fileName = newMessage.fileName;
          
          await supabase.from('conversation_messages').insert([msgData]);
          
          // store conversation updates
          const sessionUpdate: any = {
             id: sessionId,
             lastMessageAt: newMessage.timestamp,
             lastMessageText: newMessage.text || '📄 Attachment File',
          };
          
          if (sender === 'customer') {
            sessionUpdate.customerOnline = true;
            const currentSess = get().sessions.find(s => s.id === sessionId);
            if (currentSess && currentSess.id !== 'TAZU-MART-BD-OFFICIAL') {
              const currentUnread = currentSess.unreadCount || 0;
              sessionUpdate.unreadCount = currentUnread + 1;
            } else {
              sessionUpdate.unreadCount = 1;
            }
          }
          await supabase.from('conversations').upsert([sessionUpdate]);
      }
    } catch (error) {
      console.error("FAILED TO SAVE TO SUPABASE", error);
    }
    
    setTimeout(() => {
      set((state) => ({
        sessions: state.sessions.map((sess) => {
          if (sess.id === sessionId) {
            return {
              ...sess,
              messages: sess.messages.map((m) =>
                m.id === messageId ? { ...m, deliveryStatus: 'sent' } : m
              )
            };
          }
          return sess;
        })
      }));
    }, 600);
  },

  setTypingIndicator: (sessionId, isTyping) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, isTyping } : s
      )
    }));
  },

  setSeenStatus: async (sessionId, sender) => {
    set((state) => ({
      sessions: state.sessions.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            unreadCount: 0,
            messages: s.messages.map((m) =>
              m.sender !== sender ? { ...m, seen: true } : m
            )
          };
        }
        return s;
      })
    }));

    const supabase = getSupabase();
    if (supabase) {
        await supabase.from('conversations').update({ unreadCount: 0 }).eq('id', sessionId);
        // also set messages as seen
        await supabase.from('conversation_messages').update({ seen: true }).eq('conversation_id', sessionId).neq('sender', sender);
    }
  },

  closeSession: async (sessionId) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, status: 'closed' } : s
      )
    }));
    const supabase = getSupabase();
    if (supabase) supabase.from('conversations').update({ status: 'closed' }).eq('id', sessionId);
  },

  solveSession: async (sessionId) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, status: 'solved' } : s
      )
    }));
    const supabase = getSupabase();
    if (supabase) supabase.from('conversations').update({ status: 'solved' }).eq('id', sessionId);
  },

  createNewSession: (name, phone, email, avatar, uid) => {
    const cleanPhoneInput = phone.replace(/[+\s-]+/g, '').replace(/^880/, '0');
    const currentEmail = email?.toLowerCase().trim();
    
    const stableId = uid 
      ? `SESS-CHAT-${uid}`
      : (currentEmail 
          ? `SESS-CHAT-${currentEmail.replace(/[^a-zA-Z0-9]/g, '_')}` 
          : `SESS-CHAT-${cleanPhoneInput || 'GUEST'}`);

    const sessions = get().sessions;
    const foundSession = sessions.find(s => s.id === stableId || s.customerUid === uid);
    const ticketNumber = foundSession?.ticketNumber || `SUP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const sessionData: any = {
      id: stableId,
      customerName: name,
      customerPhone: phone,
      customerOnline: true,
      lastMessageAt: new Date().toISOString(),
      status: 'open',
      ticketNumber: ticketNumber
    };
    if (email) sessionData.customerEmail = email;
    if (avatar) sessionData.customerAvatar = avatar;
    if (uid) sessionData.customerUid = uid;

    set({ currentCustomerSessionId: stableId });
    
    const supabase = getSupabase();
    if (supabase) {
       supabase.from('conversations').upsert([sessionData]).then(({error}) => { if (error) console.error("Supabase sync error:", error); });
    }

    if (foundSession) {
      set((state) => ({
        sessions: state.sessions.map(s => 
          s.id === stableId ? { ...s, ...sessionData, customerOnline: true } : s
        )
      }));
      return stableId;
    }

    const newSess: ChatSession = {
      ...sessionData,
      customerEmail: email || '',
      customerAvatar: avatar || '',
      customerOnline: true,
      messages: [],
      internalNotes: '',
      assignedModerator: ''
    };

    set((state) => ({
      sessions: [...state.sessions, newSess]
    }));

    return stableId;
  },

  updateSettings: async (newSettings) => {
    const nextSettings = { ...get().settings, ...newSettings };
    set({ settings: nextSettings });
    const supabase = getSupabase();
    if (supabase) supabase.from('settings').upsert([{ id: 'support_settings', data: nextSettings }]);
  },

  updateSessionNotes: async (sessionId, notes) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, internalNotes: notes } : s
      )
    }));
    const supabase = getSupabase();
    if (supabase) await supabase.from('conversations').update({ internalNotes: notes }).eq('id', sessionId);
  },

  assignSessionModerator: async (sessionId, moderator) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, assignedModerator: moderator } : s
      )
    }));
    const supabase = getSupabase();
    if (supabase) await supabase.from('conversations').update({ assignedModerator: moderator }).eq('id', sessionId);
  },

  updateSessionStatus: async (sessionId, status) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, status } : s
      )
    }));
    const supabase = getSupabase();
    if(supabase) await supabase.from('conversations').update({ status }).eq('id', sessionId);
  },

  toggleBlockPhone: async (phone, sessionId) => {
    const cleanPhone = phone.replace(/[+\s-]+/g, '');
    let newBlocked: string[] = [];
    set((state) => {
      const isBlocked = state.blockedPhones.includes(cleanPhone);
      const nextBlocked = isBlocked 
        ? state.blockedPhones.filter(p => p !== cleanPhone)
        : [...state.blockedPhones, cleanPhone];
      newBlocked = nextBlocked;
      return { blockedPhones: nextBlocked };
    });

    const supabase = getSupabase();
    if (supabase) {
       await supabase.from('settings').upsert([{ id: 'blocked_phones', phones: newBlocked }]);
       if (sessionId) {
           const { data } = await supabase.from('conversations').select('isBlocked').eq('id', sessionId).single();
           if (data) {
              await supabase.from('conversations').update({ isBlocked: !data.isBlocked }).eq('id', sessionId);
           }
       }
    }
  },

  subscribeLiveSupport: () => {
    const supabase = getSupabase();
    if (!supabase) return () => {};
    
    // Subscribe to all conversations for live support
    const loadConversations = async () => {
        const { data, error } = await supabase.from('conversations').select('*');
        if (!error && data) {
           set(state => {
              const currentSessions = [...state.sessions];
              const fetchedSessions = data.map((docData: any) => {
                 const existingSessIdx = currentSessions.findIndex(s => s.id === docData.id);
                 return {
                    id: docData.id,
                    customerName: docData.customerName || 'Anonymous Customer',
                    customerPhone: docData.customerPhone || 'N/A',
                    customerEmail: docData.customerEmail || '',
                    customerAvatar: docData.customerAvatar || '',
                    customerOnline: docData.customerOnline !== false,
                    lastMessageAt: docData.lastMessageAt || new Date().toISOString(),
                    lastMessageText: docData.lastMessageText || '',
                    unreadCount: docData.unreadCount || 0,
                    status: docData.status || 'open',
                    ticketNumber: docData.ticketNumber || '',
                    assignedModerator: docData.assignedModerator || '',
                    internalNotes: docData.internalNotes || '',
                    isBlocked: docData.isBlocked || false,
                    messages: existingSessIdx > -1 ? currentSessions[existingSessIdx].messages : []
                 };
              });
              return { sessions: fetchedSessions };
           });
        }
    };
    
    loadConversations();
    const channel = supabase.channel('public:conversations')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, loadConversations)
        .subscribe();
        
    return () => {
        supabase.removeChannel(channel);
    };
  },

  subscribeMessages: (sessionId) => {
    const supabase = getSupabase();
    if (!supabase) return () => {};
    
    const loadMessages = async () => {
        const { data, error } = await supabase.from('conversation_messages').select('*').eq('conversation_id', sessionId).order('timestamp', { ascending: true });
        if (!error && data) {
           const msgs: ChatMessage[] = data.map((d: any) => ({
              id: d.id,
              sender: d.sender || 'customer',
              text: d.text,
              imageUrl: d.imageUrl,
              fileUrl: d.fileUrl,
              fileName: d.fileName,
              timestamp: d.timestamp || new Date().toISOString(),
              seen: d.seen || false,
              deliveryStatus: d.deliveryStatus || 'sent'
           }));
           
           set(state => ({
              sessions: state.sessions.map((s) => s.id === sessionId ? { ...s, messages: msgs } : s)
           }));
        }
    };
    
    loadMessages();
    const channel = supabase.channel(`public:conversation_messages:${sessionId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_messages', filter: `conversation_id=eq.${sessionId}` }, loadMessages)
        .subscribe();
        
    return () => {
       supabase.removeChannel(channel);
    };
  }
}));
