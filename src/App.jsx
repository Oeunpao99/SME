import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import Products from './pages/Products'
import ProductForm from './pages/ProductForm'
import Inventory from './pages/Inventory'
import StockAdjustment from './pages/StockAdjustment'
import Purchases from './pages/Purchases'
import SalesInvoices from './pages/SalesInvoices'
import CustomersPayments from './pages/CustomersPayments'
import Staff from './pages/Staff'
import Reports from './pages/Reports'
import { products as initialProducts, sales as initialSales } from './data/mockData'

let productIdCounter = 500

const pages = {
  dashboard: { title: 'Dashboard', component: Dashboard },
  pos: { title: 'POS / Selling', component: POS },
  products: { title: 'Product Management', component: Products },
  inventory: { title: 'Inventory Management', component: Inventory },
  purchases: { title: 'Purchase Orders', component: Purchases },
  sales: { title: 'Sales Invoices', component: SalesInvoices },
  customers: { title: 'Customer Payments', component: CustomersPayments },
  staff: { title: 'Staff Management', component: Staff },
  reports: { title: 'Reports & Analytics', component: Reports },
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [globalProducts, setGlobalProducts] = useState(initialProducts)
  const [globalSales, setGlobalSales] = useState(initialSales)
  const [editingProduct, setEditingProduct] = useState(null)

  const isFormPage = currentPage === 'product-form' || currentPage === 'stock-adjustment'
  const page = pages[currentPage] || pages.dashboard
  const PageComponent = page.component

  function navigateToForm(product) {
    setEditingProduct(product || null)
    setCurrentPage('product-form')
  }

  function handleSaveProduct(formData, mode) {
    let updated
    if (editingProduct) {
      updated = globalProducts.map(p =>
        p.id === editingProduct.id ? { ...p, ...formData, id: p.id, code: p.code } : p
      )
    } else {
      const newProduct = {
        ...formData,
        id: productIdCounter++,
        code: `PRD${String(productIdCounter).padStart(3, '0')}`,
      }
      updated = [...globalProducts, newProduct]
    }
    setGlobalProducts(updated)
    if (mode === 'save') {
      setCurrentPage('products')
    } else {
      setEditingProduct(null)
    }
  }

  function renderPage() {
    switch (currentPage) {
      case 'pos':
        return (
          <POS
            onUpdateProducts={setGlobalProducts}
            onUpdateSales={setGlobalSales}
            globalProducts={globalProducts}
            globalSales={globalSales}
          />
        )
      case 'products':
        return <Products globalProducts={globalProducts} onUpdateProducts={setGlobalProducts} onNavigateForm={navigateToForm} />
      case 'inventory':
        return <Inventory globalProducts={globalProducts} onUpdateProducts={setGlobalProducts} onNavigateAdjustment={() => setCurrentPage('stock-adjustment')} />
      case 'stock-adjustment':
        return <StockAdjustment globalProducts={globalProducts} onUpdateProducts={setGlobalProducts} onBack={() => setCurrentPage('inventory')} />
      case 'purchases':
        return <Purchases globalProducts={globalProducts} onUpdateProducts={setGlobalProducts} />
      case 'sales':
        return <SalesInvoices globalProducts={globalProducts} onUpdateProducts={setGlobalProducts} />
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />
      case 'product-form':
        return <ProductForm editingProduct={editingProduct} onBack={() => setCurrentPage('products')} onSave={handleSaveProduct} />
      default:
        return <PageComponent />
    }
  }

  return (
    <div className="flex h-screen bg-[#f5f6fa]">
      <Sidebar
        currentPage={isFormPage ? (currentPage === 'product-form' ? 'products' : 'inventory') : currentPage}
        onNavigate={setCurrentPage}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={isFormPage ? (currentPage === 'product-form' ? 'Product Form' : 'Stock Adjustment') : page.title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
