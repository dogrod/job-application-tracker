import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';

import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Dream Tracker - Job Application Tracking',
  description: 'Track your job applications, interviews, and more',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-background`}>
        <div className="min-h-screen flex flex-col">
          <header className="mercury-header">
            <div className="mercury-container flex items-center justify-between h-14">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span className="inline-block text-xl font-semibold text-foreground">
                    Dream Tracker
                  </span>
                </Link>
                <nav className="hidden md:flex items-center space-x-6">
                  <Link 
                    href="/" 
                    className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/applications" 
                    className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                  >
                    Applications
                  </Link>
                  <Link 
                    href="/interviews" 
                    className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                  >
                    Interviews
                  </Link>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <Link 
                  href="/applications/new" 
                  className="mercury-button mercury-button-primary text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  Add Application
                </Link>
              </div>
            </div>
          </header>
          <main className="flex-1">
            <div className="mercury-container py-6 md:py-8">
              {children}
            </div>
          </main>
          <footer className="border-t border-border py-6">
            <div className="mercury-container flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Dream Tracker. All rights reserved.
              </p>
              <nav className="flex items-center gap-4">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Help
                </a>
              </nav>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
