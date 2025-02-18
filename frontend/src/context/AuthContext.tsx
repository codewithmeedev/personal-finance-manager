import React, { createContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from localStorage: if an accessToken exists, user is authenticated.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('accessToken'));
  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
