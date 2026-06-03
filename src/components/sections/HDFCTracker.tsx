import { useMemo, useState } from 'react';
import { Employee } from '../../types/hr';
import KPICard from '../ui/KPICard';
import SectionCard from '../ui/SectionCard';
import DataTable from '../ui/DataTable';
import { CreditCard, CheckCircle, XCircle, Building2 } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface Props { employees: Employee[] }

export default function HDFCTracker({ employees }: Props) {
  const [activeGroup, setActiveGroup] = useState<'completed' | 'pending' | 'stores' | 'locations' | null>(null);
  const completed = employees.filter(e => e.hdfcAccount === 'Yes');
  const pending = employees.filter(e => e.hdfcAccount === 'No');
  const completionPct = employees.length > 0 ? ((completed.length / employees.length) * 100).toFixed(1) : '0';

  const pieData = [
    { name: 'Account Created', value: completed.length },
    { name: 'Pending', value: pending.length },
  ];

  const storeData = buildStoreData(employees);
  const locationData = buildLocationData(employees);
  const activeRows = useMemo(() => {
    if (activeGroup === 'completed') return completed;
    if (activeGroup === 'pending') return pending;
    return [];
  }, [activeGroup, completed, pending]);

  const columns = [
    { key: 'id', label: 'EMP ID' },
    { key: 'name', label: 'Employee Name' },
    { key: 'store', label: 'Store' },
    { key: 'location', label: 'Location' },
    { key: 'designation', label: 'Designation' },
    { key: 'doj', label: 'DOJ' },
    { key: 'hrbpName', label: 'HRBP' },
    {
      key: 'hdfcAccount', label: 'HDFC Status',
      render: (r: Employee) => (
        <span className={`flex items-center gap-1.5 text-xs font-bold
          ${r.hdfcAccount === 'Yes' ? 'text-emerald-600' : 'text-red-600'}`}>
          {r.hdfcAccount === 'Yes'
            ? <CheckCircle size={13} />
            : <XCircle size={13} />}
          {r.hdfcAccount === 'Yes' ? 'Completed' : 'Pending'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => setActiveGroup('completed')} className="text-left">
          <KPICard title="Accounts Completed" value={completed.length} subtitle={`${completionPct}% done`}
          icon={<CheckCircle size={20} />} colorClass="text-emerald-600" bgClass="bg-emerald-50" borderClass="border-emerald-100" />
        </button>
        <button onClick={() => setActiveGroup('pending')} className="text-left">
          <KPICard title="Accounts Pending" value={pending.length} subtitle="Not yet onboarded"
          icon={<XCircle size={20} />} colorClass="text-red-600" bgClass="bg-red-50" borderClass="border-red-100" />
        </button>
        <KPICard title="Completion Rate" value={`${completionPct}%`} subtitle="Overall"
          icon={<CreditCard size={20} />} colorClass="text-blue-600" bgClass="bg-blue-50" borderClass="border-blue-100" />
        <KPICard title="Stores Affected" value={storeData.filter(s => s.pending > 0).length}
          subtitle="Have pending accounts"
          icon={<Building2 size={20} />} colorClass="text-orange-600" bgClass="bg-orange-50" borderClass="border-orange-100" />
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-800">Overall HDFC Account Completion</span>
          <span className="text-sm font-bold text-blue-600">{completionPct}%</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{completed.length} completed</span>
          <span>{pending.length} pending</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Account Status Split">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Store-wise Status" subtitle="Completed vs Pending" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={storeData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="store" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={45} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" stackId="a" />
              <Bar dataKey="pending" fill="#ef4444" radius={[0, 0, 0, 0]} name="Pending" stackId="a" />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Location Data */}
      <SectionCard title="Location-wise HDFC Status" subtitle="City-level breakdown">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {locationData.map((loc, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="text-xs font-bold text-gray-700 mb-2">{loc.location}</div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-600 font-medium">Done: {loc.completed}</span>
                <span className="text-red-500 font-medium">Pending: {loc.pending}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${loc.total > 0 ? (loc.completed / loc.total) * 100 : 0}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {loc.total > 0 ? ((loc.completed / loc.total) * 100).toFixed(0) : 0}%
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Pending Table */}
      <SectionCard title="Employees with Pending HDFC Account"
        subtitle={`${pending.length} employees need bank account setup`}
        action={<span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">{pending.length} pending</span>}>
        <DataTable
          columns={columns as Parameters<typeof DataTable>[0]['columns']}
          data={pending as unknown as Record<string, unknown>[]}
          pageSize={10}
          searchFields={['name', 'id', 'store', 'location', 'hrbpName'] as never[]}
        />
      </SectionCard>

      {activeGroup && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-6xl rounded-2xl bg-white shadow-2xl max-h-[88vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {activeGroup === 'completed' ? 'Completed HDFC Accounts' : 'Pending HDFC Accounts'}
                </h3>
                <p className="text-sm text-gray-500">{activeRows.length} records</p>
              </div>
              <button onClick={() => setActiveGroup(null)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Close
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(88vh-72px)]">
              <DataTable
                columns={columns as Parameters<typeof DataTable>[0]['columns']}
                data={activeRows as unknown as Record<string, unknown>[]}
                pageSize={12}
                searchFields={['name', 'id', 'store', 'location', 'hrbpName'] as never[]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildStoreData(employees: Employee[]) {
  const map: Record<string, { store: string; completed: number; pending: number; total: number }> = {};
  employees.forEach(e => {
    if (!map[e.store]) map[e.store] = { store: e.store, completed: 0, pending: 0, total: 0 };
    map[e.store].total++;
    if (e.hdfcAccount === 'Yes') map[e.store].completed++;
    else map[e.store].pending++;
  });
  return Object.values(map).sort((a, b) => b.pending - a.pending);
}

function buildLocationData(employees: Employee[]) {
  const map: Record<string, { location: string; completed: number; pending: number; total: number }> = {};
  employees.forEach(e => {
    if (!map[e.location]) map[e.location] = { location: e.location, completed: 0, pending: 0, total: 0 };
    map[e.location].total++;
    if (e.hdfcAccount === 'Yes') map[e.location].completed++;
    else map[e.location].pending++;
  });
  return Object.values(map).sort((a, b) => b.pending - a.pending);
}
