import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChevronLeft, Upload, Users, Check, Briefcase, GraduationCap, Calendar } from 'lucide-react';

// Step definitions
const STEPS = [
  { id: 1, title: 'Profile Setup', description: 'Basic information' },
  { id: 2, title: 'Professional', description: 'Title & company' },
  { id: 3, title: 'Expertise', description: 'Skills & experience' },
  { id: 4, title: 'Services', description: 'Your offerings' },
  { id: 5, title: 'Availability', description: 'Weekly schedule' },
];

const EXPERTISE_FIELDS = [
  'Design', 'Product Management', 'Software Development', 'Data Science',
  'Marketing', 'Entrepreneurship', 'Career Guidance', 'JEE Preparation',
  'Finance', 'Leadership', 'HR & Recruiting', 'Content Creation',
];

const EXPERIENCE_LEVELS = [
  { value: 'junior', label: 'Junior (1-3 years)' },
  { value: 'mid', label: 'Mid-Level (3-5 years)' },
  { value: 'senior', label: 'Senior (5-10 years)' },
  { value: 'lead', label: 'Lead/Principal (10+ years)' },
  { value: 'executive', label: 'Executive/C-Level' },
];

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'Singapore', 'UAE', 'Netherlands', 'France',
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface OnboardingData {
  // Step 1
  avatar_url: string;
  country: string;
  // Step 2
  title: string;
  company: string;
  headline: string;
  // Step 3
  expertise: string[];
  experience_level: string;
  skills: string[];
  bio: string;
  // Step 4
  services: Array<{
    name: string;
    description: string;
    duration: number;
    price: number;
  }>;
  // Step 5
  availability: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
  }>;
}

