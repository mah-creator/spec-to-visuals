import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuthContext } from "../App";
import { useProfile } from "@/hooks/useProfile";
import { API_BASE_URL } from "@/lib/api-client";
import { 
  ArrowLeft,
  Camera,
  Lock,
  User,
  Mail,
  Phone,
  FileText,
  Shield,
  Trash2,
  CheckCircle,
  Briefcase
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { profile, stats, updateProfile, changePassword, uploadAvatar, isLoading } = useProfile();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: ''
  });

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || user?.name || '',
        bio: profile.bio || '',
        phone: profile.phone || ''
      });
    }
  }, [profile, user?.name]);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const handleSaveProfile = async () => {
    await updateProfile(formData);
    setIsEditMode(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return;
    }
    await changePassword(passwordData.currentPassword, passwordData.newPassword);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordSection(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  const getRoleBadge = (role?: string) => {
    const variants: Record<string, { class: string; icon: any }> = {
      'admin': { class: 'bg-danger/10 text-danger', icon: Shield },
      'freelancer': { class: 'bg-primary/10 text-primary', icon: Briefcase },
      'customer': { class: 'bg-success/10 text-success', icon: User }
    };
    const config = variants[role || ''] || variants['customer'];
    const Icon = config.icon;
    return (
      <Badge className={`${config.class} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {role || 'customer'}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-[var(--content-width)] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Profile Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your account information</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid gap-6">
          {/* Profile Overview Card */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile details and avatar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile?.avatarUrl ? `${API_BASE_URL}${profile.avatarUrl}` : ''} />
                    <AvatarFallback className="text-2xl">
                      {user?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 shadow-lg">
                    <Camera className="w-4 h-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{user?.name}</h3>
                  <p className="text-muted-foreground flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </p>
                  {getRoleBadge(user?.role)}
                </div>
                <Button
                  variant={isEditMode ? "default" : "outline"}
                  onClick={() => isEditMode ? handleSaveProfile() : setIsEditMode(true)}
                  disabled={isLoading}
                >
                  {isEditMode ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditMode}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditMode}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditMode}
                    placeholder="Tell us about yourself"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Stats Card */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Account Activity</CardTitle>
              <CardDescription>Your activity summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.projectsCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Projects</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-success/5">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.tasksCompleted || 0}</p>
                    <p className="text-sm text-muted-foreground">Tasks Completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/5">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.filesUploaded || 0}</p>
                    <p className="text-sm text-muted-foreground">Files Uploaded</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showPasswordSection ? (
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordSection(true)}
                  className="w-full justify-start"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleChangePassword} disabled={isLoading}>
                      Update Password
                    </Button>
                    <Button variant="outline" onClick={() => setShowPasswordSection(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone Card */}
          <Card className="border-danger/20 shadow-md">
            <CardHeader>
              <CardTitle className="text-danger">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
