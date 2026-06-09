import { useEffect, useMemo, useState } from 'react';
import { ApprovedWorkforce as ApprovedWorkforceRow, Employee } from '../../types/hr';
import SectionCard from '../ui/SectionCard';
import { CheckCircle2, Search } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { isActiveWorkforceStatus } from '../../lib/googleSheets';

const STORAGE_KEY = 'approved_workforce_matrix_v1';
const BUCKETS = ['SM', 'ASM', 'SSA', 'SA', 'OA'] as const;
type Bucket = (typeof BUCKETS)[number];
type Status = 'staffed' | 'understaffed' | 'overstaffed';
type StaffingBand = 'all' | '100' | '90' | '80' | 'lt80';

interface Props {
  employees: Employee[];
  approvedRowsFromSheet?: ApprovedWorkforceRow[];
  useSheetApprovedRows?: boolean;
}

interface MatrixRow {
  id: string;
  store: string;
  location: string;
  approved: Record<Bucket, number>;
  current: Record<Bucket, number>;
}

interface SummaryRow {
  name: string;
  approved: number;
  current: number;
  gap: number;
  status: Status;
}

export default function ApprovedWorkforce({ employees, approvedRowsFromSheet = [], useSheetApprovedRows = false }: Props) {
  const [approvedRows, setApprovedRows] = useState<ApprovedWorkforceRow[]>([]);
  const [storeFilter, setStoreFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [staffingBand, setStaffingBand] = useState<StaffingBand>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (useSheetApprovedRows) {
      setApprovedRows(approvedRowsFromSheet);
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setApprovedRows(JSON.parse(saved) as ApprovedWorkforceRow[]);
        return;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setApprovedRows(buildDefaultApprovedRows(employees));
  }, [employees, approvedRowsFromSheet, useSheetApprovedRows]);

  const matrix = useMemo(() => buildMatrix(employees, approvedRows), [employees, approvedRows]);

  const stores = useMemo(() => [...new Set(matrix.map(row => row.store))].sort(), [matrix]);
  const locations = useMemo(() => [...new Set(matrix.map(row => row.location))].sort(), [matrix]);

  const filtered = matrix.filter(row => {
    const matchesStore = !storeFilter || row.store === storeFilter;
    const matchesLocation = !locationFilter || row.location === locationFilter;
    const matchesSearch = !search || `${row.store} ${row.location}`.toLowerCase().includes(search.toLowerCase());
    const staffingPct = totalCurrent(row) > 0 ? Math.round((totalCurrent(row) / Math.max(totalApproved(row), 1)) * 100) : 0;
    const matchesBand =
      staffingBand === 'all' ||
      (staffingBand === '100' && staffingPct === 100) ||
      (staffingBand === '90' && staffingPct >= 90 && staffingPct < 100) ||
      (staffingBand === '80' && staffingPct >= 80 && staffingPct < 90) ||
      (staffingBand === 'lt80' && staffingPct < 80);
    return matchesStore && matchesLocation && matchesSearch && matchesBand;
  });

  const storeSummary = useMemo(() => summarizeByStore(filtered), [filtered]);
  const designationSummary = useMemo(() => summarizeByDesignation(filtered), [filtered]);
  const overallApproved = matrix.reduce((sum, row) => sum + totalApproved(row), 0);
  const overallCurrent = matrix.reduce((sum, row) => sum + totalCurrent(row), 0);
  const overallGap = overallCurrent - overallApproved;
  const staffed = storeSummary.filter(row => row.status === 'staffed').length;
  const under = storeSummary.filter(row => row.status === 'understaffed').length;
  const over = storeSummary.filter(row => row.status === 'overstaffed').length;
  const gapStores = storeSummary.filter(row => row.status !== 'staffed').length;
  const gapDesignations = designationSummary.filter(row => row.gap !== 0).length;

  const clearFilters = () => {
    setStoreFilter('');
    setLocationFilter('');
    setStaffingBand('all');
    setSearch('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-6">
        <MetricTile title="Approved Total" value={overallApproved} note="Store-wise approved workforce" tone="blue" />
        <MetricTile title="Current Total" value={overallCurrent} note="Live active workforce" tone="green" />
        <MetricTile title="Position GAP" value={formatGap(overallGap)} note="Current minus approved" tone={overallGap === 0 ? 'green' : overallGap < 0 ? 'amber' : 'red'} />
        <MetricTile title="100% Staffed" value={staffed} note={`${storeSummary.length} stores tracked`} tone="green" />
        <MetricTile title="Gap Stores" value={gapStores} note={`${under} understaffed, ${over} overstaffed`} tone="amber" />
        <MetricTile title="Gap Designations" value={gapDesignations} note="SM / ASM / SSA / SA / OA" tone="red" />
      </div>

      <SectionCard title="Workforce Gap Analysis" subtitle="Approved vs current workforce by store">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9d8240]" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search store..."
              className="w-full rounded-lg border border-[#e1d3b6] bg-[#fffdf8] py-2 pl-9 pr-3 text-sm font-medium text-[#4f3d24] focus:outline-none focus:ring-1 focus:ring-[#c8a43d]"
            />
          </div>
          <Select value={storeFilter} onChange={setStoreFilter} options={stores} placeholder="All Stores" />
          <Select value={locationFilter} onChange={setLocationFilter} options={locations} placeholder="All Locations" />
          <select
            value={staffingBand}
            onChange={event => setStaffingBand(event.target.value as StaffingBand)}
            className="rounded-lg border border-[#e1d3b6] bg-[#fffdf8] px-3 py-2 text-sm font-semibold text-[#4f3d24] focus:outline-none focus:ring-1 focus:ring-[#c8a43d]"
          >
            <option value="all">All Staffing</option>
            <option value="100">100% Staffed</option>
            <option value="90">90-99% Staffed</option>
            <option value="80">80-89% Staffed</option>
            <option value="lt80">Below 80%</option>
          </select>
          <button
            onClick={clearFilters}
            className="rounded-lg border border-[#e1d3b6] bg-white px-3 py-2 text-xs font-bold text-[#5d4b2d] hover:bg-[#fbf6eb]"
          >
            Clear
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#eadfc8]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#eadfc8] bg-[#9ed5f2] text-[#1f160d]">
                <th className="px-3 py-3 text-center font-bold uppercase tracking-wide" colSpan={2}>Region Details</th>
                <th className="px-3 py-3 text-center font-bold uppercase tracking-wide" colSpan={6}>Approved Workforce</th>
                <th className="px-3 py-3 text-center font-bold uppercase tracking-wide" colSpan={6}>Current Workforce</th>
                <th className="px-3 py-3 text-center font-bold uppercase tracking-wide" rowSpan={2}>Position GAP</th>
              </tr>
              <tr className="border-b border-[#eadfc8] bg-[#f7cdb3]">
                <th className="px-3 py-3 text-left font-bold uppercase tracking-wide text-[#7a684b]">Stores</th>
                <th className="px-3 py-3 text-left font-bold uppercase tracking-wide text-[#7a684b]">Location</th>
                <th className="px-3 py-3 text-right font-bold uppercase tracking-wide text-[#7a684b]">SM</th>
                <th className="px-3 py-3 text-right font-bold uppercase tracking-wide text-[#7a684b]">ASM</th>
                <th className="px-3 py-3 text-right font-bold uppercase tracking-wide text-[#7a684b]">SSA</th>
                <th className="px-3 py-3 text-right font-bold uppercase tracking-wide text-[#7a684b]">SA</th>
                <th className="px-3 py-3 text-right font-bold uppercase tracking-wide text-[#7a684b]">OA</th>
                <th className="px-3 py-3 text-right font-bold uppercase tracking-wide text-[#7a684b]">Total</th>
                <th className="px-3 py-3 text-right font-bold uppercase tracking-wide text-[#7a684b]">SM</th>
                <th className="px-3 py-3 text-right font-bold uppercase tracking-wide text-[#7a684b]">ASM</th>
                <th className="px-3 py-3 text-right font-bold uppercase tracking-wide text-[#7a684b]">SSA</th>
                <th className="px-3 py-3 text-right font-bold uppercase tracking-wide text-[#7a684b]">SA</th>
                <th className="px-3 py-3 text-right font-bold uppercase tracking-wide text-[#7a684b]">OA</th>
                <th className="px-3 py-3 text-right font-bold uppercase tracking-wide text-[#7a684b]">Grand Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e5d0] bg-[#fffdf8]">
              {filtered.map(row => {
                const approvedTotal = totalApproved(row);
                const currentTotal = totalCurrent(row);
                const gap = currentTotal - approvedTotal;
                const staffingPct = approvedTotal > 0 ? Math.round((currentTotal / approvedTotal) * 100) : 0;
                return (
                  <tr key={row.id} className="hover:bg-[#fbf6eb]">
                    <td className="px-3 py-3">
                      <div className="font-bold text-[#1f160d]">{row.store}</div>
                    </td>
                    <td className="px-3 py-3 font-medium text-[#7a684b]">
                      {row.location}
                    </td>
                    {BUCKETS.map(bucket => (
                      <td key={`a-${bucket}`} className="px-3 py-3 text-right font-bold text-[#1f75a8]">{row.approved[bucket]}</td>
                    ))}
                    <td className="px-3 py-3 text-right font-bold text-[#1f160d]">{approvedTotal}</td>
                    {BUCKETS.map(bucket => (
                      <td key={`c-${bucket}`} className="px-3 py-3 text-right font-bold text-[#24945f]">{row.current[bucket]}</td>
                    ))}
                    <td className="px-3 py-3 text-right font-bold text-[#1f160d]">{currentTotal}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-right font-black ${gap === 0 ? 'text-[#24945f]' : gap < 0 ? 'text-[#d88706]' : 'text-[#b9342b]'}`}>
                          {formatGap(gap)}
                        </span>
                        <StatusBadge status={statusFromGap(gap)} />
                        <span className="text-[11px] font-bold text-[#7a684b]">{staffingPct}% staffed</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Store Overview" subtitle="Quick comparison of approved vs current totals">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summarizeByStore(filtered).slice(0, 12)} margin={{ top: 10, right: 18, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eadfc8" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-18} height={58} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend />
              <Bar dataKey="approved" fill="#1f75a8" name="Approved Total" radius={[4, 4, 0, 0]} />
              <Bar dataKey="current" fill="#24945f" name="Current Total" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <SectionCard title="Designation Gap Overview" subtitle="Approved vs current by designation bucket">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#eadfc8] bg-[#f7f1e7]">
                <th className="px-3 py-3 text-left font-bold uppercase tracking-wide text-[#7a684b]">Designation</th>
                <th className="px-3 py-3 text-right font-bold uppercase tracking-wide text-[#7a684b]">Approved</th>
                <th className="px-3 py-3 text-right font-bold uppercase tracking-wide text-[#7a684b]">Current</th>
                <th className="px-3 py-3 text-right font-bold uppercase tracking-wide text-[#7a684b]">Gap</th>
                <th className="px-3 py-3 text-left font-bold uppercase tracking-wide text-[#7a684b]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e5d0] bg-[#fffdf8]">
              {designationSummary.map(row => (
                <tr key={row.name} className="hover:bg-[#fbf6eb]">
                  <td className="px-3 py-3 font-bold text-[#1f160d]">{row.name}</td>
                  <td className="px-3 py-3 text-right font-bold text-[#1f75a8]">{row.approved}</td>
                  <td className="px-3 py-3 text-right font-bold text-[#24945f]">{row.current}</td>
                  <td className={`px-3 py-3 text-right font-black ${row.gap === 0 ? 'text-[#24945f]' : row.gap < 0 ? 'text-[#d88706]' : 'text-[#b9342b]'}`}>
                    {formatGap(row.gap)}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function buildDefaultApprovedRows(employees: Employee[]): ApprovedWorkforceRow[] {
  const stores = new Map<string, ApprovedWorkforceRow>();
  employees.filter(e => isActiveWorkforceStatus(e.status)).forEach(employee => {
    const key = keyFor(employee.store, employee.location);
    const row = stores.get(key) ?? {
      id: key,
      store: employee.store,
      location: employee.location,
      approvedSM: 0,
      approvedASM: 0,
      approvedSSA: 0,
      approvedSA: 0,
      approvedOA: 0,
    };
    row.approvedSM = 0;
    row.approvedASM = 0;
    row.approvedSSA = 0;
    row.approvedSA = 0;
    row.approvedOA = 0;
    stores.set(key, row);
  });

  return Array.from(stores.values()).map(row => {
    const current = buildCurrentByBucket(employees, row.store, row.location || '');
    return {
      ...row,
      approvedSM: current.SM,
      approvedASM: current.ASM,
      approvedSSA: current.SSA,
      approvedSA: current.SA,
      approvedOA: current.OA,
      updatedAt: new Date().toISOString(),
    };
  });
}

function buildMatrix(employees: Employee[], approvedRows: ApprovedWorkforceRow[]): MatrixRow[] {
  const approvedMap = new Map<string, ApprovedWorkforceRow>();
  const approvedStoreKeys = new Set<string>();
  const alignedApprovedRows = alignApprovedRowsToEmployees(approvedRows, employees);

  alignedApprovedRows.forEach(row => {
    const location = row.location || '';
    const key = keyFor(row.store, location);
    const existing = approvedMap.get(key);
    approvedMap.set(key, existing ? mergeApprovedRows(existing, row) : row);
    if (!location) approvedStoreKeys.add(normalizeKeyPart(row.store));
  });

  const storeMap = new Map<string, { store: string; location: string }>();
  employees.forEach(employee => {
    if (approvedStoreKeys.has(normalizeKeyPart(employee.store))) {
      const key = keyFor(employee.store, '');
      if (!storeMap.has(key)) storeMap.set(key, { store: employee.store, location: '' });
      return;
    }
    const key = keyFor(employee.store, employee.location);
    if (!storeMap.has(key)) storeMap.set(key, { store: employee.store, location: employee.location });
  });
  alignedApprovedRows.forEach(row => {
    const key = keyFor(row.store, row.location || '');
    if (!storeMap.has(key)) storeMap.set(key, { store: row.store, location: row.location || '' });
  });

  return Array.from(storeMap.entries()).map(([key, info]) => {
    const approved = approvedMap.get(key) ?? {
      id: key,
      store: info.store,
      location: info.location,
      approvedSM: 0,
      approvedASM: 0,
      approvedSSA: 0,
      approvedSA: 0,
      approvedOA: 0,
    };
    const current = buildCurrentByBucket(employees, info.store, info.location);
    return {
      id: key,
      store: info.store,
      location: info.location,
      approved: {
        SM: approved.approvedSM,
        ASM: approved.approvedASM,
        SSA: approved.approvedSSA,
        SA: approved.approvedSA,
        OA: approved.approvedOA,
      },
      current,
    };
  }).sort((a, b) => a.store.localeCompare(b.store));
}

function alignApprovedRowsToEmployees(approvedRows: ApprovedWorkforceRow[], employees: Employee[]) {
  const employeeStores = new Map<string, { store: string; locations: Map<string, string> }>();
  employees.forEach(employee => {
    const storeKey = normalizeKeyPart(employee.store);
    const locationKey = normalizeKeyPart(employee.location);
    const entry = employeeStores.get(storeKey) ?? { store: employee.store, locations: new Map<string, string>() };
    if (locationKey && !entry.locations.has(locationKey)) entry.locations.set(locationKey, employee.location);
    employeeStores.set(storeKey, entry);
  });

  return approvedRows.map(row => {
    const storeKey = normalizeKeyPart(row.store);
    const locationKey = normalizeKeyPart(row.location || '');
    const employeeStore = employeeStores.get(storeKey);
    if (!employeeStore) return row;

    if (!locationKey) {
      return { ...row, store: employeeStore.store, location: '' };
    }

    const matchedLocation = employeeStore.locations.get(locationKey);
    if (matchedLocation) {
      return { ...row, store: employeeStore.store, location: matchedLocation };
    }

    if (employeeStore.locations.size === 1) {
      return { ...row, store: employeeStore.store, location: Array.from(employeeStore.locations.values())[0] };
    }

    return { ...row, store: employeeStore.store };
  });
}

function buildCurrentByBucket(employees: Employee[], store: string, location = '') {
  const current = { SM: 0, ASM: 0, SSA: 0, SA: 0, OA: 0 } as Record<Bucket, number>;
  const targetKey = keyFor(store, location);
  const targetStore = normalizeKeyPart(store);
  const targetLocation = normalizeKeyPart(location);
  employees.filter(e => {
    if (e.status !== 'Active') return false;
    if (location) return keyFor(e.store, e.location) === targetKey;
    return normalizeKeyPart(e.store) === targetStore && (!targetLocation || normalizeKeyPart(e.location) === targetLocation);
  }).forEach(employee => {
    current[classifyBucket(employee.designation)] += 1;
  });
  return current;
}

function mergeApprovedRows(base: ApprovedWorkforceRow, row: ApprovedWorkforceRow): ApprovedWorkforceRow {
  return {
    ...base,
    store: base.store || row.store,
    location: base.location || row.location,
    approvedSM: base.approvedSM + row.approvedSM,
    approvedASM: base.approvedASM + row.approvedASM,
    approvedSSA: base.approvedSSA + row.approvedSSA,
    approvedSA: base.approvedSA + row.approvedSA,
    approvedOA: base.approvedOA + row.approvedOA,
    updatedAt: row.updatedAt || base.updatedAt,
  };
}

function summarizeByStore(rows: MatrixRow[]): SummaryRow[] {
  return rows.map(row => {
    const approved = totalApproved(row);
    const current = totalCurrent(row);
    const gap = current - approved;
    return {
      name: row.store,
      approved,
      current,
      gap,
      status: statusFromGap(gap),
    };
  });
}

function summarizeByDesignation(rows: MatrixRow[]): SummaryRow[] {
  return BUCKETS.map(bucket => {
    const approved = rows.reduce((sum, row) => sum + row.approved[bucket], 0);
    const current = rows.reduce((sum, row) => sum + row.current[bucket], 0);
    const gap = current - approved;
    return {
      name: bucket,
      approved,
      current,
      gap,
      status: statusFromGap(gap),
    };
  });
}

function MetricTile({ title, value, note, tone }: { title: string; value: string | number; note: string; tone: 'blue' | 'green' | 'amber' | 'red' }) {
  const toneClass = {
    blue: 'border-t-[#1f75a8] text-[#1f75a8]',
    green: 'border-t-[#24945f] text-[#24945f]',
    amber: 'border-t-[#d88706] text-[#d88706]',
    red: 'border-t-[#b9342b] text-[#b9342b]',
  }[tone];

  return (
    <div className={`rounded-lg border border-[#e5d8bf] border-t-4 ${toneClass} bg-[#fffdf8] p-5 shadow-[0_10px_24px_rgba(62,44,23,0.08)]`}>
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#f7f1e7]">
        <CheckCircle2 size={18} />
      </div>
      <p className="font-serif text-3xl font-bold leading-none text-[#1f160d]">{value}</p>
      <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-[#9a8052]">{title}</p>
      <p className="mt-1 text-xs font-semibold text-[#8a7553]">{note}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const config = {
    staffed: { label: '100% Staffed', className: 'bg-emerald-50 text-emerald-800 ring-emerald-100' },
    understaffed: { label: 'Understaffed', className: 'bg-amber-50 text-amber-800 ring-amber-100' },
    overstaffed: { label: 'Overstaffed', className: 'bg-rose-50 text-rose-800 ring-rose-100' },
  }[status];

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ring-1 ${config.className}`}>{config.label}</span>;
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={event => onChange(event.target.value)}
      className="rounded-lg border border-[#e1d3b6] bg-[#fffdf8] px-3 py-2 text-sm font-semibold text-[#4f3d24] focus:outline-none focus:ring-1 focus:ring-[#c8a43d]"
    >
      <option value="">{placeholder}</option>
      {options.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function classifyBucket(designation: string): Bucket {
  const normalized = normalizeDesignation(designation);
  const tokens = normalized.split(' ').filter(Boolean);
  const compact = tokens.join('');

  if (tokens.includes('asm') || compact === 'assistantstoremanager' || compact === 'assistantmanager' || normalized.includes('assistant store manager')) {
    return 'ASM';
  }
  if (tokens.includes('ssa') || normalized.includes('senior sales associate') || normalized.includes('sr sales associate')) {
    return 'SSA';
  }
  if (tokens.includes('sm') || compact === 'storemanager' || normalized.includes('store manager')) {
    return 'SM';
  }
  if (tokens.includes('sa') || normalized.includes('sales associate') || normalized.includes('sales advisor')) {
    return 'SA';
  }
  if (tokens.includes('oa') || normalized.includes('operation associate') || normalized.includes('operations associate') || normalized.includes('office assistant')) {
    return 'OA';
  }
  if (normalized.includes('cashier') || normalized.includes('customer advisor')) return 'SA';
  if (normalized.includes('security') || normalized.includes('merchand') || normalized.includes('visual') || normalized.includes('hr executive')) return 'SSA';
  return 'OA';
}

function normalizeDesignation(value: string) {
  return value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function totalApproved(row: MatrixRow) {
  return BUCKETS.reduce((sum, bucket) => sum + row.approved[bucket], 0);
}

function totalCurrent(row: MatrixRow) {
  return BUCKETS.reduce((sum, bucket) => sum + row.current[bucket], 0);
}

function statusFromGap(gap: number): Status {
  if (gap === 0) return 'staffed';
  if (gap < 0) return 'understaffed';
  return 'overstaffed';
}

function keyFor(store: string, location: string) {
  return `${normalizeKeyPart(store)}__${normalizeKeyPart(location)}`;
}

function normalizeKeyPart(value: string) {
  return value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ');
}


function formatGap(value: number) {
  if (value > 0) return `+${value}`;
  return String(value);
}
