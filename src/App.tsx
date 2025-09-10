import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

// Pages
import Login from "./pages/Login";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import NotFound from "./pages/NotFound";

// Auth Context for mockup purposes
export const AuthContext = React.createContext<{
  user: { id: string; name: string; email: string; role: 'admin' | 'freelancer' | 'customer' } | null;
  login: (email: string, password: string, role: string) => void;
  logout: () => void;
}>({
  user: null,
  login: () => {},
  logout: () => {},
});

import React from "react";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: 'admin' | 'freelancer' | 'customer' } | null>(null);

  const login = (email: string, password: string, role: string) => {
    // Mock login for demo purposes
    setUser({
      id: '1',
      name: role === 'freelancer' ? 'John Doe' : role === 'customer' ? 'Jane Smith' : 'Admin User',
      email,
      role: role as 'admin' | 'freelancer' | 'customer'
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthContext.Provider value={{ user, login, logout }}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={user ? (
                user.role === 'freelancer' ? <FreelancerDashboard /> :
                user.role === 'customer' ? <CustomerDashboard /> :
                <AdminDashboard />
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