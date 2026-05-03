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

  const productoSeleccionado = productos.find((p) => p.id === productoId)

  const cantidadNum = Number(cantidad || 0)
  const costoNum = Number(costo || 0)

  const stockActual = Number(productoSeleccionado?.stock || 0)
  const costoPromedioActual = Number(productoSeleccionado?.costo_promedio || 0)

  const totalCompraActual = cantidadNum * costoNum

  const nuevoStock = productoSeleccionado
    ? stockActual + cantidadNum
    : 0

  const nuevoCostoPromedio =
    productoSeleccionado && nuevoStock > 0
      ? ((stockActual * costoPromedioActual) + totalCompraActual) / nuevoStock
      : 0

  const handleOnlyNumbers = (value, setter) => {
    const cleanValue = value.replace(/\D/g, '')
    setter(cleanValue)
  }

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

  const promedioCompra =
    compras.length > 0 ? totalCompras / compras.length : 0

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!productoId) {
      alert('Selecciona un producto')
      return
    }

    if (!productoSeleccionado) {
      alert('Producto no encontrado')
      return
    }

    if (!cantidad || cantidadNum <= 0) {
      alert('Ingresa una cantidad válida')
      return
    }

    if (!costo || costoNum <= 0) {
      alert('Ingresa un costo válido')
      return
    }

    await addCompra({
      productoId,
      cantidad: cantidadNum,
      costo: costoNum,
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
        subtitle="Registra compras, actualiza stock automáticamente y recalcula el costo promedio del inventario."
      />

      <div className="stats-grid">
        <StatCard title="Total compras" value={formatMoney(totalCompras)} />
        <StatCard title="Unidades compradas" value={unidadesCompradas} />
        <StatCard title="Promedio por compra" value={formatMoney(promedioCompra)} />
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
                  {p.nombre} - Stock: {p.stock} - Costo: {formatMoney(p.costo_promedio)}
                </option>
              ))}
            </FormField>

            {productoSeleccionado && (
              <div className="note-box">
                <strong>{productoSeleccionado.nombre}</strong>
                <br />
                Categoría: {productoSeleccionado.categoria || 'General'}
                <br />
                Stock actual: {stockActual}
                <br />
                Costo promedio actual: {formatMoney(costoPromedioActual)}
                <br />
                Precio de venta: {formatMoney(productoSeleccionado.precio_venta || productoSeleccionado.precio)}
              </div>
            )}

            <FormField
              label="Cantidad comprada"
              type="text"
              inputMode="numeric"
              placeholder="Ej: 10"
              value={cantidad}
              onChange={(e) => handleOnlyNumbers(e.target.value, setCantidad)}
            />

            <FormField
              label="Costo unitario de compra"
              type="text"
              inputMode="numeric"
              placeholder="Ej: 12000"
              value={costo}
              onChange={(e) => handleOnlyNumbers(e.target.value, setCosto)}
            />

            <div className="total-box">
              Total compra: <strong>{formatMoney(totalCompraActual)}</strong>
              <br />
              Stock nuevo: <strong>{nuevoStock}</strong>
              <br />
              Nuevo costo promedio:{' '}
              <strong>{formatMoney(nuevoCostoPromedio)}</strong>
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
                    <th>Costo prom. anterior</th>
                    <th>Costo prom. nuevo</th>
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

                      <td>{formatMoney(c.costo_promedio_anterior)}</td>

                      <td>
                        <strong>{formatMoney(c.costo_promedio_nuevo)}</strong>
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