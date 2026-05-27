'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, Egg, ShoppingBasket, Heart, ShieldCheck, Newspaper, Loader2, MessageSquare, Plus, Send, CheckCircle2, Bird, History, Target, Eye, Sparkles } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useCollection, useFirestore, useDoc } from "@/firebase";
import { collection, query, orderBy, limit, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface HeroSlide {
  imageUrl: string;
  title: string;
  subtitle: string;
}

export default function Home() {
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  
  const settingsRef = useMemo(() => doc(db, 'settings', 'general'), [db]);
  const { data: settings } = useDoc(settingsRef);

  // Carousel Logic
  const heroSlides = useMemo(() => {
    const list: HeroSlide[] = [];
    
    if (settings?.heroSlides && Array.isArray(settings.heroSlides) && settings.heroSlides.length > 0) {
      list.push(...settings.heroSlides);
    } 
    
    if (list.length === 0) {
      list.push({
        imageUrl: PlaceHolderImages.find(img => img.id === 'hero-farm')?.imageUrl || '',
        title: 'Welcome to Wubanchi',
        subtitle: 'Experience the freshest poultry products in Bahir Dar'
      });
      list.push({
        imageUrl: PlaceHolderImages.find(img => img.id === 'farm-story')?.imageUrl || '',
        title: 'Three Generations of Care',
        subtitle: 'Raised with love and expertise since 1994'
      });
    }
    
    return list;
  }, [settings?.heroSlides]);

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const newsQuery = useMemo(() => query(
    collection(db, 'news'), 
    orderBy('createdAt', 'desc'), 
    limit(2)
  ), [db]);
  
  const { data: newsItems, loading: newsLoading } = useCollection(newsQuery);

  const productsQuery = useMemo(() => query(
    collection(db, 'products'), 
    orderBy('createdAt', 'desc'), 
    limit(4)
  ), [db]);
  
  const { data: featuredProducts, loading: productsLoading } = useCollection(productsQuery);

  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.name || !feedbackForm.comment) return;

    setIsSubmitting(true);
    const data = {
      ...feedbackForm,
      createdAt: serverTimestamp()
    };

    addDoc(collection(db, 'feedback'), data)
      .then(() => {
        setIsSubmitted(true);
        setFeedbackForm({ name: '', email: '', comment: '' });
        toast({ title: "Feedback Received", description: "Thank you for sharing your thoughts!" });
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'feedback',
          operation: 'create',
          requestResourceData: data
        }));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    e.preventDefault();
    
    const savedCart = localStorage.getItem('wubanchi_cart');
    let cart = savedCart ? JSON.parse(savedCart) : [];
    
    const existing = cart.find((item: any) => item.id === product.id);
    const displayImageUrl = product.imageUrl || (PlaceHolderImages.find(img => img.id === product.imageId)?.imageUrl) || PlaceHolderImages[0].imageUrl;
    
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: displayImageUrl,
        quantity: 1
      });
    }
    
    localStorage.setItem('wubanchi_cart', JSON.stringify(cart));
    toast({ title: "Added to Basket", description: `${product.name} ready for checkout.` });
  };

  return (
    <div className="flex flex-col gap-16 pb-24 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative h-[250px] w-full overflow-hidden">
        {heroSlides.map((slide, idx) => (
          <div 
            key={slide.imageUrl + idx}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${idx === currentHeroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              className="object-cover"
              priority={idx === 0}
              data-ai-hint="poultry farm"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            
            {idx === currentHeroIndex && (
              <div className="container relative mx-auto flex h-full flex-col justify-center px-4 md:px-8 z-20">
                <div className="max-w-2xl space-y-4 text-white animate-in fade-in slide-in-from-left-12 duration-1000">
                  <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl text-shadow-lg">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl opacity-90 max-w-lg text-shadow animate-in fade-in slide-in-from-left-12 duration-1000 delay-300">
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
        
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroIndex(idx)}
              className={`h-2 rounded-full transition-all duration-700 ${idx === currentHeroIndex ? 'w-10 bg-primary shadow-lg shadow-primary/40' : 'w-2 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      </section>

      {/* News Box Section */}
      <section className="container mx-auto px-4 md:px-8 -mt-10 relative z-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-none shadow-xl bg-primary text-primary-foreground transition-transform hover:scale-[1.02]">
            <CardContent className="p-6 flex items-center gap-4 h-full">
              <div className="rounded-full bg-white/20 p-3">
                <Newspaper className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Farm News</h3>
                <p className="text-sm opacity-90 text-white/80">Stay updated with Wubanchi</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
             {newsLoading ? (
               <div className="col-span-2 flex items-center justify-center p-8 bg-card rounded-xl">
                 <Loader2 className="h-6 w-6 animate-spin text-primary" />
               </div>
             ) : newsItems?.length ? (
               newsItems.map((item: any, idx: number) => (
                 <Card key={item.id} className="border-none bg-card shadow-lg hover:shadow-xl transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <CardContent className="p-6 flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider">{item.date}</p>
                        <h4 className="font-bold group-hover:text-primary transition-colors">{item.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">{item.desc}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                   </CardContent>
                 </Card>
               ))
             ) : (
               <div className="col-span-2 flex items-center justify-center p-8 bg-card rounded-xl text-muted-foreground text-sm italic">
                 Check back soon for latest updates!
               </div>
             )}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 md:px-8 mt-4 animate-in fade-in duration-1000 delay-300">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {[
            { icon: ShieldCheck, title: "100% Organic", desc: "Certified chemical free" },
            { icon: Heart, title: "High Welfare", desc: "Happy, healthy poultry" },
            { icon: Egg, title: "Fresh Daily", desc: "Directly from the farm" },
            { icon: ShoppingBasket, title: "Fast Delivery", desc: "Local farm logistics" }
          ].map((badge, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-2 group">
              <div className="rounded-full bg-primary/10 p-4 text-primary transition-transform group-hover:scale-110 duration-300">
                <badge.icon className="h-8 w-8" />
              </div>
              <h3 className="font-bold transition-colors group-hover:text-primary">{badge.title}</h3>
              <p className="text-xs text-muted-foreground">{badge.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Real-time Products Section */}
      <section className="container mx-auto px-4 md:px-8 animate-in fade-in duration-1000 delay-500">
        <div className="mb-12 flex items-end justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold md:text-4xl">Featured Products</h2>
            <p className="text-muted-foreground">Fresh from our farm, delivered to your doorstep.</p>
          </div>
          <Link href="/products" className="hidden items-center gap-2 font-bold text-primary transition-all hover:text-accent sm:flex group">
            View All Products <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        {productsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
          </div>
        ) : featuredProducts?.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
            {featuredProducts.map((product: any, idx: number) => {
              const displayImageUrl = product.imageUrl || (PlaceHolderImages.find(img => img.id === product.imageId)?.imageUrl) || PlaceHolderImages[0].imageUrl;
              const imgHint = PlaceHolderImages.find(img => img.id === product.imageId)?.imageHint || 'poultry product';
              
              return (
                <Link key={product.id} href={`/products/${product.id}`} className="block animate-in fade-in zoom-in-95 duration-500">
                  <Card className="relative group overflow-hidden border-none bg-white rounded-3xl transition-all hover:shadow-2xl h-full hover:-translate-y-1">
                    <button className="absolute right-4 top-4 z-10 text-destructive/80 transition-transform hover:scale-125 duration-300" onClick={(e) => e.preventDefault()}>
                      <Heart className="h-6 w-6" />
                    </button>
                    <div className="relative h-56 w-full p-6 flex items-center justify-center bg-gray-50/50 transition-colors group-hover:bg-primary/5">
                      <div className="relative h-full w-full overflow-hidden">
                        <Image
                          src={displayImageUrl}
                          alt={product.name}
                          fill
                          className="object-contain transition-transform duration-700 group-hover:scale-110"
                          data-ai-hint={imgHint}
                        />
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="space-y-1 mb-4">
                        <h3 className="text-xl font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-foreground">ETB {(product.price || 0).toFixed(2)}</span>
                        <Button onClick={(e) => handleAddToCart(e, product)} className="h-9 w-9 bg-primary hover:bg-primary/90 rounded-lg p-0 flex items-center justify-center shadow-md active:scale-75 transition-all">
                          <Plus className="h-5 w-5 text-white" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl text-center">
            <p className="text-muted-foreground italic mb-4">No products available at the moment.</p>
          </div>
        )}
      </section>

      {/* About Us Expanded Section */}
      <section className="container mx-auto px-4 md:px-8 animate-in fade-in duration-1000 delay-600">
        <div className="bg-card rounded-[3rem] p-8 md:p-16 overflow-hidden relative shadow-sm border border-primary/10">
          <div className="grid gap-16 lg:grid-cols-2">
            <div className="space-y-12">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-bold text-primary">
                   <Bird className="h-4 w-4" />
                   <span>THE WUBANCHI LEGACY</span>
                </div>
                <h2 className="text-4xl font-bold md:text-5xl leading-tight">Rooted in Quality, Driven by Care</h2>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                   <History className="h-6 w-6 text-primary shrink-0 mt-1" />
                   <div>
                      <h4 className="font-bold text-lg">Our History</h4>
                      <p className="text-muted-foreground">
                        Founded in 1994, Wubanchi began with a simple mission: to provide truly fresh, organic poultry to our neighbors in Bahir Dar. Today, we carry forward that legacy with modern sustainability and the same family values that have guided us for three generations.
                      </p>
                   </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                    <Target className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-xl">Our Mission</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    To deliver premium, organic poultry products while fostering sustainable farming practices that empower our local Bahir Dar community.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Eye className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-xl">Our Vision</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    To become Ethiopia's benchmark for regenerative poultry farming, recognized for exceptional quality and ethical animal welfare.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-primary/10">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Sparkles className="h-5 w-5" />
                  <h4>Our Core Values</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  {["Integrity", "Sustainability", "Quality", "Community First", "Animal Welfare", "Transparency"].map((value) => (
                    <div key={value} className="bg-white px-4 py-2 rounded-full text-xs font-bold border shadow-sm text-muted-foreground">
                      {value}
                    </div>
                  ))}
                </div>
              </div>

              <Button asChild className="rounded-full px-8 h-14 text-lg font-bold group shadow-xl">
                <Link href="/about">
                  Full Story <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            <div className="relative h-full min-h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl group">
              <Image 
                src={PlaceHolderImages.find(img => img.id === 'farm-story')?.imageUrl || ''} 
                alt="Farm Story" 
                fill 
                className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                data-ai-hint="ethiopian farmers"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 text-white space-y-2">
                <div className="flex items-center gap-3">
                   <div className="h-px w-12 bg-white/50" />
                   <p className="font-bold uppercase tracking-widest text-xs opacity-80">Heritage Poultry</p>
                </div>
                <h3 className="text-3xl font-bold">Quality You Can Taste</h3>
                <p className="opacity-90 max-w-xs text-sm">Experience three generations of organic farming expertise in every bite.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Feedback Section */}
      <section className="container mx-auto px-4 md:px-8 animate-in fade-in duration-1000 delay-700">
        <div className="relative overflow-hidden rounded-3xl bg-accent p-8 md:p-16">
          <div className="relative z-10 flex flex-col items-center text-center gap-12 lg:flex-row lg:text-left">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-bold text-white">
                <MessageSquare className="h-4 w-4" />
                <span>COMMUNITY VOICES</span>
              </div>
              <h2 className="text-3xl font-bold text-white md:text-5xl">Share Your Experience</h2>
              <p className="text-lg text-white/90 max-w-xl">
                We take pride in our farm-to-table journey. Your feedback helps us grow and serve our community better.
              </p>
            </div>
            <div className="w-full lg:max-w-md">
              <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm">
                <CardContent className="p-8">
                  {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-95">
                      <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
                      <h3 className="text-2xl font-bold text-foreground">Thank You!</h3>
                      <p className="text-muted-foreground">Your feedback has been submitted.</p>
                      <Button variant="outline" className="mt-6 rounded-full" onClick={() => setIsSubmitted(false)}>Send Another</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                      <div className="space-y-2 text-left">
                        <Label htmlFor="name" className="text-foreground font-bold">Your Name</Label>
                        <Input id="name" placeholder="John Doe" value={feedbackForm.name} onChange={e => setFeedbackForm({...feedbackForm, name: e.target.value})} required />
                      </div>
                      <div className="space-y-2 text-left">
                        <Label htmlFor="comment" className="text-foreground font-bold">Your Comment</Label>
                        <Textarea id="comment" placeholder="Tell us what you think..." value={feedbackForm.comment} onChange={e => setFeedbackForm({...feedbackForm, comment: e.target.value})} className="min-h-[120px]" required />
                      </div>
                      <Button type="submit" className="w-full rounded-full py-6 text-lg font-bold gap-2 active:scale-95" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        Submit Feedback
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
