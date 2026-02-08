import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
import { ClientsList } from "./pages/broker/ClientsList";
import { AddClient } from "./pages/broker/AddClient";
import { ClientDetail } from "./pages/broker/ClientDetail";
import { AgreementsList } from "./pages/broker/AgreementsList";
import { CreateAgreement } from "./pages/broker/CreateAgreement";
import { AgreementDetail } from "./pages/broker/AgreementDetail";
import Portfolio from "./components/customer/Portfolio";
import { ProposalsList } from "./pages/customer/ProposalsList";
import { ProposalDetail } from "./pages/customer/ProposalDetail";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import CreateOrgPage from "./pages/auth/CreateOrgPage";
import AcceptInvitePage from "./pages/auth/AcceptInvitePage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen w-full overflow-x-hidden">
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/start" element={<StartPage />} />

              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/create-org" element={<CreateOrgPage />} />
              <Route path="/accept-invite" element={<AcceptInvitePage />} />

              {/* App routes (authenticated) */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }>
                <Route path="onboarding" element={<OnboardingWizard />} />
                <Route path="customer" element={<Portfolio />} />
                <Route path="customer/agreements/:id/overview" element={<AgreementDetails />} />
                <Route path="proposals" element={<ProposalsList />} />
                <Route path="proposals/:id" element={<ProposalDetail />} />
                <Route path="payments" element={<PaymentHistory />} />
                <Route path="documents" element={<Documents />} />
                <Route path="support" element={<Support />} />
                <Route path="broker" element={<BrokerDashboard />} />
                <Route path="broker/dashboard" element={<BrokerDashboard />} />
                <Route path="broker/clients" element={<ClientsList />} />
                <Route path="broker/clients/new" element={<AddClient />} />
                <Route path="broker/clients/:id" element={<ClientDetail />} />
                <Route path="broker/agreements" element={<AgreementsList />} />
                <Route path="broker/agreements/new" element={<CreateAgreement />} />
                <Route path="broker/agreements/:id" element={<AgreementDetail />} />
                <Route path="broker/deal-builder" element={<CreateAgreement />} />
                <Route path="broker/*" element={<BrokerComingSoon />} />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
