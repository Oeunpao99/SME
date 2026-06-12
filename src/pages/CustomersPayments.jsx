import { useState, useMemo } from 'react'
import { Users, DollarSign, CreditCard, UserPlus, Phone, Mail, ShoppingBag, Pencil, Trash2, Search } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { customers as initialCustomers, payments as initialPayments, formatCurrency } from '../data/mockData'

let paymentIdCounter = 800
let customerIdCounter = 10

export default function CustomersPayments() {
  const [customerList, setCustomerList] = useState(initialCustomers)
  const [paymentList, setPaymentList] = useState(initialPayments)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [searchTerm, setSearchTerm] = useState('')

  const totalOutstanding = useMemo(() =>
    paymentList.reduce((s, p) => s + p.balance, 0), [paymentList]
  )

  const customerDebtSummary = useMemo(() => {
    const map = {}
    paymentList.forEach(p => {
      if (!map[p.customer]) map[p.customer] = { total: 0, paid: 0, balance: 0, count: 0 }
      map[p.customer].total += p.total
      map[p.customer].paid += p.paidAmount
      map[p.customer].balance += p.balance
      map[p.customer].count += 1
    })
    return Object.entries(map).map(([name, data]) => ({ customer: name, ...data }))
  }, [paymentList])

  const openAdd = () => {
    setEditingCustomer(null)
    setForm({ name: '', phone: '', email: '' })
    setModalOpen(true)
  }

  const openEdit = (c) => {
    setEditingCustomer(c)
    setForm({ name: c.name, phone: c.phone || '', email: c.email || '' })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editingCustomer) {
      setCustomerList(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...form } : c))
    } else {
      const newC = { id: customerIdCounter++, name: form.name, phone: form.phone, email: form.email, totalPurchases: 0 }
      setCustomerList(prev => [...prev, newC])
    }
    setModalOpen(false)
  }

  const handleDelete = (id) => {
    if (confirm('Remove this customer?')) {
      setCustomerList(prev => prev.filter(c => c.id !== id))
    }
  }

  const filteredCustomers = useMemo(() =>
    customerList.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    ), [searchTerm, customerList]
  )

  const customerWithDebt = useMemo(() =>
    filteredCustomers.map(c => {
      const debt = customerDebtSummary.find(d => d.customer === c.name)
      return { ...c, outstanding: debt?.balance || 0, invoiceCount: debt?.count || 0 }
    }), [filteredCustomers, customerDebtSummary]
  )

  const customerColumns = [
    {
      key: 'avatar', label: '',
      render: r => (
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
          {r.name[0]}
        </div>
      ),
    },
    { key: 'name', label: 'Name' },
    {
      key: 'phone', label: 'Phone',
      render: r => r.phone ? <span className="flex items-center gap-1 text-xs text-gray-500"><Phone size={11} /> {r.phone}</span> : <span className="text-xs text-gray-300">—</span>,
    },
    {
      key: 'email', label: 'Email',
      render: r => r.email ? <span className="flex items-center gap-1 text-xs text-gray-500"><Mail size={11} /> {r.email}</span> : <span className="text-xs text-gray-300">—</span>,
    },
    {
      key: 'outstanding', label: 'Outstanding',
      render: r => <span className={`font-medium ${r.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(r.outstanding)}</span>,
    },
    { key: 'invoiceCount', label: 'Invoices' },
    {
      key: 'actions', label: '',
      render: r => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 cursor-pointer">
            <Pencil size={15} />
          </button>
          <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600 cursor-pointer">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  const paymentColumns = [
    { key: 'invoice', label: 'Invoice' },
    { key: 'date', label: 'Date' },
    { key: 'customer', label: 'Customer' },
    { key: 'total', label: 'Total', render: r => formatCurrency(r.total) },
    { key: 'paidAmount', label: 'Paid', render: r => formatCurrency(r.paidAmount) },
    {
      key: 'balance', label: 'Balance',
      render: r => <span className={`font-medium ${r.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(r.balance)}</span>,
    },
    { key: 'status', label: 'Status', render: r => <Badge variant={r.status}>{r.status}</Badge> },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Users size={20} className="text-blue-600" /></div>
          <div><p className="text-xs text-gray-500">Total Customers</p><p className="text-lg font-bold text-gray-800">{customerList.length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center"><DollarSign size={20} className="text-red-600" /></div>
          <div><p className="text-xs text-gray-500">Total Outstanding</p><p className="text-lg font-bold text-red-700">{formatCurrency(totalOutstanding)}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center"><CreditCard size={20} className="text-orange-600" /></div>
          <div><p className="text-xs text-gray-500">Unpaid Invoices</p><p className="text-lg font-bold text-orange-700">{paymentList.filter(p => p.status !== 'Paid').length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><Users size={20} className="text-purple-600" /></div>
          <div><p className="text-xs text-gray-500">With Balance</p><p className="text-lg font-bold text-gray-800">{customerDebtSummary.filter(c => c.balance > 0).length}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Users size={18} className="text-primary" /> Customers</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by name or phone..."
                className="w-56 pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button onClick={openAdd} className="flex items-center gap-1.5 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 cursor-pointer">
              <UserPlus size={14} /> Add Customer
            </button>
          </div>
        </div>
        <DataTable columns={customerColumns} data={customerWithDebt} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><ShoppingBag size={18} className="text-primary" /> Payment Invoices</h3>
          <span className="text-xs text-gray-400">{paymentList.length} invoices</span>
        </div>
        <DataTable columns={paymentColumns} data={paymentList} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingCustomer ? 'Edit Customer' : 'Add Customer'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name <span className="text-red-400">*</span></label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Customer name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Phone number" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="email@example.com" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
            <button onClick={handleSave}
              className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary/90 cursor-pointer">
              {editingCustomer ? 'Update' : 'Create Customer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
