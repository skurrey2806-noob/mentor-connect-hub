import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  Clock,
  Video,
  Star,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import type { BookingWithDetails } from '@/types/database';

export default function UserBookingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchBookings();
    }
  }, [user, authLoading]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user!.id)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      // Fetch mentor profiles and services for each booking
      const mentorIds = [...new Set((bookingsData || []).map((b) => b.mentor_id))];
      const serviceIds = [...new Set((bookingsData || []).filter((b) => b.service_id).map((b) => b.service_id))];

      const [mentorsRes, servicesRes] = await Promise.all([
        supabase.from('mentor_profiles').select('*').in('id', mentorIds),
        serviceIds.length > 0
          ? supabase.from('services').select('*').in('id', serviceIds)
          : Promise.resolve({ data: [] }),
      ]);

      // Get profiles for mentors
      const mentorUserIds = (mentorsRes.data || []).map((m) => m.user_id);
      const profilesRes = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', mentorUserIds);

      const mentorsMap = new Map((mentorsRes.data || []).map((m) => [m.id, m]));
      const profilesMap = new Map((profilesRes.data || []).map((p) => [p.user_id, p]));
      const servicesMap = new Map((servicesRes.data || []).map((s) => [s.id, s]));

      // Combine data
      const enrichedBookings = (bookingsData || []).map((booking) => {
        const mentor = mentorsMap.get(booking.mentor_id);
        const profile = mentor ? profilesMap.get(mentor.user_id) : null;
        const service = booking.service_id ? servicesMap.get(booking.service_id) : null;
        return {
          ...booking,
          mentor: mentor ? { ...mentor, profile } : null,
          service,
        };
      });

      setBookings(enrichedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-mentor-success text-white';
      case 'pending':
        return 'bg-mentor-warning text-white';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted';
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const now = new Date();
    const scheduledAt = new Date(booking.scheduled_at);

    switch (activeTab) {
      case 'upcoming':
        return (
          scheduledAt > now &&
          ['pending', 'confirmed'].includes(booking.status)
        );
      case 'past':
        return scheduledAt < now || booking.status === 'completed';
      case 'cancelled':
        return booking.status === 'cancelled';
      default:
        return true;
    }
  });

  if (authLoading || isLoading) {
    return (
      <PublicLayout>
        <div className="container max-w-4xl py-8">
          <Skeleton className="mb-8 h-10 w-48" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container max-w-4xl py-8">
        <h1 className="mb-8 text-3xl font-bold">My Bookings</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredBookings.length > 0 ? (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Mentor Info */}
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14">
                            <AvatarImage
                              src={booking.mentor?.profile?.avatar_url || ''}
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {booking.mentor?.profile?.full_name?.charAt(0) || 'M'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              to={`/mentor/${booking.mentor_id}`}
                              className="font-semibold hover:text-primary"
                            >
                              {booking.mentor?.profile?.full_name || 'Mentor'}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {booking.service?.name || 'Session'}
                            </p>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div className="text-left sm:text-right">
                          <div className="flex items-center gap-2 text-sm sm:justify-end">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(booking.scheduled_at), 'MMM d, yyyy')}
                          </div>
                          <div className="flex items-center gap-2 text-sm sm:justify-end">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(booking.scheduled_at), 'h:mm a')}
                          </div>
                          <p className="mt-1 text-sm font-semibold text-primary">
                            ₹{booking.price}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      {booking.status === 'confirmed' && booking.meeting_link && (
                        <div className="mt-4 border-t pt-4">
                          <Button asChild>
                            <a
                              href={booking.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Video className="mr-2 h-4 w-4" />
                              Join Meeting
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      )}

                      {booking.status === 'completed' && !booking.review && (
                        <div className="mt-4 border-t pt-4">
                          <Button variant="outline" asChild>
                            <Link to={`/review/${booking.id}`}>
                              <Star className="mr-2 h-4 w-4" />
                              Leave a Review
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium">No {activeTab} bookings</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {activeTab === 'upcoming'
                      ? 'Book a session with a mentor to get started'
                      : 'Your bookings will appear here'}
                  </p>
                  {activeTab === 'upcoming' && (
                    <Button asChild className="mt-4">
                      <Link to="/browse">Browse Mentors</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PublicLayout>
  );
}
