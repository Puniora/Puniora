import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import InitialLoader from "@/components/ui/InitialLoader";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
const Index = React.lazy(() => import("@/pages/Index"));
const Admin = React.lazy(() => import("@/pages/Admin"));
const InvoicePage = React.lazy(() => import("@/pages/admin/InvoicePage"));
const AdminLogin = React.lazy(() => import("@/pages/AdminLogin"));
const Auth = React.lazy(() => import("@/pages/Auth"));
const Account = React.lazy(() => import("@/pages/Account"));
const BlogList = React.lazy(() => import("@/pages/BlogList"));
const BlogDetail = React.lazy(() => import("@/pages/BlogDetail"));
const ProductDetails = React.lazy(() => import("@/pages/ProductDetails"));
const Checkout = React.lazy(() => import("@/pages/Checkout"));
const TrackOrder = React.lazy(() => import("@/pages/TrackOrder"));
const PaymentGateway = React.lazy(() => import("@/pages/PaymentGateway"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const PrivacyPolicy = React.lazy(() => import("@/pages/policies/PrivacyPolicy"));
const Terms = React.lazy(() => import("@/pages/policies/Terms"));
const ShippingPolicy = React.lazy(() => import("@/pages/policies/ShippingPolicy"));
const RefundPolicy = React.lazy(() => import("@/pages/policies/RefundPolicy"));
const About = React.lazy(() => import("@/pages/About"));
const Contact = React.lazy(() => import("@/pages/Contact"));
import WhatsAppButton from "@/components/WhatsAppButton";

import CartDrawer from "@/components/CartDrawer";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("isAdminAuthenticated") === "true";
  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <InitialLoader />
          <BrowserRouter>
            <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div></div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/account" element={<Account />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:id" element={<BlogDetail />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/invoice/:orderId"
                  element={
                    <ProtectedRoute>
                      <InvoicePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/track" element={<TrackOrder />} />
                <Route path="/secure-payment" element={<PaymentGateway />} />
                {/* Policy Pages - For Razorpay Compliance */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-and-conditions" element={<Terms />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
  
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </React.Suspense>
            <WhatsAppButton />
            <CartDrawer />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
