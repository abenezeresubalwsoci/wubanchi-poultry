'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBasket, ArrowLeft, Trash2, Plus, Minus, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('wubanchi_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('wubanchi_cart', JSON.stringify(cartItems));
      window.dispatchEvent(new Event('cart-updated'));
    }
  }, [cartItems, isLoaded]);

  const total = useMemo(() => cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cartItems]);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast({ variant: "destructive", title: "Item Removed", description: "Product has been taken out of your basket." });
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="rounded-full transition-all active:scale-95">
            <Link href="/products"><ArrowLeft className="h-5 w-5 mr-2" /> Back to Shop</Link>
          </Button>
          <h1 className="text-4xl font-bold">Your Basket</h1>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, idx) => (
                <Card key={item.id} className="border-none bg-card shadow-sm overflow-hidden animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-primary font-bold">ETB {item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-background rounded-full p-1 border shadow-sm">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full transition-all active:scale-75" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-4 w-4" /></Button>
                      <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full transition-all active:scale-75" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-4 w-4" /></Button>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 transition-all active:scale-75" onClick={() => removeItem(item.id)}><Trash2 className="h-5 w-5" /></Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="border-none bg-primary text-primary-foreground shadow-xl sticky top-24 animate-in slide-in-from-right-4 duration-700">
                <CardContent className="p-8 space-y-6">
                  <h2 className="text-2xl font-bold border-b border-white/20 pb-4">Order Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">ETB {total.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Delivery</span><span className="font-bold">ETB 0.00</span></div>
                    <div className="pt-4 border-t border-white/20 flex justify-between text-xl font-bold">
                      <span>Total</span><span>ETB {total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button asChild className="w-full h-14 rounded-full bg-white text-primary hover:bg-white/90 text-lg font-bold gap-2 shadow-lg transition-all active:scale-95">
                    <Link href="/checkout">
                      <CreditCard className="h-5 w-5" /> Proceed to Checkout
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-card rounded-3xl animate-in zoom-in-95 duration-700">
            <div className="bg-primary/10 p-8 rounded-full text-primary animate-bounce"><ShoppingBasket className="h-16 w-16" /></div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Your basket is empty</h2>
              <p className="text-muted-foreground">Looks like you haven't added any fresh poultry yet.</p>
            </div>
            <Button asChild className="rounded-full px-8 py-6 text-lg font-bold transition-all active:scale-95"><Link href="/products">Start Shopping</Link></Button>
          </div>
        )}
      </div>
    </div>
  );
}
