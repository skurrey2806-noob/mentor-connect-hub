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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Education } from '@/types/database';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const YEARS = Array.from({ length: 40 }, (_, i) => String(new Date().getFullYear() - i + 5));
const LOCATIONS = [
  'Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Hyderabad, India',
  'Chennai, India', 'Pune, India', 'Kolkata, India', 'Dhanbad, India', 'Remote',
];

interface EducationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorId: string;
  educationList: Education[];
  onSaved: () => void;
}

interface EducationEntry {
  id?: string;
  institution: string;
  degree: string;
  field_of_study: string;
  location: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
}

function emptyEntry(): EducationEntry {
  return { institution: '', degree: '', field_of_study: '', location: '', startMonth: '', startYear: '', endMonth: '', endYear: '' };
}

function fromEducation(edu: Education): EducationEntry {
  return {
    id: edu.id,
    institution: edu.institution,
    degree: edu.degree,
    field_of_study: edu.field_of_study || '',
    location: (edu as any).location || '',
    startMonth: edu.start_year ? '' : '',
    startYear: edu.start_year ? String(edu.start_year) : '',
    endMonth: '',
    endYear: edu.end_year ? String(edu.end_year) : '',
  };
}

export function EducationModal({
  open,
  onOpenChange,
  mentorId,
  educationList,
  onSaved,
}: EducationModalProps) {
  const [entries, setEntries] = useState<EducationEntry[]>(
    educationList.length > 0 ? educationList.map(fromEducation) : [emptyEntry()]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateEntry = (index: number, field: keyof EducationEntry, value: string) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
  };

  const addMore = () => setEntries([...entries, emptyEntry()]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Delete existing entries not in the new set
      const existingIds = entries.filter((e) => e.id).map((e) => e.id!);
      const toDelete = educationList.filter((e) => !existingIds.includes(e.id));
      for (const d of toDelete) {
        await supabase.from('education').delete().eq('id', d.id);
      }

      for (const entry of entries) {
        if (!entry.institution || !entry.degree) continue;

        const payload: any = {
          mentor_id: mentorId,
          institution: entry.institution,
          degree: entry.degree,
          field_of_study: entry.field_of_study || null,
          location: entry.location || null,
          start_year: entry.startYear ? parseInt(entry.startYear) : null,
          end_year: entry.endYear ? parseInt(entry.endYear) : null,
        };

        if (entry.id) {
          const { error } = await supabase.from('education').update(payload).eq('id', entry.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('education').insert(payload);
          if (error) throw error;
        }
      }

      toast.success('Education updated!');
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
            Education & Qualification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {entries.map((entry, idx) => (
            <div key={idx} className="space-y-4">
              {idx > 0 && <hr className="border-border" />}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">University/ School <span className="text-destructive">*</span></Label>
                  <Input value={entry.institution} onChange={(e) => updateEntry(idx, 'institution', e.target.value)} placeholder="Write your name here" className="mt-1" />
                </div>
                <div>
                  <Label className="font-semibold">Major Study <span className="text-destructive">*</span></Label>
                  <Input value={entry.degree} onChange={(e) => updateEntry(idx, 'degree', e.target.value)} placeholder="Ex: B Tech" className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Course</Label>
                  <Input value={entry.field_of_study} onChange={(e) => updateEntry(idx, 'field_of_study', e.target.value)} placeholder="Ex: Electronics & Communication engineering" className="mt-1" />
                </div>
                <div>
                  <Label className="font-semibold">Location <span className="text-destructive">*</span></Label>
                  <Select value={entry.location} onValueChange={(v) => updateEntry(idx, 'location', v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select from drop down" /></SelectTrigger>
                    <SelectContent>{LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Start Date <span className="text-destructive">*</span></Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Select value={entry.startMonth} onValueChange={(v) => updateEntry(idx, 'startMonth', v)}>
                      <SelectTrigger><SelectValue placeholder="Select Month" /></SelectTrigger>
                      <SelectContent>{MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={entry.startYear} onValueChange={(v) => updateEntry(idx, 'startYear', v)}>
                      <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                      <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="font-semibold">End / Expected Date <span className="text-destructive">*</span></Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Select value={entry.endMonth} onValueChange={(v) => updateEntry(idx, 'endMonth', v)}>
                      <SelectTrigger><SelectValue placeholder="Select Month" /></SelectTrigger>
                      <SelectContent>{MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={entry.endYear} onValueChange={(v) => updateEntry(idx, 'endYear', v)}>
                      <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                      <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-6 text-primary border-primary/30">
              Skip
            </Button>
            <Button variant="outline" onClick={addMore} className="rounded-full px-6 text-primary border-primary/30">
              Add More Education
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-full px-6" size="lg">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
