interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export default function SectionCard({ title, subtitle, children, className = '', action }: SectionCardProps) {
  return (
    <div className={`rounded-lg border border-[#e5d8bf] bg-[#fffdf8] shadow-[0_10px_24px_rgba(62,44,23,0.08)] transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between border-b border-[#eee4d0] px-7 py-5">
        <div>
          <h3 className="font-serif text-lg font-bold tracking-tight text-[#1f160d]">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm font-medium text-[#8a7553]">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-7">{children}</div>
    </div>
  );
}
