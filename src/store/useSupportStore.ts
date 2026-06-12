import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../lib/db';
import { collection, addDoc, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, updateDoc, getDoc } from 'firebase/firestore';

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

const SEED_TICKETS: SupportTicket[] = [];

export const useSupportStore = create<SupportState>()(
  persist(
    (set, get) => ({
      tickets: [],
      sessions: SEED_SESSIONS,
      broadcasts: SEED_BROADCASTS,
      settings: DEFAULT_SETTINGS,
      activeSessionId: null,
      currentCustomerSessionId: '',
      blockedPhones: [],

      addTicket: async (ticketInput) => {
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
          const docRef = doc(db, 'support_tickets', ticketId);
          // Remove undefined fields for Firestore compatibility
          const cleanTicket = Object.fromEntries(
            Object.entries(newTicket).filter(([_, v]) => v !== undefined)
          );
          await setDoc(docRef, cleanTicket);
          
          set((state) => ({
            tickets: [newTicket, ...state.tickets]
          }));
          return ticketNumber;
        } catch (error) {
          console.error("Error adding ticket to Firestore:", error);
          throw error;
        }
      },

      updateTicketStatus: (ticketId, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          tickets: state.tickets.map((t) => 
            t.id === ticketId ? { ...t, status, updatedAt: now } : t
          )
        }));
        const docRef = doc(db, 'support_tickets', ticketId);
        updateDoc(docRef, { status, updatedAt: now }).catch(err => console.error("Update ticket status failed:", err));
      },

      deleteTicket: (ticketId) => {
        set((state) => ({
          tickets: state.tickets.filter((t) => t.id !== ticketId)
        }));
        const docRef = doc(db, 'support_tickets', ticketId);
        deleteDoc(docRef).catch(err => console.error("Delete ticket failed:", err));
      },

      subscribeTickets: () => {
        const ticketsCol = collection(db, 'support_tickets');
        const q = query(ticketsCol, orderBy('createdAt', 'desc'));
        
        const unsub = onSnapshot(q, (snapshot) => {
          const fetchedTickets: SupportTicket[] = [];
          snapshot.forEach((doc) => {
            fetchedTickets.push(doc.data() as SupportTicket);
          });
          set({ tickets: fetchedTickets });
        }, (error) => {
          console.error("Error listening to support tickets:", error);
        });
        return unsub;
      },

      addBroadcast: (broadcastInput) => {
        const id = `BC-${Math.floor(1000 + Math.random() * 9000)}`;
        const docRef = doc(db, 'broadcasts', id);
        const newBC = { ...broadcastInput, id, createdAt: new Date().toISOString() };
        
        // Remove undefined fields for Firestore
        const cleanBC = Object.fromEntries(
          Object.entries(newBC).filter(([_, v]) => v !== undefined)
        );

        set((state) => ({
          broadcasts: [newBC, ...state.broadcasts]
        }));
        setDoc(docRef, cleanBC).catch(err => console.error("Firestore addBroadcast failed:", err));
      },

      deleteBroadcast: (broadcastId) => {
        set((state) => ({
          broadcasts: state.broadcasts.filter((b) => b.id !== broadcastId)
        }));
        const docRef = doc(db, 'broadcasts', broadcastId);
        deleteDoc(docRef).catch(err => console.error("Firestore deleteDoc failed:", err));
      },

      pinBroadcast: (broadcastId) => {
        const broadcasts = get().broadcasts;
        const found = broadcasts.find(b => b.id === broadcastId);
        if (found) {
          const newPinned = !found.pinned;
          set((state) => ({
            broadcasts: state.broadcasts.map((b) =>
              b.id === broadcastId ? { ...b, pinned: newPinned } : b
            )
          }));
          const docRef = doc(db, 'broadcasts', broadcastId);
          
          const updatedBC = { ...found, pinned: newPinned };
          const cleanUpdatedBC = Object.fromEntries(
            Object.entries(updatedBC).filter(([_, v]) => v !== undefined)
          );

          setDoc(docRef, cleanUpdatedBC, { merge: true })
            .catch(err => console.error("Firestore pinBroadcast failed:", err));
        }
      },

      setActiveSession: (sessionId) => {
        set({ activeSessionId: sessionId });
        if (sessionId) {
          get().setSeenStatus(sessionId, 'admin');
        }
      },

      sendMessageToSession: async (sessionId, sender, text, imageUrl, fileUrl, fileName) => {
        console.log("!!! SENDING TO SESSION:", sessionId, "SENDER:", sender, "TEXT:", text);                
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
          console.log("!!! CURRENT SESSIONS:", state.sessions.map(s => s.id));
          const updatedSessions = state.sessions.map((sess) => {
            if (sess.id === sessionId) {
              console.log("!!! SESSION MATCH", sess.id);
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
          console.log("!!! SESSION EXISTS", sessionExists, "SESSION ID", sessionId, "CURRENT", state.currentCustomerSessionId);
          
          if (!sessionExists && sessionId === state.currentCustomerSessionId) {
            console.log("!!! CREATING NEW SESSION");
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
          const conversationRef = doc(db, 'conversations', sessionId);
          const msgData: Record<string, any> = {
            id: newMessage.id,
            sender: newMessage.sender,
            timestamp: newMessage.timestamp,
            seen: newMessage.seen,
            createdAt: new Date(),
          };
          if (newMessage.text) msgData.text = newMessage.text;
          if (newMessage.imageUrl) msgData.imageUrl = newMessage.imageUrl;
          if (newMessage.fileUrl) msgData.fileUrl = newMessage.fileUrl;
          if (newMessage.fileName) msgData.fileName = newMessage.fileName;

          await addDoc(collection(conversationRef, 'messages'), msgData);

          // Update main session details in Firestore as well for Admin sidebar real-time sync
          const sessionUpdate: any = {
            id: sessionId,
            lastMessageAt: newMessage.timestamp,
            lastMessageText: newMessage.text || '📄 Attachment File',
          };
          if (sender === 'customer') {
            sessionUpdate.customerOnline = true;
            // Use increment if needed, but since we are merging, we'll try to increment on server side properly
            // Here we just increment in firestore by reading first or assuming we have it.
            // Simplified: Increment in store if it's there
            const currentSess = get().sessions.find(s => s.id === sessionId);
            if (currentSess && currentSess.id !== 'TAZU-MART-BD-OFFICIAL') {
              const currentUnread = currentSess.unreadCount || 0;
              sessionUpdate.unreadCount = currentUnread + 1;
            } else {
              sessionUpdate.unreadCount = 1;
            }
          }

          await setDoc(conversationRef, sessionUpdate, { merge: true });
        } catch (error) {
          console.error("FAILED TO SAVE TO FIRESTORE", error);
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

      setSeenStatus: (sessionId, sender) => {
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

        // Reset unreadCount in Firestore
        const sessionRef = doc(db, 'conversations', sessionId);
        updateDoc(sessionRef, { unreadCount: 0 }).catch(err => console.error("Update unreadCount failed:", err));
        
        // Mark all messages as seen in Firestore for this session and sender
        // Note: For simplicity we are just updating the session level unreadCount which controls the badge.
      },

      closeSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, status: 'closed' } : s
          )
        }));
      },

      solveSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, status: 'solved' } : s
          )
        }));
      },

      createNewSession: (name, phone, email, avatar, uid) => {
        const cleanPhoneInput = phone.replace(/[+\s-]+/g, '').replace(/^880/, '0');
        const currentEmail = email?.toLowerCase().trim();
        
        // Use User UID as the ultimate deterministic ID for persistence (like Messenger/WhatsApp)
        // If not logged in, fallback to email-based or phone-based deterministic ID
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
        
        // Persistent sync to Firestore - One Customer, One Document
        const sessRef = doc(db, 'conversations', stableId);
        setDoc(sessRef, sessionData, { merge: true }).catch(err => console.error("Firestore sync error:", err));

        if (foundSession) {
          // Update local state for existing session
          set((state) => ({
            sessions: state.sessions.map(s => 
              s.id === stableId ? { ...s, ...sessionData, customerOnline: true } : s
            )
          }));
          return stableId;
        }

        // Add as new session in local state if it didn't exist
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

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      updateSessionNotes: (sessionId, notes) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, internalNotes: notes } : s
          )
        }));
        const sessRef = doc(db, 'conversations', sessionId);
        updateDoc(sessRef, { internalNotes: notes }).catch(err => console.error("Update notes failed:", err));
      },

      assignSessionModerator: (sessionId, moderator) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, assignedModerator: moderator } : s
          )
        }));
        const sessRef = doc(db, 'conversations', sessionId);
        updateDoc(sessRef, { assignedModerator: moderator }).catch(err => console.error("Assign moderator failed:", err));
      },

      updateSessionStatus: (sessionId, status) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, status } : s
          )
        }));
        const sessRef = doc(db, 'conversations', sessionId);
        updateDoc(sessRef, { status }).catch(err => console.error("Update status failed:", err));
      },

      toggleBlockPhone: (phone, sessionId) => {
        const cleanPhone = phone.replace(/[+\s-]+/g, '');
        set((state) => {
          const isBlocked = state.blockedPhones.includes(cleanPhone);
          const nextBlocked = isBlocked 
            ? state.blockedPhones.filter(p => p !== cleanPhone)
            : [...state.blockedPhones, cleanPhone];
          
          return { blockedPhones: nextBlocked };
        });

        // Persist to the specific session if provided
        if (sessionId) {
          const sessRef = doc(db, 'conversations', sessionId);
          getDoc(sessRef).then(snapshot => {
            if (snapshot.exists()) {
              const currentStatus = snapshot.data().isBlocked || false;
              updateDoc(sessRef, { isBlocked: !currentStatus }).catch(err => console.error("Toggle block Firestore failed:", err));
            }
          }).catch(err => console.error("getDoc session toggleBlockPhone failed:", err));
        }
      },

      subscribeLiveSupport: () => {
        const conversationsCol = collection(db, 'conversations');
        const unsub = onSnapshot(conversationsCol, (snapshot) => {
          set((state) => {
            const updatedSessions = [...state.sessions];
            snapshot.docChanges().forEach((change) => {
              const docData = change.doc.data();
              const sessId = change.doc.id;
              
              const existingSessIdx = updatedSessions.findIndex(s => s.id === sessId);
              const customSess: ChatSession = {
                id: sessId,
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
                messages: existingSessIdx > -1 ? updatedSessions[existingSessIdx].messages : []
              };

              if (change.type === 'added' || change.type === 'modified') {
                if (existingSessIdx > -1) {
                  updatedSessions[existingSessIdx] = {
                    ...updatedSessions[existingSessIdx],
                    ...customSess,
                    messages: updatedSessions[existingSessIdx].messages
                  };
                } else {
                  updatedSessions.push(customSess);
                }
              } else if (change.type === 'removed') {
                if (existingSessIdx > -1) {
                  updatedSessions.splice(existingSessIdx, 1);
                }
              }
            });

            return { sessions: updatedSessions };
          });
        }, (error) => {
          console.error("error listening to live support sessions:", error);
        });
        return unsub;
      },

      subscribeMessages: (sessionId) => {
        const messagesCol = collection(db, 'conversations', sessionId, 'messages');
        const q = query(messagesCol, orderBy('timestamp', 'asc'));
        
        const unsub = onSnapshot(q, (snapshot) => {
          const msgs: ChatMessage[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            msgs.push({
              id: doc.id,
              sender: data.sender || 'customer',
              text: data.text,
              imageUrl: data.imageUrl,
              fileUrl: data.fileUrl,
              fileName: data.fileName,
              timestamp: data.timestamp || new Date().toISOString(),
              seen: data.seen || false,
              deliveryStatus: data.deliveryStatus || 'sent'
            });
          });

          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === sessionId ? { ...s, messages: msgs } : s
            )
          }));
        }, (error) => {
          console.error("error listening to messages for session:", sessionId, error);
        });
        return unsub;
      }
    }),
    {
      name: 'tazumart-support-storage-v2'
    }
  )
);
