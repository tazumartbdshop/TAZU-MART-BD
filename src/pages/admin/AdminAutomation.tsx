import React, { useState, useMemo, useEffect } from 'react';
import { 
  Activity, Calendar, Filter, LayoutDashboard, Monitor, ShieldAlert,
  Smartphone, BarChart, ArrowRight, ServerCrash, AlertTriangle, UserX,
  CreditCard, MapPin, Search, ChevronDown, CheckCircle2, XCircle
} from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { 
  LineChart, Line, BarChart as RechartsBarChart, Bar, PieChart, Pie, 
  Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { motion } from 'motion/react';

// --- MOCK COLLECTIONS ---
const FAKE_ORDER_LOGS = [
  { id: 'FO-9032', time: '10 mins ago', type: 'High Risk Blocked', desc: 'Blocked checkout attempt from known VPN IP. Order automatically cancelled.', score: 98, action: 'Auto Blocked' },
  { id: 'FO-9031', time: '1 hr ago', type: 'Duplicate Phone', desc: 'Phone number matches 5 previous cancelled orders.', score: 85, action: 'Auto Flagged' },
  { id: 'FO-9020', time: '3 hrs ago', type: 'Spam Activity', desc: 'Too many attempts (12+ checkout tries in 5 mins).', score: 92, action: 'IP Added to Blocklist' },
];

const ERROR_LOGS = [
  { id: 'ERR-312', time: '5 mins ago', type: 'Checkout Failure', source: 'Stripe API', severity: 'High', message: 'Rate limit exceeded on payment intent creation.' },
  { id: 'ERR-311', time: '45 mins ago', type: 'Slow Page Speed', source: 'Firebase', severity: 'Low', message: 'Product page load took > 3.5s due to unoptimized image.' },
  { id: 'ERR-310', time: '2 hrs ago', type: 'Meta Conversion Delay', source: 'CAPI', severity: 'Medium', message: 'Purchase event payload rejected. Missing client_user_agent.' },
];

// Reusable UI Components styling (Sharp borders, Black/White)
const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white border border-[#e5e5e5] p-5 rounded-none ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ title, icon: Icon }: { title: string, icon?: any }) => (
  <div className="flex items-center gap-2 mb-4 border-b border-[#e5e5e5] pb-2">
    {Icon && <Icon className="w-5 h-5 text-black" />}
    <h3 className="font-semibold text-black tracking-tight text-lg uppercase font-mono">{title}</h3>
  </div>
);

export default function AdminAutomation() {
  const [dateRange, setDateRange] = useState('Today');
  const [trafficSource, setTrafficSource] = useState('All');
  
  // Simulated Date-Wise Data Generation
  const analyticsData = useMemo(() => {
    let multiplier = 1;
    if (dateRange === 'Today') multiplier = 1;
    if (dateRange === 'Yesterday') multiplier = 0.85;
    if (dateRange === 'Last 7 Days') multiplier = 6.5;
    if (dateRange === 'Last 30 Days') multiplier = 28;
    if (dateRange === 'Custom Date') multiplier = 10;

    let sourceShare = { fb: 0.6, tt: 0.2, gg: 0.1, org: 0.1 };
    if (trafficSource === 'Facebook') sourceShare = { fb: 1, tt: 0, gg: 0, org: 0 };
    if (trafficSource === 'TikTok') sourceShare = { fb: 0, tt: 1, gg: 0, org: 0 };
    if (trafficSource === 'Google') sourceShare = { fb: 0, tt: 0, gg: 1, org: 0 };
    if (trafficSource === 'Organic') sourceShare = { fb: 0, tt: 0, gg: 0, org: 1 };

    const totalOrdersBase = 150 * multiplier;
    
    return {
      totalOrders: Math.floor(totalOrdersBase),
      confirmedOrders: Math.floor(totalOrdersBase * 0.8),
      cancelledOrders: Math.floor(totalOrdersBase * 0.2),
      revenue: totalOrdersBase * 1250,
      roas: (3.5 + Math.random() * 0.5).toFixed(2),
      visitors: Math.floor(2500 * multiplier),
      sourcesBreakdown: {
        facebook: Math.floor(totalOrdersBase * sourceShare.fb),
        tiktok: Math.floor(totalOrdersBase * sourceShare.tt),
        google: Math.floor(totalOrdersBase * sourceShare.gg),
        organic: Math.floor(totalOrdersBase * sourceShare.org),
      }
    }
  }, [dateRange, trafficSource]);

  // Chart Data
  const lineChartData = [
    { name: '08:00', fb: 12, tt: 5, org: 3 },
    { name: '10:00', fb: 19, tt: 8, org: 5 },
    { name: '12:00', fb: 15, tt: 10, org: 4 },
    { name: '14:00', fb: 25, tt: 12, org: 6 },
    { name: '16:00', fb: 22, tt: 15, org: 5 },
    { name: '18:00', fb: 30, tt: 20, org: 8 },
    { name: '20:00', fb: 28, tt: 18, org: 7 },
  ];

  const pieData = [
    { name: 'Facebook', value: analyticsData.sourcesBreakdown.facebook },
    { name: 'TikTok', value: analyticsData.sourcesBreakdown.tiktok },
    { name: 'Google', value: analyticsData.sourcesBreakdown.google },
    { name: 'Organic', value: analyticsData.sourcesBreakdown.organic },
  ].filter(d => d.value > 0);
  const pieColors = ['#000000', '#444444', '#888888', '#CCCCCC'];

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-10">
      {/* 
        ========================================
        TOP HEADER & FILTERS
        ========================================
      */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white border border-[#e5e5e5] p-5 shadow-sm rounded-none">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-black flex items-center justify-center bg-black text-white rounded-none shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-black m-0 leading-tight uppercase font-mono">
              AI & Automation Center
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1.5 px-2 py-0.5 border border-green-500 text-green-700 bg-green-50 text-[10px] uppercase font-bold tracking-wider rounded-none shrink-0">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                System Live
              </span>
              <span className="text-gray-500 text-xs font-mono">Enterprise Engine Active</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Date Filter */}
          <div className="relative flex-1 sm:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="w-4 h-4 text-black" />
            </div>
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-[#dcdcdc] rounded-none focus:outline-none focus:border-black text-sm font-semibold cursor-pointer appearance-none text-black hover:bg-gray-50 transition-colors"
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Custom Date">Custom Date</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>

          {/* Traffic Source Filter */}
          <div className="relative flex-1 sm:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="w-4 h-4 text-black" />
            </div>
            <select 
              value={trafficSource}
              onChange={(e) => setTrafficSource(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-[#dcdcdc] rounded-none focus:outline-none focus:border-black text-sm font-semibold cursor-pointer appearance-none text-black hover:bg-gray-50 transition-colors"
            >
              <option value="All">All Sources</option>
              <option value="Facebook">Facebook</option>
              <option value="TikTok">TikTok</option>
              <option value="Google">Google</option>
              <option value="Organic">Organic</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* 
        ========================================
        TOP ANALYTICS CARDS
        ========================================
      */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="hover:border-black transition-colors group">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2 group-hover:text-black transition-colors">Total Orders</p>
          <p className="text-2xl font-bold font-mono tracking-tighter text-black">{analyticsData.totalOrders.toLocaleString()}</p>
        </Card>
        <Card className="hover:border-black transition-colors group">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2 group-hover:text-black transition-colors">Confirmed</p>
          <div className="flex items-center gap-2">
             <p className="text-2xl font-bold font-mono tracking-tighter text-black">{analyticsData.confirmedOrders.toLocaleString()}</p>
             <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-800 border border-green-200">{(analyticsData.confirmedOrders / Math.max(1, analyticsData.totalOrders) * 100).toFixed(0)}%</span>
          </div>
        </Card>
        <Card className="hover:border-black transition-colors group">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2 group-hover:text-black transition-colors">Cancelled</p>
          <div className="flex items-center gap-2">
             <p className="text-2xl font-bold font-mono tracking-tighter text-black">{analyticsData.cancelledOrders.toLocaleString()}</p>
             <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-800 border border-red-200">{(analyticsData.cancelledOrders / Math.max(1, analyticsData.totalOrders) * 100).toFixed(0)}%</span>
          </div>
        </Card>
        <Card className="hover:border-black transition-colors group">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2 group-hover:text-black transition-colors">Revenue</p>
          <p className="text-2xl font-bold font-mono tracking-tighter text-black">৳{analyticsData.revenue.toLocaleString()}</p>
        </Card>
        <Card className="hover:border-black transition-colors group bg-black text-white border-black">
          <p className="text-gray-300 text-[10px] font-bold uppercase tracking-wider mb-2">Avg. ROAS</p>
          <p className="text-2xl font-bold font-mono tracking-tighter text-white">{analyticsData.roas}x</p>
        </Card>
        <Card className="hover:border-black transition-colors group">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2 group-hover:text-black transition-colors">Traffic Visitors</p>
          <p className="text-2xl font-bold font-mono tracking-tighter text-black">{analyticsData.visitors.toLocaleString()}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        
        {/* 
          ========================================
          LIVE AUTOMATION FLOW
          ========================================
        */}
        <div className="xl:col-span-1 border border-[#e5e5e5] p-0 bg-[#fafafa]">
          <div className="p-4 bg-white border-b border-[#e5e5e5]">
            <SectionTitle title="Live Tracking Flow" icon={Activity} />
            <p className="text-xs text-gray-500 font-mono">Real-time sync to Meta, TikTok & Server DB</p>
          </div>
          
          <div className="p-6">
            <div className="relative">
              <div className="absolute left-[20px] top-4 bottom-4 w-px bg-[#dcdcdc] z-0 hidden sm:block"></div>
              
              <div className="flex flex-col gap-5 relative z-10">
                 {[
                   { name: 'Ad Impression', tag: 'Facebook / TikTok', icon: Search },
                   { name: 'Website Visit', tag: 'Cloudflare CDN', icon: Monitor },
                   { name: 'Checkout Initiated', tag: 'React Frontend', icon: Smartphone },
                   { name: 'Order Placed', tag: 'Local Server API', icon: CheckCircle2, status: 'success' },
                   { name: 'Meta Conversion API', tag: 'Server-Side Event Sync', icon: ServerCrash, highlight: true },
                   { name: 'TikTok Events API', tag: 'Server-Side Event Sync', icon: LayoutDashboard, highlight: true },
                 ].map((step, idx) => (
                   <motion.div 
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: idx * 0.1 }}
                     className="flex items-center gap-4"
                     key={idx}
                   >
                     <div className={`w-10 h-10 flex items-center justify-center border shrink-0 bg-white
                                      ${step.highlight ? 'border-blue-500 text-blue-600' : 
                                        step.status === 'success' ? 'border-green-500 text-green-600' : 'border-black text-black'}`}>
                        <step.icon className="w-4 h-4" />
                     </div>
                     <div className="flex-1 min-w-0 bg-white p-3 border border-[#e5e5e5] hover:border-black transition-colors rounded-none hidden sm:block shadow-sm z-10 box-border">
                        <div className="flex justify-between items-center">
                           <h4 className="text-xs font-bold uppercase tracking-wide text-black truncate pr-2">{step.name}</h4>
                           <span className="text-[9px] bg-gray-100 text-gray-600 border border-gray-200 px-1 py-0.5 monospace shrink-0 whitespace-nowrap">{(Math.random() * 200).toFixed(0)}ms</span>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase mt-1 truncate">{step.tag}</p>
                     </div>
                     {/* Mobile version minimal */}
                     <div className="flex-1 min-w-0 sm:hidden">
                         <h4 className="text-xs font-bold uppercase text-black">{step.name}</h4>
                         <p className="text-[9px] text-gray-500 uppercase mt-0.5">{step.tag}</p>
                     </div>
                   </motion.div>
                 ))}
              </div>
            </div>
          </div>
        </div>

        {/* 
          ========================================
          DATE WISE REPORTS (CHART)
          ========================================
        */}
        <div className="xl:col-span-2 flex flex-col gap-6">
           <Card className="h-full flex flex-col p-4 sm:p-5">
              <SectionTitle title="Daily Performance By Source" icon={BarChart} />
              <div className="w-full h-72 flex-1 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={lineChartData}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '0', border: '1px solid #000', padding: '10px', boxShadow: 'none' }}
                      itemStyle={{ color: '#000', fontSize: '12px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#666', fontSize: '11px', marginBottom: '5px' }}
                    />
                    <Legend iconType="square" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <Bar dataKey="fb" name="Facebook" fill="#000000" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="tt" name="TikTok" fill="#666666" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="org" name="Organic" fill="#CCCCCC" radius={[0, 0, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
           </Card>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
              <Card className="flex flex-col p-4 sm:p-5">
                <SectionTitle title="Traffic Share" icon={PieChart} />
                <div className="w-full h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '0', border: '1px solid #000', padding: '5px 10px' }}
                        itemStyle={{ color: '#000', fontSize: '12px', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2">
                   {pieData.map((d, i) => (
                     <div key={d.name} className="flex items-center gap-1.5">
                       <span className="w-2.5 h-2.5 bg-black block" style={{ backgroundColor: pieColors[i] }}></span>
                       <span className="text-[10px] font-bold uppercase text-gray-700">{d.name} ({Math.round((d.value/analyticsData.totalOrders)*100)}%)</span>
                     </div>
                   ))}
                </div>
              </Card>

              {/* Source-specific metrics */}
              <Card className="p-4 sm:p-5 flex flex-col justify-center">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-[#e5e5e5] pb-3">
                       <span className="text-xs font-bold text-gray-500 uppercase">Facebook Orders</span>
                       <span className="text-lg font-mono font-bold">{analyticsData.sourcesBreakdown.facebook}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-[#e5e5e5] pb-3">
                       <span className="text-xs font-bold text-gray-500 uppercase">TikTok Orders</span>
                       <span className="text-lg font-mono font-bold">{analyticsData.sourcesBreakdown.tiktok}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-[#e5e5e5] pb-3">
                       <span className="text-xs font-bold text-gray-500 uppercase">Google Orders</span>
                       <span className="text-lg font-mono font-bold">{analyticsData.sourcesBreakdown.google}</span>
                    </div>
                    <div className="flex justify-between items-center pb-1">
                       <span className="text-xs font-bold text-gray-500 uppercase">Organic Orders</span>
                       <span className="text-lg font-mono font-bold">{analyticsData.sourcesBreakdown.organic}</span>
                    </div>
                 </div>
              </Card>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 
          ========================================
          FAKE ORDER DETECTION
          ========================================
        */}
        <Card className="p-4 sm:p-5 bg-[#fafafa]">
          <div className="flex justify-between items-start mb-6 border-b border-[#e5e5e5] pb-3">
            <SectionTitle title="Fraud & Fake Order Rules" icon={ShieldAlert} />
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-red-100 text-red-700 border border-red-200 shadow-sm animate-pulse">
              Active Protection
            </span>
          </div>
          
          <div className="space-y-3">
             {FAKE_ORDER_LOGS.map((log) => (
                <div key={log.id} className="bg-white border border-[#dcdcdc] p-4 flex flex-col sm:flex-row justify-between gap-4 hover:border-red-500 transition-colors rounded-none group">
                   <div className="flex gap-4 items-start">
                     <div className="w-10 h-10 bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                       <UserX className="w-5 h-5" />
                     </div>
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                         <span className="text-[10px] bg-black text-white px-1.5 py-0.5 font-mono">{log.id}</span>
                         <span className="font-bold text-xs uppercase text-red-600">{log.type}</span>
                       </div>
                       <p className="text-xs text-gray-600 font-medium mb-2">{log.desc}</p>
                       <span className="text-[9px] uppercase font-bold text-gray-400">{log.time}</span>
                     </div>
                   </div>
                   <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-[#e5e5e5] pt-3 sm:pt-0 sm:pl-4 min-w-[120px]">
                      <div className="text-center sm:text-right">
                         <p className="text-[10px] font-bold text-gray-400 uppercase">Risk Score</p>
                         <p className="text-xl font-bold font-mono text-black">{log.score}/100</p>
                      </div>
                      <span className="mt-2 text-[9px] font-bold uppercase text-red-700 bg-red-50 border border-red-200 px-2 py-1">
                        {log.action}
                      </span>
                   </div>
                </div>
             ))}
          </div>
        </Card>

        {/* 
          ========================================
          ERROR MONITORING
          ========================================
        */}
        <Card className="p-4 sm:p-5">
          <div className="flex justify-between items-start mb-6 border-b border-[#e5e5e5] pb-3">
            <SectionTitle title="System Error Logs" icon={AlertTriangle} />
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm">
              Logging Active
            </span>
          </div>

          <div className="space-y-3">
             {ERROR_LOGS.map((err) => (
                <div key={err.id} className="bg-white border border-[#dcdcdc] p-4 flex flex-col sm:flex-row justify-between gap-4 hover:border-yellow-500 transition-colors rounded-none group">
                   <div className="flex gap-4 items-start">
                     <div className={`w-10 h-10 border flex items-center justify-center shrink-0
                        ${err.severity === 'High' ? 'bg-red-50 border-red-200 text-red-600' : 
                          err.severity === 'Medium' ? 'bg-orange-50 border-orange-200 text-orange-600' : 
                          'bg-yellow-50 border-yellow-200 text-yellow-600'}`}>
                       <ServerCrash className="w-5 h-5" />
                     </div>
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                         <span className="font-bold text-xs uppercase text-black">{err.type}</span>
                         <span className="text-[9px] text-gray-500 border border-gray-200 bg-gray-50 px-1 py-0.5">{err.source}</span>
                       </div>
                       <p className="text-xs text-gray-600 font-medium mb-2 leading-relaxed">{err.message}</p>
                       <span className="text-[9px] uppercase font-bold text-gray-400">{err.time}</span>
                     </div>
                   </div>
                   <div className="flex justify-end items-center sm:block pt-2 sm:pt-0 border-t sm:border-0 border-[#e5e5e5]">
                     <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 whitespace-nowrap block text-center min-w-[70px]
                        ${err.severity === 'High' ? 'bg-red-600 text-white border border-red-700' : 
                          err.severity === 'Medium' ? 'bg-orange-100 text-orange-800 border border-orange-200' : 
                          'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                        {err.severity}
                     </span>
                   </div>
                </div>
             ))}
          </div>
        </Card>
      </div>

    </div>
  );
}
