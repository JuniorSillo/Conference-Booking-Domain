import axios from 'axios'

// Create single pre-configured instance (singleton)
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,  // 5-second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: log method + URL
apiClient.interceptors.request.use((config) => {
  console.log(`Sending ${config.method.toUpperCase()} to ${config.url}`);
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: unwrap .data on success, log/re-throw on failure
apiClient.interceptors.response.use((response) => {
  return response.data;  // unwrap — consumers get data directly
}, (error) => {
  console.error('API Error:', error.message);
  return Promise.reject(error);  // re-throw for callers to handle
});

export default apiClient;