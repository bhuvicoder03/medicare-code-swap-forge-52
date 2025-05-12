
// Add any custom application types here
const API_URL = 'http://localhost:5000/api';

export const getAuthToken = () => localStorage.getItem('token');

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'x-auth-token': token } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.msg || errorData.message || 'API request failed');
  }

  return response.json();
};
