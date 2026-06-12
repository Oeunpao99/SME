import { useState } from 'react'
import { Plus, Edit3, Trash2, Barcode, MapPin } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { products as initialProducts, categories, locations, formatCurrency } from '../data/mockData'

let productIdCounter = 500

export default function Products({ globalProducts, onUpdateProducts, onNavigateForm }) {
  const [productList, setProductList] = useState(globalProducts || initialProducts)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const emptyForm = {
    code: '', barcode: '', name: '', image: '/placeholder.png', category: 'Beverages',
    unit: 'Piece', location: 'Main Warehouse', costPrice: 0, sellingPrice: 0,
    currentStock: 0, minStock: 0, status: 'Active',
  }
  const [form, setForm] = useState(emptyForm)

  function openAdd() {
    onNavigateForm?.()
  }

  function openEdit(product) {
    onNavigateForm?.(product)
  }

  function handleChange(e) {
    const { name, value, type } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }))
  }

  function handleSave() {
    if (!form.name) return
    if (editing) {
      const updated = productList.map(p => p.id === editing.id ? { ...form, id: p.id, code: p.code } : p)
      setProductList(updated)
      onUpdateProducts?.(updated)
    } else {
      const newProduct = {
        ...form,
        id: productIdCounter++,
        code: `PRD${String(productIdCounter).padStart(3, '0')}`,
      }
      const updated = [...productList, newProduct]
      setProductList(updated)
      onUpdateProducts?.(updated)
    }
    setModalOpen(false)
  }

  function handleDelete(id) {
    const updated = productList.filter(p => p.id !== id)
    setProductList(updated)
    onUpdateProducts?.(updated)
  }

  const filtered = productList.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.barcode && p.barcode.includes(searchTerm))
  )

  const columns = [
    {
      key: 'image', label: '',
      render: r => <img src={r.image} alt={r.name} className="w-9 h-9 rounded object-cover" />,
    },
    { key: 'code', label: 'Code' },
    { key: 'barcode', label: 'Barcode', render: r => (
      <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
        <Barcode size={12} /> {r.barcode}
      </span>
    )},
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    { key: 'unit', label: 'Unit' },
    { key: 'location', label: 'Location', render: r => (
      <span className="text-xs flex items-center gap-1"><MapPin size={12} className="text-gray-400" /> {r.location}</span>
    )},
    { key: 'costPrice', label: 'Cost', render: r => formatCurrency(r.costPrice) },
    { key: 'sellingPrice', label: 'Selling', render: r => formatCurrency(r.sellingPrice) },
    { key: 'currentStock', label: 'Stock' },
    { key: 'minStock', label: 'Min' },
    {
      key: 'status', label: 'Status',
      render: r => r.currentStock <= r.minStock
        ? <Badge variant="Low">Low Stock</Badge>
        : <Badge variant={r.status}>{r.status}</Badge>,
    },
    {
      key: 'actions', label: '',
      render: r => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"><Edit3 size={15} /></button>
          <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              type="text" placeholder="Search by name, code or barcode..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
            />
            <span className="text-xs text-gray-400">{filtered.length} products</span>
          </div>
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer">
            <Plus size={16} /> New Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={filtered} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'New Product'} wide>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3">
            <label className="text-xs text-gray-500">Image URL</label>
            <div className="flex gap-3 items-center">
              <input type="text" name="image" value={form.image || ''} onChange={handleChange}
                className="flex-1 mt-1 p-2 border border-gray-200 rounded-md text-sm" placeholder="/placeholder.png" />
              {form.image && <img src={form.image} alt="preview" className="w-10 h-10 rounded object-cover border shrink-0" />}
            </div>
          </div>
          {['name', 'barcode', 'unit'].map(f => (
            <div key={f}>
              <label className="text-xs text-gray-500 capitalize">{f === 'name' ? 'Product Name' : f}</label>
              <input type="text" name={f} value={form[f]} onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-200 rounded-md text-sm" />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500">Category</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-200 rounded-md text-sm bg-white">
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Location</label>
            <select name="location" value={form.location} onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-200 rounded-md text-sm bg-white">
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          {['costPrice', 'sellingPrice', 'currentStock', 'minStock'].map(f => (
            <div key={f}>
              <label className="text-xs text-gray-500 capitalize">{f.replace(/([A-Z])/g, ' $1')}</label>
              <input type="number" name={f} value={form[f]} onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-200 rounded-md text-sm" min="0" step="0.01" />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500">Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-200 rounded-md text-sm bg-white">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer">Cancel</button>
          <button onClick={handleSave} className="px-4 py-1.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark cursor-pointer">
            {editing ? 'Update' : 'Create'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
