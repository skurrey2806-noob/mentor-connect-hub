import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PublicLayout } from '@/components/layout/PublicLayout';
import {
  Star,
  Users,
  Clock,
  Shield,
  Award,
  MessageCircle,
  Target,
  Zap,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

// Mock featured mentors (will be replaced with real data)
const featuredMentors = [
  {
    id: '1',
    name: 'Priya Sharma',
    role: 'Senior Product Manager',
    company: 'Google',
    avatar: '',
    rating: 4.9,
    hourlyRate: 2500,
    skills: ['Product Strategy', 'Roadmapping'],
  },
  {
    id: '2',
    name: 'Rahul Mehta',
    role: 'Staff Software Engineer',
    company: 'Microsoft',
    avatar: '',
    rating: 4.8,
    hourlyRate: 3000,
    skills: ['System Design', 'DSA'],
  },
  {
    id: '3',
    name: 'Ananya Desai',
    role: 'Design Director',
    company: 'Flipkart',
    avatar: '',
    rating: 5.0,
    hourlyRate: 2000,
    skills: ['UI/UX', 'Design Systems'],
  },
  {
    id: '4',
    name: 'Vikram Singh',
    role: 'Engineering Manager',
    company: 'Amazon',
    avatar: '',
    rating: 4.7,
    hourlyRate: 3500,
    skills: ['Leadership', 'Career Growth'],
  },
];

const categories = [
  { name: 'Design', slug: 'design', count: 45 },
  { name: 'Software Development', slug: 'sde', count: 120 },
  { name: 'Product Management', slug: 'product', count: 78 },
  { name: 'Data Science', slug: 'data-science', count: 56 },
  { name: 'Marketing', slug: 'marketing', count: 34 },
  { name: 'JEE Preparation', slug: 'jee', count: 89 },
  { name: 'Career Guidance', slug: 'career', count: 67 },
  { name: 'Entrepreneurship', slug: 'entrepreneurship', count: 42 },
];

const benefits = [
  {
    icon: Users,
    title: '1-on-1 Sessions',
    description: 'Personal attention from industry experts tailored to your goals.',
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Book sessions that fit your schedule, anytime, anywhere.',
  },
  {
    icon: Shield,
    title: 'Verified Mentors',
    description: 'All mentors are vetted professionals with proven track records.',
  },
  {
    icon: Award,
    title: 'Expert Guidance',
    description: 'Learn from people who have walked the path you want to take.',
  },
  {
    icon: MessageCircle,
    title: 'Actionable Feedback',
    description: 'Get specific, actionable advice to accelerate your growth.',
  },
  {
    icon: Target,
    title: 'Goal-Oriented',
    description: 'Work towards your specific career goals with a structured approach.',
  },
  {
    icon: Zap,
    title: 'Fast Results',
    description: 'Skip years of trial and error with expert shortcuts.',
  },
  {
    icon: TrendingUp,
    title: 'Career Growth',
    description: 'Advance your career with insider knowledge and networking.',
  },
  {
    icon: Lightbulb,
    title: 'Fresh Perspectives',
    description: 'Gain new insights and ideas from diverse industry leaders.',
  },
];

const testimonials = [
  {
    name: 'Arjun Kumar',
    role: 'SDE at Razorpay',
    avatar: '',
    content:
      'The mentorship I received helped me crack my dream job. My mentor guided me through system design interviews and helped me negotiate a 40% higher package.',
    rating: 5,
  },
  {
    name: 'Sneha Patel',
    role: 'Product Designer at Swiggy',
    avatar: '',
    content:
      'Having a mentor who understood the design industry in India was invaluable. She helped me build my portfolio and prepare for interviews at top companies.',
    rating: 5,
  },
  {
    name: 'Rohit Gupta',
    role: 'Founder, TechStart',
    avatar: '',
    content:
      'My mentor helped me validate my startup idea and connected me with investors. The ROI on mentorship sessions has been incredible.',
    rating: 5,
  },
];

const faqs = [
  {
    question: 'How does MenTOR work?',
    answer:
      'Browse our mentor directory, find a mentor whose experience matches your goals, book a session using tokens, and connect via video call. After the session, you can rate your experience and book follow-up sessions.',
  },
  {
    question: 'How are mentors vetted?',
    answer:
      'All mentors go through a verification process where we check their professional background, work experience, and credentials. We only onboard mentors with proven industry experience.',
  },
  {
    question: 'What are tokens and how do they work?',
    answer:
      'Tokens are our in-platform currency. You purchase tokens which can be used to book sessions with any mentor. Each mentor sets their own token rate per session.',
  },
  {
    question: 'Can I become a mentor?',
    answer:
      'Yes! If you have industry experience and want to help others grow, you can apply to become a mentor. Click on "Become a Mentor" to start your application.',
  },
  {
    question: "What if I'm not satisfied with a session?",
    answer:
      "We have a satisfaction guarantee. If you're not happy with your session, you can request a review and we'll work to make it right, including potential refunds.",
  },
];

export default function LandingPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-[hsl(350_100%_90%/0.4)] blur-[100px]" />
        <div className="pointer-events-none absolute top-20 -right-40 h-[400px] w-[400px] rounded-full bg-[hsl(280_80%_90%/0.35)] blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-[300px] w-[300px] rounded-full bg-[hsl(170_70%_90%/0.3)] blur-[80px]" />

        <div className="container relative py-24 md:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-8 border-0 bg-background/80 px-4 py-1.5 text-sm font-medium shadow-soft backdrop-blur-sm" variant="secondary">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
              🚀 Trusted by 10,000+ professionals
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Connect 1-1 With{' '}
              <span className="bg-gradient-to-r from-primary via-mentor-pink to-mentor-purple bg-clip-text text-transparent">
                Industry Mentors
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Get personalized guidance from experienced professionals. Accelerate
              your career with mentorship from those who've been there.
            </p>
            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                asChild
                className="h-13 gradient-hero-cta rounded-full border-0 px-8 text-base font-semibold shadow-glow transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_6px_hsl(var(--mentor-rose)/0.3)]"
              >
                <Link to="/browse">
                  Book a 1-on-1 Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-13 rounded-full border-2 border-border/60 bg-background/60 px-8 text-base font-medium backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-accent/50"
              >
                <Link to="/become-mentor">Become a Mentor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mentors */}
      <section className="container py-24">
        <div className="mb-14 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
            Top Mentors
          </p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Featured Mentors</h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Learn from the best in the industry
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredMentors.map((mentor) => (
            <Card
              key={mentor.id}
              className="group relative overflow-hidden border border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/20 via-mentor-pink/20 to-mentor-purple/20 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
                    <Avatar className="relative h-20 w-20 ring-4 ring-secondary">
                      <AvatarImage src={mentor.avatar} alt={mentor.name} />
                      <AvatarFallback className="gradient-hero-cta text-primary-foreground text-xl font-bold">
                        {mentor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h3 className="mt-5 font-semibold transition-colors group-hover:text-primary">
                    {mentor.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {mentor.role}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    at {mentor.company}
                  </p>
                  <div className="mt-3 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">{mentor.rating}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {mentor.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="rounded-full px-3 text-xs font-normal"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-5 flex items-baseline gap-0.5">
                    <span className="text-xl font-bold text-primary">
                      ₹{mentor.hourlyRate}
                    </span>
                    <span className="text-xs text-muted-foreground">/session</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            variant="outline"
            asChild
            className="rounded-full border-2 px-6 transition-all duration-300 hover:border-primary/40 hover:bg-accent/50"
          >
            <Link to="/browse">
              View All Mentors
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Mentoring Areas */}
      <section className="gradient-section-alt py-24">
        <div className="container">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
              Explore
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Our Mentoring Areas</h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Find mentors across diverse fields and industries
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/browse?category=${category.slug}`}
                className="group"
              >
                <Badge
                  variant="outline"
                  className="h-11 cursor-pointer rounded-full border-2 border-border/60 bg-background/80 px-5 text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-soft"
                >
                  {category.name}
                  <span className="ml-2 text-xs opacity-50">({category.count})</span>
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="container py-24">
        <div className="mb-14 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
            Benefits
          </p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Why Choose MenTOR?</h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Everything you need to accelerate your growth
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <Card
              key={benefit.title}
              className="group border border-border/40 bg-card/50 transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-card"
            >
              <CardContent className="p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-mentor-pink/10 transition-all duration-300 group-hover:from-primary/20 group-hover:to-mentor-pink/20">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-5 font-semibold">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="gradient-section-alt py-24">
        <div className="container">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
              Testimonials
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">What Our Users Say</h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Real stories from real professionals
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.name}
                className="border border-border/40 bg-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
              >
                <CardContent className="p-7">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                    "{testimonial.content}"
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t border-border/40 pt-5">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="gradient-hero-cta text-primary-foreground text-sm font-semibold">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
              FAQ
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Frequently Asked Questions</h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Everything you need to know about MenTOR
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-xl border border-border/50 bg-card/50 px-6 transition-colors data-[state=open]:bg-card data-[state=open]:shadow-card"
              >
                <AccordionTrigger className="py-5 text-left font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden gradient-cta-section py-24 text-primary-foreground">
        <div className="pointer-events-none absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full bg-[hsl(0_0%_100%/0.08)] blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[hsl(0_0%_100%/0.06)] blur-[80px]" />

        <div className="container relative text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ready to Accelerate Your Growth?</h2>
          <p className="mx-auto mt-5 max-w-lg text-lg opacity-90">
            Join thousands of professionals who've transformed their careers
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="h-13 rounded-full px-8 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
            >
              <Link to="/browse">Find a Mentor</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-13 rounded-full border-2 border-primary-foreground/30 px-8 text-base font-medium text-primary-foreground transition-all duration-300 hover:border-primary-foreground/60 hover:bg-primary-foreground/10"
            >
              <Link to="/become-mentor">Become a Mentor</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
