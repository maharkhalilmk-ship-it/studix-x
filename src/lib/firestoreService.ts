import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Client, Transaction, FirestoreErrorInfo, UserSettings } from '../types';
import { MOCK_CLIENTS, MOCK_TRANSACTIONS, DEFAULT_SETTINGS } from './mockData';

const USE_MOCK = true; // Easily toggle back to real Firebase

const handleFirestoreError = (error: unknown, operationType: FirestoreErrorInfo['operationType'], path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    }
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

// In-memory store for mocks
let mockedClients = [...MOCK_CLIENTS];
let mockedTransactions = [...MOCK_TRANSACTIONS];
let mockedSettings = { ...DEFAULT_SETTINGS };

export const firestoreService = {
  // Clients
  async getClients(): Promise<Client[]> {
    if (USE_MOCK) return mockedClients;
    
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    const path = 'clients';
    try {
      const q = query(
        collection(db, path), 
        where('ownerId', '==', userId),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
    } catch (error) {
      handleFirestoreError(error, 'list', path);
      return [];
    }
  },

  async addClient(clientData: Partial<Client>): Promise<string> {
    if (USE_MOCK) {
      const newClient: Client = {
        id: Math.random().toString(36).substr(2, 9),
        name: clientData.name || 'New Client',
        phone: clientData.phone || '',
        ownerId: 'demo-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...clientData
      };
      mockedClients = [newClient, ...mockedClients];
      return newClient.id;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = 'clients';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...clientData,
        ownerId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'create', path);
      return '';
    }
  },

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    if (USE_MOCK) return mockedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    const path = 'transactions';
    try {
      const q = query(
        collection(db, path), 
        where('ownerId', '==', userId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    } catch (error) {
      handleFirestoreError(error, 'list', path);
      return [];
    }
  },

  async addTransaction(transactionData: Partial<Transaction>): Promise<string> {
    if (USE_MOCK) {
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        clientId: transactionData.clientId || '',
        amount: transactionData.amount || 0,
        totalAmount: transactionData.totalAmount || 0,
        paidAmount: transactionData.paidAmount || 0,
        type: transactionData.type || 'credit',
        paymentMethod: transactionData.paymentMethod || 'cash',
        description: transactionData.description || '',
        pictureCount: transactionData.pictureCount || 0,
        date: transactionData.date || new Date().toISOString(),
        ownerId: 'demo-user',
        createdAt: new Date().toISOString(),
        ...transactionData
      } as Transaction;
      mockedTransactions = [newTx, ...mockedTransactions];
      return newTx.id;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    const path = 'transactions';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...transactionData,
        ownerId: userId,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'create', path);
      return '';
    }
  },

  async deleteTransaction(id: string): Promise<void> {
    if (USE_MOCK) {
      mockedTransactions = mockedTransactions.filter(tx => tx.id !== id);
      return;
    }

    const path = `transactions/${id}`;
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      handleFirestoreError(error, 'delete', path);
    }
  },

  async updateTransaction(id: string, transactionData: Partial<Transaction>): Promise<void> {
    if (USE_MOCK) {
      mockedTransactions = mockedTransactions.map(tx => 
        tx.id === id ? { ...tx, ...transactionData } : tx
      );
      return;
    }

    const path = `transactions/${id}`;
    try {
      await updateDoc(doc(db, 'transactions', id), {
        ...transactionData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, 'update', path);
    }
  },

  // Settings
  async getSettings(): Promise<UserSettings> {
    if (USE_MOCK) return mockedSettings;

    const userId = auth.currentUser?.uid;
    if (!userId) return DEFAULT_SETTINGS;
    const path = `settings/${userId}`;
    try {
      const q = query(collection(db, 'settings'), where('ownerId', '==', userId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return DEFAULT_SETTINGS;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as UserSettings;
    } catch (error) {
      return DEFAULT_SETTINGS;
    }
  },

  async updateSettings(settingsData: Partial<UserSettings>): Promise<void> {
    if (USE_MOCK) {
      mockedSettings = { ...mockedSettings, ...settingsData, updatedAt: new Date().toISOString() };
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      // For simplicity in this demo, we use a single settings doc per user
      const q = query(collection(db, 'settings'), where('ownerId', '==', userId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        await addDoc(collection(db, 'settings'), {
          ...DEFAULT_SETTINGS,
          ...settingsData,
          ownerId: userId,
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(doc(db, 'settings', snapshot.docs[0].id), {
          ...settingsData,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error updating settings", error);
    }
  }
};
