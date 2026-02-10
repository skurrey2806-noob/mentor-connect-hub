import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const LOCATIONS = [
  'Mumbai, Maharashtra, India',
  'Delhi, India',
  'Bangalore, Karnataka, India',
  'Hyderabad, Telangana, India',
  'Chennai, Tamil Nadu, India',
  'Kolkata, West Bengal, India',
  'Pune, Maharashtra, India',
  'Ahmedabad, Gujarat, India',
  'Jaipur, Rajasthan, India',
  'Remote',
];

interface BasicDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: { full_name: string; avatar_url?: string | null } | null;
  mentorProfile: {
    id: string;
    headline: string;
    bio?: string | null;
    location?: string | null;
    skills: string[] | null;
  } | null;
  onSaved: () => void;
}

export function BasicDetailsModal({
  open,
  onOpenChange,
  profile,
  mentorProfile,
  onSaved,
}: BasicDetailsModalProps) {
  const { user, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [headline, setHeadline] = useState(mentorProfile?.headline || '');
  const [location, setLocation] = useState(mentorProfile?.location || '');
  const [skills, setSkills] = useState<string[]>(mentorProfile?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [bio, setBio] = useState(mentorProfile?.bio || '');
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size 100-500KB
    if (file.size < 100 * 1024 || file.size > 500 * 1024) {
      toast.error('Image must be between 100KB and 500KB');
      return;
    }

    // Validate 1:1 ratio
    const img = new Image();
    img.onload = () => {
      if (Math.abs(img.width - img.height) > 10) {
        toast.error('Image must be 1:1 ratio (square)');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    };
    img.src = URL.createObjectURL(file);
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async () => {
    if (!user || !mentorProfile) return;
    setIsSubmitting(true);

    try {
      let avatarUrl = profile?.avatar_url || null;

      // Upload avatar if changed
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(path);
        avatarUrl = urlData.publicUrl;
      }

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName, avatar_url: avatarUrl })
        .eq('user_id', user.id);
      if (profileError) throw profileError;

      // Update mentor_profiles table
      const { error: mentorError } = await supabase
        .from('mentor_profiles')
        .update({
          headline,
          bio,
          location,
          skills,
        })
        .eq('id', mentorProfile.id);
      if (mentorError) throw mentorError;

      await refreshProfile();
      toast.success('Basic details updated!');
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold underline underline-offset-4">
            Basic Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Write your name here"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="font-semibold">
                  One liner for Bio <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Ex Amazon | Senior SDE | Assistant Manager"
                  className="mt-1"
                />
                <p className="text-xs text-primary mt-1">
                  Keep this short and to the point
                </p>
              </div>
            </div>

            {/* Right column - photo */}
            <div>
              <Label className="font-semibold">Profile Photo</Label>
              <p className="text-xs text-primary mt-0.5">
                Image must be 1:1 ratio (200*200 Px), 100~500 KB.
              </p>
              <div
                className="mt-2 flex h-32 w-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-primary/50" />
                    <span className="text-xs text-muted-foreground mt-1 block">
                      Click to upload
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {avatarPreview && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-primary border-primary/30"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Update Image
                </Button>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <Label className="font-semibold">
              Location <span className="text-destructive">*</span>
            </Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select from drop down" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skills */}
          <div>
            <Label className="font-semibold">
              Skills <span className="text-destructive">*</span>
            </Label>
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Write Skill name and click enter to add"
              className="mt-1"
            />
            {skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="bg-primary/5 text-primary border-primary/20 rounded-full gap-1"
                  >
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Introduction */}
          <div>
            <Label className="font-semibold">
              Introduction <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write your introduction here"
              className="mt-1 min-h-[120px]"
            />
          </div>

          <div className="flex justify-center pt-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !fullName || !headline}
              className="rounded-full px-10"
              size="lg"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
