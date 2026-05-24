import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserLayout } from './components/layout/UserLayout';
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
import Games from './pages/Games';
import DeliveryPoints from './pages/DeliveryPoints';
import { ThemeInitializer } from './ThemeInitializer';

import Categories from './pages/Categories';

export default function App() {
  return (
    <Router>
      <ThemeInitializer />
      <Routes>
        {/* User Facing Routes */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="category/:id" element={<CategoryPage />} />
          <Route path="product/:id" element={<Product />} />
          <Route path="product/:id/reviews" element={<ReviewDetails />} />
          <Route path="support" element={<Support />} />
          <Route path="offers" element={<Offers />} />
          <Route path="shop" element={<div className="container mx-auto py-24 text-center text-primary-900"><h1 className="text-4xl font-serif mb-4">All Products</h1><p className="text-gray-500">Shop all luxury items.</p></div>} />
          <Route path="categories" element={<Categories />} />
          <Route path="account" element={<Login />} />
          
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout/success/:orderId" element={<OrderSuccess />} />
          <Route path="checkout/invoice/:orderId" element={<OrderInvoice />} />
          <Route path="orders" element={<Orders />} />

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
