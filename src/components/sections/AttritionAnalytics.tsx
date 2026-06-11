import { Employee, ExitEmployee } from '../../types/hr';
import { isActiveWorkforceStatus, parseFlexibleDate } from '../../lib/googleSheets';
import { useMemo, useState } from 'react';
import KPICard from '../ui/KPICard';
import SectionCard from '../ui/SectionCard';
import DataTable from '../ui/DataTable';
import { TrendingDown, Clock, BarChart2, AlertCircle, Users } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, FunnelChart, Funnel, LabelList
} from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'];

interface Props { employees: Employee[]; exits: ExitEmployee[] }

export default function AttritionAnalytics({ employees, exits }: Props) {
  const [exitStore, setExitStore] = useState('');
  const [exitType, setExitType] = useState('');
  const [exitReasonFilter, setExitReasonFilter] = useState('');
  const [exitDesignation, setExitDesignation] = useState('');
  const [tenureBand, setTenureBand] = useState('');

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
  const topReason = exitReasons[0]?.name ?? 'N/A';
  const topReasonCount = exitReasons[0]?.count ?? 0;
  const exitGender = buildGenderExitSplit(employees, exits);
  const voluntaryData = [
    { name: 'Voluntary', value: voluntary },
    { name: 'Non-Voluntary', value: nonVoluntary },
  ];
  const reasonCenterData = exitReasons.slice(0, 6);
  const exitStores = useMemo(() => [...new Set(exits.map(e => e.store))].sort(), [exits]);
  const filteredExits = useMemo(() => exits.filter(exit => {
    if (exitStore && exit.store !== exitStore) return false;
    if (exitType && exit.exitType !== exitType) return false;
    if (exitReasonFilter && exit.exitReason !== exitReasonFilter) return false;
    if (exitDesignation && exit.designation !== exitDesignation) return false;
    if (tenureBand === '0-6' && exit.tenureAtExit > 6) return false;
    if (tenureBand === '6-12' && (exit.tenureAtExit <= 6 || exit.tenureAtExit > 12)) return false;
    if (tenureBand === '12+' && exit.tenureAtExit <= 12) return false;
    return true;
  }), [exits, exitStore, exitType, exitReasonFilter, tenureBand]);

  const funnelData = [
    { name: 'Total Workforce', value: employees.length + exits.length, fill: '#3b82f6' },
    { name: 'Currently Active', value: employees.filter(e => isActiveWorkforceStatus(e.status)).length, fill: '#10b981' },
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Total Exits" value={totalLeft} subtitle="All time"
          icon={<TrendingDown size={20} />} colorClass="text-red-600" bgClass="bg-red-50" borderClass="border-red-100" />
        <KPICard title="Attrition Rate" value={`${attrPct}%`} subtitle="Overall"
          icon={<BarChart2 size={20} />} colorClass="text-orange-600" bgClass="bg-orange-50" borderClass="border-orange-100" />
        <KPICard title="Avg Tenure at Exit" value={`${avgTenure} mo`} subtitle="Before leaving"
          icon={<Clock size={20} />} colorClass="text-amber-600" bgClass="bg-amber-50" borderClass="border-amber-100" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-[#e5d8bf] bg-[#fffdf8] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#9a8052]">Voluntary Exits</div>
              <div className="mt-1 text-2xl font-bold text-[#1f160d]">{voluntary}</div>
              <div className="text-xs font-semibold text-[#8a7553]">{((voluntary / Math.max(totalLeft, 1)) * 100).toFixed(0)}% of total exits</div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-700">
              <TrendingDown size={22} />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[#e5d8bf] bg-[#fffdf8] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#9a8052]">Non-Voluntary Exits</div>
              <div className="mt-1 text-2xl font-bold text-[#1f160d]">{nonVoluntary}</div>
              <div className="text-xs font-semibold text-[#8a7553]">{((nonVoluntary / Math.max(totalLeft, 1)) * 100).toFixed(0)}% of total exits</div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-700">
              <AlertCircle size={22} />
            </div>
          </div>
        </div>
      </div>

      <SectionCard title="Gender-wise Attrition" subtitle="Exit split by gender">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {exitGender.map(item => (
            <div key={item.gender} className="rounded-xl border border-[#eadfc8] bg-[#fffdf8] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#9a8052]">{item.gender} Attrition</div>
                  <div className="mt-1 text-2xl font-bold text-[#1f160d]">{item.count}</div>
                  <div className="text-xs font-semibold text-[#8a7553]">{item.percent}% of total exits</div>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${item.gender === 'Female' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'}`}>
                  <Users size={22} />
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[#f1ebde] overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.gender === 'Female' ? 'bg-pink-500' : 'bg-blue-500'}`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Leaving Job Analysis Center"
        subtitle="Strategic view of why employees leave"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-[#eadfc8] bg-[#fffdf8] p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#9a8052]">Top Leaving Reason</div>
            <div className="mt-2 font-serif text-2xl font-bold text-[#1f160d]">{topReason}</div>
            <div className="mt-1 text-sm font-semibold text-[#8a7553]">{topReasonCount} exits</div>
            <div className="mt-3 h-2 rounded-full bg-[#f1ebde] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#ef4444]"
                style={{ width: `${Math.min(100, Math.round((topReasonCount / Math.max(totalLeft, 1)) * 100))}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#eadfc8] bg-[#fffdf8] p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#9a8052]">Voluntary vs Non-Voluntary</div>
            <div className="mt-3 space-y-3">
              <MiniSplit label="Voluntary" count={voluntary} total={totalLeft} color="#f97316" />
              <MiniSplit label="Non-Voluntary" count={nonVoluntary} total={totalLeft} color="#ef4444" />
            </div>
          </div>

          <div className="rounded-xl border border-[#eadfc8] bg-[#fffdf8] p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#9a8052]">Leaving Patterns</div>
            <div className="mt-3 space-y-2">
              {[
                { label: 'Short Tenure Exits', value: exits.filter(e => e.tenureAtExit <= 6).length },
                { label: 'Mid Tenure Exits', value: exits.filter(e => e.tenureAtExit > 6 && e.tenureAtExit <= 12).length },
                { label: 'Long Tenure Exits', value: exits.filter(e => e.tenureAtExit > 12).length },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between rounded-lg bg-[#fbf6eb] px-3 py-2">
                  <span className="text-xs font-semibold text-[#4f3d24]">{item.label}</span>
                  <span className="text-sm font-bold text-[#1f160d]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

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
                label={({ name, percent }) => `${name} ${(Math.round(((percent ?? 0) * 100)))}%`} labelLine={false}>
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
            <BarChart data={reasonCenterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={55} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Count">
                {reasonCenterData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
      <SectionCard title="Exit Register" subtitle={`${filteredExits.length} employee exits`}>
        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-4">
          <SelectFilter label="Store" value={exitStore} options={exitStores} onChange={setExitStore} />
          <SelectFilter label="Type" value={exitType} options={['Voluntary', 'Non-Voluntary']} onChange={setExitType} />
          <SelectFilter label="Reason" value={exitReasonFilter} options={[...new Set(exits.map(e => e.exitReason))].sort()} onChange={setExitReasonFilter} />
          <SelectFilter label="Designation" value={exitDesignation} options={[...new Set(exits.map(e => e.designation))].sort()} onChange={setExitDesignation} />
          <SelectFilter label="Tenure" value={tenureBand} options={['0-6', '6-12', '12+']} onChange={setTenureBand} />
        </div>
        <DataTable
          columns={columns as Parameters<typeof DataTable>[0]['columns']}
          data={filteredExits as unknown as Record<string, unknown>[]}
          pageSize={10}
          searchFields={['name', 'id', 'store', 'exitReason'] as never[]}
        />
      </SectionCard>
    </div>
  );
}

function normalizeId(value: string) {
  return value.trim().toLowerCase();
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
  exits.forEach(e => {
    const parsed = parseFlexibleDate(e.dol);
    if (!parsed) return;
    const k = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
    if (months[k]) months[k].exits++;
  });
  return Object.values(months);
}

function MiniSplit({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-[#4f3d24]">{label}</span>
        <span className="text-xs font-bold text-[#1f160d]">{count} ({pct}%)</span>
      </div>
      <div className="h-2 rounded-full bg-[#f1ebde] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function buildGenderExitSplit(employees: Employee[], exits: ExitEmployee[]) {
  const counts: Record<'Male' | 'Female', number> = { Male: 0, Female: 0 };
  exits.forEach(exit => {
    const gender = exit.gender ?? employees.find(employee => normalizeId(employee.id) === normalizeId(exit.id))?.gender;
    if (gender === 'Male' || gender === 'Female') counts[gender] += 1;
  });
  const total = Math.max(exits.length, 1);
  return (['Male', 'Female'] as const).map(gender => ({
    gender,
    count: counts[gender],
    percent: Math.round((counts[gender] / total) * 100),
  }));
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
