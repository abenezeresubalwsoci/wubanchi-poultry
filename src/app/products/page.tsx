
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Heart, Filter, Loader2, Plus } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export const dynamic = 'force-dynamic';

const CATEGORIES = ["All", "Eggs", "Meat", "Feed", "Chicks"];

export default function ProductCatalog() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { toast } = useToast();
  
  const db = useFirestore();
  const productsQuery = useMemo(() => 
    query(collection(db, 'products'), orderBy('createdAt', 'desc')), 
  [db]);
  
  const { data: products, loading } = useCollection(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, products]);

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
    
    toast({
      title: "Added to Selection",
      description: `${product.name} has been added to your basket.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-8 animate-in fade-in duration-700">
      <div className="mb-12 space-y-6">
        <div className="flex items-center justify-between animate-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl font-bold md:text-5xl">Farm Fresh Catalog</h1>
          {loading && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl animate-in fade-in duration-1000 delay-200">
          Browse our high-quality, farm-raised poultry products. We ensure the highest standards of animal welfare and quality control.
        </p>

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 rounded-full bg-card transition-all focus:ring-2 focus:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                className="rounded-full px-6 transition-all active:scale-90"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
          <p className="text-muted-foreground animate-pulse">Connecting to Farm Database...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product, idx) => {
            const displayImageUrl = product.imageUrl || (PlaceHolderImages.find(img => img.id === product.imageId)?.imageUrl) || PlaceHolderImages[0].imageUrl;
            const imgHint = PlaceHolderImages.find(img => img.id === product.imageId)?.imageHint || 'poultry product';
            
            return (
              <Link key={product.id} href={`/products/${product.id}`} className={`block h-full animate-in fade-in zoom-in-95 duration-500 delay-[${idx % 8 * 100}ms]`}>
                <Card className="relative group overflow-hidden border-none bg-white rounded-3xl transition-all hover:shadow-2xl h-full hover:-translate-y-1">
                  {/* Heart Icon - Top Right */}
                  <button className="absolute right-4 top-4 z-10 text-destructive/80 transition-transform hover:scale-125 duration-300" onClick={(e) => e.preventDefault()}>
                    <Heart className="h-6 w-6" />
                  </button>

                  {/* Product Image Area */}
                  <div className="relative h-48 w-full p-6 flex items-center justify-center bg-gray-50/50 transition-colors group-hover:bg-primary/5">
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

                  {/* Product Info Area */}
                  <CardContent className="p-5">
                    <div className="space-y-1 mb-4">
                      <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-foreground">ETB {(product.price || 0).toFixed(2)}</span>
                      <Button 
                        onClick={(e) => handleAddToCart(e, product)}
                        className="h-8 w-8 bg-primary hover:bg-primary/90 rounded-lg p-0 flex items-center justify-center shadow-md transition-all active:scale-75 hover:rotate-90"
                      >
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
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
          <div className="mb-4 rounded-full bg-muted p-6">
            <Filter className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold">No products found</h3>
          <p className="text-muted-foreground">Try adding some products in the Admin Dashboard!</p>
          <Button variant="link" className="mt-4 transition-all active:scale-95" onClick={() => { setSearch(""); setActiveCategory("All"); }}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
