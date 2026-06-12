import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

export default function InsufficientStockModal({ open, onClose, items, onAction }) {
  const [selectedAction, setSelectedAction] = useState(null)
  const [remember, setRemember] = useState(false)

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Insufficient Stock</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-gray-600 mb-4">
            The following items have insufficient stock to fulfill the requested quantity:
          </p>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Requested</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Available</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Shortage</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 text-gray-800 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{item.requested}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{item.available}</td>
                    <td className="px-4 py-3 text-right text-red-600 font-semibold">{item.shortage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 space-y-2.5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Choose an action</p>

            <label
              onClick={() => setSelectedAction('cancel')}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                selectedAction === 'cancel'
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                selectedAction === 'cancel' ? 'border-red-500' : 'border-gray-300'
              }`}>
                {selectedAction === 'cancel' && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Cancel Sale</p>
                <p className="text-xs text-gray-500 mt-0.5">Stop the transaction entirely</p>
              </div>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">Option 1</span>
            </label>

            <label
              onClick={() => setSelectedAction('sell_available')}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                selectedAction === 'sell_available'
                  ? 'border-amber-400 bg-amber-50/50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                selectedAction === 'sell_available' ? 'border-amber-500' : 'border-gray-300'
              }`}>
                {selectedAction === 'sell_available' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Sell Available Only</p>
                <p className="text-xs text-gray-500 mt-0.5">Reduce quantities to match available stock</p>
              </div>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">Option 2</span>
            </label>

            <label
              onClick={() => setSelectedAction('backorder')}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                selectedAction === 'backorder'
                  ? 'border-blue-400 bg-blue-50/50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                selectedAction === 'backorder' ? 'border-blue-500' : 'border-gray-300'
              }`}>
                {selectedAction === 'backorder' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Create Backorder</p>
                <p className="text-xs text-gray-500 mt-0.5">Proceed with sale and create purchase request for shortage</p>
              </div>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">Option 3</span>
            </label>
          </div>

          <label className="flex items-center gap-2.5 mt-5 pt-4 border-t border-gray-100 cursor-pointer">
            <div
              onClick={() => setRemember(!remember)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                remember ? 'bg-primary border-primary' : 'border-gray-300 bg-white'
              }`}
            >
              {remember && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm text-gray-600 select-none">Remember my choice for this session</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => onAction?.(selectedAction, remember)}
            disabled={!selectedAction}
            className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Confirm Action
          </button>
        </div>
      </div>
    </div>
  )
}
