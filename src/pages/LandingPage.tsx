import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PublicLayout } from '@/components/layout/PublicLayout';
import {
  Search,
  CalendarCheck,
  MessageCircle,
  Rocket,
  Users,
  Clock,
  Shield,
  Target,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Find the right mentor',
    description: 'Browse experts across industries and pick someone who fits your goals.',
  },
  {
    icon: CalendarCheck,
    title: 'Book a call',
    description: 'Choose a time that works and book a 1-on-1 video session instantly.',
  },
  {
    icon: MessageCircle,
    title: 'Get real advice',
    description: 'Have an honest conversation. Ask questions. Get clarity on your next move.',
  },
  {
    icon: Rocket,
    title: 'Move forward faster',
    description: 'Apply what you learn and accelerate your career with expert shortcuts.',
  },
];

const categories = [
  'Design', 'Software Development', 'Product Management', 'Data Science',
  'Marketing', 'JEE Preparation', 'Career Guidance', 'Entrepreneurship',
  'AI & Machine Learning', 'Finance', 'Content Writing', 'UX Research',
];

const benefits = [
  { icon: Users, title: 'Personalized Guidance', description: 'Tailored advice for your unique career path.' },
  { icon: Shield, title: 'Real Industry Advice', description: 'Learn from people who've been there.' },
  { icon: Clock, title: 'Flexible Scheduling', description: 'Book sessions on your own time.' },
  { icon: Target, title: 'Clear Pricing', description: 'No hidden fees. Pay per session.' },
  { icon: Sparkles, title: 'No Long-Term Commitment', description: 'Book one call or many — your choice.' },
  { icon: TrendingUp, title: 'Career Growth', description: 'Get insider knowledge to level up faster.' },
];

const faqs = [
  {
    question: 'How does SkillinUp work?',
    answer: 'Browse our mentor directory, find someone whose experience matches your goals, book a session, and connect via video call. It\'s that simple.',
  },
  {
    question: 'How are mentors verified?',
    answer: 'All mentors go through a verification process where we check their professional background, work experience, and credentials.',
  },
  {
    question: 'What does a session cost?',
    answer: 'Each mentor sets their own rate. You can see pricing upfront before booking — no surprises.',
  },
  {
    question: 'Can I become a mentor?',
    answer: 'Yes! If you have industry experience and want to help others grow, click "Become a Mentor" to start your application.',
  },
  {
    question: 'What if I\'m not satisfied?',
    answer: 'We have a satisfaction guarantee. If you\'re not happy with your session, reach out and we\'ll work to make it right.',
  },
];

export default function LandingPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="container relative py-28 md:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-6xl lg:text-7xl leading-[1.1]">
              Talk to Industry Experts.{' '}
              <span className="text-primary">Get Real Career Clarity.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-xl mx-auto">
              Book 1-on-1 calls with verified professionals and get actionable advice — no fluff, just real guidance.
            </p>
            <div className="mt-10">
              <Button size="lg" asChild className="h-13 px-10 text-base rounded-full shadow-soft">
                <Link to="/browse">
                  Book a 1-on-1 Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Floating abstract cards */}
          <div className="mt-16 flex justify-center gap-4 md:gap-6">
            {['Product Strategy', 'System Design', 'Career Switch'].map((label, i) => (
              <div
                key={label}
                className={`rounded-2xl border bg-card/80 backdrop-blur-sm px-5 py-4 shadow-card transition-transform hover:-translate-y-1 ${
                  i === 1 ? '-translate-y-3' : ''
                }`}
              >
                <div className="h-2 w-12 rounded-full bg-primary/20 mb-3" />
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-1">1-on-1 session</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-24 md:py-32">
        <div className="mb-16 text-center">
          <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1 text-xs font-medium">
            How it works
          </Badge>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            What You Can Do Here
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <Card key={step.title} className="border bg-card shadow-none hover:shadow-card transition-shadow group">
              <CardContent className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary mb-5">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Step {i + 1}</span>
                <h3 className="mt-1 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Mentoring Areas - Pill Tags */}
      <section className="bg-muted/30 py-24 md:py-28">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Explore Mentoring Areas
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Find experts across every field — from tech to design to test prep.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {categories.map((cat) => (
              <Link key={cat} to={`/browse?category=${cat.toLowerCase().replace(/\s+/g, '-')}`}>
                <span className="inline-block rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-secondary hover:text-primary cursor-pointer">
                  {cat}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="container py-24 md:py-32">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Why SkillinUp?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Everything you need to make smarter career moves.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {benefits.map((b) => (
            <div key={b.title} className="flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 py-24 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border rounded-xl bg-card px-6 data-[state=open]:shadow-card transition-shadow"
                >
                  <AccordionTrigger className="text-left text-sm font-medium hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl rounded-3xl bg-secondary p-12 md:p-16 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Book your first call today and take the next step in your career.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="h-12 px-8 text-base rounded-full">
                <Link to="/browse">Find a Mentor</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base rounded-full">
                <Link to="/become-mentor">Become a Mentor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
