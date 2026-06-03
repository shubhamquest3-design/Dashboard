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
    <div className="border-t border-[#eadfc8] bg-[#f7f1e7]">
      <div className="px-9 py-3 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#6d5520] hover:text-[#1f160d] transition-colors"
        >
          <SlidersHorizontal size={13} />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-[#15110d] px-1.5 py-0.5 text-xs font-bold text-[#f5d56b]">{activeCount}</span>
          )}
        </button>

        <SelectFilter label="Store" value={filters.store} options={stores} onChange={v => set('store', v)} />
        <SelectFilter label="Location" value={filters.location} options={locations} onChange={v => set('location', v)} />
        <SelectFilter label="Gender" value={filters.gender} options={['Male', 'Female']} onChange={v => set('gender', v)} />
        <SelectFilter label="Designation" value={filters.designation} options={designations} onChange={v => set('designation', v)} />
        <DateRangeFilter
          from={filters.dateFrom}
          to={filters.dateTo}
          onFromChange={value => set('dateFrom', value)}
          onToChange={value => set('dateTo', value)}
        />

        {expanded && (
          <>
            <SelectFilter label="Status" value={filters.status} options={['Active', 'Inactive', 'On Leave']} onChange={v => set('status', v)} />
            <SelectFilter label="Hiring Source" value={filters.hiringSource} options={HIRING_SOURCES} onChange={v => set('hiringSource', v)} />
            <SelectFilter label="Tenure" value={filters.tenure} options={TENURE_BUCKETS} onChange={v => set('tenure', v)} />
          </>
        )}

        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="ml-auto flex items-center gap-1 rounded-lg border border-[#e1d3b6] bg-[#fffdf8] px-3 py-1.5 text-xs font-bold text-[#9b332a] transition-colors hover:bg-[#fbf3d5]"
          >
            <X size={12} /> Clear All
          </button>
        )}
      </div>
    </div>
  );
}

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

function SelectFilter({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-[#c8a43d]
        ${value ? 'border-[#c8a43d] bg-[#fbf3d5] text-[#6d5520]' : 'border-[#e1d3b6] bg-[#fffdf8] text-[#6f6253]'}`}
    >
      <option value="">All {label}s</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
