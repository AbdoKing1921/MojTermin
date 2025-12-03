import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import CategoryPage from "@/pages/CategoryPage";
import BusinessDetail from "@/pages/BusinessDetail";
import BookingPage from "@/pages/BookingPage";
import UserBookings from "@/pages/UserBookings";
import Profile from "@/pages/Profile";
import SearchPage from "@/pages/SearchPage";
import AdminDashboard from "@/pages/AdminDashboard";
import CreateBusiness from "@/pages/CreateBusiness";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/search" component={SearchPage} />
          <Route path="/category/:slug" component={CategoryPage} />
          <Route path="/business/:id" component={BusinessDetail} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/search" component={SearchPage} />
          <Route path="/category/:slug" component={CategoryPage} />
          <Route path="/business/:id" component={BusinessDetail} />
          <Route path="/book/:id" component={BookingPage} />
          <Route path="/bookings" component={UserBookings} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/create-business" component={CreateBusiness} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
