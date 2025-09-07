import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import heroImage from '@/assets/hero-wellness.jpg';

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const { user, loading } = useAuth();

  useEffect(() => {
    document.title = mode === 'signin' ? 'Sign In - EmpathicPath' : 'Sign Up - EmpathicPath';
  }, [mode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <AuthForm mode={mode} onToggleMode={toggleMode} />
        </div>
      </div>

      {/* Right side - Hero Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img
          src={heroImage}
          alt="Peaceful wellness journey"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-glow/30" />
        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="text-center text-white space-y-6">
            <h1 className="text-4xl font-bold">
              EmpathicPath
            </h1>
            <p className="text-xl opacity-90">
              Your journey to mental wellness starts here
            </p>
            <div className="space-y-2 text-sm opacity-80">
              <p>✨ AI-powered therapy sessions</p>
              <p>📊 Comprehensive mood tracking</p>
              <p>🌱 Personalized wellness plans</p>
              <p>🔒 Secure and confidential</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}