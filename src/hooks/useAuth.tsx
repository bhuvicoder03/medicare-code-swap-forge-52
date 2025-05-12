
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { AuthState, AuthUser, UserRole } from '@/types/app.types';
import { toast } from "@/components/ui/use-toast";
import { apiRequest } from "@/services/api";

const initialState: AuthState = {
  user: null,
  loading: true,
  initialized: false
};

const AuthContext = createContext<{
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
}>({
  authState: initialState,
  signIn: async () => ({ error: null, data: null }),
  signUp: async () => ({ error: null, data: null }),
  signOut: () => {},
  updateProfile: async () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  useEffect(() => {
    console.log('Initializing auth');
    // Check localStorage for user data
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Checking token:', token ? 'Token exists' : 'No token');
        
        if (token) {
          try {
            // Verify token validity by fetching user data
            console.log('Fetching user data with token');
            const userData = await apiRequest('/auth');
            console.log('User data received:', userData);
            
            setAuthState({
              user: {
                id: userData._id,
                email: userData.email,
                role: userData.role as UserRole,
                firstName: userData.firstName,
                lastName: userData.lastName
              },
              loading: false,
              initialized: true
            });
          } catch (error) {
            console.error('Error validating token:', error);
            // Token invalid, clear storage
            localStorage.removeItem('token');
            
            setAuthState({
              user: null,
              loading: false,
              initialized: true
            });
          }
        } else {
          console.log('No token found, setting unauthenticated state');
          setAuthState({
            user: null,
            loading: false,
            initialized: true
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
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
      console.log('Signing in with:', email);
      const data = await apiRequest('/auth', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      console.log('Sign in successful, received token:', data.token ? 'Token received' : 'No token');
      localStorage.setItem('token', data.token);
      
      try {
        // Fetch user data
        console.log('Fetching user data after login');
        const userData = await apiRequest('/auth');
        console.log('User data after login:', userData);
        
        // Store user data in state
        const user = {
          id: userData._id,
          email: userData.email,
          role: userData.role as UserRole,
          firstName: userData.firstName,
          lastName: userData.lastName
        };
        
        console.log('Setting auth state with user:', user);
        setAuthState({
          user,
          loading: false,
          initialized: true
        });

        return { data, error: null };
      } catch (error: any) {
        console.error('Error fetching user data after login:', error);
        return { error, data: null };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { error, data: null };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, role: UserRole = 'patient') => {
    if (password.length < 6) {
      return { data: null, error: { message: "Password must be at least 6 characters long" } };
    }
    
    try {
      console.log('Registering new user:', { email, firstName, lastName, role });
      // Register new user
      const data = await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify({ 
          email, 
          password, 
          firstName, 
          lastName, 
          role 
        })
      });
      
      console.log('Registration successful, received token:', data.token ? 'Token received' : 'No token');
      localStorage.setItem('token', data.token);
      
      // Fetch user details to get correct format
      console.log('Fetching user data after registration');
      const userData = await apiRequest('/auth');
      console.log('User data after registration:', userData);
      
      const user = {
        id: userData._id,
        email: userData.email,
        role: userData.role as UserRole,
        firstName: userData.firstName,
        lastName: userData.lastName
      };
      
      console.log('Setting auth state with user:', user);
      setAuthState({
        user,
        loading: false,
        initialized: true
      });
      
      return { data: { user }, error: null };
    } catch (error: any) {
      console.error('Registration error:', error);
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
      console.log('Updating profile:', userData);
      // Update profile on server
      const updatedUserData = await apiRequest('/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email
        })
      });
      console.log('Profile update successful:', updatedUserData);
      
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
      console.error('Error updating profile:', error);
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
