import { ApprovedWorkforce, Employee, ExitEmployee, SheetConfig, StoreDetail } from '../types/hr';

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
  const headers = rows[0].map(normalizeHeader);
  return rows.slice(1).map((row, idx) => {
    const getAny = (keys: readonly string[]) => getByHeader(row, headers, keys);
    const doj = getAny(['doj', 'date_of_joining', 'joining_date']);
    const confirmationDue = doj ? addDays(doj, 60) : '';
    const today = new Date();
    const dueDate = confirmationDue ? new Date(confirmationDue) : null;
    const rawStatus = getAny(['confirmation_status', 'confirmation']).toLowerCase();
    let confirmationStatus: Employee['confirmationStatus'] = 'Pending';
    if (rawStatus === 'confirmed') confirmationStatus = 'Confirmed';
    else if (dueDate && dueDate < today) confirmationStatus = 'Overdue';

    const hdfcRaw = getAny(['hdfc_account', 'hdfc_account_status', 'hdfc_status']);
    const hdfcAccount = normalizeHdfcStatus(hdfcRaw);

    return {
      id: getAny(['employee_id', 'emp_id', 'id']) || `EMP${String(idx + 1).padStart(4, '0')}`,
      name: getAny(['employee_name', 'name']) || '',
      gender: (getAny(['gender']) as Employee['gender']) || 'Male',
      doj,
      designation: getAny(['designation', 'role', 'position']) || '',
      department: getAny(['department']) || '',
      store: getAny(STORE_HEADERS) || '',
      location: getAny(LOCATION_HEADERS) || '',
      status: normalizeEmploymentStatus(getAny(['employment_status', 'status'])),
      tenure: getAny(['tenure']) || '',
      reportingManager: getAny(['reporting_manager', 'manager']) || '',
      hiringSource: (getAny(['hiring_source', 'source']) as Employee['hiringSource']) || 'Walk-in',
      age: parseInt(getAny(['age'])) || undefined,
      hdfcAccount,
      hrbpName: getAny(['hrbp_name', 'hrbp']) || '',
      confirmationStatus,
      confirmationDueDate: confirmationDue,
    };
  }).filter(e => e.name);
}

export function parseStoreDetailsFromEmployeeSheet(rows: string[][]): StoreDetail[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(normalizeHeader);

  return rows.slice(1).reduce<StoreDetail[]>((details, row) => {
    const getAny = (keys: readonly string[]) => getByHeader(row, headers, keys);
    const name = getAny(['employee_name', 'name']);
    const rowType = normalizeHeader(getAny(['row_type', 'type', 'record_type', 'details_type']));
    const store = getAny(STORE_HEADERS);
    const location = getAny(LOCATION_HEADERS);
    const status = normalizeStoreStatus(getAny(['store_status', 'store_type', 'store_details', 'store_category', 'status']));

    if (!store) return details;
    if (name && !rowType.includes('store')) return details;
    if (!status && !rowType.includes('store')) return details;

    details.push({
      store,
      location,
      status: status || 'Existing',
      notes: getAny(['notes', 'remarks', 'remark']),
    });
    return details;
  }, []);
}

