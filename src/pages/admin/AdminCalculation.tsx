import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Plus, 
  Search, 
  DollarSign, 
  Package, 
  TrendingUp, 
  Percent, 
  BarChart3, 
  Save, 
  Trash2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductStore } from '../../store/useProductStore';

interface CalculationEntry {
  id: string;
  productId: string;
  productName: string;
  buyingPrice: number;
  sellPrice: number;
  discountSell: number;
  stock: number;
  profit: number;
  date: string;
}

export default function AdminCalculation() {
  const navigate = useNavigate();
  const { products } = useProductStore();
  
  // Selection State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [history, setHistory] = useState<CalculationEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Current Calculation Values (Editable)
  const [currentCalc, setCurrentCalc] = useState({
    buyingPrice: 0,
    sellingPrice: 0,
    discountPrice: 0,
    stock: 0
  });

  // Handle Product Selection
  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    const product = products.find(p => p.id === id);
    if (product) {
      setCurrentCalc({
        buyingPrice: product.buyingPrice || 0,
        sellingPrice: product.price || 0,
        discountPrice: product.discountPrice || product.price || 0,
        stock: product.stock || 0
      });
    }
  };

  // Derived Calculations
  const stats = useMemo(() => {
    const { buyingPrice, sellingPrice, discountPrice, stock } = currentCalc;
    const profitPerPiece = sellingPrice - buyingPrice;
    const discountProfit = discountPrice - buyingPrice;
    const totalStockProfit = profitPerPiece * stock;
    const profitMargin = sellingPrice > 0 ? (profitPerPiece / sellingPrice) * 100 : 0;

    return {
      profitPerPiece,
      discountProfit,
      totalStockProfit,
      profitMargin
    };
  }, [currentCalc]);

  const saveCalculation = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const newEntry: CalculationEntry = {
      id: Math.random().toString(36).substring(2, 9),
      productId: product.id,
      productName: product.name,
      buyingPrice: currentCalc.buyingPrice,
      sellPrice: currentCalc.sellingPrice,
      discountSell: currentCalc.discountPrice,
      stock: currentCalc.stock,
      profit: stats.totalStockProfit,
      date: new Date().toLocaleDateString()
    };

    setHistory([newEntry, ...history]);
    setIsAdding(false);
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="flex flex-col min-h-full font-sans text-black bg-white">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin')}
            className="p-2 border border-gray-200 rounded-none bg-white hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight">Smart Calculation</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Profit & Margin Analytics</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-black text-white px-6 py-3 rounded-none font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:bg-gray-800 transition-all flex items-center gap-3 active:scale-95"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'Cancel Process' : 'Add New Calculate'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-10 bg-gray-50 p-8 border border-gray-200 shadow-sm"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left: Input Section */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Select Product to Sync</label>
                  <div className="relative">
                    <select 
                      value={selectedProductId}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-black px-5 py-4 rounded-none focus:outline-none focus:border-black transition-all font-bold appearance-none cursor-pointer"
                    >
                      <option value="">Choose Existing Product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                    <Layers className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Buying Price (BDT)</label>
                    <input 
                      type="number"
                      value={currentCalc.buyingPrice}
                      onChange={(e) => setCurrentCalc({...currentCalc, buyingPrice: Number(e.target.value)})}
                      className="w-full bg-white border border-gray-200 text-black px-5 py-4 rounded-none focus:outline-none focus:border-black transition-all font-black text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Selling Price (BDT)</label>
                    <input 
                      type="number"
                      value={currentCalc.sellingPrice}
                      onChange={(e) => setCurrentCalc({...currentCalc, sellingPrice: Number(e.target.value)})}
                      className="w-full bg-white border border-gray-200 text-black px-5 py-4 rounded-none focus:outline-none focus:border-black transition-all font-black text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Discount Price (BDT)</label>
                    <input 
                      type="number"
                      value={currentCalc.discountPrice}
                      onChange={(e) => setCurrentCalc({...currentCalc, discountPrice: Number(e.target.value)})}
                      className="w-full bg-white border border-gray-200 text-black px-5 py-4 rounded-none focus:outline-none focus:border-black transition-all font-black text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Available Stock</label>
                    <input 
                      type="number"
                      value={currentCalc.stock}
                      onChange={(e) => setCurrentCalc({...currentCalc, stock: Number(e.target.value)})}
                      className="w-full bg-white border border-gray-200 text-black px-5 py-4 rounded-none focus:outline-none focus:border-black transition-all font-black text-lg"
                    />
                  </div>
                </div>

                <button 
                  onClick={saveCalculation}
                  disabled={!selectedProductId}
                  className="w-full bg-black text-white py-5 font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-black/10 hover:bg-gray-800 transition-all flex justify-center items-center gap-3 active:scale-95 disabled:opacity-30 disabled:grayscale"
                >
                  <Save className="w-4 h-4" />
                  Save Calculation History
                </button>
              </div>

              {/* Right: Live Preview Results */}
              <div className="bg-white border border-gray-200 p-8 flex flex-col justify-center">
                 <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Calculated Profit Per Piece</p>
                        <h4 className={`text-4xl font-black ${stats.profitPerPiece >= 0 ? 'text-black' : 'text-red-500'}`}>
                           {formatPrice(stats.profitPerPiece)}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <Percent className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Profit Margin Percentage</p>
                        <h4 className="text-4xl font-black text-black">
                           {stats.profitMargin.toFixed(1)}%
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-6 bg-gray-50 border border-gray-100 mt-4">
                      <div className="w-12 h-12 bg-black flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Stock Potential Profit</p>
                        <h4 className="text-3xl font-black text-black">
                           {formatPrice(stats.totalStockProfit)}
                        </h4>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Cards Dashboard */}
      <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-gray-400">Current Market Analysis</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
        <div className="bg-gray-50 p-6 border border-gray-200">
           <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Buying Price</p>
           <p className="text-xl font-black text-black">{formatPrice(currentCalc.buyingPrice)}</p>
        </div>
        <div className="bg-gray-50 p-6 border border-gray-200">
           <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Selling Price</p>
           <p className="text-xl font-black text-black">{formatPrice(currentCalc.sellingPrice)}</p>
        </div>
        <div className="bg-gray-50 p-6 border border-gray-200">
           <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Discount Price</p>
           <p className="text-xl font-black text-black">{formatPrice(currentCalc.discountPrice)}</p>
        </div>
        <div className="bg-gray-50 p-6 border border-gray-200">
           <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Profit/Piece</p>
           <p className="text-xl font-black text-black">{formatPrice(stats.profitPerPiece)}</p>
        </div>
        <div className="bg-black p-6">
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Stock Profit</p>
           <p className="text-xl font-black text-white">{formatPrice(stats.totalStockProfit)}</p>
        </div>
        <div className="bg-blue-600 p-6">
           <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1">Profit Margin %</p>
           <p className="text-xl font-black text-white">{stats.profitMargin.toFixed(1)}%</p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-gray-200 overflow-hidden mb-12">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
           <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-black" />
              <h3 className="text-sm font-black uppercase tracking-widest text-[#000000]">Calculation History</h3>
           </div>
           <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {history.length} RECORDS FOUND
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-400 text-[10px] uppercase tracking-widest font-black border-b border-gray-100">
                <th className="p-5">Product Name</th>
                <th className="p-5">Buying Price</th>
                <th className="p-5">Sell Price</th>
                <th className="p-5">Discount Sell</th>
                <th className="p-5">Stock</th>
                <th className="p-5">Profit</th>
                <th className="p-5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-5">
                    <span className="text-sm font-black text-black">{entry.productName}</span>
                  </td>
                  <td className="p-5 text-sm font-bold text-gray-500">{formatPrice(entry.buyingPrice)}</td>
                  <td className="p-5 text-sm font-bold text-gray-500">{formatPrice(entry.sellPrice)}</td>
                  <td className="p-5 text-sm font-bold text-gray-500">{formatPrice(entry.discountSell)}</td>
                  <td className="p-5 text-sm font-black text-black">{entry.stock} Units</td>
                  <td className="p-5">
                    <span className="text-sm font-black text-blue-600">{formatPrice(entry.profit)}</span>
                  </td>
                  <td className="p-5 text-right">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{entry.date}</span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                     <div className="w-16 h-16 bg-gray-50 mx-auto flex items-center justify-center mb-4">
                        <BarChart3 className="w-6 h-6 text-gray-300" />
                     </div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">No history recorded yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function X(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
