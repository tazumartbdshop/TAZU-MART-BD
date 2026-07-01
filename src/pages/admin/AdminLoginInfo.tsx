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
  Plus,
  Monitor,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  Smartphone,
  Cpu
} from 'lucide-react';
import { useCustomerStore, Customer } from '../../store/useCustomerStore';
import { useLoginHistoryStore, LoginEvent } from '../../store/useLoginHistoryStore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminLoginInfo() {
  const [activeTab, setActiveTab] = useState<'login' | 'create'>('login');
  const { history, clearHistory } = useLoginHistoryStore();
  const { customers } = useCustomerStore();
  
  // Search and advanced filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Success' | 'Failed'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Copy to clipboard indicator helper
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyIp = (ip: string, id: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Base metrics calculations
  const totalLogs = history.length;
  const successLogins = history.filter(h => h.status === 'Success').length;
  const failedLogins = history.filter(h => h.status === 'Failed').length;
  const activeSessions = history.filter(h => h.status === 'Success' && !h.logoutTime).length;

  // Filter dynamic history
  const filteredHistory = history.filter(event => {
    const matchesSearch = 
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      event.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.ipAddress && event.ipAddress.includes(searchQuery));

    const matchesStatus = statusFilter === 'all' ? true : event.status === statusFilter;
    
    const matchesMethod = methodFilter === 'all' ? true : 
      event.method.toLowerCase().includes(methodFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (customer.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setMethodFilter('all');
  };

  return (
    <div id="login-history-container" className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-left text-neutral-900">
      
      {/* Toast Clipboard Copy Notification */}
      {copiedId && (
        <div id="toast-ip-copied" className="fixed top-20 right-6 z-[110] bg-neutral-900 text-white border border-neutral-800 px-4 py-3 shadow-xl flex items-center gap-2.5 max-w-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">IP Address Copied to Clipboard</span>
        </div>
      )}

      {/* Header section */}
      <div className="bg-white border border-neutral-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-indigo-650" />
            <h1 className="text-xl font-black uppercase tracking-widest text-neutral-950">
              SECURED SYSTEM LOGIN LOGS
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1.5 uppercase font-bold leading-normal">
            Audit operational connections, active user/admin portal sessions, connection sources, failed authentications & browser agents.
          </p>
        </div>

        {activeTab === 'login' && history.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to purge all secure login history logs?')) {
                clearHistory();
              }
            }}
            className="border border-rose-300 hover:bg-rose-50 text-rose-700 font-extrabold px-4 py-2.5 text-xs uppercase tracking-wider select-none shrink-0"
          >
            Purge History
          </button>
        )}
      </div>

      {/* Analytics Counter Widgets */}
      {activeTab === 'login' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-neutral-100 flex items-center justify-center border border-neutral-200">
              <Activity className="w-5 h-5 text-neutral-600" />
            </div>
            <div>
              <span className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider">TOTAL ATTEMPTS</span>
              <span className="text-2xl font-black text-neutral-950">{totalLogs} Sessions</span>
            </div>
          </div>

          <div className="bg-white border border-neutral-250 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <span className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider">SUCCESSFUL LOGS</span>
              <span className="text-2xl font-black text-emerald-700">{successLogins} Logs</span>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 flex items-center justify-center border border-rose-100">
              <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />
            </div>
            <div>
              <span className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider">FAILED ATTEMPTS</span>
              <span className="text-2xl font-black text-rose-600">{failedLogins} Denied</span>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <Laptop className="w-5 h-5 text-indigo-650" />
            </div>
            <div>
              <span className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider">ACTIVE SESSIONS</span>
              <span className="text-2xl font-black text-indigo-700">{activeSessions} Live</span>
            </div>
          </div>
        </div>
      )}

      {/* Search, Filter & Tabs navigation */}
      <div className="bg-white border border-neutral-200 p-4 md:p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* Main Switcher Tabs Option */}
          <div className="flex w-full md:w-auto bg-neutral-100 p-1 border border-neutral-200">
            <button
              onClick={() => {
                setActiveTab('login');
                resetFilters();
              }}
              className={`flex-1 md:w-[200px] py-3 flex items-center justify-center font-bold text-xs uppercase tracking-wider transition-all select-none ${
                activeTab === 'login' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-550 hover:bg-neutral-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 mr-2 shrink-0" />
              Login Sessions ({filteredHistory.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('create');
                resetFilters();
              }}
              className={`flex-1 md:w-[200px] py-3 flex items-center justify-center font-bold text-xs uppercase tracking-wider transition-all select-none ${
                activeTab === 'create' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-550 hover:bg-neutral-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 mr-2 shrink-0" />
              Registrations ({filteredCustomers.length})
            </button>
          </div>

          {/* Direct Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder={activeTab === 'login' ? "Search Name, Email, IP Address..." : "Search Customers registered..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-white border border-neutral-200 focus:outline-none focus:border-neutral-950 text-xs font-semibold uppercase tracking-wider placeholder-neutral-400 text-neutral-900"
            />
          </div>
        </div>

        {/* Dynamic filter panel for LOGIN Tab */}
        {activeTab === 'login' && (
          <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-neutral-450 font-black uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Status Filter buttons */}
            <div className="flex rounded-none border border-neutral-200 bg-neutral-50 p-0.5">
              {(['all', 'Success', 'Failed'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-colors select-none ${
                    statusFilter === st 
                     ? 'bg-neutral-900 text-white' 
                     : 'text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Auth Method Filter dropdown */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-8 border border-neutral-200 bg-neutral-50 px-3 text-[10px] font-black uppercase tracking-wider focus:outline-none focus:border-neutral-900 select-none text-neutral-700"
            >
              <option value="all">ALL CONNECTIONS</option>
              <option value="manual">MANUAL PASSWORDS</option>
              <option value="google">GOOGLE API</option>
              <option value="facebook">FACEBOOK API</option>
            </select>

            {/* Reset Filter Button */}
            {(searchQuery || statusFilter !== 'all' || methodFilter !== 'all') && (
              <button
                type="button"
                onClick={resetFilters}
                className="h-8 px-3 border border-neutral-200 text-neutral-600 hover:text-black hover:border-black flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider transition-all select-none"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset parameters</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content Render */}
      {activeTab === 'login' ? (
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredHistory.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white border border-neutral-200 flex flex-col justify-between"
                >
                  {/* Status Indicator Bar at the very top */}
                  <div className={`h-1.5 w-full ${item.status === 'Success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  
                  <div className="p-5 flex gap-4 items-start">
                    {/* User profile picture */}
                    <div className="shrink-0">
                      {item.profileImage ? (
                        <img 
                          src={item.profileImage} 
                          alt={item.name} 
                          className="w-12 h-12 rounded-full object-cover border border-neutral-200" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center font-black text-sm uppercase tracking-wider select-none">
                          {item.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Meta info column */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-black text-sm text-neutral-950 truncate uppercase tracking-tight">
                          {item.name}
                        </h3>

                        {/* Success / Failed high-contrast status badge */}
                        <span className={`inline-block px-2 py-0.5 text-[8.5px] font-black uppercase tracking-widest ${
                          item.status === 'Success' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-semibold truncate leading-none">
                        <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate lowercase">{item.email}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-indigo-650 font-black uppercase tracking-wider pt-0.5">
                        {item.method === 'Google Login' && <Globe className="w-3.5 h-3.5 text-neutral-500 shrink-0" />}
                        {item.method === 'Facebook Login' && <Facebook className="w-3.5 h-3.5 text-neutral-500 shrink-0" />}
                        {item.method === 'Manual Login' && <Key className="w-3.5 h-3.5 text-neutral-500 shrink-0" />}
                        <span>{item.method}</span>
                      </div>
                    </div>
                  </div>

                  {/* Browser, Device & IP specs line parameters */}
                  <div className="px-5 py-3.5 bg-neutral-50 border-t border-neutral-150 text-[11px] space-y-1.5 font-sans">
                    <div className="flex items-center justify-between text-neutral-500">
                      <span className="font-bold uppercase tracking-wider text-[9.5px]">Connection IP</span>
                      <button 
                        type="button"
                        onClick={() => handleCopyIp(item.ipAddress || '127.0.0.1', item.id)}
                        className="font-mono text-neutral-900 font-extrabold underline decoration-dotted decoration-neutral-400 hover:decoration-black cursor-pointer select-all select-none transition-all flex items-center gap-1"
                        title="Click to Copy IP Address"
                      >
                        {item.ipAddress || '127.0.0.1'}
                        <span className="text-[8.5px] text-neutral-450 uppercase font-bold bg-neutral-200 block px-1">copy</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-neutral-500">
                      <span className="font-bold uppercase tracking-wider text-[9.5px]">Device / OS</span>
                      <div className="flex items-center gap-1 text-neutral-900 font-semibold uppercase tracking-wide">
                        {item.device?.includes('Desktop') || item.device?.includes('Laptop') || item.device?.includes('Windows') || item.device?.includes('macOS') ? (
                          <Laptop className="w-3.5 h-3.5 text-neutral-450 shrink-0" />
                        ) : (
                          <Smartphone className="w-3.5 h-3.5 text-neutral-450 shrink-0" />
                        )}
                        <span>{item.device || 'Unknown Client'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-neutral-500">
                      <span className="font-bold uppercase tracking-wider text-[9.5px]">Browser Client</span>
                      <span className="text-neutral-900 font-bold uppercase tracking-wide">{item.browser || 'HTML Browser'}</span>
                    </div>

                    {item.password && item.status === 'Failed' && (
                      <div className="flex items-center justify-between text-rose-700 bg-rose-50 p-1 px-1.5 border border-rose-100 font-mono text-[9px] uppercase font-bold">
                        <span>Failed password attempt:</span>
                        <span className="tracking-widest">{item.password}</span>
                      </div>
                    )}
                  </div>

                  {/* Timestamps line */}
                  <div className="px-5 py-3 border-t border-neutral-150 flex flex-wrap items-center justify-between bg-white text-[10px] text-neutral-450 font-semibold font-mono">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>IN: {format(item.timestamp, 'dd MMM, hh:mm a')}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.logoutTime ? (
                        <span className="text-neutral-500 font-bold">OUT: {format(item.logoutTime, 'dd MMM, hh:mm a')}</span>
                      ) : item.status === 'Success' ? (
                        <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 uppercase tracking-wider font-extrabold text-[9px] animate-pulse">
                          Active session
                        </span>
                      ) : (
                        <span className="text-neutral-400 uppercase">N/A</span>
                      )}
                    </div>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-24 bg-white border border-neutral-200">
              <Activity className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-neutral-500 font-black uppercase tracking-widest text-sm">No login session records found</h3>
              <p className="text-xs text-neutral-400 font-semibold uppercase mt-1">Try resetting search string query filters</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Total accounts summary */}
          <div className="h-[96px] bg-neutral-950 flex items-center px-6 border-l-4 border-indigo-600">
            <div>
              <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest mb-1">REGISTERED CUSTOMERS</p>
              <h2 className="text-2xl font-black text-white">{customers.length} Security Accounts registered at checkout</h2>
            </div>
          </div>

          {/* Customer list and drawer details */}
          <div className="bg-white border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-neutral-900 text-white text-[11px] font-black uppercase tracking-widest border-b border-neutral-800">
                    <th className="p-4 text-left w-16">#</th>
                    <th className="p-4 text-left">Customer Name</th>
                    <th className="p-4 text-left">Gmail Address</th>
                    <th className="p-4 text-right w-20">Full profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredCustomers.map((customer, idx) => (
                    <tr 
                      key={customer.id} 
                      onClick={() => setSelectedCustomer(customer)}
                      className="hover:bg-neutral-50 cursor-pointer transition-colors group"
                    >
                      <td className="p-4 text-xs font-bold text-neutral-400">{idx + 1}.</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-xs border border-neutral-200 overflow-hidden shrink-0">
                            {customer.profileImage ? (
                              <img src={customer.profileImage} alt={customer.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : customer.name.charAt(0)}
                          </div>
                          <span className="text-xs font-black text-neutral-950 group-hover:text-indigo-650 transition-colors uppercase tracking-tight">{customer.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-semibold text-neutral-500 select-all font-mono lowercase">{customer.email || 'No Email'}</td>
                      <td className="p-4 text-right">
                        <ChevronRight className="w-4 h-4 text-neutral-355 group-hover:text-black transition-colors ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredCustomers.length === 0 && (
              <div className="text-center py-20">
                <Users className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                <h3 className="text-neutral-400 font-bold uppercase tracking-widest text-xs">No registered customer accounts matching search</h3>
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
              className="fixed top-0 right-0 bottom-0 w-full max-w-[500px] bg-white z-[70] shadow-2xl flex flex-col font-sans"
            >
              <div className="h-[72px] bg-neutral-950 text-white flex items-center justify-between px-6 shrink-0">
                <h2 className="text-xs font-black uppercase tracking-widest">Customer Registration Info</h2>
                <button 
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-all cursor-pointer"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 md:p-8 space-y-6">
                
                {/* Profile Header section */}
                <div className="flex flex-col items-center text-center space-y-4 pb-4 border-b border-neutral-100">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-neutral-100 border-2 border-neutral-900 flex items-center justify-center font-black text-2xl overflow-hidden shadow-sm select-none">
                      {selectedCustomer.profileImage ? (
                        <img src={selectedCustomer.profileImage} alt={selectedCustomer.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : selectedCustomer.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-neutral-950 uppercase tracking-tight">{selectedCustomer.name}</h3>
                    <p className="text-[10px] font-black text-indigo-755 uppercase tracking-[0.2em] mt-1">
                      System Registered Account
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <DetailItem icon={Mail} label="Gmail Address" value={selectedCustomer.email || 'Not specified'} />
                  <DetailItem icon={Phone} label="Mobile Number" value={selectedCustomer.phone || 'Not specified'} />
                  <DetailItem 
                    icon={MapPin} 
                    label="Delivery Address" 
                    value={selectedCustomer.address.street || 'Not specified'} 
                    isMultiline 
                  />
                  <DetailItem icon={Key} label="Login Password" value={selectedCustomer.password || '••••••••'} />
                </div>

                <div className="pt-6 border-t border-neutral-150">
                  <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-indigo-600" />
                    USER OCCASION / SPECIAL MOMENT
                  </h4>
                  
                  {selectedCustomer.occasionName || selectedCustomer.specialDate ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-neutral-50 p-4 border border-neutral-200">
                        <p className="text-[9px] font-black text-neutral-400 uppercase mb-1">Occasion</p>
                        <p className="text-xs font-black text-neutral-950 uppercase">{selectedCustomer.occasionName || 'No Information'}</p>
                      </div>
                      <div className="bg-neutral-50 p-4 border border-neutral-200">
                        <p className="text-[9px] font-black text-neutral-400 uppercase mb-1">Date</p>
                        <p className="text-xs font-bold font-mono text-neutral-950">{selectedCustomer.specialDate || 'No Information'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-neutral-50 p-5 border border-dashed border-neutral-300 text-center">
                      <p className="text-[11px] font-bold text-neutral-450 uppercase">No occasion detail parameters defined</p>
                    </div>
                  )}
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
      <div className="w-10 h-10 bg-neutral-50 flex items-center justify-center border border-neutral-200 group-hover:bg-neutral-950 group-hover:text-white group-hover:border-neutral-950 transition-all shrink-0">
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="flex-1 pt-1 min-w-0">
        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-xs font-bold text-neutral-950 ${isMultiline ? 'leading-relaxed' : 'truncate'}`}>{value}</p>
      </div>
    </div>
  );
}
