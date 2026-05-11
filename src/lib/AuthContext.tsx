import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | Partial<User> | null;
  loading: boolean;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  loginAsGuest: () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | Partial<User> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if guest mode was active
    const isGuest = localStorage.getItem('studio_x_guest') === 'true';
    if (isGuest) {
      setUser({ uid: 'demo-user', displayName: 'Studio Guest', email: 'guest@studiox.com' });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginAsGuest = () => {
    localStorage.setItem('studio_x_guest', 'true');
    setUser({ uid: 'demo-user', displayName: 'Studio Guest', email: 'guest@studiox.com' });
  };

  const handleLogout = async () => {
    localStorage.removeItem('studio_x_guest');
    await auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAsGuest, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
