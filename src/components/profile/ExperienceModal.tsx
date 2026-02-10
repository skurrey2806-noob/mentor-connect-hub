import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Experience } from '@/types/database';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));
const EMPLOYMENT_TYPES = ['Full Time', 'Part Time', 'Contract', 'Freelance', 'Internship'];
const LOCATIONS = [
  'Remote', 'Mumbai, India', 'Delhi, India', 'Bangalore, India',
  'Hyderabad, India', 'Chennai, India', 'Pune, India', 'Kolkata, India',
];

interface ExperienceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorId: string;
  experience?: Experience | null;
  onSaved: () => void;
}

export function ExperienceModal({
  open,
  onOpenChange,
  mentorId,
  experience,
  onSaved,
}: ExperienceModalProps) {
  const isEdit = !!experience;

  const parseDate = (dateStr?: string) => {
    if (!dateStr) return { month: '', year: '' };
    const d = new Date(dateStr);
    return { month: MONTHS[d.getMonth()], year: String(d.getFullYear()) };
  };

  const startParsed = parseDate(experience?.start_date);
  const endParsed = parseDate(experience?.end_date || undefined);

  const [company, setCompany] = useState(experience?.company || '');
  const [role, setRole] = useState(experience?.role || '');
  const [employmentType, setEmploymentType] = useState((experience as any)?.employment_type || 'Full Time');
  const [location, setLocation] = useState((experience as any)?.location || '');
  const [isCurrent, setIsCurrent] = useState(experience?.is_current || false);
  const [startMonth, setStartMonth] = useState(startParsed.month);
  const [startYear, setStartYear] = useState(startParsed.year);
  const [endMonth, setEndMonth] = useState(endParsed.month);
  const [endYear, setEndYear] = useState(endParsed.year);
  const [skills, setSkills] = useState<string[]>(
    experience?.description ? experience.description.split(',').map((s) => s.trim()).filter(Boolean) : []
  );
  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const buildDate = (month: string, year: string) => {
    const m = MONTHS.indexOf(month);
    if (m === -1 || !year) return null;
    return `${year}-${String(m + 1).padStart(2, '0')}-01`;
  };

  const handleSubmit = async () => {
    const startDate = buildDate(startMonth, startYear);
    if (!company || !role || !startDate) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        mentor_id: mentorId,
        company,
        role,
        employment_type: employmentType,
        location,
        is_current: isCurrent,
        start_date: startDate,
        end_date: isCurrent ? null : buildDate(endMonth, endYear),
        description: skills.join(', '),
      };

      if (isEdit && experience) {
        const { error } = await supabase
          .from('experiences')
          .update(payload)
          .eq('id', experience.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('experiences').insert(payload);
        if (error) throw error;
      }

      toast.success(isEdit ? 'Experience updated!' : 'Experience added!');
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!experience) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('experiences').delete().eq('id', experience.id);
      if (error) throw error;
      toast.success('Experience deleted');
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold underline underline-offset-4">
            Professional Experience
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Company / organisation <span className="text-destructive">*</span></Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Write your name here" className="mt-1" />
            </div>
            <div>
              <Label className="font-semibold">Position Title <span className="text-destructive">*</span></Label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex: SDE II" className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Employment Type <span className="text-destructive">*</span></Label>
              <Select value={employmentType} onValueChange={setEmploymentType}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select from drop down" /></SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-semibold">Location <span className="text-destructive">*</span></Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select from drop down" /></SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="still-working" checked={isCurrent} onCheckedChange={(v) => setIsCurrent(!!v)} />
            <Label htmlFor="still-working" className="text-sm">Still working here</Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Start Date <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Select value={startMonth} onValueChange={setStartMonth}>
                  <SelectTrigger><SelectValue placeholder="Select Month" /></SelectTrigger>
                  <SelectContent>{MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={startYear} onValueChange={setStartYear}>
                  <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                  <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="font-semibold">End Date {!isCurrent && <span className="text-destructive">*</span>}</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Select value={endMonth} onValueChange={setEndMonth} disabled={isCurrent}>
                  <SelectTrigger><SelectValue placeholder="Select Month" /></SelectTrigger>
                  <SelectContent>{MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={endYear} onValueChange={setEndYear} disabled={isCurrent}>
                  <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                  <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Label className="font-semibold">Skills <span className="text-destructive">*</span></Label>
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              placeholder="Write Skill name and click enter to add"
              className="mt-1"
            />
            {skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.map((s) => (
                  <Badge key={s} variant="outline" className="bg-primary/5 text-primary border-primary/20 rounded-full gap-1">
                    {s}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSkills(skills.filter((x) => x !== s))} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-6 text-primary border-primary/30">
              Skip
            </Button>
            {isEdit && (
              <Button variant="outline" onClick={handleDelete} disabled={isSubmitting} className="rounded-full px-6 text-primary border-primary/30">
                Delete This Experience
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-full px-6" size="lg">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
