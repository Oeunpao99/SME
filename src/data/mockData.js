export const categories = [
  { id: 1, name: 'Beverages' },
  { id: 2, name: 'Food' },
  { id: 3, name: 'Snacks' },
  { id: 4, name: 'Dairy' },
]

export const locations = ['Main Warehouse', 'Store Front', 'Secondary Storage']

export const suppliers = [
  { id: 1, name: 'Beverage Supplier Co.', contact: '012 345 678', email: 'info@beverageco.com' },
  { id: 2, name: 'Food Supplier Co.', contact: '012 987 654', email: 'info@foodsupplier.com' },
]

export const customers = [
  { id: 1, name: 'Walk-in Customer', phone: '', email: '', totalPurchases: 0 },
  { id: 2, name: 'Sokha Mart', phone: '012 111 222', email: 'sokha@mart.com', totalPurchases: 450.00 },
  { id: 3, name: 'Dara Shop', phone: '012 333 444', email: 'dara@shop.com', totalPurchases: 320.50 },
  { id: 4, name: 'SME Retailer', phone: '012 555 666', email: 'info@smeretailer.com', totalPurchases: 890.75 },
]

export const staff = [
  { id: 1, name: 'Owner Admin', role: 'Owner', email: 'owner@smehub.com', phone: '012 000 001', active: true, avatar: '/images/Owner-Admin.png' },
  { id: 2, name: 'Manager Dara', role: 'Manager', email: 'dara@smehub.com', phone: '012 000 002', active: true, avatar: '/images/Dara.png' },
  { id: 3, name: 'Cashier Sophea', role: 'Cashier', email: 'sophea@smehub.com', phone: '012 000 003', active: true, avatar: '/images/Sophea.png' },
  { id: 4, name: 'Inventory Vannak', role: 'Inventory Staff', email: 'vannak@smehub.com', phone: '012 000 004', active: true, avatar: '/images/Vannak.png' },
]

export const rolePermissions = [
  { role: 'Owner', permissions: 'Full Access – All modules, settings, users, reports' },
  { role: 'Manager', permissions: 'Operational Monitoring – Dashboard, reports, staff view' },
  { role: 'Cashier', permissions: 'Sales Transactions Only – POS, customer payments' },
  { role: 'Inventory Staff', permissions: 'Inventory Management Only – Stock In/Out, adjustments, products' },
]

let productIdCounter = 100

const productImages = {
  'Coca-Cola': '/images/coca-cola.png',
  'Pepsi': '/images/pepsi.png',
  'Water 1.5L': '/images/water.png',
  'Energy Drink': '/images/energy-drink.png',
  'Instant Noodle': '/images/instant-noodle.png',
  'Snack Mix': '/images/snack-mix.png',
  'Milk 1L': '/images/milk.png',
  'Bottled Tea': '/images/bottled-tea.png',
}

const barcodes = {
  'Coca-Cola': '8858999123456',
  'Pepsi': '8858999123457',
  'Water 1.5L': '8858999123458',
  'Energy Drink': '8858999123459',
  'Instant Noodle': '8858999123460',
  'Snack Mix': '8858999123461',
  'Milk 1L': '8858999123462',
  'Bottled Tea': '8858999123463',
}
const productLocations = {
  'Coca-Cola': 'Main Warehouse',
  'Pepsi': 'Main Warehouse',
  'Water 1.5L': 'Main Warehouse',
  'Energy Drink': 'Store Front',
  'Instant Noodle': 'Secondary Storage',
  'Snack Mix': 'Store Front',
  'Milk 1L': 'Store Front',
  'Bottled Tea': 'Secondary Storage',
}

function makeProduct(code, name, category, unit, cost, sell, stock, min) {
  return {
    id: productIdCounter++, code, barcode: barcodes[name], name, image: productImages[name],
    category, unit, location: productLocations[name], costPrice: cost, sellingPrice: sell,
    currentStock: stock, minStock: min, status: 'Active',
  }
}

