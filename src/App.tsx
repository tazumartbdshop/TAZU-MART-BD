import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
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
import { useBannerStore } from './store/useBannerStore';
import { useMenuSortStore } from './store/useMenuSortStore';
import { useDeliveryStore } from './store/useDeliveryStore';
import { broadcastSync } from './lib/broadcastSync';
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
import { useAuthStore } from './store/useAuthStore';
import AdminDashboard from './pages/admin/AdminDashboard';
import Product from './pages/Product';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import CategoryPage from './pages/CategoryPage';
import AllProducts from './pages/AllProducts';
import Settings from './pages/Settings';
import MyReviews from './pages/MyReviews';

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
import WebViewViewer from './pages/WebViewViewer';

import OrderHistoryPage from './pages/orders/OrderHistoryPage';
import OrderDetailView from './pages/orders/OrderDetailView';
import CustomerNotificationsPage from './pages/CustomerNotificationsPage';
import CouponsAndOffersPage from './pages/CouponsAndOffersPage';

import AdminContentPages from './pages/admin/AdminContentPages';
import BrandsInformationPage from './pages/BrandsInformationPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import PolicyPage from './pages/PolicyPage';
import DynamicLinkPage from './pages/DynamicLinkPage';
import { useSiteManagementStore } from './store/useSiteManagementStore';
import { useWebsitesStore } from './store/useWebsitesStore';
import { useBrandingStore } from './store/useBrandingStore';
import { fetchSupabaseConfigFromServer } from './lib/supabase';
import { RuntimeDiagnostics } from './components/common/RuntimeDiagnostics';

