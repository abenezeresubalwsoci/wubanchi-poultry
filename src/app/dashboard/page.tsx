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
  CheckCircle2, 
  ArrowUpRight, 
  AlertCircle, 
  ArrowDownCircle, 
  ListFilter,
  Loader2,
  History,
  CreditCard,
  Send,
  ShieldCheck,
  TrendingUp,
  Clock
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
  const totalBalance = (activeBalance as number) + (holdBalance as number);
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

    if (amt < 5) {
      toast({ variant: 'destructive', title: 'Minimum Payout', description: 'The minimum withdrawal amount is $5.00.' });
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
        Please authenticate via the home gateway to access your wallet.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8 max-w-6xl space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
          <p className="text-muted-foreground">Manage your earnings, check balances, and request withdrawals.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold">
          <ShieldCheck className="h-4 w-4" />
          <span>Telegram ID: {telegramChatId}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Balance</p>
                <h2 className="text-3xl font-bold text-emerald-600">${parseFloat(activeBalance as any).toFixed(2)}</h2>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
            <p className="text-[10px] text-emerald-600 font-bold mt-4 uppercase">Ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hold Balance</p>
                <h2 className="text-3xl font-bold text-amber-600">${parseFloat(holdBalance as any).toFixed(2)}</h2>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <p className="text-[10px] text-amber-600 font-bold mt-4 uppercase">Verification in progress</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-primary text-primary-foreground overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-primary-foreground/70 uppercase tracking-widest">Total Assets</p>
                <h2 className="text-3xl font-bold">${totalBalance.toFixed(2)}</h2>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <p className="text-[10px] text-white/80 font-bold mt-4 uppercase">Aggregate value</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-10">
          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ListFilter className="h-5 w-5 text-primary" />
              Recent Submissions
            </h3>
            <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
              {subsLoading ? (
                <div className="flex py-12 justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary opacity-20" /></div>
              ) : allSubmissions?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground text-[10px] uppercase font-bold">
                      <tr>
                        <th className="p-4">Account Reference</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Reward</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {allSubmissions.map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-muted/5 transition-colors">
                          <td className="p-4 font-semibold">{sub.accountEmail}</td>
                          <td className="p-4 text-muted-foreground">
                            {sub.createdAt ? new Date(sub.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                          </td>
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
                <div className="text-center py-12 italic text-muted-foreground text-sm">No submissions recorded.</div>
              )}
            </Card>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-600" />
              Withdrawal History
            </h3>
            <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
              {payoutsLoading ? (
                <div className="flex py-12 justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary opacity-20" /></div>
              ) : allPayouts?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground text-[10px] uppercase font-bold">
                      <tr>
                        <th className="p-4">Request ID</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {allPayouts.map((po: any) => (
                        <tr key={po.id} className="hover:bg-muted/5 transition-colors">
                          <td className="p-4 text-[10px] font-mono font-bold text-muted-foreground">#{po.id.substring(0, 8).toUpperCase()}</td>
                          <td className="p-4 text-muted-foreground">
                            {po.createdAt ? new Date(po.createdAt.seconds * 1000).toLocaleDateString() : 'Pending'}
                          </td>
                          <td className="p-4 font-bold text-emerald-600">${parseFloat(po.amount).toFixed(2)}</td>
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
                <div className="text-center py-12 italic text-muted-foreground text-sm">No payout requests found.</div>
              )}
            </Card>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border shadow-xl bg-card rounded-2xl overflow-hidden sticky top-24">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5 text-primary" />
                Initialize Payout
              </CardTitle>
              <CardDescription>Withdraw your active funds securely.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleRequestPayout} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Withdrawal Amount (USD)</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      required
                      placeholder="5.00"
                      className="pl-10"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-muted-foreground">Available:</span>
                    <span className="text-emerald-600">${parseFloat(activeBalance as any).toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={requesting || activeBalance < 5} 
                  className="w-full rounded-xl font-bold py-6 shadow-lg active:scale-[0.98] transition-all"
                >
                  {requesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowUpRight className="h-4 w-4 mr-2" />}
                  Confirm Withdrawal
                </Button>

                {activeBalance < 5 && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-[10px] font-bold leading-tight">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    A minimum active balance of $5.00 is required for payout fulfillment.
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
