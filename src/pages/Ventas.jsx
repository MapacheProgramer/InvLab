import { useState } from 'react'
import { useData } from '../context/DataContext'

import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import FormField from '../components/FormField'
import SectionHeader from '../components/SectionHeader'

function Ventas() {
  const { productos, ventas, addVenta } = useData()

  const [productoId, setProductoId] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [efectivo, setEfectivo] = useState('')
  const [transferencia, setTransferencia] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    })
  }

  const ventasFiltradas = ventas.filter((v) =>
    v.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalVentas = ventas.reduce(
    (acc, v) => acc + Number(v.total || 0),
    0
  )

  const totalEfectivo = ventas.reduce(
    (acc, v) => acc + Number(v.efectivo || 0),
    0
  )

  const totalTransferencia = ventas.reduce(
    (acc, v) => acc + Number(v.transferencia || 0),
    0
  )

  const totalRecibido = Number(efectivo || 0) + Number(transferencia || 0)

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

    if (totalRecibido <= 0) {
      alert('Ingresa el valor recibido')
      return
    }

    addVenta({
      productoId,
      cantidad,
      efectivo,
      transferencia,
    })

    setProductoId('')
    setCantidad('')
    setEfectivo('')
    setTransferencia('')
  }

  return (
    <div className="page">
      <PageHeader
        label="Registro comercial"
        title="Ventas"
        subtitle="Registra ventas, divide pagos entre efectivo y transferencia, y descuenta stock automáticamente."
      />

      <div className="stats-grid">
        <StatCard title="Total ventas" value={formatMoney(totalVentas)} />
        <StatCard title="Efectivo" value={formatMoney(totalEfectivo)} />
        <StatCard
          title="Transferencia"
          value={formatMoney(totalTransferencia)}
        />
      </div>

      <div className="content-grid">
        <section className="card">
          <h2 className="section-title">Nueva venta</h2>

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
                  {p.nombre} - Stock: {p.stock}
                </option>
              ))}
            </FormField>

            <FormField
              label="Cantidad"
              type="number"
              placeholder="Ej: 1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />

            <FormField
              label="Pago en efectivo"
              type="number"
              placeholder="Ej: 20000"
              value={efectivo}
              onChange={(e) => setEfectivo(e.target.value)}
            />

            <FormField
              label="Pago por transferencia"
              type="number"
              placeholder="Ej: 30000"
              value={transferencia}
              onChange={(e) => setTransferencia(e.target.value)}
            />

            <div className="total-box">
              Total recibido: <strong>{formatMoney(totalRecibido)}</strong>
            </div>

            <button className="primary-button" type="submit">
              Registrar venta
            </button>
          </form>
        </section>

        <section className="card card-table">
          <SectionHeader
            title="Ventas registradas"
            count={ventasFiltradas.length}
            search={busqueda}
            setSearch={setBusqueda}
            searchPlaceholder="Buscar venta..."
          />

          {ventasFiltradas.length === 0 ? (
            <EmptyState text="No hay ventas registradas." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Efectivo</th>
                    <th>Transferencia</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {ventasFiltradas.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <strong>{v.nombre}</strong>
                      </td>
                      <td>{v.cantidad}</td>
                      <td>{formatMoney(v.efectivo)}</td>
                      <td>{formatMoney(v.transferencia)}</td>
                      <td>
                        <strong>{formatMoney(v.total)}</strong>
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

export default Ventas