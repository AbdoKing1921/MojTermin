import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/LoadingSpinner";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import CategoryPage from "@/pages/CategoryPage";
import BusinessDetail from "@/pages/BusinessDetail";
import BookingPage from "@/pages/BookingPage";
import UserBookings from "@/pages/UserBookings";
import Profile from "@/pages/Profile";
import SearchPage from "@/pages/SearchPage";
import AdminDashboard from "@/pages/AdminDashboard";
import CreateBusiness from "@/pages/CreateBusiness";
import Analytics from "@/pages/Analytics";
import AdminUsers from "@/pages/AdminUsers";
import AdminBusinessApproval from "@/pages/AdminBusinessApproval";
import EmployeeManagement from "@/pages/EmployeeManagement";
import BusinessSchedule from "@/pages/BusinessSchedule";
import BusinessEdit from "@/pages/BusinessEdit";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/not-found";

import OwnerDashboard from "@/pages/owner/OwnerDashboard";
import OwnerBusinessProfile from "@/pages/owner/OwnerBusinessProfile";
import OwnerGallery from "@/pages/owner/OwnerGallery";
import OwnerLocation from "@/pages/owner/OwnerLocation";
import OwnerWorkingHours from "@/pages/owner/OwnerWorkingHours";
import OwnerEmployees from "@/pages/owner/OwnerEmployees";
import OwnerServices from "@/pages/owner/OwnerServices";
import OwnerBookings from "@/pages/owner/OwnerBookings";
import OwnerAnalytics from "@/pages/owner/OwnerAnalytics";
import OwnerSettings from "@/pages/owner/OwnerSettings";

function AuthenticatedRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={SearchPage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/business/:id" component={BusinessDetail} />
      <Route path="/book/:id" component={BookingPage} />
      <Route path="/bookings" component={UserBookings} />
      <Route path="/profile" component={Profile} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/create-business" component={CreateBusiness} />
      <Route path="/admin/analytics" component={Analytics} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/businesses" component={AdminBusinessApproval} />
      <Route path="/admin/business/:businessId/employees" component={EmployeeManagement} />
      <Route path="/admin/business/:businessId/schedule" component={BusinessSchedule} />
      <Route path="/admin/business/:businessId/edit" component={BusinessEdit} />
      <Route path="/owner" component={OwnerDashboard} />
      <Route path="/owner/profile" component={OwnerBusinessProfile} />
      <Route path="/owner/gallery" component={OwnerGallery} />
      <Route path="/owner/location" component={OwnerLocation} />
      <Route path="/owner/hours" component={OwnerWorkingHours} />
      <Route path="/owner/employees" component={OwnerEmployees} />
      <Route path="/owner/services" component={OwnerServices} />
      <Route path="/owner/bookings" component={OwnerBookings} />
      <Route path="/owner/analytics" component={OwnerAnalytics} />
      <Route path="/owner/settings" component={OwnerSettings} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function PublicRoutes() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/search" component={SearchPage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/business/:id" component={BusinessDetail} />
      <Route path="/book/:id" component={BookingPage} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <AuthenticatedRoutes /> : <PublicRoutes />;
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
