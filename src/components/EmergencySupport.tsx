import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageCircle, Heart, Shield, Clock } from 'lucide-react';

const emergencyContacts = [
  {
    name: 'National Suicide Prevention Lifeline',
    number: '988',
    description: '24/7 crisis counseling and suicide prevention',
    type: 'Crisis',
    urgent: true,
  },
  {
    name: 'Crisis Text Line',
    number: 'Text HOME to 741741',
    description: 'Free, 24/7 support via text message',
    type: 'Text',
    urgent: true,
  },
  {
    name: 'Emergency Services',
    number: '911',
    description: 'For immediate medical or psychiatric emergencies',
    type: 'Emergency',
    urgent: true,
  },
  {
    name: 'Your Therapist',
    number: 'Dr. Johnson - (555) 123-4567',
    description: 'Your assigned mental health professional',
    type: 'Personal',
    urgent: false,
  },
];

export const EmergencySupport = () => {
  return (
    <Card className="border-destructive/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Shield className="h-5 w-5" />
          Emergency & Crisis Support
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          If you're having thoughts of self-harm or suicide, please reach out for help immediately.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {emergencyContacts.map((contact, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              contact.urgent
                ? 'border-destructive/30 bg-destructive/5'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-foreground">{contact.name}</h4>
                  <Badge 
                    variant={contact.urgent ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {contact.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {contact.description}
                </p>
                <p className="text-sm font-mono text-foreground">
                  {contact.number}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              {contact.type !== 'Text' && (
                <Button 
                  variant={contact.urgent ? "emergency" : "outline"} 
                  size="sm"
                  className="flex-1"
                >
                  <Phone className="h-3 w-3" />
                  Call Now
                </Button>
              )}
              <Button variant="outline" size="sm" className="flex-1">
                <MessageCircle className="h-3 w-3" />
                {contact.type === 'Text' ? 'Send Text' : 'Message'}
              </Button>
            </div>
          </div>
        ))}
        
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-primary mb-1">You are not alone</h4>
              <p className="text-sm text-foreground/80">
                Your feelings are valid, and help is available. These services are free, 
                confidential, and staffed by trained counselors.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Most crisis services are available 24/7</span>
        </div>
      </CardContent>
    </Card>
  );
};