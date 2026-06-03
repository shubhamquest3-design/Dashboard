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
<<<<<<< HEAD
    <div className="border-t border-[#eadfc8] bg-[#f7f1e7]">
      <div className="px-9 py-3 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#6d5520] hover:text-[#1f160d] transition-colors"
=======
    <div className="border-t border-gray-100 bg-gray-50">
      <div className="px-6 py-2 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
        >
          <SlidersHorizontal size={13} />
          Filters
          {activeCount > 0 && (
<<<<<<< HEAD
            <span className="rounded-full bg-[#15110d] px-1.5 py-0.5 text-xs font-bold text-[#f5d56b]">{activeCount}</span>
=======
            <span className="bg-blue-600 text-white rounded-full text-xs px-1.5 py-0.5 font-bold">{activeCount}</span>
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
          )}
        </button>

        <SelectFilter label="Store" value={filters.store} options={stores} onChange={v => set('store', v)} />
        <SelectFilter label="Location" value={filters.location} options={locations} onChange={v => set('location', v)} />
        <SelectFilter label="Gender" value={filters.gender} options={['Male', 'Female']} onChange={v => set('gender', v)} />
        <SelectFilter label="Designation" value={filters.designation} options={designations} onChange={v => set('designation', v)} />
<<<<<<< HEAD
        <DateRangeFilter
          from={filters.dateFrom}
          to={filters.dateTo}
          onFromChange={value => set('dateFrom', value)}
          onToChange={value => set('dateTo', value)}
        />
=======
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc

        {expanded && (
          <>
            <SelectFilter label="Status" value={filters.status} options={['Active', 'Inactive', 'On Leave']} onChange={v => set('status', v)} />
            <SelectFilter label="Hiring Source" value={filters.hiringSource} options={HIRING_SOURCES} onChange={v => set('hiringSource', v)} />
            <SelectFilter label="Tenure" value={filters.tenure} options={TENURE_BUCKETS} onChange={v => set('tenure', v)} />
<<<<<<< HEAD
=======
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
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
          </>
        )}

        {activeCount > 0 && (
          <button
            onClick={clearAll}
<<<<<<< HEAD
            className="ml-auto flex items-center gap-1 rounded-lg border border-[#e1d3b6] bg-[#fffdf8] px-3 py-1.5 text-xs font-bold text-[#9b332a] transition-colors hover:bg-[#fbf3d5]"
=======
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors ml-auto"
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
          >
            <X size={12} /> Clear All
          </button>
        )}
      </div>
    </div>
  );
}

<<<<<<< HEAD
function DateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
}: {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <label className="text-xs font-semibold text-[#7a684b]">From</label>
      <input
        type="date"
        value={from}
        onChange={e => onFromChange(e.target.value)}
        className="rounded-lg border border-[#e1d3b6] bg-[#fffdf8] px-2 py-1 text-xs text-[#4f3d24] focus:outline-none focus:ring-1 focus:ring-[#c8a43d]"
      />
      <label className="text-xs font-semibold text-[#7a684b]">To</label>
      <input
        type="date"
        value={to}
        onChange={e => onToChange(e.target.value)}
        className="rounded-lg border border-[#e1d3b6] bg-[#fffdf8] px-2 py-1 text-xs text-[#4f3d24] focus:outline-none focus:ring-1 focus:ring-[#c8a43d]"
      />
    </div>
  );
}

=======
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
function SelectFilter({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
<<<<<<< HEAD
      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-[#c8a43d]
        ${value ? 'border-[#c8a43d] bg-[#fbf3d5] text-[#6d5520]' : 'border-[#e1d3b6] bg-[#fffdf8] text-[#6f6253]'}`}
=======
      className={`text-xs border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors
        ${value ? 'border-blue-400 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 bg-white text-gray-600'}`}
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
    >
      <option value="">All {label}s</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
