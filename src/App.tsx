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
import ToReview from './pages/ToReview';
import CategoryPage from './pages/CategoryPage';
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
import FacebookUpdates from './pages/FacebookUpdates';
import WebViewViewer from './pages/WebViewViewer';

import AdminContentPages from './pages/admin/AdminContentPages';
import DynamicLinkPage from './pages/DynamicLinkPage';
import { useSiteManagementStore } from './store/useSiteManagementStore';
import { useWebsitesStore } from './store/useWebsitesStore';
import { useBrandingStore } from './store/useBrandingStore';
import { fetchSupabaseConfigFromServer } from './lib/supabase';
import { RuntimeDiagnostics } from './components/common/RuntimeDiagnostics';

export default function App() {
  const { fetchSettings } = useSiteManagementStore();
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
    const unsubOrders = useOrderStore.getState().subscribeOrders();
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
  }, [isConfigLoaded, fetchSettings]);

  useEffect(() => {
    if (!isConfigLoaded) return;
    let sub: any = null;
    const initSbAuth = async () => {
      const { getSupabase } = await import('./lib/supabase');
      const supabase = getSupabase();
      if (supabase) {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_OUT') {
            useAuthStore.getState().logout();
          } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
            // Keep state synchronized with database user profile
            try {
              const { data: dbUserProfile, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
              if (dbUserProfile && !error) {
                const currentAuth = useAuthStore.getState();
                if (!currentAuth.isAuthenticated || currentAuth.user?.id !== session.user.id) {
                  useAuthStore.getState().login({
                    id: dbUserProfile.id,
                    name: dbUserProfile.name,
                    email: dbUserProfile.email,
                    role: dbUserProfile.role,
                    phone: dbUserProfile.phone,
                    profileImage: dbUserProfile.profileImage,
                    gender: dbUserProfile.gender,
                    address: dbUserProfile.address,
                    division: dbUserProfile.division,
                    district: dbUserProfile.district,
                    city: dbUserProfile.district,
                    upazila: dbUserProfile.upazila,
                    area: dbUserProfile.area,
                    postalCode: dbUserProfile.postalCode,
                  });
                }
              } else {
                // If profile is missing in the public.users database table, automatically create it!
                console.log("[App Auth] Profile row is missing or not fetched. Attempting automatically to create/sync...");
                const meta = session.user.user_metadata || {};
                const name = meta.name || meta.fullName || session.user.email?.split('@')[0] || 'Registered User';
                const phone = meta.phone || '';
                
                const profileData = {
                  id: session.user.id,
                  uid: session.user.id,
                  name: name,
                  email: session.user.email || '',
                  phone: phone,
                  role: 'customer',
                  status: 'Active',
                  createdAt: new Date().toISOString(),
                  lastLoginAt: new Date().toISOString(),
                  gender: meta.gender || '',
                  address: meta.address || '',
                  division: meta.division || '',
                  district: meta.district || '',
                  upazila: meta.upazila || '',
                  area: meta.area || '',
                  postalCode: meta.postalCode || meta.zipCode || '',
                  profileImage: meta.profileImage || '',
                  occasionName: meta.occasionName || '',
                  specialDate: meta.specialDate || '',
                };

                const { data: insertedUser, error: insertError } = await supabase
                  .from('users')
                  .upsert([profileData])
                  .select('*')
                  .single();

                // Also sync to customers table
                const customerData = {
                  id: session.user.id,
                  name: name,
                  emails: [session.user.email || ''],
                  phones: phone ? [phone] : [],
                  address: {
                    street: meta.address || '',
                    division: meta.division || '',
                    district: meta.district || '',
                    upazila: meta.upazila || '',
                    zipCode: meta.postalCode || meta.zipCode || ''
                  },
                  profile_image: meta.profileImage || '',
                  gender: meta.gender || '',
                  status: 'Active',
                  customer_type: 'Regular',
                  created_at: new Date().toISOString(),
                };
                
                await supabase.from('customers').upsert([customerData]);

                if (!insertError && insertedUser) {
                  console.log("[App Auth] Database profile successfully created/synchronized!");
                  const currentAuth = useAuthStore.getState();
                  if (!currentAuth.isAuthenticated || currentAuth.user?.id !== session.user.id) {
                    useAuthStore.getState().login({
                      id: insertedUser.id,
                      name: insertedUser.name,
                      email: insertedUser.email,
                      role: insertedUser.role,
                      phone: insertedUser.phone,
                      profileImage: insertedUser.profileImage,
                      gender: insertedUser.gender,
                      address: insertedUser.address,
                      division: insertedUser.division,
                      district: insertedUser.district,
                      city: insertedUser.district,
                      upazila: insertedUser.upazila,
                      area: insertedUser.area,
                      postalCode: insertedUser.postalCode,
                    });
                  }
                } else if (insertError) {
                  console.error("[App Auth] Auto-creation of user database profile failed:", insertError);
                }
              }
            } catch (err) {
              console.warn("Could not sync profile metadata from Supabase:", err);
            }
          }
        });
        sub = data?.subscription;
      }
    };
    initSbAuth();
    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, []);

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
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="orders/to-review" element={<ToReview />} />

          <Route path="admin/link-pages" element={<AdminContentPages />} />
          {/* Dynamic Link Pages */}
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
