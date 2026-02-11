import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit2, MapPin, Mail, Phone, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { BasicDetailsModal } from '@/components/profile/BasicDetailsModal';

export default function UserProfilePage() {
  const { user, profile, isMentor, refreshProfile } = useAuth();
  const [basicOpen, setBasicOpen] = useState(false);

  if (!user || !profile) {
    return (
      <PublicLayout>
        <div className="container flex flex-col items-center justify-center py-20">
          <h1 className="text-2xl font-bold">Please sign in</h1>
          <p className="mt-2 text-muted-foreground">You need to be signed in to view your profile.</p>
          <Button asChild className="mt-6">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <Card className="relative overflow-hidden rounded-2xl border-border/50 shadow-soft">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                onClick={() => setBasicOpen(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>

              <CardContent className="p-6">
                <div className="flex flex-col gap-6 sm:flex-row">
                  <Avatar className="h-28 w-28 rounded-2xl ring-4 ring-primary/20">
                    <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name} className="object-cover" />
                    <AvatarFallback className="rounded-2xl bg-primary text-primary-foreground text-3xl">
                      {profile.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {profile.email}
                    </p>
                    {profile.phone && (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {profile.phone}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Info Card */}
            <Card className="rounded-2xl border-border/50 shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="font-medium">{profile.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="font-medium">{profile.phone || 'Not added'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {new Date(profile.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar — Become a Creator CTA */}
          <div className="space-y-6">
            {!isMentor && (
              <Card className="rounded-2xl border-border/50 shadow-soft overflow-hidden">
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Become a Creator</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Share your expertise, host 1:1 sessions, and earn by mentoring others on topics you love.
                  </p>
                  <Button asChild className="w-full gap-2">
                    <Link to="/become-mentor">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            )}

            {isMentor && (
              <Card className="rounded-2xl border-border/50 shadow-soft">
                <CardContent className="p-6 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">You're already a mentor!</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Basic Details Modal — reuse for editing name, phone, avatar */}
      <BasicDetailsModal
        open={basicOpen}
        onOpenChange={setBasicOpen}
        profile={profile}
        mentorProfile={null}
        onSaved={() => {
          refreshProfile();
        }}
      />
    </PublicLayout>
  );
}
