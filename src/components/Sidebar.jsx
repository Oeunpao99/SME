import {
  LayoutDashboard, ShoppingCart, Package, Boxes, Truck,
  Users, UserCog, BarChart3, ChevronLeft, ChevronRight,
  FileText,
} from 'lucide-react'

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
  { label: 'POS / Selling', icon: ShoppingCart, page: 'pos' },
  { label: 'Products', icon: Package, page: 'products' },
  { label: 'Inventory', icon: Boxes, page: 'inventory' },
  { label: 'Purchases', icon: Truck, page: 'purchases' },
  { label: 'Sales Invoices', icon: FileText, page: 'sales' },
  { label: 'Customers', icon: Users, page: 'customers' },
  { label: 'Staff', icon: UserCog, page: 'staff' },
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
        bg-white border-r border-gray-200 w-56
        transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-gray-100 shrink-0">
          <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-white text-xs font-bold">
            S
          </div>
          <span className="font-semibold text-gray-800 text-sm tracking-wide">SME Hub</span>
        </div>

        <div className="flex-1 py-2 overflow-y-auto">
          {menuItems.map(item => {
            const active = currentPage === item.page
            return (
              <button
                key={item.page}
                onClick={() => { onNavigate(item.page); onMobileClose?.() }}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors cursor-pointer relative
                  ${active
                    ? 'text-primary font-medium bg-primary/5'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {active && (
                  <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-r" />
                )}
                <item.icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5">
            <img src="/images/Owner-Admin.png" alt="User" className="w-8 h-8 rounded-full object-cover" />
            <div className="text-xs">
              <p className="font-medium text-gray-700">Owner Admin</p>
              <p className="text-gray-400">Administrator</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
