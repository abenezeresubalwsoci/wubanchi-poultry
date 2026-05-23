
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Search, ShoppingBasket, Filter, CheckCircle2 } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const CATEGORIES = ["All", "Eggs", "Meat", "Feed", "Chicks"];

const PRODUCTS = [
  { id: 1, name: "Organic Brown Eggs (Dozen)", category: "Eggs", price: 6.99, image: "organic-eggs", tag: "Fresh" },
  { id: 2, name: "Free-Range Large White Eggs", category: "Eggs", price: 5.50, image: "organic-eggs", tag: "Best Seller" },
  { id: 3, name: "Whole Pasture-Raised Chicken", category: "Meat", price: 18.99, image: "whole-chicken", tag: "High Protein" },
  { id: 4, name: "Chicken Breast Fillets (1kg)", category: "Meat", price: 12.50, image: "whole-chicken", tag: "Fresh" },
  { id: 5, name: "Layer Pellets Organic Feed (10kg)", category: "Feed", price: 24.00, image: "poultry-feed", tag: "Nutritious" },
  { id: 6, name: "Organic Corn & Grain Mix (5kg)", category: "Feed", price: 14.50, image: "poultry-feed", tag: "Natural" },
  { id: 7, name: "Day-Old Broiler Chicks (x10)", category: "Chicks", price: 15.00, image: "day-old-chicks", tag: "Hardy" },
  { id: 8, name: "Starter Kit for New Chicks", category: "Chicks", price: 45.00, image: "day-old-chicks", tag: "Bundle" },
];

export default function ProductCatalog() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <div className="container mx-auto px-4 py-12 md:px-8">
      <div className="mb-12 space-y-6">
        <h1 className="text-4xl font-bold md:text-5xl">Farm Fresh Catalog</h1>
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

      {filteredProducts.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map(product => {
            const imgData = PlaceHolderImages.find(img => img.id === product.image);
            return (
              <Card key={product.id} className="group overflow-hidden border-none bg-card shadow-sm transition-all hover:shadow-md">
                <div className="relative h-56 overflow-hidden">
                  {imgData && (
                    <Image
                      src={imgData.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      data-ai-hint={imgData.imageHint}
                    />
                  )}
                  <Badge className="absolute left-3 top-3 bg-accent text-white border-none">
                    {product.tag}
                  </Badge>
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
                    In Stock
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between p-5 pt-0">
                  <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                  <Button size="sm" className="rounded-full gap-2 transition-all hover:px-6">
                    <ShoppingBasket className="h-4 w-4" />
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
          <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
          <Button variant="link" className="mt-4" onClick={() => { setSearch(""); setActiveCategory("All"); }}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
