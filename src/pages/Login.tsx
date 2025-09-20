import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { signInAdmin } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const { admin, setAdmin } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (admin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await signInAdmin(formData.email, formData.password);
      
      if (error) {
        setError(error.message);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message,
        });
      } else if (data) {
        setAdmin({
          id: data.id,
          username: data.username,
          email: data.email,
          profile_picture: data.profile_picture,
        });
        toast({
          title: "Welcome back!",
          description: `Logged in as ${data.username}`,
        });
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md admin-card animate-slide-up">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 flex items-center justify-center">
            <img src="/full_logo.png" alt="Jagdamba Caterers" className="w-full h-full object-contain" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold brand-text">Admin Login</CardTitle>
            <CardDescription className="text-muted-foreground">
              Access <span className="brand-text text-primary">Jagdamba Caterers</span> Admin Panel
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {/* Default Credentials */}
          <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <h3 className="font-semibold mb-2 text-primary">Demo Credentials</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Email:</span> mahendra2731@gmail.com</p>
              <p><span className="font-medium">Password:</span> Mahi@12345</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => {
                setFormData({
                  email: 'mahendra2731@gmail.com',
                  password: 'Mahi@12345'
                });
              }}
            >
              Use Demo Credentials
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="admin-input"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="admin-input"
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full admin-button-primary h-12"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Secure admin access only
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;