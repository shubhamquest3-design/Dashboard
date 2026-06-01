import { RefreshCw, Download, Wifi, WifiOff, Clock } from 'lucide-react';
import { ActiveSection } from '../../types/hr';
import FilterBar from './FilterBar';
import { FilterState } from '../../types/hr';

const sectionTitles: Record<ActiveSection, string> = {
  executive: 'Executive Summary',
  workforce: 'Workforce Analytics',
  attrition: 'Attrition Analytics',
  advanced: 'Advanced Analytics & Insights',
  reports: 'Custom Report Builder',
  confirmation: 'Confirmation Tracker',
  hdfc: 'HDFC Bank Account Tracker',
  hiring: 'Hiring Source Analytics',
  settings: 'Settings & Configuration',
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

  return (
    <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-30 backdrop-blur-sm bg-white/95">
      <div className="flex items-center justify-between px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{sectionTitles[section]}</h1>
          <div className="flex items-center gap-3 mt-1">
            {isLiveMode ? (
              <span className="flex items-center gap-1.5 text-sm text-emerald-700 font-semibold px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <Wifi size={13} className="text-emerald-600" /> Live — Google Sheets
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-amber-700 font-semibold px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
                <WifiOff size={13} className="text-amber-600" /> Demo Mode
              </span>
            )}
            {lastSync && (
              <span className="flex items-center gap-1.5 text-sm text-gray-700 font-medium px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                <Clock size={13} className="text-gray-500" /> {lastSync.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 disabled:opacity-50 border border-gray-200"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
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
