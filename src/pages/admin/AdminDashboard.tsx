import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  Package, 
  Menu, 
  X, 
  ArrowUpRight, 
  DollarSign, 
  Activity, 
  LogOut, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Bell, 
  ChevronDown, 
  ChevronRight, 
  Upload, 
  Image as ImageIcon, 
  Grid,
  CheckCircle,
  Clock,
  AlertCircle,
  Smartphone,
  CreditCard,
  Zap,
  Radio,
  Shield,
  History,
  Ticket,
  BellRing,
  HelpCircle,
  Monitor,
  Lock,
  Palette,
  Star,
  Puzzle
} from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { Link, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

import AdminSettings from './AdminSettings';
import AdminProducts from './AdminProducts';
import AdminCustomers from './AdminCustomers';
import AdminOrders from './AdminOrders';
import AdminAutomation from './AdminAutomation';
import AdminIncompleteOrders from './AdminIncompleteOrders';
import AdminCategories from './AdminCategories';
import AdminStock from './AdminStock';
import AdminCalculation from './AdminCalculation';
import FlutterManager from './FlutterManager';
import AdminPaymentMethods from './AdminPaymentMethods';
import AdminPaymentList from './AdminPaymentList';
import AdminLiveTracking from './AdminLiveTracking';
import ModeratorManagement from './ModeratorManagement';
import SecuritySettings from './SecuritySettings';
import SIMLockSecurity from './SIMLockSecurity';
import AdminBanners from './AdminBanners';
import AdminGameControl from './AdminGameControl';
import AdminSupportBanner from './AdminSupportBanner';
import AdminThemeSettings from './AdminThemeSettings';
import AdminSupport from './AdminSupport';
import AdminReviews from './AdminReviews';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useModeratorStore } from '../../store/useModeratorStore';
import { defaultNavItems } from '../../lib/adminMenus';
import { useMenuSortStore } from '../../store/useMenuSortStore';
import AdminMenuManagement from './AdminMenuManagement';
import AdminPopupManagement from './AdminPopupManagement';
import AdminCourierAPI from './AdminCourierAPI';
import AdminCourierCharges from './AdminCourierCharges';
import AdminLoginInfo from './AdminLoginInfo';
import AdminPromoCodes from './AdminPromoCodes';
import AdminSiteManagement from './AdminSiteManagement';

const salesData = [
  { name: 'Jan', revenue: 4000, orders: 240 },
  { name: 'Feb', revenue: 3000, orders: 139 },
  { name: 'Mar', revenue: 5000, orders: 380 },
  { name: 'Apr', revenue: 4500, orders: 290 },
  { name: 'May', revenue: 6000, orders: 480 },
  { name: 'Jun', revenue: 5500, orders: 380 },
];

interface NavSubItem {
  name: string;
  path: string;
  icon: any;
  superAdminOnly?: boolean;
}

interface NavItem {
  name: string;
  path?: string;
  icon: any;
  moduleId: string;
  subItems?: NavSubItem[];
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { setUnlocked } = useModeratorStore();
  const { settings } = useSettingsStore();

  const handleLogout = () => {
    setUnlocked(false);
    logout();
    navigate('/login');
  };

  const { mainMenuOrder, submenuOrders, renamedMenus = {}, deletedMenus = [] } = useMenuSortStore();

