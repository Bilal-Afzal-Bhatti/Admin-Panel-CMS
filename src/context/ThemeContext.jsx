// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import getTheme from '../theme';

const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

export function ThemeModeProvider({ children }) {
  // Persist preference in localStorage
  const [mode, setMode] = useState(
    () => localStorage.getItem('themeMode') || 'light'
  );

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      return next;
    });
  };

  // useMemo — only rebuilds theme when mode changes
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* applies background color globally */}
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}