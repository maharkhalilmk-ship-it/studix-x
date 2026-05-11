import React, { useEffect, useState } from 'react';
import { firestoreService } from '../lib/firestoreService';
import { Transaction, Client } from '../types';
import { Camera, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProfit: 0,
    totalWork: 0,
    pendingPayments: 0,
    pictureCount: 0,
    cashTotal: 0,
    transferTotal: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      const [txs, allClients] = await Promise.all([
        firestoreService.getTransactions(),
        firestoreService.getClients()
      ]);
      
      const clientMap = allClients.reduce((acc, c: any) => ({ ...acc, [c.id]: c.name }), {});
      setClients(clientMap);
      setRecentTransactions(txs.slice(0, 4));

      const totals = txs.reduce((acc, tx) => {
        if (tx.type === 'credit') {
          acc.totalProfit += tx.amount;
          acc.pendingPayments += (tx.totalAmount - tx.paidAmount);
          acc.pictureCount += tx.pictureCount || 0;
          if (tx.paymentMethod === 'cash') acc.cashTotal += tx.amount;
          else acc.transferTotal += tx.amount;
        } else {
          acc.totalProfit -= tx.amount;
        }
        acc.totalWork += 1;
        return acc;
      }, { totalProfit: 0, totalWork: 0, pendingPayments: 0, pictureCount: 0, cashTotal: 0, transferTotal: 0 });

      setStats(totals);
    };
    fetchData();
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-2 pb-20">
      <header className="ios-header">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
              STUDIO X
            </h1>
            <p className="text-neutral-500 font-bold text-xs uppercase tracking-widest">
              Business Studio • {format(new Date(), 'MMMM yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Status</p>
              <p className="text-xs font-mono text-emerald-400">SECURE & SYNCED</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-900 dark:text-white">{getInitials('STUDIO X')}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-2 ios-card p-6 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20 uppercase">Profit Summary</span>
            <span className="text-neutral-500 text-[10px] uppercase font-bold">Updated Now</span>
          </div>
          <div className="mt-6">
            <h2 className="text-5xl font-bold tracking-tighter text-slate-900 dark:text-white">
              ₦{stats.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex gap-6 mt-6">
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-black tracking-tight">Cash</p>
                <p className="text-lg font-bold text-emerald-400">₦{stats.cashTotal.toLocaleString()}</p>
              </div>
              <div className="w-px h-8 bg-neutral-800 self-end"></div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-black tracking-tight">Transfer</p>
                <p className="text-lg font-bold text-blue-400">₦{stats.transferTotal.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-1 ios-card p-6"
        >
          <p className="text-[10px] text-neutral-500 uppercase font-black mb-1">Pictures</p>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stats.pictureCount}</div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-4">
            <div className="bg-blue-500 h-full w-[72%]"></div>
          </div>
          <p className="text-[8px] mt-2 text-neutral-500 uppercase font-bold tracking-widest">Monthly Target</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-1 ios-card p-6 border-orange-500/20"
        >
          <p className="text-[10px] text-orange-500 uppercase font-black mb-1">Debt</p>
          <div className="text-3xl font-bold text-orange-400">₦{stats.pendingPayments.toLocaleString()}</div>
          <p className="text-[8px] text-neutral-500 mt-4 uppercase font-bold">Unpaid Credit</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-2 md:col-span-4 ios-card p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Work</h3>
            <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest">View All</button>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((tx, i) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-100 dark:border-neutral-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {tx.type === 'credit' ? <Camera size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{clients[tx.clientId] || 'Client'}</p>
                    <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tight">
                      {tx.description.slice(0, 20)} • {format(new Date(tx.date), 'MMM d')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[8px] text-neutral-500 uppercase font-bold tracking-widest">{tx.paymentMethod}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
      
      <footer className="mt-8 px-8 flex justify-between text-[10px] text-neutral-700 font-mono uppercase tracking-widest">
        <div>v{format(new Date(), 'yy.M')}.BETA</div>
        <div>LAST SYNC: JUST NOW</div>
      </footer>
    </div>
  );
};
