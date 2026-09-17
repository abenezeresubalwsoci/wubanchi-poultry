import { Layers } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-white text-muted-foreground py-6 mt-12">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <Layers className="h-4 w-4 text-primary" />
          <span>EarnSub © {new Date().getFullYear()}</span>
        </div>
        <p>Premium Automated Account Processing. Safe & Secured.</p>
      </div>
    </footer>
  );
}