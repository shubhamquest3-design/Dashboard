import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  size?: 'sm' | 'md';
}

export default function KPICard({
  title, value, subtitle, change, changeLabel,
  icon, colorClass, bgClass, borderClass, size = 'md'
}: KPICardProps) {
  return (
<<<<<<< HEAD
    <div className={`rounded-lg border ${borderClass} bg-[#fffdf8] p-6 shadow-[0_10px_24px_rgba(62,44,23,0.08)] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_16px_30px_rgba(62,44,23,0.12)]`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[#8a7553] uppercase tracking-wider">{title}</p>
          <p className={`font-serif font-bold text-[#1f160d] mt-2 ${size === 'sm' ? 'text-2xl' : 'text-4xl'}`}>{value}</p>
          {subtitle && <p className="text-sm text-[#7a684b] mt-1 font-medium">{subtitle}</p>}
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-3 px-2 py-1 rounded-lg bg-[#f7f1e7]">
=======
    <div className={`bg-white rounded-2xl border-2 ${borderClass} p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          <p className={`font-bold text-gray-900 mt-2 ${size === 'sm' ? 'text-2xl' : 'text-4xl'}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-600 mt-1 font-medium">{subtitle}</p>}
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-3 px-2 py-1 rounded-lg bg-gray-50">
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
              {change > 0 ? (
                <TrendingUp size={14} className="text-emerald-600 font-bold" />
              ) : change < 0 ? (
                <TrendingDown size={14} className="text-red-600 font-bold" />
              ) : (
                <Minus size={14} className="text-gray-400" />
              )}
              <span className={`text-sm font-semibold ${change > 0 ? 'text-emerald-700' : change < 0 ? 'text-red-700' : 'text-gray-600'}`}>
                {change > 0 ? '+' : ''}{change}% {changeLabel}
              </span>
            </div>
          )}
        </div>
<<<<<<< HEAD
        <div className={`w-14 h-14 rounded-lg ${bgClass} flex items-center justify-center shrink-0 flex-col items-center justify-center`}>
=======
        <div className={`w-14 h-14 rounded-2xl ${bgClass} flex items-center justify-center shrink-0 flex-col items-center justify-center`}>
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
          <span className={`${colorClass} text-2xl`}>{icon}</span>
        </div>
      </div>
    </div>
  );
}
