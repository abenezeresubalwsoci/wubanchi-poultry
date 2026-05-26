"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Heart, Filter, Loader2, Plus } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["All", "Eggs", "Meat", "Feed", "Chicks"];

export default function ProductCatalog() {
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

  const handleAddToCart = (title: string) => {
    toast({
      title: "Added to Selection",
      description: `${title} has been added to your shopping session.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-8">
      <div className="mb-12 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold md:text-5xl">Farm Fresh Catalog</h1>
          {loading && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Browse our high-quality, farm-raised poultry products. We ensure the highest standards of animal welfare and quality control.
        </p>

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 rounded-full bg-card"
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
                className="rounded-full px-6"
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
          {filteredProducts.map(product => {
            const displayImageUrl = product.imageUrl || (PlaceHolderImages.find(img => img.id === product.imageId)?.imageUrl) || PlaceHolderImages[0].imageUrl;
            const imgHint = PlaceHolderImages.find(img => img.id === product.imageId)?.imageHint || 'poultry product';
            
            return (
              <Card key={product.id} className="relative group overflow-hidden border-none bg-white rounded-3xl transition-all hover:shadow-xl">
                {/* Heart Icon - Top Right */}
                <button className="absolute right-4 top-4 z-10 text-destructive/80 transition-transform hover:scale-110">
                  <Heart className="h-6 w-6" />
                </button>

                {/* Product Image Area */}
                <div className="relative h-48 w-full p-6 flex items-center justify-center bg-gray-50/50">
                  <div className="relative h-full w-full overflow-hidden">
                    <Image
                      src={displayImageUrl}
                      alt={product.name}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                      data-ai-hint={imgHint}
                    />
                  </div>
                </div>

                {/* Product Info Area */}
                <CardContent className="p-5">
                  <div className="space-y-1 mb-4">
                    <h3 className="text-lg font-bold text-foreground line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">ETB {(product.price || 0).toFixed(2)}</span>
                    <Button 
                      onClick={() => handleAddToCart(product.name)}
                      className="h-8 w-8 bg-primary hover:bg-primary/90 rounded-lg p-0 flex items-center justify-center shadow-sm transition-all active:scale-95"
                    >
                      <Plus className="h-5 w-5 text-white" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-muted p-6">
            <Filter className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold">No products found</h3>
          <p className="text-muted-foreground">Try adding some products in the Admin Dashboard!</p>
          <Button variant="link" className="mt-4" onClick={() => { setSearch(""); setActiveCategory("All"); }}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
