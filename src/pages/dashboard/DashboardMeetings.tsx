import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Video, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Booking {
  id: string;
  scheduled_at: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  meeting_link: string | null;
  notes: string | null;
  price: number;
  service: { name: string } | null;
}

export default function DashboardMeetings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

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

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          scheduled_at,
          duration,
          status,
          meeting_link,
          notes,
          price,
          service:services(name)
        `)
        .eq('mentor_id', mentorProfile.id)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
      setBookings((data as Booking[]) || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);
      
      toast.success(`Booking ${newStatus}`);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update booking');
    }
  };

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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
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
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">Mentee</p>
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

                      <div className="flex flex-col items-end gap-3">
                        <Badge className={getStatusBadge(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
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
                        <Button
                          className="flex-1"
                          onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                        >
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
