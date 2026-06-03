export interface Employee {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  doj: string;
  designation: string;
  department: string;
  store: string;
  location: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  tenure: string;
  reportingManager: string;
  hiringSource: 'Employee Referral' | 'Talent Acquisition' | 'HRBP' | 'Walk-in' | 'Consultant';
  age?: number;
  hdfcAccount: 'Yes' | 'No';
  hrbpName: string;
  confirmationStatus: 'Pending' | 'Confirmed' | 'Overdue';
  confirmationDueDate: string;
}

export interface ExitEmployee {
  id: string;
  name: string;
  doj: string;
  dol: string;
  exitReason: string;
  exitType: 'Voluntary' | 'Non-Voluntary';
  store: string;
  location: string;
  designation: string;
  tenureAtExit: number;
}

export interface ApprovedWorkforce {
  id: string;
  store: string;
  location?: string;
  approvedSM: number;
  approvedASM: number;
  approvedSSA: number;
  approvedSA: number;
  approvedOA: number;
  updatedAt?: string;
}

export type ActiveSection =
  | 'executive'
  | 'approved'
  | 'workforce'
  | 'attrition'
  | 'advanced'
  | 'reports'
  | 'confirmation'
  | 'hdfc'
  | 'hiring'
  | 'settings';

export interface FilterState {
  store: string;
  location: string;
  gender: string;
  designation: string;
  status: string;
  hiringSource: string;
  tenure: string;
  dateFrom: string;
  dateTo: string;
}

export interface KPICard {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  color: string;
  icon: string;
}

export interface SheetConfig {
  spreadsheetId: string;
  apiKey: string;
  employeeSheetName: string;
  exitSheetName: string;
  approvedWorkforceSheetName?: string;
  openPositionsSheetName?: string;
}
