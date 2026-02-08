import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Star, Lock, Mail, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface UserFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  mentorId: string;
  mentorName: string;
  onSubmitted?: () => void;
}

export function UserFeedbackDialog({
  open,
  onOpenChange,
  bookingId,
  mentorId,
  mentorName,
  onSubmitted,
}: UserFeedbackDialogProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [publicReview, setPublicReview] = useState('');
  const [privateFeedback, setPrivateFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        booking_id: bookingId,
        mentor_id: mentorId,
        user_id: user.id,
        rating,
        comment: publicReview || null,
        private_feedback: privateFeedback || null,
      });

      if (error) throw error;

      toast.success('Thank you for your feedback!');
      onOpenChange(false);
      resetForm();
      onSubmitted?.();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setHoveredRating(0);
    setPublicReview('');
    setPrivateFeedback('');
  };

  const supportEmail = 'support@mentor-platform.com';
  const handleRaiseIssue = () => {
    const subject = encodeURIComponent(`Issue with session - Booking ${bookingId}`);
    const body = encodeURIComponent(
      `Hi Support,\n\nI'd like to report an issue with my recent session.\n\nBooking ID: ${bookingId}\nMentor: ${mentorName}\n\nPlease describe your issue below:\n\n`
    );
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">How was your session with {mentorName}?</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Public Star Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Rate your experience
            </Label>
            <p className="text-xs text-muted-foreground">This rating is public and contributes to the mentor's profile</p>
            <div className="flex gap-1 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-0.5 transition-transform hover:scale-110"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Public Review */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Write a public review</Label>
            <p className="text-xs text-muted-foreground">This will be displayed on the mentor's profile</p>
            <Textarea
              placeholder="Share your experience to help other mentees..."
              value={publicReview}
              onChange={(e) => setPublicReview(e.target.value)}
              rows={3}
              maxLength={1000}
            />
          </div>

          <Separator />

          {/* Private Feedback */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Private feedback to mentor
            </Label>
            <p className="text-xs text-muted-foreground">Only visible to the mentor — not displayed publicly</p>
            <Textarea
              placeholder="Share direct thoughts with the mentor privately..."
              value={privateFeedback}
              onChange={(e) => setPrivateFeedback(e.target.value)}
              rows={2}
              maxLength={1000}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="w-full rounded-full"
              size="lg"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={handleRaiseIssue}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Raise an Issue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
