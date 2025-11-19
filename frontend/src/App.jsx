import React from 'react';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Router from './router.jsx';
import { ThemeProvider } from './contexts/ThemeContext';
import { PermissionProvider } from './contexts/PermissionContext.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PermissionProvider>
          <Router />
        </PermissionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
