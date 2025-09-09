import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StartPage from "./pages/StartPage";
import NotFound from "./pages/NotFound";
import { AppShell } from "./components/layout/AppShell";
import OnboardingWizard from "./pages/onboarding/OnboardingWizard";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import AgreementDetails from "./pages/customer/AgreementDetails";
import PaymentHistory from "./pages/customer/PaymentHistory";
import Documents from "./pages/customer/Documents";
import Support from "./pages/customer/Support";
import BrokerComingSoon from "./pages/broker/BrokerComingSoon";
import BrokerDashboard from "./pages/broker/BrokerDashboard";
import Portfolio from "./components/customer/Portfolio";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="min-h-screen w-full overflow-x-hidden">
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/start" element={<StartPage />} />
            
            {/* App routes (authenticated) */}
            <Route path="/app" element={<AppShell />}>
              <Route path="onboarding" element={<OnboardingWizard />} />
              <Route path="customer" element={<Portfolio />} />
              <Route path="customer/agreements/:id/overview" element={<AgreementDetails />} />
              <Route path="payments" element={<PaymentHistory />} />
              <Route path="documents" element={<Documents />} />
              <Route path="support" element={<Support />} />
              <Route path="broker" element={<BrokerDashboard />} />
              <Route path="broker/dashboard" element={<BrokerDashboard />} />
              <Route path="broker/clients" element={<BrokerDashboard />} />
              <Route path="broker/deals" element={<BrokerDashboard />} />
              <Route path="broker/pipeline" element={<BrokerDashboard />} />
              <Route path="broker/*" element={<BrokerComingSoon />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
