import {
    ArrowLeft,
    Code,
    Zap,
    Globe,
    Users,
    ChevronDown,
    ChevronUp,
    Eye,
} from "lucide-react";
import {
    useState,
    useEffect,
    Component as ReactComponent,
    ErrorInfo,
} from "react";
import { useAppContext } from "./ContextProvider";
import PropInput from "./PropInput";
import { componentRegistry } from "../ComponentBundle";
import { generatePropsData } from "../PropsDataGenerator";
import TranslationHighlighter from "./TranslationHighlighter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import enTranslations from "../../example/translations/en-translation.json";
import frTranslations from "../../example/translations/fr-translation.json";
import { getComponentStyles } from "../ComponentStyleBundle";
import { DesignSystemWrapper } from "../DesignSystemBundle.tsx";
import { initDesignSystemPreview } from "../DesignSystemInit";

// Available translations
const translations: Record<string, Record<string, string>> = {
    en: enTranslations,
    fr: frTranslations,
};

// Create a query client for preview
const previewQueryClient = new QueryClient();

const Badge = ({
    children,
    color = "indigo",
}: {
    children: React.ReactNode;
    color?: string;
}) => {
    const colors: Record<string, string> = {
        slate: "bg-slate-800 text-slate-300 border-slate-700",
        indigo: "bg-indigo-900/30 text-indigo-300 border-indigo-800",
        emerald: "bg-emerald-900/30 text-emerald-300 border-emerald-800",
        rose: "bg-rose-900/30 text-rose-300 border-rose-800",
    };
    return (
        <span
            className={`px-2 py-1 rounded-md text-xs font-medium border ${colors[color] || colors.slate}`}
        >
            {children}
        </span>
    );
};

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: (error: Error) => React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends ReactComponent<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Component preview error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError && this.state.error) {
            if (this.props.fallback) {
                return this.props.fallback(this.state.error);
            }
            return (
                <div className="bg-rose-900/20 border border-rose-800 rounded-lg p-4">
                    <h3 className="text-rose-400 font-bold mb-2">
                        Preview Error
                    </h3>
                    <p className="text-rose-300 text-sm mb-2">
                        {this.state.error.message}
                    </p>
                    <pre className="text-xs text-slate-400 bg-slate-900 p-2 rounded overflow-auto max-h-40">
                        {this.state.error.stack}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Custom hook to dynamically inject component-specific CSS
 * Loads CSS files for the current component and injects them into @layer components
 */
function useComponentStyles(componentId: string | null) {
    useEffect(() => {
        if (!componentId) return;

        const styleId = `component-styles-${componentId}`;

        // Remove previous component's styles
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }

        // Get CSS file paths for this component
        const cssPaths = getComponentStyles(componentId);

        if (cssPaths.length === 0) {
            return; // No CSS files for this component
        }

        // Fetch and inject CSS files
        Promise.all(
            cssPaths.map(async (cssPath) => {
                try {
                    const response = await fetch(cssPath);
                    if (!response.ok) {
                        console.warn(`Failed to load CSS: ${cssPath}`);
                        return '';
                    }
                    return await response.text();
                } catch (error) {
                    console.warn(`Error loading CSS ${cssPath}:`, error);
                    return '';
                }
            })
        ).then((cssContents) => {
            const combinedCSS = cssContents.filter(css => css.trim()).join('\n\n');

            if (!combinedCSS) return;

            // Create style element and inject into @layer components
            const styleElement = document.createElement('style');
            styleElement.id = styleId;
            styleElement.textContent = `@layer components {\n${combinedCSS}\n}`;
            document.head.appendChild(styleElement);
        });

        // Cleanup on unmount
        return () => {
            const styleElement = document.getElementById(styleId);
            if (styleElement) {
                styleElement.remove();
            }
        };
    }, [componentId]);
}

/**
 * Custom hook to load design system CSS
 * Loads the global design system stylesheet once
 */
function useDesignSystemCSS() {
    useEffect(() => {
        const styleId = 'design-system-css';
        const existing = document.getElementById(styleId);
        if (existing) return; // Already loaded

        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = './design-system.css';
        document.head.appendChild(link);

        return () => {
            document.getElementById(styleId)?.remove();
        };
    }, []);
}

/**
 * Custom hook to initialize design system
 * Runs initialization function once on mount
 */
function useDesignSystemInit() {
    useEffect(() => {
        initDesignSystemPreview();
    }, []);
}

interface PreviewViewProps {
    onBack: () => void;
}

export default function PreviewView({ onBack }: PreviewViewProps) {
    const {
        contextApp,
        selectedComponentId,
        setSelectedComponentId,
        getComponent,
        locale,
        setLocale,
    } = useAppContext();
    const [expandedSections, setExpandedSections] = useState({
        props: true,
        hooks: true,
        translations: true,
        parents: true,
        children: true,
    });
    const [propValues, setPropValues] = useState<Record<string, any> | null>(
        null,
    );
    const [hoveredTranslationKey, setHoveredTranslationKey] = useState<
        string | null
    >(null);

    const component = selectedComponentId
        ? getComponent(selectedComponentId)
        : null;

    // Dynamically inject component-specific CSS
    useComponentStyles(selectedComponentId);

    // Load design system CSS and initialize
    useDesignSystemCSS();
    useDesignSystemInit();

    // Initialize prop values when component changes
    useEffect(() => {
        if (component) {
            // Use the props generator to create realistic initial values
            const initialValues = generatePropsData(component.props);
            setPropValues(initialValues);
        } else {
            setPropValues(null);
        }
    }, [selectedComponentId, component]);

    if (!component || !contextApp) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Code className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                    <p className="text-slate-400">No component selected</p>
                </div>
            </div>
        );
    }

    const category =
        component.parentIds.length === 0
            ? "Page"
            : component.childrenIds.length === 0
              ? "Atom"
              : "Molecule";

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const handlePropChange = (propName: string, newValue: any, enumValues?: Record<string, string | number>) => {
        // If this is an enum prop, convert the key name back to its value
        let processedValue = newValue;
        if (enumValues && typeof newValue === 'string' && newValue in enumValues) {
            // newValue is the key name (e.g., "Low")
            // Convert to the actual enum value (e.g., 0)
            processedValue = enumValues[newValue];
        }

        setPropValues((prev) => ({ ...prev, [propName]: processedValue }));
        // In a real app, you would send this to a backend or update the component
        console.log(`Prop "${propName}" changed to:`, processedValue);
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
            {/* Header breadcrumb */}
            <div className="h-16 border-b border-slate-800 flex items-center px-6 gap-4 bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="h-6 w-px bg-slate-800" />
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        {component.name}
                        <Badge
                            color={
                                category === "Page"
                                    ? "rose"
                                    : category === "Molecule"
                                      ? "indigo"
                                      : "emerald"
                            }
                        >
                            {category}
                        </Badge>
                    </h2>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left: Component Details */}
                <div className="w-[380px] border-r border-slate-800 bg-slate-900/30 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* File Path */}
                        <div>
                            <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                                File Path
                            </div>
                            <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
                                <code className="text-xs text-indigo-400 font-mono break-all">
                                    {component.path}
                                </code>
                            </div>
                        </div>

                        {/* Props Section */}
                        <div>
                            <button
                                onClick={() => toggleSection("props")}
                                className="w-full flex items-center justify-between mb-3"
                            >
                                <div className="flex items-center gap-2">
                                    <Code
                                        size={14}
                                        className="text-emerald-400"
                                    />
                                    <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                                        Props ({component.props.length})
                                    </span>
                                </div>
                                {expandedSections.props ? (
                                    <ChevronUp
                                        size={16}
                                        className="text-slate-500"
                                    />
                                ) : (
                                    <ChevronDown
                                        size={16}
                                        className="text-slate-500"
                                    />
                                )}
                            </button>
                            {expandedSections.props && (
                                <div className="space-y-3">
                                    {component.props.length === 0 ? (
                                        <p className="text-slate-500 text-sm">
                                            No props
                                        </p>
                                    ) : (
                                        component.props.map((prop, idx) => (
                                            <PropInput
                                                key={idx}
                                                type={prop.enumValues ? 'enum' : prop.type}
                                                label={prop.name}
                                                value={propValues?.[prop.name]}
                                                onChange={(newValue) =>
                                                    handlePropChange(
                                                        prop.name,
                                                        newValue,
                                                        prop.enumValues
                                                    )
                                                }
                                                options={prop.enumValues ? Object.keys(prop.enumValues) : undefined}
                                                enumValues={prop.enumValues}
                                            />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Hooks Section */}
                        <div>
                            <button
                                onClick={() => toggleSection("hooks")}
                                className="w-full flex items-center justify-between mb-3"
                            >
                                <div className="flex items-center gap-2">
                                    <Zap size={14} className="text-amber-400" />
                                    <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                                        Hooks ({component.hooks.length})
                                    </span>
                                </div>
                                {expandedSections.hooks ? (
                                    <ChevronUp
                                        size={16}
                                        className="text-slate-500"
                                    />
                                ) : (
                                    <ChevronDown
                                        size={16}
                                        className="text-slate-500"
                                    />
                                )}
                            </button>
                            {expandedSections.hooks && (
                                <div className="space-y-2">
                                    {component.hooks.length === 0 ? (
                                        <p className="text-slate-500 text-sm">
                                            No hooks
                                        </p>
                                    ) : (
                                        component.hooks.map((hook, idx) => {
                                            return (
                                                <div
                                                    key={idx}
                                                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2"
                                                >
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-amber-400 font-mono text-sm font-bold">
                                                            {hook.name}
                                                        </span>
                                                        <span className="text-slate-500 text-xs">
                                                            →
                                                        </span>
                                                        <span className="text-slate-400 font-mono text-xs">
                                                            {hook.type}
                                                        </span>
                                                    </div>
                                                    {hook.name === "useIntl" && (
                                                        <div className="flex items-center gap-2 pt-1 border-t border-slate-700/50">
                                                            <Globe size={12} className="text-slate-500" />
                                                            <span className="text-slate-500 text-xs">
                                                                Language:
                                                            </span>
                                                            <select
                                                                value={locale}
                                                                onChange={(e) => setLocale(e.target.value)}
                                                                className="ml-auto bg-slate-900/80 border border-slate-600/50 text-slate-300 text-xs rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all hover:border-slate-500"
                                                            >
                                                                <option value="en">EN</option>
                                                                <option value="fr">FR</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Translations Section */}
                        <div>
                            <button
                                onClick={() => toggleSection("translations")}
                                className="w-full flex items-center justify-between mb-3"
                            >
                                <div className="flex items-center gap-2">
                                    <Globe
                                        size={14}
                                        className="text-indigo-400"
                                    />
                                    <span className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">
                                        Translations (
                                        {component.translations.length})
                                    </span>
                                </div>
                                {expandedSections.translations ? (
                                    <ChevronUp
                                        size={16}
                                        className="text-slate-500"
                                    />
                                ) : (
                                    <ChevronDown
                                        size={16}
                                        className="text-slate-500"
                                    />
                                )}
                            </button>
                            {expandedSections.translations && (
                                <div className="space-y-2">
                                    {component.translations.length === 0 ? (
                                        <p className="text-slate-500 text-sm">
                                            No translations
                                        </p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {component.translations.map(
                                                (key, idx) => (
                                                    <span
                                                        key={idx}
                                                        className={`px-3 py-1.5 border rounded-lg text-xs font-mono cursor-pointer transition-all duration-200 ${
                                                            hoveredTranslationKey ===
                                                            key
                                                                ? "bg-purple-900/30 border-purple-500 text-purple-300 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/20"
                                                                : "bg-slate-800/50 border-slate-700 text-indigo-400 hover:border-purple-400"
                                                        }`}
                                                        onMouseEnter={() =>
                                                            setHoveredTranslationKey(
                                                                key,
                                                            )
                                                        }
                                                        onMouseLeave={() =>
                                                            setHoveredTranslationKey(
                                                                null,
                                                            )
                                                        }
                                                    >
                                                        {key}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Preview and Relationships */}
                <div className="flex-1 bg-[#0f1115] relative flex flex-col">
                    <div
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage:
                                "radial-gradient(#ffffff 1px, transparent 1px)",
                            backgroundSize: "20px 20px",
                        }}
                    />

                    <div className="flex-1 flex flex-col p-12 overflow-auto relative z-10">
                        {/* Relationships */}
                        <div className="max-w-2xl w-full mx-auto space-y-8">
                            {/* Parents Section */}
                            <div>
                                <button
                                    onClick={() => toggleSection("parents")}
                                    className="flex items-center gap-2 mb-4 text-slate-300 hover:text-white transition-colors"
                                >
                                    <Users
                                        size={16}
                                        className="text-rose-400"
                                    />
                                    <h3 className="text-sm font-bold uppercase tracking-wider">
                                        Parents ({component.parentIds.length})
                                    </h3>
                                    {expandedSections.parents ? (
                                        <ChevronUp size={16} />
                                    ) : (
                                        <ChevronDown size={16} />
                                    )}
                                </button>
                                {expandedSections.parents && (
                                    <div className="space-y-2">
                                        {component.parentIds.length === 0 ? (
                                            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
                                                <p className="text-slate-500 text-sm">
                                                    No parents (this is a root
                                                    component)
                                                </p>
                                            </div>
                                        ) : (
                                            component.parentIds.map(
                                                (parentId) => {
                                                    const parent =
                                                        contextApp.components[
                                                            parentId
                                                        ];
                                                    if (!parent) return null;
                                                    return (
                                                        <div
                                                            key={parentId}
                                                            onClick={() =>
                                                                setSelectedComponentId(
                                                                    parentId,
                                                                )
                                                            }
                                                            className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 hover:bg-slate-700/80 hover:border-indigo-500 transition-all cursor-pointer"
                                                        >
                                                            <div className="font-bold text-white mb-1">
                                                                {parent.name}
                                                            </div>
                                                            <div className="text-xs text-slate-400 font-mono">
                                                                {parent.path}
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Current Component */}
                            <div className="border border-indigo-500 bg-slate-900/80 p-6 rounded-2xl shadow-2xl relative">
                                <div className="absolute -top-3 left-4 bg-slate-800 text-[10px] uppercase font-bold text-slate-500 px-2 py-0.5 rounded border border-slate-700">
                                    Live Preview
                                </div>
                                {!propValues ? (
                                    <div
                                        style={{
                                            color: "#94a3b8",
                                            fontSize: "0.875rem",
                                            textAlign: "center",
                                            padding: "1rem",
                                        }}
                                    >
                                        Loading props...
                                    </div>
                                ) : (
                                    /* Key prop resets the error boundary when component changes */
                                    <ErrorBoundary key={selectedComponentId}>
                                        <TranslationHighlighter
                                            messages={translations[locale]}
                                            locale={locale}
                                            defaultLocale="en"
                                            hoveredTranslationKey={
                                                hoveredTranslationKey
                                            }
                                        >
                                            <QueryClientProvider
                                                client={previewQueryClient}
                                            >
                                                <DesignSystemWrapper>
                                                    {/* Isolated preview container with CSS layer isolation */}
                                                    <div
                                                        className="component-preview-container"
                                                        data-component-id={selectedComponentId}
                                                    >
                                                    {(() => {
                                                        const registryEntry =
                                                            componentRegistry.getComponent(
                                                                selectedComponentId!,
                                                            );
                                                        if (!registryEntry) {
                                                            return (
                                                                <div
                                                                    style={{
                                                                        color: "#94a3b8",
                                                                        fontSize:
                                                                            "0.875rem",
                                                                        textAlign:
                                                                            "center",
                                                                        padding:
                                                                            "1rem",
                                                                    }}
                                                                >
                                                                    Component
                                                                    not found in
                                                                    registry
                                                                </div>
                                                            );
                                                        }

                                                        const ComponentToRender =
                                                            registryEntry.component;
                                                        return (
                                                            <ComponentToRender
                                                                {...propValues}
                                                            />
                                                        );
                                                    })()}
                                                    </div>
                                                </DesignSystemWrapper>
                                            </QueryClientProvider>
                                        </TranslationHighlighter>
                                    </ErrorBoundary>
                                )}
                            </div>

                            {/* Children Section */}
                            <div>
                                <button
                                    onClick={() => toggleSection("children")}
                                    className="flex items-center gap-2 mb-4 text-slate-300 hover:text-white transition-colors"
                                >
                                    <Users
                                        size={16}
                                        className="text-emerald-400"
                                    />
                                    <h3 className="text-sm font-bold uppercase tracking-wider">
                                        Children ({component.childrenIds.length}
                                        )
                                    </h3>
                                    {expandedSections.children ? (
                                        <ChevronUp size={16} />
                                    ) : (
                                        <ChevronDown size={16} />
                                    )}
                                </button>
                                {expandedSections.children && (
                                    <div className="space-y-2">
                                        {component.childrenIds.length === 0 ? (
                                            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
                                                <p className="text-slate-500 text-sm">
                                                    No children (this is a leaf
                                                    component)
                                                </p>
                                            </div>
                                        ) : (
                                            component.childrenIds.map(
                                                (childId) => {
                                                    const child =
                                                        contextApp.components[
                                                            childId
                                                        ];
                                                    if (!child) return null;
                                                    return (
                                                        <div
                                                            key={childId}
                                                            onClick={() =>
                                                                setSelectedComponentId(
                                                                    childId,
                                                                )
                                                            }
                                                            className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 hover:bg-slate-700/80 hover:border-indigo-500 transition-all cursor-pointer"
                                                        >
                                                            <div className="font-bold text-white mb-1">
                                                                {child.name}
                                                            </div>
                                                            <div className="text-xs text-slate-400 font-mono">
                                                                {child.path}
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="h-12 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-4 text-xs font-mono text-slate-500">
                        <div>{component.id}</div>
                        <div className="flex gap-4">
                            <span>Props: {component.props.length}</span>
                            <span>Hooks: {component.hooks.length}</span>
                            <span>i18n: {component.translations.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
