import { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardNav } from '@/components/DashboardNav';
import { MoodTracker } from '@/components/MoodTracker';
import { TherapyModules } from '@/components/TherapyModules';
import { EmergencySupport } from '@/components/EmergencySupport';
import { WellnessRecommendations } from '@/components/WellnessRecommendations';
import { HealthTracker } from '@/components/HealthTracker';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AITherapyChat } from '@/components/AITherapyChat';
import { TrendingUp, Calendar, MessageCircle, Users, Activity } from 'lucide-react';
import heroWellness from '@/assets/hero-wellness.jpg';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <DashboardNav />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{ backgroundImage: `url(${heroWellness})` }}
        />
        <div className="relative bg-gradient-to-br from-primary/5 via-primary-glow/5 to-success/5">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                AVIRA
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Your personalized mental health companion powered by AI. 
                Track your mood, access therapy tools, and connect with professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <AITherapyChat 
                  trigger={
                    <Button variant="therapy" size="lg">
                      <MessageCircle className="h-5 w-5" />
                      Start AI Therapy Chat
                    </Button>
                  }
                />
                <Button variant="calm" size="lg" asChild>
                  <a href="/book-consultation">
                    <Calendar className="h-5 w-5" />
                    Book Consultation
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="tracking">Health Tracking</TabsTrigger>
            <TabsTrigger value="wellness">AI Wellness</TabsTrigger>
            <TabsTrigger value="therapy">Therapy</TabsTrigger>
            <TabsTrigger value="mood">Mood Tracking</TabsTrigger>
            <TabsTrigger value="emergency">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <DashboardHeader />
            
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <MoodTracker />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Your Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-primary">7</p>
                        <p className="text-sm text-muted-foreground">Day Streak</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-success">15</p>
                        <p className="text-sm text-muted-foreground">Sessions</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-warning">4.2</p>
                        <p className="text-sm text-muted-foreground">Avg Mood</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Next Appointment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">Dr. Sarah Johnson</p>
                        <p className="text-sm text-muted-foreground">Clinical Psychologist</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">Tomorrow, 2:00 PM</p>
                        <p className="text-sm text-muted-foreground">Video Session</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      Join Session
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-primary">Live Health Tracking</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Monitor your health metrics in real-time and track your progress over time with interactive charts.
              </p>
            </div>
            <HealthTracker />
          </TabsContent>

          <TabsContent value="wellness" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-primary">AI Wellness Assistant</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Personalized wellness recommendations based on your smartwatch data and mental health patterns.
              </p>
            </div>
            <WellnessRecommendations />
          </TabsContent>

          <TabsContent value="therapy" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-primary">Therapy Modules</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Access evidence-based therapeutic exercises designed to support your mental health journey.
              </p>
            </div>
            <TherapyModules />
          </TabsContent>

          <TabsContent value="mood" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-primary">Mood Tracking</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Monitor your emotional well-being with our intelligent mood tracking system.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <MoodTracker />
            </div>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-destructive">Crisis Support</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Immediate help and resources for mental health emergencies.
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <EmergencySupport />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
