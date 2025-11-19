import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import * as authApi from '../services/auth.service.js';

const AuthContext = createContext(null);

const initialState = { user: null, token: null, loading: true };

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return { ...state, user: action.user, token: action.token, loading: false };
    case 'LOGIN':
      return { ...state, user: action.user, token: action.token };
    case 'LOGOUT':
      return { ...state, user: null, token: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return dispatch({ type: 'INIT', user: null, token: null });
    authApi.me(token)
      .then(({ user }) => dispatch({ type: 'INIT', user, token }))
      .catch(() => {
        localStorage.removeItem('token');
        dispatch({ type: 'INIT', user: null, token: null });
      });
  }, []);

  const login = async (email, password) => {
    const { token, user } = await authApi.login(email, password);
    localStorage.setItem('token', token);
    dispatch({ type: 'LOGIN', user, token });
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const value = useMemo(() => ({ ...state, login, logout }), [state]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
