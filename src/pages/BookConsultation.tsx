import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookingModal } from '@/components/BookingModal';
import { Search, Filter, Star, Clock, DollarSign, Globe, Award, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
  is_available: boolean;
  anonymous_id: string;
}

const BookConsultation = () => {
  const navigate = useNavigate();
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [filteredConsultants, setFilteredConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchConsultants();
  }, []);

  useEffect(() => {
    filterConsultants();
  }, [consultants, searchTerm, selectedSpecialization, selectedLanguage]);

  const fetchConsultants = async () => {
    try {
      const { data, error } = await supabase
        .from('consultants')
        .select('*')
        .eq('is_available', true)
        .order('experience_years', { ascending: false });

      if (error) throw error;
      
      // Transform consultants to anonymous format
      const anonymousConsultants = (data || []).map((consultant, index) => ({
        ...consultant,
        name: `Therapist ${String.fromCharCode(65 + index)}`, // A, B, C, etc.
        anonymous_id: consultant.id,
        bio: consultant.bio ? 'Experienced mental health professional dedicated to helping clients achieve their wellness goals.' : '',
        avatar_url: null, // Remove avatar for anonymity
      }));
      
      setConsultants(anonymousConsultants);
    } catch (error) {
      console.error('Error fetching consultants:', error);
      toast({
        title: "Error",
        description: "Failed to load consultants. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterConsultants = () => {
    let filtered = consultants;

    if (searchTerm) {
      filtered = filtered.filter(consultant =>
        consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultant.specializations.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(consultant =>
        consultant.specializations.includes(selectedSpecialization)
      );
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(consultant =>
        consultant.languages.includes(selectedLanguage)
      );
    }

    setFilteredConsultants(filtered);
  };

  const getAllSpecializations = () => {
    const specs = new Set<string>();
    consultants.forEach(consultant => {
      consultant.specializations.forEach(spec => specs.add(spec));
    });
    return Array.from(specs);
  };

  const getAllLanguages = () => {
    const langs = new Set<string>();
    consultants.forEach(consultant => {
      consultant.languages.forEach(lang => langs.add(lang));
    });
    return Array.from(langs);
  };

  const handleBookConsultant = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading consultants...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Book Anonymous Consultation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with our qualified mental health professionals. All consultations are completely anonymous 
            to protect your privacy while ensuring professional care.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-6 mb-8 border">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Filter Consultants</h3>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, title, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {getAllSpecializations().map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {getAllLanguages().map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredConsultants.length} of {consultants.length} consultants
          </p>
        </div>

        {/* Consultants Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredConsultants.map((consultant) => (
            <Card key={consultant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={consultant.avatar_url || ''} />
                    <AvatarFallback>
                      {consultant.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg leading-tight">{consultant.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{consultant.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm">{consultant.experience_years} years</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Bio */}
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {consultant.bio}
                </p>
                
                {/* Specializations */}
                <div>
                  <p className="text-sm font-medium mb-2">Specializations:</p>
                  <div className="flex flex-wrap gap-1">
                    {consultant.specializations.slice(0, 3).map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {consultant.specializations.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{consultant.specializations.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Languages */}
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-sm">{consultant.languages.join(', ')}</span>
                </div>
                
                {/* Qualifications */}
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-sm">{consultant.qualifications[0]}</span>
                  {consultant.qualifications.length > 1 && (
                    <span className="text-xs text-muted-foreground">
                      +{consultant.qualifications.length - 1} more
                    </span>
                  )}
                </div>
                
                {/* Price and Book Button */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-semibold">${consultant.hourly_rate}/hour</span>
                  </div>
                  <Button 
                    onClick={() => handleBookConsultant(consultant)}
                    className="text-sm"
                  >
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredConsultants.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No consultants found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedConsultant && (
        <BookingModal
          consultant={selectedConsultant}
          open={showBookingModal}
          onOpenChange={setShowBookingModal}
        />
      )}
    </div>
  );
};

export default BookConsultation;