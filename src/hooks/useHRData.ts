import { useState, useEffect, useCallback, useRef } from 'react';
import { Employee, ExitEmployee, FilterState, SheetConfig } from '../types/hr';
import { fetchSheetData, parseEmployeesFromSheet, parseExitsFromSheet, loadSheetConfig } from '../lib/googleSheets';

interface HRDataState {
  employees: Employee[];
  exits: ExitEmployee[];
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
  isLiveMode: boolean;
}

export function useHRData(filters: FilterState, sheetConfig: SheetConfig | null, refreshInterval = 60000) {
  const [state, setState] = useState<HRDataState>({
    employees: [],
    exits: [],
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
        const [empRows, exitRows] = await Promise.all([
          fetchSheetData(config, config.employeeSheetName || 'Employees'),
          fetchSheetData(config, config.exitSheetName || 'Exit'),
        ]);
        setState({
          employees: parseEmployeesFromSheet(empRows),
          exits: parseExitsFromSheet(exitRows),
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
          lastSync: new Date(),
          isLiveMode: false,
        }));
      }
    } else {
      setState({
        employees: [],
        exits: [],
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

  return {
    ...state,
    filteredEmployees,
    filteredExits,
    refresh: loadData,
  };
}
