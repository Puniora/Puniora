import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Index from "@/pages/Index";
import Admin from "@/pages/Admin";
import InvoicePage from "@/pages/admin/InvoicePage";
import AdminLogin from "@/pages/AdminLogin";
import Auth from "@/pages/Auth";
import Account from "@/pages/Account";
import BlogList from "@/pages/BlogList";
import BlogDetail from "@/pages/BlogDetail";
import ProductDetails from "@/pages/ProductDetails";
import Checkout from "@/pages/Checkout";
import TrackOrder from "@/pages/TrackOrder";
import NotFound from "@/pages/NotFound";
import PrivacyPolicy from "@/pages/policies/PrivacyPolicy";
import Terms from "@/pages/policies/Terms";
import ShippingPolicy from "@/pages/policies/ShippingPolicy";
import RefundPolicy from "@/pages/policies/RefundPolicy";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import WhatsAppButton from "@/components/WhatsAppButton";

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
          <BrowserRouter>
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
            <WhatsAppButton />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
