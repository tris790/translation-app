import React, { useState, useEffect } from "react";
import {
    Search,
    Globe,
    Layout,
    Code,
    ChevronRight,
    Check,
    Sliders,
    Calendar,
    Type,
    Hash,
    ToggleLeft,
    ToggleRight,
    Braces,
    List,
    ArrowLeft,
    Zap,
    Box,
    Languages,
} from "lucide-react";

// --- MOCK DATA ---

const MOCK_TRANSLATIONS = [
    {
        key: "auth.login_btn",
        en: "Log In",
        fr: "Connexion",
        count: 3,
        components: ["primary-button", "login-modal", "navbar"],
    },
    {
        key: "auth.welcome_msg",
        en: "Welcome back, {name}!",
        fr: "Bon retour, {name}!",
        count: 1,
        components: ["hero-banner"],
    },
    {
        key: "common.cancel",
        en: "Cancel",
        fr: "Annuler",
        count: 5,
        components: [
            "primary-button",
            "settings-modal",
            "alert-dialog",
            "sidebar",
            "footer",
        ],
    },
    {
        key: "errors.404",
        en: "Page not found",
        fr: "Page non trouvée",
        count: 2,
        components: ["error-page", "toast-notification"],
    },
    {
        key: "dashboard.stats_title",
        en: "Monthly Overview",
        fr: "Aperçu Mensuel",
        count: 1,
        components: ["stats-card"],
    },
];

const MOCK_COMPONENTS = [
    {
        id: "primary-button",
        name: "PrimaryButton",
        category: "Atoms",
        description: "The main call-to-action button used across the platform.",
        presets: [
            {
                name: "Default State",
                props: {
                    label: "Click Me",
                    isDisabled: false,
                    variant: "solid",
                    clickCount: 0,
                },
            },
            {
                name: "Loading State",
                props: {
                    label: "Loading...",
                    isDisabled: true,
                    variant: "solid",
                    clickCount: 0,
                },
            },
            {
                name: "Outline Variant",
                props: {
                    label: "Cancel",
                    isDisabled: false,
                    variant: "outline",
                    clickCount: 0,
                },
            },
        ],
        propDefinitions: [
            { name: "label", type: "string", label: "Label Text" },
            {
                name: "variant",
                type: "enum",
                options: ["solid", "outline", "ghost"],
                label: "Style Variant",
            },
            { name: "isDisabled", type: "boolean", label: "Disabled State" },
            { name: "clickCount", type: "number", label: "Analytics ID" },
            { name: "meta", type: "object", label: "Metadata" },
        ],
    },
    {
        id: "stats-card",
        name: "StatsCard",
        category: "Molecules",
        description: "Displays a single statistic with a trend indicator.",
        presets: [
            {
                name: "Positive Trend",
                props: {
                    title: "Revenue",
                    value: "$45,231",
                    trend: 12.5,
                    isPositive: true,
                    date: "2023-10-25",
                },
            },
            {
                name: "Negative Trend",
                props: {
                    title: "Churn",
                    value: "2.4%",
                    trend: 4.1,
                    isPositive: false,
                    date: "2023-10-25",
                },
            },
        ],
        propDefinitions: [
            { name: "title", type: "string", label: "Card Title" },
            { name: "value", type: "string", label: "Main Value" },
            { name: "trend", type: "number", label: "Trend %" },
            { name: "isPositive", type: "boolean", label: "Positive Trend?" },
            { name: "date", type: "date", label: "Last Updated" },
            { name: "tags", type: "array", label: "Category Tags" },
        ],
    },
    {
        id: "hero-banner",
        name: "HeroBanner",
        category: "Organisms",
        description: "Top of page hero section with background image.",
        presets: [
            {
                name: "Welcome",
                props: {
                    headline: "Welcome back, User!",
                    subtext: "Ready to start?",
                    fullHeight: true,
                },
            },
            {
                name: "Promo",
                props: {
                    headline: "50% Off Sales",
                    subtext: "Limited time only.",
                    fullHeight: false,
                },
            },
        ],
        propDefinitions: [
            { name: "headline", type: "string", label: "Headline" },
            { name: "subtext", type: "string", label: "Subtext" },
            {
                name: "fullHeight",
                type: "boolean",
                label: "Full Viewport Height",
            },
        ],
    },
];

