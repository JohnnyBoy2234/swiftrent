import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RouteGuard } from "@/components/RouteGuard";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TenantDashboard from "./pages/TenantDashboard";
import LeaseSigningPage from "./pages/LeaseSigningPage";
import LandlordLeaseSigningPage from "./pages/LandlordLeaseSigningPage";
import AddProperty from "./pages/AddProperty";
import ListProperty from "./pages/ListProperty";
import PropertyDetail from "./pages/PropertyDetail";
import PropertyManagement from "./pages/PropertyManagement";
import IdVerification from "./pages/IdVerification";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/properties" element={<RouteGuard><Properties /></RouteGuard>} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<RouteGuard><Dashboard /></RouteGuard>} />
            <Route path="/tenant-dashboard" element={<RouteGuard><TenantDashboard /></RouteGuard>} />
            <Route path="/lease-signing/:tenancyId" element={<RouteGuard><LeaseSigningPage /></RouteGuard>} />
            <Route path="/landlord-lease-signing/:tenancyId" element={<RouteGuard><LandlordLeaseSigningPage /></RouteGuard>} />
            <Route path="/add-property" element={<RouteGuard><AddProperty /></RouteGuard>} />
            <Route path="/list-property" element={<RouteGuard><ListProperty /></RouteGuard>} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/manage-property/:id" element={<RouteGuard><PropertyManagement /></RouteGuard>} />
            <Route path="/id-verification" element={<IdVerification />} />
            <Route path="/messages" element={<RouteGuard><Messages /></RouteGuard>} />
            <Route path="/apply/:id" element={<PropertyDetail />} />
            <Route path="/payment-success" element={<RouteGuard><PaymentSuccess /></RouteGuard>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
