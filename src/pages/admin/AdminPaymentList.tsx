import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Eye, DollarSign, Calendar, Clock, CheckCircle2, TrendingUp, Wallet } from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { formatPrice } from '../../lib/utils';
import { InvoiceView } from '../../components/checkout/InvoiceView';

export default function AdminPaymentList() {
  const { orders } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any>(null);

  const payments = useMemo(() => {
    return orders.map(order => ({
      ...order,
      id: order.id,
      orderId: order.orderId,
      customerName: order.customerName,
      customerEmail: order.email || 'N/A',
      amount: order.total,
      method: order.paymentMethod,
      status: order.paymentStatus === 'Paid' ? 'Confirmed' : 'Pending', 
      date: order.date,
    }));
  }, [orders]);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => 
      (p.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
       p.customerName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterMethod === 'All' || p.method === filterMethod) &&
      (filterStatus === 'All' || p.status === filterStatus)
    );
  }, [payments, searchTerm, filterMethod, filterStatus]);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthPayments = payments.filter(p => {
      const pDate = new Date(p.date);
      return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear && p.status === 'Confirmed';
    });

    const totalEarnings = payments.filter(p => p.status === 'Confirmed').reduce((acc, p) => acc + p.amount, 0);
    const thisMonthEarnings = thisMonthPayments.reduce((acc, p) => acc + p.amount, 0);
    const pending = payments.filter(p => p.status === 'Pending');
    const pendingAmount = pending.reduce((acc, p) => acc + p.amount, 0);
    const paidOut = payments.filter(p => p.status === 'Confirmed').length;
    
    return { totalEarnings, thisMonthEarnings, pendingCount: pending.length, pendingAmount, paidOut };
  }, [payments]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-black">Payment List</h1>
          <p className="text-gray-600">Manage all payment transactions</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-green-50 rounded-lg text-green-600"><DollarSign size={18}/></div>
            <span className="text-xs text-green-600 font-bold flex items-center gap-1"><TrendingUp size={12}/> +12%</span>
          </div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Earnings</p>
          <p className="text-lg font-black text-black">{formatPrice(stats.totalEarnings)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Calendar size={18}/></div>
            <span className="text-xs text-purple-600 font-bold flex items-center gap-1"><TrendingUp size={12}/> +8%</span>
          </div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">This Month</p>
          <p className="text-lg font-black text-black">{formatPrice(stats.thisMonthEarnings)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><Clock size={18}/></div>
            <span className="text-xs text-yellow-600 font-bold flex items-center gap-1">Pending</span>
          </div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Pending ({stats.pendingCount})</p>
          <p className="text-lg font-black text-black">{formatPrice(stats.pendingAmount)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><CheckCircle2 size={18}/></div>
            <span className="text-xs text-blue-600 font-bold flex items-center gap-1">Success</span>
          </div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Paid Out</p>
          <p className="text-lg font-black text-black">{stats.paidOut} Txns</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative col-span-1 sm:col-span-2 md:col-span-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-full" onChange={(e) => setFilterMethod(e.target.value)}>
          <option value="All">All Methods</option>
          <option value="bKash">bKash</option>
          <option value="Nagad">Nagad</option>
          <option value="COD">COD</option>
        </select>
        <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-full" onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>
        <button className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-bold text-sm w-full">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredPayments.map(p => (
          <TransactionRow 
            key={p.id} 
            p={p} 
            onViewInvoice={(invoiceData) => setSelectedInvoiceOrder(invoiceData)} 
          />
        ))}
      </div>

      {/* Existing Dynamic Invoice Modal Overlay */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center items-start py-4 sm:py-8 px-2 sm:px-4">
          <div className="bg-white rounded-2xl max-w-[210mm] w-full shadow-2xl relative overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedInvoiceOrder(null)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-205 text-black w-8 h-8 rounded-full flex items-center justify-center font-bold z-50 transition-all shadow-sm"
              aria-label="Close invoice"
            >
              ✕
            </button>
            <div className="max-h-[85vh] overflow-y-auto">
              <InvoiceView 
                order={{
                  ...selectedInvoiceOrder,
                  createdAt: selectedInvoiceOrder.date // ensures date format parsed correctly inside InvoiceView
                }} 
                onBack={() => setSelectedInvoiceOrder(null)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TransactionRow: React.FC<{ p: any; onViewInvoice: (order: any) => void }> = ({ p, onViewInvoice }) => {
  const [expanded, setExpanded] = useState(false);
  const { updatePaymentStatus } = useOrderStore();

  const handleStatusToggle = () => {
    const newStatus = p.status === 'Confirmed' ? 'Pending' : 'Confirmed';
    updatePaymentStatus(p.id, newStatus === 'Confirmed' ? 'Paid' : 'Unpaid');
  };

  const formattedDate = new Intl.DateTimeFormat('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date(p.date));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <p className="font-bold text-black">#{p.orderId}</p>
          <p className="text-xs sm:text-sm text-gray-650">{p.customerName}</p>
        </div>
        <div className="text-right">
          <p className="font-black text-black text-sm sm:text-base">{formatPrice(p.amount)}</p>
          <div className="relative">
            <span 
              className={`px-2 py-0.5 rounded-full text-xs font-bold cursor-pointer inline-flex items-center gap-1 transition-all ${
                p.status === 'Confirmed' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`} 
              onClick={(e) => { 
                e.stopPropagation(); 
                handleStatusToggle();
              }}
            >
              {p.status}
            </span>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-sm space-y-2.5 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            <div>
              <span className="text-gray-500 block text-xs">Order ID</span>
              <span className="font-bold text-black text-xs sm:text-sm">#{p.orderId}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Customer Name</span>
              <span className="font-bold text-gray-855 text-xs sm:text-sm">{p.customerName}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Phone</span>
              <span className="font-bold text-gray-855 text-xs sm:text-sm">{p.mobileNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Email</span>
              <span className="font-bold text-gray-855 text-xs sm:text-sm">{p.customerEmail}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Payment Method</span>
              <span className="font-bold text-gray-855 text-xs sm:text-sm">{p.method}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">TXN ID</span>
              <span className="font-mono font-bold text-purple-700 text-xs">{p.billId || `TXN-${p.orderId.replace('ORD-', '')}`}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Amount</span>
              <span className="font-black text-black text-xs sm:text-sm">{formatPrice(p.amount)}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Status</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold inline-block mt-0.5 ${
                p.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>{p.status}</span>
            </div>
          </div>
          <div className="pt-2">
            <span className="text-gray-500 block text-xs">Date & Time</span>
            <span className="font-bold text-gray-855 text-xs sm:text-sm">{formattedDate}</span>
          </div>
          <div className="flex gap-2 pt-3">
            <button 
              onClick={() => onViewInvoice(p)}
              className="flex-1 bg-black text-white py-2 rounded-lg font-bold text-xs sm:text-sm hover:opacity-90 transition-all active:scale-98"
            >
              View Details
            </button>
            <button 
              onClick={() => onViewInvoice(p)}
              className="flex-1 bg-white border border-gray-200 py-2 rounded-lg font-bold text-gray-700 text-xs sm:text-sm hover:bg-gray-100 transition-all active:scale-98"
            >
              Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
