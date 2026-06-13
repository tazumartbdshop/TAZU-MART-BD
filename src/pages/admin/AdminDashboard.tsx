import React, { useState, useEffect } from 'react';
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
import { AdminCoinControl } from './AdminCoinControl';
import AdminBarControl from './AdminBarControl';
import FirebaseWorkspace from './FirebaseWorkspace';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useModeratorStore } from '../../store/useModeratorStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { useSearchStore } from '../../store/useSearchStore';
import { useLeadStore } from '../../store/useLeadStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
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
import AdminBranding from './AdminBranding';
import AdminBusinessAddress from './AdminBusinessAddress';
import AdminSocialLinks from './AdminSocialLinks';
import AdminLoginProviders from './AdminLoginProviders';
import AdminMarketingSetup from './AdminMarketingSetup';
import AdminMarketingCenter from './AdminMarketingCenter';
import AdminMarketingTracking from './AdminMarketingTracking';
import AdminPushNotifications from './AdminPushNotifications';
import AdminInfrastructure from './AdminInfrastructure';
import AdminSearchListing from './AdminSearchListing';
import AdminOffers from './AdminOffers';
import AdminFlutterBanner from './AdminFlutterBanner';

import { useProductStore } from '../../store/useProductStore';
import { useBannerStore } from '../../store/useBannerStore';
import MainHeroCarousel from '../../components/home/MainHeroCarousel';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
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
        <div className="h-full flex flex-col overflow-y-auto custom-scrollbar">
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
              <Route path="/management/branding" element={<PermissionGate moduleId="dashboard"><AdminBranding /></PermissionGate>} />
              <Route path="/management/business-address" element={<PermissionGate moduleId="dashboard"><AdminBusinessAddress /></PermissionGate>} />
              <Route path="/management/social-links" element={<PermissionGate moduleId="dashboard"><AdminSocialLinks /></PermissionGate>} />
              <Route path="/management/login-provider" element={<PermissionGate moduleId="dashboard"><AdminLoginProviders /></PermissionGate>} />
              <Route path="/management/support-banner" element={<PermissionGate moduleId="dashboard"><AdminSupportBanner /></PermissionGate>} />
              <Route path="/support" element={<PermissionGate moduleId="support"><AdminSupport /></PermissionGate>} />
              <Route path="/ai-control-center" element={<PermissionGate moduleId="settings"><AdminAIControlCenter /></PermissionGate>} />
              <Route path="/reviews" element={<PermissionGate moduleId="dashboard"><AdminReviews /></PermissionGate>} />
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
              <Route path="/game-control" element={<PermissionGate moduleId="dashboard"><AdminGameControl /></PermissionGate>} />
              <Route path="/coin-control" element={<PermissionGate moduleId="dashboard"><AdminCoinControl /></PermissionGate>} />
              <Route path="/bar-control" element={<PermissionGate moduleId="dashboard"><AdminBarControl /></PermissionGate>} />
              <Route path="/marketing/facebook" element={<PermissionGate moduleId="dashboard"><AdminMarketingTracking /></PermissionGate>} />
              <Route path="/marketing/tiktok" element={<PermissionGate moduleId="dashboard"><AdminMarketingTracking /></PermissionGate>} />
              <Route path="/marketing/google" element={<PermissionGate moduleId="dashboard"><AdminMarketingTracking /></PermissionGate>} />
              <Route path="/marketing-center" element={<PermissionGate moduleId="dashboard"><AdminMarketingTracking /></PermissionGate>} />
               <Route path="/marketing/serverside" element={<PermissionGate moduleId="dashboard"><AdminMarketingTracking /></PermissionGate>} />
               <Route path="/marketing/website" element={<PermissionGate moduleId="dashboard"><AdminMarketingTracking /></PermissionGate>} />
               <Route path="/marketing/pinterest" element={<PermissionGate moduleId="dashboard"><AdminMarketingTracking /></PermissionGate>} />
               <Route path="/marketing/snapchat" element={<PermissionGate moduleId="dashboard"><AdminMarketingTracking /></PermissionGate>} />
               <Route path="/marketing/linkedin" element={<PermissionGate moduleId="dashboard"><AdminMarketingTracking /></PermissionGate>} />
               <Route path="/marketing/microsoft" element={<PermissionGate moduleId="dashboard"><AdminMarketingTracking /></PermissionGate>} />
               <Route path="/marketing/attribution" element={<PermissionGate moduleId="dashboard"><AdminMarketingTracking /></PermissionGate>} />
               <Route path="/marketing/testing" element={<PermissionGate moduleId="dashboard"><AdminMarketingTracking /></PermissionGate>} />
              <Route path="/marketing-tracking" element={<PermissionGate moduleId="dashboard"><AdminMarketingTracking /></PermissionGate>} />
              
              {/* 🔥 Firebase Workspace Routes */}
              <Route path="/firebase-workspace/files" element={<PermissionGate moduleId="settings"><FirebaseWorkspace defaultTab="files" /></PermissionGate>} />
              <Route path="/firebase-workspace/notes" element={<PermissionGate moduleId="settings"><FirebaseWorkspace defaultTab="notes" /></PermissionGate>} />
              <Route path="/firebase-workspace/team-members" element={<PermissionGate moduleId="settings"><FirebaseWorkspace defaultTab="team-members" /></PermissionGate>} />
              <Route path="/firebase-workspace" element={<PermissionGate moduleId="settings"><FirebaseWorkspace defaultTab="files" /></PermissionGate>} />
              
              <Route path="/infrastructure" element={<PermissionGate moduleId="settings"><AdminInfrastructure /></PermissionGate>} />
              <Route path="/infrastructure/*" element={<PermissionGate moduleId="settings"><AdminInfrastructure /></PermissionGate>} />
           </Routes>
        </div>
      </main>
    </div>
  );
}

