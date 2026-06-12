import { useMemo, useState } from 'react'
import {
  DollarSign, TrendingUp, AlertTriangle, Package,
  Users, CreditCard, ShoppingCart, BarChart3, PieChart,
  TrendingDown, ArrowUpRight, LineChart,
} from 'lucide-react'
import KPICard from '../components/KPICard'
import DataTable from '../components/DataTable'
import Badge from '../components/Badge'
import { products, sales, payments, formatCurrency, getLowStockProducts, getTodaySales } from '../data/mockData'

function Bar({ value, max, color = 'bg-primary', label, height = 'h-20' }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div className={`${height} w-full bg-gray-50 rounded-lg relative overflow-hidden flex items-end justify-center`}>
        <div className={`w-full ${color} rounded-t-lg transition-all`} style={{ height: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-gray-500 truncate w-full text-center">{label}</span>
    </div>
  )
}

function Donut({ paid, partial, unpaid, size = 100 }) {
  const total = paid + partial + unpaid || 1
  const pPaid = (paid / total) * 360
  const pPartial = (partial / total) * 360
  const pUnpaid = (unpaid / total) * 360
  const r = 40
  const circ = 2 * Math.PI * r
  const paidDash = (pPaid / 360) * circ
  const partialDash = (pPartial / 360) * circ
  const unpaidDash = (pUnpaid / 360) * circ
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#f3f4f6" strokeWidth="12" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#22c55e" strokeWidth="12"
        strokeDasharray={`${paidDash} ${circ - paidDash}`}
        transform="rotate(-90 50 50)" strokeLinecap="round" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#eab308" strokeWidth="12"
        strokeDasharray={`${partialDash} ${circ - partialDash}`}
        transform={`rotate(${(pPaid / 360) * 360 - 90} 50 50)`} strokeLinecap="round" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#ef4444" strokeWidth="12"
        strokeDasharray={`${unpaidDash} ${circ - unpaidDash}`}
        transform={`rotate(${((pPaid + pPartial) / 360) * 360 - 90} 50 50)`} strokeLinecap="round" />
      <text x="50" y="48" textAnchor="middle" className="text-xs font-bold" fill="#374151" fontSize="11">
        {formatCurrency(total).replace('$', '')}
      </text>
      <text x="50" y="60" textAnchor="middle" className="text-[6px]" fill="#9ca3af" fontSize="6">Total</text>
    </svg>
  )
}

