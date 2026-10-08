import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/me`);
      setUser(res.data);
    } catch (error) {
      console.error('Failed to fetch user', error);
      // ONLY clear token if the backend explicitly rejected the token as invalid or expired (401)
      if (error.response?.status === 401) {
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const cleanInput = (identifier || '').trim();
    const isEmail = cleanInput.includes('@');
    const payload = {
      phone: isEmail ? '' : cleanInput,
      email: isEmail ? cleanInput.toLowerCase() : '',
      identifier: isEmail ? cleanInput.toLowerCase() : cleanInput,
      password,
    };

    const maxRetries = 2;
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await axios.post(`${apiUrl}/api/auth/login`, payload, {
          timeout: 20000,
        });
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data.user;
      } catch (err) {
        lastError = err;
        const isTransient = !err.response ||
          err.response.status === 502 ||
          err.response.status === 503 ||
          err.response.status === 504 ||
          err.code === 'ECONNABORTED' ||
          err.code === 'ERR_NETWORK';

        // NEVER retry 400 or 401 (invalid credentials) or if maxRetries reached
        if (!isTransient || attempt === maxRetries) {
          throw err;
        }

        // Wait before retrying (1200ms)
        await new Promise((r) => setTimeout(r, 1200));
      }
    }

    throw lastError;
  };

  const register = async (userData) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/register`, userData);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
