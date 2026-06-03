import { Employee, ExitEmployee } from '../../types/hr';
<<<<<<< HEAD
import {
  Users, UserCheck, CreditCard,
  AlertTriangle, Building2, ClipboardList,
  ShieldCheck, Hourglass, Award, Star
} from 'lucide-react';
=======
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
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc

interface Props {
  employees: Employee[];
  exits: ExitEmployee[];
}

export default function ExecutiveSummary({ employees, exits }: Props) {
  const active = employees.filter(e => e.status === 'Active').length;
  const male = employees.filter(e => e.gender === 'Male').length;
  const female = employees.filter(e => e.gender === 'Female').length;
<<<<<<< HEAD
  const hdfcPending = employees.filter(e => e.hdfcAccount === 'No').length;
  const pendingConfirm = employees.filter(e => e.confirmationStatus === 'Pending' || e.confirmationStatus === 'Overdue').length;
  const totalStores = new Set(employees.map(e => e.store)).size;
  const inactive = employees.filter(e => e.status !== 'Active').length;
  const confirmed = employees.filter(e => e.confirmationStatus === 'Confirmed').length;
  const hdfcDone = employees.filter(e => e.hdfcAccount === 'Yes').length;
  const totalEverEmployed = employees.length + exits.length;
  const activePct = pct(active, employees.length);
  const femalePct = pct(female, employees.length);
  const malePct = pct(male, employees.length);
  const confirmationPct = pct(confirmed, employees.length);
  const hdfcPct = pct(hdfcDone, employees.length);
  const retentionPct = pct(employees.length, totalEverEmployed);
  const storesNeedAttention = buildStoreTable(employees).filter(row => row.hdfcPending > 0).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-6">
        <ReadinessCard title="Total Stores" value={totalStores} note={`${totalStores} active locations`} progress={100} tone="gold" icon={<Building2 size={20} />} trend="All stores covered" positive />
        <ReadinessCard title="Employees Planned" value={employees.length} note="Current workforce" progress={100} tone="blue" icon={<ClipboardList size={20} />} trend={`Across ${totalStores} stores`} positive />
        <ReadinessCard title="Employees Active" value={active} note={`${activePct}% active`} progress={activePct} tone="green" icon={<UserCheck size={20} />} trend={`${inactive} inactive/on leave`} positive={inactive === 0} />
        <ReadinessCard title="Female Emp. %" value={`${femalePct}%`} note={`${female} employees`} progress={femalePct} tone="gold" icon={<Users size={20} />} trend={`${female} employees`} positive />
        <ReadinessCard title="Male Emp. %" value={`${malePct}%`} note={`${male} employees`} progress={malePct} tone="blue" icon={<Users size={20} />} trend={`${male} employees`} positive />
        <ReadinessCard title="Verification Done" value={confirmed} note={`${confirmationPct}% confirmed`} progress={confirmationPct} tone="green" icon={<ShieldCheck size={20} />} trend={`${pendingConfirm} pending`} positive={pendingConfirm === 0} />
        <ReadinessCard title="Verification Pending" value={pendingConfirm} note="Expedite confirmation" progress={pct(pendingConfirm, employees.length)} tone="amber" icon={<AlertTriangle size={20} />} trend="Expedite BGV" positive={pendingConfirm === 0} inverse />
        <ReadinessCard title="HDFC Done %" value={`${hdfcPct}%`} note={`${hdfcDone} employees`} progress={hdfcPct} tone="green" icon={<CreditCard size={20} />} trend={`${hdfcDone} completed`} positive />
        <ReadinessCard title="HDFC Pending %" value={`${pct(hdfcPending, employees.length)}%`} note={`${hdfcPending} employees`} progress={pct(hdfcPending, employees.length)} tone="red" icon={<CreditCard size={20} />} trend={`${hdfcPending} pending`} positive={hdfcPending === 0} inverse />
        <ReadinessCard title="Avg Readiness" value={`${retentionPct}%`} note="Composite score" progress={retentionPct} tone="amber" icon={<Award size={20} />} trend="Composite score" positive />
        <ReadinessCard title="Stores Ready" value={`${Math.max(totalStores - storesNeedAttention, 0)}/${totalStores}`} note={`${storesNeedAttention} need attention`} progress={pct(Math.max(totalStores - storesNeedAttention, 0), totalStores)} tone="red" icon={<Star size={20} />} trend={`${storesNeedAttention} need attention`} positive={storesNeedAttention === 0} inverse />
=======
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
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
      </div>

      {/* Alert Banner */}
      {(pendingConfirm > 0 || hdfcPending > 0) && (
<<<<<<< HEAD
        <div className="rounded-lg border border-[#d8bd6d] bg-[#fbf3d5] px-5 py-4 flex items-start gap-3 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-[#9b332a] ring-1 ring-[#e4cc83]">
            <AlertTriangle size={18} />
          </div>
          <div className="text-sm text-[#6d5520]">
            <p className="font-bold text-[#1f160d]">Action required</p>
=======
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <span className="font-bold">Action Required: </span>
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
            {pendingConfirm > 0 && <span>{pendingConfirm} employee{pendingConfirm > 1 ? 's' : ''} pending/overdue confirmation. </span>}
            {hdfcPending > 0 && <span>{hdfcPending} employee{hdfcPending > 1 ? 's' : ''} yet to complete HDFC bank onboarding.</span>}
          </div>
        </div>
      )}
<<<<<<< HEAD
    </div>
  );
}

