<<<<<<< HEAD
import { useEffect, useMemo, useState } from 'react';
import { Employee, ExitEmployee } from '../../types/hr';
import KPICard from '../ui/KPICard';
import SectionCard from '../ui/SectionCard';
import DataTable from '../ui/DataTable';
import { Clock, Download, Target, TrendingUp, Upload, Users, Zap } from 'lucide-react';
=======
import { Employee } from '../../types/hr';
import KPICard from '../ui/KPICard';
import SectionCard from '../ui/SectionCard';
import DataTable from '../ui/DataTable';
import { Target, TrendingUp, Users, Zap } from 'lucide-react';
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line, AreaChart, Area
} from 'recharts';

const SOURCE_COLORS: Record<string, string> = {
  'Employee Referral': '#3b82f6',
  'Talent Acquisition': '#10b981',
  'HRBP': '#f59e0b',
  'Walk-in': '#ef4444',
  'Consultant': '#8b5cf6',
};

<<<<<<< HEAD
const OPEN_POSITIONS_STORAGE_KEY = 'hiring_open_positions_v1';

interface OpenPositionRow {
  id: string;
  store: string;
  position: string;
  openDate: string;
  closeDate: string;
  status: 'Open' | 'Closed';
  daysOpen: number;
  owner: string;
}

interface Props { employees: Employee[]; exits: ExitEmployee[] }

