
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Users, Layers, ShieldCheck, Check, X, Eye, DollarSign, Loader2, Lock, User as UserIcon, AlertTriangle, ListChecks, History } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('submissions');
  const [balanceEditUserId, setBalanceEditUserId] = useState<string | null>(null);
  const [editHoldBalance, setEditHoldBalance] = useState('');
  const [editActiveBalance, setEditActiveBalance] = useState('');
  const [updatingUser, setUpdatingUser] = useState(false);

  // Portal Login State
  const [portalUsername, setPortalUsername] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const [isPortalAuthorized, setIsPortalAuthorized] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Direct admin check
  const userDocRef = useMemo(() => (user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile, loading: profileLoading } = useDoc(userDocRef);
  const isAdmin = profile?.isAdmin === true;

  // Live queries
  const usersQuery = useMemo(() => {
    if (!user || !isAdmin || !isPortalAuthorized) return null;
    return query(collection(db, 'users'), orderBy('updatedAt', 'desc'));
  }, [db, user, isAdmin, isPortalAuthorized]);

  const submissionsQuery = useMemo(() => {
    if (!user || !isAdmin || !isPortalAuthorized) return null;
    return query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
  }, [db, user, isAdmin, isPortalAuthorized]);

  const payoutsQuery = useMemo(() => {
    if (!user || !isAdmin || !isPortalAuthorized) return null;
    return query(collection(db, 'payouts'), orderBy('createdAt', 'desc'));
  }, [db, user, isAdmin, isPortalAuthorized]);

  const { data: userProfiles, loading: usersLoading } = useCollection(usersQuery);
  const { data: allSubmissions, loading: subsLoading } = useCollection(submissionsQuery);
  const { data: allPayouts, loading: payoutsLoading } = useCollection(payoutsQuery);

  const handlePortalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (portalUsername === 'abeni' && portalPassword === 'abeni123') {
      setIsAuthorizing(true);
      try {
        if (user && !isAdmin) {
          await setDoc(doc(db, 'users', user.uid), { isAdmin: true, updatedAt: serverTimestamp() }, { merge: true });
        }
        setIsPortalAuthorized(true);
        toast({ title: 'Portal Access Granted', description: 'Administrative session initialized.' });
      } catch (err) {
        toast({ variant: 'destructive', title: 'Elevation Failed', description: 'Could not sync admin status.' });
      } finally {
        setIsAuthorizing(false);
      }
    } else {
      toast({ variant: 'destructive', title: 'Access Denied', description: 'Invalid portal credentials.' });
    }
  };

  const handleApprove = (submission: any) => {
    const subRef = doc(db, 'submissions', submission.id);
    const userRef = doc(db, 'users', submission.userId);
    const earningValue = submission.earnings || 1.12;
    const dataUpdates = { status: 'approved' };

    setDoc(subRef, dataUpdates, { merge: true })
      .then(async () => {
        await setDoc(userRef, { holdBalance: increment(-earningValue), activeBalance: increment(earningValue) }, { merge: true });
        toast({ title: 'Submission Approved', description: `Funds released for ${submission.accountEmail}.` });
      })
      .catch((error) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: subRef.path, operation: 'update', requestResourceData: dataUpdates })));
  };

  const handleReject = (submission: any) => {
    const subRef = doc(db, 'submissions', submission.id);
    const userRef = doc(db, 'users', submission.userId);
    const earningValue = submission.earnings || 1.12;
    const dataUpdates = { status: 'rejected' };

    setDoc(subRef, dataUpdates, { merge: true })
      .then(async () => {
        await setDoc(userRef, { holdBalance: increment(-earningValue) }, { merge: true });
        toast({ variant: 'destructive', title: 'Submission Rejected', description: `Hold balance deducted for ${submission.accountEmail}.` });
      })
      .catch((error) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: subRef.path, operation: 'update', requestResourceData: dataUpdates })));
  };

  const handlePayoutAction = (payout: any, status: 'approved' | 'rejected') => {
    const payoutRef = doc(db, 'payouts', payout.id);
    const userRef = doc(db, 'users', payout.userId);
    const dataUpdates = { status };

    setDoc(payoutRef, dataUpdates, { merge: true })
      .then(async () => {
        if (status === 'approved') {
          await setDoc(userRef, { activeBalance: increment(-payout.amount) }, { merge: true });
          toast({ title: 'Payout Processed', description: `Status set to ${status}. Balance adjusted.` });
        } else {
          toast({ variant: 'destructive', title: 'Payout Rejected', description: 'Status updated to rejected.' });
        }
      })
      .catch((error) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: payoutRef.path, operation: 'update', requestResourceData: dataUpdates })));
  };

  const handleManualBalanceChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceEditUserId) return;
    setUpdatingUser(true);
    const userRef = doc(db, 'users', balanceEditUserId);
    const dataUpdates = { holdBalance: parseFloat(editHoldBalance || '0'), activeBalance: parseFloat(editActiveBalance || '0'), updatedAt: serverTimestamp() };

    setDoc(userRef, dataUpdates, { merge: true })
      .then(() => { toast({ title: 'Balance override successful.' }); setBalanceEditUserId(null); })
      .catch((error) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: userRef.path, operation: 'update', requestResourceData: dataUpdates })))
      .finally(() => setUpdatingUser(false));
  };

  if (authLoading || profileLoading) return <div className="flex min-h-[70vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>;

  if (!user) return <div className="container mx-auto px-4 py-20 text-center max-w-md space-y-4"><div className="bg-amber-100 text-amber-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto"><Lock className="h-6 w-6" /></div><h2 className="text-2xl font-bold">Authentication Required</h2></div>;

  if (!isPortalAuthorized) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-3"><div className="bg-primary/10 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-primary"><ShieldCheck className="h-8 w-8" /></div><h1 className="text-3xl font-bold tracking-tight">Admin Portal Gate</h1></div>
        <Card className="border shadow-lg bg-white rounded-xl overflow-hidden"><CardHeader><CardTitle className="text-lg font-bold">Portal Sign In</CardTitle></CardHeader><CardContent><form onSubmit={handlePortalLogin} className="space-y-4"><div className="space-y-1"><Label>Username</Label><Input required placeholder="Username" value={portalUsername} onChange={(e) => setPortalUsername(e.target.value)} /></div><div className="space-y-1"><Label>Password</Label><Input type="password" required placeholder="••••••••" value={portalPassword} onChange={(e) => setPortalPassword(e.target.value)} /></div><Button type="submit" disabled={isAuthorizing} className="w-full">{isAuthorizing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Verify Portal Access'}</Button></form></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8 max-w-7xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2"><ShieldCheck className="h-8 w-8 text-destructive" />Central Administration Center</h1><p className="text-muted-foreground text-sm">Real-time management of submissions, users, and payout fulfillment.</p></div>
        <Button variant="outline" size="sm" onClick={() => setIsPortalAuthorized(false)} className="rounded-full">Lock Session</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl shadow-sm">
          <TabsTrigger value="submissions" className="gap-2 font-semibold"><Layers className="h-4 w-4" />Submissions ({allSubmissions?.length || 0})</TabsTrigger>
          <TabsTrigger value="payouts" className="gap-2 font-semibold"><History className="h-4 w-4" />Payout Requests ({allPayouts?.length || 0})</TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2 font-semibold"><Users className="h-4 w-4" />User Ledger ({userProfiles?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader><CardTitle>Verification Pool</CardTitle><CardDescription>Release funds from Hold to Active.</CardDescription></CardHeader>
            <CardContent className="p-0">
              {subsLoading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left"><thead className="bg-muted text-muted-foreground text-xs uppercase font-bold"><tr><th className="p-4">User Email</th><th className="p-4">Target Login</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y">{allSubmissions?.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-muted/20">
                      <td className="p-4 font-semibold text-xs">{sub.userEmail}</td>
                      <td className="p-4">
                        <span className="font-bold block">{sub.accountEmail}</span>
                        <span className="text-[10px] font-mono opacity-60 block">{sub.password}</span>
                        {sub.qrCodeUrl && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="text-[11px] text-primary font-bold mt-1.5 hover:underline flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded w-fit">
                                🖼️ View Attached Proof / QR
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Attached Document Proof</DialogTitle>
                              </DialogHeader>
                              <div className="flex justify-center p-2 bg-muted/50 rounded-xl mt-2">
                                <img src={sub.qrCodeUrl} alt="Submission proof image" className="max-h-[60vh] object-contain rounded-lg shadow-sm" />
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </td>
                      <td className="p-4"><span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${sub.status === 'approved' ? 'bg-green-100 text-green-700' : sub.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{sub.status || 'pending'}</span></td>
                      <td className="p-4 text-right">{sub.status === 'pending' && <div className="flex gap-2 justify-end"><Button variant="outline" size="sm" onClick={() => handleApprove(sub)} className="text-green-600"><Check className="h-4 w-4" /></Button><Button variant="outline" size="sm" onClick={() => handleReject(sub)} className="text-destructive"><X className="h-4 w-4" /></Button></div>}</td>
                    </tr>
                  ))}</tbody></table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader><CardTitle>Withdrawal Fulfillment</CardTitle><CardDescription>Manage user payout requests.</CardDescription></CardHeader>
            <CardContent className="p-0">
              {payoutsLoading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left"><thead className="bg-muted text-muted-foreground text-xs uppercase font-bold"><tr><th className="p-4">Request ID</th><th className="p-4">Destination Address</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y">{allPayouts?.map((po: any) => (
                    <tr key={po.id} className="hover:bg-muted/20">
                      <td className="p-4 font-mono text-[10px]">#{po.id.substring(0, 8).toUpperCase()}</td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold block text-muted-foreground uppercase">USDT BEP20</span>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded border">{po.usdtAddress}</code>
                      </td>
                      <td className="p-4 font-bold text-emerald-600">${parseFloat(po.amount).toFixed(2)}</td>
                      <td className="p-4"><span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${po.status === 'approved' ? 'bg-green-100 text-green-700' : po.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{po.status || 'pending'}</span></td>
                      <td className="p-4 text-right">{po.status === 'pending' && <div className="flex gap-2 justify-end"><Button variant="outline" size="sm" onClick={() => handlePayoutAction(po, 'approved')} className="text-green-600">Approve</Button><Button variant="outline" size="sm" onClick={() => handlePayoutAction(po, 'rejected')} className="text-destructive">Reject</Button></div>}</td>
                    </tr>
                  ))}</tbody></table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader><CardTitle>User Master Ledger</CardTitle><CardDescription>Balance information for all registered users.</CardDescription></CardHeader>
            <CardContent className="p-0">
              {usersLoading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left"><thead className="bg-muted text-muted-foreground text-xs uppercase font-bold"><tr><th className="p-4">User Details</th><th className="p-4">Chat ID</th><th className="p-4">Hold</th><th className="p-4">Active</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y">{userProfiles?.map((prof: any) => (
                    <tr key={prof.id} className="hover:bg-muted/20">
                      <td className="p-4"><span className="font-bold block">{prof.displayName || 'Unnamed'}</span><span className="text-[10px] opacity-50">{prof.email}</span></td>
                      <td className="p-4 font-mono text-xs">{prof.telegramChatId || 'N/A'}</td>
                      <td className="p-4 font-bold text-amber-600">${parseFloat(prof.holdBalance ?? 0).toFixed(2)}</td>
                      <td className="p-4 font-bold text-emerald-600">${parseFloat(prof.activeBalance ?? 0).toFixed(2)}</td>
                      <td className="p-4 text-right"><Dialog open={balanceEditUserId === prof.id} onOpenChange={(open) => { if (open) { setBalanceEditUserId(prof.id); setEditHoldBalance(String(prof.holdBalance ?? 0)); setEditActiveBalance(String(prof.activeBalance ?? 0)); } else { setBalanceEditUserId(null); } }}><DialogTrigger asChild><Button variant="outline" size="sm" className="h-8 rounded-full"><DollarSign className="h-3 w-3" /> Adjust</Button></DialogTrigger><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Manual Adjust</DialogTitle></DialogHeader><form onSubmit={handleManualBalanceChange} className="space-y-4 pt-2"><div className="space-y-1"><Label>Hold ($)</Label><Input type="number" step="0.01" required value={editHoldBalance} onChange={(e) => setEditHoldBalance(e.target.value)} /></div><div className="space-y-1"><Label>Active ($)</Label><Input type="number" step="0.01" required value={editActiveBalance} onChange={(e) => setEditActiveBalance(e.target.value)} /></div><Button type="submit" disabled={updatingUser} className="w-full">{updatingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply Overwrite'}</Button></form></DialogContent></Dialog></td>
                    </tr>
                  ))}</tbody></table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
