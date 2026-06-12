import { useState, useMemo, useRef } from 'react'
import { ArrowLeft, Upload, Search, X } from 'lucide-react'
import { products as initialProducts } from '../data/mockData'

const REASONS = [
  { value: 'damaged', label: 'Damaged goods' },
  { value: 'lost_stolen', label: 'Lost/Stolen' },
  { value: 'found_discrepancy', label: 'Found/Discrepancy' },
  { value: 'return_customer', label: 'Return from customer' },
  { value: 'supplier_credit', label: 'Supplier credit' },
  { value: 'physical_count', label: 'Physical count correction' },
  { value: 'other', label: 'Other (custom)' },
]

const APPROVERS = [
  { id: 1, name: 'Owner Admin', role: 'Owner' },
  { id: 2, name: 'Manager Dara', role: 'Manager' },
  { id: 3, name: 'Inventory Vannak', role: 'Inventory Staff' },
]

export default function StockAdjustment({ globalProducts, onUpdateProducts, onBack }) {
  const fileInputRef = useRef(null)
  const [productSearch, setProductSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [adjType, setAdjType] = useState('increase')
  const [quantity, setQuantity] = useState(0)
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [supportingFile, setSupportingFile] = useState(null)
  const [supportingFileName, setSupportingFileName] = useState('')
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [approver, setApprover] = useState('')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [adjustmentId, setAdjustmentId] = useState(null)

  const productList = globalProducts || initialProducts

  const filteredProducts = useMemo(() =>
    productList.filter(p =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(productSearch.toLowerCase())
    ), [productSearch, productList]
  )

  function selectProduct(product) {
    setSelectedProduct(product)
    setProductSearch(product.name)
    setShowDropdown(false)
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setSupportingFile(file)
    setSupportingFileName(file.name)
  }

  function generateAdjustmentId() {
    const ts = Date.now().toString(36).toUpperCase()
    return `ADJ-${ts.slice(-6)}`
  }

  function handleSubmit(mode) {
    if (!selectedProduct || !quantity || quantity <= 0) return
    if (!reason) return
    if (requiresApproval && !approver) return

    const id = generateAdjustmentId()
    setAdjustmentId(id)

    const qtyNum = Number(quantity)
    const qtyChange = adjType === 'increase' ? qtyNum : -qtyNum
    const newStock = Math.max(0, selectedProduct.currentStock + qtyChange)

    if (mode === 'save') {
      const updated = productList.map(p =>
        p.id === selectedProduct.id ? { ...p, currentStock: newStock } : p
      )
      onUpdateProducts?.(updated)
    }

    setSubmitted(true)
  }

  function resetForm() {
    setSelectedProduct(null)
    setProductSearch('')
    setAdjType('increase')
    setQuantity(0)
    setReason('')
    setCustomReason('')
    setSupportingFile(null)
    setSupportingFileName('')
    setRequiresApproval(false)
    setApprover('')
    setNotes('')
    setSubmitted(false)
    setAdjustmentId(null)
  }

  const displayReason = reason === 'other' ? customReason : REASONS.find(r => r.value === reason)?.label || ''

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Adjustment Submitted</h3>
          <p className="text-sm text-gray-500 mb-2">
            {requiresApproval
              ? 'Your adjustment has been submitted for approval.'
              : 'Stock adjustment has been saved successfully.'}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <span className="text-xs text-gray-500">Adjustment ID:</span>
            <span className="text-sm font-mono font-bold text-gray-800">{adjustmentId}</span>
          </div>
          <div className="mt-1 space-y-2 text-left max-w-sm mx-auto">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Product</span>
              <span className="text-gray-800 font-medium">{selectedProduct?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Type</span>
              <span className={`font-medium ${adjType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {adjType === 'increase' ? 'Increase (+)' : 'Decrease (-)'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Quantity</span>
              <span className="text-gray-800 font-medium">{quantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Reason</span>
              <span className="text-gray-800 font-medium">{displayReason}</span>
            </div>
            {requiresApproval && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Approver</span>
                <span className="text-gray-800 font-medium">{approver}</span>
              </div>
            )}
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <button onClick={onBack} className="px-5 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              Back to Inventory
            </button>
            <button onClick={resetForm} className="px-5 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors cursor-pointer">
              New Adjustment
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Stock Adjustment</h2>
          <p className="text-xs text-gray-400 mt-0.5">Manually adjust inventory stock levels</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Product <span className="text-red-400">*</span></label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={productSearch} onChange={e => { setProductSearch(e.target.value); setShowDropdown(true) }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search by name or code..."
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {productSearch && (
                <button onClick={() => { setProductSearch(''); setSelectedProduct(null); setShowDropdown(false) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 cursor-pointer">
                  <X size={14} />
                </button>
              )}
              {showDropdown && productSearch && (
                <>
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <p className="p-3 text-xs text-gray-400 text-center">No products found</p>
                    ) : (
                      filteredProducts.map(p => (
                        <button key={p.id} type="button"
                          onClick={() => selectProduct(p)}
                          className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer flex items-center justify-between"
                        >
                          <span className="text-gray-800">{p.name}</span>
                          <span className="text-xs text-gray-400">Stock: {p.currentStock}</span>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                </>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">&nbsp;</label>
            <div className="h-10 flex items-center gap-2 px-4 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-500">Current stock:</span>
              {selectedProduct ? (
                <span className="text-sm font-bold text-gray-800">{selectedProduct.currentStock} units</span>
              ) : (
                <span className="text-sm text-gray-300">—</span>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-2 block">Adjustment Type <span className="text-red-400">*</span></label>
          <div className="flex gap-4">
            <label className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
              adjType === 'increase' ? 'border-green-400 bg-green-50/50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                adjType === 'increase' ? 'border-green-500' : 'border-gray-300'
              }`}>
                {adjType === 'increase' && <div className="w-2 h-2 rounded-full bg-green-500" />}
              </div>
              <span className={`text-sm font-medium ${adjType === 'increase' ? 'text-green-700' : 'text-gray-600'}`}>
                Increase <span className="text-green-600 font-bold">(+)
              </span></span>
            </label>
            <label className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
              adjType === 'decrease' ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                adjType === 'decrease' ? 'border-red-500' : 'border-gray-300'
              }`}>
                {adjType === 'decrease' && <div className="w-2 h-2 rounded-full bg-red-500" />}
              </div>
              <span className={`text-sm font-medium ${adjType === 'decrease' ? 'text-red-700' : 'text-gray-600'}`}>
                Decrease <span className="text-red-600 font-bold">(−)
              </span></span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Quantity <span className="text-red-400">*</span></label>
            <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
              min="1" placeholder="0"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Reason <span className="text-red-400">*</span></label>
            <select value={reason} onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="">Select reason</option>
              {REASONS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {reason === 'other' && (
              <input type="text" value={customReason} onChange={e => setCustomReason(e.target.value)}
                placeholder="Describe the reason..."
                className="w-full mt-2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Supporting Document (optional)</label>
          <div className="flex items-center gap-3">
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
              <Upload size={15} /> Upload File
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileSelect} className="hidden" />
            {supportingFileName && (
              <span className="text-sm text-gray-600 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {supportingFileName}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Photo of damaged item, count sheet, or other documentation</p>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-800">Requires approval?</label>
              <p className="text-xs text-gray-400 mt-0.5">Route this adjustment for manager approval</p>
            </div>
            <div className="relative">
              <input type="checkbox" checked={requiresApproval} onChange={e => setRequiresApproval(e.target.checked)}
                className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
            </div>
          </div>
          {requiresApproval && (
            <div className="mt-4">
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Approver <span className="text-red-400">*</span></label>
              <select value={approver} onChange={e => setApprover(e.target.value)}
                className="w-full md:w-72 px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">Select approver</option>
                {APPROVERS.filter(a => a.role !== 'Inventory Staff').map(a => (
                  <option key={a.id} value={a.name}>{a.name} — {a.role}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Additional notes about this adjustment..."
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pb-6">
        <button onClick={onBack} className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer">
          Cancel
        </button>
        {requiresApproval ? (
          <button onClick={() => handleSubmit('submit')}
            disabled={!selectedProduct || !quantity || quantity <= 0 || !reason || (reason === 'other' && !customReason) || !approver}
            className="px-5 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
            Submit for Approval
          </button>
        ) : (
          <button onClick={() => handleSubmit('save')}
            disabled={!selectedProduct || !quantity || quantity <= 0 || !reason || (reason === 'other' && !customReason)}
            className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
            Save Adjustment
          </button>
        )}
      </div>
    </div>
  )
}
