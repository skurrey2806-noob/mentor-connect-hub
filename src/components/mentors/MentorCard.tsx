import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, Briefcase } from 'lucide-react';
import type { MentorWithProfile } from '@/types/database';

interface MentorCardProps {
  mentor: MentorWithProfile;
  onFavorite?: (mentorId: string) => void;
  isFavorite?: boolean;
}

export function MentorCard({ mentor, onFavorite, isFavorite }: MentorCardProps) {
  const yearsOfExperience = mentor.experiences?.reduce((acc, exp) => {
    const startYear = new Date(exp.start_date).getFullYear();
    const endYear = exp.is_current
      ? new Date().getFullYear()
      : exp.end_date
      ? new Date(exp.end_date).getFullYear()
      : startYear;
    return acc + (endYear - startYear);
  }, 0) || 0;

  const currentRole = mentor.experiences?.find((e) => e.is_current);

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-card">
      <CardContent className="p-0">
        <div className="relative">
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onFavorite?.(mentor.id);
            }}
            className="absolute right-3 top-3 z-10 rounded-full bg-background/80 p-2 backdrop-blur transition-colors hover:bg-background"
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground'
              }`}
            />
          </button>

          {/* Featured Badge */}
          {mentor.is_featured && (
            <Badge className="absolute left-3 top-3 z-10 bg-primary">Featured</Badge>
          )}

          {/* Content */}
          <Link to={`/mentor/${mentor.id}`} className="block p-5">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-background">
                <AvatarImage src={mentor.profile?.avatar_url || ''} alt={mentor.profile?.full_name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {mentor.profile?.full_name?.charAt(0) || 'M'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {mentor.profile?.full_name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {mentor.headline}
                </p>
                {currentRole && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentRole.role} at {currentRole.company}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
              {mentor.bio || 'Experienced mentor ready to help you grow your career.'}
            </p>

            {/* Skills */}
            {mentor.skills && mentor.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {mentor.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {mentor.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{mentor.skills.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Stats Row */}
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{yearsOfExperience}+ yrs</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{mentor.average_rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-lg font-bold text-primary">
                  ₹{mentor.hourly_rate}
                </span>
                <span className="text-xs text-muted-foreground">/session</span>
              </div>
            </div>
          </Link>

          {/* CTA */}
          <div className="border-t p-4 pt-0">
            <Button asChild className="w-full mt-4">
              <Link to={`/mentor/${mentor.id}/book`}>Book 1-On-1 Call</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
