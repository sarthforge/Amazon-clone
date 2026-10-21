import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();

  // Show a warning toast only when access is actually denied
  useEffect(() => {
    if (!user) {
      showToast('Please sign in to continue.', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    // Redirect to /login, remembering where the user was trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}