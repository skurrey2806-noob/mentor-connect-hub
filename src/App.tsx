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
import NotFound from "./pages/NotFound";

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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