// --- HELPER COMPONENTS ---

const NavItem = ({ icon: Icon, label, active, onClick, badge }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
            active
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
    >
        <div className="flex items-center gap-3">
            <Icon
                size={18}
                className={
                    active
                        ? "text-white"
                        : "text-slate-500 group-hover:text-white"
                }
            />
            <span className="font-medium text-sm">{label}</span>
        </div>
        {badge && (
            <span
                className={`text-xs px-2 py-0.5 rounded-full ${active ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-300"}`}
            >
                {badge}
            </span>
        )}
    </button>
);

const Badge = ({ children, color = "slate" }) => {
    const colors = {
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

// --- PROPS INPUT COMPONENTS ---

const PropInput = ({ type, value, onChange, label, options }) => {
    const baseLabel = (
        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            {label}
        </label>
    );
    const baseInputClass =
        "w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all";

    switch (type) {
        case "string": {
            // Ensure value is treated as a string, defaulting to '' for null/undefined
            const stringValue = typeof value === "string" ? value : "";
            return (
                <div className="mb-5">
                    {baseLabel}
                    <div className="relative">
                        <Type
                            size={14}
                            className="absolute left-3 top-2.5 text-slate-600"
                        />
                        <input
                            type="text"
                            value={stringValue}
                            onChange={(e) => onChange(e.target.value)}
                            className={`${baseInputClass} pl-9`}
                        />
                    </div>
                </div>
            );
        }
        case "number": {
            return (
                <div className="mb-5">
                    {baseLabel}
                    <div className="relative">
                        <Hash
                            size={14}
                            className="absolute left-3 top-2.5 text-slate-600"
                        />
                        <input
                            type="number"
                            value={value || 0}
                            onChange={(e) => onChange(Number(e.target.value))}
                            className={`${baseInputClass} pl-9`}
                        />
                    </div>
                </div>
            );
        }
        case "boolean": {
            return (
                <div className="mb-5 flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700">
                    <span className="text-sm font-medium text-slate-300">
                        {label}
                    </span>
                    <button
                        onClick={() => onChange(!value)}
                        className={`transition-colors duration-200 ${value ? "text-indigo-400" : "text-slate-600"}`}
                    >
                        {value ? (
                            <ToggleRight size={28} />
                        ) : (
                            <ToggleLeft size={28} />
                        )}
                    </button>
                </div>
            );
        }
        case "date": {
            return (
                <div className="mb-5">
                    {baseLabel}
                    <div className="relative">
                        <Calendar
                            size={14}
                            className="absolute left-3 top-2.5 text-slate-600"
                        />
                        <input
                            type="date"
                            value={typeof value === "string" ? value : ""} // Ensure value is string for date input
                            onChange={(e) => onChange(e.target.value)}
                            className={`${baseInputClass} pl-9`}
                            style={{ colorScheme: "dark" }}
                        />
                    </div>
                </div>
            );
        }
        case "enum": {
            return (
                <div className="mb-5">
                    {baseLabel}
                    <div className="relative">
                        <List
                            size={14}
                            className="absolute left-3 top-2.5 text-slate-600"
                        />
                        <select
                            value={typeof value === "string" ? value : ""}
                            onChange={(e) => onChange(e.target.value)}
                            className={`${baseInputClass} pl-9 appearance-none`}
                        >
                            {options.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                        <ChevronRight
                            size={14}
                            className="absolute right-3 top-2.5 text-slate-600 rotate-90 pointer-events-none"
                        />
                    </div>
                </div>
            );
        }
        case "object":
        case "array": {
            return (
                <div className="mb-5">
                    {baseLabel}
                    <div className="relative">
                        <Braces
                            size={14}
                            className="absolute left-3 top-3 text-slate-600"
                        />
                        <textarea
                            value={
                                typeof value === "object" && value !== null
                                    ? JSON.stringify(value, null, 2)
                                    : value || ""
                            }
                            onChange={(e) => {
                                try {
                                    onChange(JSON.parse(e.target.value));
                                } catch (err) {
                                    // Allow typing invalid JSON, just don't update state nicely yet
                                }
                            }}
                            className={`${baseInputClass} pl-9 font-mono text-xs h-24 resize-none`}
                            spellCheck="false"
                        />
                    </div>
                </div>
            );
        }
        default:
            return null;
    }
};

// --- COMPONENT MOCK RENDERERS ---

const ComponentMocks = {
    "primary-button": ({ label, variant, isDisabled, clickCount }) => {
        let style = "bg-indigo-600 hover:bg-indigo-700 text-white";
        if (variant === "outline") {
            style =
                "bg-transparent border border-indigo-600 text-indigo-400 hover:bg-indigo-900/50";
        } else if (variant === "ghost") {
            style = "bg-transparent text-indigo-400 hover:bg-indigo-900/30";
        }

        if (isDisabled) {
            style = "bg-slate-700 text-slate-500 cursor-not-allowed";
        }

        return (
            <button
                className={`px-6 py-3 font-semibold rounded-xl shadow-lg transition-all duration-200 ${style}`}
                disabled={isDisabled}
            >
                {label} ({clickCount})
            </button>
        );
    },
    "stats-card": ({ title, value, trend, isPositive, date }) => (
        <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-sm border border-slate-700">
            <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                    {title}
                </h3>
                <Box size={20} className="text-indigo-400" />
            </div>
            <div className="mt-4 flex items-end justify-between">
                <span className="text-4xl font-extrabold text-white">
                    {value}
                </span>
                <div
                    className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}
                >
                    {isPositive ? (
                        <ArrowLeft size={16} className="rotate-90" />
                    ) : (
                        <ArrowLeft size={16} className="-rotate-90" />
                    )}
                    {trend}%
                </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Last updated: {date}</p>
        </div>
    ),
    "hero-banner": ({ headline, subtext, fullHeight }) => (
        <div
            className={`bg-cover bg-center rounded-xl p-10 text-white shadow-xl flex flex-col justify-center transition-all duration-300 ${fullHeight ? "h-96" : "h-64"}`}
            style={{
                backgroundImage:
                    "url('https://placehold.co/1200x400/1e293b/a5b4fc/png?text=Component+Background')",
            }}
        >
            <div className="bg-black/40 p-5 rounded-xl backdrop-blur-sm">
                <h1 className="text-4xl font-bold mb-2">{headline}</h1>
                <p className="text-lg font-light">{subtext}</p>
                <button className="mt-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium">
                    Get Started
                </button>
            </div>
        </div>
    ),
};

// --- MAIN APPLICATION ---

export default function App() {
    const [view, setView] = useState("translations"); // translations, components, preview
    const [lang, setLang] = useState("en");
    const [selectedTranslation, setSelectedTranslation] = useState(null);
    const [selectedComponentId, setSelectedComponentId] = useState(null);
    const [previewProps, setPreviewProps] = useState({});
    const [activePreset, setActivePreset] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const selectedComponent = MOCK_COMPONENTS.find(
        (c) => c.id === selectedComponentId,
    );

    // Effect to load the default preset when a component is selected
    useEffect(() => {
        if (selectedComponent && selectedComponent.presets.length > 0) {
            applyPreset(selectedComponent.presets[0].name);
        }
    }, [selectedComponentId]);

    const handlePropChange = (key, newValue) => {
        setPreviewProps((prev) => ({ ...prev, [key]: newValue }));
        setActivePreset("Custom");
    };

    const applyPreset = (presetName) => {
        const preset = selectedComponent.presets.find(
            (p) => p.name === presetName,
        );
        if (preset) {
            setPreviewProps(preset.props);
            setActivePreset(preset.name);
        }
    };

    const handleTranslationClick = (translation) => {
        setSelectedTranslation(translation);
        setSelectedComponentId(null);
        setView("components");
    };

    const handleComponentClick = (componentId) => {
        setSelectedComponentId(componentId);
        setView("preview");
    };

    const filteredTranslations = MOCK_TRANSLATIONS.filter(
        (t) =>
            t.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.fr.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const filteredComponents = MOCK_COMPONENTS.filter(
        (c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // --- RENDERERS FOR THE DIFFERENT VIEWS ---

    const renderTranslationView = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Languages size={24} className="text-indigo-400" />
                Translation Keys
                <Badge color="slate">{MOCK_TRANSLATIONS.length}</Badge>
            </div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button
                        onClick={() => setLang("en")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            lang === "en"
                                ? "bg-indigo-600 text-white"
                                : "text-slate-400 hover:bg-slate-700"
                        }`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => setLang("fr")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            lang === "fr"
                                ? "bg-indigo-600 text-white"
                                : "text-slate-400 hover:bg-slate-700"
                        }`}
                    >
                        French
                    </button>
                </div>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
                {filteredTranslations.map((t) => (
                    <div
                        key={t.key}
                        className="p-4 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition duration-200 cursor-pointer"
                        onClick={() => handleTranslationClick(t)}
                    >
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-semibold uppercase text-indigo-400 tracking-wider">
                                {t.key}
                            </h4>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Zap size={12} /> {t.count} Uses
                            </span>
                        </div>
                        <p className="mt-2 text-white font-medium">{t[lang]}</p>
                    </div>
                ))}
                {filteredTranslations.length === 0 && (
                    <p className="text-center text-slate-500 py-10">
                        No translations match your search.
                    </p>
                )}
            </div>
        </div>
    );

    const renderComponentView = () => {
        // Only filter by translation if one is actually selected
        let componentsToShow = filteredComponents;
        if (selectedTranslation) {
            // Ensure selectedTranslation is not null before accessing components
            componentsToShow = componentsToShow.filter(
                (c) =>
                    selectedTranslation &&
                    selectedTranslation.components.includes(c.id),
            );
        }

        return (
            <div className="animate-in fade-in slide-in-from-bottom-4">
                {selectedTranslation ? (
                    <button
                        className="text-slate-400 hover:text-white mb-6 flex items-center gap-2"
                        onClick={() => {
                            setView("translations");
                            setSelectedTranslation(null);
                        }}
                    >
                        <ArrowLeft size={16} /> Back to Translations
                    </button>
                ) : (
                    <div className="h-6 mb-6"></div> // Spacer to prevent layout jump
                )}

                {selectedTranslation && (
                    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 mb-6 shadow-xl">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-white mb-1">
                                {selectedTranslation.key}
                            </h3>
                            <Badge color="indigo">
                                {selectedTranslation.count} Uses
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-400 italic">
                            {selectedTranslation[lang]}
                        </p>
                    </div>
                )}

                <div className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <Layout size={24} className="text-emerald-400" />
                    {selectedTranslation
                        ? "Components Using This Key"
                        : "All Components"}
                </div>

                <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto pr-2 custom-scrollbar">
                    {componentsToShow.map((c) => (
                        <div
                            key={c.id}
                            className="p-4 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition duration-200 cursor-pointer"
                            onClick={() => handleComponentClick(c.id)}
                        >
                            <div className="flex justify-between items-center">
                                <h4 className="text-base font-semibold text-white">
                                    {c.name}
                                </h4>
                                <Badge color="emerald">{c.category}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-slate-400 line-clamp-2">
                                {c.description}
                            </p>
                        </div>
                    ))}
                    {componentsToShow.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            <p>No components found.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderPreviewView = () => {
        if (!selectedComponent) return null;

        const Component = ComponentMocks[selectedComponentId];

        return (
            <div className="animate-in fade-in">
                <button
                    className="text-slate-400 hover:text-white mb-6 flex items-center gap-2"
                    onClick={() => setView("components")}
                >
                    <ArrowLeft size={16} /> Back to Components
                </button>

                <div className="flex justify-between items-center mb-4">
                    <div className="text-2xl font-bold text-white flex items-center gap-3">
                        <Code size={24} className="text-yellow-400" />
                        {selectedComponent.name}
                    </div>
                    <Badge color="emerald">{selectedComponent.category}</Badge>
                </div>
                <p className="text-sm text-slate-400 mb-6">
                    {selectedComponent.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                    {/* Controls Panel (NOW ON LEFT - md:col-span-1) */}
                    <div className="md:col-span-1 bg-slate-900 rounded-xl border border-slate-700 p-6 max-h-[calc(100vh-150px)] overflow-y-auto custom-scrollbar">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                            <Sliders size={20} className="text-slate-400" />
                            Props & Controls
                        </h3>

                        {/* Presets (NOW A DROPDOWN) */}
                        <div className="mb-6">
                            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                                Presets
                            </label>
                            <div className="relative">
                                <select
                                    // Ensure value defaults to the first preset name if activePreset is null/Custom
                                    value={
                                        activePreset === "Custom"
                                            ? activePreset
                                            : activePreset ||
                                              selectedComponent.presets[0].name
                                    }
                                    onChange={(e) =>
                                        applyPreset(e.target.value)
                                    }
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                                >
                                    {selectedComponent.presets.map((p) => (
                                        <option key={p.name} value={p.name}>
                                            {p.name}
                                        </option>
                                    ))}
                                    {/* Add Custom option to the list only if it's currently active (to display the label) */}
                                    {activePreset === "Custom" && (
                                        <option value="Custom" disabled>
                                            ✨ Custom Properties
                                        </option>
                                    )}
                                </select>
                                <ChevronRight
                                    size={16}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none"
                                />
                            </div>
                            {/* Custom State Indicator */}
                            {activePreset === "Custom" && (
                                <p className="mt-2 text-xs font-medium text-indigo-400 flex items-center gap-1 p-2 bg-slate-800/50 rounded-lg">
                                    <Zap
                                        size={12}
                                        className="text-yellow-500"
                                    />{" "}
                                    Custom props are currently active.
                                </p>
                            )}
                        </div>

                        {/* Dynamic Prop Inputs */}
                        {selectedComponent.propDefinitions.map((prop) => (
                            <PropInput
                                key={prop.name}
                                type={prop.type}
                                label={prop.label}
                                value={previewProps[prop.name]}
                                options={prop.options || []}
                                onChange={(newValue) =>
                                    handlePropChange(prop.name, newValue)
                                }
                            />
                        ))}
                    </div>

                    {/* Component Preview Panel (NOW ON RIGHT - md:col-span-2) */}
                    <div className="md:col-span-2 bg-slate-900 rounded-xl border border-slate-700 p-6 flex flex-col h-full">
                        <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">
                            Live Preview
                        </h3>
                        <div className="flex-grow flex items-center justify-center p-8 bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-700">
                            {Component ? (
                                <Component {...previewProps} />
                            ) : (
                                <p className="text-slate-500">
                                    Mock component not found.
                                </p>
                            )}
                        </div>

                        {/* Translation Context (If applicable) */}
                        {selectedTranslation && (
                            <div className="mt-6 p-4 bg-slate-800 rounded-lg">
                                <div className="text-xs font-semibold uppercase text-indigo-400 tracking-wider flex justify-between">
                                    Translation: {selectedTranslation.key}
                                    <span className="text-slate-500">
                                        ({lang})
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-white font-medium">
                                    {selectedTranslation[lang]}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // --- MAIN LAYOUT ---

    const renderContent = () => {
        switch (view) {
            case "translations":
                return renderTranslationView();
            case "components":
                return renderComponentView();
            case "preview":
                return renderPreviewView();
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans flex p-4 md:p-8">
            {/* Sidebar Navigation */}
            <nav className="hidden md:flex flex-col w-64 bg-slate-900 rounded-3xl p-4 shadow-2xl mr-8 flex-shrink-0">
                <h1 className="text-2xl font-black text-white mb-10 mt-2 flex items-center gap-2">
                    <Globe size={28} className="text-indigo-500" /> Design Lab
                </h1>

                <div className="flex-grow space-y-3">
                    <NavItem
                        icon={Languages}
                        label="Translations"
                        active={view === "translations"}
                        onClick={() => {
                            setView("translations");
                            setSelectedComponentId(null);
                            setSelectedTranslation(null);
                        }}
                        badge={MOCK_TRANSLATIONS.length}
                    />
                    <NavItem
                        icon={Layout}
                        label="Components"
                        active={view === "components" || view === "preview"}
                        onClick={() => {
                            setView("components");
                            setSelectedTranslation(null);
                        }} // Clear selection to show all
                        badge={MOCK_COMPONENTS.length}
                    />
                </div>

                <div className="mt-8 text-xs text-slate-600 border-t border-slate-800 pt-4">
                    <p>Mockup Environment</p>
                    <p>Version 1.0.0</p>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-grow bg-slate-900 rounded-3xl p-6 md:p-10 shadow-2xl">
                <div className="mb-8">
                    <div className="relative">
                        <Search
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <input
                            type="text"
                            placeholder="Search keys, components, or content..."
                            className="w-full bg-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border border-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {renderContent()}
            </main>

            {/* Custom Scrollbar Styling (for max-h-limited divs) */}
            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b; /* slate-800 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569; /* slate-600 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b; /* slate-500 */
        }
      `}</style>
        </div>
    );
}
