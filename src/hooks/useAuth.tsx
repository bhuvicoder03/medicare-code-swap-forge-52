
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { AuthState, AuthUser } from '@/types/app.types';
import { useToast } from '@/hooks/use-toast';

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
  signUp: (email: string, password: string, firstName: string, lastName: string, role?: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<AuthUser>) => Promise<void>;
}>({
  authState: initialState,
  signIn: async () => ({ error: null, data: null }),
  signUp: async () => ({ error: null, data: null }),
  signOut: async () => {},
  updateProfile: async () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const { toast } = useToast();

  useEffect(() => {
    // Check localStorage for user data
    const initializeAuth = async () => {
      try {
        const savedUserData = localStorage.getItem('user');
        
        if (savedUserData) {
          const user = JSON.parse(savedUserData);
          setAuthState({
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              firstName: user.firstName,
              lastName: user.lastName
            },
            loading: false,
            initialized: true
          });
        } else {
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
      // This is a mock implementation
      // In a real app, you would validate against a server
      
      // Mock user data for demonstration
      const mockUsers = [
        {
          id: 'user-1',
          email: 'patient@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          role: 'patient'
        },
        {
          id: 'user-2',
          email: 'admin@example.com',
          password: 'password123',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        },
        {
          id: 'user-3',
          email: 'hospital@example.com',
          password: 'password123',
          firstName: 'Hospital',
          lastName: 'Manager',
          role: 'hospital'
        }
      ];
      
      // Find matching user
      const user = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive"
        });
        return { error: { message: "Invalid email or password" }, data: null };
      }
      
      // Save user to localStorage
      const userData = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update auth state
      setAuthState({
        user: userData,
        loading: false,
        initialized: true
      });
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.firstName}!`,
      });
      
      return { error: null, data: { user: userData } };
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, role = 'patient') => {
    if (password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return { data: null, error: { message: "Password must be at least 8 characters long" } };
    }
    
    try {
      // In a real app, you would send this data to a server
      // For demo purposes, we'll just simulate a successful registration
      
      // Generate a mock user ID
      const userId = `user-${Date.now()}`;
      
      const userData = {
        id: userId,
        email,
        role,
        firstName,
        lastName
      };
      
      // In a real app, we would store this on the server
      // For demo, let's just save to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update auth state
      setAuthState({
        user: userData,
        loading: false,
        initialized: true
      });
      
      toast({
        title: "Registration Successful",
        description: `Welcome, ${firstName}!`,
      });
      
      return { data: { user: userData }, error: null };
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      // Remove user data from localStorage
      localStorage.removeItem('user');
      
      // Reset auth state
      setAuthState({
        user: null,
        loading: false,
        initialized: true
      });
      
      toast({
        title: "Signed Out",
        description: "You have successfully signed out",
      });
      
      // Force page reload for a clean state
      window.location.href = '/';
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Error Signing Out",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      
      // Even if there's an error, clean up the local state
      setAuthState({
        user: null,
        loading: false,
        initialized: true
      });
      
      // Force reload anyway
      window.location.href = '/';
    }
  };

  const updateProfile = async (userData: Partial<AuthUser>) => {
    if (!authState.user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update local storage with new profile data
      const updatedUser = {
        ...authState.user,
        ...userData
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update state
      setAuthState({
        ...authState,
        user: updatedUser
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
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
