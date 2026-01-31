import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Edit2,
  MoreVertical,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
  const navigate = useNavigate();
  const { user, isMentor } = useAuth();
  const [mentor, setMentor] = useState<MentorWithProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

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

      const mentorWithProfile = {
        ...mentorData,
        profile: profileData,
      } as MentorWithProfile;
      
      setMentor(mentorWithProfile);
      
      // Check if this is the user's own profile
      if (user && mentorData.user_id === user.id) {
        setIsOwnProfile(true);
      }

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
            <Card className="relative overflow-hidden">
              {isOwnProfile && (
                <div className="absolute top-4 right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="bg-primary/10 hover:bg-primary/20">
                        <Edit2 className="h-4 w-4 text-primary" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate('/dashboard/profile/edit')}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        View Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Profile
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 sm:flex-row">
                  <Avatar className="h-28 w-28 ring-4 ring-primary/20">
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
                        <p className="text-muted-foreground">
                          {mentor.headline}
                        </p>
                        {mentor.location && (
                          <p className="mt-1 flex items-center gap-1 text-sm text-primary">
                            <MapPin className="h-3 w-3" />
                            {mentor.location}
                          </p>
                        )}
                      </div>

                      {!isOwnProfile && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={handleShare}>
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {mentor.skills && mentor.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {mentor.skills.map((skill) => (
                          <Badge key={skill} className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
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
            <Card className="relative">
              {isOwnProfile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-primary"
                  onClick={() => navigate('/dashboard/profile/edit')}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
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
              <Card className="relative">
                {isOwnProfile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-primary"
                    onClick={() => navigate('/dashboard/profile/edit')}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Professional Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {experiences.map((exp, index) => (
                    <div key={exp.id} className="relative pl-4 border-l-2 border-primary/30">
                      <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-primary" />
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-semibold">{exp.role}</h4>
                          <p className="text-sm text-muted-foreground">
                            {exp.company} | {exp.is_current ? 'Full Time' : 'Previous'}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}</p>
                        </div>
                      </div>
                      {exp.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {education.length > 0 && (
              <Card className="relative">
                {isOwnProfile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-primary"
                    onClick={() => navigate('/dashboard/profile/edit')}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Education & Qualification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {education.map((edu, index) => (
                    <div key={edu.id}>
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-semibold">{edu.institution}</h4>
                          <p className="text-sm text-muted-foreground">
                            {edu.degree}
                            {edu.field_of_study && ` - ${edu.field_of_study}`}
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
              <Card className="relative">
                {isOwnProfile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-primary"
                    onClick={() => navigate('/dashboard/profile/edit')}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Achievement & Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {achievements.map((achievement) => (
                      <li key={achievement.id} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                        <div>
                          <span className="font-medium">{achievement.title}</span>
                          {achievement.description && (
                            <span className="text-muted-foreground"> | {achievement.description}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
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
            <Card className="sticky top-20 bg-gradient-to-b from-primary/5 to-background border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">1-On-1 Mentorship Call</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">₹{mentor.hourly_rate}</span>
                  <span className="text-muted-foreground">/Call</span>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span><strong>{mentor.total_sessions}</strong> sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span><strong>{mentor.average_rating.toFixed(1)}</strong> ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                  </div>
                </div>

                <Button asChild className="mt-6 w-full" size="lg">
                  <Link to={`/mentor/${mentorId}/book`}>
                    <Video className="mr-2 h-4 w-4" />
                    Book Call
                  </Link>
                </Button>
                
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Usually responded within 24 hours
                </p>

                {services.length > 0 && (
                  <Button variant="link" asChild className="mt-2 w-full text-primary">
                    <Link to={`/mentor/${mentorId}/services`}>
                      View all Services
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
