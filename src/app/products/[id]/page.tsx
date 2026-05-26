'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ChevronLeft, Minus, Plus, MoreVertical, Loader2 } from 'lucide-react';

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Button variant="link" onClick={() => router.push('/products')} className="mt-4">
          Back to Catalog
        </Button>
      </div>
    );
  }

  const displayImageUrl = product.imageUrl || (PlaceHolderImages.find(img => img.id === product.imageId)?.imageUrl) || PlaceHolderImages[0].imageUrl;
  const imgHint = PlaceHolderImages.find(img => img.id === product.imageId)?.imageHint || 'poultry product';

  const handleAddToCart = () => {
    toast({
      title: "Added to Selection",
      description: `${quantity}x ${product.name} added to your selection.`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header with Curved Background */}
      <div className="relative h-[300px] w-full bg-primary overflow-hidden" style={{ borderBottomLeftRadius: '50% 20%', borderBottomRightRadius: '50% 20%' }}>
        <div className="container mx-auto px-4 py-6 flex justify-between items-center relative z-10">
          <button 
            onClick={() => router.back()} 
            className="h-10 w-10 flex items-center justify-center rounded-full bg-white text-primary shadow-lg transition-transform active:scale-90"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button className="h-10 w-10 flex items-center justify-center text-white">
            <MoreVertical className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Floating Product Image */}
      <div className="container mx-auto px-4 -mt-40 relative z-20 flex justify-center">
        <div className="relative h-64 w-64 md:h-80 md:w-80 overflow-hidden">
          <Image
            src={displayImageUrl}
            alt={product.name}
            fill
            className="object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-110"
            data-ai-hint={imgHint}
          />
        </div>
      </div>

      {/* Product Content */}
      <div className="container mx-auto px-6 mt-8 space-y-6 max-w-2xl">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
            <p className="text-muted-foreground font-medium">{product.category}</p>
          </div>
          <div className="text-2xl font-bold text-primary">
            ETB {(product.price || 0).toFixed(1)}
          </div>
        </div>

        {/* Category Pills (Aesthetic as per image) */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <Badge className="rounded-full px-6 py-2 bg-primary text-primary-foreground hover:bg-primary shadow-sm border-none">
            {product.category}
          </Badge>
          <Badge variant="outline" className="rounded-full px-6 py-2 bg-white text-muted-foreground border-none shadow-sm">
            All
          </Badge>
          <Badge variant="outline" className="rounded-full px-6 py-2 bg-white text-muted-foreground border-none shadow-sm">
            Fresh
          </Badge>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <p className="text-muted-foreground leading-relaxed">
            {product.description || "Our premium farm products are raised with care, ensuring the highest quality and freshness for your family. Harvested daily and handled with expertise."}
            <span className="text-primary cursor-pointer ml-1 font-semibold">See More</span>
          </p>
        </div>

        {/* Bottom Controls */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md p-6 border-t z-50">
          <div className="container mx-auto max-w-2xl flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 bg-gray-100 rounded-full p-1 shadow-inner">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-white shadow-md active:scale-95 transition-all"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="text-lg font-bold min-w-[20px] text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-white shadow-md active:scale-95 transition-all"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <Button 
              onClick={handleAddToCart}
              className="flex-1 h-12 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg transition-all active:scale-95"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
