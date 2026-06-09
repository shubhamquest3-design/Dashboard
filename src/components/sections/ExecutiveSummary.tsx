import { Employee, ExitEmployee } from '../../types/hr';
import {
  Users, UserCheck, CreditCard,
  AlertTriangle, Building2, ClipboardList,
  ShieldCheck, Award, Star
} from 'lucide-react';
import { isActiveWorkforceStatus } from '../../lib/googleSheets';

interface Props {
  employees: Employee[];
  exits: ExitEmployee[];
}

export default function ExecutiveSummary({ employees, exits }: Props) {
  const active = employees.filter(e => isActiveWorkforceStatus(e.status)).length;
  const male = employees.filter(e => e.gender === 'Male').length;
  const female = employees.filter(e => e.gender === 'Female').length;
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
      </div>

      {/* Alert Banner */}
      {(pendingConfirm > 0 || hdfcPending > 0) && (
        <div className="rounded-lg border border-[#d8bd6d] bg-[#fbf3d5] px-5 py-4 flex items-start gap-3 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-[#9b332a] ring-1 ring-[#e4cc83]">
            <AlertTriangle size={18} />
          </div>
          <div className="text-sm text-[#6d5520]">
            <p className="font-bold text-[#1f160d]">Action required</p>
            {pendingConfirm > 0 && <span>{pendingConfirm} employee{pendingConfirm > 1 ? 's' : ''} pending/overdue confirmation. </span>}
            {hdfcPending > 0 && <span>{hdfcPending} employee{hdfcPending > 1 ? 's' : ''} yet to complete HDFC bank onboarding.</span>}
          </div>
        </div>
      )}
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
    </div>
  );
}

function pct(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function buildStoreTable(employees: Employee[]) {
  const stores: Record<string, { store: string; total: number; active: number; male: number; female: number; hdfcPending: number }> = {};
  employees.forEach(e => {
    if (!stores[e.store]) stores[e.store] = { store: e.store, total: 0, active: 0, male: 0, female: 0, hdfcPending: 0 };
    stores[e.store].total++;
    if (isActiveWorkforceStatus(e.status)) stores[e.store].active++;
    if (e.gender === 'Male') stores[e.store].male++;
    if (e.gender === 'Female') stores[e.store].female++;
    if (e.hdfcAccount === 'No') stores[e.store].hdfcPending++;
  });
  return Object.values(stores).sort((a, b) => b.total - a.total);
}
