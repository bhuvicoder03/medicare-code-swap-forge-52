
import { AuthUser, UserRole } from '@/types/app.types';
import { apiRequest } from './api';

// Sign in service function
export const signInService = async (email: string, password: string) => {
  try {
    console.log('Signing in with:', email);
    const data = await apiRequest('/auth', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    console.log('Sign in successful, received token:', data.token ? 'Token received' : 'No token');
    localStorage.setItem('token', data.token);
    
    // Fetch user data
    console.log('Fetching user data after login');
    const userData = await apiRequest('/auth');
    console.log('User data after login:', userData);
    
    // Return formatted user data
    const user = {
      id: userData._id,
      email: userData.email,
      role: userData.role as UserRole,
      firstName: userData.firstName,
      lastName: userData.lastName
    };
    
    return { data: { user, token: data.token }, error: null };
  } catch (error: any) {
    console.error('Login error:', error);
    return { error, data: null };
  }
};

// Sign up service function
export const signUpService = async (
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string, 
  role: UserRole = 'patient'
) => {
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
    
    return { data: { user }, error: null };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { data: null, error };
  }
};

// Update profile service function
export const updateProfileService = async (user: AuthUser, userData: Partial<AuthUser>) => {
  if (!user) {
    console.error('Cannot update profile: user not authenticated');
    throw new Error('User not authenticated');
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
    return updatedUserData;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Initialize auth service function
export const initializeAuthService = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('Checking token:', token ? 'Token exists' : 'No token');
    
    if (token) {
      try {
        // Verify token validity by fetching user data
        console.log('Fetching user data with token');
        const userData = await apiRequest('/auth');
        console.log('User data received:', userData);
        
        const user = {
          id: userData._id,
          email: userData.email,
          role: userData.role as UserRole,
          firstName: userData.firstName,
          lastName: userData.lastName
        };
        
        return { user, error: null };
      } catch (error) {
        console.error('Error validating token:', error);
        // Token invalid, clear storage
        localStorage.removeItem('token');
        return { user: null, error };
      }
    } else {
      console.log('No token found, setting unauthenticated state');
      return { user: null, error: null };
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
    return { user: null, error };
  }
};
