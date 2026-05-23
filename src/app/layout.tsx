
import type {Metadata} from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';

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
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
