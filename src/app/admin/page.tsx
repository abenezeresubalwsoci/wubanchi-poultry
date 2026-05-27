
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, setDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ShoppingBag, Newspaper, Package, Lock, LogOut, Upload, Settings, Image as ImageIcon, Loader2, AlertTriangle, MessageSquare, Sparkles, Bird, X, Text } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { firebaseConfig } from '@/firebase/config';
import { generateFarmHero } from '@/ai/flows/generate-image-flow';
import Image from 'next/image';

interface HeroSlide {
  imageUrl: string;
  title: string;
  subtitle: string;
}

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const productsQuery = useMemo(() => query(collection(db, 'products'), orderBy('createdAt', 'desc')), [db]);
  const newsQuery = useMemo(() => query(collection(db, 'news'), orderBy('createdAt', 'desc')), [db]);
  const feedbackQuery = useMemo(() => query(collection(db, 'feedback'), orderBy('createdAt', 'desc')), [db]);
  
  const settingsRef = useMemo(() => doc(db, 'settings', 'general'), [db]);
  const { data: settings } = useDoc(settingsRef);

  const { data: products } = useCollection(productsQuery);
  const { data: news } = useCollection(newsQuery);
  const { data: feedback } = useCollection(feedbackQuery);

  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: '', 
    category: 'Eggs', 
    description: '',
    imageId: 'organic-eggs',
    imageUrl: ''
  });
  const [newNews, setNewNews] = useState({ title: '', desc: '', content: '' });
  
  const [logoUrl, setLogoUrl] = useState('');
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('Sunrise over a modern poultry farm with free-range chickens');
  const [manualSlide, setManualSlide] = useState({ url: '', title: '', subtitle: '' });

  useEffect(() => {
    if (settings?.logoUrl) setLogoUrl(settings.logoUrl);
    if (settings?.heroSlides) setHeroSlides(settings.heroSlides);
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

  const handleUpdateSettings = () => {
    setIsSavingSettings(true);
    const data = { 
      logoUrl, 
      heroSlides,
      updatedAt: serverTimestamp() 
    };
    
    setDoc(settingsRef, data, { merge: true })
      .then(() => {
        toast({ title: "Settings Saved", description: "Branding and Hero Carousel updated successfully." });
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

  const handleFileUpload = (type: 'logo' | 'hero') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        toast({ variant: "destructive", title: "File too large", description: "Please use an image smaller than 800KB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'logo') setLogoUrl(base64String);
        else setHeroSlides(prev => [...prev, { imageUrl: base64String, title: 'Fresh Arrival', subtitle: 'Straight from the farm' }]);
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

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="bg-muted p-1 flex-wrap h-auto animate-in fade-in duration-700 delay-200">
          <TabsTrigger value="products" className="gap-2 transition-all"><Package className="h-4 w-4" /> Products</TabsTrigger>
          <TabsTrigger value="news" className="gap-2 transition-all"><Newspaper className="h-4 w-4" /> News</TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2 transition-all"><MessageSquare className="h-4 w-4" /> Feedback</TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 transition-all"><Settings className="h-4 w-4" /> Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* ... existing products content ... */}
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
                      <TableCell>ETB {p.price.toFixed(2)}</TableCell>
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
