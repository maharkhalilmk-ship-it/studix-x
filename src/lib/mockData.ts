import { Client, Transaction, UserSettings } from '../types';

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    ownerId: 'demo-user',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+234 801 234 5678',
    address: 'Lagos, Nigeria',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c2',
    ownerId: 'demo-user',
    name: 'Michael Chen',
    email: 'michael@example.com',
    phone: '+234 802 345 6789',
    address: 'Abuja, Nigeria',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c3',
    ownerId: 'demo-user',
    name: 'Amina Bello',
    email: 'amina@example.com',
    phone: '+234 803 456 7890',
    address: 'Kano, Nigeria',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    ownerId: 'demo-user',
    clientId: 'c1',
    amount: 25000,
    totalAmount: 30000,
    paidAmount: 25000,
    type: 'credit',
    paymentMethod: 'transfer',
    description: 'Portrait Session - Outdoor',
    pictureCount: 15,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2',
    ownerId: 'demo-user',
    clientId: 'c2',
    amount: 15000,
    totalAmount: 15000,
    paidAmount: 15000,
    type: 'credit',
    paymentMethod: 'cash',
    description: 'Product Shoot - 5 Items',
    pictureCount: 5,
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 't3',
    ownerId: 'demo-user',
    clientId: 'c3',
    amount: 50000,
    totalAmount: 75000,
    paidAmount: 50000,
    type: 'credit',
    paymentMethod: 'transfer',
    description: 'Event Coverage - Birthday',
    pictureCount: 100,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 't4',
    ownerId: 'demo-user',
    clientId: '',
    amount: 8000,
    totalAmount: 8000,
    paidAmount: 8000,
    type: 'debit',
    paymentMethod: 'cash',
    description: 'Studio Equipment Maintenance',
    date: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    createdAt: new Date().toISOString(),
  }
];

export const DEFAULT_SETTINGS: UserSettings = {
  id: 's1',
  ownerId: 'demo-user',
  userName: 'Studio Admin',
  businessName: 'Studio X Photography',
  businessAddress: '123 Creative Lane, Lagos',
  businessPhone: '+234 800 STUDIO X',
  mood: 'night',
  updatedAt: new Date().toISOString()
};