export default function HiringAnalytics({ employees, exits }: Props) {
  const [openPositions, setOpenPositions] = useState<OpenPositionRow[]>(loadOpenPositions);
  const [hireStore, setHireStore] = useState('');
  const [hireSource, setHireSource] = useState('');
  const [hireDesignation, setHireDesignation] = useState('');
  const [hireDepartment, setHireDepartment] = useState('');
=======
interface Props { employees: Employee[] }

export default function HiringAnalytics({ employees }: Props) {
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
  const sourceBreakdown = buildSourceBreakdown(employees);
  const totalHires = employees.length;
  const topSource = sourceBreakdown[0]?.source ?? 'N/A';
  const monthlyTrend = buildMonthlyBySource(employees);
  const storeSource = buildStoreSource(employees);
<<<<<<< HEAD
  const hiringCycle = buildHiringCycle(employees, exits);
  const avgOpenDays = hiringCycle.length > 0 ? Math.round(hiringCycle.reduce((sum, row) => sum + row.daysOpen, 0) / hiringCycle.length) : 0;
=======
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc

  const thisMonthHires = employees.filter(e => {
    const d = new Date(e.doj);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const referralCount = employees.filter(e => e.hiringSource === 'Employee Referral').length;
  const referralPct = ((referralCount / Math.max(totalHires, 1)) * 100).toFixed(0);

  const pieData = sourceBreakdown.map(s => ({ name: s.source, value: s.count }));
<<<<<<< HEAD
  const uploadedPositions = openPositions.map(row => ({
    ...row,
    daysOpen: row.status === 'Closed'
      ? row.daysOpen
      : Math.max(0, Math.round((Date.now() - new Date(row.openDate).getTime()) / (1000 * 60 * 60 * 24))),
  }));
  const uploadedOpenCount = uploadedPositions.filter(row => row.status === 'Open').length;
  const uploadedClosedCount = uploadedPositions.filter(row => row.status === 'Closed').length;
  const uploadedAvgDays = uploadedPositions.length > 0
    ? Math.round(uploadedPositions.reduce((sum, row) => sum + row.daysOpen, 0) / uploadedPositions.length)
    : 0;
  const filteredEmployees = useMemo(() => employees.filter(employee => {
    if (hireStore && employee.store !== hireStore) return false;
    if (hireSource && employee.hiringSource !== hireSource) return false;
    if (hireDesignation && employee.designation !== hireDesignation) return false;
    if (hireDepartment && employee.department !== hireDepartment) return false;
    return true;
  }), [employees, hireStore, hireSource, hireDesignation, hireDepartment]);
  const hireStores = useMemo(() => [...new Set(employees.map(e => e.store))].sort(), [employees]);
  const hireSources = useMemo(() => [...new Set(employees.map(e => e.hiringSource))].sort(), [employees]);
  const hireDesignations = useMemo(() => [...new Set(employees.map(e => e.designation))].sort(), [employees]);
  const hireDepartments = useMemo(() => [...new Set(employees.map(e => e.department))].sort(), [employees]);

  useEffect(() => {
    window.localStorage.setItem(OPEN_POSITIONS_STORAGE_KEY, JSON.stringify(openPositions));
  }, [openPositions]);
=======
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc

  const columns = [
    { key: 'id', label: 'EMP ID' },
    { key: 'name', label: 'Employee Name' },
    { key: 'hiringSource', label: 'Source', render: (r: Employee) => (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ backgroundColor: `${SOURCE_COLORS[r.hiringSource]}18`, color: SOURCE_COLORS[r.hiringSource] }}>
        {r.hiringSource}
      </span>
    )},
    { key: 'doj', label: 'DOJ' },
    { key: 'store', label: 'Store' },
    { key: 'location', label: 'Location' },
    { key: 'designation', label: 'Designation' },
    { key: 'department', label: 'Department' },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Hires" value={totalHires} subtitle="All time"
          icon={<Users size={20} />} colorClass="text-blue-600" bgClass="bg-blue-50" borderClass="border-blue-100" />
        <KPICard title="Hires This Month" value={thisMonthHires} subtitle="MTD"
          icon={<TrendingUp size={20} />} colorClass="text-emerald-600" bgClass="bg-emerald-50" borderClass="border-emerald-100" />
        <KPICard title="Top Source" value={topSource} subtitle={`${sourceBreakdown[0]?.count ?? 0} hires`}
          icon={<Target size={20} />} colorClass="text-amber-600" bgClass="bg-amber-50" borderClass="border-amber-100" />
        <KPICard title="Employee Referral" value={`${referralPct}%`} subtitle={`${referralCount} referrals`}
          icon={<Zap size={20} />} colorClass="text-cyan-600" bgClass="bg-cyan-50" borderClass="border-cyan-100" />
<<<<<<< HEAD
        <KPICard title="Avg Open Days" value={avgOpenDays} subtitle="Open to close / current"
          icon={<Clock size={20} />} colorClass="text-violet-600" bgClass="bg-violet-50" borderClass="border-violet-100" />
      </div>

      <SectionCard
        title="Open Positions Upload"
        subtitle="Upload store-wise positions with open and close dates"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={downloadOpenPositionTemplate}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e1d3b6] bg-white px-3 py-2 text-xs font-bold text-[#4f3d24] hover:bg-[#fbf6eb]"
            >
              <Download size={14} />
              Template
            </button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#1f75a8] px-3 py-2 text-xs font-bold text-white hover:bg-[#185e88]">
              <Upload size={14} />
              Upload
              <input
                type="file"
                accept=".csv,.xls,.html"
                className="hidden"
                onChange={async event => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const text = await file.text();
                  setOpenPositions(parseOpenPositionRows(text));
                  event.currentTarget.value = '';
                }}
              />
            </label>
            <button
              onClick={() => setOpenPositions([])}
              className="rounded-lg border border-[#e1d3b6] bg-white px-3 py-2 text-xs font-bold text-[#9b332a] hover:bg-[#fef2f2]"
            >
              Clear
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricTile title="Uploaded Positions" value={uploadedPositions.length} note="Store-wise rows" tone="blue" />
          <MetricTile title="Open Positions" value={uploadedOpenCount} note="Still active" tone="amber" />
          <MetricTile title="Closed Positions" value={uploadedClosedCount} note="Already closed" tone="green" />
          <MetricTile title="Avg Days Open" value={uploadedAvgDays} note="Across uploaded rows" tone="violet" />
        </div>
      </SectionCard>

=======
      </div>

>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
      {/* Source stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {sourceBreakdown.map(s => (
          <div key={s.source}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="text-xs font-semibold text-gray-500 mb-1 truncate">{s.source}</div>
            <div className="text-2xl font-bold" style={{ color: SOURCE_COLORS[s.source] }}>{s.count}</div>
            <div className="text-xs text-gray-500 mt-1">{s.pct}% of hires</div>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: SOURCE_COLORS[s.source] }} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Source Distribution" subtitle="By hiring channel">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={SOURCE_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Monthly Hiring Trend by Source" subtitle="Last 12 months" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyTrend}>
              <defs>
                {Object.entries(SOURCE_COLORS).map(([src, color]) => (
                  <linearGradient key={src} id={`grad_${src.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {Object.entries(SOURCE_COLORS).map(([src, color]) => (
                <Area key={src} type="monotone" dataKey={src} stroke={color} strokeWidth={1.5}
                  fill={`url(#grad_${src.replace(/\s+/g, '')})`} name={src} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Store Source Chart */}
      <SectionCard title="Store-wise Hiring Source" subtitle="Source effectiveness per store">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={storeSource.slice(0, 8)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="store" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {Object.entries(SOURCE_COLORS).map(([src, color]) => (
              <Bar key={src} dataKey={src} fill={color} name={src} stackId="a"
                radius={src === 'Consultant' ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Hiring Table */}
      <SectionCard title="Hiring Register" subtitle={`${employees.length} employees`}
        action={<span className="text-xs text-gray-400 font-medium">Searchable</span>}>
<<<<<<< HEAD
        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-4">
          <SelectFilter label="Store" value={hireStore} options={hireStores} onChange={setHireStore} />
          <SelectFilter label="Source" value={hireSource} options={hireSources} onChange={setHireSource} />
          <SelectFilter label="Designation" value={hireDesignation} options={hireDesignations} onChange={setHireDesignation} />
          <SelectFilter label="Department" value={hireDepartment} options={hireDepartments} onChange={setHireDepartment} />
        </div>
        <DataTable
          columns={columns as Parameters<typeof DataTable>[0]['columns']}
          data={filteredEmployees as unknown as Record<string, unknown>[]}
=======
        <DataTable
          columns={columns as Parameters<typeof DataTable>[0]['columns']}
          data={employees as unknown as Record<string, unknown>[]}
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
          pageSize={12}
          searchFields={['name', 'id', 'hiringSource', 'store', 'location', 'designation'] as never[]}
        />
      </SectionCard>
<<<<<<< HEAD

      <SectionCard title="Position Open / Close Days" subtitle="Open date to close date, or current date for active positions">
        <DataTable
          columns={[
            { key: 'name', label: 'Employee Name' },
            { key: 'store', label: 'Store' },
            { key: 'designation', label: 'Designation' },
            { key: 'openDate', label: 'Open Date' },
            { key: 'closeDate', label: 'Close Date' },
            { key: 'status', label: 'Status' },
            { key: 'daysOpen', label: 'Days Open' },
          ] as Parameters<typeof DataTable>[0]['columns']}
          data={hiringCycle as unknown as Record<string, unknown>[]}
          pageSize={10}
          searchFields={['name', 'store', 'designation', 'status'] as never[]}
        />
      </SectionCard>

      {uploadedPositions.length > 0 && (
        <SectionCard title="Uploaded Open Positions" subtitle="Store-wise tracker from your file">
          <DataTable
            columns={[
              { key: 'store', label: 'Store' },
              { key: 'position', label: 'Position' },
              { key: 'openDate', label: 'Open Date' },
              { key: 'closeDate', label: 'Close Date' },
              {
                key: 'status',
                label: 'Status',
                render: (row: OpenPositionRow) => (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${row.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {row.status}
                  </span>
                ),
              },
              { key: 'daysOpen', label: 'Days Open' },
              { key: 'owner', label: 'Owner' },
            ] as Parameters<typeof DataTable>[0]['columns']}
            data={uploadedPositions as unknown as Record<string, unknown>[]}
            pageSize={10}
            searchFields={['store', 'position', 'status', 'owner'] as never[]}
          />
        </SectionCard>
      )}
=======
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
    </div>
  );
}

function buildSourceBreakdown(employees: Employee[]) {
  const sources = ['Employee Referral', 'Talent Acquisition', 'HRBP', 'Walk-in', 'Consultant'];
  const total = Math.max(employees.length, 1);
  return sources.map(source => {
    const count = employees.filter(e => e.hiringSource === source).length;
    return { source, count, pct: Number(((count / total) * 100).toFixed(1)) };
  }).sort((a, b) => b.count - a.count);
}

function buildMonthlyBySource(employees: Employee[]) {
  const months: Record<string, Record<string, string | number>> = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = {
      month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
      'Employee Referral': 0, 'Talent Acquisition': 0, 'HRBP': 0, 'Walk-in': 0, 'Consultant': 0
    };
  }
  employees.forEach(e => {
    const k = e.doj.substring(0, 7);
    if (months[k]) {
      const current = months[k][e.hiringSource] as number;
      months[k][e.hiringSource] = current + 1;
    }
  });
  return Object.values(months);
}

function buildStoreSource(employees: Employee[]) {
  const sources = ['Employee Referral', 'Talent Acquisition', 'HRBP', 'Walk-in', 'Consultant'];
  const map: Record<string, Record<string, string | number>> = {};
  employees.forEach(e => {
    if (!map[e.store]) {
      map[e.store] = { store: e.store };
      sources.forEach(s => { map[e.store][s] = 0; });
    }
    const current = map[e.store][e.hiringSource] as number;
    map[e.store][e.hiringSource] = current + 1;
  });
  return Object.values(map).sort((a, b) => {
    const at = sources.reduce((s, k) => s + (a[k] as number), 0);
    const bt = sources.reduce((s, k) => s + (b[k] as number), 0);
    return bt - at;
  });
}
<<<<<<< HEAD

function buildHiringCycle(employees: Employee[], exits: ExitEmployee[]) {
  const exitMap = new Map(exits.map(exit => [exit.id, exit]));
  const today = new Date();
  return employees.map(employee => {
    const exit = exitMap.get(employee.id);
    const closeDate = exit?.dol || '';
    const endDate = closeDate ? new Date(closeDate) : today;
    const daysOpen = Math.max(0, Math.round((endDate.getTime() - new Date(employee.doj).getTime()) / (1000 * 60 * 60 * 24)));
    return {
      name: employee.name,
      store: employee.store,
      designation: employee.designation,
      openDate: employee.doj,
      closeDate: closeDate || 'Open',
      status: closeDate ? 'Closed' : 'Open',
      daysOpen,
    };
  }).sort((a, b) => b.daysOpen - a.daysOpen);
}

function loadOpenPositions(): OpenPositionRow[] {
  try {
    const raw = window.localStorage.getItem(OPEN_POSITIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OpenPositionRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseOpenPositionRows(text: string): OpenPositionRow[] {
  const rows = text.includes('<table') ? parseHtmlRows(text) : parseCsvRows(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map(cell => cell.trim().toLowerCase().replace(/\s+/g, '_'));
  return rows.slice(1).map((row, index) => {
    const get = (key: string) => row[headers.indexOf(key)] ?? '';
    const openDate = normalizeDate(get('open_date') || get('opened_date') || get('date_opened'));
    const closeDateRaw = normalizeDate(get('close_date') || get('closed_date') || get('date_closed'));
    const status = normalizeStatus(get('status') || (closeDateRaw ? 'Closed' : 'Open')) as OpenPositionRow['status'];
    const endDate = closeDateRaw ? new Date(closeDateRaw) : new Date();
    return {
      id: get('id') || `OPN${String(index + 1).padStart(4, '0')}`,
      store: get('store') || '',
      position: get('position') || get('role') || '',
      openDate,
      closeDate: closeDateRaw || (status === 'Open' ? 'Open' : ''),
      status,
      daysOpen: openDate ? Math.max(0, Math.round((endDate.getTime() - new Date(openDate).getTime()) / (1000 * 60 * 60 * 24))) : 0,
      owner: get('owner') || get('hrbp') || '',
    };
  }).filter(row => row.store && row.position);
}

function parseCsvRows(text: string) {
  return text.trim().split(/\r?\n/).map(line => line.split(',').map(cell => cell.trim())).filter(row => row.some(Boolean));
}

function parseHtmlRows(text: string) {
  const rowMatches = [...text.matchAll(/<tr[\s\S]*?<\/tr>/gi)];
  return rowMatches.map(match => {
    const cells = [...match[0].matchAll(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)];
    return cells.map(cell => cell[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').trim());
  }).filter(row => row.length > 0);
}

function normalizeDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? trimmed : date.toISOString().split('T')[0];
}

function normalizeStatus(value: string) {
  const normalized = value.trim().toLowerCase();
  if (['closed', 'done', 'close', 'completed', 'complete'].includes(normalized)) return 'Closed';
  return 'Open';
}

function downloadOpenPositionTemplate() {
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8" /><style>
    body{font-family:Arial,sans-serif;padding:24px}table{border-collapse:collapse;width:100%}
    th,td{border:1px solid #d9c8a8;padding:8px 10px;font-size:12px}th{background:#f7f1e7}
  </style></head><body>
    <h2>Open Positions Template</h2>
    <table>
      <thead><tr><th>id</th><th>store</th><th>position</th><th>open_date</th><th>close_date</th><th>status</th><th>owner</th></tr></thead>
      <tbody>
        <tr><td>OPN0001</td><td>Mumbai Central</td><td>Store Manager</td><td>2026-05-01</td><td></td><td>Open</td><td>HRBP Name</td></tr>
        <tr><td>OPN0002</td><td>Delhi North</td><td>Sales Associate</td><td>2026-04-15</td><td>2026-05-10</td><td>Closed</td><td>HRBP Name</td></tr>
      </tbody>
    </table>
  </body></html>`;
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'open-positions-template.xls';
  link.click();
  URL.revokeObjectURL(url);
}

function MetricTile({ title, value, note, tone }: { title: string; value: string | number; note: string; tone: 'blue' | 'amber' | 'green' | 'violet' }) {
  const toneMap = {
    blue: 'border-t-[#1f75a8] text-[#1f75a8]',
    amber: 'border-t-[#d88706] text-[#d88706]',
    green: 'border-t-[#24945f] text-[#24945f]',
    violet: 'border-t-[#7c3aed] text-[#7c3aed]',
  }[tone];
  return (
    <div className={`rounded-lg border border-[#e5d8bf] border-t-4 ${toneMap} bg-[#fffdf8] p-4 shadow-sm`}>
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#9a8052]">{title}</div>
      <div className="mt-2 text-2xl font-bold text-[#1f160d]">{value}</div>
      <div className="mt-1 text-xs font-medium text-[#8a7553]">{note}</div>
    </div>
  );
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={event => onChange(event.target.value)}
      className="rounded-lg border border-[#e1d3b6] bg-[#fffdf8] px-3 py-2 text-sm font-semibold text-[#4f3d24] focus:outline-none focus:ring-1 focus:ring-[#c8a43d]"
    >
      <option value="">{`All ${label}s`}</option>
      {options.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}
=======
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
