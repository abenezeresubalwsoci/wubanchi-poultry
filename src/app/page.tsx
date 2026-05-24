
'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Egg, ShoppingBasket, Heart, ShieldCheck, Bird, Newspaper, Loader2, MessageSquare, Quote } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useMemo } from "react";

export default function Home() {
  const db = useFirestore();
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-farm');
  
  // Dynamic news query
  const newsQuery = useMemo(() => query(
    collection(db, 'news'), 
    orderBy('createdAt', 'desc'), 
    limit(2)
  ), [db]);
  
  const { data: newsItems, loading: newsLoading } = useCollection(newsQuery);

  const highlights = [
    { 
      title: "Fresh Farm Eggs", 
      desc: "Harvested daily from our cage-free, organic-fed hens.",
      img: PlaceHolderImages.find(img => img.id === 'organic-eggs'),
      href: "/products?category=eggs"
    },
    { 
      title: "Premium Poultry", 
      desc: "Healthy, antibiotic-free meat processed with the highest standards.",
      img: PlaceHolderImages.find(img => img.id === 'whole-chicken'),
      href: "/products?category=meat"
    },
    { 
      title: "Healthy Chicks", 
      desc: "Day-old chicks bred for vigor and high productivity.",
      img: PlaceHolderImages.find(img => img.id === 'day-old-chicks'),
      href: "/products?category=chicks"
    }
  ];

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Section */}
      <section className="relative h-[250px] w-full overflow-hidden">
        {heroImg && (
          <Image
            src={heroImg.imageUrl}
            alt={heroImg.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImg.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="container relative mx-auto flex h-full flex-col justify-center px-4 md:px-8">
          <div className="max-w-2xl space-y-6 text-white animate-in fade-in slide-in-from-left-8 duration-700">
            <h1 className="text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
              Freshness from Our <span className="text-primary">Farm</span> to Your <span className="text-accent">Table</span>
            </h1>
          </div>
        </div>
      </section>

      {/* News Box Section */}
      <section className="container mx-auto px-4 md:px-8 -mt-10 relative z-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-none shadow-xl bg-primary text-primary-foreground">
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
               newsItems.map((item: any) => (
                 <Card key={item.id} className="border-none bg-card shadow-lg hover:shadow-xl transition-all cursor-pointer group">
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
      <section className="container mx-auto px-4 md:px-8 mt-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="font-bold">100% Organic</h3>
            <p className="text-xs text-muted-foreground">Certified chemical free</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <Heart className="h-8 w-8" />
            </div>
            <h3 className="font-bold">High Welfare</h3>
            <p className="text-xs text-muted-foreground">Happy, healthy poultry</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <Egg className="h-8 w-8" />
            </div>
            <h3 className="font-bold">Fresh Daily</h3>
            <p className="text-xs text-muted-foreground">Directly from the farm</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <ShoppingBasket className="h-8 w-8" />
            </div>
            <h3 className="font-bold">Fast Delivery</h3>
            <p className="text-xs text-muted-foreground">Local farm logistics</p>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold md:text-4xl">Featured Categories</h2>
            <p className="text-muted-foreground">Explore our selection of premium poultry goods.</p>
          </div>
          <Link href="/products" className="hidden items-center gap-2 font-bold text-primary transition-colors hover:text-accent sm:flex">
            View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item, idx) => (
            <Card key={idx} className="group overflow-hidden border-none bg-card transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="relative h-64 overflow-hidden">
                {item.img && (
                  <Image
                    src={item.img.imageUrl}
                    alt={item.img.description}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    data-ai-hint={item.img.imageHint}
                  />
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                <p className="mb-6 text-sm text-muted-foreground">{item.desc}</p>
                <Button variant="outline" asChild className="w-full rounded-full group-hover:bg-primary group-hover:text-primary-foreground">
                  <Link href={item.href}>Browse {item.title}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Community Feedback Section */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-accent p-8 md:p-16">
          <div className="relative z-10 flex flex-col items-center text-center gap-8 lg:flex-row lg:text-left">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-bold text-white">
                <MessageSquare className="h-4 w-4" />
                <span>COMMUNITY VOICES</span>
              </div>
              <h2 className="text-3xl font-bold text-white md:text-5xl">What our customers are saying</h2>
              <p className="text-lg text-white/90 max-w-xl">
                We take pride in our farm-to-table journey. Read the latest feedback from our local community or share your own experience.
              </p>
              
              <div className="grid gap-4 sm:grid-cols-2 mt-8">
                <Card className="bg-white/10 border-none backdrop-blur-md text-white p-6 relative">
                  <Quote className="absolute top-2 right-4 h-8 w-8 opacity-20" />
                  <p className="text-sm italic mb-3">"The freshest eggs in the valley! My kids love visiting the farm shop every Saturday."</p>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-white/30" />
                    <p className="text-xs font-bold">— Maria K.</p>
                  </div>
                </Card>
                <Card className="bg-white/10 border-none backdrop-blur-md text-white p-6 relative">
                  <Quote className="absolute top-2 right-4 h-8 w-8 opacity-20" />
                  <p className="text-sm italic mb-3">"Top quality broiler chicken. Always fresh, ethically raised, and tastes amazing."</p>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-white/30" />
                    <p className="text-xs font-bold">— David L.</p>
                  </div>
                </Card>
              </div>
              
              <div className="pt-4">
                <Button size="lg" variant="secondary" asChild className="rounded-full px-8 text-lg font-bold">
                  <Link href="/contact">Leave Feedback</Link>
                </Button>
              </div>
            </div>
            <div className="flex h-64 w-64 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
              <MessageSquare className="h-32 w-32 text-white" />
            </div>
          </div>
          {/* Abstract background shapes */}
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 left-0 h-48 w-48 rounded-full bg-white/5" />
        </div>
      </section>
    </div>
  );
}
