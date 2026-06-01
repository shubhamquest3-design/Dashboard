import { FilterState } from '../../types/hr';
import { X, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

const HIRING_SOURCES = ['Employee Referral', 'Talent Acquisition', 'HRBP', 'Walk-in', 'Consultant'];
const TENURE_BUCKETS = ['0-3 Months', '3-6 Months', '6-12 Months', '1-2 Years', '2+ Years'];

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (f: FilterState) => void;
  stores: string[];
  locations: string[];
  designations: string[];
}

export default function FilterBar({ filters, onFilterChange, stores, locations, designations }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const set = (key: keyof FilterState, val: string) => onFilterChange({ ...filters, [key]: val });

  const activeCount = Object.values(filters).filter(v => v !== '').length;

  const clearAll = () => onFilterChange({
    store: '', location: '', gender: '', designation: '',
    status: '', hiringSource: '', tenure: '', dateFrom: '', dateTo: '',
  });

  return (
    <div className="border-t border-gray-100 bg-gray-50">
      <div className="px-6 py-2 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <SlidersHorizontal size={13} />
          Filters
          {activeCount > 0 && (
            <span className="bg-blue-600 text-white rounded-full text-xs px-1.5 py-0.5 font-bold">{activeCount}</span>
          )}
        </button>

        <SelectFilter label="Store" value={filters.store} options={stores} onChange={v => set('store', v)} />
        <SelectFilter label="Location" value={filters.location} options={locations} onChange={v => set('location', v)} />
        <SelectFilter label="Gender" value={filters.gender} options={['Male', 'Female']} onChange={v => set('gender', v)} />
        <SelectFilter label="Designation" value={filters.designation} options={designations} onChange={v => set('designation', v)} />

        {expanded && (
          <>
            <SelectFilter label="Status" value={filters.status} options={['Active', 'Inactive', 'On Leave']} onChange={v => set('status', v)} />
            <SelectFilter label="Hiring Source" value={filters.hiringSource} options={HIRING_SOURCES} onChange={v => set('hiringSource', v)} />
            <SelectFilter label="Tenure" value={filters.tenure} options={TENURE_BUCKETS} onChange={v => set('tenure', v)} />
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500 font-medium">DOJ From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e => set('dateFrom', e.target.value)}
                className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <label className="text-xs text-gray-500 font-medium">To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e => set('dateTo', e.target.value)}
                className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </>
        )}

        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors ml-auto"
          >
            <X size={12} /> Clear All
          </button>
        )}
      </div>
    </div>
  );
}

function SelectFilter({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`text-xs border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors
        ${value ? 'border-blue-400 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 bg-white text-gray-600'}`}
    >
      <option value="">All {label}s</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
