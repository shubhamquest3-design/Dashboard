import { RefreshCw, Download, Wifi, WifiOff, Clock } from 'lucide-react';
<<<<<<< HEAD
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
=======
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
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
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
<<<<<<< HEAD
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
=======

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
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
                <WifiOff size={13} className="text-amber-600" /> Demo Mode
              </span>
            )}
            {lastSync && (
<<<<<<< HEAD
              <span className="flex items-center gap-1.5 rounded-full border border-[#e6d9bd] bg-white px-3 py-1 text-xs font-semibold text-[#7a684b] shadow-sm">
                <Clock size={13} className="text-[#9d8240]" /> {lastSync.toLocaleTimeString()}
=======
              <span className="flex items-center gap-1.5 text-sm text-gray-700 font-medium px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                <Clock size={13} className="text-gray-500" /> {lastSync.toLocaleTimeString()}
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
<<<<<<< HEAD
          <span className="hidden text-sm font-semibold text-[#8a7553] lg:inline">{today}</span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-[#c8a43d] bg-[#c8a43d] px-4 py-2 text-sm font-bold text-[#15110d] shadow-sm transition-all duration-200 hover:bg-[#b9932c] disabled:opacity-50"
=======
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 disabled:opacity-50 border border-gray-200"
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => window.print()}
<<<<<<< HEAD
            className="flex items-center gap-1.5 rounded-xl border border-[#e1d3b6] bg-white px-4 py-2 text-sm font-bold text-[#5d4b2d] shadow-sm transition-all duration-200 hover:bg-[#fbf6eb]"
=======
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
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