export default function BecomeMentorPage() {
  const { user, profile, isMentor, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  
  const [data, setData] = useState<OnboardingData>({
    avatar_url: profile?.avatar_url || '',
    country: 'India',
    title: '',
    company: '',
    headline: '',
    expertise: [],
    experience_level: '',
    skills: [],
    bio: '',
    services: [
      { name: '1-on-1 Mentorship Call', description: 'Personal mentorship session', duration: 30, price: 500 },
    ],
    availability: DAY_NAMES.map((_, index) => ({
      day_of_week: index,
      start_time: '09:00',
      end_time: '17:00',
      is_available: index >= 1 && index <= 5, // Mon-Fri by default
    })),
  });

  useEffect(() => {
    if (isMentor) {
      navigate('/dashboard');
    }
  }, [isMentor, navigate]);

  useEffect(() => {
    if (!user) {
      navigate('/signup?redirect=/become-mentor');
    }
  }, [user, navigate]);

  const updateData = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleExpertise = (field: string) => {
    const current = data.expertise;
    if (current.includes(field)) {
      updateData('expertise', current.filter((f) => f !== field));
    } else if (current.length < 5) {
      updateData('expertise', [...current, field]);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !data.skills.includes(skillInput.trim())) {
      updateData('skills', [...data.skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    updateData('skills', data.skills.filter((s) => s !== skill));
  };

  const addService = () => {
    updateData('services', [
      ...data.services,
      { name: '', description: '', duration: 30, price: 500 },
    ]);
  };

  const updateService = (index: number, field: string, value: string | number) => {
    const updated = [...data.services];
    updated[index] = { ...updated[index], [field]: value };
    updateData('services', updated);
  };

  const removeService = (index: number) => {
    updateData('services', data.services.filter((_, i) => i !== index));
  };

  const toggleAvailability = (dayIndex: number) => {
    const updated = [...data.availability];
    updated[dayIndex] = { ...updated[dayIndex], is_available: !updated[dayIndex].is_available };
    updateData('availability', updated);
  };

  const updateAvailabilityTime = (dayIndex: number, field: 'start_time' | 'end_time', value: string) => {
    const updated = [...data.availability];
    updated[dayIndex] = { ...updated[dayIndex], [field]: value };
    updateData('availability', updated);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!data.country;
      case 2:
        return !!data.title && !!data.company && !!data.headline;
      case 3:
        return data.expertise.length > 0 && !!data.experience_level;
      case 4:
        return data.services.length > 0 && data.services.every((s) => s.name && s.price > 0);
      case 5:
        return data.availability.some((a) => a.is_available);
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Create mentor profile
      const { data: mentorProfile, error: mentorError } = await supabase
        .from('mentor_profiles')
        .insert({
          user_id: user.id,
          headline: data.headline,
          bio: data.bio,
          location: data.country,
          skills: data.skills,
          hourly_rate: data.services[0]?.price || 500,
          is_active: true,
        })
        .select()
        .single();

      if (mentorError) throw mentorError;

      // Add mentor role
      await supabase.from('user_roles').insert({
        user_id: user.id,
        role: 'mentor',
      });

      // Add experience
      if (data.title && data.company) {
        await supabase.from('experiences').insert({
          mentor_id: mentorProfile.id,
          company: data.company,
          role: data.title,
          start_date: new Date().toISOString().split('T')[0],
          is_current: true,
        });
      }

      // Add services
      if (data.services.length > 0) {
        await supabase.from('services').insert(
          data.services.map((s) => ({
            mentor_id: mentorProfile.id,
            name: s.name,
            description: s.description,
            duration: s.duration,
            price: s.price,
            is_active: true,
          }))
        );
      }

      // Add availability
      const availabilityToAdd = data.availability.filter((a) => a.is_available);
      if (availabilityToAdd.length > 0) {
        await supabase.from('availability').insert(
          availabilityToAdd.map((a) => ({
            mentor_id: mentorProfile.id,
            day_of_week: a.day_of_week,
            start_time: a.start_time,
            end_time: a.end_time,
            is_available: true,
          }))
        );
      }

      await refreshProfile();
      toast.success('Welcome to MenTOR! Your mentor profile is now live.');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating mentor profile:', error);
      toast.error(error.message || 'Failed to create mentor profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">M</span>
            </div>
            <span className="text-xl font-bold">MenTOR</span>
          </Link>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-muted">
        <Progress value={progress} className="h-1.5 rounded-none" />
      </div>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: Form Section */}
          <div className="lg:col-span-3">
            {/* Step Indicators */}
            <div className="mb-8 flex items-center gap-2">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex h-3 w-3 rounded-full transition-colors ${
                    currentStep === step.id
                      ? 'bg-primary'
                      : currentStep > step.id
                      ? 'bg-primary/50'
                      : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            {/* Step 1: Profile Setup */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold">
                    Welcome! You're about to set up your new profile.
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Let's start with some basic information about you.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label>Upload a clear profile photo (Optional)</Label>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <Button variant="link" className="h-auto p-0 text-primary">
                          Select a photo
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          Make sure the file is below 2mb
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">
                      Which country do you live in? <span className="text-destructive">*</span>
                    </Label>
                    <Select value={data.country} onValueChange={(v) => updateData('country', v)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Eg. United States, India, etc" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Professional */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold">
                    What do you do as a professional?
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Tell us about your current role and where you work.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title">
                      Your title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Eg. Product Designer, Software Engineer, etc."
                      className="mt-2"
                      value={data.title}
                      onChange={(e) => updateData('title', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">
                      Company/School <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="company"
                      placeholder="Eg. Apple, UCLA, etc."
                      className="mt-2"
                      value={data.company}
                      onChange={(e) => updateData('company', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="headline">
                      Professional headline <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="headline"
                      placeholder="Eg. Senior SDE at Google | Ex-Amazon | IIT Delhi"
                      className="mt-2"
                      value={data.headline}
                      onChange={(e) => updateData('headline', e.target.value)}
                    />
                    <p className="mt-1 text-sm text-muted-foreground">
                      This will be shown on your profile card
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Expertise */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold">
                    Awesome, what's your super power like?
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Select your areas of expertise and experience level.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label>
                      What is your field of work? (Max 5) <span className="text-destructive">*</span>
                    </Label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {EXPERTISE_FIELDS.map((field) => (
                        <Badge
                          key={field}
                          variant={data.expertise.includes(field) ? 'default' : 'outline'}
                          className={`cursor-pointer py-2 px-3 transition-colors ${
                            data.expertise.includes(field)
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:border-primary'
                          }`}
                          onClick={() => toggleExpertise(field)}
                        >
                          {data.expertise.includes(field) && (
                            <Check className="mr-1 h-3 w-3" />
                          )}
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="experience">
                      Level of experience? <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={data.experience_level}
                      onValueChange={(v) => updateData('experience_level', v)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Eg. Senior, Lead" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Skills</Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        placeholder="Add a skill (e.g., React, System Design)"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" onClick={addSkill} variant="secondary">
                        Add
                      </Button>
                    </div>
                    {data.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {data.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeSkill(skill)}
                          >
                            {skill} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bio">About you</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell mentees about yourself, your experience, and what you can help them with..."
                      className="mt-2 min-h-[120px]"
                      value={data.bio}
                      onChange={(e) => updateData('bio', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Services */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold">
                    Set up your services
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Define what kind of mentorship sessions you'll offer.
                  </p>
                </div>

                <div className="space-y-4">
                  {data.services.map((service, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Service {index + 1}</span>
                          {data.services.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeService(index)}
                              className="text-destructive"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label>Service name</Label>
                            <Input
                              className="mt-1"
                              placeholder="e.g., 1-on-1 Career Coaching"
                              value={service.name}
                              onChange={(e) => updateService(index, 'name', e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label>Duration (min)</Label>
                              <Select
                                value={service.duration.toString()}
                                onValueChange={(v) => updateService(index, 'duration', parseInt(v))}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="15">15 min</SelectItem>
                                  <SelectItem value="30">30 min</SelectItem>
                                  <SelectItem value="45">45 min</SelectItem>
                                  <SelectItem value="60">60 min</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Price (₹)</Label>
                              <Input
                                type="number"
                                className="mt-1"
                                value={service.price}
                                onChange={(e) => updateService(index, 'price', parseInt(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            className="mt-1"
                            placeholder="What will mentees get from this session?"
                            value={service.description}
                            onChange={(e) => updateService(index, 'description', e.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button variant="outline" onClick={addService} className="w-full">
                    + Add Another Service
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Availability */}
            {currentStep === 5 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold">
                    Set your weekly availability
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Choose when you're available for mentorship sessions.
                  </p>
                </div>

                <div className="space-y-3">
                  {data.availability.map((slot, index) => (
                    <Card
                      key={index}
                      className={`transition-colors ${
                        slot.is_available ? 'border-primary/50 bg-primary/5' : ''
                      }`}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <Button
                          variant={slot.is_available ? 'default' : 'outline'}
                          size="sm"
                          className="w-24"
                          onClick={() => toggleAvailability(index)}
                        >
                          {DAY_NAMES[index].slice(0, 3)}
                        </Button>
                        
                        {slot.is_available ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="time"
                              value={slot.start_time}
                              onChange={(e) => updateAvailabilityTime(index, 'start_time', e.target.value)}
                              className="w-32"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                              type="time"
                              value={slot.end_time}
                              onChange={(e) => updateAvailabilityTime(index, 'end_time', e.target.value)}
                              className="w-32"
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unavailable</span>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-10 flex items-center justify-between">
              {currentStep > 1 ? (
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep((s) => s - 1)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < STEPS.length ? (
                <Button
                  onClick={() => setCurrentStep((s) => s + 1)}
                  disabled={!canProceed()}
                  className="px-8"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="px-8"
                >
                  {isSubmitting ? 'Creating profile...' : 'Complete Setup'}
                </Button>
              )}
            </div>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              press "Enter" to continue
            </p>

            {/* Login Link */}
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>

          {/* Right: Live Preview */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-24">
              <Card className="overflow-hidden bg-gradient-to-b from-primary/20 to-background">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                      <AvatarImage src={data.avatar_url} />
                      <AvatarFallback className="bg-muted text-2xl">
                        {profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <h3 className="mt-4 text-xl font-bold">
                      {profile?.full_name || 'Your Name'}
                    </h3>
                    <p className="text-muted-foreground">
                      {data.title ? `${data.title}` : 'Your title'}
                      {data.company && ` at ${data.company}`}
                    </p>
                  </div>

                  <div className="mt-6 border-b">
                    <div className="flex gap-4 justify-center">
                      <Button variant="ghost" className="rounded-none border-b-2 border-primary">
                        Overview
                      </Button>
                      <Button variant="ghost" className="rounded-none text-muted-foreground">
                        My mentors
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {/* Skeleton lines */}
                    <div className="h-2 bg-muted rounded w-full" />
                    <div className="h-2 bg-muted rounded w-full" />
                    <div className="h-2 bg-muted rounded w-3/4" />
                    <div className="h-2 bg-muted rounded w-1/2" />
                    
                    <div className="flex gap-2 mt-4">
                      <div className="h-6 w-16 bg-muted rounded" />
                      <div className="h-6 w-16 bg-muted rounded" />
                    </div>

                    <div className="h-2 bg-muted rounded w-1/3 mt-4" />
                    <div className="h-2 bg-muted rounded w-2/3" />
                    
                    {data.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {data.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