function ReadinessCard({
  title,
  value,
  note,
  progress,
  tone,
  icon,
  trend,
  positive,
  inverse = false,
}: {
  title: string;
  value: string | number;
  note: string;
  progress: number;
  tone: 'gold' | 'blue' | 'green' | 'amber' | 'red';
  icon: React.ReactNode;
  trend: string;
  positive: boolean;
  inverse?: boolean;
}) {
  const toneMap = {
    gold: { border: 'border-t-[#c8a43d]', ring: '#c8a43d', icon: 'text-[#c8a43d]' },
    blue: { border: 'border-t-[#1f75a8]', ring: '#1f75a8', icon: 'text-[#1f75a8]' },
    green: { border: 'border-t-[#24945f]', ring: '#24945f', icon: 'text-[#24945f]' },
    amber: { border: 'border-t-[#d88706]', ring: '#d88706', icon: 'text-[#d88706]' },
    red: { border: 'border-t-[#b9342b]', ring: '#b9342b', icon: 'text-[#b9342b]' },
  }[tone];
  const ringValue = Math.max(0, Math.min(progress, 100));
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (ringValue / 100) * circumference;

  return (
    <div className={`min-h-[172px] rounded-lg border border-[#e5d8bf] border-t-4 ${toneMap.border} bg-[#fffdf8] p-5 shadow-[0_10px_24px_rgba(62,44,23,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(62,44,23,0.14)]`}>
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className={`${toneMap.icon}`}>{icon}</div>
          <div className="relative h-16 w-16 shrink-0">
            <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
              <circle cx="32" cy="32" r={radius} fill="none" stroke="#f1ebde" strokeWidth="5" />
              <circle
                cx="32"
                cy="32"
                r={radius}
                fill="none"
                stroke={toneMap.ring}
                strokeLinecap="round"
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-[#1f160d]">
              {Math.round(ringValue)}%
            </div>
          </div>
        </div>

        <div>
          <p className="font-serif text-4xl font-bold leading-none text-[#1f160d]">{value}</p>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-[#9a8052]">{title}</p>
          <p className="mt-1 text-xs font-semibold text-[#8a7553]">{note}</p>
        </div>

        <p className={`text-xs font-black ${positive ? 'text-[#20945d]' : 'text-[#b9342b]'}`}>
          {positive ? '▲' : '▼'} {inverse && positive ? 'On track' : trend}
        </p>
      </div>
=======

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
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
    </div>
  );
}

<<<<<<< HEAD
function pct(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
=======
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
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
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
