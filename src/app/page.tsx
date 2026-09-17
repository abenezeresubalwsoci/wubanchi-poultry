'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, doc, setDoc, query, where, orderBy, serverTimestamp, increment } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, CheckCircle2, AlertCircle, Clock, Upload, Mail, Lock, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

const MAX_IMAGE_SIZE = 800 * 1024; 

export default function Home() {
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [accountEmail, setAccountEmail] = useState('');
  const [password, setPassword] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync user profile upon sign-in
  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, {
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoUrl: user.photoURL || '',
        updatedAt: serverTimestamp()
      }, { merge: true }).catch(console.error);
    }
  }, [user, db]);

  // Load user recent submissions
  const submissionsQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, 'submissions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: submissions, loading: listLoading } = useCollection(submissionsQuery);

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(console.error);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        variant: 'destructive',
        title: 'File is too large',
        description: 'Please upload an image smaller than 800KB for best cloud delivery.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setQrCodeUrl(reader.result as string);
      toast({ title: 'QR Code attached successfully.' });
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !accountEmail || !password) return;

    setSubmitting(true);
    const submissionData = {
      userId: user.uid,
      userEmail: user.email || '',
      accountEmail,
      password,
      qrCodeUrl,
      earnings: 1.12,
      status: 'pending',
      createdAt: serverTimestamp()
    };

    // 1. Post submission
    addDoc(collection(db, 'submissions'), submissionData)
      .then(async () => {
        // 2. Increments Hold Balance instantly by $1.12
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          holdBalance: increment(1.12)
        }, { merge: true });

        toast({
          title: 'Submission Added!',
          description: 'You earned $1.12. Your hold balance has been instantly updated.'
        });

        // Reset inputs
        setAccountEmail('');
        setPassword('');
        setQrCodeUrl('');
      })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'submissions',
          operation: 'create',
          requestResourceData: submissionData
        }));
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-30" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-xl space-y-8 animate-in fade-in duration-700">
        <div className="bg-primary/10 w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-primary">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Earn Per Account Submission</h1>
          <p className="text-muted-foreground text-lg">
            Submit your authenticated credentials and QR code handles safely to receive $1.12 instantly into your hold account.
          </p>
        </div>
        <Button onClick={handleLogin} size="lg" className="w-full sm:w-auto font-bold rounded-full px-8 shadow-lg active:scale-95 transition-transform">
          Continue with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8 max-w-5xl space-y-12 animate-in fade-in duration-500">
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* Submission Form Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-xl bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-xl font-bold">New Account Details</CardTitle>
              <CardDescription>Earn $1.12 upon instant upload batch processing.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountEmail">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="accountEmail"
                      type="email"
                      required
                      placeholder="account@example.com"
                      className="pl-10"
                      value={accountEmail}
                      onChange={(e) => setAccountEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>QR Code Handle Upload</Label>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" type="button" className="relative cursor-pointer w-full gap-2 py-5 border-dashed rounded-xl">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-semibold">Select QR Screen / Data Image</span>
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </Button>
                    {qrCodeUrl && (
                      <div className="relative border rounded-xl overflow-hidden p-2 bg-muted/30">
                        <img src={qrCodeUrl} className="max-h-24 mx-auto object-contain" alt="Preview QR" />
                        <Button
                          variant="destructive"
                          size="sm"
                          type="button"
                          className="absolute top-1 right-1 h-6 px-2 text-[10px]"
                          onClick={() => setQrCodeUrl('')}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={submitting} className="w-full rounded-xl font-bold py-5 shadow-md active:scale-[0.98]">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Submit Application
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* History / Recent Submissions List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Recent Submissions</h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">Live Monitor</span>
          </div>

          {listLoading ? (
            <div className="flex py-12 justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
            </div>
          ) : submissions?.length ? (
            <div className="grid gap-4">
              {submissions.map((sub: any) => {
                const statusStyles: Record<string, string> = {
                  pending: 'bg-amber-100 text-amber-700 border-amber-200',
                  approved: 'bg-green-100 text-green-700 border-green-200',
                  rejected: 'bg-destructive/10 text-destructive border-destructive/20'
                };

                const StatusIcon = sub.status === 'approved' ? CheckCircle2 : sub.status === 'rejected' ? AlertCircle : Clock;

                return (
                  <Card key={sub.id} className="border bg-card shadow-sm rounded-xl overflow-hidden">
                    <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-foreground">{sub.accountEmail}</p>
                        <p className="text-xs text-muted-foreground">
                          Submitted on {sub.createdAt ? new Date(sub.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                        </p>
                        {sub.qrCodeUrl && (
                          <span className="inline-block text-[10px] bg-secondary px-2 py-0.5 rounded text-muted-foreground font-semibold">
                            QR Code Attached
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-left sm:text-right">
                          <span className="text-xs opacity-75 block text-muted-foreground">Value</span>
                          <span className="font-bold text-accent text-sm">${parseFloat(sub.earnings || 1.12).toFixed(2)}</span>
                        </div>
                        <span className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border capitalize ${statusStyles[sub.status || 'pending']}`}>
                          <StatusIcon className="h-3 w.3" />
                          {sub.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-dashed rounded-2xl text-muted-foreground italic">
              No entries filed under this account profile. Use the creation block to add your first item.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}