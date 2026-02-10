import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Star, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MentorFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  mentorProfileId: string;
  userId: string;
  menteeName: string;
  sessionPrice: number;
  onSubmitted?: () => void;
}

export function MentorFeedbackDialog({
  open,
  onOpenChange,
  bookingId,
  mentorProfileId,
  userId,
  menteeName,
  sessionPrice,
  onSubmitted,
}: MentorFeedbackDialogProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please add a comment about the session');
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert mentor review
      const { error: reviewError } = await supabase.from('mentor_reviews').insert({
        booking_id: bookingId,
        mentor_id: mentorProfileId,
        user_id: userId,
        rating,
        comment: comment.trim(),
      });

      if (reviewError) throw reviewError;

      // Update booking payout_status to released
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ payout_status: 'released' })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      // Credit mentor's wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', user.id)
        .single();

      if (wallet) {
        await Promise.all([
          supabase
            .from('wallets')
            .update({ balance: wallet.balance + sessionPrice })
            .eq('id', wallet.id),
          supabase.from('transactions').insert({
            wallet_id: wallet.id,
            type: 'credit' as const,
            amount: sessionPrice,
            description: `Session payment - ${menteeName}`,
            reference_id: bookingId,
          }),
        ]);
      }

      toast.success('Review submitted! Payment has been released to your wallet.');
      onOpenChange(false);
      resetForm();
      onSubmitted?.();
    } catch (error: any) {
      console.error('Error submitting mentor review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { /* prevent closing without submission */ }}>
      <DialogContent className="max-w-lg" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl">Session Review Required</DialogTitle>
            <Badge variant="destructive" className="text-xs">Required</Badge>
          </div>
          <DialogDescription>
            Submit your review to release the ₹{sessionPrice} payment to your wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            Payment is held in "Pending Review" until you complete this feedback. This step is mandatory.
          </p>
        </div>

        <div className="space-y-5 py-2">
          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              Rate {menteeName}
              <Badge variant="outline" className="text-xs font-normal">
                <Lock className="mr-1 h-3 w-3" />
                Internal only
              </Badge>
            </Label>
            <p className="text-xs text-muted-foreground">This rating is private and used for platform quality control</p>
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
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              Session Notes
              <Badge variant="outline" className="text-xs font-normal">
                <Lock className="mr-1 h-3 w-3" />
                Internal only
              </Badge>
            </Label>
            <p className="text-xs text-muted-foreground">Add notes about the session for internal reference</p>
            <Textarea
              placeholder="How was the session? Any observations about the mentee..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={1000}
              required
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || !comment.trim()}
            className="w-full rounded-full"
            size="lg"
          >
            {isSubmitting ? 'Submitting...' : `Submit`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
