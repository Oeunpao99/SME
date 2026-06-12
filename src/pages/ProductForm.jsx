import { useState, useRef } from 'react'
import { ArrowLeft, Upload, HelpCircle } from 'lucide-react'
import { categories } from '../data/mockData'

export default function ProductForm({ editingProduct, onBack, onSave }) {
  const fileInputRef = useRef(null)
  const isEdit = !!editingProduct

  const [form, setForm] = useState({
    name: editingProduct?.name || '',
    category: editingProduct?.category || 'Beverages',
    image: editingProduct?.image || '',
    imageFile: null,
    costPrice: editingProduct?.costPrice || 0,
    sellingPrice: editingProduct?.sellingPrice || 0,
    valuationMethod: editingProduct?.valuationMethod || 'fifo',
    currentStock: editingProduct?.currentStock ?? 0,
    reorderPoint: editingProduct?.reorderPoint || 0,
    safetyStock: editingProduct?.safetyStock || 0,
    minStock: editingProduct?.minStock || 0,
    trackSerial: editingProduct?.trackSerial || false,
    trackLot: editingProduct?.trackLot || false,
    hasExpiry: editingProduct?.hasExpiry || false,
  })

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  function handleImageSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(prev => ({ ...prev, image: ev.target.result, imageFile: file }))
    reader.readAsDataURL(file)
  }

  function handleSave(mode) {
    onSave?.({ ...form }, mode)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{isEdit ? `Editing ${editingProduct.name}` : 'Create a new product in your inventory'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 space-y-5">

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Product Name <span className="text-red-400">*</span></label>
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="Enter product name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Category <span className="text-red-400">*</span></label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Cost Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                  <input
                    type="number" name="costPrice" value={form.costPrice} onChange={handleChange}
                    min="0" step="0.01"
                    className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Selling Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                  <input
                    type="number" name="sellingPrice" value={form.sellingPrice} onChange={handleChange}
                    min="0" step="0.01"
                    className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-2 block">Inventory Valuation Method</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="valuationMethod" value="fifo" checked={form.valuationMethod === 'fifo'} onChange={handleChange}
                      className="accent-primary" />
                    <span className="text-sm text-gray-700">FIFO</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="valuationMethod" value="weighted" checked={form.valuationMethod === 'weighted'} onChange={handleChange}
                      className="accent-primary" />
                    <span className="text-sm text-gray-700">Weighted Average</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Stock Levels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isEdit && (
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Current Stock</label>
                  <input
                    type="number" name="currentStock" value={form.currentStock}
                    disabled
                    className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Reorder Point</label>
                <input
                  type="number" name="reorderPoint" value={form.reorderPoint} onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <HelpCircle size={11} /> When stock reaches this level, suggest purchase
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Safety Stock</label>
                <input
                  type="number" name="safetyStock" value={form.safetyStock} onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <HelpCircle size={11} /> Minimum before urgent alert
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Minimum Stock</label>
                <input
                  type="number" name="minStock" value={form.minStock} onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <HelpCircle size={11} /> Danger zone - urgent action needed
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Optional (Advanced)
            </h3>
            <div className="space-y-3">
              {[
                { key: 'trackSerial', label: 'Track by serial number?' },
                { key: 'trackLot', label: 'Track by lot/batch?' },
                { key: 'hasExpiry', label: 'Has expiry date?' },
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between py-2 cursor-pointer">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <div className="relative">
                    <input
                      type="checkbox" name={item.key} checked={form[item.key]} onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                  </div>
                </label>
              ))}
            </div>
          </div>

        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Product Image
            </h3>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02] transition-colors"
            >
              {form.image ? (
                <div className="relative">
                  <img src={form.image} alt="Preview" className="max-w-full h-40 object-contain mx-auto rounded-lg" />
                  <p className="text-xs text-gray-400 mt-2">Click to change image</p>
                </div>
              ) : (
                <div className="py-6">
                  <Upload size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef} type="file" accept="image/*"
                onChange={handleImageSelect} className="hidden"
              />
            </div>
          </div>
        </div>

      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pb-6">
        <button onClick={onBack} className="px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer">
          Cancel
        </button>
        <button onClick={() => handleSave('save')} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer">
          Save
        </button>
        <button onClick={() => handleSave('save_add')} className="px-5 py-2 bg-primary-light text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer">
          Save &amp; Add Another
        </button>
      </div>
    </div>
  )
}
