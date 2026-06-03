import { useEffect, useMemo, useState } from 'react';
import { ApprovedWorkforce as ApprovedWorkforceRow, Employee } from '../../types/hr';
import SectionCard from '../ui/SectionCard';
import { CheckCircle2, Download, FileSpreadsheet, RefreshCw, Search, Upload } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const STORAGE_KEY = 'approved_workforce_matrix_v1';
const BUCKETS = ['SM', 'ASM', 'SSA', 'SA', 'OA'] as const;
type Bucket = (typeof BUCKETS)[number];
type Status = 'staffed' | 'understaffed' | 'overstaffed';
type StaffingBand = 'all' | '100' | '90' | '80' | 'lt80';

interface Props {
  employees: Employee[];
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

type ParsedApprovedRow = ApprovedWorkforceRow & { location: string; updatedAt: string };

export default function ApprovedWorkforce({ employees }: Props) {
  const [approvedRows, setApprovedRows] = useState<ApprovedWorkforceRow[]>([]);
  const [storeFilter, setStoreFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [staffingBand, setStaffingBand] = useState<StaffingBand>('all');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
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
  }, [employees]);

  const saveRows = (rows: ApprovedWorkforceRow[]) => {
    setApprovedRows(rows);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  };

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

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    const rows = parseApprovedWorkbook(text);
    if (rows.length === 0) {
      setMessage('No valid rows found. Use the workbook columns for store, location, approved_sm, approved_asm, approved_ssa, approved_sa, approved_oa.');
      return;
    }
    saveRows(rows);
    setMessage(`${rows.length} store-wise approved workforce rows uploaded successfully.`);
  };

  const resetFromActual = () => {
    const rows = buildDefaultApprovedRows(employees);
    saveRows(rows);
    setMessage('Approved workforce reset to match current manpower distribution.');
  };

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

      <SectionCard
        title="Approved Workforce Update"
        subtitle="Upload store-wise approved manpower using the same columns as your Excel format. The dashboard auto-compares approved vs actual manpower."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-1.5 rounded-lg border border-[#e1d3b6] bg-white px-3 py-2 text-xs font-bold text-[#5d4b2d] hover:bg-[#fbf6eb]"
            >
              <Download size={14} /> Excel Template
            </button>
            <button
              onClick={resetFromActual}
              className="flex items-center gap-1.5 rounded-lg border border-[#e1d3b6] bg-white px-3 py-2 text-xs font-bold text-[#5d4b2d] hover:bg-[#fbf6eb]"
            >
              <RefreshCw size={14} /> Reset
            </button>
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#c8a43d] bg-[#c8a43d] px-3 py-2 text-xs font-bold text-[#15110d] hover:bg-[#b9932c]">
              <Upload size={14} /> Upload Excel/CSV
              <input
                type="file"
                accept=".csv,.xls,.html,text/csv,application/vnd.ms-excel,text/html"
                className="hidden"
                onChange={event => {
                  void handleFileUpload(event.target.files?.[0] ?? null);
                  event.currentTarget.value = '';
                }}
              />
            </label>
          </div>
        }
      >
        <div className="rounded-lg border border-[#eadfc8] bg-[#fbf6eb] px-4 py-3 text-sm font-medium text-[#6d5520]">
          <FileSpreadsheet size={16} className="mr-2 inline text-[#9d8240]" />
          Required format: <span className="font-bold">store, location, approved_sm, approved_asm, approved_ssa, approved_sa, approved_oa</span>. The downloaded workbook uses grouped Excel-style headers.
        </div>
        {message && (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {message}
          </div>
        )}
      </SectionCard>

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
                      <div className="text-[11px] font-medium text-[#7a684b]">{row.location}</div>
                    </td>
                    {BUCKETS.map(bucket => (
                      <td key={`a-${bucket}`} className="px-3 py-3 text-right font-bold text-[#1f75a8]">{row.approved[bucket]}</td>
                    ))}
                    <td className="px-3 py-3 text-right font-bold text-[#1f160d]">{approvedTotal}</td>
                    {BUCKETS.map(bucket => (
                      <td key={`c-${bucket}`} className="px-3 py-3 text-right font-bold text-[#24945f]">{row.current[bucket]}</td>
                    ))}
                    <td className="px-3 py-3 text-right font-bold text-[#1f160d]">{currentTotal}</td>
                    <td className={`px-3 py-3 text-right font-black ${gap === 0 ? 'text-[#24945f]' : gap < 0 ? 'text-[#d88706]' : 'text-[#b9342b]'}`}>
                      {formatGap(gap)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1">
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
  employees.filter(e => e.status === 'Active').forEach(employee => {
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
    const current = buildCurrentByBucket(employees, row.store);
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
  approvedRows.forEach(row => approvedMap.set(keyFor(row.store, row.location || ''), row));

  const storeMap = new Map<string, { store: string; location: string }>();
  employees.forEach(employee => {
    const key = keyFor(employee.store, employee.location);
    if (!storeMap.has(key)) storeMap.set(key, { store: employee.store, location: employee.location });
  });
  approvedRows.forEach(row => {
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
    const current = buildCurrentByBucket(employees, info.store);
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

function buildCurrentByBucket(employees: Employee[], store: string) {
  const current = { SM: 0, ASM: 0, SSA: 0, SA: 0, OA: 0 } as Record<Bucket, number>;
  employees.filter(e => e.status === 'Active' && e.store === store).forEach(employee => {
    current[classifyBucket(employee.designation)] += 1;
  });
  return current;
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

function parseApprovedWorkbook(text: string): ApprovedWorkforceRow[] {
  const isHtml = /<table[\s>]/i.test(text) || /<html[\s>]/i.test(text);
  return isHtml ? parseApprovedHtmlWorkbook(text) : parseApprovedCsvWorkbook(text);
}

function parseApprovedCsvWorkbook(text: string): ParsedApprovedRow[] {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map(normalizeHeader);

  const indexes = {
    store: headers.findIndex(h => h === 'store' || h === 'stores'),
    location: headers.findIndex(h => h === 'location'),
    approvedSM: headers.findIndex(h => h === 'approved_sm' || h === 'sm'),
    approvedASM: headers.findIndex(h => h === 'approved_asm' || h === 'asm'),
    approvedSSA: headers.findIndex(h => h === 'approved_ssa' || h === 'ssa'),
    approvedSA: headers.findIndex(h => h === 'approved_sa' || h === 'sa'),
    approvedOA: headers.findIndex(h => h === 'approved_oa' || h === 'oa'),
  };

  if (indexes.store < 0 || indexes.location < 0 || indexes.approvedSM < 0 || indexes.approvedASM < 0 || indexes.approvedSSA < 0 || indexes.approvedSA < 0 || indexes.approvedOA < 0) {
    return [];
  }

  return lines.slice(1).map((line, index) => {
    const cells = splitCsvLine(line);
    const store = cells[indexes.store]?.trim() ?? '';
    const location = cells[indexes.location]?.trim() ?? '';
    if (!store) return null;
    return {
      id: `${keyFor(store, location)}-${index}`,
      store,
      location,
      approvedSM: normalizeHeadcount(cells[indexes.approvedSM]),
      approvedASM: normalizeHeadcount(cells[indexes.approvedASM]),
      approvedSSA: normalizeHeadcount(cells[indexes.approvedSSA]),
      approvedSA: normalizeHeadcount(cells[indexes.approvedSA]),
      approvedOA: normalizeHeadcount(cells[indexes.approvedOA]),
      updatedAt: new Date().toISOString(),
    };
  }).filter((row): row is ParsedApprovedRow => row !== null);
}

function parseApprovedHtmlWorkbook(text: string): ParsedApprovedRow[] {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const table = doc.querySelector('table');
  if (!table) return [];

  const rows = Array.from(table.querySelectorAll('tr'));
  if (rows.length < 3) return [];

  const headerRowIndex = rows.findIndex(row => {
    const cells = Array.from(row.querySelectorAll('th')).map(cell => normalizeHeader(cell.textContent ?? ''));
    return cells.includes('stores') && cells.includes('location') && cells.includes('sm') && cells.includes('asm');
  });

  if (headerRowIndex < 0 || headerRowIndex === rows.length - 1) return [];

  const dataRows = rows.slice(headerRowIndex + 1);
  return dataRows.map((row, index) => {
    const cells = Array.from(row.querySelectorAll('td')).map(cell => cell.textContent?.trim() ?? '');
    if (cells.length < 7) return null;
    const store = cells[0] ?? '';
    const location = cells[1] ?? '';
    if (!store) return null;
    return {
      id: `${keyFor(store, location)}-${index}`,
      store,
      location,
      approvedSM: normalizeHeadcount(cells[2]),
      approvedASM: normalizeHeadcount(cells[3]),
      approvedSSA: normalizeHeadcount(cells[4]),
      approvedSA: normalizeHeadcount(cells[5]),
      approvedOA: normalizeHeadcount(cells[6]),
      updatedAt: new Date().toISOString(),
    };
  }).filter((row): row is ParsedApprovedRow => row !== null);
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function downloadTemplate() {
  const workbook = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #d9c8a8; padding: 8px 10px; font-size: 12px; }
    .group { background: #9ed5f2; font-weight: 700; text-align: center; }
    .sub { background: #f7cdb3; font-weight: 700; }
    .store { background: #fffdf8; }
  </style>
</head>
<body>
  <table>
    <tr>
      <th class="group" colspan="2">Region Details</th>
      <th class="group" colspan="6">Approved Workforce</th>
      <th class="group" colspan="6">Current Workforce</th>
      <th class="group" rowspan="2">Position GAP</th>
    </tr>
    <tr>
      <th class="sub">Stores</th>
      <th class="sub">Location</th>
      <th class="sub">SM</th>
      <th class="sub">ASM</th>
      <th class="sub">SSA</th>
      <th class="sub">SA</th>
      <th class="sub">OA</th>
      <th class="sub">Total</th>
      <th class="sub">SM</th>
      <th class="sub">ASM</th>
      <th class="sub">SSA</th>
      <th class="sub">SA</th>
      <th class="sub">OA</th>
      <th class="sub">Grand Total</th>
    </tr>
    <tr class="store">
      <td>Mumbai Central</td><td>Mumbai</td>
      <td>1</td><td>2</td><td>4</td><td>18</td><td>3</td><td>28</td>
      <td></td><td></td><td></td><td></td><td></td><td></td>
      <td></td>
    </tr>
    <tr class="store">
      <td>Delhi North</td><td>Delhi</td>
      <td>1</td><td>2</td><td>4</td><td>15</td><td>2</td><td>24</td>
      <td></td><td></td><td></td><td></td><td></td><td></td>
      <td></td>
    </tr>
  </table>
</body>
</html>`;
  const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'approved-workforce-template.xls';
  link.click();
  URL.revokeObjectURL(url);
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
  const value = designation.trim().toLowerCase();
  if (value.includes('store manager') || value === 'sm') return 'SM';
  if (value.includes('assistant manager') || value === 'asm') return 'ASM';
  if (value.includes('security') || value.includes('merchand') || value.includes('visual') || value.includes('hr executive')) return 'SSA';
  if (value.includes('cashier') || value === 'sa' || value.includes('sales associate')) return 'SA';
  return 'OA';
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
  return `${store.trim().toLowerCase()}__${location.trim().toLowerCase()}`;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

function normalizeHeadcount(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
}

function formatGap(value: number) {
  if (value > 0) return `+${value}`;
  return String(value);
}