  const getSortedNavItems = (): NavItem[] => {
    // Filter out deleted menus first based on original name
    const activeDefault = defaultNavItems.filter(item => !deletedMenus.includes(item.name));

    let items = [...activeDefault];

    if (mainMenuOrder && mainMenuOrder.length > 0) {
      items.sort((a, b) => {
        const indexA = mainMenuOrder.indexOf(a.name);
        const indexB = mainMenuOrder.indexOf(b.name);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }

    items = items.map(item => {
      let sortedSubItems = item.subItems ? item.subItems.map(sub => ({ ...sub })) : undefined;
      
      if (sortedSubItems && sortedSubItems.length > 0) {
        const order = submenuOrders[item.name];
        if (order && order.length > 0) {
          sortedSubItems.sort((a, b) => {
            const idxA = order.indexOf(a.name);
            const idxB = order.indexOf(b.name);
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
          });
        }
      }

      return { 
        ...item, 
        name: renamedMenus[item.name] || item.name,
        subItems: sortedSubItems 
      };
    });

    return items;
  };

  const navItems = getSortedNavItems();

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleSubmenu = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const hasPermission = (item: any) => {
    if (user?.role === 'admin') return true;
    if (!user?.permissions) return false;
    
    // Check if the item's moduleId is in user's permissions
    if (item.moduleId && user.permissions.includes(item.moduleId)) return true;
    
    // If it's a subitem, check its parent or if it has its own moduleId
    return false;
  };

  const filteredNavItems = navItems.filter(item => {
    // Basic menu item filtering
    const permitted = hasPermission(item);
    
    // Special handling for sub-items filtering if needed
    if (permitted && item.subItems) {
      item.subItems = item.subItems.filter(sub => {
        if (sub.superAdminOnly && user?.role !== 'admin') return false;
        return true;
      });
    }
    
    return permitted;
  });

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 w-64 md:w-72 admin-sidebar bg-[#000000] text-white transform transition-transform duration-300 ease-in-out pb-[100px] md:pb-6 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 min-h-full flex flex-col">
            <div className="flex justify-between items-start mb-10 shrink-0">
              <div>
                <h2 className="text-2xl font-sans font-black tracking-widest uppercase text-white mb-1">TAZU MART BD</h2>
                <span className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase">Enterprise Dashboard</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white mt-1">
                <X className="w-6 h-6" />
              </button>
            </div>
          
          <nav className="space-y-2 flex-grow">
            {filteredNavItems.map((item) => {
              const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              const hasSubmenu = item.subItems && item.subItems.length > 0;
              const isExpanded = openMenu === item.name;

              return (
                <div key={item.name} className="flex flex-col gap-1">
                  {hasSubmenu ? (
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={`flex items-center justify-between px-4 py-3 rounded-none transition-colors w-full ${active && !isExpanded ? 'bg-white/10 text-white font-semibold' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                    </button>
                  ) : (
                    <Link 
                      to={item.path || '#'}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-none transition-colors ${active ? 'bg-white text-[#000000] font-semibold' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </div>
                      {item.name === '🛠 Admin Management' && (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Link>
                  )}

                  {hasSubmenu && (
                    <div 
                       className="overflow-hidden transition-all duration-300 ease-in-out"
                       style={{ maxHeight: isExpanded ? '400px' : '0px', opacity: isExpanded ? 1 : 0 }}
                    >
                      <div className="pl-[20px] pt-1 space-y-1">
                        {item.subItems!.map(subItem => {
                          const subActive = location.pathname === subItem.path;
                          return (
                            <Link
                              key={subItem.name}
                              to={subItem.path}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center gap-3 px-4 py-2.5 rounded-none text-sm transition-colors ${subActive ? 'bg-white text-[#000000] font-bold shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                              <subItem.icon className="w-4 h-4" />
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          
          <div className="mt-auto px-4 py-3 flex flex-col gap-4">
             <Link to="/" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors font-medium">
                ← Back to Store
             </Link>
             <button onClick={handleLogout} className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm transition-colors font-medium text-left">
                <LogOut className="w-4 h-4" /> Logout
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden bg-[#f8f8f8]">
        {/* Header */}
        <header className="bg-white border-b border-[#EEEEEE] h-[72px] flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-sm z-10 relative">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-[#000000] hover:text-gray-600 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-sans text-[#000000] font-bold hidden sm:block capitalize">
              {location.pathname === '/admin' ? 'Overview' : location.pathname.split('/').pop()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-[#000000] hover:bg-gray-50 rounded-none transition-colors focus:outline-none">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-none border-2 border-white"></span>
            </button>
            <div className="text-right hidden sm:block">
               <p className="text-sm font-bold text-[#000000]">{user?.name || 'Admin User'}</p>
               <p className="text-xs text-[#666666]">Main Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-none bg-[#000000] border-2 border-white shadow-md flex items-center justify-center text-white font-bold overflow-hidden">
               {settings.storeLogo ? (
                 <img src={settings.storeLogo} alt="Logo" className="w-full h-full object-contain transition-all duration-300" referrerPolicy="no-referrer" />
               ) : (
                 "A"
               )}
            </div>
          </div>
        </header>

        {/* Mobile Top Navigation */}
        <div className="md:hidden bg-white border-b border-[#EEEEEE] px-4 py-3 flex gap-2 overflow-x-auto justify-between hide-scrollbar shrink-0 shadow-sm">
           <Link to="/admin/products" className={`flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-[12px] transition-colors ${location.pathname.startsWith('/admin/products') ? 'bg-[#000000] text-white shadow-md' : 'bg-gray-50 text-[#666666] hover:bg-gray-100'}`}>
             <Package className="w-5 h-5 mb-1" />
             <span className="text-[10px] font-bold uppercase tracking-wider">Products</span>
           </Link>
           <Link to="/admin" className={`flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-[12px] transition-colors ${location.pathname === '/admin' ? 'bg-[#000000] text-white shadow-md' : 'bg-gray-50 text-[#666666] hover:bg-gray-100'}`}>
             <LayoutDashboard className="w-5 h-5 mb-1" />
             <span className="text-[10px] font-bold uppercase tracking-wider">Dashboard</span>
           </Link>
           <Link to="/admin/orders" className={`flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-[12px] transition-colors ${location.pathname === '/admin/orders' ? 'bg-[#000000] text-white shadow-md' : 'bg-gray-50 text-[#666666] hover:bg-gray-100'}`}>
             <ShoppingBag className="w-5 h-5 mb-1" />
             <span className="text-[10px] font-bold uppercase tracking-wider">Orders</span>
           </Link>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
           <Routes>
              <Route path="/" element={<PermissionGate moduleId="dashboard"><Overview /></PermissionGate>} />
              <Route path="/products/*" element={<PermissionGate moduleId="products"><AdminProducts /></PermissionGate>} />
              <Route path="/categories/*" element={<PermissionGate moduleId="categories"><AdminCategories /></PermissionGate>} />
              <Route path="/orders/*" element={<PermissionGate moduleId="orders"><AdminOrders /></PermissionGate>} />
              <Route path="/orders/incomplete" element={<PermissionGate moduleId="orders"><AdminIncompleteOrders /></PermissionGate>} />
              <Route path="/live-tracking" element={<PermissionGate moduleId="dashboard"><AdminLiveTracking /></PermissionGate>} />
              <Route path="/customers/*" element={<PermissionGate moduleId="users"><AdminCustomers /></PermissionGate>} />
              <Route path="/management/stock" element={<PermissionGate moduleId="roles"><AdminStock /></PermissionGate>} />
              <Route path="/management/calculation" element={<PermissionGate moduleId="roles"><AdminCalculation /></PermissionGate>} />
              <Route path="/management/moderators" element={<PermissionGate moduleId="roles" superAdminOnly><ModeratorManagement /></PermissionGate>} />
              <Route path="/management/security" element={<PermissionGate moduleId="roles" superAdminOnly><SecuritySettings /></PermissionGate>} />
              <Route path="/management/sim-lock" element={<PermissionGate moduleId="roles" superAdminOnly><SIMLockSecurity /></PermissionGate>} />
              <Route path="/payments" element={<PermissionGate moduleId="payments"><AdminPaymentMethods /></PermissionGate>} />
              <Route path="/payment-list" element={<PermissionGate moduleId="payments"><AdminPaymentList /></PermissionGate>} />
              <Route path="/login-info" element={<PermissionGate moduleId="analytics"><AdminLoginInfo /></PermissionGate>} />
              <Route path="/automation" element={<PermissionGate moduleId="settings"><AdminAutomation /></PermissionGate>} />
              <Route path="/settings" element={<PermissionGate moduleId="settings"><AdminSettings /></PermissionGate>} />
              <Route path="/theme-settings" element={<PermissionGate moduleId="settings"><AdminThemeSettings /></PermissionGate>} />
              <Route path="/flutter-manager" element={<PermissionGate moduleId="settings"><FlutterManager /></PermissionGate>} />
              <Route path="/activity-logs" element={<PermissionGate moduleId="logs"><ComingSoon title="Activity Logs" /></PermissionGate>} />
              <Route path="/banners" element={<PermissionGate moduleId="banners"><AdminBanners /></PermissionGate>} />
              <Route path="/management/site-management" element={<PermissionGate moduleId="dashboard"><AdminSiteManagement /></PermissionGate>} />
              <Route path="/management/support-banner" element={<PermissionGate moduleId="dashboard"><AdminSupportBanner /></PermissionGate>} />
              <Route path="/support" element={<PermissionGate moduleId="support"><AdminSupport /></PermissionGate>} />
              <Route path="/reviews" element={<PermissionGate moduleId="dashboard"><AdminReviews /></PermissionGate>} />
              <Route path="/menu-management" element={<PermissionGate moduleId="settings"><AdminMenuManagement /></PermissionGate>} />
              <Route path="/system-management" element={<PermissionGate moduleId="dashboard"><AdminManagementModule /></PermissionGate>} />
              <Route path="/management/bar-management" element={<PermissionGate moduleId="settings"><AdminMenuManagement /></PermissionGate>} />
              <Route path="/management/review-monitoring" element={<PermissionGate moduleId="dashboard"><AdminReviews /></PermissionGate>} />
              <Route path="/management/promo-codes" element={<PermissionGate moduleId="dashboard"><AdminPromoCodes /></PermissionGate>} />
              <Route path="/management/banner-management" element={<PermissionGate moduleId="banners"><AdminBanners /></PermissionGate>} />
              <Route path="/management/popup-management" element={<PermissionGate moduleId="dashboard"><AdminPopupManagement /></PermissionGate>} />
              <Route path="/delivery/courier-api" element={<PermissionGate moduleId="orders"><AdminCourierAPI /></PermissionGate>} />
              <Route path="/delivery/courier-charge" element={<PermissionGate moduleId="orders"><AdminCourierCharges /></PermissionGate>} />
              <Route path="/game-control" element={<PermissionGate moduleId="dashboard"><AdminGameControl /></PermissionGate>} />
           </Routes>
        </div>
      </main>
    </div>
  );
}

function KPICard({ label, value, trend, icon: Icon, borderClass }: { label: string, value: string, trend: string, icon: any, borderClass: string }) {
  return (
    <div className={`bg-white p-4 lg:p-5 rounded-none border-l-[5px] ${borderClass} border border-[#EEEEEE] shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:-translate-y-1 transition-transform min-h-[130px] flex flex-col justify-between group`}>
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 bg-gray-50 rounded-none group-hover:bg-black group-hover:text-white transition-all">
          <Icon className="w-5 h-5 transition-colors" />
        </div>
        <span className="flex items-center text-[10px] sm:text-xs font-black text-black bg-gray-50 px-2 py-0.5 rounded-none border border-gray-100">
          {trend} <ArrowUpRight className="w-3 h-3 ml-0.5" />
        </span>
      </div>
      <div>
        <h3 className="text-[#666666] text-[10px] font-black uppercase tracking-widest mb-1">{label}</h3>
        <div className="text-lg sm:text-xl md:text-2xl font-black text-[#000000] truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

const COLORS = ['#000000', '#333333', '#666666', '#999999'];
const doughnutData = [
  { name: 'Delivered', value: 480 },
  { name: 'Processing', value: 240 },
  { name: 'Pending', value: 180 },
  { name: 'Cancelled', value: 120 },
];

function Overview() {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8 hidden md:flex">
        <div>
           <h2 className="text-2xl font-sans font-bold text-[#000000]">Overview Analytics</h2>
           <p className="text-[#666666] text-sm mt-1">Here's what's happening with your store today.</p>
        </div>
        <div className="flex bg-white border border-[#EEEEEE] rounded-none p-1 shadow-sm">
          {['Weekly', 'Monthly', 'Yearly'].map((period, i) => (
            <button key={period} className={`px-4 py-1.5 text-sm font-semibold rounded-none transition-colors ${i === 1 ? 'bg-[#000000] text-white' : 'text-[#666666] hover:bg-gray-50'}`}>
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 lg:space-y-8 mb-8">
        {/* Sales Overview */}
        <div className="bg-white p-6 rounded-none border border-[#EEEEEE] shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-sans font-bold text-[#000000]">Sales Overview</h3>
            <button className="text-[#000000] font-semibold text-sm hover:underline">Download Report</button>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenueOverview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666666', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#666666', fontSize: 12}} tickFormatter={(value) => `$${value}`} dx={-10} />
                <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid #EEEEEE', boxShadow: '0 4px 20px rgb(0,0,0,0.05)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueOverview)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Statistics Chart & Stats side by side or stacked */}
        <div className="bg-white p-6 rounded-none border border-[#EEEEEE] shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row gap-8 items-center justify-between">
          <div className="w-full sm:w-[45%] h-[280px]">
            <h3 className="text-lg font-sans font-bold text-[#000000] mb-2 text-center sm:text-left">Order Statistics</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={doughnutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {doughnutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgb(0,0,0,0.08)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full sm:w-[45%] grid grid-cols-2 gap-4">
            {doughnutData.map((item, i) => (
              <div key={item.name} className="flex flex-col gap-1 bg-gray-50 p-4 rounded-none border border-[#EEEEEE]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-none shrink-0" style={{ backgroundColor: COLORS[i] }}></span>
                  <span className="text-sm font-semibold text-[#666666]">{item.name}</span>
                </div>
                <span className="text-xl font-bold text-[#000000]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Growth Analytics */}
        <div className="bg-white p-6 rounded-none border border-[#EEEEEE] shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <h3 className="text-lg font-sans font-bold text-[#000000] mb-6">Customer Growth Analytics</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666666', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#666666', fontSize: 12}} dx={-10} />
                <RechartsTooltip cursor={{fill: '#f8f8f8'}} contentStyle={{ borderRadius: '12px', border: '1px solid #EEEEEE', boxShadow: '0 4px 20px rgb(0,0,0,0.05)' }} />
                <Bar dataKey="orders" fill="#000000" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <h3 className="text-lg font-sans font-black text-[#000000] mb-4 uppercase tracking-tighter">Enterprise Insights</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 mb-8">
         <KPICard label="Total Sales" value="BDT 854,200" trend="+18.2%" icon={DollarSign} borderClass="border-l-black" />
         <KPICard label="Total Orders" value="1,254" trend="+12.4%" icon={ShoppingBag} borderClass="border-l-black" />
         <KPICard label="Total Customers" value="842" trend="+8.5%" icon={Users} borderClass="border-l-black" />
         <KPICard label="Total Revenue" value="BDT 1,240K" trend="+15.3%" icon={Activity} borderClass="border-l-black" />
         <KPICard label="Total Reviews" value="3,842" trend="+9.8%" icon={Star} borderClass="border-l-black" />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-4">
        {/* Top Selling Products */}
        <div className="bg-white rounded-none border border-[#222] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#222] flex justify-between items-center shrink-0 bg-black text-white">
            <h3 className="text-sm font-black uppercase tracking-widest">Top Selling Products</h3>
            <button className="text-[10px] bg-white text-black px-3 py-1 font-black hover:bg-gray-100 transition-colors uppercase tracking-widest">View Details</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-black text-[10px] uppercase tracking-[0.2em] font-black border-b border-[#222]">
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Sales Amount</th>
                  <th className="p-4 text-right">Sold Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-sm">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-[#000000] font-medium flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-none border border-[#E5E5E5] shrink-0 group-hover:border-black transition-colors"></div>
                      <span className="font-bold truncate text-[13px] uppercase tracking-tight">Luxury Perfume {i}</span>
                    </td>
                    <td className="p-4 text-[#000000] font-black text-[13px]">{formatPrice(15000 - i * 1000)}</td>
                    <td className="p-4 text-right">
                      <span className="bg-black text-white px-2 py-1 rounded-none font-black text-[10px] whitespace-nowrap uppercase tracking-tighter">{120 - i * 10} Units</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-none border border-[#222] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#222] flex justify-between items-center shrink-0 bg-black text-white">
            <h3 className="text-sm font-black uppercase tracking-widest">Recent Activity Logs</h3>
            <button className="text-[10px] bg-white text-black px-3 py-1 font-black hover:bg-gray-100 transition-colors uppercase tracking-widest">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-black text-[10px] uppercase tracking-[0.2em] font-black border-b border-[#222]">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] text-sm text-black">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-black font-black whitespace-nowrap text-[13px]">#ORD-0{i}82</td>
                    <td className="p-4 text-gray-500 font-bold whitespace-nowrap text-[13px]">Jane Smith</td>
                    <td className="p-4 text-black font-black whitespace-nowrap text-[13px]">{formatPrice(12500)}</td>
                    <td className="p-4 text-right">
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-none border whitespace-nowrap uppercase tracking-tighter ${
                        i === 1 ? 'bg-black text-white border-black' :
                        i === 2 ? 'bg-zinc-800 text-white border-zinc-800' :
                        i === 3 ? 'bg-zinc-600 text-white border-zinc-600' :
                        i === 4 ? 'bg-zinc-400 text-white border-zinc-400' :
                        'bg-white text-black border-black'
                      }`}>
                        {i === 1 ? 'Delivered' : i === 2 ? 'Processing' : i === 3 ? 'Pending' : i === 4 ? 'Cancelled' : 'Refunded'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-none border border-[#EEEEEE] shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-12 text-center min-h-[60vh] flex flex-col items-center justify-center">
       <div className="w-20 h-20 bg-gray-50 rounded-none flex items-center justify-center mb-6">
         <Settings className="w-10 h-10 text-[#000000] opacity-50" />
       </div>
       <h2 className="text-3xl font-serif font-bold text-[#000000] mb-4">{title}</h2>
       <p className="text-[#666666] max-w-md mx-auto text-lg">
         This interface is currently under construction. All features will be available in the upcoming release.
       </p>
    </div>
  );
}

function AdminAnalytics() {
  return <ComingSoon title="Sales Analytics" />;
}

function AdminManagementModule() {
  return (
    <div className="bg-white rounded-none border border-[#EEEEEE] shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-12 text-center min-h-[60vh] flex flex-col items-center justify-center">
       <div className="w-20 h-20 bg-zinc-50 rounded-none flex items-center justify-center mb-6 border border-zinc-150">
         <span className="text-4xl text-zinc-800">🧩</span>
       </div>
       <h2 className="text-2xl font-sans font-bold text-[#000000] mb-4 uppercase tracking-widest">MANAGEMENT MODULE</h2>
       <p className="text-[#666666] max-w-md mx-auto text-base">
         Future administrative systems will appear here.
       </p>
    </div>
  );
}

function PermissionGate({ 
  children, 
  moduleId, 
  superAdminOnly = false 
}: { 
  children: React.ReactNode, 
  moduleId: string,
  superAdminOnly?: boolean
}) {
  const { user } = useAuthStore();
  
  if (!user) return <Navigate to="/login" replace />;

  // Super Admin can access everything
  if (user.role === 'admin') return <>{children}</>;

  // If mod is trying to access super-admin only page
  if (superAdminOnly) {
    return <AccessDenied reason="Super Admin Only" />;
  }

  // Check moderator permissions
  if (user.role === 'moderator' && user.permissions?.includes(moduleId)) {
    return <>{children}</>;
  }

  return <AccessDenied reason="Permission Required" />;
}

function AccessDenied({ reason }: { reason: string }) {
  return (
    <div className="bg-white rounded-none border border-[#EEEEEE] shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-12 text-center min-h-[60vh] flex flex-col items-center justify-center">
       <div className="w-20 h-20 bg-red-50 rounded-none flex items-center justify-center mb-6">
         <Shield className="w-10 h-10 text-red-500" />
       </div>
       <h2 className="text-3xl font-serif font-bold text-[#000000] mb-4">Access Denied</h2>
       <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-4 bg-red-50 px-4 py-1 border border-red-100">{reason}</p>
       <p className="text-[#666666] max-w-md mx-auto text-lg mb-8">
         Your role does not have the necessary permissions to access this specific module. 
         Please contact the primary administrator for authorization.
       </p>
       <Link to="/admin" className="px-8 py-3 bg-[#000000] text-white font-bold uppercase tracking-widest text-xs hover:bg-black/90 transition-all">
         Return to Dashboard
       </Link>
    </div>
  );
}

export { Overview };
