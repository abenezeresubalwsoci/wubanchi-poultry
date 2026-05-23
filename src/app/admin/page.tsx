
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
import { Plus, Trash2, ShoppingBag, Newspaper, Package, Lock, LogOut, Upload, Settings, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // Data Queries
  const productsQuery = useMemo(() => collection(db, 'products'), [db]);
  const newsQuery = useMemo(() => query(collection(db, 'news'), orderBy('createdAt', 'desc')), [db]);
  const ordersQuery = useMemo(() => query(collection(db, 'orders'), orderBy('createdAt', 'desc')), [db]);
  
  const settingsRef = useMemo(() => doc(db, 'settings', 'general'), [db]);
  const { data: settings } = useDoc(settingsRef);

  const { data: products } = useCollection(productsQuery);
  const { data: news } = useCollection(newsQuery);
  const { data: orders } = useCollection(ordersQuery);

  // Form states
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: '', 
    category: 'Eggs', 
    description: '',
    imageId: 'organic-eggs' 
  });
  const [newNews, setNewNews] = useState({ title: '', desc: '', content: '' });
  const [logoUrl, setLogoUrl] = useState('');
  const [isSavingLogo, setIsSavingLogo] = useState(false);

  useEffect(() => {
    if (settings?.logoUrl) {
      setLogoUrl(settings.logoUrl);
    }
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
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'products',
          operation: 'create',
          requestResourceData: data
        }));
      });
    setNewProduct({ name: '', price: '', category: 'Eggs', description: '', imageId: 'organic-eggs' });
    toast({ title: "Product Added" });
  };

  const handleAddNews = () => {
    if (!newNews.title) return;
    const data = {
      ...newNews,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      createdAt: serverTimestamp()
    };
    addDoc(collection(db, 'news'), data)
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'news',
          operation: 'create',
          requestResourceData: data
        }));
      });
    setNewNews({ title: '', desc: '', content: '' });
    toast({ title: "News Posted" });
  };

  const handleUpdateLogo = () => {
    if (!logoUrl) return;
    setIsSavingLogo(true);
    
    // Mutation using setDoc with merge for persistent settings
    setDoc(settingsRef, { logoUrl, updatedAt: serverTimestamp() }, { merge: true })
      .then(() => {
        setIsSavingLogo(false);
        toast({ title: "Branding Saved", description: "Logo has been updated permanently." });
      })
      .catch(async (error) => {
        setIsSavingLogo(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: settingsRef.path,
          operation: 'update',
          requestResourceData: { logoUrl }
        }));
      });
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (Firestore document limit is 1MB)
      if (file.size > 800000) {
        toast({ 
          variant: "destructive", 
          title: "File too large", 
          description: "Please use an image smaller than 800KB for the logo." 
        });
        return;
      }

      setIsSavingLogo(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoUrl(base64String);
        
        // Save immediately on upload
        setDoc(settingsRef, { logoUrl: base64String, updatedAt: serverTimestamp() }, { merge: true })
          .then(() => {
            setIsSavingLogo(false);
            toast({ title: "Logo Uploaded", description: "New branding saved to the database." });
          })
          .catch(async (error) => {
            setIsSavingLogo(false);
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: settingsRef.path,
              operation: 'update',
              requestResourceData: { logoUrl: 'base64_data' }
            }));
          });
      };
      reader.onerror = () => {
        setIsSavingLogo(false);
        toast({ variant: "destructive", title: "Upload Error", description: "Could not read the file." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (col: string, id: string) => {
    const docRef = doc(db, col, id);
    deleteDoc(docRef)
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        }));
      });
    toast({ title: "Deleted", variant: "destructive" });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md border-none shadow-2xl bg-card">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto rounded-full bg-primary/10 p-3 w-fit text-primary">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
            <CardDescription>Enter credentials to manage Wubanchi Farm</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} placeholder="admin" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} placeholder="••••••••" required />
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
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage farm operations and settings.</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2 rounded-full">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="products" className="gap-2"><Package className="h-4 w-4" /> Products</TabsTrigger>
          <TabsTrigger value="news" className="gap-2"><Newspaper className="h-4 w-4" /> Farm News</TabsTrigger>
          <TabsTrigger value="orders" className="gap-2"><ShoppingBag className="h-4 w-4" /> Orders</TabsTrigger>
          <TabsTrigger value="settings" className="gap-2"><Settings className="h-4 w-4" /> Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1 border-none bg-card shadow-sm">
              <CardHeader><CardTitle>Add Product</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Organic Eggs" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Price</Label><Input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="6.99" /></div>
                  <div className="space-y-2"><Label>Category</Label>
                    <select className="w-full h-10 rounded-md border p-2 bg-background text-sm" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}><option>Eggs</option><option>Meat</option><option>Feed</option><option>Chicks</option></select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Product Image</Label>
                  <select className="w-full h-10 rounded-md border p-2 bg-background text-sm" value={newProduct.imageId} onChange={e => setNewProduct({...newProduct, imageId: e.target.value})}>
                    {PlaceHolderImages.map(img => (
                      <option key={img.id} value={img.id}>{img.description}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleAddProduct} className="w-full gap-2 font-bold"><Plus className="h-4 w-4" /> Add Product</Button>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 border-none bg-card shadow-sm">
              <CardContent className="p-6">
                <Table>
                  <TableHeader><TableRow><TableHead>Image</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products?.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell><div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden"><ImageIcon className="h-5 w-5 opacity-50" /></div></TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                        <TableCell>${p.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDelete('products', p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="news" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1 border-none bg-card shadow-sm">
              <CardHeader><CardTitle>Post News</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={newNews.title} onChange={e => setNewNews({...newNews, title: e.target.value})} placeholder="New Feed Available" /></div>
                <div className="space-y-2"><Label>Summary</Label><Input value={newNews.desc} onChange={e => setNewNews({...newNews, desc: e.target.value})} placeholder="Organic pellets are in stock..." /></div>
                <Button onClick={handleAddNews} className="w-full gap-2 font-bold"><Plus className="h-4 w-4" /> Post Update</Button>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 border-none bg-card shadow-sm"><CardContent className="p-6">
                <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Title</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>{news?.map((n: any) => (<TableRow key={n.id}><TableCell className="text-xs">{n.date}</TableCell><TableCell className="font-medium">{n.title}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDelete('news', n.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>))}</TableBody>
                </Table>
            </CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="max-w-xl border-none bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Branding Settings</CardTitle>
              <CardDescription>Update your farm logo. Changes are saved permanently to Firestore.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Upload Logo (max 800KB)</Label>
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      className="relative cursor-pointer overflow-hidden gap-2"
                      disabled={isSavingLogo}
                    >
                      {isSavingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Choose Image
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        disabled={isSavingLogo}
                      />
                    </Button>
                    {isSavingLogo && <span className="text-xs text-primary animate-pulse">Saving to Database...</span>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Or Paste Image URL</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={logoUrl} 
                      onChange={e => setLogoUrl(e.target.value)} 
                      placeholder="https://example.com/logo.png" 
                      disabled={isSavingLogo}
                    />
                    <Button onClick={handleUpdateLogo} disabled={isSavingLogo || !logoUrl}>
                      {isSavingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update URL'}
                    </Button>
                  </div>
                </div>
              </div>

              {logoUrl && (
                <div className="space-y-3 pt-4 border-t">
                  <Label>Preview</Label>
                  <div className="h-32 w-32 rounded-2xl border bg-background overflow-hidden flex items-center justify-center p-2">
                    <img src={logoUrl} alt="Logo Preview" className="h-full w-full object-contain" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="border-none bg-card shadow-sm">
            <CardHeader><CardTitle>Orders</CardTitle></CardHeader>
            <CardContent>
              {orders?.length ? (
                <Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Customer</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>{orders.map((o: any) => (<TableRow key={o.id}><TableCell className="text-xs">{o.id.substring(0, 8)}</TableCell><TableCell>{o.customerName}</TableCell><TableCell>${o.total?.toFixed(2)}</TableCell><TableCell><Badge>{o.status}</Badge></TableCell></TableRow>))}</TableBody>
                </Table>
              ) : <div className="text-center py-12 text-muted-foreground">No orders found.</div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
