import {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    ReactNode,
} from "react";
import Fuse from "fuse.js";
import { ContextApp, Component } from "../Types";

interface ContextState {
    contextApp: ContextApp | null;
    loading: boolean;
    error: string | null;
    selectedTranslation: string | null;
    selectedComponentId: string | null;
    locale: string;
    searchTerm: string;
    translationSearchTerm: string;
    setSelectedTranslation: (key: string | null) => void;
    setSelectedComponentId: (id: string | null) => void;
    setLocale: (locale: string) => void;
    setSearchTerm: (term: string) => void;
    setTranslationSearchTerm: (term: string) => void;
    getComponent: (id: string) => Component | undefined;
    getFilteredComponents: () => Component[];
    getFilteredTranslations: () => string[];
}

const AppContext = createContext<ContextState | undefined>(undefined);

interface ContextProviderProps {
    children: ReactNode;
}

export function ContextProvider({ children }: ContextProviderProps) {
    const [contextApp, setContextApp] = useState<ContextApp | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTranslation, setSelectedTranslation] = useState<
        string | null
    >(null);
    const [selectedComponentId, setSelectedComponentId] = useState<
        string | null
    >(null);
    const [locale, setLocale] = useState<string>("en");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [translationSearchTerm, setTranslationSearchTerm] =
        useState<string>("");

    useEffect(() => {
        async function loadContext() {
            try {
                const response = await fetch("/context.json");
                if (!response.ok) {
                    throw new Error("Failed to load context.json");
                }
                const data = await response.json();
                setContextApp(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
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

    // Memoized Fuse instance for fuzzy search
    const fuse = useMemo(() => {
        if (!contextApp) return null;

        const components = Object.values(contextApp.components);

        // Create searchable strings from relative paths
        const componentsWithSearchString = components.map((component) => {
            // Convert absolute path to relative path from project root
            const rootPath = contextApp.rootDir;
            const relativePath = component.path.startsWith(rootPath)
                ? component.path.slice(rootPath.length + 1)
                : component.path;

            // Create searchable string: remove separators and extensions
            // example/components/MainPage.tsx -> examplecomponentsMainPage
            const searchString = relativePath
                .replace(/[\/\\]/g, "") // Remove path separators
                .replace(/\.[^.]*$/, ""); // Remove file extension

            return {
                ...component,
                searchString,
                relativePath,
            };
        });

        return new Fuse(componentsWithSearchString, {
            keys: [
                { name: "searchString", weight: 2 }, // Prioritize the concatenated path
                { name: "name", weight: 1.5 }, // Component name is important
                { name: "relativePath", weight: 1 }, // Full path as fallback
            ],
            threshold: 0.4, // More lenient threshold for typos
            ignoreLocation: true, // Match anywhere in the string
            minMatchCharLength: 1,
            includeScore: true,
        });
    }, [contextApp]);

    // Memoized Fuse instance for translation fuzzy search
    const translationFuse = useMemo(() => {
        if (
            !contextApp ||
            !contextApp.translationValues ||
            Object.keys(contextApp.translationValues).length === 0
        ) {
            return null;
        }

        // Create searchable translation objects with all language values
        const translationKeys = Object.keys(contextApp.translations);
        const translationsWithValues = translationKeys.map((key) => {
            const allValues: string[] = [];

            // Collect all translation values from all languages
            Object.entries(contextApp.translationValues!).forEach(
                ([locale, translations]) => {
                    if (translations[key]) {
                        allValues.push(translations[key]);
                    }
                },
            );

            // Create a searchable string combining key and all values
            const searchString = [key, ...allValues].join(" ");

            return {
                key,
                searchString,
                values: contextApp.translationValues!,
            };
        });

        return new Fuse(translationsWithValues, {
            keys: [
                { name: "key", weight: 2 }, // Prioritize the key itself
                { name: "searchString", weight: 1 }, // All values combined
            ],
            threshold: 0.4, // More lenient threshold for typos
            ignoreLocation: true, // Match anywhere in the string
            minMatchCharLength: 1,
            includeScore: true,
        });
    }, [contextApp]);

    const getFilteredComponents = (): Component[] => {
        if (!contextApp) return [];

        let components: Component[] = Object.values(contextApp.components);

        // If a translation is selected, filter components
        if (selectedTranslation) {
            const componentIds =
                contextApp.translations[selectedTranslation] || [];
            components = componentIds
                .map((id) => contextApp.components[id])
                .filter((c): c is Component => c !== undefined);
        }

        // Apply search filter
        if (searchTerm.trim() && fuse) {
            const results = fuse.search(searchTerm);
            const searchedIds = new Set(results.map((r) => r.item.id));
            components = components.filter((c) => searchedIds.has(c.id));
        }

        return components;
    };

    const getFilteredTranslations = (): string[] => {
        if (!contextApp) return [];

        let translationKeys = Object.keys(contextApp.translations).sort();

        // Apply translation search filter
        if (translationSearchTerm.trim() && translationFuse) {
            const results = translationFuse.search(translationSearchTerm);
            const searchedKeys = new Set(results.map((r) => r.item.key));
            translationKeys = translationKeys.filter((key) =>
                searchedKeys.has(key),
            );
        }

        return translationKeys;
    };

    return (
        <AppContext.Provider
            value={{
                contextApp,
                loading,
                error,
                selectedTranslation,
                selectedComponentId,
                locale,
                searchTerm,
                translationSearchTerm,
                setSelectedTranslation,
                setSelectedComponentId,
                setLocale,
                setSearchTerm,
                setTranslationSearchTerm,
                getComponent,
                getFilteredComponents,
                getFilteredTranslations,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within ContextProvider");
    }
    return context;
}
