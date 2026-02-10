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
    question: 'What if I\'m not satisfied with a session?',
    answer:
      'We have a satisfaction guarantee. If you\'re not happy with your session, you can request a review and we\'ll work to make it right, including potential refunds.',
  },
];

export default function LandingPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6" variant="secondary">
              🚀 Trusted by 10,000+ professionals
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Connect 1-1 With{' '}
              <span className="text-primary">Industry Mentors</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Get personalized guidance from experienced professionals. Accelerate
              your career with mentorship from those who've been there.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="h-12 px-8 text-base">
                <Link to="/browse">
                  Book a 1-on-1 Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                <Link to="/become-mentor">Become a Mentor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mentors */}
      <section className="container py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Featured Mentors</h2>
          <p className="mt-3 text-muted-foreground">
            Learn from the best in the industry
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredMentors.map((mentor) => (
            <Card key={mentor.id} className="group overflow-hidden transition-all hover:shadow-card">
              <CardContent className="p-5">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 ring-4 ring-secondary">
                    <AvatarImage src={mentor.avatar} alt={mentor.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {mentor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-4 font-semibold group-hover:text-primary transition-colors">
                    {mentor.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {mentor.role}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    at {mentor.company}
                  </p>
                  <div className="mt-3 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">{mentor.rating}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap justify-center gap-1">
                    {mentor.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4">
                    <span className="text-lg font-bold text-primary">
                      ₹{mentor.hourlyRate}
                    </span>
                    <span className="text-xs text-muted-foreground">/session</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button variant="outline" asChild>
            <Link to="/browse">View All Mentors</Link>
          </Button>
        </div>
      </section>

      {/* Mentoring Areas */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Our Mentoring Areas</h2>
            <p className="mt-3 text-muted-foreground">
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
                  className="h-10 cursor-pointer border-2 px-4 text-sm transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  {category.name}
                  <span className="ml-2 text-xs opacity-60">({category.count})</span>
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="container py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Why Choose MenTOR?</h2>
          <p className="mt-3 text-muted-foreground">
            Everything you need to accelerate your growth
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="border-none shadow-none bg-muted/30">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">{benefit.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">What Our Users Say</h2>
            <p className="mt-3 text-muted-foreground">
              Real stories from real professionals
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="bg-background">
                <CardContent className="p-6">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    "{testimonial.content}"
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
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
      <section className="container py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="mt-3 text-muted-foreground">
              Everything you need to know about MenTOR
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold">Ready to Accelerate Your Growth?</h2>
          <p className="mt-4 text-lg opacity-90">
            Join thousands of professionals who've transformed their careers
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="h-12 px-8 text-base"
            >
              <Link to="/browse">Find a Mentor</Link>
            </Button>
            <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 border-primary-foreground/30 px-8 text-base text-black hover:bg-primary-foreground/10"
              >
                <Link to="/become-mentor">Become a Mentor</Link>
              </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
