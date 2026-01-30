import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowLeft, Video, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { MentorWithProfile, Service } from '@/types/database';
import { format, addDays, isSameDay, setHours, setMinutes } from 'date-fns';

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
];

export default function BookingPage() {
  const { mentorId, serviceId } = useParams<{ mentorId: string; serviceId?: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [mentor, setMentor] = useState<MentorWithProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [step, setStep] = useState<'service' | 'datetime' | 'confirm'>('service');

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to book a session');
      navigate('/login');
      return;
    }
    fetchData();
  }, [mentorId, user]);

  useEffect(() => {
    if (serviceId && services.length > 0) {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        setSelectedService(service);
        setStep('datetime');
      }
    }
  }, [serviceId, services]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch mentor
      const { data: mentorData } = await supabase
        .from('mentor_profiles')
        .select('*')
        .eq('id', mentorId)
        .single();

      if (mentorData) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', mentorData.user_id)
          .single();

        setMentor({ ...mentorData, profile: profileData } as MentorWithProfile);
      }

      // Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('mentor_id', mentorId)
        .eq('is_active', true);

      setServices((servicesData || []) as Service[]);

      // Fetch wallet balance
      if (user) {
        const { data: walletData } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        setWalletBalance(walletData?.balance || 0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep('datetime');
  };

  const handleDateTimeConfirm = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }
    setStep('confirm');
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !user) return;

    if (walletBalance < selectedService.price) {
      toast.error('Insufficient balance. Please add tokens to your wallet.');
      navigate('/wallet');
      return;
    }

    setIsBooking(true);
    try {
      // Parse selected time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledAt = setMinutes(setHours(selectedDate, hours), minutes);

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          mentor_id: mentorId,
          service_id: selectedService.id,
          scheduled_at: scheduledAt.toISOString(),
          duration: selectedService.duration,
          price: selectedService.price,
          status: 'pending',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Deduct from wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', user.id)
        .single();

      if (wallet) {
        await supabase
          .from('wallets')
          .update({ balance: wallet.balance - selectedService.price })
          .eq('id', wallet.id);

        // Create transaction
        await supabase.from('transactions').insert({
          wallet_id: wallet.id,
          type: 'debit',
          amount: selectedService.price,
          description: `Booking with ${mentor?.profile?.full_name} - ${selectedService.name}`,
          reference_id: booking.id,
        });
      }

      toast.success('Session booked successfully!');
      navigate('/bookings');
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error('Failed to book session. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container max-w-4xl py-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-6 h-64 w-full" />
        </div>
      </PublicLayout>
    );
  }

  if (!mentor) {
    return (
      <PublicLayout>
        <div className="container flex flex-col items-center justify-center py-20">
          <h1 className="text-2xl font-bold">Mentor not found</h1>
          <Button asChild className="mt-6">
            <Link to="/browse">Browse Mentors</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container max-w-4xl py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => {
            if (step === 'confirm') setStep('datetime');
            else if (step === 'datetime') setStep('service');
            else navigate(`/mentor/${mentorId}`);
          }}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Mentor Info */}
        <Card className="mb-8">
          <CardContent className="flex items-center gap-4 p-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={mentor.profile?.avatar_url || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {mentor.profile?.full_name?.charAt(0) || 'M'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{mentor.profile?.full_name}</h2>
              <p className="text-sm text-muted-foreground">{mentor.headline}</p>
            </div>
          </CardContent>
        </Card>

        {/* Step: Select Service */}
        {step === 'service' && (
          <div>
            <h1 className="mb-6 text-2xl font-bold">Select a Service</h1>
            <div className="grid gap-4 md:grid-cols-2">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedService?.id === service.id
                      ? 'border-primary ring-2 ring-primary'
                      : ''
                  }`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {service.description || 'No description'}
                        </p>
                      </div>
                      {selectedService?.id === service.id && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {service.duration} mins
                      </div>
                      <div className="text-lg font-bold text-primary">
                        ₹{service.price}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step: Select Date & Time */}
        {step === 'datetime' && selectedService && (
          <div>
            <h1 className="mb-6 text-2xl font-bold">Select Date & Time</h1>
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) =>
                      date < new Date() || date > addDays(new Date(), 30)
                    }
                    className="pointer-events-auto"
                  />
                </CardContent>
              </Card>

              {/* Time Slots */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Time</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? 'default' : 'outline'}
                          onClick={() => setSelectedTime(time)}
                          className="h-10"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Please select a date first
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                size="lg"
                onClick={handleDateTimeConfirm}
                disabled={!selectedDate || !selectedTime}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step: Confirm Booking */}
        {step === 'confirm' && selectedService && selectedDate && selectedTime && (
          <div>
            <h1 className="mb-6 text-2xl font-bold">Confirm Booking</h1>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Service</p>
                      <p className="font-semibold">{selectedService.name}</p>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="mr-1 h-3 w-3" />
                      {selectedService.duration} mins
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Date & Time</p>
                      <p className="font-semibold">
                        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">{selectedTime}</p>
                    </div>
                    <Video className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Your Balance</p>
                      <p className="font-semibold">₹{walletBalance}</p>
                    </div>
                    {walletBalance < selectedService.price && (
                      <Badge variant="destructive">Insufficient</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{selectedService.price}
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={handleBooking}
                      disabled={isBooking || walletBalance < selectedService.price}
                    >
                      {isBooking ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {walletBalance < selectedService.price && (
              <Card className="mt-4 border-destructive bg-destructive/10">
                <CardContent className="p-4">
                  <p className="text-sm text-destructive">
                    You need ₹{selectedService.price - walletBalance} more tokens to book
                    this session.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => navigate('/wallet')}
                  >
                    Add Tokens
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
