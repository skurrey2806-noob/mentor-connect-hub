import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="SkillinUp" className="h-7 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              1-on-1 mentoring from real industry professionals. Get clarity, not confusion.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Platform</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/browse" className="hover:text-foreground transition-colors">Browse Mentors</Link></li>
              <li><Link to="/become-mentor" className="hover:text-foreground transition-colors">Become a Mentor</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund" className="hover:text-foreground transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Email Signup */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Stay updated</h4>
            <p className="text-sm text-muted-foreground mb-3">Get notified about new mentors and features.</p>
            <div className="flex gap-2">
              <Input placeholder="you@email.com" className="h-9 rounded-full text-sm" />
              <Button size="sm" className="rounded-full px-4 h-9">Join</Button>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} SkillinUp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
