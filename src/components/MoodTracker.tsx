import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smile, Meh, Frown, Heart, Brain } from 'lucide-react';

const moodOptions = [
  { icon: Smile, label: 'Great', value: 5, color: 'text-success' },
  { icon: Smile, label: 'Good', value: 4, color: 'text-primary' },
  { icon: Meh, label: 'Okay', value: 3, color: 'text-warning' },
  { icon: Frown, label: 'Low', value: 2, color: 'text-destructive' },
  { icon: Frown, label: 'Very Low', value: 1, color: 'text-destructive' },
];

export const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');

  const handleMoodSelect = (value: number) => {
    setSelectedMood(value);
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-primary">
          <Brain className="h-6 w-6" />
          How are you feeling today?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-5 gap-3">
          {moodOptions.map((mood) => {
            const Icon = mood.icon;
            return (
              <button
                key={mood.value}
                onClick={() => handleMoodSelect(mood.value)}
                className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                  selectedMood === mood.value
                    ? 'border-primary bg-primary/10 shadow-soft'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon className={`h-8 w-8 mx-auto mb-2 ${mood.color}`} />
                <p className="text-sm font-medium text-foreground">{mood.label}</p>
              </button>
            );
          })}
        </div>
        
        {selectedMood && (
          <div className="space-y-4 animate-in slide-in-from-bottom duration-300">
            <div>
              <label htmlFor="mood-note" className="block text-sm font-medium text-foreground mb-2">
                Tell us more about your day (optional)
              </label>
              <textarea
                id="mood-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's on your mind today?"
                className="w-full p-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
              />
            </div>
            <Button variant="therapy" className="w-full">
              <Heart className="h-4 w-4" />
              Save Mood Entry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};