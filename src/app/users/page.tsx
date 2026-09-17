
'use client';

import { useMemo, useState } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { 
  Users, 
  ShieldCheck, 
  DollarSign, 
  Loader2, 
  Lock, 
  Search, 
  Filter, 
  History, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const dynamic = 'force-dynamic';

/**
 * Master User Ledger
 * Displays all website users information in one place.
 * Publicly accessible within the app.
 */
export default function MasterUserLedger() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  // Management State
  const [balanceEditUserId, setBalanceEditUserId] = useState<string | null>(null);
  const [historyViewUserId, setHistoryViewUserId] = useState<string | null>(null);
  const [editHoldBalance, setEditHoldBalance] = useState('');
  const [editActiveBalance, setEditActiveBalance] = useState('');
  const [updatingUser, setUpdatingUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Live queries
  const usersQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'users'), orderBy('updatedAt', 'desc'));
  }, [db, user]);

  const submissionsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const payoutsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'payouts'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: userProfiles, loading: usersLoading } = useCollection(usersQuery);
  const { data: allSubmissions } = useCollection(submissionsQuery);
  const { data: allPayouts } = useCollection(payoutsQuery);

  const filteredUsers = useMemo(() => {
    if (!userProfiles) return [];
    return userProfiles.filter((p: any) => 
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.telegramChatId?.includes(searchTerm)
    );
  }, [userProfiles, searchTerm]);

  // Aggregate stats per user
  const userStats = useMemo(() => {
    const stats: Record<string, { approved: number; rejected: number; paidOut: number }> = {};
    
    allSubmissions?.forEach((sub: any) => {
      if (!stats[sub.userId]) stats[sub.userId] = { approved: 0, rejected: 0, paidOut: 0 };
      if (sub.status === 'approved') stats[sub.userId].approved++;
      if (sub.status === 'rejected') stats[sub.userId].rejected++;
    });

    allPayouts?.forEach((po: any) => {
      if (!stats[po.userId]) stats[po.userId] = { approved: 0, rejected: 0, paidOut: 0 };
      if (po.status === 'approved') stats[po.userId].paidOut += parseFloat(po.amount || '0');
    });

    return stats;
  }, [allSubmissions, allPayouts]);

  const handleManualBalanceChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceEditUserId) return;
    setUpdatingUser(true);
    const userRef = doc(db, 'users', balanceEditUserId);
    const dataUpdates = { 
      holdBalance: parseFloat(editHoldBalance || '0'), 
      activeBalance: parseFloat(editActiveBalance || '0'), 
      updatedAt: serverTimestamp() 
    };

    setDoc(userRef, dataUpdates, { merge: true })
      .then(() => { 
        toast({ title: 'Balance updated successfully.' }); 
        setBalanceEditUserId(null); 
      })
      .catch((error) => errorEmitter.emit('permission-error', new FirestorePermissionError({ 
        path: userRef.path, 
        operation: 'update', 
        requestResourceData: dataUpdates 
      })))
      .finally(() => setUpdatingUser(false));
  };

  const selectedUserForHistory = useMemo(() => {
    return userProfiles?.find((u: any) => u.id === historyViewUserId);
  }, [userProfiles, historyViewUserId]);

  const selectedUserSubmissions = useMemo(() => {
    return allSubmissions?.filter((s: any) => s.userId === historyViewUserId);
  }, [allSubmissions, historyViewUserId]);

  const selectedUserPayouts = useMemo(() => {
    return allPayouts?.filter((p: any) => p.userId === historyViewUserId);
  }, [allPayouts, historyViewUserId]);

  if (authLoading) return <div className="flex min-h-[70vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>;

  if (!user) return (
    <div className="container mx-auto px-4 py-20 text-center max-w-md space-y-4">
      <div className="bg-amber-100 text-amber-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto"><Lock className="h-6 w-6" /></div>
      <h2 className="text-2xl font-bold">Authentication Required</h2>
      <p className="text-muted-foreground text-sm">Please log in to your account first.</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8 max-w-[95%] space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Master User Ledger
          </h1>
          <p className="text-muted-foreground text-sm">Full platform oversight including balances, task status, and payout history.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or chat ID..." 
            className="pl-10 border-none bg-muted/50 focus-visible:ring-1" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
        <CardContent className="p-0">
          {usersLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground text-[10px] uppercase font-bold">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Telegram</th>
                    <th className="p-4">Tasks (A/R)</th>
                    <th className="p-4">Hold</th>
                    <th className="p-4">Active</th>
                    <th className="p-4">Total Paid</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((prof: any) => {
                    const stats = userStats[prof.id] || { approved: 0, rejected: 0, paidOut: 0 };
                    return (
                      <tr key={prof.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4">
                          <span className="font-bold block truncate max-w-[150px]">{prof.displayName || 'Unnamed'}</span>
                          <span className="text-[10px] opacity-50">{prof.email}</span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${prof.telegramChatId ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {prof.telegramChatId || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4 font-bold">
                          <span className="text-green-600">{stats.approved}</span>
                          <span className="text-muted-foreground mx-1">/</span>
                          <span className="text-destructive">{stats.rejected}</span>
                        </td>
                        <td className="p-4 font-bold text-amber-600">${parseFloat(prof.holdBalance ?? 0).toFixed(2)}</td>
                        <td className="p-4 font-bold text-emerald-600">${parseFloat(prof.activeBalance ?? 0).toFixed(2)}</td>
                        <td className="p-4 font-bold text-primary">${stats.paidOut.toFixed(2)}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setHistoryViewUserId(prof.id)} className="h-8 rounded-full gap-1">
                              <Eye className="h-3 w-3" /> History
                            </Button>
                            <Dialog open={balanceEditUserId === prof.id} onOpenChange={(open) => { if (open) { setBalanceEditUserId(prof.id); setEditHoldBalance(String(prof.holdBalance ?? 0)); setEditActiveBalance(String(prof.activeBalance ?? 0)); } else { setBalanceEditUserId(null); } }}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 rounded-full gap-1">
                                  <DollarSign className="h-3 w-3" /> Adjust
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-sm">
                                <DialogHeader>
                                  <DialogTitle>Adjust: {prof.displayName}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleManualBalanceChange} className="space-y-4 pt-2">
                                  <div className="space-y-1">
                                    <Label>Hold ($)</Label>
                                    <Input type="number" step="0.01" required value={editHoldBalance} onChange={(e) => setEditHoldBalance(e.target.value)} />
                                  </div>
                                  <div className="space-y-1">
                                    <Label>Active ($)</Label>
                                    <Input type="number" step="0.01" required value={editActiveBalance} onChange={(e) => setEditActiveBalance(e.target.value)} />
                                  </div>
                                  <Button type="submit" disabled={updatingUser} className="w-full">
                                    {updatingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Balance'}
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail History Modal */}
      <Dialog open={!!historyViewUserId} onOpenChange={(open) => !open && setHistoryViewUserId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Activity Ledger: {selectedUserForHistory?.displayName || 'User Details'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-8 pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Hold Balance</p>
                <p className="text-xl font-bold text-amber-600">${parseFloat(selectedUserForHistory?.holdBalance ?? 0).toFixed(2)}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Active Balance</p>
                <p className="text-xl font-bold text-emerald-600">${parseFloat(selectedUserForHistory?.activeBalance ?? 0).toFixed(2)}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Tasks Approved</p>
                <p className="text-xl font-bold text-primary">{userStats[historyViewUserId || '']?.approved || 0}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Total Withdrawn</p>
                <p className="text-xl font-bold text-primary">${(userStats[historyViewUserId || '']?.paidOut || 0).toFixed(2)}</p>
              </div>
            </div>

            <section className="space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2 px-1">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Submission Record
              </h3>
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-[9px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="p-3">Target Email</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Value</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedUserSubmissions?.map((s: any) => (
                      <tr key={s.id}>
                        <td className="p-3 font-semibold">{s.accountEmail}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border ${
                            s.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                            s.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3 font-bold">${parseFloat(s.earnings || 1.12).toFixed(2)}</td>
                        <td className="p-3 text-muted-foreground">{s.createdAt ? new Date(s.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                    {!selectedUserSubmissions?.length && (
                      <tr><td colSpan={4} className="p-4 text-center italic text-muted-foreground">No submissions found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2 px-1">
                <Wallet className="h-4 w-4 text-emerald-600" />
                Payout Fulfillment Record
              </h3>
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-[9px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="p-3">Payout ID</th>
                      <th className="p-3">Address</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedUserPayouts?.map((p: any) => (
                      <tr key={p.id}>
                        <td className="p-3 font-mono text-[9px]">#{p.id.substring(0, 8).toUpperCase()}</td>
                        <td className="p-3 font-mono text-[8px] truncate max-w-[150px]">{p.usdtAddress}</td>
                        <td className="p-3">
                           <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border ${
                            p.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            p.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-600">${parseFloat(p.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                    {!selectedUserPayouts?.length && (
                      <tr><td colSpan={4} className="p-4 text-center italic text-muted-foreground">No payouts requested.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
