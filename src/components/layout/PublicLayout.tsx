import { Header } from './Header';
import { Footer } from './Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function PublicLayout({ children, showFooter = true }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
