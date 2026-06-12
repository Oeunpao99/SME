export default function KPICard({ title, value, icon: Icon, color = 'text-primary', bg = 'bg-primary/10', subtitle }) {
  return (
    <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5 min-h-[132px] flex items-start justify-between gap-4 hover:shadow-md transition-shadow">
      <div className="min-w-0 pt-1">
        <p className="text-xs text-slate-500 font-semibold">{title}</p>
        <p className="text-xl font-bold text-slate-950 mt-2 leading-none">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-3 truncate font-medium">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
        <Icon size={22} className={color} />
      </div>
    </div>
  )
}
