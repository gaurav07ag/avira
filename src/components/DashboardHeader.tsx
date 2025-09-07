import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, MessageCircle, Phone, Shield } from 'lucide-react';

export const DashboardHeader = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary-glow/10" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, Sarah
              </h1>
              <p className="text-muted-foreground">
                How are you feeling today? Let's continue your wellness journey.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4" />
                Schedule Session
              </Button>
              <Button variant="therapy" size="sm">
                <MessageCircle className="h-4 w-4" />
                Chat with AI
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-gentle transition-all duration-300 hover:scale-[1.02] cursor-pointer">
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium text-sm">AI Therapy Chat</h3>
            <p className="text-xs text-muted-foreground mt-1">24/7 Support</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-gentle transition-all duration-300 hover:scale-[1.02] cursor-pointer">
          <CardContent className="p-4 text-center">
            <Phone className="h-8 w-8 mx-auto mb-2 text-success" />
            <h3 className="font-medium text-sm">Video Session</h3>
            <p className="text-xs text-muted-foreground mt-1">Book with Doctor</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-gentle transition-all duration-300 hover:scale-[1.02] cursor-pointer">
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-warning" />
            <h3 className="font-medium text-sm">Crisis Support</h3>
            <p className="text-xs text-muted-foreground mt-1">Emergency Help</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-gentle transition-all duration-300 hover:scale-[1.02] cursor-pointer">
          <CardContent className="p-4 text-center">
            <Bell className="h-8 w-8 mx-auto mb-2 text-accent-foreground" />
            <h3 className="font-medium text-sm">Reminders</h3>
            <p className="text-xs text-muted-foreground mt-1">Medication & Therapy</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Banner */}
      <Card className="border-l-4 border-l-success">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-success/10">
                <Shield className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="font-medium text-sm">You're doing great!</p>
                <p className="text-xs text-muted-foreground">7 days mood tracking streak</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-success/10 text-success">
              Consistent
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};