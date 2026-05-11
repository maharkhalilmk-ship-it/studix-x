import React from 'react';
import { Home, List, Users, Settings, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';

type View = 'dashboard' | 'transactions' | 'clients' | 'settings' | 'history';

interface BottomNavProps {
  active: View;
  onSelect: (view: View) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ active, onSelect }) => {
  const items = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'transactions', icon: List, label: 'Records' },
    { id: 'clients', icon: Users, label: 'Clients' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'history', icon: Wallet, label: 'History' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 ios-glass">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id as View)}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300",
                isActive ? "text-blue-500 scale-105" : "text-neutral-500"
              )}
            >
              <div className={cn(
                "p-2 rounded-2xl transition-all",
                isActive ? "bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]" : "bg-transparent"
              )}>
                <Icon className={cn("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.15em]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
