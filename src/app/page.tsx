
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
import { 
  ArrowRight, 
  Egg, 
  ShoppingBasket, 
  Heart, 
  ShieldCheck, 
  Newspaper, 
  Loader2, 
  MessageSquare, 
  Plus, 
  Send, 
  CheckCircle2, 
  Bird, 
  History, 
  Target, 
  Eye, 
  Sparkles, 
  Users,
  Construction,
  Phone,
  Mail,
  MapPin,
  Copy
} from "lucide-react";
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
  const { data: settings, loading: settingsLoading } = useDoc(settingsRef);

  // Core Values Data
  const coreValues = [
    { 
      title: "Quality and Safety", 
      desc: "We adhere to the highest international standards for food safety and animal welfare, ensuring every product is healthy and safe for your family." 
    },
    { 
      title: "Sustainability & Eco-Friendliness", 
      desc: "Our integrated farming practices minimize waste and protect the local environment of Bahir Dar for future generations." 
    },
    { 
      title: "Social Impact & Inclusivity", 
      desc: "We actively empower local smallholder farmers and create meaningful job opportunities within our community." 
    },
    { 
      title: "Integrity & Accessibility", 
      desc: "We believe in fair pricing, transparency in our farming methods, and making premium nutrition accessible to everyone." 
    }
  ];

  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  // Carousel Logic
  const heroSlides = useMemo(() => {
    const list: HeroSlide[] = [];
    
    if (settings?.heroSlides && Array.isArray(settings.heroSlides) && settings.heroSlides.length > 0) {
      list.push(...settings.heroSlides);
    } 
    
    if (list.length === 0 && !settingsLoading) {
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
  }, [settings?.heroSlides, settingsLoading]);

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
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

  const managersQuery = useMemo(() => query(
    collection(db, 'managers'),
    orderBy('createdAt', 'desc'),
    limit(4)
  ), [db]);
  const { data: managers, loading: managersLoading } = useCollection(managersQuery);

  const facilitiesQuery = useMemo(() => query(
    collection(db, 'facilities'),
    orderBy('createdAt', 'desc')
  ), [db]);
  const { data: facilities, loading: facilitiesLoading } = useCollection(facilitiesQuery);

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `Phone number ${text} copied to clipboard.` });
  };

  return (
    <div className="flex flex-col gap-16 pb-24 animate-in fade-in duration-700">
      {/* Hero Section - Compact height */}
      <section className="relative h-[250px] w-full overflow-hidden bg-muted">
        {settingsLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-30" />
          </div>
        ) : (
          <>
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
                      <h1 className="text-3xl font-bold leading-tight md:text-4xl text-shadow-lg">
                        {slide.title}
                      </h1>
                      <p className="text-base opacity-90 max-w-lg text-shadow animate-in fade-in slide-in-from-left-12 duration-1000 delay-300">
                        {slide.subtitle}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {heroSlides.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentHeroIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-700 ${idx === currentHeroIndex ? 'w-8 bg-primary shadow-lg shadow-primary/40' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* News Box Section */}
      <section className="container mx-auto px-4 md:px-8 -mt-10 relative z-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-none shadow-xl bg-primary text-primary-foreground transition-transform hover:scale-[1.02]">
            <CardContent className="p-6 flex items-center gap-4 h-full">
              <div className="rounded-full bg-white/20 p-3">
                < Newspaper className="h-6 w-6" />
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
                 <Loader2 className="h-6 w-6 animate-spin text-primary opacity-20" />
               </div>
             ) : newsItems?.length ? (
               newsItems.map((item: any) => (
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
            {featuredProducts.map((product: any) => {
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
            <p className="text-muted-foreground italic mb-4">No products available at the moment. Add some in the Admin dashboard!</p>
          </div>
        )}
      </section>

      {/* About Us Expanded Section */}
      <section className="container mx-auto px-4 md:px-8 animate-in fade-in duration-1000 delay-600">
        <div className="bg-card rounded-[3rem] p-8 md:p-16 overflow-hidden relative shadow-sm border border-primary/10">
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
                  Our mission is to provide nutritious, safe, and affordable poultry and fish products through innovative and eco-friendly integrated farming practices. We commit to empowering smallholder farmers through training and market linkages, creating jobs, and contributing to the global fight against hunger and poverty.
                </p>
              </div>
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Eye className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-xl">Our Vision</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To be the leading and most trusted integrated farming enterprise in BahirDar, ensuring food security by delivering high-quality, sustainably produced poultry and fish products to every household.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-primary/10">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Sparkles className="h-5 w-5" />
                <h4>Our Core Values</h4>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {coreValues.map((value) => (
                    <button 
                      key={value.title} 
                      onClick={() => setSelectedValue(selectedValue === value.title ? null : value.title)}
                      className={`px-4 py-2 rounded-full text-xs font-bold border shadow-sm transition-all active:scale-95 ${selectedValue === value.title ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground hover:bg-primary/5'}`}
                    >
                      {value.title}
                    </button>
                  ))}
                </div>
                {selectedValue && (
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-sm text-muted-foreground italic">
                      {coreValues.find(v => v.title === selectedValue)?.desc}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Management Team Section */}
            <div className="space-y-8 pt-8 border-t border-primary/10">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Users className="h-5 w-5" />
                <h4>Management Team</h4>
              </div>
              {managersLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary opacity-20" /></div>
              ) : managers?.length ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {managers.map((m: any) => (
                    <div key={m.id} className="flex gap-4 items-center p-3 rounded-2xl bg-white shadow-sm border border-gray-50 transition-all hover:shadow-md group">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                        {m.imageUrl ? (
                          <Image src={m.imageUrl} alt={m.name} fill className="object-cover transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground"><Users className="h-6 w-6" /></div>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">{m.name}</h5>
                        <p className="text-xs text-primary font-medium">{m.role}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{m.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Management team profiles coming soon.</p>
              )}
            </div>

            {/* Operations & Facilities Section */}
            <div className="space-y-8 pt-8 border-t border-primary/10">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Construction className="h-5 w-5" />
                <h4>Operations & Facilities</h4>
              </div>
              {facilitiesLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary opacity-20" /></div>
              ) : facilities?.length ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {facilities.map((f: any) => (
                    <div key={f.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex flex-col md:flex-row gap-6 items-center transition-all hover:shadow-md">
                      <div className="relative h-32 w-full md:w-32 rounded-2xl overflow-hidden shrink-0">
                        {f.imageUrl ? (
                          <Image src={f.imageUrl} alt={f.name} fill className="object-cover" />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground"><Construction className="h-8 w-8" /></div>
                        )}
                      </div>
                      <div className="space-y-2 text-left">
                        <h5 className="font-bold text-lg">{f.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {f.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Operational areas coming soon.</p>
              )}
            </div>

            {/* Quick Contact Section */}
            <div className="space-y-8 pt-8 border-t border-primary/10">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Phone className="h-5 w-5" />
                <h4>Quick Contact</h4>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex items-start gap-4 h-full">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div className="text-left space-y-2">
                    <p className="text-sm font-bold text-foreground">Call Us</p>
                    <div className="flex flex-col gap-1">
                      {['+251932224193', '+251920774757', '+251969058626'].map((num) => (
                        <div key={num} className="flex items-center gap-2 group/num">
                          <a href={`tel:${num}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            {num}
                          </a>
                          <button 
                            onClick={() => handleCopy(num)}
                            className="p-1 rounded-md hover:bg-muted opacity-0 group-hover/num:opacity-100 transition-opacity"
                            title="Copy to clipboard"
                          >
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">Email Us</p>
                    <p className="text-muted-foreground">contact@wubanchi.com</p>
                  </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">Address</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">Bahir Dar, Ethiopia, Bahir Dar Kebele 05 & 08, and Gonder, Ethiopia, Gondar- Piassa Sub City, Coming soon in Gorgora and Lalibela</p>
                  </div>
                </div>
                <Link 
                  href="http://tiktok.com/@twchicken_fish" 
                  target="_blank"
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex items-center gap-4 transition-all hover:shadow-md hover:border-primary/20 group"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                      className="h-6 w-6 fill-current"
                    >
                      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">TikTok</p>
                    <p className="text-muted-foreground group-hover:text-primary transition-colors">@twchicken_fish</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Feedback Section */}
      <section className="container mx-auto px-4 md:px-8 animate-in fade-in duration-1000 delay-700">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-16">
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
