import { useState, useEffect, useCallback, useRef } from 'react';
import { ApprovedWorkforce, Employee, ExitEmployee, FilterState, SheetConfig, StoreDetail } from '../types/hr';
import {
  fetchSheetData,
  loadSheetConfig,
  parseApprovedWorkforceFromSheet,
  parseEmployeesFromSheet,
  parseExitsFromSheet,
  parseStoreDetailsFromEmployeeSheet,
} from '../lib/googleSheets';

interface HRDataState {
  employees: Employee[];
  exits: ExitEmployee[];
  approvedWorkforce: ApprovedWorkforce[];
  storeDetails: StoreDetail[];
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
  isLiveMode: boolean;
}

export function useHRData(filters: FilterState, sheetConfig: SheetConfig | null, refreshInterval = 60000) {
  const [state, setState] = useState<HRDataState>({
    employees: [],
    exits: [],
    approvedWorkforce: [],
    storeDetails: [],
    loading: true,
    error: null,
    lastSync: null,
    isLiveMode: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const config = sheetConfig || loadSheetConfig();

    if (config?.spreadsheetId && config?.apiKey) {
      try {
        const [empRows, exitRows, approvedRows] = await Promise.all([
          fetchSheetData(config, config.employeeSheetName || 'employee'),
          fetchSheetData(config, config.exitSheetName || 'exit'),
          fetchSheetData(config, config.approvedWorkforceSheetName || 'approved workforce').catch(() => []),
        ]);
        setState({
          employees: parseEmployeesFromSheet(empRows),
          exits: parseExitsFromSheet(exitRows),
          approvedWorkforce: parseApprovedWorkforceFromSheet(approvedRows),
          storeDetails: parseStoreDetailsFromEmployeeSheet(empRows),
          loading: false,
          error: null,
          lastSync: new Date(),
          isLiveMode: true,
        });
      } catch (err) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: `Google Sheets sync failed: ${err instanceof Error ? err.message : 'Unknown error'}.`,
          employees: [],
          exits: [],
          approvedWorkforce: [],
          storeDetails: [],
          lastSync: new Date(),
          isLiveMode: false,
        }));
      }
    } else {
      setState({
        employees: [],
        exits: [],
        approvedWorkforce: [],
        storeDetails: [],
        loading: false,
        error: 'Google Sheets is not configured. Add your spreadsheet settings to load HR data.',
        lastSync: null,
        isLiveMode: false,
      });
    }
  }, [sheetConfig]);

  useEffect(() => {
    loadData();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(loadData, refreshInterval);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    window.addEventListener('focus', loadData);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('focus', loadData);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadData, refreshInterval]);

  const filteredEmployees = state.employees.filter(emp => {
    if (filters.store && emp.store !== filters.store) return false;
    if (filters.location && emp.location !== filters.location) return false;
    if (filters.gender && emp.gender !== filters.gender) return false;
    if (filters.designation && emp.designation !== filters.designation) return false;
    if (filters.status && emp.status !== filters.status) return false;
    if (filters.hiringSource && emp.hiringSource !== filters.hiringSource) return false;
    if (filters.tenure && emp.tenure !== filters.tenure) return false;
    if (filters.dateFrom && emp.doj < filters.dateFrom) return false;
    if (filters.dateTo && emp.doj > filters.dateTo) return false;
    return true;
  });

  const filteredExits = state.exits.filter(exit => {
    if (filters.store && exit.store !== filters.store) return false;
    if (filters.location && exit.location !== filters.location) return false;
    if (filters.designation && exit.designation !== filters.designation) return false;
    if (filters.dateFrom && exit.dol < filters.dateFrom) return false;
    if (filters.dateTo && exit.doj > filters.dateTo) return false;
    return true;
  });

  const filteredStoreDetails = state.storeDetails.filter(detail => {
    if (filters.store && detail.store !== filters.store) return false;
    if (filters.location && detail.location !== filters.location) return false;
    return true;
  });

  return {
    ...state,
    filteredEmployees,
    filteredExits,
    filteredStoreDetails,
    refresh: loadData,
  };
}
