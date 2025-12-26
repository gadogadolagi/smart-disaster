// 'use client';
// import { User, UserRole } from '@/types';
// import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// interface AuthContextType {
//   user: User | null;
//   isLoading: boolean;
//   login: (email: string, password: string, role: UserRole) => Promise<boolean>;
//   register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
//   logout: () => void;
//   isAuthenticated: boolean;
//   isGovernment: boolean;
//   isCitizen: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Mock users for demo
// const MOCK_USERS: Record<string, { user: User; password: string }> = {
//   'warga@demo.com': {
//     password: 'warga123',
//     user: {
//       id: 'user-1',
//       name: 'Budi Santoso',
//       email: 'warga@demo.com',
//       phone: '081234567890',
//       role: 'citizen',
//       createdAt: new Date().toISOString(),
//     },
//   },
//   'pemerintah@demo.com': {
//     password: 'admin123',
//     user: {
//       id: 'gov-1',
//       name: 'Admin BPBD',
//       email: 'pemerintah@demo.com',
//       phone: '021123456',
//       role: 'government',
//       createdAt: new Date().toISOString(),
//     },
//   },
// };

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Check localStorage for existing session
//     const storedUser = localStorage.getItem('disaster_portal_user');
//     if (storedUser) {
//       try {
//         setUser(JSON.parse(storedUser));
//       } catch {
//         localStorage.removeItem('disaster_portal_user');
//       }
//     }
//     setIsLoading(false);
//   }, []);

//   const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
//     setIsLoading(true);
//     // Simulate API call delay
//     await new Promise((resolve) => setTimeout(resolve, 500));

//     const mockUser = MOCK_USERS[email.toLowerCase()];

//     if (mockUser && mockUser.password === password && mockUser.user.role === role) {
//       setUser(mockUser.user);
//       localStorage.setItem('disaster_portal_user', JSON.stringify(mockUser.user));
//       setIsLoading(false);
//       return true;
//     }

//     // Also check registered users from localStorage
//     const registeredUsers = JSON.parse(
//       localStorage.getItem('disaster_portal_registered_users') || '{}'
//     );
//     const registeredUser = registeredUsers[email.toLowerCase()];

//     if (registeredUser && registeredUser.password === password) {
//       setUser(registeredUser.user);
//       localStorage.setItem('disaster_portal_user', JSON.stringify(registeredUser.user));
//       setIsLoading(false);
//       return true;
//     }

//     setIsLoading(false);
//     return false;
//   };

//   const register = async (
//     name: string,
//     email: string,
//     password: string,
//     phone?: string
//   ): Promise<boolean> => {
//     setIsLoading(true);
//     await new Promise((resolve) => setTimeout(resolve, 500));

//     const newUser: User = {
//       id: `user-${Date.now()}`,
//       name,
//       email: email.toLowerCase(),
//       phone,
//       role: 'citizen',
//       createdAt: new Date().toISOString(),
//     };

//     // Store in localStorage
//     const registeredUsers = JSON.parse(
//       localStorage.getItem('disaster_portal_registered_users') || '{}'
//     );
//     registeredUsers[email.toLowerCase()] = { user: newUser, password };
//     localStorage.setItem('disaster_portal_registered_users', JSON.stringify(registeredUsers));

//     setUser(newUser);
//     localStorage.setItem('disaster_portal_user', JSON.stringify(newUser));
//     setIsLoading(false);
//     return true;
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('disaster_portal_user');
//   };

//   const value: AuthContextType = {
//     user,
//     isLoading,
//     login,
//     register,
//     logout,
//     isAuthenticated: !!user,
//     isGovernment: user?.role === 'government',
//     isCitizen: user?.role === 'citizen',
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }

'use client';

import { API_BASE_URL } from '@/lib/api/config';
import type { User, UserRole } from '@/types';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  getAccessToken: () => string | null;
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) => Promise<boolean>;
  isAuthenticated: boolean;
  isGovernment: boolean;
  isCitizen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

async function readJsonSafe(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { message: text };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getAccessToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  };

  const getRefreshToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  };

  const setTokens = (accessToken: string, refreshToken: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  };

  const clearTokens = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await readJsonSafe(res);

      if (!res.ok || !data?.data) {
        clearTokens();
        setUser(null);
        return false;
      }

      setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    } catch (e) {
      console.error('refreshAccessToken error:', e);
      clearTokens();
      setUser(null);
      return false;
    }
  };

  const refreshMe = async () => {
    // Prevent multiple simultaneous calls
    if (isRefreshing) {
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      setUser(null);
      return;
    }

    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.status === 401) {
        // Try to refresh token
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry with new token
          const newToken = getAccessToken();
          const retryRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          });
          if (retryRes.ok) {
            const retryData = await readJsonSafe(retryRes);
            setUser(retryData?.data ?? null);
            return;
          }
        }
        setUser(null);
        return;
      }

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await readJsonSafe(res);
      setUser(data?.data ?? null);
    } catch (e) {
      console.error('refreshMe error:', e);
      setUser(null);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await refreshMe();
      setIsLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await readJsonSafe(res);

      if (!res.ok || !data?.data) return false;

      // Store tokens
      setTokens(data.data.accessToken, data.data.refreshToken);

      // Set user
      setUser(data.data.user ?? null);
      return true;
    } catch (e) {
      console.error('login error:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await readJsonSafe(res);
      if (!res.ok || !data?.data) return false;

      // Store tokens
      setTokens(data.data.accessToken, data.data.refreshToken);

      // Set user
      setUser(data.data.user ?? null);
      return true;
    } catch (e) {
      console.error('register error:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (e) {
      console.error('logout error:', e);
    } finally {
      clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: { name?: string; phone?: string; avatar?: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return false;
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await readJsonSafe(res);

      if (!res.ok || !responseData?.data) {
        return false;
      }

      // Update user state
      setUser(responseData.data);
      return true;
    } catch (e) {
      console.error('updateProfile error:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      refreshMe,
      refreshAccessToken,
      getAccessToken,
      updateProfile,
      isAuthenticated: !!user,
      isGovernment: user?.role === 'admin',
      isCitizen: user?.role === 'user',
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
