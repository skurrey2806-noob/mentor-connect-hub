import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Briefcase, Heart } from 'lucide-react';
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
    <div className="group relative rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-card hover:-translate-y-0.5">
      {/* Favorite */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onFavorite?.(mentor.id);
        }}
        className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-muted-foreground/40 transition-colors hover:text-primary"
      >
        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-primary text-primary' : ''}`} />
      </button>

      {/* Featured */}
      {mentor.is_featured && (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
          Featured
        </span>
      )}

      <Link to={`/mentor/${mentor.id}`} className="block">
        {/* Avatar + Info */}
        <div className="flex items-start gap-3.5">
          <Avatar className="h-12 w-12 ring-2 ring-secondary">
            <AvatarImage src={mentor.profile?.avatar_url || ''} alt={mentor.profile?.full_name} />
            <AvatarFallback className="bg-secondary text-primary text-base font-semibold">
              {mentor.profile?.full_name?.charAt(0) || 'M'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {mentor.profile?.full_name}
            </h3>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {mentor.headline || (currentRole ? `${currentRole.role} at ${currentRole.company}` : 'Industry Expert')}
            </p>
          </div>
        </div>

        {/* Skills */}
        {mentor.skills && mentor.skills.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {mentor.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {skill}
              </span>
            ))}
            {mentor.skills.length > 3 && (
              <span className="rounded-full bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground">
                +{mentor.skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta Row */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              {yearsOfExperience}+ yrs
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {mentor.average_rating.toFixed(1)}
            </span>
          </div>
          <div>
            <span className="text-base font-bold text-foreground">₹{mentor.hourly_rate}</span>
            <span className="text-muted-foreground">/session</span>
          </div>
        </div>
      </Link>

      {/* CTA */}
      <Button
        asChild
        className="mt-4 w-full rounded-xl h-10 text-sm font-medium"
      >
        <Link to={`/mentor/${mentor.id}/book`}>Book 1-on-1 Call</Link>
      </Button>
    </div>
  );
}
