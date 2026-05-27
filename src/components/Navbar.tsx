"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Bird, ShoppingBasket, Info, MessageSquare, Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { translateToAmharic } from "@/ai/flows/translate-flow";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { name: "Products", href: "/products", icon: ShoppingBasket },
  { name: "About", href: "/about", icon: Info },
  { name: "Contact", href: "/contact", icon: MessageSquare },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const pathname = usePathname();
  const db = useFirestore();
  const { toast } = useToast();
  const isAdminPage = pathname === "/admin";
  
  const settingsRef = useMemo(() => doc(db, 'settings', 'general'), [db]);
  const { data: settings } = useDoc(settingsRef);

  const fallbackLogo = PlaceHolderImages.find(img => img.id === 'app-logo');
  const logoUrl = settings?.logoUrl || fallbackLogo?.imageUrl;

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      // Find all heading and paragraph elements to translate for demonstration
      const elements = document.querySelectorAll('h1, h2, h3, p, span.nav-item-text');
      toast({ title: "Translating...", description: "AI is preparing the Amharic version." });
      
      for (let i = 0; i < Math.min(elements.length, 10); i++) {
        const el = elements[i] as HTMLElement;
        if (el.innerText.trim()) {
          const translation = await translateToAmharic(el.innerText);
          el.innerText = translation;
        }
      }
      toast({ title: "Translation Complete", description: "Page has been partially translated to Amharic." });
    } catch (error) {
      toast({ variant: "destructive", title: "Translation Failed", description: "Could not connect to the translation service." });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <div className="flex items-center justify-center rounded-full overflow-hidden h-10 w-10 text-primary-foreground">
              {logoUrl ? (
                <div className="relative w-full h-full">
                  <Image 
                    src={logoUrl} 
                    alt="Wubanchi Logo" 
                    fill
                    className="object-cover"
                    data-ai-hint="poultry logo"
                  />
                </div>
              ) : (
                <div className="bg-primary p-2 rounded-full">
                  <Bird className="h-6 w-6" />
                </div>
              )}
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Wubanchi</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:gap-4 lg:gap-6">
            {!isAdminPage && navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <item.icon className="h-4 w-4" />
                <span className="nav-item-text">{item.name}</span>
              </Link>
            ))}
            {!isAdminPage && (
              <div className="flex items-center gap-2 border-l pl-4 ml-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleTranslate} 
                  disabled={isTranslating}
                  className="gap-2 text-xs font-bold text-primary hover:text-primary/80 hover:bg-primary/5 rounded-full"
                >
                  {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                  Translate to Amharic
                </Button>
                <Button variant="default" asChild className="rounded-full shadow-sm">
                  <Link href="/products">Order Now</Link>
                </Button>
              </div>
            )}
            {isAdminPage && (
              <span className="text-sm font-bold text-primary uppercase tracking-widest">Admin Portal</span>
            )}
          </div>

          {/* Mobile Nav Toggle */}
          {!isAdminPage && (
            <div className="flex items-center gap-2 md:hidden">
               <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleTranslate} 
                  disabled={isTranslating}
                  className="text-primary rounded-full"
                >
                  {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="text-foreground"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && !isAdminPage && (
        <div className="md:hidden border-t bg-white animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1 px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                <item.icon className="h-5 w-5 text-primary" />
                <span className="nav-item-text">{item.name}</span>
              </Link>
            ))}
            <div className="pt-4 px-3 space-y-3">
              <Button className="w-full rounded-full" asChild>
                <Link href="/products" onClick={() => setIsOpen(false)}>Shop Products</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
