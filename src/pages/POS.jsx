import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Search, Plus, Minus, Trash2, ShoppingCart as CartIcon,
  X, UserPlus, Clock, Percent, DollarSign,
  Ban, Check, FileText, QrCode
} from 'lucide-react'
import Modal from '../components/Modal'
import InsufficientStockModal from '../components/InsufficientStockModal'
import {
  products as initialProducts, sales, customers as initialCustomers,
  formatCurrency, formatKHR, inventoryMovements, activityLog, payments
} from '../data/mockData'

let saleIdCounter = 2000
let paymentIdCounter = 900
let movementIdCounter = 500
let logIdCounter = 100
let reservationTimer = null

export default function POS({ onUpdateProducts, onUpdateSales, globalSales, globalProducts }) {
  const [productList, setProductList] = useState(globalProducts || initialProducts)
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [customer, setCustomer] = useState('Walk-in Customer')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [paidAmount, setPaidAmount] = useState('')
  const [discount, setDiscount] = useState('')
  const [discountMode, setDiscountMode] = useState('amount')
  const [saleList, setSaleList] = useState(globalSales || sales)
  const [showReceipt, setShowReceipt] = useState(null)
  const [customerList, setCustomerList] = useState(initialCustomers)
  const [customerIdCounter, setCustomerIdCounter] = useState(5)
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', phone: '', email: '' })
  const [reserved, setReserved] = useState(false)
  const [reservedAt, setReservedAt] = useState(null)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [reservedCart, setReservedCart] = useState([])
  const [insufficientItems, setInsufficientItems] = useState([])
  const [showInsufficient, setShowInsufficient] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [qrStep, setQrStep] = useState('idle')
  const [rememberedAction, setRememberedAction] = useState(null)
  const [saleMode, setSaleMode] = useState('sale')
  const [invoiceList, setInvoiceList] = useState([])
  const [cartTab, setCartTab] = useState('cart')
  const customerRef = useRef(null)

  useEffect(() => {
    if (qrStep === 'scan') {
      const timer = setTimeout(() => setQrStep('verifying'), 3000)
      return () => clearTimeout(timer)
    }
    if (qrStep === 'verifying') {
      const timer = setTimeout(() => setQrStep('success'), 1200)
      return () => clearTimeout(timer)
    }
    if (qrStep === 'success') {
      const timer = setTimeout(() => {
        setShowQrModal(false)
        setQrStep('idle')
        executeSale()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [qrStep])

  const RESERVATION_DURATION = 900

  useEffect(() => {
    if (!reserved || !reservedAt) return
    const tick = () => {
      const elapsed = Math.floor((Date.now() - reservedAt) / 1000)
      const left = RESERVATION_DURATION - elapsed
      if (left <= 0) {
        setReserved(false)
        setReservedAt(null)
        setRemainingSeconds(0)
        setCart(reservedCart)
        setReservedCart([])
        return
      }
      setRemainingSeconds(left)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [reserved, reservedAt])

  const categories = useMemo(() => {
    const s = new Set(productList.map(p => p.category))
    return ['All', ...s]
  }, [productList])

  const filteredProducts = useMemo(() =>
    productList.filter(p =>
      p.status === 'Active' &&
      (categoryFilter === 'All' || p.category === categoryFilter) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()))
    ), [search, categoryFilter, productList]
  )

  const filteredCustomers = useMemo(() =>
    customerList.filter(c =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
    ), [customerSearch, customerList]
  )

  function addToCart(product) {
    if (reserved) return
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id)
      if (existing) {
        if (existing.qty >= product.currentStock) return prev
        return prev.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c)
      }
      return [...prev, { ...product, qty: 1, discount: 0, reserved: null }]
    })
  }

  function updateQty(id, delta) {
    if (reserved) return
    setCart(prev => prev.map(c => {
      if (c.id !== id) return c
      const newQty = c.qty + delta
      if (newQty <= 0) return null
      return { ...c, qty: newQty }
    }).filter(Boolean))
  }

  function removeFromCart(id) {
    if (reserved) return
    setCart(prev => prev.filter(c => c.id !== id))
  }

  function clearCart() {
    setCart([])
    setDiscount('')
    setPaidAmount('')
    setReserved(false)
    setReservedAt(null)
    setRemainingSeconds(0)
    setReservedCart([])
  }

  let invoiceIdCounter = useRef(5000)

  function createInvoice() {
    if (cart.length === 0) return
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 5)
    const invNum = `INV-${dateStr.replace(/[: ]/g, '').slice(0, 10)}-${invoiceIdCounter.current}`
    const id = invoiceIdCounter.current++

    const newInvoice = {
      id, invoiceNumber: invNum, date: dateStr,
      customer,       items: cart.map(c => ({ product: c.name, qty: c.qty, unitPrice: c.sellingPrice * (1 - (c.discount || 0) / 100), discount: c.discount || 0 })),
      subtotal, total: Math.max(0, subtotal - discountVal),
      status: 'Pending',
      createdBy: 'Cashier Sophea',
    }
    setInvoiceList(prev => [newInvoice, ...prev])
    activityLog.push({
      id: logIdCounter++, date: dateStr, user: 'Cashier Sophea',
      action: `Created invoice ${invNum} for ${customer}`, module: 'Sales',
    })
    clearCart()
  }

  function completeInvoice(inv) {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    const newMovements = inv.items.map(item => ({
      id: movementIdCounter++, date: now, product: item.product,
      type: 'Stock Out', qty: -item.qty, ref: inv.invoiceNumber,
      staff: 'Cashier Sophea', note: `Invoice to ${inv.customer}`,
    }))
    inventoryMovements.push(...newMovements)
    const updated = productList.map(p => {
      const match = inv.items.find(i => i.product === p.name)
      return match ? { ...p, currentStock: Math.max(0, p.currentStock - match.qty) } : p
    })
    setProductList(updated)
    onUpdateProducts?.(updated)
    setInvoiceList(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'Completed' } : i))
    activityLog.push({
      id: logIdCounter++, date: now, user: 'Cashier Sophea',
      action: `Completed invoice ${inv.invoiceNumber} for ${inv.customer}`, module: 'Sales',
    })
  }

  function cancelInvoice(inv) {
    setInvoiceList(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'Cancelled' } : i))
    activityLog.push({
      id: logIdCounter++, date: now, user: 'Cashier Sophea',
      action: `Cancelled invoice ${inv.invoiceNumber}`, module: 'Sales',
    })
  }

  function holdOrder() {
    if (cart.length === 0) return
    setReservedCart([...cart])
    const now = Date.now()
    setReservedAt(now)
    setRemainingSeconds(RESERVATION_DURATION)
    setReserved(true)
    setCart(cart.map(c => ({ ...c, reserved: new Date(now + RESERVATION_DURATION * 1000) })))
  }

  function releaseHold() {
    setReserved(false)
    setReservedAt(null)
    setRemainingSeconds(0)
    setCart(reservedCart)
    setReservedCart([])
  }

  const subtotal = useMemo(() => cart.reduce((s, c) => s + c.sellingPrice * c.qty * (1 - (c.discount || 0) / 100), 0), [cart])
  const discountVal = useMemo(() => {
    const raw = parseFloat(discount) || 0
    return discountMode === 'percent' ? subtotal * (raw / 100) : raw
  }, [discount, discountMode, subtotal])
  const total = Math.max(0, subtotal - discountVal)
  const paid = parseFloat(paidAmount) || total
  const balance = Math.max(0, total - paid)

  const timerMinutes = Math.floor(remainingSeconds / 60)
  const timerSeconds = remainingSeconds % 60

  function getInsufficientStockItems(cartItems) {
    return cartItems
      .map(c => {
        const product = productList.find(p => p.id === c.id)
        if (!product) return null
        const shortage = product.currentStock - c.qty
        if (shortage >= 0) return null
        return {
          id: c.id,
          name: c.name,
          requested: c.qty,
          available: product.currentStock,
          shortage: shortage,
        }
      })
      .filter(Boolean)
  }

  function executeSale(adjustedCart) {
    const itemsToSell = adjustedCart || cart
    if (itemsToSell.length === 0) return
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 5)
    const invNum = `INV-${dateStr.replace(/[: ]/g, '').slice(0, 10)}-${String(saleIdCounter).slice(-3)}`
    const saleId = saleIdCounter++
    const newSale = {
      id: saleId, invoice: invNum, date: dateStr, customer,
      items: itemsToSell.map(c => ({ product: c.name, qty: c.qty, price: c.sellingPrice * (1 - (c.discount || 0) / 100), discount: c.discount || 0 })),
      subtotal, discount: discountVal, total,
      paymentMethod,
      paymentStatus: paid >= total ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid',
      paidAmount: paid, balance,
      staff: 'Cashier Sophea',
    }
    const newPayment = {
      id: paymentIdCounter++, saleId, customer, date: dateStr,
      invoice: invNum, total, paidAmount: paid, balance,
      status: paid >= total ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid',
    }

    const updatedProducts = productList.map(p => {
      const inCart = itemsToSell.find(c => c.id === p.id)
      return inCart ? { ...p, currentStock: Math.max(0, p.currentStock - inCart.qty) } : p
    })
    setProductList(updatedProducts)
    onUpdateProducts?.(updatedProducts)

    const newMovements = itemsToSell.map(c => ({
      id: movementIdCounter++, date: dateStr, product: c.name,
      type: 'Stock Out', qty: -c.qty, ref: invNum,
      staff: 'Cashier Sophea', note: `Sale to ${customer}`,
    }))
    inventoryMovements.push(...newMovements)

    activityLog.push({
      id: logIdCounter++, date: dateStr, user: 'Cashier Sophea',
      action: `Created Sale ${invNum}`, module: 'POS',
    })

    setSaleList(prev => [newSale, ...prev])
    onUpdateSales?.([newSale, ...(globalSales || sales)])
    sales.unshift(newSale)
    payments.push(newPayment)

    setShowReceipt(newSale)
    clearCart()
  }

  function handleConfirmSale() {
    if (cart.length === 0) return
    if (saleMode === 'invoice') {
      if (customer === 'Walk-in Customer') return
      createInvoice()
      return
    }
    const problems = getInsufficientStockItems(cart)
    if (problems.length > 0) {
      if (rememberedAction) {
        handleInsufficientAction(rememberedAction, false)
        return
      }
      setInsufficientItems(problems)
      setShowInsufficient(true)
      return
    }
    if (paymentMethod === 'KHQR') {
      setShowQrModal(true)
      setTimeout(() => setQrStep('scan'), 50)
      return
    }
    executeSale()
  }

  function handleInsufficientAction(action, remember) {
    setShowInsufficient(false)
    if (remember) setRememberedAction(action)
    if (action === 'cancel') return
    if (action === 'sell_available') {
      const adjusted = cart.map(c => {
        const product = productList.find(p => p.id === c.id)
        if (!product || c.qty <= product.currentStock) return c
        return { ...c, qty: product.currentStock }
      }).filter(c => c.qty > 0)
      executeSale(adjusted)
    }
    if (action === 'backorder') {
      executeSale()
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-8rem)]">

      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-w-0">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search by name or code..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 cursor-pointer">
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-1.5 px-4 pt-3 pb-1.5 overflow-x-auto scrollbar-thin">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-primary text-white shadow-sm shadow-primary/20'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredProducts.map(p => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.currentStock <= 0 || reserved}
                className="bg-white rounded-xl p-3 text-left border border-gray-100 hover:border-primary hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer group"
              >
                <div className="w-full aspect-square rounded-lg mb-2.5 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-primary/30 transition-colors">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  {!p.image && <span className="text-gray-300 text-2xl font-bold">{p.name[0]}</span>}
                </div>
                <p className="font-medium text-sm text-gray-800 truncate group-hover:text-primary transition-colors">{p.name}</p>
                <p className="text-xs text-gray-400 mb-1.5">{p.category}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-primary">{formatCurrency(p.sellingPrice)}</span>
                    <p className="text-[10px] text-gray-400">{formatKHR(p.sellingPrice)}</p>
                  </div>
                  <span className={`text-[11px] ${p.currentStock <= p.minStock ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                    {p.currentStock <= p.minStock ? `${p.currentStock} left` : `${p.currentStock}`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[400px] xl:w-[440px] bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col shrink-0">
        {reserved && (
          <div className="bg-amber-50 border-b border-amber-100 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
              <Clock size={16} />
              <span>Items reserved for {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')} more seconds</span>
            </div>
            <button onClick={releaseHold}
              className="text-xs text-amber-600 hover:text-amber-800 underline cursor-pointer">
              Release
            </button>
          </div>
        )}

        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Customer</label>
          <div className="relative" ref={customerRef}>
            <div className="flex gap-1.5">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={showCustomerDropdown ? customerSearch : customer}
                  onChange={e => {
                    setCustomerSearch(e.target.value)
                    setShowCustomerDropdown(true)
                  }}
                  onFocus={() => {
                    setCustomerSearch('')
                    setShowCustomerDropdown(true)
                  }}
                  placeholder="Search by name or phone..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                />
                {showCustomerDropdown && (
                  <>
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                      {filteredCustomers.length === 0 ? (
                        <p className="p-3 text-xs text-gray-400 text-center">No customers found</p>
                      ) : (
                        filteredCustomers.map(c => (
                          <button key={c.id} type="button"
                            onClick={() => {
                              setCustomer(c.name)
                              setCustomerSearch('')
                              setShowCustomerDropdown(false)
                            }}
                            className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer"
                          >
                            <span className="text-gray-800">{c.name}</span>
                            {c.phone && <span className="text-gray-400 ml-2 text-xs">{c.phone}</span>}
                          </button>
                        ))
                      )}
                    </div>
                    <div className="fixed inset-0 z-10" onClick={() => setShowCustomerDropdown(false)} />
                  </>
                )}
              </div>
              <button onClick={() => setShowNewCustomer(true)}
                className="px-3 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-primary transition-colors cursor-pointer shrink-0">
                <UserPlus size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-100">
          <button onClick={() => setCartTab('cart')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors cursor-pointer ${
              cartTab === 'cart' ? 'text-primary border-b-2 border-primary bg-primary/[0.02]' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <CartIcon size={16} /> Cart {cart.length > 0 && <span className="text-xs bg-primary text-white w-4.5 h-4.5 rounded-full flex items-center justify-center">{cart.length}</span>}
          </button>
          <button onClick={() => setCartTab('invoices')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors cursor-pointer ${
              cartTab === 'invoices' ? 'text-primary border-b-2 border-primary bg-primary/[0.02]' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <FileText size={16} /> Invoices {invoiceList.length > 0 && <span className="text-xs bg-amber-500 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center">{invoiceList.length}</span>}
          </button>
        </div>

        {cartTab === 'invoices' ? (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {invoiceList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                <FileText size={48} className="mb-3" />
                <p className="text-sm text-gray-400">No invoices yet</p>
                <p className="text-xs text-gray-300 mt-1">Switch to Cart and use Invoice mode</p>
              </div>
            ) : (
              invoiceList.map(inv => (
                <div key={inv.id} className="bg-white rounded-xl p-3 border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{inv.invoiceNumber}</p>
                      <p className="text-xs text-gray-400">{inv.customer} · {inv.date}</p>
                    </div>
                    <Badge variant={inv.status === 'Completed' ? 'Paid' : inv.status === 'Pending' ? 'Pending' : 'Unpaid'}>{inv.status}</Badge>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {inv.items.map(i => `${i.product} x${i.qty}`).join(', ')}
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-50 pt-2">
                    <span className="text-sm font-bold text-gray-800">{formatCurrency(inv.total)}</span>
                    <div className="flex gap-1">
                      {inv.status === 'Pending' && (
                        <>
                          <button onClick={() => completeInvoice(inv)}
                            className="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 cursor-pointer">
                            Complete
                          </button>
                          <button onClick={() => cancelInvoice(inv)}
                            className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 cursor-pointer">
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
        <>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-300">
              <CartIcon size={48} className="mb-3" />
              <p className="text-sm text-gray-400">Cart is empty</p>
              <p className="text-xs text-gray-300 mt-1">Select products from the left panel</p>
            </div>
          ) : (
            cart.map(c => (
              <div key={c.id} className="bg-white rounded-xl p-3 border border-gray-100 hover:border-primary/20 hover:shadow-sm transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                    <img src={c.image} alt={c.name} className="w-full h-full object-contain p-1" onError={e => { e.target.style.display = 'none' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(c.sellingPrice)} each<span className="text-[10px] text-gray-300 ml-1">({formatKHR(c.sellingPrice)})</span></p>
                  </div>
                  <button onClick={() => removeFromCart(c.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors cursor-pointer shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg border border-gray-100 p-1">
                    <button onClick={() => updateQty(c.id, -1)}
                      className="w-8 h-8 rounded-md hover:bg-white hover:shadow-sm text-gray-500 hover:text-primary transition-all cursor-pointer flex items-center justify-center">
                      <Minus size={15} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-gray-800 select-none">{c.qty}</span>
                    <button onClick={() => updateQty(c.id, 1)}
                      className="w-8 h-8 rounded-md hover:bg-white hover:shadow-sm text-gray-500 hover:text-primary transition-all cursor-pointer flex items-center justify-center">
                      <Plus size={15} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <span className="text-gray-400">%</span>
                      <input type="number" value={c.discount || ''} onChange={e => {
                        const val = Math.max(0, Math.min(100, Number(e.target.value) || 0))
                        setCart(prev => prev.map(item => item.id === c.id ? { ...item, discount: val } : item))
                      }}
                        className="w-12 px-1.5 py-1 border border-gray-200 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                        placeholder="0" min="0" max="100" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">{formatCurrency(c.sellingPrice * c.qty * (1 - (c.discount || 0) / 100))}</p>
                      <p className="text-[10px] text-gray-400">{formatKHR(c.sellingPrice * c.qty * (1 - (c.discount || 0) / 100))}</p>
                    </div>
                  </div>
                </div>

                {c.reserved && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-100">
                      <Clock size={11} /> Held until {c.reserved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <div className="text-right">
              <span className="font-semibold text-gray-800">{formatCurrency(subtotal)}</span>
              <p className="text-[10px] text-gray-400">{formatKHR(subtotal)}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-500">Discount</label>
              <div className="flex bg-white rounded-lg border border-gray-200 p-0.5 gap-0.5">
                <button onClick={() => { setDiscountMode('amount'); setDiscount('') }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${discountMode === 'amount' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  <DollarSign size={12} className="inline" /> $
                </button>
                <button onClick={() => { setDiscountMode('percent'); setDiscount('') }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${discountMode === 'percent' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  <Percent size={12} className="inline" /> %
                </button>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                {discountMode === 'amount' ? '$' : '%'}
              </span>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)}
                placeholder={discountMode === 'amount' ? '0.00' : '0'}
                className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary bg-white" min="0" step="0.1" />
            </div>
          </div>

          <div className="flex justify-between items-baseline border-t border-gray-200 pt-3">
            <span className="text-base font-bold text-gray-800">Total</span>
            <div className="text-right">
              <span className="text-xl font-extrabold text-primary">{formatCurrency(total)}</span>
              <p className="text-[10px] text-gray-400">{formatKHR(total)}</p>
            </div>
          </div>

          {saleMode === 'sale' && (
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary">
                  <option>Cash</option>
                  <option>KHQR</option>
                  <option>Bank Transfer</option>
                  <option>Credit</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Paid Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary bg-white" min="0" step="0.01" />
                </div>
              </div>
            </div>
          )}

          <div className="flex bg-white rounded-lg border border-gray-200 p-0.5 gap-0.5">
            <button onClick={() => setSaleMode('sale')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${saleMode === 'sale' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <DollarSign size={14} className="inline mr-1" /> Sale
            </button>
            <button onClick={() => setSaleMode('invoice')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${saleMode === 'invoice' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <FileText size={14} className="inline mr-1" /> Invoice
            </button>
          </div>

          {saleMode === 'sale' && (
            <>
              {balance > 0 && (
                <div className="flex justify-between items-center text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <span className="text-red-600 font-medium">Balance Due</span>
                  <div className="text-right">
                    <span className="text-red-600 font-bold">{formatCurrency(balance)}</span>
                    <p className="text-[10px] text-red-400">{formatKHR(balance)}</p>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button onClick={clearCart}
              disabled={cart.length === 0}
              className="flex items-center justify-center gap-1.5 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]">
              <Ban size={16} /> Clear Cart
            </button>
            {saleMode === 'sale' && (
              <button onClick={holdOrder}
                disabled={cart.length === 0 || reserved}
                className="flex items-center justify-center gap-1.5 py-3 border border-amber-200 rounded-xl text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]">
                <Clock size={16} /> Hold Order
              </button>
            )}
            {saleMode === 'invoice' && (
              <button onClick={clearCart}
                disabled={cart.length === 0}
                className="flex items-center justify-center gap-1.5 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]">
                <Ban size={16} /> Clear
              </button>
            )}
          </div>

          <button
            onClick={handleConfirmSale}
            disabled={cart.length === 0}
            className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary-dark transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
          >
            <Check size={18} /> {saleMode === 'sale' ? 'Confirm Sale' : 'Create Invoice'}
          </button>
        </div>
      </>
      )}
      </div>

      {showReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReceipt(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="p-5" id="invoice-print">
              <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white text-[10px] font-bold">S</span>
                    <span className="font-semibold text-gray-800">SME Hub</span>
                  </div>
                  <p className="text-xs text-gray-400">123 Main Street, Phnom Penh</p>
                  <p className="text-xs text-gray-400">info@smehub.com | 012 345 678</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">INVOICE</p>
                  <p className="text-xs text-gray-400">{showReceipt.invoice}</p>
                  <p className="text-xs text-gray-400">{showReceipt.date}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-0.5">Bill To:</p>
                <p className="text-sm font-medium text-gray-800">{showReceipt.customer}</p>
                <p className="text-xs text-gray-400">Staff: {showReceipt.staff}</p>
              </div>

              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-2 text-xs text-gray-500 font-medium">Item</th>
                    <th className="text-center pb-2 text-xs text-gray-500 font-medium">Qty</th>
                    <th className="text-right pb-2 text-xs text-gray-500 font-medium">Price</th>
                    <th className="text-right pb-2 text-xs text-gray-500 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {showReceipt.items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 text-gray-700">{item.product}</td>
                      <td className="py-2 text-center text-gray-600">{item.qty}</td>
                      <td className="py-2 text-right text-gray-600">{formatCurrency(item.price)}</td>
                      <td className="py-2 text-right font-medium">
                        {formatCurrency(item.price * item.qty)}
                        <p className="text-[10px] text-gray-400">{formatKHR(item.price * item.qty)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-56 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <div className="text-right">
                      <span>{formatCurrency(showReceipt.subtotal)}</span>
                      <p className="text-[10px] text-gray-400">{formatKHR(showReceipt.subtotal)}</p>
                    </div>
                  </div>
                  {showReceipt.discount > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span>Discount</span>
                      <div className="text-right">
                        <span>-{formatCurrency(showReceipt.discount)}</span>
                        <p className="text-[10px] text-gray-400">{formatKHR(showReceipt.discount)}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-gray-800 pt-1 border-t border-gray-100">
                    <span>Total</span>
                    <div className="text-right">
                      <span>{formatCurrency(showReceipt.total)}</span>
                      <p className="text-[10px] text-gray-400">{formatKHR(showReceipt.total)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Paid</span>
                    <div className="text-right">
                      <span>{formatCurrency(showReceipt.paidAmount)}</span>
                      <p className="text-[10px] text-green-400">{formatKHR(showReceipt.paidAmount)}</p>
                    </div>
                  </div>
                  {showReceipt.balance > 0 && (
                    <div className="flex justify-between text-red-600 font-medium">
                      <span>Balance Due</span>
                      <div className="text-right">
                        <span>{formatCurrency(showReceipt.balance)}</span>
                        <p className="text-[10px] text-red-400">{formatKHR(showReceipt.balance)}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end pt-1">
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{showReceipt.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 pt-1">
                    <span>Payment: {showReceipt.paymentMethod}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 px-5 pb-5 border-t border-gray-100 pt-4">
              <button
                onClick={() => { window.print() }}
                className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark cursor-pointer"
              >
                Print Invoice
              </button>
              <button
                onClick={() => setShowReceipt(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <InsufficientStockModal
        open={showInsufficient}
        onClose={() => setShowInsufficient(false)}
        items={insufficientItems}
        onAction={handleInsufficientAction}
      />

      <Modal open={showQrModal} onClose={() => { if (qrStep === 'scan') { setShowQrModal(false); setQrStep('idle') } }} title={qrStep === 'scan' ? 'Scan to Pay' : qrStep === 'verifying' ? 'Verifying Payment' : 'Payment Successful'}>
        {qrStep === 'scan' && (
          <div className="flex flex-col items-center gap-4 py-4 relative">
            <button onClick={() => { setShowQrModal(false); setQrStep('idle') }}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
              <X size={15} />
            </button>
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4">
              <img
                src="/khqr.png"
                alt="QR Code"
                className="max-w-56 h-auto mx-auto"
                onError={e => { e.target.src = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="white"/><rect x="20" y="20" width="50" height="50" fill="black"/><rect x="130" y="20" width="50" height="50" fill="black"/><rect x="20" y="130" width="50" height="50" fill="black"/><rect x="90" y="90" width="20" height="20" fill="black"/><rect x="60" y="130" width="10" height="10" fill="black"/><rect x="130" y="60" width="10" height="10" fill="black"/><rect x="60" y="60" width="10" height="10" fill="black"/><rect x="100" y="130" width="10" height="10" fill="black"/><rect x="130" y="100" width="10" height="10" fill="black"/><rect x="130" y="130" width="10" height="10" fill="black"/><rect x="40" y="100" width="10" height="10" fill="black"/></svg>`) }}
              />
            </div>
            <p className="text-lg font-bold text-gray-800">{formatCurrency(total)}</p>
            <p className="text-[11px] text-gray-400">{formatKHR(total)}</p>
            <p className="text-xs text-gray-400">Scan with Bakong / KHQR app to pay</p>
          </div>
        )}
        {qrStep === 'verifying' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-sm font-medium text-gray-700">Verifying payment with Bakong...</p>
            <p className="text-xs text-gray-400">Please wait while we confirm the transaction</p>
          </div>
        )}
        {qrStep === 'success' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-bold text-green-700">Payment Received!</p>
            <p className="text-xs text-gray-400">{formatCurrency(total)} ({formatKHR(total)}) via KHQR / Bakong</p>
          </div>
        )}
      </Modal>

      <Modal open={showNewCustomer} onClose={() => setShowNewCustomer(false)} title="New Customer">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name</label>
            <input value={newCustomerForm.name} onChange={e => setNewCustomerForm(p => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input value={newCustomerForm.phone} onChange={e => setNewCustomerForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Phone" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input value={newCustomerForm.email} onChange={e => setNewCustomerForm(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Email" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowNewCustomer(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
            <button onClick={() => {
              if (!newCustomerForm.name.trim()) return
              const newC = { id: customerIdCounter, name: newCustomerForm.name, phone: newCustomerForm.phone, email: newCustomerForm.email, totalPurchases: 0 }
              setCustomerList(prev => [...prev, newC])
              setCustomer(newCustomerForm.name)
              setCustomerIdCounter(prev => prev + 1)
              setShowNewCustomer(false)
              setNewCustomerForm({ name: '', phone: '', email: '' })
            }} className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary/90 cursor-pointer">
              Add Customer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
