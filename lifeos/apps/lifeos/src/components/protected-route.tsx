import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/use-auth';

interface Props { children: React.ReactNode; }

export function ProtectedRoute({ children }: Props): React.JSX.Element {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
