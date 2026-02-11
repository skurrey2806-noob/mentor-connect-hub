import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Pages
import LandingPage from "./pages/LandingPage";
import BrowseMentorsPage from "./pages/BrowseMentorsPage";
import MentorProfilePage from "./pages/MentorProfilePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import BookingPage from "./pages/BookingPage";
import WalletPage from "./pages/WalletPage";
import UserBookingsPage from "./pages/UserBookingsPage";
import BecomeMentorPage from "./pages/BecomeMentorPage";
import UserProfilePage from "./pages/UserProfilePage";
import NotFound from "./pages/NotFound";

// Dashboard Pages
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import DashboardMeetings from "./pages/dashboard/DashboardMeetings";
import DashboardServices from "./pages/dashboard/DashboardServices";
import DashboardCalendar from "./pages/dashboard/DashboardCalendar";
import DashboardPayouts from "./pages/dashboard/DashboardPayouts";
import DashboardWallet from "./pages/dashboard/DashboardWallet";
import DashboardProfileEdit from "./pages/dashboard/DashboardProfileEdit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/browse" element={<BrowseMentorsPage />} />
            <Route path="/mentor/:mentorId" element={<MentorProfilePage />} />
            <Route path="/mentor/:mentorId/book" element={<BookingPage />} />
            <Route path="/mentor/:mentorId/book/:serviceId" element={<BookingPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/bookings" element={<UserBookingsPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/become-mentor" element={<BecomeMentorPage />} />
            
            {/* Mentor Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="meetings" element={<DashboardMeetings />} />
              <Route path="services" element={<DashboardServices />} />
              <Route path="calendar" element={<DashboardCalendar />} />
              <Route path="payouts" element={<DashboardPayouts />} />
              <Route path="wallet" element={<DashboardWallet />} />
              <Route path="profile/edit" element={<DashboardProfileEdit />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
