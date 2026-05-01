import { useData } from '../context/DataContext'

import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'

function Dashboard() {
  const { resumen, ventas, compras, productos, creditos } = useData()

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    })
  }

  const totalCreditos = creditos.reduce(
    (acc, c) => acc + Number(c.saldo || 0),
    0
  )

  const productosBajoStock = productos.filter(
    (p) => Number(p.stock || 0) <= 3
  )

  return (
    <div className="page">
      <PageHeader
        label="Panel general"
        title="Dashboard"
        subtitle="Resumen rápido del estado actual del inventario, ventas, compras, créditos y caja."
      />

      <div className="stats-grid">
        <StatCard title="Ingresos" value={formatMoney(resumen.ingresos)} />
        <StatCard title="Egresos" value={formatMoney(resumen.egresos)} />
        <StatCard title="Saldo en caja" value={formatMoney(resumen.saldo)} />
        <StatCard
          title="Créditos pendientes"
          value={formatMoney(totalCreditos)}
          warning
        />
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <div className="section-header">
            <h2 className="section-title">Últimas ventas</h2>
            <span className="count-pill">{ventas.length}</span>
          </div>

          {ventas.length === 0 ? (
            <EmptyState text="Aún no hay ventas registradas." />
          ) : (
            ventas.slice(0, 6).map((v) => (
              <Row
                key={v.id}
                title={v.nombre}
                detail={`Cantidad: ${v.cantidad}`}
                value={formatMoney(v.total)}
              />
            ))
          )}
        </section>

        <section className="card">
          <div className="section-header">
            <h2 className="section-title">Últimas compras</h2>
            <span className="count-pill">{compras.length}</span>
          </div>

          {compras.length === 0 ? (
            <EmptyState text="Aún no hay compras registradas." />
          ) : (
            compras.slice(0, 6).map((c) => (
              <Row
                key={c.id}
                title={c.nombre}
                detail={`Cantidad: ${c.cantidad}`}
                value={formatMoney(c.total)}
              />
            ))
          )}
        </section>

        <section className="card">
          <div className="section-header">
            <h2 className="section-title">Productos bajo stock</h2>
            <span className="count-pill">{productosBajoStock.length}</span>
          </div>

          {productosBajoStock.length === 0 ? (
            <EmptyState text="No hay productos con bajo stock." />
          ) : (
            productosBajoStock.map((p) => (
              <Row
                key={p.id}
                title={p.nombre}
                detail="Requiere revisión"
                value={`${p.stock} und.`}
              />
            ))
          )}
        </section>

        <section className="card">
          <div className="section-header">
            <h2 className="section-title">Créditos activos</h2>
            <span className="count-pill">{creditos.length}</span>
          </div>

          {creditos.length === 0 ? (
            <EmptyState text="No hay créditos pendientes." />
          ) : (
            creditos.slice(0, 6).map((c) => (
              <Row
                key={c.id}
                title={c.cliente}
                detail="Saldo pendiente"
                value={formatMoney(c.saldo)}
              />
            ))
          )}
        </section>
      </div>
    </div>
  )
}

function Row({ title, detail, value }) {
  return (
    <div className="list-row">
      <div>
        <strong className="list-row-title">{title}</strong>
        <p className="list-row-detail">{detail}</p>
      </div>

      <strong className="list-row-value">{value}</strong>
    </div>
  )
}

export default Dashboard