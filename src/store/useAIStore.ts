import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FAQEntry {
  id: string;
  question: string;
  answer: string;
}

export interface CustomAnswerEntry {
  id: string;
  keyword: string; // comma separated keywords or exact matches
  answer: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  rating?: 'good' | 'bad' | null;
}

export interface AIChatSession {
  id: string;
  name: string;
  phone: string;
  language: 'en' | 'bn' | 'mixed';
  messages: AIMessage[];
  status: 'active' | 'handed_over' | 'resolved';
  createdAt: string;
  tokensUsed: number;
}

export interface AIState {
  aiEnabled: boolean;
  settings: {
    aiName: string;
    model: string;
    temperature: number;
    welcomeMessage: string;
    apiType: 'openai' | 'gemini' | 'hybrid' | 'fallback';
    openAIKey: string;
    geminiKey: string;
    defaultLanguage: string;
    secondaryLanguage: string;
  };
  prompt: {
    systemPrompt: string;
  };
  productAccess: {
    products: boolean;
    categories: boolean;
    brands: boolean;
    offers: boolean;
    promoCodes: boolean;
    reviews: boolean;
    bestSelling: boolean;
    flashSales: boolean;
    stockInfo: boolean;
  };
  websiteAccess: {
    banners: boolean;
    categories: boolean;
    products: boolean;
    offers: boolean;
    reviews: boolean;
    supportContent: boolean;
    paymentMethods: boolean;
    deliveryMethods: boolean;
  };
  responseRules: {
    priority: ('product' | 'offer' | 'website' | 'knowledge' | 'human')[];
  };
  knowledge: {
    companyInfo: string;
    deliveryPolicy: string;
    returnPolicy: string;
    refundPolicy: string;
    termsConditions: string;
    productInfo: string;
    customAnswersText: string;
    customerGuidelines: string;
    faqs: FAQEntry[];
    customAnswers: CustomAnswerEntry[];
  };
  syncSettings: {
    productAdded: boolean;
    productUpdated: boolean;
    productDeleted: boolean;
    bannerAdded: boolean;
    bannerUpdated: boolean;
    offerAdded: boolean;
    categoryUpdated: boolean;
  };
  sessions: AIChatSession[];
  analytics: {
    totalConversations: number;
    totalQueries: number;
    humanHandovers: number;
    avgRating: number;
    totalTokens: number;
  };

  // Actions
  setAiEnabled: (enabled: boolean) => void;
  updateSettings: (settings: Partial<AIState['settings']>) => void;
  updatePrompt: (prompt: Partial<AIState['prompt']>) => void;
  updateProductAccess: (access: Partial<AIState['productAccess']>) => void;
  updateWebsiteAccess: (access: Partial<AIState['websiteAccess']>) => void;
  updateResponseRules: (rules: Partial<AIState['responseRules']>) => void;
  updateKnowledge: (knowledge: Partial<AIState['knowledge']>) => void;
  updateSyncSettings: (syncSettings: Partial<AIState['syncSettings']>) => void;
  addFaq: (q: string, a: string) => void;
  removeFaq: (id: string) => void;
  addCustomAnswer: (keyword: string, a: string) => void;
  removeCustomAnswer: (id: string) => void;
  
  // Chat Actions
  startNewSession: (name: string, phone: string) => AIChatSession;
  addMessageToSession: (sessionId: string, sender: 'user' | 'ai' | 'system', text: string) => void;
  rateMessageInSession: (sessionId: string, messageId: string, rating: 'good' | 'bad' | null) => void;
  handoverSession: (sessionId: string) => void;
  resolveSession: (sessionId: string) => void;
  clearSessionHistory: () => void;
  incrementTokens: (tokens: number) => void;
}

const DEFAULT_FAQS: FAQEntry[] = [
  { id: '1', question: 'How do I place an order?', answer: 'Browse products, add them to your shopping cart, and click checkout. Provide your address and choose cash-on-delivery or local mobile wallets (bKash/Nagad) to instantly confirm!' },
  { id: '2', question: 'অর্ডার করতে কত সময় লাগে?', answer: 'এখানে অর্ডার করা অত্যন্ত সহজ! প্রোডাক্ট কার্ট এ যোগ করুন, প্রসিড টু চেকআউট বাটনে ক্লিক করুন, আপনার নাম, মোবাইল এবং ঠিকানা দিয়ে অর্ডার কনফার্ম করুন।' },
  { id: '3', question: 'What is inside Tazu Mart delivery guarantee?', answer: 'We ensure contactless, quick home delivery with 100% active fresh vegetables and quality grocery brands guaranteed.' },
  { id: '4', question: 'বিকাশ বা নগদে কি পেমেন্ট করা যাবে?', answer: 'হ্যাঁ! আমাদের এখানে ক্যাশ অন ডেলিভারির পাশাপাশি বিকাশ (bKash), নগদ (Nagad), রকেট বা যেকোনো ক্রেডিট/ডেবিট কার্ড দিয়ে পেমেন্ট করতে পারবেন।' }
];

