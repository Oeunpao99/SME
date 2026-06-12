import {
  LayoutDashboard, ShoppingCart, Package, Boxes, Truck,
  Users, UserCog, BarChart3, Building2,
  Zap, Wifi, LogOut, LockKeyhole,
} from 'lucide-react'

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
  { label: 'POS / Selling', icon: ShoppingCart, page: 'pos' },
  { label: 'Products', icon: Package, page: 'products' },
  { label: 'Inventory', icon: Boxes, page: 'inventory' },
  { label: 'Purchases', icon: Truck, page: 'purchases' },
  { label: 'Customers', icon: Users, page: 'customers' },
  { label: 'Staff', icon: UserCog, page: 'staff' },
  { label: 'Suppliers', icon: Building2, page: 'suppliers' },
  { label: 'Reports', icon: BarChart3, page: 'reports' },
]

export default function Sidebar({ currentPage, onNavigate, mobileOpen, onMobileClose }) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onMobileClose} />
      )}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 flex flex-col
        bg-white border-r border-slate-200 w-60
        transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-[73px] flex items-center gap-3 px-5 border-b border-slate-200 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-slate-950 shadow-sm">
            <Zap size={20} fill="currentColor" strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <p className="font-extrabold text-slate-900 text-base tracking-wide">SME POS</p>
            <p className="text-xs font-semibold text-slate-500">v2.4.1</p>
          </div>
        </div>

        <div className="flex-1 py-6 px-3 overflow-y-auto space-y-1.5">
          {menuItems.map(item => {
            const active = currentPage === item.page
            return (
              <button
                key={item.page}
                onClick={() => { onNavigate(item.page); onMobileClose?.() }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 text-sm transition-colors cursor-pointer relative rounded-md
                  ${active
                    ? 'text-white font-bold bg-primary shadow-sm shadow-emerald-100'
                    : 'text-slate-700 font-semibold hover:text-slate-950 hover:bg-slate-50'
                  }
                `}
              >
                <item.icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                <span className="truncate">{item.label}</span>
                {item.page === 'pos' && (
                  <span className={`ml-auto text-[10px] px-2 py-1 rounded-full font-extrabold ${active ? 'bg-white/20 text-white' : 'bg-emerald-50 text-primary-dark'}`}>
                    POS
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="h-8 rounded-md bg-emerald-50 text-primary-dark flex items-center gap-2 px-3 text-xs font-extrabold">
            <Wifi size={14} />
            ONLINE
          </div>
          <div className="flex items-center gap-3">
            <img src="/images/Owner-Admin.png" alt="User" className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-100" />
            <div className="text-xs min-w-0 flex-1">
              <p className="font-bold text-slate-800 truncate">Administrator</p>
              <p className="text-slate-500 truncate">Support Admin</p>
            </div>
            <button className="text-slate-400 hover:text-slate-700" title="Lock session">
              <LockKeyhole size={16} />
            </button>
            <button className="text-slate-400 hover:text-slate-700" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
