
import { useState, useEffect, useContext, ReactNode } from 'react';
import { AuthState, AuthUser, UserRole } from '@/types/app.types';
import { toast } from "@/components/ui/use-toast";
import { AuthContext, initialAuthState } from '@/contexts/AuthContext';
import { 
  signInService, 
  signUpService, 
  updateProfileService,
  initializeAuthService
} from '@/services/authService';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  useEffect(() => {
    console.log('Initializing auth');
    
    const initializeAuth = async () => {
      try {
        const { user, error } = await initializeAuthService();
        
        setAuthState({
          user,
          loading: false,
          initialized: true
        });
        
        if (error) {
          console.error('Auth initialization error:', error);
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
        setAuthState({
          user: null,
          loading: false,
          initialized: true
        });
      }
    };
    
    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await signInService(email, password);
      
      if (error) {
        return { error, data: null };
      }
      
      console.log('Setting auth state with user:', data.user);
      setAuthState({
        user: data.user,
        loading: false,
        initialized: true
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Login error in hook:', error);
      return { error, data: null };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, role: UserRole = 'patient') => {
    try {
      const { data, error } = await signUpService(email, password, firstName, lastName, role);
      
      if (error) {
        return { data: null, error };
      }
      
      console.log('Setting auth state with user:', data.user);
      setAuthState({
        user: data.user,
        loading: false,
        initialized: true
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Registration error in hook:', error);
      return { data: null, error };
    }
  };

  const signOut = () => {
    console.log('Signing out');
    localStorage.removeItem('token');
    
    setAuthState({
      user: null,
      loading: false,
      initialized: true
    });
  };

  const updateProfile = async (userData: Partial<AuthUser>) => {
    if (!authState.user) {
      console.error('Cannot update profile: user not authenticated');
      return;
    }

    try {
      await updateProfileService(authState.user, userData);
      
      // Update state
      const updatedUser = {
        ...authState.user,
        ...userData
      };
      
      console.log('Setting auth state with updated user:', updatedUser);
      setAuthState({
        ...authState,
        user: updatedUser
      });
    } catch (error: any) {
      console.error('Error updating profile in hook:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      authState, 
      signIn, 
      signUp, 
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
