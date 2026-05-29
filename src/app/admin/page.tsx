'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, setDoc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ShoppingBag, Newspaper, Package, Lock, LogOut, Upload, Settings, Image as ImageIcon, Loader2, MessageSquare, Sparkles, Bird, X, Text, Users, Construction, CreditCard, Eye, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { generateFarmHero } from '@/ai/flows/generate-image-flow';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface HeroSlide {
  imageUrl: string;
  title: string;
  subtitle: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  note: string;
  accountName?: string;
  accountNumber?: string;
}

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const productsQuery = useMemo(() => query(collection(db, 'products'), orderBy('createdAt', 'desc')), [db]);
  const newsQuery = useMemo(() => query(collection(db, 'news'), orderBy('createdAt', 'desc')), [db]);
  const feedbackQuery = useMemo(() => query(collection(db, 'feedback'), orderBy('createdAt', 'desc')), [db]);
  const managersQuery = useMemo(() => query(collection(db, 'managers'), orderBy('createdAt', 'desc')), [db]);
  const facilitiesQuery = useMemo(() => query(collection(db, 'facilities'), orderBy('createdAt', 'desc')), [db]);
  const ordersQuery = useMemo(() => query(collection(db, 'orders'), orderBy('createdAt', 'desc')), [db]);
  
  const settingsRef = useMemo(() => doc(db, 'settings', 'general'), [db]);
  const { data: settings } = useDoc(settingsRef);

  const { data: products } = useCollection(productsQuery);
  const { data: news } = useCollection(newsQuery);
  const { data: feedback } = useCollection(feedbackQuery);
  const { data: managers } = useCollection(managersQuery);
  const { data: facilities } = useCollection(facilitiesQuery);
  const { data: orders } = useCollection(ordersQuery);

  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: '', 
    category: 'Eggs', 
    description: '',
    imageId: 'organic-eggs',
    imageUrl: ''
  });
  const [newNews, setNewNews] = useState({ title: '', desc: '', content: '' });
  const [newManager, setNewManager] = useState({ name: '', role: '', description: '', imageUrl: '' });
  const [newFacility, setNewFacility] = useState({ name: '', description: '', imageUrl: '' });
  
  const [logoUrl, setLogoUrl] = useState('');
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 'cash', name: 'Cash on Delivery', enabled: false, note: 'Only for premium Customers', accountName: '', accountNumber: '' },
    { id: 'cbe', name: 'CBE (Commercial Bank)', enabled: true, note: '', accountName: '', accountNumber: '' },
    { id: 'abyssinia', name: 'Abyssinia Bank', enabled: true, note: '', accountName: '', accountNumber: '' },
    { id: 'telebirr', name: 'Telebirr', enabled: true, note: '', accountName: '', accountNumber: '' },
  ]);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('Sunrise over a modern poultry farm with free-range chickens');
  const [manualSlide, setManualSlide] = useState({ url: '', title: '', subtitle: '' });

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  useEffect(() => {
    if (settings?.logoUrl) setLogoUrl(settings.logoUrl);
    if (settings?.heroSlides) setHeroSlides(settings.heroSlides);
    if (settings?.paymentMethods) setPaymentMethods(settings.paymentMethods);
  }, [settings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'admin') {
      setIsAuthenticated(true);
      toast({ title: "Login Successful", description: "Welcome to the Admin Dashboard." });
    } else {
      toast({ variant: "destructive", title: "Login Failed", description: "Invalid credentials." });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast({ title: "Signed Out", description: "You have been logged out." });
  };

  const handleUpdateOrderStatus = (id: string, status: string) => {
    updateDoc(doc(db, 'orders', id), { status })
      .then(() => toast({ title: "Status Updated" }))
      .catch(console.error);
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    const data = {
      ...newProduct,
      price: parseFloat(newProduct.price),
      createdAt: serverTimestamp()
    };
    addDoc(collection(db, 'products'), data)
      .then(() => {
        setNewProduct({ name: '', price: '', category: 'Eggs', description: '', imageId: 'organic-eggs', imageUrl: '' });
        toast({ title: "Product Added" });
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'products',
          operation: 'create',
          requestResourceData: data
        }));
      });
  };

  const handleAddNews = () => {
    if (!newNews.title) return;
    const data = {
      ...newNews,
      date: new Date().toLocaleDateString('en-GB'),
      createdAt: serverTimestamp()
    };
    addDoc(collection(db, 'news'), data)
      .then(() => {
        setNewNews({ title: '', desc: '', content: '' });
        toast({ title: "News Posted" });
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'news',
          operation: 'create',
          requestResourceData: data
        }));
      });
  };

  const handleAddManager = () => {
    if (!newManager.name || !newManager.role) return;
    const data = {
      ...newManager,
      createdAt: serverTimestamp()
    };
    addDoc(collection(db, 'managers'), data)
      .then(() => {
        setNewManager({ name: '', role: '', description: '', imageUrl: '' });
        toast({ title: "Team Member Added" });
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'managers',
          operation: 'create',
          requestResourceData: data
        }));
      });
  };

  const handleAddFacility = () => {
    if (!newFacility.name || !newFacility.description) return;
    const data = {
      ...newFacility,
      createdAt: serverTimestamp()
    };
    addDoc(collection(db, 'facilities'), data)
      .then(() => {
        setNewFacility({ name: '', description: '', imageUrl: '' });
        toast({ title: "Facility Added" });
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'facilities',
          operation: 'create',
          requestResourceData: data
        }));
      });
  };

  const handleGenerateAIHero = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAI(true);
    try {
      const result = await generateFarmHero({ prompt: aiPrompt });
      const newSlide: HeroSlide = {
        imageUrl: result.imageUrl,
        title: 'New AI Generation',
        subtitle: 'Experience the future of farming'
      };
      setHeroSlides(prev => [...prev, newSlide]);
      toast({ title: "AI Image Generated", description: "Image added to carousel collection." });
    } catch (error) {
      toast({ variant: "destructive", title: "Generation Failed", description: "AI could not generate the image right now." });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddManualSlide = () => {
    if (!manualSlide.url.trim()) return;
    setHeroSlides(prev => [...prev, { 
      imageUrl: manualSlide.url.trim(), 
      title: manualSlide.title || 'Wubanchi Farm', 
      subtitle: manualSlide.subtitle || 'Premium Poultry Excellence' 
    }]);
    setManualSlide({ url: '', title: '', subtitle: '' });
    toast({ title: "Hero Slide Added" });
  };

  const handleRemoveHeroSlide = (index: number) => {
    setHeroSlides(prev => prev.filter((_, i) => i !== index));
    toast({ title: "Slide Removed", variant: "destructive" });
  };

  const handleUpdateSlideText = (index: number, field: 'title' | 'subtitle', value: string) => {
    setHeroSlides(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleUpdatePaymentMethod = (index: number, field: keyof PaymentMethod, value: any) => {
    setPaymentMethods(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleUpdateSettings = () => {
    setIsSavingSettings(true);
    const data = { 
      logoUrl, 
      heroSlides,
      paymentMethods,
      updatedAt: serverTimestamp() 
    };
    
    setDoc(settingsRef, data, { merge: true })
      .then(() => {
        toast({ title: "Settings Saved", description: "Branding, Carousel, and Payments updated successfully." });
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: settingsRef.path,
          operation: 'update',
          requestResourceData: data
        }));
      })
      .finally(() => {
        setIsSavingSettings(false);
      });
  };

  const handleFileUpload = (type: 'logo' | 'hero' | 'manager' | 'facility') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({ variant: "destructive", title: "File too large", description: "Please use an image smaller than 2MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'logo') setLogoUrl(base64String);
        else if (type === 'hero') setHeroSlides(prev => [...prev, { imageUrl: base64String, title: 'Fresh Arrival', subtitle: 'Straight from the farm' }]);
        else if (type === 'manager') setNewManager(prev => ({ ...prev, imageUrl: base64String }));
        else if (type === 'facility') setNewFacility(prev => ({ ...prev, imageUrl: base64String }));
        toast({ title: "Image Uploaded", description: "Don't forget to save your changes." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (col: string, id: string) => {
    const docRef = doc(db, col, id);
    deleteDoc(docRef)
      .then(() => {
        toast({ title: "Deleted", variant: "destructive" });
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        }));
      });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 gap-6 animate-in fade-in duration-700">
        <Card className="w-full max-w-md border-none shadow-2xl bg-card transition-all hover:shadow-primary/10">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto rounded-full bg-primary/10 p-4 w-fit text-primary animate-in zoom-in-75 duration-700">
               {logoUrl ? (
                 <div className="relative h-12 w-12 rounded-full overflow-hidden">
                   <img src={logoUrl} className="h-full w-full object-cover" />
                 </div>
               ) : <Lock className="h-8 w-8" />}
            </div>
            <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
            <CardDescription>Secure access for farm managers</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} placeholder="admin" required className="transition-all focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} placeholder="admin" required className="transition-all focus:ring-2 focus:ring-primary/20" />
              </div>
              <Button type="submit" className="w-full font-bold transition-all active:scale-95 shadow-lg">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-8 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {logoUrl && (
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20 shadow-md">
              <img src={logoUrl} className="h-full w-full object-cover" />
            </div>
          )}
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2 rounded-full transition-all active:scale-90">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="bg-muted p-1 flex-wrap h-auto animate-in fade-in duration-700 delay-200">
          <TabsTrigger value="orders" className="gap-2 transition-all"><ShoppingBag className="h-4 w-4" /> Orders</TabsTrigger>
          <TabsTrigger value="products" className="gap-2 transition-all"><Package className="h-4 w-4" /> Products</TabsTrigger>
          <TabsTrigger value="news" className="gap-2 transition-all"><Newspaper className="h-4 w-4" /> News</TabsTrigger>
          <TabsTrigger value="team" className="gap-2 transition-all"><Users className="h-4 w-4" /> Management Team</TabsTrigger>
          <TabsTrigger value="facilities" className="gap-2 transition-all"><Construction className="h-4 w-4" /> Operations</TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2 transition-all"><MessageSquare className="h-4 w-4" /> Feedback</TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 transition-all"><Settings className="h-4 w-4" /> Branding & Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none bg-card shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Customer Orders</CardTitle>
              <CardDescription>Manage deliveries and verify payment proofs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Proof</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-bold">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                        <div className="text-[10px] text-muted-foreground">{order.deliveryAddress?.kebele}, {order.deliveryAddress?.landmark}</div>
                      </TableCell>
                      <TableCell className="font-bold text-primary">ETB {order.total}</TableCell>
                      <TableCell className="uppercase text-xs font-bold opacity-60">{order.paymentMethod}</TableCell>
                      <TableCell>
                        {order.paymentProofUrl ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-2">
                                <Eye className="h-4 w-4" /> View Proof
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Payment Proof - {order.customerName}</DialogTitle>
                              </DialogHeader>
                              <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                                <img src={order.paymentProofUrl} className="h-full w-full object-contain" />
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-[10px] italic text-muted-foreground">No proof uploaded</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <select 
                          className="bg-muted rounded px-2 py-1 text-xs" 
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete('orders', order.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1 border-none bg-card shadow-sm h-fit">
              <CardHeader><CardTitle>Add Product</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Price</Label><Input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Category</Label>
                    <select className="w-full h-10 rounded-md border p-2 bg-background text-sm" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}><option>Eggs</option><option>Meat</option><option>Feed</option><option>Chicks</option></select>
                  </div>
                </div>
                <Button variant="outline" className="relative cursor-pointer overflow-hidden gap-2 w-full">
                  <Upload className="h-4 w-4" /> Upload Product Image
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > MAX_FILE_SIZE) {
                        toast({ variant: "destructive", title: "File too large", description: "Please use an image smaller than 2MB." });
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => setNewProduct(prev => ({ ...prev, imageUrl: reader.result as string }));
                      reader.readAsDataURL(file);
                    }
                  }} />
                </Button>
                {newProduct.imageUrl && <div className="mt-2 h-32 w-full rounded-md border overflow-hidden"><img src={newProduct.imageUrl} className="h-full w-full object-cover" /></div>}
                <Button onClick={handleAddProduct} className="w-full gap-2 font-bold"><Plus className="h-4 w-4" /> Add Product</Button>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 border-none bg-card shadow-sm overflow-hidden">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Price</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {products?.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>ETB {parseFloat(p.price || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDelete('products', p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="news" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1 border-none bg-card shadow-sm h-fit">
              <CardHeader><CardTitle>Post News</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={newNews.title} onChange={e => setNewNews({...newNews, title: e.target.value})} /></div>
                <div className="space-y-2"><Label>Summary</Label><Input value={newNews.desc} onChange={e => setNewNews({...newNews, desc: e.target.value})} /></div>
                <Button onClick={handleAddNews} className="w-full gap-2 font-bold"><Plus className="h-4 w-4" /> Post Update</Button>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 border-none bg-card shadow-sm">
                <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Title</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>{news?.map((n: any) => (<TableRow key={n.id}><TableCell className="text-xs">{n.date}</TableCell><TableCell className="font-medium">{n.title}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDelete('news', n.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>))}</TableBody>
                </Table>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 md:grid-cols-3">
             <Card className="md:col-span-1 border-none bg-card shadow-sm h-fit">
              <CardHeader><CardTitle>Add Manager</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input value={newManager.name} onChange={e => setNewManager({...newManager, name: e.target.value})} /></div>
                <div className="space-y-2"><Label>Role / Title</Label><Input value={newManager.role} onChange={e => setNewManager({...newManager, role: e.target.value})} /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={newManager.description} onChange={e => setNewManager({...newManager, description: e.target.value})} /></div>
                <Button variant="outline" className="relative cursor-pointer overflow-hidden gap-2 w-full">
                  <Upload className="h-4 w-4" /> Upload Manager Photo
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileUpload('manager')} />
                </Button>
                {newManager.imageUrl && <div className="mt-2 h-32 w-32 rounded-full border overflow-hidden mx-auto"><img src={newManager.imageUrl} className="h-full w-full object-cover" /></div>}
                <Button onClick={handleAddManager} className="w-full gap-2 font-bold"><Plus className="h-4 w-4" /> Add Team Member</Button>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 border-none bg-card shadow-sm">
              <Table>
                <TableHeader><TableRow><TableHead>Photo</TableHead><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {managers?.map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell><div className="h-10 w-10 rounded-full overflow-hidden border bg-muted">{m.imageUrl && <img src={m.imageUrl} className="h-full w-full object-cover" />}</div></TableCell>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>{m.role}</TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDelete('managers', m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="facilities" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 md:grid-cols-3">
             <Card className="md:col-span-1 border-none bg-card shadow-sm h-fit">
              <CardHeader><CardTitle>Add Facility/Operation</CardTitle><CardDescription>Highlight farm areas like Waste Recycling or Storage</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Area Name</Label><Input value={newFacility.name} onChange={e => setNewFacility({...newFacility, name: e.target.value})} placeholder="e.g. Waste Recycling Area" /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={newFacility.description} onChange={e => setNewFacility({...newFacility, description: e.target.value})} placeholder="Describe what happens here..." /></div>
                <Button variant="outline" className="relative cursor-pointer overflow-hidden gap-2 w-full">
                  <Upload className="h-4 w-4" /> Upload Facility Photo
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileUpload('facility')} />
                </Button>
                {newFacility.imageUrl && <div className="mt-2 h-32 w-full rounded-2xl border overflow-hidden"><img src={newFacility.imageUrl} className="h-full w-full object-cover" /></div>}
                <Button onClick={handleAddFacility} className="w-full gap-2 font-bold"><Plus className="h-4 w-4" /> Add Facility</Button>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 border-none bg-card shadow-sm">
              <Table>
                <TableHeader><TableRow><TableHead>Photo</TableHead><TableHead>Name</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {facilities?.map((f: any) => (
                    <TableRow key={f.id}>
                      <TableCell><div className="h-10 w-16 rounded-md overflow-hidden border bg-muted">{f.imageUrl && <img src={f.imageUrl} className="h-full w-full object-cover" />}</div></TableCell>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDelete('facilities', f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Card className="border-none bg-card shadow-sm">
            <CardHeader><CardTitle>Customer Feedback</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Comment</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {feedback?.map((f: any) => (
                    <TableRow key={f.id}>
                      <TableCell><div className="font-bold">{f.name}</div><div className="text-xs text-muted-foreground">{f.email}</div></TableCell>
                      <TableCell className="max-w-md truncate">"{f.comment}"</TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDelete('feedback', f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none bg-card shadow-sm h-fit">
              <CardHeader><CardTitle>Logo Management</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="relative cursor-pointer overflow-hidden gap-2">
                    <Upload className="h-4 w-4" /> Upload Logo
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileUpload('logo')} />
                  </Button>
                  {logoUrl && <div className="h-12 w-12 rounded border overflow-hidden shadow-sm"><img src={logoUrl} className="h-full w-full object-contain" /></div>}
                </div>
                <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="Logo URL" />
              </CardContent>
            </Card>

            <Card className="border-none bg-card shadow-sm h-fit">
              <CardHeader><CardTitle>Payment Methods</CardTitle><CardDescription>Manage options visible at checkout</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method, idx) => (
                  <div key={method.id} className="flex flex-col gap-3 p-4 border rounded-xl bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={method.enabled} 
                          onCheckedChange={(checked) => handleUpdatePaymentMethod(idx, 'enabled', !!checked)}
                        />
                        <span className="font-bold text-sm">{method.name}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase opacity-50">Note / Subtext</Label>
                        <Input 
                          className="h-8 text-xs bg-background" 
                          value={method.note} 
                          onChange={(e) => handleUpdatePaymentMethod(idx, 'note', e.target.value)}
                          placeholder="Note (e.g. Premium only)" 
                        />
                      </div>
                      {method.id !== 'cash' && (
                        <>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase opacity-50">Account Name</Label>
                            <Input 
                              className="h-8 text-xs bg-background" 
                              value={method.accountName} 
                              onChange={(e) => handleUpdatePaymentMethod(idx, 'accountName', e.target.value)}
                              placeholder="e.g. Wubanchi Farm PLC" 
                            />
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-[10px] uppercase opacity-50">Account Number</Label>
                            <Input 
                              className="h-8 text-xs bg-background" 
                              value={method.accountNumber} 
                              onChange={(e) => handleUpdatePaymentMethod(idx, 'accountNumber', e.target.value)}
                              placeholder="e.g. 100012345678" 
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <Button onClick={handleUpdateSettings} disabled={isSavingSettings} className="w-full mt-4">
                  {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                  Update Payment Methods
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none bg-card shadow-sm h-fit">
              <CardHeader><CardTitle>Hero AI Image Generator</CardTitle><CardDescription>Create slide imagery using AI</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>AI Generation Prompt</Label>
                  <Input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="E.g., Sunrise over a poultry farm..." />
                </div>
                <Button onClick={handleGenerateAIHero} disabled={isGeneratingAI} variant="accent" className="w-full gap-2 font-bold">
                  {isGeneratingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generate Slide
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-none bg-card shadow-sm">
              <CardHeader><CardTitle>Hero Slides & Content Carousel</CardTitle><CardDescription>Manage images and synchronized text for your home page hero</CardDescription></CardHeader>
              <CardContent className="space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                   <div className="space-y-4 bg-muted/30 p-6 rounded-2xl">
                      <Label className="text-lg font-bold flex items-center gap-2"><Plus className="h-5 w-5" /> Add New Slide</Label>
                      <div className="space-y-3">
                        <Input value={manualSlide.url} onChange={e => setManualSlide({...manualSlide, url: e.target.value})} placeholder="Image URL (https://...)" />
                        <Input value={manualSlide.title} onChange={e => setManualSlide({...manualSlide, title: e.target.value})} placeholder="Slide Title (e.g. Fresh Eggs)" />
                        <Input value={manualSlide.subtitle} onChange={e => setManualSlide({...manualSlide, subtitle: e.target.value})} placeholder="Slide Subtitle" />
                        <Button onClick={handleAddManualSlide} className="w-full gap-2"><Plus className="h-4 w-4" /> Add Slide to Collection</Button>
                      </div>
                      <div className="pt-4 border-t">
                        <Label className="text-sm font-bold opacity-70">Or Upload File</Label>
                        <Button variant="outline" className="relative cursor-pointer overflow-hidden gap-2 w-full mt-2">
                          <Upload className="h-4 w-4" /> Select Image File
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileUpload('hero')} />
                        </Button>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <Label className="text-lg font-bold">Active Carousel Slides ({heroSlides.length})</Label>
                      <div className="space-y-4">
                        {heroSlides.map((slide, idx) => (
                          <div key={idx} className="flex gap-4 p-4 rounded-xl border bg-background group hover:border-primary/50 transition-all shadow-sm">
                            <div className="relative h-24 w-32 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                              <img src={slide.imageUrl} className="h-full w-full object-cover" />
                              <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveHeroSlide(idx)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex-1 space-y-2">
                               <div className="flex items-center gap-2"><Text className="h-3 w-3 opacity-50" /><Input className="h-8 text-xs" value={slide.title} onChange={e => handleUpdateSlideText(idx, 'title', e.target.value)} placeholder="Title" /></div>
                               <div className="flex items-center gap-2"><Text className="h-3 w-3 opacity-50" /><Input className="h-8 text-xs" value={slide.subtitle} onChange={e => handleUpdateSlideText(idx, 'subtitle', e.target.value)} placeholder="Subtitle" /></div>
                            </div>
                          </div>
                        ))}
                        {heroSlides.length === 0 && (
                          <div className="border-2 border-dashed border-muted rounded-xl p-12 flex flex-col items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-10 w-10 mb-4 opacity-10" />
                            No slides added yet
                          </div>
                        )}
                      </div>
                   </div>
                </div>

                <Button onClick={handleUpdateSettings} className="w-full py-6 text-xl font-bold shadow-xl active:scale-[0.98] transition-all" disabled={isSavingSettings}>
                  {isSavingSettings ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Settings className="h-6 w-6 mr-2" />}
                  Save All Branding & Content Changes
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
