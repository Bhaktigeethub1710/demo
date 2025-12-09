import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { Shield, Users, Building2, BarChart3, Landmark, FileText } from "lucide-react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { role: urlRole } = useParams(); // Get role from URL parameter
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Auto-select role if provided in URL
  useEffect(() => {
    if (urlRole && (urlRole === 'victim' || urlRole === 'officer')) {
      setSelectedRole(urlRole);
    }
  }, [urlRole]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Call backend login API
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          expectedRole: selectedRole  // Send the role to validate against
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Login successful
        console.log('✅ Login successful:', data.user);

        // Store token and call AuthContext login
        login(data.token, data.user);

        // Redirect to intended destination or default portal
        const intendedDestination = location.state?.from;
        const defaultDestination = data.user.role === 'victim' ? '/victim-portal' : '/officer-portal';

        console.log(`🎯 Redirecting to: ${intendedDestination || defaultDestination}`);
        navigate(intendedDestination || defaultDestination);
      } else {
        // Login failed
        console.error('❌ Login failed:', data.message);
        alert(data.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('❌ Connection error:', error);
      alert('Unable to connect to server. Please make sure the backend is running.');
    }
  };

  const roles = [
    {
      id: "victim",
      title: t('login.victim'),
      description: t('portals.victimPortal.description'),
      icon: Users,
      color: "bg-accent",
    },
    {
      id: "officer",
      title: t('login.officer'),
      description: t('portals.officerPortal.description'),
      icon: FileText,
      color: "bg-primary",
    },
  ];

  // If no role selected, show role selection screen
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-dashboard flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {t('login.selectRole')}
              </h1>
              <p className="text-muted-foreground">
                {t('portals.roleBasedAccess')}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {roles.map((role) => (
                <Card
                  key={role.id}
                  className="p-8 cursor-pointer hover:shadow-elevated transition-smooth hover:scale-105 group"
                  onClick={() => navigate(`/login/${role.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`${role.color} w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-smooth flex-shrink-0`}>
                      <role.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-semibold mb-1">{role.title}</h3>
                      <p className="text-muted-foreground text-sm">{role.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentRole = roles.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-dashboard">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-8 shadow-elevated">
            <div className="text-center mb-8">
              <div className={`${currentRole.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <currentRole.icon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{currentRole.title} Login</h2>
              <p className="text-muted-foreground text-sm">{currentRole.description}</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="userId">User ID / Email</Label>
                <Input
                  id="userId"
                  type="email"
                  placeholder="Enter your email"
                  className="transition-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="transition-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button className={`w-full ${currentRole.color} hover:opacity-90 transition-base`}>
                Login Securely
              </Button>

              {selectedRole === "victim" && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    New applicant?
                  </p>
                  <Link to="/register/victim">
                    <Button variant="outline" className="w-full">
                      Register for Relief
                    </Button>
                  </Link>
                </div>
              )}

              {selectedRole === "officer" && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    New to the system?
                  </p>
                  <Link to="/register/officer">
                    <Button variant="outline" className="w-full">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </form>

            <div className="mt-6 pt-6 border-t text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedRole(null);
                  navigate('/login');
                }}
                className="text-muted-foreground"
              >
                ← Change Role
              </Button>
            </div>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Call our 24/7 helpline:{" "}
              <span className="font-semibold text-foreground">18002021989</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
