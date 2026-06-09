import { ApprovedWorkforce, Employee, ExitEmployee, StoreDetail } from '../../types/hr';
import KPICard from '../ui/KPICard';
import SectionCard from '../ui/SectionCard';
import DataTable from '../ui/DataTable';
import { Users, MapPin, Briefcase, Calendar } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { isActiveWorkforceStatus } from '../../lib/googleSheets';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#84cc16', '#ec4899'];

interface Props { employees: Employee[]; exits: ExitEmployee[]; storeDetails?: StoreDetail[]; approvedRows?: ApprovedWorkforce[] }

export default function WorkforceAnalytics({ employees, exits, storeDetails = [], approvedRows = [] }: Props) {
  const today = new Date();

  const activeEmployees = employees.filter(e => isActiveWorkforceStatus(e.status));
  const actualActive = activeEmployees.length;
  const approvedTotal = approvedRows.reduce((sum, row) => sum + row.approvedSM + row.approvedASM + row.approvedSSA + row.approvedSA + row.approvedOA, 0);
  const workforceGap = approvedTotal - actualActive;
  const workforcePct = approvedTotal > 0 ? Math.round((actualActive / approvedTotal) * 100) : 0;
  const stores = groupCount(activeEmployees, 'store');
  const regions = groupCount(activeEmployees, 'location');
  const designations = groupCount(activeEmployees, 'designation');
  const departments = groupCount(activeEmployees, 'department');
  const excludedCount = employees.length - actualActive;
  const tenureBuckets = ['0-3 Months', '3-6 Months', '6-12 Months', '1-2 Years', '2+ Years'];
  const tenureData = tenureBuckets.map(b => ({
    name: b, count: employees.filter(e => e.tenure === b).length,
  }));
  const monthlyJoining = buildMonthlyJoining(employees);
  const ageGroups = [
    { name: '18-24', count: employees.filter(e => (e.age ?? 0) >= 18 && (e.age ?? 0) <= 24).length },
    { name: '25-30', count: employees.filter(e => (e.age ?? 0) >= 25 && (e.age ?? 0) <= 30).length },
    { name: '31-35', count: employees.filter(e => (e.age ?? 0) >= 31 && (e.age ?? 0) <= 35).length },
    { name: '36-40', count: employees.filter(e => (e.age ?? 0) >= 36 && (e.age ?? 0) <= 40).length },
    { name: '40+', count: employees.filter(e => (e.age ?? 0) > 40).length },
  ];
  const statusData = [
    { name: 'Active/Working', value: actualActive },
    { name: 'Excluded', value: excludedCount },
  ];
  const radarData = departments.slice(0, 7).map(d => ({
    dept: d.name.length > 12 ? `${d.name.substring(0, 12)}...` : d.name,
    count: d.count,
  }));
  const storeStatus = buildStoreStatus(employees, exits, storeDetails);

  const columns = [
    { key: 'id', label: 'EMP ID' },
    { key: 'name', label: 'Name' },
    { key: 'gender', label: 'Gender', render: (r: Employee) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.gender === 'Male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
        {r.gender}
      </span>
    )},
    { key: 'doj', label: 'DOJ' },
    {
      key: 'tenureDays', label: 'Tenure (Days)',
      render: (r: Employee) => {
        if (!r.doj) return <span className="text-gray-400">—</span>;
        const diff = Math.floor((today.getTime() - new Date(r.doj).getTime()) / (1000 * 60 * 60 * 24));
        return <span className="font-medium text-gray-700">{diff.toLocaleString()} <span className="text-gray-400 text-xs">days</span></span>;
      },
    },
    { key: 'designation', label: 'Designation' },
    { key: 'store', label: 'Store' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status', render: (r: Employee) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium
        ${isActiveWorkforceStatus(r.status) ? 'bg-emerald-50 text-emerald-700'
        : r.status === 'On Leave' ? 'bg-amber-50 text-amber-700'
        : 'bg-gray-100 text-gray-600'}`}>
        {r.status}
      </span>
    )},
    { key: 'tenure', label: 'Tenure Bucket' },
    { key: 'hiringSource', label: 'Source' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KPICard title="Approved Workforce" value={approvedTotal} subtitle="Approved headcount from sheet"
          icon={<Users size={20} />} colorClass="text-blue-600" bgClass="bg-blue-50" borderClass="border-blue-100" />
        <KPICard title="Actual Active Workforce" value={actualActive} subtitle={`${workforcePct}% of approved workforce`}
          icon={<Users size={20} />} colorClass="text-emerald-600" bgClass="bg-emerald-50" borderClass="border-emerald-100" />
        <KPICard title="Workforce Gap" value={workforceGap} subtitle="Approved vs active"
          icon={<Calendar size={20} />} colorClass="text-amber-600" bgClass="bg-amber-50" borderClass="border-amber-100" />
        <KPICard title="Workforce %" value={`${workforcePct}%`} subtitle="Active against approved"
          icon={<Briefcase size={20} />} colorClass="text-cyan-600" bgClass="bg-cyan-50" borderClass="border-cyan-100" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KPICard title="Stores Covered" value={stores.length} subtitle="Unique active stores"
          icon={<MapPin size={20} />} colorClass="text-emerald-600" bgClass="bg-emerald-50" borderClass="border-emerald-100" />
        <KPICard title="Regions Covered" value={regions.length} subtitle="Unique regions"
          icon={<MapPin size={20} />} colorClass="text-cyan-600" bgClass="bg-cyan-50" borderClass="border-cyan-100" />
        <KPICard title="Designations" value={designations.length} subtitle="Unique roles"
          icon={<Briefcase size={20} />} colorClass="text-violet-600" bgClass="bg-violet-50" borderClass="border-violet-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Region-wise Headcount" subtitle="Active workforce per region">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={regions.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Employees">
                {regions.slice(0, 10).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Employment Status" subtitle="Active / Excluded">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}>
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Monthly Joining Trend" subtitle="New hires per month" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyJoining}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="New Joins" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Tenure Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={tenureData} cx="50%" cy="50%" outerRadius={80} paddingAngle={2} dataKey="count">
                {tenureData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Designation Breakdown" subtitle="Top designations by headcount">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={designations.slice(0, 8)} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#06b6d4" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Age Distribution" subtitle="Workforce age profile">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ageGroups}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Employees">
                {ageGroups.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Department Distribution" subtitle="Radar overview of department headcounts">
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart cx="50%" cy="50%" outerRadius={100} data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="dept" tick={{ fontSize: 11 }} />
            <Radar name="Employees" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
          </RadarChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title="Store-wise Workforce" subtitle="Approved vs active headcount by store">
        <DataTable
          columns={[
            { key: 'store', label: 'Store' },
            { key: 'location', label: 'Location' },
            { key: 'active', label: 'Active' },
            { key: 'exits', label: 'Exits' },
            {
              key: 'status',
              label: 'Status',
              render: (row: StoreStatusRow) => (
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  row.status === 'Existing' ? 'bg-emerald-100 text-emerald-700'
                    : row.status === 'Exiting' ? 'bg-rose-100 text-rose-700'
                    : 'bg-violet-100 text-violet-700'
                }`}>
                  {row.status}
                </span>
              ),
            },
            {
              key: 'activeEmployeeDetails',
              label: 'Active Employees',
              sortable: false,
              render: (row: StoreStatusRow) => <EmployeeList value={row.activeEmployeeDetails} />,
            },
            {
              key: 'exitEmployeeDetails',
              label: 'Exit Details',
              sortable: false,
              render: (row: StoreStatusRow) => <EmployeeList value={row.exitEmployeeDetails} />,
            },
          ] as Parameters<typeof DataTable>[0]['columns']}
          data={storeStatus as unknown as Record<string, unknown>[]}
          pageSize={8}
          searchFields={['store', 'location', 'status', 'activeEmployeeDetails', 'exitEmployeeDetails'] as never[]}
        />
      </SectionCard>

      <SectionCard title="Employee Directory" subtitle={`${employees.length} employees`}
        action={<span className="text-xs text-gray-400 font-medium">Sortable & Searchable</span>}>
        <DataTable
          columns={columns as Parameters<typeof DataTable>[0]['columns']}
          data={employees as unknown as Record<string, unknown>[]}
          pageSize={12}
          searchFields={['name', 'id', 'designation', 'store', 'location'] as never[]}
        />
      </SectionCard>
    </div>
  );
}

