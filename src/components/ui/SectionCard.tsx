interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export default function SectionCard({ title, subtitle, children, className = '', action }: SectionCardProps) {
  return (
    <div className={`bg-white rounded-2xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
        <div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-0.5 font-medium">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-7">{children}</div>
    </div>
  );
}
