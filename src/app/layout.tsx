// src/app/layout.tsx (or wherever RootLayout lives)
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Inter } from 'next/font/google';
import { Providers } from "./providers";
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/lib/firebase/auth';
import { LoadingState } from '@/components/LoadingState';
import { useAuth } from '@/lib/firebase/auth';

// Toggle this flag to hide/show navigation
const COMING_SOON_MODE = false;

const inter = Inter({ subsets: ['latin'] });

const RootLayoutContent = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-background text-foreground min-h-screen`}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {/* Header (hidden in Coming Soon mode) */}
            {!COMING_SOON_MODE && <Navbar />}

            {/* Main Content */}
            <main className="pt-16 sm:pt-20">
              {children}
            </main>

            {/* Footer */}
            <footer className="mt-12 py-6 bg-card border-t border-border text-center text-sm text-muted-foreground">
              © 2025 ManoMed AI. All rights reserved.
            </footer>

            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <AuthProvider>
      <RootLayoutContent>{children}</RootLayoutContent>
    </AuthProvider>
  );
};

export default RootLayout;
