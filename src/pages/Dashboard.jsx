import { useMemo } from 'react'
import {
  DollarSign, AlertTriangle, Package,
  Users, ShoppingCart, PieChart, ArrowUpRight,
} from 'lucide-react'
import KPICard from '../components/KPICard'
import DataTable from '../components/DataTable'
import Badge from '../components/Badge'
import { products, sales, formatCurrency, getLowStockProducts, getTodaySales } from '../data/mockData'

export default function Dashboard({ onNavigate }) {
  const filteredSales = sales

  const todaySales = useMemo(() => getTodaySales(filteredSales), [filteredSales])
  const lowStock = useMemo(() => getLowStockProducts(products), [])
  const monthlyRevenue = useMemo(() => filteredSales.reduce((sum, s) => sum + s.total, 0), [filteredSales])

  const topProducts = useMemo(() => {
    const map = {}
    filteredSales.forEach(s => s.items.forEach(item => {
      map[item.product] = (map[item.product] || 0) + item.qty
    }))
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [filteredSales])

  const stockByCategory = useMemo(() => {
    const map = {}
    products.forEach(p => {
      map[p.category] = (map[p.category] || 0) + p.currentStock
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [])

  const kpiData = [
    { title: "Today's Sales", value: formatCurrency(todaySales.reduce((s, x) => s + x.total, 0)), icon: DollarSign, subtitle: `${todaySales.length} transactions` },
    { title: 'Monthly Revenue', value: formatCurrency(monthlyRevenue), icon: ShoppingCart, subtitle: 'Current month' },
    { title: 'Total Products', value: products.length, icon: Package, subtitle: `${products.filter(p => p.status === 'Active').length} active` },
    { title: 'Total Customers', value: 4, icon: Users, subtitle: 'Registered' },
  ]

  const recentSalesCols = [
    { key: 'invoice', label: 'Invoice' },
    { key: 'date', label: 'Date' },
    { key: 'customer', label: 'Customer' },
    { key: 'total', label: 'Total', render: r => formatCurrency(r.total) },
    { key: 'paymentMethod', label: 'Payment' },
    { key: 'paymentStatus', label: 'Status', render: r => <Badge variant={r.paymentStatus}>{r.paymentStatus}</Badge> },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">Jun 12, 2026</p>
        </div>
        <span className="text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-medium">All current</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {kpiData.map((k, i) => (
          <KPICard key={i} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Recent Sales</h3>
            <button onClick={() => onNavigate?.('pos')} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              View POS <ArrowUpRight size={12} />
            </button>
          </div>
          <DataTable columns={recentSalesCols} data={todaySales.slice(0, 5)} />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Stock by Category</h3>
          <div className="flex items-center gap-5">
            <svg width="100" height="100" viewBox="0 0 100 100">
              {(() => {
                const total = stockByCategory.reduce((s, [, v]) => s + v, 0) || 1
                const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4']
                let offset = 0
                const r = 38, circ = 2 * Math.PI * r
                return stockByCategory.map(([cat, val], i) => {
                  const pct = (val / total) * 360
                  const dash = (pct / 360) * circ
                  const seg = (
                    <circle key={cat} cx="50" cy="50" r={r} fill="none" stroke={colors[i % colors.length]} strokeWidth="14"
                      strokeDasharray={`${dash} ${circ - dash}`}
                      transform={`rotate(${offset - 90} 50 50)`} strokeLinecap="round" />
                  )
                  offset += pct
                  return seg
                })
              })()}
              <text x="50" y="47" textAnchor="middle" fill="#374151" fontSize="13" fontWeight="bold">
                {products.length}
              </text>
              <text x="50" y="58" textAnchor="middle" fill="#9ca3af" fontSize="5.5">Products</text>
            </svg>
            <div className="space-y-1.5 flex-1">
              {stockByCategory.map(([cat, val], i) => {
                const colors = ['text-blue-500', 'text-green-500', 'text-amber-500', 'text-purple-500', 'text-red-500', 'text-cyan-500']
                return (
                  <div key={cat} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${colors[i].replace('text', 'bg')} shrink-0`} />
                      <span className="text-gray-500">{cat}</span>
                    </div>
                    <span className="font-medium text-gray-700">{val}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Top Selling Products</h3>
          <div className="space-y-2.5">
            {topProducts.map(([name, qty], i) => {
              const maxQty = Math.max(...topProducts.map(p => p[1]), 1)
              const pct = (qty / maxQty) * 100
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-teal-500']
              return (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{i + 1}. {name}</span>
                    <span className="font-medium text-gray-800">{qty} sold</span>
                  </div>
                  <div className="w-full bg-gray-50 rounded-full h-2">
                    <div className={`${colors[i]} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Out of Stock Risk</h3>
          {lowStock.length > 0 ? (
            <div className="space-y-2">
              {[...lowStock].sort((a, b) => a.currentStock - b.currentStock).slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center gap-2.5 bg-red-50/70 rounded-lg px-3 py-2">
                  <AlertTriangle size={15} className="text-red-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700">{p.name}</p>
                    <p className="text-[11px] text-gray-400">Stock: {p.currentStock} / Min: {p.minStock}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${p.currentStock <= 0 ? 'text-red-600 bg-red-100' : 'text-amber-600 bg-amber-50'}`}>
                    {p.currentStock <= 0 ? 'OUT' : 'LOW'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-6">All products are well-stocked</p>
          )}
        </div>
      </div>
    </div>
  )
}
