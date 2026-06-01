import { Employee } from '../../types/hr';
import KPICard from '../ui/KPICard';
import SectionCard from '../ui/SectionCard';
import DataTable from '../ui/DataTable';
import { Target, TrendingUp, Users, Zap } from 'lucide-react';
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

interface Props { employees: Employee[] }

export default function HiringAnalytics({ employees }: Props) {
  const sourceBreakdown = buildSourceBreakdown(employees);
  const totalHires = employees.length;
  const topSource = sourceBreakdown[0]?.source ?? 'N/A';
  const monthlyTrend = buildMonthlyBySource(employees);
  const storeSource = buildStoreSource(employees);

  const thisMonthHires = employees.filter(e => {
    const d = new Date(e.doj);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const referralCount = employees.filter(e => e.hiringSource === 'Employee Referral').length;
  const referralPct = ((referralCount / Math.max(totalHires, 1)) * 100).toFixed(0);

  const pieData = sourceBreakdown.map(s => ({ name: s.source, value: s.count }));

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
      </div>

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
        <DataTable
          columns={columns as Parameters<typeof DataTable>[0]['columns']}
          data={employees as unknown as Record<string, unknown>[]}
          pageSize={12}
          searchFields={['name', 'id', 'hiringSource', 'store', 'location', 'designation'] as never[]}
        />
      </SectionCard>
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
