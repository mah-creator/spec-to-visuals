import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AuthContext } from "../App";
import { Users, Briefcase, Shield } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<'freelancer' | 'customer' | 'admin'>('freelancer');
  const { login } = useContext(AuthContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, selectedRole);
  };

  const roles = [
    { id: 'freelancer', label: 'Freelancer', icon: Briefcase, description: 'Manage projects and tasks' },
    { id: 'customer', label: 'Customer', icon: Users, description: 'View project progress' },
    { id: 'admin', label: 'Admin', icon: Shield, description: 'System oversight' }
  ];

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

            <div className="space-y-3">
              <Label>Login as:</Label>
              <div className="grid gap-2">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRole === role.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedRole(role.id as 'freelancer' | 'customer' | 'admin')}
                  >
                    <div className="flex items-center gap-3">
                      <role.icon className={`w-5 h-5 ${selectedRole === role.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div>
                        <div className={`font-medium ${selectedRole === role.id ? 'text-primary' : 'text-foreground'}`}>
                          {role.label}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {role.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary">
              Sign In
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Demo credentials: any email/password combination
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;