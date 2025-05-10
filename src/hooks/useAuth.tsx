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
              role: user.role as UserRole, // Type assertion to ensure role is UserRole
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
      const data = await apiRequest('/auth', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      const userData = await apiRequest('/users/me', {
        headers: {
          'x-auth-token': data.token
        }
      });

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: userData._id,
        email: userData.email,
        role: userData.role,
        firstName: userData.first_name,
        lastName: userData.last_name
      }));

      setAuthState({
        user: {
          id: userData._id,
          email: userData.email,
          role: userData.role,
          firstName: userData.first_name,
          lastName: userData.last_name
        },
        loading: false,
        initialized: true
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
      return { error, data: null };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, role: UserRole = 'patient') => {
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

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      loading: false,
      initialized: true
    });
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
