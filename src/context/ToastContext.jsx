import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  // Trigger Toast Notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Banner Render */}
      {toast && (
        <div className={`toast-banner toast-${toast.type}`}>
          {toast.type === 'success' && <CheckCircle size={20} color="#2ecc71" />}
          {toast.type === 'error' && <AlertCircle size={20} color="#e74c3c" />}
          {toast.type === 'info' && <Info size={20} color="#3498db" />}
          <span>{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);