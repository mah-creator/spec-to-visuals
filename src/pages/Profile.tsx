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
import { AvatarCropDialog } from "@/components/AvatarCropDialog";
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
  Briefcase,
  Save,
  Edit,
  X,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Upload,
  RotateCcw
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  const [originalFormData, setOriginalFormData] = useState({
    name: '',
    bio: '',
    phone: ''
  });

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      const newFormData = {
        name: profile.name || user?.name || '',
        bio: profile.bio || '',
        phone: profile.phone || ''
      };
      setFormData(newFormData);
      setOriginalFormData(newFormData);
    }
  }, [profile, user?.name]);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());

  // Check if form has changes
  const hasChanges = 
    formData.name !== originalFormData.name ||
    formData.bio !== originalFormData.bio ||
    formData.phone !== originalFormData.phone;

  const handleSaveProfile = async () => {
    const dataToSend = {
      name: formData.name.trim() || null,
      bio: formData.bio.trim() || null,
      phone: formData.phone.trim() || null
    };
    await updateProfile(dataToSend);
    setOriginalFormData(formData);
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    // Reset form data to original values
    setFormData(originalFormData);
    setIsEditMode(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    await changePassword(passwordData.currentPassword, passwordData.newPassword);
    setPasswordError('');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordSection(false);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleCroppedImage = async (croppedBlob: Blob) => {
    const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
    await uploadAvatar(file);
    setAvatarTimestamp(Date.now());
  };

  const getRoleBadge = (role?: string) => {
    const variants: Record<string, { class: string; icon: any }> = {
      'admin': { class: 'bg-red-100 text-red-800 border-red-200', icon: Shield },
      'freelancer': { class: 'bg-blue-100 text-blue-800 border-blue-200', icon: Briefcase },
      'customer': { class: 'bg-green-100 text-green-800 border-green-200', icon: User }
    };
    const config = variants[role || ''] || variants['customer'];
    const Icon = config.icon;
    return (
      <Badge className={cn("flex items-center gap-1 border px-3 py-1 rounded-full text-sm font-medium", config.class)}>
        <Icon className="w-3 h-3" />
        {role || 'customer'}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-sm text-gray-600">Manage your account information</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid gap-6">
          {/* Profile Overview Card */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-gray-900">Profile Information</CardTitle>
              <CardDescription className="text-gray-600">Update your profile details and avatar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="relative group">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                      <AvatarImage 
                        src={profile?.avatarUrl ? `${API_BASE_URL}${profile.avatarUrl}?t=${avatarTimestamp}` : ''} 
                        className="group-hover:opacity-80 transition-opacity"
                      />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        {user?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {isLoading && (
                      <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 shadow-lg transition-all duration-200 group">
                    <Camera className="w-4 h-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarSelect}
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
                  <p className="text-gray-600 flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </p>
                  <div className="flex h-6">
                    {getRoleBadge(user?.role)}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {isEditMode ? (
                    <>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isLoading || !hasChanges}
                        className={cn(
                          "transition-all duration-200",
                          hasChanges 
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm" 
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        )}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      {/* <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                        className="border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button> */}
                      <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                        disabled={isLoading}
                      className="h-8 w-8 p-0 hover:bg-gray-200"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditMode(true)}
                      disabled={isLoading}
                      className="border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              <Separator className="bg-gray-200" />

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditMode}
                    placeholder="Enter your full name"
                    className={cn(
                      "transition-colors",
                      !isEditMode && "bg-gray-50 text-gray-600"
                    )}
                  />
                  {isEditMode && formData.name !== originalFormData.name && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <RotateCcw className="w-3 h-3" />
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, name: originalFormData.name })}
                        className="hover:underline"
                      >
                        Reset to original
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditMode}
                    placeholder="Enter your phone number"
                    className={cn(
                      "transition-colors",
                      !isEditMode && "bg-gray-50 text-gray-600"
                    )}
                  />
                  {isEditMode && formData.phone !== originalFormData.phone && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <RotateCcw className="w-3 h-3" />
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, phone: originalFormData.phone })}
                        className="hover:underline"
                      >
                        Reset to original
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio" className="text-gray-700 font-medium">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditMode}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className={cn(
                      "transition-colors resize-none",
                      !isEditMode && "bg-gray-50 text-gray-600"
                    )}
                  />
                  {isEditMode && formData.bio !== originalFormData.bio && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <RotateCcw className="w-3 h-3" />
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, bio: originalFormData.bio })}
                        className="hover:underline"
                      >
                        Reset to original
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Changes Indicator */}
              {isEditMode && hasChanges && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>You have unsaved changes</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Stats Card */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-gray-900">
                {user?.role == "admin" ? "Site Activity" : "Account Activity"}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {user?.role == "admin" ? "Platform overview and statistics" : "Your activity summary and performance"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.projectsCount || 0}</p>
                    <p className="text-sm text-gray-600">Projects</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 border border-green-100">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.tasksCompleted || 0}</p>
                    <p className="text-sm text-gray-600">Tasks Completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.filesUploaded || 0}</p>
                    <p className="text-sm text-gray-600">Files Uploaded</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Security</CardTitle>
              <CardDescription className="text-gray-600">Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showPasswordSection ? (
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordSection(true)}
                  className="w-full justify-start border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <Lock className="w-4 h-4 mr-2 text-gray-600" />
                  Change Password
                </Button>
              ) : (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Update Password</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowPasswordSection(false);
                        setPasswordError('');
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="h-8 w-8 p-0 hover:bg-gray-200"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="current-password" className="text-gray-700">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                        className="border-gray-300 focus:border-blue-500"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-password" className="text-gray-700">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        className="border-gray-300 focus:border-blue-500"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password" className="text-gray-700">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => {
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                          if (passwordError) setPasswordError('');
                        }}
                        className={cn(
                          "focus:border-blue-500",
                          passwordError ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                        )}
                        placeholder="Confirm new password"
                      />
                      {passwordError && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {passwordError}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={handleChangePassword} 
                      disabled={isLoading}
                      className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Update Password
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowPasswordSection(false);
                        setPasswordError('');
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone Card */}
          <Card className="border border-red-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-600">Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AvatarCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={selectedImage}
        onCropComplete={handleCroppedImage}
      />
    </div>
  );
};

export default Profile;