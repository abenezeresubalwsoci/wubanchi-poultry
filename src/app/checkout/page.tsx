'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, MapPin, CreditCard, Truck, CheckCircle2, Loader2, Navigation } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();

  const [isLoaded, setIsLoaded] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: 'Addis Ababa',
    address: '',
    landmark: '',
    paymentMethod: 'cash'
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('wubanchi_cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    } else {
      router.push('/cart');
    }
    setIsLoaded(true);
  }, [router]);

  const total = useMemo(() => cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cartItems]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsSubmitting(true);
    
    const orderData = {
      customerName: formData.fullName,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      deliveryAddress: {
        city: formData.city,
        street: formData.address,
        landmark: formData.landmark
      },
      items: cartItems,
      total: total,
      paymentMethod: formData.paymentMethod,
      status: 'pending',
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'orders'), orderData);
      localStorage.removeItem('wubanchi_cart');
      setIsSuccess(true);
      toast({ title: "Order Placed!", description: "We'll contact you shortly for delivery." });
    } catch (error) {
      console.error("Error placing order:", error);
      toast({ variant: "destructive", title: "Order Failed", description: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>;

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-8 animate-in zoom-in-95 duration-700">
        <div className="mx-auto bg-green-100 p-8 rounded-full w-fit text-green-600 animate-bounce">
          <CheckCircle2 className="h-20 w-20" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Order Confirmed!</h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Thank you for choosing Wubanchi. Your fresh poultry will be on its way soon. We have sent a confirmation to your email.
          </p>
        </div>
        <Button asChild className="rounded-full px-12 h-14 text-lg font-bold shadow-lg transition-all active:scale-95">
          <Link href="/products">Return to Store</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-8 animate-in fade-in duration-700">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="rounded-full transition-all active:scale-95">
            <Link href="/cart"><ArrowLeft className="h-5 w-5 mr-2" /> Back to Basket</Link>
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-8">
            {/* Delivery Details */}
            <Card className="border-none shadow-sm bg-card animate-in slide-in-from-bottom-4 duration-500">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg text-primary"><MapPin className="h-5 w-5" /></div>
                <div>
                  <CardTitle>Delivery & Location</CardTitle>
                  <CardDescription>Where should we bring your fresh poultry?</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Map Integration */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-bold flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-primary" />
                      Pin Your Location
                    </Label>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Addis Ababa, Ethiopia</span>
                  </div>
                  <div className="relative h-[250px] w-full overflow-hidden rounded-2xl border-2 border-primary/10 shadow-inner group">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126115.11525281987!2d38.7042621!3d9.010793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85cef5ab402d%3A0x8467b6b037a24c49!2sAddis%20Ababa!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      className="transition-opacity duration-500 group-hover:opacity-90"
                    ></iframe>
                    <div className="absolute inset-0 pointer-events-none border-[6px] border-white/20 rounded-2xl"></div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="John Doe" className="bg-background transition-all focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+251..." className="bg-background transition-all focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email (Optional)</Label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" className="bg-background transition-all focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <Label>Street Address</Label>
                  <Input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="House number, Street name" className="bg-background transition-all focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <Label>Location Indicator / Landmark</Label>
                  <Textarea required value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} placeholder="Near the yellow gate, opposite the central market..." className="min-h-[80px] bg-background resize-none transition-all focus:ring-2 focus:ring-primary/20" />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="border-none shadow-sm bg-card animate-in slide-in-from-bottom-4 duration-500 delay-100">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg text-primary"><CreditCard className="h-5 w-5" /></div>
                <div>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Select how you'd like to pay.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup value={formData.paymentMethod} onValueChange={val => setFormData({...formData, paymentMethod: val})} className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                    <Label htmlFor="cash" className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-primary/5 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                      <Truck className="mb-3 h-6 w-6" />
                      <span className="font-bold">Cash on Delivery</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="telebirr" id="telebirr" className="peer sr-only" />
                    <Label htmlFor="telebirr" className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-primary/5 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                      <CreditCard className="mb-3 h-6 w-6" />
                      <span className="font-bold">Telebirr / Digital</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl bg-primary text-primary-foreground sticky top-24 animate-in slide-in-from-right-4 duration-700">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                      <div className="flex gap-3 items-center">
                        <div className="relative h-10 w-10 rounded-md overflow-hidden bg-white/20 flex-shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold line-clamp-1">{item.name}</p>
                          <p className="opacity-70">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold">ETB {(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 pt-4 border-t border-white/20">
                  <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">ETB {total.toFixed(0)}</span></div>
                  <div className="flex justify-between"><span>Delivery</span><span className="font-bold">ETB 0.00</span></div>
                  <div className="pt-4 border-t border-white/20 flex justify-between text-2xl font-bold">
                    <span>Total</span><span>ETB {total.toFixed(0)}</span>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-full bg-white text-primary hover:bg-white/90 text-xl font-bold shadow-2xl transition-all active:scale-95 group">
                  {isSubmitting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>Confirm Order <ArrowLeft className="ml-2 h-6 w-6 rotate-180 transition-transform group-hover:translate-x-1" /></>
                  )}
                </Button>
                <p className="text-center text-xs opacity-70">By confirming, you agree to our delivery terms.</p>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
