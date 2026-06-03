import { RefreshCw, Download, Wifi, WifiOff, Clock } from 'lucide-react';
import { ActiveSection, FilterState } from '../../types/hr';
import FilterBar from './FilterBar';

const sectionTitles: Record<ActiveSection, string> = {
  executive: 'Executive Summary',
  approved: 'Approved Workforce',
  workforce: 'Workforce Analytics',
  attrition: 'Attrition Analytics',
  advanced: 'Advanced Analytics',
  reports: 'Report Builder',
  confirmation: 'Confirmation Tracker',
  hdfc: 'HDFC Bank Account Tracker',
  hiring: 'Hiring Analytics',
  settings: 'Settings & Config',
};

interface HeaderProps {
  section: ActiveSection;
  lastSync: Date | null;
  isLiveMode: boolean;
  loading: boolean;
  onRefresh: () => void;
  filters: FilterState;
  onFilterChange: (f: FilterState) => void;
  stores: string[];
  locations: string[];
  designations: string[];
}

export default function Header({
  section, lastSync, isLiveMode, loading, onRefresh,
  filters, onFilterChange, stores, locations, designations
}: HeaderProps) {
  const showFilters = section !== 'settings';
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="sticky top-0 z-30 border-b border-[#e4d8bf] bg-[#fffdf7]/90 shadow-[0_10px_30px_rgba(62,44,23,0.06)] backdrop-blur-md">
      <div className="relative flex items-center justify-between px-9 py-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8bd6d] to-transparent" />
        <div>
          <h1 className="font-serif text-[2rem] font-bold tracking-tight text-[#1f160d]">{sectionTitles[section]}</h1>
          <div className="mt-2 flex items-center gap-3">
            {isLiveMode ? (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm">
                <Wifi size={13} className="text-emerald-700" /> Live Google Sheets
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full border border-[#d7bd6f] bg-[#fbf3d5] px-3 py-1 text-xs font-bold text-[#7a5b13] shadow-sm">
                <WifiOff size={13} className="text-amber-600" /> Demo Mode
              </span>
            )}
            {lastSync && (
              <span className="flex items-center gap-1.5 rounded-full border border-[#e6d9bd] bg-white px-3 py-1 text-xs font-semibold text-[#7a684b] shadow-sm">
                <Clock size={13} className="text-[#9d8240]" /> {lastSync.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-semibold text-[#8a7553] lg:inline">{today}</span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-[#c8a43d] bg-[#c8a43d] px-4 py-2 text-sm font-bold text-[#15110d] shadow-sm transition-all duration-200 hover:bg-[#b9932c] disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-[#e1d3b6] bg-white px-4 py-2 text-sm font-bold text-[#5d4b2d] shadow-sm transition-all duration-200 hover:bg-[#fbf6eb]"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {showFilters && (
        <FilterBar
          filters={filters}
          onFilterChange={onFilterChange}
          stores={stores}
          locations={locations}
          designations={designations}
        />
      )}
    </div>
  );
}