export function parseExitsFromSheet(rows: string[][]): ExitEmployee[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(normalizeHeader);
  return rows.slice(1).map((row, idx) => {
    const getAny = (keys: readonly string[]) => getByHeader(row, headers, keys);
    const doj = getAny(['doj', 'date_of_joining', 'joining_date']);
    const dol = getAny(['dol', 'date_of_leaving', 'leaving_date']);
    const parsedDoj = parseFlexibleDate(doj);
    const parsedDol = parseFlexibleDate(dol);
    const tenureMonths = parsedDoj && parsedDol
      ? Math.round((parsedDol.getTime() - parsedDoj.getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 0;
    return {
      id: getAny(['employee_id', 'emp_id', 'id']) || `EXT${String(idx + 1).padStart(4, '0')}`,
      name: getAny(['employee_name', 'name']) || '',
      doj,
      dol,
      exitReason: getAny(['exit_reason', 'reason']) || '',
      exitType: (getAny(['voluntary_nonvoluntary', 'voluntary_/_non-voluntary', 'exit_type']) || 'Voluntary') as ExitEmployee['exitType'],
      store: getAny(STORE_HEADERS) || '',
      location: getAny(LOCATION_HEADERS) || '',
      designation: getAny(['designation', 'role', 'position']) || '',
      gender: normalizeGender(getAny(['gender', 'sex'])),
      tenureAtExit: parseInt(getAny(['tenure_at_exit'])) || tenureMonths,
    };
  }).filter(e => e.name);
}

export function parseApprovedWorkforceFromSheet(rows: string[][]): ApprovedWorkforce[] {
  if (rows.length < 2) return [];

  const normalizedRows = rows.map(row => row.map(normalizeHeader));
  const headerRowIndex = normalizedRows.findIndex(row =>
    hasAnyHeader(row, STORE_HEADERS) &&
    countBucketHeaders(row) >= 4
  );

  if (headerRowIndex < 0) return [];

  const headers = normalizedRows[headerRowIndex];
  const locationIndex = firstHeaderIndex(headers, LOCATION_HEADERS);
  const bucketStartIndex = locationIndex >= 0 ? locationIndex + 1 : firstHeaderIndex(headers, STORE_HEADERS) + 1;
  const indexes = {
    store: firstHeaderIndex(headers, STORE_HEADERS),
    location: locationIndex,
    approvedSM: firstHeaderIndex(headers, APPROVED_HEADER_ALIASES.SM, bucketStartIndex),
    approvedASM: firstHeaderIndex(headers, APPROVED_HEADER_ALIASES.ASM, bucketStartIndex),
    approvedSSA: firstHeaderIndex(headers, APPROVED_HEADER_ALIASES.SSA, bucketStartIndex),
    approvedSA: firstHeaderIndex(headers, APPROVED_HEADER_ALIASES.SA, bucketStartIndex),
    approvedOA: firstHeaderIndex(headers, APPROVED_HEADER_ALIASES.OA, bucketStartIndex),
  };

  if (
    indexes.store < 0 ||
    indexes.approvedSM < 0 ||
    indexes.approvedASM < 0 ||
    indexes.approvedSSA < 0 ||
    indexes.approvedSA < 0 ||
    indexes.approvedOA < 0
  ) {
    return [];
  }

  return rows.slice(headerRowIndex + 1).reduce<ApprovedWorkforce[]>((approvedRows, row, index) => {
    const store = (row[indexes.store] ?? '').trim();
    const location = indexes.location >= 0 ? (row[indexes.location] ?? '').trim() : '';
    if (!store || isTotalRow(store) || normalizeHeader(store) === normalizeHeader(headers[indexes.store] || '')) return approvedRows;

    approvedRows.push({
      id: `${keyFor(store, location)}-${index}`,
      store,
      location,
      approvedSM: normalizeHeadcount(row[indexes.approvedSM]),
      approvedASM: normalizeHeadcount(row[indexes.approvedASM]),
      approvedSSA: normalizeHeadcount(row[indexes.approvedSSA]),
      approvedSA: normalizeHeadcount(row[indexes.approvedSA]),
      approvedOA: normalizeHeadcount(row[indexes.approvedOA]),
      updatedAt: new Date().toISOString(),
    });
    return approvedRows;
  }, []);
}

const STORE_HEADERS = ['store', 'stores', 'store_name', 'storename', 'site', 'site_name', 'sitename'];
const LOCATION_HEADERS = ['location', 'city', 'region', 'area'];
const APPROVED_HEADER_ALIASES = {
  SM: ['approved_sm', 'sm', 'sm_approved', 'store_manager', 'approved_store_manager'],
  ASM: ['approved_asm', 'asm', 'asm_approved', 'assistant_manager', 'approved_assistant_manager'],
  SSA: ['approved_ssa', 'ssa', 'ssa_approved', 'senior_sales_associate', 'approved_senior_sales_associate'],
  SA: ['approved_sa', 'sa', 'sa_approved', 'sales_associate', 'approved_sales_associate'],
  OA: ['approved_oa', 'oa', 'oa_approved', 'operations_associate', 'approved_operations_associate'],
} as const;

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function firstHeaderIndex(headers: string[], names: readonly string[], startAt = 0) {
  return headers.findIndex((header, index) => index >= startAt && names.includes(header));
}

function hasAnyHeader(headers: string[], names: readonly string[]) {
  return headers.some(header => names.includes(header));
}

function countBucketHeaders(headers: string[]) {
  return Object.values(APPROVED_HEADER_ALIASES).filter(names => hasAnyHeader(headers, names)).length;
}

function keyFor(store: string, location: string) {
  return `${store.trim().toLowerCase()}__${location.trim().toLowerCase()}`;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

function getByHeader(row: string[], headers: string[], names: readonly string[]) {
  const index = firstHeaderIndex(headers, names.map(normalizeHeader));
  return index >= 0 ? (row[index] ?? '').trim() : '';
}

function normalizeHeadcount(value: unknown) {
  const parsed = Number(String(value ?? '').replace(/,/g, '').trim());
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
}

function isTotalRow(value: string) {
  const normalized = normalizeHeader(value);
  return normalized === 'total' || normalized === 'grand_total' || normalized === 'grandtotal';
}

function normalizeHdfcStatus(value: string): Employee['hdfcAccount'] {
  const normalized = value.trim().toLowerCase();
  if (['yes', 'done', 'completed', 'complete', 'created', 'created yes'].includes(normalized)) {
    return 'Yes';
  }
  if (['no', 'pending', 'not done', 'open', 'required'].includes(normalized)) {
    return 'No';
  }
  return normalized === 'yes' ? 'Yes' : 'No';
}

function normalizeEmploymentStatus(value: string): Employee['status'] {
  const normalized = value.trim().toLowerCase();
  if (['working', 'active', 'currently working', 'in service', 'serving'].includes(normalized)) return 'Working';
  if (['inactive', 'left', 'exited'].includes(normalized)) return 'Inactive';
  if (['on_leave', 'on leave'].includes(normalized)) return 'On Leave';
  if (['resigned', 'terminated', 'absconded', 'on hold', 'on_hold'].includes(normalized)) return normalized.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) as Employee['status'];
  return 'Active';
}

export function isActiveWorkforceStatus(status: Employee['status']) {
  return status === 'Active' || status === 'Working';
}

export function isExitWorkforceStatus(status: Employee['status']) {
  return status === 'Resigned' || status === 'Terminated' || status === 'Absconded' || status === 'On Hold' || status === 'Inactive';
}

function normalizeStoreStatus(value: string): StoreDetail['status'] | null {
  const normalized = normalizeHeader(value);
  if (!normalized) return null;
  if (['nso', 'new_store_opening', 'newstoreopening', 'upcoming', 'upcoming_store', 'new_store'].includes(normalized)) return 'NSO';
  if (['exit', 'exiting', 'exiting_store', 'closed', 'closing', 'closing_store'].includes(normalized)) return 'Exiting';
  if (['existing', 'existing_store', 'active_store', 'live', 'open'].includes(normalized)) return 'Existing';
  return null;
}

function normalizeGender(value: string): ExitEmployee['gender'] {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'male') return 'Male';
  if (normalized === 'female') return 'Female';
  if (normalized === 'other') return 'Other';
  return undefined;
}

export function getTenureBucket(doj: string): string {
  const parsed = parseFlexibleDate(doj);
  if (!parsed) return '0-3 Months';
  const months = (Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (months < 3) return '0-3 Months';
  if (months < 6) return '3-6 Months';
  if (months < 12) return '6-12 Months';
  if (months < 24) return '1-2 Years';
  return '2+ Years';
}

export function parseFlexibleDate(value: string): Date | null {
  const text = value.trim();
  if (!text) return null;

  if (/^\d+(\.\d+)?$/.test(text)) {
    const serial = Number(text);
    if (Number.isFinite(serial)) {
      return buildDateFromSerial(serial);
    }
  }

  const normalized = text
    .replace(/,\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const ymd = normalized.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[ T].*)?$/);
  if (ymd) {
    return buildDate(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
  }

  const dayMonthName = normalized.match(/^(\d{1,2})[-/\s]([A-Za-z]{3,9})[-/\s](\d{2,4})(?:[ T].*)?$/);
  if (dayMonthName) {
    const monthIndex = parseMonthName(dayMonthName[2]);
    if (monthIndex === null) return null;
    const year = Number(dayMonthName[3].length === 2 ? `20${dayMonthName[3]}` : dayMonthName[3]);
    return buildDate(year, monthIndex, Number(dayMonthName[1]));
  }

  const monthDayName = normalized.match(/^([A-Za-z]{3,9})[-/\s](\d{1,2})[-/\s](\d{2,4})(?:[ T].*)?$/);
  if (monthDayName) {
    const monthIndex = parseMonthName(monthDayName[1]);
    if (monthIndex === null) return null;
    const year = Number(monthDayName[3].length === 2 ? `20${monthDayName[3]}` : monthDayName[3]);
    return buildDate(year, monthIndex, Number(monthDayName[2]));
  }

  const slashDate = normalized.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:[ T].*)?$/);
  if (slashDate) {
    const first = Number(slashDate[1]);
    const second = Number(slashDate[2]);
    const year = Number(slashDate[3].length === 2 ? `20${slashDate[3]}` : slashDate[3]);
    const dayFirst = first > 12 || second <= 12;
    const day = dayFirst ? first : second;
    const month = dayFirst ? second - 1 : first - 1;
    return buildDate(year, month, day);
  }

  const fallback = new Date(normalized);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
} as const;

function parseMonthName(value: string): number | null {
  const normalized = value.trim().toLowerCase().slice(0, 3) as keyof typeof MONTHS;
  return normalized in MONTHS ? MONTHS[normalized] : null;
}

function buildDate(year: number, monthIndex: number, day: number): Date | null {
  const date = new Date(year, monthIndex, day);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getFullYear() !== year || date.getMonth() !== monthIndex || date.getDate() !== day) return null;
  return date;
}

function buildDateFromSerial(serial: number): Date | null {
  if (!Number.isFinite(serial)) return null;
  const base = new Date(1899, 11, 30);
  const date = new Date(base.getTime() + serial * 24 * 60 * 60 * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
}
