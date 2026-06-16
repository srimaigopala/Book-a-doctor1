import axios from 'axios';

// Create target instance. Dynamic baseURL to query port 5000 locally,
// or use relative paths (/api) in hosted environments where Vite proxies it.
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const api = axios.create({
  baseURL: isLocal ? 'http://localhost:5000' : '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT Token (Bearer) into instructions
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('doctor_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
