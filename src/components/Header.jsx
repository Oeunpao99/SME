import { Bell, ChevronDown, Menu, Search } from 'lucide-react'

export default function Header({ title, onMenuClick, children }) {
  return (
    <header className="bg-gradient-to-r from-[#005a33] via-[#00683a] to-[#004626] text-white shrink-0 shadow-sm shadow-emerald-950/20">
      <div className="flex items-center justify-between h-[48px] px-4 lg:px-5 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-md hover:bg-white/10 text-white cursor-pointer" title="Open menu">
            <Menu size={20} />
          </button>
          <button className="hidden lg:flex w-8 h-8 items-center justify-center rounded-md text-emerald-50 hover:text-white hover:bg-white/10" title="Toggle menu">
            <Menu size={17} />
          </button>
          <h2 className="text-sm font-extrabold text-white truncate">{title}</h2>
        </div>

        <div className="flex items-center justify-end gap-3 flex-1">
          <div className="hidden md:block relative w-full max-w-md">
            <input
              aria-label="Search"
              placeholder="Search anything..."
              className="w-full h-8 rounded-md bg-white/13 border border-white/10 pl-3 pr-9 text-xs text-white placeholder:text-emerald-50/55 outline-none focus:bg-white/18 focus:border-white/25"
            />
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-50/75" />
          </div>
          <button className="relative w-8 h-8 rounded-md hover:bg-white/10 flex items-center justify-center text-emerald-50" title="Notifications">
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#00683a]" />
          </button>
          <div className="hidden sm:flex items-center gap-2 pl-1">
            <img src="/images/Owner-Admin.png" alt="Owner Admin" className="w-7 h-7 rounded-full object-cover ring-1 ring-white/35" />
            <span className="text-xs font-semibold text-white">Owner Admin</span>
            <ChevronDown size={14} className="text-emerald-50/70" />
          </div>
        </div>
      </div>
      {children && (
        <div className="px-4 lg:px-5 pb-2 flex items-center gap-2">{children}</div>
      )}
    </header>
  )
}
