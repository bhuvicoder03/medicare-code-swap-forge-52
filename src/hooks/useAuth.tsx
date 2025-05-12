
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
        const token = localStorage.getItem('token');
        
        if (token) {
          try {
            // Verify token validity by fetching user data
            const userData = await apiRequest('/users/me');
            
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
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            setAuthState({
              user: null,
              loading: false,
              initialized: true
            });
          }
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

      localStorage.setItem('token', data.token);
      
      try {
        // Fetch user data
        const userData = await apiRequest('/users/me');
        
        // Store user data
        const user = {
          id: userData._id,
          email: userData.email,
          role: userData.role as UserRole,
          firstName: userData.firstName,
          lastName: userData.lastName
        };
        
        localStorage.setItem('user', JSON.stringify(user));

        setAuthState({
          user,
          loading: false,
          initialized: true
        });

        return { data, error: null };
      } catch (error) {
        return { error, data: null };
      }
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
    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return { data: null, error: { message: "Password must be at least 6 characters long" } };
    }
    
    try {
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
      
      localStorage.setItem('token', data.token);
      
      // Fetch user details to get correct format
      const userData = await apiRequest('/users/me');
      
      const user = {
        id: userData._id,
        email: userData.email,
        role: userData.role as UserRole,
        firstName: userData.firstName,
        lastName: userData.lastName
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuthState({
        user,
        loading: false,
        initialized: true
      });
      
      toast({
        title: "Registration Successful",
        description: `Welcome, ${firstName}!`,
      });
      
      return { data: { user }, error: null };
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
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
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
      // Update profile on server
      const updatedUserData = await apiRequest('/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email
        })
      });
      
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
