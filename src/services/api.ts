
// API service with improved error handling
const API_URL = 'http://localhost:5000/api';

export const getAuthToken = () => localStorage.getItem('token');

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'x-auth-token': token } : {}),
    ...(options.headers || {})
  };

  try {
    console.log(`Making API request to: ${API_URL}${endpoint}`);
    console.log('Request details:', { endpoint, method: options.method || 'GET' });
    console.log('Headers:', headers);
    
    // Log request body if present
    if (options.body) {
      console.log('Request body:', options.body);
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type');
    let responseData;
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    console.log('API response status:', response.status);
    console.log('API response data:', responseData);
    
    if (!response.ok) {
      console.error('API error response:', responseData);
      throw new Error(responseData.msg || responseData.message || responseData || 'API request failed');
    }
    
    return responseData;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};
