import React, { useEffect, useState } from 'react';
import { firestoreService } from '../lib/firestoreService';
import { Transaction, Client, TransactionType, PaymentMethod } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from './ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Card, CardContent } from './ui/card';
import { Plus, Trash2, Search, Calendar as CalendarIcon, Camera, CreditCard, Banknote, FileText, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ReceiptModal } from './ReceiptModal';

export const TransactionsView = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  // Receipt State
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    clientId: '',
    type: 'credit' as TransactionType,
    amount: '',
    totalAmount: '',
    paidAmount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    pictureCount: '',
    paymentMethod: 'cash' as PaymentMethod
  });

  const fetchData = async () => {
    setLoading(true);
    const [txs, allClients] = await Promise.all([
      firestoreService.getTransactions(),
      firestoreService.getClients()
    ]);
    setTransactions(txs);
    setClients(allClients);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.amount) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        totalAmount: Number(formData.totalAmount || formData.amount),
        paidAmount: Number(formData.paidAmount || formData.amount),
        pictureCount: Number(formData.pictureCount || 0)
      };

      if (editingId) {
        await firestoreService.updateTransaction(editingId, payload as any);
        toast.success('Transaction updated');
      } else {
        await firestoreService.addTransaction(payload as any);
        toast.success('Transaction recorded');
      }
      
      setIsAddOpen(false);
      setEditingId(null);
      fetchData();
      resetForm();
    } catch (error) {
      toast.error(editingId ? 'Failed to update' : 'Failed to save');
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      type: 'credit',
      amount: '',
      totalAmount: '',
      paidAmount: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      pictureCount: '',
      paymentMethod: 'cash'
    });
  };

  const handleEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setFormData({
      clientId: tx.clientId,
      type: tx.type,
      amount: tx.amount.toString(),
      totalAmount: (tx.totalAmount || tx.amount).toString(),
      paidAmount: (tx.paidAmount || tx.amount).toString(),
      description: tx.description || '',
      date: tx.date,
      pictureCount: tx.pictureCount?.toString() || '',
      paymentMethod: tx.paymentMethod
    });
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(id);
      await firestoreService.deleteTransaction(id);
      toast.success('Transaction deleted');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete. Check permissions.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleShowReceipt = (tx: Transaction) => {
    setSelectedTxForReceipt(tx);
    setIsReceiptOpen(true);
  };

  const clientMap = clients.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {} as any);
  
  const filteredTxs = transactions.filter(tx => {
    const matchesSearch = (clientMap[tx.clientId]?.toLowerCase().includes(search.toLowerCase()) ||
      tx.description?.toLowerCase().includes(search.toLowerCase()));
    const matchesMonth = tx.date.startsWith(selectedMonth);
    return matchesSearch && matchesMonth;
  });

  const monthOptions = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      value: format(d, 'yyyy-MM'),
      label: format(d, 'MMMM yyyy')
    };
  });

  return (
    <div className="space-y-6">
      <header className="ios-header flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-1">Records</h1>
          <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-widest leading-none">STUDIO X FINANCIAL LEDGER</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            setEditingId(null);
            resetForm();
          }
        }}>
          <DialogTrigger 
            render={
              <Button className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all active:scale-90">
                <Plus className="w-6 h-6" />
              </Button>
            }
          />
          <DialogContent className="ios-card sm:max-w-md p-6 bg-neutral-900 border-neutral-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{editingId ? 'Edit Entry' : 'New Entry'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black text-neutral-500 tracking-wider">Client</Label>
                <Select 
                  value={formData.clientId} 
                  onValueChange={(val) => setFormData({...formData, clientId: val})}
                >
                  <SelectTrigger className="ios-card bg-neutral-950 border-neutral-800 h-14 text-white">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id} className="focus:bg-neutral-800">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-neutral-500 tracking-wider">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(val: any) => setFormData({...formData, type: val})}
                  >
                    <SelectTrigger className="ios-card bg-neutral-950 border-neutral-800 h-14 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                      <SelectItem value="credit" className="focus:bg-neutral-800">Income</SelectItem>
                      <SelectItem value="debit" className="focus:bg-neutral-800">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-neutral-500 tracking-wider">Amount (₦)</Label>
                  <Input 
                    type="number"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                    className="ios-card bg-neutral-950 border-neutral-800 h-14 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-neutral-500 tracking-wider">Pictures</Label>
                  <div className="relative">
                    <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                    <Input 
                      type="number"
                      value={formData.pictureCount}
                      onChange={e => setFormData({...formData, pictureCount: e.target.value})}
                      placeholder="0"
                      className="ios-card bg-neutral-950 border-neutral-800 h-14 pl-10 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-neutral-500 tracking-wider">Payment</Label>
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={(val: any) => setFormData({...formData, paymentMethod: val})}
                  >
                    <SelectTrigger className="ios-card bg-neutral-950 border-neutral-800 h-14 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                      <SelectItem value="cash" className="focus:bg-neutral-800">Cash</SelectItem>
                      <SelectItem value="transfer" className="focus:bg-neutral-800">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black text-neutral-500 tracking-wider">Description</Label>
                <Input 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Service details..."
                  className="ios-card bg-neutral-950 border-neutral-800 h-14 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black text-neutral-500 tracking-wider">Transaction Date</Label>
                <Input 
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="ios-card bg-neutral-950 border-neutral-800 h-14 text-white"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full ios-button-primary h-14 font-bold uppercase tracking-widest text-xs">
                  {editingId ? 'Update Record' : 'Authorize & Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Filters Section */}
      <div className="px-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
            <Input 
              placeholder="Search Ledger..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ios-card bg-neutral-900 border-neutral-800 h-12 pl-10 text-xs text-white placeholder:text-neutral-700"
            />
          </div>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 z-10" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="ios-card bg-neutral-900 border-neutral-800 h-12 pl-10 text-white text-xs font-bold uppercase tracking-wider">
                <SelectValue placeholder="Period Select" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                {monthOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="focus:bg-neutral-800 text-xs">{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="px-6 flex flex-col gap-3 pb-24">
        {loading ? (
          <div className="py-20 text-center text-neutral-700 font-black uppercase tracking-[0.3em] text-[8px] animate-pulse">Requesting Data...</div>
        ) : filteredTxs.length > 0 ? (
          filteredTxs.map(tx => (
            <Card key={tx.id} className="ios-card group border-neutral-800 hover:border-neutral-700 transition-all bg-neutral-900">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {tx.paymentMethod === 'cash' ? <Banknote size={24} /> : <CreditCard size={24} />}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{clientMap[tx.clientId]}</p>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight truncate max-w-[150px]">{tx.description || tx.type}</p>
                    <p className="text-[9px] font-black text-neutral-700 uppercase mt-1 tracking-widest">{format(new Date(tx.date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <p className={`font-black text-xl tracking-tighter ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-[8px] text-neutral-700 uppercase font-black tracking-widest text-right">
                      {tx.pictureCount} PICS • {tx.paymentMethod}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 translate-x-2 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100 transition-all duration-300">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowReceipt(tx);
                      }}
                      className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                    >
                      <FileText size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(tx);
                      }}
                      className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      disabled={deleteLoading === tx.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(tx.id);
                      }}
                      className="h-8 w-8 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {deleteLoading === tx.id ? (
                        <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center text-neutral-800 bg-neutral-900 border border-neutral-800 border-dashed rounded-3xl m-2">
            <p className="uppercase font-black tracking-[0.25em] text-[8px]">Index Empty for {format(new Date(selectedMonth), 'MMMM yyyy')}</p>
          </div>
        )}
      </div>

      <ReceiptModal 
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={selectedTxForReceipt}
        client={selectedTxForReceipt ? clients.find(c => c.id === selectedTxForReceipt.clientId) || null : null}
      />
    </div>
  );
};
