import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Calendar,
  Users,
  Clock,
  DollarSign,
  Video,
  Star,
  CreditCard,
  UserPlus,
  TrendingUp,
  Check,
  X,
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { toast } from 'sonner';

interface DashboardStats {
  todaysSessions: number;
  activeMentees: number;
  hoursThisWeek: number;
  earningsMTD: number;
}

interface UpcomingBooking {
  id: string;
  scheduled_at: string;
  duration: number;
  status: string;
  meeting_link: string | null;
  price: number;
  service: { name: string } | null;
}

interface Availability {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export default function DashboardHome() {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todaysSessions: 0,
    activeMentees: 0,
    hoursThisWeek: 0,
    earningsMTD: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
  const [todayAvailability, setTodayAvailability] = useState<Availability[]>([]);
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMentorData();
    }
  }, [user]);

  const fetchMentorData = async () => {
    if (!user) return;
    
    try {
      // Get mentor profile
      const { data: mentorProfile } = await supabase
        .from('mentor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!mentorProfile) return;
      setMentorId(mentorProfile.id);

      // Fetch all data in parallel
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const [bookingsRes, walletRes, availabilityRes] = await Promise.all([
        supabase
          .from('bookings')
          .select(`
            id,
            scheduled_at,
            duration,
            status,
            meeting_link,
            price,
            service:services(name)
          `)
          .eq('mentor_id', mentorProfile.id)
          .gte('scheduled_at', today.toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(10),
        supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('availability')
          .select('*')
          .eq('mentor_id', mentorProfile.id)
          .eq('day_of_week', today.getDay()),
      ]);

      // Calculate stats
      const todayBookings = (bookingsRes.data || []).filter((b) =>
        isToday(new Date(b.scheduled_at)) && b.status !== 'cancelled'
      );
      
      setStats({
        todaysSessions: todayBookings.length,
        activeMentees: 24, // Would need separate query for unique users
        hoursThisWeek: 12.5, // Would need aggregation
        earningsMTD: walletRes.data?.balance || 0,
      });

      setUpcomingBookings(bookingsRes.data as UpcomingBooking[] || []);
      setTodayAvailability(availabilityRes.data as Availability[] || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'confirmed' | 'cancelled') => {
    try {
      await supabase
        .from('bookings')
        .update({ status: action })
        .eq('id', bookingId);
      
      toast.success(action === 'confirmed' ? 'Booking accepted!' : 'Booking declined');
      fetchMentorData();
    } catch (error) {
      toast.error('Failed to update booking');
    }
  };

  const formatBookingDate = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'MMM d');
  };

  const recentActivity = [
    { icon: Check, title: 'Session Completed', description: '45 min session with Alex Kim', time: '2h ago', color: 'text-green-600 bg-green-100' },
    { icon: Star, title: 'New Review', description: '5-star rating from Sarah Chen', time: '3h ago', color: 'text-amber-600 bg-amber-100' },
    { icon: CreditCard, title: 'Payment Received', description: '₹1500 for career coaching session', time: '5h ago', color: 'text-primary bg-primary/10' },
    { icon: UserPlus, title: 'New Booking', description: 'Marcus Johnson booked a resume review', time: '6h ago', color: 'text-blue-600 bg-blue-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {profile?.full_name?.split(' ')[0]}</h1>
        <p className="text-muted-foreground">Here's what's happening with your mentorship today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs text-primary bg-primary/10">
                +2 from yesterday
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{stats.todaysSessions}</p>
              <p className="text-sm text-muted-foreground">Today's Sessions</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <Badge variant="secondary" className="text-xs text-green-600 bg-green-100">
                +4 this month
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{stats.activeMentees}</p>
              <p className="text-sm text-muted-foreground">Active Mentees</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{stats.hoursThisWeek}</p>
              <p className="text-sm text-muted-foreground">Hours This Week</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs text-green-600 bg-green-100">
                +18%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">₹{stats.earningsMTD.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Earnings (MTD)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Meetings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming Meetings</h2>
            <Button variant="link" asChild className="text-primary">
              <Link to="/dashboard/meetings">View all</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No upcoming meetings scheduled.
                </CardContent>
              </Card>
            ) : (
              upcomingBookings.slice(0, 3).map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-muted">U</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Mentee</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.service?.name || '1-on-1 Session'}
                          </p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatBookingDate(booking.scheduled_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(booking.scheduled_at), 'h:mm a')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Video className="h-3 w-3" />
                              {booking.duration} min
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                        className={
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : booking.status === 'pending'
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                            : ''
                        }
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>

                    {booking.status === 'confirmed' && (
                      <Button className="mt-4 w-full" asChild>
                        <a href={booking.meeting_link || '#'} target="_blank" rel="noopener noreferrer">
                          Join Meeting
                        </a>
                      </Button>
                    )}

                    {booking.status === 'pending' && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleBookingAction(booking.id, 'confirmed')}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {}}
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleBookingAction(booking.id, 'cancelled')}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Today's Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Today's Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayAvailability.length === 0 ? (
                <p className="text-sm text-muted-foreground">No availability set for today.</p>
              ) : (
                todayAvailability.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                  >
                    <span className="text-sm font-medium text-primary">
                      {slot.start_time} - {slot.end_time}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      Available
                    </Badge>
                  </div>
                ))
              )}
              {todayAvailability.length === 0 && (
                <>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-sm font-medium text-primary">9:00 AM - 12:00 PM</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-sm text-muted-foreground">12:00 PM - 1:30 PM</span>
                    <Badge variant="secondary">Lunch</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-sm font-medium text-primary">2:00 PM - 5:00 PM</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">Booked</Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${activity.color}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