export default function Dashboard({ onNavigate }) {
  const [filterPeriod, setFilterPeriod] = useState('all')

  const filteredSales = useMemo(() =>
    filterPeriod === 'all' ? sales : sales.filter(s => s.date.startsWith(filterPeriod)), [filterPeriod]
  )

  const todaySales = useMemo(() => getTodaySales(filteredSales), [filteredSales])
  const lowStock = useMemo(() => getLowStockProducts(products), [])
  const monthlyRevenue = useMemo(() => filteredSales.reduce((sum, s) => sum + s.total, 0), [filteredSales])
  const outstandingDebt = useMemo(() =>
    payments.filter(p => p.status !== 'Paid').reduce((sum, p) => sum + p.balance, 0), []
  )

  const topProducts = useMemo(() => {
    const map = {}
    filteredSales.forEach(s => s.items.forEach(item => {
      map[item.product] = (map[item.product] || 0) + item.qty
    }))
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [filteredSales])

  const dailySalesTrend = useMemo(() => {
    const map = {}
    filteredSales.forEach(s => {
      const day = s.date.slice(0, 10)
      map[day] = (map[day] || 0) + s.total
    })
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filteredSales])

  const payStats = useMemo(() => {
    let paid = 0, partial = 0, unpaid = 0
    payments.forEach(p => {
      if (p.status === 'Paid') paid += p.total
      else if (p.status === 'Partial') partial += p.total
      else unpaid += p.total
    })
    return { paid, partial, unpaid }
  }, [])

  const revenue = monthlyRevenue
  const cost = useMemo(() => {
    let c = 0
    sales.forEach(s => s.items.forEach(item => {
      const p = products.find(pr => pr.name === item.product)
      if (p) c += p.costPrice * item.qty
    }))
    return c
  }, [])
  const profit = revenue - cost

  const kpiData = [
    { title: 'Total Sales Today', value: formatCurrency(todaySales.reduce((s, x) => s + x.total, 0)), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', subtitle: `${todaySales.length} transactions`, page: 'pos' },
    { title: 'Monthly Revenue', value: formatCurrency(monthlyRevenue), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', subtitle: 'Current month', page: 'reports' },
    { title: 'Outstanding Debt', value: formatCurrency(outstandingDebt), icon: CreditCard, color: 'text-red-600', bg: 'bg-red-50', subtitle: `${payments.filter(p => p.status !== 'Paid').length} customers`, page: 'customers' },
    { title: 'Low Stock Products', value: lowStock.length, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', subtitle: 'Needs reorder', page: 'inventory' },
    { title: 'Total Products', value: products.length, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50', subtitle: `${products.filter(p => p.status === 'Active').length} active`, page: 'products' },
    { title: 'Total Customers', value: 4, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50', subtitle: 'Registered', page: 'customers' },
  ]

  const recentSalesCols = [
    { key: 'invoice', label: 'Invoice' },
    { key: 'date', label: 'Date' },
    { key: 'customer', label: 'Customer' },
    { key: 'total', label: 'Total', render: r => formatCurrency(r.total) },
    { key: 'paymentMethod', label: 'Payment' },
    { key: 'paymentStatus', label: 'Status', render: r => <Badge variant={r.paymentStatus}>{r.paymentStatus}</Badge> },
  ]

  const lowStockCols = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Product' },
    { key: 'currentStock', label: 'Stock' },
    { key: 'minStock', label: 'Min Stock' },
    { key: 'status', label: 'Status', render: r => <Badge variant="Low">Low Stock</Badge> },
  ]

  const topProductCols = [
    { key: 'name', label: 'Product', render: r => r[0] },
    { key: 'qty', label: 'Qty Sold', render: r => r[1] },
  ]

  const outstandingCols = [
    { key: 'customer', label: 'Customer' },
    { key: 'invoice', label: 'Invoice' },
    { key: 'total', label: 'Total', render: r => formatCurrency(r.total) },
    { key: 'paidAmount', label: 'Paid', render: r => formatCurrency(r.paidAmount) },
    { key: 'balance', label: 'Balance', render: r => <span className="text-red-600 font-medium">{formatCurrency(r.balance)}</span> },
    { key: 'status', label: 'Status', render: r => <Badge variant={r.status}>{r.status}</Badge> },
  ]

  const maxSale = Math.max(...dailySalesTrend.map(d => d[1]), 1)

  const invMax = Math.max(...products.map(p => p.currentStock), 1)

  const monthlySales = useMemo(() => {
    const map = {}
    filteredSales.forEach(s => {
      const month = s.date.slice(0, 7)
      map[month] = (map[month] || 0) + s.total
    })
    return map
  }, [filteredSales])

  const inventoryValue = useMemo(() =>
    products.reduce((s, p) => s + p.currentStock * p.costPrice, 0), []
  )

  const pPaid = (payStats.paid / (payStats.paid + payStats.partial + payStats.unpaid || 1)) * 360
  const pPartial = (payStats.partial / (payStats.paid + payStats.partial + payStats.unpaid || 1)) * 360
  const pUnpaid = (payStats.unpaid / (payStats.paid + payStats.partial + payStats.unpaid || 1)) * 360

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiData.map((k, i) => (
          <div key={i} onClick={() => k.page && onNavigate?.(k.page)} className={k.page ? 'cursor-pointer' : ''}>
            <KPICard {...k} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" /> Daily Sales Trend
            </h3>
          </div>
          <div className="flex items-end gap-1.5 h-32">
            {dailySalesTrend.map(([day, val]) => (
              <Bar key={day} value={val} max={maxSale} color="bg-primary" label={day.slice(8)} height="h-28" />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" /> Revenue vs Profit
            </h3>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Revenue</span>
                <span className="font-semibold text-gray-800">{formatCurrency(revenue)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4">
                <div className="bg-blue-500 h-4 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Cost</span>
                <span className="font-semibold text-gray-800">{formatCurrency(cost)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4">
                <div className="bg-orange-400 h-4 rounded-full" style={{ width: `${revenue > 0 ? (cost/revenue)*100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 font-medium">Gross Profit</span>
                <span className="font-semibold text-green-600">{formatCurrency(profit)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4">
                <div className="bg-green-500 h-4 rounded-full" style={{ width: `${revenue > 0 ? (profit/revenue)*100 : 0}%` }} />
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Profit Margin: {revenue > 0 ? ((profit/revenue)*100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <PieChart size={18} className="text-purple-600" /> Payment Status
            </h3>
          </div>
          <div className="flex items-center gap-6">
            <Donut paid={payStats.paid} partial={payStats.partial} unpaid={payStats.unpaid} />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600">Paid</span>
                <span className="font-medium">{formatCurrency(payStats.paid)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-gray-600">Partial</span>
                <span className="font-medium">{formatCurrency(payStats.partial)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-600">Unpaid</span>
                <span className="font-medium">{formatCurrency(payStats.unpaid)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Package size={18} className="text-purple-600" /> Inventory Stock Levels
            </h3>
          </div>
          <div className="space-y-3">
            {products.map(p => {
              const pct = (p.currentStock / invMax) * 100
              const isLow = p.currentStock <= p.minStock
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-sm mb-0.5">
                    <span className="text-gray-700">{p.name}</span>
                    <span className={`font-medium ${isLow ? 'text-red-600' : 'text-gray-600'}`}>
                      {p.currentStock} / {p.minStock} min
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${isLow ? 'bg-red-500' : 'bg-primary'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <ShoppingCart size={18} className="text-primary" /> Recent Sales
            </h3>
            <button onClick={() => onNavigate?.('pos')} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 cursor-pointer">
              View POS <ArrowUpRight size={14} />
            </button>
          </div>
          <DataTable columns={recentSalesCols} data={todaySales.slice(0, 5)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500" /> Low Stock Alerts
            </h3>
            <button onClick={() => onNavigate?.('inventory')} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 cursor-pointer">
              {lowStock.length} items <ArrowUpRight size={14} />
            </button>
          </div>
          <DataTable columns={lowStockCols} data={lowStock} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" /> Top Selling Products
            </h3>
          </div>
          <div className="space-y-3">
            {topProducts.map(([name, qty], i) => {
              const maxQty = Math.max(...topProducts.map(p => p[1]), 1)
              const pct = (qty / maxQty) * 100
              const colors = ['bg-primary', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-teal-500']
              return (
                <div key={name}>
                  <div className="flex justify-between text-sm mb-0.5">
                    <span className="text-gray-700">{i + 1}. {name}</span>
                    <span className="font-medium text-gray-600">{qty} sold</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className={`${colors[i]} h-3 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <CreditCard size={18} className="text-red-500" /> Customer Outstanding Payments
            </h3>
            <button onClick={() => onNavigate?.('customers')} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 cursor-pointer">
              View All <ArrowUpRight size={14} />
            </button>
          </div>
          <DataTable columns={outstandingCols} data={payments.filter(p => p.status !== 'Paid')} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingDown size={18} className="text-red-500" /> Out of Stock Risk
            </h3>
          </div>
          <div className="space-y-3">
            {[...lowStock].sort((a, b) => a.currentStock - b.currentStock).slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center gap-3 bg-red-50 rounded-lg p-3">
                <AlertTriangle size={20} className="text-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-500">Stock: {p.currentStock} / Min: {p.minStock}</p>
                </div>
                <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">
                  {p.currentStock <= 0 ? 'OUT' : 'LOW'}
                </span>
              </div>
            ))}
            {lowStock.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">All products well-stocked</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" /> Sample Dashboard
          </h3>
          <div className="flex items-center gap-3">
            <select
              value={filterPeriod}
              onChange={e => setFilterPeriod(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Period</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-medium">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total Revenue', value: formatCurrency(revenue), color: 'text-green-600', icon: DollarSign },
            { label: 'Total Cost', value: formatCurrency(cost), color: 'text-red-600', icon: CreditCard },
            { label: 'Gross Profit', value: formatCurrency(profit), color: 'text-purple-600', icon: TrendingUp },
            { label: 'Inventory Value', value: formatCurrency(inventoryValue), color: 'text-blue-600', icon: Package },
          ].map((k, i) => (
            <div key={i} className="rounded-lg border border-gray-100 p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                <k.icon size={16} className={k.color} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{k.label}</p>
                <p className={`text-sm font-bold ${k.color}`}>{k.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="xl:col-span-2 border border-gray-100 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <LineChart size={13} className="text-blue-500" /> Revenue Trend (Line Chart)
            </h4>
            <div className="relative h-40">
              <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                <polyline
                  fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  points={(() => {
                    const entries = Object.entries(monthlySales)
                    const max = Math.max(...entries.map(e => e[1]), 1)
                    return entries.map(([, v], i) => {
                      const x = (i / (entries.length - 1 || 1)) * 100
                      const y = 40 - (v / max) * 35
                      return `${x},${y}`
                    }).join(' ')
                  })()}
                />
                <polygon
                  fill="url(#lineGrad)"
                  points={(() => {
                    const entries = Object.entries(monthlySales)
                    const max = Math.max(...entries.map(e => e[1]), 1)
                    const pts = entries.map(([, v], i) => {
                      const x = (i / (entries.length - 1 || 1)) * 100
                      const y = 40 - (v / max) * 35
                      return `${x},${y}`
                    }).join(' ')
                    return `${pts} 100,40 0,40`
                  })()}
                />
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-gray-400 px-1">
                {Object.entries(monthlySales).map(([m]) => (
                  <span key={m}>{m.slice(5)}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-gray-100 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 size={13} className="text-primary" /> Sales by Month (Bar)
            </h4>
            <div className="flex items-end gap-1.5 h-36">
              {Object.entries(monthlySales).slice(0, 8).map(([month, amount]) => {
                const max = Math.max(...Object.values(monthlySales), 1)
                const pct = (amount / max) * 100
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-gray-50 rounded-t-md relative flex items-end justify-center" style={{ height: '100%' }}>
                      <div
                        className="w-full bg-gradient-to-t from-primary to-blue-400 rounded-t-md transition-all"
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400 truncate w-full text-center">{month.slice(5)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border border-gray-100 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart size={13} className="text-purple-500" /> Payment Status (Donut)
            </h4>
            <div className="flex items-center gap-4">
              <svg width="90" height="90" viewBox="0 0 100 100">
                {(() => {
                  const total = payStats.paid + payStats.partial + payStats.unpaid || 1
                  const pPaid = (payStats.paid / total) * 360
                  const pPartial = (payStats.partial / total) * 360
                  const r = 40
                  const circ = 2 * Math.PI * r
                  const paidDash = (pPaid / 360) * circ
                  const partialDash = (pPartial / 360) * circ
                  const unpaidDash = (pUnpaid / 360) * circ
                  return (
                    <>
                      <circle cx="50" cy="50" r={r} fill="none" stroke="#f3f4f6" strokeWidth="12" />
                      <circle cx="50" cy="50" r={r} fill="none" stroke="#22c55e" strokeWidth="12"
                        strokeDasharray={`${paidDash} ${circ - paidDash}`}
                        transform="rotate(-90 50 50)" strokeLinecap="round" />
                      <circle cx="50" cy="50" r={r} fill="none" stroke="#eab308" strokeWidth="12"
                        strokeDasharray={`${partialDash} ${circ - partialDash}`}
                        transform={`rotate(${pPaid - 90} 50 50)`} strokeLinecap="round" />
                      <circle cx="50" cy="50" r={r} fill="none" stroke="#ef4444" strokeWidth="12"
                        strokeDasharray={`${unpaidDash} ${circ - unpaidDash}`}
                        transform={`rotate(${pPaid + pPartial - 90} 50 50)`} strokeLinecap="round" />
                      <text x="50" y="48" textAnchor="middle" fill="#374151" fontSize="12" fontWeight="bold">
                        {formatCurrency(total).replace(/[^0-9.]/g, '').slice(0, 4)}
                      </text>
                      <text x="50" y="60" textAnchor="middle" fill="#9ca3af" fontSize="6">Total</text>
                    </>
                  )
                })()}
              </svg>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-gray-500">Paid</span>
                  <span className="font-medium text-gray-700 ml-auto">{formatCurrency(payStats.paid)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-gray-500">Partial</span>
                  <span className="font-medium text-gray-700 ml-auto">{formatCurrency(payStats.partial)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-gray-500">Unpaid</span>
                  <span className="font-medium text-gray-700 ml-auto">{formatCurrency(payStats.unpaid)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
