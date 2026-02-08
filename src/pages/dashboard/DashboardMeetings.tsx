import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Video, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { MentorFeedbackDialog } from '@/components/feedback/MentorFeedbackDialog';

interface Booking {
  id: string;
  user_id: string;
  scheduled_at: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  payout_status: string;
  meeting_link: string | null;
  notes: string | null;
  price: number;
  service: { name: string } | null;
  mentee_profile?: { full_name: string; avatar_url: string | null } | null;
}

export default function DashboardMeetings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [mentorProfileId, setMentorProfileId] = useState<string | null>(null);
  const [feedbackBooking, setFeedbackBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const { data: mentorProfile } = await supabase
        .from('mentor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!mentorProfile) return;
      setMentorProfileId(mentorProfile.id);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          scheduled_at,
          duration,
          status,
          payout_status,
          meeting_link,
          notes,
          price,
          service:services(name)
        `)
        .eq('mentor_id', mentorProfile.id)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      // Fetch mentee profiles
      const userIds = [...new Set((data || []).map((b: any) => b.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      const enriched = (data || []).map((b: any) => ({
        ...b,
        mentee_profile: profileMap.get(b.user_id) || null,
      }));

      // Check which completed bookings already have mentor reviews
      const completedIds = enriched
        .filter((b: any) => b.status === 'completed')
        .map((b: any) => b.id);

      if (completedIds.length > 0) {
        const { data: existingReviews } = await supabase
          .from('mentor_reviews')
          .select('booking_id')
          .in('booking_id', completedIds);

        const reviewedBookingIds = new Set((existingReviews || []).map((r: any) => r.booking_id));
        enriched.forEach((b: any) => {
          if (b.status === 'completed' && reviewedBookingIds.has(b.id)) {
            b.payout_status = 'released';
          } else if (b.status === 'completed' && !reviewedBookingIds.has(b.id)) {
            b.payout_status = 'pending_review';
          }
        });
      }

      setBookings(enriched as Booking[]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'completed') {
        updateData.payout_status = 'pending_review';
      }
      await supabase.from('bookings').update(updateData).eq('id', bookingId);
      toast.success(`Booking ${newStatus}`);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update booking');
    }
  };

  const pendingReviewCount = bookings.filter(
    (b) => b.status === 'completed' && b.payout_status === 'pending_review'
  ).length;

  const filteredBookings = bookings.filter((booking) => {
    const now = new Date();
    const bookingDate = new Date(booking.scheduled_at);
    switch (activeTab) {
      case 'upcoming':
        return bookingDate >= now && booking.status !== 'cancelled';
      case 'completed':
        return booking.status === 'completed';
      case 'cancelled':
        return booking.status === 'cancelled';
      default:
        return true;
    }
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      confirmed: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
      rescheduled: 'bg-purple-100 text-purple-700',
    };
    return styles[status] || 'bg-muted text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meetings</h1>
        <p className="text-muted-foreground">Manage your mentorship sessions</p>
      </div>

      {/* Pending Review Alert */}
      {pendingReviewCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-900">
              {pendingReviewCount} session{pendingReviewCount > 1 ? 's' : ''} awaiting your review
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Payment is held until you submit feedback. Go to the Completed tab to review.
            </p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed" className="relative">
            Completed
            {pendingReviewCount > 0 && (
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {pendingReviewCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No {activeTab} meetings found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className={booking.payout_status === 'pending_review' ? 'border-amber-300 bg-amber-50/30' : ''}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {booking.mentee_profile?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{booking.mentee_profile?.full_name || 'Mentee'}</p>
                          <p className="text-sm text-primary">{booking.service?.name || '1-on-1 Session'}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(booking.scheduled_at), 'MMM d, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {format(new Date(booking.scheduled_at), 'h:mm a')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Video className="h-4 w-4" />
                              {booking.duration} min
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusBadge(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                        {booking.payout_status === 'pending_review' && (
                          <Badge variant="destructive" className="text-xs">
                            Pending Review
                          </Badge>
                        )}
                        {booking.payout_status === 'released' && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            Payment Released
                          </Badge>
                        )}
                        <p className="font-semibold text-primary">₹{booking.price}</p>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-4 rounded-lg bg-muted/50 p-3">
                        <p className="text-sm text-muted-foreground">{booking.notes}</p>
                      </div>
                    )}

                    {booking.status === 'confirmed' && (
                      <div className="mt-4 flex gap-2">
                        <Button asChild className="flex-1">
                          <a href={booking.meeting_link || '#'} target="_blank" rel="noopener noreferrer">
                            <Video className="mr-2 h-4 w-4" />
                            Join Meeting
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleStatusUpdate(booking.id, 'completed')}
                        >
                          Mark Complete
                        </Button>
                      </div>
                    )}

                    {booking.status === 'pending' && (
                      <div className="mt-4 flex gap-2">
                        <Button className="flex-1" onClick={() => handleStatusUpdate(booking.id, 'confirmed')}>
                          Accept
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Reschedule
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                        >
                          Decline
                        </Button>
                      </div>
                    )}

                    {booking.status === 'completed' && booking.payout_status === 'pending_review' && (
                      <div className="mt-4 border-t pt-4">
                        <Button
                          className="w-full rounded-full"
                          onClick={() => setFeedbackBooking(booking)}
                        >
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Submit Review to Release Payment
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Mentor Feedback Dialog */}
      {feedbackBooking && mentorProfileId && (
        <MentorFeedbackDialog
          open={!!feedbackBooking}
          onOpenChange={(open) => !open && setFeedbackBooking(null)}
          bookingId={feedbackBooking.id}
          mentorProfileId={mentorProfileId}
          userId={feedbackBooking.user_id}
          menteeName={feedbackBooking.mentee_profile?.full_name || 'Mentee'}
          sessionPrice={feedbackBooking.price}
          onSubmitted={fetchBookings}
        />
      )}
    </div>
  );
}