export const products = [
  makeProduct('PRD001', 'Coca-Cola', 'Beverages', 'Can', 0.65, 1.00, 120, 30),
  makeProduct('PRD002', 'Pepsi', 'Beverages', 'Can', 0.60, 1.00, 90, 30),
  makeProduct('PRD003', 'Water 1.5L', 'Beverages', 'Bottle', 0.30, 0.75, 200, 50),
  makeProduct('PRD004', 'Energy Drink', 'Beverages', 'Can', 0.80, 1.50, 45, 20),
  makeProduct('PRD005', 'Instant Noodle', 'Food', 'Pack', 0.25, 0.50, 300, 100),
  makeProduct('PRD006', 'Snack Mix', 'Snacks', 'Pack', 0.40, 0.80, 15, 20),
  makeProduct('PRD007', 'Milk 1L', 'Dairy', 'Carton', 1.00, 1.80, 25, 15),
  makeProduct('PRD008', 'Bottled Tea', 'Beverages', 'Bottle', 0.50, 1.00, 8, 20),
]

let saleIdCounter = 1000
let paymentIdCounter = 500

export const sales = [
  {
    id: saleIdCounter++, invoice: 'INV-20260612-001', date: '2026-06-12 08:30', customer: 'Walk-in Customer',
    items: [{ product: 'Coca-Cola', qty: 3, price: 1.00 }, { product: 'Instant Noodle', qty: 5, price: 0.50 }],
    subtotal: 5.50, discount: 0, total: 5.50, paymentMethod: 'Cash', paymentStatus: 'Paid', paidAmount: 5.50, balance: 0, staff: 'Cashier Sophea',
  },
  {
    id: saleIdCounter++, invoice: 'INV-20260612-002', date: '2026-06-12 09:15', customer: 'Sokha Mart',
    items: [{ product: 'Water 1.5L', qty: 10, price: 0.75 }, { product: 'Energy Drink', qty: 5, price: 1.50 }],
    subtotal: 15.00, discount: 0, total: 15.00, paymentMethod: 'Bank Transfer', paymentStatus: 'Paid', paidAmount: 15.00, balance: 0, staff: 'Cashier Sophea',
  },
  {
    id: saleIdCounter++, invoice: 'INV-20260612-003', date: '2026-06-12 10:00', customer: 'Dara Shop',
    items: [{ product: 'Snack Mix', qty: 3, price: 0.80 }, { product: 'Pepsi', qty: 6, price: 1.00 }],
    subtotal: 8.40, discount: 0.40, total: 8.00, paymentMethod: 'Credit', paymentStatus: 'Partial', paidAmount: 4.00, balance: 4.00, staff: 'Cashier Sophea',
  },
  {
    id: saleIdCounter++, invoice: 'INV-20260612-004', date: '2026-06-12 11:00', customer: 'SME Retailer',
    items: [{ product: 'Milk 1L', qty: 5, price: 1.80 }, { product: 'Bottled Tea', qty: 4, price: 1.00 }],
    subtotal: 13.00, discount: 0, total: 13.00, paymentMethod: 'KHQR', paymentStatus: 'Unpaid', paidAmount: 0, balance: 13.00, staff: 'Cashier Sophea',
  },
]

export const payments = sales.map(s => ({
  id: paymentIdCounter++, saleId: s.id, customer: s.customer, date: s.date,
  invoice: s.invoice, total: s.total, paidAmount: s.paidAmount, balance: s.balance,
  status: s.paymentStatus,
}))

let purchaseIdCounter = 200

export const purchaseStatuses = ['Pending Approval', 'Approved', 'Rejected', 'Partial', 'Received']

export const approvers = [
  { name: 'Owner Admin', role: 'Owner' },
  { name: 'Manager Dara', role: 'Manager' },
]

export const purchases = [
  {
    id: purchaseIdCounter++, poNumber: 'PO-20260610-001', date: '2026-06-10', supplier: 'Beverage Supplier Co.',
    items: [{ product: 'Coca-Cola', qty: 50, costPrice: 0.65 }, { product: 'Pepsi', qty: 30, costPrice: 0.60 }],
    totalCost: 50.50, staff: 'Inventory Vannak', status: 'Received',
    createdBy: 'Inventory Vannak', approver: 'Owner Admin', approvedAt: '2026-06-10 08:00',
  },
  {
    id: purchaseIdCounter++, poNumber: 'PO-20260611-001', date: '2026-06-11', supplier: 'Food Supplier Co.',
    items: [{ product: 'Instant Noodle', qty: 100, costPrice: 0.25 }, { product: 'Snack Mix', qty: 20, costPrice: 0.40 }],
    totalCost: 33.00, staff: 'Inventory Vannak', status: 'Received',
    createdBy: 'Inventory Vannak', approver: 'Manager Dara', approvedAt: '2026-06-11 08:00',
  },
  {
    id: purchaseIdCounter++, poNumber: 'PO-20260612-001', date: '2026-06-12', supplier: 'Beverage Supplier Co.',
    items: [{ product: 'Energy Drink', qty: 30, costPrice: 0.80 }],
    totalCost: 24.00, staff: 'Inventory Vannak', status: 'Pending Approval',
    createdBy: 'Inventory Vannak', approver: 'Owner Admin',
  },
]

