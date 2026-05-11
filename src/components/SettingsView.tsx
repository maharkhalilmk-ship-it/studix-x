import React, { useEffect, useState } from 'react';
import { firestoreService } from '../lib/firestoreService';
import { UserSettings } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { 
  User, 
  Building2, 
  MapPin, 
  Phone, 
  Moon, 
  Sun, 
  Download, 
  Save,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export const SettingsView = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await firestoreService.getSettings();
      setSettings(data);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await firestoreService.updateSettings(settings);
      toast.success('Settings updated successfully');
      // Trigger a reload or update theme if necessary
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const exportHistory = async () => {
    try {
      const transactions = await firestoreService.getTransactions();
      const clients = await firestoreService.getClients();
      
      // Filter for current month or just all? User said "monthly history file"
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      
      const monthlyTxs = transactions.filter(tx => {
        const d = new Date(tx.date);
        return d >= monthStart && d <= monthEnd;
      });

      if (monthlyTxs.length === 0) {
        toast.info("No transactions found for this month");
        return;
      }

      // Create CSV content
      const headers = ['Date', 'Client', 'Description', 'Type', 'Method', 'Amount', 'Total', 'Paid'];
      const csvRows = [
        headers.join(','),
        ...monthlyTxs.map(tx => {
          const clientName = clients.find(c => c.id === tx.clientId)?.name || 'Guest';
          return [
            format(new Date(tx.date), 'yyyy-MM-dd'),
            `"${clientName}"`,
            `"${tx.description}"`,
            tx.type,
            tx.paymentMethod,
            tx.amount,
            tx.totalAmount,
            tx.paidAmount
          ].join(',');
        })
      ];

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `studio-x-history-${format(now, 'yyyy-MM')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('History exported successfully');
    } catch (error) {
      toast.error('Failed to export history');
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-neutral-800 rounded-full"></div>
          <div className="h-4 w-32 bg-neutral-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32 pt-8">
      <motion.header 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="ios-header"
      >
        <h1 className="text-4xl font-black text-white tracking-tighter">Settings</h1>
        <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-[0.2em]">Profile & Customization</p>
      </motion.header>

      <div className="px-6 space-y-8">
        {/* Profile Details */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User size={14} className="text-blue-500" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Identity & Personalization</h2>
          </div>
          
          <Card className="ios-card bg-neutral-900/50 border-neutral-800">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-neutral-400 text-xs font-bold uppercase tracking-wider">Your Name (For Receipts)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 h-4 w-4" />
                  <Input 
                    value={settings.userName}
                    onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
                    className="pl-10 h-14 bg-neutral-950 border-neutral-800 rounded-2xl focus:border-blue-500 transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-neutral-400 text-xs font-bold uppercase tracking-wider">Business Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 h-4 w-4" />
                  <Input 
                    value={settings.businessName}
                    onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                    className="pl-10 h-14 bg-neutral-950 border-neutral-800 rounded-2xl focus:border-blue-500 transition-colors"
                    placeholder="e.g. Studio X Photography"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-neutral-400 text-xs font-bold uppercase tracking-wider">Business Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 h-4 w-4" />
                    <Input 
                      value={settings.businessAddress}
                      onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
                      className="pl-10 h-14 bg-neutral-950 border-neutral-800 rounded-2xl focus:border-blue-500 transition-colors"
                      placeholder="Physical location"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-neutral-400 text-xs font-bold uppercase tracking-wider">Business Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 h-4 w-4" />
                    <Input 
                      value={settings.businessPhone}
                      onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
                      className="pl-10 h-14 bg-neutral-950 border-neutral-800 rounded-2xl focus:border-blue-500 transition-colors"
                      placeholder="Contact number"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Experience / Mood */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Moon size={14} className="text-purple-500" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Interface Experience</h2>
          </div>
          
          <Card className="ios-card bg-neutral-900/50 border-neutral-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-bold text-white">Interface Mood</p>
                  <p className="text-xs text-neutral-500">Switch between Day and Night environments</p>
                </div>
                <div className="flex items-center gap-3 bg-neutral-950 p-2 rounded-2xl border border-neutral-800">
                  <div className={`p-1.5 rounded-xl transition-colors ${settings.mood === 'day' ? 'bg-amber-500 text-white' : 'text-neutral-600'}`}>
                    <Sun size={16} />
                  </div>
                  <Switch 
                    checked={settings.mood === 'night'}
                    onCheckedChange={(checked) => setSettings({ ...settings, mood: checked ? 'night' : 'day' })}
                  />
                  <div className={`p-1.5 rounded-xl transition-colors ${settings.mood === 'night' ? 'bg-purple-600 text-white' : 'text-neutral-600'}`}>
                    <Moon size={16} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Exports */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Download size={14} className="text-emerald-500" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Data Management</h2>
          </div>
          
          <Card className="ios-card bg-neutral-900/50 border-neutral-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <p className="font-bold text-white">Monthly History Report</p>
                  <p className="text-xs text-neutral-500 flex items-center gap-1">
                    Generate a CSV file for {format(new Date(), 'MMMM yyyy')}
                  </p>
                </div>
                <Button 
                  onClick={exportHistory}
                  variant="outline"
                  className="rounded-2xl border-neutral-800 bg-neutral-950 text-emerald-500 hover:bg-neutral-900 hover:border-emerald-500/50"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Save Button */}
        <div className="fixed bottom-32 left-0 right-0 px-6 z-40 max-w-2xl mx-auto">
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="w-full h-16 ios-button-primary text-lg font-bold shadow-2xl shadow-blue-500/20 rounded-3xl"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Apply Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
