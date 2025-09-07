import { useState, useEffect } from 'react';
import { format, addDays, startOfDay, addMinutes, isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { CalendarIcon, Clock, DollarSign, MapPin, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Consultant {
  id: string;
  name: string;
  title: string;
  specializations: string[];
  languages: string[];
  bio: string;
  avatar_url: string | null;
  hourly_rate: number;
  experience_years: number;
  qualifications: string[];
  anonymous_id: string;
}

interface BookingModalProps {
  consultant: Consultant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Availability {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export const BookingModal = ({ consultant, open, onOpenChange }: BookingModalProps) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'profile' | 'datetime' | 'confirm'>('profile');

  useEffect(() => {
    if (open) {
      fetchAvailability();
      setStep('profile');
      setSelectedDate(undefined);
      setSelectedTime('');
      setNotes('');
    }
  }, [open, consultant.id]);

  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots();
    }
  }, [selectedDate, availability]);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('consultant_availability')
        .select('day_of_week, start_time, end_time')
        .eq('consultant_id', consultant.id);

      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: "Error",
        description: "Failed to load availability. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateTimeSlots = async () => {
    if (!selectedDate) return;

    const dayOfWeek = selectedDate.getDay();
    const dayAvailability = availability.find(a => a.day_of_week === dayOfWeek);
    
    if (!dayAvailability) {
      setTimeSlots([]);
      return;
    }

    // Generate time slots for the day
    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = dayAvailability.start_time.split(':').map(Number);
    const [endHour, endMinute] = dayAvailability.end_time.split(':').map(Number);
    
    const startTime = new Date(selectedDate);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(selectedDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    // Fetch existing bookings for this date
    const { data: bookings } = await supabase
      .from('bookings')
      .select('scheduled_at')
      .eq('consultant_id', consultant.id)
      .gte('scheduled_at', startOfDay(selectedDate).toISOString())
      .lt('scheduled_at', startOfDay(addDays(selectedDate, 1)).toISOString())
      .in('status', ['pending', 'confirmed']);

    const bookedTimes = new Set(
      bookings?.map(b => format(new Date(b.scheduled_at), 'HH:mm')) || []
    );

    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      const timeString = format(currentTime, 'HH:mm');
      const isBooked = bookedTimes.has(timeString);
      const isPast = currentTime < new Date();
      
      slots.push({
        time: timeString,
        available: !isBooked && !isPast
      });
      
      currentTime = addMinutes(currentTime, 60); // 1-hour slots
    }

    setTimeSlots(slots);
  };

  const isDateAvailable = (date: Date) => {
    const dayOfWeek = date.getDay();
    const hasAvailability = availability.some(a => a.day_of_week === dayOfWeek);
    const isNotPast = date >= startOfDay(new Date());
    const isWithinTwoWeeks = date <= addDays(new Date(), 14);
    
    return hasAvailability && isNotPast && isWithinTwoWeeks;
  };

  const handleBooking = async () => {
    if (!user || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: {
          consultant_id: consultant.anonymous_id,
          scheduled_at: scheduledAt.toISOString(),
          notes: notes.trim() || null,
          duration_minutes: 60,
          payment_amount: consultant.hourly_rate
        }
      });

      if (error) throw error;

      toast({
        title: "Booking Confirmed!",
        description: "Your consultation has been scheduled. You'll receive a confirmation email shortly.",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderProfileStep = () => (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={consultant.avatar_url || ''} />
          <AvatarFallback>
            {consultant.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-xl font-semibold">{consultant.name}</h3>
          <p className="text-muted-foreground">{consultant.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm">{consultant.experience_years} years experience</span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm leading-relaxed">{consultant.bio}</p>
      </div>

      <div>
        <h4 className="font-medium mb-2">Specializations</h4>
        <div className="flex flex-wrap gap-2">
          {consultant.specializations.map((spec) => (
            <Badge key={spec} variant="secondary">{spec}</Badge>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Languages</h4>
        <p className="text-sm text-muted-foreground">{consultant.languages.join(', ')}</p>
      </div>

      <div>
        <h4 className="font-medium mb-2">Qualifications</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          {consultant.qualifications.map((qual, index) => (
            <li key={index}>• {qual}</li>
          ))}
        </ul>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold">${consultant.hourly_rate}/hour</span>
        </div>
        <Button onClick={() => setStep('datetime')}>
          Schedule Appointment
        </Button>
      </div>
    </div>
  );

  const renderDateTimeStep = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label className="text-base font-medium mb-3 block">Select Date</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => !isDateAvailable(date)}
            className={cn("rounded-md border pointer-events-auto")}
          />
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Available Times</Label>
          {selectedDate ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {timeSlots.length > 0 ? (
                timeSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    className="w-full justify-start"
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {slot.time}
                    {!slot.available && <span className="ml-auto text-xs">(Booked)</span>}
                  </Button>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No available times for this date</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-8 w-8 mx-auto mb-2" />
              <p>Please select a date first</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="notes" className="text-base font-medium">
          Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          placeholder="Any specific topics or concerns you'd like to discuss..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-2"
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('profile')}>
          Back
        </Button>
        <Button 
          onClick={() => setStep('confirm')} 
          disabled={!selectedDate || !selectedTime}
          className="flex-1"
        >
          Continue to Confirmation
        </Button>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="bg-muted rounded-lg p-4">
        <h4 className="font-medium mb-3">Booking Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Consultant:</span>
            <span className="font-medium">{consultant.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span className="font-medium">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span className="font-medium">{selectedTime}</span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span className="font-medium">60 minutes</span>
          </div>
          <Separator />
          <div className="flex justify-between text-base">
            <span className="font-medium">Total:</span>
            <span className="font-semibold">${consultant.hourly_rate}</span>
          </div>
        </div>
      </div>

      {notes && (
        <div>
          <h4 className="font-medium mb-2">Your Notes</h4>
          <p className="text-sm text-muted-foreground bg-muted rounded p-3">
            {notes}
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Video Session</p>
            <p className="text-blue-700">
              You'll receive a meeting link via email before your appointment.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('datetime')}>
          Back
        </Button>
        <Button 
          onClick={handleBooking} 
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Booking...' : 'Confirm Booking'}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'profile' && 'Consultant Profile'}
            {step === 'datetime' && 'Select Date & Time'}
            {step === 'confirm' && 'Confirm Booking'}
          </DialogTitle>
        </DialogHeader>

        {step === 'profile' && renderProfileStep()}
        {step === 'datetime' && renderDateTimeStep()}
        {step === 'confirm' && renderConfirmStep()}
      </DialogContent>
    </Dialog>
  );
};