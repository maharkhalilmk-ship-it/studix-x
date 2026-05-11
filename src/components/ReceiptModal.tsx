import React, { useEffect, useState } from 'react';
import { Transaction, Client, UserSettings } from '../types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Printer, Download, Share2, Wallet, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { firestoreService } from '../lib/firestoreService';
import { DEFAULT_SETTINGS } from '../lib/mockData';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  client: Client | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, transaction, client }) => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (isOpen) {
      firestoreService.getSettings().then(setSettings);
    }
  }, [isOpen]);

  if (!transaction || !client) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="ios-card sm:max-w-[400px] p-0 bg-white text-slate-900 overflow-hidden">
        <div id="receipt-content" className="p-8 space-y-8 bg-white print:p-10">
          {/* Studio Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg mb-2">
              <Camera className="text-white w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tighter uppercase">{settings.businessName}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Official Business Receipt</p>
            <div className="text-[9px] text-slate-400 flex flex-col items-center mt-1">
              <span>{settings.businessAddress}</span>
              <span>{settings.businessPhone}</span>
            </div>
          </div>

          <div className="border-y border-dashed border-slate-200 py-6 space-y-4">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase">Receipt ID</span>
              <span className="font-mono font-bold">#TX-{transaction.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase">Date</span>
              <span className="font-bold">{format(new Date(transaction.date), 'PPPP')}</span>
            </div>
          </div>

          {/* Client Info */}
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Billed To</p>
            <p className="font-bold text-lg">{client.name}</p>
            <p className="text-sm text-slate-500">{client.phone}</p>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Service Details</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="font-bold">{transaction.description || 'Studio Session'}</p>
                <p className="text-xs text-slate-500">{transaction.pictureCount} Pictures Delivered</p>
              </div>
              <p className="font-bold">₦{transaction.amount.toLocaleString()}</p>
            </div>
          </div>

          {/* Total */}
          <div className="bg-slate-50 rounded-2xl p-6 space-y-2">
            <div className="flex justify-between text-xs text-slate-500 font-bold uppercase">
              <span>Payment Type</span>
              <span>{transaction.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-sm font-bold">Total Paid</span>
              <span className="text-2xl font-black text-blue-600">₦{transaction.amount.toLocaleString()}</span>
            </div>
          </div>

          <div className="text-center pb-4">
            <p className="text-[10px] text-slate-400 font-medium italic">Thank you for choosing {settings.businessName} - {settings.userName}</p>
          </div>
        </div>

        <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
          <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={onClose}>
            Close
          </Button>
          <Button className="flex-1 rounded-xl h-12 bg-blue-600 hover:bg-blue-700" onClick={handlePrint}>
            <Printer size={18} className="mr-2" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
