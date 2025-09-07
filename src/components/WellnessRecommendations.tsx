import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Brain, 
  Moon, 
  Activity, 
  Droplets, 
  Wind,
  Flower2,
  Clock,
  BookOpen,
  Coffee,
  Utensils,
  ChevronRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface WellnessRecommendationsProps {
  stressLevel?: number;
  heartRate?: number;
  sleepQuality?: number;
  activityLevel?: number;
}

export const WellnessRecommendations: React.FC<WellnessRecommendationsProps> = ({
  stressLevel = 50,
  heartRate = 75,
  sleepQuality = 70,
  activityLevel = 60
}) => {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [isExerciseRunning, setIsExerciseRunning] = useState(false);

  // Breathing Exercise Component
  const BreathingExercise = ({ type }: { type: '478' | 'box' | 'calm' }) => {
    const exercises = {
      '478': {
        name: '4-7-8 Breathing',
        description: 'Inhale for 4, hold for 7, exhale for 8',
        steps: ['Inhale (4s)', 'Hold (7s)', 'Exhale (8s)', 'Rest (2s)'],
        duration: 21,
        icon: Wind
      },
      'box': {
        name: 'Box Breathing',
        description: 'Equal counts for inhale, hold, exhale, hold',
        steps: ['Inhale (4s)', 'Hold (4s)', 'Exhale (4s)', 'Hold (4s)'],
        duration: 16,
        icon: Brain
      },
      'calm': {
        name: 'Calming Breath',
        description: 'Simple relaxation breathing',
        steps: ['Inhale (3s)', 'Exhale (6s)', 'Rest (2s)'],
        duration: 11,
        icon: Flower2
      }
    };

    const exercise = exercises[type];
    const Icon = exercise.icon;

    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5 text-blue-500" />
            {exercise.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{exercise.description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              {exercise.steps.map((step, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span className="text-sm">{step}</span>
                  <div className="w-2 h-2 rounded-full bg-primary/40" />
                </div>
              ))}
            </div>
            <Button 
              className="w-full" 
              onClick={() => setActiveExercise(activeExercise === type ? null : type)}
              variant={activeExercise === type ? "secondary" : "default"}
            >
              <Play className="h-4 w-4 mr-2" />
              {activeExercise === type ? 'Stop Exercise' : 'Start Exercise'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Grounding Exercise
  const GroundingExercise = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-green-500" />
          5-4-3-2-1 Grounding
        </CardTitle>
        <p className="text-sm text-muted-foreground">Focus on your senses to reduce anxiety</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="font-medium text-sm">👀 5 things you can see</p>
            <p className="text-xs text-muted-foreground mt-1">Look around and name 5 objects</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="font-medium text-sm">✋ 4 things you can touch</p>
            <p className="text-xs text-muted-foreground mt-1">Feel textures around you</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="font-medium text-sm">👂 3 things you can hear</p>
            <p className="text-xs text-muted-foreground mt-1">Listen to sounds in your environment</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="font-medium text-sm">👃 2 things you can smell</p>
            <p className="text-xs text-muted-foreground mt-1">Notice any scents</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="font-medium text-sm">👅 1 thing you can taste</p>
            <p className="text-xs text-muted-foreground mt-1">Focus on taste in your mouth</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Get personalized recommendations based on biometric data
  const getRecommendations = () => {
    const recommendations = [];

    if (stressLevel > 70) {
      recommendations.push({
        priority: 'high',
        type: 'breathing',
        title: 'High Stress Detected',
        description: 'Your stress levels are elevated. Try immediate stress relief techniques.',
        action: 'Start breathing exercise',
        icon: Wind,
        color: 'text-red-500'
      });
    }

    if (heartRate > 100) {
      recommendations.push({
        priority: 'medium',
        type: 'relaxation',
        title: 'Elevated Heart Rate',
        description: 'Your heart rate is higher than normal. Consider relaxation techniques.',
        action: 'Try grounding exercise',
        icon: Heart,
        color: 'text-orange-500'
      });
    }

    if (sleepQuality < 60) {
      recommendations.push({
        priority: 'medium',
        type: 'sleep',
        title: 'Poor Sleep Quality',
        description: 'Your sleep quality could be improved. Consider sleep hygiene tips.',
        action: 'View sleep tips',
        icon: Moon,
        color: 'text-purple-500'
      });
    }

    if (activityLevel < 30) {
      recommendations.push({
        priority: 'low',
        type: 'movement',
        title: 'Low Activity Level',
        description: 'Consider gentle movement to boost energy and mood.',
        action: 'Start gentle exercise',
        icon: Activity,
        color: 'text-green-500'
      });
    }

    // Default wellness tips if no specific issues
    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'maintenance',
        type: 'wellness',
        title: 'Maintain Your Wellness',
        description: 'Your vitals look good! Continue with healthy habits.',
        action: 'Explore wellness tips',
        icon: Flower2,
        color: 'text-blue-500'
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  const wellnessTips = [
    {
      category: 'Hydration',
      tip: 'Drink a glass of water every hour during study sessions',
      icon: Droplets,
      color: 'text-blue-500'
    },
    {
      category: 'Movement',
      tip: 'Take a 5-minute walk between classes or study blocks',
      icon: Activity,
      color: 'text-green-500'
    },
    {
      category: 'Nutrition',
      tip: 'Eat protein-rich snacks to maintain steady energy',
      icon: Utensils,
      color: 'text-orange-500'
    },
    {
      category: 'Study Breaks',
      tip: 'Follow the 50/10 rule: 50 minutes study, 10 minutes break',
      icon: Clock,
      color: 'text-purple-500'
    },
    {
      category: 'Sleep',
      tip: 'Put devices away 1 hour before your target bedtime',
      icon: Moon,
      color: 'text-indigo-500'
    },
    {
      category: 'Mindfulness',
      tip: 'Practice gratitude by writing down 3 good things daily',
      icon: BookOpen,
      color: 'text-pink-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Priority Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon;
              return (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-l-4 bg-muted/30 ${
                    rec.priority === 'high' ? 'border-l-red-500' :
                    rec.priority === 'medium' ? 'border-l-orange-500' :
                    'border-l-green-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${rec.color}`} />
                      <div>
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      </div>
                    </div>
                    <Badge variant={
                      rec.priority === 'high' ? 'destructive' :
                      rec.priority === 'medium' ? 'secondary' :
                      'outline'
                    }>
                      {rec.priority}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3">
                    {rec.action}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Wellness Exercises */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Wellness Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="breathing" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="breathing">Breathing</TabsTrigger>
              <TabsTrigger value="grounding">Grounding</TabsTrigger>
              <TabsTrigger value="movement">Movement</TabsTrigger>
            </TabsList>
            
            <TabsContent value="breathing" className="mt-6">
              <div className="grid md:grid-cols-3 gap-4">
                <BreathingExercise type="478" />
                <BreathingExercise type="box" />
                <BreathingExercise type="calm" />
              </div>
            </TabsContent>
            
            <TabsContent value="grounding" className="mt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <GroundingExercise />
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Coffee className="h-5 w-5 text-brown-500" />
                      Mindful Moment
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Take a pause and be present</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm">
                        Take three deep breaths and ask yourself:
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li>• How am I feeling right now?</li>
                        <li>• What do I need in this moment?</li>
                        <li>• What am I grateful for today?</li>
                      </ul>
                      <Button variant="outline" className="w-full">
                        <Clock className="h-4 w-4 mr-2" />
                        Set Mindfulness Reminder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="movement" className="mt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="h-5 w-5 text-green-500" />
                      Desk Stretches
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Perfect for study breaks</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-2 rounded bg-muted/30">
                        <p className="text-sm font-medium">Neck Rolls</p>
                        <p className="text-xs text-muted-foreground">5 slow circles each direction</p>
                      </div>
                      <div className="p-2 rounded bg-muted/30">
                        <p className="text-sm font-medium">Shoulder Shrugs</p>
                        <p className="text-xs text-muted-foreground">10 repetitions</p>
                      </div>
                      <div className="p-2 rounded bg-muted/30">
                        <p className="text-sm font-medium">Wrist Circles</p>
                        <p className="text-xs text-muted-foreground">10 circles each direction</p>
                      </div>
                      <Button className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Start 5-Min Routine
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Heart className="h-5 w-5 text-red-500" />
                      Quick Energizers
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Boost energy and focus</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-2 rounded bg-muted/30">
                        <p className="text-sm font-medium">Jumping Jacks</p>
                        <p className="text-xs text-muted-foreground">30 seconds</p>
                      </div>
                      <div className="p-2 rounded bg-muted/30">
                        <p className="text-sm font-medium">Wall Push-ups</p>
                        <p className="text-xs text-muted-foreground">10 repetitions</p>
                      </div>
                      <div className="p-2 rounded bg-muted/30">
                        <p className="text-sm font-medium">Calf Raises</p>
                        <p className="text-xs text-muted-foreground">15 repetitions</p>
                      </div>
                      <Button className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Start Energy Boost
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Daily Wellness Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Wellness Tips for Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wellnessTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div key={index} className="p-4 rounded-lg bg-muted/30 border">
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${tip.color}`} />
                    <div>
                      <h4 className="font-medium text-sm">{tip.category}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{tip.tip}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};