import { useState } from 'react'
import { useData } from '../context/DataContext'

import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import SectionHeader from '../components/SectionHeader'

function Movimientos() {
  const { movimientosInventario } = useData()

  const [busqueda, setBusqueda] = useState('')

  const movimientosFiltrados = movimientosInventario.filter((m) => {
    const texto = `${m.concepto} ${m.tipo}`.toLowerCase()
    return texto.includes(busqueda.toLowerCase())
  })

  const totalEntradas = movimientosInventario
    .filter((m) => Number(m.cantidad || 0) > 0)
    .reduce((acc, m) => acc + Number(m.cantidad || 0), 0)

  const totalSalidas = movimientosInventario
    .filter((m) => Number(m.cantidad || 0) < 0)
    .reduce((acc, m) => acc + Math.abs(Number(m.cantidad || 0)), 0)

  const totalMovimientos = movimientosInventario.length

  const formatDate = (value) => {
    if (!value) return 'Sin fecha'

    return new Date(value).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const getTipoLabel = (tipo) => {
    if (tipo === 'compra') return 'Compra'
    if (tipo === 'venta') return 'Venta'
    if (tipo === 'ajuste_entrada') return 'Ajuste entrada'
    if (tipo === 'ajuste_salida') return 'Ajuste salida'

    return tipo
  }

  const getBadgeClass = (tipo) => {
    if (tipo === 'compra' || tipo === 'ajuste_entrada') {
      return 'badge badge-success'
    }

    if (tipo === 'venta' || tipo === 'ajuste_salida') {
      return 'badge badge-danger'
    }

    return 'badge badge-info'
  }

  return (
    <div className="page">
      <PageHeader
        label="Historial de inventario"
        title="Movimientos"
        subtitle="Consulta las entradas, salidas y ajustes que han modificado el stock de tus productos."
      />

      <div className="stats-grid">
        <StatCard title="Movimientos" value={totalMovimientos} />
        <StatCard title="Entradas" value={`${totalEntradas}`} />
        <StatCard title="Salidas" value={`${totalSalidas}`} warning />
      </div>

      <section className="card card-table">
        <SectionHeader
          title="Historial de movimientos"
          count={movimientosFiltrados.length}
          search={busqueda}
          setSearch={setBusqueda}
          searchPlaceholder="Buscar movimiento..."
        />

        {movimientosFiltrados.length === 0 ? (
          <EmptyState
            text="No hay movimientos de inventario."
            detail="Cuando registres compras, ventas o ajustes, aparecerán aquí."
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Concepto</th>
                  <th>Cantidad</th>
                  <th>Stock anterior</th>
                  <th>Stock nuevo</th>
                  <th>Referencia</th>
                </tr>
              </thead>

              <tbody>
                {movimientosFiltrados.map((m) => {
                  const cantidad = Number(m.cantidad || 0)

                  return (
                    <tr key={m.id}>
                      <td>{formatDate(m.fecha)}</td>

                      <td>
                        <span className={getBadgeClass(m.tipo)}>
                          {getTipoLabel(m.tipo)}
                        </span>
                      </td>

                      <td>
                        <strong>{m.concepto}</strong>
                      </td>

                      <td>
                        <strong
                          className={cantidad >= 0 ? 'text-success' : 'text-danger'}
                        >
                          {cantidad >= 0 ? `+${cantidad}` : cantidad}
                        </strong>
                      </td>

                      <td>{m.stock_anterior}</td>

                      <td>{m.stock_nuevo}</td>

                      <td>
                        <span className="small-text">
                          {m.referencia_tipo || 'Sin referencia'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default Movimientos