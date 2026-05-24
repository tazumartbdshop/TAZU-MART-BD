import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  settings: SupportSettings;
  activeSessionId: string | null;
  currentCustomerSessionId: string; // The session ID representing the current browser customer

  // Actions
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => SupportTicket;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
  deleteTicket: (ticketId: string) => void;

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

const SEED_SESSIONS: ChatSession[] = [
  {
    id: 'SESS-2026-01',
    customerName: 'Anik Rahman',
    customerPhone: '+8801719876543',
    customerOnline: true,
    isTyping: false,
    lastMessageAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'open',
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        text: 'Hello, my order #TM-9981 has not been delivered yet. It should have arrived yesterday.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        seen: true
      },
      {
        id: 'msg-2',
        sender: 'admin',
        text: 'Hi Anik! Let me look into that for you immediately. I can see the rider is near your location.',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        seen: true
      },
      {
        id: 'msg-3',
        sender: 'customer',
        text: 'Oh great! Thank you so much for the quick checking.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        seen: false
      }
    ]
  },
  {
    id: 'SESS-2026-02',
    customerName: 'Sultana Razia',
    customerPhone: '+8801812345678',
    customerOnline: false,
    isTyping: false,
    lastMessageAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    status: 'solved',
    messages: [
      {
        id: 'msg-4',
        sender: 'customer',
        text: 'Is Cash on Delivery available for Chittagong?',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        seen: true
      },
      {
        id: 'msg-5',
        sender: 'admin',
        text: 'Yes Sultana, Cash on Delivery is eligible country-wide including Chittagong city!',
        timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
        seen: true
      },
      {
        id: 'msg-6',
        sender: 'customer',
        text: 'Prefect, I will place an order now.',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        seen: true
      }
    ]
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

      setActiveSession: (sessionId) => {
        set({ activeSessionId: sessionId });
        if (sessionId) {
          get().setSeenStatus(sessionId, 'admin');
        }
      },

      sendMessageToSession: (sessionId, sender, text, imageUrl, fileUrl, fileName) => {
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
                // Keep customer online standard
                customerOnline: sender === 'customer' ? true : sess.customerOnline
              };
            }
            return sess;
          });

          // Check if session exists, if it is the user session and not created, create it.
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
            return {
              sessions: [...updatedSessions, newSess]
            };
          }

          return { sessions: updatedSessions };
        });

        // Loop simulations of deliveryStatus: sent (600ms) -> delivered (1200ms) -> seen (2200ms)
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

        setTimeout(() => {
          set((state) => ({
            sessions: state.sessions.map((sess) => {
              if (sess.id === sessionId) {
                return {
                  ...sess,
                  messages: sess.messages.map((m) =>
                    m.id === messageId ? { ...m, deliveryStatus: 'delivered' } : m
                  )
                };
              }
              return sess;
            })
          }));
        }, 1200);

        setTimeout(() => {
          set((state) => ({
            sessions: state.sessions.map((sess) => {
              if (sess.id === sessionId) {
                return {
                  ...sess,
                  messages: sess.messages.map((m) =>
                    m.id === messageId ? { ...m, deliveryStatus: 'seen' as const, seen: true } : m
                  )
                };
              }
              return sess;
            })
          }));
        }, 2200);

        // Auto-reply logic if customer sent a message and there is no previous admin reply in last 2 mins
        if (sender === 'customer') {
          const autoReplyText = get().settings.autoReplyMessage;
          const currentSession = get().sessions.find(s => s.id === sessionId);
          
          if (autoReplyText && currentSession) {
            // Typing indicator on
            get().setTypingIndicator(sessionId, true);
            setTimeout(() => {
              get().setTypingIndicator(sessionId, false);
              // Send auto reply message
              const replyMsgId = `msg-auto-${Math.floor(100000 + Math.random() * 900000)}`;
              const replyMsg: ChatMessage = {
                id: replyMsgId,
                sender: 'admin',
                text: autoReplyText,
                timestamp: new Date().toISOString(),
                seen: false,
                deliveryStatus: 'sending'
              };
              set((state) => ({
                sessions: state.sessions.map((sess) =>
                  sess.id === sessionId
                    ? {
                        ...sess,
                        messages: [...sess.messages, replyMsg],
                        lastMessageAt: replyMsg.timestamp
                      }
                    : sess
                )
              }));

              // Also transition auto reply
              setTimeout(() => {
                set((state) => ({
                  sessions: state.sessions.map((sess) => {
                    if (sess.id === sessionId) {
                      return {
                        ...sess,
                        messages: sess.messages.map((m) =>
                          m.id === replyMsgId ? { ...m, deliveryStatus: 'sent' } : m
                        )
                      };
                    }
                    return sess;
                  })
                }));
              }, 600);

              setTimeout(() => {
                set((state) => ({
                  sessions: state.sessions.map((sess) => {
                    if (sess.id === sessionId) {
                      return {
                        ...sess,
                        messages: sess.messages.map((m) =>
                          m.id === replyMsgId ? { ...m, deliveryStatus: 'delivered' } : m
                        )
                      };
                    }
                    return sess;
                  })
                }));
              }, 1200);

              setTimeout(() => {
                set((state) => ({
                  sessions: state.sessions.map((sess) => {
                    if (sess.id === sessionId) {
                      return {
                        ...sess,
                        messages: sess.messages.map((m) =>
                          m.id === replyMsgId ? { ...m, deliveryStatus: 'seen' as const } : m
                        )
                      };
                    }
                    return sess;
                  })
                }));
              }, 2200);

            }, 1500);
          }
        }
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
        const id = `SESS-CURRENT-USER`;
        const sessionExists = get().sessions.some((s) => s.id === id);
        
        if (sessionExists) {
          set((state) => ({
            sessions: state.sessions.map(s => 
              s.id === id 
                ? { ...s, customerName: name, customerPhone: phone, customerOnline: true, status: 'open' }
                : s
            )
          }));
        } else {
          const newSess: ChatSession = {
            id,
            customerName: name,
            customerPhone: phone,
            customerOnline: true,
            lastMessageAt: new Date().toISOString(),
            messages: [
              {
                id: 'welcome-msg',
                sender: 'admin',
                text: get().settings.welcomeMessage,
                timestamp: new Date().toISOString(),
                seen: true
              }
            ],
            status: 'open'
          };
          set((state) => ({
            sessions: [...state.sessions, newSess]
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
      name: 'tazumart-support-storage'
    }
  )
);
