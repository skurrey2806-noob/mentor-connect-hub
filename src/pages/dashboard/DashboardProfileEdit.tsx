import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Edit2,
  Plus,
  Briefcase,
  GraduationCap,
  Award,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BasicDetailsModal } from '@/components/profile/BasicDetailsModal';
import { ExperienceModal } from '@/components/profile/ExperienceModal';
import { EducationModal } from '@/components/profile/EducationModal';
import { AchievementModal } from '@/components/profile/AchievementModal';
import type { Experience, Education, Achievement } from '@/types/database';

export default function DashboardProfileEdit() {
  const { user, profile } = useAuth();
  const [mentorProfile, setMentorProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [basicOpen, setBasicOpen] = useState(false);
  const [expOpen, setExpOpen] = useState(false);
  const [eduOpen, setEduOpen] = useState(false);
  const [achOpen, setAchOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: mp } = await supabase
        .from('mentor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!mp) return;
      setMentorProfile(mp);

      const [expRes, eduRes, achRes] = await Promise.all([
        supabase.from('experiences').select('*').eq('mentor_id', mp.id).order('start_date', { ascending: false }),
        supabase.from('education').select('*').eq('mentor_id', mp.id),
        supabase.from('achievements').select('*').eq('mentor_id', mp.id),
      ]);

      setExperiences((expRes.data || []) as Experience[]);
      setEducation((eduRes.data || []) as Education[]);
      setAchievements((achRes.data || []) as Achievement[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleOpenExpEdit = (exp: Experience) => {
    setEditingExp(exp);
    setExpOpen(true);
  };

  const handleOpenExpAdd = () => {
    setEditingExp(null);
    setExpOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!mentorProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No mentor profile found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Edit Profile</h1>

      {/* Basic Details Card */}
      <Card className="relative rounded-2xl border-border/50 shadow-soft">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
          onClick={() => setBasicOpen(true)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>

        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row">
            <Avatar className="h-28 w-28 rounded-2xl ring-4 ring-primary/20">
              <AvatarImage src={profile?.avatar_url || ''} className="object-cover" />
              <AvatarFallback className="rounded-2xl bg-primary text-primary-foreground text-3xl">
                {profile?.full_name?.charAt(0) || 'M'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
                <CheckCircle2 className="h-5 w-5 text-primary fill-primary/20" />
              </div>
              <p className="text-muted-foreground">{mentorProfile.headline}</p>
              {mentorProfile.location && (
                <p className="mt-1 flex items-center gap-1 text-sm text-primary">
                  <MapPin className="h-3 w-3" />
                  {mentorProfile.location}
                </p>
              )}
              {mentorProfile.skills && mentorProfile.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {mentorProfile.skills.map((skill: string) => (
                    <Badge key={skill} className="bg-primary/10 text-primary hover:bg-primary/20 border-0 rounded-full px-3">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Introduction */}
          {mentorProfile.bio && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Introduction</h3>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {mentorProfile.bio}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Experience */}
      <Card className="relative rounded-2xl border-border/50 shadow-soft">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
          onClick={handleOpenExpAdd}
        >
          <Plus className="h-4 w-4" />
        </Button>

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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-primary hover:bg-primary/10"
                        onClick={() => handleOpenExpEdit(exp)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
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
                          <span className="text-xs text-primary cursor-pointer hover:underline">
                            See all skills
                          </span>
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
            <p className="text-muted-foreground text-sm">No experience added yet. Click + to add.</p>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="relative rounded-2xl border-border/50 shadow-soft">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
          onClick={() => setEduOpen(true)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>

        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-primary" />
            Education & Qualification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {education.length > 0 ? (
            education.map((edu, idx) => (
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
                {idx < education.length - 1 && <Separator className="mt-4" />}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No education added yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="relative rounded-2xl border-border/50 shadow-soft">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
          onClick={() => setAchOpen(true)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>

        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-primary" />
            Achievement & Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length > 0 ? (
            <ul className="space-y-3">
              {achievements.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                  <span>
                    <span className="font-medium">{a.title}</span>
                    {a.description && <span className="text-muted-foreground"> | {a.description}</span>}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No achievements added yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <BasicDetailsModal
        open={basicOpen}
        onOpenChange={setBasicOpen}
        profile={profile}
        mentorProfile={mentorProfile}
        onSaved={fetchData}
      />

      <ExperienceModal
        open={expOpen}
        onOpenChange={setExpOpen}
        mentorId={mentorProfile.id}
        experience={editingExp}
        onSaved={fetchData}
      />

      <EducationModal
        open={eduOpen}
        onOpenChange={setEduOpen}
        mentorId={mentorProfile.id}
        educationList={education}
        onSaved={fetchData}
      />

      <AchievementModal
        open={achOpen}
        onOpenChange={setAchOpen}
        mentorId={mentorProfile.id}
        achievements={achievements}
        onSaved={fetchData}
      />
    </div>
  );
}
