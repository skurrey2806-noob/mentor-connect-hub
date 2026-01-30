import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">M</span>
              </div>
              <span className="text-xl font-bold">MenTOR</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connect 1-on-1 with industry mentors and accelerate your career growth.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/browse" className="hover:text-foreground transition-colors">
                  Browse Mentors
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-foreground transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link to="/become-mentor" className="hover:text-foreground transition-colors">
                  Become a Mentor
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/success-stories" className="hover:text-foreground transition-colors">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-foreground transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MenTOR. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
