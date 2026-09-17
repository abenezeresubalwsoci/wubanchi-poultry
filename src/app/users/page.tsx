
'use client';

import { useMemo, useState } from 'react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Send, 
  AlertCircle, 
  ArrowDownCircle, 
  ListFilter,
  Loader2,
  History
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function UserDashboard() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [payoutAmount, setPayoutAmount] = useState('');
  const [requesting, setRequesting] = useState(false);

  const userProfileRef = useMemo(() => {
    return user ? doc(db, 'users', user.uid) : null;
  }, [db, user]);

  const { data: profile } = useDoc(userProfileRef);

  const submissionsQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, 'submissions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const payoutsQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, 'payouts'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: allSubmissions, loading: subsLoading } = useCollection(submissionsQuery);
  const { data: allPayouts, loading: payoutsLoading } = useCollection(payoutsQuery);

  const activeBalance = profile?.activeBalance ?? 0;
  const holdBalance = profile?.holdBalance ?? 0;
  const totalBalance = activeBalance + holdBalance;
  const telegramChatId = profile?.telegramChatId || 'Not connected';

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const amt = parseFloat(payoutAmount);
    if (isNaN(amt) || amt <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please specify a real numeric amount.' });
      return;
    }

    if (amt > activeBalance) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Amount exceeds active balance.' });
      return;
    }

    setRequesting(true);
    const payoutData = {
      userId: user.uid,
      amount: amt,
      status: 'pending',
      createdAt: serverTimestamp()
    };

    addDoc(collection(db, 'payouts'), payoutData)
      .then(() => {
        toast({ title: 'Payout Requested', description: `$${amt.toFixed(2)} withdrawal is pending review.` });
        setPayoutAmount('');
      })
      .catch(() => {
        toast({ variant: 'destructive', title: 'Request Failed', description: 'Communication error with server.' });
      })
      .finally(() => {
        setRequesting(false);
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
      <div className="container mx-auto px-4 py-20 text-center max-w-md italic text-muted-foreground">
        Please authenticate via the home gateway to access your dashboard.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8 max-w-6xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{profile?.displayName || 'User Profile'}</h1>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-2xl border shadow-sm flex items-center gap-3 w-full md:w-auto">
          <Send className="h-6 w-6 text-primary shrink-0" />
          <div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Telegram Chat ID</span>
            <span className="text-sm font-mono font-bold text-foreground">{telegramChatId}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-500" />
              Hold Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-amber-600">${parseFloat(holdBalance as any).toFixed(2)}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Pending admin confirmation</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Active Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600">${parseFloat(activeBalance as any).toFixed(2)}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-primary text-primary-foreground rounded-2xl overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary-100 flex items-center gap-1.5">
              <Wallet className="h-4 w-4" />
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">${totalBalance.toFixed(2)}</div>
            <p className="text-[10px] text-primary-200 mt-1">Sum of all cumulative earnings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ListFilter className="h-5 w-5 text-primary" />
              Task Submission Ledger
            </h3>
            <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
              {subsLoading ? (
                <div className="flex py-12 justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary opacity-20" /></div>
              ) : allSubmissions?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase font-bold">
                      <tr>
                        <th className="p-4">Account</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {allSubmissions.map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-muted/5 transition-colors">
                          <td className="p-4 font-semibold">{sub.accountEmail}</td>
                          <td className="p-4 text-muted-foreground">{sub.createdAt ? new Date(sub.createdAt.seconds * 1000).toLocaleDateString() : 'Pending'}</td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              sub.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                              sub.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {sub.status || 'pending'}
                            </span>
                          </td>
                          <td className="p-4 text-right font-bold text-primary">${parseFloat(sub.earnings || 1.12).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 italic text-muted-foreground text-sm">No task history found.</div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-600" />
              Payout History
            </h3>
            <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
              {payoutsLoading ? (
                <div className="flex py-12 justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary opacity-20" /></div>
              ) : allPayouts?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase font-bold">
                      <tr>
                        <th className="p-4">Date Requested</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {allPayouts.map((po: any) => (
                        <tr key={po.id} className="hover:bg-muted/5 transition-colors">
                          <td className="p-4 text-muted-foreground">{po.createdAt ? new Date(po.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</td>
                          <td className="p-4 font-bold">${parseFloat(po.amount).toFixed(2)}</td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              po.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              po.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {po.status || 'processing'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 italic text-muted-foreground text-sm">No payout records found.</div>
              )}
            </Card>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border shadow-xl bg-card rounded-2xl overflow-hidden sticky top-24">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5 text-primary" />
                Withdraw Funds
              </CardTitle>
              <CardDescription>Minimum withdrawal: $5.00</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleRequestPayout} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Withdrawal Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="Enter amount"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">Available active balance: ${parseFloat(activeBalance as any).toFixed(2)}</p>
                </div>
                <Button 
                  type="submit" 
                  disabled={requesting || activeBalance < 5} 
                  className="w-full rounded-xl font-bold py-5 shadow-lg active:scale-[0.98]"
                >
                  {requesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
                  Request Payout
                </Button>
                {activeBalance < 5 && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-[10px] font-bold leading-tight">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    You need at least $5.00 in your active balance to request a payout.
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
