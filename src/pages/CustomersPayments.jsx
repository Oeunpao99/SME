import { useState, useMemo } from 'react'
import { Users, DollarSign, CreditCard, UserPlus, Phone, Mail, ShoppingBag, Search } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import KPICard from '../components/KPICard'
import { customers as initialCustomers, payments as initialPayments, formatCurrency } from '../data/mockData'

let paymentIdCounter = 800
let customerIdCounter = 10

export default function CustomersPayments() {
  const [customerList, setCustomerList] = useState(initialCustomers)
  const [paymentList, setPaymentList] = useState(initialPayments)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [recordAmount, setRecordAmount] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', phone: '', email: '' })

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

  const filteredCustomers = useMemo(() =>
    customerList.filter(c =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
    ), [customerSearch, customerList]
  )

  const customerInvoices = useMemo(() => {
    if (!selectedCustomer) return []
    return paymentList.filter(p => p.customer === selectedCustomer.name)
  }, [selectedCustomer, paymentList])

  const customerPaymentTotal = useMemo(() => {
    if (!selectedCustomer) return 0
    return paymentList
      .filter(p => p.customer === selectedCustomer.name)
      .reduce((s, p) => s + p.total, 0)
  }, [selectedCustomer, paymentList])

  const customerPaidTotal = useMemo(() => {
    if (!selectedCustomer) return 0
    return paymentList
      .filter(p => p.customer === selectedCustomer.name)
      .reduce((s, p) => s + p.paidAmount, 0)
  }, [selectedCustomer, paymentList])

  const customerBalance = customerPaymentTotal - customerPaidTotal

  function openRecordPayment(payment) {
    setSelectedPayment(payment)
    setRecordAmount('')
    setModalOpen(true)
  }

  function handleRecordPayment() {
    if (!selectedPayment || !recordAmount) return
    const amount = parseFloat(recordAmount)
    if (amount <= 0) return

    const updated = paymentList.map(p => {
      if (p.id !== selectedPayment.id) return p
      const newPaid = p.paidAmount + amount
      const newBalance = Math.max(0, p.total - newPaid)
      return {
        ...p,
        paidAmount: newPaid,
        balance: newBalance,
        status: newBalance <= 0 ? 'Paid' : 'Partial',
      }
    })
    setPaymentList(updated)
    setModalOpen(false)
  }

  const paymentColumns = [
    { key: 'invoice', label: 'Invoice' },
    { key: 'date', label: 'Date' },
    { key: 'total', label: 'Total', render: r => formatCurrency(r.total) },
    { key: 'paidAmount', label: 'Paid', render: r => formatCurrency(r.paidAmount) },
    {
      key: 'balance', label: 'Balance',
      render: r => <span className={`font-medium ${r.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(r.balance)}</span>,
    },
    { key: 'status', label: 'Status', render: r => <Badge variant={r.status}>{r.status}</Badge> },
    {
      key: 'actions', label: '',
      render: r => r.status !== 'Paid' ? (
        <button onClick={() => openRecordPayment(r)}
          className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark cursor-pointer">
          Record Payment
        </button>
      ) : <span className="text-xs text-gray-400">—</span>,
    },
  ]

  const customerCols = [
    { key: 'customer', label: 'Customer' },
    { key: 'total', label: 'Total', render: r => formatCurrency(r.total) },
    { key: 'paid', label: 'Paid', render: r => formatCurrency(r.paid) },
    {
      key: 'balance', label: 'Outstanding',
      render: r => <span className="text-red-600 font-medium">{formatCurrency(r.balance)}</span>,
    },
    { key: 'count', label: 'Invoices' },
  ]

  const invoiceCols = [
    { key: 'invoice', label: 'Invoice' },
    { key: 'date', label: 'Date' },
    { key: 'total', label: 'Total', render: r => formatCurrency(r.total) },
    {
      key: 'balance', label: 'Balance',
      render: r => <span className={`font-medium ${r.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(r.balance)}</span>,
    },
    { key: 'status', label: 'Status', render: r => <Badge variant={r.status}>{r.status}</Badge> },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KPICard title="Total Customers" value={customerList.length} icon={Users} color="text-blue-600" bg="bg-blue-50" />
        <KPICard title="Total Outstanding" value={formatCurrency(totalOutstanding)} icon={DollarSign} color="text-red-600" bg="bg-red-50" />
        <KPICard title="Unpaid Invoices" value={paymentList.filter(p => p.status !== 'Paid').length} icon={CreditCard} color="text-orange-600" bg="bg-orange-50" />
        <KPICard title="With Balance" value={customerDebtSummary.filter(c => c.balance > 0).length} icon={Users} color="text-purple-600" bg="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm">Customers</h3>
            <button onClick={() => { setNewCustomerForm({ name: '', phone: '', email: '' }); setShowNewCustomer(true) }}
              className="flex items-center gap-1 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 cursor-pointer">
              <UserPlus size={13} /> Add
            </button>
          </div>
          <div className="relative mb-3">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={customerSearch} onChange={e => setCustomerSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No customers found</p>
            ) : (
              filteredCustomers.map(c => {
                const debt = customerDebtSummary.find(d => d.customer === c.name)
                const isSelected = selectedCustomer?.id === c.id
                return (
                  <button key={c.id} onClick={() => setSelectedCustomer(c)}
                    className={`w-full text-left p-2.5 rounded-lg transition-colors cursor-pointer ${
                      isSelected ? 'bg-primary/5 border border-primary/20' : 'hover:bg-gray-50 border border-transparent'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isSelected ? 'text-primary' : 'text-gray-800'}`}>{c.name}</p>
                        <p className="text-xs text-gray-400 truncate">{c.phone || 'No phone'}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className={`text-xs font-semibold ${debt?.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {debt ? formatCurrency(debt.balance) : '$0.00'}
                        </p>
                        <p className="text-[10px] text-gray-400">{debt?.count || 0} invoices</p>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          {selectedCustomer ? (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {selectedCustomer.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{selectedCustomer.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        {selectedCustomer.phone && <span className="flex items-center gap-1"><Phone size={11} /> {selectedCustomer.phone}</span>}
                        {selectedCustomer.email && <span className="flex items-center gap-1"><Mail size={11} /> {selectedCustomer.email}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Outstanding Balance</p>
                    <p className={`text-xl font-bold ${customerBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(customerBalance)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Total Purchases</p>
                    <p className="text-sm font-semibold text-gray-800">{formatCurrency(customerPaymentTotal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Paid</p>
                    <p className="text-sm font-semibold text-green-700">{formatCurrency(customerPaidTotal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Invoices</p>
                    <p className="text-sm font-semibold text-gray-800">{customerInvoices.length}</p>
                  </div>
                </div>
              </div>

              {customerInvoices.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <ShoppingBag size={15} className="text-primary" /> Invoice History
                  </h3>
                  <DataTable columns={invoiceCols} data={customerInvoices} />
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Users size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-500 font-medium">Select a customer</p>
              <p className="text-xs text-gray-400 mt-1">Choose a customer from the list to view their details</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-sm">All Payment Invoices</h3>
              <span className="text-xs text-gray-400">{paymentList.length} invoices</span>
            </div>
            <DataTable columns={paymentColumns} data={paymentList} />
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record Payment">
        {selectedPayment && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
              <p className="text-sm"><span className="text-gray-500">Invoice:</span> <span className="font-medium">{selectedPayment.invoice}</span></p>
              <p className="text-sm"><span className="text-gray-500">Customer:</span> <span className="font-medium">{selectedPayment.customer}</span></p>
              <p className="text-sm"><span className="text-gray-500">Total:</span> <span className="font-medium">{formatCurrency(selectedPayment.total)}</span></p>
              <p className="text-sm"><span className="text-gray-500">Paid So Far:</span> <span className="font-medium">{formatCurrency(selectedPayment.paidAmount)}</span></p>
              <p className="text-sm"><span className="text-gray-500">Balance:</span> <span className="font-medium text-red-600">{formatCurrency(selectedPayment.balance)}</span></p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Payment Amount ($)</label>
              <input type="number" value={recordAmount} onChange={e => setRecordAmount(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm" min="0" step="0.01" placeholder="Enter amount..." />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">Cancel</button>
              <button onClick={handleRecordPayment} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark cursor-pointer">
                Record Payment
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showNewCustomer} onClose={() => setShowNewCustomer(false)} title="New Customer">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name <span className="text-red-400">*</span></label>
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
              const newC = { id: customerIdCounter++, name: newCustomerForm.name, phone: newCustomerForm.phone, email: newCustomerForm.email, totalPurchases: 0 }
              setCustomerList(prev => [...prev, newC])
              setSelectedCustomer(newC)
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
