
"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Bird, Egg, ShoppingBasket, Info, MessageSquare, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Products", href: "/products", icon: ShoppingBasket },
  { name: "AI Tips", href: "/tips", icon: Lightbulb },
  { name: "About", href: "/about", icon: Info },
  { name: "Contact", href: "/contact", icon: MessageSquare },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <div className="flex items-center justify-center rounded-full bg-primary p-1.5 text-primary-foreground">
              <Bird className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Wubanchi</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
            <Button variant="default" asChild className="ml-4 rounded-full">
              <Link href="/products">Order Now</Link>
            </Button>
          </div>

          {/* Mobile Nav Toggle */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-background animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1 px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                <item.icon className="h-5 w-5 text-primary" />
                {item.name}
              </Link>
            ))}
            <div className="pt-4 px-3">
              <Button className="w-full rounded-full" asChild>
                <Link href="/products" onClick={() => setIsOpen(false)}>Shop Products</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
