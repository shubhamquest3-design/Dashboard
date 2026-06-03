import { useState, useMemo } from 'react';
import { ActiveSection, FilterState, SheetConfig } from './types/hr';
import { useHRData } from './hooks/useHRData';
import { loadSheetConfig } from './lib/googleSheets';
import { STORES, LOCATIONS, DESIGNATIONS } from './data/mockData';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ExecutiveSummary from './components/sections/ExecutiveSummary';
import ApprovedWorkforce from './components/sections/ApprovedWorkforce';
import WorkforceAnalytics from './components/sections/WorkforceAnalytics';
import AttritionAnalytics from './components/sections/AttritionAnalytics';
import AdvancedAnalytics from './components/sections/AdvancedAnalytics';
import ReportBuilder from './components/sections/ReportBuilder';
import ConfirmationTracker from './components/sections/ConfirmationTracker';
import HDFCTracker from './components/sections/HDFCTracker';
import HiringAnalytics from './components/sections/HiringAnalytics';
import SettingsPanel from './components/sections/SettingsPanel';

const DEFAULT_FILTERS: FilterState = {
  store: '', location: '', gender: '', designation: '',
  status: '', hiringSource: '', tenure: '', dateFrom: '', dateTo: '',
};

export default function App() {
  const [section, setSection] = useState<ActiveSection>('executive');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sheetConfig, setSheetConfig] = useState<SheetConfig | null>(loadSheetConfig);

  const { filteredEmployees, filteredExits, loading, error, lastSync, isLiveMode, refresh } = useHRData(
    filters, sheetConfig
  );

  const pendingConfirmations = useMemo(
    () => filteredEmployees.filter(e => e.confirmationStatus === 'Pending' || e.confirmationStatus === 'Overdue').length,
    [filteredEmployees]
  );

  const hdfcPending = useMemo(
    () => filteredEmployees.filter(e => e.hdfcAccount === 'No').length,
    [filteredEmployees]
  );

  // Dedupe stores/locations from actual data
  const availableStores = useMemo(
    () => [...new Set(filteredEmployees.map(e => e.store))].sort(),
    [filteredEmployees]
  );
  const availableLocations = useMemo(
    () => [...new Set(filteredEmployees.map(e => e.location))].sort(),
    [filteredEmployees]
  );
  const availableDesignations = useMemo(
    () => [...new Set(filteredEmployees.map(e => e.designation))].sort(),
    [filteredEmployees]
  );

  return (
    <div className="flex h-screen bg-[#f4efe6] overflow-hidden">
      <Sidebar
        active={section}
        onNav={setSection}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        pendingConfirmations={pendingConfirmations}
        hdfcPending={hdfcPending}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          section={section}
          lastSync={lastSync}
          isLiveMode={isLiveMode}
          loading={loading}
          onRefresh={refresh}
          filters={filters}
          onFilterChange={setFilters}
          stores={availableStores.length > 0 ? availableStores : STORES}
          locations={availableLocations.length > 0 ? availableLocations : LOCATIONS}
          designations={availableDesignations.length > 0 ? availableDesignations : DESIGNATIONS}
        />

        {/* Error toast */}
        {error && (
          <div className="mx-6 mt-3 px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#eadfc8] border-t-[#c8a43d] rounded-full animate-spin" />
              <p className="text-sm font-medium text-[#8a7553]">Loading HR data...</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <main className="flex-1 overflow-y-auto p-6 bg-[#f4efe6]">
            {section === 'executive' && (
              <ExecutiveSummary employees={filteredEmployees} exits={filteredExits} />
            )}
            {section === 'approved' && (
              <ApprovedWorkforce employees={filteredEmployees} />
            )}
            {section === 'workforce' && (
              <WorkforceAnalytics employees={filteredEmployees} exits={filteredExits} />
            )}
            {section === 'attrition' && (
              <AttritionAnalytics employees={filteredEmployees} exits={filteredExits} />
            )}
            {section === 'advanced' && (
              <AdvancedAnalytics employees={filteredEmployees} exits={filteredExits} />
            )}
            {section === 'reports' && (
              <ReportBuilder employees={filteredEmployees} exits={filteredExits} />
            )}
            {section === 'confirmation' && (
              <ConfirmationTracker employees={filteredEmployees} />
            )}
            {section === 'hdfc' && (
              <HDFCTracker employees={filteredEmployees} />
            )}
            {section === 'hiring' && (
              <HiringAnalytics employees={filteredEmployees} exits={filteredExits} />
            )}
            {section === 'settings' && (
              <SettingsPanel
                config={sheetConfig}
                onConfigSave={cfg => { setSheetConfig(cfg); refresh(); }}
                isLiveMode={isLiveMode}
              />
            )}
          </main>
        )}
      </div>
    </div>
  );
}
