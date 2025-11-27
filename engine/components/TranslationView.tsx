import { Hash, ChevronRight } from 'lucide-react';
import { useAppContext } from './ContextProvider';

interface TranslationViewProps {
  onSelectTranslation: () => void;
}

export default function TranslationView({ onSelectTranslation }: TranslationViewProps) {
  const { contextApp, selectedTranslation, setSelectedTranslation } = useAppContext();

  if (!contextApp) return null;

  const translations = Object.keys(contextApp.translations).sort();

  const handleTranslationClick = (key: string) => {
    setSelectedTranslation(selectedTranslation === key ? null : key);
    if (selectedTranslation !== key) {
      onSelectTranslation();
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Translation Map</h2>
          <p className="text-slate-400">Manage localization keys and trace their usage across components.</p>
        </div>
        <div className="bg-slate-800 p-1 rounded-lg flex text-xs font-medium">
          <span className="px-3 py-1 bg-indigo-600 rounded text-white shadow">All Keys</span>
          <span className="px-3 py-1 text-slate-400 hover:text-white cursor-pointer transition-colors">Missing</span>
          <span className="px-3 py-1 text-slate-400 hover:text-white cursor-pointer transition-colors">Deprecated</span>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700">
            <tr>
              <th className="p-4 font-medium">Key ID</th>
              <th className="p-4 font-medium text-center">Used In</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {translations.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-400">
                  No translations found
                </td>
              </tr>
            ) : (
              translations.map((key) => {
                const componentIds = contextApp.translations[key];
                const isSelected = selectedTranslation === key;

                return (
                  <tr
                    key={key}
                    className="group hover:bg-slate-700/30 transition-colors cursor-pointer"
                    onClick={() => handleTranslationClick(key)}
                  >
                    <td className="p-4 font-mono text-indigo-400 font-medium group-hover:text-indigo-300">
                      <div className="flex items-center gap-2">
                        <Hash size={14} className="opacity-50" />
                        {key}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700">
                        {componentIds.length}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        className={`p-2 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'hover:bg-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
