import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';

export interface SupportTicket {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  orderId?: string;
  subject: string;
  message: string;
  category: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Closed' | 'In Review' | 'Solved';
  createdAt: string;
  address?: string;
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
  customerName: string;
  customerPhone: string;
  customerOnline: boolean;
  isTyping?: boolean;
  lastMessageAt: string;
  messages: ChatMessage[];
  status: 'open' | 'solved' | 'closed';
  ticketNumber?: string;
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

  // Actions
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => SupportTicket;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
  deleteTicket: (ticketId: string) => void;
  
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
  createNewSession: (name: string, phone: string) => string;

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

const SEED_TICKETS: SupportTicket[] = [
  {
    id: 'SUP-2026-4582',
    fullName: 'Jamil Ahmed',
    phoneNumber: '+8801911990088',
    email: 'jamil@gmail.com',
    orderId: 'TM-2849',
    category: 'Refund Request',
    subject: 'Received broken product package',
    message: 'The outer smart watch box seal was open and screen has minor scratch. Requesting a full refund or immediate replacement.',
    status: 'Under Review',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    address: 'House 45, Road 12, Sector 3, Uttara, Dhaka - 1230'
  },
  {
    id: 'SUP-2026-1294',
    fullName: 'Nafisa Tasnim',
    phoneNumber: '+8801511223344',
    email: 'nafisa@yahoo.com',
    orderId: 'TM-8723',
    category: 'Payment Issue',
    subject: 'bKash double payment deduction',
    message: 'Payment got deducted twice due to network timeout during the gateway redirection. Please refund the extra 1,500 BDT.',
    status: 'Pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    address: 'Road 5, Block B, Banani, Dhaka'
  }
];

export const useSupportStore = create<SupportState>()(
  persist(
    (set, get) => ({
      tickets: SEED_TICKETS,
      sessions: SEED_SESSIONS,
      broadcasts: SEED_BROADCASTS,
      settings: DEFAULT_SETTINGS,
      activeSessionId: null,
      currentCustomerSessionId: 'SESS-CURRENT-USER',

      addTicket: (ticketInput) => {
        const ticketId = `SUP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const newTicket: SupportTicket = {
          ...ticketInput,
          id: ticketId,
          status: 'Pending',
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          tickets: [newTicket, ...state.tickets]
        }));
        return newTicket;
      },

      updateTicketStatus: (ticketId, status) => {
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === ticketId ? { ...t, status } : t
          )
        }));
      },

      deleteTicket: (ticketId) => {
        set((state) => ({
          tickets: state.tickets.filter((t) => t.id !== ticketId)
        }));
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
          await setDoc(conversationRef, {
            id: sessionId,
            lastMessageAt: newMessage.timestamp,
            lastMessageText: newMessage.text || '📄 Attachment File',
            customerOnline: sender === 'customer' ? true : undefined,
          }, { merge: true });
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
                messages: s.messages.map((m) =>
                  m.sender !== sender ? { ...m, seen: true } : m
                )
              };
            }
            return s;
          })
        }));
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

      createNewSession: (name, phone) => {
        const cleanPhoneInput = phone.replace(/[+\s-]+/g, '');
        const foundSession = get().sessions.find(s => s.customerPhone.replace(/[+\s-]+/g, '') === cleanPhoneInput);
        const ticketNumber = foundSession?.ticketNumber || `SUP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        
        if (foundSession) {
          set({ currentCustomerSessionId: foundSession.id });
          const sessRef = doc(db, 'conversations', foundSession.id);
          setDoc(sessRef, {
            id: foundSession.id,
            customerName: name,
            customerPhone: phone,
            customerOnline: true,
            lastMessageAt: new Date().toISOString(),
            status: 'open',
            ticketNumber: ticketNumber
          }, { merge: true }).catch(err => console.error("Firestore sync error:", err));
          return foundSession.id;
        }

        const id = `SESS-CHAT-${cleanPhoneInput || Date.now()}`;
        const sessionExists = get().sessions.some((s) => s.id === id);
        
        // Write/update metadata in Firestore so the admin instantly lists it!
        try {
          const sessRef = doc(db, 'conversations', id);
          setDoc(sessRef, {
            id,
            customerName: name,
            customerPhone: phone,
            customerOnline: true,
            lastMessageAt: new Date().toISOString(),
            status: 'open',
            ticketNumber: ticketNumber
          }, { merge: true }).catch(err => console.error("Firestore sync error:", err));
        } catch(e) {
          console.error("Firestore setDoc failed:", e);
        }

        if (sessionExists) {
          set((state) => ({
            sessions: state.sessions.map(s => 
              s.id === id 
                ? { ...s, customerName: name, customerPhone: phone, customerOnline: true, status: 'open', ticketNumber }
                : s
            ),
            currentCustomerSessionId: id
          }));
        } else {
          const newSess: ChatSession = {
            id,
            customerName: name,
            customerPhone: phone,
            customerOnline: true,
            lastMessageAt: new Date().toISOString(),
            messages: [],
            status: 'open',
            ticketNumber
          };
          set((state) => ({
            sessions: [...state.sessions, newSess],
            currentCustomerSessionId: id
          }));
        }
        return id;
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      }
    }),
    {
      name: 'tazumart-support-storage-v2'
    }
  )
);
