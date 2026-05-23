
import Link from "next/link";
import { Bird, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-12 md:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-full bg-primary p-1 text-primary-foreground">
                <Bird className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">Wubanchi</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bringing the warmth of the morning sun and the freshness of the farm to your table. Sustainable poultry practices since 1994.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider">Product Catalog</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products?category=eggs" className="hover:text-primary">Fresh Organic Eggs</Link></li>
              <li><Link href="/products?category=meat" className="hover:text-primary">Premium Poultry Meat</Link></li>
              <li><Link href="/products?category=feed" className="hover:text-primary">Organic Grains & Feed</Link></li>
              <li><Link href="/products?category=chicks" className="hover:text-primary">Day-old Chicks</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/tips" className="hover:text-primary">AI Poultry Tips</Link></li>
              <li><Link href="/about" className="hover:text-primary">Our Farm Story</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Wholesale Inquiries</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Custom Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>123 Goldenrod Lane, Sunshine Valley</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+1 (555) 789-1234</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>hello@wubanchi-farm.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Wubanchi Poultry Farm. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
