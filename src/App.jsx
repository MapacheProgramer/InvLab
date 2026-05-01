import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'

import Dashboard from './pages/Dashboard'
import Inventario from './pages/Inventario'
import Ventas from './pages/Ventas'
import Compras from './pages/Compras'
import Creditos from './pages/Creditos'
import Caja from './pages/Caja'
import Login from './pages/Login'

function Layout({ children, setPage }) {
  const { user, company, role, logout } = useAuth()

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

        <div className="sidebar-user">
          <small>{company?.name}</small>
          <small>{user?.email}</small>
          <small>Rol: {role}</small>

          <button className="logout-button" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  )
}

function AppContent() {
  const {
    user,
    authLoading,
    companyLoading,
    companyId,
    companyError,
    loadCompany,
  } = useAuth()

  const [page, setPage] = useState('dashboard')

  if (authLoading || companyLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <h2>InvLab</h2>
          <p>Configurando sesión y empresa...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  if (companyError) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <h2>Error configurando empresa</h2>
          <p>{companyError}</p>

          <button
            className="primary-button"
            onClick={() => loadCompany(user)}
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    )
  }

  if (!companyId) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <h2>InvLab</h2>
          <p>No se encontró una empresa asociada.</p>

          <button
            className="primary-button"
            onClick={() => loadCompany(user)}
          >
            Crear empresa
          </button>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    if (page === 'inventario') return <Inventario />
    if (page === 'ventas') return <Ventas />
    if (page === 'compras') return <Compras />
    if (page === 'creditos') return <Creditos />
    if (page === 'caja') return <Caja />

    return <Dashboard />
  }

  return (
    <DataProvider companyId={companyId}>
      <Layout setPage={setPage}>{renderPage()}</Layout>
    </DataProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App