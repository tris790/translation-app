import { useState } from "react";
import { Globe, Box, Layout } from 'lucide-react';
import { useAppContext } from "./ContextProvider";
import TranslationView from "./TranslationView";
import ComponentsView from "./ComponentsView";
import PreviewView from "./PreviewView";

// Helper component for navigation items
const NavItem = ({ icon: Icon, label, active, onClick, badge }: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
      active
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className={active ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
      <span className="font-medium text-sm">{label}</span>
    </div>
    {badge && (
      <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
        {badge}
      </span>
    )}
  </button>
);

type View = 'translations' | 'components' | 'preview';

export default function Shell() {
  const [view, setView] = useState<View>('translations');
  const { contextApp, loading, error } = useAppContext();

  // Count translations and components
  const translationCount = contextApp ? Object.keys(contextApp.translations).length : 0;
  const componentCount = contextApp ? Object.keys(contextApp.components).length : 0;

  return (
    <div className="flex h-screen w-full bg-[#0a0c10] text-slate-300 font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <div className="w-20 lg:w-64 border-r border-slate-800 flex flex-col bg-slate-950 p-4">
        <div className="flex items-center gap-3 px-2 mb-10 mt-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Layout size={18} />
          </div>
          <span className="font-bold text-lg text-white hidden lg:block tracking-tight">
            Context<span className="text-indigo-500">Engine</span>
          </span>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem
            icon={Globe}
            label="Translations"
            active={view === 'translations'}
            onClick={() => setView('translations')}
            badge={translationCount > 0 ? String(translationCount) : undefined}
          />
          <NavItem
            icon={Box}
            label="Components"
            active={view === 'components'}
            onClick={() => setView('components')}
            badge={componentCount > 0 ? String(componentCount) : undefined}
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 hidden lg:block">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"></div>
            <div>
              <div className="text-sm font-medium text-white">Context Viewer</div>
              <div className="text-xs text-slate-500">v1.0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Gradient Line */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-50" />

        <div className="flex-1 overflow-auto p-0">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-indigo-500 mb-4"></div>
                <p className="text-slate-400">Loading context...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="bg-rose-900/20 border border-rose-500/30 p-6 rounded-xl max-w-md">
                <h3 className="text-rose-400 font-bold text-lg mb-2">Error Loading Context</h3>
                <p className="text-slate-300">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {view === 'translations' && (
                <div className="p-8 max-w-6xl mx-auto">
                  <TranslationView onSelectTranslation={() => setView('components')} />
                </div>
              )}
              {view === 'components' && (
                <div className="p-8 max-w-7xl mx-auto">
                  <ComponentsView onSelectComponent={() => setView('preview')} />
                </div>
              )}
              {view === 'preview' && <PreviewView onBack={() => setView('components')} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
