import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, Zap, Clock, ArrowRight } from 'lucide-react';

const therapyModules = [
  {
    id: 1,
    title: 'Cognitive Behavioral Therapy',
    description: 'Learn to identify and change negative thought patterns',
    type: 'CBT',
    duration: '15-20 min',
    level: 'Beginner',
    icon: BookOpen,
    exercises: 12,
    color: 'bg-primary',
  },
  {
    id: 2,
    title: 'Dialectical Behavioral Therapy',
    description: 'Develop emotional regulation and mindfulness skills',
    type: 'DBT',
    duration: '10-15 min',
    level: 'Intermediate',
    icon: Target,
    exercises: 8,
    color: 'bg-success',
  },
  {
    id: 3,
    title: 'Mindfulness & Meditation',
    description: 'Practice present-moment awareness and stress reduction',
    type: 'Mindfulness',
    duration: '5-10 min',
    level: 'All Levels',
    icon: Zap,
    exercises: 15,
    color: 'bg-accent',
  },
];

export const TherapyModules = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {therapyModules.map((module) => {
        const Icon = module.icon;
        return (
          <Card key={module.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${module.color}/10`}>
                  <Icon className={`h-6 w-6 ${module.color.replace('bg-', 'text-')}`} />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {module.type}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-tight">{module.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {module.description}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {module.duration}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {module.exercises} exercises
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <Badge variant="outline" className="text-xs">
                  {module.level}
                </Badge>
                <Button 
                  variant="calm" 
                  size="sm"
                  className="group-hover:translate-x-1 transition-transform"
                >
                  Start Session
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};