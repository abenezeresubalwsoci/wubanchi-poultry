
'use client';

import { useMemo, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { 
  Users, 
  Target, 
  Eye, 
  Sparkles, 
  Construction, 
  CheckCircle2,
  Loader2,
  Quote
} from "lucide-react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function About() {
  const db = useFirestore();
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  // Fetch Management Team
  const managersQuery = useMemo(() => query(
    collection(db, 'managers'),
    orderBy('createdAt', 'desc')
  ), [db]);
  const { data: managers, loading: managersLoading } = useCollection(managersQuery);

  // Fetch Facilities
  const facilitiesQuery = useMemo(() => query(
    collection(db, 'facilities'),
    orderBy('createdAt', 'desc')
  ), [db]);
  const { data: facilities, loading: facilitiesLoading } = useCollection(facilitiesQuery);

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

  const storyImg = PlaceHolderImages.find(img => img.id === 'farm-story');

  return (
    <div className="space-y-24 pb-24 animate-in fade-in duration-700">
      {/* Header */}
      <section className="bg-card py-24 border-b">
        <div className="container mx-auto px-4 md:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-bold text-primary mb-4">
             <span>ESTABLISHED 1994</span>
          </div>
          <h1 className="text-4xl font-bold md:text-6xl">Rooted in Quality, <br/><span className="text-primary">Driven by Care</span></h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Wubanchi started with a small backyard coop and a big dream: to bring truly fresh, healthy poultry to every family in Ethiopia.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-none bg-primary text-primary-foreground p-8 rounded-[2.5rem] shadow-xl transition-all hover:scale-[1.01]">
            <CardContent className="p-0 space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Target className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold">Our Mission</h2>
              <p className="text-lg leading-relaxed opacity-90">
                To provide nutritious, safe, and affordable poultry and fish products through innovative and eco-friendly integrated farming practices. We commit to empowering smallholder farmers through training and market linkages, creating jobs, and contributing to the global fight against hunger and poverty.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none bg-accent text-accent-foreground p-8 rounded-[2.5rem] shadow-xl transition-all hover:scale-[1.01]">
            <CardContent className="p-0 space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Eye className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold">Our Vision</h2>
              <p className="text-lg leading-relaxed opacity-90">
                To be the leading and most trusted integrated farming enterprise in Bahir Dar, ensuring food security by delivering high-quality, sustainably produced poultry and fish products to every household.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Core Values */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="bg-card rounded-[3rem] p-8 md:p-16 border border-primary/10 shadow-sm overflow-hidden relative">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Sparkles className="h-6 w-6" />
                  <h2 className="text-3xl font-bold">Our Core Values</h2>
                </div>
                <p className="text-muted-foreground text-lg">
                  These principles guide every decision we make, from the welfare of our birds to the service we provide our customers.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {coreValues.map((value) => (
                    <button 
                      key={value.title} 
                      onClick={() => setSelectedValue(selectedValue === value.title ? null : value.title)}
                      className={`px-6 py-3 rounded-full text-sm font-bold border shadow-sm transition-all active:scale-95 ${selectedValue === value.title ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground hover:bg-primary/5'}`}
                    >
                      {value.title}
                    </button>
                  ))}
                </div>
                {selectedValue && (
                  <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <p className="text-lg text-foreground italic leading-relaxed">
                      "{coreValues.find(v => v.title === selectedValue)?.desc}"
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="relative h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl">
              {storyImg && (
                <Image
                  src={storyImg.imageUrl}
                  alt={storyImg.description}
                  fill
                  className="object-cover"
                  data-ai-hint={storyImg.imageHint}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Management Team */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary font-bold">
            <Users className="h-6 w-6" />
            <span>EXPERT GUIDANCE</span>
          </div>
          <h2 className="text-4xl font-bold">Management Team</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Dedicated professionals bringing decades of experience in agriculture, sustainability, and management.
          </p>
        </div>

        {managersLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
          </div>
        ) : managers?.length ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {managers.map((m: any) => (
              <Card key={m.id} className="group border-none bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col">
                <div className="relative h-64 w-full bg-muted overflow-hidden">
                  {m.imageUrl ? (
                    <Image 
                      src={m.imageUrl} 
                      alt={m.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground/30">
                      <Users className="h-16 w-16" />
                    </div>
                  )}
                </div>
                <CardContent className="p-8 space-y-3 flex-grow text-center">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{m.name}</h3>
                  <p className="text-primary font-bold text-sm uppercase tracking-wider">{m.role}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 italic">
                    {m.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-3xl italic text-muted-foreground">
            Team member profiles will appear here once added in the admin dashboard.
          </div>
        )}
      </section>

      {/* Operations & Facilities */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary font-bold">
            <Construction className="h-6 w-6" />
            <span>MODERN INFRASTRUCTURE</span>
          </div>
          <h2 className="text-4xl font-bold">Operations & Facilities</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Our facilities are designed with cutting-edge technology and environmental responsibility at their core.
          </p>
        </div>

        {facilitiesLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
          </div>
        ) : facilities?.length ? (
          <div className="grid gap-8 md:grid-cols-2">
            {facilities.map((f: any) => (
              <div key={f.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 flex flex-col lg:flex-row gap-8 items-center transition-all hover:shadow-md">
                <div className="relative h-48 w-full lg:w-48 rounded-[2rem] overflow-hidden shrink-0 shadow-inner">
                  {f.imageUrl ? (
                    <Image src={f.imageUrl} alt={f.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground"><Construction className="h-10 w-10" /></div>
                  )}
                </div>
                <div className="space-y-4 text-center lg:text-left flex-1">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <h3 className="text-2xl font-bold">{f.name}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-3xl italic text-muted-foreground">
            Facility details will appear here once added in the admin dashboard.
          </div>
        )}
      </section>

      {/* Quote section */}
      <section className="bg-primary py-24 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Quote className="h-64 w-64 rotate-180" />
        </div>
        <div className="container mx-auto px-4 md:px-8 text-center space-y-8 relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold italic max-w-4xl mx-auto leading-tight">
            "A happy hen makes for a healthy heart. We treat our poultry and our land with the respect they deserve."
          </h2>
          <div className="space-y-2">
            <p className="font-bold text-2xl">Ms. Wubanchi Bayih</p>
            <p className="opacity-80 text-lg uppercase tracking-widest">Founder & Head Farmer</p>
          </div>
        </div>
      </section>
    </div>
  );
}
