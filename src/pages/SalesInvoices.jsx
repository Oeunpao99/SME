import { useState, useMemo } from 'react'
import {
  Plus, FileText, CheckCircle, Clock, DollarSign,
  XCircle, UserPlus
} from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import {
  products as initialProducts, customers, formatCurrency,
  inventoryMovements, activityLog
} from '../data/mockData'

let invoiceIdCounter = 3000
let movementIdCounter = 900
let logIdCounter = 400

const invoiceStatuses = ['Pending', 'Completed', 'Cancelled']

export default function SalesInvoices({ globalProducts, onUpdateProducts }) {
  const [productList, setProductList] = useState(globalProducts || initialProducts)
  const [invoiceList, setInvoiceList] = useState([])
  const [customerList, setCustomerList] = useState(customers)
  const [modalOpen, setModalOpen] = useState(false)
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [customerIdCounter, setCustomerIdCounter] = useState(10)
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', phone: '', email: '' })
  const [filterStatus, setFilterStatus] = useState('All')

  const [form, setForm] = useState({
    customer: customers[0]?.name || '',
    date: new Date().toISOString().slice(0, 10),
    items: [{ productId: '', qty: 1, unitPrice: 0 }],
  })

  function handleCustomerChange(e) {
    setForm(prev => ({ ...prev, customer: e.target.value }))
  }

  function handleItemChange(index, field, value) {
    setForm(prev => {
      const items = [...prev.items]
      const parsed = field === 'productId' ? Number(value) : parseFloat(value) || 0
      items[index] = { ...items[index], [field]: parsed }

      if (field === 'productId' && parsed) {
        const p = productList.find(pr => pr.id === parsed)
        if (p) items[index].unitPrice = p.sellingPrice
      }
      return { ...prev, items }
    })
  }

  function addItem() {
    setForm(prev => ({ ...prev, items: [...prev.items, { productId: '', qty: 1, unitPrice: 0 }] }))
  }

  function removeItem(index) {
    setForm(prev => {
      const items = prev.items.filter((_, i) => i !== index)
      return { ...prev, items: items.length === 0 ? [{ productId: '', qty: 1, unitPrice: 0 }] : items }
    })
  }

  function handleCreate() {
    const invoiceItems = form.items.map(item => {
      const p = productList.find(pr => pr.id === item.productId)
      return { product: p?.name || 'Unknown', qty: item.qty, unitPrice: item.unitPrice }
    }).filter(item => item.product !== 'Unknown')

    if (invoiceItems.length === 0) return

    const total = invoiceItems.reduce((s, i) => s + i.qty * i.unitPrice, 0)
    const invNumber = `INV-${form.date.replace(/-/g, '')}-${invoiceIdCounter}`
    const now = `${form.date} 09:00`

    const newInvoice = {
      id: invoiceIdCounter++, invoiceNumber: invNumber, date: form.date,
      customer: form.customer, items: invoiceItems,
      total, status: 'Pending',
      createdBy: 'Owner Admin',
    }
    setInvoiceList(prev => [newInvoice, ...prev])

    activityLog.push({
      id: logIdCounter++, date: now, user: 'Owner Admin',
      action: `Created invoice ${invNumber} for ${form.customer}`, module: 'Sales',
    })

    setModalOpen(false)
    setForm({
      customer: customers[0]?.name || '',
      date: new Date().toISOString().slice(0, 10),
      items: [{ productId: '', qty: 1, unitPrice: 0 }],
    })
  }

  function updateInvoiceStatus(invoice, newStatus) {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')

    setInvoiceList(prev => prev.map(i =>
      i.id === invoice.id ? { ...i, status: newStatus } : i
    ))

    if (newStatus === 'Completed') {
      const newMovements = invoice.items.map(item => ({
        id: movementIdCounter++, date: now, product: item.product,
        type: 'Stock Out', qty: -item.qty, ref: invoice.invoiceNumber,
        staff: 'Owner Admin', note: `Sale to ${invoice.customer}`,
      }))
      inventoryMovements.push(...newMovements)

      const updated = productList.map(p => {
        const match = invoice.items.find(i => i.product === p.name)
        return match ? { ...p, currentStock: Math.max(0, p.currentStock - match.qty) } : p
      })
      setProductList(updated)
      onUpdateProducts?.(updated)
    }

    activityLog.push({
      id: logIdCounter++, date: now, user: 'Owner Admin',
      action: `${newStatus} invoice ${invoice.invoiceNumber} for ${invoice.customer}`, module: 'Sales',
    })
  }

  const filtered = useMemo(() => {
    if (filterStatus === 'All') return invoiceList
    return invoiceList.filter(i => i.status === filterStatus)
  }, [filterStatus, invoiceList])

  const totalRevenue = useMemo(() =>
    invoiceList.filter(i => i.status === 'Completed').reduce((s, i) => s + i.total, 0), [invoiceList]
  )
  const pendingCount = invoiceList.filter(i => i.status === 'Pending').length
  const completedCount = invoiceList.filter(i => i.status === 'Completed').length

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { key: 'date', label: 'Date' },
    { key: 'customer', label: 'Customer' },
    {
      key: 'items', label: 'Items',
      render: r => r.items.map(i => `${i.product} x${i.qty}`).join(', '),
    },
    { key: 'total', label: 'Total', render: r => formatCurrency(r.total) },
    {
      key: 'status', label: 'Status',
      render: r => <Badge variant={r.status === 'Completed' ? 'Paid' : r.status === 'Pending' ? 'Pending' : 'Unpaid'}>{r.status}</Badge>,
    },
    { key: 'createdBy', label: 'Created By' },
    {
      key: 'actions', label: '',
      render: r => {
        if (r.status === 'Pending') {
          return (
            <div className="flex gap-1">
              <button onClick={() => updateInvoiceStatus(r, 'Completed')}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded cursor-pointer" title="Complete">
                <CheckCircle size={15} />
              </button>
              <button onClick={() => updateInvoiceStatus(r, 'Cancelled')}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer" title="Cancel">
                <XCircle size={15} />
              </button>
            </div>
          )
        }
        return null
      },
    },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><FileText size={20} className="text-blue-600" /></div>
          <div><p className="text-xs text-gray-500">Total Invoices</p><p className="text-lg font-bold text-gray-800">{invoiceList.length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><CheckCircle size={20} className="text-green-600" /></div>
          <div><p className="text-xs text-gray-500">Completed</p><p className="text-lg font-bold text-green-700">{completedCount}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center"><Clock size={20} className="text-yellow-600" /></div>
          <div><p className="text-xs text-gray-500">Pending</p><p className="text-lg font-bold text-yellow-700">{pendingCount}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><DollarSign size={20} className="text-purple-600" /></div>
          <div><p className="text-xs text-gray-500">Revenue</p><p className="text-lg font-bold text-purple-700">{formatCurrency(totalRevenue)}</p></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['All', 'Pending', 'Completed', 'Cancelled'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                filterStatus === s ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {s === 'All' ? 'All Invoices' : s}
            </button>
          ))}
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer">
          <Plus size={16} /> New Invoice
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={filtered} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Sales Invoice" wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Customer <span className="text-red-400">*</span></label>
              <div className="flex gap-1.5 mt-1">
                <select value={form.customer} onChange={handleCustomerChange}
                  className="flex-1 p-2 border border-gray-200 rounded-md text-sm bg-white">
                  {customerList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <button onClick={() => setShowNewCustomer(true)}
                  className="px-2.5 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500 hover:text-primary transition-colors cursor-pointer shrink-0">
                  <UserPlus size={16} />
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Invoice Date</label>
              <input type="date" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full mt-1 p-2 border border-gray-200 rounded-md text-sm" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500 font-medium">Invoice Items</label>
              <button onClick={addItem} className="text-xs text-primary hover:underline cursor-pointer">+ Add Item</button>
            </div>
            {form.items.map((item, index) => (
              <div key={index} className="flex gap-2 items-end mb-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-400">Product</label>
                  <select value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-200 rounded-md text-sm bg-white">
                    <option value="">Select</option>
                    {productList.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</option>)}
                  </select>
                </div>
                <div className="w-20">
                  <label className="text-xs text-gray-400">Qty</label>
                  <input type="number" value={item.qty} onChange={e => handleItemChange(index, 'qty', e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-200 rounded-md text-sm" min="1" />
                </div>
                <div className="w-24">
                  <label className="text-xs text-gray-400">Unit Price</label>
                  <input type="number" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-200 rounded-md text-sm" min="0" step="0.01" />
                </div>
                <div className="w-20 text-right text-sm text-gray-700 pt-5">
                  {item.productId ? formatCurrency(Number(item.qty) * Number(item.unitPrice)) : ''}
                </div>
                <button onClick={() => removeItem(index)} className="p-2 text-red-400 hover:text-red-600 cursor-pointer pt-5">✕</button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer">Cancel</button>
          <button onClick={handleCreate} className="px-4 py-1.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark cursor-pointer">
            Create Invoice
          </button>
        </div>
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
              setForm(prev => ({ ...prev, customer: newCustomerForm.name }))
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
