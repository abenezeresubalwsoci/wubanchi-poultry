'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet, Clock, CheckCircle2, ArrowUpRight, TrendingUp, HelpCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function WalletPage() {
  const { user } = useUser();
  const db = useFirestore();

  const userProfileRef = useMemo(() => {
    return user ? doc(db, 'users', user.uid) : null;
  }, [db, user]);

  const { data: profile } = useDoc(userProfileRef);

  // Load user submissions to show logs
  const approvedQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, 'submissions'),
      where('userId', '==', user.uid),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: approvedLogs } = useCollection(approvedQuery);

  const activeBalance = profile?.activeBalance ?? 0;
  const holdBalance = profile?.holdBalance ?? 0;
  const totalSubmissionsVal = (activeBalance + holdBalance);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md italic text-muted-foreground">
        Please use the top profile bar to authenticate before accessing wallet dashboards.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8 max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Financial Dashboard</h1>
        <p className="text-muted-foreground text-sm">Real-time status of your hold assets and verified payouts.</p>
      </div>

      {/* Main Balance Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="border-none shadow-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl overflow-hidden relative group">
          <div className="absolute right-4 bottom-2 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <Clock className="h-32 w-32" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-widest text-amber-100 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hold Balance
            </CardTitle>
            <CardDescription className="text-xs text-amber-100/70">
              Instantly credited upon credential filing. Pending verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-4xl font-extrabold tracking-tight">${parseFloat(holdBalance).toFixed(2)}</div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-100 bg-black/10 px-3 py-1.5 rounded-lg w-fit">
              <TrendingUp className="h-3 w-3" />
              <span>Moves to active balance once admin reviews data</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl overflow-hidden relative group">
          <div className="absolute right-4 bottom-2 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <Wallet className="h-32 w-32" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-widest text-emerald-100 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Active Balance
            </CardTitle>
            <CardDescription className="text-xs text-emerald-100/70">
              Fully approved parameters. Unrestricted liquidity status.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-4xl font-extrabold tracking-tight">${parseFloat(activeBalance).toFixed(2)}</div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-100 bg-black/10 px-3 py-1.5 rounded-lg w-fit">
              <ArrowUpRight className="h-3 w-3" />
              <span>Eligible for secure external direct withdrawal requests</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ledger Breakdown Explanation */}
      <Card className="border shadow-sm rounded-xl bg-white">
        <CardHeader className="pb-3 flex flex-row items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base font-bold">Understanding Balance Lifecycles</CardTitle>
            <CardDescription className="text-xs">
              Review how automated submission processing applies parameter adjustments to your assets.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-sm space-y-3 leading-relaxed text-muted-foreground">
          <p>
            1. Every file entry successfully submitted rewards you with an instant <strong className="text-foreground">$1.12</strong> placed under your <strong>Hold Balance</strong>.
          </p>
          <p>
            2. Our audit staff analyzes the submitted credentials and data strings. When marked as <strong>Approved</strong>, the entry's earnings trigger structural balance adjustments, subtracting the amount from your Hold pool and instantly assigning it to the unrestricted <strong>Active Balance</strong> ledger.
          </p>
        </CardContent>
      </Card>

      {/* Payout Logs */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Verified Balance Transitions</h2>
        {approvedLogs?.length ? (
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground text-xs uppercase font-semibold">
                <tr>
                  <th className="p-4">Target Account</th>
                  <th className="p-4">Audited Date</th>
                  <th className="p-4 text-right">Settled Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {approvedLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{log.accountEmail}</td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {log.createdAt ? new Date(log.createdAt.seconds * 1000).toLocaleDateString() : 'Recently Approved'}
                    </td>
                    <td className="p-4 text-right font-bold text-emerald-600">${parseFloat(log.earnings || 1.12).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 bg-muted/20 border border-dashed rounded-xl italic text-muted-foreground text-xs">
            Approved submission events will construct ledger transactions here.
          </div>
        )}
      </div>
    </div>
  );
}