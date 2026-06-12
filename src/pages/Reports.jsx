import { BarChart3, TrendingUp, DollarSign, Package, CreditCard, TrendingDown, LineChart, PieChart, ShoppingCart, Users, AlertTriangle, ClipboardList, UserCheck, ArrowUpRight } from 'lucide-react'
import KPICard from '../components/KPICard'
import DataTable from '../components/DataTable'
import Badge from '../components/Badge'
import { products, sales, payments, purchases, inventoryMovements, formatCurrency, staff, customers, suppliers } from '../data/mockData'
import { useMemo, useState } from 'react'

export default function Reports() {
  const [filterPeriod, setFilterPeriod] = useState('all')

  const filteredSales = useMemo(() =>
    filterPeriod === 'all' ? sales : sales.filter(s => s.date.startsWith(filterPeriod)), [filterPeriod]
  )

  const monthlySales = useMemo(() => {
    const map = {}
    filteredSales.forEach(s => {
      const month = s.date.slice(0, 7)
      map[month] = (map[month] || 0) + s.total
    })
    return map
  }, [filteredSales])

  const totalRevenue = useMemo(() => filteredSales.reduce((s, x) => s + x.total, 0), [filteredSales])
  const totalCost = useMemo(() => {
    let cost = 0
    filteredSales.forEach(s => {
      s.items.forEach(item => {
        const p = products.find(pr => pr.name === item.product)
        if (p) cost += p.costPrice * item.qty
      })
    })
    return cost
  }, [filteredSales])
  const profit = totalRevenue - totalCost

  const inventoryValue = useMemo(() =>
    products.reduce((s, p) => s + p.currentStock * p.costPrice, 0), []
  )

  const turnoverRate = useMemo(() => {
    const soldQty = {}
    sales.forEach(s => s.items.forEach(item => {
      soldQty[item.product] = (soldQty[item.product] || 0) + item.qty
    }))
    const totalSold = Object.values(soldQty).reduce((s, q) => s + q, 0)
    const avgStock = products.reduce((s, p) => s + p.currentStock, 0) / (products.length || 1)
    return avgStock > 0 ? (totalSold / avgStock).toFixed(1) : '0'
  }, [])

  const topProductsByRevenue = useMemo(() => {
    const map = {}
    filteredSales.forEach(s => s.items.forEach(item => {
      map[item.product] = (map[item.product] || 0) + item.qty * item.price
    }))
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
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

  const pPaid = (payStats.paid / (payStats.paid + payStats.partial + payStats.unpaid || 1)) * 360
  const pPartial = (payStats.partial / (payStats.paid + payStats.partial + payStats.unpaid || 1)) * 360
  const pUnpaid = (payStats.unpaid / (payStats.paid + payStats.partial + payStats.unpaid || 1)) * 360

  const outstandingPayments = useMemo(() =>
    payments.filter(p => p.status !== 'Paid'), []
  )

  const profitMargin = useMemo(() => {
    return products.map(p => ({
      ...p,
      margin: p.sellingPrice - p.costPrice,
      marginPct: p.sellingPrice > 0 ? ((p.sellingPrice - p.costPrice) / p.sellingPrice * 100).toFixed(1) : 0,
    })).sort((a, b) => b.marginPct - a.marginPct)
  }, [])

  const staffSales = useMemo(() => {
    const map = {}
    filteredSales.forEach(s => {
      const name = s.staff || 'Unknown'
      if (!map[name]) map[name] = { sales: 0, revenue: 0, transactions: 0 }
      map[name].sales++
      map[name].revenue += s.total
      map[name].transactions += s.items.reduce((sum, i) => sum + i.qty, 0)
    })
    return Object.entries(map).map(([name, data]) => ({ name, ...data }))
  }, [filteredSales])

  const purchaseTotal = useMemo(() =>
    purchases.reduce((s, p) => s + p.totalCost, 0), []
  )

  const purchaseCols = [
    { key: 'poNumber', label: 'PO #' },
    { key: 'date', label: 'Date' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'totalCost', label: 'Total', render: r => formatCurrency(r.totalCost) },
    { key: 'staff', label: 'Received By' },
    { key: 'status', label: 'Status', render: r => <Badge variant={r.status}>{r.status}</Badge> },
  ]

  const debtCols = [
    { key: 'customer', label: 'Customer' },
    { key: 'invoice', label: 'Invoice' },
    { key: 'total', label: 'Total', render: r => formatCurrency(r.total) },
    { key: 'paidAmount', label: 'Paid', render: r => formatCurrency(r.paidAmount) },
    { key: 'balance', label: 'Balance', render: r => <span className="text-red-600 font-medium">{formatCurrency(r.balance)}</span> },
    { key: 'status', label: 'Status', render: r => <Badge variant={r.status}>{r.status}</Badge> },
  ]

  const staffCols = [
    { key: 'name', label: 'Staff' },
    { key: 'sales', label: 'Sales Count' },
    { key: 'revenue', label: 'Revenue', render: r => formatCurrency(r.revenue) },
    { key: 'transactions', label: 'Items Sold' },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} color="text-green-600" bg="bg-green-50" />
        <KPICard title="Gross Profit" value={formatCurrency(profit)} icon={TrendingUp} color="text-purple-600" bg="bg-purple-50" />
        <KPICard title="Inventory Value" value={formatCurrency(inventoryValue)} icon={Package} color="text-blue-600" bg="bg-blue-50" />
        <KPICard title="Turnover Rate" value={`${turnoverRate}x`} icon={BarChart3} color="text-orange-600" bg="bg-orange-50" subtitle="Stock turnover this period" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" /> Sales by Month
          </h3>
          <div className="space-y-2.5">
            {Object.entries(monthlySales).map(([month, amount]) => {
              const maxAmount = Math.max(...Object.values(monthlySales), 1)
              const pct = (amount / maxAmount) * 100
              return (
                <div key={month}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{month}</span>
                    <span className="font-medium text-gray-700">{formatCurrency(amount)}</span>
                  </div>
                  <div className="w-full bg-gray-50 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
            <LineChart size={16} className="text-purple-600" /> Demand Forecast
          </h3>
          <div className="space-y-3">
            {products.filter(p => p.currentStock <= p.minStock).slice(0, 5).map(p => {
              const avgDailySale = 2
              const daysLeft = avgDailySale > 0 ? Math.floor(p.currentStock / avgDailySale) : 0
              const suggestedOrder = p.minStock * 2 - p.currentStock
              return (
                <div key={p.id} className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">{p.name}</span>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      {daysLeft <= 0 ? 'OUT OF STOCK' : `${daysLeft} days left`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Current: {p.currentStock} | Min: {p.minStock} | Suggested order: <span className="font-semibold text-amber-700">{suggestedOrder > 0 ? suggestedOrder : 0} units</span>
                  </div>
                  <div className="w-full bg-amber-100 rounded-full h-1.5 mt-2">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (p.currentStock / p.minStock) * 100)}%` }} />
                  </div>
                </div>
              )
            })}
            {products.filter(p => p.currentStock <= p.minStock).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">All products above minimum stock</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-600" /> Top 5 by Revenue
          </h3>
          <div className="space-y-2.5">
            {topProductsByRevenue.map(([name, rev], i) => {
              const maxRev = Math.max(...topProductsByRevenue.map(p => p[1]), 1)
              const pct = (rev / maxRev) * 100
              const colors = ['bg-primary', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-teal-500']
              return (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{i + 1}. {name}</span>
                    <span className="font-medium">{formatCurrency(rev)}</span>
                  </div>
                  <div className="w-full bg-gray-50 rounded-full h-2">
                    <div className={`${colors[i]} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
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
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), color: 'text-green-600', icon: DollarSign },
            { label: 'Total Cost', value: formatCurrency(totalCost), color: 'text-red-600', icon: CreditCard },
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
              <TrendingUp size={13} className="text-blue-500" /> Revenue Trend (Line Chart)
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <CreditCard size={16} className="text-red-500" /> Customer Debt Report
            </h3>
            <span className="text-xs text-gray-400">{outstandingPayments.length} outstanding</span>
          </div>
          {outstandingPayments.length > 0 ? (
            <DataTable columns={debtCols} data={outstandingPayments} />
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No outstanding debts</p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <DollarSign size={16} className="text-green-600" /> Payment Collection Report
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-green-600 font-medium">Collected</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(payStats.paid)}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <p className="text-xs text-yellow-600 font-medium">Partial</p>
              <p className="text-lg font-bold text-yellow-700">{formatCurrency(payStats.partial)}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-xs text-red-600 font-medium">Unpaid</p>
              <p className="text-lg font-bold text-red-700">{formatCurrency(payStats.unpaid)}</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
            {(() => {
              const total = payStats.paid + payStats.partial + payStats.unpaid || 1
              const paidW = (payStats.paid / total) * 100
              const partialW = (payStats.partial / total) * 100
              return (
                <>
                  <div className="bg-green-500 h-3 transition-all" style={{ width: `${paidW}%` }} />
                  <div className="bg-yellow-500 h-3 transition-all" style={{ width: `${partialW}%` }} />
                  <div className="bg-red-500 h-3 transition-all" style={{ width: `${100 - paidW - partialW}%` }} />
                </>
              )
            })()}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{payStats.paid > 0 ? ((payStats.paid / (payStats.paid + payStats.partial + payStats.unpaid || 1)) * 100).toFixed(0) : 0}% Paid</span>
            <span>{payStats.unpaid > 0 ? ((payStats.unpaid / (payStats.paid + payStats.partial + payStats.unpaid || 1)) * 100).toFixed(0) : 0}% Unpaid</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <ShoppingCart size={16} className="text-blue-600" /> Purchase Report
            </h3>
            <span className="text-xs text-gray-400">Total: {formatCurrency(purchaseTotal)}</span>
          </div>
          <DataTable columns={purchaseCols} data={purchases} />
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <ClipboardList size={16} className="text-orange-600" /> Inventory Stock Report
            </h3>
          </div>
          <div className="space-y-3">
            {products.slice(0, 6).map(p => {
              const maxStock = Math.max(...products.map(x => x.currentStock), 1)
              const pct = (p.currentStock / maxStock) * 100
              const isLow = p.currentStock <= p.minStock
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700">{p.name}</span>
                    <span className={`font-medium ${isLow ? 'text-red-600' : 'text-gray-600'}`}>
                      {p.currentStock} / {p.minStock} min
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-2.5 rounded-full transition-all ${isLow ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-600" /> Profit Analysis
            </h3>
          </div>
          <div className="space-y-3">
            {profitMargin.slice(0, 6).map(p => {
              const maxMargin = Math.max(...profitMargin.map(x => x.marginPct), 1)
              const pct = (p.marginPct / maxMargin) * 100
              const color = p.marginPct >= 40 ? 'bg-green-500' : p.marginPct >= 25 ? 'bg-blue-500' : 'bg-amber-500'
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700">{p.name}</span>
                    <span className="font-medium text-gray-700">{p.marginPct}% margin</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`${color} h-2.5 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                    <span>Cost: {formatCurrency(p.costPrice)}</span>
                    <span>Sell: {formatCurrency(p.sellingPrice)}</span>
                    <span>Profit: {formatCurrency(p.margin)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <UserCheck size={16} className="text-teal-600" /> Staff Sales Performance
            </h3>
          </div>
          <DataTable columns={staffCols} data={staffSales} />
        </div>
      </div>
    </div>
  )
}
