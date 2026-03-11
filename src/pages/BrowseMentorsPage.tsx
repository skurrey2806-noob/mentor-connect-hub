import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { MentorCard } from '@/components/mentors/MentorCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, X, LayoutGrid, List } from 'lucide-react';
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
  { value: 'all', label: 'All Levels' },
  { value: '1-3', label: '1–3 years' },
  { value: '3-5', label: '3–5 years' },
  { value: '5-10', label: '5–10 years' },
  { value: '10+', label: '10+ years' },
];

const quickFilters = [
  'Design',
  'Software Development',
  'Product Management',
  'Data Science',
  'Career Guidance',
  'Marketing',
  'Startup',
  'Interview Prep',
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
  const [sortBy, setSortBy] = useState('relevant');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const chipScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
    fetchMentors();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data as Category[]);
  };

  const fetchMentors = async () => {
    setIsLoading(true);
    try {
      const { data: mentorData, error } = await supabase
        .from('mentor_profiles')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false });

      if (error) throw error;

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
        if (!experiencesMap.has(e.mentor_id)) experiencesMap.set(e.mentor_id, []);
        experiencesMap.get(e.mentor_id)!.push(e);
      });

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
    const slug = filter.toLowerCase().replace(/\s+/g, '-');
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const isChipActive = (filter: string) => {
    const slug = filter.toLowerCase().replace(/\s+/g, '-');
    return selectedCategories.includes(slug);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setExperienceLevel('all');
    setSearchParams({});
  };

  const filteredMentors = mentors.filter((mentor) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = mentor.profile?.full_name?.toLowerCase().includes(query);
      const matchesHeadline = mentor.headline?.toLowerCase().includes(query);
      const matchesSkills = mentor.skills?.some((s) => s.toLowerCase().includes(query));
      if (!matchesName && !matchesHeadline && !matchesSkills) return false;
    }
    return true;
  });

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || experienceLevel !== 'all';

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search Mentors</Label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Name, skill, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl bg-muted/50 border-0 h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</Label>
        <div className="mt-3 space-y-2.5">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2.5">
              <Checkbox
                id={`filter-${category.slug}`}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => handleCategoryToggle(category.slug)}
                className="rounded-[5px]"
              />
              <label
                htmlFor={`filter-${category.slug}`}
                className="text-sm leading-none cursor-pointer text-foreground/80 hover:text-foreground transition-colors"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Experience Level</Label>
        <RadioGroup
          value={experienceLevel}
          onValueChange={setExperienceLevel}
          className="mt-3 space-y-2.5"
        >
          {experienceLevels.map((level) => (
            <div key={level.value} className="flex items-center space-x-2.5">
              <RadioGroupItem value={level.value} id={`exp-${level.value}`} />
              <Label htmlFor={`exp-${level.value}`} className="text-sm font-normal cursor-pointer text-foreground/80">
                {level.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="w-full text-sm text-muted-foreground hover:text-foreground">
          <X className="mr-2 h-3.5 w-3.5" />
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <PublicLayout>
      <div className="min-h-screen bg-muted/20">
        {/* Page Header */}
        <div className="border-b bg-card">
          <div className="container py-8 md:py-10">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Discover Mentors
            </h1>
            <p className="mt-2 text-muted-foreground text-sm md:text-base">
              Find the right expert to accelerate your career.
            </p>
          </div>

          {/* Category Chips - Horizontal Scrollable */}
          <div className="container pb-5">
            <div
              ref={chipScrollRef}
              className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {quickFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleQuickFilter(filter)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isChipActive(filter)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-6 md:py-8">
          <div className="flex gap-8">
            {/* Mentor Grid */}
            <main className="flex-1 min-w-0">
              {/* Results Toolbar */}
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {isLoading ? (
                    <Skeleton className="h-4 w-32 inline-block" />
                  ) : (
                    <>Showing <span className="font-medium text-foreground">{filteredMentors.length}</span> mentor{filteredMentors.length !== 1 && 's'}</>
                  )}
                </p>
                <div className="flex items-center gap-3">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px] h-9 rounded-lg border-0 bg-card shadow-sm text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevant">Most Relevant</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price-low">Lowest Price</SelectItem>
                      <SelectItem value="experience">Most Experienced</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="hidden md:flex items-center rounded-lg bg-card shadow-sm p-0.5">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`rounded-md p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`rounded-md p-1.5 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Mobile Filter Trigger */}
                  <div className="lg:hidden">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-lg h-9 border-0 bg-card shadow-sm">
                          <SlidersHorizontal className="mr-2 h-4 w-4" />
                          Filters
                          {hasActiveFilters && (
                            <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center">
                              {selectedCategories.length + (experienceLevel !== 'all' ? 1 : 0)}
                            </Badge>
                          )}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-[320px]">
                        <SheetHeader>
                          <SheetTitle>Filters</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6">
                          <FilterPanel />
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              {isLoading ? (
                <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-2xl bg-card p-5 shadow-sm">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-14 w-14 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                      <Skeleton className="mt-4 h-10 w-full" />
                      <div className="mt-3 flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <Skeleton className="mt-4 h-10 w-full rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : filteredMentors.length > 0 ? (
                <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {filteredMentors.map((mentor) => (
                    <MentorCard key={mentor.id} mentor={mentor} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="rounded-2xl bg-secondary p-5">
                    <Search className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">No mentors found</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                    Try adjusting your filters or search for something different.
                  </p>
                  <Button variant="outline" onClick={clearFilters} className="mt-5 rounded-full">
                    Clear all filters
                  </Button>
                </div>
              )}
            </main>

            {/* Desktop Filter Panel - Right Side */}
            <aside className="hidden lg:block w-[280px] shrink-0">
              <div className="sticky top-20 rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-foreground">Filters</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-primary hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <FilterPanel />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
