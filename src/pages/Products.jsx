import { useState, useRef } from 'react'
import { Plus, Edit3, Trash2, Barcode, MapPin, Upload } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { products as initialProducts, categories, locations, units, formatCurrency } from '../data/mockData'

let productIdCounter = 500

export default function Products({ globalProducts, onUpdateProducts }) {
  const [productList, setProductList] = useState(globalProducts || initialProducts)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fileInputRef = useRef(null)

  const emptyForm = {
    code: '', barcode: '', name: '', image: '/placeholder.png', category: 'Beverages',
    unit: 'Piece', location: 'Main Warehouse', costPrice: 0, sellingPrice: 0,
    currentStock: 0, minStock: 0, status: 'Active',
  }
  const [form, setForm] = useState(emptyForm)

  function openAdd() {
    setForm({ ...emptyForm, barcode: String(Math.floor(100000000000 + Math.random() * 900000000000)) })
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(product) {
    setForm(product)
    setEditing(product)
    setModalOpen(true)
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
      <div className="flex items-center gap-2">
        <div className="flex items-end gap-[1px] h-5">
          {(r.barcode || '').split('').slice(0, 8).map((d, i) => (
            <div key={i} className="w-[1.5px] bg-gray-500 rounded-sm h-5" />
          ))}
        </div>
        <span className="text-[10px] text-gray-400 font-mono">{r.barcode}</span>
      </div>
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
        <div className="space-y-5">
          <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Basic Information</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-medium">Product Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  className="w-full mt-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Barcode</label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input type="text" name="barcode" value={form.barcode} onChange={handleChange}
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono tracking-wider" />
                  <div className="shrink-0 w-14 h-10 rounded bg-white border border-gray-200 flex items-center justify-center overflow-hidden px-1.5">
                    <div className="flex items-end gap-[1.5px] h-7">
                      {(form.barcode || '').split('').slice(0, 8).map((d, i) => (
                        <div key={i} className="w-[2px] bg-gray-800 rounded-sm h-7" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Unit</label>
                <select name="unit" value={form.unit} onChange={handleChange}
                  className="w-full mt-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Category</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full mt-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Location</label>
                <select name="location" value={form.location} onChange={handleChange}
                  className="w-full mt-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Pricing & Inventory</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-medium">Cost Price ($)</label>
                <input type="number" name="costPrice" value={form.costPrice} onChange={handleChange}
                  className="w-full mt-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" min="0" step="0.01" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Selling Price ($)</label>
                <input type="number" name="sellingPrice" value={form.sellingPrice} onChange={handleChange}
                  className="w-full mt-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" min="0" step="0.01" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Current Stock</label>
                <input type="number" name="currentStock" value={form.currentStock} onChange={handleChange}
                  className="w-full mt-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" min="0" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Min Stock</label>
                <input type="number" name="minStock" value={form.minStock} onChange={handleChange}
                  className="w-full mt-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" min="0" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Status & Image</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-medium">Status</label>
                <select name="status" value={form.status} onChange={handleChange}
                  className="w-full mt-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-white hover:border-primary/40 cursor-pointer transition-all w-full">
                  <Upload size={16} />
                  Upload Image
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (file.size > 2 * 1024 * 1024) {
                      alert('Image must be less than 2MB')
                      return
                    }
                    const reader = new FileReader()
                    reader.onload = ev => setForm(prev => ({ ...prev, image: ev.target.result }))
                    reader.readAsDataURL(file)
                  }} />
                </label>
              </div>
            </div>
            {form.image && (
              <div className="relative mt-3 inline-block">
                <img src={form.image} alt="preview" className="w-28 h-28 rounded-lg object-cover border border-gray-200" />
                <button onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-gray-700 text-white rounded-full text-[10px] flex items-center justify-center hover:bg-gray-900 cursor-pointer">×</button>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-gray-100">
          <button onClick={() => setModalOpen(false)} className="px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer shadow-sm shadow-primary/20">
            {editing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
