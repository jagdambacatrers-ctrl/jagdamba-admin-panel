import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentAdmin, signOutAdmin } from '@/lib/supabase';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  profile_picture?: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  logout: () => void;
  setAdmin: (admin: AdminUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in on mount
    const currentAdmin = getCurrentAdmin();
    setAdmin(currentAdmin);
    setLoading(false);
  }, []);

  const logout = () => {
    signOutAdmin();
    setAdmin(null);
  };

  const value = {
    admin,
    loading,
    logout,
    setAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};