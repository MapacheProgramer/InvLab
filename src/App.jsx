import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider, useData } from './context/DataContext'
import { ToastProvider } from './context/ToastContext'

import Dashboard from './pages/Dashboard'
import Inventario from './pages/Inventario'
import Ventas from './pages/Ventas'
import Compras from './pages/Compras'
import Creditos from './pages/Creditos'
import Caja from './pages/Caja'
import Equipo from './pages/Equipo'
import Movimientos from './pages/Movimientos'
import Login from './pages/Login'

function Layout({ page, setPage }) {
  const { user, company, role, logout } = useAuth()
  const { refreshing, loading } = useData()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'inventario', label: 'Inventario' },
    { id: 'ventas', label: 'Ventas' },
    { id: 'compras', label: 'Compras' },
    { id: 'creditos', label: 'Créditos' },
    { id: 'caja', label: 'Caja' },
    { id: 'movimientos', label: 'Movimientos' },
    { id: 'equipo', label: 'Equipo' },
  ]

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">InvLab</h2>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                page === item.id
                  ? 'sidebar-link sidebar-link-active'
                  : 'sidebar-link'
              }
              onClick={() => setPage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-user">
          <small>{company?.name || 'Sin empresa'}</small>
          <small>{user?.email}</small>
          <small>Rol: {role || 'sin rol'}</small>

          <button type="button" className="logout-button" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        {(refreshing || loading) && (
          <div className="sync-indicator">
            {loading ? 'Cargando datos...' : 'Actualizando...'}
          </div>
        )}

        <PersistentPages activePage={page} />
      </main>
    </div>
  )
}

function PersistentPages({ activePage }) {
  return (
    <>
      <div className={activePage === 'dashboard' ? 'page-view active' : 'page-view'}>
        <Dashboard />
      </div>

      <div className={activePage === 'inventario' ? 'page-view active' : 'page-view'}>
        <Inventario />
      </div>

      <div className={activePage === 'ventas' ? 'page-view active' : 'page-view'}>
        <Ventas />
      </div>

      <div className={activePage === 'compras' ? 'page-view active' : 'page-view'}>
        <Compras />
      </div>

      <div className={activePage === 'creditos' ? 'page-view active' : 'page-view'}>
        <Creditos />
      </div>

      <div className={activePage === 'caja' ? 'page-view active' : 'page-view'}>
        <Caja />
      </div>

      <div className={activePage === 'movimientos' ? 'page-view active' : 'page-view'}>
        <Movimientos />
      </div>

      <div className={activePage === 'equipo' ? 'page-view active' : 'page-view'}>
        <Equipo />
      </div>
    </>
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
            type="button"
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
            type="button"
            className="primary-button"
            onClick={() => loadCompany(user)}
          >
            Crear empresa
          </button>
        </div>
      </div>
    )
  }

  return (
    <DataProvider companyId={companyId}>
      <Layout page={page} setPage={setPage} />
    </DataProvider>
  )
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  )
}

export default App