// API Configuration
const isDevelopment = import.meta.env.MODE === 'development';

export const API_BASE_URL = isDevelopment
  ? 'http://localhost:5001'
  : (import.meta.env.VITE_API_URL || '');

console.log('🔌 API Base URL configured as:', API_BASE_URL || '(relative path)');

export const FRONTEND_URL = isDevelopment
  ? 'http://localhost:5173'
  : window.location.origin;

export const config = {
  apiUrl: API_BASE_URL,
  frontendUrl: FRONTEND_URL,
  isDevelopment,
};

export default config;
