import React, { useEffect, useState } from 'react';
import { firestoreService } from '../lib/firestoreService';
import { Transaction, Client } from '../types';
import { Card, CardContent } from './ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { format, isSameMonth, parseISO } from 'date-fns';
import { Wallet, ArrowDownLeft, ArrowUpRight, Calendar as CalendarIcon, Filter, FileDown } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { toast } from 'sonner';

export const HistoryView = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Record<string, string>>({});
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [txs, allClients] = await Promise.all([
        firestoreService.getTransactions(),
        firestoreService.getClients()
      ]);
      setTransactions(txs);
      setClients(allClients.reduce((acc, c: any) => ({ ...acc, [c.id]: c.name }), {}));
      setLoading(false);
    };
    fetchData();
  }, []);

  const monthTxs = transactions.filter(tx => tx.date.startsWith(selectedMonth));

  const summary = monthTxs.reduce((acc, tx) => {
    if (tx.type === 'credit') {
      acc.totalIn += tx.amount;
      if (tx.paymentMethod === 'cash') acc.cashIn += tx.amount;
      else acc.transferIn += tx.amount;
    } else {
      acc.totalOut += tx.amount;
    }
    return acc;
  }, { totalIn: 0, totalOut: 0, cashIn: 0, transferIn: 0 });

  const monthOptions = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      value: format(d, 'yyyy-MM'),
      label: format(d, 'MMMM yyyy')
    };
  });

  return (
    <div className="space-y-6 pb-24">
      <header className="ios-header">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-4xl font-bold text-white mb-1">History</h1>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="relative flex-1 max-w-[200px]">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 z-10" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="ios-card bg-neutral-900 border-neutral-800 h-10 pl-10 text-white text-[10px] font-black uppercase tracking-widest">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                {monthOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="focus:bg-neutral-800 text-xs">{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-neutral-500 uppercase font-black tracking-tighter">Net Balance</p>
             <p className="text-xl font-black text-blue-500">₦{(summary.totalIn - summary.totalOut).toLocaleString()}</p>
          </div>
        </div>
      </header>

      <div className="px-6 space-y-4">
        {/* Month Summary Bento */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="ios-card col-span-2 p-6 bg-gradient-to-br from-neutral-900 to-neutral-950 border-neutral-800">
            <p className="text-[10px] text-neutral-500 uppercase font-black mb-4 tracking-[0.2em]">Monthly Revenue Split</p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] text-neutral-600 uppercase font-bold mb-1">Cash Intake</p>
                <p className="text-3xl font-black text-emerald-400">₦{summary.cashIn.toLocaleString()}</p>
              </div>
              <div className="border-l border-neutral-800 pl-8">
                <p className="text-[10px] text-neutral-600 uppercase font-bold mb-1">Transfer Intake</p>
                <p className="text-3xl font-black text-blue-400">₦{summary.transferIn.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="ios-card p-4 bg-emerald-500/5 border-emerald-500/10">
            <p className="text-[8px] text-emerald-500/60 uppercase font-bold mb-1">Total Income</p>
            <p className="text-xl font-bold text-emerald-400">₦{summary.totalIn.toLocaleString()}</p>
          </Card>

          <Card className="ios-card p-4 bg-red-500/5 border-red-500/10">
            <p className="text-[8px] text-red-500/60 uppercase font-bold mb-1">Total Expenses</p>
            <p className="text-xl font-bold text-red-400">₦{summary.totalOut.toLocaleString()}</p>
          </Card>
        </div>

        {/* Ledger */}
        <div className="space-y-3 mt-8">
          <h3 className="text-[10px] text-neutral-500 uppercase font-black tracking-[0.3em] mb-4">Transaction Log</h3>
          {loading ? (
            <div className="py-20 text-center text-[10px] text-neutral-700 font-black animate-pulse uppercase tracking-widest">Scanning Chains...</div>
          ) : monthTxs.length > 0 ? (
            monthTxs.map((tx, i) => (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="ios-card p-4 flex items-center justify-between bg-neutral-900 border-neutral-800/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {tx.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-neutral-100">{clients[tx.clientId] || 'Studio Client'}</p>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight">
                      {format(new Date(tx.date), 'MMM d')} • {tx.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                   <p className={`font-black text-lg ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                   </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center bg-neutral-900 border border-dashed border-neutral-800 rounded-3xl">
              <p className="text-[10px] text-neutral-700 font-bold uppercase tracking-widest">No Activity Recorded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