function KPICard({ label, value, trend, icon: Icon, borderClass, themeColor }: { label: string, value: string, trend: string, icon: any, borderClass: string, themeColor: string }) {
  return (
    <div className={`bg-white p-4 lg:p-5 rounded-none border-l-[4px] ${borderClass} border border-[#EEEEEE] shadow-[0_2px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 min-h-[140px] flex flex-col justify-between group relative overflow-hidden`}>
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
    </div>
  );
}

const COLORS = ['#18181b', '#0ea5e9', '#a855f7', '#f43f5e'];
const doughnutData = [
  { name: 'Delivered', value: 480, color: '#18181b' },
  { name: 'Processing', value: 240, color: '#0ea5e9' },
  { name: 'Pending', value: 180, color: '#a855f7' },
  { name: 'Cancelled', value: 120, color: '#f43f5e' },
];

function Overview() {
  const { autoRankTrending, autoRankBestSellers } = useProductStore();
  const [rankingStatus, setRankingStatus] = useState<string | null>(null);
  const { banners: storeBanners } = useBannerStore();
  const { user: authUser } = useAuthStore();
  const { 
    folders, 
    notes, 
    teamMembers, 
    isLoading, 
    subscribe,
    addFolder,
    addFile,
    addNote,
    addTeamMember,
    updateFolder,
    updateFile,
    updateNote,
    updateTeamMember,
    deleteItem
  } = useWorkspaceStore();
  
  const [activeModal, setActiveModal] = useState<'folder' | 'file' | 'note' | 'member' | 'delete' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'folders' | 'notes' | 'teamMembers'; name: string } | null>(null);
  const [editingItem, setEditingItem] = useState<{ id: string; type: 'folder' | 'file' | 'note' | 'member' } | null>(null);

  // Form states
  const [folderName, setFolderName] = useState('');
  const [fileName, setFileName] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('Developer');

  const activeUid = authUser?.id;

  useEffect(() => {
    if (!activeUid) return;
    const unsub = subscribe(activeUid);
    return () => unsub();
  }, [activeUid]);

  const handleAutoRank = async (type: 'trending' | 'best') => {
    setRankingStatus(type === 'trending' ? 'Ranking Trending...' : 'Ranking Best Sellers...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (type === 'trending') autoRankTrending();
    else autoRankBestSellers();
    setRankingStatus('Ranking Updated ✓');
    setTimeout(() => setRankingStatus(null), 3000);
  };

  const activeBanners = storeBanners.filter(b => b.status === 'active' && (b.image || b.bannerType === 'designed'));
  
  const displayBanners = activeBanners;

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
        <div className="bg-white p-6 lg:p-8 rounded-none border border-neutral-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-600"></div>
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-sans font-black text-[#0a0a0a] uppercase tracking-tighter">Marketplace Revenue</h3>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em]">Real-time Transactional Flow</p>
            </div>
            <button className="text-[10px] bg-neutral-50 hover:bg-purple-50 text-neutral-900 px-4 py-2 border border-neutral-200 font-black hover:border-purple-200 transition-all uppercase tracking-widest active:scale-95">Download Analytics</button>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenueOverview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} tickFormatter={(value) => `৳${value}`} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ 
                    borderRadius: '0px', 
                    border: '1px solid #f0f0f0', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                  }} 
                  itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  labelStyle={{ fontSize: '10px', color: '#9ca3af', marginBottom: '4px', fontWeight: '800' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueOverview)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Statistics Chart & Stats side by side or stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Order Statistics */}
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
                  <span className="text-2xl font-black text-neutral-900">1,020</span>
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
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em]">New User Projections</p>
              </div>
              <Activity className="w-5 h-5 text-cyan-400 opacity-50" />
            </div>
            
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} barSize={32}>
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
                  <Bar dataKey="orders" fill="url(#barGradient)" radius={[4, 4, 0, 0]} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <h3 className="text-lg font-sans font-black text-[#000000] mb-4 uppercase tracking-tighter">Enterprise Insights</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 mb-8">
         <KPICard label="Total Sales" value="BDT 854,200" trend="+18.2%" icon={DollarSign} borderClass="border-l-purple-600" themeColor="#9333ea" />
         <KPICard label="Total Orders" value="1,254" trend="+12.4%" icon={ShoppingBag} borderClass="border-l-blue-600" themeColor="#2563eb" />
         <KPICard label="Total Customers" value="842" trend="+8.5%" icon={Users} borderClass="border-l-cyan-600" themeColor="#0891b2" />
         <KPICard label="Total Revenue" value="BDT 1,240K" trend="+15.3%" icon={Activity} borderClass="border-l-emerald-600" themeColor="#10b981" />
         <KPICard label="Total Reviews" value="3,842" trend="+9.8%" icon={Star} borderClass="border-l-rose-600" themeColor="#e11d48" />
      </div>

      {/* Cloud Workspace Real-time Sections */}
      <h3 className="text-lg font-sans font-black text-[#000000] mb-4 uppercase tracking-tighter flex items-center gap-2">
        <Database className="w-5 h-5 text-orange-500" /> Fully Synchronized Cloud Workspace
      </h3>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
        {/* My Files Section */}
        <div className="bg-white border border-neutral-200 rounded-none overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 bg-neutral-950 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-orange-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">My Files</span>
              <span className="bg-orange-500 text-[9px] px-1.5 py-0.5 rounded-full text-white font-bold">{folders.filter(f => f.type === 'file').length}</span>
            </div>
            <div className="flex gap-2">
               <button onClick={() => setActiveModal('folder')} className="text-[8px] bg-white/10 hover:bg-white/20 px-2 py-1 uppercase font-black tracking-widest border border-white/10">New Folder</button>
               <button onClick={() => setActiveModal('file')} className="text-[8px] bg-orange-500 hover:bg-orange-600 px-2 py-1 uppercase font-black tracking-widest text-white transition-colors">Add File</button>
            </div>
          </div>
          <div className="flex-1 p-4 bg-neutral-50/30 overflow-y-auto max-h-[400px]">
             {isLoading.folders ? (
               <div className="flex flex-col items-center justify-center py-20 gap-3">
                 <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                 <span className="text-[9px] font-black uppercase text-neutral-400">Syncing...</span>
               </div>
             ) : folders.length === 0 ? (
               <div className="text-center py-20 opacity-40">
                 <HardDrive className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                 <p className="text-[10px] font-black uppercase tracking-widest">No Storage Found</p>
               </div>
             ) : (
               <div className="space-y-3">
                 {folders.map(item => (
                   <div key={item.id} className="bg-white border border-neutral-100 p-3 flex items-center justify-between hover:border-orange-200 transition-all group">
                     <div className="flex items-center gap-3">
                       {item.type === 'folder' ? (
                         <div className="w-8 h-8 bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100"><Folder className="w-4 h-4 fill-current" /></div>
                       ) : (
                         <div className="w-8 h-8 bg-neutral-100 text-neutral-500 flex items-center justify-center border border-neutral-200"><FileCode className="w-4 h-4" /></div>
                       )}
                       <div>
                         <p className="text-[11px] font-black text-neutral-900 uppercase truncate max-w-[120px]">{item.name}</p>
                         <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter">{item.type} {item.size ? `• ${item.size}` : ''}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                       <button onClick={() => { setEditingItem({ id: item.id, type: item.type }); setFolderName(item.name); setFileName(item.name); setActiveModal(item.type); }} className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-black transition-all"><Edit className="w-3 h-3" /></button>
                       <button onClick={() => { setDeleteTarget({ id: item.id, type: 'folders', name: item.name }); setActiveModal('delete'); }} className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-red-500 transition-all"><Trash2 className="w-3 h-3" /></button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* My Notes Section */}
        <div className="bg-white border border-neutral-200 rounded-none overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 bg-neutral-950 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">My Notes</span>
              <span className="bg-purple-500 text-[9px] px-1.5 py-0.5 rounded-full text-white font-bold">{notes.length}</span>
            </div>
            <button onClick={() => setActiveModal('note')} className="text-[8px] bg-purple-500 hover:bg-purple-600 px-2 py-1 uppercase font-black tracking-widest text-white transition-colors">New Note</button>
          </div>
          <div className="flex-1 p-4 bg-neutral-50/30 overflow-y-auto max-h-[400px]">
             {isLoading.notes ? (
               <div className="flex flex-col items-center justify-center py-20 gap-3">
                 <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                 <span className="text-[9px] font-black uppercase text-neutral-400">Syncing...</span>
               </div>
             ) : notes.length === 0 ? (
               <div className="text-center py-20 opacity-40">
                 <FileText className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                 <p className="text-[10px] font-black uppercase tracking-widest">No Intelligence Logged</p>
               </div>
             ) : (
               <div className="space-y-3">
                 {notes.map(note => (
                   <div key={note.id} className="bg-white border border-neutral-100 p-4 hover:border-purple-200 transition-all group relative">
                     <h4 className="text-[12px] font-black text-neutral-900 border-b border-neutral-100 pb-2 mb-2 uppercase italic tracking-tight">{note.title}</h4>
                     <p className="text-[10px] text-neutral-500 line-clamp-2 leading-relaxed">{note.content}</p>
                     <div className="mt-3 flex justify-between items-center">
                        <span className="text-[8px] font-bold text-neutral-400 uppercase">{new Date(note.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setEditingItem({ id: note.id, type: 'note' }); setNoteContent(note.content || ''); setActiveModal('note'); }} className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-black transition-all"><Edit className="w-3 h-3" /></button>
                          <button onClick={() => { setDeleteTarget({ id: note.id, type: 'notes', name: 'Note' }); setActiveModal('delete'); }} className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-red-500 transition-all"><Trash2 className="w-3 h-3" /></button>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* Team Members Section */}
        <div className="bg-white border border-neutral-200 rounded-none overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 bg-neutral-950 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Team Personnel</span>
              <span className="bg-emerald-500 text-[9px] px-1.5 py-0.5 rounded-full text-white font-bold">{teamMembers.length}</span>
            </div>
            <button onClick={() => setActiveModal('member')} className="text-[8px] bg-emerald-500 hover:bg-emerald-600 px-2 py-1 uppercase font-black tracking-widest text-white transition-colors">Add Member</button>
          </div>
          <div className="flex-1 p-4 bg-neutral-50/30 overflow-y-auto max-h-[400px]">
             {isLoading.teamMembers ? (
               <div className="flex flex-col items-center justify-center py-20 gap-3">
                 <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                 <span className="text-[9px] font-black uppercase text-neutral-400">Syncing...</span>
               </div>
             ) : teamMembers.length === 0 ? (
               <div className="text-center py-20 opacity-40">
                 <Users className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                 <p className="text-[10px] font-black uppercase tracking-widest">No Personnel Indexed</p>
               </div>
             ) : (
               <div className="space-y-2">
                 {teamMembers.map(member => (
                   <div key={member.id} className="bg-white border border-neutral-100 p-3 flex items-center justify-between hover:border-emerald-200 transition-all group">
                     <div className="flex items-center gap-3">
                       <div className="w-9 h-9 bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 font-black text-xs">
                          {member.name.charAt(0).toUpperCase()}
                       </div>
                       <div>
                         <p className="text-[11px] font-black text-neutral-900 uppercase truncate max-w-[120px]">{member.name}</p>
                         <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">{member.role}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                       <button onClick={() => { setEditingItem({ id: member.id, type: 'member' }); setMemberName(member.name); setMemberEmail(member.email); setMemberRole(member.role || 'Developer'); setActiveModal('member'); }} className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-black transition-all"><Edit className="w-3 h-3" /></button>
                       <button onClick={() => { setDeleteTarget({ id: member.id, type: 'teamMembers', name: member.name }); setActiveModal('delete'); }} className="p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-red-500 transition-all"><Trash2 className="w-3 h-3" /></button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Modals for Workspace */}
      {activeModal === 'folder' && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border w-full max-w-sm rounded-none p-6 shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-widest border-b pb-4 mb-6">{editingItem ? 'Edit Folder' : 'New Folder'}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!folderName.trim()) return toast.error('Name required');
              if (!activeUid) return toast.error('Auth required');
              try {
                if (editingItem) await updateFolder(activeUid, editingItem.id, folderName.trim());
                else await addFolder(activeUid, folderName.trim());
                toast.success('Saved'); setFolderName(''); setEditingItem(null); setActiveModal(null);
              } catch (err) { toast.error('Error saving'); }
            }} className="space-y-6">
              <div>
                <label className="text-[9px] font-black uppercase text-neutral-400 mb-1 block">Folder Identity</label>
                <input type="text" value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="e.g. Finance Reports" className="w-full bg-neutral-50 border p-3 text-xs focus:ring-1 focus:ring-black outline-none" autoFocus />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setActiveModal(null); setEditingItem(null); setFolderName(''); }} className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-600 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-black text-white font-black uppercase text-[10px] tracking-widest">Save Folder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'file' && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border w-full max-w-sm rounded-none p-6 shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-widest border-b pb-4 mb-6">{editingItem ? 'Edit File' : 'Add New File'}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!fileName.trim()) return toast.error('Name required');
              if (!activeUid) return toast.error('Auth required');
              try {
                if (editingItem) await updateFile(activeUid, editingItem.id, fileName.trim());
                else await addFile(activeUid, fileName.trim());
                toast.success('Saved'); setFileName(''); setEditingItem(null); setActiveModal(null);
              } catch (err) { toast.error('Error saving'); }
            }} className="space-y-5">
              <div>
                <label className="text-[9px] font-black uppercase text-neutral-400 mb-1 block">File Attachment Name</label>
                <input type="text" value={fileName} onChange={e => setFileName(e.target.value)} placeholder="image_01.jpg" className="w-full bg-neutral-50 border p-3 text-xs focus:ring-1 focus:ring-black outline-none" autoFocus />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setActiveModal(null); setEditingItem(null); setFileName(''); }} className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-600 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-orange-500 text-white font-black uppercase text-[10px] tracking-widest">Commit File</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'note' && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border w-full max-w-md rounded-none p-6 shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-widest border-b pb-4 mb-6">{editingItem ? 'Edit Protocol' : 'New Intelligence Note'}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!noteContent.trim()) return toast.error('Content required');
              if (!activeUid) return toast.error('Auth required');
              try {
                if (editingItem) await updateNote(activeUid, editingItem.id, noteContent.trim());
                else await addNote(activeUid, noteContent.trim());
                toast.success('Saved'); setNoteContent(''); setEditingItem(null); setActiveModal(null);
              } catch (err) { toast.error('Error saving'); }
            }} className="space-y-5">
              <div>
                <label className="text-[9px] font-black uppercase text-neutral-400 mb-1 block">Internal Body</label>
                <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Start logging data..." rows={6} className="w-full bg-neutral-50 border p-3 text-xs focus:ring-1 focus:ring-black outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setActiveModal(null); setEditingItem(null); setNoteContent(''); }} className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-600 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-purple-600 text-white font-black uppercase text-[10px] tracking-widest">Sync Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'member' && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border w-full max-w-sm rounded-none p-6 shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-widest border-b pb-4 mb-6">{editingItem ? 'Modify Member' : 'Provision Personnel'}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!memberName.trim()) return toast.error('Name required');
              if (!activeUid) return toast.error('Auth required');
              try {
                if (editingItem) await updateTeamMember(activeUid, editingItem.id, memberName.trim(), memberEmail.trim(), memberRole.trim());
                else await addTeamMember(activeUid, memberName.trim(), memberEmail.trim(), memberRole.trim());
                toast.success('Member Saved'); setMemberName(''); setMemberEmail(''); setEditingItem(null); setActiveModal(null);
              } catch (err) { toast.error('Error saving'); }
            }} className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase text-neutral-400 mb-1 block">Full Legal Name</label>
                <input type="text" value={memberName} onChange={e => setMemberName(e.target.value)} placeholder="Jane Doe" className="w-full bg-neutral-50 border p-3 text-xs focus:ring-1 focus:ring-black outline-none" autoFocus />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-neutral-400 mb-1 block">Corporate Email</label>
                <input type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} placeholder="jane@enterprise.com" className="w-full bg-neutral-50 border p-3 text-xs focus:ring-1 focus:ring-black outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-neutral-400 mb-1 block">Personnel Role</label>
                <select value={memberRole} onChange={e => setMemberRole(e.target.value)} className="w-full bg-neutral-50 border p-3 text-xs font-black focus:ring-1 focus:ring-black outline-none appearance-none">
                  {['Developer', 'Manager', 'Product Lead', 'Designer', 'QA Engineer', 'Security Audit'].map(r => (
                    <option key={r} value={r}>{r.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => { setActiveModal(null); setEditingItem(null); setMemberName(''); setMemberEmail(''); }} className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-600 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest">Register Team</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'delete' && deleteTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white border w-full max-w-sm rounded-none p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-none flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tighter text-neutral-900 mb-2">Security Override</h3>
            <p className="text-xs text-neutral-500 mb-8 font-medium leading-relaxed">
              Confirm deletion of <span className="font-black text-red-600">"{deleteTarget.name}"</span>.<br />
              This document will be wiped from the encrypted Firestore node permanently.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => { setActiveModal(null); setDeleteTarget(null); }}
                className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-600 font-bold uppercase text-[10px] tracking-widest hover:bg-neutral-200 transition-all"
              >
                Abort
              </button>
              <button 
                onClick={async () => {
                  if (!activeUid) return toast.error('Auth required');
                  try {
                    await deleteItem(activeUid, deleteTarget.id, deleteTarget.type);
                    toast.success('Deleted Successfully'); setActiveModal(null); setDeleteTarget(null);
                  } catch (err) { toast.error('Error deleting'); }
                }}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-600/20 active:scale-95 transition-all"
              >
                Wipe Doc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-none border border-neutral-100 overflow-hidden flex flex-col shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center shrink-0 bg-[#0a0a0a] text-white">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
               <div className="w-1 h-3 bg-purple-500 rounded-full"></div> Main Marketplace Trends
            </h3>
            <button className="text-[9px] bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 font-black transition-all uppercase tracking-widest active:scale-95">View Trends</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/50 text-neutral-400 text-[9px] uppercase tracking-[0.2em] font-black border-b border-neutral-100">
                  <th className="p-5">Catalog Item</th>
                  <th className="p-5">Value</th>
                  <th className="p-5 text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="p-5 text-[#000000] font-medium flex items-center gap-4">
                      <div className="w-11 h-11 bg-neutral-100 rounded-none border border-neutral-200 shrink-0 group-hover:border-purple-300 transition-colors relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black truncate text-[12px] uppercase tracking-wide text-neutral-900 group-hover:text-purple-600 transition-colors">Luxury Perfume {i}</span>
                        <span className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase mt-0.5">Fashion & Beauty</span>
                      </div>
                    </td>
                    <td className="p-5 text-neutral-900 font-black text-xs">{formatPrice(15000 - i * 1000)}</td>
                    <td className="p-5 text-right">
                      <span className="bg-neutral-950 text-white px-2.5 py-1 rounded-none font-black text-[9px] whitespace-nowrap uppercase tracking-widest group-hover:bg-purple-600 transition-colors shadow-sm">{120 - i * 10} Units</span>
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
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
               <div className="w-1 h-3 bg-cyan-500 rounded-full"></div> Recent Logistics Feed
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
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="p-5 text-neutral-900 font-black whitespace-nowrap text-xs group-hover:text-cyan-600 transition-colors">#ORD-0{i}82</td>
                    <td className="p-5 text-neutral-500 font-bold whitespace-nowrap text-xs">Jane Smith</td>
                    <td className="p-5 text-neutral-900 font-black whitespace-nowrap text-xs">{formatPrice(12500)}</td>
                    <td className="p-5 text-right">
                      <span className={`px-2.5 py-1.5 text-[9px] font-black rounded-none border whitespace-nowrap uppercase tracking-widest shadow-sm transition-all ${
                        i === 1 ? 'bg-purple-600 text-white border-purple-600' :
                        i === 2 ? 'bg-blue-600 text-white border-blue-600' :
                        i === 3 ? 'bg-amber-500 text-white border-amber-500' :
                        i === 4 ? 'bg-rose-500 text-white border-rose-500' :
                        'bg-emerald-500 text-white border-emerald-500'
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
