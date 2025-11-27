import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ContextApp, Component } from '../Types';

interface ContextState {
  contextApp: ContextApp | null;
  loading: boolean;
  error: string | null;
  selectedTranslation: string | null;
  selectedComponentId: string | null;
  setSelectedTranslation: (key: string | null) => void;
  setSelectedComponentId: (id: string | null) => void;
  getComponent: (id: string) => Component | undefined;
  getFilteredComponents: () => Component[];
}

const AppContext = createContext<ContextState | undefined>(undefined);

interface ContextProviderProps {
  children: ReactNode;
}

export function ContextProvider({ children }: ContextProviderProps) {
  const [contextApp, setContextApp] = useState<ContextApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<string | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  useEffect(() => {
    async function loadContext() {
      try {
        const response = await fetch('/context.json');
        if (!response.ok) {
          throw new Error('Failed to load context.json');
        }
        const data = await response.json();
        setContextApp(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadContext();
  }, []);

  const getComponent = (id: string): Component | undefined => {
    if (!contextApp) return undefined;
    return contextApp.components[id];
  };

  const getFilteredComponents = (): Component[] => {
    if (!contextApp) return [];

    // If a translation is selected, filter components
    if (selectedTranslation) {
      const componentIds = contextApp.translations[selectedTranslation] || [];
      return componentIds
        .map(id => contextApp.components[id])
        .filter((c): c is Component => c !== undefined);
    }

    // Otherwise return all components
    return Object.values(contextApp.components);
  };

  return (
    <AppContext.Provider
      value={{
        contextApp,
        loading,
        error,
        selectedTranslation,
        selectedComponentId,
        setSelectedTranslation,
        setSelectedComponentId,
        getComponent,
        getFilteredComponents,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within ContextProvider');
  }
  return context;
}