function groupCount(arr: Employee[], key: keyof Employee) {
  const map: Record<string, number> = {};
  arr.forEach(e => { const v = String(e[key]); map[v] = (map[v] || 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
}

function buildMonthlyJoining(employees: Employee[]) {
  const months: Record<string, { month: string; count: number }> = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { month: d.toLocaleString('default', { month: 'short', year: '2-digit' }), count: 0 };
  }
  employees.forEach(e => { const k = e.doj.substring(0, 7); if (months[k]) months[k].count++; });
  return Object.values(months);
}

type StoreStatusRow = {
  store: string;
  location: string;
  active: number;
  exits: number;
  status: 'Existing' | 'Exiting' | 'NSO';
  activeEmployeeDetails: string;
  exitEmployeeDetails: string;
};

function buildStoreStatus(employees: Employee[], exits: ExitEmployee[], storeDetails: StoreDetail[]): StoreStatusRow[] {
  const storeMap = new Map<string, {
    store: string;
    location: string;
    statusOverride?: StoreStatusRow['status'];
    activeEmployees: Employee[];
    exitEmployees: ExitEmployee[];
  }>();

  const ensureStore = (store: string, location = '') => {
    const key = normalizeKeyPart(store);
    const entry = storeMap.get(key) ?? { store, location, activeEmployees: [], exitEmployees: [] };
    if (!entry.location && location) entry.location = location;
    storeMap.set(key, entry);
    return entry;
  };

  employees.forEach(employee => {
    if (!employee.store) return;
    const entry = ensureStore(employee.store, employee.location);
    if (isActiveWorkforceStatus(employee.status)) entry.activeEmployees.push(employee);
  });

  exits.forEach(exit => {
    if (!exit.store) return;
    const entry = ensureStore(exit.store, exit.location);
    entry.exitEmployees.push(exit);
  });

  storeDetails.forEach(detail => {
    if (!detail.store) return;
    const entry = ensureStore(detail.store, detail.location);
    entry.statusOverride = detail.status;
  });

  return Array.from(storeMap.values()).map(entry => {
    const active = entry.activeEmployees.length;
    const storeExits = entry.exitEmployees.length;
    const status: StoreStatusRow['status'] = entry.statusOverride ?? (active === 0 ? 'NSO' : storeExits > active ? 'Exiting' : 'Existing');
    return {
      store: entry.store,
      location: entry.location,
      active,
      exits: storeExits,
      status,
      activeEmployeeDetails: formatPeople(entry.activeEmployees),
      exitEmployeeDetails: formatPeople(entry.exitEmployees),
    };
  }).sort((a, b) => statusRank(a.status) - statusRank(b.status) || b.active - a.active || b.exits - a.exits);
}

function EmployeeList({ value }: { value: string }) {
  return <div className="max-w-[260px] whitespace-normal leading-5 text-gray-700">{value || '-'}</div>;
}

function formatPeople(rows: Array<Employee | ExitEmployee>) {
  return rows.map(row => `${row.name}${row.designation ? ` (${row.designation})` : ''}`).join(', ');
}

function statusRank(status: StoreStatusRow['status']) {
  return status === 'Exiting' ? 0 : status === 'NSO' ? 1 : 2;
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