let movementIdCounter = 300

export const inventoryMovements = [
  { id: movementIdCounter++, date: '2026-06-10 10:00', product: 'Coca-Cola', type: 'Stock In', qty: 50, ref: 'PO-20260610-001', staff: 'Inventory Vannak', note: 'Purchase from Beverage Supplier Co.' },
  { id: movementIdCounter++, date: '2026-06-10 10:00', product: 'Pepsi', type: 'Stock In', qty: 30, ref: 'PO-20260610-001', staff: 'Inventory Vannak', note: 'Purchase from Beverage Supplier Co.' },
  { id: movementIdCounter++, date: '2026-06-11 09:00', product: 'Instant Noodle', type: 'Stock In', qty: 100, ref: 'PO-20260611-001', staff: 'Inventory Vannak', note: 'Purchase from Food Supplier Co.' },
  { id: movementIdCounter++, date: '2026-06-11 09:00', product: 'Snack Mix', type: 'Stock In', qty: 20, ref: 'PO-20260611-001', staff: 'Inventory Vannak', note: 'Purchase from Food Supplier Co.' },
  { id: movementIdCounter++, date: '2026-06-12 08:30', product: 'Coca-Cola', type: 'Stock Out', qty: -3, ref: 'INV-20260612-001', staff: 'Cashier Sophea', note: 'Sale to Walk-in Customer' },
  { id: movementIdCounter++, date: '2026-06-12 08:30', product: 'Instant Noodle', type: 'Stock Out', qty: -5, ref: 'INV-20260612-001', staff: 'Cashier Sophea', note: 'Sale to Walk-in Customer' },
  { id: movementIdCounter++, date: '2026-06-12 09:15', product: 'Water 1.5L', type: 'Stock Out', qty: -10, ref: 'INV-20260612-002', staff: 'Cashier Sophea', note: 'Sale to Sokha Mart' },
  { id: movementIdCounter++, date: '2026-06-12 09:15', product: 'Energy Drink', type: 'Stock Out', qty: -5, ref: 'INV-20260612-002', staff: 'Cashier Sophea', note: 'Sale to Sokha Mart' },
  { id: movementIdCounter++, date: '2026-06-12 10:00', product: 'Snack Mix', type: 'Stock Out', qty: -3, ref: 'INV-20260612-003', staff: 'Cashier Sophea', note: 'Sale to Dara Shop' },
  { id: movementIdCounter++, date: '2026-06-12 10:00', product: 'Pepsi', type: 'Stock Out', qty: -6, ref: 'INV-20260612-003', staff: 'Cashier Sophea', note: 'Sale to Dara Shop' },
]

export const activityLog = [
  { id: 1, date: '2026-06-12 11:00', user: 'Cashier Sophea', action: 'Created Sale INV-20260612-004', module: 'POS' },
  { id: 2, date: '2026-06-12 10:00', user: 'Cashier Sophea', action: 'Created Sale INV-20260612-003', module: 'POS' },
  { id: 3, date: '2026-06-12 09:15', user: 'Cashier Sophea', action: 'Created Sale INV-20260612-002', module: 'POS' },
  { id: 4, date: '2026-06-12 08:30', user: 'Cashier Sophea', action: 'Created Sale INV-20260612-001', module: 'POS' },
  { id: 5, date: '2026-06-11 09:00', user: 'Inventory Vannak', action: 'Stock In PO-20260611-001', module: 'Purchases' },
  { id: 6, date: '2026-06-10 10:00', user: 'Inventory Vannak', action: 'Stock In PO-20260610-001', module: 'Purchases' },
]

export function formatCurrency(amount) {
  return '$' + Number(amount).toFixed(2)
}

export function getLowStockProducts(productList) {
  return productList.filter(p => p.currentStock <= p.minStock)
}

export function getTodaySales(salesList) {
  const today = '2026-06-12'
  return salesList.filter(s => s.date.startsWith(today))
}
