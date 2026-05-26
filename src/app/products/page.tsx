
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Search, ShoppingBasket, Filter, CheckCircle2, Loader2, Plus } from "lucide-react";
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
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map(product => {
            const displayImageUrl = product.imageUrl || (PlaceHolderImages.find(img => img.id === product.imageId)?.imageUrl) || PlaceHolderImages[0].imageUrl;
            const imgHint = PlaceHolderImages.find(img => img.id === product.imageId)?.imageHint || 'poultry product';
            
            return (
              <Card key={product.id} className="group overflow-hidden border-none bg-card shadow-sm transition-all hover:shadow-md">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={displayImageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    data-ai-hint={imgHint}
                  />
                  {product.tag && (
                    <Badge className="absolute left-3 top-3 bg-accent text-white border-none">
                      {product.tag}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-5">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                    {product.category}
                  </div>
                  <h3 className="mb-4 text-lg font-bold leading-tight line-clamp-2 min-h-[3.5rem]">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                    <CheckCircle2 className="h-3 w-3" />
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between p-5 pt-0">
                  <span className="text-xl font-bold">${(product.price || 0).toFixed(2)}</span>
                  <Button 
                    size="sm" 
                    className="rounded-full gap-2 transition-all hover:px-6"
                    onClick={() => handleAddToCart(product.name)}
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </CardFooter>
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
