export default function KPICard({ title, value, icon: Icon, color = 'text-primary', bg = 'bg-primary/10', subtitle }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
        <Icon size={22} className={color} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{title}</p>
        <p className="text-lg font-semibold text-gray-800 mt-0.5">{value}</p>
        {subtitle && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{subtitle}</p>}
      </div>
    </div>
  )
}
