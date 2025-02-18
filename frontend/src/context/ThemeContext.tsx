// src/context/ThemeContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';

export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  inputBackground: string;
  text: string;
  navBackground: string;
  cardBorder: string;
}

const lightTheme: Theme = {
  primary: '#3c8d2f',
  secondary: '#ffcc00',
  background: '#f8f9fa',
  inputBackground: '#ffffff',
  text: '#333333',
  navBackground: '#ffffff',
  cardBorder: '#ccc',
};

const darkTheme: Theme = {
  primary: '#bb86fc',
  secondary: '#03dac6',
  background: '#121212',
  inputBackground: '#1e1e1e',
  text: '#ffffff',
  navBackground: '#1f1f1f',
  cardBorder: '#444',
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage for a stored theme setting
    const storedTheme = localStorage.getItem('theme');
    return storedTheme === 'dark' ? darkTheme : lightTheme;
  });

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === lightTheme ? darkTheme : lightTheme;
      // Save the preference to localStorage
      localStorage.setItem('theme', newTheme === darkTheme ? 'dark' : 'light');
      return newTheme;
    });
  };

  useEffect(() => {
    // Optional: if you want to perform side effects when the theme changes.
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
