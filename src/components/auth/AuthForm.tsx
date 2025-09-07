import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, User, Chrome } from 'lucide-react';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
}

export const AuthForm = ({ mode, onToggleMode }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (showResetForm) {
        await resetPassword(email);
        setShowResetForm(false);
      } else if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsLoading(false);
    }
  };

  if (showResetForm) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-soft">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-2xl font-semibold text-foreground">
            Reset Password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email and we'll send you a reset link
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              variant="therapy"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowResetForm(false)}
              className="w-full"
            >
              Back to Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-soft">
      <CardHeader className="space-y-3 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-primary to-primary-glow">
          <User className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-semibold text-foreground">
          {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {mode === 'signin' 
            ? 'Sign in to access your wellness journey'
            : 'Join us on your path to mental wellness'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <Chrome className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            variant="therapy"
            disabled={isLoading}
          >
            {isLoading 
              ? (mode === 'signin' ? 'Signing In...' : 'Creating Account...') 
              : (mode === 'signin' ? 'Sign In' : 'Create Account')
            }
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-3">
        {mode === 'signin' && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowResetForm(true)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Forgot your password?
          </Button>
        )}
        
        <div className="text-center text-sm text-muted-foreground">
          {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
          <Button
            type="button"
            variant="link"
            onClick={onToggleMode}
            className="text-primary p-0 h-auto font-medium"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};