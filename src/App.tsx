import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { UserLayout } from './components/layout/UserLayout';
import { useCategoryStore } from './store/useCategoryStore';
import { useProductStore } from './store/useProductStore';
import { useSearchStore } from './store/useSearchStore';
import { useOrderStore } from './store/useOrderStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useThemeStore } from './store/useThemeStore';
import { useOfferStore } from './store/useOfferStore';
import { useCustomerStore } from './store/useCustomerStore';
import { useBrandShowcaseStore } from './store/useBrandShowcaseStore';
import { useModeratorStore } from './store/useModeratorStore';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderInvoice from './pages/OrderInvoice';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Account from './pages/Account';
import AuthGate from './pages/AuthGate';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import Product from './pages/Product';
import Orders from './pages/Orders';
import CategoryPage from './pages/CategoryPage';
import Settings from './pages/Settings';

import ReviewDetails from './pages/ReviewDetails';
import Support from './pages/Support';
import Offers from './pages/Offers';
import OfferPage from './pages/OfferPage';
import Games from './pages/Games';
import DeliveryPoints from './pages/DeliveryPoints';
import { ThemeInitializer } from './ThemeInitializer';

import Categories from './pages/Categories';
import Search from './pages/Search';
import LiveWebsiteGenerator from './pages/generated/LiveWebsiteGenerator';
import LiveWebsiteAdmin from './pages/generated/LiveWebsiteAdmin';
import Wishlist from './pages/Wishlist';
import FacebookUpdates from './pages/FacebookUpdates';
import WebViewViewer from './pages/WebViewViewer';

import AdminContentPages from './pages/admin/AdminContentPages';
import DynamicLinkPage from './pages/DynamicLinkPage';

export default function App() {
  useEffect(() => {
    const unsubCategories = useCategoryStore.getState().subscribe();
    const unsubProducts = useProductStore.getState().subscribe();
    const unsubSearches = useSearchStore.getState().subscribe();
    const unsubOrders = useOrderStore.getState().subscribeOrders();
    const unsubTrackingStatuses = useOrderStore.getState().subscribeTrackingStatuses();
    const unsubSettings = useSettingsStore.getState().subscribe();
    const unsubTheme = useThemeStore.getState().subscribe();
    const unsubOffers = useOfferStore.getState().subscribe();
    const unsubCustomers = useCustomerStore.getState().subscribe();
    const unsubBrands = useBrandShowcaseStore.getState().subscribe();
    const unsubModerators = useModeratorStore.getState().subscribe();
    return () => {
      unsubCategories();
      unsubProducts();
      unsubSearches();
      unsubOrders();
      unsubTrackingStatuses();
      unsubSettings();
      unsubTheme();
      unsubOffers();
      unsubCustomers();
      unsubBrands();
      unsubModerators();
    };
  }, []);

  return (
    <Router>
      <Toaster />
      <ThemeInitializer />
      <Routes>
        <Route path="/site/:storeDomain/*" element={<LiveWebsiteGenerator />} />
        <Route path="/site-admin/:storeDomain/*" element={<LiveWebsiteAdmin />} />
        
        {/* User Facing Routes */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="category/:id" element={<CategoryPage />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="product/:id" element={<Product />} />
          <Route path="product/:id/reviews" element={<ReviewDetails />} />
          <Route path="support" element={<Support />} />
          <Route path="offers" element={<Offers />} />
          <Route path="offer-page" element={<OfferPage />} />
          <Route path="shop" element={<div className="container mx-auto py-24 text-center text-primary-900"><h1 className="text-4xl font-serif mb-4">All Products</h1><p className="text-gray-500">Shop all luxury items.</p></div>} />
          <Route path="categories" element={<Categories />} />
          <Route path="search" element={<Search />} />
          <Route path="account" element={<Login />} />
          <Route path="facebook-updates" element={<FacebookUpdates />} />
          <Route path="viewer" element={<WebViewViewer />} />
          
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout/success/:orderId" element={<OrderSuccess />} />
          <Route path="checkout/invoice/:orderId" element={<OrderInvoice />} />
          <Route path="orders" element={<Orders />} />

          <Route path="admin/link-pages" element={<AdminContentPages />} />
          {/* Dynamic Link Pages */}
          <Route path=":slug" element={<DynamicLinkPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="account/dashboard" element={<Account />} />
            <Route path="games" element={<Games />} />
            <Route path="help-center" element={<Settings />} />
            <Route path="my-reviews" element={<div className="container mx-auto py-24 text-center text-primary-900"><h1 className="text-4xl font-bold mb-4">My Reviews</h1><p className="text-gray-500 font-sans">Track and manage your reviews.</p></div>} />
            <Route path="payment-methods" element={<Settings />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<div className="container mx-auto py-24 text-center text-primary-900"><h1 className="text-4xl font-serif mb-4">404</h1><p className="text-gray-500">Page Not Found</p></div>} />
        </Route>

        {/* Admin Dashboard */}
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}
