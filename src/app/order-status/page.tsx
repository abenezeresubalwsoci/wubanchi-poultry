
'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Package, CheckCircle2, Truck, Clock, AlertCircle, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

export default function OrderStatusPage() {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [searchId, setSearchId] = useState('');
  const db = useFirestore();

  const orderRef = useMemo(() => (searchId ? doc(db, 'orders', searchId) : null), [db, searchId]);
  const { data: order, loading } = useDoc(orderRef);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchId(orderIdInput.trim());
  };

  const statusIcons: Record<string, any> = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle2,
  };

  const StatusIcon = order?.status ? statusIcons[order.status] : Clock;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-8 animate-in fade-in duration-700">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Track Your Order</h1>
          <p className="text-muted-foreground">
            Enter your Order ID to check the current status and delivery details.
          </p>
        </div>

        <Card className="border-none shadow-lg bg-card overflow-hidden">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Enter Order ID (e.g. zXy123...)" 
                  className="pl-10 rounded-full bg-background transition-all focus:ring-2 focus:ring-primary/20"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                />
              </div>
              <Button type="submit" className="rounded-full px-6 font-bold transition-all active:scale-95" disabled={loading}>
                {loading ? 'Searching...' : 'Track'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {searchId && !loading && !order && (
          <div className="text-center py-12 bg-muted/20 rounded-3xl animate-in zoom-in-95 duration-500 border-2 border-dashed border-muted">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-xl font-bold">Order Not Found</h3>
            <p className="text-muted-foreground">We couldn't find an order with ID: <span className="font-mono text-foreground font-bold">{searchId}</span></p>
            <p className="text-sm mt-2">Please double check the ID provided in your order confirmation.</p>
          </div>
        )}

        {order && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden border border-primary/5">
              <div className="bg-primary p-8 text-primary-foreground flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold opacity-80 uppercase tracking-widest">
                    <ShoppingBag className="h-4 w-4" />
                    Track Order
                  </div>
                  <h2 className="text-2xl font-bold">Order #{order.id?.substring(0, 8).toUpperCase()}</h2>
                  <p className="text-sm opacity-90">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-4 bg-white/20 p-5 rounded-2xl backdrop-blur-md shadow-inner">
                  <StatusIcon className="h-8 w-8 text-white" />
                  <div>
                    <p className="text-[10px] uppercase font-bold opacity-70 tracking-tighter">Current Status</p>
                    <p className="text-xl font-bold capitalize leading-none">{order.status}</p>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-8 space-y-10">
                <div className="grid gap-10 md:grid-cols-2">
                  <div className="space-y-5">
                    <h3 className="font-bold flex items-center gap-2 text-lg">
                      <Package className="h-5 w-5 text-primary" />
                      Order Summary
                    </h3>
                    <div className="space-y-3">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                          <div className="relative h-14 w-14 rounded-xl overflow-hidden border bg-gray-50 shrink-0">
                            {item.image ? (
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-muted-foreground/30"><Package className="h-6 w-6" /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">QTY: {item.quantity}</p>
                          </div>
                          <p className="font-bold text-sm text-primary">ETB {(item.price * item.quantity).toFixed(0)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="font-bold flex items-center gap-2 text-lg">
                        <Truck className="h-5 w-5 text-primary" />
                        Delivery Details
                      </h3>
                      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-2 text-sm">
                        <p className="font-bold text-base text-foreground">{order.customerName}</p>
                        <p className="text-muted-foreground font-medium">{order.customerPhone}</p>
                        <div className="pt-2 border-t border-primary/10 mt-2">
                           <p className="font-bold text-xs uppercase opacity-50 mb-1">Address</p>
                           <p className="text-foreground italic">{order.deliveryAddress?.kebele}</p>
                           <p className="text-foreground">{order.deliveryAddress?.landmark}</p>
                           <p className="text-primary font-bold text-xs mt-1">{order.deliveryAddress?.city}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-lg">Payment Info</h3>
                      <div className="p-5 rounded-2xl border bg-gray-50 flex items-center justify-between">
                        <div>
                           <p className="text-[10px] uppercase font-bold opacity-50">Method</p>
                           <p className="font-bold text-foreground capitalize">{order.paymentMethod}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] uppercase font-bold opacity-50">Total Amount</p>
                           <p className="text-2xl font-bold text-primary">ETB {order.total?.toFixed(0)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                   <div className="text-xs text-muted-foreground flex items-center gap-2">
                     <CheckCircle2 className="h-4 w-4 text-green-500" />
                     Verified by Wubanchi Farm Logistics
                   </div>
                   <Button variant="outline" className="rounded-full px-8 transition-all active:scale-95" onClick={() => window.print()}>
                     Download Receipt
                   </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
