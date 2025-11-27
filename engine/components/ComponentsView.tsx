import { Search, Code, Globe, Box } from 'lucide-react';
import { useAppContext } from './ContextProvider';
import { Component } from '../Types';

// Simple badge component
const Badge = ({ children, color = 'slate' }: { children: React.ReactNode; color?: string }) => {
  const colors: Record<string, string> = {
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
    indigo: 'bg-indigo-900/30 text-indigo-300 border-indigo-800',
    emerald: 'bg-emerald-900/30 text-emerald-300 border-emerald-800',
    rose: 'bg-rose-900/30 text-rose-300 border-rose-800',
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
};

interface ComponentsViewProps {
  onSelectComponent: () => void;
}

export default function ComponentsView({ onSelectComponent }: ComponentsViewProps) {
  const { contextApp, selectedTranslation, setSelectedTranslation, setSelectedComponentId, getFilteredComponents } = useAppContext();

  if (!contextApp) return null;

  const displayedComponents = getFilteredComponents();

  const handleComponentClick = (component: Component) => {
    setSelectedComponentId(component.id);
    onSelectComponent();
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {selectedTranslation && (
        <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
              <Globe size={20} />
            </div>
            <div>
              <p className="text-xs text-indigo-300 font-bold uppercase tracking-wide">Filtered by Translation</p>
              <p className="text-white font-mono text-sm">{selectedTranslation}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedTranslation(null)}
            className="text-xs text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
          >
            Clear Filter
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Components</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search components..."
            className="bg-slate-800 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 w-64 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedComponents.map((component) => {
          // Determine category based on component hierarchy
          const category = component.parentIds.length === 0 ? 'Page' :
                          component.childrenIds.length === 0 ? 'Atom' : 'Molecule';

          return (
            <div
              key={component.id}
              onClick={() => handleComponentClick(component)}
              className="group bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-900/20 transition-all cursor-pointer flex flex-col h-64"
            >
              {/* Component Thumbnail */}
              <div className="h-32 bg-slate-900/50 border-b border-slate-700 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-transparent" />
                <div className="w-16 h-16 rounded-lg bg-slate-700/50 group-hover:bg-indigo-600/20 group-hover:scale-110 transition-all duration-500 border border-slate-600 group-hover:border-indigo-500/50 flex items-center justify-center">
                  <Code size={24} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors truncate">
                      {component.name}
                    </h3>
                    <Badge color={category === 'Page' ? 'rose' : category === 'Molecule' ? 'indigo' : 'emerald'}>
                      {category}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-xs line-clamp-2 font-mono">{component.path}</p>
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Code size={12} />
                    {component.props.length} Props
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe size={12} />
                    {component.translations.length} i18n
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {displayedComponents.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-700 rounded-xl">
            <Box className="mx-auto h-12 w-12 text-slate-600 mb-4" />
            <p className="text-slate-400">
              {selectedTranslation
                ? 'No components found matching this translation key.'
                : 'No components found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
