import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  Package, 
  Grid,
  Shield,
  CreditCard,
  Activity,
  Zap,
  Radio,
  History,
  Monitor,
  HelpCircle,
  Megaphone,
  Star,
  Plus,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Lock,
  Palette,
  Smartphone,
  Puzzle,
  Sliders,
  Sparkles,
  Truck,
  Ticket,
  Gamepad
} from 'lucide-react';

export interface NavSubItem {
  name: string;
  path: string;
  icon: any;
  superAdminOnly?: boolean;
}

export interface NavItem {
  name: string;
  path?: string;
  icon: any;
  moduleId: string;
  subItems?: NavSubItem[];
}

export const defaultNavItems: NavItem[] = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, moduleId: 'dashboard' },
  { 
    name: 'Products', 
    path: '/admin/products', 
    icon: Package,
    moduleId: 'products',
    subItems: [
      { name: 'Add Product', path: '/admin/products/add', icon: Plus },
      { name: 'Product Listing', path: '/admin/products', icon: Package }
    ]
  },
  { 
    name: 'Categories', 
    path: '/admin/categories', 
    icon: Grid,
    moduleId: 'categories',
    subItems: [
      { name: 'Add Category', path: '/admin/categories/add', icon: Plus },
      { name: 'View Categories', path: '/admin/categories', icon: Grid }
    ]
  },
  { 
    name: 'Orders', 
    path: '/admin/orders', 
    icon: ShoppingBag,
    moduleId: 'orders',
    subItems: [
      { name: 'Complete Orders', path: '/admin/orders/complete', icon: CheckCircle },
      { name: 'Incomplete Orders', path: '/admin/orders/incomplete', icon: AlertCircle }
    ]
  },
  { 
    name: 'Customers', 
    path: '/admin/customers', 
    icon: Users,
    moduleId: 'users',
    subItems: [
      { name: 'Add Customer', path: '/admin/customers/add', icon: Plus },
      { name: 'Customer Listing', path: '/admin/customers', icon: Users }
    ]
  },
  { 
    name: 'Inventory',
    path: '/admin/inventory',
    icon: Package,
    moduleId: 'products',
    subItems: [
      { name: 'Calculation', path: '/admin/management/calculation', icon: DollarSign },
      { name: 'Stock', path: '/admin/management/stock', icon: Package }
    ]
  },
  {
    name: 'Work Session',
    path: '/admin/management',
    icon: Shield,
    moduleId: 'roles',
    subItems: [
      { name: 'Moderators', path: '/admin/management/moderators', icon: Shield, superAdminOnly: true },
      { name: 'Security Settings', path: '/admin/management/security', icon: Lock, superAdminOnly: true }
    ]
  },
  {
    name: 'Game Center',
    path: '/admin/game-control',
    icon: Gamepad,
    moduleId: 'dashboard',
    subItems: [
      { name: 'Control Panel', path: '/admin/game-control', icon: Sliders },
      { name: 'Analytics', path: '/admin/game-analytics', icon: Activity }
    ]
  },
  {
    name: 'Management',
    path: '/admin/system-management',
    icon: Puzzle,
    moduleId: 'dashboard',
    subItems: [
      { name: 'Bar Management', path: '/admin/management/bar-management', icon: Sliders },
      { name: 'Site Management', path: '/admin/management/site-management', icon: Monitor },
      { name: 'Support Banner', path: '/admin/management/support-banner', icon: Megaphone },
      { name: 'Review Monitoring', path: '/admin/management/review-monitoring', icon: Star },
      { name: 'Promo Management', path: '/admin/management/promo-codes', icon: Ticket },
      { name: 'Banner Management', path: '/admin/management/banner-management', icon: Monitor },
      { name: 'Popup Management', path: '/admin/management/popup-management', icon: Sparkles }
    ]
  },
  { 
    name: 'Payment Mode', 
    icon: CreditCard,
    moduleId: 'payments',
    subItems: [
      { name: 'Payment', path: '/admin/payments', icon: CreditCard },
      { name: 'Payment List', path: '/admin/payment-list', icon: CreditCard }
    ]
  },
  {
    name: 'Delivery System',
    icon: Truck,
    moduleId: 'orders',
    subItems: [
      { name: 'Courier API', path: '/admin/delivery/courier-api', icon: Radio },
      { name: 'Courier Charge', path: '/admin/delivery/courier-charge', icon: Sliders }
    ]
  },
  { name: 'Login Information', path: '/admin/login-info', icon: Activity, moduleId: 'analytics' },
  { name: 'Automation', path: '/admin/automation', icon: Zap, moduleId: 'settings' },
  { name: 'Live Tracking', path: '/admin/live-tracking', icon: Radio, moduleId: 'dashboard' },
  { 
    name: 'Settings', 
    path: '/admin/settings', 
    icon: Settings,
    moduleId: 'settings',
    subItems: [
      { name: 'General Settings', path: '/admin/settings', icon: Settings },
      { name: 'Theme Settings', path: '/admin/theme-settings', icon: Palette },
      { name: 'Flutter Manager', path: '/admin/flutter-manager', icon: Smartphone }
    ]
  },
  { name: 'Activity Logs', path: '/admin/activity-logs', icon: History, moduleId: 'logs' },
  { name: 'Support System', path: '/admin/support', icon: HelpCircle, moduleId: 'support' },
];
