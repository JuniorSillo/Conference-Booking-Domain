import axios from 'axios'


const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,  // 5-second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use((config) => {
  console.log(`Sending ${config.method.toUpperCase()} to ${config.url}`);
  return config;
}, (error) => {
  return Promise.reject(error);
});


apiClient.interceptors.response.use((response) => {
  return response.data;  
}, (error) => {
  console.error('API Error:', error.message);
  return Promise.reject(error);
});

export default apiClient;