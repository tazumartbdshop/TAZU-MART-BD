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
  Store,
  MapPin,
  Megaphone,
  Star,
  Plus,
  Search,
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
  Gamepad,
  Bell,
  Globe,
  PlusCircle,
  Layout,
  Link,
  Server,
  LayoutGrid,
  LineChart,
  HardDrive,
  Save,
  Code,
  Coins,
  Share2,
  ListChecks,
  MessageSquareCode,
  RefreshCw,
  Play,
  Video,
  Fingerprint,
  Tag,
  UserCheck,
  SlidersHorizontal,
  BarChart3,
  Terminal,
  Mail,
  Flame,
  Folder,
  FileText
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
    name: 'Orders', 
    path: '/admin/orders', 
    icon: ShoppingBag,
    moduleId: 'orders',
    subItems: [
      { name: 'Complete Orders', path: '/admin/orders/complete', icon: CheckCircle },
      { name: 'Incomplete Orders', path: '/admin/orders/incomplete', icon: AlertCircle },
      { name: 'Fake Order Control', path: '/admin/orders/fake-control', icon: Shield }
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
    name: 'Products', 
    path: '/admin/products', 
    icon: Package,
    moduleId: 'products',
    subItems: [
      { name: 'Add Product', path: '/admin/products/add', icon: Plus },
      { name: 'Product Listing', path: '/admin/products', icon: Package },
      { name: 'Stock Management', path: '/admin/management/stock', icon: Package }
    ]
  },
  {
    name: 'Offers',
    path: '/admin/offers',
    icon: Ticket,
    moduleId: 'products',
    subItems: [
      { name: 'Create Offer', path: '/admin/offers/create', icon: Plus },
      { name: 'Social Offer Feed', path: '/admin/offers/hub', icon: Radio },
      { name: 'Popup Offer', path: '/admin/offers/popup', icon: Sliders },
      { name: 'Promo Codes', path: '/admin/management/promo-codes', icon: Ticket },
      { name: 'Flash Sale', path: '/admin/offers', icon: Zap },
      { name: 'Category Deals', path: '/admin/offers', icon: Grid },
      { name: 'Campaign Offers', path: '/admin/offers', icon: ShoppingBag }
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
    name: 'Reviews', 
    icon: Star,
    moduleId: 'dashboard',
    subItems: [
      { name: 'Add Review', path: '/admin/reviews/add', icon: PlusCircle },
      { name: 'Review Listing', path: '/admin/reviews/list', icon: Star }
    ]
  },
  { 
    name: 'Search Analytics', 
    path: '/admin/search-analytics', 
    icon: Activity, 
    moduleId: 'analytics' 
  },
  { 
    name: 'Banner Control',
    icon: LayoutGrid,
    moduleId: 'banners',
    subItems: [
      { name: 'Add Banner', path: '/admin/banner/create', icon: PlusCircle },
      { name: 'Banner List', path: '/admin/banner/list', icon: LayoutGrid }
    ]
  },
  {
    name: 'Flutter Banner',
    path: '/admin/flutter-banner',
    icon: Smartphone,
    moduleId: 'banners'
  },
  { 
    name: 'Marketing & Tracking',
    icon: Megaphone,
    moduleId: 'dashboard',
    subItems: [
      { name: 'TikTok', path: '/admin/marketing/tiktok', icon: Video },
      { name: 'Google', path: '/admin/marketing/google', icon: Globe },
      { name: 'Server Side Tracking', path: '/admin/marketing/serverside', icon: Zap },
      { name: 'Website Tracking', path: '/admin/marketing/website', icon: Fingerprint },
      { name: 'Pinterest', path: '/admin/marketing/pinterest', icon: Tag },
      { name: 'Snapchat', path: '/admin/marketing/snapchat', icon: Sparkles },
      { name: 'LinkedIn', path: '/admin/marketing/linkedin', icon: UserCheck },
      { name: 'Microsoft Clarity', path: '/admin/marketing/microsoft', icon: SlidersHorizontal },
      { name: 'Attribution & UTM', path: '/admin/marketing/attribution', icon: BarChart3 },
      { name: 'Testing Center', path: '/admin/marketing/testing', icon: Terminal }
    ]
  },

  { 
    name: 'Login History', 
    path: '/admin/login-info', 
    icon: History, 
    moduleId: 'analytics' 
  },
  { 
    name: 'Employee',
    icon: Users,
    moduleId: 'roles',
    subItems: [
      { name: 'Moderators', path: '/admin/management/moderators', icon: Shield, superAdminOnly: true },
      { name: 'Security', path: '/admin/management/security', icon: Lock, superAdminOnly: true }
    ]
  },
  { 
    name: 'Control',
    icon: Sliders,
    moduleId: 'dashboard',
    subItems: [
      { name: 'Game Control', path: '/admin/game-control', icon: Gamepad },
      { name: 'Coin Control', path: '/admin/coin-control', icon: Coins },
      { name: 'Bar Control', path: '/admin/bar-control', icon: Sliders }
    ]
  },
  { 
    name: 'Payment Methods',
    icon: CreditCard,
    moduleId: 'payments',
    subItems: [
      { name: 'Payment Personal', path: '/admin/payments', icon: CreditCard },
      { name: 'Payment Merchant', path: '/admin/payments/merchant', icon: Shield }
    ]
  },
  { 
    name: 'Delivery Methods',
    icon: Truck,
    moduleId: 'orders',
    subItems: [
      { name: 'Delivery API', path: '/admin/delivery/courier-api', icon: Radio }
    ]
  },
  { 
    name: 'Website Management',
    icon: Globe,
    moduleId: 'dashboard',
    subItems: [
      { name: 'Store Identity', path: '/admin/management/store-identity', icon: Store },
      { name: 'Business Address', path: '/admin/management/business-address', icon: MapPin },
      { name: 'Site Links', path: '/admin/management/site-management', icon: Link },
      { name: 'Social Links', path: '/admin/management/social-links', icon: Share2 }
    ]
  },
  { 
    name: 'Support', 
    path: '/admin/support', 
    icon: HelpCircle, 
    moduleId: 'support' 
  },
  {
    name: 'AI Agent Center',
    path: '/admin/ai-control-center',
    icon: Sparkles,
    moduleId: 'settings',
    subItems: [
      { name: 'AI Settings', path: '/admin/ai-control-center?tab=settings', icon: Sliders },
      { name: 'Knowledge Base', path: '/admin/ai-control-center?tab=knowledge', icon: HardDrive },
      { name: 'Product Access', path: '/admin/ai-control-center?tab=productAccess', icon: Package },
      { name: 'Website Access', path: '/admin/ai-control-center?tab=websiteAccess', icon: Globe },
      { name: 'Response Rules', path: '/admin/ai-control-center?tab=rules', icon: ListChecks },
      { name: 'Prompt Manager', path: '/admin/ai-control-center?tab=prompt', icon: MessageSquareCode },
      { name: 'AI Analytics', path: '/admin/ai-control-center?tab=analytics', icon: LineChart },
      { name: 'AI Chat Logs', path: '/admin/ai-control-center?tab=logs', icon: History },
      { name: 'Sync Center', path: '/admin/ai-control-center?tab=sync', icon: RefreshCw },
      { name: 'Testing Console', path: '/admin/ai-control-center?tab=test', icon: Play }
    ]
  },
  { 
    name: 'Settings', 
    path: '/admin/settings', 
    icon: Settings,
    moduleId: 'settings',
    subItems: [
      { name: 'General Settings', path: '/admin/settings', icon: Settings },
      { name: 'Theme Settings', path: '/admin/theme-settings', icon: Palette },
      { name: 'Flutter Manager', path: '/admin/flutter-manager', icon: Smartphone },
      { name: 'Automation', path: '/admin/automation', icon: Zap }
    ]
  },
  {
    name: 'Advanced Tools',
    icon: Puzzle,
    moduleId: 'dashboard',
    subItems: [
      { name: 'Inventory Calculation', path: '/admin/management/calculation', icon: DollarSign },
      { name: 'Push Notifications', path: '/admin/management/push-notifications', icon: Bell }
    ]
  }
];
