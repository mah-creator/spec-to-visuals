import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { User, LoginRequest } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in on app start
    const token = apiClient.getToken();
    if (token) {
      // In a real app, you'd validate the token here
      // For now, we'll assume token is valid
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setLoading(true);
      const response = await apiClient.login(credentials);
      
      // Handle the actual response structure from your .NET API
      if (response.token) {
        apiClient.setToken(response.token);
      }
      
      if (response.user) {
        setUser(response.user);
        toast({
          title: "Login successful",
          description: `Welcome back, ${response.user.name || response.user.email || 'User'}!`,
        });
        return response.user;
      } else {
        // If no user object, create a basic user from response
        const user: User = {
          id: response.userId || 'unknown',
          name: response.name || response.userName || 'User',
          email: response.email || credentials.email,
          role: (response.role as 'admin' | 'freelancer' | 'customer') || 'customer'
        };
        setUser(user);
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name}!`,
        });
        return user;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
};