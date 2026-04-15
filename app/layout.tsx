import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SettingsProvider } from '@/context/SettingsContext';
import { QuoteProvider } from '@/context/QuoteContext';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Star Cleaning — Quote Calculator',
  description: 'Internal tool for generating cleaning quotes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-50 text-zinc-900 antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <AuthGuard>
            <SettingsProvider>
              <QuoteProvider>
                <div className="flex h-screen overflow-hidden bg-zinc-50">
                  <Sidebar />
                  <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                    {children}
                  </main>
                  <MobileNav />
                </div>
              </QuoteProvider>
            </SettingsProvider>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
