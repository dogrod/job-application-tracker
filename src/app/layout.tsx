import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// import Link from 'next/link';

import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Resume Wise - One-click Job Application Assistant',
  description: 'Apply your dream job, track interviews, and more',
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
          <header>
            <div className="container">
                <div className="header-content">
                    <a href="#" className="logo">
                        <div className="logo-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                            </svg>
                        </div>
                        Resume Wise
                    </a>
                    <div className="header-actions">
                        <button className="btn btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                            </svg>
                            Add Application
                        </button>
                    </div>
                </div>
            </div>
          </header>
          <main className="container">
            {children}
          </main>
          <footer>
            <div className="container">
                <div className="footer-content">
                    <div className="copyright">&copy; {new Date().getFullYear()} Resume Wise. All rights reserved.</div>
                    <div className="footer-links">
                        <a href="#">Terms</a>
                        <a href="#">Privacy</a>
                        <a href="#">Help</a>
                    </div>
                </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
