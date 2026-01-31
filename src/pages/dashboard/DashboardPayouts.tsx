import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface MonthlyEarning {
  month: string;
  amount: number;
}

export default function DashboardPayouts() {
  const { user } = useAuth();
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [thisMonthEarnings, setThisMonthEarnings] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyEarning[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPayoutData();
    }
  }, [user]);

  const fetchPayoutData = async () => {
    if (!user) return;

    try {
      const { data: mentorProfile } = await supabase
        .from('mentor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!mentorProfile) return;

      // Get completed bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('price, scheduled_at, status')
        .eq('mentor_id', mentorProfile.id)
        .eq('status', 'completed');

      if (bookings) {
        const total = bookings.reduce((sum, b) => sum + b.price, 0);
        setTotalEarnings(total);
        setCompletedSessions(bookings.length);

        // This month earnings
        const startOfThisMonth = startOfMonth(new Date());
        const thisMonth = bookings.filter(
          (b) => new Date(b.scheduled_at) >= startOfThisMonth
        );
        setThisMonthEarnings(thisMonth.reduce((sum, b) => sum + b.price, 0));

        // Monthly breakdown (last 6 months)
        const monthlyBreakdown: MonthlyEarning[] = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = subMonths(new Date(), i);
          const monthStart = startOfMonth(monthDate);
          const monthEnd = endOfMonth(monthDate);
          
          const monthBookings = bookings.filter((b) => {
            const date = new Date(b.scheduled_at);
            return date >= monthStart && date <= monthEnd;
          });
          
          monthlyBreakdown.push({
            month: format(monthDate, 'MMM yyyy'),
            amount: monthBookings.reduce((sum, b) => sum + b.price, 0),
          });
        }
        setMonthlyData(monthlyBreakdown);
      }
    } catch (error) {
      console.error('Error fetching payout data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const maxMonthlyAmount = Math.max(...monthlyData.map((m) => m.amount), 1);

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
        <h1 className="text-2xl font-bold">Payouts</h1>
        <p className="text-muted-foreground">Track your earnings and payout history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">₹{thisMonthEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Sessions</p>
                <p className="text-2xl font-bold">{completedSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Earnings Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((item) => (
              <div key={item.month} className="flex items-center gap-4">
                <span className="w-20 text-sm text-muted-foreground">{item.month}</span>
                <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(item.amount / maxMonthlyAmount) * 100}%` }}
                  />
                </div>
                <span className="w-24 text-right font-medium">
                  ₹{item.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Earnings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span>Session Earnings</span>
              </div>
              <span className="font-medium">₹{totalEarnings.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <span>Platform Fee (10%)</span>
              </div>
              <span className="font-medium text-amber-600">-₹{Math.round(totalEarnings * 0.1).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="font-semibold">Net Earnings</span>
              </div>
              <span className="font-bold text-green-600">₹{Math.round(totalEarnings * 0.9).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
