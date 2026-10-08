'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { fetchWithRetry, dynamicReadConfig } from '@/lib/fetchWithRetry';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [authError, setAuthError] = useState(null);
  const validation = useRef(null);
  const needsReconnect = useRef(false);
  const lastValidation = useRef(-Infinity);

  const cancelValidation = () => {
    validation.current?.controller.abort();
    validation.current = null;
    needsReconnect.current = false;
  };

  const checkAuth = useCallback(() => {
    if (validation.current) return validation.current.promise;
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return Promise.resolve(); }
    let cached = null;
    try {
      const candidate = JSON.parse(localStorage.getItem('user') || 'null');
      if (candidate?.id && candidate?.role) cached = candidate;
    } catch { /* A malformed UI cache does not invalidate the token. */ }
    // Cached identity is only for rendering; every API still validates the token.
    if (cached) { setUser(previous => previous || cached); setLoading(false); }
    const controller = new AbortController();
    const { signal } = controller;
    lastValidation.current = Date.now();
    setAuthError(null);
    const promise = Promise.resolve().then(async () => {
      try {
        const response = await fetchWithRetry(attempt => authAPI.getMe(dynamicReadConfig({
          signal, timeout: attempt === 0 ? 45000 : 20000,
        })), { signal });
        if (signal.aborted || localStorage.getItem('token') !== token) return;
        const verified = response.data.data.user;
        setUser(verified);
        localStorage.setItem('user', JSON.stringify(verified));
        needsReconnect.current = false;
      } catch (error) {
        if (signal.aborted) return;
        if (error.response?.status === 401) {
          // The existing interceptor owns token removal and the login redirect.
          setUser(null);
          needsReconnect.current = false;
        } else if (localStorage.getItem('token') === token) {
          // Keep an already-open session (or its cached identity) during an outage.
          setUser(previous => previous || cached);
          setAuthError('We could not verify your session yet. Reconnecting automatically.');
          needsReconnect.current = true;
        }
      } finally {
        if (!signal.aborted) setLoading(false);
        if (validation.current?.controller === controller) validation.current = null;
      }
    });
    validation.current = { controller, promise };
    return promise;
  }, []);

  useEffect(() => {
    void checkAuth();
    const reconnect = () => {
      if (needsReconnect.current && document.visibilityState === 'visible'
          && Date.now() - lastValidation.current >= 1000) void checkAuth();
    };
    const timer = setInterval(reconnect, 30000);
    window.addEventListener('focus', reconnect);
    window.addEventListener('online', reconnect);
    document.addEventListener('visibilitychange', reconnect);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', reconnect);
      window.removeEventListener('online', reconnect);
      document.removeEventListener('visibilitychange', reconnect);
      cancelValidation();
    };
  }, [checkAuth]);

  const login = async (credentials) => {
    cancelValidation();
    try {
      const response = await authAPI.login(credentials);
      const { user, token } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setAuthError(null);
      setLoading(false);

      // BUG 2 FIX: students were redirected to /dashboard/student/practice-hub
      // which skipped the main student dashboard entirely.
      // Now students land on /dashboard/student (their proper dashboard),
      // which has a prominent Practice Hub button to navigate further.
      const dashboardPath = user.role === 'student'
        ? '/dashboard/student'
        : '/dashboard/teacher';
      router.push(dashboardPath);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    cancelValidation();
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setAuthError(null);
      setLoading(false);

      // BUG 2 FIX: same redirect fix for registration flow.
      const dashboardPath = user.role === 'student'
        ? '/dashboard/student'
        : '/dashboard/teacher';
      router.push(dashboardPath);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    cancelValidation();
    setAuthError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    loading,
    authError,
    retryAuth: checkAuth,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isStudent:       user?.role === 'student',
    isTeacher:       user?.role === 'teacher',
    isAdmin:         user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
