'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ChevronLeft, Minus, Plus, ShoppingCart, Loader2, Heart } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();
  
  const productRef = useMemo(() => (id ? doc(db, 'products', id as string) : null), [db, id]);
  const { data: product, loading } = useDoc(productRef);
  
  const [quantity, setQuantity] = useState(1);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Button variant="link" asChild className="mt-4">
          <Link href="/products">Back to Catalog</Link>
        </Button>
      </div>
    );
  }

  const displayImageUrl = product.imageUrl || (PlaceHolderImages.find(img => img.id === product.imageId)?.imageUrl) || PlaceHolderImages[0].imageUrl;
  const imgHint = PlaceHolderImages.find(img => img.id === product.imageId)?.imageHint || 'poultry product';

  const handleAddToCart = () => {
    toast({
      title: "Added to Cart",
      description: `${quantity}x ${product.name} added to your selection.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-8">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="mb-8 gap-2 rounded-full pl-2 hover:bg-primary/10 hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </Button>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-white shadow-sm border border-border/50">
          <Image
            src={displayImageUrl}
            alt={product.name}
            fill
            className="object-contain p-8"
            data-ai-hint={imgHint}
          />
          <button className="absolute right-6 top-6 z-10 rounded-full bg-white/80 p-3 text-destructive backdrop-blur-sm transition-transform hover:scale-110">
            <Heart className="h-6 w-6" />
          </button>
        </div>

        {/* Info Section */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="rounded-full px-4 py-1 text-xs uppercase tracking-widest text-primary bg-primary/10">
              {product.category}
            </Badge>
            <h1 className="text-4xl font-bold md:text-5xl">{product.name}</h1>
            <p className="text-3xl font-bold text-foreground">
              ETB {(product.price || 0).toFixed(2)}
            </p>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-lg leading-relaxed text-muted-foreground">
              {product.description || "Our premium farm products are raised with care, ensuring the highest quality and freshness for your family."}
            </p>
          </div>

          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-6">
              <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Quantity</span>
              <div className="flex items-center rounded-2xl border border-border bg-card p-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-xl"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-10 w-16 border-none bg-transparent text-center font-bold focus-visible:ring-0"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-xl"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleAddToCart}
              className="h-14 w-full rounded-2xl text-lg font-bold gap-3 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <ShoppingCart className="h-6 w-6" />
              Add to Cart - ETB {((product.price || 0) * quantity).toFixed(2)}
            </Button>
          </div>

          <Card className="border-none bg-primary/5 p-4 rounded-2xl">
            <CardContent className="p-0 flex items-center gap-4 text-sm text-primary">
              <div className="rounded-full bg-primary/10 p-2">
                <Plus className="h-4 w-4" />
              </div>
              <p className="font-medium">Direct from Wubanchi Farm. Delivery available within 24 hours.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
