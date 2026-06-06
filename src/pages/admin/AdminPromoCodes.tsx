import React, { useState } from 'react';
import { 
  Ticket, Plus, Search, Edit, Trash2, 
  Calendar, Users, Percent, CheckCircle, 
  X, AlertCircle, Copy, Power,
  DollarSign, Truck, Save, MoreVertical
} from 'lucide-react';
import { usePromoStore, PromoCode, DiscountType } from '../../store/usePromoStore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export default function AdminPromoCodes() {
  const { promoCodes, addPromoCode, updatePromoCode, deletePromoCode } = usePromoStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Percentage' as DiscountType,
    value: 0,
    minOrder: 0,
    expiryDate: new Date().toISOString().split('T')[0],
    usageLimit: 100,
    status: 'Active' as 'Active' | 'Inactive'
  });

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      name: promo.name || '',
      code: promo.code,
      type: promo.type,
      value: promo.value,
      minOrder: promo.minOrder,
      expiryDate: promo.expiryDate,
      usageLimit: promo.usageLimit,
      status: promo.status === 'Active' ? 'Active' : 'Inactive'
    });
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingPromo(null);
    setFormData({
      name: '',
      code: '',
      type: 'Percentage',
      value: 0,
      minOrder: 0,
      expiryDate: new Date().toISOString().split('T')[0],
      usageLimit: 100,
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Duplicate check
    const isDuplicate = promoCodes.some(p => 
      p.code.toUpperCase() === formData.code.toUpperCase() && 
      (!editingPromo || p.id !== editingPromo.id)
    );

    if (isDuplicate) {
      alert('This promo code already exists in the system.');
      return;
    }

    if (editingPromo) {
      await updatePromoCode(editingPromo.id, {
        name: formData.name,
        code: formData.code.toUpperCase().trim(),
        type: formData.type,
        value: Number(formData.value),
        minOrder: Number(formData.minOrder),
        expiryDate: formData.expiryDate,
        usageLimit: Number(formData.usageLimit),
        status: formData.status
      });
    } else {
      await addPromoCode({
        name: formData.name,
        code: formData.code.toUpperCase().trim(),
        type: formData.type,
        value: Number(formData.value),
        minOrder: Number(formData.minOrder),
        expiryDate: formData.expiryDate,
        usageLimit: Number(formData.usageLimit),
        status: formData.status
      });
    }
    setIsModalOpen(false);
  };

  const filteredPromos = promoCodes.filter(p => 
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black text-white p-6 border border-[#222] rounded-none flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter">Promo Code Manager</h2>
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">Configure ecosystem incentives and checkout overrides</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-white text-black px-6 h-[44px] rounded-none text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Promo Code
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 border border-[#222] flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search directory by code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-[44px] bg-zinc-50 border border-zinc-200 text-black rounded-none text-xs focus:outline-none focus:border-black uppercase tracking-tight font-bold"
          />
        </div>
      </div>

      {/* Promo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPromos.map((promo) => (
            <motion.div
              key={promo.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border border-[#E5E5E5] p-5 rounded-none relative group hover:border-black transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  "px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border",
                  promo.status === 'Active' ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                )}>
                  {promo.status}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(promo)} className="p-2 hover:bg-black hover:text-white transition-colors border border-black/10">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => deletePromoCode(promo.id)} className="p-2 hover:bg-red-600 hover:text-white transition-colors border border-black/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">{promo.name || 'Promo Code'}</p>
                <h4 className="text-xl font-black uppercase tracking-widest text-black flex items-center gap-2">
                  {promo.code}
                  <button onClick={() => navigator.clipboard.writeText(promo.code)} className="text-zinc-300 hover:text-black transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </h4>
                <div className="flex items-center gap-2 mt-2">
                   {/* Badge based on type */}
                   <div className="flex items-center gap-1 bg-black text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
                      {promo.type === 'Percentage' && <Percent className="w-3 h-3" />}
                      {promo.type === 'Fixed Amount' && <DollarSign className="w-3 h-3" />}
                      {promo.type}
                   </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#F5F5F5]">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Discount Value</span>
                  <span className="text-xs font-black text-black">
                    {promo.type === 'Percentage' ? `${promo.value}%` : `৳${promo.value}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Min Order</span>
                  <span className="text-xs font-black text-black">৳{promo.minOrder}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Expiry Date</span>
                  <span className="text-xs font-black text-black flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {promo.expiryDate}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Total Usage</span>
                  <span className="text-xs font-black text-black flex items-center gap-1">
                    <Users className="w-3 h-3" /> {promo.usedCount || 0} / {promo.usageLimit}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-none border border-black shadow-2xl overflow-hidden"
            >
              <div className="bg-black text-white p-6 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-lg font-black uppercase tracking-widest">
                  {editingPromo ? 'Edit Configuration' : 'Inject New Incentive'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                
                {/* Box 0: Name */}
                <div>
                   <label className="block text-[9px] font-black text-black uppercase tracking-widest mb-2 font-mono italic opacity-50">Promo Code Name (Label)</label>
                   <input 
                    type="text"
                    required
                    placeholder="e.g. Summer Special 100"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white border border-[#222] h-[48px] px-4 text-[13px] font-black focus:outline-none focus:ring-1 focus:ring-black"
                   />
                </div>

                {/* Box 1: Code */}
                <div>
                   <label className="block text-[9px] font-black text-black uppercase tracking-widest mb-2 font-mono italic opacity-50">Identity Segment (Promo Code)</label>
                   <input 
                    type="text"
                    required
                    placeholder="e.g. SAVE10"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full bg-white border border-[#222] h-[48px] px-4 text-[13px] font-black tracking-widest focus:outline-none focus:ring-1 focus:ring-black uppercase"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Box 2: Type */}
                  <div>
                    <label className="block text-[9px] font-black text-black uppercase tracking-widest mb-2 font-mono italic opacity-50">Discount Modality</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as DiscountType})}
                      className="w-full bg-white border border-[#222] h-[48px] px-3 text-[12px] font-black uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="Percentage">Percentage</option>
                      <option value="Fixed Amount">Fixed Amount</option>
                    </select>
                  </div>

                  {/* Box 3: Value */}
                  <div>
                    <label className="block text-[9px] font-black text-black uppercase tracking-widest mb-2 font-mono italic opacity-50">Incentive Magnitude (Discount Value)</label>
                    <input 
                      type="number"
                      required
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                      className="w-full bg-white border border-[#222] h-[48px] px-4 text-[13px] font-black tracking-widest focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Box 4: Min Order */}
                  <div>
                    <label className="block text-[9px] font-black text-black uppercase tracking-widest mb-2 font-mono italic opacity-50">Minimum Order Amount (৳)</label>
                    <input 
                      type="number"
                      required
                      value={formData.minOrder}
                      onChange={(e) => setFormData({...formData, minOrder: Number(e.target.value)})}
                      className="w-full bg-white border border-[#222] h-[48px] px-4 text-[13px] font-black tracking-widest focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  {/* Box 5: Expiry */}
                  <div>
                    <label className="block text-[9px] font-black text-black uppercase tracking-widest mb-2 font-mono italic opacity-50">Expiration Lock Date</label>
                    <input 
                      type="date"
                      required
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                      className="w-full bg-white border border-[#222] h-[48px] px-4 text-[12px] font-black tracking-widest focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Box 6: Usage Limit */}
                  <div>
                    <label className="block text-[9px] font-black text-black uppercase tracking-widest mb-2 font-mono italic opacity-50">Propagation Limit (Usage Count)</label>
                    <input 
                      type="number"
                      required
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({...formData, usageLimit: Number(e.target.value)})}
                      className="w-full bg-white border border-[#222] h-[48px] px-4 text-[13px] font-black tracking-widest focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  {/* Box 7: Status */}
                  <div>
                    <label className="block text-[9px] font-black text-black uppercase tracking-widest mb-2 font-mono italic opacity-50">Deployment Status</label>
                    <div className="flex gap-2">
                       <button 
                        type="button" 
                        onClick={() => setFormData({...formData, status: 'Active'})}
                        className={cn(
                          "flex-1 h-[48px] border font-black text-[10px] uppercase tracking-widest transition-all",
                          formData.status === 'Active' ? "bg-black text-white border-black" : "bg-white text-zinc-400 border-[#E5E5E5]"
                        )}
                       >
                         ACTIVE
                       </button>
                       <button 
                        type="button" 
                        onClick={() => setFormData({...formData, status: 'Inactive'})}
                        className={cn(
                          "flex-1 h-[48px] border font-black text-[10px] uppercase tracking-widest transition-all",
                          formData.status === 'Inactive' ? "bg-black text-white border-black" : "bg-white text-zinc-400 border-[#E5E5E5]"
                        )}
                       >
                         INACTIVE
                       </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E5E5] flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white h-[54px] rounded-none font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-xl shadow-black/10"
                  >
                    <Save className="w-4 h-4" /> COMMIT ALL CONFIG
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
