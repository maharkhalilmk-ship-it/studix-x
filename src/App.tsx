import React, { useState, useEffect } from 'react';
import { useAuth } from './lib/AuthContext';
import { signInWithGoogle, logout } from './lib/firebase';
import { Dashboard } from './components/Dashboard';
import { TransactionsView } from './components/TransactionsView';
import { ClientsView } from './components/ClientsView';
import { SettingsView } from './components/SettingsView';
import { HistoryView } from './components/HistoryView';
import { BottomNav } from './components/BottomNav';
import { Button } from './components/ui/button';
import { LogIn, LogOut, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from './components/ui/sonner';
import { firestoreService } from './lib/firestoreService';
import { cn } from './lib/utils';

type View = 'dashboard' | 'transactions' | 'clients' | 'settings' | 'history';

const LoginView = () => {
  const { loginAsGuest } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-950">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8 text-center"
      >
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <Wallet className="text-white w-10 h-10" />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-white">Studio <span className="text-blue-500">X</span></h1>
            <p className="text-neutral-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Accounting Intelligence</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={signInWithGoogle}
            className="w-full h-16 ios-button-primary text-lg font-bold shadow-xl shadow-blue-600/20"
          >
            <LogIn className="mr-3 h-5 w-5" />
            Secure Sign In
          </Button>

          <Button 
            onClick={loginAsGuest}
            variant="outline"
            className="w-full h-16 border-2 border-neutral-800 bg-transparent text-neutral-400 font-bold hover:bg-neutral-900 rounded-3xl transition-all duration-300 hover:border-blue-500/50"
          >
            Explore as Guest
          </Button>
        </div>
        
        <p className="text-[10px] text-neutral-600 uppercase font-black tracking-widest leading-loose">
          Protected by enterprise-grade encryption.<br/>October 2023 System Build.
        </p>
      </motion.div>
    </div>
  );
};

export default function App() {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [mood, setMood] = useState<'day' | 'night'>('night');

  useEffect(() => {
    if (user) {
      firestoreService.getSettings().then(s => setMood(s.mood));
    }
  }, [user, currentView]); // Refresh when view changes as a simple way to sync settings

  useEffect(() => {
    if (mood === 'night') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mood]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <TransactionsView />;
      case 'clients': return <ClientsView />;
      case 'settings': return <SettingsView />;
      case 'history': return <HistoryView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={cn(
      "min-h-screen pb-24 selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-500",
      mood === 'night' ? "bg-neutral-950 text-neutral-100" : "bg-slate-50 text-slate-900"
    )}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="max-w-2xl mx-auto"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>

      <div className="fixed top-6 right-6 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={logout}
          className="rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <BottomNav active={currentView} onSelect={setCurrentView} />
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}
