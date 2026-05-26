
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
import { Plus, Trash2, ShoppingBag, Newspaper, Package, Lock, LogOut, Upload, Settings, Image as ImageIcon, Loader2, AlertTriangle, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { firebaseConfig } from '@/firebase/config';

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();

  const isPlaceholderConfig = firebaseConfig.projectId === 'placeholder-project-id';

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
    imageId: 'organic-eggs' 
  });
  const [newNews, setNewNews] = useState({ title: '', desc: '', content: '' });
  
  const [logoUrl, setLogoUrl] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (settings?.logoUrl) setLogoUrl(settings.logoUrl);
    if (settings?.heroImageUrl) setHeroImageUrl(settings.heroImageUrl);
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

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    const data = {
      ...newProduct,
      price: parseFloat(newProduct.price as string),
      inStock: true,
      createdAt: serverTimestamp()
    };
    addDoc(collection(db, 'products'), data)
      .then(() => {
        setNewProduct({ name: '', price: '', category: 'Eggs', description: '', imageId: 'organic-eggs' });
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
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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

  const handleUpdateSettings = () => {
    setIsSavingSettings(true);
    const data = { 
      logoUrl, 
      heroImageUrl,
      updatedAt: serverTimestamp() 
    };
    
    setDoc(settingsRef, data, { merge: true })
      .then(() => {
        toast({ title: "Settings Saved", description: "Branding and Hero updated successfully." });
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
      setIsSavingSettings(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'logo') setLogoUrl(base64String);
        else setHeroImageUrl(base64String);
        
        const data = { [type === 'logo' ? 'logoUrl' : 'heroImageUrl']: base64String, updatedAt: serverTimestamp() };
        setDoc(settingsRef, data, { merge: true })
          .then(() => {
            toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Uploaded` });
          })
          .catch(async (error) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: settingsRef.path,
              operation: 'update',
              requestResourceData: { [type === 'logo' ? 'logoUrl' : 'heroImageUrl']: 'base64_data' }
            }));
          })
          .finally(() => {
            setIsSavingSettings(false);
          });
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
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 gap-6">
        {isPlaceholderConfig && (
          <Card className="w-full max-w-md border-destructive/50 bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-3 text-destructive">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">Warning: Firebase is not configured.</p>
            </CardContent>
          </Card>
        )}
        <Card className="w-full max-w-md border-none shadow-2xl bg-card">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto rounded-full bg-primary/10 p-3 w-fit text-primary">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} placeholder="admin" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} placeholder="admin" required />
              </div>
              <Button type="submit" className="w-full font-bold">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-8 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout} className="gap-2 rounded-full">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="bg-muted p-1 flex-wrap h-auto">
          <TabsTrigger value="products" className="gap-2"><Package className="h-4 w-4" /> Products</TabsTrigger>
          <TabsTrigger value="news" className="gap-2"><Newspaper className="h-4 w-4" /> News</TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2"><MessageSquare className="h-4 w-4" /> Feedback</TabsTrigger>
          <TabsTrigger value="settings" className="gap-2"><Settings className="h-4 w-4" /> Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
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
                <div className="space-y-2"><Label>Image</Label>
                  <select className="w-full h-10 rounded-md border p-2 bg-background text-sm" value={newProduct.imageId} onChange={e => setNewProduct({...newProduct, imageId: e.target.value})}>
                    {PlaceHolderImages.map(img => (
                      <option key={img.id} value={img.id}>{img.description}</option>
                    ))}
                  </select>
                </div>
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
                      <TableCell>${p.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDelete('products', p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="news" className="space-y-6">
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

        <TabsContent value="feedback">
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

        <TabsContent value="settings">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none bg-card shadow-sm">
              <CardHeader><CardTitle>Logo Management</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="relative cursor-pointer overflow-hidden gap-2">
                    {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload Logo
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileUpload('logo')} disabled={isSavingSettings} />
                  </Button>
                  {logoUrl && <div className="h-10 w-10 rounded border overflow-hidden"><img src={logoUrl} className="h-full w-full object-contain" /></div>}
                </div>
                <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="Logo URL" disabled={isSavingSettings} />
              </CardContent>
            </Card>

            <Card className="border-none bg-card shadow-sm">
              <CardHeader><CardTitle>Hero Image Management</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="relative cursor-pointer overflow-hidden gap-2">
                    {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload Hero
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileUpload('hero')} disabled={isSavingSettings} />
                  </Button>
                  {heroImageUrl && <div className="h-10 w-20 rounded border overflow-hidden"><img src={heroImageUrl} className="h-full w-full object-cover" /></div>}
                </div>
                <Input value={heroImageUrl} onChange={e => setHeroImageUrl(e.target.value)} placeholder="Hero Image URL" disabled={isSavingSettings} />
              </CardContent>
            </Card>

            <div className="md:col-span-2">
              <Button onClick={handleUpdateSettings} className="w-full py-6 text-lg" disabled={isSavingSettings}>
                {isSavingSettings ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Settings className="h-5 w-5 mr-2" />}
                Save All Branding Settings
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
