import React, { createContext, useContext } from 'react';

interface ThemeContextValue {
  theme: string;
  primaryColor: string;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  primaryColor: '#10b981'
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface TestThemeProviderProps {
  theme?: string;
  primaryColor?: string;
  children: React.ReactNode;
}

export default function TestThemeProvider({
  theme = 'light',
  primaryColor = '#10b981',
  children
}: TestThemeProviderProps) {
  console.log('TestThemeProvider initialized with:', { theme, primaryColor });

  return (
    <ThemeContext.Provider value={{ theme, primaryColor }}>
      <div data-theme={theme} style={{ '--test-primary': primaryColor } as any}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
