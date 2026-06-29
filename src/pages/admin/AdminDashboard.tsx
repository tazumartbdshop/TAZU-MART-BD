import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
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
  Trash2, 
  HardDrive,
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
  Puzzle,
  Coins,
  FileText,
  Folder
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
import AdminPaymentMerchant from './AdminPaymentMerchant';
import AdminPaymentList from './AdminPaymentList';
import AdminLiveTracking from './AdminLiveTracking';
import ModeratorManagement from './ModeratorManagement';
import SecuritySettings from './SecuritySettings';
import SIMLockSecurity from './SIMLockSecurity';
import AdminBanners from './AdminBanners';
import BannerListing from './BannerListing';
import AdminBrandShowcase from './AdminBrandShowcase';
import AdminGameControl from './AdminGameControl';
import AdminSupportBanner from './AdminSupportBanner';
import AdminThemeSettings from './AdminThemeSettings';
import AdminSupport from './AdminSupport';
import AdminAIControlCenter from './AdminAIControlCenter';
import AdminReviews from './AdminReviews';
import AdminReviewAdd from './AdminReviewAdd';
import AdminReviewList from './AdminReviewList';
import AdminReviewDetail from './AdminReviewDetail';
import { AdminCoinControl } from './AdminCoinControl';
import AdminBarControl from './AdminBarControl';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useModeratorStore } from '../../store/useModeratorStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { useSearchStore } from '../../store/useSearchStore';
import { useLeadStore } from '../../store/useLeadStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useReviewStore } from '../../store/useReviewStore';
import { defaultNavItems } from '../../lib/adminMenus';
import { useMenuSortStore } from '../../store/useMenuSortStore';
import { Database, PlusCircle, FolderPlus, FilePlus, UserPlus, FileCode, Edit, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminMenuManagement from './AdminMenuManagement';
import AdminPopupManagement from './AdminPopupManagement';
import AdminCourierAPI from './AdminCourierAPI';
import AdminCourierCharges from './AdminCourierCharges';
import AdminLoginInfo from './AdminLoginInfo';
import AdminPromoCodes from './AdminPromoCodes';
import AdminSiteManagement from './AdminSiteManagement';
import AdminStoreIdentity from './AdminStoreIdentity';
import AdminBusinessAddress from './AdminBusinessAddress';
import AdminSocialLinks from './AdminSocialLinks';
import AdminLoginProviders from './AdminLoginProviders';
import AdminMarketingSetup from './AdminMarketingSetup';
import AdminMarketingCenter from './AdminMarketingCenter';
import AdminMarketingTracking from './AdminMarketingTracking';
import AdminPushNotifications from './AdminPushNotifications';
import AdminSearchListing from './AdminSearchListing';
import AdminOffers from './AdminOffers';
import AdminFlutterBanner from './AdminFlutterBanner';

import { useProductStore } from '../../store/useProductStore';
import { useBannerStore } from '../../store/useBannerStore';
import MainHeroCarousel from '../../components/home/MainHeroCarousel';

const RevenueChartTooltip = ({ active, payload, label, salesData }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const currentSalesData = salesData || [];
    const index = currentSalesData.findIndex((item: any) => item.name === label);
    let growthText = 'N/A';
    let isPositive = true;

    if (index > 0) {
      const prevRevenue = currentSalesData[index - 1].revenue;
      const currentRevenue = data.revenue;
      const growth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
      isPositive = growth >= 0;
      growthText = `${isPositive ? '+' : ''}${growth.toFixed(1)}%`;
    } else {
      growthText = '+0.0%';
    }

    return (
      <div className="bg-white border border-zinc-200 p-4 shadow-xl rounded-none text-left min-w-[170px] animate-fade-in select-none">
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2 font-mono">
          {label}
        </p>
        <div className="space-y-1.5 font-sans">
          <div className="flex justify-between items-center gap-6">
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">Revenue</span>
            <span className="text-xs font-black text-black">৳{Math.round(data.revenue || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center gap-6">
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">Growth</span>
            <span className={`text-xs font-black ${isPositive ? 'text-green-500' : 'text-red-500'}`}>{growthText}</span>
          </div>
          <div className="flex justify-between items-center gap-6">
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">Orders</span>
            <span className="text-xs font-black text-zinc-700">{data.orders}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);

  // Solves mobile scroll trap / scroll freeze at boundaries
  useEffect(() => {
    const el = sidebarScrollRef.current;
    if (!el) return;

    const handleTouchStart = () => {
      const top = el.scrollTop;
      const totalScroll = el.scrollHeight;
      const currentScroll = top + el.offsetHeight;

      // Shift slightly off-boundary to guarantee the element remains the active scroll target
      if (top === 0) {
        el.scrollTop = 1;
      } else if (currentScroll >= totalScroll) {
        el.scrollTop = top - 1;
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
    };
  }, [sidebarOpen]);
  const [logoError, setLogoError] = useState(false);
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

  const toggleSidebar = () => {
    if (window.innerWidth >= 768) {
      const nextCollapsed = !isSidebarCollapsed;
      setIsSidebarCollapsed(nextCollapsed);
      if (nextCollapsed) {
        setOpenMenu(null);
      }
    } else {
      setSidebarOpen(!sidebarOpen);
    }
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
      let sortedSubItems = item.subItems 
        ? item.subItems
            .filter(sub => !deletedMenus.includes(`${item.name}:${sub.name}`))
            .map(sub => ({ 
              ...sub,
              name: renamedMenus[`${item.name}:${sub.name}`] || sub.name
            })) 
        : undefined;
      
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

  const { orders, markAllAsRead: markOrdersRead } = useOrderStore();
  const { customers, markAllAsRead: markCustomersRead } = useCustomerStore();
  const { searches, markAllAsRead: markSearchesRead } = useSearchStore();
  const { leads, markAllAsRead: markLeadsRead } = useLeadStore();

  const getSubItemCount = (name: string): number => {
    if (name === 'Incomplete Orders') return leads.filter(l => !l.isRead).length;
    if (name === 'Complete Orders') return orders.filter(o => o.status === 'Delivered').length;
    if (name === 'Customer Listing') return customers.filter(c => !c.isRead).length;
    return 0;
  };

  const getMainItemCount = (name: string): number => {
    if (name === 'Orders') return orders.filter(o => !o.isRead).length + leads.filter(l => !l.isRead).length;
    if (name === 'Customers') return customers.filter(c => !c.isRead).length;
    if (name === 'Search Listing') return searches.filter(s => !s.isRead).length;
    return 0;
  };

  useEffect(() => {
    if (location.pathname === '/admin/orders') {
      markOrdersRead();
    }
    if (location.pathname === '/admin/orders/incomplete') {
      markLeadsRead();
    }
    if (location.pathname.startsWith('/admin/customers')) {
      markCustomersRead();
    }
    if (location.pathname === '/admin/search-listing') {
      markSearchesRead();
    }
  }, [location.pathname, markOrdersRead, markCustomersRead, markSearchesRead, markLeadsRead]);

  const getBadgeStyle = (name: string) => {
    if (name === 'Orders' || name === 'Incomplete Orders' || name === 'Complete Orders') {
      return 'bg-gradient-to-br from-rose-500 via-red-600 to-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.4)] animate-pulse border border-white/10';
    }
    if (name === 'Customers' || name === 'Customer Listing' || name === 'Add Customer') {
      return 'bg-gradient-to-br from-violet-500 via-purple-600 to-violet-700 shadow-[0_0_15px_rgba(147,51,234,0.4)] border border-white/10';
    }
    if (name === 'Search Listing') {
      return 'bg-gradient-to-br from-cyan-500 via-blue-600 to-cyan-700 shadow-[0_0_15px_rgba(37,99,235,0.4)] animate-pulse border border-white/10';
    }
    return 'bg-red-600';
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
          className="fixed inset-0 bg-black/50 z-[95] md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 bottom-0 left-0 z-[100] h-screen admin-sidebar bg-[#000000] text-white shadow-2xl transition-all duration-300 ease-in-out overflow-hidden
          ${sidebarOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full md:translate-x-0'}
          ${!sidebarOpen && !isSidebarCollapsed ? 'md:w-72' : 'md:w-20'}
        `}
      >
        <div 
          ref={sidebarScrollRef}
          className="h-full flex flex-col overflow-y-auto overscroll-contain custom-scrollbar"
          style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
        >
            <div className={`p-6 mb-4 shrink-0 flex items-start transition-all duration-300 ${isSidebarCollapsed && !sidebarOpen ? 'justify-center p-4' : 'justify-between'}`}>
              <div className={`${isSidebarCollapsed && !sidebarOpen ? 'hidden' : 'block'}`}>
                <h2 className="text-xl font-sans font-black tracking-widest uppercase text-white mb-1">TAZU MART</h2>
                <span className="text-[10px] font-black text-gray-500 tracking-[0.1em] uppercase">Admin Core</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white mt-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          
          <nav className="space-y-1 flex-grow">
            {filteredNavItems.map((item) => {
              const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              const hasSubmenu = item.subItems && item.subItems.length > 0;
              const isExpanded = openMenu === item.name;
              const showLabels = !isSidebarCollapsed || sidebarOpen;

              return (
                <div key={item.name} className="flex flex-col gap-1">
                  {hasSubmenu ? (
                    <button
                      onClick={() => {
                        if (!showLabels) {
                          setIsSidebarCollapsed(false);
                          setOpenMenu(item.name);
                        } else {
                          toggleSubmenu(item.name);
                        }
                        if (item.path) {
                          navigate(item.path);
                          if (window.innerWidth < 768) setSidebarOpen(false);
                        }
                      }}
                      className={`flex items-center group px-6 py-4 rounded-none transition-all w-full border-l-[3px] 
                        ${active && !isExpanded ? 'bg-white/10 text-white font-bold border-purple-500' : 'text-gray-400 hover:bg-white/5 hover:text-white border-transparent'}
                        ${!showLabels ? 'justify-center px-0' : 'justify-between'}
                      `}
                    >
                      <div className={`flex items-center ${!showLabels ? 'justify-center' : 'gap-4'}`}>
                        <item.icon className={`w-[20px] h-[20px] transition-all duration-300 ${active && !isExpanded ? 'text-purple-400 scale-110' : 'text-current opacity-70 group-hover:opacity-100'}`} />
                        {showLabels && (
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold uppercase tracking-tight">{item.name}</span>
                            {getMainItemCount(item.name) > 0 && (
                              <span className={`px-2 py-0.5 text-[9px] font-black text-white rounded-full ${getBadgeStyle(item.name)}`}>
                                {getMainItemCount(item.name)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {showLabels && (
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                      )}
                    </button>
                  ) : (
                    <Link 
                      to={item.path || '#'}
                      onClick={() => {
                        if (window.innerWidth < 768) setSidebarOpen(false);
                      }}
                      className={`flex items-center group px-6 py-4 rounded-none transition-all border-l-[3px] 
                        ${active ? 'bg-white text-[#000000] font-black border-purple-600' : 'text-gray-400 hover:bg-white/5 hover:text-white border-transparent'}
                        ${!showLabels ? 'justify-center px-0' : 'justify-between'}
                      `}
                    >
                      <div className={`flex items-center ${!showLabels ? 'justify-center' : 'gap-4'}`}>
                        <item.icon className={`w-[20px] h-[20px] transition-all duration-300 ${active ? 'text-purple-600 scale-110' : 'text-current opacity-70 group-hover:opacity-100'}`} />
                        {showLabels && (
                          <div className="flex items-center gap-2">
                             <span className="text-[13px] font-bold uppercase tracking-tight">{item.name}</span>
                             {getMainItemCount(item.name) > 0 && (
                               <span className={`px-2 py-0.5 text-[9px] font-black text-white rounded-full ${getBadgeStyle(item.name)}`}>
                                 {getMainItemCount(item.name)}
                               </span>
                             )}
                          </div>
                        )}
                      </div>
                      {showLabels && item.name === '🛠 Admin Management' && (
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </Link>
                  )}

                  {hasSubmenu && showLabels && (
                    <div 
                       className="overflow-hidden transition-all duration-500 ease-in-out"
                       style={{ maxHeight: isExpanded ? `${item.subItems!.length * 50 + 20}px` : '0px', opacity: isExpanded ? 1 : 0 }}
                    >
                      <div className="pl-6 py-2 flex flex-col gap-1 border-l border-white/10 ml-8 mt-1 mb-2">
                        {item.subItems!.map(subItem => {
                          const subActive = location.pathname === subItem.path;
                          return (
                            <Link
                              key={subItem.name}
                              to={subItem.path}
                              onClick={() => {
                                if (window.innerWidth < 768) setSidebarOpen(false);
                              }}
                              className={`flex items-center gap-3 px-6 py-2.5 rounded-none text-[11px] transition-all group/sub ${subActive ? 'text-white font-bold' : 'text-gray-500 hover:text-white'}`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${subActive ? 'bg-cyan-400 scale-125' : 'bg-gray-700 group-hover/sub:bg-gray-400'}`} />
                              <span className="uppercase tracking-[0.15em] flex-1 font-semibold">{subItem.name}</span>
                              {getSubItemCount(subItem.name) > 0 && (
                                <span className={`px-2 py-0.5 text-[8px] font-black text-white rounded-full ${getBadgeStyle(subItem.name)}`}>
                                  {getSubItemCount(subItem.name)}
                                </span>
                              )}
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
          
          <div className={`mt-auto p-6 flex flex-col gap-5 border-t border-white/5 transition-all ${isSidebarCollapsed && !sidebarOpen ? 'px-0 items-center' : ''}`}>
             <Link to="/" className={`text-gray-500 hover:text-white flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isSidebarCollapsed && !sidebarOpen ? 'w-full justify-center px-0' : ''}`}>
                <Monitor className="w-5 h-5" />
                {(!isSidebarCollapsed || sidebarOpen) && "Back to Store"}
             </Link>
             <button onClick={handleLogout} className={`text-red-500/80 hover:text-red-400 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all text-left ${isSidebarCollapsed && !sidebarOpen ? 'w-full justify-center px-0' : ''}`}>
                <LogOut className="w-5 h-5" />
                {(!isSidebarCollapsed || sidebarOpen) && "End Session"}
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
              onClick={toggleSidebar}
              className="p-2 text-[#000000] hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg md:text-2xl font-sans text-[#000000] font-bold hidden sm:block capitalize truncate max-w-[200px] md:max-w-none">
              {location.pathname === '/admin' ? 'Dashboard Overview' : location.pathname.split('/').pop()?.replace(/-/g, ' ')}
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
               {settings.storeLogo && !logoError ? (
                 <img src={settings.storeLogo} onError={() => setLogoError(true)} alt="Logo" className="w-full h-full object-contain transition-all duration-300" referrerPolicy="no-referrer" />
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
              <Route path="/categories/*" element={<PermissionGate moduleId="categories"><AdminCategories /></PermissionGate>} />
              <Route path="/category-listing/*" element={<PermissionGate moduleId="categories"><AdminCategories /></PermissionGate>} />
              <Route path="/category-add/*" element={<PermissionGate moduleId="categories"><AdminCategories /></PermissionGate>} />
              <Route path="/product-listing/*" element={<PermissionGate moduleId="products"><AdminProducts /></PermissionGate>} />
              <Route path="/products/*" element={<PermissionGate moduleId="products"><AdminProducts /></PermissionGate>} />
              <Route path="/offers/*" element={<PermissionGate moduleId="products"><AdminOffers /></PermissionGate>} />
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
              <Route path="/payments/merchant" element={<PermissionGate moduleId="payments"><AdminPaymentMerchant /></PermissionGate>} />
              <Route path="/payment-list" element={<PermissionGate moduleId="payments"><AdminPaymentList /></PermissionGate>} />
              <Route path="/login-info" element={<PermissionGate moduleId="analytics"><AdminLoginInfo /></PermissionGate>} />
              <Route path="/automation" element={<PermissionGate moduleId="settings"><AdminAutomation /></PermissionGate>} />
              <Route path="/settings" element={<PermissionGate moduleId="settings"><AdminSettings /></PermissionGate>} />
              <Route path="/theme-settings" element={<PermissionGate moduleId="settings"><AdminThemeSettings /></PermissionGate>} />
              <Route path="/flutter-manager" element={<PermissionGate moduleId="settings"><FlutterManager /></PermissionGate>} />
              <Route path="/activity-logs" element={<PermissionGate moduleId="logs"><ComingSoon title="Activity Logs" /></PermissionGate>} />
              <Route path="/banner/create" element={<PermissionGate moduleId="banners"><AdminBanners /></PermissionGate>} />
              <Route path="/banner/list" element={<PermissionGate moduleId="banners"><BannerListing /></PermissionGate>} />
              <Route path="/flutter-banner" element={<PermissionGate moduleId="banners"><AdminFlutterBanner /></PermissionGate>} />
              <Route path="/brand-showcase" element={<PermissionGate moduleId="banners"><AdminBrandShowcase /></PermissionGate>} />
              <Route path="/management/site-management" element={<PermissionGate moduleId="dashboard"><AdminSiteManagement /></PermissionGate>} />
              <Route path="/management/store-identity" element={<PermissionGate moduleId="dashboard"><AdminStoreIdentity /></PermissionGate>} />
              <Route path="/management/business-address" element={<PermissionGate moduleId="dashboard"><AdminBusinessAddress /></PermissionGate>} />
              <Route path="/management/social-links" element={<PermissionGate moduleId="dashboard"><AdminSocialLinks /></PermissionGate>} />
              <Route path="/management/login-provider" element={<PermissionGate moduleId="dashboard"><AdminLoginProviders /></PermissionGate>} />
              <Route path="/management/support-banner" element={<PermissionGate moduleId="dashboard"><AdminSupportBanner /></PermissionGate>} />
              <Route path="/support" element={<PermissionGate moduleId="support"><AdminSupport /></PermissionGate>} />
              <Route path="/ai-control-center" element={<PermissionGate moduleId="settings"><AdminAIControlCenter /></PermissionGate>} />
              <Route path="/reviews" element={<PermissionGate moduleId="dashboard"><AdminReviewList /></PermissionGate>} />
              <Route path="/reviews/add" element={<PermissionGate moduleId="dashboard"><AdminReviewAdd /></PermissionGate>} />
              <Route path="/reviews/list" element={<PermissionGate moduleId="dashboard"><AdminReviewList /></PermissionGate>} />
              <Route path="/reviews/detail/:id" element={<PermissionGate moduleId="dashboard"><AdminReviewDetail /></PermissionGate>} />
              <Route path="/search-listing" element={<PermissionGate moduleId="products"><AdminSearchListing /></PermissionGate>} />
              <Route path="/search-analytics" element={<PermissionGate moduleId="analytics"><AdminSearchListing /></PermissionGate>} />
              <Route path="/analytics" element={<PermissionGate moduleId="analytics"><AdminAnalytics /></PermissionGate>} />
              <Route path="/menu-management" element={<PermissionGate moduleId="settings"><AdminMenuManagement /></PermissionGate>} />
              <Route path="/system-management" element={<PermissionGate moduleId="dashboard"><AdminManagementModule /></PermissionGate>} />
              <Route path="/management/bar-management" element={<PermissionGate moduleId="settings"><AdminMenuManagement /></PermissionGate>} />
              <Route path="/management/review-monitoring" element={<PermissionGate moduleId="dashboard"><AdminReviews /></PermissionGate>} />
              <Route path="/management/promo-codes" element={<PermissionGate moduleId="dashboard"><AdminPromoCodes /></PermissionGate>} />
              <Route path="/management/push-notifications" element={<PermissionGate moduleId="dashboard"><AdminPushNotifications /></PermissionGate>} />
              <Route path="/management/banner-management" element={<PermissionGate moduleId="banners"><AdminBanners /></PermissionGate>} />
              <Route path="/management/popup-management" element={<PermissionGate moduleId="dashboard"><AdminPopupManagement /></PermissionGate>} />
              <Route path="/delivery/courier-api" element={<PermissionGate moduleId="orders"><AdminCourierAPI /></PermissionGate>} />
              <Route path="/delivery/courier-charge" element={<PermissionGate moduleId="orders"><AdminCourierCharges /></PermissionGate>} />
              <Route path="/game-control" element={<PermissionGate moduleId="dashboard"><AdminBarControl /></PermissionGate>} />
              <Route path="/coin-control" element={<PermissionGate moduleId="dashboard"><AdminBarControl /></PermissionGate>} />
              <Route path="/bar-control" element={<PermissionGate moduleId="dashboard"><AdminBarControl /></PermissionGate>} />
           </Routes>
        </div>
      </main>
    </div>
  );
}

function KPICard({ label, value, trend, icon: Icon, borderClass, themeColor, to }: { label: string, value: string, trend: string, icon: any, borderClass: string, themeColor: string, to?: string }) {
  const cardContent = (
    <>
      {/* Subtle Background Tint */}
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150`} style={{ backgroundColor: themeColor }}></div>
      
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className={`p-2.5 rounded-none transition-all duration-300`} style={{ backgroundColor: `${themeColor}10`, color: themeColor }}>
           <Icon className="w-4.5 h-4.5" />
        </div>
        <span className="flex items-center text-[10px] sm:text-[11px] font-black px-2 py-1 rounded-none border transition-colors duration-300" 
              style={{ backgroundColor: `${themeColor}08`, borderColor: `${themeColor}20`, color: themeColor }}>
          {trend} <ArrowUpRight className="w-3 h-3 ml-0.5" />
        </span>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1.5">{label}</h3>
        <div className="text-xl sm:text-2xl font-black text-[#000000] tracking-tighter truncate">
          {value}
        </div>
      </div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`bg-white p-4 lg:p-5 rounded-none border-l-[4px] ${borderClass} border border-[#EEEEEE] shadow-[0_2px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 min-h-[140px] flex flex-col justify-between group relative overflow-hidden cursor-pointer`}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={`bg-white p-4 lg:p-5 rounded-none border-l-[4px] ${borderClass} border border-[#EEEEEE] shadow-[0_2px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 min-h-[140px] flex flex-col justify-between group relative overflow-hidden`}>
      {cardContent}
    </div>
  );
}

function Overview() {
  const { products, autoRankTrending, autoRankBestSellers } = useProductStore();
  const [rankingStatus, setRankingStatus] = useState<string | null>(null);
  const { banners: storeBanners } = useBannerStore();
  const { orders } = useOrderStore();
  const { customers } = useCustomerStore();
  const { reviews } = useReviewStore();

  const handleAutoRank = async (type: 'trending' | 'best') => {
    setRankingStatus(type === 'trending' ? 'Ranking Trending...' : 'Ranking Best Sellers...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (type === 'trending') autoRankTrending();
    else autoRankBestSellers();
    setRankingStatus('Ranking Updated ✓');
    setTimeout(() => setRankingStatus(null), 3000);
  };

  const activeBanners = storeBanners.filter(b => b.status === 'active' && b.image && b.image.trim() !== '');
  const displayBanners = activeBanners;

  // Dynamic Month Calculations (Ending at current month)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const last6Months = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    last6Months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      name: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      shortName: monthNames[d.getMonth()],
      revenue: 0,
      orders: 0,
      registrations: 0
    });
  }

  // Populate dynamic month data
  orders.forEach(order => {
    const orderDate = new Date(order.date);
    const orderYear = orderDate.getFullYear();
    const orderMonth = orderDate.getMonth();
    const isRevenueOrder = order.status === 'Delivered' || order.paymentStatus === 'Paid';
    const orderTotal = Number(order.total) || 0;

    const match = last6Months.find(m => m.year === orderYear && m.month === orderMonth);
    if (match) {
      if (isRevenueOrder) {
        match.revenue += orderTotal;
      }
      match.orders += 1;
    }
  });

  customers.forEach(cust => {
    const regDate = typeof cust.createdAt === 'number' ? new Date(cust.createdAt) : new Date(cust.createdAt || Date.now());
    const regYear = regDate.getFullYear();
    const regMonth = regDate.getMonth();

    const match = last6Months.find(m => m.year === regYear && m.month === regMonth);
    if (match) {
      match.registrations += 1;
    }
  });

  const chartDisplayData = last6Months;

  // Monthly growth helper
  const getGrowthPercentage = (currentVal: number, prevVal: number): string => {
    if (prevVal === 0) {
      return currentVal > 0 ? '+100.0%' : '+0.0%';
    }
    const growth = ((currentVal - prevVal) / prevVal) * 100;
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const prevDate = new Date(currentYear, currentMonth - 1, 1);
  const prevYear = prevDate.getFullYear();
  const prevMonth = prevDate.getMonth();

  const isCurrentMonth = (dateVal: string | number) => {
    const d = new Date(dateVal);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  };

  const isPreviousMonth = (dateVal: string | number) => {
    const d = new Date(dateVal);
    return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
  };

  // Enterprise Insights (KPI Cards with Dynamic Growth)
  // 1. Total Sales (Delivered orders total)
  const totalSalesVal = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const curSales = orders
    .filter(o => o.status === 'Delivered' && isCurrentMonth(o.date))
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const prevSales = orders
    .filter(o => o.status === 'Delivered' && isPreviousMonth(o.date))
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const salesGrowth = getGrowthPercentage(curSales, prevSales);

  // 2. Total Orders
  const totalOrdersVal = orders.length;
  const curOrders = orders.filter(o => isCurrentMonth(o.date)).length;
  const prevOrders = orders.filter(o => isPreviousMonth(o.date)).length;
  const ordersGrowth = getGrowthPercentage(curOrders, prevOrders);

  // 3. Total Customers
  const totalCustomersVal = customers.length;
  const curCustomers = customers.filter(c => isCurrentMonth(c.createdAt)).length;
  const prevCustomers = customers.filter(c => isPreviousMonth(c.createdAt)).length;
  const customersGrowth = getGrowthPercentage(curCustomers, prevCustomers);

  // 4. Total Revenue (Delivered or Paid orders total)
  const totalRevenueVal = orders
    .filter(o => o.status === 'Delivered' || o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const curRevenue = orders
    .filter(o => (o.status === 'Delivered' || o.paymentStatus === 'Paid') && isCurrentMonth(o.date))
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const prevRevenue = orders
    .filter(o => (o.status === 'Delivered' || o.paymentStatus === 'Paid') && isPreviousMonth(o.date))
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const revenueGrowth = getGrowthPercentage(curRevenue, prevRevenue);

  // 5. Total Reviews
  const totalReviewsVal = reviews.length;
  const curReviews = reviews.filter(r => isCurrentMonth(r.createdAt)).length;
  const prevReviews = reviews.filter(r => isPreviousMonth(r.createdAt)).length;
  const reviewsGrowth = getGrowthPercentage(curReviews, prevReviews);

  // Order status distribution
  const deliveredVal = orders.filter(o => o.status === 'Delivered').length;
  const processingVal = orders.filter(o => ['Processing', 'Confirmed', 'Packaging', 'Shipping'].includes(o.status)).length;
  const pendingVal = orders.filter(o => ['Pending', 'Placed'].includes(o.status)).length;
  const cancelledVal = orders.filter(o => ['Cancelled', 'Returned'].includes(o.status)).length;

  const doughnutData = [
    { name: 'Delivered', value: deliveredVal, color: deliveredVal === 0 ? '#d4d4d8' : '#18181b' },
    { name: 'Processing', value: processingVal, color: processingVal === 0 ? '#d4d4d8' : '#0ea5e9' },
    { name: 'Pending', value: pendingVal, color: pendingVal === 0 ? '#d4d4d8' : '#a855f7' },
    { name: 'Cancelled', value: cancelledVal, color: cancelledVal === 0 ? '#d4d4d8' : '#f43f5e' },
  ];
  const COLORS = doughnutData.map(item => item.color);
  const totalDistribution = deliveredVal + processingVal + pendingVal + cancelledVal;

  // Marketplace Trends (Top Selling Products calculation)
  const productStatsMap: { [id: string]: { id: string; name: string; category: string; image: string; revenue: number; unitsSold: number; profit: number } } = {};

  orders.forEach(order => {
    if (['Cancelled', 'Returned'].includes(order.status)) return;
    order.items?.forEach(item => {
      const pId = item.productId;
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const rev = price * qty;

      const matchedProduct = products.find(p => p.id === pId);
      const buyingPrice = matchedProduct?.buyingPrice || price * 0.7;
      const profit = (price - buyingPrice) * qty;

      if (!productStatsMap[pId]) {
        productStatsMap[pId] = {
          id: pId,
          name: item.name,
          category: matchedProduct?.category || 'General',
          image: matchedProduct?.image || item.image || '',
          revenue: 0,
          unitsSold: 0,
          profit: 0
        };
      }
      productStatsMap[pId].revenue += rev;
      productStatsMap[pId].unitsSold += qty;
      productStatsMap[pId].profit += profit;
    });
  });

  const calculatedTrends = Object.values(productStatsMap)
    .sort((a, b) => b.unitsSold - a.unitsSold);

  const finalTrends = [...calculatedTrends];
  if (finalTrends.length < 5) {
    products.forEach(p => {
      if (finalTrends.length >= 5) return;
      if (!productStatsMap[p.id]) {
        finalTrends.push({
          id: p.id,
          name: p.name,
          category: p.category || 'General',
          image: p.image || '',
          revenue: 0,
          unitsSold: 0,
          profit: 0
        });
      }
    });
  }
  const displayTrends = finalTrends.slice(0, 5);

  // Recent Logistics Feed
  const displayRecentOrders = [...orders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const currentMonthData = chartDisplayData[chartDisplayData.length - 1] || { name: 'Month', revenue: 0, orders: 0 };
  const previousMonthData = chartDisplayData[chartDisplayData.length - 2] || { name: 'Month', revenue: 0, orders: 0 };
  const revenueGrowthValue = currentMonthData.revenue - previousMonthData.revenue;
  const isRevenueGrowthPositive = revenueGrowthValue >= 0;
  const activeColor = isRevenueGrowthPositive ? '#22C55E' : '#EF4444';
  const growthPercentage = previousMonthData.revenue > 0 
    ? ((revenueGrowthValue / previousMonthData.revenue) * 100).toFixed(1) 
    : (revenueGrowthValue > 0 ? '100.0' : '0.0');

  const totalAccumulatedRevenue = chartDisplayData.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8 hidden md:flex">
        <div>
           <h2 className="text-2xl font-sans font-bold text-[#000000]">Overview Analytics</h2>
           <p className="text-[#666666] text-sm mt-1">Here's what's happening with your store today.</p>
        </div>
        <div className="flex gap-4">
           {rankingStatus && (
              <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-4 py-2 border border-purple-100 uppercase tracking-widest animate-pulse flex items-center">
                {rankingStatus}
              </span>
           )}
           <div className="flex bg-white border border-[#EEEEEE] rounded-none p-1 shadow-sm">
             {['Weekly', 'Monthly', 'Yearly'].map((period, i) => (
                <button key={period} className={`px-4 py-1.5 text-sm font-semibold rounded-none transition-colors ${i === 1 ? 'bg-[#000000] text-white' : 'text-[#666666] hover:bg-gray-50'}`}>
                  {period}
                </button>
             ))}
           </div>
        </div>
      </div>

      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full mb-10 overflow-hidden"
      >
        <MainHeroCarousel banners={displayBanners as any} />
      </motion.section>

      <div className="space-y-6 lg:space-y-10 mb-10">
        {/* Sales Overview */}
        <div className="bg-white p-6 lg:p-8 rounded-none border border-neutral-200 shadow-sm relative overflow-hidden group">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6 pb-6 border-b border-zinc-100 relative z-10">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-sans font-black text-[#000000] uppercase tracking-widest">Marketplace Revenue</h3>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border rounded-none ${
                  isRevenueGrowthPositive 
                    ? 'text-green-600 bg-green-50 border-green-200' 
                    : 'text-red-600 bg-red-50 border-red-200'
                }`}>
                  {isRevenueGrowthPositive ? '▲ Uptrend' : '▼ Downtrend'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Real-time Transactional Flow</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <div>
                <span className="text-[8px] text-zinc-400 font-black uppercase tracking-widest block mb-0.5">Total Revenue</span>
                <div className="text-base font-black text-black tracking-tight">
                  ৳{totalAccumulatedRevenue.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-[8px] text-zinc-400 font-black uppercase tracking-widest block mb-0.5">Active Month ({currentMonthData.name})</span>
                <div className="text-base font-black text-black tracking-tight">
                  ৳{currentMonthData.revenue.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-[8px] text-zinc-400 font-black uppercase tracking-widest block mb-0.5">Monthly Growth</span>
                <div className={`text-xs font-black flex items-center gap-1 ${isRevenueGrowthPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                  <span>{isRevenueGrowthPositive ? '▲' : '▼'}</span>
                  <span>{isRevenueGrowthPositive ? '+' : ''}{growthPercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[280px] sm:h-[350px] md:h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartDisplayData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenueOverview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeColor} stopOpacity={0.12}/>
                    <stop offset="95%" stopColor={activeColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 9, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 9, fontWeight: 700}} tickFormatter={(value) => `৳${value.toLocaleString()}`} dx={-5} />
                <RechartsTooltip content={<RevenueChartTooltip salesData={chartDisplayData} />} />
                <Area type="monotone" dataKey="revenue" stroke={activeColor} strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueOverview)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Statistics Chart & Stats side by side or stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Order Distribution */}
          <div className="bg-white p-6 lg:p-8 rounded-none border border-neutral-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
            <div className="mb-8">
              <h3 className="text-lg font-sans font-black text-[#0a0a0a] uppercase tracking-tighter">Order Distribution</h3>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em]">Fulfillment Analytics</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-8 lg:gap-12">
              <div className="w-full sm:w-[50%] h-[260px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={doughnutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      fill="#8884d8"
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {doughnutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '0px', border: '1px solid #f0f0f0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} 
                      itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text for donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Total</span>
                  <span className="text-2xl font-black text-neutral-900">{totalDistribution.toLocaleString()}</span>
                </div>
              </div>

              <div className="w-full sm:w-[50%] grid grid-cols-2 gap-3">
                {doughnutData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between p-3.5 bg-neutral-50/50 hover:bg-neutral-50 border-l-[3px] border-neutral-100 transition-all" style={{ borderLeftColor: item.color }}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-[11px] font-black text-neutral-900 uppercase tracking-wider">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-neutral-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Growth Analytics */}
          <div className="bg-white p-6 lg:p-8 rounded-none border border-neutral-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-600"></div>
            <div className="mb-10 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-sans font-black text-[#0a0a0a] uppercase tracking-tighter">Acquisition Velocity</h3>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em]">New Customers Registered</p>
              </div>
              <Activity className="w-5 h-5 text-cyan-400 opacity-50" />
            </div>
            
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDisplayData} barSize={32}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0891b2" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#0891b2" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} dy={12} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} dx={-10} />
                  <RechartsTooltip 
                    cursor={{fill: '#f9fafb'}} 
                    contentStyle={{ borderRadius: '0px', border: '1px solid #f0f0f0', boxShadow: '0 8px 25px rgba(0,0,0,0.06)' }}
                    itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                  />
                  <Bar dataKey="registrations" fill="url(#barGradient)" radius={[4, 4, 0, 0]} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <h3 className="text-lg font-sans font-black text-[#000000] mb-4 uppercase tracking-tighter">Enterprise Insights</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 mb-8">
         <KPICard label="Total Sales" value={`BDT ${totalSalesVal.toLocaleString()}`} trend={salesGrowth} icon={DollarSign} borderClass="border-l-purple-600" themeColor="#9333ea" to="/admin/orders" />
         <KPICard label="Total Orders" value={totalOrdersVal.toLocaleString()} trend={ordersGrowth} icon={ShoppingBag} borderClass="border-l-blue-600" themeColor="#2563eb" to="/admin/orders" />
         <KPICard label="Total Customers" value={totalCustomersVal.toLocaleString()} trend={customersGrowth} icon={Users} borderClass="border-l-cyan-600" themeColor="#0891b2" to="/admin/customers" />
         <KPICard label="Total Revenue" value={`BDT ${totalRevenueVal.toLocaleString()}`} trend={revenueGrowth} icon={Activity} borderClass="border-l-emerald-600" themeColor="#10b981" to="/admin/orders" />
         <KPICard label="Total Reviews" value={totalReviewsVal.toLocaleString()} trend={reviewsGrowth} icon={Star} borderClass="border-l-rose-600" themeColor="#e11d48" to="/admin/reviews" />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-none border border-neutral-100 overflow-hidden flex flex-col shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center shrink-0 bg-[#0a0a0a] text-white">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-white">
               <div className="w-1 h-3 bg-purple-500 rounded-full"></div> MAIN MARKETPLACE TRENDS
            </h3>
            <button className="text-[9px] bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 font-black transition-all uppercase tracking-widest active:scale-95">View Trends</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/50 text-neutral-400 text-[9px] uppercase tracking-[0.2em] font-black border-b border-neutral-100">
                  <th className="p-5">Catalog Item</th>
                  <th className="p-5">Revenue</th>
                  <th className="p-5">Profit</th>
                  <th className="p-5 text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {displayTrends.map((trend, idx) => (
                  <tr key={trend.id || idx} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="p-5 text-[#000000] font-medium flex items-center gap-4">
                      <div className="w-11 h-11 bg-neutral-100 rounded-none border border-neutral-200 shrink-0 group-hover:border-purple-300 transition-colors relative overflow-hidden">
                         {trend.image ? (
                           <img src={trend.image} alt={trend.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                         ) : (
                           <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent flex items-center justify-center text-[10px] font-black">N/A</div>
                         )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black truncate text-[12px] uppercase tracking-wide text-neutral-900 group-hover:text-purple-600 transition-colors">{trend.name}</span>
                        <span className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase mt-0.5">{trend.category}</span>
                      </div>
                    </td>
                    <td className="p-5 text-neutral-900 font-black text-xs">৳{Math.round(trend.revenue).toLocaleString()}</td>
                    <td className="p-5 text-green-600 font-black text-xs">৳{Math.round(trend.profit).toLocaleString()}</td>
                    <td className="p-5 text-right">
                      <span className="bg-neutral-950 text-white px-2.5 py-1 rounded-none font-black text-[9px] whitespace-nowrap uppercase tracking-widest group-hover:bg-purple-600 transition-colors shadow-sm">{trend.unitsSold} Units</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-none border border-neutral-100 overflow-hidden flex flex-col shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center shrink-0 bg-[#0a0a0a] text-white">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-white">
               <div className="w-1 h-3 bg-cyan-500 rounded-full"></div> RECENT LOGISTICS FEED
            </h3>
            <button className="text-[9px] bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 font-black transition-all uppercase tracking-widest active:scale-95">All Activity</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border-y border-neutral-50/50">
              <thead>
                <tr className="bg-neutral-50/50 text-neutral-400 text-[9px] uppercase tracking-[0.2em] font-black border-b border-neutral-100">
                  <th className="p-5">Order Reference</th>
                  <th className="p-5">Beneficiary</th>
                  <th className="p-5">Total</th>
                  <th className="p-5 text-right">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm text-black">
                {displayRecentOrders.map((order, idx) => (
                  <tr key={order.id || idx} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="p-5 text-neutral-900 font-black whitespace-nowrap text-xs group-hover:text-cyan-600 transition-colors">{order.orderId || `#ORD-${order.id}`}</td>
                    <td className="p-5 text-neutral-500 font-bold whitespace-nowrap text-xs">{order.customerName}</td>
                    <td className="p-5 text-neutral-900 font-black whitespace-nowrap text-xs">৳{Math.round(order.total).toLocaleString()}</td>
                    <td className="p-5 text-right">
                      <span className={`px-2.5 py-1.5 text-[9px] font-black rounded-none border whitespace-nowrap uppercase tracking-widest shadow-sm transition-all ${
                        order.status === 'Delivered' ? 'bg-purple-600 text-white border-purple-600' :
                        ['Processing', 'Confirmed', 'Packaging', 'Shipping'].includes(order.status) ? 'bg-blue-600 text-white border-blue-600' :
                        ['Pending', 'Placed'].includes(order.status) ? 'bg-amber-500 text-white border-amber-500' :
                        ['Cancelled', 'Returned'].includes(order.status) ? 'bg-rose-500 text-white border-rose-500' :
                        'bg-emerald-500 text-white border-emerald-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {displayRecentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-xs font-bold text-neutral-400 uppercase tracking-widest">No logistics feeds logged yet</td>
                  </tr>
                )}
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
