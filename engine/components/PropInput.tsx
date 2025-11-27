import {
  Type,
  Hash,
  ToggleLeft,
  ToggleRight,
  Calendar,
  List,
  Braces,
  ChevronRight,
} from 'lucide-react';

interface PropInputProps {
  type: string;
  value: any;
  onChange: (newValue: any) => void;
  label: string;
  options?: string[];
}

export default function PropInput({ type, value, onChange, label, options }: PropInputProps) {
  const baseLabel = (
    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
      {label}
    </label>
  );
  const baseInputClass =
    'w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all';

  // Normalize TypeScript types to our input types
  let normalizedType = type.toLowerCase();

  // Handle TypeScript Date type and union types
  if (type === 'Date' || type.includes('Date |') || type.includes('| Date')) {
    normalizedType = 'date';
  }

  // Handle other TypeScript primitive types
  if (type === 'String') normalizedType = 'string';
  if (type === 'Number') normalizedType = 'number';
  if (type === 'Boolean') normalizedType = 'boolean';

  switch (normalizedType) {
    case 'string': {
      // Ensure value is treated as a string, defaulting to '' for null/undefined
      const stringValue = typeof value === 'string' ? value : '';
      return (
        <div className="mb-5">
          {baseLabel}
          <div className="relative">
            <Type size={14} className="absolute left-3 top-2.5 text-slate-600" />
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
    case 'number': {
      return (
        <div className="mb-5">
          {baseLabel}
          <div className="relative">
            <Hash size={14} className="absolute left-3 top-2.5 text-slate-600" />
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
    case 'boolean': {
      return (
        <div className="mb-5 flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700">
          <span className="text-sm font-medium text-slate-300">{label}</span>
          <button
            onClick={() => onChange(!value)}
            className={`transition-colors duration-200 ${value ? 'text-indigo-400' : 'text-slate-600'}`}
          >
            {value ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
          </button>
        </div>
      );
    }
    case 'date': {
      return (
        <div className="mb-5">
          {baseLabel}
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-2.5 text-slate-600" />
            <input
              type="date"
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              className={`${baseInputClass} pl-9`}
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>
      );
    }
    case 'datetime':
    case 'datetime-local': {
      return (
        <div className="mb-5">
          {baseLabel}
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-2.5 text-slate-600" />
            <input
              type="datetime-local"
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              className={`${baseInputClass} pl-9`}
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>
      );
    }
    case 'enum': {
      return (
        <div className="mb-5">
          {baseLabel}
          <div className="relative">
            <List size={14} className="absolute left-3 top-2.5 text-slate-600" />
            <select
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              className={`${baseInputClass} pl-9 appearance-none`}
            >
              {options?.map((opt) => (
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
    case 'object':
    case 'array': {
      return (
        <div className="mb-5">
          {baseLabel}
          <div className="relative">
            <Braces size={14} className="absolute left-3 top-3 text-slate-600" />
            <textarea
              value={
                typeof value === 'object' && value !== null
                  ? JSON.stringify(value, null, 2)
                  : value || ''
              }
              onChange={(e) => {
                try {
                  onChange(JSON.parse(e.target.value));
                } catch (err) {
                  // Allow typing invalid JSON, just don't update state yet
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
      // For any unknown types, just show as a text input
      return (
        <div className="mb-5">
          {baseLabel}
          <div className="relative">
            <Type size={14} className="absolute left-3 top-2.5 text-slate-600" />
            <input
              type="text"
              value={typeof value === 'string' ? value : String(value || '')}
              onChange={(e) => onChange(e.target.value)}
              className={`${baseInputClass} pl-9`}
              placeholder={`${type} (unsupported type)`}
            />
          </div>
        </div>
      );
  }
}
