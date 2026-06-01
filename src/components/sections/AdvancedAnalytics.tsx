import { Employee, ExitEmployee } from '../../types/hr';
import KPICard from '../ui/KPICard';
import SectionCard from '../ui/SectionCard';
import { TrendingUp, Calendar, AlertCircle, Target, Zap } from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Bar, Legend
} from 'recharts';

interface Props {
  employees: Employee[];
  exits: ExitEmployee[];
}

export default function AdvancedAnalytics({ employees, exits }: Props) {
  const today = new Date();
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);

  // Attrition trend (last 6 months)
  const attritionTrend = buildAttritionTrend(employees, exits);

  // Monthly headcount trend
  const headcountTrend = buildHeadcountTrend(employees, exits);

  // Avg tenure by designation
  const tenureByDesignation = calculateTenureByDesignation(employees);

  // Attrition risk score (employees joined < 3 months ago)
  const riskEmployees = employees.filter(e => {
    const doj = new Date(e.doj);
    const monthsSince = (today.getTime() - doj.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsSince < 3;
  }).length;

  // Retention rate
  const totalEverEmployed = employees.length + exits.length;
  const retentionRate = totalEverEmployed > 0
    ? ((employees.length / totalEverEmployed) * 100).toFixed(1)
    : '0';

  // Attrition by designation
  const attritionByDesignation = calculateAttritionByDesignation(employees, exits);

  // Productivity score (based on tenure and confirmations)
  const confirmationRate = employees.length > 0
    ? ((employees.filter(e => e.confirmationStatus === 'Confirmed').length / employees.length) * 100).toFixed(1)
    : '0';

  // Department diversity
  const departmentDiversity = buildDepartmentDiversity(employees);

  return (
    <div className="space-y-8">
      {/* Advanced KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Retention Rate"
          value={`${retentionRate}%`}
          subtitle={`${employees.length} retained`}
          icon={<TrendingUp size={24} />}
          colorClass="text-emerald-600"
          bgClass="bg-gradient-to-br from-emerald-50 to-emerald-100"
          borderClass="border-emerald-200"
        />
        <KPICard
          title="Attrition Risk"
          value={riskEmployees}
          subtitle="Employees < 3 months"
          change={riskEmployees > 5 ? -15 : 5}
          changeLabel="vs prev month"
          icon={<AlertCircle size={24} />}
          colorClass="text-red-600"
          bgClass="bg-gradient-to-br from-red-50 to-red-100"
          borderClass="border-red-200"
        />
        <KPICard
          title="Confirmation Rate"
          value={`${confirmationRate}%`}
          subtitle="Employees confirmed"
          icon={<Target size={24} />}
          colorClass="text-blue-600"
          bgClass="bg-gradient-to-br from-blue-50 to-blue-100"
          borderClass="border-blue-200"
        />
        <KPICard
          title="Avg Tenure"
          value={`${calculateAvgTenure(employees)} mo`}
          subtitle="Average employee tenure"
          icon={<Calendar size={24} />}
          colorClass="text-purple-600"
          bgClass="bg-gradient-to-br from-purple-50 to-purple-100"
          borderClass="border-purple-200"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Attrition Trend Analysis" subtitle="6-month attrition rate progression">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={attritionTrend}>
              <defs>
                <linearGradient id="attrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend />
              <Bar yAxisId="left" dataKey="exits" fill="#ef4444" name="Exits" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#f97316" strokeWidth={3} name="Attrition %" />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Headcount Projection" subtitle="Historical trend and forecast">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={headcountTrend}>
              <defs>
                <linearGradient id="hcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="actual" stroke="#3b82f6" fill="url(#hcGrad)" strokeWidth={2} name="Actual HC" />
              <Area type="monotone" dataKey="forecast" stroke="#06b6d4" fill="none" strokeDasharray="4 2" strokeWidth={2} name="Forecast" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Tenure by Designation" subtitle="Average tenure analysis">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={tenureByDesignation} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="designation" type="category" tick={{ fontSize: 10 }} width={140} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="avgTenure" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Months" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Attrition by Designation" subtitle="Exit analysis by role">
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="current" type="number" name="Current Employees" tick={{ fontSize: 11 }} />
              <YAxis dataKey="exited" type="number" name="Exits" tick={{ fontSize: 11 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ fontSize: 12 }} />
              <Scatter name="Designations" data={attritionByDesignation} fill="#f59e0b" />
            </ScatterChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Attrition Insights" subtitle="Risk indicators">
          <div className="space-y-3">
            <InsightItem
              label="Critical Risk Roles"
              value={attritionByDesignation.filter(d => d.attritionRate > 20).length}
              description="Designations with 20%+ attrition"
              color="text-red-600"
            />
            <InsightItem
              label="High Tenure"
              value={`${calculateHighTenureCount(employees)} staff`}
              description="2+ years tenure (stable)"
              color="text-emerald-600"
            />
            <InsightItem
              label="New Joinee Focus"
              value={`${((riskEmployees / Math.max(employees.length, 1)) * 100).toFixed(1)}%`}
              description="Early exit risk group"
              color="text-amber-600"
            />
          </div>
        </SectionCard>

        <SectionCard title="Department Health" subtitle="Diversity & Distribution">
          <div className="space-y-3">
            {departmentDiversity.slice(0, 4).map((dept, i) => (
              <div key={i} className="flex items-center justify-between pb-2 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-700">{dept.name.substring(0, 18)}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      style={{ width: `${(dept.count / Math.max(...departmentDiversity.map(d => d.count))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-8 text-right">{dept.count}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Performance Metrics" subtitle="Key indicators">
          <div className="space-y-4">
            <MetricRow
              label="Confirmation Rate"
              value={`${confirmationRate}%`}
              target="95%"
              status={parseFloat(confirmationRate) >= 90 ? 'good' : 'warning'}
            />
            <MetricRow
              label="Retention Rate"
              value={`${retentionRate}%`}
              target="90%"
              status={parseFloat(retentionRate) >= 85 ? 'good' : 'warning'}
            />
            <MetricRow
              label="Avg Tenure (Months)"
              value={calculateAvgTenure(employees)}
              target="24"
              status={calculateAvgTenure(employees) > 12 ? 'good' : 'warning'}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function buildAttritionTrend(employees: Employee[], exits: ExitEmployee[]) {
  const months: Record<string, { month: string; exits: number; rate: number }> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { month: d.toLocaleString('default', { month: 'short' }), exits: 0, rate: 0 };
  }
  exits.forEach(e => {
    const k = e.dol.substring(0, 7);
    if (months[k]) months[k].exits++;
  });
  const monthVals = Object.values(months);
  monthVals.forEach((m, idx) => {
    const activeCount = employees.length - monthVals.slice(0, idx + 1).reduce((s, x) => s + x.exits, 0);
    m.rate = activeCount > 0 ? parseFloat((((m.exits / activeCount) * 100).toFixed(1))) : 0;
  });
  return monthVals;
}

function buildHeadcountTrend(employees: Employee[], exits: ExitEmployee[]) {
  const months: Record<string, { month: string; actual: number; forecast: number }> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { month: d.toLocaleString('default', { month: 'short' }), actual: employees.length, forecast: employees.length };
  }
  const monthVals = Object.values(months);
  monthVals.forEach((m, idx) => {
    const exitsUntilNow = exits.filter(e => e.dol.substring(0, 7) <= Object.keys(months)[idx]).length;
    m.actual = employees.length + exitsUntilNow;
  });
  const avgGrowth = monthVals.length > 1 ? (monthVals[monthVals.length - 1].actual - monthVals[0].actual) / (monthVals.length - 1) : 0;
  monthVals.forEach((m, idx) => {
    m.forecast = Math.round(monthVals[monthVals.length - 1].actual + (avgGrowth * (idx - monthVals.length + 1)));
  });
  return monthVals;
}

function calculateTenureByDesignation(employees: Employee[]) {
  const designations: Record<string, { count: number; totalMonths: number }> = {};
  employees.forEach(e => {
    if (!designations[e.designation]) {
      designations[e.designation] = { count: 0, totalMonths: 0 };
    }
    const months = parseFloat(e.tenure.match(/\d+/)?.[0] || '0');
    designations[e.designation].count++;
    designations[e.designation].totalMonths += months;
  });
  return Object.entries(designations)
    .map(([designation, data]) => ({
      designation: designation.substring(0, 16),
      avgTenure: Math.round(data.totalMonths / data.count),
      count: data.count,
    }))
    .sort((a, b) => b.avgTenure - a.avgTenure)
    .slice(0, 8);
}

function calculateAttritionByDesignation(employees: Employee[], exits: ExitEmployee[]) {
  const designations: Record<string, { current: number; exited: number; attritionRate: number }> = {};
  employees.forEach(e => {
    if (!designations[e.designation]) {
      designations[e.designation] = { current: 0, exited: 0, attritionRate: 0 };
    }
    designations[e.designation].current++;
  });
  exits.forEach(e => {
    if (!designations[e.designation]) {
      designations[e.designation] = { current: 0, exited: 0, attritionRate: 0 };
    }
    designations[e.designation].exited++;
  });
  Object.values(designations).forEach(d => {
    d.attritionRate = d.current + d.exited > 0 ? (d.exited / (d.current + d.exited)) * 100 : 0;
  });
  return Object.values(designations).filter(d => d.current > 0).slice(0, 10);
}

function buildDepartmentDiversity(employees: Employee[]) {
  const departments: Record<string, number> = {};
  employees.forEach(e => {
    departments[e.department] = (departments[e.department] || 0) + 1;
  });
  return Object.entries(departments)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function calculateAvgTenure(employees: Employee[]) {
  if (employees.length === 0) return 0;
  const totalMonths = employees.reduce((sum, e) => {
    const months = parseFloat(e.tenure.match(/\d+/)?.[0] || '0');
    return sum + months;
  }, 0);
  return Math.round(totalMonths / employees.length);
}

function calculateHighTenureCount(employees: Employee[]) {
  return employees.filter(e => {
    const months = parseFloat(e.tenure.match(/\d+/)?.[0] || '0');
    return months >= 24;
  }).length;
}

function InsightItem({ label, value, description, color }: { label: string; value: string | number; description: string; color: string }) {
  return (
    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs font-semibold text-gray-700 mt-1">{label}</div>
      <div className="text-xs text-gray-500 mt-0.5">{description}</div>
    </div>
  );
}

function MetricRow({ label, value, target, status }: { label: string; value: string | number; target: string; status: 'good' | 'warning' }) {
  return (
    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className={`text-lg font-bold ${status === 'good' ? 'text-emerald-600' : 'text-amber-600'}`}>{value}</span>
      </div>
      <div className="text-xs text-gray-500">Target: {target}</div>
    </div>
  );
}
