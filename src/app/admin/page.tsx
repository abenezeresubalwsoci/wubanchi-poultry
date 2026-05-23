
'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ShoppingBag, Newspaper, Package, Clock, Lock, LogOut, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // Data Queries
  const productsQuery = useMemo(() => collection(db, 'products'), [db]);
  const newsQuery = useMemo(() => query(collection(db, 'news'), orderBy('date', 'desc')), [db]);
  const ordersQuery = useMemo(() => query(collection(db, 'orders'), orderBy('createdAt', 'desc')), [db]);

  const { data: products } = useCollection(productsQuery);
  const { data: news } = useCollection(newsQuery);
  const { data: orders } = useCollection(ordersQuery);

  // Form states for management
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: '', 
    category: 'Eggs', 
    description: '',
    imageId: 'organic-eggs' 
  });
  const [newNews, setNewNews] = useState({ title: '', desc: '', content: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'admin') {
      setIsAuthenticated(true);
      toast({ title: "Login Successful", description: "Welcome back, Admin." });
    } else {
      toast({ 
        variant: "destructive", 
        title: "Login Failed", 
        description: "Invalid username or password." 
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginForm({ username: '', password: '' });
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    addDoc(collection(db, 'products'), {
      ...newProduct,
      price: parseFloat(newProduct.price as string),
      inStock: true,
      createdAt: serverTimestamp()
    });
    setNewProduct({ name: '', price: '', category: 'Eggs', description: '', imageId: 'organic-eggs' });
    toast({ title: "Product Added", description: "Successfully added to catalog." });
  };

  const handleAddNews = () => {
    if (!newNews.title) return;
    addDoc(collection(db, 'news'), {
      ...newNews,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      createdAt: serverTimestamp()
    });
    setNewNews({ title: '', desc: '', content: '' });
    toast({ title: "News Posted", description: "Announcement is now live." });
  };

  const handleDelete = (col: string, id: string) => {
    deleteDoc(doc(db, col, id));
    toast({ title: "Deleted", variant: "destructive" });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulation: In a real app we would upload to Firebase Storage.
      // Here we randomly assign one of our placeholder IDs to show how it works.
      const randomImg = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
      setNewProduct({ ...newProduct, imageId: randomImg.id });
      toast({ 
        title: "Image Processed", 
        description: `Simulated upload: Assigned "${randomImg.description}"` 
      });
    }
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
                <Input 
                  id="username" 
                  value={loginForm.username} 
                  onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                  placeholder="admin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={loginForm.password} 
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full font-bold">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your farm operations and content.</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2 rounded-full">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" /> Products
          </TabsTrigger>
          <TabsTrigger value="news" className="gap-2">
            <Newspaper className="h-4 w-4" /> Farm News
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingBag className="h-4 w-4" /> Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1 border-none bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Add Product</CardTitle>
                <CardDescription>Add new item to your catalog</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Organic Eggs" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="6.99" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select 
                      className="w-full h-10 rounded-md border p-2 bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                      value={newProduct.category} 
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    >
                      <option>Eggs</option>
                      <option>Meat</option>
                      <option>Feed</option>
                      <option>Chicks</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Representative Image</Label>
                  <select 
                    className="w-full h-10 rounded-md border p-2 bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                    value={newProduct.imageId} 
                    onChange={e => setNewProduct({...newProduct, imageId: e.target.value})}
                  >
                    {PlaceHolderImages.map(img => (
                      <option key={img.id} value={img.id}>{img.description}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Upload className="h-4 w-4" /> Upload Custom Image
                  </Label>
                  <Input type="file" accept="image/*" onChange={handleImageUpload} className="cursor-pointer" />
                  <p className="text-[10px] text-muted-foreground">Note: Custom uploads are simulated in this prototype.</p>
                </div>

                <Button onClick={handleAddProduct} className="w-full gap-2 font-bold mt-2">
                  <Plus className="h-4 w-4" /> Add Product
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-none bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Product Catalog</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products?.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                            <ImageIcon className="h-5 w-5 text-muted-foreground opacity-50" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                        <TableCell>${p.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDelete('products', p.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!products?.length && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          No products in catalog.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="news" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1 border-none bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Post News</CardTitle>
                <CardDescription>Keep your customers updated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={newNews.title} onChange={e => setNewNews({...newNews, title: e.target.value})} placeholder="New Feed Available" />
                </div>
                <div className="space-y-2">
                  <Label>Summary</Label>
                  <Input value={newNews.desc} onChange={e => setNewNews({...newNews, desc: e.target.value})} placeholder="Organic pellets are in stock..." />
                </div>
                <Button onClick={handleAddNews} className="w-full gap-2 font-bold">
                  <Plus className="h-4 w-4" /> Post Update
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-none bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {news?.map((n: any) => ( n.id && (
                      <TableRow key={n.id}>
                        <TableCell className="text-xs text-muted-foreground">{n.date}</TableCell>
                        <TableCell className="font-medium">{n.title}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDelete('news', n.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )))}
                    {!news?.length && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                          No news items posted.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="border-none bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Customer Orders</CardTitle>
              <CardDescription>Track and fulfill orders</CardDescription>
            </CardHeader>
            <CardContent>
              {orders && orders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o: any) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">{o.id.substring(0, 8)}...</TableCell>
                        <TableCell>{o.customerName}</TableCell>
                        <TableCell>${o.total?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={o.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                            {o.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">Fulfill</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-4 opacity-20" />
                  <p>No orders yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
