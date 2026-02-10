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
  Star,
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  Award,
  Share2,
  Heart,
  Video,
  Edit2,
  LayoutDashboard,
  Users,
  CheckCircle2,
  Plus,
  UserPlus,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BasicDetailsModal } from '@/components/profile/BasicDetailsModal';
import { ExperienceModal } from '@/components/profile/ExperienceModal';
import { EducationModal } from '@/components/profile/EducationModal';
import { AchievementModal } from '@/components/profile/AchievementModal';
import type {
  MentorWithProfile,
  Service,
  Experience,
  Education,
  Achievement,
} from '@/types/database';
import { toast } from 'sonner';

export default function MentorProfilePage() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const { user, isMentor, profile: authProfile } = useAuth();
  const [mentor, setMentor] = useState<MentorWithProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [userMentorId, setUserMentorId] = useState<string | null>(null);

  // Modal states
  const [basicOpen, setBasicOpen] = useState(false);
  const [expOpen, setExpOpen] = useState(false);
  const [eduOpen, setEduOpen] = useState(false);
  const [achOpen, setAchOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);

  useEffect(() => {
    if (mentorId) {
      fetchMentorData();
    }
  }, [mentorId, user]);

  useEffect(() => {
    const checkUserMentorProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('mentor_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) {
          setUserMentorId(data.id);
        }
      }
    };
    checkUserMentorProfile();
  }, [user]);

  const fetchMentorData = async () => {
    setIsLoading(true);
    try {
      const { data: mentorData, error: mentorError } = await supabase
        .from('mentor_profiles')
        .select('*')
        .eq('id', mentorId)
        .single();

      if (mentorError) throw mentorError;

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
      
      if (user && mentorData.user_id === user.id) {
        setIsOwnProfile(true);
      } else {
        setIsOwnProfile(false);
      }

      const [servicesRes, experiencesRes, educationRes, achievementsRes, reviewsRes] =
        await Promise.all([
          supabase.from('services').select('*').eq('mentor_id', mentorId).eq('is_active', true),
          supabase.from('experiences').select('*').eq('mentor_id', mentorId).order('start_date', { ascending: false }),
          supabase.from('education').select('*').eq('mentor_id', mentorId),
          supabase.from('achievements').select('*').eq('mentor_id', mentorId),
          supabase
            .from('reviews')
            .select(`*, user:profiles!reviews_user_id_fkey(full_name, avatar_url)`)
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
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const canEdit = isOwnProfile && isMentor;
  const showBookingPanel = !isOwnProfile;
  const showRegisterCTA = isOwnProfile && !isMentor;

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
            <div>
              <Skeleton className="h-80 w-full rounded-2xl" />
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
          <p className="mt-2 text-muted-foreground">The mentor you're looking for doesn't exist.</p>
          <Button asChild className="mt-6">
            <Link to="/browse">Browse Mentors</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <Card className="relative overflow-hidden rounded-2xl border-border/50 shadow-soft">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                  onClick={() => setBasicOpen(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 sm:flex-row">
                  <Avatar className="h-28 w-28 rounded-2xl ring-4 ring-primary/20">
                    <AvatarImage src={mentor.profile?.avatar_url || ''} alt={mentor.profile?.full_name} className="object-cover" />
                    <AvatarFallback className="rounded-2xl bg-primary text-primary-foreground text-3xl">
                      {mentor.profile?.full_name?.charAt(0) || 'M'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h1 className="text-2xl font-bold">{mentor.profile?.full_name}</h1>
                          <CheckCircle2 className="h-5 w-5 text-primary fill-primary/20" />
                        </div>
                        <p className="text-muted-foreground">{mentor.headline}</p>
                        {mentor.location && (
                          <p className="mt-1 flex items-center gap-1 text-sm text-primary">
                            <MapPin className="h-3 w-3" />
                            {mentor.location}
                          </p>
                        )}
                      </div>

                      {!isOwnProfile && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={handleShare} className="rounded-full">
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="rounded-full">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {mentor.skills && mentor.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {mentor.skills.map((skill) => (
                          <Badge key={skill} className="bg-primary/10 text-primary hover:bg-primary/20 border-0 rounded-full px-3">
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
            <Card className="relative rounded-2xl border-border/50 shadow-soft">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                  onClick={() => setBasicOpen(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Introduction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {mentor.bio || "This mentor hasn't added an introduction yet."}
                </p>
              </CardContent>
            </Card>

            {/* Professional Experience */}
            <Card className="relative rounded-2xl border-border/50 shadow-soft">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                  onClick={() => { setEditingExp(null); setExpOpen(true); }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Professional Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {experiences.length > 0 ? (
                  experiences.map((exp) => (
                    <div key={exp.id} className="relative pl-6">
                      <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary" />
                      <div className="absolute left-1.5 top-4 bottom-0 w-0.5 bg-primary/20" />
                      
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{exp.role}</h4>
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-primary hover:bg-primary/10"
                                onClick={() => { setEditingExp(exp); setExpOpen(true); }}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {exp.company} | {(exp as any).employment_type || 'Full Time'}
                          </p>
                          {exp.description && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {exp.description.split(',').slice(0, 3).map((skill, i) => (
                                <Badge key={i} variant="outline" className="bg-primary/5 text-primary border-primary/20 rounded-full text-xs">
                                  {skill.trim()}
                                </Badge>
                              ))}
                              {exp.description.split(',').length > 3 && (
                                <span className="text-xs text-primary cursor-pointer hover:underline">See all skills</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground ml-4">
                          <p>
                            {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                            {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                          </p>
                          <p className="text-xs">{(exp as any).location || 'Remote'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No experience added yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Education & Qualification */}
            <Card className="relative rounded-2xl border-border/50 shadow-soft">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                  onClick={() => setEduOpen(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Education & Qualification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {education.length > 0 ? (
                  education.map((edu, index) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{edu.institution}</h4>
                          <p className="text-sm text-muted-foreground">
                            {edu.degree}{edu.field_of_study && ` - ${edu.field_of_study}`}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{edu.start_year}-{edu.end_year || 'Present'}</p>
                          <p className="text-xs">{(edu as any).location || ''}</p>
                        </div>
                      </div>
                      {index < education.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No education added yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Achievement & Highlights */}
            <Card className="relative rounded-2xl border-border/50 shadow-soft">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                  onClick={() => setAchOpen(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5 text-primary" />
                  Achievement & Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.length > 0 ? (
                  <ul className="space-y-3">
                    {achievements.map((achievement) => (
                      <li key={achievement.id} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                        <div>
                          <span className="font-medium">{achievement.title}</span>
                          {achievement.description && (
                            <span className="text-muted-foreground"> | {achievement.description}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No achievements added yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {showBookingPanel && (
              <Card className="sticky top-20 rounded-2xl border-primary/20 bg-gradient-to-b from-primary/5 to-background shadow-soft">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg">1-On-1 Mentorship Call</h3>
                  <div className="flex items-baseline gap-1 mt-2">
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
                      <span><strong>{Number(mentor.average_rating).toFixed(1)}</strong> ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                    </div>
                  </div>
                  <Button asChild className="mt-6 w-full rounded-full" size="lg">
                    <Link to={`/mentor/${mentorId}/book`}>
                      <Video className="mr-2 h-4 w-4" />
                      Book Call
                    </Link>
                  </Button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">Usually responded within 24 hours</p>
                  {services.length > 0 && (
                    <Button variant="link" asChild className="mt-2 w-full text-primary">
                      <Link to={`/mentor/${mentorId}/book`}>View all Services</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {showRegisterCTA && (
              <Card className="sticky top-20 rounded-2xl border-primary/30 bg-gradient-to-b from-primary/10 to-primary/5 shadow-soft">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                    <UserPlus className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Become a Mentor</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Share your expertise, help others grow, and earn by offering 1-on-1 mentorship sessions.
                  </p>
                  <Button asChild className="mt-6 w-full rounded-full" size="lg">
                    <Link to="/become-mentor">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Register as Mentor
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {canEdit && (
              <Card className="sticky top-20 rounded-2xl border-primary/20 bg-gradient-to-b from-primary/5 to-background shadow-soft">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start rounded-full" onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      View Dashboard
                    </Button>
                    <Button variant="outline" className="w-full justify-start rounded-full" onClick={() => navigate('/dashboard/services')}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      Manage Services
                    </Button>
                    <Button variant="outline" className="w-full justify-start rounded-full" onClick={handleShare}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Profile
                    </Button>
                  </div>
                  <div className="mt-6 pt-4 border-t space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Sessions</span>
                      <span className="font-semibold">{mentor.total_sessions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Average Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{Number(mentor.average_rating).toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Hourly Rate</span>
                      <span className="font-semibold text-primary">₹{mentor.hourly_rate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {reviews.length > 0 && (
              <Card className="rounded-2xl border-border/50 shadow-soft bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.slice(0, 2).map((review: any) => (
                    <div key={review.id} className="rounded-xl bg-background p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.user?.avatar_url || ''} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {review.user?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{review.user?.full_name || 'Anonymous'}</p>
                              <p className="text-xs text-muted-foreground">Mentee</p>
                            </div>
                            <div className="flex gap-0.5">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {reviews.length > 2 && (
                    <Button variant="link" className="w-full text-primary">
                      View all {reviews.length} reviews
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modals - only rendered when canEdit */}
      {canEdit && mentor && (
        <>
          <BasicDetailsModal
            open={basicOpen}
            onOpenChange={setBasicOpen}
            profile={mentor.profile}
            mentorProfile={mentor}
            onSaved={fetchMentorData}
          />
          <ExperienceModal
            open={expOpen}
            onOpenChange={setExpOpen}
            mentorId={mentor.id}
            experience={editingExp}
            onSaved={fetchMentorData}
          />
          <EducationModal
            open={eduOpen}
            onOpenChange={setEduOpen}
            mentorId={mentor.id}
            educationList={education}
            onSaved={fetchMentorData}
          />
          <AchievementModal
            open={achOpen}
            onOpenChange={setAchOpen}
            mentorId={mentor.id}
            achievements={achievements}
            onSaved={fetchMentorData}
          />
        </>
      )}
    </PublicLayout>
  );
}