export default function App() {
  const { fetchSettings } = useSiteManagementStore();
  const { user } = useAuthStore();
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  useEffect(() => {
    const initConfig = async () => {
      try {
        await fetchSupabaseConfigFromServer();
      } catch (err) {
        console.error("Failed to fetch Supabase config:", err);
      } finally {
        setIsConfigLoaded(true);
      }
    };
    initConfig();
    broadcastSync.init();
  }, []);

  useEffect(() => {
    if (!isConfigLoaded) return;

    // Initial fetch for site management and branding data
    fetchSettings();
    useBrandingStore.getState().fetchBranding();

    // Subscribe to stores
    const unsubBranding = useBrandingStore.getState().subscribeRealtime();
    const unsubCategories = useCategoryStore.getState().subscribe();
    const unsubProducts = useProductStore.getState().subscribe();
    const unsubSearches = useSearchStore.getState().subscribe();
    
    // Subscribe to orders filtered by user ID for security and performance
    const currentUser = useAuthStore.getState().user;
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'moderator';
    
    // Admins see all, customers only their own
    const unsubOrders = useOrderStore.getState().subscribeOrders(isAdmin ? undefined : currentUser?.id);
    
    const unsubTrackingStatuses = useOrderStore.getState().subscribeTrackingStatuses();
    const unsubSettings = useSettingsStore.getState().subscribe();
    const unsubTheme = useThemeStore.getState().subscribe();
    const unsubOffers = useOfferStore.getState().subscribe();
    const unsubCustomers = useCustomerStore.getState().subscribe();
    const unsubBrands = useBrandShowcaseStore.getState().subscribe();
    const unsubModerators = useModeratorStore.getState().subscribe();
    const unsubWebsites = useWebsitesStore.getState().subscribe();
    const unsubBanners = useBannerStore.getState().subscribe();
    const unsubMenuSort = useMenuSortStore.getState().subscribe();
    const unsubDelivery = useDeliveryStore.getState().subscribe();
    
    return () => {
      unsubBranding();
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
      unsubWebsites();
      unsubBanners();
      unsubMenuSort();
      unsubDelivery();
    };
  }, [isConfigLoaded, fetchSettings, user?.id]);

  useEffect(() => {
    let sub: any = null;
    const initSbAuth = async () => {
      try {
        const { getSupabase } = await import('./lib/supabase');
        const supabase = getSupabase();
        if (!supabase) {
          useAuthStore.getState().setInitializing(false);
          return;
        }

        let isProcessing = false;

        const processSession = async (session: any) => {
          if (!session?.user || isProcessing) return;
          isProcessing = true;

          try {
            const meta = session.user.user_metadata || {};
            const identities = session.user.identities || [];
            const googleIdentity = identities.find((i: any) => i.provider === 'google');
            const facebookIdentity = identities.find((i: any) => i.provider === 'facebook');
            const isGoogle = !!googleIdentity || session.user.app_metadata?.provider === 'google' || session.user.app_metadata?.providers?.includes('google') || (meta.iss && meta.iss.includes('google'));
            const isFacebook = !!facebookIdentity || session.user.app_metadata?.provider === 'facebook' || session.user.app_metadata?.providers?.includes('facebook') || (meta.iss && meta.iss.includes('facebook'));
            const loginProvider = isGoogle ? 'Google' : (isFacebook ? 'Facebook' : 'Email');
            
            const name = meta.full_name || meta.name || meta.fullName || session.user.email?.split('@')[0] || (isFacebook ? 'Facebook Customer' : 'Customer');
            const email = session.user.email || meta.email || '';
            const phone = meta.phone || session.user.phone || '';
            const profileImage = meta.avatar_url || meta.picture || meta.profileImage || meta.avatar || '';
            const googleId = googleIdentity?.id || (isGoogle ? (meta.sub || session.user.id) : undefined);
            const facebookId = facebookIdentity?.id || (isFacebook ? (meta.sub || session.user.id) : undefined);

            const { data: dbUserProfile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            const userData = {
              id: session.user.id,
              name: dbUserProfile?.name || name,
              email: session.user.email || dbUserProfile?.email || '',
              role: (dbUserProfile?.role || 'customer') as any,
              phone: dbUserProfile?.phone || phone,
              profileImage: dbUserProfile?.profileImage || dbUserProfile?.profile_image || profileImage,
              gender: dbUserProfile?.gender || meta.gender || '',
              address: dbUserProfile?.address || meta.address || '',
              division: dbUserProfile?.division || meta.division || '',
              district: dbUserProfile?.district || meta.district || '',
              upazila: dbUserProfile?.upazila || meta.upazila || '',
              area: dbUserProfile?.area || meta.area || '',
              postalCode: dbUserProfile?.postalCode || meta.postalCode || meta.zipCode || '',
            };

            // 1. Sync or Create in public.users table
            const userProfileData = {
              id: session.user.id,
              uid: session.user.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              role: userData.role,
              status: 'Active',
              createdAt: dbUserProfile?.createdAt || dbUserProfile?.created_at || session.user.created_at || new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              gender: userData.gender,
              address: userData.address,
              division: userData.division,
              district: userData.district,
              upazila: userData.upazila,
              area: userData.area,
              postalCode: userData.postalCode,
              profileImage: userData.profileImage,
              profile_image: userData.profileImage,
              loginProvider: loginProvider,
              login_provider: loginProvider,
              google_id: googleId,
              facebook_id: facebookId
            };

            await supabase.from('users').upsert([userProfileData]);

            // 2. Sync or Create in public.customers table for Customer Counting & Admin Listing
            if (userData.role === 'customer') {
              const customerData = {
                id: session.user.id,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                address: {
                  street: userData.address,
                  division: userData.division,
                  district: userData.district,
                  upazila: userData.upazila,
                  zipCode: userData.postalCode
                },
                profile_image: userData.profileImage,
                gender: userData.gender,
                status: 'Active',
                customer_type: 'Regular',
                login_provider: loginProvider,
                google_id: googleId,
                facebook_id: facebookId,
                created_at: dbUserProfile?.created_at || session.user.created_at || new Date().toISOString(),
                last_login_at: new Date().toISOString()
              };

              await supabase.from('customers').upsert([customerData]);
            }

            // 3. Complete authentication in Zustand store
            useAuthStore.getState().login(userData);
          } catch (err) {
            console.warn("[App Auth] Error syncing session profile:", err);
          } finally {
            isProcessing = false;
            useAuthStore.getState().setInitializing(false);
          }
        };

        // Check initial session immediately
        const { data: initialSession } = await supabase.auth.getSession();
        if (initialSession?.session) {
          await processSession(initialSession.session);
        } else {
          useAuthStore.getState().setInitializing(false);
        }

        // Listen for Auth state changes (e.g. Google OAuth callback)
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_OUT') {
            useAuthStore.getState().logout();
          } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session?.user) {
            await processSession(session);
          }
        });
        sub = data?.subscription;
      } catch (err) {
        console.error("[App Auth] Auth init error:", err);
        useAuthStore.getState().setInitializing(false);
      }
    };

    initSbAuth();
    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [isConfigLoaded]);

  const isSettingsLoaded = useSettingsStore((state) => state.isLoaded);
  const isBrandingLoaded = useBrandingStore((state) => state.isLoaded);
  const isSiteManagementLoaded = useSiteManagementStore((state) => state.isLoaded);
  const isBannerLoaded = useBannerStore((state) => state.isLoaded);
  const isBrandShowcaseLoaded = useBrandShowcaseStore((state) => state.isLoaded);
  const isCategoryLoaded = useCategoryStore((state) => state.isLoaded);
  const isProductLoaded = useProductStore((state) => state.isLoaded);
  
  const isAppReady = isConfigLoaded && isSettingsLoaded && isBrandingLoaded && isSiteManagementLoaded && isBannerLoaded && isBrandShowcaseLoaded && isCategoryLoaded && isProductLoaded;

  return (
    <Router>
      <Toaster />
      <ThemeInitializer />
      <RuntimeDiagnostics />
      <Routes>
        <Route path="/site/:storeDomain/*" element={<LiveWebsiteGenerator />} />
        <Route path="/site-admin/:storeDomain/*" element={<LiveWebsiteAdmin />} />
        
        {/* User Facing Routes */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="category/:id" element={<CategoryPage />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="product/:slug" element={<Product />} />
          <Route path="product/:slug/reviews" element={<ReviewDetails />} />
          <Route path="support" element={<Support />} />
          <Route path="offers" element={<Offers />} />
          <Route path="products" element={<AllProducts />} />
          <Route path="offer-page" element={<OfferPage />} />
          <Route path="shop" element={<div className="container mx-auto py-24 text-center text-primary-900"><h1 className="text-4xl font-serif mb-4">All Products</h1><p className="text-gray-500">Shop all luxury items.</p></div>} />
          <Route path="categories" element={<Categories />} />
          <Route path="search" element={<Search />} />
          <Route path="account" element={<Login />} />
          <Route path="viewer" element={<WebViewViewer />} />
          
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout/success/:orderId" element={<OrderSuccess />} />
          <Route path="checkout/invoice/:orderId" element={<OrderInvoice />} />
          <Route path="orders" element={<OrderHistoryPage />} />
          <Route path="orders/:id" element={<OrderDetailView />} />
          <Route path="account/orders" element={<OrderHistoryPage />} />
          <Route path="account/orders/:status" element={<OrderHistoryPage />} />
          <Route path="account/orders/details/:id" element={<OrderDetailView />} />
          <Route path="notifications" element={<CustomerNotificationsPage />} />
          <Route path="account/notifications" element={<CustomerNotificationsPage />} />
          <Route path="coupons" element={<CouponsAndOffersPage />} />
          <Route path="offers" element={<CouponsAndOffersPage />} />
          <Route path="campaigns-and-offers" element={<CouponsAndOffersPage />} />
          <Route path="account/coupons" element={<CouponsAndOffersPage />} />

          <Route path="admin/link-pages" element={<AdminContentPages />} />
          {/* Dynamic & Content Pages */}
          <Route path="brands" element={<BrandsInformationPage />} />
          <Route path="about-us" element={<AboutUsPage />} />
          <Route path="about" element={<AboutUsPage />} />
          <Route path="contact-us" element={<ContactUsPage />} />
          <Route path="contact" element={<ContactUsPage />} />
          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="privi" element={<PrivacyPolicyPage />} />
          <Route path="privi-policy" element={<PrivacyPolicyPage />} />
          <Route path="policy/privacy" element={<PrivacyPolicyPage />} />
          <Route path="policy/:type" element={<PolicyPage />} />
          <Route path="terms-and-conditions" element={<TermsConditionsPage />} />
          <Route path="terms" element={<TermsConditionsPage />} />
          <Route path="refund-policy" element={<RefundPolicyPage />} />
          <Route path="refund" element={<RefundPolicyPage />} />
          <Route path=":slug" element={<DynamicLinkPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="account/dashboard" element={<Account />} />
            <Route path="games" element={<Games />} />
            <Route path="help-center" element={<Settings />} />
            <Route path="my-reviews" element={<MyReviews />} />
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
