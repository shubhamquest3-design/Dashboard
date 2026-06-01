import { Employee, ExitEmployee } from '../../types/hr';
import KPICard from '../ui/KPICard';
import SectionCard from '../ui/SectionCard';
import DataTable from '../ui/DataTable';
import { TrendingDown, Clock, BarChart2, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, FunnelChart, Funnel, LabelList
} from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'];

interface Props { employees: Employee[]; exits: ExitEmployee[] }

export default function AttritionAnalytics({ employees, exits }: Props) {
  const totalLeft = exits.length;
  const attrPct = ((totalLeft / Math.max(employees.length + totalLeft, 1)) * 100).toFixed(1);
  const voluntary = exits.filter(e => e.exitType === 'Voluntary').length;
  const nonVoluntary = exits.filter(e => e.exitType === 'Non-Voluntary').length;
  const avgTenure = exits.length > 0
    ? (exits.reduce((s, e) => s + e.tenureAtExit, 0) / exits.length).toFixed(1)
    : '0';

  const monthlyTrend = buildMonthlyAttrition(exits);
  const storeAttrition = groupCount(exits, 'store').slice(0, 8);
  const locationAttrition = groupCount(exits, 'location').slice(0, 8);
  const exitReasons = groupCount(exits, 'exitReason');
  const voluntaryData = [
    { name: 'Voluntary', value: voluntary },
    { name: 'Non-Voluntary', value: nonVoluntary },
  ];

  const funnelData = [
    { name: 'Total Workforce', value: employees.length + exits.length, fill: '#3b82f6' },
    { name: 'Currently Active', value: employees.filter(e => e.status === 'Active').length, fill: '#10b981' },
    { name: 'Exits (All Time)', value: totalLeft, fill: '#ef4444' },
    { name: 'Voluntary Exits', value: voluntary, fill: '#f97316' },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'store', label: 'Store' },
    { key: 'designation', label: 'Designation' },
    { key: 'doj', label: 'DOJ' },
    { key: 'dol', label: 'DOL' },
    { key: 'exitType', label: 'Type', render: (r: ExitEmployee) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium
        ${r.exitType === 'Voluntary' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'}`}>
        {r.exitType}
      </span>
    )},
    { key: 'exitReason', label: 'Reason' },
    { key: 'tenureAtExit', label: 'Tenure (Months)', render: (r: ExitEmployee) => `${r.tenureAtExit} mo` },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Exits" value={totalLeft} subtitle="All time"
          icon={<TrendingDown size={20} />} colorClass="text-red-600" bgClass="bg-red-50" borderClass="border-red-100" />
        <KPICard title="Attrition Rate" value={`${attrPct}%`} subtitle="Overall"
          icon={<BarChart2 size={20} />} colorClass="text-orange-600" bgClass="bg-orange-50" borderClass="border-orange-100" />
        <KPICard title="Avg Tenure at Exit" value={`${avgTenure} mo`} subtitle="Before leaving"
          icon={<Clock size={20} />} colorClass="text-amber-600" bgClass="bg-amber-50" borderClass="border-amber-100" />
        <KPICard title="Voluntary Exits" value={`${((voluntary / Math.max(totalLeft, 1)) * 100).toFixed(0)}%`}
          subtitle={`${voluntary} of ${totalLeft}`}
          icon={<AlertCircle size={20} />} colorClass="text-blue-600" bgClass="bg-blue-50" borderClass="border-blue-100" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Monthly Attrition Trend" subtitle="Exits per month (last 12 months)" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="exits" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444' }} name="Exits" />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Voluntary vs Non-Voluntary">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={voluntaryData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                <Cell fill="#f97316" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Store-wise Attrition" subtitle="Exits by store">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={storeAttrition} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Exits">
                {storeAttrition.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Exit Reason Analysis" subtitle="Why employees leave">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={exitReasons.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={55} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Count">
                {exitReasons.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Exit Funnel */}
      <SectionCard title="Workforce Exit Funnel" subtitle="From total workforce to voluntary exits">
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={280}>
            <FunnelChart>
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Funnel dataKey="value" data={funnelData} isAnimationActive>
                <LabelList position="center" fill="#fff" stroke="none" dataKey="name" style={{ fontSize: 12, fontWeight: 600 }} />
                {funnelData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {/* Location Attrition */}
      <SectionCard title="Location-wise Attrition">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={locationAttrition}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#ef4444" name="Exits" />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Exit Table */}
      <SectionCard title="Exit Register" subtitle={`${exits.length} employee exits`}>
        <DataTable
          columns={columns as Parameters<typeof DataTable>[0]['columns']}
          data={exits as unknown as Record<string, unknown>[]}
          pageSize={10}
          searchFields={['name', 'id', 'store', 'exitReason'] as never[]}
        />
      </SectionCard>
    </div>
  );
}

function groupCount(arr: ExitEmployee[], key: keyof ExitEmployee) {
  const map: Record<string, number> = {};
  arr.forEach(e => { const v = String(e[key]); map[v] = (map[v] || 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
}

function buildMonthlyAttrition(exits: ExitEmployee[]) {
  const months: Record<string, { month: string; exits: number }> = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { month: d.toLocaleString('default', { month: 'short', year: '2-digit' }), exits: 0 };
  }
  exits.forEach(e => { const k = e.dol.substring(0, 7); if (months[k]) months[k].exits++; });
  return Object.values(months);
}
