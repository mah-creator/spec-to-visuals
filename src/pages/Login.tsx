import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AuthContext } from "../App";
import { Briefcase, User, UserCog, Shield, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/');
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
            <p className="text-gray-600 mt-1">Professional project management platform</p>
          </div>
        </div>

        <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 pl-10 pr-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pl-10 pr-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
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

              {/* Sign In Button */}
              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="space-y-5">
              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link 
                    to="/signup" 
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              </div>

              {/* Demo Accounts */}
              <div className="border-t border-gray-200 pt-5">
                <p className="text-sm font-medium text-gray-900 text-center mb-4">Try Demo Accounts</p>
                <div className="grid gap-3">
                  {/* Customer Demo */}
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('customer1@customer.com', '123')}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Customer</p>
                      <p className="text-xs text-gray-500">customer1@customer.com</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </button>

                  {/* Freelancer Demo */}
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('freelancer@local.com', '123')}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <UserCog className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Freelancer</p>
                      <p className="text-xs text-gray-500">freelancer@local.com</p>
                    </div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  </button>

                  {/* Admin Demo */}
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('admin@local.com', '123')}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Admin</p>
                      <p className="text-xs text-gray-500">admin@local.com</p>
                    </div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  </button>
                </div>

                {/* Demo Instructions */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 text-center">
                    <strong>Demo Tip:</strong> Click any demo account to auto-fill credentials
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Secure login powered by modern authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;