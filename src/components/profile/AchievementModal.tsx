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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Achievement } from '@/types/database';

interface AchievementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorId: string;
  achievements: Achievement[];
  onSaved: () => void;
}

export function AchievementModal({
  open,
  onOpenChange,
  mentorId,
  achievements,
  onSaved,
}: AchievementModalProps) {
  const [entries, setEntries] = useState<{ id?: string; title: string }[]>(
    achievements.length > 0
      ? achievements.map((a) => ({ id: a.id, title: a.title + (a.description ? ` | ${a.description}` : '') }))
      : [{ title: '' }]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateEntry = (idx: number, value: string) => {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, title: value } : e)));
  };

  const addMore = () => setEntries([...entries, { title: '' }]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Delete old ones
      const existingIds = entries.filter((e) => e.id).map((e) => e.id!);
      const toDelete = achievements.filter((a) => !existingIds.includes(a.id));
      for (const d of toDelete) {
        await supabase.from('achievements').delete().eq('id', d.id);
      }

      for (const entry of entries) {
        if (!entry.title.trim()) continue;

        const parts = entry.title.split('|').map((s) => s.trim());
        const title = parts[0];
        const description = parts.length > 1 ? parts.slice(1).join(' | ') : null;

        const payload: any = {
          mentor_id: mentorId,
          title,
          description,
        };

        if (entry.id) {
          const { error } = await supabase.from('achievements').update(payload).eq('id', entry.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('achievements').insert(payload);
          if (error) throw error;
        }
      }

      toast.success('Achievements updated!');
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold underline underline-offset-4">
            Achievement & Highlights
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {entries.map((entry, idx) => (
            <div key={idx}>
              <Label className="font-semibold">Achievements <span className="text-destructive">*</span></Label>
              <Input
                value={entry.title}
                onChange={(e) => updateEntry(idx, e.target.value)}
                placeholder="Write your achievement here"
                className="mt-1"
              />
            </div>
          ))}

          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-6 text-primary border-primary/30">
              Skip
            </Button>
            <Button variant="outline" onClick={addMore} className="rounded-full px-6 text-primary border-primary/30">
              Add More Achievement
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
