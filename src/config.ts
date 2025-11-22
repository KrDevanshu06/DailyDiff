// Secure API URL configuration from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Validate that API URL is set in production
if (import.meta.env.MODE === 'production' && !import.meta.env.VITE_API_URL) {
  console.error('🚨 VITE_API_URL must be set in production environment');
}

export default API_URL;
