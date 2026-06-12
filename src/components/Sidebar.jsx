import {
  LayoutDashboard, ShoppingCart, Package, Boxes, Truck,
  Users, UserCog, BarChart3, Building2,
  Store, Wifi, LogOut, LockKeyhole, ChevronRight,
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
        bg-gradient-to-b from-[#005a33] via-[#004728] to-[#00351f] text-white w-60
        shadow-2xl shadow-emerald-950/20
        transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-[60px] flex items-center gap-3 px-4 border-b border-white/10 shrink-0">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-primary-dark shadow-sm">
            <Store size={19} strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <p className="font-extrabold text-white text-base tracking-wide">SME HUB</p>
            <p className="text-[10px] font-semibold text-emerald-100/80">Smart Sales & Inventory</p>
          </div>
        </div>

        <div className="flex-1 py-4 px-2.5 overflow-y-auto space-y-1">
          {menuItems.map(item => {
            const active = currentPage === item.page
            return (
              <button
                key={item.page}
                onClick={() => { onNavigate(item.page); onMobileClose?.() }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors cursor-pointer relative rounded-md
                  ${active
                    ? 'text-white font-bold bg-white/14 shadow-sm ring-1 ring-white/10'
                    : 'text-emerald-50/86 font-semibold hover:text-white hover:bg-white/8'
                  }
                `}
              >
                <item.icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                <span className="truncate">{item.label}</span>
                {item.page === 'pos' && (
                  <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${active ? 'bg-white/20 text-white' : 'bg-white/12 text-emerald-50'}`}>
                    POS
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="p-3.5 border-t border-white/10 space-y-3">
          <div className="h-8 rounded-md bg-white/10 text-emerald-50 flex items-center gap-2 px-3 text-xs font-extrabold">
            <Wifi size={14} />
            ONLINE
          </div>
          <div className="flex items-center gap-3">
            <img src="/images/Owner-Admin.png" alt="User" className="w-9 h-9 rounded-full object-cover ring-2 ring-white/25" />
            <div className="text-xs min-w-0 flex-1">
              <p className="font-bold text-white truncate">Owner Admin</p>
              <p className="text-emerald-100/75 truncate">Super Admin</p>
            </div>
            <ChevronRight size={14} className="text-emerald-100/60" />
            <button className="text-emerald-100/60 hover:text-white" title="Lock session">
              <LockKeyhole size={16} />
            </button>
            <button className="text-emerald-100/60 hover:text-white" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
