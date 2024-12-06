'use client';

import { Header } from './header';
import { Footer } from './footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-6 md:py-8">{children}</main>
      <Footer />
    </div>
  );
}
