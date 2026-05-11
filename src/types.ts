export type PaymentMethod = 'cash' | 'transfer';
export type TransactionType = 'credit' | 'debit';

export interface Client {
  id: string;
  name: string;
  phone: string;
  createdAt: any;
  updatedAt: any;
  ownerId: string;
}

export interface Transaction {
  id: string;
  clientId: string;
  type: TransactionType;
  amount: number;
  totalAmount: number;
  paidAmount: number;
  description: string;
  date: string; // ISO date string
  pictureCount: number;
  paymentMethod: PaymentMethod;
  ownerId: string;
  createdAt: any;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export type ThemeMood = 'day' | 'night';

export interface UserSettings {
  id: string;
  ownerId: string;
  userName: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  mood: ThemeMood;
  updatedAt: string;
}
