import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, Search, TrendingUp, Zap, Star, 
  ChevronRight, ArrowLeft, History, 
  ShoppingBag, Sparkles, Flame, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useProductStore } from '../../store/useProductStore';
import { useSearchStore } from '../../store/useSearchStore';
import { cn } from '../../lib/utils';
import { filterProductsSmart } from '../../utils/fuzzySearch';

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { categories } = useCategoryStore();
  const { products } = useProductStore();
  const { addSearch } = useSearchStore();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCategories = useMemo(() => {
    return [...categories]
      .filter(c => String(c.status || 'Active').toLowerCase() === 'active')
      .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0))
      .slice(0, 8);
  }, [categories]);

  // Load recent searches from localStorage
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('recent_searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          setRecentSearches([]);
        }
      }
    }
  }, [isOpen]);

  // Underneath mouse/tap outside click handler in desktop view
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSearchExecute = (queryText: string) => {
    const query = queryText.trim();
    if (!query) return;

    // Save to local recent searches for user
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 8);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));

    // Clear and state transitions
    setSearchQuery('');
    onClose();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchExecute(searchQuery);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  // Popular trending items definition
  const trendingSearches = [
    'Watch',
    'Perfume',
    'Smart Watch',
    'Wallet',
    'Earbuds'
  ];

  // Dynamic Suggestion Drops based on Typed Input (Daraz-like structure)
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const list: { id: string; text: string; rawText: string; type: 'query' | 'category' | 'product' | 'keyword' }[] = [];

    // 1. Raw search suggestion
    list.push({
      id: 'raw-query',
      text: q,
      rawText: searchQuery,
      type: 'query'
    });

    // 2. Matching Categories (e.g. "Watch in Electronics")
    const matchedCats = categories.filter(c => 
      c.name.toLowerCase().includes(q) && c.status === 'Active'
    );
    matchedCats.forEach(cat => {
      list.push({
        id: `cat-${cat.id}`,
        text: `${searchQuery} in ${cat.name}`,
        rawText: `${searchQuery} in ${cat.name}`,
        type: 'category'
      });
    });

    // 3. Exact keywords / product tags matching
    const collectedKeywords = new Set<string>();
    products.forEach(p => {
      if (p.status === 'active' || !p.status) {
        if (p.name.toLowerCase().includes(q)) {
          // Add product name suggestion
          list.push({
            id: `prod-${p.id}`,
            text: p.name,
            rawText: p.name,
            type: 'product'
          });
        }
        
        // Match custom store keywords
        (p.keywords || []).forEach(keyword => {
          if (keyword.toLowerCase().includes(q)) {
            collectedKeywords.add(keyword);
          }
        });
      }
    });

    Array.from(collectedKeywords).slice(0, 4).forEach((kw, i) => {
      list.push({
        id: `kw-${i}-${kw}`,
        text: kw,
        rawText: kw,
        type: 'keyword'
      });
    });

    // Deduplicate list suggestions based on lowering of text
    const seen = new Set<string>();
    return list.filter(item => {
      const lowerText = item.text.toLowerCase();
      if (seen.has(lowerText)) return false;
      seen.add(lowerText);
      return true;
    }).slice(0, 8); // Top 8 suggestions max

  }, [searchQuery, categories, products]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-0 md:pt-16 px-0 md:px-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-neutral-950/45 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div 
            ref={containerRef}
            initial={{ y: '100%', opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 1 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="relative w-full max-w-2xl bg-white flex flex-col h-full md:h-auto md:max-h-[80vh] md:rounded-3xl shadow-2xl overflow-hidden pt-[env(safe-area-inset-top,0px)]"
          >
            {/* Search Input Bar Header */}
            <div className="px-4 py-4 border-b border-neutral-100 flex items-center gap-3 bg-neutral-50/50">
              <button 
                onClick={onClose}
                className="p-2 -ml-2 text-neutral-900 md:hidden"
              >
                <ArrowLeft className="w-5.5 h-5.5" />
              </button>
              
              <form onSubmit={handleFormSubmit} className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Search className="w-4 h-4" />
                </div>
                <input 
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="I am looking for..."
                  className="w-full h-11 bg-white rounded-full pl-11 pr-20 text-sm font-semibold outline-none border border-neutral-200 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-900/5 transition-all text-neutral-900"
                />
                
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1.5 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-900 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button 
                    type="submit"
                    className="h-8 px-4 bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>

              <button 
                onClick={onClose}
                className="hidden md:flex p-2 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-900 transition-all shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Suggestions dropdown viewport */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
              
              {searchQuery.trim().length > 0 ? (
                /* SMART LIVE SUGGESTIONS SECTION */
                <div className="space-y-1 animate-fadeIn">
                  <div className="px-1 pb-2 flex justify-between items-center text-neutral-400 border-b border-neutral-50">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Smart Suggestions</span>
                    <span className="text-[9px] font-bold text-neutral-300 uppercase">Input matched</span>
                  </div>
                  
                  <div className="divide-y divide-neutral-50 max-h-[50vh] overflow-y-auto">
                    {suggestions.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => handleSearchExecute(item.rawText)}
                        className="w-full flex items-center justify-between py-3 px-2 rounded-xl hover:bg-neutral-50 transition-all group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Search className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transition-colors shrink-0" />
                          <span className="text-xs font-bold text-neutral-800 group-hover:text-black transition-colors lowercase first-letter:uppercase">
                            {item.text}
                          </span>
                        </div>
                        {item.type === 'category' && (
                          <span className="text-[8px] font-extrabold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-wider">Category</span>
                        )}
                        {item.type === 'product' && (
                          <span className="text-[8px] font-extrabold bg-green-50 text-green-600 px-2 py-0.5 rounded uppercase tracking-wider">Product</span>
                        )}
                        {item.type === 'keyword' && (
                          <span className="text-[8px] font-extrabold bg-purple-50 text-purple-600 px-2 py-0.5 rounded uppercase tracking-wider">Keyword</span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-100 group-hover:text-neutral-400 transition-all" />
                      </button>
                    ))}
                    {suggestions.length === 0 && (
                      <div className="py-8 text-center text-neutral-400 text-xs font-bold uppercase tracking-widest">
                        Awaiting spell checks...
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* DEFAULT VIEW (Recent & Popular Trending items) */
                <>
                  {/* Popular Products Tags Buttons */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 px-1">
                      <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                      <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Trending Searches</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map(tag => (
                        <button 
                          key={tag}
                          onClick={() => handleSearchExecute(tag)}
                          className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200/80 transition-colors text-neutral-900 text-xs font-semibold flex items-center gap-2 border border-neutral-200/20"
                        >
                          <TrendingUp className="w-3 h-3 text-neutral-400" />
                          <span>{tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Searches */}
                  {recentSearches.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-neutral-400" />
                          <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Recent History</h3>
                        </div>
                        <button 
                          onClick={clearRecent} 
                          className="text-[9px] font-black text-neutral-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                        >
                          Clear History
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {recentSearches.map((term, idx) => (
                          <button 
                            key={`${term}-${idx}`}
                            onClick={() => handleSearchExecute(term)}
                            className="flex items-center justify-between py-2 px-3 rounded-lg border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition-colors text-left group"
                          >
                            <span className="text-xs font-semibold text-neutral-700 truncate pr-2 group-hover:text-black">{term}</span>
                            <History className="w-3 h-3 text-neutral-300 group-hover:text-neutral-600 transition-colors shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Browse Popular Discovery Categories */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                        <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Popular Discoveries</h3>
                      </div>
                      <Link to="/categories" onClick={onClose} className="text-[10px] font-black text-neutral-900 uppercase underline">View All</Link>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {activeCategories.map((cat) => (
                        <button 
                          key={cat.id}
                          onClick={() => { onClose(); navigate(`/category/${cat.id}`); }}
                          className="flex flex-col items-center gap-1.5 group active:scale-95 transition-all text-center"
                        >
                          <div className="w-full aspect-square bg-neutral-50 border border-neutral-100 flex items-center justify-center p-0.5 overflow-hidden shadow-sm hover:border-black/20 hover:shadow-md transition-all">
                            {cat.iconImage || cat.bannerImage ? (
                              <img 
                                src={cat.iconImage || cat.bannerImage} 
                                alt={cat.name} 
                                className="w-full h-full object-cover rounded filter group-hover:scale-105 transition-transform duration-300" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <ShoppingBag className="w-5 h-5 text-neutral-300" />
                            )}
                          </div>
                          <span className="text-[9px] font-extrabold uppercase text-neutral-500 leading-tight tracking-tight group-hover:text-black transition-colors block h-[2.5em] overflow-hidden">
                            {cat.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

            </div>

            {/* Footer Bottom Safe Area */}
            <div className="h-[env(safe-area-inset-bottom,20px)] bg-white shrink-0" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
