import { Menu, Bell, Search, Settings } from 'lucide-react'

export default function Header({ title, onMenuClick, children }) {
  return (
    <header className="bg-white border-b border-gray-100 shrink-0">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded hover:bg-gray-100 text-gray-500 cursor-pointer">
            <Menu size={20} />
          </button>
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-md px-2.5 h-8 text-sm">
            <Search size={15} className="text-gray-400" />
            <input
              type="text" placeholder="Search..."
              className="bg-transparent border-none outline-none ml-2 text-xs text-gray-600 w-36"
            />
          </div>
          <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 cursor-pointer">
            <Bell size={18} />
          </button>
          <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 cursor-pointer">
            <Settings size={18} />
          </button>
        </div>
      </div>
      {children && (
        <div className="px-4 lg:px-6 pb-2 flex items-center gap-2">{children}</div>
      )}
    </header>
  )
}
