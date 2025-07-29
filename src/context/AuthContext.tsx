"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  mobile?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  country?: string | null;
  city?: string | null;
  post_code?: string | null;
  terms_accepted?: boolean;
  privacy_accepted?: boolean;
  role: string;
  created_at?: string;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isInitialized: boolean;
  login: (login: string, password: string) => Promise<void>;
  register: (
    first_name: string,
    last_name: string,
    username: string,
    phone: string | null,
    whatsapp: string | null,
    mobile: string | null,
    date_of_birth: string,
    gender: string,
    address: string,
    country: string,
    city: string,
    post_code: string,
    email: string,
    password: string,
    password_confirmation: string,
    terms_accepted: boolean,
    privacy_accepted: boolean,
    role?: string
  ) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('AuthContext: Starting initialization');
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    console.log('AuthContext: Loading from localStorage', { 
      token: t ? 'exists' : 'missing', 
      user: u ? 'exists' : 'missing',
      tokenValue: t ? t.substring(0, 20) + '...' : 'null',
      userValue: u ? JSON.parse(u).email : 'null'
    });
    
    if (t && u) {
      try {
        const userData = JSON.parse(u);
        setToken(t);
        setUser(userData);
        console.log('AuthContext: Set token and user from localStorage');
      } catch (error) {
        console.error('AuthContext: Error parsing user data from localStorage', error);
        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('AuthContext: Cleared corrupted localStorage data');
      }
    } else if (t && !u) {
      console.log('AuthContext: Token exists but user data missing, attempting to recover');
      // Try to fetch user data using the token
      fetchUserData(t);
    } else {
      console.log('AuthContext: No stored auth data found');
    }
    setIsInitialized(true);
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      console.log('AuthContext: Fetching user data with existing token');
      const data = await api<{ data: { user: User } }>('/api/user', 'GET', undefined, token);
      setToken(token);
      setUser(data.data.user);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      console.log('AuthContext: Recovered user data and set token/user');
    } catch (error) {
      console.error('AuthContext: Failed to recover user data', error);
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('AuthContext: Cleared invalid token');
    }
  };

  const login = async (login: string, password: string) => {
    console.log('AuthContext: Attempting login with', { login });
    try {
      // The response is { data: { user, token } }
      const response = await api<{ data: { user: User; token: string } }>(
        '/api/auth/login',
        'POST',
        { login, password }
      );
      const { user, token } = response.data;
      console.log('AuthContext: Login response data:', response.data);
      console.log('AuthContext: User object:', user);
      console.log('AuthContext: User role:', user.role);
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('AuthContext: Token and user saved to localStorage');
    } catch (error) {
      console.error('AuthContext: Login failed', error);
      throw error;
    }
  };

  const register = async (
    first_name: string,
    last_name: string,
    username: string,
    phone: string | null,
    whatsapp: string | null,
    mobile: string | null,
    date_of_birth: string,
    gender: string,
    address: string,
    country: string,
    city: string,
    post_code: string,
    email: string,
    password: string,
    password_confirmation: string,
    terms_accepted: boolean,
    privacy_accepted: boolean,
    role: string = 'trader'
  ) => {
    const data = await api<{ message: string }>(
      '/api/auth/register',
      'POST',
      { 
        first_name, 
        last_name, 
        username,
        phone, 
        whatsapp,
        mobile,
        date_of_birth,
        gender,
        address,
        country,
        city,
        post_code,
        email, 
        password, 
        password_confirmation, 
        terms_accepted,
        privacy_accepted,
        role 
      }
    );
    return data;
  };

  const logout = async () => {
    if (token) {
      await api('/api/auth/logout', 'POST', {}, token).catch(()=>{});
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const data = await api<{ data: { user: User } }>('/api/user', 'GET', undefined, token);
        setUser(data.data.user);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        console.log('AuthContext: User data refreshed successfully');
      } catch (error) {
        console.error('AuthContext: Failed to refresh user data', error);
        // Optionally clear token if refresh fails
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('AuthContext: Cleared token and user after refresh failure');
      }
    } else {
      console.warn('AuthContext: Cannot refresh user, token is missing.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isInitialized, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}; 