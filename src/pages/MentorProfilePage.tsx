import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  GraduationCap,
  Award,
  Share2,
  Heart,
  Video,
  Check,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type {
  MentorWithProfile,
  Service,
  Experience,
  Education,
  Achievement,
  Review,
} from '@/types/database';
import { toast } from 'sonner';

export default function MentorProfilePage() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const [mentor, setMentor] = useState<MentorWithProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (mentorId) {
      fetchMentorData();
    }
  }, [mentorId]);

  const fetchMentorData = async () => {
    setIsLoading(true);
    try {
      // Fetch mentor profile
      const { data: mentorData, error: mentorError } = await supabase
        .from('mentor_profiles')
        .select('*')
        .eq('id', mentorId)
        .single();

      if (mentorError) throw mentorError;

      // Fetch profile separately
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', mentorData.user_id)
        .single();

      setMentor({
        ...mentorData,
        profile: profileData,
      } as MentorWithProfile);

      // Fetch related data in parallel
      const [servicesRes, experiencesRes, educationRes, achievementsRes, reviewsRes] =
        await Promise.all([
          supabase
            .from('services')
            .select('*')
            .eq('mentor_id', mentorId)
            .eq('is_active', true),
          supabase.from('experiences').select('*').eq('mentor_id', mentorId).order('start_date', { ascending: false }),
          supabase.from('education').select('*').eq('mentor_id', mentorId),
          supabase.from('achievements').select('*').eq('mentor_id', mentorId),
          supabase
            .from('reviews')
            .select(`
              *,
              user:profiles!reviews_user_id_fkey(full_name, avatar_url)
            `)
            .eq('mentor_id', mentorId)
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

      setServices((servicesRes.data || []) as Service[]);
      setExperiences((experiencesRes.data || []) as Experience[]);
      setEducation((educationRes.data || []) as Education[]);
      setAchievements((achievementsRes.data || []) as Achievement[]);
      setReviews(reviewsRes.data || []);
    } catch (error) {
      console.error('Error fetching mentor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${mentor?.profile?.full_name} - MenTOR`,
        text: `Check out ${mentor?.profile?.full_name} on MenTOR!`,
        url: window.location.href,
      });
    } catch {
      // Fallback to copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-80 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!mentor) {
    return (
      <PublicLayout>
        <div className="container flex flex-col items-center justify-center py-20">
          <h1 className="text-2xl font-bold">Mentor not found</h1>
          <p className="mt-2 text-muted-foreground">
            The mentor you're looking for doesn't exist.
          </p>
          <Button asChild className="mt-6">
            <Link to="/browse">Browse Mentors</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const currentRole = experiences.find((e) => e.is_current);

  return (
    <PublicLayout>
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 sm:flex-row">
                  <Avatar className="h-28 w-28 ring-4 ring-secondary">
                    <AvatarImage
                      src={mentor.profile?.avatar_url || ''}
                      alt={mentor.profile?.full_name}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                      {mentor.profile?.full_name?.charAt(0) || 'M'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold">
                          {mentor.profile?.full_name}
                        </h1>
                        <p className="text-lg text-muted-foreground">
                          {mentor.headline}
                        </p>
                        {currentRole && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {currentRole.role} at {currentRole.company}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={handleShare}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {mentor.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {mentor.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {mentor.average_rating.toFixed(1)} ({reviews.length} reviews)
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {mentor.total_sessions} sessions completed
                      </span>
                    </div>

                    {/* Skills */}
                    {mentor.skills && mentor.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {mentor.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle>Introduction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {mentor.bio ||
                    'This mentor hasn\'t added an introduction yet.'}
                </p>
              </CardContent>
            </Card>

            {/* Experience */}
            {experiences.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Professional Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {experiences.map((exp, index) => (
                    <div key={exp.id}>
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-semibold">{exp.role}</h4>
                          <p className="text-sm text-muted-foreground">
                            {exp.company}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {new Date(exp.start_date).getFullYear()} -{' '}
                          {exp.is_current
                            ? 'Present'
                            : exp.end_date
                            ? new Date(exp.end_date).getFullYear()
                            : 'Present'}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {exp.description}
                        </p>
                      )}
                      {index < experiences.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {education.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {education.map((edu, index) => (
                    <div key={edu.id}>
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-semibold">{edu.degree}</h4>
                          <p className="text-sm text-muted-foreground">
                            {edu.institution}
                            {edu.field_of_study && ` • ${edu.field_of_study}`}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {edu.start_year} - {edu.end_year || 'Present'}
                        </div>
                      </div>
                      {index < education.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">{achievement.title}</p>
                        {achievement.description && (
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.map((review: any, index: number) => (
                    <div key={review.id}>
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.user?.avatar_url || ''} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {review.user?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">
                              {review.user?.full_name || 'Anonymous'}
                            </p>
                            <div className="flex gap-0.5">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-3 w-3 fill-amber-400 text-amber-400"
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                      {index < reviews.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Book Card */}
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    ₹{mentor.hourly_rate}
                  </div>
                  <p className="text-sm text-muted-foreground">per session</p>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sessions</span>
                    <span className="font-medium">{mentor.total_sessions}+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {mentor.average_rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Response</span>
                    <span className="font-medium">Within 24hrs</span>
                  </div>
                </div>

                <Button asChild className="mt-6 w-full" size="lg">
                  <Link to={`/mentor/${mentorId}/book`}>
                    <Video className="mr-2 h-4 w-4" />
                    Book 1-on-1 Call
                  </Link>
                </Button>

                {services.length > 0 && (
                  <Button
                    variant="outline"
                    asChild
                    className="mt-3 w-full"
                    size="lg"
                  >
                    <Link to={`/mentor/${mentorId}/services`}>
                      View All Services ({services.length})
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Services Preview */}
            {services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Services Offered</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {services.slice(0, 3).map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {service.duration} mins
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          ₹{service.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
