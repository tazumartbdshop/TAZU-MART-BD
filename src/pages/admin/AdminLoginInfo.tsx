import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Activity, 
  Globe, 
  Facebook, 
  Mail, 
  Key, 
  Clock, 
  ChevronRight, 
  X,
  Phone,
  MapPin,
  Calendar,
  Gift,
  Plus
} from 'lucide-react';
import { useCustomerStore, Customer } from '../../store/useCustomerStore';
import { useLoginHistoryStore } from '../../store/useLoginHistoryStore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminLoginInfo() {
  const [activeTab, setActiveTab] = useState<'login' | 'create'>('login');
  const { history } = useLoginHistoryStore();
  const { customers } = useCustomerStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredHistory = history.filter(event => 
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    event.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    customer.emails[0]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Search & Tabs Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 border border-[#222]">
        <div className="flex w-full md:w-auto h-[52px] bg-black p-1 rounded-none">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 md:w-[240px] flex items-center justify-center font-bold text-[15px] uppercase tracking-wide transition-all ${
              activeTab === 'login' ? 'bg-white text-black' : 'text-white hover:bg-white/10'
            }`}
          >
            Login Information
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 md:w-[240px] flex items-center justify-center font-bold text-[15px] uppercase tracking-wide transition-all ${
              activeTab === 'create' ? 'bg-white text-black' : 'text-white hover:bg-white/10'
            }`}
          >
            Create Account Information
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[52px] pl-11 pr-4 bg-white border border-[#222] focus:outline-none focus:ring-1 focus:ring-black text-[14px] font-medium"
          />
        </div>
      </div>

      {activeTab === 'login' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHistory.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-[#222] p-[18px] flex gap-4"
              >
                <div className="shrink-0">
                  {item.profileImage ? (
                    <img 
                      src={item.profileImage} 
                      alt={item.name} 
                      className="w-[58px] h-[58px] rounded-full object-cover border border-gray-100" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-[58px] h-[58px] rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">
                      {item.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-bold text-[16px] text-black truncate">{item.name}</h3>
                  <div className="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{item.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-blue-600 font-bold uppercase tracking-tight">
                    {item.method === 'Google Login' && <Globe className="w-3.5 h-3.5" />}
                    {item.method === 'Facebook Login' && <Facebook className="w-3.5 h-3.5" />}
                    {item.method === 'Manual Login' && <Key className="w-3.5 h-3.5" />}
                    <span>{item.method}</span>
                  </div>
                  {item.password && (
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-400 font-mono">
                      <Key className="w-3.5 h-3.5" />
                      <span>{item.password}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{format(item.timestamp, 'MMM dd, yyyy • hh:mm a')}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {filteredHistory.length === 0 && (
            <div className="text-center py-20 bg-white border border-[#222]">
              <Activity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm">No Login History Found</h3>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dashboard Bar */}
          <div className="h-[110px] bg-black flex items-center px-8 border border-white/10">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">Total Accounts Created</p>
              <h2 className="text-3xl font-black text-white">{customers.length} Accounts</h2>
            </div>
          </div>

          {/* Customer List */}
          <div className="bg-white border border-[#222] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-black text-white text-[12px] font-black uppercase tracking-widest border-b border-white/10">
                    <th className="p-4 text-left w-16">#</th>
                    <th className="p-4 text-left">Customer Name</th>
                    <th className="p-4 text-left">Gmail Address</th>
                    <th className="p-4 text-right w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {filteredCustomers.map((customer, idx) => (
                    <tr 
                      key={customer.id} 
                      onClick={() => setSelectedCustomer(customer)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      <td className="p-4 text-[13px] font-bold text-gray-400">{idx + 1}.</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs border border-gray-200 overflow-hidden">
                            {customer.profileImage ? (
                              <img src={customer.profileImage} alt={customer.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : customer.name.charAt(0)}
                          </div>
                          <span className="text-[14px] font-bold text-black group-hover:text-blue-600 transition-colors uppercase tracking-tight">{customer.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-[13px] font-medium text-gray-500 italic">{customer.emails[0] || 'No Email'}</td>
                      <td className="p-4 text-right">
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredCustomers.length === 0 && (
              <div className="text-center py-20">
                <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm">No Customers Registered</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Detail Drawer */}
      <AnimatePresence>
        {selectedCustomer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomer(null)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-[500px] bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="h-[72px] bg-black text-white flex items-center justify-between px-6 shrink-0">
                <h2 className="text-[16px] font-black uppercase tracking-widest">Customer Details</h2>
                <button 
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 md:p-8 space-y-8">
                {/* Profile Header */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-[120px] h-[120px] rounded-full bg-gray-50 border-4 border-black/5 flex items-center justify-center font-bold text-4xl overflow-hidden shadow-lg">
                      {selectedCustomer.profileImage ? (
                        <img src={selectedCustomer.profileImage} alt={selectedCustomer.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : selectedCustomer.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-black uppercase tracking-tight">{selectedCustomer.name}</h3>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1 italic">Premium Customer Profile</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-4">
                    <DetailItem icon={Mail} label="Gmail Address" value={selectedCustomer.emails[0] || 'Not specified'} />
                    <DetailItem icon={Phone} label="Mobile Number" value={selectedCustomer.phones[0] || 'Not specified'} />
                    <DetailItem 
                      icon={MapPin} 
                      label="Full Address" 
                      value={selectedCustomer.address.street || 'Not specified'} 
                      isMultiline 
                    />
                    <DetailItem icon={Key} label="Login Password" value={selectedCustomer.password || '••••••••'} />
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Gift className="w-4 h-4 text-blue-600" />
                      Your Special Day
                    </h4>
                    
                    {selectedCustomer.occasionName || selectedCustomer.specialDate ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-4 border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Occasion</p>
                          <p className="text-[14px] font-bold text-black capitalize">{selectedCustomer.occasionName || 'No Information'}</p>
                        </div>
                        <div className="bg-gray-50 p-4 border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Date</p>
                          <p className="text-[14px] font-bold text-black">{selectedCustomer.specialDate || 'No Information'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-6 border border-gray-100 text-center rounded-xl">
                        <p className="text-sm font-bold text-gray-400 italic">No Special Day Information Provided</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value, isMultiline = false }: { icon: any, label: string, value: string, isMultiline?: boolean }) {
  return (
    <div className="flex gap-4 items-start group">
      <div className="w-10 h-10 bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-black group-hover:text-white transition-all shrink-0">
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="flex-1 pt-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-[15px] font-bold text-black ${isMultiline ? 'leading-relaxed' : 'truncate'}`}>{value}</p>
      </div>
    </div>
  );
}
