'use client';

import { usePathname } from "next/navigation";
import { ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export function FloatingCartButton() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const isAdminPage = pathname === "/admin";

  useEffect(() => {
    const updateCount = () => {
      const savedCart = localStorage.getItem('wubanchi_cart');
      if (savedCart) {
        try {
          const cart = JSON.parse(savedCart);
          const count = cart.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
          setCartCount(count);
        } catch (e) {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    updateCount();
    window.addEventListener('storage', updateCount);
    window.addEventListener('cart-updated', updateCount);
    
    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('cart-updated', updateCount);
    };
  }, []);

  if (isAdminPage) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[60] animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700">
      <Button 
        asChild
        size="icon"
        className="h-16 w-16 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.2)] bg-primary text-white hover:bg-primary/90 transition-all hover:scale-110 active:scale-95 flex items-center justify-center border-4 border-white"
      >
        <Link href="/cart">
          <ShoppingBasket className="h-8 w-8" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white border-2 border-white animate-pulse">
              {cartCount}
            </span>
          )}
        </Link>
      </Button>
    </div>
  );
}
