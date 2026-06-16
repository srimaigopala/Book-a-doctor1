import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Restore user session on startup
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('doctor_token');
      const storedUser = localStorage.getItem('doctor_user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error recovering user session:', error);
      // Clean up corrupted storage
      localStorage.removeItem('doctor_token');
      localStorage.removeItem('doctor_user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setMessage(null);
    try {
      // Setup demo bypass logic to support Doctor role instantly in previews
      if (email.toLowerCase() === 'doctor@bookadoctor.com' && password === 'doctor123') {
        const docUser = {
          id: 'doc123',
          _id: 'doc123',
          name: 'Dr. Rajesh Patel',
          email: 'doctor@bookadoctor.com',
          role: 'doctor',
          specialization: 'Cardiologist',
          experience: 12,
          fees: 800,
          available: true
        };
        const docToken = 'demo-doctor-auth-jwt-token-xyz';
        setToken(docToken);
        setUser(docUser);
        localStorage.setItem('doctor_token', docToken);
        localStorage.setItem('doctor_user', JSON.stringify(docUser));
        return { success: true, message: 'Doctor authenticated successfully!', user: docUser };
      }

      const res = await api.post('/api/auth/login', { email, password });
      if (res.data.success) {
        const { token: userToken, user: userProfile } = res.data;
        
        // Save to state
        setToken(userToken);
        setUser(userProfile);
        
        // Save to localStorage
        localStorage.setItem('doctor_token', userToken);
        localStorage.setItem('doctor_user', JSON.stringify(userProfile));
        
        return { success: true, message: res.data.message || 'Login successful', user: userProfile };
      } else {
        return { success: false, message: res.data.message || 'Invalid credentials' };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login request failed. Please check credentials.';
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (name, email, password, role = 'patient') => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post('/api/auth/register', { name, email, password, role });
      if (res.data.success) {
        return { success: true, message: res.data.message || 'Registration completed successfully' };
      } else {
        return { success: false, message: res.data.message || 'Could not complete registration' };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Try again.';
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('doctor_token');
    localStorage.removeItem('doctor_user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
    isDoctor: user?.role === 'doctor'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be styled and invoked within an AuthProvider');
  }
  return context;
}
