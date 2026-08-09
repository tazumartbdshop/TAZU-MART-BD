import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
  const { isAuthenticated, isInitializing, user } = useAuthStore();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-3 p-4">
        <Loader2 className="w-8 h-8 text-neutral-900 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Verifying session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/account" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== 'admin' && user?.role !== 'moderator') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
