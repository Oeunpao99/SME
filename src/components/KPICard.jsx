export default function KPICard({ title, value, icon: Icon, color = 'text-primary', bg = 'bg-primary/10', subtitle }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200/80 shadow-sm p-4 min-h-[116px] flex items-start justify-between gap-4 hover:shadow-md hover:border-emerald-200 transition-all">
      <div className="min-w-0 pt-1">
        <p className="text-xs text-slate-500 font-semibold">{title}</p>
        <p className="text-2xl font-extrabold text-slate-950 mt-2 leading-none">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-3 truncate font-medium">{subtitle}</p>}
      </div>
      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0`}>
        <Icon size={20} className={color} />
      </div>
    </div>
  )
}
