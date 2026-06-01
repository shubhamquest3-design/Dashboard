import { Employee, ExitEmployee } from '../../types/hr';
import KPICard from '../ui/KPICard';
import SectionCard from '../ui/SectionCard';
import {
  Users, UserCheck, TrendingDown, Clock, CreditCard,
  AlertTriangle, UserPlus, Building2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

interface Props {
  employees: Employee[];
  exits: ExitEmployee[];
}

export default function ExecutiveSummary({ employees, exits }: Props) {
  const active = employees.filter(e => e.status === 'Active').length;
  const male = employees.filter(e => e.gender === 'Male').length;
  const female = employees.filter(e => e.gender === 'Female').length;
  const attritionPct = employees.length > 0 ? ((exits.length / (employees.length + exits.length)) * 100).toFixed(1) : '0';
  const hdfcPending = employees.filter(e => e.hdfcAccount === 'No').length;
  const pendingConfirm = employees.filter(e => e.confirmationStatus === 'Pending' || e.confirmationStatus === 'Overdue').length;
  const thisMonthHires = employees.filter(e => {
    const d = new Date(e.doj);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Monthly joining trend (last 12 months)
  const joiningTrend = buildMonthlyTrend(employees, exits);

  // Store distribution
  const storeData = groupCount(employees, 'store').slice(0, 8);

  // Tenure distribution
  const tenureBuckets = ['0-3 Months', '3-6 Months', '6-12 Months', '1-2 Years', '2+ Years'];
  const tenureData = tenureBuckets.map(b => ({
    name: b,
    count: employees.filter(e => e.tenure === b).length,
  }));

  // Gender pie
  const genderData = [
    { name: 'Male', value: male },
    { name: 'Female', value: female },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Employees" value={employees.length} subtitle="All records"
          icon={<Users size={24} />} colorClass="text-blue-600" bgClass="bg-gradient-to-br from-blue-50 to-blue-100" borderClass="border-blue-200" />
        <KPICard title="Active Employees" value={active} subtitle={`${((active / Math.max(employees.length, 1)) * 100).toFixed(0)}% of total`}
          icon={<UserCheck size={24} />} colorClass="text-emerald-600" bgClass="bg-gradient-to-br from-emerald-50 to-emerald-100" borderClass="border-emerald-200" />
        <KPICard title="Attrition Rate" value={`${attritionPct}%`} subtitle={`${exits.length} exits total`}
          icon={<TrendingDown size={24} />} colorClass="text-red-600" bgClass="bg-gradient-to-br from-red-50 to-red-100" borderClass="border-red-200" />
        <KPICard title="New Hires (MTD)" value={thisMonthHires} subtitle="This month"
          icon={<UserPlus size={24} />} colorClass="text-cyan-600" bgClass="bg-gradient-to-br from-cyan-50 to-cyan-100" borderClass="border-cyan-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Male Employees" value={male} subtitle={`${((male / Math.max(employees.length, 1)) * 100).toFixed(0)}% of workforce`}
          icon={<Users size={20} />} colorClass="text-blue-600" bgClass="bg-gradient-to-br from-blue-50 to-blue-100" borderClass="border-blue-200" size="sm" />
        <KPICard title="Female Employees" value={female} subtitle={`${((female / Math.max(employees.length, 1)) * 100).toFixed(0)}% of workforce`}
          icon={<Users size={20} />} colorClass="text-pink-600" bgClass="bg-gradient-to-br from-pink-50 to-pink-100" borderClass="border-pink-200" size="sm" />
        <KPICard title="Confirm. Pending" value={pendingConfirm} subtitle="Needs action"
          icon={<Clock size={20} />} colorClass="text-amber-600" bgClass="bg-gradient-to-br from-amber-50 to-amber-100" borderClass="border-amber-200" size="sm" />
        <KPICard title="HDFC Pending" value={hdfcPending} subtitle="Account setup needed"
          icon={<CreditCard size={20} />} colorClass="text-orange-600" bgClass="bg-gradient-to-br from-orange-50 to-orange-100" borderClass="border-orange-200" size="sm" />
      </div>

      {/* Alert Banner */}
      {(pendingConfirm > 0 || hdfcPending > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <span className="font-bold">Action Required: </span>
            {pendingConfirm > 0 && <span>{pendingConfirm} employee{pendingConfirm > 1 ? 's' : ''} pending/overdue confirmation. </span>}
            {hdfcPending > 0 && <span>{hdfcPending} employee{hdfcPending > 1 ? 's' : ''} yet to complete HDFC bank onboarding.</span>}
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Joining Trend" subtitle="Last 12 months" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={joiningTrend}>
              <defs>
                <linearGradient id="joinGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="joins" stroke="#3b82f6" strokeWidth={2} fill="url(#joinGrad)" name="Joins" />
              <Area type="monotone" dataKey="exits" stroke="#ef4444" strokeWidth={2} fill="none" strokeDasharray="4 2" name="Exits" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Gender Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={genderData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                <Cell fill="#3b82f6" />
                <Cell fill="#ec4899" />
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Store-wise Employee Count" subtitle="Top 8 stores">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={storeData} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Employees">
                {storeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Tenure Distribution" subtitle="Employee tenure breakdown">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={tenureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Employees">
                {tenureData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Store Summary Table */}
      <SectionCard title="Store Overview" subtitle="Employee count by store and status">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-2 text-gray-500 font-semibold uppercase tracking-wide">Store</th>
                <th className="text-right pb-2 text-gray-500 font-semibold uppercase tracking-wide">Total</th>
                <th className="text-right pb-2 text-gray-500 font-semibold uppercase tracking-wide">Active</th>
                <th className="text-right pb-2 text-gray-500 font-semibold uppercase tracking-wide">Male</th>
                <th className="text-right pb-2 text-gray-500 font-semibold uppercase tracking-wide">Female</th>
                <th className="text-right pb-2 text-gray-500 font-semibold uppercase tracking-wide">HDFC Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {buildStoreTable(employees).map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 font-medium text-gray-800 flex items-center gap-1.5">
                    <Building2 size={12} className="text-gray-400" />{row.store}
                  </td>
                  <td className="py-2.5 text-right font-bold text-gray-900">{row.total}</td>
                  <td className="py-2.5 text-right text-emerald-600 font-medium">{row.active}</td>
                  <td className="py-2.5 text-right text-blue-600">{row.male}</td>
                  <td className="py-2.5 text-right text-pink-600">{row.female}</td>
                  <td className="py-2.5 text-right">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${row.hdfcPending > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {row.hdfcPending}
                    </span>
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

function groupCount(arr: Employee[], key: keyof Employee) {
  const map: Record<string, number> = {};
  arr.forEach(e => { const v = String(e[key]); map[v] = (map[v] || 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
}

function buildMonthlyTrend(employees: Employee[], exits: ExitEmployee[]) {
  const months: Record<string, { month: string; joins: number; exits: number }> = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    months[key] = { month: label, joins: 0, exits: 0 };
  }
  employees.forEach(e => {
    const k = e.doj.substring(0, 7);
    if (months[k]) months[k].joins++;
  });
  exits.forEach(e => {
    const k = e.dol.substring(0, 7);
    if (months[k]) months[k].exits++;
  });
  return Object.values(months);
}

function buildStoreTable(employees: Employee[]) {
  const stores: Record<string, { store: string; total: number; active: number; male: number; female: number; hdfcPending: number }> = {};
  employees.forEach(e => {
    if (!stores[e.store]) stores[e.store] = { store: e.store, total: 0, active: 0, male: 0, female: 0, hdfcPending: 0 };
    stores[e.store].total++;
    if (e.status === 'Active') stores[e.store].active++;
    if (e.gender === 'Male') stores[e.store].male++;
    if (e.gender === 'Female') stores[e.store].female++;
    if (e.hdfcAccount === 'No') stores[e.store].hdfcPending++;
  });
  return Object.values(stores).sort((a, b) => b.total - a.total);
}
