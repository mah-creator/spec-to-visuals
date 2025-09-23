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
      // Restore user from localStorage if token exists
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUser(user);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          // Clear invalid data
          localStorage.removeItem('user');
          apiClient.clearToken();
        }
      }
    }
    setLoading(false);
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
        // Normalize the role to lowercase
        const normalizedUser = {
          ...response.user,
          role: response.user.role?.toLowerCase() as 'admin' | 'freelancer' | 'customer'
        };
        setUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        console.log('Login successful with user object:', normalizedUser);
        toast({
          title: "Login successful",
          description: `Welcome back, ${normalizedUser.name || normalizedUser.email || 'User'}!`,
        });
        return normalizedUser;
      } else {
        // If no user object, create a basic user from response
        console.log('Creating user from response:', response);
        const user: User = {
          id: response.userId || response.id || 'unknown',
          name: response.name || response.userName || response.fullName || 'User',
          email: response.email || credentials.email,
          role: (response.role?.toLowerCase() as 'admin' | 'freelancer' | 'customer') || 'customer'
        };
        console.log('Created user object:', user);
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name}! Role: ${user.role}`,
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
    localStorage.removeItem('user');
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