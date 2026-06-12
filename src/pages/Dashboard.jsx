import { useMemo } from 'react'
import {
  DollarSign, AlertTriangle, Package,
  Users, ShoppingCart, ArrowUpRight, WalletCards, Boxes, CalendarDays,
} from 'lucide-react'
import KPICard from '../components/KPICard'
import DataTable from '../components/DataTable'
import Badge from '../components/Badge'
import { products, sales, customers, payments, formatCurrency, getLowStockProducts, getTodaySales } from '../data/mockData'

export default function Dashboard({ onNavigate }) {
  const filteredSales = sales

  const todaySales = useMemo(() => getTodaySales(filteredSales), [filteredSales])
  const lowStock = useMemo(() => getLowStockProducts(products), [])
  const monthlyRevenue = useMemo(() => filteredSales.reduce((sum, s) => sum + s.total, 0), [filteredSales])
  const outstandingDebt = useMemo(() => payments.reduce((sum, p) => sum + p.balance, 0), [])

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
    { title: 'Total Sales Today', value: formatCurrency(todaySales.reduce((s, x) => s + x.total, 0)), icon: DollarSign, subtitle: '+12.5% vs yesterday', color: 'text-emerald-700', bg: 'bg-emerald-100' },
    { title: 'Monthly Revenue', value: formatCurrency(monthlyRevenue), icon: ShoppingCart, subtitle: '+8.3% vs last month', color: 'text-blue-700', bg: 'bg-blue-100' },
    { title: 'Outstanding Debt', value: formatCurrency(outstandingDebt), icon: WalletCards, subtitle: '-2.1% vs last month', color: 'text-orange-700', bg: 'bg-orange-100' },
    { title: 'Low Stock Products', value: lowStock.length, icon: AlertTriangle, subtitle: 'View low stock', color: 'text-red-700', bg: 'bg-red-100' },
    { title: 'Total Products', value: products.length, icon: Package, subtitle: `${products.filter(p => p.status === 'Active').length} active products`, color: 'text-purple-700', bg: 'bg-purple-100' },
    { title: 'Total Customers', value: customers.length, icon: Users, subtitle: 'Active customers', color: 'text-cyan-700', bg: 'bg-cyan-100' },
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of your business</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-2 text-xs text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-md font-semibold shadow-sm">
          <CalendarDays size={14} className="text-slate-400" />
          Jun 12, 2026
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3">
        {kpiData.map((k, i) => (
          <KPICard key={i} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="bg-white rounded-lg border border-slate-200/80 shadow-sm p-4 xl:col-span-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-950">Recent Sales</h3>
            <button onClick={() => onNavigate?.('pos')} className="text-xs text-primary-dark hover:text-primary flex items-center gap-1 font-bold">
              View All <ArrowUpRight size={12} />
            </button>
          </div>
          <DataTable columns={recentSalesCols} data={todaySales.slice(0, 5)} />
        </div>

        <div className="bg-white rounded-lg border border-slate-200/80 shadow-sm p-4 xl:col-span-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-950">Low Stock Alerts</h3>
            <button onClick={() => onNavigate?.('inventory')} className="text-xs text-primary-dark hover:text-primary font-bold">View All</button>
          </div>
          <DataTable
            columns={[
              { key: 'name', label: 'Product' },
              { key: 'currentStock', label: 'Current Stock', render: r => <span className="font-bold text-red-600">{r.currentStock}</span> },
              { key: 'minStock', label: 'Min Stock', render: r => <span className="font-bold text-red-600">{r.minStock}</span> },
            ]}
            data={lowStock.slice(0, 5)}
          />
        </div>

        <div className="bg-white rounded-lg border border-slate-200/80 shadow-sm p-4 xl:col-span-3">
          <h3 className="text-sm font-extrabold text-slate-950 mb-3">Stock by Category</h3>
          <div className="flex items-center gap-5 min-h-[160px]">
            <svg width="100" height="100" viewBox="0 0 100 100">
              {(() => {
                const total = stockByCategory.reduce((s, [, v]) => s + v, 0) || 1
                const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4']
                const r = 38, circ = 2 * Math.PI * r
                return stockByCategory.reduce((segments, [cat, val], i) => {
                  const offset = segments.offset
                  const pct = (val / total) * 360
                  const dash = (pct / 360) * circ
                  segments.nodes.push(
                    <circle key={cat} cx="50" cy="50" r={r} fill="none" stroke={colors[i % colors.length]} strokeWidth="14"
                      strokeDasharray={`${dash} ${circ - dash}`}
                      transform={`rotate(${offset - 90} 50 50)`} strokeLinecap="round" />
                  )
                  segments.offset += pct
                  return segments
                }, { offset: 0, nodes: [] }).nodes
              })()}
              <text x="50" y="47" textAnchor="middle" fill="#374151" fontSize="13" fontWeight="bold">
                {products.length}
              </text>
              <text x="50" y="58" textAnchor="middle" fill="#9ca3af" fontSize="5.5">Items</text>
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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="bg-white rounded-lg border border-slate-200/80 shadow-sm p-4 xl:col-span-4">
          <h3 className="text-sm font-extrabold text-slate-950 mb-3">Top Selling Products</h3>
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

        <div className="bg-white rounded-lg border border-slate-200/80 shadow-sm p-4 xl:col-span-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-950">Customer Outstanding Payments</h3>
            <button onClick={() => onNavigate?.('customers')} className="text-xs text-primary-dark hover:text-primary font-bold">View All</button>
          </div>
          <DataTable
            columns={[
              { key: 'customer', label: 'Customer' },
              { key: 'balance', label: 'Total Debt', render: r => formatCurrency(r.balance) },
              { key: 'status', label: 'Status', render: r => <Badge variant={r.status}>{r.status}</Badge> },
            ]}
            data={payments.filter(p => p.balance > 0).slice(0, 4)}
          />
        </div>

        <div className="bg-white rounded-lg border border-slate-200/80 shadow-sm p-4 xl:col-span-4">
          <h3 className="text-sm font-extrabold text-slate-950 mb-3">Sales Overview</h3>
          <div className="h-48 flex items-end gap-2 border-b border-l border-slate-100 px-2 pt-4">
            {[22, 48, 41, 68, 55, 82, 96, 71, 89, 100, 94, 76].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full max-w-8 rounded-t bg-gradient-to-t from-emerald-700 to-emerald-400"
                  style={{ height: `${height}%` }}
                  title={`Month ${i + 1}`}
                />
                <span className="text-[10px] text-slate-400">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Boxes size={14} className="text-primary" />
            Current month revenue: <span className="text-slate-950">{formatCurrency(monthlyRevenue)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
