
// API base URL
const API_BASE_URL ='https://rimedicare-phase1.onrender.com/api';

// Generic API request function
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Add token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Make the request
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Check if response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    
    // Return json response
    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${error}`);
    throw error;
  }
};
