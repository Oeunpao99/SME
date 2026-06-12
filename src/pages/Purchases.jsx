import { useState } from 'react'
import {
  Plus, ShoppingCart, CheckCircle, AlertTriangle,
} from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import {
  products as initialProducts, suppliers, purchases as initialPurchases,
  inventoryMovements, formatCurrency, activityLog,
} from '../data/mockData'

let purchaseIdCounter = 500
let movementIdCounter = 800
let logIdCounter = 300

export default function Purchases({ globalProducts, onUpdateProducts }) {
  const [productList, setProductList] = useState(globalProducts || initialProducts)
  const [purchaseList, setPurchaseList] = useState(initialPurchases)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmReceive, setConfirmReceive] = useState(null)
  const [partialModal, setPartialModal] = useState(null)
  const [partialQtys, setPartialQtys] = useState({})

  const [form, setForm] = useState({
    supplier: suppliers[0]?.name || '',
    date: new Date().toISOString().slice(0, 10),
    items: [{ productId: '', qty: 1, costPrice: 0 }],
  })

  function handleSupplierChange(e) {
    setForm(prev => ({ ...prev, supplier: e.target.value }))
  }

  function handleItemChange(index, field, value) {
    setForm(prev => {
      const items = [...prev.items]
      items[index] = { ...items[index], [field]: field === 'productId' ? Number(value) : parseFloat(value) || 0 }
      return { ...prev, items }
    })
  }

  function addItem() {
    setForm(prev => ({ ...prev, items: [...prev.items, { productId: '', qty: 1, costPrice: 0 }] }))
  }

  function removeItem(index) {
    setForm(prev => {
      const items = prev.items.filter((_, i) => i !== index)
      return { ...prev, items: items.length === 0 ? [{ productId: '', qty: 1, costPrice: 0 }] : items }
    })
  }

  function handleCreatePO() {
    const purchaseItems = form.items.map(item => {
      const p = productList.find(pr => pr.id === item.productId)
      return { product: p?.name || 'Unknown', qty: item.qty, costPrice: item.costPrice }
    }).filter(item => item.product !== 'Unknown')

    if (purchaseItems.length === 0) return

    const totalCost = purchaseItems.reduce((s, i) => s + i.qty * i.costPrice, 0)
    const poNumber = `PO-${form.date.replace(/-/g, '')}-${purchaseIdCounter}`
    const now = `${form.date} 09:00`

    const newPurchase = {
      id: purchaseIdCounter++, poNumber, date: form.date,
      supplier: form.supplier, items: purchaseItems,
      totalCost, staff: 'Inventory Vannak',
      status: 'Ordered',
      createdBy: 'Inventory Vannak',
    }
    setPurchaseList(prev => [newPurchase, ...prev])

    activityLog.push({
      id: logIdCounter++, date: now, user: 'Inventory Vannak',
      action: `Created ${poNumber}`, module: 'Purchases',
    })

    setModalOpen(false)
    setForm({
      supplier: suppliers[0]?.name || '',
      date: new Date().toISOString().slice(0, 10),
      items: [{ productId: '', qty: 1, costPrice: 0 }],
    })
  }

  function markReceived(po) {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    const newMovements = po.items.map(item => ({
      id: movementIdCounter++, date: now, product: item.product,
      type: 'Stock In', qty: item.qty, ref: po.poNumber,
      staff: 'Inventory Vannak', note: `Purchase from ${po.supplier}`,
    }))
    inventoryMovements.push(...newMovements)
    const updated = productList.map(p => {
      const match = po.items.find(i => i.product === p.name)
      return match ? { ...p, currentStock: p.currentStock + match.qty } : p
    })
    setProductList(updated)
    onUpdateProducts?.(updated)
    setPurchaseList(prev => prev.map(p => p.id === po.id ? { ...p, status: 'Received' } : p))
    activityLog.push({
      id: logIdCounter++, date: now, user: 'Inventory Vannak',
      action: `Received ${po.poNumber}`, module: 'Purchases',
    })
  }

  function openPartial(po) {
    const initial = {}
    po.items.forEach(item => {
      const prevReceived = po.receivedQtys?.[item.product] || 0
      initial[item.product] = Math.max(0, item.qty - prevReceived)
    })
    setPartialQtys(initial)
    setPartialModal(po)
  }

  function handlePartialQty(product, val) {
    setPartialQtys(prev => ({ ...prev, [product]: Math.max(0, Number(val) || 0) }))
  }

  function confirmPartial() {
    const po = partialModal
    if (!po) return
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    const receivedItems = po.items
      .map(item => ({ ...item, received: partialQtys[item.product] || 0 }))
      .filter(item => item.received > 0)

    if (receivedItems.length === 0) return

    const newMovements = receivedItems.map(item => ({
      id: movementIdCounter++, date: now, product: item.product,
      type: 'Stock In', qty: item.received, ref: po.poNumber,
      staff: 'Inventory Vannak', note: `Purchase from ${po.supplier} (partial)`,
    }))
    inventoryMovements.push(...newMovements)

    const updated = productList.map(p => {
      const match = receivedItems.find(i => i.product === p.name)
      return match ? { ...p, currentStock: p.currentStock + match.received } : p
    })
    setProductList(updated)
    onUpdateProducts?.(updated)

    const allReceived = po.items.every(item => (partialQtys[item.product] || 0) >= item.qty)
    setPurchaseList(prev => prev.map(p =>
      p.id === po.id
        ? { ...p, status: allReceived ? 'Received' : 'Partial', receivedQtys: partialQtys }
        : p
    ))

    activityLog.push({
      id: logIdCounter++, date: now, user: 'Inventory Vannak',
      action: `Partial receive ${po.poNumber}: ${receivedItems.map(i => `${i.product} x${i.received}`).join(', ')}`,
      module: 'Purchases',
    })

    setPartialModal(null)
    setPartialQtys({})
  }

  const receivedCount = purchaseList.filter(p => p.status === 'Received').length
  const orderedCount = purchaseList.filter(p => p.status === 'Ordered' || p.status === 'Partial').length

  const columns = [
    { key: 'poNumber', label: 'PO #' },
    { key: 'date', label: 'Date' },
    { key: 'supplier', label: 'Supplier' },
    {
      key: 'items', label: 'Items',
      render: r => r.items.map(i => `${i.product} x${i.qty}`).join(', '),
    },
    { key: 'totalCost', label: 'Total', render: r => formatCurrency(r.totalCost) },
    {
      key: 'status', label: 'Status',
      render: r => <Badge variant={r.status}>{r.status}</Badge>,
    },
    { key: 'createdBy', label: 'Requested By' },
    {
      key: 'actions', label: '',
      render: r => {
        if (r.status === 'Ordered') {
          return (
            <div className="flex gap-1">
              <button onClick={() => setConfirmReceive(r)}
                className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 cursor-pointer whitespace-nowrap">
                Receive All
              </button>
              <button onClick={() => openPartial(r)}
                className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 cursor-pointer whitespace-nowrap">
                Partial
              </button>
            </div>
          )
        }
        if (r.status === 'Partial') {
          return (
            <button onClick={() => openPartial(r)}
              className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 cursor-pointer">
              Receive More
            </button>
          )
        }
        return null
      },
    },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><ShoppingCart size={20} className="text-blue-600" /></div>
          <div><p className="text-xs text-gray-500">Total Orders</p><p className="text-lg font-bold text-gray-800">{purchaseList.length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><CheckCircle size={20} className="text-green-600" /></div>
          <div><p className="text-xs text-gray-500">Received</p><p className="text-lg font-bold text-green-700">{receivedCount}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><ShoppingCart size={20} className="text-amber-600" /></div>
          <div><p className="text-xs text-gray-500">Awaiting Receipt</p><p className="text-lg font-bold text-amber-700">{orderedCount}</p></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{purchaseList.length} purchase orders</p>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer">
          <Plus size={16} /> New PO
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={purchaseList} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Purchase Order" wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Supplier</label>
              <select value={form.supplier} onChange={handleSupplierChange}
                className="w-full mt-1 p-2 border border-gray-200 rounded-md text-sm bg-white">
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Order Date</label>
              <input type="date" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full mt-1 p-2 border border-gray-200 rounded-md text-sm" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500 font-medium">Order Items</label>
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
                  <label className="text-xs text-gray-400">Unit Cost</label>
                  <input type="number" value={item.costPrice} onChange={e => handleItemChange(index, 'costPrice', e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-200 rounded-md text-sm" min="0" step="0.01" />
                </div>
                <button onClick={() => removeItem(index)} className="p-2 text-red-400 hover:text-red-600 cursor-pointer">✕</button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer">Cancel</button>
          <button onClick={handleCreatePO} className="px-4 py-1.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark cursor-pointer">
            Create Purchase Order
          </button>
        </div>
      </Modal>

      <Modal open={!!confirmReceive} onClose={() => setConfirmReceive(null)} title="Confirm Receipt">
        {confirmReceive && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-amber-50 rounded-lg p-4">
              <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Products will be added to stock</p>
                <p className="text-xs text-amber-600 mt-1">
                  Receiving <strong>{confirmReceive.poNumber}</strong> from <strong>{confirmReceive.supplier}</strong>
                </p>
                <ul className="text-xs text-amber-600 mt-2 space-y-0.5">
                  {confirmReceive.items.map((item, i) => (
                    <li key={i}>• {item.product} x{item.qty}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmReceive(null)} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer">Cancel</button>
              <button onClick={() => { markReceived(confirmReceive); setConfirmReceive(null); }}
                className="px-4 py-1.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark cursor-pointer">
                Confirm Receive
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!partialModal} onClose={() => setPartialModal(null)} title="Receive Stock (Partial)">
        <div className="space-y-4">
          {partialModal && (
            <>
              <p className="text-sm text-gray-600">
                PO: <span className="font-semibold text-gray-800">{partialModal.poNumber}</span>
                <span className="mx-2">·</span>
                Supplier: <span className="font-semibold text-gray-800">{partialModal.supplier}</span>
              </p>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Product</th>
                      <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500">Ordered</th>
                      <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500">Received So Far</th>
                      <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500">Receiving Now</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partialModal.items.map((item, i) => {
                      const prevReceived = partialModal.receivedQtys?.[item.product] || 0
                      const remaining = item.qty - prevReceived
                      return (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                          <td className="px-4 py-3 text-gray-800 font-medium">{item.product}</td>
                          <td className="px-4 py-3 text-center text-gray-700">{item.qty}</td>
                          <td className="px-4 py-3 text-center text-gray-700">{prevReceived || 0}</td>
                          <td className="px-4 py-3 text-center">
                            <input type="number" value={partialQtys[item.product] || ''}
                              onChange={e => handlePartialQty(item.product, e.target.value)}
                              max={remaining}
                              className="w-20 px-2 py-1.5 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              placeholder="0" />
                            <span className="text-xs text-gray-400 ml-1">/ {remaining}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setPartialModal(null)} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer">Cancel</button>
          <button onClick={confirmPartial} className="px-4 py-1.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark cursor-pointer">
            Confirm Receipt
          </button>
        </div>
      </Modal>


    </div>
  )
}
