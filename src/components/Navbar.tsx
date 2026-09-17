
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, LogOut, Layers } from 'lucide-react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemo } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const auth = useAuth();
  const { user } = useUser();
  const db = useFirestore();

  const userProfileRef = useMemo(() => {
    return user ? doc(db, 'users', user.uid) : null;
  }, [db, user]);

  const { data: profile } = useDoc(userProfileRef);

  const handleLogout = () => {
    signOut(auth).catch(console.error);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <Layers className="h-6 w-6 text-primary" />
              <span>EarnSub</span>
            </Link>

            {user && (
              <div className="hidden sm:flex items-center gap-4">
                <Link
                  href="/"
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                    pathname === '/' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/users"
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                    pathname === '/users' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-sm font-semibold">{user.displayName || user.email}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-full gap-2 border">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground font-medium bg-muted px-3 py-1.5 rounded-full">
                Secure Session Gate
              </span>
            )}
          </div>
        </div>

        {user && (
          <div className="flex sm:hidden border-t py-2 justify-around">
            <Link
              href="/"
              className={`flex flex-col items-center gap-1 text-xs px-3 py-1 rounded-md ${
                pathname === '/' ? 'text-primary font-bold' : 'text-muted-foreground'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link
              href="/users"
              className={`flex flex-col items-center gap-1 text-xs px-3 py-1 rounded-md ${
                pathname === '/users' ? 'text-primary font-bold' : 'text-muted-foreground'
              }`}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
