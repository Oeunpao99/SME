import { LockKeyhole, Menu, Moon, X } from 'lucide-react'

export default function Header({ title, onMenuClick, children }) {
  return (
    <header className="bg-white border-b border-slate-200 shrink-0">
      <div className="flex items-center justify-between h-[52px] px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-md hover:bg-slate-100 text-slate-500 cursor-pointer" title="Open menu">
            <Menu size={20} />
          </button>
          <button className="hidden lg:flex w-9 h-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50" title="Close page">
            <X size={18} />
          </button>
          <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="hidden sm:inline font-medium">10:45 AM</span>
          <span className="hidden sm:block h-5 w-px bg-slate-200" />
          <span className="hidden md:inline font-medium">Jun 12, 2026</span>
          <div className="hidden sm:flex h-9 rounded-md bg-slate-100 p-1 text-xs font-extrabold">
            <button className="px-3 rounded text-slate-600">EN</button>
            <button className="px-3 rounded bg-primary text-slate-950 shadow-sm">ខ្មែរ</button>
          </div>
          <button className="w-9 h-9 rounded-md border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 cursor-pointer flex items-center justify-center" title="Theme">
            <Moon size={17} />
          </button>
          <button className="w-9 h-9 rounded-md border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 cursor-pointer flex items-center justify-center" title="Lock">
            <LockKeyhole size={17} />
          </button>
        </div>
      </div>
      {children && (
        <div className="px-4 lg:px-6 pb-2 flex items-center gap-2">{children}</div>
      )}
    </header>
  )
}
