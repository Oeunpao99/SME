import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import Products from './pages/Products'
import Inventory from './pages/Inventory'
import StockAdjustment from './pages/StockAdjustment'
import Purchases from './pages/Purchases'
import CustomersPayments from './pages/CustomersPayments'
import Staff from './pages/Staff'
import Suppliers from './pages/Suppliers'
import Reports from './pages/Reports'
import { products as initialProducts, sales as initialSales } from './data/mockData'

const pages = {
  dashboard: { title: 'Dashboard', component: Dashboard },
  pos: { title: 'POS / Selling', component: POS },
  products: { title: 'Product Management', component: Products },
  inventory: { title: 'Inventory Management', component: Inventory },
  purchases: { title: 'Purchase Orders', component: Purchases },
  customers: { title: 'Customer Payments', component: CustomersPayments },
  staff: { title: 'Staff Management', component: Staff },
  suppliers: { title: 'Suppliers', component: Suppliers },
  reports: { title: 'Reports & Analytics', component: Reports },
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [globalProducts, setGlobalProducts] = useState(initialProducts)
  const [globalSales, setGlobalSales] = useState(initialSales)
  const isFormPage = currentPage === 'stock-adjustment'
  const page = pages[currentPage] || pages.dashboard
  const PageComponent = page.component

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
        return <Products globalProducts={globalProducts} onUpdateProducts={setGlobalProducts} />
      case 'inventory':
        return <Inventory globalProducts={globalProducts} onUpdateProducts={setGlobalProducts} onNavigateAdjustment={() => setCurrentPage('stock-adjustment')} />
      case 'stock-adjustment':
        return <StockAdjustment globalProducts={globalProducts} onUpdateProducts={setGlobalProducts} onBack={() => setCurrentPage('inventory')} />
      case 'purchases':
        return <Purchases globalProducts={globalProducts} onUpdateProducts={setGlobalProducts} />
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />
      default:
        return <PageComponent />
    }
  }

  return (
    <div className="flex h-screen bg-[#eef3fb] text-slate-900">
      <Sidebar
        currentPage={isFormPage ? 'inventory' : currentPage}
        onNavigate={setCurrentPage}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={isFormPage ? 'Stock Adjustment' : page.title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
