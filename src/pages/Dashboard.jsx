import { useData } from '../context/DataContext'

import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'

function Dashboard() {
  const { resumen, ventas, compras, productos, creditos, movimientosInventario } =
    useData()

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
    (p) => Number(p.stock || 0) <= Number(p.stock_minimo || 3)
  )

  const productosAgotados = productos.filter(
    (p) => Number(p.stock || 0) <= 0
  )

  const valorInventarioCosto = productos.reduce(
    (acc, p) =>
      acc + Number(p.costo_promedio || 0) * Number(p.stock || 0),
    0
  )

  const valorInventarioVenta = productos.reduce(
    (acc, p) =>
      acc + Number(p.precio_venta || p.precio || 0) * Number(p.stock || 0),
    0
  )

  const margenInventario = valorInventarioVenta - valorInventarioCosto

  const totalUtilidad = ventas.reduce(
    (acc, v) => acc + Number(v.utilidad_total || 0),
    0
  )

  const totalVentas = ventas.reduce(
    (acc, v) => acc + Number(v.total || 0),
    0
  )

  const totalCompras = compras.reduce(
    (acc, c) => acc + Number(c.total || 0),
    0
  )

  return (
    <div className="page">
      <PageHeader
        label="Panel general"
        title="Dashboard"
        subtitle="Resumen rápido del estado actual del inventario, ventas, compras, utilidad, créditos y caja."
      />

      <div className="stats-grid">
        <StatCard title="Ingresos" value={formatMoney(resumen.ingresos)} />
        <StatCard title="Egresos" value={formatMoney(resumen.egresos)} />
        <StatCard title="Saldo en caja" value={formatMoney(resumen.saldo)} />
        <StatCard
          title="Utilidad estimada"
          value={formatMoney(totalUtilidad || resumen.utilidad)}
        />
      </div>

      <div className="stats-grid">
        <StatCard title="Valor inventario a costo" value={formatMoney(valorInventarioCosto)} />
        <StatCard title="Valor inventario a venta" value={formatMoney(valorInventarioVenta)} />
        <StatCard title="Margen potencial" value={formatMoney(margenInventario)} />
        <StatCard
          title="Créditos pendientes"
          value={formatMoney(totalCreditos)}
          warning
        />
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <div className="section-header">
            <h2 className="section-title">Resumen comercial</h2>
          </div>

          <Row
            title="Ventas registradas"
            detail="Total vendido"
            value={formatMoney(totalVentas)}
          />

          <Row
            title="Compras registradas"
            detail="Total comprado"
            value={formatMoney(totalCompras)}
          />

          <Row
            title="Utilidad estimada"
            detail="Ganancia calculada según costo promedio"
            value={formatMoney(totalUtilidad)}
          />

          <Row
            title="Movimientos de inventario"
            detail="Entradas, salidas y ajustes"
            value={movimientosInventario.length}
          />
        </section>

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
                detail={`Cantidad: ${v.cantidad} · Utilidad: ${formatMoney(v.utilidad_total)}`}
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
                detail={`Cantidad: ${c.cantidad} · Costo nuevo: ${formatMoney(c.costo_promedio_nuevo)}`}
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
            productosBajoStock.slice(0, 8).map((p) => (
              <Row
                key={p.id}
                title={p.nombre}
                detail={`Stock mínimo: ${p.stock_minimo || 3}`}
                value={`${p.stock} und.`}
              />
            ))
          )}
        </section>

        <section className="card">
          <div className="section-header">
            <h2 className="section-title">Productos agotados</h2>
            <span className="count-pill">{productosAgotados.length}</span>
          </div>

          {productosAgotados.length === 0 ? (
            <EmptyState text="No hay productos agotados." />
          ) : (
            productosAgotados.slice(0, 8).map((p) => (
              <Row
                key={p.id}
                title={p.nombre}
                detail={p.categoria || 'General'}
                value="0 und."
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