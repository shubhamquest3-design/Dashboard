import { ActiveSection } from '../../types/hr';
import {
  LayoutDashboard, Users, TrendingDown, CheckSquare,
  CreditCard, Target, Settings, ChevronLeft, ChevronRight,
  Building2, BarChart3, FileText
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
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-5 space-y-2 px-3 overflow-y-auto no-scrollbar">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative
              ${active === item.id
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <span className="shrink-0 text-base">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && item.badge && item.badge > 0 ? (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5">
                {item.badge}
              </span>
            ) : null}
            {collapsed && item.badge && item.badge > 0 ? (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg" />
            ) : null}
            {collapsed && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm font-semibold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity border border-slate-700">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Toggle */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
