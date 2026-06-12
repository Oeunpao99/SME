import { useState, useMemo } from 'react'
import { Plus, ArrowUpDown, Package, DollarSign, AlertTriangle, MapPin } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { products as initialProducts, inventoryMovements as initialMovements, formatCurrency, activityLog } from '../data/mockData'

let movementIdCounter = 900
let logIdCounter = 200

export default function Inventory({ globalProducts, onUpdateProducts, onNavigateAdjustment }) {
  const [productList, setProductList] = useState(globalProducts || initialProducts)
  const [movements, setMovements] = useState(initialMovements)
  const [modalOpen, setModalOpen] = useState(false)
  const [movementType, setMovementType] = useState('Stock In')
  const [activeTab, setActiveTab] = useState('products')

  const [form, setForm] = useState({
    productId: '', qty: '', note: '',
  })
  const [formError, setFormError] = useState('')

  const lowStockProducts = useMemo(() =>
    productList.filter(p => p.currentStock <= p.minStock), [productList]
  )

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function openMovement(type) {
    setMovementType(type)
    setForm({ productId: '', qty: '', note: '' })
    setFormError('')
    setModalOpen(true)
  }

  function handleSave() {
    setFormError('')

    if (!form.productId) {
      setFormError('Please select a product')
      return
    }
    const product = productList.find(p => p.id === Number(form.productId))
    if (!product) {
      setFormError('Product not found')
      return
    }

    const qty = parseInt(form.qty) || 0
    if (qty <= 0) {
      setFormError('Please enter a valid quantity')
      return
    }

    let newStock = product.currentStock
    if (movementType === 'Stock In') newStock += qty
    else if (movementType === 'Stock Out') newStock = Math.max(0, newStock - qty)
    else if (movementType === 'Adjustment') newStock = qty

    const updatedProducts = productList.map(p =>
      p.id === product.id ? { ...p, currentStock: newStock } : p
    )
    setProductList(updatedProducts)
    onUpdateProducts?.(updatedProducts)

    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    const newMovement = {
      id: movementIdCounter++, date: now, product: product.name,
      type: movementType, qty: movementType === 'Stock In' ? qty : (movementType === 'Stock Out' ? -qty : qty),
      ref: `ADJ-${movementIdCounter}`, staff: 'Inventory Vannak', note: form.note || movementType,
    }
    setMovements(prev => [newMovement, ...prev])

    activityLog.push({
      id: logIdCounter++, date: now, user: 'Inventory Vannak',
      action: `${movementType} ${product.name} qty:${qty}`, module: 'Inventory',
    })

    setModalOpen(false)
  }

  const productColumns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Product' },
    { key: 'category', label: 'Category' },
    { key: 'currentStock', label: 'Current Stock', render: r => (
      <span className={r.currentStock <= r.minStock ? 'text-red-600 font-medium' : ''}>{r.currentStock}</span>
    )},
    { key: 'minStock', label: 'Min Stock' },
    { key: 'status', label: 'Status', render: r => r.currentStock <= r.minStock
      ? <Badge variant="Low">Low Stock</Badge>
      : <Badge variant={r.status}>{r.status}</Badge>
    },
  ]

  const movementColumns = [
    { key: 'date', label: 'Date' },
    { key: 'product', label: 'Product' },
    { key: 'type', label: 'Type', render: r => <Badge variant={r.type}>{r.type}</Badge> },
    { key: 'qty', label: 'Qty', render: r => (
      <span className={r.qty > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
        {r.qty > 0 ? `+${r.qty}` : r.qty}
      </span>
    )},
    { key: 'ref', label: 'Reference' },
    { key: 'staff', label: 'Staff' },
    { key: 'note', label: 'Note' },
  ]

  const totalStockValue = useMemo(() =>
    productList.reduce((s, p) => s + p.currentStock * p.costPrice, 0), [productList]
  )
  const totalItems = useMemo(() =>
    productList.reduce((s, p) => s + p.currentStock, 0), [productList]
  )

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Package size={20} className="text-blue-600" /></div>
          <div><p className="text-xs text-gray-500">Total Products</p><p className="text-lg font-bold text-gray-800">{productList.length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><DollarSign size={20} className="text-green-600" /></div>
          <div><p className="text-xs text-gray-500">Stock Value</p><p className="text-lg font-bold text-green-700">{formatCurrency(totalStockValue)}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center"><AlertTriangle size={20} className="text-red-600" /></div>
          <div><p className="text-xs text-gray-500">Low Stock</p><p className="text-lg font-bold text-red-700">{lowStockProducts.length}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><MapPin size={20} className="text-purple-600" /></div>
          <div><p className="text-xs text-gray-500">Total Items</p><p className="text-lg font-bold text-gray-800">{totalItems}</p></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'products' ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            Inventory List
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === 'movements' ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            Movement History
          </button>
        </div>
        <div className="flex gap-2">
          {activeTab === 'products' && (
            <>
              <button onClick={() => openMovement('Stock In')} className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 cursor-pointer"><Plus size={16} /> Stock In</button>
              <button onClick={() => openMovement('Stock Out')} className="flex items-center gap-1 bg-orange-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-orange-700 cursor-pointer"><ArrowUpDown size={16} /> Stock Out</button>
              <button onClick={onNavigateAdjustment} className="flex items-center gap-1 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-700 cursor-pointer"><ArrowUpDown size={16} /> Adjust</button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {activeTab === 'products' ? (
          <DataTable columns={productColumns} data={productList} />
        ) : (
          <DataTable columns={movementColumns} data={movements} />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={movementType}>
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
              {formError}
            </div>
          )}
          <div>
            <label className="text-xs text-gray-500">Product <span className="text-red-400">*</span></label>
            <select name="productId" value={form.productId} onChange={e => { handleChange(e); setFormError('') }}
              className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="">Select product</option>
              {productList.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</option>
              ))}
            </select>
          </div>
          {movementType === 'Adjustment' ? (
            <div>
              <label className="text-xs text-gray-500">New Stock Quantity <span className="text-red-400">*</span></label>
              <input type="number" name="qty" value={form.qty} onChange={e => { handleChange(e); setFormError('') }}
                className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm" min="0" placeholder="0" />
            </div>
          ) : (
            <div>
              <label className="text-xs text-gray-500">Quantity <span className="text-red-400">*</span></label>
              <input type="number" name="qty" value={form.qty} onChange={e => { handleChange(e); setFormError('') }}
                className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm" min="1" placeholder="0" />
            </div>
          )}
          <div>
            <label className="text-xs text-gray-500">Note</label>
            <input type="text" name="note" value={form.note} onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm" placeholder="Optional note" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark cursor-pointer">
            Save
          </button>
        </div>
      </Modal>
    </div>
  )
}
