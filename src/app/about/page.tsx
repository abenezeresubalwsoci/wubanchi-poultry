
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Check, Users, Leaf, Sunrise, Award } from "lucide-react";

export default function About() {
  const storyImg = PlaceHolderImages.find(img => img.id === 'farm-story');

  const values = [
    { title: "Sustainability", icon: Leaf, desc: "We use regenerative farming techniques that give back to the soil." },
    { title: "Animal Welfare", icon: Award, desc: "Our birds roam freely and express natural behaviors." },
    { title: "Community", icon: Users, desc: "We support local livelihoods and believe in fair farm-to-market prices." },
    { title: "Freshness", icon: Sunrise, desc: "Minimal time from harvest to delivery ensures maximum nutrients." }
  ];

  return (
    <div className="space-y-24 pb-24">
      {/* Header */}
      <section className="bg-card py-20">
        <div className="container mx-auto px-4 md:px-8 text-center space-y-6">
          <h1 className="text-4xl font-bold md:text-6xl">Our Farm Story</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Wubanchi started with a small backyard coop and a big dream: to bring truly fresh, healthy poultry to every family.
          </p>
        </div>
      </section>

      {/* Story Content */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <div className="relative h-[500px] overflow-hidden rounded-3xl shadow-2xl">
            {storyImg && (
              <Image
                src={storyImg.imageUrl}
                alt={storyImg.description}
                fill
                className="object-cover"
                data-ai-hint={storyImg.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <p className="text-sm font-bold uppercase tracking-widest opacity-80">Established 1994</p>
              <h3 className="text-2xl font-bold">Three Generations of Care</h3>
            </div>
          </div>
          <div className="space-y-8">
            <h2 className="text-3xl font-bold md:text-4xl">More than just a farm</h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                Founded in 1994 by the Wubanchi family, our farm began as a labor of love in the hills of Sunshine Valley. We believed that if we cared for our birds, they would care for us.
              </p>
              <p>
                Today, we operate one of the region's leading organic poultry facilities, combining traditional farming wisdom with modern sustainability practices. We don't just produce eggs and meat; we cultivate a ecosystem of health.
              </p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Pesticide-free pastures",
                "Organic non-GMO feed",
                "Antibiotic-free growth",
                "Solar-powered facilities",
                "Cage-free living",
                "Local community focus"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/20 p-1 text-primary">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold md:text-4xl">The Wubanchi Way</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Our values guide everything from how we feed our chicks to how we deliver to your door.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, idx) => (
            <Card key={idx} className="border-none bg-card text-center p-8 transition-all hover:shadow-lg">
              <CardContent className="p-0 space-y-4">
                <div className="mx-auto rounded-full bg-primary/10 p-4 text-primary w-fit">
                  <v.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quote section */}
      <section className="bg-primary py-24 text-primary-foreground">
        <div className="container mx-auto px-4 md:px-8 text-center space-y-8">
          <QuoteIcon className="mx-auto h-16 w-16 opacity-20" />
          <h2 className="text-3xl md:text-5xl font-bold italic max-w-4xl mx-auto leading-tight">
            "A happy hen makes for a healthy heart. We treat our poultry with the respect they deserve."
          </h2>
          <div className="space-y-1">
            <p className="font-bold text-xl">— Elena Wubanchi</p>
            <p className="opacity-80">Founder & Head Farmer</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuoteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V12C14.017 12.5523 13.5693 13 13.017 13H11.017C10.4647 13 10.017 12.5523 10.017 12V9C10.017 6.23858 12.2556 4 15.017 4H17.017V2H15.017C11.151 2 8.017 5.13401 8.017 9V15C8.017 18.3137 10.7033 21 14.017 21ZM5.017 21L5.017 18C5.017 16.8954 5.91242 16 7.017 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.017C5.46472 8 5.017 8.44772 5.017 9V12C5.017 12.5523 4.5693 13 4.017 13H2.017C1.46472 13 1.017 12.5523 1.017 12V9C1.017 6.23858 3.25558 4 6.017 4H8.017V2H6.017C2.15099 2 -0.983002 5.13401 -0.983002 9V15C-0.983002 18.3137 1.70327 21 5.017 21Z" />
    </svg>
  );
}
