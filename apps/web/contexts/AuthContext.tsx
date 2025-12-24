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

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User, UserRole } from '@/types';
import { API_BASE_URL } from '@/lib/api/config';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  isAuthenticated: boolean;
  isGovernment: boolean;
  isCitizen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const refreshMe = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include', // ✅ penting: kirim cookie
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await readJsonSafe(res);
      setUser(data?.user ?? null);
    } catch (e) {
      console.error('refreshMe error:', e);
      setUser(null);
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
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ supaya cookie tersimpan
        body: JSON.stringify({ email, password, role }),
      });

      const data = await readJsonSafe(res);

      if (!res.ok) return false;

      // backend idealnya return user + set cookie
      setUser(data?.user ?? null);
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
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await readJsonSafe(res);
      if (!res.ok) return false;

      setUser(data?.user ?? null);
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
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error('logout error:', e);
    } finally {
      setUser(null);
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
      isAuthenticated: !!user,
      isGovernment: user?.role === 'government',
      isCitizen: user?.role === 'citizen',
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
