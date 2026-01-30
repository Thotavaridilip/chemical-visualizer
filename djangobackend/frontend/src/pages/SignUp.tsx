import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Beaker, AlertCircle } from 'lucide-react';
import { register as apiRegister } from '@/api/equipmentApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await apiRegister(username, email, password);
      toast({
        title: 'Account registered',
        description: 'Your account was created successfully. You can now sign in.',
      });
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-primary">
            <Beaker className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign up to access the dashboard
            </p>
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign up</CardTitle>
            <CardDescription className="text-center">Create a new account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="animate-slide-up">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" type="text" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Choose a password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                Create account
              </Button>
            </form>

            <div className="text-center mt-4">
              <span className="text-sm text-muted-foreground">Already have an account? </span>
              <a href="/" className="text-sm text-accent hover:underline">Sign in</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
