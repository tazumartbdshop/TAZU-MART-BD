import React, { useState } from 'react';
import { useProductStore } from '../../store/useProductStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { 
  Search, Save, Edit2, CheckCircle2, XCircle, Coins, ArrowRight, Package,
  ChevronDown, ChevronUp, Image as ImageIcon, Check, X
} from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function AdminCoinControl() {
  const { products, updateProduct } = useProductStore();
  const { settings, updateSettings } = useSettingsStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Local states for Global Rate
  const [globalCoin, setGlobalCoin] = useState(String(settings.coin_rate_coin || 100));
  const [globalMoney, setGlobalMoney] = useState(String(settings.coin_rate_money || 1));
  
  // Local states for Product editing
  const [editCoins, setEditCoins] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveGlobalRate = () => {
    updateSettings({
      coin_rate_coin: Number(globalCoin),
      coin_rate_money: Number(globalMoney)
    });
    // Optional: show a toast here if available
  };

  const handleExpand = (product: any) => {
    if (expandedId === product.id) {
      setExpandedId(null);
    } else {
      setExpandedId(product.id);
      setEditCoins(String(product.reward_coins || 250));
    }
  };

  const handleSaveProductCoins = (id: string) => {
    updateProduct(id, {
      reward_coins: Number(editCoins),
      coin_enabled: true
    });
    setExpandedId(null);
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* HEADER SECTION */}
      <div className="px-6 py-6 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-none">
              <Coins className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-black uppercase tracking-tighter">Coin Control</h1>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Master Loyalty Rewards System</p>
            </div>
          </div>

          {/* SECTION 1: MAIN COIN RATE */}
          <div className="bg-gray-50 border border-gray-200 p-5 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5">
              <Coins className="w-20 h-20" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500"></span>
                Global Redemption Rate
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 w-full sm:w-auto">
                  <input 
                    type="number" 
                    value={globalCoin}
                    onChange={(e) => setGlobalCoin(e.target.value)}
                    className="w-16 text-lg font-black text-black outline-none bg-transparent"
                  />
                  <span className="text-[9px] font-black text-gray-400 uppercase">Coins</span>
                </div>
                
                <div className="text-xl font-black text-gray-300">=</div>
                
                <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 w-full sm:w-auto">
                  <span className="text-lg font-black text-black">৳</span>
                  <input 
                    type="number" 
                    value={globalMoney}
                    onChange={(e) => setGlobalMoney(e.target.value)}
                    className="w-16 text-lg font-black text-black outline-none bg-transparent"
                  />
                </div>

                <button 
                  onClick={handleSaveGlobalRate}
                  className="bg-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all active:scale-95 flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Rate
                </button>
              </div>
              
              <p className="mt-4 text-[9px] font-bold text-gray-400 uppercase tracking-tight">
                Current: <span className="text-black">{globalCoin} Coins</span> = <span className="text-black">৳{globalMoney} Discount</span>
              </p>
            </div>
          </div>

          {/* SECTION 2: PRODUCT-WISE COIN SETUP */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-black text-black uppercase tracking-tight">Product Wise Setup</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="SEARCH PRODUCTS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-[9px] font-black uppercase tracking-widest focus:border-black outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border border-gray-100 bg-white group">
                {/* Main Row */}
                <div 
                  onClick={() => handleExpand(product)}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 p-0.5 border border-gray-100 flex-shrink-0">
                      <img src={product.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-black text-black uppercase tracking-tight mb-0.5 line-clamp-1">{product.name}</h3>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">{formatPrice(product.price)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden xs:flex flex-col items-end">
                      <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Reward</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-3 h-3 text-orange-500" />
                        <span className="text-xs font-black text-black">{product.reward_coins || 0}</span>
                      </div>
                    </div>
                    
                    <div className={`p-1.5 rounded-full transition-transform ${expandedId === product.id ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-black" />
                    </div>
                  </div>
                </div>

                {/* Expandable Box */}
                <AnimatePresence>
                  {expandedId === product.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-zinc-900 text-white"
                    >
                      <div className="p-5 border-t border-white/5">
                        <div className="max-w-xl">
                          <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-400 mb-4">Setup Rewards: {product.name}</h4>
                          
                          <div className="flex flex-col sm:flex-row items-end gap-6">
                            <div className="flex-1 w-full sm:w-auto">
                              <label className="block text-[8px] font-black uppercase tracking-widest text-white/50 mb-2">Coins for 1 Piece</label>
                              <div className="relative">
                                <input 
                                  type="number" 
                                  value={editCoins}
                                  onChange={(e) => setEditCoins(e.target.value)}
                                  placeholder="e.g. 250"
                                  className="w-full bg-white/5 border border-white/10 px-3 py-3 text-lg font-black text-white outline-none focus:border-orange-500 transition-all"
                                />
                                <Coins className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                              </div>
                            </div>
                            
                            <div className="flex-1 space-y-2 pb-1">
                              <div className="flex items-center gap-2 text-[9px] font-bold text-white/60 uppercase">
                                <Check className="w-3 h-3 text-green-500" />
                                <span>Multiplies by quantity</span>
                              </div>
                              <div className="flex items-center gap-2 text-[9px] font-bold text-white/60 uppercase">
                                <Check className="w-3 h-3 text-green-500" />
                                <span>Shown in Frontend</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 flex gap-3">
                            <button 
                              onClick={() => handleSaveProductCoins(product.id)}
                              className="bg-orange-500 text-white px-6 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all active:scale-95"
                            >
                              Save Settings
                            </button>
                            <button 
                              onClick={() => setExpandedId(null)}
                              className="bg-white/5 text-white px-6 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-gray-100 pt-8 text-center">
            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.4em]">Tazu Mart BD Coin System v3.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
