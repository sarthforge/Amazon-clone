import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { showToast } = useToast();
  
  // Current active user
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('amazon_react_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Saved accounts database
  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('amazon_react_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  // Saved addresses for current user
  const [savedAddresses, setSavedAddresses] = useState([]);

  // Load addresses whenever user changes
  useEffect(() => {
    if (user && user.email) {
      const stored = localStorage.getItem(`amazon_react_addresses_${user.email}`);
      if (stored) {
        setSavedAddresses(JSON.parse(stored));
      } else {
        // Default demo address if none exists
        const demoAddress = [{
          id: 'addr-default-1',
          fullName: user.name,
          mobile: '9876543210',
          street: '123 MG Road, Sector 4',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
          label: 'Home'
        }];
        setSavedAddresses(demoAddress);
        localStorage.setItem(`amazon_react_addresses_${user.email}`, JSON.stringify(demoAddress));
      }
    } else {
      setSavedAddresses([]);
    }
  }, [user]);

  // Login action
  const login = (email, password) => {
    const found = accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
    if (found) {
      const userData = { name: found.name, email: found.email };
      setUser(userData);
      localStorage.setItem('amazon_react_user', JSON.stringify(userData));
      showToast(`Welcome back, ${found.name}!`, 'success');
      return { success: true };
    } else {
      showToast('Invalid email or password.', 'error');
      return { success: false, error: 'Invalid email or password.' };
    }
  };

  // Register action
  const register = (name, email, password) => {
    const exists = accounts.some(a => a.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      showToast('Account with this email already exists.', 'error');
      return { success: false, error: 'Account already exists.' };
    }
    const newAcc = { name, email, password };
    const updated = [...accounts, newAcc];
    setAccounts(updated);
    localStorage.setItem('amazon_react_accounts', JSON.stringify(updated));

    const userData = { name, email };
    setUser(userData);
    localStorage.setItem('amazon_react_user', JSON.stringify(userData));
    showToast('Account created successfully!', 'success');
    return { success: true };
  };

  // Logout action
  const logout = () => {
    setUser(null);
    localStorage.removeItem('amazon_react_user');
    showToast('Signed out successfully.', 'info');
  };

  // Address Book Management
  const addAddress = (newAddr) => {
    if (!user) return;
    const addressWithId = { ...newAddr, id: `addr-${Date.now()}` };
    const updated = [addressWithId, ...savedAddresses];
    setSavedAddresses(updated);
    localStorage.setItem(`amazon_react_addresses_${user.email}`, JSON.stringify(updated));
    showToast('Address saved to your address book!', 'success');
  };

  const removeAddress = (addressId) => {
    if (!user) return;
    const updated = savedAddresses.filter(a => a.id !== addressId);
    setSavedAddresses(updated);
    localStorage.setItem(`amazon_react_addresses_${user.email}`, JSON.stringify(updated));
    showToast('Address removed.', 'info');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      savedAddresses,
      addAddress,
      removeAddress
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}