import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { MentorCard } from '@/components/mentors/MentorCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { MentorWithProfile, Category } from '@/types/database';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const experienceLevels = [
  { value: 'all', label: 'All Experience' },
  { value: '1-3', label: '1-3 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: '10+ years' },
];

const quickFilters = [
  'Design',
  'Software Development',
  'Product Management',
  'Data Science',
  'JEE Preparation',
  'Career Guidance',
];

export default function BrowseMentorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mentors, setMentors] = useState<MentorWithProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category')?.split(',').filter(Boolean) || []
  );
  const [experienceLevel, setExperienceLevel] = useState(
    searchParams.get('experience') || 'all'
  );

  useEffect(() => {
    fetchCategories();
    fetchMentors();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) {
      setCategories(data as Category[]);
    }
  };

  const fetchMentors = async () => {
    setIsLoading(true);
    try {
      // Fetch mentor profiles
      const { data: mentorData, error } = await supabase
        .from('mentor_profiles')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false });

      if (error) throw error;

      // Fetch profiles and experiences for each mentor
      const mentorUserIds = (mentorData || []).map((m) => m.user_id);
      const mentorIds = (mentorData || []).map((m) => m.id);

      const [profilesRes, experiencesRes] = await Promise.all([
        supabase.from('profiles').select('*').in('user_id', mentorUserIds),
        supabase.from('experiences').select('*').in('mentor_id', mentorIds),
      ]);

      const profilesMap = new Map(
        (profilesRes.data || []).map((p) => [p.user_id, p])
      );
      const experiencesMap = new Map<string, any[]>();
      (experiencesRes.data || []).forEach((e) => {
        if (!experiencesMap.has(e.mentor_id)) {
          experiencesMap.set(e.mentor_id, []);
        }
        experiencesMap.get(e.mentor_id)!.push(e);
      });

      // Transform data to match MentorWithProfile type
      const transformedData: MentorWithProfile[] = (mentorData || []).map((m: any) => ({
        ...m,
        profile: profilesMap.get(m.user_id) || { full_name: 'Mentor', email: '', user_id: m.user_id },
        experiences: experiencesMap.get(m.id) || [],
      }));

      setMentors(transformedData);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryToggle = (categorySlug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categorySlug)
        ? prev.filter((c) => c !== categorySlug)
        : [...prev, categorySlug]
    );
  };

  const handleQuickFilter = (filter: string) => {
    const category = categories.find(
      (c) => c.name.toLowerCase() === filter.toLowerCase()
    );
    if (category) {
      handleCategoryToggle(category.slug);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setExperienceLevel('all');
    setSearchParams({});
  };

  const filteredMentors = mentors.filter((mentor) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = mentor.profile?.full_name?.toLowerCase().includes(query);
      const matchesHeadline = mentor.headline?.toLowerCase().includes(query);
      const matchesSkills = mentor.skills?.some((s) => s.toLowerCase().includes(query));
      if (!matchesName && !matchesHeadline && !matchesSkills) return false;
    }

    // Category filter would need mentor_categories relation
    // For now, we'll skip this until we have the data

    return true;
  });

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || experienceLevel !== 'all';

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label className="text-sm font-medium">Search</Label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search mentors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <Label className="text-sm font-medium">Categories</Label>
        <div className="mt-3 space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.slug}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => handleCategoryToggle(category.slug)}
              />
              <label
                htmlFor={category.slug}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <Label className="text-sm font-medium">Experience Level</Label>
        <RadioGroup
          value={experienceLevel}
          onValueChange={setExperienceLevel}
          className="mt-3 space-y-2"
        >
          {experienceLevels.map((level) => (
            <div key={level.value} className="flex items-center space-x-2">
              <RadioGroupItem value={level.value} id={level.value} />
              <Label htmlFor={level.value} className="text-sm font-normal">
                {level.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="w-full">
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <PublicLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Browse Mentors</h1>
          <p className="mt-2 text-muted-foreground">
            Find the perfect mentor to guide your career journey
          </p>
        </div>

        {/* Quick Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {quickFilters.map((filter) => {
            const category = categories.find(
              (c) => c.name.toLowerCase() === filter.toLowerCase()
            );
            const isActive = category && selectedCategories.includes(category.slug);
            return (
              <Badge
                key={filter}
                variant={isActive ? 'default' : 'outline'}
                className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleQuickFilter(filter)}
              >
                {filter}
              </Badge>
            );
          })}
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-20 rounded-lg border bg-card p-4">
              <FilterSidebar />
            </div>
          </aside>

          {/* Mobile Filter Sheet */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="mb-4">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge className="ml-2" variant="secondary">
                      {selectedCategories.length + (experienceLevel !== 'all' ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Main Content */}
          <main className="flex-1">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-lg border p-5">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                    <Skeleton className="mt-4 h-12 w-full" />
                    <div className="mt-4 flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="mt-4 h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredMentors.length > 0 ? (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  Showing {filteredMentors.length} mentor{filteredMentors.length !== 1 && 's'}
                </p>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredMentors.map((mentor) => (
                    <MentorCard key={mentor.id} mentor={mentor} />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-full bg-muted p-6">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No mentors found</h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </PublicLayout>
  );
}
