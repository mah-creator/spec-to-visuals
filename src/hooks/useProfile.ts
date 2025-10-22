import { useState, useEffect, useContext } from 'react';
import { apiClient } from '@/lib/api-client';
import { UserProfile, UserStats, UpdateProfileDto } from '@/types/api';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '@/App';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const data = await apiClient.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      if (user?.id) {
        const data = await apiClient.getUserStats(user.id);
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const updateProfile = async (data: UpdateProfileDto) => {
    try {
      setIsLoading(true);
      await apiClient.updateProfile(data);
      await fetchProfile();
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setIsLoading(true);
      await apiClient.changePassword({ currentPassword, newPassword });
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Password change failed",
        description: error instanceof Error ? error.message : "Failed to change password",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      setIsLoading(true);
      await apiClient.uploadAvatar(file);
      await fetchProfile();
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload avatar",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    stats,
    isLoading,
    updateProfile,
    changePassword,
    uploadAvatar,
    refetch: fetchProfile
  };
};
