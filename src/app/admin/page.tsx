'use client';

import { useMemo, useState } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, increment } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Users, Layers, ShieldCheck, Check, X, Eye, DollarSign, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('submissions');
  const [balanceEditUserId, setBalanceEditUserId] = useState<string | null>(null);
  const [editHoldBalance, setEditHoldBalance] = useState('');
  const [editActiveBalance, setEditActiveBalance] = useState('');
  const [updatingUser, setUpdatingUser] = useState(false);

  // Live collections queries
  const usersQuery = useMemo(() => query(collection(db, 'users'), orderBy('updatedAt', 'desc')), [db]);
  const submissionsQuery = useMemo(() => query(collection(db, 'submissions'), orderBy('createdAt', 'desc')), [db]);

  const { data: userProfiles, loading: usersLoading } = useCollection(usersQuery);
  const { data: allSubmissions, loading: subsLoading } = useCollection(submissionsQuery);

  // Check admin state from custom profile
  const userProfileRef = useMemo(() => {
    return user ? doc(db, 'users', user.uid) : null;
  }, [db, user]);
  
  const { data: currentUserProfile } = useCollection(
    user ? query(collection(db, 'users'), orderBy('updatedAt', 'desc')) : null
  );

  const isAdmin = useMemo(() => {
    const matched = currentUserProfile?.find((u: any) => u.id === user?.uid);
    return matched?.isAdmin === true;
  }, [currentUserProfile, user]);

  const handleApprove = (submission: any) => {
    const subRef = doc(db, 'submissions', submission.id);
    const userRef = doc(db, 'users', submission.userId);

    // 1. Move funds from Hold balance to Active balance
    // Deduct $1.12 from Hold pool, add $1.12 to Active pool
    const earningValue = submission.earnings || 1.12;

    const dataUpdates = { status: 'approved' };
    setDoc(subRef, dataUpdates, { merge: true })
      .then(async () => {
        await setDoc(userRef, {
          holdBalance: increment(-earningValue),
          activeBalance: increment(earningValue)
        }, { merge: true });

        toast({
          title: 'Submission Approved!',
          description: `Funds transferred from hold pool to active user pool for ${submission.accountEmail}.`
        });
      })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: subRef.path,
          operation: 'update',
          requestResourceData: dataUpdates
        }));
      });
  };

  const handleReject = (submission: any) => {
    const subRef = doc(db, 'submissions', submission.id);
    const userRef = doc(db, 'users', submission.userId);
    const earningValue = submission.earnings || 1.12;

    const dataUpdates = { status: 'rejected' };
    setDoc(subRef, dataUpdates, { merge: true })
      .then(async () => {
        // Remove from hold balance pool as submission failed criteria
        await setDoc(userRef, {
          holdBalance: increment(-earningValue)
        }, { merge: true });

        toast({
          variant: 'destructive',
          title: 'Submission Rejected',
          description: `Hold balance deducted for failed entry requirement verification.`
        });
      })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: subRef.path,
          operation: 'update',
          requestResourceData: dataUpdates
        }));
      });
  };

  const handleManualBalanceChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceEditUserId) return;

    setUpdatingUser(true);
    const userRef = doc(db, 'users', balanceEditUserId);
    const dataUpdates = {
      holdBalance: parseFloat(editHoldBalance || '0'),
      activeBalance: parseFloat(editActiveBalance || '0')
    };

    setDoc(userRef, dataUpdates, { merge: true })
      .then(() => {
        toast({ title: 'Balance updated manually by administrator override.' });
        setBalanceEditUserId(null);
      })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: dataUpdates
        }));
      })
      .finally(() => {
        setUpdatingUser(false);
      });
  };

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md space-y-4 animate-in zoom-in-95 duration-500">
        <div className="bg-destructive/10 text-destructive w-14 h-14 rounded-full flex items-center justify-center mx-auto">
          <X className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">Access Restricted</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          You lack security access clearance context attributes required to operate database adjustment parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8 max-w-6xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-destructive" />
            Central Administration Center
          </h1>
          <p className="text-muted-foreground text-sm">Verify account application strings and balance overrides logs.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl shadow-sm">
          <TabsTrigger value="submissions" className="gap-2 font-semibold">
            <Layers className="h-4 w-4" />
            Applications Review ({allSubmissions?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2 font-semibold">
            <Users className="h-4 w-4" />
            Ledger & Users ({userProfiles?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Submissions review */}
        <TabsContent value="submissions" className="space-y-4">
          <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader>
              <CardTitle>Verification Pool</CardTitle>
              <CardDescription>Approve files to release funds from Hold into client Active liquid balances.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {subsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                </div>
              ) : allSubmissions?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase font-bold">
                      <tr>
                        <th className="p-4">Sender Profile</th>
                        <th className="p-4">Target Login</th>
                        <th className="p-4">Key Data String</th>
                        <th className="p-4">Visual QR Attachment</th>
                        <th className="p-4">Status Log</th>
                        <th className="p-4 text-right">Actions Override</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {allSubmissions.map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-4">
                            <span className="font-semibold block text-xs">{sub.userEmail}</span>
                            <span className="text-[10px] text-muted-foreground font-mono block max-w-[100px] truncate">ID: {sub.userId}</span>
                          </td>
                          <td className="p-4 font-bold text-foreground">{sub.accountEmail}</td>
                          <td className="p-4 font-mono text-xs max-w-[120px] truncate">{sub.password}</td>
                          <td className="p-4">
                            {sub.qrCodeUrl ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs rounded-full">
                                    <Eye className="h-3 w-3" /> View Photo
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md rounded-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-sm font-bold">QR Image Data - {sub.accountEmail}</DialogTitle>
                                  </DialogHeader>
                                  <div className="p-2 border rounded-xl bg-muted/30">
                                    <img src={sub.qrCodeUrl} className="w-full h-auto object-contain max-h-[350px]" alt="Account Handle QR" />
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">None uploaded</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${
                              sub.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                              sub.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                              'bg-amber-100 text-amber-700 border-amber-200'
                            }`}>
                              {sub.status || 'pending'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {sub.status === 'pending' && (
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-full text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() => handleApprove(sub)}
                                  title="Approve Submission"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-full text-destructive border-destructive/20 hover:bg-destructive/5"
                                  onClick={() => handleReject(sub)}
                                  title="Reject Submission"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 italic text-muted-foreground">No applications currently loaded in queue.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: User Accounts / Balance Override */}
        <TabsContent value="accounts" className="space-y-4">
          <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader>
              <CardTitle>User Account Ledger</CardTitle>
              <CardDescription>Direct state adjustments for hold balances or active parameters.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                </div>
              ) : userProfiles?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase font-bold">
                      <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Google Verified Mail</th>
                        <th className="p-4">Hold Assets</th>
                        <th className="p-4">Active Liquidity</th>
                        <th className="p-4 text-right">Overrides</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {userProfiles.map((prof: any) => (
                        <tr key={prof.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            {prof.photoUrl && (
                              <img src={prof.photoUrl} className="w-7 h-7 rounded-full border" alt="" />
                            )}
                            <span className="font-bold text-foreground block">{prof.displayName || 'Unnamed User'}</span>
                          </td>
                          <td className="p-4 text-xs font-mono">{prof.email}</td>
                          <td className="p-4 font-bold text-amber-600">${parseFloat(prof.holdBalance ?? 0).toFixed(2)}</td>
                          <td className="p-4 font-bold text-emerald-600">${parseFloat(prof.activeBalance ?? 0).toFixed(2)}</td>
                          <td className="p-4 text-right">
                            <Dialog open={balanceEditUserId === prof.id} onOpenChange={(isOpen) => {
                              if (isOpen) {
                                setBalanceEditUserId(prof.id);
                                setEditHoldBalance(String(prof.holdBalance ?? 0));
                                setEditActiveBalance(String(prof.activeBalance ?? 0));
                              } else {
                                setBalanceEditUserId(null);
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1 h-8 rounded-full">
                                  <DollarSign className="h-3 w-3" /> Adjust Balances
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-sm rounded-2xl">
                                <DialogHeader>
                                  <DialogTitle className="text-base font-bold">Manual Balance Control</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleManualBalanceChange} className="space-y-4 pt-2">
                                  <div className="space-y-1">
                                    <Label>Hold Balance ($)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      required
                                      value={editHoldBalance}
                                      onChange={(e) => setEditHoldBalance(e.target.value)}
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <Label>Active Balance ($)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      required
                                      value={editActiveBalance}
                                      onChange={(e) => setEditActiveBalance(e.target.value)}
                                    />
                                  </div>

                                  <Button type="submit" disabled={updatingUser} className="w-full rounded-xl font-bold">
                                    {updatingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Override Assets State'}
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 italic text-muted-foreground">No records currently logged in backend collection profiles.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}