import { Employee, ExitEmployee, SheetConfig } from '../types/hr';

const SHEET_CONFIG_KEY = 'hr_sheet_config';

export function saveSheetConfig(config: SheetConfig): void {
  localStorage.setItem(SHEET_CONFIG_KEY, JSON.stringify(config));
}

export function loadSheetConfig(): SheetConfig | null {
  const stored = localStorage.getItem(SHEET_CONFIG_KEY);
  return stored ? JSON.parse(stored) : null;
}

export async function fetchSheetData(config: SheetConfig, sheetName: string): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${encodeURIComponent(sheetName)}?key=${config.apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Sheets API error: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return json.values || [];
}

export function parseEmployeesFromSheet(rows: string[][]): Employee[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return rows.slice(1).map((row, idx) => {
    const get = (key: string) => row[headers.indexOf(key)] ?? '';
    const doj = get('doj') || get('date_of_joining') || '';
    const confirmationDue = doj ? addDays(doj, 60) : '';
    const today = new Date();
    const dueDate = confirmationDue ? new Date(confirmationDue) : null;
    const rawStatus = get('confirmation_status').toLowerCase();
    let confirmationStatus: Employee['confirmationStatus'] = 'Pending';
    if (rawStatus === 'confirmed') confirmationStatus = 'Confirmed';
    else if (dueDate && dueDate < today) confirmationStatus = 'Overdue';

    return {
      id: get('employee_id') || `EMP${String(idx + 1).padStart(4, '0')}`,
      name: get('employee_name') || get('name') || '',
      gender: (get('gender') as Employee['gender']) || 'Male',
      doj,
      designation: get('designation') || '',
      department: get('department') || '',
      store: get('store_name') || get('store') || '',
      location: get('location') || get('city') || '',
      status: (get('employment_status') || get('status') || 'Active') as Employee['status'],
      tenure: get('tenure') || '',
      reportingManager: get('reporting_manager') || '',
      hiringSource: (get('hiring_source') as Employee['hiringSource']) || 'Walk-in',
      age: parseInt(get('age')) || undefined,
      hdfcAccount: (get('hdfc_account') || get('hdfc_account_status') || 'No') as Employee['hdfcAccount'],
      hrbpName: get('hrbp_name') || get('hrbp') || '',
      confirmationStatus,
      confirmationDueDate: confirmationDue,
    };
  }).filter(e => e.name);
}

export function parseExitsFromSheet(rows: string[][]): ExitEmployee[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return rows.slice(1).map((row, idx) => {
    const get = (key: string) => row[headers.indexOf(key)] ?? '';
    const doj = get('doj') || get('date_of_joining') || '';
    const dol = get('dol') || get('date_of_leaving') || '';
    const tenureMonths = doj && dol
      ? Math.round((new Date(dol).getTime() - new Date(doj).getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 0;
    return {
      id: get('employee_id') || `EXT${String(idx + 1).padStart(4, '0')}`,
      name: get('employee_name') || get('name') || '',
      doj,
      dol,
      exitReason: get('exit_reason') || '',
      exitType: (get('voluntary_/_non-voluntary') || get('exit_type') || 'Voluntary') as ExitEmployee['exitType'],
      store: get('store_name') || get('store') || '',
      location: get('location') || '',
      designation: get('designation') || '',
      tenureAtExit: parseInt(get('tenure_at_exit')) || tenureMonths,
    };
  }).filter(e => e.name);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function getTenureBucket(doj: string): string {
  const months = (Date.now() - new Date(doj).getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (months < 3) return '0-3 Months';
  if (months < 6) return '3-6 Months';
  if (months < 12) return '6-12 Months';
  if (months < 24) return '1-2 Years';
  return '2+ Years';
}