const DEFAULT_CUSTOM_ANSWERS: CustomAnswerEntry[] = [
  { id: 'c1', keyword: 'coupon, promo, discount, অফার, ছাড়', answer: 'You can view active campaign discount codes in the Offers tab! Active coupon matches can provide up to 25% checkout coin discounts automatically!' },
  { id: 'c2', keyword: 'owner, founder, মালিক, কে', answer: 'Tazu Mart is operated by our stellar backend administration. If you wish to contact the owner, email us at support@tazumart.com.' },
  { id: 'c3', keyword: 'office, address, location, ঠিকানা', answer: 'Our central warehouse is situated in Dhaka, Bangladesh. We process nationwide shipments from this terminal everyday.' }
];

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      aiEnabled: true,
      settings: {
        aiName: 'Tazu AI Assistant',
        model: 'GPT-4o Latest (OpenAI)',
        temperature: 0.7,
        welcomeMessage: 'Hello! I am your AI Support Assistant for Tazu Mart. How can I help you find products or solve your issues today? \n\nহ্যালো! আমি তজু মার্টের আপনার এআই সাপোর্ট অ্যাসিস্ট্যান্ট। আজ আমি আপনাকে কীভাবে পণ্য খুঁজে পেতে বা আপনার সমস্যার সমাধান করতে সাহায্য করতে পারি?',
        apiType: 'hybrid',
        openAIKey: '',
        geminiKey: '',
        defaultLanguage: 'Bengali',
        secondaryLanguage: 'English'
      },
      prompt: {
        systemPrompt: `You are the official AI Assistant for TAZU MART BD.
Your goal is to provide intelligent support and product recommendations based on REAL website data.
Priority for your responses:
1. Product Data: If a user asks for products, lists, or specific items, use the products list.
2. Offer Data: If a user asks for deals, coupons, or campaigns, check the offers.
3. Website Data: Use banners, categories, and general site info for context.
4. Knowledge Base: Refer to your manual policies for shipping, returns, and FAQs.
5. Human Support: Suggest speaking to a human ONLY as a last resort or if explicitly asked.

When showing products, mention prices (৳) and stock if available.
Always be polite, professional, and sales-oriented. Use {live_context} to get the latest store info.`
      },
      productAccess: {
        products: true,
        categories: true,
        brands: true,
        offers: true,
        promoCodes: true,
        reviews: true,
        bestSelling: true,
        flashSales: true,
        stockInfo: true
      },
      websiteAccess: {
        banners: true,
        categories: true,
        products: true,
        offers: true,
        reviews: true,
        supportContent: true,
        paymentMethods: true,
        deliveryMethods: true
      },
      responseRules: {
        priority: ['product', 'offer', 'website', 'knowledge', 'human']
      },
      knowledge: {
        companyInfo: 'Tazu Mart is a high-growth premium e-commerce marketplace offering fresh food, organic items, local cosmetics, grocery essentials, and home appliances in Bangladesh.',
        deliveryPolicy: 'Shipping within Dhaka: ৳60 (24-48 Hours). Outside Dhaka: ৳120 (3-5 business days).',
        returnPolicy: 'Returns within 7 days in original condition. Fresh items must be checked on delivery.',
        refundPolicy: 'Refunds processed within 3-5 business days after inspection.',
        termsConditions: 'Standard marketplace terms apply. All orders are subject to availability.',
        productInfo: 'Premium organic vegetables, gourmet groceries, tech accessories, cosmetics, and more.',
        customAnswersText: 'You can define custom short triggers matching phrases or keyword tokens here.',
        customerGuidelines: 'Check products before paying for COD. Report issues within 24 hours.',
        faqs: DEFAULT_FAQS,
        customAnswers: DEFAULT_CUSTOM_ANSWERS
      },
      syncSettings: {
        productAdded: true,
        productUpdated: true,
        productDeleted: true,
        bannerAdded: true,
        bannerUpdated: true,
        offerAdded: true,
        categoryUpdated: true
      },
      sessions: [],
      analytics: {
        totalConversations: 0,
        totalQueries: 0,
        humanHandovers: 0,
        avgRating: 4.8,
        totalTokens: 0
      },

      // Actions
      setAiEnabled: (enabled) => set({ aiEnabled: enabled }),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      updatePrompt: (newPrompt) => set((state) => ({
        prompt: { ...state.prompt, ...newPrompt }
      })),

      updateProductAccess: (newAccess) => set((state) => ({
        productAccess: { ...state.productAccess, ...newAccess }
      })),

      updateWebsiteAccess: (newAccess) => set((state) => ({
        websiteAccess: { ...state.websiteAccess, ...newAccess }
      })),

      updateResponseRules: (newRules) => set((state) => ({
        responseRules: { ...state.responseRules, ...newRules }
      })),

      updateKnowledge: (newKnowledge) => set((state) => ({
        knowledge: { ...state.knowledge, ...newKnowledge }
      })),

      updateSyncSettings: (newSyncSettings) => set((state) => ({
        syncSettings: { ...state.syncSettings, ...newSyncSettings }
      })),

      addFaq: (question, answer) => set((state) => ({
        knowledge: {
          ...state.knowledge,
          faqs: [...state.knowledge.faqs, { id: Date.now().toString(), question, answer }]
        }
      })),

      removeFaq: (id) => set((state) => ({
        knowledge: {
          ...state.knowledge,
          faqs: state.knowledge.faqs.filter(f => f.id !== id)
        }
      })),

      addCustomAnswer: (keyword, answer) => set((state) => ({
        knowledge: {
          ...state.knowledge,
          customAnswers: [...state.knowledge.customAnswers, { id: Date.now().toString(), keyword, answer }]
        }
      })),

      removeCustomAnswer: (id) => set((state) => ({
        knowledge: {
          ...state.knowledge,
          customAnswers: state.knowledge.customAnswers.filter(c => c.id !== id)
        }
      })),

      startNewSession: (name, phone) => {
        const newSession: AIChatSession = {
          id: 'AI-' + Math.floor(1000 + Math.random() * 9000),
          name: name || 'Guest User',
          phone: phone || '',
          language: 'mixed',
          messages: [
            {
              id: 'm-init',
              sender: 'ai',
              text: get().settings.welcomeMessage,
              timestamp: new Date().toISOString()
            }
          ],
          status: 'active',
          createdAt: new Date().toISOString(),
          tokensUsed: 0
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          analytics: {
            ...state.analytics,
            totalConversations: state.analytics.totalConversations + 1
          }
        }));

        return newSession;
      },

      addMessageToSession: (sessionId, sender, text) => set((state) => {
        const nextSessions = state.sessions.map((s) => {
          if (s.id === sessionId) {
            const newMsg: AIMessage = {
              id: 'msg-' + Date.now() + Math.floor(Math.random() * 100),
              sender,
              text,
              timestamp: new Date().toISOString()
            };
            
            // Basic language detection
            let detectedLang = s.language;
            if (sender === 'user') {
              const textLower = text.toLowerCase();
              const hasBengali = /[\u0980-\u09FF]/.test(textLower);
              if (hasBengali) {
                detectedLang = 'bn';
              } else {
                detectedLang = 'en';
              }
            }

            return {
              ...s,
              language: detectedLang,
              messages: [...s.messages, newMsg]
            };
          }
          return s;
        });

        const nextAnalytics = { ...state.analytics };
        if (sender === 'user') {
          nextAnalytics.totalQueries += 1;
        }

        return {
          sessions: nextSessions,
          analytics: nextAnalytics
        };
      }),

      rateMessageInSession: (sessionId, messageId, rating) => set((state) => {
        const nextSessions = state.sessions.map((s) => {
          if (s.id === sessionId) {
            const nextMessages = s.messages.map((m) => {
              if (m.id === messageId) {
                return { ...m, rating };
              }
              return m;
            });
            return { ...s, messages: nextMessages };
          }
          return s;
        });

        // Recalculate average rating slightly
        let nextAvg = state.analytics.avgRating;
        if (rating === 'good') {
          nextAvg = Math.min(5.0, Number((state.analytics.avgRating * 0.98 + 0.1).toFixed(2)));
        } else if (rating === 'bad') {
          nextAvg = Math.max(3.5, Number((state.analytics.avgRating * 0.98 - 0.15).toFixed(2)));
        }

        return {
          sessions: nextSessions,
          analytics: {
            ...state.analytics,
            avgRating: nextAvg
          }
        };
      }),

      handoverSession: (sessionId) => set((state) => {
        const nextSessions = state.sessions.map((s) => {
          if (s.id === sessionId) {
            return { ...s, status: 'handed_over' as const };
          }
          return s;
        });

        return {
          sessions: nextSessions,
          analytics: {
            ...state.analytics,
            humanHandovers: state.analytics.humanHandovers + 1
          }
        };
      }),

      resolveSession: (sessionId) => set((state) => ({
        sessions: state.sessions.map((s) => {
          if (s.id === sessionId) {
            return { ...s, status: 'resolved' as const };
          }
          return s;
        })
      })),

      clearSessionHistory: () => set({
        sessions: [],
        analytics: {
          totalConversations: 0,
          totalQueries: 0,
          humanHandovers: 0,
          avgRating: 4.8,
          totalTokens: 0
        }
      }),

      incrementTokens: (tokens) => set((state) => ({
        analytics: {
          ...state.analytics,
          totalTokens: state.analytics.totalTokens + tokens
        }
      }))
    }),
    {
      name: 'tazu_mart_ai_store'
    }
  )
);
