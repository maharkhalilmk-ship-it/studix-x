import React, { useEffect, useState } from 'react';
import { firestoreService } from '../lib/firestoreService';
import { Client } from '../types';
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
import { Card, CardContent } from './ui/card';
import { UserPlus, Search, Phone, User, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export const ClientsView = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const data = await firestoreService.getClients();
    setClients(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Name and Phone are required');
      return;
    }

    try {
      await firestoreService.addClient(formData);
      toast.success('Client added');
      setIsAddOpen(false);
      fetchData();
      setFormData({ name: '', phone: '' });
    } catch (error) {
      toast.error('Failed to add client');
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <header className="ios-header flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Contacts</h1>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger 
            render={
              <Button className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                <UserPlus className="w-6 h-6" />
              </Button>
            }
          />
          <DialogContent className="ios-card sm:max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">New Client</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-slate-500">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    className="ios-card bg-slate-50 border-slate-100 h-12 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-slate-500">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1 234 567 890"
                    className="ios-card bg-slate-50 border-slate-100 h-12 pl-10"
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full ios-button-primary h-12">
                  Add Contact
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="px-6 relative">
        <Search className="absolute left-9 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Find a client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ios-card bg-slate-100 border-none h-12 pl-10 text-sm"
        />
      </div>

      <div className="px-6 space-y-3 pb-24">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading...</div>
        ) : filteredClients.length > 0 ? (
          filteredClients.map((client, i) => (
            <Card key={client.id} className="ios-card border-slate-100">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xl">
                    {client.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{client.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone size={12} /> {client.phone}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-300">
                  <ExternalLink size={20} />
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200 m-6">
            <p className="text-slate-400">No clients yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
