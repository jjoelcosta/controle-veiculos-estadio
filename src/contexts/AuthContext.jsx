import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { storage } from '../utils/storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão ao carregar
    checkSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const session = await storage.getSession();
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await storage.login(email, password);
      if (result.success) {
        setSession(result.session);
        setUser(result.user);
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await storage.logout();
      setSession(null);
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    session,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};