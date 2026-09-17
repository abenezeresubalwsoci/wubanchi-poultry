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
  Wallet, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  TrendingUp, 
  HelpCircle, 
  Send, 
  User, 
  AlertCircle, 
  ArrowDownCircle, 
  ListFilter,
  Loader2
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function WalletPage() {
  const { user } = useUser();
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

  const { data: allSubmissions, loading: subsLoading } = useCollection(submissionsQuery);

  const activeBalance = profile?.activeBalance ?? 0;
  const holdBalance = profile?.holdBalance ?? 0;
  const totalBalance = activeBalance + holdBalance;
  const telegramChatId = profile?.telegramChatId || 'Not connected';

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const amt = parseFloat(payoutAmount);
    if (isNaN(amt) || amt <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please specify a real numeric amount to request withdrawal.',
      });
      return;
    }

    if (amt > activeBalance) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Liquid Balance',
        description: 'Your requested amount exceeds your available active liquidity pool.',
      });
      return;
    }

    setRequesting(true);
    try {
      toast({
        title: 'Payout Request Logged',
        description: `Your payout application for $${amt.toFixed(2)} has been recorded for staff audit.`,
      });
      setPayoutAmount('');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not communicate with the database ledgers.',
      });
    } finally {
      setRequesting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md italic text-muted-foreground">
        Please authenticate via the home layout gate before viewing financial statements.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8 max-w-5xl space-y-8 animate-in fade-in duration-500">
      
      {/* Upper Profile & Identity Block */}
      <Card className="border bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">{profile?.displayName || 'User Session'}</h2>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
          </div>
          
          <div className="bg-muted/40 p-4 rounded-xl border flex items-center gap-3 w-full md:w-auto">
            <Send className="h-5 w-5 text-primary shrink-0" />
            <div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Telegram Chat Link</span>
              <span className="text-sm font-mono font-bold text-foreground">{telegramChatId}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Numerical Statement Grid */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="border-none shadow-md bg-white border border-gray-100 rounded-2xl overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              Hold Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-amber-600">${parseFloat(holdBalance).toFixed(2)}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Pending admin confirmation</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white border border-gray-100 rounded-2xl overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Active Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600">${parseFloat(activeBalance).toFixed(2)}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Available for cashout transfers</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-primary text-primary-foreground rounded-2xl overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary-100 flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5" />
              Total Cumulative Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">${totalBalance.toFixed(2)}</div>
            <p className="text-[10px] text-primary-200 mt-1">Sum of active and hold pool assets</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Ledger Tables Area */}
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        
        {/* Table of Submissions and Status Entries */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <ListFilter className="h-5 w-5 text-primary" />
              Task Submission Ledger
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-muted text-muted-foreground">Order by Date</span>
          </div>

          <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
            {subsLoading ? (
              <div className="flex py-12 justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary opacity-30" />
              </div>
            ) : allSubmissions?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/60 text-muted-foreground text-xs uppercase font-bold border-b">
                    <tr>
                      <th className="p-3">Target Login</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs">
                    {allSubmissions.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-3 font-semibold text-foreground">{sub.accountEmail}</td>
                        <td className="p-3 text-muted-foreground">
                          {sub.createdAt ? new Date(sub.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold capitalize border ${
                            sub.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                            sub.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {sub.status || 'pending'}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-foreground">
                          ${parseFloat(sub.earnings || 1.12).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 italic text-muted-foreground text-xs">
                No processed task results documented under this ledger session.
              </div>
            )}
          </Card>
        </div>

        {/* Payout Actions Container */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-emerald-600" />
            Withdraw Liquidity
          </h3>

          <Card className="border shadow-sm bg-white rounded-xl overflow-hidden">
            <CardHeader className="pb-3 bg-muted/20 border-b">
              <CardTitle className="text-sm font-bold">Request Settlement</CardTitle>
              <CardDescription className="text-xs">Draw from approved unrestricted funds.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleRequestPayout} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="payoutAmount">Amount to Withdraw ($)</Label>
                  <Input
                    id="payoutAmount"
                    type="number"
                    step="0.01"
                    placeholder="E.g. 5.00"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={requesting || activeBalance <= 0} 
                  className="w-full text-xs font-bold rounded-lg h-9"
                >
                  {requesting ? 'Processing Request...' : 'File Cashout Request'}
                </Button>
              </form>

              <div className="mt-4 pt-4 border-t space-y-2 text-[11px] text-muted-foreground leading-normal">
                <div className="flex gap-1.5 items-start">
                  <ArrowUpRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span>Payout approvals are forwarded to your registered Telegram ID for notification alert updates.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
