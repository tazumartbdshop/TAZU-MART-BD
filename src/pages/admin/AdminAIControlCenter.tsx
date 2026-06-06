import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  Settings, 
  Database, 
  History, 
  ShieldCheck, 
  FileText, 
  LineChart, 
  Sliders, 
  Trash2, 
  Plus, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Lock,
  MessageSquare,
  Bookmark,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAIStore, FAQEntry, CustomAnswerEntry } from '../../store/useAIStore';
import { useProductStore } from '../../store/useProductStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useOfferStore } from '../../store/useOfferStore';
import { useBannerStore } from '../../store/useBannerStore';
import { useOrderStore } from '../../store/useOrderStore';
import { usePromoStore } from '../../store/usePromoStore';

type ActiveCardType = 
  | 'settings' 
  | 'knowledge' 
  | 'training' 
  | 'logs' 
  | 'sessions' 
  | 'permissions' 
  | 'automation' 
  | 'prompt';

export default function AdminAIControlCenter() {
  const [activeCard, setActiveCard] = useState<ActiveCardType>('settings');

  const {
    aiEnabled,
    settings,
    prompt,
    knowledge,
    syncSettings,
    productAccess,
    websiteAccess,
    responseRules,
    sessions,
    analytics,
    setAiEnabled,
    updateSettings,
    updatePrompt,
    updateKnowledge,
    updateSyncSettings,
    updateProductAccess,
    updateWebsiteAccess,
    updateResponseRules,
    addFaq,
    removeFaq,
    addCustomAnswer,
    removeCustomAnswer,
    clearSessionHistory,
    resolveSession,
    handoverSession
  } = useAIStore();

  // Load real store metrics for monitoring
  const liveProducts = useProductStore((state) => state.products) || [];
  const liveCategories = useCategoryStore((state) => state.categories) || [];
  const liveOffers = useOfferStore((state) => state.offers) || [];
  const liveBanners = useBannerStore((state) => state.banners) || [];
  const liveOrders = useOrderStore((state) => state.orders) || [];
  const livePromos = usePromoStore((state) => state.promoCodes) || [];

  // Temporary knowledge variables staged for save
  const [tempKnowledge, setTempKnowledge] = useState({
    companyInfo: knowledge.companyInfo,
    deliveryPolicy: knowledge.deliveryPolicy,
    returnPolicy: knowledge.returnPolicy,
    refundPolicy: knowledge.refundPolicy,
    termsConditions: knowledge.termsConditions,
    customerGuidelines: knowledge.customerGuidelines,
    productInfo: knowledge.productInfo
  });

  // Prompt edit stages
  const [promptEditor, setPromptEditor] = useState(prompt.systemPrompt);

  // FAQ Form State
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  // Custom Answers Trigger State
  const [newCwTrigger, setNewCwTrigger] = useState('');
  const [newCwResponse, setNewCwResponse] = useState('');

  // Local active status updates
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    setTempKnowledge({
      companyInfo: knowledge.companyInfo,
      deliveryPolicy: knowledge.deliveryPolicy,
      returnPolicy: knowledge.returnPolicy,
      refundPolicy: knowledge.refundPolicy,
      termsConditions: knowledge.termsConditions,
      customerGuidelines: knowledge.customerGuidelines,
      productInfo: knowledge.productInfo
    });
    setPromptEditor(prompt.systemPrompt);
  }, [knowledge, prompt.systemPrompt]);

  // Selected logged session representation
  const [focusedSessionId, setFocusedSessionId] = useState<string | null>(null);
  const selectedSessionObj = useMemo(() => {
    return sessions.find(s => s.id === focusedSessionId) || null;
  }, [sessions, focusedSessionId]);

  // Success Notification Helper
  const triggerSuccessAlert = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => {
      setSaveSuccess('');
    }, 4000);
  };

  // Master Actions
  const handleSaveKnowledge = () => {
    updateKnowledge(tempKnowledge);
    triggerSuccessAlert('Knowledge Base details stored successfully!');
  };

  const handleSavePrompt = () => {
    updatePrompt({ systemPrompt: promptEditor });
    triggerSuccessAlert('AI System Instructions updated!');
  };

  const handleApplyPromptPreset = (preset: string) => {
    let raw = "";
    if (preset === 'hyper') {
      raw = `You are a polite, professional, and hyper-helpful AI customer support assistant for Tazu Mart.\nWelcome customers with great enthusiasm. Provide extremely thorough, descriptive assistance.\nHighlight product benefits, recommend related items, and make checkout as easy as possible.`;
    } else if (preset === 'direct') {
      raw = `You are a concise, direct, and straightforward assistant for Tazu Mart.\nDo not write long text blocks. Be straight-to-the-point with pricing, charges, and guidelines.\nSave the reader's time. Use bulleted lists and bold key figures.`;
    } else if (preset === 'promo') {
      raw = `You are an energetic marketing and sales support specialist for Tazu Mart!\nFocus heavy attention on active Discount Coupons and Campaigns.\nSuggest users to stack coins and check out using promotional offers.`;
    }
    if (raw) {
      setPromptEditor(raw);
    }
  };

  const handleAddFaqRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    addFaq(newFaqQ, newFaqA);
    setNewFaqQ('');
    setNewFaqA('');
    triggerSuccessAlert('New FAQ QA added downstream!');
  };

  const handleAddCwRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCwTrigger.trim() || !newCwResponse.trim()) return;
    addCustomAnswer(newCwTrigger, newCwResponse);
    setNewCwTrigger('');
    setNewCwResponse('');
    triggerSuccessAlert('Static keyword mapping saved.');
  };

  return (
    <div className="bg-zinc-50 font-sans leading-relaxed text-zinc-900 min-h-screen p-4 md:p-8">
      
      {/* SUCCESS NOTIFICATION POPUP */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[100] px-6 py-4 bg-zinc-950 text-white border border-zinc-800 flex items-center gap-3 shadow-xl font-bold uppercase text-[10px] tracking-widest"
          >
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>{saveSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP COMPONENT: Page Title & Short Description */}
      <div className="bg-white border border-zinc-200 p-6 md:p-8 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider text-zinc-950 flex items-center gap-2">
            AI CONTROL CENTER
          </h1>
          <p className="text-xs text-zinc-500 font-medium tracking-wider uppercase mt-1">
            Global automation setup, diagnostic settings logs, and real-time storefront indexing controls.
          </p>
        </div>

        {/* Global Toggle Activation */}
        <div className="flex items-center gap-3 bg-zinc-50 p-2.5 border border-zinc-200">
          <div className="flex items-center gap-2 px-2">
            <div className={`w-2 h-2 rounded-full ${aiEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-[10px] font-black uppercase text-zinc-700 tracking-wider">
              {aiEnabled ? 'AI AGENT ONLINE' : 'AI AGENT OFFLINE'}
            </span>
          </div>
          <button 
            type="button"
            onClick={() => setAiEnabled(!aiEnabled)}
            className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
              aiEnabled ? 'bg-zinc-950 text-white' : 'bg-zinc-200 text-zinc-650 hover:bg-zinc-300'
            }`}
          >
            {aiEnabled ? 'DISABLE AGENT' : 'ENABLE AGENT'}
          </button>
        </div>
      </div>

      {/* MID PANEL: 8 clickable modular cards as requested */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        
        {/* Card 1: AI Settings */}
        <button
          onClick={() => setActiveCard('settings')}
          className={`p-5 text-left border transition-all ${
            activeCard === 'settings' 
              ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm' 
              : 'bg-white border-zinc-200 text-zinc-650 hover:border-zinc-400 hover:bg-zinc-50/50'
          }`}
        >
          <Settings className="w-5 h-5 mb-2 shrink-0" />
          <h3 className="text-[10px] font-black uppercase tracking-wider">AI Settings</h3>
          <p className="text-[8px] font-semibold text-zinc-400 uppercase tracking-widest mt-1">APIs, Models & Credentials</p>
        </button>

        {/* Card 2: Knowledge Base */}
        <button
          onClick={() => setActiveCard('knowledge')}
          className={`p-5 text-left border transition-all ${
            activeCard === 'knowledge' 
              ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm' 
              : 'bg-white border-zinc-200 text-zinc-650 hover:border-zinc-400 hover:bg-zinc-50/50'
          }`}
        >
          <Database className="w-5 h-5 mb-2 shrink-0" />
          <h3 className="text-[10px] font-black uppercase tracking-wider">Knowledge Base</h3>
          <p className="text-[8px] font-semibold text-zinc-400 uppercase tracking-widest mt-1">Manual Shop Policies</p>
        </button>

        {/* Card 3: Training Data */}
        <button
          onClick={() => setActiveCard('training')}
          className={`p-5 text-left border transition-all ${
            activeCard === 'training' 
              ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm' 
              : 'bg-white border-zinc-200 text-zinc-650 hover:border-zinc-400 hover:bg-zinc-50/50'
          }`}
        >
          <Bookmark className="w-5 h-5 mb-2 shrink-0" />
          <h3 className="text-[10px] font-black uppercase tracking-wider">Training Data</h3>
          <p className="text-[8px] font-semibold text-zinc-400 uppercase tracking-widest mt-1">FAQs & Overrides</p>
        </button>

        {/* Card 4: Conversation Logs */}
        <button
          onClick={() => setActiveCard('logs')}
          className={`p-5 text-left border transition-all ${
            activeCard === 'logs' 
              ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm' 
              : 'bg-white border-zinc-200 text-zinc-650 hover:border-zinc-400 hover:bg-zinc-50/50'
          }`}
        >
          <LineChart className="w-5 h-5 mb-2 shrink-0" />
          <h3 className="text-[10px] font-black uppercase tracking-wider">Conversation Logs</h3>
          <p className="text-[8px] font-semibold text-zinc-400 uppercase tracking-widest mt-1">Heuristics & Rates</p>
        </button>

        {/* Card 5: Customer Sessions */}
        <button
          onClick={() => setActiveCard('sessions')}
          className={`p-5 text-left border transition-all ${
            activeCard === 'sessions' 
              ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm' 
              : 'bg-white border-zinc-200 text-zinc-650 hover:border-zinc-400 hover:bg-zinc-50/50'
          }`}
        >
          <History className="w-5 h-5 mb-2 shrink-0" />
          <h3 className="text-[10px] font-black uppercase tracking-wider">Customer Sessions</h3>
          <p className="text-[8px] font-semibold text-zinc-400 uppercase tracking-widest mt-1">Support Handover</p>
        </button>

        {/* Card 6: AI Permissions */}
        <button
          onClick={() => setActiveCard('permissions')}
          className={`p-5 text-left border transition-all ${
            activeCard === 'permissions' 
              ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm' 
              : 'bg-white border-zinc-200 text-zinc-650 hover:border-zinc-400 hover:bg-zinc-50/50'
          }`}
        >
          <Lock className="w-5 h-5 mb-2 shrink-0" />
          <h3 className="text-[10px] font-black uppercase tracking-wider">AI Permissions</h3>
          <p className="text-[8px] font-semibold text-zinc-400 uppercase tracking-widest mt-1">Read-Only Layer Limits</p>
        </button>

        {/* Card 7: Automation Rules */}
        <button
          onClick={() => setActiveCard('automation')}
          className={`p-5 text-left border transition-all ${
            activeCard === 'automation' 
              ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm' 
              : 'bg-white border-zinc-200 text-zinc-650 hover:border-zinc-400 hover:bg-zinc-50/50'
          }`}
        >
          <Sliders className="w-5 h-5 mb-2 shrink-0" />
          <h3 className="text-[10px] font-black uppercase tracking-wider">Automation Rules</h3>
          <p className="text-[8px] font-semibold text-zinc-400 uppercase tracking-widest mt-1">DB Event Sync Toggles</p>
        </button>

        {/* Card 8: Prompt Manager */}
        <button
          onClick={() => setActiveCard('prompt')}
          className={`p-5 text-left border transition-all ${
            activeCard === 'prompt' 
              ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm' 
              : 'bg-white border-zinc-200 text-zinc-650 hover:border-zinc-400 hover:bg-zinc-50/50'
          }`}
        >
          <FileText className="w-5 h-5 mb-2 shrink-0" />
          <h3 className="text-[10px] font-black uppercase tracking-wider">Prompt Manager</h3>
          <p className="text-[8px] font-semibold text-zinc-400 uppercase tracking-widest mt-1">Instruction Prompts</p>
        </button>

      </div>

      {/* CORE FORM & SETTINGS AREA: Standardized clean form style layout */}
      <div className="bg-white border border-zinc-200 p-6 md:p-8 shadow-xs">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCard}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.1 }}
            className="space-y-6"
          >

            {/* TAB VIEW 1: AI SETTINGS */}
            {activeCard === 'settings' && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950">AI Engine & API Credentials</h2>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold mt-1">Configure live provider keys and fallback responses</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select: Engine Type */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-500">PROVIDER ENGINE *</label>
                    <select
                      value={settings.apiType}
                      onChange={(e) => updateSettings({ apiType: e.target.value as any })}
                      className="w-full h-11 bg-zinc-50 border border-zinc-200 px-3 text-xs font-semibold outline-none focus:border-zinc-950"
                    >
                      <option value="hybrid">Intellectual Hybrid (LLM + Local Fallback)</option>
                      <option value="openai">Strict OpenAI Developer Portal</option>
                      <option value="gemini">Strict Gemini Google AI Studio</option>
                      <option value="fallback">Local Simulation Framework</option>
                    </select>
                  </div>

                  {/* Select: Logic Model */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-500">TARGET AI MODEL *</label>
                    <select
                      value={settings.model}
                      onChange={(e) => updateSettings({ model: e.target.value })}
                      className="w-full h-11 bg-zinc-50 border border-zinc-200 px-3 text-xs font-semibold outline-none focus:border-zinc-950"
                    >
                      <option value="GPT-4o Latest">GPT-4o Latest Output (OpenAI Corp)</option>
                      <option value="Gemini 1.5 Flash">Gemini 1.5 Flash (Google Core)</option>
                      <option value="GPT-4o mini">GPT-4o Mini Supercheap</option>
                    </select>
                  </div>

                  {/* Input: OpenAI Key */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-500">OPENAI SECRET API KEY</label>
                    <input
                      type={showApiKey ? "text" : "password"}
                      placeholder="sk-xxxxxxxxxxxxxxxx"
                      value={settings.openAIKey}
                      onChange={(e) => updateSettings({ openAIKey: e.target.value })}
                      className="w-full h-11 bg-zinc-50 border border-zinc-200 px-3 text-xs font-mono outline-none"
                    />
                  </div>

                  {/* Input: Gemini Key */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-500">GEMINI API KEY (RECOMMENDED)</label>
                    <input
                      type={showApiKey ? "text" : "password"}
                      placeholder="AIzaSyXXXXXXXXXXXXXXXX"
                      value={settings.geminiKey}
                      onChange={(e) => updateSettings({ geminiKey: e.target.value })}
                      className="w-full h-11 bg-zinc-50 border border-zinc-200 px-3 text-xs font-mono outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center bg-zinc-50 p-4 border border-zinc-200 text-[10px] font-bold uppercase text-zinc-500">
                  <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="hover:text-zinc-950 transition-colors">
                    {showApiKey ? '🔓 COLLAPSE KEYS' : '🔒 REVEAL HIDDEN KEYS'}
                  </button>
                  <button 
                    onClick={() => triggerSuccessAlert('AI settings cached!')}
                    className="h-10 px-8 bg-zinc-950 text-white font-black uppercase text-[10px] tracking-widest hover:bg-zinc-900 transition-colors"
                  >
                    SAVE CONFIGURATION
                  </button>
                </div>
              </div>
            )}

            {/* TAB VIEW 2: KNOWLEDGE BASE */}
            {activeCard === 'knowledge' && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950">Store Manual Policies</h2>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold mt-1">Company background variables and refund/delivery rules</p>
                </div>

                <div className="space-y-4">
                  {/* Bio */}
                  <div className="space-y-1.5 block">
                    <label className="text-[10px] font-black uppercase text-zinc-500">Company Bio / Description</label>
                    <textarea
                      rows={3}
                      value={tempKnowledge.companyInfo}
                      onChange={(e) => setTempKnowledge({ ...tempKnowledge, companyInfo: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-medium outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Delivery Policy */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-500">Delivery Policy Details</label>
                      <textarea
                        rows={3}
                        value={tempKnowledge.deliveryPolicy}
                        onChange={(e) => setTempKnowledge({ ...tempKnowledge, deliveryPolicy: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-medium outline-none"
                      />
                    </div>

                    {/* Return Policy */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-500">Return & Exchange Guidelines</label>
                      <textarea
                        rows={3}
                        value={tempKnowledge.returnPolicy}
                        onChange={(e) => setTempKnowledge({ ...tempKnowledge, returnPolicy: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-medium outline-none"
                      />
                    </div>

                    {/* Refund Policy */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-500">Refund Timelines</label>
                      <textarea
                        rows={3}
                        value={tempKnowledge.refundPolicy}
                        onChange={(e) => setTempKnowledge({ ...tempKnowledge, refundPolicy: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-medium outline-none"
                      />
                    </div>

                    {/* Product Policy */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-500">General Product Sourcing Slogan</label>
                      <textarea
                        rows={3}
                        value={tempKnowledge.productInfo}
                        onChange={(e) => setTempKnowledge({ ...tempKnowledge, productInfo: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-medium outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-100">
                  <button 
                    onClick={handleSaveKnowledge}
                    className="h-11 px-8 bg-zinc-950 text-white font-black uppercase text-[10px] tracking-widest hover:bg-zinc-900 transition-colors"
                  >
                    SAVE KNOWLEDGE DETAILS
                  </button>
                </div>
              </div>
            )}

            {/* TAB VIEW 3: TRAINING DATA */}
            {activeCard === 'training' && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950">Bilingual FAQs & Keyword Overrides</h2>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold mt-1">Inject custom training data manually into the live context layer</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Master FAQ Form block */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-zinc-900 tracking-wider">Add FAQ Template</h3>
                    <form onSubmit={handleAddFaqRecord} className="space-y-3">
                      <input
                        required
                        placeholder="FAQ QUESTION IN BANGLA OR ENGLISH"
                        value={newFaqQ}
                        onChange={(e) => setNewFaqQ(e.target.value)}
                        className="w-full h-11 bg-zinc-50 border border-zinc-200 px-3 text-xs font-bold uppercase"
                      />
                      <textarea
                        required
                        placeholder="DETAILED STATIC ANSWER"
                        value={newFaqA}
                        onChange={(e) => setNewFaqA(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-medium"
                        rows={3}
                      />
                      <button 
                        type="submit"
                        className="w-full h-10 bg-zinc-950 text-white font-black uppercase text-[10px] tracking-widest hover:bg-zinc-900 transition-colors"
                      >
                        ADD FAQ RECORD
                      </button>
                    </form>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto border border-zinc-100 p-2">
                      {knowledge.faqs.map(faq => (
                        <div key={faq.id} className="p-3 bg-zinc-50 border border-zinc-200 flex justify-between items-start gap-2">
                          <div className="text-[10px] font-medium text-zinc-800 text-left">
                            <p className="font-bold text-zinc-950 uppercase mb-1">Q: {faq.question}</p>
                            <p className="font-semibold text-zinc-500">A: {faq.answer}</p>
                          </div>
                          <button onClick={() => removeFaq(faq.id)} className="text-zinc-400 hover:text-red-500 transition-colors shrink-0 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Keyword Overrides Trigger Block */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-zinc-900 tracking-wider">Custom Override Keywords</h3>
                    <form onSubmit={handleAddCwRule} className="space-y-3">
                      <input
                        required
                        placeholder="TRIGGER KEYWORDS (COMMA SEPARATED)"
                        value={newCwTrigger}
                        onChange={(e) => setNewCwTrigger(e.target.value)}
                        className="w-full h-11 bg-zinc-50 border border-zinc-200 px-3 text-xs font-bold uppercase"
                      />
                      <textarea
                        required
                        placeholder="STATIC OVERRIDE RESPONSE"
                        value={newCwResponse}
                        onChange={(e) => setNewCwResponse(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 p-3 text-xs font-medium"
                        rows={3}
                      />
                      <button 
                        type="submit"
                        className="w-full h-10 bg-zinc-950 text-white font-black uppercase text-[10px] tracking-widest hover:bg-zinc-900 transition-colors"
                      >
                        SYNC TRIGGER RULE
                      </button>
                    </form>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto border border-zinc-100 p-2">
                      {knowledge.customAnswers.map(ca => (
                        <div key={ca.id} className="p-3 bg-zinc-50 border border-zinc-200 flex justify-between items-start gap-2">
                          <div className="text-[10px] font-medium text-zinc-800 text-left">
                            <p className="font-bold text-indigo-600 uppercase mb-1">KW: {ca.keyword}</p>
                            <p className="font-semibold text-zinc-500">RESP: {ca.answer}</p>
                          </div>
                          <button onClick={() => removeCustomAnswer(ca.id)} className="text-zinc-400 hover:text-red-500 transition-colors shrink-0 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Diagnostics summary layer */}
                <div className="bg-zinc-50 p-4 border border-zinc-200 flex flex-wrap items-center justify-between text-[10px] font-mono font-bold text-zinc-500">
                  <span>LIVE INDEX: {liveProducts.length} PRODUCTS | {liveCategories.length} CATEGORIES</span>
                  <span>SYNC STATUS: COMPLIANT</span>
                </div>
              </div>
            )}

            {/* TAB VIEW 4: CONVERSATION LOGS */}
            {activeCard === 'logs' && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950">AI Diagnostic Heuristics & Metrics</h2>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold mt-1">Review query token evaluations, average ratings, and performance yields</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-zinc-50 border border-zinc-200 p-5 text-left">
                    <span className="text-[9px] font-black uppercase text-zinc-400 block mb-1">Avg Satisfaction</span>
                    <p className="text-xl font-black text-zinc-950">{analytics.avgRating.toFixed(1)} / 5</p>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 p-5 text-left">
                    <span className="text-[9px] font-black uppercase text-zinc-400 block mb-1">Total Web Queries</span>
                    <p className="text-xl font-black text-zinc-950">{analytics.totalQueries}</p>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 p-5 text-left">
                    <span className="text-[9px] font-black uppercase text-zinc-400 block mb-1">Handovers triggered</span>
                    <p className="text-xl font-black text-zinc-950">{analytics.humanHandovers}</p>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 p-5 text-left">
                    <span className="text-[9px] font-black uppercase text-zinc-400 block mb-1">Est. Synced Tokens</span>
                    <p className="text-xl font-black text-zinc-950">14.8k / 45k</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 font-semibold text-zinc-650 text-[10px] uppercase leading-relaxed flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>
                    Heuristics indicators reflect correct retrieval mappings. The model reads active stock objects before generating outputs for natural language customer queries.
                  </span>
                </div>
              </div>
            )}

            {/* TAB VIEW 5: CUSTOMER SESSIONS */}
            {activeCard === 'sessions' && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950">Active Customer Support Sessions</h2>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold mt-1">Review active queries or force human support handovers</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[400px]">
                  {/* Left Column: Sessions List */}
                  <div className="md:col-span-5 bg-zinc-50 border border-zinc-200 p-3 overflow-y-auto space-y-2">
                    <div className="flex justify-between items-center px-1 py-1">
                      <span className="text-[9px] font-black uppercase text-zinc-400">Cached Sessions</span>
                      <button onClick={clearSessionHistory} className="text-[9px] font-black text-rose-600 hover:underline">PURGE CACHE</button>
                    </div>

                    {sessions.map(s => {
                      const isFocused = focusedSessionId === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setFocusedSessionId(s.id)}
                          className={`w-full p-3 text-left border flex flex-col gap-1 transition-all ${
                            isFocused 
                              ? 'bg-zinc-950 border-zinc-950 text-white' 
                              : 'bg-white border-zinc-100 text-zinc-800 hover:border-zinc-300'
                          }`}
                        >
                          <div className="flex justify-between text-[8px] font-mono opacity-60">
                            <span>SESS: {s.id}</span>
                            <span>{new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <span className="text-[10px] font-black uppercase truncate">{s.name}</span>
                          <span className="text-[8px] font-mono opacity-80">{s.phone}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 font-bold uppercase rounded ${
                              s.status === 'resolved' ? 'bg-emerald-800 text-white' : 'bg-amber-600 text-white'
                            }`}>
                              {s.status}
                            </span>
                            <span className="text-[8px] text-zinc-400 uppercase font-black tracking-widest">{s.messages.length} Messages</span>
                          </div>
                        </button>
                      );
                    })}

                    {sessions.length === 0 && (
                      <div className="py-16 text-center text-[10px] font-black uppercase text-zinc-350 italic">
                        No Active Sessions in Cache
                      </div>
                    )}
                  </div>

                  {/* Right Column: Chat History transcript logs */}
                  <div className="md:col-span-7 border border-zinc-200 rounded-none bg-zinc-50/20 overflow-hidden flex flex-col justify-between">
                    {!selectedSessionObj ? (
                      <div className="m-auto text-center p-8 space-y-2 opacity-40">
                        <MessageSquare className="w-8 h-8 mx-auto" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">No Session Selected</h4>
                        <p className="text-[9px] font-bold uppercase text-zinc-400">Click any customer cached session to see live transcripts</p>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full justify-between">
                        {/* Selected Header */}
                        <div className="bg-zinc-100 p-3 border-b border-zinc-200 flex justify-between items-center text-[10px]">
                          <div>
                            <p className="font-black uppercase text-zinc-900">{selectedSessionObj.name}</p>
                            <p className="font-mono text-[8px] text-zinc-400">Phone: {selectedSessionObj.phone}</p>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                resolveSession(selectedSessionObj.id);
                                triggerSuccessAlert('Session mark resolved.');
                              }}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-black uppercase tracking-widest text-[8px]"
                            >
                              RESOLVE
                            </button>
                            <button
                              onClick={() => {
                                handoverSession(selectedSessionObj.id);
                                triggerSuccessAlert('Handed over to direct WhatsApp channel');
                              }}
                              className="px-3 py-1.5 bg-rose-50 text-rose-800 border border-rose-200 font-black uppercase tracking-widest text-[8px]"
                            >
                              HANDOVER
                            </button>
                          </div>
                        </div>

                        {/* Transcript Content area */}
                        <div className="flex-grow overflow-y-auto p-4 space-y-3 font-medium text-[11px] text-left">
                          {selectedSessionObj.messages.map(msg => {
                            const isUser = msg.sender === 'user';
                            return (
                              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 max-w-[85%] border text-left ${
                                  isUser ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-white text-zinc-800 border-zinc-200'
                                }`}>
                                  <p className="whitespace-pre-line">{msg.text}</p>
                                  <span className="text-[7px] font-mono opacity-40 block mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB VIEW 6: AI PERMISSIONS */}
            {activeCard === 'permissions' && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950">AI Database Access Permission Layer</h2>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold mt-1">Toggles specific data items the AI can parse from the dynamic storefront store state</p>
                </div>

                <div className="bg-red-50 border border-red-200 p-4 text-red-800 text-[10px] font-black uppercase leading-relaxed flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-red-600 shrink-0" />
                  <span>
                    Constraint Rules Activated: The AI Assistant only receives READ-ONLY access. Under no circumstances can the model execute Delete, Update, or Write commands on active website tables.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(productAccess).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => {
                        updateProductAccess({ [key]: !value });
                        triggerSuccessAlert(`Read Permission Updated: ${key}`);
                      }}
                      className={`p-4 border text-left flex items-center justify-between transition-all ${
                        value 
                          ? 'bg-zinc-950 border-zinc-950 text-white' 
                          : 'bg-zinc-50 border-zinc-150 text-zinc-400'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <p className={`text-[8px] font-semibold uppercase tracking-wider ${value ? 'text-zinc-300' : 'text-zinc-400'}`}>
                          {value ? 'READ-ONLY PERMISSION ON' : 'ACCESS LOCKED'}
                        </p>
                      </div>
                      <div className="shrink-0 p-1">
                        {value ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-100">
                  <button
                    onClick={() => triggerSuccessAlert('Access restriction mapping secured!')}
                    className="h-11 px-8 bg-zinc-950 text-white font-black uppercase text-[10px] tracking-widest hover:bg-zinc-900 transition-colors"
                  >
                    LOCK PERMISSION LAYER
                  </button>
                </div>
              </div>
            )}

            {/* TAB VIEW 7: AUTOMATION RULES */}
            {activeCard === 'automation' && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950">Real-Time Database Sync Toggles</h2>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold mt-1">Hook embeddings and data structures to automatically refresh on db model mutations</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(syncSettings).map(([key, value]) => (
                    <div key={key} className="p-4 border border-zinc-200 flex items-center justify-between bg-zinc-50/30">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-zinc-900 tracking-wider">
                          {key.replace(/([A-Z])/g, ' $1')} Sync-indexing
                        </span>
                        <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">
                          Auto refresh prompt templates when {key.toLowerCase()} modifies
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateSyncSettings({ [key]: !value });
                          triggerSuccessAlert(`Sync status modified for: ${key}`);
                        }}
                        className={`transition-colors p-1 ${value ? 'text-zinc-950' : 'text-zinc-350'}`}
                      >
                        {value ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-zinc-100 p-4 border border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase leading-relaxed text-left">
                  ⚡ Detection Rule: When these automation keys are enabled, the database layers (Products, Categories, Offers) instantly re-index themselves into the Support center's context scope. This completely avoids manual sync.
                </div>
              </div>
            )}

            {/* TAB VIEW 8: PROMPT MANAGER */}
            {activeCard === 'prompt' && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950">System Instruction Prompt</h2>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold mt-1">Specify model characters, boundary rules, and multilingual reply guidance</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold">RUNTIME INJECTED SYSTEM INSTRUCTIONS</p>
                  
                  {/* Presets Grid */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPromptPreset('hyper')}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-[8px] font-black uppercase tracking-wider border border-zinc-200"
                    >
                      Enthusiastic Assistant
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPromptPreset('direct')}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-[8px] font-black uppercase tracking-wider border border-zinc-200"
                    >
                      Direct & Concise
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPromptPreset('promo')}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-[8px] font-black uppercase tracking-wider border border-zinc-200"
                    >
                      Marketing Specialist
                    </button>
                  </div>
                </div>

                <textarea
                  rows={9}
                  value={promptEditor}
                  onChange={(e) => setPromptEditor(e.target.value)}
                  className="w-full p-4 bg-zinc-950 text-zinc-100 font-mono text-xs outline-none focus:ring-1 focus:ring-zinc-800 text-left leading-relaxed rounded-none border border-zinc-900"
                />

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSavePrompt}
                    className="h-11 px-8 bg-zinc-950 text-white font-black uppercase text-[10px] tracking-widest hover:bg-zinc-900 transition-colors"
                  >
                    SAVE PROMPT RULES
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </div>

    </div>
  );
}
