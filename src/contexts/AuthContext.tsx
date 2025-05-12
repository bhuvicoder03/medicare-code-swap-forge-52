
import { createContext } from 'react';
import { AuthState, AuthUser, UserRole } from '@/types/app.types';

// Initial auth state
export const initialAuthState: AuthState = {
  user: null,
  loading: true,
  initialized: false
};

// Context interface definition
export interface AuthContextType {
  authState: AuthState;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signUp: (email: string, password: string, firstName: string, lastName: string, role?: UserRole) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signOut: () => void;
  updateProfile: (userData: Partial<AuthUser>) => Promise<void>;
}

// Default context values
const defaultContextValues: AuthContextType = {
  authState: initialAuthState,
  signIn: async () => ({ error: null, data: null }),
  signUp: async () => ({ error: null, data: null }),
  signOut: () => {},
  updateProfile: async () => {}
};

// Create the context
export const AuthContext = createContext<AuthContextType>(defaultContextValues);
