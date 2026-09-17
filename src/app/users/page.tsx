
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
import { Users, ShieldCheck, DollarSign, Loader2, Lock, Search, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const dynamic = 'force-dynamic';

/**
 * Hidden Master User Ledger
 * Displays all website users information in one place.
 * Protected by portal login.
 */
export default function MasterUserLedger() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  // Portal Login State
  const [portalUsername, setPortalUsername] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const [isPortalAuthorized, setIsPortalAuthorized] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Management State
  const [balanceEditUserId, setBalanceEditUserId] = useState<string | null>(null);
  const [editHoldBalance, setEditHoldBalance] = useState('');
  const [editActiveBalance, setEditActiveBalance] = useState('');
  const [updatingUser, setUpdatingUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Live query for all users
  const usersQuery = useMemo(() => {
    if (!user || !isPortalAuthorized) return null;
    return query(collection(db, 'users'), orderBy('updatedAt', 'desc'));
  }, [db, user, isPortalAuthorized]);

  const { data: userProfiles, loading: usersLoading } = useCollection(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!userProfiles) return [];
    return userProfiles.filter((p: any) => 
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.telegramChatId?.includes(searchTerm)
    );
  }, [userProfiles, searchTerm]);

  const handlePortalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (portalUsername === 'abeni' && portalPassword === 'abeni123') {
      setIsAuthorizing(true);
      setIsPortalAuthorized(true);
      toast({ title: 'Master Ledger Access Granted', description: 'Session initialized.' });
      setIsAuthorizing(false);
    } else {
      toast({ variant: 'destructive', title: 'Access Denied', description: 'Invalid master credentials.' });
    }
  };

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

  if (authLoading) return <div className="flex min-h-[70vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>;

  if (!user) return (
    <div className="container mx-auto px-4 py-20 text-center max-w-md space-y-4">
      <div className="bg-amber-100 text-amber-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto"><Lock className="h-6 w-6" /></div>
      <h2 className="text-2xl font-bold">Authentication Required</h2>
      <p className="text-muted-foreground text-sm">Please log in to your account first.</p>
    </div>
  );

  if (!isPortalAuthorized) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-3">
          <div className="bg-primary/10 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-primary">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Master Ledger Gateway</h1>
          <p className="text-muted-foreground text-sm">This is a hidden management portal for system users.</p>
        </div>
        <Card className="border shadow-lg bg-white rounded-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Portal Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePortalLogin} className="space-y-4">
              <div className="space-y-1">
                <Label>Username</Label>
                <Input required placeholder="Username" value={portalUsername} onChange={(e) => setPortalUsername(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Password</Label>
                <Input type="password" required placeholder="••••••••" value={portalPassword} onChange={(e) => setPortalPassword(e.target.value)} />
              </div>
              <Button type="submit" disabled={isAuthorizing} className="w-full">
                {isAuthorizing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Open Ledger'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8 max-w-7xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Master User Ledger
          </h1>
          <p className="text-muted-foreground text-sm">Complete overview of all registered website users and their financial status.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsPortalAuthorized(false)} className="rounded-full">Lock Session</Button>
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
        <Button variant="ghost" size="icon" className="shrink-0"><Filter className="h-4 w-4" /></Button>
      </div>

      <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
        <CardContent className="p-0">
          {usersLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground text-xs uppercase font-bold">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Telegram Chat ID</th>
                    <th className="p-4">Hold Balance</th>
                    <th className="p-4">Active Balance</th>
                    <th className="p-4">Last Activity</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((prof: any) => (
                    <tr key={prof.id} className="hover:bg-muted/20">
                      <td className="p-4">
                        <span className="font-bold block">{prof.displayName || 'Unnamed'}</span>
                        <span className="text-[10px] opacity-50">{prof.email}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${prof.telegramChatId ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {prof.telegramChatId || 'Not Linked'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-amber-600">${parseFloat(prof.holdBalance ?? 0).toFixed(2)}</td>
                      <td className="p-4 font-bold text-emerald-600">${parseFloat(prof.activeBalance ?? 0).toFixed(2)}</td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {prof.updatedAt ? new Date(prof.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-right">
                        <Dialog open={balanceEditUserId === prof.id} onOpenChange={(open) => { if (open) { setBalanceEditUserId(prof.id); setEditHoldBalance(String(prof.holdBalance ?? 0)); setEditActiveBalance(String(prof.activeBalance ?? 0)); } else { setBalanceEditUserId(null); } }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 rounded-full">
                              <DollarSign className="h-3 w-3" /> Adjust
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-sm">
                            <DialogHeader>
                              <DialogTitle>Manual Adjust: {prof.displayName}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleManualBalanceChange} className="space-y-4 pt-2">
                              <div className="space-y-1">
                                <Label>Hold Balance ($)</Label>
                                <Input type="number" step="0.01" required value={editHoldBalance} onChange={(e) => setEditHoldBalance(e.target.value)} />
                              </div>
                              <div className="space-y-1">
                                <Label>Active Balance ($)</Label>
                                <Input type="number" step="0.01" required value={editActiveBalance} onChange={(e) => setEditActiveBalance(e.target.value)} />
                              </div>
                              <Button type="submit" disabled={updatingUser} className="w-full">
                                {updatingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply Changes'}
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground italic">No users found matching your search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
