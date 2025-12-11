import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/lib/auth-context";

import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ToursPage from "@/pages/tours";
import TourDetailsPage from "@/pages/tour-details";
import GuideDashboardPage from "@/pages/guide-dashboard";
import AdminDashboardPage from "@/pages/admin-dashboard";
import UserDashboardPage from "@/pages/user-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/tours" component={ToursPage} />
      <Route path="/tour/:id" component={TourDetailsPage} />
      <Route path="/guide/dashboard" component={GuideDashboardPage} />
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
      <Route path="/dashboard" component={UserDashboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
