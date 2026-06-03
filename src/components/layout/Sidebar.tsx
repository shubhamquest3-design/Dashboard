import { ActiveSection } from '../../types/hr';
import {
<<<<<<< HEAD
  LayoutDashboard, TrendingDown, CheckSquare,
  CreditCard, Target, Settings, ChevronLeft, ChevronRight,
  Building2, BarChart3, FileText, Sparkles
=======
  LayoutDashboard, Users, TrendingDown, CheckSquare,
  CreditCard, Target, Settings, ChevronLeft, ChevronRight,
  Building2, BarChart3, FileText
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
} from 'lucide-react';

interface NavItem {
  id: ActiveSection;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  active: ActiveSection;
  onNav: (section: ActiveSection) => void;
  collapsed: boolean;
  onToggle: () => void;
  pendingConfirmations: number;
  hdfcPending: number;
}

export default function Sidebar({ active, onNav, collapsed, onToggle, pendingConfirmations, hdfcPending }: SidebarProps) {
  const navItems: NavItem[] = [
<<<<<<< HEAD
    { id: 'executive', label: 'Executive Summary', icon: <LayoutDashboard size={21} /> },
    { id: 'approved', label: 'Approved Workforce', icon: <CheckSquare size={21} /> },
    { id: 'workforce', label: 'Workforce Analytics', icon: <Building2 size={21} /> },
    { id: 'attrition', label: 'Attrition Analytics', icon: <TrendingDown size={21} /> },
    { id: 'advanced', label: 'Advanced Analytics', icon: <BarChart3 size={21} /> },
    { id: 'reports', label: 'Report Builder', icon: <FileText size={21} /> },
    { id: 'confirmation', label: 'Confirmation Tracker', icon: <CheckSquare size={21} />, badge: pendingConfirmations },
    { id: 'hdfc', label: 'HDFC Bank Tracker', icon: <CreditCard size={21} />, badge: hdfcPending },
    { id: 'hiring', label: 'Hiring Analytics', icon: <Target size={21} /> },
    { id: 'settings', label: 'Settings & Config', icon: <Settings size={21} /> },
  ];

  return (
    <aside className={`relative flex flex-col overflow-hidden bg-[#15110d] text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-[275px]'} min-h-screen shrink-0 border-r border-[#2d2418]`}>
      <div className="pointer-events-none absolute inset-0 opacity-100">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,_rgba(200,164,61,0.22),_transparent_55%)]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-[linear-gradient(to_top,_rgba(0,0,0,0.18),_transparent)]" />
      </div>
      {/* Logo */}
      <div className={`relative flex items-center gap-3 px-6 py-7 border-b border-[#2d2418] ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e6cd7d]/20 bg-gradient-to-br from-[#f1d47b] via-[#c8a43d] to-[#8f6f1b] shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
          <Sparkles size={19} className="text-[#15110d]" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-lg font-bold text-[#f5d56b] leading-tight tracking-[0.24em]">KUSHALS</div>
            <div className="text-[11px] text-[#b68f35] font-semibold tracking-[0.42em] uppercase">HR Readiness</div>
=======
    { id: 'executive', label: 'Executive Summary', icon: <LayoutDashboard size={18} /> },
    { id: 'workforce', label: 'Workforce Analytics', icon: <Users size={18} /> },
    { id: 'attrition', label: 'Attrition Analytics', icon: <TrendingDown size={18} /> },
    { id: 'advanced', label: 'Advanced Analytics', icon: <BarChart3 size={18} /> },
    { id: 'reports', label: 'Report Builder', icon: <FileText size={18} /> },
    { id: 'confirmation', label: 'Confirmation Tracker', icon: <CheckSquare size={18} />, badge: pendingConfirmations },
    { id: 'hdfc', label: 'HDFC Bank Tracker', icon: <CreditCard size={18} />, badge: hdfcPending },
    { id: 'hiring', label: 'Hiring Analytics', icon: <Target size={18} /> },
    { id: 'settings', label: 'Settings & Config', icon: <Settings size={18} /> },
  ];

  return (
    <aside className={`flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} min-h-screen shrink-0 border-r border-slate-800`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-6 border-b border-slate-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
          <Building2 size={18} className="text-white font-bold" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-white leading-tight tracking-tight">North/West HR</div>
            <div className="text-xs text-slate-400 font-medium">Dashboard</div>
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
          </div>
        )}
      </div>

      {/* Nav */}
<<<<<<< HEAD
      <nav className="relative flex-1 py-6 px-4 overflow-y-auto no-scrollbar">
        {!collapsed && <NavGroupLabel label="Overview" />}
        <div className="mt-4 space-y-2">
=======
      <nav className="flex-1 py-5 space-y-2 px-3 overflow-y-auto no-scrollbar">
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
<<<<<<< HEAD
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all duration-300 group relative overflow-hidden
              ${active === item.id
                ? 'bg-gradient-to-r from-[#2f2614] via-[#262013] to-[#1d180e] text-[#f5d56b] ring-1 ring-[#8b6a1f]/60 shadow-[0_12px_24px_rgba(0,0,0,0.28)]'
                : 'text-[#b0a79a] hover:bg-[#221b14] hover:text-[#f5d56b] hover:translate-x-0.5'}`}
          >
            {active === item.id && (
              <span className="absolute inset-y-2 left-2 w-1 rounded-full bg-[#f5d56b] shadow-[0_0_12px_rgba(245,213,107,0.55)]" />
            )}
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate tracking-[0.01em]">{item.label}</span>}
            {!collapsed && item.badge && item.badge > 0 ? (
              <span className="ml-auto rounded-full border border-white/10 bg-[#c2382b] px-2 py-0.5 text-[11px] font-black text-white shadow-[0_8px_16px_rgba(194,56,43,0.18)]">
=======
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative
              ${active === item.id
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <span className="shrink-0 text-base">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && item.badge && item.badge > 0 ? (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5">
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
                {item.badge}
              </span>
            ) : null}
            {collapsed && item.badge && item.badge > 0 ? (
<<<<<<< HEAD
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#c2382b] shadow-lg" />
            ) : null}
            {collapsed && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-[#221b14] text-white text-sm font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity border border-[#3a2d1b]">
=======
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg" />
            ) : null}
            {collapsed && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm font-semibold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity border border-slate-700">
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
                {item.label}
              </div>
            )}
          </button>
        ))}
<<<<<<< HEAD
        </div>
      </nav>

      {/* Toggle */}
      <div className="relative p-4 border-t border-[#2d2418]">
        {!collapsed && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#3a2d1b] bg-gradient-to-r from-[#201912] to-[#16110c] px-3 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#f1d47b] to-[#c8a43d] text-sm font-bold text-[#15110d]">HR</div>
            <div>
              <div className="text-sm font-bold text-[#f5efe5]">HRBP Admin</div>
              <div className="text-xs font-medium text-[#b68f35]">Dashboard Lead</div>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2.5 rounded-2xl text-[#b68f35] hover:bg-[#221b14] hover:text-[#f5d56b] transition-all duration-200 border border-[#2d2418]"
=======
      </nav>

      {/* Toggle */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
<<<<<<< HEAD

function NavGroupLabel({ label }: { label: string }) {
  return <div className="px-2 text-[11px] font-bold uppercase tracking-[0.35em] text-[#6f5827]">{label}</div>;
}
=======
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
