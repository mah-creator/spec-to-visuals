import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AuthContext } from "../App";
import { Briefcase, User, UserCog, Shield } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-primary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Client Portal</CardTitle>
          <CardDescription>
            Professional project management platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>


            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-center mb-3">Try Demo Accounts</p>
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('customer1@customer.com', '123')}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">Customer</p>
                    <p className="text-xs text-muted-foreground">customer1@customer.com</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('freelancer@local.com', '123')}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <UserCog className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">Freelancer</p>
                    <p className="text-xs text-muted-foreground">freelancer@local.com</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin@local.com', '123')}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">Admin</p>
                    <p className="text-xs text-muted-foreground">admin@local.com</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;