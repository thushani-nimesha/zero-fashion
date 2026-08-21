import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import ProductDetail from '@/pages/ProductDetail';
import About from '@/pages/About';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Checkout from '@/pages/Checkout';
import Dashboard from '@/pages/Dashboard';
import { CartProvider } from '@/lib/cart-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import Admin from '@/pages/Admin';
import Orders from '@/pages/Orders';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OnboardingModal from '@/components/OnboardingModal';
import { Button } from '@/components/ui/button';

const AuthenticatedApp = () => {
  const { user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Show LoadingScreen while checking app settings, checking auth, or showing the introductory splash animation
  if (isLoadingPublicSettings || isLoadingAuth || showSplash) {
    return <LoadingScreen onComplete={() => setShowSplash(false)} />;
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    } else if (authError.type === 'user_banned') {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
          <div className="max-w-md space-y-5 bg-card/60 backdrop-blur-xl border border-destructive/20 p-8 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
            <h1 className="text-3xl font-heading font-bold text-destructive">Account Suspended</h1>
            <p className="text-muted-foreground text-sm">Your account has been suspended by an administrator. If you think this is a mistake, please contact support.</p>
            <Button onClick={() => window.location.href = '/login'} variant="outline" className="rounded-full px-6">
              Back to Login
            </Button>
          </div>
        </div>
      );
    }
  }

  // Render the main app
  return (
    <>
      {isAuthenticated && user && (!user.phone || !user.address) && <OnboardingModal />}
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute requireAdmin={true} />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/orders" element={<Orders />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </>
  );
};


import { ThemeProvider } from '@/lib/theme-provider';

function App() {

  return (
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <AuthenticatedApp />
            </Router>
          </CartProvider>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App