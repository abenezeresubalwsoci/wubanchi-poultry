
import type {Metadata} from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { Toaster } from '@/components/ui/toaster';
import { ShoppingBasket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Wubanchi - Premium Poultry & Care',
  description: 'Your destination for fresh eggs, meat, and expert poultry care advice.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30">
        <FirebaseClientProvider>
          <FirebaseErrorListener />
          <Navbar />
          <main className="flex-grow">{children}</main>
          
          {/* Global Floating Cart Button */}
          <div className="fixed bottom-8 right-8 z-[60] animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700">
            <Button 
              asChild
              size="icon"
              className="h-16 w-16 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.2)] bg-primary text-white hover:bg-primary/90 transition-all hover:scale-110 active:scale-95 flex items-center justify-center border-4 border-white"
            >
              <Link href="/products">
                <ShoppingBasket className="h-8 w-8" />
                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white border-2 border-white animate-pulse">
                  0
                </span>
              </Link>
            </Button>
          </div>

          <Footer />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
