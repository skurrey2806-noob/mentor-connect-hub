import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isSameDay } from 'date-fns';

interface CalendarBooking {
  id: string;
  scheduled_at: string;
  duration: number;
  status: string;
  service: { name: string } | null;
}

export default function DashboardCalendar() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, currentMonth]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const { data: mentorProfile } = await supabase
        .from('mentor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!mentorProfile) return;

      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          scheduled_at,
          duration,
          status,
          service:services(name)
        `)
        .eq('mentor_id', mentorProfile.id)
        .gte('scheduled_at', start.toISOString())
        .lte('scheduled_at', end.toISOString())
        .neq('status', 'cancelled')
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setBookings((data as CalendarBooking[]) || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDateBookings = bookings.filter((booking) =>
    isSameDay(new Date(booking.scheduled_at), selectedDate)
  );

  const datesWithBookings = bookings.map((b) => new Date(b.scheduled_at));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">View and manage your scheduled sessions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="w-full"
              modifiers={{
                booked: datesWithBookings,
              }}
              modifiersStyles={{
                booked: {
                  fontWeight: 'bold',
                  backgroundColor: 'hsl(var(--primary) / 0.1)',
                  color: 'hsl(var(--primary))',
                  borderRadius: '0.375rem',
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Selected Date Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {format(selectedDate, 'EEEE, MMMM d')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                No sessions scheduled for this day.
              </p>
            ) : (
              <div className="space-y-4">
                {selectedDateBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-primary">
                        {format(new Date(booking.scheduled_at), 'h:mm a')}
                      </span>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="font-medium">{booking.service?.name || '1-on-1 Session'}</p>
                    <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Mentee
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {booking.duration} min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
