import { Employee, ExitEmployee } from '../types/hr';

const stores = ['Mumbai Central', 'Delhi North', 'Bangalore South', 'Chennai West', 'Hyderabad East', 'Pune City', 'Kolkata Main', 'Ahmedabad Hub'];
const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'];
const designations = ['Sales Associate', 'Store Manager', 'Assistant Manager', 'Cashier', 'Security Guard', 'Warehouse Staff', 'Visual Merchandiser', 'HR Executive'];
const departments = ['Sales', 'Operations', 'HR', 'Finance', 'Logistics', 'Visual Merchandising', 'Security', 'IT'];
const managers = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Singh', 'Vikram Nair', 'Meera Reddy'];
const hrbps = ['Anjali Mehta', 'Rohit Gupta', 'Deepa Nair', 'Suresh Verma'];
const hiringSources: Employee['hiringSource'][] = ['Employee Referral', 'Talent Acquisition', 'HRBP', 'Walk-in', 'Consultant'];
const exitReasons = ['Better Opportunity', 'Personal Reasons', 'Relocation', 'Health Issues', 'Higher Studies', 'Family Reasons', 'Salary Dissatisfaction', 'Work Culture'];

function randomDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split('T')[0];
}

function getTenureBucket(doj: string): string {
  const months = (new Date().getTime() - new Date(doj).getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (months < 3) return '0-3 Months';
  if (months < 6) return '3-6 Months';
  if (months < 12) return '6-12 Months';
  if (months < 24) return '1-2 Years';
  return '2+ Years';
}

function getConfirmationStatus(doj: string): { status: Employee['confirmationStatus']; dueDate: string } {
  const dojDate = new Date(doj);
  const dueDate = new Date(dojDate.getTime() + 60 * 24 * 60 * 60 * 1000);
  const today = new Date();
  const dueDateStr = dueDate.toISOString().split('T')[0];
  if (dueDate > today) return { status: 'Pending', dueDate: dueDateStr };
  if (Math.random() > 0.3) return { status: 'Confirmed', dueDate: dueDateStr };
  return { status: 'Overdue', dueDate: dueDateStr };
}

export function generateEmployees(count: number = 280): Employee[] {
  const employees: Employee[] = [];
  for (let i = 1; i <= count; i++) {
    const storeIdx = Math.floor(Math.random() * stores.length);
    const doj = randomDate(new Date('2022-01-01'), new Date('2026-05-01'));
    const confirmation = getConfirmationStatus(doj);
    employees.push({
      id: `EMP${String(i).padStart(4, '0')}`,
      name: generateName(),
      gender: Math.random() > 0.42 ? 'Male' : 'Female',
      doj,
      designation: designations[Math.floor(Math.random() * designations.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      store: stores[storeIdx],
      location: locations[storeIdx],
      status: Math.random() > 0.08 ? 'Active' : Math.random() > 0.5 ? 'Inactive' : 'On Leave',
      tenure: getTenureBucket(doj),
      reportingManager: managers[Math.floor(Math.random() * managers.length)],
      hiringSource: hiringSources[Math.floor(Math.random() * hiringSources.length)],
      age: Math.floor(Math.random() * 20) + 20,
      hdfcAccount: Math.random() > 0.28 ? 'Yes' : 'No',
      hrbpName: hrbps[Math.floor(Math.random() * hrbps.length)],
      confirmationStatus: confirmation.status,
      confirmationDueDate: confirmation.dueDate,
    });
  }
  return employees;
}

export function generateExitEmployees(count: number = 62): ExitEmployee[] {
  const exits: ExitEmployee[] = [];
  for (let i = 1; i <= count; i++) {
    const storeIdx = Math.floor(Math.random() * stores.length);
    const doj = randomDate(new Date('2021-01-01'), new Date('2025-06-01'));
    const dol = randomDate(new Date(doj), new Date('2026-05-01'));
    const tenureMonths = Math.round((new Date(dol).getTime() - new Date(doj).getTime()) / (1000 * 60 * 60 * 24 * 30));
    exits.push({
      id: `EXT${String(i).padStart(4, '0')}`,
      name: generateName(),
      doj,
      dol,
      exitReason: exitReasons[Math.floor(Math.random() * exitReasons.length)],
      exitType: Math.random() > 0.35 ? 'Voluntary' : 'Non-Voluntary',
      store: stores[storeIdx],
      location: locations[storeIdx],
      designation: designations[Math.floor(Math.random() * designations.length)],
      tenureAtExit: tenureMonths,
    });
  }
  return exits;
}

const firstNames = ['Aditya', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Pooja', 'Arjun', 'Kavya', 'Rohit', 'Ananya', 'Suresh', 'Deepa', 'Kiran', 'Meera', 'Nikhil', 'Riya', 'Amit', 'Shruti', 'Varun', 'Divya', 'Rajesh', 'Sunita', 'Sanjay', 'Neha', 'Vivek', 'Aarti', 'Manish', 'Geeta', 'Ajay', 'Swati'];
const lastNames = ['Sharma', 'Patel', 'Verma', 'Singh', 'Kumar', 'Gupta', 'Reddy', 'Nair', 'Mehta', 'Joshi', 'Rao', 'Iyer', 'Kapoor', 'Malhotra', 'Chaudhary', 'Pandey', 'Mishra', 'Tiwari', 'Agarwal', 'Srivastava'];

function generateName(): string {
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

export const STORES = stores;
export const LOCATIONS = locations;
export const DESIGNATIONS = designations;
export const DEPARTMENTS = departments;
export const HIRING_SOURCES = hiringSources;
