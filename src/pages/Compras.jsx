import { useState } from 'react'
import { useData } from '../context/DataContext'

import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import SectionHeader from '../components/SectionHeader'

function Compras() {
  const { productos, compras, addCompra } = useData()

  const [productoId, setProductoId] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [costo, setCosto] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    })
  }

  const comprasFiltradas = compras.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalCompras = compras.reduce(
    (acc, c) => acc + Number(c.total || 0),
    0
  )

  const unidadesCompradas = compras.reduce(
    (acc, c) => acc + Number(c.cantidad || 0),
    0
  )

  const totalCompraActual = Number(cantidad || 0) * Number(costo || 0)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!productoId) {
      alert('Selecciona un producto')
      return
    }

    if (!cantidad || Number(cantidad) <= 0) {
      alert('Ingresa una cantidad válida')
      return
    }

    if (!costo || Number(costo) <= 0) {
      alert('Ingresa un costo válido')
      return
    }

    addCompra({
      productoId,
      cantidad,
      costo,
    })

    setProductoId('')
    setCantidad('')
    setCosto('')
  }

  return (
    <div className="page">
      <PageHeader
        label="Control de abastecimiento"
        title="Compras"
        subtitle="Registra compras de mercancía, aumenta stock automáticamente y controla egresos de caja."
      />

      <div className="stats-grid">
        <StatCard title="Total compras" value={formatMoney(totalCompras)} />
        <StatCard title="Unidades compradas" value={unidadesCompradas} />
        <StatCard title="Registros" value={compras.length} />
      </div>

      <div className="content-grid">
        <section className="card">
          <h2 className="section-title">Nueva compra</h2>

          <form onSubmit={handleSubmit} className="form">
            <FormField
              as="select"
              label="Producto"
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
            >
              <option value="">Seleccionar producto</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </FormField>

            <FormField
              label="Cantidad comprada"
              type="number"
              placeholder="Ej: 10"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />

            <FormField
              label="Costo unitario"
              type="number"
              placeholder="Ej: 12000"
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
            />

            <div className="total-box">
              Total compra: <strong>{formatMoney(totalCompraActual)}</strong>
            </div>

            <button className="primary-button" type="submit">
              Registrar compra
            </button>
          </form>
        </section>

        <section className="card card-table">
          <SectionHeader
            title="Compras registradas"
            count={comprasFiltradas.length}
            search={busqueda}
            setSearch={setBusqueda}
            searchPlaceholder="Buscar compra..."
          />

          {comprasFiltradas.length === 0 ? (
            <EmptyState text="No hay compras registradas." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Costo unitario</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {comprasFiltradas.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.nombre}</strong>
                      </td>
                      <td>{c.cantidad}</td>
                      <td>{formatMoney(c.costo)}</td>
                      <td>
                        <strong>{formatMoney(c.total)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Compras