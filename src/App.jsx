import { useState } from 'react'
import { DataProvider } from './context/DataContext'

import Dashboard from './pages/Dashboard'
import Inventario from './pages/Inventario'
import Ventas from './pages/Ventas'
import Compras from './pages/Compras'
import Creditos from './pages/Creditos'
import Caja from './pages/Caja'

function Layout({ children, setPage }) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">InvLab</h2>

        <nav className="sidebar-nav">
          <button className="sidebar-link" onClick={() => setPage('dashboard')}>Dashboard</button>
          <button className="sidebar-link" onClick={() => setPage('inventario')}>Inventario</button>
          <button className="sidebar-link" onClick={() => setPage('ventas')}>Ventas</button>
          <button className="sidebar-link" onClick={() => setPage('compras')}>Compras</button>
          <button className="sidebar-link" onClick={() => setPage('creditos')}>Créditos</button>
          <button className="sidebar-link" onClick={() => setPage('caja')}>Caja</button>
        </nav>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

function AppContent() {
  const [page, setPage] = useState('dashboard')

  const renderPage = () => {
    if (page === 'inventario') return <Inventario />
    if (page === 'ventas') return <Ventas />
    if (page === 'compras') return <Compras />
    if (page === 'creditos') return <Creditos />
    if (page === 'caja') return <Caja />

    return <Dashboard />
  }

  return (
    <Layout setPage={setPage}>
      {renderPage()}
    </Layout>
  )
}

function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  )
}

export default App