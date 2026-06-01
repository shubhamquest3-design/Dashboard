import { Employee } from '../../types/hr';
import KPICard from '../ui/KPICard';
import SectionCard from '../ui/SectionCard';
import DataTable from '../ui/DataTable';
import { CheckSquare, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface Props { employees: Employee[] }

export default function ConfirmationTracker({ employees }: Props) {
  const today = new Date();

  const confirmed = employees.filter(e => e.confirmationStatus === 'Confirmed');
  const pending = employees.filter(e => e.confirmationStatus === 'Pending');
  const overdue = employees.filter(e => e.confirmationStatus === 'Overdue');

  const dueThisWeek = pending.filter(e => {
    const due = new Date(e.confirmationDueDate);
    const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  const dueThisMonth = pending.filter(e => {
    const due = new Date(e.confirmationDueDate);
    return due.getMonth() === today.getMonth() && due.getFullYear() === today.getFullYear();
  });

  const statusData = [
    { name: 'Confirmed', value: confirmed.length },
    { name: 'Pending', value: pending.length },
    { name: 'Overdue', value: overdue.length },
  ];

  // Month-wise confirmations due
  const monthlyData = buildMonthlyConfirmation(employees);

  // Store-wise pending
  const storePending = buildStorePending(overdue.concat(pending));

  const columns = [
    { key: 'id', label: 'EMP ID' },
    { key: 'name', label: 'Employee Name' },
    { key: 'store', label: 'Store' },
    { key: 'doj', label: 'DOJ' },
    {
      key: 'tenureDays', label: 'Tenure (Days)',
      render: (r: Employee) => {
        if (!r.doj) return <span className="text-gray-400">—</span>;
        const diff = Math.floor((today.getTime() - new Date(r.doj).getTime()) / (1000 * 60 * 60 * 24));
        return <span className="font-medium text-gray-700">{diff.toLocaleString()} <span className="text-gray-400 text-xs">days</span></span>;
      },
    },
    { key: 'confirmationDueDate', label: 'Due Date' },
    { key: 'hrbpName', label: 'HRBP' },
    { key: 'reportingManager', label: 'Manager' },
    {
      key: 'confirmationStatus', label: 'Status',
      render: (r: Employee) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold
          ${r.confirmationStatus === 'Confirmed' ? 'bg-emerald-100 text-emerald-700'
          : r.confirmationStatus === 'Overdue' ? 'bg-red-100 text-red-700'
          : 'bg-amber-100 text-amber-700'}`}>
          {r.confirmationStatus}
        </span>
      ),
    },
    {
      key: 'daysUntilDue', label: 'Days Until Due',
      render: (r: Employee) => {
        if (r.confirmationStatus === 'Confirmed') return <span className="text-emerald-600 font-medium">Done</span>;
        const diff = Math.round((new Date(r.confirmationDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return <span className="text-red-600 font-bold">{Math.abs(diff)}d overdue</span>;
        if (diff <= 7) return <span className="text-amber-600 font-bold">{diff}d left</span>;
        return <span className="text-gray-600">{diff}d</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Confirmed" value={confirmed.length}
          subtitle={`${((confirmed.length / Math.max(employees.length, 1)) * 100).toFixed(0)}% of eligible`}
          icon={<CheckCircle size={20} />} colorClass="text-emerald-600" bgClass="bg-emerald-50" borderClass="border-emerald-100" />
        <KPICard title="Pending" value={pending.length} subtitle="Awaiting confirmation"
          icon={<Clock size={20} />} colorClass="text-amber-600" bgClass="bg-amber-50" borderClass="border-amber-100" />
        <KPICard title="Overdue" value={overdue.length} subtitle="Past 60-day mark"
          icon={<AlertTriangle size={20} />} colorClass="text-red-600" bgClass="bg-red-50" borderClass="border-red-100" />
        <KPICard title="Due This Week" value={dueThisWeek.length} subtitle="Need immediate action"
          icon={<CheckSquare size={20} />} colorClass="text-blue-600" bgClass="bg-blue-50" borderClass="border-blue-100" />
      </div>

      {/* Alert: Overdue */}
      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
          <div className="text-sm text-red-800">
            <span className="font-bold">{overdue.length} Overdue Confirmations! </span>
            These employees have passed their 60-day mark without confirmation. Please take immediate action.
          </div>
        </div>
      )}
      {dueThisWeek.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Clock size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <span className="font-bold">{dueThisWeek.length} confirmations due this week. </span>
            {dueThisMonth.length} confirmations due this month. Plan your confirmation reviews.
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Confirmation Status" subtitle="Overall breakdown">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Monthly Due Confirmations" subtitle="By due month" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" stackId="a" />
              <Bar dataKey="overdue" fill="#ef4444" radius={[4, 4, 0, 0]} name="Overdue" stackId="a" />
              <Bar dataKey="confirmed" fill="#10b981" radius={[4, 4, 0, 0]} name="Confirmed" stackId="a" />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Store Pending */}
      <SectionCard title="Store-wise Pending & Overdue" subtitle="Action required by store">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={storePending.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="store" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" stackId="a" />
            <Bar dataKey="overdue" fill="#ef4444" radius={[0, 0, 0, 0]} name="Overdue" stackId="a" />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Overdue Table */}
      {overdue.length > 0 && (
        <SectionCard title="Overdue Confirmations" subtitle="Immediate action required"
          action={<span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">{overdue.length} overdue</span>}>
          <DataTable
            columns={columns as Parameters<typeof DataTable>[0]['columns']}
            data={overdue as unknown as Record<string, unknown>[]}
            pageSize={8}
            searchFields={['name', 'id', 'store', 'hrbpName'] as never[]}
          />
        </SectionCard>
      )}

      {/* Pending Table */}
      <SectionCard title="Upcoming Confirmations" subtitle="Pending confirmation list"
        action={<span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">{pending.length} pending</span>}>
        <DataTable
          columns={columns as Parameters<typeof DataTable>[0]['columns']}
          data={pending as unknown as Record<string, unknown>[]}
          pageSize={10}
          searchFields={['name', 'id', 'store', 'hrbpName'] as never[]}
        />
      </SectionCard>

      {/* Confirmed Table */}
      {confirmed.length > 0 && (
        <SectionCard title="Confirmed Employees" subtitle="Successfully confirmed"
          action={<span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{confirmed.length} confirmed</span>}>
          <DataTable
            columns={columns as Parameters<typeof DataTable>[0]['columns']}
            data={confirmed as unknown as Record<string, unknown>[]}
            pageSize={12}
            searchFields={['name', 'id', 'store', 'hrbpName'] as never[]}
          />
        </SectionCard>
      )}
    </div>
  );
}

function buildMonthlyConfirmation(employees: Employee[]) {
  const map: Record<string, { month: string; pending: number; overdue: number; confirmed: number }> = {};
  const now = new Date();
  for (let i = 5; i >= -3; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map[key] = { month: d.toLocaleString('default', { month: 'short', year: '2-digit' }), pending: 0, overdue: 0, confirmed: 0 };
  }
  employees.forEach(e => {
    const k = e.confirmationDueDate.substring(0, 7);
    if (map[k]) {
      if (e.confirmationStatus === 'Pending') map[k].pending++;
      else if (e.confirmationStatus === 'Overdue') map[k].overdue++;
      else map[k].confirmed++;
    }
  });
  return Object.values(map);
}

function buildStorePending(employees: Employee[]) {
  const map: Record<string, { store: string; pending: number; overdue: number }> = {};
  employees.forEach(e => {
    if (!map[e.store]) map[e.store] = { store: e.store, pending: 0, overdue: 0 };
    if (e.confirmationStatus === 'Pending') map[e.store].pending++;
    if (e.confirmationStatus === 'Overdue') map[e.store].overdue++;
  });
  return Object.values(map).sort((a, b) => (b.pending + b.overdue) - (a.pending + a.overdue));
}
