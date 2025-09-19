import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import { useAuth } from "./hooks/useAuth";

// Pages
import Login from "./pages/Login";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import NotFound from "./pages/NotFound";

// Auth Context
export const AuthContext = React.createContext<{
  user: { id: string; name: string; email: string; role: 'admin' | 'freelancer' | 'customer' } | null;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  logout: () => void;
  loading: boolean;
}>({
  user: null,
  login: async () => {},
  logout: () => {},
  loading: false,
});

const queryClient = new QueryClient();

const App = () => {
  const { user, login, logout, loading } = useAuth();
  
  console.log('App.tsx - Current user:', user);
  console.log('App.tsx - User role:', user?.role);
  console.log('App.tsx - Role type:', typeof user?.role);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthContext.Provider value={{ user, login, logout, loading }}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={user ? (
                (() => {
                  console.log('Routing decision for user:', user);
                  console.log('Checking role:', user.role);
                  if (user.role === 'freelancer') {
                    console.log('Routing to FreelancerDashboard');
                    return <FreelancerDashboard />;
                  } else if (user.role === 'customer') {
                    console.log('Routing to CustomerDashboard');
                    return <CustomerDashboard />;
                  } else {
                    console.log('Routing to AdminDashboard (default)');
                    return <AdminDashboard />;
                  }
                })()
              ) : <Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/freelancer" element={<FreelancerDashboard />} />
              <Route path="/customer" element={<CustomerDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/project/:id" element={<ProjectWorkspace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;