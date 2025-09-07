-- Create consultants table
CREATE TABLE public.consultants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  specializations TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{"English"}',
  bio TEXT,
  avatar_url TEXT,
  hourly_rate DECIMAL(10,2),
  experience_years INTEGER,
  qualifications TEXT[],
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consultant availability table
CREATE TABLE public.consultant_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultant_id UUID NOT NULL REFERENCES public.consultants(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES public.consultants(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  payment_amount DECIMAL(10,2),
  meeting_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(consultant_id, scheduled_at)
);

-- Enable Row Level Security
ALTER TABLE public.consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultant_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consultants (public read)
CREATE POLICY "Anyone can view consultants" 
ON public.consultants 
FOR SELECT 
USING (true);

-- RLS Policies for consultant availability (public read)
CREATE POLICY "Anyone can view consultant availability" 
ON public.consultant_availability 
FOR SELECT 
USING (true);

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_consultants_updated_at
BEFORE UPDATE ON public.consultants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample consultants
INSERT INTO public.consultants (name, title, specializations, languages, bio, hourly_rate, experience_years, qualifications) VALUES
('Dr. Sarah Johnson', 'Clinical Psychologist', '{"Anxiety", "Depression", "PTSD"}', '{"English", "Spanish"}', 'Specializing in cognitive behavioral therapy with over 10 years of experience helping clients overcome anxiety and depression.', 150.00, 12, '{"PhD in Clinical Psychology", "Licensed Clinical Psychologist", "CBT Certified"}'),
('Dr. Michael Chen', 'Licensed Therapist', '{"Relationship Counseling", "Family Therapy", "Communication"}', '{"English", "Mandarin"}', 'Expert in relationship dynamics and family systems therapy. Helping couples and families build stronger connections.', 120.00, 8, '{"MA in Marriage and Family Therapy", "Licensed Marriage and Family Therapist"}'),
('Dr. Emily Rodriguez', 'Trauma Specialist', '{"PTSD", "Trauma Recovery", "EMDR"}', '{"English", "Spanish", "Portuguese"}', 'Specialized in trauma-informed care and EMDR therapy. Helping survivors heal and reclaim their lives.', 160.00, 15, '{"PhD in Clinical Psychology", "EMDR Certified", "Trauma Specialist Certification"}'),
('Dr. James Wilson', 'Addiction Counselor', '{"Substance Abuse", "Addiction Recovery", "Behavioral Addictions"}', '{"English"}', 'Dedicated to helping individuals overcome addiction and build sustainable recovery through evidence-based treatments.', 140.00, 10, '{"MA in Addiction Counseling", "Licensed Addiction Counselor", "CADC Certification"}');

-- Insert sample availability (Monday to Friday, 9 AM to 5 PM)
INSERT INTO public.consultant_availability (consultant_id, day_of_week, start_time, end_time) 
SELECT 
  c.id,
  weekday,
  '09:00:00'::TIME,
  '17:00:00'::TIME
FROM public.consultants c
CROSS JOIN generate_series(1, 5) weekday; -- Monday to Friday