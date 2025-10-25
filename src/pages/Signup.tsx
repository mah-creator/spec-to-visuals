import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthContext } from "../App";
import { Briefcase, User, Mail, Lock, Eye, EyeOff, ArrowRight, UserCog, Shield, CheckCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const { signup, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      return;
    }
    try {
      await signup({ email, name, password, role });
      navigate('/login');
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Freelancer':
        return <UserCog className="w-4 h-4 text-blue-600" />;
      case 'Customer':
        return <User className="w-4 h-4 text-green-600" />;
      case 'Admin':
        return <Shield className="w-4 h-4 text-red-600" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'Freelancer':
        return "Manage projects and deliver work to clients";
      case 'Customer':
        return "Hire freelancers and manage your projects";
      case 'Admin':
        return "Manage platform users and system settings";
      default:
        return "Select your role to continue";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/50 flex items-center justify-center p-3 overflow-auto">
      <div className="w-full max-w-md space-y-3 py-2">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create Account</h1>
            <p className="text-sm text-gray-600">Join our project management platform</p>
          </div>
        </div>

        <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="p-4 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name Field */}
              <div className="space-y-1">
                <Label htmlFor="name" className="text-sm text-gray-700 font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-9 pl-10 pr-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm text-gray-700 font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-9 pl-10 pr-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm text-gray-700 font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-9 pl-10 pr-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1">
                <Label htmlFor="role" className="text-sm text-gray-700 font-medium">Role</Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger className={cn(
                    "h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors",
                    role && "border-green-500"
                  )}>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-200 shadow-lg">
                    <SelectItem value="Freelancer" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <UserCog className="w-4 h-4 text-blue-600" />
                        <span>Freelancer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Customer" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-green-600" />
                        <span>Customer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Admin" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-600" />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Role Description */}
                {role && (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      {getRoleIcon(role)}
                      <p className="text-xs text-blue-700">{getRoleDescription(role)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sign Up Button */}
              <Button 
                type="submit" 
                className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !role}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Features List */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 space-y-2">
              <h4 className="text-xs font-medium text-gray-900 text-center">What you'll get:</h4>
              <div className="grid gap-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span>Project management tools</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span>Secure file sharing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span>Real-time progress tracking</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pb-2">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our Terms
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;