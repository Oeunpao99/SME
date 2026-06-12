const variants = {
  Paid: 'bg-green-100 text-green-700',
  Partial: 'bg-yellow-100 text-yellow-700',
  Unpaid: 'bg-red-100 text-red-700',
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-500',
  Low: 'bg-red-100 text-red-700',
  'Stock In': 'bg-blue-100 text-blue-700',
  'Stock Out': 'bg-orange-100 text-orange-700',
  Adjustment: 'bg-purple-100 text-purple-700',
  Cash: 'bg-green-100 text-green-700',
  'Bank Transfer': 'bg-blue-100 text-blue-700',
  KHQR: 'bg-purple-100 text-purple-700',
  Credit: 'bg-orange-100 text-orange-700',
  Pending: 'bg-gray-100 text-gray-600',
  'Pending Approval': 'bg-blue-100 text-blue-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  Received: 'bg-green-100 text-green-700',
  'Out of Stock': 'bg-red-100 text-red-700',
}

export default function Badge({ children, variant = 'default' }) {
  const cls = variants[variant] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {children}
    </span>
  )
}
